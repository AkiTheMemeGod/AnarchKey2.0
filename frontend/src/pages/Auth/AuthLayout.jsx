import React from 'react';
import logo from '../../assets/logo.png';
import styles from './AuthLayout.module.css';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className={styles.container}>
            <div className={styles.heroBackground}></div>
            <div className={styles.gridBackground}></div>
            <div className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <img src={logo} alt="AnarchKey Logo" className={styles.logoImg} />
                    </div>
                    <h1 className={styles.title}>{title}</h1>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
