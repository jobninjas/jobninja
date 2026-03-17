import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import './JobCardOrion.css';
import {
    CheckCircle2,
    Building,
    CircleDot,
    MapPin,
    Briefcase,
    DollarSign,
    BarChart2
} from 'lucide-react';

const MatchScore = ({ score }) => {
    return (
        <div className="match-score-button">
            <div className="match-score-value" style={{ color: score > 85 ? '#00C896' : 'white' }}>
                {score}%
            </div>
            <div className="jobcard-stats-label">MATCH</div>
        </div>
    );
};

const JobCardOrion = ({ job }) => {
    const navigate = useNavigate();

    const handleApply = (e) => {
        e.stopPropagation();
        const urlToOpen = job.sourceUrl || job.url || job.redirect_url;
        if (urlToOpen) {
            window.open(urlToOpen, '_blank');
        } else {
            alert("Source URL not available for this job.");
        }
    };

    const workType = job.type ? job.type.charAt(0).toUpperCase() + job.type.slice(1) : 'Full-time';

    return (
        <Card
            className="jobcard-orion group cursor-pointer"
            onClick={() => navigate(`/ai-ninja/jobs/${job.id}`)}
        >
            {/* Match Score Badge */}
            <div className={`jobcard-match-badge ${job.matchScore >= 85 ? 'high' : 'mid'}`}>
                <div className="match-score-value">
                    {job.matchScore || 0}%
                </div>
                <div className="match-label">MATCH</div>
            </div>

            <div className="jobcard-main-content">
                <div className="flex flex-col items-start gap-2 mb-3">
                    <div className="w-full text-left pr-16">
                        <h3 className="jobcard-title line-clamp-2">
                            {job.title}
                        </h3>
                        <div className="jobcard-company-line justify-start">
                            <span>{job.company}</span>
                        </div>
                    </div>
                </div>

                {/* Metadata Grid */}
                <div className="jobcard-meta-grid">
                    <div className="jobcard-meta-pill" title={job.location || 'USA'}>
                        <MapPin className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        <span className="truncate">{job.location || 'USA'}</span>
                    </div>
                    <div className="jobcard-meta-pill">
                        <CircleDot className="w-3 h-3 text-[#18c991] flex-shrink-0" />
                        <span className="truncate">{workType}</span>
                    </div>
                    <div className="jobcard-meta-pill">
                        <Briefcase className="w-3 h-3 text-blue-400 flex-shrink-0" />
                        <span className="truncate">{job.level || 'Mid-Senior'}</span>
                    </div>
                    <div className="jobcard-meta-pill" title={job.salaryRange || 'Competitive'}>
                        <DollarSign className="w-3 h-3 text-[#18c991] flex-shrink-0" />
                        <span className="truncate">{job.salaryRange || 'Competitive'}</span>
                    </div>
                </div>

                {/* Actions - Only Apply */}
                <div className="jobcard-actions mt-auto pt-3">
                    <Button
                        className="jobcard-btn-apply w-full"
                        onClick={handleApply}
                    >
                        Apply
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default JobCardOrion;
