import {useState, useEffect} from "react";
import {useParams, useLocation, useNavigate} from "react-router-dom";
import {useSocket} from "../context/SocketContext.tsx";
import QuizRoundView, {type ActiveRound} from "../components/QuizRoundView.tsx";
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
    multiplier: number;
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
            console.log("[client] roundStarted received:", data); // debugging
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
            console.log("[client] roundEnded received:", data); // debugging
            setPhase("reveal");
            setRevealFact(data.fact);
            setRevealAnswer(data.rightAnswer);
            setPlayers(data.players);
        };

        const handleGameEnded = (data: { players: FinalPlayer[] }) => {
            navigate(`/multiplayer/game-end/${code}`, {state: {players: data.players}});
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
        console.log("[client] handleTypingComplete fired, socket:", !!socket, "code:", code); // debugging
        if (!socket || !code) return;
        socket.emit("submitAnswer", {code, answer: value}, (res: any) => {
            console.log("[client] submitAnswer ack:", res); // debugging
        });
    };


    const handleMultipleChoiceSelect = (choice: string | null) => {
        console.log("[client] handleMultipleChoiceSelect fired, socket:", !!socket, "code:", code); // debugging
        if (!socket || !code) return;
        socket.emit("submitAnswer", {code, answer: choice}, (res: any) => {
            console.log("[client] submitAnswer ack:", res); // debugging
        });
    };

    const loading = round === null;

    // if (!round) {
    //     return <div className="mp-game-page"><p className="mp-waiting-txt">Waiting for the next round...</p></div>;
    // }

    const expiryTimestamp = round ? new Date(round.startTime + round.timeLimit * 1000) : new Date();

    const activeRound: ActiveRound =
        phase === "playing" && round?.type === "keyword" && round.word
            ? {type: "keyword", key: String(roundIndex), word: round.word, fact: "", onComplete: handleTypingComplete}
            : phase === "playing" && round?.type === "multipleChoice" && round.question && round.choices
                ? {
                    type: "multipleChoice",
                    key: String(roundIndex),
                    question: round.question,
                    possibleAnswers: round.choices,
                    revealed: false,
                    onSelect: handleMultipleChoiceSelect,
                }
                : null;

    return (
        <QuizRoundView
            loading={loading}
            noContent={false}
            loadingText="Waiting for the next round..."
            title={`Round ${roundIndex}`}
            activeRound={activeRound}
            expiryTimestamp={expiryTimestamp}
            phase={phase}
            footer={null}
            revealExtra={
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
                                {/*{p.name}: {p.score} ({p.multiplier}x) {p.correct === true ? "✓" : p.correct === false ? "✗" : ""}*/}
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
            }
        />
    );
}

