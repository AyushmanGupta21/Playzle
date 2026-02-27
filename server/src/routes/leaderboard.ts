import { Router, Response } from 'express';
import { z } from 'zod';
import { redis } from '../redis/client';
import { pool } from '../db/pool';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const LEADERBOARD_KEY = 'playzle:leaderboard';

const ScoreSchema = z.object({ score: z.number().int().positive() });

// POST /api/leaderboard/score
router.post('/score', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { score } = ScoreSchema.parse(req.body);
        await redis.zadd(LEADERBOARD_KEY, 'GT', String(score), req.userId!);
        await pool.query('UPDATE currencies SET coins = coins + $1 WHERE user_id = $2', [score, req.userId]);
        const rank = await redis.zrevrank(LEADERBOARD_KEY, req.userId!);
        res.json({ message: 'Score updated', score, rank: (rank ?? 0) + 1 });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: err.issues });
        } else {
            console.error(err);
            res.status(500).json({ error: 'Failed to update score' });
        }
    }
});

// GET /api/leaderboard/top?n=10
router.get('/top', async (req, res: Response): Promise<void> => {
    try {
        const n = Math.min(parseInt(String(req.query.n)) || 10, 100);
        const raw = await redis.zrevrange(LEADERBOARD_KEY, 0, n - 1, 'WITHSCORES');
        const entries: Array<{ rank: number; userId: string; username: string; score: number }> = [];
        for (let i = 0; i < raw.length; i += 2) {
            const userId = raw[i];
            const score = parseInt(raw[i + 1]);
            const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
            entries.push({
                rank: entries.length + 1,
                userId,
                username: userResult.rows[0]?.username ?? 'Unknown',
                score,
            });
        }
        res.json({ leaderboard: entries });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// GET /api/leaderboard/rank/:userId
router.get('/rank/:userId', async (req, res: Response): Promise<void> => {
    const id = String(req.params.userId);
    const rank = await redis.zrevrank(LEADERBOARD_KEY, id);
    const score = await redis.zscore(LEADERBOARD_KEY, id);
    res.json({ rank: rank !== null ? rank + 1 : null, score: score ? parseInt(score) : 0 });
});

export default router;
