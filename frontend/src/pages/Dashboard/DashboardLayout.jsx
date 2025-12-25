import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, LogOut, BarChart2, Terminal, Menu, X } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import styles from './DashboardLayout.module.css';

const DashboardLayout = ({ children }) => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className={styles.container}>
            {/* Mobile Header */}
            <div className={styles.mobileHeader}>
                <div className={styles.mobileLogo}>
                    <img src={logo} alt="AnarchKey" className={styles.mobileLogoImg} />
                    <span className={styles.mobileLogoText}>AnarchKey</span>
                </div>
                <button className={styles.menuBtn} onClick={toggleSidebar}>
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Overlay */}
            {isSidebarOpen && (
                <div className={styles.overlay} onClick={closeSidebar}></div>
            )}

            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
                <div className={styles.logo}>
                    <img src={logo} alt="AnarchKey Logo" className={styles.logoImg} />
                    <span className={styles.logoText}>AnarchKey</span>
                </div>

                <nav className={styles.nav}>
                    <Link
                        to="/dashboard"
                        className={`${styles.navItem} ${location.pathname === '/dashboard' ? styles.active : ''} `}
                        onClick={closeSidebar}
                    >
                        <LayoutGrid size={20} />
                        <span>Projects</span>
                    </Link>
                    <Link
                        to="/analytics"
                        className={`${styles.navItem} ${location.pathname === '/analytics' ? styles.active : ''} `}
                        onClick={closeSidebar}
                    >
                        <BarChart2 size={20} />
                        <span>Analytics</span>
                    </Link>
                    <Link
                        to="/playground"
                        className={`${styles.navItem} ${location.pathname === '/playground' ? styles.active : ''} `}
                        onClick={closeSidebar}
                    >
                        <Terminal size={20} />
                        <span>Playground</span>
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
