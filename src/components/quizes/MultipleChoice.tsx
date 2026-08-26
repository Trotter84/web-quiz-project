import {useState} from "react";
import {useTimer} from "react-timer-hook";
import Countdown from "../countdown.tsx";


interface MultipleChoiceProps {
    question: string;
    possibleAnswers: string[];
    rightAnswer: string;
    CHOICE_TIME_LIMIT_SECONDS: number;
    onComplete: () => void;
}

export function MultipleChoice({
                                   question,
                                   possibleAnswers,
                                   rightAnswer,
                                   CHOICE_TIME_LIMIT_SECONDS,
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
