import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../services/api';
import DashboardLayout from '../Dashboard/DashboardLayout';
import Loader from '../../components/ui/Loader';
import LogTerminal from './LogTerminal';
import styles from './Analytics.module.css';

const COLORS = ['#FF3838', '#00D2D3', '#54a0ff', '#feca57', '#5f27cd', '#ff9ff3'];

const Analytics = () => {
    const [data, setData] = useState([]);
    const [keys, setKeys] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/v1/key/usage');
                const { data: logsData } = await api.get('/v1/key/logs');
                setData(data.usage || []);
                setKeys(data.keys || []);
                setLogs(logsData || []);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
                setError("Failed to load analytics data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <DashboardLayout>
            <div className={styles.container}>
                <h1 className={styles.title}>Usage Analytics</h1>
                <p className={styles.subtitle}>API key usage for the last 24 hours</p>

                {loading ? (
                    <div className={styles.loading}>
                        <Loader size={32} />
                    </div>
                ) : error ? (
                    <div className={styles.error}>{error}</div>
                ) : data.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No usage data available yet.</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="var(--text-secondary)"
                                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                        tickFormatter={(str) => {
                                            const date = new Date(str);
                                            return date.getHours() + ':00';
                                        }}
                                    />
                                    <YAxis
                                        stroke="var(--text-secondary)"
                                        tick={{ fill: 'var(--text-secondary)' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(0, 15, 40, 0.9)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px'
                                        }}
                                        itemStyle={{ color: 'var(--text-primary)' }}
                                        labelStyle={{ color: 'var(--text-secondary)' }}
                                    />
                                    <Legend />
                                    {keys.map((key, index) => (
                                        <Line
                                            key={key}
                                            type="monotone"
                                            dataKey={key}
                                            stroke={COLORS[index % COLORS.length]}
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 8 }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <LogTerminal logs={logs} />
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Analytics;
