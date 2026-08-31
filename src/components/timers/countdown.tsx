import "../../styles/countdown.css";


interface CountdownProps {
    totalMilliseconds: number;
    isRunning: boolean;
    totalDurationMs: number;
}

const RING_SIZE = 120;
const STROKE_WIDTH = 10;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const RING_COLOR_FULL = {r: 192, g: 132, b: 252};
const RING_COLOR_EMPTY = {r: 241, g: 0, b: 0};

function lerp(a: number, b: number, t: number): number {
    return Math.round(a + (b - a) * t);
}

function ringColor(fraction: number): string {
    const t = 1 - Math.min(1, Math.max(0, fraction));
    const r = lerp(RING_COLOR_FULL.r, RING_COLOR_EMPTY.r, t);
    const g = lerp(RING_COLOR_FULL.g, RING_COLOR_EMPTY.g, t);
    const b = lerp(RING_COLOR_FULL.b, RING_COLOR_EMPTY.b, t);
    return `rgb(${r}, ${g}, ${b})`;
}


export default function Countdown({totalMilliseconds, isRunning, totalDurationMs}: CountdownProps) {

    const remaining = Math.max(0, totalMilliseconds);
    // const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    const milliseconds = remaining % 1000;

    const fraction = totalDurationMs > 0 ? Math.min(1, Math.max(0, remaining / totalDurationMs)) : 0;
    const dashOffset = CIRCUMFERENCE * (1 - fraction);
    const strokeColor = ringColor(fraction);

    return (
        <div className={`countdown-ring-container ${isRunning ? "" : "active"}`}>
            <svg
                className="countdown-ring"
                width={RING_SIZE}
                height={RING_SIZE}
                viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            >
                <circle
                    className="countdown-ring-track"
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RADIUS}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                />
                <circle
                    className="countdown-ring-progress"
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RADIUS}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    style={{stroke: strokeColor}}
                    transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2}) translate(0, ${RING_SIZE}) scale(1, -1)`}
                />
            </svg>
            <div className={`countdown ${isRunning ? "" : "active"}`}>
                {/*<span>{minutes.toString().padStart(2, "0")}</span>*/}
                {/*:*/}
                <span>{seconds.toString().padStart(2, "0")}</span>
                :
                <span>{milliseconds.toString().padStart(3, "0")}</span>
            </div>
        </div>
    );
}