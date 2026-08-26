export type RoundType = 'keyword' | 'multipleChoice';

export interface Player
{
    socketId: string;
    name: string;
    score: number;
    answered: boolean;
}

export interface Room
{
    code: string;
    hostSocketId: string;
    category: string;
    players: Map<string, Player>;
    status: 'waiting' | 'inProgress' | 'finished';
    currentRoundIndex: number;
    // I will need to finish this later once i have finished setting up some other stuff.

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
            players: new Map([[hostSocketId, { socketId: hostSocketId, name: hostName, score: 0, answered: false}]]),
            status: 'waiting',
            currentRoundIndex: 0,
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

    room.players.set(socketId, { socketId, name, score: 0, answered: false });
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
        room.players.delete(code);
    }
}