import {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router-dom";

import "../styles/quizScreen.css";
import QuizRoundView, {type ActiveRound} from "../components/QuizRoundView.tsx";
import {useTimer} from "react-timer-hook";
import SecondsCountdown from "../components/timers/secondsCountdown.tsx";
import {
    type RoundType,
    MULTIPLE_CHOICE_TIME_LIMIT_SECONDS,
    SECONDS_BEFORE_CONTINUING,
    getTypingTimeLimitSeconds,
    pickRandom,
    pickRoundType,
    calculateScore,
    nextMultiplier
} from "../../quizConfig.ts";


interface Word {
    _id: string;
    word: string;
    fact: string;
    category: string;
}

interface Question {
    _id: string;
    question: string;
    possible_answers: string[];
    right_answer: string;
    category: string;
}


type Phase = "playing" | "reveal";

function getExpiryTimestamp(seconds: number): Date {
    const time = new Date();
    time.setMilliseconds(time.getMilliseconds() + seconds * 1000);
    return time;
}

export default function QuizContainer() {
    const {category} = useParams<{ category: string }>();

    const [words, setWords] = useState<Word[]>([]);
    const [activeWord, setActiveWord] = useState<Word | null>(null);

    const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);

    const [roundType, setRoundType] = useState<RoundType>(() => pickRoundType());

    const [phase, setPhase] = useState<Phase>("playing");
    const [roundCount, setRoundCount] = useState<number>(1);
    const [loading, setLoading] = useState(true);

    const [roundExpiry, setRoundExpiry] = useState<Date>(() => getExpiryTimestamp(MULTIPLE_CHOICE_TIME_LIMIT_SECONDS));
    // eslint-disable-next-line react-hooks/purity
    const [roundStartTime, setRoundStartTime] = useState<number>(Date.now());
    const [roundTimeLimit, setRoundTimeLimit] = useState<number>(MULTIPLE_CHOICE_TIME_LIMIT_SECONDS);

    const [mcRevealed, setMcRevealed] = useState(false);

    const [score, setScore] = useState(0);
    const [multiplier, setMultiplier] = useState(1);


    useEffect(() => {
        const getQuizData = async () => {
            try {
                const [wordsRes, questionsRes] = await Promise.all([
                    fetch("/api/words", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }),
                    fetch("/api/questions", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }),
                ]);

                if (!wordsRes.ok) {
                    throw new Error(
                        `Failed to fetch words: ${wordsRes.status}`
                    );
                }
                if (!questionsRes.ok) {
                    throw new Error(
                        `Failed to fetch questions: ${questionsRes.status}`
                    );
                }
                const wordsData: Word[] = await wordsRes.json();
                const questionsData: Question[] = await questionsRes.json();

                setWords(wordsData.filter((word) => word.category === category));
                setQuestions(questionsData.filter((question) => question.category === category));
            } catch (err) {
                console.error("Failed to fetch quiz data:", err);
            } finally {
                setLoading(false);
            }
        };
        getQuizData();
    }, [category]);

    useEffect(() => {
        if (loading || phase !== "playing") {
            return;
        }
        if (activeWord !== null || activeQuestion !== null) {
            return;
        }
        if (roundType === "keyword" && words.length > 0) {
            const word = pickRandom(words);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveWord(word);
            const timeLimit = getTypingTimeLimitSeconds(word?.word ?? "");
            setRoundExpiry(getExpiryTimestamp(timeLimit));
            setRoundTimeLimit(timeLimit);
            setRoundStartTime(Date.now());
        } else if (roundType === "multipleChoice" && questions.length > 0) {
            setActiveQuestion(pickRandom(questions));
            setRoundExpiry(getExpiryTimestamp(MULTIPLE_CHOICE_TIME_LIMIT_SECONDS));
            setRoundStartTime(Date.now());
            setMcRevealed(false);
        }
    }, [loading, words, questions, activeWord, activeQuestion, roundType, phase]);

    const startNextRound = useCallback(() => {
        setRoundType(pickRoundType());
        setActiveWord(null);
        setActiveQuestion(null);
        setPhase("playing");
        setRoundCount((prev) => {
            return prev + 1;
        });
    }, [])


    const {totalMilliseconds, isRunning, restart} = useTimer({
        expiryTimestamp: getExpiryTimestamp(SECONDS_BEFORE_CONTINUING),
        autoStart: false,
        interval: 20,
        onExpire: () => {
            window.setTimeout(() => {
                startNextRound();
            }, 1000);
        },
    });

    const handleRoundComplete = useCallback((correct: boolean) => {
        const elapsedMs = Date.now() - roundStartTime;

        if (correct) {
            const roundScore = calculateScore(elapsedMs, roundTimeLimit, multiplier);
            setScore((prev) => prev + roundScore);
            setMultiplier((prev) => nextMultiplier(prev));
        } else {
            setMultiplier(1);
        }
        setPhase("reveal");
        restart(getExpiryTimestamp(SECONDS_BEFORE_CONTINUING));
    }, [restart, roundStartTime, roundTimeLimit, multiplier]);

    const handleMultipleChoiceSelect = useCallback((choice: string | null) => {
        setMcRevealed(true);
        const correct = choice !== null && choice === activeQuestion?.right_answer;
        handleRoundComplete(correct);
    }, [activeQuestion, handleRoundComplete]);

    const noQuizContent =
        !loading &&
        ((roundType === "keyword" && words.length === 0) ||
            (roundType === "multipleChoice" && questions.length === 0));

    const activeRound: ActiveRound = roundType === "keyword" && activeWord ? {
        type: "keyword",
        key: activeWord._id,
        word: activeWord.word,
        fact: activeWord.fact,
        onComplete: handleRoundComplete
    } : roundType === "multipleChoice" && activeQuestion ? {
        type: "multipleChoice",
        key: activeQuestion._id,
        question: activeQuestion.question,
        possibleAnswers: activeQuestion.possible_answers,
        rightAnswer: mcRevealed ? activeQuestion.right_answer : undefined,
        revealed: mcRevealed,
        onSelect: handleMultipleChoiceSelect
    } : null;

    return (
        <QuizRoundView
            loading={loading}
            noContent={noQuizContent}
            title={`Round ${roundCount}`}
            activeRound={activeRound}
            expiryTimestamp={roundExpiry}
            phase={phase}
            footer={
                <p className="score-txt">Score: {score} ({multiplier}x)</p>
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