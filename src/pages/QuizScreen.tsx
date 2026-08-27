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


const KEYWORD_TYPING_WEIGHT = 0.5;
const TYPING_TIME_LIMIT_SECONDS = 5;
const CHOICE_TIME_LIMIT_SECONDS = 7;
const SECONDS_BEFORE_CONTINUING = 3;
//TODO: add a countdown for "${seconds} until next round.."

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
        } else if (roundType === "multipleChoice" && questions.length > 0) {
            setActiveQuestion(pickRandom(questions));
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

    function getExpiryTimestamp(seconds: number) {
        const time = new Date();
        time.setMilliseconds(time.getMilliseconds() + seconds * 1000);
        return time;
    }

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

    const handleRoundComplete = useCallback(() => {
        setPhase("reveal");
        restart(getExpiryTimestamp(SECONDS_BEFORE_CONTINUING));
    }, [restart]);

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
                            TYPING_TIME_LIMIT_SECONDS={TYPING_TIME_LIMIT_SECONDS}
                            onComplete={handleRoundComplete}
                        />
                    ) : roundType === "multipleChoice" && activeQuestion ? (
                        <MultipleChoice
                            key={activeQuestion._id}
                            question={activeQuestion.question}
                            possibleAnswers={activeQuestion.possible_answers}
                            rightAnswer={activeQuestion.right_answer}
                            CHOICE_TIME_LIMIT_SECONDS={CHOICE_TIME_LIMIT_SECONDS}
                            onComplete={handleRoundComplete}
                        />
                    ) : null}


                    {phase === "reveal" ? (
                        <div className="nxt-round-container">
                            <p>Next round start in&nbsp;&nbsp;</p>
                            <SecondsCountdown
                                totalMilliseconds={totalMilliseconds}
                                isRunning={isRunning}
                            />
                        </div>
                    ) : (
                        ""
                    )}
                    <p>Round: {roundCount}</p>
                </>
            )}
        </>
    );
}
