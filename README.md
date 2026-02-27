# ⚔️ Playzle — Gamified Coding Platform

A full-stack educational platform where you learn to code by playing a 2D RPG. Write real code to move your hero, pass challenges, earn coins, and compete on a global leaderboard.

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + TypeScript + Vite |
| Game Engine | Phaser 3 |
| Code Editor | Monaco Editor (VS Code engine) |
| JS Sandbox | Web Workers (5s auto-kill) |
| Python Sandbox | Pyodide (WebAssembly) |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL (ACID economy, JSONB loadouts) |
| Cache / Leaderboard | Redis Sorted Sets (O(log N) rankings) |
| Auth | JWT + bcrypt |

## 🚀 Getting Started

### 1. Start Infrastructure
```bash
cd server
docker compose up -d
```

### 2. Start Backend (port 3001)
```bash
cd server
npm install
npm run dev
```

### 3. Start Frontend (port 5173)
```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## 🎮 How It Works

1. **Register** your hero and enter the RPG world
2. **Navigate** with WASD / Arrow keys
3. **Walk into glowing checkpoints** → Monaco IDE opens
4. **Write code** (JavaScript or Python) and submit
5. **Pass the quiz** (70% threshold) → coins awarded
6. **Buy skins** in The Bazaar with your earned coins
7. **Compete** on the real-time Redis-powered leaderboard

## 📁 Project Structure

```
playzle/
├── client/          # Vite + React + TypeScript frontend
│   └── src/
│       ├── game/    # Phaser 3 scenes & EventBridge
│       ├── components/  # MonacoIDE, Quiz, Shop, Leaderboard
│       ├── pages/   # Route pages
│       ├── store/   # Zustand global state
│       └── workers/ # JS execution sandbox (Web Worker)
└── server/          # Node.js + Express backend
    ├── src/
    │   ├── routes/  # auth, economy, leaderboard, challenge
    │   ├── db/      # PostgreSQL pool
    │   └── redis/   # Redis client
    └── migrations/  # SQL schema (auto-applied via Docker)
```

## 🔐 Security

- **Server-side validation**: All code submissions are re-executed on the server using Node.js `vm` module
- **Idempotent purchases**: UUID idempotency keys prevent double-charging
- **ACID transactions**: Coin deductions use PostgreSQL transactions with `FOR UPDATE` row locking
- **Sandbox isolation**: JS runs in Web Workers (main thread never blocked), Python via Pyodide WASM
