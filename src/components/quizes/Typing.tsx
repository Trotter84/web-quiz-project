import {useEffect, useState} from "react";
import {useTimer} from "react-timer-hook";
import Countdown from "../countdown.tsx";

import "../../styles/typing.css";


interface TypingProps {
    word: string;
    fact: string;
    expiryTimestamp: Date;
    onComplete: (correct: boolean, value: string) => void;
}

export default function Typing({word, fact, expiryTimestamp, onComplete}: TypingProps) {
    const [input, setInput] = useState<string>("");
    const [revealed, setRevealed] = useState<boolean>(false);
    const isCorrect: boolean = input.trim().toLowerCase() === word.toLowerCase();


    const {totalMilliseconds, isRunning, pause} = useTimer({
        expiryTimestamp, autoStart: true, interval: 20, onExpire: () => {
            if (!revealed) {
                setRevealed(true);
                onComplete(false, input);
            }
        },
    });

    useEffect(() => {
        if (isCorrect && !revealed) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRevealed(true);
            pause();
            onComplete(true, input);
        }
    }, [isCorrect, revealed, pause, onComplete, input]);

    return (
        <>
            <div>
                <h3 className="word-txt">{word}</h3>
            </div>
            <div>
                {revealed ?
                    (
                        <p className='fact-txt'>{fact}</p>
                    )
                    :
                    (
                        <input
                            className="word-input"
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
