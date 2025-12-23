import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Loader.module.css';

const Loader = ({ fullScreen = false, size = 24, className = '' }) => {
    if (fullScreen) {
        return (
            <div className={styles.fullScreen}>
                <Loader2 className={styles.spinner} size={size} />
            </div>
        );
    }

    return <Loader2 className={`${styles.spinner} ${className}`} size={size} />;
};

export default Loader;
