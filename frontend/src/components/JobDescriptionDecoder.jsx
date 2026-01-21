import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { FileSearch, Sparkles, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { BRAND } from '../config/branding';
import { API_URL } from '../config/api';
import SideMenu from './SideMenu';
import Header from './Header';

const JobDescriptionDecoder = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sideMenuOpen, setSideMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [jobDescription, setJobDescription] = useState('');

    const analyzeJob = async () => {
        if (!jobDescription.trim()) {
            alert('Please paste a job description');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/ai/job-decoder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user?.email,
                    job_description: jobDescription
                })
            });

            const data = await response.json();
            setAnalysis(data.analysis);
        } catch (error) {
            console.error('Error analyzing job:', error);
            alert('Failed to analyze job description. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
            <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />
            <Header onMenuClick={() => setSideMenuOpen(true)} />

            <section style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                padding: '4rem 2rem',
                textAlign: 'center',
                color: 'white'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <FileSearch style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                        Job Description Decoder
                    </h1>
                    <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
                        Decode what they really mean, spot red flags, and find hidden requirements
                    </p>
                </div>
            </section>

            <section style={{ padding: '4rem 2rem' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    {!analysis ? (
                        <Card style={{ border: '1px solid #e2e8f0' }}>
                            <CardHeader>
                                <CardTitle>Paste the Job Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <textarea
                                    placeholder="Paste the full job description here..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    rows={12}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '0.9375rem',
                                        fontFamily: 'inherit',
                                        resize: 'vertical',
                                        marginBottom: '1.5rem'
                                    }}
                                />

                                <Button
                                    onClick={analyzeJob}
                                    disabled={loading}
                                    style={{
                                        background: loading ? '#94a3b8' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                        color: 'white',
                                        padding: '1rem',
                                        fontSize: '1.125rem',
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Analyzing Job Description...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Decode This Job
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div style={{ marginBottom: '2rem' }}>
                                <Button
                                    onClick={() => setAnalysis(null)}
                                    style={{
                                        background: 'white',
                                        color: '#64748b',
                                        border: '1px solid #e2e8f0'
                                    }}
                                >
                                    ← Analyze Another Job
                                </Button>
                            </div>

                            <div style={{ display: 'grid', gap: '2rem' }}>
                                {/* Red Flags */}
                                {analysis.red_flags && analysis.red_flags.length > 0 && (
                                    <Card style={{ border: '2px solid #fecaca', background: '#fef2f2' }}>
                                        <CardHeader>
                                            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b' }}>
                                                <AlertTriangle className="w-6 h-6" />
                                                Red Flags to Watch Out For
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#7f1d1d', lineHeight: 1.8 }}>
                                                {analysis.red_flags.map((flag, index) => (
                                                    <li key={index}>{flag}</li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* What They Really Mean */}
                                <Card style={{ border: '1px solid #e2e8f0' }}>
                                    <CardHeader>
                                        <CardTitle>What They Really Mean</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            {analysis.translations && analysis.translations.map((item, index) => (
                                                <div key={index} style={{
                                                    background: '#f8fafc',
                                                    padding: '1rem',
                                                    borderRadius: '8px',
                                                    borderLeft: '4px solid #8b5cf6'
                                                }}>
                                                    <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                                                        "{item.phrase}"
                                                    </p>
                                                    <p style={{ color: '#64748b', margin: 0, fontSize: '0.9375rem' }}>
                                                        → {item.meaning}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Hidden Requirements */}
                                <Card style={{ border: '1px solid #e2e8f0' }}>
                                    <CardHeader>
                                        <CardTitle>Hidden Requirements</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.9375rem' }}>
                                            Skills and qualifications they didn't explicitly list but expect:
                                        </p>
                                        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: 1.8 }}>
                                            {analysis.hidden_requirements && analysis.hidden_requirements.map((req, index) => (
                                                <li key={index}>{req}</li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                {/* Green Flags */}
                                {analysis.green_flags && analysis.green_flags.length > 0 && (
                                    <Card style={{ border: '2px solid #bbf7d0', background: '#f0fdf4' }}>
                                        <CardHeader>
                                            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46' }}>
                                                <CheckCircle className="w-6 h-6" />
                                                Green Flags (Good Signs!)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#064e3b', lineHeight: 1.8 }}>
                                                {analysis.green_flags.map((flag, index) => (
                                                    <li key={index}>{flag}</li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Overall Assessment */}
                                <Card style={{ border: '1px solid #e2e8f0' }}>
                                    <CardHeader>
                                        <CardTitle>Overall Assessment</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p style={{ color: '#475569', lineHeight: 1.8, margin: 0 }}>
                                            {analysis.overall_assessment}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
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

export default JobDescriptionDecoder;
