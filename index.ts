import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createRoom, joinRoom, getRoom, removePlayerFromRoom, Room} from "./src/sockets/rooms";

import userRoutes from './src/routes/userRoutes';
import questionRoutes from './src/routes/questionRoutes';
import wordRoutes from './src/routes/wordRoutes';
import {Socket} from "node:net";
import {hostname} from "node:os";

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

function serializeRoom(room: Room)
{
    return {
      code: room.code,
      category: room.category,
      status: room.status,
      players: Array.from(room.players.values()),
    };
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
           }
       }
    });
});


httpServer.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

export { io };