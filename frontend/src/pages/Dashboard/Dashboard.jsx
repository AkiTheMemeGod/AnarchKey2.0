import React, { useState, useEffect } from 'react';
import { Plus, Copy, Check, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from './DashboardLayout';
import ProjectCard from './ProjectCard';
import StatsHUD from './StatsHUD';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [error, setError] = useState('');
    const [createdProject, setCreatedProject] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const [totalUsage, setTotalUsage] = useState(0);

    const fetchData = async () => {
        try {
            const [projectsRes, usageRes] = await Promise.all([
                api.get('/v1/project/getprojects'),
                api.get('/v1/key/usage')
            ]);

            setProjects(projectsRes.data.projects || []);

            const usageData = usageRes.data.usage || [];
            const total = usageData.reduce((acc, curr) => {
                // usageData is [{ name: "hour", key1: count, key2: count }, ...]
                // We need to sum all values that are numbers (excluding 'name')
                const hourTotal = Object.values(curr).reduce((sum, val) => {
                    return typeof val === 'number' ? sum + val : sum;
                }, 0);
                return acc + hourTotal;
            }, 0);
            setTotalUsage(total);

        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        setCreateLoading(true);
        setError('');

        try {
            const { data } = await api.post('/v1/project', { project_name: newProjectName });
            setCreatedProject(data.project);
            setNewProjectName('');
            fetchData(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create project');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCreatedProject(null);
        setNewProjectName('');
        setError('');
        setIsCopied(false);
    };

    const copyToClipboard = () => {
        if (createdProject?.access_key) {
            navigator.clipboard.writeText(createdProject.access_key);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <DashboardLayout>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Projects</h1>
                    <p className={styles.subtitle}>Manage your applications and secrets</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} />
                    New Project
                </Button>
            </div>

            <StatsHUD
                totalProjects={projects.length}
                totalKeys={projects.reduce((acc, curr) => acc + (curr.keys?.length || 0), 0)}
                totalUsage={totalUsage}
            />

            {loading ? (
                <div className={styles.loadingState}>
                    <Loader size={32} />
                </div>
            ) : projects.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No projects found. Create one to get started.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {projects.map((project) => (
                        <ProjectCard key={project._id} project={project} />
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={createdProject ? "Project Created Successfully" : "Create New Project"}
            >
                {createdProject ? (
                    <div className={styles.successState}>
                        <div className={styles.warningBox}>
                            <AlertTriangle size={20} className={styles.warningIcon} />
                            <p>This is the only time you will see this access key. Please copy it and store it securely.</p>
                        </div>

                        <div className={styles.keyDisplay}>
                            <label>Access Key</label>
                            <div className={styles.keyBox}>
                                <code>{createdProject.access_key}</code>
                                <button onClick={copyToClipboard} className={styles.copyBtn}>
                                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <Button onClick={handleCloseModal} className={styles.fullWidthBtn}>
                                I have copied the key
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleCreateProject} className={styles.form}>
                        {error && <div className={styles.error}>{error}</div>}
                        <Input
                            label="Project Name"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            placeholder="e.g. Production App"
                            autoFocus
                            required
                        />
                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleCloseModal}
                                disabled={createLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={createLoading}>
                                Create Project
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </DashboardLayout>
    );
};

export default Dashboard;
