import Phaser from 'phaser';
import { eventBridge, EVENTS } from '../EventBridge';


interface Checkpoint {
    id: string;
    x: number;
    y: number;
    radius: number;
    label: string;
    completed: boolean;
}

export class GameScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Rectangle;
    private playerBody!: Phaser.Physics.Arcade.Body;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
    private checkpoints: Checkpoint[] = [];
    private checkpointGraphics: Phaser.GameObjects.Graphics[] = [];
    private paused = false;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Create tile pattern texture programmatically
        const g = this.make.graphics({ x: 0, y: 0 });
        g.fillStyle(0x1a2d1a);
        g.fillRect(0, 0, 32, 32);
        g.lineStyle(1, 0x2a4d2a, 0.5);
        g.strokeRect(0, 0, 32, 32);
        g.generateTexture('tile', 32, 32);
        g.destroy();
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // ── Background tiles ──
        for (let x = 0; x < W; x += 32) {
            for (let y = 0; y < H; y += 32) {
                const brightness = Math.random() * 0.15;
                const color = Phaser.Display.Color.GetColor(
                    Math.floor(20 + brightness * 30),
                    Math.floor(40 + brightness * 40),
                    Math.floor(20 + brightness * 20)
                );
                const tile = this.add.rectangle(x + 16, y + 16, 30, 30, color);
                tile.setAlpha(0.8);
            }
        }

        // ── Decorative trees / rocks ──
        const decorations = [
            { x: 100, y: 80, emoji: '🌲' }, { x: 350, y: 60, emoji: '🌲' },
            { x: 600, y: 90, emoji: '🌳' }, { x: 820, y: 70, emoji: '🌲' },
            { x: 150, y: 380, emoji: '🪨' }, { x: 700, y: 420, emoji: '🪨' },
            { x: 50, y: 220, emoji: '🌿' }, { x: 900, y: 300, emoji: '🌿' },
        ];
        decorations.forEach(({ x, y, emoji }) => {
            this.add.text(x, y, emoji, { fontSize: '28px' }).setAlpha(0.7);
        });

        // ── Path (visual guide) ──
        const path = this.add.graphics();
        path.lineStyle(8, 0x8b7355, 0.6);
        path.beginPath();
        path.moveTo(80, 250);
        path.lineTo(250, 250);
        path.lineTo(250, 150);
        path.lineTo(450, 150);
        path.lineTo(450, 300);
        path.lineTo(650, 300);
        path.lineTo(650, 180);
        path.lineTo(850, 180);
        path.strokePath();

        // ── Checkpoints ──
        this.checkpoints = [
            { id: 'checkpoint_1', x: 250, y: 250, radius: 30, label: '1️⃣  Functions', completed: false },
            { id: 'checkpoint_2', x: 450, y: 150, radius: 30, label: '2️⃣  Strings', completed: false },
            { id: 'checkpoint_3', x: 650, y: 180, radius: 30, label: '3️⃣  Algorithms', completed: false },
        ];

        this.checkpointGraphics = this.checkpoints.map((cp) => {
            const g = this.add.graphics();
            this.drawCheckpoint(g, cp);
            this.add.text(cp.x, cp.y + cp.radius + 14, cp.label, {
                fontSize: '11px', color: '#fcd34d', align: 'center',
            }).setOrigin(0.5);
            return g;
        });

        // ── Player ──
        this.player = this.add.rectangle(80, 250, 24, 24, 0x7c3aed);
        this.physics.add.existing(this.player);
        this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        this.playerBody.setCollideWorldBounds(true);

        // Player shadow
        const shadow = this.add.ellipse(0, 0, 20, 8, 0x000000, 0.4);
        this.add.text(0, 0, '🧙', { fontSize: '20px' }).setDepth(10);

        // ── Input ──
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasd = {
            W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };

        // ── HUD ──
        this.add.text(16, 16, '⚔️ Use Arrow/WASD to move', {
            fontSize: '11px', color: '#94a3b8',
        }).setScrollFactor(0).setDepth(20);

        // ── Listen for resume ──
        eventBridge.on(EVENTS.GAME_RESUME, () => {
            this.paused = false;
            this.physics.resume();
        });

        // ── Particle effect on load ──
        this.cameras.main.fadeIn(600, 0, 0, 0);
    }

    private drawCheckpoint(g: Phaser.GameObjects.Graphics, cp: Checkpoint) {
        g.clear();
        const color = cp.completed ? 0x10b981 : 0xf59e0b;
        const glow = cp.completed ? 0x34d399 : 0xfcd34d;
        g.lineStyle(3, glow, 0.6);
        g.strokeCircle(cp.x, cp.y, cp.radius + 6);
        g.lineStyle(2, color, 1);
        g.strokeCircle(cp.x, cp.y, cp.radius);
        if (!cp.completed) {
            g.fillStyle(color, 0.15);
            g.fillCircle(cp.x, cp.y, cp.radius);
        }
    }

    private dist(ax: number, ay: number, bx: number, by: number) {
        return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
    }

    update() {
        if (this.paused) return;

        const speed = 160;
        const vx =
            (this.cursors.right?.isDown || this.wasd.D.isDown ? 1 : 0) -
            (this.cursors.left?.isDown || this.wasd.A.isDown ? 1 : 0);
        const vy =
            (this.cursors.down?.isDown || this.wasd.S.isDown ? 1 : 0) -
            (this.cursors.up?.isDown || this.wasd.W.isDown ? 1 : 0);

        this.playerBody.setVelocity(vx * speed, vy * speed);
        if (vx !== 0 || vy !== 0) {
            this.playerBody.velocity.normalize().scale(speed);
        }

        // Update shadow + sprite
        const px = this.player.x;
        const py = this.player.y;

        // Checkpoint collision
        this.checkpoints.forEach((cp, i) => {
            if (!cp.completed && this.dist(px, py, cp.x, cp.y) < cp.radius + 12) {
                cp.completed = false; // don't auto-complete
                this.paused = true;
                this.physics.pause();
                eventBridge.emit(EVENTS.CHECKPOINT_REACHED, cp.id);
            }
            this.drawCheckpoint(this.checkpointGraphics[i], cp);
        });
    }

    markCheckpointComplete(id: string) {
        const cp = this.checkpoints.find((c) => c.id === id);
        if (cp) cp.completed = true;
    }
}
