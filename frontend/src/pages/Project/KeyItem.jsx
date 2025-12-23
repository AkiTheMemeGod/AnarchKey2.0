import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Trash2, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import styles from './KeyItem.module.css';

const KeyItem = ({ keyData, onDelete }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(keyData.api_key);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this key? This action cannot be undone.')) {
            setIsDeleting(true);
            await onDelete(keyData._id);
            setIsDeleting(false);
        }
    };

    return (
        <div className={styles.item}>
            <div className={styles.info}>
                <h4 className={styles.name}>{keyData.key_name}</h4>
                <div className={styles.keyContainer}>
                    <code className={styles.key}>
                        {isRevealed ? keyData.api_key : '•'.repeat(24)}
                    </code>
                </div>
            </div>

            <div className={styles.actions}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsRevealed(!isRevealed)}
                    title={isRevealed ? "Hide secret" : "Reveal secret"}
                >
                    {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    title="Copy to clipboard"
                >
                    {isCopied ? <Check size={16} className={styles.success} /> : <Copy size={16} />}
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    isLoading={isDeleting}
                    className={styles.deleteBtn}
                    title="Delete key"
                >
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
    );
};

export default KeyItem;
