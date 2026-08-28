import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext.tsx";

interface Player {
    socketId: string;
    name: string;
    score: number;
    answered: boolean;
}

interface PublicRound {
    type: "keyword" | "multipleChoice";
    timeLimit: number;
    startTime: number;
    word?: string;
    question?: string;
    choices?: string[];
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
    const navigate = useNavigate();
    const { socket } = useSocket();

    const [room, setRoom] = useState<RoomState | null>(
        (location.state as { room?: RoomState })?.room ?? null
    );
    const [error, setError] = useState("");
    const isHost = (location.state as { isHost?: boolean })?.isHost ?? false;

    useEffect(() =>
    {
        if (!socket)
            return;
        const handlePlayerJoined = (updatedRoom: RoomState)=> setRoom(updatedRoom);
        const handlePlayerLeft = (updatedRoom: RoomState)=> setRoom(updatedRoom);

        const handleRoundStarted = (data: { roundIndex: number; round: PublicRound}) =>
        {
            navigate(`/multiplayer/game/${code}`, {state: { initialRound: data}});
        }

        const handleGameError = (data: { error: string}) => setError(data.error);

        socket.on("playerJoined", handlePlayerJoined);
        socket.on("playerLeft", handlePlayerLeft);
        socket.on("roundStarted", handleRoundStarted);
        socket.on("gameError", handleGameError);
        return () => {
            socket.off("playerJoined", handlePlayerJoined);
            socket.off("playerLeft", handlePlayerLeft);
            socket.off("roundStarted", handleRoundStarted);
            socket.off("gameError", handleGameError);
        }
    }, [socket, code, navigate])

    const handleStartGame = () => {
        if (!socket || !code) return;
        setError("");
        socket.emit("startGame", { code }, (res: any) => {
            if (!res.success) setError(res.error);
        });
    };

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

            {isHost && <button onClick={handleStartGame}>Start Game</button>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </>
    );
}