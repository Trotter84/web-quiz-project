import {Link} from "react-router";
import "../../styles/categoryCard.css";


export default function CategoryCard({category}: { category: string }) {
    return <Link className="cards" to={`/quiz/${category}`}>{category.charAt(0).toUpperCase() + category.slice(1)}</Link>;
}