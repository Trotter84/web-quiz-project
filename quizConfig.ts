export type RoundType = "keyword" | "multipleChoice";

// Probability of a Typing round vs a MultipleChoice round
// (MultipleChoice) : 0.0 - 1.0 : (Typing)
export const TYPING_CHANCE_WEIGHT = 0.6;

export const MS_PER_CHAR = 300;
export const MIN_TYPING_TIME_LIMIT_SECONDS = 3;

export const MULTIPLE_CHOICE_TIME_LIMIT_SECONDS = 10;

// Count down before the next round
export const SECONDS_BEFORE_CONTINUING = 3;

export const MAX_MULTIPLIER = 3;
export const MULTIPLIER_STEP = 0.5;

export const MAX_ROUNDS = 20;

export function getTypingTimeLimitSeconds(word: string): number {
    const scaled = (word.length * MS_PER_CHAR) / 1000;
    return Math.max(MIN_TYPING_TIME_LIMIT_SECONDS, scaled);
}

export function pickRandom<T>(items: T[]): T | null {
    if (items.length === 0) {
        return null;
    }
    return items[Math.floor(Math.random() * items.length)];
}

export function pickRoundType(): RoundType {
    return Math.random() < TYPING_CHANCE_WEIGHT ? "keyword" : "multipleChoice";
}


export function calculateScore(elapsedMs: number, timeLimitSeconds: number, multiplier: number): number {
    const limitMs = timeLimitSeconds * 1000;
    const timeRatio = Math.max(0, 1 - elapsedMs / limitMs);
    return Math.round(100 * timeRatio * multiplier);
}

export function nextMultiplier(current: number): number {
    return Math.min(current + MULTIPLIER_STEP, MAX_MULTIPLIER);
}