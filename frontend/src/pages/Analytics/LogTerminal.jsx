import React from 'react';
import styles from './LogTerminal.module.css';

const LogTerminal = ({ logs }) => {
    return (
        <div className={styles.terminal}>
            <div className={styles.header}>
                <div className={`${styles.dot} ${styles.red}`}></div>
                <div className={`${styles.dot} ${styles.yellow}`}></div>
                <div className={`${styles.dot} ${styles.green}`}></div>
                <span className={styles.title}>api-logs --watch</span>
            </div>
            <div className={styles.content}>
                {logs.length === 0 ? (
                    <div className={styles.empty}>No logs available...</div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className={styles.logEntry} style={{ animationDelay: `${index * 50}ms` }}>
                            <span className={styles.timestamp}>
                                [{new Date(log.timestamp).toLocaleTimeString()}]
                            </span>
                            <span className={styles.project}>
                                {log.projectId?.project_name || 'Unknown Project'}
                            </span>
                            <span>
                                Key <span className={styles.key}>{log.keyName}</span> accessed
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LogTerminal;
