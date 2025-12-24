import React from 'react';
import { Shield, Lock, Activity } from 'lucide-react';
import logo from '../../assets/logo.png';
import styles from './AuthVisuals.module.css';

const AuthVisuals = () => {
    return (
        <div className={styles.container}>
            <div className={styles.visualContent}>
                <div className={styles.scanner}>
                    <div className={styles.scanLine}></div>
                </div>

                <div className={styles.centerPiece}>
                    <div className={styles.shieldWrapper}>
                        <img src={logo} alt="AnarchKey Logo" className={styles.centerLogo} />
                    </div>
                    <div className={styles.orbitRing}>
                        <div className={styles.orbiter}></div>
                    </div>
                    <div className={`${styles.orbitRing} ${styles.orbitRing2}`}>
                        <div className={styles.orbiter}></div>
                    </div>
                </div>

                <div className={styles.featuresContainer}>
                    <div className={styles.featureItem}>
                        <div className={styles.iconBox}>
                            <Shield size={20} />
                        </div>
                        <div className={styles.featureText}>
                            <span className={styles.featureTitle}>Zero-Knowledge</span>
                            <span className={styles.featureDesc}>We can't see your keys</span>
                        </div>
                    </div>
                    <div className={styles.featureItem}>
                        <div className={styles.iconBox}>
                            <Lock size={20} />
                        </div>
                        <div className={styles.featureText}>
                            <span className={styles.featureTitle}>AES-256-GCM</span>
                            <span className={styles.featureDesc}>Military-grade encryption</span>
                        </div>
                    </div>
                    <div className={styles.featureItem}>
                        <div className={styles.iconBox}>
                            <Activity size={20} />
                        </div>
                        <div className={styles.featureText}>
                            <span className={styles.featureTitle}>Audit Logging</span>
                            <span className={styles.featureDesc}>Track every access</span>
                        </div>
                    </div>
                </div>

                <div className={styles.gridOverlay}></div>
            </div>
        </div>
    );
};

export default AuthVisuals;
