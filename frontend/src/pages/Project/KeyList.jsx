import React from 'react';
import KeyItem from './KeyItem';
import styles from './KeyList.module.css';

const KeyList = ({ keys, onDelete }) => {
    if (!keys || keys.length === 0) {
        return (
            <div className={styles.empty}>
                <p>No secrets found in this project.</p>
            </div>
        );
    }

    return (
        <div className={styles.list}>
            {keys.map((key) => (
                <KeyItem key={key._id} keyData={key} onDelete={onDelete} />
            ))}
        </div>
    );
};

export default KeyList;
