import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useAINinja } from '../contexts/AINinjaContext';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import './JobCardOrion.css';
import {
    MapPin,
    Clock,
    Briefcase,
    DollarSign,
    Zap,
    Bot,
    Building2,
    ExternalLink
} from 'lucide-react';

const MatchScore = ({ score }) => {
    let color = '#94a3b8'; // gray-400
    if (score >= 40) color = '#f97316'; // orange-500
    if (score >= 70) color = '#0ea5e9'; // sky-500
    if (score >= 90) color = '#10b981'; // emerald-500

    return (
        <div className="flex flex-col items-center">
            <div className="text-2xl font-bold tracking-tighter" style={{ color }}>
                {score}%
            </div>
            <div className="jobcard-stats-label">Match Score</div>
        </div>
    );
};

const JobCardOrion = ({ job, onAskNova }) => {
    const navigate = useNavigate();
    const { openChatWithJob } = useAINinja();

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const days = Math.floor(diffInHours / 24);
        if (days < 7) return `${days}d ago`;
        return `${Math.floor(days / 7)}w ago`;
    };

    const handleApply = (e) => {
        e.stopPropagation();
        const urlToOpen = job.sourceUrl || job.url || job.redirect_url;
        if (urlToOpen) {
            window.open(urlToOpen, '_blank');
        } else {
            alert("Source URL not available for this job.");
        }
    };

    const handleAskNova = (e) => {
        e.stopPropagation();
        openChatWithJob(job);
    };

    const workType = job.type ? job.type.charAt(0).toUpperCase() + job.type.slice(1) : 'Full-time';

    return (
        <Card
            className="jobcard-orion group hover:border-emerald-500/30 transition-all cursor-pointer"
            onClick={() => navigate(`/ai-ninja/jobs/${job.id}`)}
        >
            <div className="jobcard-main-content">
                {/* Header */}
                <div className="jobcard-header">
                    <div className="jobcard-logo">
                        {job.companyLogo ? (
                            <img src={job.companyLogo} alt={job.company}
                                className="w-full h-full object-contain" />
                        ) : (
                            <Building2 className="w-5 h-5 text-slate-400" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="jobcard-title truncate">
                                {job.title}
                            </h3>
                            {job.isNew && (
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[10px] py-0 h-4">
                                    NEW
                                </Badge>
                            )}
                        </div>
                        <div className="jobcard-company-line">
                            <span>{job.company}</span>
                            <span className="opacity-30">•</span>
                            <span>{getTimeAgo(job.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Metadata */}
                <div className="jobcard-meta-grid">
                    <div className="jobcard-meta-item">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500/70" />
                        <span>{job.location || 'Not specified'}</span>
                    </div>
                    <div className="jobcard-meta-item">
                        <Clock className="w-3.5 h-3.5 text-emerald-500/70" />
                        <span>{workType}</span>
                    </div>
                    <div className="jobcard-meta-item">
                        <Briefcase className="w-3.5 h-3.5 text-emerald-500/70" />
                        <span>{job.level || 'Mid-Senior Level'}</span>
                    </div>
                    <div className="jobcard-meta-item">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500/70" />
                        <span>{job.salaryRange || 'Competitive'}</span>
                    </div>
                </div>

                {/* Tags */}
                <div className="jobcard-tags">
                    {job.visaTags && job.visaTags.includes('visa-sponsoring') && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-bold py-0.5">
                            H1B SPONSOR LIKELY
                        </Badge>
                    )}
                    {job.categoryTags && job.categoryTags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-600 border-none text-[10px] font-medium py-0.5">
                            {tag.toUpperCase()}
                        </Badge>
                    ))}
                </div>

                {/* Actions */}
                <div className="jobcard-actions">
                    <Button
                        className="jobcard-btn-apply"
                        onClick={handleApply}
                    >
                        Apply Now
                    </Button>
                    <Button
                        variant="outline"
                        className="jobcard-btn-ask"
                        onClick={handleAskNova}
                    >
                        <Bot className="w-4 h-4 mr-2" />
                        Ask AI Ninja
                    </Button>
                </div>
            </div>

            {/* Stats Block (Dark Side) */}
            <div className="jobcard-stats-block">
                <MatchScore score={job.matchScore || 0} />
            </div>
        </Card>
    );
};

export default JobCardOrion;
