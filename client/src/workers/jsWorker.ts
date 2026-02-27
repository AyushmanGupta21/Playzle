// =============================================
// Playzle JS Execution Sandbox — Web Worker
// Runs user JavaScript in complete isolation.
// Auto-terminates after 5 seconds.
// =============================================

interface TestCase {
    input: string;
    expected: string;
}

interface SandboxMessage {
    code: string;
    testCases?: TestCase[];
    mode: 'run' | 'test';
}

// Kill the worker after 5 seconds (infinite loop protection)
const timeoutId = setTimeout(() => {
    self.postMessage({ type: 'timeout', output: '⏱️ Execution timed out (5s limit). Check for infinite loops.' });
    self.close();
}, 5000);

self.onmessage = (e: MessageEvent<SandboxMessage>) => {
    const { code, testCases, mode } = e.data;
    const logs: string[] = [];

    // Override console.log to capture output
    const fakeConsole = { log: (...args: unknown[]) => logs.push(args.map(String).join(' ')) };

    try {
        const fn = new Function('console', code);
        fn(fakeConsole);

        if (mode === 'test' && testCases) {
            const results = testCases.map(({ input, expected }) => {
                try {
                    // Inject user code + call the test expression
                    const testFn = new Function('console', `${code}; return String(${input})`);
                    const actual = testFn(fakeConsole);
                    return { input, expected, actual, passed: actual === expected };
                } catch (err: any) {
                    return { input, expected, actual: `Error: ${err.message}`, passed: false };
                }
            });
            clearTimeout(timeoutId);
            self.postMessage({ type: 'test_results', results, logs });
        } else {
            clearTimeout(timeoutId);
            self.postMessage({ type: 'success', output: logs.join('\n') || '(no output)' });
        }
    } catch (err: any) {
        clearTimeout(timeoutId);
        self.postMessage({ type: 'error', output: `❌ ${err.message}` });
    }
};

export { };
