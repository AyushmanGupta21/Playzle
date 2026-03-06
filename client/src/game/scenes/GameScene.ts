import Phaser from 'phaser';
import { eventBridge, EVENTS } from '../EventBridge';

interface Checkpoint {
  id: string;
  x: number;
  y: number;
  radius: number;
  label: string;
  emoji: string;
  completed: boolean;
}

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private playerSprite!: Phaser.GameObjects.Graphics;
  private playerDirection = 1; // 1=right, -1=left
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private checkpoints: Checkpoint[] = [];
  private checkpointContainers: Phaser.GameObjects.Container[] = [];
  private paused = false;
  private animTime = 0;
  private coins: Phaser.GameObjects.Text[] = [];
  private floatingCoins: { obj: Phaser.GameObjects.Text; vy: number; life: number }[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() { }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ── Sky gradient background ──
    const sky = this.add.graphics();
    for (let y = 0; y < H * 0.4; y++) {
      const t = y / (H * 0.4);
      const r = Math.floor(Phaser.Math.Linear(100, 136, t));
      const g = Math.floor(Phaser.Math.Linear(180, 210, t));
      const b = Math.floor(Phaser.Math.Linear(255, 255, t));
      sky.lineStyle(1, Phaser.Display.Color.GetColor(r, g, b), 1);
      sky.lineBetween(0, y, W, y);
    }

    // ── Ground ──
    const ground = this.add.graphics();
    // dark soil
    ground.fillStyle(0x8B5E3C);
    ground.fillRect(0, H * 0.6, W, H * 0.4);
    // grass strips
    ground.fillStyle(0x5DBB3F);
    ground.fillRect(0, H * 0.6, W, 18);
    ground.fillStyle(0x4CAF50);
    ground.fillRect(0, H * 0.6 + 6, W, 10);
    // subtle tile lines on ground
    ground.lineStyle(1, 0x3d7d2e, 0.3);
    for (let x = 0; x < W; x += 40) ground.lineBetween(x, H * 0.6 + 18, x, H);

    // ── Grass tiles for the play area ──
    const grassBase = this.add.graphics();
    // Main play floor tiles
    const tileColors = [0x4EC942, 0x52D044, 0x48C43C, 0x56D548];
    for (let x = 0; x < W; x += 32) {
      for (let y = 40; y < H * 0.6; y += 32) {
        const c = tileColors[Math.floor(Math.random() * tileColors.length)];
        grassBase.fillStyle(c, 0.12);
        grassBase.fillRect(x, y, 31, 31);
      }
    }

    // ── Background mountains ──
    this.drawMountains(W, H);

    // ── Decorative clouds ──
    this.drawClouds(W, H);

    // ── Platform path blocks (Mario-style brick road) ──
    this.drawPlatformPath(W, H);

    // ── Decorative elements ──
    this.drawDecorations(W, H);

    // ── Checkpoints ──
    this.checkpoints = [
      { id: 'checkpoint_1', x: 260, y: H * 0.5 - 10, radius: 32, label: 'Functions', emoji: '⚙️', completed: false },
      { id: 'checkpoint_2', x: 480, y: H * 0.35, radius: 32, label: 'Strings', emoji: '🔤', completed: false },
      { id: 'checkpoint_3', x: 700, y: H * 0.45, radius: 32, label: 'Algorithms', emoji: '🧠', completed: false },
    ];

    this.checkpointContainers = this.checkpoints.map((cp, i) => {
      const container = this.add.container(cp.x, cp.y);
      this.buildCheckpoint(container, cp, i);
      return container;
    });

    // ── Player ──
    this.player = this.add.container(80, H * 0.5);
    this.playerSprite = this.add.graphics();
    this.drawPlayer(this.playerSprite, false);
    this.player.add(this.playerSprite);

    this.physics.add.existing(this.player);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setSize(28, 36);
    this.playerBody.setOffset(-14, -18);
    this.playerBody.setCollideWorldBounds(true);

    // ── Input ──
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // ── Floating coins along path ──
    const coinPositions = [160, 220, 320, 380, 420, 540, 600, 650];
    coinPositions.forEach((x, i) => {
      const coin = this.add.text(x, H * 0.42 - (i % 2) * 20, '🪙', { fontSize: '18px' });
      this.coins.push(coin);
    });

    // ── Resume bridge ──
    eventBridge.on(EVENTS.GAME_RESUME, () => {
      this.paused = false;
      this.physics.resume();
      // Re-enable keyboard so player can move again
      this.input.keyboard!.enableGlobalCapture();
    });

    // ── Camera fade-in ──
    this.cameras.main.fadeIn(800, 0, 0, 0);
  }

  private drawPlayer(g: Phaser.GameObjects.Graphics, walking: boolean) {
    g.clear();
    const bob = walking ? Math.sin(this.animTime * 8) * 2 : 0;

    // Shadow
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(0, 20 + bob, 26, 8);

    // Body (robe)
    g.fillStyle(0x7C3AED);
    g.fillRoundedRect(-10, -2 + bob, 20, 22, 4);

    // Robe highlight
    g.fillStyle(0x9D5FF8, 0.6);
    g.fillRoundedRect(-7, -1 + bob, 7, 18, 3);

    // Belt
    g.fillStyle(0xF59E0B);
    g.fillRect(-10, 10 + bob, 20, 4);
    g.fillStyle(0xFCD34D);
    g.fillRect(-3, 11 + bob, 6, 2);

    // Arms
    const armSway = walking ? Math.sin(this.animTime * 8) * 5 : 0;
    g.fillStyle(0x7C3AED);
    g.fillRoundedRect(-16, 0 + armSway + bob, 7, 14, 3);
    g.fillRoundedRect(9, 0 - armSway + bob, 7, 14, 3);

    // Hands
    g.fillStyle(0xFCD9A0);
    g.fillCircle(-13, 13 + armSway + bob, 4);
    g.fillCircle(13, 13 - armSway + bob, 4);

    // Legs
    const legSway = walking ? Math.sin(this.animTime * 8) * 6 : 0;
    g.fillStyle(0x5B21B6);
    g.fillRoundedRect(-9, 18 + legSway + bob, 8, 12, 2);
    g.fillRoundedRect(1, 18 - legSway + bob, 8, 12, 2);
    // Shoes
    g.fillStyle(0x1E1B4B);
    g.fillRoundedRect(-10, 27 + legSway + bob, 10, 5, 2);
    g.fillRoundedRect(0, 27 - legSway + bob, 10, 5, 2);

    // Neck
    g.fillStyle(0xFCD9A0);
    g.fillRect(-4, -6 + bob, 8, 8);

    // Head
    g.fillStyle(0xFCD9A0);
    g.fillCircle(0, -14 + bob, 13);

    // Eyes
    g.fillStyle(0x1E1B4B);
    const eyeX = this.playerDirection > 0 ? 3 : -3;
    g.fillCircle(eyeX, -14 + bob, 2.5);
    g.fillCircle(eyeX - this.playerDirection * 6, -14 + bob, 2.5);
    // Whites
    g.fillStyle(0xFFFFFF);
    g.fillCircle(eyeX + this.playerDirection * 0.8, -14.5 + bob, 1);
    g.fillCircle(eyeX - this.playerDirection * 6 + this.playerDirection * 0.8, -14.5 + bob, 1);

    // Smile (3 dots instead of arc — arc API unreliable)
    g.fillStyle(0x8B5E3C);
    g.fillCircle(-3, -9 + bob, 1.2);
    g.fillCircle(0, -8 + bob, 1.2);
    g.fillCircle(3, -9 + bob, 1.2);

    // Wizard hat
    g.fillStyle(0x5B21B6);
    // Brim
    g.fillEllipse(0, -25 + bob, 30, 8);
    // Cone
    g.fillTriangle(-10, -25 + bob, 10, -25 + bob, 0, -50 + bob);
    // Hat band
    g.fillStyle(0xF59E0B);
    g.fillRect(-10, -28 + bob, 20, 5);
    // Star on hat (draw as 2 triangles)
    g.fillStyle(0xFCD34D);
    g.fillTriangle(0, -44 + bob, -3, -38 + bob, 3, -38 + bob);
    g.fillTriangle(0, -32 + bob, -3, -38 + bob, 3, -38 + bob);
    g.fillTriangle(-4, -42 + bob, 4, -36 + bob, -2, -34 + bob);
    g.fillTriangle(4, -42 + bob, -4, -36 + bob, 2, -34 + bob);
  }

  private buildCheckpoint(container: Phaser.GameObjects.Container, cp: Checkpoint, index: number) {
    container.removeAll(true);

    const completed = cp.completed;
    const colors = [0xF59E0B, 0x3B82F6, 0x10B981];
    const glows = [0xFCD34D, 0x93C5FD, 0x6EE7B7];
    const col = colors[index % 3];
    const glow = glows[index % 3];

    // Outer glow ring (animated via update)
    const outerGlow = this.add.graphics();
    outerGlow.lineStyle(3, glow, 0.4);
    outerGlow.strokeCircle(0, 0, cp.radius + 14);
    outerGlow.setName('outerGlow');
    container.add(outerGlow);

    // Pulsing outer ring
    const ring2 = this.add.graphics();
    ring2.lineStyle(2, glow, 0.6);
    ring2.strokeCircle(0, 0, cp.radius + 6);
    container.add(ring2);

    // Main circle fill
    const circle = this.add.graphics();
    if (completed) {
      circle.fillStyle(0x10B981, 0.3);
      circle.fillCircle(0, 0, cp.radius);
      circle.lineStyle(3, 0x10B981, 1);
      circle.strokeCircle(0, 0, cp.radius);
    } else {
      circle.fillStyle(col, 0.2);
      circle.fillCircle(0, 0, cp.radius);
      circle.lineStyle(3, col, 1);
      circle.strokeCircle(0, 0, cp.radius);
    }
    container.add(circle);

    // Inner decorative pattern
    const inner = this.add.graphics();
    inner.lineStyle(1, glow, 0.5);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      inner.lineBetween(0, 0, Math.cos(angle) * cp.radius * 0.6, Math.sin(angle) * cp.radius * 0.6);
    }
    inner.strokeCircle(0, 0, cp.radius * 0.35);
    container.add(inner);

    // Checkpoint emoji
    const icon = this.add.text(0, -8, completed ? '✅' : cp.emoji, {
      fontSize: '22px',
    }).setOrigin(0.5);
    container.add(icon);

    // Label pill
    const labelBg = this.add.graphics();
    labelBg.fillStyle(completed ? 0x10B981 : col, 0.9);
    labelBg.fillRoundedRect(-38, cp.radius + 4, 76, 20, 6);
    container.add(labelBg);

    const label = this.add.text(0, cp.radius + 14, completed ? '✓ Done' : cp.label, {
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(label);

    // Step number badge
    const badge = this.add.graphics();
    badge.fillStyle(0x1E1B4B, 1);
    badge.fillCircle(-cp.radius, -cp.radius + 4, 11);
    badge.lineStyle(2, col, 1);
    badge.strokeCircle(-cp.radius, -cp.radius + 4, 11);
    container.add(badge);

    const num = this.add.text(-cp.radius, -cp.radius + 4, String(['I', 'II', 'III'][index] ?? '?'), {
      fontSize: '9px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(num);
  }

  private drawMountains(W: number, H: number) {
    const mtn = this.add.graphics();
    // Far mountains (light)
    const mtnColors = [0x7DB9A0, 0x6CA890, 0x5D9880];
    const peaks = [
      { x: -20, w: 180, h: 130 }, { x: 120, w: 200, h: 150 }, { x: 280, w: 160, h: 120 },
      { x: 400, w: 220, h: 160 }, { x: 580, w: 180, h: 140 }, { x: 720, w: 200, h: 130 },
      { x: 880, w: 180, h: 155 },
    ];
    peaks.forEach(({ x, w, h }, i) => {
      mtn.fillStyle(mtnColors[i % 3], 0.5);
      mtn.fillTriangle(x, H * 0.6, x + w / 2, H * 0.6 - h, x + w, H * 0.6);
      // Snow cap
      mtn.fillStyle(0xFFFFFF, 0.6);
      mtn.fillTriangle(x + w / 2 - 16, H * 0.6 - h + 32, x + w / 2, H * 0.6 - h, x + w / 2 + 16, H * 0.6 - h + 32);
    });
  }

  private drawClouds(W: number, H: number) {
    const cloudData = [
      { x: 80, y: 50 }, { x: 250, y: 35 }, { x: 480, y: 55 },
      { x: 650, y: 40 }, { x: 830, y: 48 },
    ];
    cloudData.forEach(({ x, y }) => {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xFFFFFF, 0.9);
      cloud.fillCircle(x, y, 22);
      cloud.fillCircle(x + 28, y, 18);
      cloud.fillCircle(x - 22, y, 16);
      cloud.fillCircle(x + 10, y - 14, 18);
      cloud.fillCircle(x - 6, y - 10, 14);
      // slight shadow under cloud
      cloud.fillStyle(0xD0E8F5, 0.5);
      cloud.fillCircle(x + 10, y + 10, 20);
    });
  }

  private drawPlatformPath(W: number, H: number) {
    const path = this.add.graphics();

    // Brown brick border/shadow
    path.fillStyle(0x8B5E3C, 0.6);
    path.strokePoints([
      { x: 40, y: H * 0.5 + 14 }, { x: 260, y: H * 0.5 + 14 },
      { x: 260, y: H * 0.35 + 14 }, { x: 480, y: H * 0.35 + 14 },
      { x: 480, y: H * 0.45 + 14 }, { x: 700, y: H * 0.45 + 14 },
    ], false, false);

    // Mario-style brick block path
    const pathSegments: [number, number, number, number][] = [
      [40, H * 0.5, 240, 24],
      [255, H * 0.38, 240, 24],
      [470, H * 0.35, 20, H * 0.1 + 24],
      [470, H * 0.44, 250, 24],
    ];

    pathSegments.forEach(([x, y, w, h]) => {
      // Path background
      path.fillStyle(0xC09060, 0.85);
      path.fillRect(x, y, w, h);
      // Brick lines horizontal
      path.lineStyle(1, 0x8B5E3C, 0.5);
      for (let row = 0; row < h; row += 12) {
        path.lineBetween(x, y + row, x + w, y + row);
      }
      // Brick lines vertical (staggered)
      for (let row = 0; row * 12 < h; row++) {
        const offset = (row % 2) * 20;
        for (let col = offset; col < w; col += 40) {
          path.lineBetween(x + col, y + row * 12, x + col, y + row * 12 + 12);
        }
      }
      // Top highlight
      path.lineStyle(2, 0xE8C080, 0.8);
      path.lineBetween(x, y, x + w, y);
    });
  }

  private drawDecorations(W: number, H: number) {
    const decoH = H * 0.6;
    // Trees with trunks
    const trees = [
      { x: 50, y: decoH - 10 }, { x: 380, y: decoH - 10 }, { x: 580, y: decoH - 10 },
      { x: 800, y: decoH - 10 }, { x: 920, y: decoH - 10 }, { x: 140, y: decoH - 10 },
    ];
    trees.forEach(({ x, y }) => {
      const t = this.add.graphics();
      // trunk
      t.fillStyle(0x8B5E3C);
      t.fillRect(x - 5, y - 30, 10, 30);
      // canopy layers
      t.fillStyle(0x2E7D32);
      t.fillTriangle(x - 26, y - 20, x, y - 75, x + 26, y - 20);
      t.fillStyle(0x388E3C);
      t.fillTriangle(x - 22, y - 38, x, y - 88, x + 22, y - 38);
      t.fillStyle(0x43A047);
      t.fillTriangle(x - 16, y - 58, x, y - 100, x + 16, y - 58);
    });

    // Flowers
    const flowers = [
      { x: 155, y: decoH - 2, c: 0xFF6B9D }, { x: 340, y: decoH - 2, c: 0xFFD93D },
      { x: 440, y: decoH - 2, c: 0xFF6B6B }, { x: 760, y: decoH - 2, c: 0xA78BFA },
      { x: 855, y: decoH - 2, c: 0x67E8F9 },
    ];
    flowers.forEach(({ x, y, c }) => {
      const f = this.add.graphics();
      // stem
      f.lineStyle(2, 0x4CAF50);
      f.lineBetween(x, y, x, y - 18);
      // petals
      f.fillStyle(c, 1);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        f.fillCircle(x + Math.cos(a) * 6, y - 18 + Math.sin(a) * 6, 5);
      }
      f.fillStyle(0xFCD34D);
      f.fillCircle(x, y - 18, 5);
    });

    // Mushrooms (Mario!)
    const shrooms = [
      { x: 200, y: decoH - 2, c: 0xEF4444 }, { x: 660, y: decoH - 2, c: 0xA78BFA },
    ];
    shrooms.forEach(({ x, y, c }) => {
      const m = this.add.graphics();
      // stem
      m.fillStyle(0xFEE2E2);
      m.fillRect(x - 8, y - 20, 16, 20);
      // cap
      m.fillStyle(c);
      m.fillCircle(x, y - 24, 16);
      // spots
      m.fillStyle(0xFFFFFF, 0.8);
      m.fillCircle(x - 6, y - 28, 4);
      m.fillCircle(x + 5, y - 24, 3);
      m.fillCircle(x - 2, y - 18, 3);
    });

    // Question mark block (Mario!)
    const qblock = this.add.graphics();
    qblock.fillStyle(0xF59E0B);
    qblock.fillRect(860, H * 0.38, 32, 32);
    qblock.lineStyle(2, 0xFCD34D);
    qblock.strokeRect(860, H * 0.38, 32, 32);
    qblock.fillStyle(0xFF8C00);
    qblock.fillRect(862, H * 0.38 + 2, 28, 4);
    this.add.text(876, H * 0.38 + 8, '?', { fontSize: '18px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);

    // Grass tufts at ground level
    const tufts = this.add.graphics();
    tufts.lineStyle(2, 0x5DBB3F, 0.8);
    for (let x = 10; x < W; x += 25 + Math.random() * 20) {
      const h2 = 5 + Math.random() * 8;
      tufts.lineBetween(x, decoH, x - 3, decoH - h2);
      tufts.lineBetween(x, decoH, x + 3, decoH - h2);
    }
  }

  private dist(ax: number, ay: number, bx: number, by: number) {
    return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
  }

  update(time: number, delta: number) {
    this.animTime += delta / 1000;

    if (this.paused) return;

    const speed = 170;
    const vx = (this.cursors.right?.isDown || this.wasd.D.isDown ? 1 : 0) -
      (this.cursors.left?.isDown || this.wasd.A.isDown ? 1 : 0);
    const vy = (this.cursors.down?.isDown || this.wasd.S.isDown ? 1 : 0) -
      (this.cursors.up?.isDown || this.wasd.W.isDown ? 1 : 0);

    this.playerBody.setVelocity(vx * speed, vy * speed);
    if (vx !== 0 || vy !== 0) {
      this.playerBody.velocity.normalize().scale(speed);
    }

    if (vx !== 0) this.playerDirection = vx;

    // Re-draw animated player
    this.playerSprite.setScale(this.playerDirection < 0 ? -1 : 1, 1);
    this.drawPlayer(this.playerSprite, vx !== 0 || vy !== 0);

    const px = this.player.x;
    const py = this.player.y;

    // ── Animate checkpoint glow rings ──
    this.checkpointContainers.forEach((container, i) => {
      const cp = this.checkpoints[i];
      const outerGlow = container.getByName('outerGlow') as Phaser.GameObjects.Graphics | null;
      if (outerGlow) {
        const pulse = 0.3 + Math.sin(this.animTime * 3 + i) * 0.25;
        outerGlow.setAlpha(pulse);
        const scale = 1 + Math.sin(this.animTime * 2 + i) * 0.06;
        container.setScale(scale);
      }

      // Collision
      if (!cp.completed && this.dist(px, py, cp.x, cp.y) < cp.radius + 20) {
        this.paused = true;
        this.physics.pause();
        // Release keyboard so Monaco editor / quiz inputs receive all keystrokes
        this.input.keyboard!.disableGlobalCapture();
        this.spawnCoinBurst(cp.x, cp.y);
        eventBridge.emit(EVENTS.CHECKPOINT_REACHED, cp.id);
      }
    });

    // ── Animate/collect floating path coins ──
    this.coins = this.coins.filter(coin => {
      if (this.dist(px, py, coin.x, coin.y) < 28) {
        this.floatingCoins.push({
          obj: this.add.text(coin.x, coin.y, '🪙', { fontSize: '16px' }),
          vy: -2,
          life: 40,
        });
        coin.destroy();
        return false;
      }
      // bob animation
      coin.y += Math.sin(this.animTime * 4 + coin.x) * 0.4;
      return true;
    });

    // ── Update floating coin particles ──
    this.floatingCoins = this.floatingCoins.filter(fc => {
      fc.obj.y += fc.vy;
      fc.obj.setAlpha(fc.life / 40);
      fc.life--;
      if (fc.life <= 0) { fc.obj.destroy(); return false; }
      return true;
    });
  }

  private spawnCoinBurst(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const c = this.add.text(x, y, '✨', { fontSize: '18px' });
      const vx2 = Math.cos(angle) * 2;
      const vy = Math.sin(angle) * 2;
      let life = 30;
      const timer = this.time.addEvent({
        delay: 16, repeat: 30,
        callback: () => {
          c.x += vx2; c.y += vy;
          c.setAlpha(life / 30);
          life--;
          if (life <= 0) { c.destroy(); timer.remove(); }
        },
      });
    }
  }

  markCheckpointComplete(id: string) {
    const i = this.checkpoints.findIndex(c => c.id === id);
    if (i >= 0) {
      this.checkpoints[i].completed = true;
      this.buildCheckpoint(this.checkpointContainers[i], this.checkpoints[i], i);
    }
  }
}
