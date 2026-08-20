import {Link} from "react-router";

export default function CategoryCard({category}: { category: string }) {
    return <Link to={`/quiz/${category}`}>{category}</Link>;
}