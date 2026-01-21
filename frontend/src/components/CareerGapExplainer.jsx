import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Clock, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { BRAND } from '../config/branding';
import { API_URL } from '../config/api';
import SideMenu from './SideMenu';
import Header from './Header';

const CareerGapExplainer = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sideMenuOpen, setSideMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [explanations, setExplanations] = useState(null);
    const [copied, setCopied] = useState(null);

    const [formData, setFormData] = useState({
        gapDuration: '',
        reason: '',
        activities: ''
    });

    const generateExplanations = async () => {
        if (!formData.gapDuration || !formData.reason) {
            alert('Please fill in gap duration and reason');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/ai/career-gap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user?.email,
                    ...formData
                })
            });

            const data = await response.json();
            setExplanations(data.explanations);
        } catch (error) {
            console.error('Error generating explanations:', error);
            alert('Failed to generate explanations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyText = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
            <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />
            <Header onMenuClick={() => setSideMenuOpen(true)} />

            <section style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                padding: '4rem 2rem',
                textAlign: 'center',
                color: 'white'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <Clock style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                        Career Gap Explainer
                    </h1>
                    <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
                        Turn your career gap into a professional story for resumes and interviews
                    </p>
                </div>
            </section>

            <section style={{ padding: '4rem 2rem' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {!explanations ? (
                        <Card style={{ border: '1px solid #e2e8f0' }}>
                            <CardHeader>
                                <CardTitle>Tell us about your career gap</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                                            Gap Duration *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., 6 months, 1 year"
                                            value={formData.gapDuration}
                                            onChange={(e) => setFormData({ ...formData, gapDuration: e.target.value })}
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
                                            Reason for Gap *
                                        </label>
                                        <select
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            <option value="">Select a reason</option>
                                            <option value="family">Family responsibilities / Caregiving</option>
                                            <option value="health">Health reasons</option>
                                            <option value="education">Further education / Skill development</option>
                                            <option value="travel">Travel / Personal development</option>
                                            <option value="layoff">Layoff / Company closure</option>
                                            <option value="sabbatical">Sabbatical / Career break</option>
                                            <option value="relocation">Relocation</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                                            What did you do during this time? (Optional)
                                        </label>
                                        <textarea
                                            placeholder="e.g., Took online courses in data science, volunteered at local nonprofit, freelanced on small projects"
                                            value={formData.activities}
                                            onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
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
                                        onClick={generateExplanations}
                                        disabled={loading}
                                        style={{
                                            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
                                                Generating Explanations...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                Generate Professional Explanations
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div style={{ marginBottom: '2rem' }}>
                                <Button
                                    onClick={() => setExplanations(null)}
                                    style={{
                                        background: 'white',
                                        color: '#64748b',
                                        border: '1px solid #e2e8f0'
                                    }}
                                >
                                    ← Start Over
                                </Button>
                            </div>

                            <Card style={{ border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                                <CardHeader>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <CardTitle>For Your Resume</CardTitle>
                                        <Button
                                            onClick={() => copyText(explanations.resume, 'resume')}
                                            style={{
                                                background: copied === 'resume' ? '#10b981' : '#f59e0b',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            {copied === 'resume' ? (
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
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                        Use this concise explanation in your resume's experience section
                                    </p>
                                    <div style={{
                                        background: '#fef3c7',
                                        padding: '1.5rem',
                                        borderRadius: '8px',
                                        fontSize: '0.9375rem',
                                        lineHeight: 1.8,
                                        color: '#1e293b'
                                    }}>
                                        {explanations.resume}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card style={{ border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                                <CardHeader>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <CardTitle>For Interview Questions</CardTitle>
                                        <Button
                                            onClick={() => copyText(explanations.interview, 'interview')}
                                            style={{
                                                background: copied === 'interview' ? '#10b981' : '#f59e0b',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            {copied === 'interview' ? (
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
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                        Use this detailed explanation when asked about the gap in interviews
                                    </p>
                                    <div style={{
                                        background: '#fef3c7',
                                        padding: '1.5rem',
                                        borderRadius: '8px',
                                        fontSize: '0.9375rem',
                                        lineHeight: 1.8,
                                        color: '#1e293b'
                                    }}>
                                        {explanations.interview}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', border: 'none' }}>
                                <CardContent style={{ padding: '2rem' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#1e3a8a' }}>
                                        💡 Tips for Addressing Career Gaps
                                    </h3>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e40af', lineHeight: 1.8 }}>
                                        <li>Be honest and confident - gaps are common and understandable</li>
                                        <li>Focus on what you learned or accomplished during the gap</li>
                                        <li>Keep it brief on your resume, expand in interviews if asked</li>
                                        <li>Emphasize your readiness to return to work</li>
                                        <li>Practice your explanation out loud before interviews</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </section>

            <footer style={{ background: '#0f172a', padding: '2rem', color: '#94a3b8', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>{BRAND.copyright}</p>
            </footer>
        </div>
    );
};

export default CareerGapExplainer;
