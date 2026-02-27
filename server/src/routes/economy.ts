import { Router, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const PurchaseSchema = z.object({
    itemId: z.string().uuid(),
    idempotencyKey: z.string().uuid(),
});

const LoadoutSchema = z.object({
    loadout: z.record(z.string()),
});

// GET /api/economy/balance
router.get('/balance', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await pool.query('SELECT coins FROM currencies WHERE user_id = $1', [req.userId]);
    res.json({ coins: result.rows[0]?.coins ?? 0 });
});

// GET /api/economy/inventory
router.get('/inventory', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await pool.query(
        `SELECT i.*, inv.acquired_at FROM inventory inv
     JOIN items i ON i.id = inv.item_id
     WHERE inv.user_id = $1`,
        [req.userId]
    );
    res.json({ items: result.rows });
});

// GET /api/economy/items
router.get('/items', async (_req, res: Response) => {
    const result = await pool.query('SELECT * FROM items ORDER BY cost ASC');
    res.json({ items: result.rows });
});

// POST /api/economy/purchase  — IDEMPOTENT
router.post('/purchase', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { itemId, idempotencyKey } = PurchaseSchema.parse(req.body);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Check if this idempotency key was already processed
            const existing = await client.query(
                'SELECT status FROM transactions WHERE idempotency_key = $1',
                [idempotencyKey]
            );
            if (existing.rows.length > 0) {
                await client.query('COMMIT');
                res.json({ message: 'Already processed', status: existing.rows[0].status });
                return;
            }

            // 2. Get item cost
            const itemResult = await client.query('SELECT * FROM items WHERE id = $1', [itemId]);
            if (!itemResult.rows[0]) {
                await client.query('ROLLBACK');
                res.status(404).json({ error: 'Item not found' });
                return;
            }
            const item = itemResult.rows[0];

            // 3. Check if already owned
            const owned = await client.query(
                'SELECT 1 FROM inventory WHERE user_id = $1 AND item_id = $2',
                [req.userId, itemId]
            );
            if (owned.rows.length > 0) {
                await client.query('ROLLBACK');
                res.status(409).json({ error: 'Item already owned' });
                return;
            }

            // 4. Check balance
            const balResult = await client.query(
                'SELECT coins FROM currencies WHERE user_id = $1 FOR UPDATE',
                [req.userId]
            );
            const coins = balResult.rows[0]?.coins ?? 0;
            if (coins < item.cost) {
                await client.query('ROLLBACK');
                res.status(400).json({ error: 'Insufficient coins', required: item.cost, current: coins });
                return;
            }

            // 5. Deduct coins & add to inventory atomically
            await client.query(
                'UPDATE currencies SET coins = coins - $1 WHERE user_id = $2',
                [item.cost, req.userId]
            );
            await client.query(
                'INSERT INTO inventory (user_id, item_id) VALUES ($1, $2)',
                [req.userId, itemId]
            );
            await client.query(
                'INSERT INTO transactions (idempotency_key, user_id, item_id, amount, status) VALUES ($1, $2, $3, $4, $5)',
                [idempotencyKey, req.userId, itemId, item.cost, 'completed']
            );

            await client.query('COMMIT');

            const newBalance = await pool.query('SELECT coins FROM currencies WHERE user_id = $1', [req.userId]);
            res.json({ message: 'Purchase successful', item, newBalance: newBalance.rows[0].coins });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: err.issues });
        } else {
            console.error(err);
            res.status(500).json({ error: 'Purchase failed' });
        }
    }
});

// PUT /api/economy/loadout
router.put('/loadout', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { loadout } = LoadoutSchema.parse(req.body);
        await pool.query('UPDATE users SET loadout = $1 WHERE id = $2', [JSON.stringify(loadout), req.userId]);
        res.json({ message: 'Loadout updated', loadout });
    } catch {
        res.status(400).json({ error: 'Invalid loadout' });
    }
});

export default router;
