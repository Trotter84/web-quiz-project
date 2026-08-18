import {Link} from "react-router";
import {useState} from "react";

export default function CategoryCard() {
    // @ts-ignore
    const [title, setTitle] = useState("Placeholder Title");

    return (
        <Link to="../../pages/quizScreen.tsx">{title}</Link>
    )
}