import React from 'react';
import styles from './Input.module.css';

const Input = ({ label, error, id, className = '', ...props }) => {
    return (
        <div className={`${styles.container} ${className}`}>
            {label && <label htmlFor={id} className={styles.label}>{label}</label>}
            <input
                id={id}
                className={`${styles.input} ${error ? styles.hasError : ''}`}
                {...props}
            />
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
};

export default Input;
