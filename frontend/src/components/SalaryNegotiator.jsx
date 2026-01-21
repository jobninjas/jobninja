import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { DollarSign, TrendingUp, Loader2, Copy, Check } from 'lucide-react';
import { BRAND } from '../config/branding';
import { API_URL } from '../config/api';
import SideMenu from './SideMenu';
import Header from './Header';

const SalaryNegotiator = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sideMenuOpen, setSideMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [script, setScript] = useState(null);
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState({
        currentOffer: '',
        marketRate: '',
        yearsExperience: '',
        role: '',
        uniqueValue: ''
    });

    const generateScript = async () => {
        if (!formData.currentOffer || !formData.marketRate || !formData.role) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/ai/salary-negotiation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user?.email,
                    ...formData
                })
            });

            const data = await response.json();
            setScript(data.script);
        } catch (error) {
            console.error('Error generating script:', error);
            alert('Failed to generate script. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyScript = () => {
        if (script) {
            navigator.clipboard.writeText(script);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
            <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />
            <Header onMenuClick={() => setSideMenuOpen(true)} />

            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '4rem 2rem',
                textAlign: 'center',
                color: 'white'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <DollarSign style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                        Salary Negotiation Script Generator
                    </h1>
                    <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
                        Get a personalized script to confidently negotiate your best offer
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section style={{ padding: '4rem 2rem' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {!script ? (
                        <Card style={{ border: '1px solid #e2e8f0' }}>
                            <CardHeader>
                                <CardTitle>Tell us about your offer</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                                            Current Offer Amount *
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 120000"
                                            value={formData.currentOffer}
                                            onChange={(e) => setFormData({ ...formData, currentOffer: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                                            Market Rate / Your Target *
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 140000"
                                            value={formData.marketRate}
                                            onChange={(e) => setFormData({ ...formData, marketRate: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                                            Role / Position *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Senior Software Engineer"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                                            Years of Experience
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 5"
                                            value={formData.yearsExperience}
                                            onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                                            Your Unique Value (Optional)
                                        </label>
                                        <textarea
                                            placeholder="e.g., Led 3 successful product launches, increased revenue by 40%, expert in React and Node.js"
                                            value={formData.uniqueValue}
                                            onChange={(e) => setFormData({ ...formData, uniqueValue: e.target.value })}
                                            rows={4}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                fontFamily: 'inherit',
                                                resize: 'vertical'
                                            }}
                                        />
                                    </div>

                                    <Button
                                        onClick={generateScript}
                                        disabled={loading}
                                        style={{
                                            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            color: 'white',
                                            padding: '1rem',
                                            fontSize: '1.125rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Generating Your Script...
                                            </>
                                        ) : (
                                            <>
                                                <TrendingUp className="w-5 h-5" />
                                                Generate Negotiation Script
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <Card style={{ border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                                <CardHeader>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <CardTitle>Your Personalized Negotiation Script</CardTitle>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <Button
                                                onClick={copyScript}
                                                style={{
                                                    background: copied ? '#10b981' : '#6366f1',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-4 h-4" />
                                                        Copy
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                onClick={() => setScript(null)}
                                                style={{
                                                    background: 'white',
                                                    color: '#64748b',
                                                    border: '1px solid #e2e8f0'
                                                }}
                                            >
                                                Start Over
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <pre style={{
                                        background: '#f8fafc',
                                        padding: '2rem',
                                        borderRadius: '8px',
                                        fontSize: '0.9375rem',
                                        lineHeight: 1.8,
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: "'Inter', sans-serif",
                                        color: '#1e293b',
                                        margin: 0
                                    }}>
                                        {script}
                                    </pre>
                                </CardContent>
                            </Card>

                            <Card style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', border: 'none' }}>
                                <CardContent style={{ padding: '2rem' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#1e3a8a' }}>
                                        💡 Negotiation Tips
                                    </h3>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e40af', lineHeight: 1.8 }}>
                                        <li>Practice this script out loud before the actual conversation</li>
                                        <li>Stay confident and friendly - negotiation is expected</li>
                                        <li>Be prepared to justify your ask with specific achievements</li>
                                        <li>Consider the total compensation package, not just base salary</li>
                                        <li>Don't accept immediately - ask for time to review the offer</li>
                                        <li>Have a walk-away number in mind before you start</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#0f172a', padding: '2rem', color: '#94a3b8', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>{BRAND.copyright}</p>
            </footer>
        </div>
    );
};

export default SalaryNegotiator;
