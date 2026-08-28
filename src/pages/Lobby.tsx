import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSocket } from "../context/SocketContext.tsx";

interface Player {
    socketId: string;
    name: string;
    score: number;
    answered: boolean;
}

interface RoomState {
    code: string;
    category: string;
    status: string;
    players: Player[];
}

export default function Lobby()
{
    const { code } = useParams<{ code: string }>();
    const location = useLocation();
    const { socket } = useSocket();

    const [room, setRoom] = useState<RoomState | null>(
        (location.state as { room?: RoomState })?.room ?? null
    );
    const isHost = (location.state as { isHost?: boolean })?.isHost ?? false;

    useEffect(() =>
    {
        if (!socket)
            return;
        const handlePlayerJoined = (updatedRoom: RoomState)=> setRoom(updatedRoom);
        const handlePlayerLeft = (updatedRoom: RoomState)=> setRoom(updatedRoom);

        socket.on("playerJoined", handlePlayerJoined);
        socket.on("playerLeft", handlePlayerLeft);

        return () => {
            socket.off("playerJoined", handlePlayerJoined);
            socket.off("playerLeft", handlePlayerLeft);
        }
    }, [socket])

    if (!room)
        return <h1>No room found</h1>;

    return (
        <>
            <h1>Room: {room.code}</h1>
            <p>Category: {room.category}</p>
            <p>{isHost ? "You are the host." : "Waiting for the host to start."}</p>

            <h3>Players</h3>
            <ul>
                {room.players.map((p) => (
                    <li key={p.socketId}>{p.name}</li>
                ))}
            </ul>

            {isHost && <button disabled>Start Game</button>}
        </>
    );
}