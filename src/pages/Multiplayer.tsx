import {useState, useEffect, useContext} from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext.tsx";

export default function Multiplayer()
{
    const { socket, connected } = useSocket();
    const navigate = useNavigate();

    const [categories, setCategories] = useState<string[]>([]);
    const [mode, setMode] = useState<"create" | "join">("create");

    const [hostName, setHostName] = useState("");
    const [category, setCategory] = useState("");

    const [joinName, setJoinName] = useState("");
    const [joinCode, setJoinCode] = useState("");

    const [error, setError] = useState("");

    useEffect(() =>
    {
        const getCategories = async () =>
        {
            const response = await fetch("/api/questions/categories");
            const json = await response.json();
            setCategories(json.categories);
            if (json.length > 0) setCategory(json[0]);
        }
        getCategories();
    }, [])

    const handleCreateRoom = () =>
    {
        console.log("Got to this create room method.")
        if(!hostName || !category || !socket) // add
            return;
        setError("");

        socket.emit("createRoom", { hostName, category}, (res: any) => {
            if (res.success)
            {
                navigate(`/multiplayer/lobby/${res.room.code}`, {state: {room: res.room, isHost: true}});
            }
            else
            {
                setError("Failed to creat room");
            }
        });
    }

    const handleJoinRoom = () =>
    {
        if (!socket || !joinName || !joinCode)
            return;
        setError("");
        socket.emit("joinRoom", { code: joinCode.toUpperCase(), name: joinName }, (res: any) => {
            if (res.success)
            {
                navigate(`/multiplayer/lobby/${res.room.code}`, {state: {room: res.room, isHost: false}});
            }
            else
            {
                setError("Failed to creat room");
            }
        });
    }

    return (
        <>
            <h1>Multiplayer Rooms</h1>

            <button onClick={() => setMode("create")} disabled={mode === "create"}>Create Room</button>
            <button onClick={() => setMode("join")} disabled={mode === "join"}>Join Room</button>

            {mode === "create" ? (
                <>
                    <h1>Create Room:</h1>
                    <label>Type a Username:</label>
                    <input type={"text"} value={hostName} onChange={(e) => setHostName(e.target.value)} />
                    {/*<label>Category:</label>*/}
                    {/*<select value={category} onChange={(e) => setCategory(e.target.value)}>*/}
                    {/*    {categories.map((c) => (*/}
                    {/*        <option key={c} value={c}>{c}</option>*/}
                    {/*    ))}*/}
                    {/*</select>*/}
                    <button onClick={handleCreateRoom} disabled={!connected}>Create</button>
                </>
            ) : (
                <>
                    <label>Type a Username:</label>
                    <input type={"text"} value={joinName} onChange={(e) => setJoinName(e.target.value)} />
                    <label>Type a room code:</label>
                    <input type={"text"} value={joinCode} onChange={(e) => setJoinCode(e.target.value)}/>
                    <button onClick={handleJoinRoom} disabled={!connected}>Join</button>
                </>
            )}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </>
    )

}