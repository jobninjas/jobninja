import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useAINinja } from '../contexts/AINinjaContext';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import './JobCardOrion.css';
import {
    MapPin,
    Briefcase,
    DollarSign,
    Bot,
    Building2,
    Eye,
    CheckCircle2,
    Building,
    CircleDot
} from 'lucide-react';

const MatchScore = ({ score }) => {
    return (
        <div className="match-score-button">
            <div className="match-score-value">
                {score}%
            </div>
            <div className="jobcard-stats-label">MATCH</div>
        </div>
    );
};

const JobCardOrion = ({ job, onAskNova }) => {
    const navigate = useNavigate();
    const { openChatWithJob } = useAINinja();

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
    const viewCount = Math.floor(Math.random() * (90000 - 80000 + 1)) + 80000; // Simulated view count for mockup

    return (
        <Card
            className="jobcard-orion group cursor-pointer"
            onClick={() => navigate(`/ai-ninja/jobs/${job.id}`)}
        >
            <div className="jobcard-main-content">
                {/* Header */}
                <div className="flex items-start gap-3 mb-2">
                    <div className="jobcard-logo shadow-sm">
                        {job.companyLogo ? (
                            <img src={job.companyLogo} alt={job.company}
                                className="w-full h-full object-contain p-1 rounded-lg" />
                        ) : (
                            <Building2 className="w-5 h-5 text-blue-500" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col">
                            <h3 className="jobcard-title truncate">
                                {job.title}
                            </h3>
                            <div className="jobcard-company-line mt-0.5">
                                <span>{job.company}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metadata Row */}
                <div className="jobcard-meta-row mt-3">
                    <div className="jobcard-meta-pill">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        <span>{job.location || 'United States'}</span>
                    </div>
                    <div className="jobcard-meta-pill">
                        <CircleDot className="w-3 h-3 text-[#18c991]" />
                        <span>{workType}</span>
                    </div>
                    <div className="jobcard-meta-pill">
                        <Briefcase className="w-3 h-3 text-blue-400" />
                        <span>{job.level || 'Mid-Senior Level'}</span>
                    </div>
                    <div className="jobcard-meta-pill">
                        <DollarSign className="w-3 h-3 text-[#18c991]" />
                        <span>{job.salaryRange || 'Competitive'}</span>
                    </div>
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
                        <Bot className="w-4 h-4 mr-1.5" />
                        Ask AI Ninja
                    </Button>
                </div>
            </div>

            {/* Stats Block (Score) */}
            <div className="jobcard-stats-block">
                <MatchScore score={job.matchScore || (Math.floor(Math.random() * 20) + 70)} />
            </div>
        </Card>
    );
};

export default JobCardOrion;
