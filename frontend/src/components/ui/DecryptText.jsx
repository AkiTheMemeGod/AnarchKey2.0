import React, { useState, useEffect } from 'react';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

const DecryptText = ({ text, reveal = false }) => {
    const [display, setDisplay] = useState('');

    useEffect(() => {
        if (!reveal) {
            setDisplay('•'.repeat(24));
            return;
        }

        let iteration = 0;
        const interval = setInterval(() => {
            setDisplay(
                text
                    .split('')
                    .map((letter, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return characters[Math.floor(Math.random() * characters.length)];
                    })
                    .join('')
            );

            if (iteration >= text.length) {
                clearInterval(interval);
            }

            iteration += 1 / 2; // Speed of decryption
        }, 30);

        return () => clearInterval(interval);
    }, [text, reveal]);

    return <span style={{ fontFamily: 'monospace' }}>{display}</span>;
};

export default DecryptText;
