import {type JSX, useState} from "react";

interface QuizScreenA {
    word: string;
    fact: string;
    input: string;

}

interface QuizScreenB {
    question: string;
    possible_Answers: string[];
    right_answer: string;
    answer: string;
}


export function QuizScreenA({word}: QuizScreenA): JSX.Element {
    const [input, setInput] = useState<string>("");

    return (
        <>
            <div>
                <h1>{word}</h1>
            </div>

            <div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your answer..."
                />
            </div>
        </>
    );
}

export function QuizScreenB({question, possible_Answers}: QuizScreenB): JSX.Element {
    return (
        <>
            <div>
                <h1>{question}</h1>
            </div>

            <div>
                <p>
                    <button>{possible_Answers[0]}</button>
                </p>
                <p>
                    <button>{possible_Answers[1]}</button>
                </p>
                <p>
                    <button>{possible_Answers[2]}</button>
                </p>
                <p>
                    <button>{possible_Answers[3]}</button>
                </p>
                <p>
                    <button>{possible_Answers[4]}</button>
                </p>
            </div>
        </>
    );
}

