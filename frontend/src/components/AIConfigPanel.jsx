import React, { useState, useEffect } from 'react';
import {
    Cpu,
    Layers,
    TextQuote,
    Target,
    RotateCcw,
    HelpCircle,
    ChevronDown,
    Loader2,
    Link as LinkIcon
} from 'lucide-react';
import { apiCall } from '../config/api';
import NinjaIcon from './NinjaIcon';
import './AIConfigPanel.css';

const AIConfigPanel = ({
    jobDescription,
    setJobDescription,
    jobTitle,
    setJobTitle,
    companyName,
    setCompanyName,
    onJobDataFetch,
    missingSkills = [],
    onGenerate,
    isGenerating = false,
    config,
    setConfig
}) => {
    const [showMoreSettings, setShowMoreSettings] = useState(false);
    const wordCount = jobDescription ? jobDescription.trim().split(/\s+/).length : 0;

    const handleConfigChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const [jobUrl, setJobUrl] = useState('');
    const [isFetchingSlot, setIsFetchingSlot] = useState(false);

    const [fetchError, setFetchError] = useState('');
    const handleFetch = async () => {
        if (!jobUrl.trim()) return;
        setIsFetchingSlot(true);
        setFetchError('');
        try {
            const data = await apiCall('/api/fetch-job-description', {
                method: 'POST',
                body: JSON.stringify({ url: jobUrl.trim() })
            });
            if (data.success) {
                setJobDescription(data.description || '');
                if (onJobDataFetch) {
                    onJobDataFetch(data);
                }
            } else {
                setFetchError(data.error || 'Failed to fetch job description');
            }
        } catch (error) {
            console.error('Fetch failed:', error);
            setFetchError('Connection error. Please try again.');
        } finally {
            setIsFetchingSlot(false);
        }
    };


    return (
        <div className="ai-config-panel-premium">
            <div className="config-header">
                <h2 className="config-title-main">AI Ninja: Smart Tailoring</h2>
                <p className="config-subtitle-main">Paste the job description or link below. JobNinjas AI will automatically optimize your bullet points and skills for this specific role.</p>
            </div>

            <div className="job-link-fetcher-group">
                <div className="fetch-input-wrapper">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Paste job link (LinkedIn, Indeed...)"
                        value={jobUrl}
                        onChange={(e) => setJobUrl(e.target.value)}
                    />
                    <button className="fetch-action-btn" onClick={handleFetch} disabled={isFetchingSlot}>
                        {isFetchingSlot ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Fetch'}
                    </button>
                </div>
            </div>

            <div className="job-metadata-fields-group">
                <div className="metadata-field-item">
                    <label>Target Role</label>
                    <input
                        type="text"
                        placeholder="e.g. Senior Software Engineer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                    />
                </div>
                <div className="metadata-field-item">
                    <label>Company</label>
                    <input
                        type="text"
                        placeholder="e.g. Google"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                    />
                </div>
            </div>

            <div className="jd-input-section">
                <label className="jd-label">
                    <span>Target Job Description</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
                </label>
                <div className="jd-card-wrapper">
                    <textarea
                        className="high-fidelity-textarea"
                        placeholder="Paste the job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={8}
                    />
                    <div className="jd-footer-meta">
                        <span>Paste the full job posting for best results</span>
                    </div>
                </div>
            </div>
            <div className="ai-controls-footer">
                <button
                    className={`btn-generate-premium-emerald ${isGenerating ? 'loading' : ''}`}
                    onClick={onGenerate}
                    disabled={isGenerating || !jobDescription}
                >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <NinjaIcon className="w-4 h-4" />}
                    <span>{isGenerating ? 'Generating...' : 'Generate Resume'}</span>
                </button>
            </div>
        </div>
    );
};

export default AIConfigPanel;
