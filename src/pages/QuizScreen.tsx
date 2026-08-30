import {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router-dom";

import "../styles/quizScreen.css";
import Typing from "../components/quizes/Typing.tsx";
import {MultipleChoice} from "../components/quizes/MultipleChoice.tsx";
import {useTimer} from "react-timer-hook";
import SecondsCountdown from "../components/secondsCountdown.tsx";


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


const KEYWORD_TYPING_WEIGHT = 0.6; // 0.0-1.0 increase the rate of typing vs multiple choice

const TYPING_TIME_LIMIT_SECONDS = 5;
// const TIME_PER_CHAR = 500;

const CHOICE_TIME_LIMIT_SECONDS = 10;
const SECONDS_BEFORE_CONTINUING = 3;

type RoundType = "keyword" | "multipleChoice";
type Phase = "playing" | "reveal";

function pickRandom<T>(items: T[]): T | null {
    if (items.length === 0) {
        return null;
    }
    return items[Math.floor(Math.random() * items.length)];
}

function pickRoundType(): RoundType {
    return Math.random() < KEYWORD_TYPING_WEIGHT ? "keyword" : "multipleChoice";
}

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

    const [roundExpiry, setRoundExpiry] = useState<Date>(() => getExpiryTimestamp(CHOICE_TIME_LIMIT_SECONDS));
    const [roundStartTime, setRoundStartTime] = useState<number>(Date.now());

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
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveWord(pickRandom(words));
            setRoundExpiry(getExpiryTimestamp(TYPING_TIME_LIMIT_SECONDS))
            setRoundStartTime(Date.now());
        } else if (roundType === "multipleChoice" && questions.length > 0) {
            setActiveQuestion(pickRandom(questions));
            setRoundExpiry(getExpiryTimestamp(CHOICE_TIME_LIMIT_SECONDS));
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
        const limitSeconds = roundType === "keyword" ? TYPING_TIME_LIMIT_SECONDS : CHOICE_TIME_LIMIT_SECONDS
        const limitMS = limitSeconds * 1000;

        if (correct) {
            const timeRatio = Math.max(0, 1 - elapsedMs / limitMS); // 1 = instant, 0 = used all time
            const roundScore = Math.round(100 * timeRatio * multiplier);
            setScore((prev) => prev + roundScore);
            setMultiplier((prev) => Math.min(prev + 0.5, 3)); // cap at 3x
        } else {
            setMultiplier(1);
        }
        setPhase("reveal");
        restart(getExpiryTimestamp(SECONDS_BEFORE_CONTINUING));
    }, [restart, roundStartTime, roundType, multiplier]);

    const handleMultipleChoiceSelect = useCallback((choice: string | null) => {
        setMcRevealed(true);
        const correct = choice !== null && choice === activeQuestion?.right_answer;
        handleRoundComplete(correct);
    }, [activeQuestion, handleRoundComplete]);

    const noQuizContent =
        !loading &&
        ((roundType === "keyword" && words.length === 0) ||
            (roundType === "multipleChoice" && questions.length === 0));

    const displayCategory = category ? category.charAt(0).toUpperCase() + category.slice(1) : "";

    return (
        <>
            {loading ? (
                <p>Loading quiz...</p>
            ) : noQuizContent ? (
                <p>No quiz content is available.</p>
            ) : (
                <>
                    <h2>{displayCategory} Quiz</h2>
                    {roundType === "keyword" && activeWord ? (
                        <Typing
                            key={activeWord._id}
                            word={activeWord.word}
                            fact={activeWord.fact}
                            expiryTimestamp={roundExpiry}
                            onComplete={handleRoundComplete}
                        />
                    ) : roundType === "multipleChoice" && activeQuestion ? (
                        <MultipleChoice
                            key={activeQuestion._id}
                            question={activeQuestion.question}
                            possibleAnswers={activeQuestion.possible_answers}
                            rightAnswer={mcRevealed ? activeQuestion.right_answer : undefined}
                            expiryTimestamp={roundExpiry}
                            revealed={mcRevealed}
                            onSelect={handleMultipleChoiceSelect}
                        />
                    ) : null}

                    <p className="score-txt">Score: {score} ({multiplier}x)</p>

                    <p className="round-txt">Round: {roundCount}</p>

                    {phase === "reveal" ? (
                        <div className="nxt-round-container">
                            <p>Next round starting in&nbsp;&nbsp;</p>
                            <SecondsCountdown
                                totalMilliseconds={totalMilliseconds}
                                isRunning={isRunning}
                            />
                        </div>
                    ) : (
                        ""
                    )}
                </>
            )}
        </>
    );
}
