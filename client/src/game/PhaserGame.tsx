import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { eventBridge, EVENTS } from './EventBridge';
import { useGameStore } from '../store/gameStore';
import styles from './PhaserGame.module.css';

export default function PhaserGame() {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Phaser.Game | null>(null);
    const setShowIDE = useGameStore((s) => s.setShowIDE);
    const setShowIDERef = useRef(setShowIDE);
    setShowIDERef.current = setShowIDE;

    useEffect(() => {
        // Guard: only create once
        if (gameRef.current) return;
        const container = containerRef.current;
        if (!container) return;

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.CANVAS,
            parent: container,
            width: container.clientWidth || 960,
            height: 540,
            backgroundColor: '#64B8FF',
            physics: {
                default: 'arcade',
                arcade: { gravity: { x: 0, y: 0 }, debug: false },
            },
            scene: [GameScene],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            render: {
                antialias: false,
                pixelArt: false,
            },
        };

        gameRef.current = new Phaser.Game(config);

        // Bridge: Phaser → React
        eventBridge.on(EVENTS.CHECKPOINT_REACHED, (checkpointId: string) => {
            setShowIDERef.current(true, checkpointId);
        });

        return () => {
            eventBridge.removeAllListeners();
            gameRef.current?.destroy(true);
            gameRef.current = null;
        };
    }, []); // Empty deps — Phaser mounts once

    return (
        <div className={styles.gameWrapper}>
            <div ref={containerRef} className={styles.gameCanvas} id="phaser-container" />
        </div>
    );
}
