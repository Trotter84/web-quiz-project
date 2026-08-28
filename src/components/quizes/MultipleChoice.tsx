import {useState} from "react";
import {useTimer} from "react-timer-hook";
import Countdown from "../countdown.tsx";

import "../../styles/multipleChoice.css";


interface MultipleChoiceProps {
    question: string;
    possibleAnswers: string[];
    rightAnswer?: string;
    expiryTimestamp: Date;
    revealed: boolean;
    onSelect: (choice: string | null) => void;
}

export function MultipleChoice({
                                   question,
                                   possibleAnswers,
                                   rightAnswer,
                                   expiryTimestamp,
                                   revealed,
                                   onSelect
                               }: MultipleChoiceProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [timedOut, setTimedOut] = useState<boolean>(false);

    const locked = selected !== null || timedOut;



    const {totalMilliseconds, isRunning, pause} = useTimer({
        expiryTimestamp, autoStart: true, interval: 20, onExpire: () => {
            setTimedOut(true);
            onSelect(null);
        },
    });

    const checkAnswer = (choice: string) => {
        if (locked) {
            return;
        }
        setSelected(choice);
        pause();
        onSelect(choice);
    };

    return (
        <>
            <div>
                <h3 className="question-txt">{question}</h3>
            </div>
            <div className="multi-choice-container">
                {possibleAnswers.map((choice) => {
                    const isCorrectAnswer = choice === rightAnswer;
                    const isSelectedAnswer = choice === selected;
                    let buttonClass = "answer";
                    if (locked) {
                        if (isCorrectAnswer) {
                            buttonClass = "answer correct";
                        } else if (isSelectedAnswer) {
                            buttonClass = "answer incorrect";
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
            {revealed && (
                <p className="rightAnswer-txt">
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
