import "../styles/countdown.css";


interface CountdownProps {
    totalMilliseconds: number;
    isRunning: boolean;
}


export default function Countdown({totalMilliseconds, isRunning}: CountdownProps) {

    const remaining = Math.max(0, totalMilliseconds);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    const milliseconds = remaining % 1000;

    return (
        <div className={`countdown ${isRunning ? "" : "active"}`}>
            <span>{minutes.toString().padStart(2, "0")}</span>
            :
            <span>{seconds.toString().padStart(2, "0")}</span>
            :
            <span>{milliseconds.toString().padStart(3, "0")}</span>
        </div>
    );
}