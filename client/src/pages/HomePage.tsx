import { Link } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import styles from './HomePage.module.css';

const FEATURES = [
    { icon: '🗺️', title: 'RPG World', desc: 'Navigate a 2D realm powered by Phaser 3. Explore, discover checkpoints, and encounter narrative-driven challenges.' },
    { icon: '💻', title: 'Embedded IDE', desc: 'Write real JavaScript or Python code inside the game using Monaco Editor — the same engine that powers VS Code.' },
    { icon: '🛡️', title: 'Secure Sandbox', desc: 'Code runs in an isolated Web Worker (JS) or Pyodide WASM (Python) with auto-kill on infinite loops.' },
    { icon: '🧠', title: 'Quiz Engine', desc: 'After each code challenge, test your theoretical knowledge. Pass 70% to unlock the next area.' },
    { icon: '🪙', title: 'Virtual Economy', desc: 'Earn coins by clearing levels. Spend them in the Bazaar to unlock legendary hero skins.' },
    { icon: '🏆', title: 'Leaderboard', desc: 'Compete globally. Rankings are powered by Redis Sorted Sets for O(log N) real-time performance.' },
];

export default function HomePage() {
    const { user } = useGameStore();

    return (
        <div className={styles.page}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroBg} />
                <div className={styles.heroContent}>
                    <div className={styles.badge}>🎮 Gamified Learning Platform</div>
                    <h1 className={`${styles.heroTitle} pixel-font`}>PLAYZLE</h1>
                    <p className={styles.heroSubtitle}>
                        Learn to code by playing an RPG. Write real code to move your hero,{' '}
                        <br className={styles.desktopBreak} />
                        pass challenges, earn coins, and conquer the leaderboard.
                    </p>
                    <div className={styles.heroCta}>
                        {user ? (
                            <Link to="/game" className="btn btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}>
                                🚀 Continue Quest
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}>
                                    ⚔️ Start Your Quest
                                </Link>
                                <Link to="/login" className="btn btn-secondary" style={{ fontSize: '16px', padding: '14px 28px' }}>
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                    <div className={styles.heroStats}>
                        <div className={styles.stat}><span className={styles.statVal}>3</span><span className={styles.statLabel}>Levels</span></div>
                        <div className={styles.statDivider} />
                        <div className={styles.stat}><span className={styles.statVal}>JS+Py</span><span className={styles.statLabel}>Languages</span></div>
                        <div className={styles.statDivider} />
                        <div className={styles.stat}><span className={styles.statVal}>6</span><span className={styles.statLabel}>Skins</span></div>
                    </div>
                </div>
                {/* Floating emoji decorations */}
                <div className={styles.floatingEmojis}>
                    {['⚔️', '🧙', '🪙', '🏆', '💻', '🐍'].map((e, i) => (
                        <span key={i} className={styles.floatingEmoji} style={{ animationDelay: `${i * 0.5}s` }}>{e}</span>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className={styles.howItWorks}>
                <h2 className={styles.sectionTitle}>How It Works</h2>
                <div className={styles.steps}>
                    {[
                        { num: '01', title: 'Enter the RPG World', desc: 'Navigate your hero across a 2D map using WASD or arrow keys.' },
                        { num: '02', title: 'Reach a Checkpoint', desc: 'Walk into a glowing zone. The game pauses and the IDE opens.' },
                        { num: '03', title: 'Write & Submit Code', desc: 'Solve the coding challenge. Your code is validated securely.' },
                        { num: '04', title: 'Pass the Quiz', desc: 'Answer MCQ questions (70% threshold) to prove your knowledge.' },
                        { num: '05', title: 'Earn Coins & Progress', desc: 'Coins are awarded via an ACID-safe transaction. Level unlocks.' },
                        { num: '06', title: 'Customize & Compete', desc: 'Buy skins in the Bazaar and climb the Redis-powered leaderboard.' },
                    ].map((step) => (
                        <div key={step.num} className={styles.step}>
                            <span className={`${styles.stepNum} pixel-font`}>{step.num}</span>
                            <h3>{step.title}</h3>
                            <p>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className={styles.features}>
                <h2 className={styles.sectionTitle}>Platform Features</h2>
                <div className={styles.featureGrid}>
                    {FEATURES.map((f) => (
                        <div key={f.title} className={`${styles.featureCard} card`}>
                            <div className={styles.featureIcon}>{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            {!user && (
                <section className={styles.cta}>
                    <h2 className={`${styles.ctaTitle} pixel-font`}>READY TO PLAY?</h2>
                    <Link to="/register" className="btn btn-primary" style={{ fontSize: '18px', padding: '16px 48px' }}>
                        ⚔️ Create Your Hero
                    </Link>
                </section>
            )}
        </div>
    );
}
