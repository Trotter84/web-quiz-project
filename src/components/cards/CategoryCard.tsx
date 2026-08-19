import { Link } from "react-router";
import { useState, useEffect } from "react";

export default function CategoryCard() {
    const [title, setTitle] = useState("Placeholder Title");

    useEffect(() => {
        const getTitle = async () => {
            try {
                const [triviaRes, typingRes] = await Promise.all([
                    fetch("/api/questions", {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                    }),
                    fetch("/api/words", {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                    }),
                ]);

                const triviaData = await triviaRes.json();
                const typingData = await typingRes.json();

                // Adjust based on actual shape of your API responses
                const triviaCategory = triviaData?.[0]?.category;
                const typingCategory = typingData?.[0]?.category;


                setTitle(triviaCategory ?? typingCategory ?? "Placeholder Title");
            } catch (err) {
                console.error("Failed to fetch category:", err);
            }
        };

        getTitle();
    }, []);

    return <Link to="../../pages/quizScreen.tsx">{title}</Link>;
}