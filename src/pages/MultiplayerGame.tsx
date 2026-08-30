import {useState, useEffect} from "react";
import {useParams, useLocation} from "react-router-dom";
import {useSocket} from "../context/SocketContext.tsx";
import QuizRoundView, {type ActiveRound} from "../components/QuizRoundView.tsx";


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

type Phase = "playing" | "reveal";

export default function MultiplayerGame() {
    const {code} = useParams<{ code: string }>();
    const location = useLocation();
    const {socket} = useSocket();

    const initialRound = (location.state as { initialRound?: { roundIndex: number; round: PublicRound } })?.initialRound;

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

        socket.on("roundStarted", handleRoundStarted);
        socket.on("roundEnded", handleRoundEnded);

        return () => {
            socket.off("roundStarted", handleRoundStarted);
            socket.off("roundEnded", handleRoundEnded);
        };
    }, [socket]);

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
                <div>
                    {revealFact && <p className="fact-txt">{revealFact}</p>}
                    {revealAnswer && <p>The correct answer was "{revealAnswer}".</p>}
                    <h3>Scores</h3>
                    <ul>
                        {players.map((p) => (
                            <li key={p.socketId}>
                                {p.name}: {p.score} ({p.multiplier}x) {p.correct === true ? "✓" : p.correct === false ? "✗" : ""}
                            </li>
                        ))}
                    </ul>
                </div>
            }
        />
    );
}

