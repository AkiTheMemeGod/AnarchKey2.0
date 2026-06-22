import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Trash2, FileUp, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../Dashboard/DashboardLayout';
import KeyList from './KeyList';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { parseEnv } from '../../utils/parseEnv';
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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Import-from-.env state
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importFileName, setImportFileName] = useState('');
    const [importText, setImportText] = useState('');
    const [importRows, setImportRows] = useState([]); // [{ key_name, api_key, include, duplicate, isDuplicate }]
    const [importError, setImportError] = useState('');
    const [importLoading, setImportLoading] = useState(false);
    const [importSummary, setImportSummary] = useState(null); // { imported, overwritten, skipped, errors }
    const [revealedRowIdx, setRevealedRowIdx] = useState(null);
    const fileInputRef = useRef(null);

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

    const handleDeleteProjectClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDeleteProject = async () => {
        setDeleteLoading(true);
        try {
            await api.delete(`/v1/project/${id}`);
            navigate('/dashboard');
        } catch (err) {
            console.error("Failed to delete project", err);
            alert("Failed to delete project");
            setDeleteLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    // ---- Import from .env ------------------------------------------------

    const openImportModal = () => {
        setIsImportOpen(true);
        setImportFileName('');
        setImportText('');
        setImportRows([]);
        setImportError('');
        setImportSummary(null);
        setRevealedRowIdx(null);
    };

    const closeImportModal = () => {
        if (importLoading) return;
        setIsImportOpen(false);
    };

    const handleFile = async (file) => {
        if (!file) return;
        setImportFileName(file.name);
        try {
            const text = await file.text();
            setImportText(text);
            runParse(text);
        } catch (err) {
            setImportError(`Could not read file: ${err.message || 'unknown error'}`);
        }
    };

    const handleTextChange = (text) => {
        setImportText(text);
        // Re-parse live so the user sees the table update as they edit
        runParse(text);
    };

    // Compute a rows array with conflict metadata, based on the project's
    // current keys. Used both when the user pastes/types and when the project
    // list refreshes after a save.
    const computeRows = (parsed) => {
        const existingNames = new Set((project?.keys || []).map(k => k.key_name));
        return parsed.map((p) => {
            const isDuplicate = existingNames.has(p.key_name);
            return {
                key_name: p.key_name,
                api_key: p.api_key,
                include: true,
                duplicate: isDuplicate ? 'skip' : 'add',
                isDuplicate,
            };
        });
    };

    const runParse = (text) => {
        setImportError('');
        setImportSummary(null);
        if (!text.trim()) {
            setImportRows([]);
            return;
        }
        try {
            const parsed = parseEnv(text);
            setImportRows(computeRows(parsed));
        } catch (err) {
            setImportError(err.message || 'Failed to parse .env contents');
            setImportRows([]);
        }
    };

    const toggleRowInclude = (idx) => {
        setImportRows((rows) => rows.map((r, i) => i === idx ? { ...r, include: !r.include } : r));
    };

    const setRowDuplicate = (idx, duplicate) => {
        setImportRows((rows) => rows.map((r, i) => i === idx ? { ...r, duplicate } : r));
    };

    const importStats = useMemo(() => {
        const total = importRows.length;
        const duplicates = importRows.filter(r => r.isDuplicate).length;
        const included = importRows.filter(r => r.include);
        const toAdd = included.filter(r => !r.isDuplicate).length;
        const toOverwrite = included.filter(r => r.isDuplicate && r.duplicate === 'overwrite').length;
        const toSkip = included.filter(r => r.isDuplicate && r.duplicate === 'skip').length;
        return { total, duplicates, toAdd, toOverwrite, toSkip, includedCount: included.length };
    }, [importRows]);

    const handleImportSubmit = async () => {
        if (importLoading) return;
        const items = importRows
            .filter(r => r.include)
            .map(r => ({
                key_name: r.key_name,
                api_key: r.api_key,
                duplicate: r.isDuplicate ? r.duplicate : 'add',
            }));
        if (items.length === 0) {
            setImportError('Select at least one row to import.');
            return;
        }
        setImportLoading(true);
        setImportError('');
        setImportSummary(null);
        try {
            const { data } = await api.post('/v1/key/bulk', { projectId: id, items });
            setImportSummary({
                imported: data.imported ?? 0,
                overwritten: data.overwritten ?? 0,
                skipped: data.skipped ?? 0,
                errors: data.errors || [],
            });
            // Refresh project, but keep the modal open so the user sees the summary.
            await fetchProject();
            // Recompute duplicates now that the project list is fresh
            setImportRows((rows) => computeRows(
                rows.filter(r => r.include).map(r => ({ key_name: r.key_name, api_key: r.api_key }))
            ));
        } catch (err) {
            setImportError(err.response?.data?.message || 'Failed to import secrets');
        } finally {
            setImportLoading(false);
        }
    };

    const handleChooseFileClick = () => {
        fileInputRef.current?.click();
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
                        onClick={handleDeleteProjectClick}
                        isLoading={deleteLoading}
                    >
                        <Trash2 size={18} />
                        Delete Project
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={openImportModal}
                        data-testid="import-env-btn"
                    >
                        <FileUp size={18} />
                        Import from .env
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

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDeleteProject}
                title="Delete Project"
                message={`Are you sure you want to delete the project "${project.project_name}"? This will permanently delete all secrets associated with it. This action cannot be undone.`}
                confirmText="Delete Project"
                isDangerous={true}
                isLoading={deleteLoading}
            />

            <Modal
                isOpen={isImportOpen}
                onClose={closeImportModal}
                title="Import secrets from .env"
            >
                <div className={styles.importBody}>
                    {importError && <div className={styles.errorAlert}>{importError}</div>}

                    {importSummary && (
                        <div className={styles.importSummary} role="status">
                            {importSummary.errors.length > 0 ? '⚠ ' : '✓ '}
                            {importSummary.imported} imported
                            {importSummary.overwritten > 0 && `, ${importSummary.overwritten} overwritten`}
                            {importSummary.skipped > 0 && `, ${importSummary.skipped} skipped`}
                            {importSummary.errors.length > 0 && `, ${importSummary.errors.length} error(s)`}
                        </div>
                    )}

                    <div className={styles.importHeader}>
                        <div className={styles.importHeaderText}>
                            <strong>Drop a .env file</strong> or paste its contents below.
                            <div className={styles.importHeaderHint}>
                                Comments (#) and blank lines are ignored. Quoted values are unquoted.
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={handleChooseFileClick}
                        >
                            Choose file
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".env,.env.*,text/plain"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFile(e.target.files?.[0])}
                        />
                    </div>

                    {importFileName && (
                        <div className={styles.fileName}>
                            Loaded: <code>{importFileName}</code>
                        </div>
                    )}

                    <textarea
                        className={styles.importTextarea}
                        rows={8}
                        spellCheck={false}
                        value={importText}
                        onChange={(e) => handleTextChange(e.target.value)}
                        placeholder={'# Example.env\nSTRIPE_SECRET_KEY=sk_test_...\nDB_URL="postgres://user:pass@host:5432/db"\nexport JWT_SECRET=changeme'}
                    />

                    {importRows.length > 0 && (
                        <div className={styles.previewWrap}>
                            <div className={styles.previewHeader}>
                                <span>Preview</span>
                                <span className={styles.previewCount}>
                                    {importStats.total} parsed · {importStats.duplicates} duplicate
                                    {importStats.duplicates === 1 ? '' : 's'} · {importStats.includedCount} selected
                                </span>
                            </div>
                            <div className={styles.previewList}>
                                {importRows.map((row, idx) => {
                                    const isRevealed = revealedRowIdx === idx;
                                    return (
                                        <div
                                            key={`${row.key_name}-${idx}`}
                                            className={`${styles.previewRow} ${row.isDuplicate ? styles.previewRowDuplicate : ''}`}
                                        >
                                            <label className={styles.previewInclude}>
                                                <input
                                                    type="checkbox"
                                                    checked={row.include}
                                                    onChange={() => toggleRowInclude(idx)}
                                                />
                                            </label>
                                            <div className={styles.previewKey} title={row.key_name}>
                                                {row.key_name}
                                                {row.isDuplicate && (
                                                    <span className={styles.duplicateTag}>duplicate</span>
                                                )}
                                            </div>
                                            <div className={styles.previewValue}>
                                                <code>
                                                    {isRevealed
                                                        ? row.api_key
                                                        : '•'.repeat(Math.min(row.api_key.length, 16))}
                                                </code>
                                                <button
                                                    type="button"
                                                    className={styles.revealBtn}
                                                    onClick={() => setRevealedRowIdx(isRevealed ? null : idx)}
                                                    aria-label={isRevealed ? 'Hide value' : 'Show value'}
                                                >
                                                    {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                            <div className={styles.previewDupControl}>
                                                {row.isDuplicate ? (
                                                    <select
                                                        className={styles.duplicateSelect}
                                                        value={row.duplicate}
                                                        onChange={(e) => setRowDuplicate(idx, e.target.value)}
                                                    >
                                                        <option value="skip">skip</option>
                                                        <option value="overwrite">overwrite</option>
                                                    </select>
                                                ) : (
                                                    <span className={styles.duplicatePlaceholder}>—</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className={styles.modalActions}>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={closeImportModal}
                            disabled={importLoading}
                        >
                            {importSummary ? 'Close' : 'Cancel'}
                        </Button>
                        {!importSummary && (
                            <Button
                                type="button"
                                onClick={handleImportSubmit}
                                isLoading={importLoading}
                                disabled={importStats.includedCount === 0}
                            >
                                Import {importStats.includedCount || ''} secret{importStats.includedCount === 1 ? '' : 's'}
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
};

export default ProjectDetails;
