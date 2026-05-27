import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Zap, Globe, Rocket, Package, Box, Copy, ExternalLink, Check, ChevronDown, Terminal, Activity, Cpu, Layers, Lock, RefreshCw } from 'lucide-react';
import logo from '../../assets/logo.png';
import Button from '../../components/ui/Button';
import DecryptText from '../../components/ui/DecryptText';
import TerminalDemo from './TerminalDemo';
import styles from './LandingPage.module.css';

const LandingPage = () => {
    const [activeTab, setActiveTab] = useState('python');
    const [copiedBlock, setCopiedBlock] = useState(null);
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const usageRef = useRef(null);

    // Dynamic tactical logs state
    const [logs, setLogs] = useState([
        { id: Date.now() - 30000, type: 'info', text: 'KMS encryption layer operational. Ready for secrets.' },
        { id: Date.now() - 20000, type: 'info', text: 'Client payload wrapped with AES-256-GCM envelopment.' },
        { id: Date.now() - 10000, type: 'success', text: 'Daily key audit routine synced across sharding zones.' },
        { id: Date.now() - 5000, type: 'audit', text: 'Active Scanning: Zero hardcoded plaintext keys found.' }
    ]);
    const [metrics, setMetrics] = useState({
        activeKeys: 1408,
        latency: '1.2ms',
        load: '0.04%'
    });
    const [isDrilling, setIsDrilling] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (heroRef.current) {
                const scrolled = window.scrollY;
                const rate = scrolled * 0.5;
                const opacity = 1 - (scrolled / window.innerHeight);
                heroRef.current.style.transform = `translateY(${rate}px)`;
                heroRef.current.style.opacity = Math.max(0, opacity);
            }
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(styles.visible);
                }
            });
        }, { threshold: 0.1 });

        const sections = document.querySelectorAll(`.${styles.animateSection}`);
        sections.forEach(section => observer.observe(section));

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            sections.forEach(section => observer.unobserve(section));
        };
    }, []);

    // Periodic simulated security log ticks
    useEffect(() => {
        const mockLogTemplates = [
            { type: 'info', text: 'AES-256 wrapping triggered for key ID #__RAND__' },
            { type: 'success', text: 'KMS Core handshake successful. Signature authenticated.' },
            { type: 'audit', text: 'Scanning active repositories: 0 leakage threats found.' },
            { type: 'info', text: 'Re-validating sharding replication checksum values.' },
            { type: 'success', text: 'Synchronized temporary DEK wrapper to standby shard.' },
            { type: 'info', text: 'Garbage collecting stale authorization session logs.' }
        ];

        const logInterval = setInterval(() => {
            if (isDrilling) return;
            
            const template = mockLogTemplates[Math.floor(Math.random() * mockLogTemplates.length)];
            const randomId = Math.floor(100 + Math.random() * 899);
            const text = template.text.replace('__RAND__', randomId);
            
            setLogs(prev => {
                const updated = [...prev, { id: Date.now(), type: template.type, text }];
                return updated.slice(-5); // Maintain recent logs
            });
            
            setMetrics(prev => ({
                ...prev,
                latency: `${(1.1 + Math.random() * 0.4).toFixed(1)}ms`,
                activeKeys: prev.activeKeys + (Math.random() > 0.65 ? 1 : 0)
            }));
        }, 3500);

        return () => clearInterval(logInterval);
    }, [isDrilling]);

    // Manual rotative drill sequence routine
    const triggerRotationDrill = () => {
        if (isDrilling) return;
        setIsDrilling(true);
        
        const timestamp = Date.now();
        setLogs([
            { id: timestamp, type: 'drill', text: 'INITIATING SYSTEM ROTATION DRILL SEQUENCE...' }
        ]);

        const steps = [
            { delay: 600, log: { id: timestamp + 1, type: 'drill', text: 'Activating dynamic high-entropy PRNG channels...' } },
            { delay: 1300, log: { id: timestamp + 2, type: 'drill', text: 'Re-wrapping data encryption keys (DEKs) in hardware sharding...' } },
            { delay: 2000, log: { id: timestamp + 3, type: 'success', text: 'DRILL COMPLETED. Secure re-keying completed with zero downtime.' } }
        ];

        steps.forEach(step => {
            setTimeout(() => {
                setLogs(prev => [...prev, step.log].slice(-5));
            }, step.delay);
        });

        setTimeout(() => {
            setIsDrilling(false);
        }, 2600);
    };

    const copyCode = (code, blockId) => {
        navigator.clipboard.writeText(code);
        setCopiedBlock(blockId);
        setTimeout(() => setCopiedBlock(null), 2000);
    };

    const scrollToUsage = () => {
        document.getElementById('usage').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <div className={styles.logo}>
                        <img src={logo} alt="AnarchKey Logo" className={styles.logoImg} />
                        <span>AnarchKey</span>
                    </div>
                    <div className={styles.navActions}>
                        <Link to="/docs" className={styles.navLink}>Docs</Link>
                        <Link to="/login">
                            <Button>Login | Register</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <section className={styles.hero}>
                <div className={styles.heroBackground}></div>
                <div className={styles.gridBackground}></div>
                <div className={styles.heroContent} ref={heroRef}>
                    <h1 className={styles.heroTitle}>
                        <DecryptText text="The Last API Key Manager" reveal={true} />
                        <br />
                        <span className={styles.gradientText}>You'll Ever Need</span>
                    </h1>
                    <p className={styles.heroText}>
                        Stop compromising on security. AnarchKey provides military-grade encryption
                        for your API keys with zero compromise on usability.
                    </p>
                    <div className={styles.heroActions}>
                        <Link to="/register">
                            <Button size="lg" className={styles.primaryBtn}>Start Free Trial</Button>
                        </Link>
                        <Link to="/docs">
                            <Button size="lg" variant="secondary">View Documentation</Button>
                        </Link>
                    </div>
                </div>
                <div className={styles.scrollIndicator} onClick={scrollToUsage}>
                    <ChevronDown size={32} />
                </div>
            </section>

            <section className={`${styles.features} ${styles.animateSection}`} ref={featuresRef}>
                <div className={styles.featuresHeader}>
                    <h2><span className={styles.bracket}>[</span> CRYPTOGRAPHIC SYSTEM MONITOR <span className={styles.bracket}>]</span></h2>
                    <p>Real-time end-to-end data encryption and key rotative pipeline integrity checks.</p>
                </div>
                
                <div className={styles.industrialGrid}>
                    {/* LEFT PANEL: Tactical Logs Terminal */}
                    <div className={styles.terminalPanel}>
                        <div className={styles.terminalHeader}>
                            <div className={styles.terminalDots}>
                                <span className={styles.dotRed}></span>
                                <span className={styles.dotYellow}></span>
                                <span className={styles.dotGreen}></span>
                            </div>
                            <span className={styles.terminalTitle}>SECURE_LOGS://ANARCHKEY_PIPELINE</span>
                            <span className={styles.terminalBadge}>LIVE</span>
                        </div>
                        
                        <div className={styles.terminalBody}>
                            <div className={styles.logsStream}>
                                {logs.map(log => (
                                    <div key={log.id} className={`${styles.logRow} ${styles[log.type]}`}>
                                        <span className={styles.logTimestamp}>[{new Date(log.id).toLocaleTimeString()}]</span>
                                        <span className={styles.logSeverity}>[{log.type.toUpperCase()}]</span>
                                        <span className={styles.logText}>{log.text}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <button 
                                className={`${styles.drillBtn} ${isDrilling ? styles.drillActive : ''}`} 
                                onClick={triggerRotationDrill}
                                disabled={isDrilling}
                            >
                                <RefreshCw className={`${styles.drillIcon} ${isDrilling ? styles.spin : ''}`} size={14} />
                                {isDrilling ? 'RUNNING ROTATIVE DRILL...' : 'TRIGGER SECURITY ROTATION DRILL'}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Tactical Specs Table */}
                    <div className={styles.specsPanel}>
                        <div className={styles.specsHeader}>
                            <Activity className={styles.specsIcon} size={16} />
                            <span>SYSTEM SPECIFICATIONS & ARCHITECTURE</span>
                        </div>
                        
                        <div className={styles.specsGrid}>
                            <div className={styles.metricRow}>
                                <span className={styles.metricLabel}>ENCRYPTION STATE</span>
                                <span className={styles.metricValue}>AES-256-GCM (MILITARY-GRADE)</span>
                            </div>
                            <div className={styles.metricRow}>
                                <span className={styles.metricLabel}>ACTIVE ENCRYPTED KEYS</span>
                                <span className={styles.metricValue}>{metrics.activeKeys.toLocaleString()} SECRETS</span>
                            </div>
                            <div className={styles.metricRow}>
                                <span className={styles.metricLabel}>AVERAGE API LATENCY</span>
                                <span className={styles.metricValue}>{metrics.latency}</span>
                            </div>
                            <div className={styles.metricRow}>
                                <span className={styles.metricLabel}>KMS ZONE REDUNDANCY</span>
                                <span className={styles.metricValue}>TRIPLE ENVELOPE SHARDING</span>
                            </div>
                            <div className={styles.metricRow}>
                                <span className={styles.metricLabel}>HSM CORE HEARTBEAT</span>
                                <span className={styles.metricValue}>SOLID (OK)</span>
                            </div>
                        </div>

                        <div className={styles.blueprintFlow}>
                            <div className={styles.blueprintNode}>
                                <span className={styles.nodeNum}>01</span>
                                <h4>Transit Envelope Wrap</h4>
                                <p>Secrets are wrapped client-side with ephemeral wrappers prior to storage transport.</p>
                            </div>
                            <div className={styles.blueprintDivider}></div>
                            <div className={styles.blueprintNode}>
                                <span className={styles.nodeNum}>02</span>
                                <h4>KMS Envelope Shard</h4>
                                <p>Rotated keys are sharded into triple cryptographically safe redundancy zones.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="usage" className={`${styles.usageSection} ${styles.animateSection}`} ref={usageRef}>
                <div className={styles.sectionHeader}>
                    <h2>Developer Experience First</h2>
                    <p>Integrate in seconds, not hours.</p>
                </div>

                <div className={styles.demoContainer}>
                    <div className={styles.demoText}>
                        <h3>See it in action</h3>
                        <p>Watch how easy it is to initialize a project and retrieve your secrets securely.</p>

                        <div className={styles.demoTabs}>
                            <button
                                className={`${styles.demoTab} ${activeTab === 'python' ? styles.activeDemoTab : ''}`}
                                onClick={() => setActiveTab('python')}
                            >
                                <Package size={16} /> Python
                            </button>
                            <button
                                className={`${styles.demoTab} ${activeTab === 'nodejs' ? styles.activeDemoTab : ''}`}
                                onClick={() => setActiveTab('nodejs')}
                            >
                                <Box size={16} /> Node.js
                            </button>
                        </div>

                        <ul className={styles.demoList}>
                            <li><Check size={16} /> Install the client</li>
                            <li><Check size={16} /> Authenticate securely</li>
                            <li><Check size={16} /> Fetch secrets with one line</li>
                        </ul>
                    </div>
                    <div className={styles.demoTerminal}>
                        <TerminalDemo mode={activeTab === 'python' ? 'python' : 'node'} />
                    </div>
                </div>
            </section>

            <section className={`${styles.cta} ${styles.animateSection}`}>
                <div className={styles.ctaContent}>
                    <h2>Ready to Secure Your API Keys?</h2>
                    <p>Join thousands of developers who trust AnarchKey with their secrets.</p>
                    <Link to="/register">
                        <Button size="lg" className={styles.ctaBtn}>Get Started Now</Button>
                    </Link>
                </div>
            </section>

            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <p>© 2025 AnarchKey | All Rights Reserved | No API keys were harmed in the making of this product</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
