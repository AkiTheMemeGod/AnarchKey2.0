import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AuthLayout from './AuthLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import styles from './Auth.module.css';

const VerifyEmail = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value) {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && e.target.previousSibling) {
                e.target.previousSibling.focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').split('').slice(0, 6);
        const newOtp = [...otp];
        data.forEach((value, index) => {
            newOtp[index] = value;
        });
        setOtp(newOtp);

        // Focus last filled input or first empty
        const lastIndex = Math.min(data.length, 5);
        const inputs = document.querySelectorAll(`.${styles.otpInput}`);
        if (inputs[lastIndex]) inputs[lastIndex].focus();
        else if (inputs[5]) inputs[5].focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const otpString = otp.join('');

        try {
            await api.post('/auth/verifyotp', { otp: otpString });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await api.post('/auth/sendotp');
            alert('OTP sent!');
        } catch (err) {
            alert('Failed to send OTP');
        }
    };

    return (
        <AuthLayout
            title="Verify your email"
            subtitle="Enter the code sent to your email"
        >
            <Card>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.errorAlert}>{error}</div>}

                    <div className={styles.otpContainer}>
                        {otp.map((data, index) => (
                            <input
                                className={styles.otpInput}
                                type="text"
                                name="otp"
                                maxLength="1"
                                key={index}
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onPaste={handlePaste}
                                onFocus={(e) => e.target.select()}
                                required={index === 0}
                            />
                        ))}
                    </div>

                    <Button type="submit" isLoading={loading} className={styles.submitButton}>
                        Verify
                    </Button>
                </form>

                <div className={styles.footer}>
                    <button onClick={handleResend} className={styles.link} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        Resend Code
                    </button>
                </div>
            </Card>
        </AuthLayout>
    );
};

export default VerifyEmail;
