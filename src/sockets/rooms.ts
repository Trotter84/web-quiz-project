import QuestionModel from '../models/Question.ts';
import WordModel from '../models/Word.ts';
import {clearTimeout} from "node:timers";

export type RoundType = 'keyword' | 'multipleChoice';

const KEYWORD_TYPING_WEIGHT = 0.6;
const TYPING_TIME_LIMIT_SECONDS = 5;
const CHOICE_TIME_LIMIT_SECONDS = 7;



export interface RoundData {
    type: RoundType;
    timeLimit: number;
    startTime: number;
    word?: string;
    fact?: string;
    question?: string;
    choices?: string[];
    rightAnswer?: string;
}

export interface Player
{
    socketId: string;
    name: string;
    score: number;
    answered: boolean;
    answer: string | null;
    correct: boolean | null;
}

export interface Room
{
    code: string;
    hostSocketId: string;
    category: string;
    players: Map<string, Player>;
    status: 'waiting' | 'inProgress' | 'finished';
    currentRoundIndex: number;
    currentRound: RoundData | null;
    roundTimeoutHandle: ReturnType<typeof setTimeout> | null;

}

const rooms = new Map<string, Room>();


function generateRoomCode(): string
{
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++)
    {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

function pickRandom<T>(items: T[]): T | null {
    if (items.length === 0) return null;
    return items[Math.floor(Math.random() * items.length)];
}


export function createRoom(hostSocketId: string, hostName: string, category: string): Room
{
    let code = generateRoomCode();
    while (rooms.has(code))
    {
        code = generateRoomCode();
    }

    const room: Room =
        {
            code,
            hostSocketId,
            category,
            players: new Map([[hostSocketId, { socketId: hostSocketId, name: hostName, score: 0, answered: false, answer: null, correct: null}]]),
            status: 'waiting',
            currentRoundIndex: 0,
            currentRound: null,
            roundTimeoutHandle: null,
        };
    rooms.set(code, room);
    return room;
}

export function joinRoom(code: string, socketId: string, name: string): Room | null
{
    const room = rooms.get(code);
    if (!room)
        return null;
    if (room.status !== 'waiting')
        return null;

    room.players.set(socketId, { socketId, name, score: 0, answered: false, answer: null, correct: null });
    return room;
}

export function getRoom(code: string): Room | undefined
{
    return rooms.get(code);
}

export function removePlayerFromRoom(code: string, socketId: string): void
{
    const room = rooms.get(code);
    if (!room)
        return;

    room.players.delete(socketId);

    if (room.players.size === 0)
    {
        if (room.roundTimeoutHandle)
            clearTimeout(room.roundTimeoutHandle);
        rooms.delete(code);
    }
}

export async function fetchRoundForCategory(category: string): Promise<RoundData | null> {
    const type: RoundType = Math.random() < KEYWORD_TYPING_WEIGHT ? 'keyword' : 'multipleChoice';

    if (type === 'keyword')
    {
        const words = await WordModel.find({ category });
        const chosen = pickRandom(words);
        if (!chosen) return null;

        return {
            type: 'keyword',
            timeLimit: TYPING_TIME_LIMIT_SECONDS,
            startTime: Date.now(),
            word: chosen.word,
            fact: chosen.fact,
        };
    }
    else
    {
        const questions = await QuestionModel.find({ category });
        const chosen = pickRandom(questions);
        if (!chosen) return null;

        return {
            type: 'multipleChoice',
            timeLimit: CHOICE_TIME_LIMIT_SECONDS,
            startTime: Date.now(),
            question: chosen.question,
            choices: chosen.possible_answers,
            rightAnswer: chosen.right_answer,
        };
    }
}

export function serializePublicRound(round: RoundData)
{
    return {
        type: round.type,
        timeLimit: round.timeLimit,
        startTime: round.startTime,
        word: round.type === 'keyword' ? round.word : undefined,
        question: round.type === 'multipleChoice' ? round.question : undefined,
        choices: round.type === 'multipleChoice' ? round.choices : undefined,
    };
}

export function resetPlayersForNewRound(room: Room): void
{
    for (const player of room.players.values())
    {
        player.answered = false;
        player.answer = null;
        player.correct = null;
    }
}

export function checkAnswerCorrect(round: RoundData, answer: string): boolean {
    if (round.type === 'keyword')
    {
        return answer.trim().toLowerCase() == (round.word ?? '').toLowerCase();
    }
    return answer === round.rightAnswer;
}

export function allPlayersAnswered(room: Room): boolean
{
    if (room.players.size === 0) return false;
    return Array.from(room.players.values()).every((p) => p.answered);
}

export function serializeRoom(room: Room)
{
    return {
        code: room.code,
        category: room.category,
        status: room.status,
        players: Array.from(room.players.values()).map((p) => ({
            socketId: p.socketId, name: p.name, score: p.score,
        })),
    }
}