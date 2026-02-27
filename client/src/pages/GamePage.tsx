import PhaserGame from '../game/PhaserGame';
import MonacoIDE from '../components/MonacoIDE/MonacoIDE';
import Quiz from '../components/Quiz/Quiz';
import { useGameStore } from '../store/gameStore';
import { Navigate } from 'react-router-dom';
import styles from './GamePage.module.css';

export default function GamePage() {
    const { user, questProgress } = useGameStore();

    if (!user) return <Navigate to="/login" replace />;

    const completedCount = questProgress.filter((q) => q.status === 'completed').length;

    return (
        <div className={styles.page}>
            <div className={styles.gameHeader}>
                <div className={styles.questInfo}>
                    <span className={styles.questLabel}>Quest Progress</span>
                    <div className={styles.questBar}>
                        <div className={styles.questFill} style={{ width: `${(completedCount / 3) * 100}%` }} />
                    </div>
                    <span className={styles.questCount}>{completedCount}/3 checkpoints</span>
                </div>
                <div className={styles.instructions}>
                    <span>⌨️ Move: <kbd>WASD</kbd> / Arrow Keys</span>
                    <span>🎯 Walk into a glowing circle to trigger a challenge</span>
                </div>
            </div>

            <PhaserGame />

            {/* Overlays */}
            <MonacoIDE />
            <Quiz />
        </div>
    );
}
