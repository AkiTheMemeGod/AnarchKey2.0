import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import styles from './Auth.module.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await register(username, email, password);
            localStorage.setItem('token', data.token); // Store token for verification
            navigate('/verify-email');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Start managing your secrets securely"
        >
            <Card>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.errorAlert}>{error}</div>}

                    <Input
                        id="username"
                        label="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="jdoe"
                        required
                    />

                    <Input
                        id="email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                    />

                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <Button type="submit" isLoading={loading} className={styles.submitButton}>
                        Create account
                    </Button>
                </form>
            </Card>

            <p className={styles.footer}>
                Already have an account?{' '}
                <Link to="/login" className={styles.link}>Sign in</Link>
            </p>
        </AuthLayout>
    );
};

export default Register;
