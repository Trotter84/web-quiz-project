import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useSocket} from "../context/SocketContext.tsx";
import "../styles/multiplayer.css";


export default function Multiplayer() {
    const {socket, connected} = useSocket();
    const navigate = useNavigate();

    const [categories, setCategories] = useState<string[]>([]);
    const [mode, setMode] = useState<"create" | "join">("create");

    const [hostName, setHostName] = useState("");
    const [category, setCategory] = useState("");

    const [joinName, setJoinName] = useState("");
    const [joinCode, setJoinCode] = useState("");

    const [error, setError] = useState("");

    useEffect(() => {
        const getCategories = async () => {
            const response = await fetch("/api/questions/categories");
            const json = await response.json();
            setCategories(json);
            if (json.length > 0) setCategory(json[0]);
        }
        getCategories();
    }, [])

    const handleCreateRoom = () => {
        console.log("Got to this create room method.")
        if (!hostName || !category || !socket) // add
            return;
        setError("");

        socket.emit("createRoom", {hostName, category}, (res: any) => {
            if (res.success) {
                navigate(`/multiplayer/lobby/${res.room.code}`, {state: {room: res.room, isHost: true}});
            } else {
                setError("Failed to creat room");
            }
        });
    }

    const handleJoinRoom = () => {
        if (!socket || !joinName || !joinCode)
            return;
        setError("");
        socket.emit("joinRoom", {code: joinCode.toUpperCase(), name: joinName}, (res: any) => {
            if (res.success) {
                navigate(`/multiplayer/lobby/${res.room.code}`, {state: {room: res.room, isHost: false}});
            } else {
                setError("Failed to creat room");
            }
        });
    }

    return (
        <div className="multiplayer-page">
            <h1>Multiplayer Rooms</h1>

            <div className="mode-toggle">
                <button className="mode-toggle-button" onClick={() => setMode("create")}
                        disabled={mode === "create"}>Create Room
                </button>
                <button className="mode-toggle-button" onClick={() => setMode("join")} disabled={mode === "join"}>Join
                    Room
                </button>
            </div>

            {mode === "create" ? (
                <div className="multiplayer-section">
                    <h1>Create Room:</h1>
                    <label className="multiplayer-label">Type a Username:</label>
                    <input className="multiplayer-input" type={"text"} value={hostName}
                           onChange={(e) => setHostName(e.target.value)}/>
                    <label className="multiplayer-label">Category:</label>
                    <select className="multiplayer-select" value={category}
                            onChange={(e) => setCategory(e.target.value)}>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <button className="multiplayer-button" onClick={handleCreateRoom} disabled={!connected}>Create
                    </button>
                </div>
            ) : (
                <div className="multiplayer-section">
                    <label className="multiplayer-label">Type a Username:</label>
                    <input className="multiplayer-input" type={"text"} value={joinName}
                           onChange={(e) => setJoinName(e.target.value)}/>
                    <label className="multiplayer-label">Type a room code:</label>
                    <input className="multiplayer-input" type={"text"} value={joinCode}
                           onChange={(e) => setJoinCode(e.target.value)}/>
                    <button className="multiplayer-button" onClick={handleJoinRoom} disabled={!connected}>Join</button>
                </div>
            )}
            {error && <p className="multiplayer-error">{error}</p>}
        </div>
    )

}