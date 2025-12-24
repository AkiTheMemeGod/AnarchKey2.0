import React from 'react';
import logo from '../../assets/logo.png';
import AuthVisuals from './AuthVisuals';
import styles from './AuthLayout.module.css';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className={styles.container}>
            <div className={styles.leftPanel}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <img src={logo} alt="AnarchKey Logo" className={styles.logoImg} />
                        <span>AnarchKey</span>
                    </div>
                </div>

                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <h1 className={styles.title}>{title}</h1>
                        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                    </div>
                    {children}
                </div>

                <div className={styles.footer}>
                    <p>© 2025 AnarchKey Security</p>
                </div>
            </div>

            <div className={styles.rightPanel}>
                <AuthVisuals />
            </div>
        </div>
    );
};

export default AuthLayout;
