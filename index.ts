import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import {
    createRoom, joinRoom, getRoom, removePlayerFromRoom,
    fetchRoundForCategory, serializePublicRound, resetPlayersForNewRound,
    checkAnswerCorrect, allPlayersAnswered, serializeRoom, Room,
} from './src/sockets/rooms';

import userRoutes from './src/routes/userRoutes';
import questionRoutes from './src/routes/questionRoutes';
import wordRoutes from './src/routes/wordRoutes';
import {Socket} from "node:net";
import {hostname} from "node:os";
import {clearTimeout} from "node:timers";

const app = express();
const PORT = process.env.PORT || 3000;

const CONNECTION_URL = process.env.CONNECTION_URL;
if (!CONNECTION_URL) {
    throw new Error('CONNECTION_URL is not set. Copy .env.example to .env and fill it in.');
}

mongoose
    .connect(CONNECTION_URL, {
        dbName: process.env.DB_NAME || 'Web-Quiz-Project',
    })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error(err));

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({message: 'API is running!'});
});

app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/words', wordRoutes);

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'],
    },
});

const ROUND_END_GRACE_MS = 1500;

async function beginRound(io: Server, room: Room)
{
    const round = await fetchRoundForCategory(room.category);

    if (!round)
    {
        io.to(room.code).emit('gameError', { error: 'No more quiz content'});
        room.status = 'finished';
        return;
    }

    resetPlayersForNewRound(room);
    room.currentRound = round;
    room.currentRoundIndex += 1;

    io.to(room.code).emit('roundStarted', {
        roundIndex: room.currentRoundIndex,
        round: serializePublicRound(round),
    });

    if (room.roundTimeoutHandle) clearTimeout(room.roundTimeoutHandle);
    room.roundTimeoutHandle = setTimeout(() => {
        endRound(io, room);
    }, round.timeLimit * 1000 + ROUND_END_GRACE_MS);
}
function endRound(io: Server, room: Room)
{
    if (room.roundTimeoutHandle)
    {
        clearTimeout(room.roundTimeoutHandle);
        room.roundTimeoutHandle = null;
    }
    if (!room.currentRound) return;

    const round = room.currentRound;

    io.to(room.code).emit('roundEnded', {
        word: round.type == 'keyword' ? round.word : undefined,
        fact: round.type == 'keyword' ? round.fact : undefined,
        rightAnswer: round.type === 'multipleChoice' ? round.rightAnswer : undefined,
        players: Array.from(room.players.values()).map((p) => ({
            socketId: p.socketId, name: p.name, score: p.score, correct: p.correct,
        })),
    });

    setTimeout(() => {
        beginRound(io, room);
    }, 3000)
}

io.on('connection', (socket) => {
    console.log('Client connected. Socket ID: ' + socket.id);

    socket.on('createRoom', ({ hostName, category}: { hostName: string; category: string }, callback: (res: any) => void) =>
    {
        const room = createRoom(socket.id, hostName, category);

        socket.join(room.code);
        socket.data.roomCode = room.code;

        callback({ success: true, room: serializeRoom(room) });
    });

    socket.on('joinRoom', ({ code, name }: { code: string; name: string }, callback: (res: any) => void) =>
    {
        const room = joinRoom(code, socket.id, name);

        if (!room)
        {
            callback({ success: false, error: 'Room not found or it has already started.' });
            return;
        }

        socket.join(room.code);
        socket.data.roomCode = room.code;

        callback({ success: true, room: serializeRoom(room) });

        socket.to(room.code).emit('playerJoined', serializeRoom(room));
    });

    socket.on('startGame', async ({ code }: { code: string}, callback: (res: any) => void) =>{
        const room = getRoom(code);
        if (!room) { callback({ success: false, error: 'Room not found.' }); return;}

        if (room.hostSocketId !== socket.id) { callback({ success: false, error: 'Only host can start game.' }); return;}

        room.status = 'inProgress';
        callback({ success: true});
        await beginRound(io, room);
    });

    socket.on('submitAnswer', ({ code, answer}: { code: string; answer: string | null}, callback: (res: any) => void) => {
        const room = getRoom(code);
        if (!room || !room.currentRound) { callback({ success: false, error: 'No active round.' }); return;}

        const player = room.players.get(socket.id);
        if (!player || player.answered) { callback({ success: false, error: 'Already answer or not in room' }); return;}

        player.answered = true;
        player.answer = answer;
        player.correct = answer !== null && checkAnswerCorrect(room.currentRound, answer);
        // i need to have the score calc here later

        callback({ success: true});

        if (allPlayersAnswered(room))
        {
            endRound(io, room);
        }

    });

    socket.on('disconnect', (reason) =>
    {
       console.log('Client disconnected. Socket ID: ' + socket.id + " Reason: "  + reason);

       const roomCode = socket.data.roomCode as string | undefined;
       if (roomCode)
       {
           removePlayerFromRoom(roomCode, socket.id);

           const room = getRoom(roomCode);
           if (room)
           {
               io.to(room.code).emit('playerLeft', serializeRoom(room));
               if (room.status === 'inProgress' && allPlayersAnswered(room))
               {
                   endRound(io, room);
               }
           }
       }
    });
});


httpServer.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

export { io };