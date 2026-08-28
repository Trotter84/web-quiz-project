import "../styles/john_button.css";

interface John_skip{
    used: boolean;
}

export default function John_Skipped({used}: John_skip) {
    used = true;

    return <div className={`John Skip ${used}`}></div>
}