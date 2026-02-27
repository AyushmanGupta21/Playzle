import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter from './routes/auth';
import economyRouter from './routes/economy';
import leaderboardRouter from './routes/leaderboard';
import challengeRouter from './routes/challenge';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRouter);
app.use('/api/economy', economyRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/challenge', challengeRouter);

app.listen(PORT, () => {
    console.log(`🎮 Playzle server running on http://localhost:${PORT}`);
});

export default app;
