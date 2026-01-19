import React, { useState } from 'react';
import { AlertCircle, Send, Check } from 'lucide-react';
import { API_URL } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const VerificationBanner = () => {
    const { user, isAuthenticated } = useAuth();
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(null);

    // Only show if user is logged in but not verified
    if (!isAuthenticated || !user || user.is_verified) {
        return null;
    }

    const handleResend = async () => {
        setSending(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'token': token
                }
            });

            if (response.ok) {
                setSent(true);
                setTimeout(() => setSent(false), 5000);
            } else {
                const data = await response.json();
                setError(data.detail || 'Failed to resend verification email');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-amber-800">
                <div className="flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Please verify your email to access all features.</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleResend}
                        disabled={sending || sent}
                        className={`flex items-center gap-1.5 font-bold underline hover:text-amber-900 disabled:no-underline disabled:opacity-70 transition-all`}
                    >
                        {sending ? 'Sending...' : sent ? (
                            <span className="flex items-center gap-1 text-green-700">
                                <Check className="w-3.5 h-3.5" /> Sent!
                            </span>
                        ) : (
                            <>
                                <Send className="w-3.5 h-3.5" />
                                Resend Link
                            </>
                        )}
                    </button>

                    {error && (
                        <span className="text-xs text-red-600 font-medium">{error}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerificationBanner;
