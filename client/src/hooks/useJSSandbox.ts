import { useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';

export function useJSSandbox() {
    const workerRef = useRef<Worker | null>(null);
    const { setCodeOutput } = useGameStore();

    const runCode = useCallback((code: string): Promise<{ passed: boolean; output: string }> => {
        return new Promise((resolve) => {
            // Terminate any previous worker
            workerRef.current?.terminate();

            const worker = new Worker(new URL('../workers/jsWorker.ts', import.meta.url), { type: 'module' });
            workerRef.current = worker;

            worker.onmessage = (e) => {
                const { type, output, results } = e.data;
                let outText = '';
                let passed = false;

                if (type === 'success') {
                    outText = output;
                    passed = true;
                } else if (type === 'error') {
                    outText = output;
                } else if (type === 'timeout') {
                    outText = output;
                } else if (type === 'test_results') {
                    const allPass = results.every((r: { passed: boolean }) => r.passed);
                    passed = allPass;
                    outText = results
                        .map((r: { input: string; expected: string; actual: string; passed: boolean }) =>
                            `${r.passed ? '✅' : '❌'} ${r.input} → got "${r.actual}", expected "${r.expected}"`
                        )
                        .join('\n');
                }

                setCodeOutput(outText);
                resolve({ passed, output: outText });
                worker.terminate();
            };

            worker.onerror = (err) => {
                const msg = `❌ Worker error: ${err.message}`;
                setCodeOutput(msg);
                resolve({ passed: false, output: msg });
                worker.terminate();
            };

            worker.postMessage({ code, mode: 'run' });
        });
    }, [setCodeOutput]);

    const testCode = useCallback((code: string, testCases: Array<{ input: string; expected: string }>): Promise<{ passed: boolean; output: string }> => {
        return new Promise((resolve) => {
            workerRef.current?.terminate();
            const worker = new Worker(new URL('../workers/jsWorker.ts', import.meta.url), { type: 'module' });
            workerRef.current = worker;

            worker.onmessage = (e) => {
                const { type, results, output } = e.data;
                if (type === 'test_results') {
                    const allPass = results.every((r: { passed: boolean }) => r.passed);
                    const outText = results
                        .map((r: { input: string; expected: string; actual: string; passed: boolean }) =>
                            `${r.passed ? '✅' : '❌'} ${r.input} → got "${r.actual}", expected "${r.expected}"`
                        )
                        .join('\n');
                    setCodeOutput(outText);
                    resolve({ passed: allPass, output: outText });
                } else {
                    setCodeOutput(output || '');
                    resolve({ passed: false, output: output || '' });
                }
                worker.terminate();
            };

            worker.postMessage({ code, testCases, mode: 'test' });
        });
    }, [setCodeOutput]);

    return { runCode, testCode };
}
