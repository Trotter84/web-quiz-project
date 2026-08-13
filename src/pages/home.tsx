import '../styles/home.css'
import {QuizScreenA, QuizScreenB} from "./quizScreen.tsx";

export default function Home() {
    const isQuiz: boolean = true;


    return (
        <>
            <h1>Home Page</h1>
            {isQuiz ? (
                <QuizScreenA word="example" fact="example" input=""/>
            ) : (
                <QuizScreenB
                    question="What is the capital of France?"
                    possible_Answers={["Paris is a large city", "London", "Berlin", "Madrid"]}
                    right_answer="Paris"
                    answer=""
                />
            )}
        </>
    );
}