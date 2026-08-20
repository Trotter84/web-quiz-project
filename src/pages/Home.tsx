import {useState, useEffect} from "react";
import '../styles/home.css'
import CategoryCard from "../components/cards/CategoryCard.tsx";

export default function Home() {
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        const getCategories = async () => {
            try {
                const res = await fetch("/api/questions/categories", {
                    method: "GET",
                    headers: {"Content-Type": "application/json"},
                });
                const data = await res.json();
                setCategories(data);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };
        getCategories();
    }, []);

    return (
        <>
            <h1>Home Page</h1>
            {categories.map((category) => (
                <CategoryCard key={category} category={category}/>
            ))}
        </>
    );
}