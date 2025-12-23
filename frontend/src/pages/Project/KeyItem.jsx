import React, { useState } from 'react';
import { Copy, Trash2, Lock, Unlock, Key } from 'lucide-react';
import Button from '../../components/ui/Button';
import DecryptText from '../../components/ui/DecryptText';
import styles from './KeyItem.module.css';

const KeyItem = ({ keyData, onDelete }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCopy = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(keyData.api_key);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this key? This action cannot be undone.')) {
            setIsDeleting(true);
            await onDelete(keyData._id);
            setIsDeleting(false);
        }
    };

    return (
        <div className={styles.scene}>
            <div className={`${styles.card} ${isFlipped ? styles.isFlipped : ''}`} onClick={() => setIsFlipped(!isFlipped)}>

                {/* FRONT FACE */}
                <div className={styles.cardFace + ' ' + styles.cardFront}>
                    <div className={styles.iconWrapper}>
                        <Lock size={24} />
                    </div>
                    <h3 className={styles.title}>{keyData.key_name}</h3>
                    <div className={styles.hint}>Click to Reveal</div>
                    <div className={styles.cornerDecoration}></div>
                </div>

                {/* BACK FACE */}
                <div className={styles.cardFace + ' ' + styles.cardBack}>
                    <div className={styles.header}>
                        <div className={styles.iconWrapperSmall}>
                            <Unlock size={16} />
                        </div>
                        <span className={styles.label}>SECRET KEY</span>
                    </div>

                    <div className={styles.secretDisplay}>
                        <DecryptText text={keyData.api_key} reveal={isFlipped} />
                    </div>

                    <div className={styles.actions}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className={isCopied ? styles.successBtn : ''}
                        >
                            {isCopied ? 'Copied!' : <Copy size={16} />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            isLoading={isDeleting}
                            className={styles.deleteBtn}
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default KeyItem;
