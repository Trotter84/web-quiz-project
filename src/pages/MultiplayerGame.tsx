import {useState, useEffect} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext.tsx";
import Typing from "../components/quizes/Typing.tsx";
import {MultipleChoice} from "../components/quizes/MultipleChoice.tsx";
import "../styles/quizScreen.css";
import "../styles/multiplayerGame.css";


interface PublicRound {
    type: "keyword" | "multipleChoice";
    timeLimit: number;
    startTime: number;
    word?: string;
    question?: string;
    choices?: string[];
}

interface PlayerResult {
    socketId: string;
    name: string;
    score: number;
    correct: boolean | null;
}

interface FinalPlayer {
    socketId: string;
    name: string;
    score: number;
}

type Phase = "playing" | "reveal";

export default function MultiplayerGame() {
    const {code} = useParams<{ code: string }>();
    const location = useLocation();
    const {socket} = useSocket();
    const navigate = useNavigate();

    const initialRound = (location.state as {
        initialRound?: { roundIndex: number; round: PublicRound }
    })?.initialRound;

    const [round, setRound] = useState<PublicRound | null>(initialRound?.round ?? null);
    const [roundIndex, setRoundIndex] = useState(initialRound?.roundIndex ?? 0);
    const [phase, setPhase] = useState<Phase>("playing");

    const [revealFact, setRevealFact] = useState<string | undefined>(undefined);
    const [revealAnswer, setRevealAnswer] = useState<string | undefined>(undefined);
    const [players, setPlayers] = useState<PlayerResult[]>([]);

    useEffect(() => {
        if (!socket) return;

        const handleRoundStarted = (data: { roundIndex: number; round: PublicRound }) => {
            setRoundIndex(data.roundIndex);
            setRound(data.round);
            setPhase("playing");
            setRevealFact(undefined);
            setRevealAnswer(undefined);
        };

        const handleRoundEnded = (data: {
            word?: string;
            fact?: string;
            rightAnswer?: string;
            players: PlayerResult[]
        }) => {
            setPhase("reveal");
            setRevealFact(data.fact);
            setRevealAnswer(data.rightAnswer);
            setPlayers(data.players);
        };

        const handleGameEnded = (data: { players: FinalPlayer[]}) =>
        {
            navigate(`/multiplayer/game-end/${code}`, {state: { players: data.players}});
        }

        socket.on("roundStarted", handleRoundStarted);
        socket.on("roundEnded", handleRoundEnded);
        socket.on("gameEnded", handleGameEnded);
        return () => {
            socket.off("roundStarted", handleRoundStarted);
            socket.off("roundEnded", handleRoundEnded);
            socket.off("gameEnded", handleGameEnded);
        };
    }, [socket, code, navigate]);

    const handleTypingComplete = (_correct: boolean, value: string) => {
        if (!socket || !code) return;
        socket.emit("submitAnswer", {code, answer: value}, () => {
        });
    };


    const handleMultipleChoiceSelect = (choice: string | null) => {
        if (!socket || !code) return;
        socket.emit("submitAnswer", {code, answer: choice}, () => {
        });
    };

    if (!round) {
        return <div className="mp-game-page"><p className="mp-waiting-txt">Waiting for the next round...</p></div>;
    }

    const expiryTimestamp = new Date(round.startTime + round.timeLimit * 1000);

    return (
        <div className="mp-game-page">
            <p className="round-txt">Round {roundIndex}</p>

            {phase === "playing" && round.type === "keyword" && round.word ? (
                <Typing
                    key={roundIndex}
                    word={round.word}
                    fact=""
                    expiryTimestamp={expiryTimestamp}
                    onComplete={handleTypingComplete}
                />
            ) : phase === "playing" && round.type === "multipleChoice" && round.question && round.choices ? (
                <MultipleChoice
                    key={roundIndex}
                    question={round.question}
                    possibleAnswers={round.choices}
                    expiryTimestamp={expiryTimestamp}
                    revealed={false}
                    onSelect={handleMultipleChoiceSelect}
                />
            ) : null}

            {phase === "reveal" && (
                <div className="reveal-container">
                    {revealFact && <p className="fact-txt">{revealFact}</p>}
                    {revealAnswer && <p className="rightAnswer-txt">The correct answer was "{revealAnswer}".</p>}
                    <h3 className="scoreboard-title">Scores</h3>
                    <ul className="scoreboard-list">
                        {players.map((p) => (
                            <li
                                key={p.socketId}
                                className={`scoreboard-item ${p.correct === true ? "correct" : p.correct === false ? "incorrect" : ""}`}
                            >
                                <span className="scoreboard-name">{p.name}</span>
                                <span className="scoreboard-score">
                                    {p.score}
                                    {p.correct === true && <span className="scoreboard-mark correct"> ✓</span>}
                                    {p.correct === false && <span className="scoreboard-mark incorrect"> ✗</span>}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
}