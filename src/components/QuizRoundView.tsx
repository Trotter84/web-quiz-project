import type {ReactNode} from "react";
import Typing from "./quizes/Typing.tsx";
import MultipleChoice from "./quizes/MultipleChoice.tsx";
import "../styles/quizRoundView.css";

export type ActiveRound =
    | {
    type: "keyword";
    key: string;
    word: string;
    fact: string;
    onComplete: (correct: boolean, value: string) => void
}
    | {
    type: "multipleChoice";
    key: string;
    question: string;
    possibleAnswers: string[];
    rightAnswer?: string;
    revealed: boolean;
    onSelect: (choice: string | null) => void;
}
    | null;

interface QuizRoundViewProps {
    loading: boolean;
    noContent: boolean;
    loadingText?: string;
    noContentText?: string;
    title: string;
    activeRound: ActiveRound;
    expiryTimestamp: Date;
    footer?: ReactNode;
    revealExtra?: ReactNode;
    phase: "playing" | "reveal";
}

export default function QuizRoundView({
                                          loading,
                                          noContent,
                                          loadingText = "Loading quiz...",
                                          noContentText = "No quiz content is available.",
                                          title,
                                          activeRound,
                                          expiryTimestamp,
                                          footer,
                                          revealExtra,
                                          phase,
                                      }: QuizRoundViewProps) {
    return (
        <>
            {loading ? (
                <p>{loadingText}</p>
            ) : noContent ? (
                <p>{noContentText}</p>
            ) : (
                <>
                    <h2>{title}</h2>
                    {activeRound?.type === "keyword" ? (
                        <Typing
                            key={activeRound.key}
                            word={activeRound.word}
                            fact={activeRound.fact}
                            expiryTimestamp={expiryTimestamp}
                            onComplete={activeRound.onComplete}
                        />
                    ) : activeRound?.type === "multipleChoice" ? (
                        <MultipleChoice
                            key={activeRound.key}
                            question={activeRound.question}
                            possibleAnswers={activeRound.possibleAnswers}
                            rightAnswer={activeRound.rightAnswer}
                            expiryTimestamp={expiryTimestamp}
                            revealed={activeRound.revealed}
                            onSelect={activeRound.onSelect}
                        />
                    ) : null}
                    {footer}
                    {phase === "reveal" ? revealExtra : ""}
                </>
            )}
        </>
    );
}