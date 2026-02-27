import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../db/pool';

const router = Router();

const RegisterSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(6),
});

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = RegisterSchema.parse(req.body);
        const passwordHash = await bcrypt.hash(password, 12);
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await client.query(
                'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
                [username, email, passwordHash]
            );
            const user = result.rows[0];
            await client.query('INSERT INTO currencies (user_id, coins) VALUES ($1, 0)', [user.id]);
            await client.query('COMMIT');
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
            res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email } });
        } catch (err: any) {
            await client.query('ROLLBACK');
            if (err.code === '23505') {
                res.status(409).json({ error: 'Username or email already exists' });
            } else {
                throw err;
            }
        } finally {
            client.release();
        }
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: err.issues });
        } else {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = LoginSchema.parse(req.body);
        const result = await pool.query(
            `SELECT u.id, u.username, u.email, u.password_hash, u.loadout, c.coins
       FROM users u LEFT JOIN currencies c ON c.user_id = u.id
       WHERE u.email = $1`,
            [email]
        );
        const user = result.rows[0];
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
        res.json({
            token,
            user: { id: user.id, username: user.username, email: user.email, coins: user.coins, loadout: user.loadout },
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: err.issues });
        } else {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) { res.status(401).json({ error: 'No token' }); return; }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const result = await pool.query(
            `SELECT u.id, u.username, u.email, u.loadout, c.coins
       FROM users u LEFT JOIN currencies c ON c.user_id = u.id
       WHERE u.id = $1`,
            [decoded.userId]
        );
        if (!result.rows[0]) { res.status(404).json({ error: 'User not found' }); return; }
        res.json({ user: result.rows[0] });
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;
