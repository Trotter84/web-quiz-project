import {type JSX, useEffect, useState} from "react";
import {useStopwatch} from "react-timer-hook";

import '../styles/quizScreen.css';
import Stopwatch from '../components/Stopwatch.tsx';


interface KeywordTypingProps {
    word: string;
    fact: string;
}

interface MultipleChoiceProps {
    question: string;
    possible_Answers: string[];
    right_answer: string;
}

export default function QuizContainer(): JSX.Element {
    const [isQuiz, setIsQuiz] = useState<boolean>(true);


    return (
        <>
            <button onClick={() => setIsQuiz(!isQuiz)}>
                Switch to {isQuiz ? "Screen B" : "Screen A"}
            </button>

            {isQuiz ? (
                <KeywordTyping word="hello" fact="a pleasant way to greet someone."/>
            ) : (
                <MultipleChoice
                    question="What is the capital of France?"
                    possible_Answers={["Paris", "London", "Berlin", "Madrid"]}
                    right_answer="Paris"
                />
            )}
        </>
    );
}

export function KeywordTyping({word, fact}: KeywordTypingProps): JSX.Element {
    const [input, setInput] = useState<string>("");
    const isCorrect = input.trim().toLowerCase() === word;

    const {minutes, seconds, milliseconds, isRunning, pause} = useStopwatch({autoStart: true, interval: 20});

    useEffect(() => {
        if (isCorrect) {
            pause();
            console.log("Correct!");

        }
    }, [isCorrect, pause])

    return (
        <>
            <div>
                <h1>{word}</h1>
            </div>

            <div>
                {isCorrect ?
                    (
                        <>
                            {/*<p style={{fontSize: '1.8rem'}}>{word}</p>*/}
                            <p className='fact-txt'>{fact}</p>
                        </>
                    )
                    :
                    (<input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="type your answer..."
                            autoFocus
                        />
                    )}
            </div>
            <Stopwatch minutes={minutes} seconds={seconds} milliseconds={milliseconds} isRunning={isRunning}/>
        </>
    );
}

export function MultipleChoice({question, possible_Answers}: MultipleChoiceProps): JSX.Element {

    // if ()

    return (
        <>
            <div>
                <h1>{question}</h1>
            </div>

            <div>
                {possible_Answers.map((ans, i) => (
                    <p key={i}>
                        <button>{ans}</button>
                    </p>
                ))}
            </div>
        </>
    );
}