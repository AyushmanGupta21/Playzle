import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useGameStore } from '../store/gameStore';
import styles from './Auth.module.css';

export default function LoginPage() {
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
            const res = await api.post('/auth/login', { email, password });
            setAuth(res.data.token, res.data.user);
            navigate('/game');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authPage}>
            <div className={`${styles.authCard} animate-slide-up`}>
                <div className={styles.header}>
                    <div className={styles.icon}>⚔️</div>
                    <h1 className={`${styles.title} pixel-font`}>ENTER THE REALM</h1>
                    <p className={styles.subtitle}>Sign in to continue your quest</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>⚠️ {error}</div>}
                    <div className={styles.field}>
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hero@playzle.gg" required />
                    </div>
                    <div className={styles.field}>
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px' }}>
                        {loading ? '⏳ Entering...' : '🚀 Enter the Realm'}
                    </button>
                </form>

                <p className={styles.switchAuth}>
                    New here? <Link to="/register">Create your hero →</Link>
                </p>
            </div>
        </div>
    );
}
