import {useState, useEffect} from "react";
import {useParams, useLocation, useNavigate} from "react-router-dom";
import {useSocket} from "../context/SocketContext.tsx";
import {useTimer} from "react-timer-hook";
import QuizRoundView, {type ActiveRound} from "../components/QuizRoundView.tsx";
import "../styles/quizScreen.css";
import "../styles/multiplayerGame.css";
import SecondsCountdown from "../components/timers/secondsCountdown.tsx";
import {SECONDS_BEFORE_CONTINUING} from "../../quizConfig.ts";


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

function getExpiryTimestamp(seconds: number): Date {
    const time = new Date();
    time.setMilliseconds(time.getMilliseconds() + seconds * 1000);
    return time;
}

export default function MultiplayerGame() {
    const {code} = useParams<{ code: string }>();
    const location = useLocation();
    const {socket} = useSocket();
    const navigate = useNavigate();

    const initialRound = (location.state as {
        initialRound?: { roundIndex: number; round: PublicRound }
        initialPlayers?: { socketId: string; name: string }[];
    })?.initialRound;

    const initialPlayers = (location.state as {
        initialPlayers?: { socketId: string; name: string }[];
    })?.initialPlayers ?? [];

    const [round, setRound] = useState<PublicRound | null>(initialRound?.round ?? null);
    const [roundIndex, setRoundIndex] = useState(initialRound?.roundIndex ?? 0);
    const [phase, setPhase] = useState<Phase>("playing");

    const [revealAnswer, setRevealAnswer] = useState<string | undefined>(undefined);
    const [revealFact, setRevealFact] = useState<string>("");
    const [mcRevealed, setMcRevealed] = useState(false);
    const [players, setPlayers] = useState<PlayerResult[]>(initialPlayers.map((p) => ({socketId: p.socketId, name: p.name, score: 0, multiplier: 1, correct: null})));


    const {totalMilliseconds, isRunning, restart: restartRevealTimer} = useTimer({
        expiryTimestamp: getExpiryTimestamp(SECONDS_BEFORE_CONTINUING),
        autoStart: false,
        interval: 20,
    });

    useEffect(() => {
        if (!socket) return;

        const handleRoundStarted = (data: { roundIndex: number; round: PublicRound }) => {
            console.log("[client] roundStarted received:", data); // debugging
            setRoundIndex(data.roundIndex);
            setRound(data.round);
            setPhase("playing");
            setRevealAnswer(undefined);
            setRevealFact("");
            setMcRevealed(false);
        };

        const handleRoundEnded = (data: {
            word?: string;
            fact?: string;
            rightAnswer?: string;
            players: PlayerResult[]
        }) => {
            console.log("[client] roundEnded received:", data); // debugging
            setPhase("reveal");
            setRevealAnswer(data.rightAnswer);
            setRevealFact(data.fact ?? "");
            setMcRevealed(true);
            setPlayers(data.players);
            restartRevealTimer(getExpiryTimestamp(SECONDS_BEFORE_CONTINUING));
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
    }, [socket, code, navigate, restartRevealTimer]);

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

    const sortedPlayers = players.slice().sort((a, b) => b.score - a.score);

    const activeRound: ActiveRound =
        round?.type === "keyword" && round.word
            ? {type: "keyword", key: String(roundIndex), word: round.word, fact: revealFact, onComplete: handleTypingComplete}
            : round?.type === "multipleChoice" && round.question && round.choices
                ? {
                    type: "multipleChoice",
                    key: String(roundIndex),
                    question: round.question,
                    possibleAnswers: round.choices,
                    rightAnswer: mcRevealed ? revealAnswer : undefined,
                    revealed: mcRevealed,
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
            footer={
                <div className="reveal-container">
                    <h3 className="scoreboard-title">Scores</h3>
                    <ul className="scoreboard-list">
                        {sortedPlayers.map((p) => (
                            <li
                                key={p.socketId}
                                className={`scoreboard-item ${p.correct === true ? "correct" : p.correct === false ? "incorrect" : ""}`}
                            >
                                <span className="scoreboard-name">{p.name}</span>
                                <span className="scoreboard-score">
                                    {p.score} ({p.multiplier})
                                    {p.correct === true && <span className="scoreboard-mark correct"> ✓</span>}
                                    {p.correct === false && <span className="scoreboard-mark incorrect"> ✗</span>}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            }
            revealExtra={
                <div className="nxt-round-container">
                    <p>Next round starting in&nbsp;&nbsp;</p>
                    <SecondsCountdown
                        totalMilliseconds={totalMilliseconds}
                        isRunning={isRunning}
                    />
                </div>
            }
        />
    );
}