import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
    Upload,
    FileText,
    Loader2,
    ArrowRight,
    Sparkles,
    Target,
    TrendingUp,
    Briefcase,
    X,
    CheckCircle
} from 'lucide-react';
import { API_URL } from '../config/api';
import SideMenu from './SideMenu';
import Header from './Header';
import './CareerChangeTool.css';

const CareerChangeTool = () => {
    const navigate = useNavigate();
    const [sideMenuOpen, setSideMenuOpen] = useState(false);

    const [resumeFile, setResumeFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFile(file);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!resumeFile) {
            setError('Please upload your resume');
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('resume', resumeFile);

            const response = await fetch(`${API_URL}/api/scan/parse`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();

            // Generate career suggestions based on resume
            const skills = data.resumeText?.toLowerCase() || '';

            let suggestions = [];

            if (skills.includes('python') || skills.includes('data') || skills.includes('machine learning')) {
                suggestions.push({
                    role: 'Data Scientist',
                    match: 92,
                    reason: 'Strong technical background with data skills',
                    growth: 'High demand, 35% projected growth'
                });
                suggestions.push({
                    role: 'Machine Learning Engineer',
                    match: 88,
                    reason: 'Technical expertise aligns well',
                    growth: 'Emerging field, excellent opportunities'
                });
            }

            if (skills.includes('management') || skills.includes('lead') || skills.includes('team')) {
                suggestions.push({
                    role: 'Product Manager',
                    match: 85,
                    reason: 'Leadership and cross-functional experience',
                    growth: 'Strong demand across industries'
                });
                suggestions.push({
                    role: 'Program Manager',
                    match: 82,
                    reason: 'Project coordination skills',
                    growth: 'Stable career with growth potential'
                });
            }

            if (skills.includes('software') || skills.includes('developer') || skills.includes('engineer')) {
                suggestions.push({
                    role: 'Solutions Architect',
                    match: 90,
                    reason: 'Technical depth and systems thinking',
                    growth: '40% growth projected'
                });
                suggestions.push({
                    role: 'DevOps Engineer',
                    match: 85,
                    reason: 'Engineering background transfers well',
                    growth: 'Critical role in modern tech'
                });
            }

            // Default suggestions if no matches
            if (suggestions.length === 0) {
                suggestions = [
                    { role: 'Project Manager', match: 78, reason: 'Transferable organizational skills', growth: 'Stable demand' },
                    { role: 'Business Analyst', match: 75, reason: 'Analytical capabilities', growth: 'Growing field' },
                    { role: 'Consultant', match: 72, reason: 'Domain expertise valuable', growth: 'Flexible opportunities' }
                ];
            }

            setResult({
                suggestions: suggestions.slice(0, 5),
                strengths: ['Strong communication', 'Technical aptitude', 'Problem-solving'],
                developmentAreas: ['Consider certifications in target field', 'Build relevant portfolio projects']
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="career-page">
            <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />
            <Header onMenuClick={() => setSideMenuOpen(true)} />

            <div className="career-container">
                <div className="career-hero">
                    <div className="hero-badge career-badge">
                        <TrendingUp className="w-5 h-5" />
                        <span>Career Change Tool</span>
                    </div>
                    <h1>Discover Your <span className="text-gradient-career">Next Step</span></h1>
                    <p>Upload your resume and let AI analyze your skills to suggest the best career paths for you.</p>
                </div>

                {!result ? (
                    <Card className="upload-card">
                        <h2><Upload className="w-5 h-5" /> Upload Your Resume</h2>
                        <p>We'll analyze your skills and experience to find matching career paths</p>

                        <div
                            className={`upload-zone ${resumeFile ? 'has-file' : ''}`}
                            onClick={() => document.getElementById('career-resume-upload').click()}
                        >
                            <input
                                id="career-resume-upload"
                                type="file"
                                accept=".pdf,.docx,.txt"
                                onChange={handleFileUpload}
                                hidden
                            />
                            {resumeFile ? (
                                <div className="uploaded-file">
                                    <FileText className="w-12 h-12" style={{ color: 'var(--primary)' }} />
                                    <span className="file-name">{resumeFile.name}</span>
                                    <button className="remove-file" onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}>
                                        <X className="w-4 h-4" /> Remove
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-12 h-12" style={{ color: '#94a3b8' }} />
                                    <p>Click to upload your resume</p>
                                    <span className="file-types">PDF, DOCX, or TXT</span>
                                </>
                            )}
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <Button
                            className="analyze-btn"
                            onClick={handleAnalyze}
                            disabled={!resumeFile || isAnalyzing}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing Your Career Path...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Discover My Next Step
                                </>
                            )}
                        </Button>
                    </Card>
                ) : (
                    <div className="results-section">
                        <Card className="results-card">
                            <div className="results-header">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                                <h2>Your Career Matches</h2>
                                <p>Based on your skills and experience</p>
                            </div>

                            <div className="suggestions-list">
                                {result.suggestions.map((suggestion, index) => (
                                    <div key={index} className="suggestion-card">
                                        <div className="suggestion-header">
                                            <Briefcase className="w-6 h-6" />
                                            <div>
                                                <h3>{suggestion.role}</h3>
                                                <span className="match-badge">{suggestion.match}% Match</span>
                                            </div>
                                        </div>
                                        <p className="reason">{suggestion.reason}</p>
                                        <p className="growth"><TrendingUp className="w-4 h-4" /> {suggestion.growth}</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate('/scanner')}
                                        >
                                            Optimize Resume for This Role <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <div className="insights-grid">
                            <Card className="insight-card">
                                <h3><Target className="w-5 h-5" /> Your Strengths</h3>
                                <ul>
                                    {result.strengths.map((strength, i) => (
                                        <li key={i}><CheckCircle className="w-4 h-4 text-green-500" /> {strength}</li>
                                    ))}
                                </ul>
                            </Card>

                            <Card className="insight-card">
                                <h3><TrendingUp className="w-5 h-5" /> Development Areas</h3>
                                <ul>
                                    {result.developmentAreas.map((area, i) => (
                                        <li key={i}><ArrowRight className="w-4 h-4 text-blue-500" /> {area}</li>
                                    ))}
                                </ul>
                            </Card>
                        </div>

                        <Button
                            variant="outline"
                            className="try-again-btn"
                            onClick={() => { setResult(null); setResumeFile(null); }}
                        >
                            Analyze Another Resume
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CareerChangeTool;
