import {useLocation, useNavigate, useParams} from "react-router-dom";
import "../styles/gameEnd.css";

interface FinalPlayer {
    socketId: string;
    name: string;
    score: number;
}

export default function GameEnd() {
    const {code} = useParams<{ code: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const players = (location.state as { players?: FinalPlayer[] })?.players ?? null;

    if (!players) {
        return (
            <div className="game-end-page">
                <h1>Game Over</h1>
                <p className="game-end-text">No results found for this game.</p>
                <button className="game-end-button" onClick={() => navigate("/multiplayer")}>Back to Multiplayer
                </button>
            </div>
        );
    }

    return (
        <div className="game-end-page">
            <h1>Game Over</h1>
            <p className="game-end-room">Room: {code}</p>

            <h3>Final Scores</h3>
            <ol className="game-end-scores">
                {players.map((p, index) => (
                    <li className="game-end-score-item" key={p.socketId}>
                        <span className="game-end-rank">{index + 1}</span>
                        <span className="game-end-name-score">{p.name} — {p.score}</span>
                        {index === 0 && <span className="game-end-winner">Winner!</span>}
                    </li>
                ))}
            </ol>

            <button className="game-end-button" onClick={() => navigate("/multiplayer")}>Play Again</button>
        </div>
    );
}