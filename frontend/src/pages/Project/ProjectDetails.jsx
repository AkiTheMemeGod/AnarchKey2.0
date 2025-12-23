import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../Dashboard/DashboardLayout';
import KeyList from './KeyList';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import styles from './ProjectDetails.module.css';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newApiKey, setNewApiKey] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [error, setError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchProject = async () => {
        try {
            // The backend endpoint is /v1/key/getkeys?projectId=ID
            // It returns { projectId, project_name, keys: [] }
            const { data } = await api.get(`/v1/key/getkeys?projectId=${id}`);
            setProject(data);
        } catch (err) {
            console.error("Failed to fetch project", err);
            setError("Failed to load project details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    const handleCreateKey = async (e) => {
        e.preventDefault();
        if (!newKeyName.trim() || !newApiKey.trim()) return;

        setCreateLoading(true);
        setError('');

        try {
            await api.post('/v1/key', {
                projectId: id,
                key_name: newKeyName,
                api_key: newApiKey
            });
            setNewKeyName('');
            setNewApiKey('');
            setIsModalOpen(false);
            fetchProject();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create key');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteKey = async (keyId) => {
        try {
            await api.delete(`/v1/key/${keyId}`);
            fetchProject();
        } catch (err) {
            console.error("Failed to delete key", err);
            alert("Failed to delete key");
        }
    };

    const handleDeleteProject = async () => {
        if (window.confirm('Are you sure you want to delete this ENTIRE project? All secrets will be lost forever.')) {
            setDeleteLoading(true);
            try {
                await api.delete(`/v1/project/${id}`);
                navigate('/dashboard');
            } catch (err) {
                console.error("Failed to delete project", err);
                alert("Failed to delete project");
                setDeleteLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className={styles.loading}>
                    <Loader size={32} />
                </div>
            </DashboardLayout>
        );
    }

    if (!project) {
        return (
            <DashboardLayout>
                <div className={styles.error}>
                    <p>Project not found or access denied.</p>
                    <Button onClick={() => navigate('/dashboard')} variant="secondary">Go Back</Button>
                </div>
            </DashboardLayout >
        );
    }

    return (
        <DashboardLayout>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className={styles.backBtn}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className={styles.title}>{project.project_name}</h1>
                        <p className={styles.subtitle}>ID: {project.projectId}</p>
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <Button
                        variant="ghost"
                        className={styles.deleteProjectBtn}
                        onClick={handleDeleteProject}
                        isLoading={deleteLoading}
                    >
                        <Trash2 size={18} />
                        Delete Project
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Add Secret
                    </Button>
                </div>
            </div>

            <div className={styles.content}>
                <h2 className={styles.sectionTitle}>Secrets</h2>
                <KeyList keys={project.keys} onDelete={handleDeleteKey} />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Secret"
            >
                <form onSubmit={handleCreateKey} className={styles.form}>
                    {error && <div className={styles.errorAlert}>{error}</div>}

                    <Input
                        label="Key Name"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g. STRIPE_SECRET_KEY"
                        autoFocus
                        required
                    />

                    <Input
                        label="Value"
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        placeholder="sk_test_..."
                        required
                        type="text" // Or password if we want to mask input, but usually for setting secrets you want to see what you paste
                    />

                    <div className={styles.modalActions}>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsModalOpen(false)}
                            disabled={createLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={createLoading}>
                            Save Secret
                        </Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default ProjectDetails;
