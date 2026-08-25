import {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {useTimer} from "react-timer-hook";

import '../styles/quizScreen.css';
import Countdown from '../components/countdown.tsx';


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

interface KeywordTypingProps {
    word: string;
    fact: string;
    onComplete: () => void;
}

interface MultipleChoiceProps {
    question: string;
    possibleAnswers: string[];
    rightAnswer: string;
    onComplete: () => void;
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
    }, [])

    const handleRoundComplete = useCallback(() => {
        setPhase("reveal");
        setRoundCount((prev) => {
            return prev + 1;
        });

        const timeoutId = window.setTimeout(() => {
            startNextRound();
        }, SECONDS_BEFORE_CONTINUING * 1000);
        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [startNextRound])

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
                        <KeywordTyping
                            key={activeWord._id}
                            word={activeWord.word}
                            fact={activeWord.fact}
                            onComplete={handleRoundComplete}
                        />
                    ) : roundType === "multipleChoice" && activeQuestion ? (
                        <MultipleChoice
                            key={activeQuestion._id}
                            question={activeQuestion.question}
                            possibleAnswers={activeQuestion.possible_answers}
                            rightAnswer={activeQuestion.right_answer}
                            onComplete={handleRoundComplete}
                        />
                    ) : null}
                    <p>Round: {roundCount}</p>
                </>
            )}
        </>
    );
}


export function KeywordTyping({word, fact, onComplete}: KeywordTypingProps) {
    const [input, setInput] = useState<string>("");
    const [revealed, setRevealed] = useState<boolean>(false);
    const isCorrect: boolean = input.trim().toLowerCase() === word.toLowerCase();

    const [expiryTimestamp] = useState(() => {
        const time = new Date();
        time.setMilliseconds(
            time.getMilliseconds() + TYPING_TIME_LIMIT_SECONDS * 1000
        );
        return time;
    });

    const {totalMilliseconds, isRunning, pause} = useTimer({
        expiryTimestamp, autoStart: true, interval: 20, onExpire: () => {
            if (!revealed) {
                setRevealed(true);
                onComplete();
            }
        },
    });

    useEffect(() => {
        if (isCorrect && !revealed) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRevealed(true);
            pause();
            onComplete();
        }
    }, [isCorrect, revealed, pause, onComplete]);

    return (
        <>
            <div>
                <h3>{word}</h3>
            </div>
            <div>
                {revealed ?
                    (
                        <p className='fact-txt'>{fact}</p>
                    )
                    :
                    (
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={word}
                            autoFocus
                        />
                    )}
            </div>
            <Countdown
                totalMilliseconds={totalMilliseconds}
                isRunning={isRunning}
            />
        </>
    );
}

export function MultipleChoice({
                                   question,
                                   possibleAnswers,
                                   rightAnswer,
                                   onComplete
                               }: MultipleChoiceProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [timedOut, setTimedOut] = useState<boolean>(false);
    const [locked, setLocked] = useState<boolean>(false);

    const [expiryTimestamp] = useState(() => {
        const time = new Date();
        time.setMilliseconds(
            time.getMilliseconds() + CHOICE_TIME_LIMIT_SECONDS * 1000
        );
        return time;
    });

    const {totalMilliseconds, isRunning, pause} = useTimer({
        expiryTimestamp, autoStart: true, interval: 20, onExpire: () => {
            setTimedOut(true);
            setLocked(true);
            onComplete();
        },
    });

    const checkAnswer = (choice: string) => {
        if (locked) {
            return;
        }
        setSelected(choice);
        setLocked(true);
        pause();
        onComplete();
    };

    return (
        <>
            <div>
                <h3>{question}</h3>
            </div>
            <div>
                {possibleAnswers.map((choice) => {
                    const isCorrectAnswer = choice === rightAnswer;
                    const isSelectedAnswer = choice === selected;
                    let buttonClass = "answer";
                    if (locked) {
                        if (isCorrectAnswer) {
                            buttonClass = "answer-correct";
                        } else if (isSelectedAnswer) {
                            buttonClass = "answer-incorrect";
                        }
                    }

                    return (
                        <button
                            key={choice}
                            onClick={() => checkAnswer(choice)}
                            disabled={locked}
                            className={buttonClass}
                        >
                            {choice}
                        </button>
                    )
                })}
            </div>
            {locked && (
                <p>
                    {timedOut ? `The correct answer was: "${rightAnswer}".` : selected === rightAnswer ? "Correct!" : `The answer was "${rightAnswer}".`}
                </p>
            )}
            <Countdown
                totalMilliseconds={totalMilliseconds}
                isRunning={isRunning}
            />
        </>
    );
}