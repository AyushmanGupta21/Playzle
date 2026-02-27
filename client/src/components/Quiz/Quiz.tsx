import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { eventBridge, EVENTS } from '../../game/EventBridge';
import api from '../../api/client';
import styles from './Quiz.module.css';

const QUIZ_DATA: Record<string, { question: string; options: string[]; correct: number }[]> = {
    checkpoint_1: [
        { question: 'What is a function in programming?', options: ['A variable', 'A reusable block of code', 'A loop', 'A data type'], correct: 1 },
        { question: 'Which keyword defines a function in JavaScript?', options: ['def', 'func', 'function', 'lambda'], correct: 2 },
        { question: 'What does a function return if no return statement is present?', options: ['0', 'null', 'undefined', 'error'], correct: 2 },
        { question: 'What are function parameters?', options: ['Return values', 'Inputs to a function', 'Local variables', 'Global constants'], correct: 1 },
    ],
    checkpoint_2: [
        { question: 'What is a string?', options: ['A number', 'A sequence of characters', 'A boolean', 'An array'], correct: 1 },
        { question: 'What does "hello".length return in JavaScript?', options: ['4', '5', '6', 'undefined'], correct: 1 },
        { question: 'How do you concatenate strings in JS?', options: ['Using +', 'Using *', 'Using &', 'Using |'], correct: 0 },
        { question: 'Which method reverses an array in JavaScript?', options: ['.reverse()', '.flip()', '.invert()', '.turn()'], correct: 0 },
    ],
    checkpoint_3: [
        { question: 'What defines the Fibonacci sequence?', options: ['Each number = previous + 2', 'Each number = sum of two before it', 'Each number = double the previous', 'Random sequence'], correct: 1 },
        { question: 'What is the time complexity of recursive Fibonacci without memoization?', options: ['O(n)', 'O(n²)', 'O(2ⁿ)', 'O(log n)'], correct: 2 },
        { question: 'What technique stores computed Fibonacci values for reuse?', options: ['Compression', 'Memoization', 'Recursion', 'Iteration'], correct: 1 },
        { question: 'What is fibonacci(0) by convention?', options: ['1', '0', '-1', 'undefined'], correct: 1 },
    ],
};

export default function Quiz() {
    const { showQuiz, currentCheckpoint, setShowQuiz, updateCoins } = useGameStore();
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);

    if (!showQuiz || !currentCheckpoint) return null;
    const questions = QUIZ_DATA[currentCheckpoint] ?? QUIZ_DATA.checkpoint_1;
    const passed = score / questions.length >= 0.7;

    const handleSelect = (qIdx: number, optIdx: number) => {
        if (submitted) return;
        setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    };

    const handleSubmit = async () => {
        const correctCount = questions.filter((q, i) => answers[i] === q.correct).length;
        const pct = correctCount / questions.length;
        setScore(correctCount);
        setSubmitted(true);

        if (pct >= 0.7) {
            setLoading(true);
            try {
                const res = await api.post('/challenge/complete', { checkpointId: currentCheckpoint });
                updateCoins(res.data.newBalance);
            } catch {
                /* already awarded */
            } finally {
                setLoading(false);
            }
        }
    };

    const handleClose = () => {
        setShowQuiz(false);
        if (passed) eventBridge.emit(EVENTS.GAME_RESUME);
        setAnswers({});
        setSubmitted(false);
        setScore(0);
    };

    return (
        <div className="overlay-backdrop animate-fade-in">
            <div className={`${styles.quizContainer} animate-slide-up`}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>📚 Knowledge Assessment</h2>
                        <p className={styles.subtitle}>Pass 70% to earn your rewards</p>
                    </div>
                    {submitted && (
                        <div className={`${styles.scoreBadge} ${passed ? styles.scoreBadgePass : styles.scoreBadgeFail}`}>
                            {score}/{questions.length} {passed ? '✅ Passed!' : '❌ Try again'}
                        </div>
                    )}
                </div>

                <div className={styles.questions}>
                    {questions.map((q, qIdx) => (
                        <div key={qIdx} className={`${styles.questionCard} ${submitted && answers[qIdx] === q.correct ? styles.correct : submitted && answers[qIdx] !== undefined ? styles.incorrect : ''}`}>
                            <p className={styles.question}><span className={styles.qNum}>Q{qIdx + 1}.</span> {q.question}</p>
                            <div className={styles.options}>
                                {q.options.map((opt, oIdx) => (
                                    <button
                                        key={oIdx}
                                        className={`${styles.option}
                      ${answers[qIdx] === oIdx ? styles.selected : ''}
                      ${submitted && oIdx === q.correct ? styles.optionCorrect : ''}
                      ${submitted && answers[qIdx] === oIdx && oIdx !== q.correct ? styles.optionWrong : ''}
                    `}
                                        onClick={() => handleSelect(qIdx, oIdx)}
                                    >
                                        <span className={styles.optLabel}>{String.fromCharCode(65 + oIdx)}.</span> {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.footer}>
                    {!submitted ? (
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={Object.keys(answers).length < questions.length}
                        >
                            📬 Submit Answers
                        </button>
                    ) : passed ? (
                        <div className={styles.reward}>
                            <span>🪙 Coins awarded!</span>
                            <button className="btn btn-gold" onClick={handleClose}>
                                {loading ? '⏳ Processing…' : '▶ Continue Quest'}
                            </button>
                        </div>
                    ) : (
                        <button className="btn btn-secondary" onClick={handleClose}>↩ Back to IDE</button>
                    )}
                </div>
            </div>
        </div>
    );
}
