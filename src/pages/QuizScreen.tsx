import {type JSX, useCallback, useEffect, useState} from "react";
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

export default function QuizContainer(): JSX.Element {
    const [words, setWords] = useState<Word[]>([]);
    const [activeWord, setActiveWord] = useState<Word | null>(null);
    const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [roundType, setRoundType] = useState<RoundType>(() => pickRoundType());
    const [phase, setPhase] = useState<Phase>("playing");


    useEffect(() => {
        const getAllWords = async () => {
            try {
                const res = await fetch("/api/words", {
                    method: "GET",
                    headers: {"Content-Type": "application/json"},
                });
                const data: Word[] = await res.json();
                setWords(data.filter(w => w.category === "programming"));
            } catch (err) {
                console.error("Failed to fetch words:", err);
            }
        };
        const getAllQuestions = async () => {
            try {
                const res = await fetch("/api/questions", {
                    method: "GET",
                    headers: {"Content-Type": "application/json"},
                });
                const data: Question[] = await res.json();
                setQuestions(data.filter(q => q.category === "programming"));
            } catch (err) {
                console.error("Failed to fetch questions", err);
            }
        };
        getAllWords();
        getAllQuestions();
    }, []);

    useEffect(() => {
        if (activeWord !== null || activeQuestion !== null || phase !== "playing") {
            return;
        }
        if (roundType === "keyword" && words.length > 0) {
            setActiveWord(pickRandom(words));
        } else if (roundType === "multipleChoice" && questions.length > 0) {
            setActiveQuestion(pickRandom(questions))
        }
    }, [words, questions, activeWord, activeQuestion, roundType, phase]);

    const startNextRound = useCallback(() => {
        const nextType = pickRoundType();
        setRoundType(nextType);
        setActiveWord(null);
        setActiveQuestion(null);

        if (nextType === "keyword") {
            setActiveWord(pickRandom(words));
        } else {
            setActiveQuestion(pickRandom(questions))
        }
        setPhase("playing");
    }, [words, questions])

    const handleRoundComplete = useCallback(() => {
        setPhase("reveal");
        setTimeout(() => {
            startNextRound();
        }, SECONDS_BEFORE_CONTINUING * 1000);
    }, [startNextRound])

    const isLoading = (roundType === "keyword" && !activeWord && words.length === 0) || (roundType === "multipleChoice" && !activeQuestion && questions.length === 0);

    return (
        <>
            {isLoading && <p>Loading quiz...</p>}
            {!isLoading && roundType === "keyword" && activeWord && (
                <KeywordTyping
                    key={activeWord._id}
                    word={activeWord.word}
                    fact={activeWord.fact}
                    onComplete={handleRoundComplete}
                />
            )}
            {!isLoading && roundType === "multipleChoice" && activeQuestion && (
                <MultipleChoice
                    key={activeQuestion._id}
                    question={activeQuestion.question}
                    possibleAnswers={activeQuestion.possible_answers}
                    rightAnswer={activeQuestion.right_answer}
                    onComplete={handleRoundComplete}
                />
            )}
        </>
    );
}


export function KeywordTyping({word, fact, onComplete}: KeywordTypingProps): JSX.Element {
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
        expiryTimestamp,
        autoStart: true,
        interval: 20,
        onExpire: () => {
            if (!revealed) {
                setRevealed(true);
                onComplete();
            }
        },
    });

    useEffect(() => {
        if (isCorrect && !revealed) {
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

export function MultipleChoice({question, possibleAnswers, rightAnswer, onComplete}: MultipleChoiceProps): JSX.Element {
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
        expiryTimestamp,
        autoStart: true,
        interval: 20,
        onExpire: () => {
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
                {possibleAnswers.map((choice) => (
                    <button
                        key={choice}
                        onClick={() => checkAnswer(choice)}
                        disabled={locked}
                        className={"answer" + (!locked ? "" : choice === rightAnswer ? "-correct" : choice === selected ? "-incorrect" : "")}
                    >
                        {choice}
                    </button>
                ))}
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