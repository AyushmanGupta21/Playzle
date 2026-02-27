import { useEffect, useState } from 'react';
import api from '../api/client';
import { useGameStore } from '../store/gameStore';
import styles from './Leaderboard.module.css';

interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    score: number;
}

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
    const { user } = useGameStore();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [myRank, setMyRank] = useState<number | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/leaderboard/top?n=20');
                setLeaderboard(res.data.leaderboard);
                if (user) {
                    const rankRes = await api.get(`/leaderboard/rank/${user.id}`);
                    setMyRank(rankRes.data.rank);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
        const interval = setInterval(load, 15000); // refresh every 15s
        return () => clearInterval(interval);
    }, [user]);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={`${styles.title} pixel-font`}>🏆 LEADERBOARD</h1>
                    <p className={styles.subtitle}>Real-time global rankings powered by Redis</p>
                </div>
                {myRank && user && (
                    <div className={styles.myRank}>
                        <span className={styles.myRankLabel}>Your Rank</span>
                        <span className={styles.myRankValue}>#{myRank}</span>
                    </div>
                )}
            </div>

            {loading ? (
                <div className={styles.loading}>⏳ Fetching rankings…</div>
            ) : (
                <div className={styles.table}>
                    <div className={styles.tableHeader}>
                        <span>Rank</span>
                        <span>Hero</span>
                        <span>Score</span>
                        <span>Coins</span>
                    </div>
                    {leaderboard.map((entry, i) => (
                        <div
                            key={entry.userId}
                            className={`${styles.row} ${entry.userId === user?.id ? styles.myRow : ''} ${i < 3 ? styles.topRow : ''}`}
                        >
                            <span className={styles.rank}>
                                {i < 3 ? RANK_MEDALS[i] : `#${entry.rank}`}
                            </span>
                            <span className={styles.username}>
                                {i === 0 && <span className={styles.crown}>👑 </span>}
                                {entry.username}
                                {entry.userId === user?.id && <span className={styles.youTag}> (you)</span>}
                            </span>
                            <span className={styles.score}>{entry.score.toLocaleString()} pts</span>
                            <span className={styles.coins}>🪙 {entry.score.toLocaleString()}</span>
                        </div>
                    ))}
                    {leaderboard.length === 0 && (
                        <div className={styles.empty}>
                            No players yet — be the first to clear a level!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
