import {type JSX, useState} from "react";

interface QuizScreenAProps {
    word: string;
    fact: string;
}

interface QuizScreenBProps {
    question: string;
    possible_Answers: string[];
    right_answer: string;
}

export default function QuizContainer(): JSX.Element {
    const [isQuiz, setIsQuiz] = useState<boolean>(false);

    return (
        <>
            <button onClick={() => setIsQuiz(!isQuiz)}>
                Switch to {isQuiz ? "Screen A" : "Screen B"}
            </button>

            {isQuiz ? (
                <QuizScreenA word="example" fact="example"/>
            ) : (
                <QuizScreenB
                    question="What is the capital of France?"
                    possible_Answers={["Paris", "London", "Berlin", "Madrid"]}
                    right_answer="Paris"
                />
            )}
        </>
    );
}

export function QuizScreenA({word}: QuizScreenAProps): JSX.Element {
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

export function QuizScreenB({question, possible_Answers}: QuizScreenBProps): JSX.Element {
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