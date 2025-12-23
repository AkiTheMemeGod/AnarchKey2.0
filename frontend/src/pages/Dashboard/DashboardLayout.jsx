import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, LogOut, BarChart2 } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import styles from './DashboardLayout.module.css';

const DashboardLayout = ({ children }) => {
    const { logout, user } = useAuth();
    const location = useLocation();

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <img src={logo} alt="AnarchKey Logo" className={styles.logoImg} />
                    <span className={styles.logoText}>AnarchKey</span>
                </div>

                <nav className={styles.nav}>
                    <Link
                        to="/dashboard"
                        className={`${styles.navItem} ${location.pathname === '/dashboard' ? styles.active : ''} `}
                    >
                        <LayoutGrid size={20} />
                        <span>Projects</span>
                    </Link>
                    <Link
                        to="/analytics"
                        className={`${styles.navItem} ${location.pathname === '/analytics' ? styles.active : ''} `}
                    >
                        <BarChart2 size={20} />
                        <span>Analytics</span>
                    </Link>
                </nav>

                <div className={styles.user}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.userDetails}>
                            <span className={styles.username}>{user?.username}</span>
                            <span className={styles.email}>{user?.email}</span>
                        </div>
                    </div>
                    <button onClick={logout} className={styles.logoutBtn} title="Sign out">
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
