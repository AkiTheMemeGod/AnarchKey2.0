import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, RotateCcw } from 'lucide-react';
import styles from './TerminalDemo.module.css';

const pythonSteps = [
    { text: 'pip install AnarchKeyClient', output: 'Successfully installed AnarchKeyClient-1.0.0' },
    { text: 'anarchkey init', output: 'Initializing AnarchKey environment...\nAuthentication successful.' },
    { text: 'python app.py', output: 'Retrieving secrets from vault...\nConnected to database.\nServer running on port 8000.' }
];

const nodeSteps = [
    { text: 'npm install anarchkey-client', output: 'added 1 package, and audited 2 packages in 1s\nfound 0 vulnerabilities' },
    { text: 'anarchkey init', output: 'Initializing AnarchKey environment...\nAuthentication successful.' },
    { text: 'node app.js', output: 'Retrieving secrets from vault...\nConnected to database.\nServer running on port 3000.' }
];

const TerminalDemo = ({ mode = 'python' }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [text, setText] = useState('');
    const [output, setOutput] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showCursor, setShowCursor] = useState(true);

    const steps = mode === 'python' ? pythonSteps : nodeSteps;

    useEffect(() => {
        const interval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Reset when mode changes
    useEffect(() => {
        setCurrentStep(0);
        setText('');
        setOutput([]);
    }, [mode]);

    useEffect(() => {
        if (currentStep >= steps.length) return;

        const step = steps[currentStep];
        let charIndex = 0;
        setIsTyping(true);

        const typeInterval = setInterval(() => {
            if (charIndex <= step.text.length) {
                setText(step.text.substring(0, charIndex));
                charIndex++;
            } else {
                clearInterval(typeInterval);
                setIsTyping(false);
                setTimeout(() => {
                    setOutput(prev => [...prev, { command: step.text, result: step.output }]);
                    setText('');
                    setCurrentStep(prev => prev + 1);
                }, 500);
            }
        }, 50);

        return () => clearInterval(typeInterval);
    }, [currentStep, steps]); // Added steps dependency

    const handleReplay = () => {
        setCurrentStep(0);
        setText('');
        setOutput([]);
    };

    return (
        <div className={styles.terminalWindow}>
            <div className={styles.header}>
                <div className={styles.buttons}>
                    <span className={styles.dotRed}></span>
                    <span className={styles.dotYellow}></span>
                    <span className={styles.dotGreen}></span>
                </div>
                <div className={styles.title}>
                    <Terminal size={14} />
                    <span>developer@anarchkey:~/{mode === 'python' ? 'python-project' : 'node-project'}</span>
                </div>
                <button onClick={handleReplay} className={styles.replayBtn} title="Replay Demo">
                    <RotateCcw size={14} />
                </button>
            </div>
            <div className={styles.content}>
                {output.map((line, index) => (
                    <div key={index} className={styles.historyLine}>
                        <div className={styles.commandLine}>
                            <span className={styles.prompt}>$</span>
                            <span>{line.command}</span>
                        </div>
                        <div className={styles.output}>{line.result}</div>
                    </div>
                ))}
                {currentStep < steps.length && (
                    <div className={styles.currentLine}>
                        <span className={styles.prompt}>$</span>
                        <span>{text}</span>
                        <span className={`${styles.cursor} ${showCursor ? styles.visible : ''}`}>&nbsp;</span>
                    </div>
                )}
                {currentStep >= steps.length && (
                    <div className={styles.currentLine}>
                        <span className={styles.prompt}>$</span>
                        <span className={`${styles.cursor} ${showCursor ? styles.visible : ''}`}>&nbsp;</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TerminalDemo;
