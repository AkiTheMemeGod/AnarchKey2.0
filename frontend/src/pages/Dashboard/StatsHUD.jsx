import React from 'react';
import { LayoutGrid, Key, Activity } from 'lucide-react';
import styles from './StatsHUD.module.css';

const StatsHUD = ({ totalProjects, totalKeys, totalUsage }) => {
    return (
        <div className={styles.hudContainer}>
            <div className={styles.hudGlass}>
                {/* Decorative Lines */}
                <div className={styles.lineTop}></div>
                <div className={styles.lineBottom}></div>

                <div className={styles.statItem}>
                    <div className={styles.iconContainer}>
                        <div className={styles.iconRing}></div>
                        <LayoutGrid size={24} className={styles.icon} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.label}>Active Projects</span>
                        <div className={styles.valueWrapper}>
                            <span className={styles.value}>{totalProjects}</span>
                            <span className={styles.unit}>PROJ</span>
                        </div>
                    </div>
                    <div className={styles.cornerMark}></div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.statItem}>
                    <div className={styles.iconContainer}>
                        <div className={`${styles.iconRing} ${styles.ringDelay}`}></div>
                        <Key size={24} className={styles.icon} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.label}>Vaulted Keys</span>
                        <div className={styles.valueWrapper}>
                            <span className={styles.value}>{totalKeys}</span>
                            <span className={styles.unit}>KEYS</span>
                        </div>
                    </div>
                    <div className={styles.cornerMark}></div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.statItem}>
                    <div className={styles.iconContainer}>
                        <div className={`${styles.iconRing} ${styles.ringDelay2}`}></div>
                        <Activity size={24} className={styles.icon} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.label}>24h Activity</span>
                        <div className={styles.valueWrapper}>
                            <span className={styles.value}>{totalUsage}</span>
                            <span className={styles.unit}>OPS</span>
                        </div>
                    </div>
                    <div className={styles.cornerMark}></div>
                </div>
            </div>
        </div>
    );
};

export default StatsHUD;
