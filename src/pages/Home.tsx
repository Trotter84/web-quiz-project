import '../styles/home.css'
import QuizContainer from "./QuizScreen.tsx";
import CategoryCard from "../components/cards/CategoryCard.tsx";

export default function Home() {
    return (
        <>
            <h1>Home Page</h1>
            <CategoryCard/>
            <QuizContainer/>
        </>
    );
}