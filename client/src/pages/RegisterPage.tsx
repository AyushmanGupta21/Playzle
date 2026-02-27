import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useGameStore } from '../store/gameStore';
import styles from './Auth.module.css';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setAuth } = useGameStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await api.post('/auth/register', { username, email, password });
            setAuth(res.data.token, { ...res.data.user, coins: 0, loadout: {} });
            navigate('/game');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authPage}>
            <div className={`${styles.authCard} animate-slide-up`}>
                <div className={styles.header}>
                    <div className={styles.icon}>🏰</div>
                    <h1 className={`${styles.title} pixel-font`}>CREATE HERO</h1>
                    <p className={styles.subtitle}>Begin your coding adventure</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>⚠️ {error}</div>}
                    <div className={styles.field}>
                        <label>Hero Name</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Heroic Username" required minLength={3} />
                    </div>
                    <div className={styles.field}>
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hero@playzle.gg" required />
                    </div>
                    <div className={styles.field}>
                        <label>Password (min 6 chars)</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px' }}>
                        {loading ? '⏳ Creating hero...' : '⚔️ Begin the Quest'}
                    </button>
                </form>

                <p className={styles.switchAuth}>
                    Already have a hero? <Link to="/login">Sign in →</Link>
                </p>
            </div>
        </div>
    );
}
