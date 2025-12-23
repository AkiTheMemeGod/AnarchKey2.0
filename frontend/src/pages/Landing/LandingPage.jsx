import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Zap, Globe, Rocket, Package, Box, Copy, ExternalLink, Check } from 'lucide-react';
import logo from '../../assets/logo.png';
import Button from '../../components/ui/Button';
import DecryptText from '../../components/ui/DecryptText';
import styles from './LandingPage.module.css';

const LandingPage = () => {
    const [activeTab, setActiveTab] = useState('python');
    const [copiedBlock, setCopiedBlock] = useState(null);
    const heroRef = useRef(null);

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

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
                        You'll Ever Need
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
            </section>

            <section className={styles.features}>
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

            <section id="usage" className={styles.usageSection}>
                <div className={styles.sectionHeader}>
                    <h2>How to Use AnarchKey</h2>
                    <p>Get started in minutes with our Python or Node.js client libraries</p>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'python' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('python')}
                    >
                        <Package size={20} /> Python (PyPI)
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'nodejs' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('nodejs')}
                    >
                        <Box size={20} /> Node.js (npm)
                    </button>
                </div>

                <div className={styles.tabContent}>
                    {activeTab === 'python' ? (
                        <div className={styles.usageGrid}>
                            <UsageCard step="1" title="Install the Package">
                                <p>Install AnarchKeyClient via pip:</p>
                                <CodeBlock
                                    code="pip install AnarchKeyClient"
                                    onCopy={() => copyCode("pip install AnarchKeyClient", "py1")}
                                    isCopied={copiedBlock === "py1"}
                                />
                            </UsageCard>
                            <UsageCard step="2" title="Create Account">
                                <p>Sign up for a free account:</p>
                                <div className={styles.highlightBox}>
                                    <h4><ExternalLink size={18} /> Registration</h4>
                                    <p>Visit <Link to="/register" className={styles.link}>AnarchKey</Link> to create your account.</p>
                                </div>
                            </UsageCard>
                            <UsageCard step="3" title="Initialize Client">
                                <p>Set up your local authentication token:</p>
                                <CodeBlock
                                    code="anarchkey init --username <YourUsername> --password <YourPassword>"
                                    onCopy={() => copyCode("anarchkey init ...", "py3")}
                                    isCopied={copiedBlock === "py3"}
                                />
                            </UsageCard>
                            <UsageCard step="4" title="Use in Your Code">
                                <p>Retrieve your API keys securely:</p>
                                <CodeBlock
                                    code={`from AnarchKeyClient import AnarchKeyClient

# Initialize the client
client = AnarchKeyClient(
    username="YourUsername",
    api_key="YourAnarchKeyAPIKey"
)

# Retrieve an API key for your project
response = client.get_api_key(project_name="YourProjectName")`}
                                    onCopy={() => copyCode("python code...", "py4")}
                                    isCopied={copiedBlock === "py4"}
                                />
                            </UsageCard>
                        </div>
                    ) : (
                        <div className={styles.usageGrid}>
                            <UsageCard step="1" title="Install the Package">
                                <p>Install globally via npm:</p>
                                <CodeBlock
                                    code="npm install anarchkey-client -g"
                                    onCopy={() => copyCode("npm install ...", "node1")}
                                    isCopied={copiedBlock === "node1"}
                                />
                            </UsageCard>
                            <UsageCard step="2" title="Create Account">
                                <p>Sign up for a free account:</p>
                                <div className={styles.highlightBox}>
                                    <h4><ExternalLink size={18} /> Registration</h4>
                                    <p>Visit <Link to="/register" className={styles.link}>AnarchKey</Link> to create your account.</p>
                                </div>
                            </UsageCard>
                            <UsageCard step="3" title="Initialize via CLI">
                                <p>Set up your local authentication token:</p>
                                <CodeBlock
                                    code="anarchkey init --username YourName --password YourPassword"
                                    onCopy={() => copyCode("anarchkey init ...", "node3")}
                                    isCopied={copiedBlock === "node3"}
                                />
                            </UsageCard>
                            <UsageCard step="4" title="Use in Your Code">
                                <p>Retrieve your API keys securely:</p>
                                <CodeBlock
                                    code={`const AnarchKeyClient = require('anarchkey-client');

(async () => {
  const client = new AnarchKeyClient({
    apiKey: 'myapikey',
    username: 'me'
  });

  const result = await client.getApiKey('myproject');
  console.log('result:', result);
})();`}
                                    onCopy={() => copyCode("node code...", "node4")}
                                    isCopied={copiedBlock === "node4"}
                                />
                            </UsageCard>
                        </div>
                    )}
                </div>
            </section>

            <section className={styles.cta}>
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

const UsageCard = ({ step, title, children }) => (
    <div className={styles.usageCard}>
        <h3><span className={styles.stepNumber}>{step}</span> {title}</h3>
        {children}
    </div>
);

const CodeBlock = ({ code, onCopy, isCopied }) => (
    <div className={styles.codeBlock}>
        <button className={styles.copyBtn} onClick={onCopy}>
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
            {isCopied ? 'Copied!' : 'Copy'}
        </button>
        <pre>{code}</pre>
    </div>
);

export default LandingPage;
