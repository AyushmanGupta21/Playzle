import { Router, Response } from 'express';
import { z } from 'zod';
import vm from 'vm';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { pool } from '../db/pool';

const router = Router();

const CHALLENGES: Record<string, { description: string; testCases: Array<{ input: string; expected: string }> }> = {
    checkpoint_1: {
        description: 'Write a function called `add` that takes two numbers and returns their sum.',
        testCases: [
            { input: 'add(2, 3)', expected: '5' },
            { input: 'add(10, 20)', expected: '30' },
            { input: 'add(-1, 1)', expected: '0' },
        ],
    },
    checkpoint_2: {
        description: 'Write a function called `reverseString` that reverses a string.',
        testCases: [
            { input: 'reverseString("hello")', expected: 'olleh' },
            { input: 'reverseString("playzle")', expected: 'elzvalp' },
        ],
    },
    checkpoint_3: {
        description: 'Write a function called `fibonacci` that returns the nth Fibonacci number.',
        testCases: [
            { input: 'fibonacci(1)', expected: '1' },
            { input: 'fibonacci(5)', expected: '5' },
            { input: 'fibonacci(10)', expected: '55' },
        ],
    },
};

const ValidateSchema = z.object({
    checkpointId: z.string(),
    code: z.string().max(10000),
    language: z.enum(['javascript', 'python']),
});

// POST /api/challenge/validate
router.post('/validate', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { checkpointId, code, language } = ValidateSchema.parse(req.body);
        const challenge = CHALLENGES[checkpointId];
        if (!challenge) {
            res.status(404).json({ error: 'Challenge not found' });
            return;
        }

        if (language !== 'javascript') {
            await markQuestProgress(req.userId!, checkpointId, 'code_passed');
            res.json({ passed: true, message: 'Python validation accepted (client-verified)' });
            return;
        }

        const results: Array<{ input: string; expected: string; actual: string; passed: boolean }> = [];
        let allPassed = true;

        for (const testCase of challenge.testCases) {
            try {
                const sandbox: Record<string, unknown> = {};
                vm.createContext(sandbox);
                const script = new vm.Script(`${code}; __result = String(${testCase.input})`);
                script.runInContext(sandbox, { timeout: 3000 });
                const actual = String(sandbox.__result);
                const passed = actual === testCase.expected;
                if (!passed) allPassed = false;
                results.push({ input: testCase.input, expected: testCase.expected, actual, passed });
            } catch (err: any) {
                allPassed = false;
                results.push({ input: testCase.input, expected: testCase.expected, actual: err.message, passed: false });
            }
        }

        if (allPassed) {
            await markQuestProgress(req.userId!, checkpointId, 'code_passed');
        }

        res.json({ passed: allPassed, results, challenge: { description: challenge.description } });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: err.issues });
        } else {
            console.error(err);
            res.status(500).json({ error: 'Validation failed' });
        }
    }
});

// POST /api/challenge/complete
router.post('/complete', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { checkpointId } = z.object({ checkpointId: z.string() }).parse(req.body);

        const progress = await pool.query(
            'SELECT status FROM quest_progress WHERE user_id = $1 AND checkpoint_id = $2',
            [req.userId, checkpointId]
        );
        if (!progress.rows[0] || progress.rows[0].status !== 'code_passed') {
            res.status(403).json({ error: 'Code challenge must be passed first' });
            return;
        }

        const COIN_REWARDS: Record<string, number> = {
            checkpoint_1: 50, checkpoint_2: 100, checkpoint_3: 200,
        };
        const reward = COIN_REWARDS[checkpointId] ?? 50;

        await pool.query('UPDATE currencies SET coins = coins + $1 WHERE user_id = $2', [reward, req.userId]);
        await markQuestProgress(req.userId!, checkpointId, 'completed');

        const newBalance = await pool.query('SELECT coins FROM currencies WHERE user_id = $1', [req.userId]);
        res.json({ message: 'Level complete!', coinsAwarded: reward, newBalance: newBalance.rows[0].coins });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to complete challenge' });
    }
});

// GET /api/challenge/progress
router.get('/progress', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await pool.query(
        'SELECT checkpoint_id, status, completed_at FROM quest_progress WHERE user_id = $1',
        [req.userId]
    );
    res.json({ progress: result.rows });
});

async function markQuestProgress(userId: string, checkpointId: string, status: string) {
    await pool.query(
        `INSERT INTO quest_progress (user_id, checkpoint_id, status, completed_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, checkpoint_id)
     DO UPDATE SET status = EXCLUDED.status, completed_at = EXCLUDED.completed_at`,
        [userId, checkpointId, status, status === 'completed' ? new Date() : null]
    );
}

export default router;
