import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { eventBridge, EVENTS } from './EventBridge';
import { useGameStore } from '../store/gameStore';
import styles from './PhaserGame.module.css';

export default function PhaserGame() {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Phaser.Game | null>(null);
    const { setShowIDE } = useGameStore();

    useEffect(() => {
        if (!containerRef.current || gameRef.current) return;

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: containerRef.current,
            width: containerRef.current.clientWidth || 960,
            height: 520,
            backgroundColor: '#0f1a0f',
            physics: {
                default: 'arcade',
                arcade: { gravity: { x: 0, y: 0 }, debug: false },
            },
            scene: [GameScene],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
        };

        gameRef.current = new Phaser.Game(config);

        // Bridge: Phaser event → React state
        eventBridge.on(EVENTS.CHECKPOINT_REACHED, (checkpointId: string) => {
            setShowIDE(true, checkpointId);
        });

        return () => {
            eventBridge.removeAllListeners();
            gameRef.current?.destroy(true);
            gameRef.current = null;
        };
    }, [setShowIDE]);

    // Resume game from outside
    const resumeGame = () => {
        eventBridge.emit(EVENTS.GAME_RESUME);
    };

    return (
        <div className={styles.gameWrapper}>
            <div ref={containerRef} className={styles.gameCanvas} id="phaser-container" />
        </div>
    );
}

export { };
