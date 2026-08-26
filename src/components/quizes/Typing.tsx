import {useEffect, useState} from "react";
import {useTimer} from "react-timer-hook";
import Countdown from "../countdown.tsx";


interface TypingProps {
    word: string;
    fact: string;
    TYPING_TIME_LIMIT_SECONDS: number;
    onComplete: () => void;
}

export default function Typing({word, fact, TYPING_TIME_LIMIT_SECONDS, onComplete}: TypingProps) {
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
