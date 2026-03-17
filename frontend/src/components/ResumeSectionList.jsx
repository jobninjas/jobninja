import React from 'react';
import {
    Eye,
    EyeOff,
    GripVertical,
    User,
    Briefcase,
    ScrollText,
    Target,
    Code2,
    GraduationCap,
    FlaskConical
} from 'lucide-react';
import NinjaIcon from './NinjaIcon';
import './ResumeSectionList.css';

const ResumeSectionList = ({ resumeData, setResumeData }) => {
    const sections = [
        { id: 'personal', label: 'Personal Details', icon: User, visible: true },
        { id: 'summary', label: 'Professional Summary', icon: Target, visible: true },
        { id: 'skills', label: 'Technical Skills', icon: Code2, visible: true },
        { id: 'experience', label: 'Work Experience', icon: Briefcase, visible: true },
        { id: 'projects', label: 'Projects', icon: FlaskConical, visible: true },
        { id: 'education', label: 'Education', icon: GraduationCap, visible: true },
    ];

    return (
        <div className="resume-section-list">
            <div className="section-instruction">
                Toggle visibility and reorder sections
            </div>

            <div className="sections-container">
                {sections.map((section) => (
                    <div key={section.id} className={`section-item ${!section.visible ? 'hidden-section' : ''}`}>
                        <div className="section-main">
                            <div className="drag-handle"><GripVertical className="w-4 h-4" /></div>
                            <div className="section-info">
                                <div className="section-icon-box">
                                    <section.icon className="w-4 h-4" />
                                </div>
                                <span className="section-label">{section.label}</span>
                            </div>
                        </div>

                        <div className="section-actions">
                            <button className="ai-btn-small" title="AI Optimize">
                                <NinjaIcon className="w-3.5 h-3.5" />
                            </button>
                            <button className="visibility-btn">
                                {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button className="add-section-btn">
                <ScrollText className="w-4 h-4 mr-2" />
                <span>Add Custom Section</span>
            </button>
        </div>
    );
};

export default ResumeSectionList;
