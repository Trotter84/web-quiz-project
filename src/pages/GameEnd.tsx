import {useLocation, useNavigate, useParams} from "react-router-dom";

interface FinalPlayer {
    socketId: string;
    name: string;
    score: number;
}

export default function GameEnd()
{
    const { code } = useParams<{code: string}>();
    const location = useLocation();
    const navigate = useNavigate();

    const players = (location.state as { players?: FinalPlayer[]})?.players ?? null;

    if (!players) {
        return (
            <>
                <h1>Game Over</h1>
                <p>No results found for this game.</p>
                <button onClick={() => navigate("/multiplayer")}>Back to Multiplayer</button>
            </>
        );
    }

    return (
        <>
            <h1>Game Over</h1>
            <p>Room: {code}</p>

            <h3>Final Scores</h3>
            <ol>
                {players.map((p, index) => (
                    <li key={p.socketId}>
                        {p.name} — {p.score} {index === 0 ? "Winner!" : ""}
                    </li>
                ))}
            </ol>

            <button onClick={() => navigate("/multiplayer")}>Play Again</button>
        </>
    );
}