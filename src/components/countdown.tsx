import '../styles/stopwatch.css';


interface StopwatchProps {
    minutes: number;
    seconds: number;
    milliseconds: number;
    isRunning: boolean;
}

export default function Stopwatch({minutes, seconds, milliseconds, isRunning}: StopwatchProps) {

    return (
        <div className={`stopwatch ${isRunning ? '' : 'active'}`}>
            <span>{minutes.toString().padStart(2, '0')}</span>:<span>{seconds.toString().padStart(2, '0')}</span>:<span>{milliseconds.toString().padStart(3, '0')}</span>
        </div>
    )
}
