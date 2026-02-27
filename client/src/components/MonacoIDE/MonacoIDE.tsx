import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useGameStore } from '../../store/gameStore';
import { useJSSandbox } from '../../hooks/useJSSandbox';
import { eventBridge, EVENTS } from '../../game/EventBridge';
import api from '../../api/client';
import styles from './MonacoIDE.module.css';

const CHALLENGE_META: Record<string, { title: string; description: string; starterCode: Record<string, string>; testCases: Array<{ input: string; expected: string }> }> = {
    checkpoint_1: {
        title: '⚔️ The Gate of Functions',
        description: 'An ancient gate blocks your path. The spirit of the gate speaks:\n\n"Write a function called `add` that takes two numbers and returns their sum."\n\nExample:\n  add(2, 3) → 5\n  add(10, 20) → 30',
        starterCode: {
            javascript: `// Write your solution here
function add(a, b) {
  // your code here
}`,
            python: `# Write your solution here
def add(a, b):
    # your code here
    pass`,
        },
        testCases: [
            { input: 'add(2, 3)', expected: '5' },
            { input: 'add(10, 20)', expected: '30' },
            { input: 'add(-1, 1)', expected: '0' },
        ],
    },
    checkpoint_2: {
        title: '🔤 The Mirror Maze',
        description: 'A maze spirit whispers:\n\n"Write a function called `reverseString` that reverses a given string."\n\nExample:\n  reverseString("hello") → "olleh"\n  reverseString("playzle") → "elzvalp"',
        starterCode: {
            javascript: `function reverseString(str) {
  // your code here
}`,
            python: `def reverse_string(s):
    # your code here
    pass`,
        },
        testCases: [
            { input: 'reverseString("hello")', expected: 'olleh' },
            { input: 'reverseString("playzle")', expected: 'elzvalp' },
        ],
    },
    checkpoint_3: {
        title: '🌀 The Fibonacci Spiral',
        description: 'The ancient oracle speaks:\n\n"Write a function called `fibonacci` that returns the nth Fibonacci number."\n\nExample:\n  fibonacci(1) → 1\n  fibonacci(5) → 5\n  fibonacci(10) → 55',
        starterCode: {
            javascript: `function fibonacci(n) {
  // your code here
}`,
            python: `def fibonacci(n):
    # your code here
    pass`,
        },
        testCases: [
            { input: 'fibonacci(1)', expected: '1' },
            { input: 'fibonacci(5)', expected: '5' },
            { input: 'fibonacci(10)', expected: '55' },
        ],
    },
};

export default function MonacoIDE() {
    const { showIDE, currentCheckpoint, setShowIDE, setShowQuiz, codeOutput, setCodePassed } = useGameStore();
    const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
    const [code, setCode] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{ passed: boolean; message: string } | null>(null);
    const { testCode } = useJSSandbox();

    if (!showIDE || !currentCheckpoint) return null;

    const meta = CHALLENGE_META[currentCheckpoint] ?? CHALLENGE_META.checkpoint_1;

    const handleLanguageChange = (lang: 'javascript' | 'python') => {
        setLanguage(lang);
        setCode(meta.starterCode[lang]);
    };

    const handleRun = async () => {
        setIsRunning(true);
        setSubmitResult(null);
        try {
            await testCode(code || meta.starterCode[language], meta.testCases);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await api.post('/challenge/validate', {
                checkpointId: currentCheckpoint,
                code: code || meta.starterCode[language],
                language,
            });
            if (res.data.passed) {
                setCodePassed(true);
                setSubmitResult({ passed: true, message: '✅ All tests passed! Proceed to the quiz.' });
                setTimeout(() => {
                    setShowIDE(false);
                    setShowQuiz(true);
                }, 1500);
            } else {
                setSubmitResult({ passed: false, message: `❌ ${res.data.results?.filter((r: { passed: boolean }) => !r.passed).length} test(s) failed. Keep trying!` });
            }
        } catch {
            setSubmitResult({ passed: false, message: '❌ Server validation failed. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setShowIDE(false);
        eventBridge.emit(EVENTS.GAME_RESUME);
    };

    return (
        <div className="overlay-backdrop animate-fade-in">
            <div className={`${styles.ideContainer} animate-slide-up`}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>{meta.title}</h2>
                        <p className={styles.subtitle}>Solve the challenge to proceed</p>
                    </div>
                    <button className={styles.closeBtn} onClick={handleClose} title="Close (resumes game)">✕</button>
                </div>

                <div className={styles.body}>
                    {/* Description panel */}
                    <div className={styles.descriptionPanel}>
                        <h3>📜 Challenge</h3>
                        <pre className={styles.description}>{meta.description}</pre>

                        {/* Language selector */}
                        <div className={styles.langSelector}>
                            <span>Language:</span>
                            {(['javascript', 'python'] as const).map((lang) => (
                                <button
                                    key={lang}
                                    className={`${styles.langBtn} ${language === lang ? styles.langBtnActive : ''}`}
                                    onClick={() => handleLanguageChange(lang)}
                                >
                                    {lang === 'javascript' ? '🟨 JS' : '🐍 Python'}
                                </button>
                            ))}
                        </div>

                        {/* Output */}
                        <div className={styles.outputPanel}>
                            <div className={styles.outputHeader}>📤 Output</div>
                            <pre className={styles.output}>{codeOutput || 'Click "Run" to test your code…'}</pre>
                        </div>

                        {submitResult && (
                            <div className={`${styles.submitResult} ${submitResult.passed ? styles.submitPass : styles.submitFail}`}>
                                {submitResult.message}
                            </div>
                        )}
                    </div>

                    {/* Editor */}
                    <div className={styles.editorPanel}>
                        <Editor
                            height="100%"
                            language={language}
                            value={code || meta.starterCode[language]}
                            onChange={(val) => setCode(val ?? '')}
                            theme="vs-dark"
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                lineNumbers: 'on',
                                automaticLayout: true,
                                tabSize: 2,
                                wordWrap: 'on',
                            }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button className="btn btn-secondary" onClick={handleRun} disabled={isRunning}>
                        {isRunning ? '⏳ Running…' : '▶ Run Code'}
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? '⏳ Validating…' : '🚀 Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
}
