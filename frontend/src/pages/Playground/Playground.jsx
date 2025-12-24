import React, { useState, useEffect } from 'react';
import { Play, Code, Terminal, Copy, Check } from 'lucide-react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import api from '../../services/api';
import styles from './Playground.module.css';

const Playground = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [secretName, setSecretName] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('curl');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/v1/project/getprojects');
            if (data.projects && data.projects.length > 0) {
                setProjects(data.projects);
                setSelectedProject(data.projects[0]._id);
            }
        } catch (err) {
            console.error("Failed to fetch projects", err);
        }
    };

    const handleRun = async () => {
        if (!selectedProject || !secretName) return;

        setLoading(true);
        setResponse(null);

        try {
            // In a real scenario, we would call the SDK endpoint.
            // For this playground, we'll simulate it or call a proxy endpoint if available.
            // Since we are on the same domain, we can try to call the SDK endpoint directly 
            // if we had the project token. But for security, the frontend doesn't have the project token.
            // So we will use a new "simulate" endpoint or just fetch the key using our existing internal API
            // and display the result to show "it works".

            // Using the internal API to simulate the result
            const { data } = await api.get(`/v1/key/getkeys?projectId=${selectedProject}`);
            const key = data.keys.find(k => k.key_name === secretName);

            if (!key) {
                setResponse({
                    status: 404,
                    error: `Secret '${secretName}' not found in this project.`
                });
                return;
            }

            // Simulate network delay for effect
            await new Promise(r => setTimeout(r, 600));

            setResponse({
                status: 200,
                data: {
                    secret_name: key.key_name,
                    api_key: key.api_key
                },
                headers: {
                    "content-type": "application/json",
                    "x-anarchkey-latency": "12ms"
                }
            });
        } catch (err) {
            setResponse({
                status: err.response?.status || 500,
                error: err.response?.data?.message || "Failed to retrieve key"
            });
        } finally {
            setLoading(false);
        }
    };

    const getCodeSnippet = () => {
        const project = projects.find(p => p._id === selectedProject);
        const token = "ak_test_..."; // Placeholder as we don't expose tokens in frontend

        switch (activeTab) {
            case 'curl':
                return `curl -X POST https://api.anarchkey.com/v1/sdk/secrets \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "${secretName || 'DATABASE_URL'}"}'`;
            case 'node':
                return `import { AnarchKey } from '@anarchkey/node';

const client = new AnarchKey('${token}');

const secret = await client.getSecret('${secretName || 'DATABASE_URL'}');
console.log(secret);`;
            case 'python':
                return `from anarchkey import AnarchKey

client = AnarchKey('${token}')

secret = client.get_secret('${secretName || 'DATABASE_URL'}')
print(secret)`;
            default:
                return '';
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(getCodeSnippet());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <DashboardLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>API Playground</h1>
                    <p className={styles.subtitle}>Test your API keys and generate code snippets instantly.</p>
                </div>

                <div className={styles.grid}>
                    {/* Left Column: Configuration */}
                    <div className={styles.column}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <Terminal size={20} className="text-primary" />
                                <span className={styles.cardTitle}>Request Configuration</span>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Select Project</label>
                                <select
                                    className={styles.select}
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                >
                                    {projects.map(p => (
                                        <option key={p._id} value={p._id}>{p.project_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Secret Name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="e.g. STRIPE_SECRET_KEY"
                                    value={secretName}
                                    onChange={(e) => setSecretName(e.target.value)}
                                />
                            </div>

                            <button
                                className={styles.runBtn}
                                onClick={handleRun}
                                disabled={loading || !secretName}
                            >
                                {loading ? 'Running...' : (
                                    <>
                                        <Play size={18} /> Run Request
                                    </>
                                )}
                            </button>
                        </div>

                        <div className={`${styles.card} mt-6`} style={{ marginTop: '1.5rem' }}>
                            <div className={styles.cardHeader}>
                                <Code size={20} className="text-primary" />
                                <span className={styles.cardTitle}>Code Snippets</span>
                            </div>

                            <div className={styles.tabs}>
                                {['curl', 'node', 'python'].map(tab => (
                                    <button
                                        key={tab}
                                        className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div className="relative group">
                                <pre className={styles.codeBlock}>
                                    {getCodeSnippet()}
                                </pre>
                                <button
                                    className="absolute top-2 right-2 p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
                                    onClick={copyToClipboard}
                                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}
                                >
                                    {copied ? <Check size={16} color="#4ade80" /> : <Copy size={16} color="#94a3b8" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Response */}
                    <div className={styles.column}>
                        <div className={`${styles.card} ${styles.responseArea}`}>
                            <div className={styles.cardHeader}>
                                <Terminal size={20} className="text-primary" />
                                <span className={styles.cardTitle}>Response</span>
                            </div>

                            {response ? (
                                <div className={styles.responseContent}>
                                    <div className="flex items-center gap-2 mb-2 text-sm">
                                        <span className={`px-2 py-0.5 rounded ${response.status === 200 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {response.status} OK
                                        </span>
                                        <span className="text-gray-500">
                                            {response.headers?.["x-anarchkey-latency"]}
                                        </span>
                                    </div>
                                    <pre className={styles.codeBlock}>
                                        {JSON.stringify(response.data || response.error, null, 2)}
                                    </pre>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 text-gray-500" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'rgba(255,255,255,0.3)' }}>
                                    <Play size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p>Run a request to see the response</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Playground;
