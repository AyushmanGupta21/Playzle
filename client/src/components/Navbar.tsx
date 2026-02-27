import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { user, logout } = useGameStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className={styles.navbar}>
            <Link to="/" className={styles.logo}>
                <span className={styles.logoIcon}>⚔️</span>
                <span className={`${styles.logoText} pixel-font`}>PLAYZLE</span>
            </Link>

            <div className={styles.links}>
                {user && (
                    <>
                        <Link to="/game" className={`${styles.link} ${isActive('/game') ? styles.active : ''}`}>
                            🗺️ Game
                        </Link>
                        <Link to="/shop" className={`${styles.link} ${isActive('/shop') ? styles.active : ''}`}>
                            🛍️ Shop
                        </Link>
                        <Link to="/leaderboard" className={`${styles.link} ${isActive('/leaderboard') ? styles.active : ''}`}>
                            🏆 Leaderboard
                        </Link>
                    </>
                )}
            </div>

            <div className={styles.right}>
                {user ? (
                    <>
                        <span className="coin-badge">🪙 {user.coins.toLocaleString()}</span>
                        <div className={styles.userMenu}>
                            <span className={styles.username}>👤 {user.username}</span>
                            <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
                        </div>
                    </>
                ) : (
                    <div className={styles.authButtons}>
                        <Link to="/login" className="btn btn-secondary">Login</Link>
                        <Link to="/register" className="btn btn-primary">Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
