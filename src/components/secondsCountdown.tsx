import "../styles/secondsCountdown.css";


interface secondsCountdownProps {
    totalMilliseconds: number;
    isRunning: boolean;
}


export default function secondsCountdown({totalMilliseconds, isRunning}: secondsCountdownProps) {

    const remaining = Math.max(0, totalMilliseconds);
    const seconds = Math.ceil((remaining % 60000) / 1000);

    return (
        <div className={`seconds-countdown ${isRunning ? "" : "active"}`}>
            <span key={seconds} className="number">{seconds}</span>
        </div>
    );
}