import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Zap, Globe, Rocket, Package, Box, Copy, ExternalLink, Check, ChevronDown } from 'lucide-react';
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
                        <Button size="lg" variant="secondary" onClick={scrollToUsage}>View Documentation</Button>
                    </div>
                </div>
                <div className={styles.scrollIndicator} onClick={scrollToUsage}>
                    <ChevronDown size={32} />
                </div>
            </section>

            <section className={`${styles.features} ${styles.animateSection}`} ref={featuresRef}>
                <div className={styles.featuresGrid}>
                    <FeatureCard
                        icon={<Shield />}
                        title="End-to-End Encryption"
                        desc="We encrypt everything. If someone gets your API keys, it's because you personally handed them over."
                    />
                    <FeatureCard
                        icon={<AlertTriangle />}
                        title="No More Hardcoding"
                        desc="If you're still storing keys in your code, I have bad news: you're the security risk. Fix it."
                    />
                    <FeatureCard
                        icon={<Zap />}
                        title="Track & Rotate Keys"
                        desc="Stop guessing if your API keys are being used. Track usage, automate rotation, and sleep at night."
                    />
                    <FeatureCard
                        icon={<Globe />}
                        title="Decentralized Control"
                        desc="Your keys, your rules. No third-party nonsense. No lock-in. Just security."
                    />
                    <FeatureCard
                        icon={<Rocket />}
                        title="Blazing Fast API"
                        desc="Retrieve and manage keys faster than you can say 'data breach'."
                    />
                    <FeatureCard
                        icon={<Shield />}
                        title="Prevent Leaks"
                        desc="Tired of leaking keys? So is the internet. Use AnarchKey. Problem solved."
                    />
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

const FeatureCard = ({ icon, title, desc }) => (
    <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <h3>{title}</h3>
        <p>{desc}</p>
    </div>
);

export default LandingPage;
