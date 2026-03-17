import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Check,
    X,
    RotateCw,
    Info,
    Layout,
    Type,
    MousePointer2
} from 'lucide-react';
import NinjaIcon from './NinjaIcon';
import './AIAlternativesPopup.css';

const AIAlternativesPopup = ({ activeItem, alternatives, onApply, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % alternatives.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + alternatives.length) % alternatives.length);
    };

    return (
        <div className="ai-alternatives-popup shadow-2xl">
            <div className="popup-header">
                <div className="pagination">
                    <button className="page-nav" onClick={handlePrev}><ChevronLeft className="w-4 h-4" /></button>
                    <span className="page-info">{currentIndex + 1} of {alternatives.length}</span>
                    <button className="page-nav" onClick={handleNext}><ChevronRight className="w-4 h-4" /></button>
                </div>
                <button className="close-popup" onClick={onClose}><X className="w-4 h-4" /></button>
            </div>

            <div className="popup-body">
                <div className="current-suggestion">
                    {alternatives[currentIndex]}
                </div>
                <button className="inline-edit-btn">
                    <MousePointer2 className="w-3.5 h-3.5" />
                    <span>Click to edit</span>
                </button>
            </div>

            <div className="popup-sub-info">
                All alternatives (click to edit):
            </div>

            <div className="alternatives-list custom-scrollbar">
                {alternatives.map((alt, idx) => (
                    <div
                        key={idx}
                        className={`alt-thumb ${idx === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(idx)}
                    >
                        <div className="alt-number">{idx + 1}</div>
                        <div className="alt-preview text-truncate">
                            {alt}
                        </div>
                    </div>
                ))}
            </div>

            <div className="popup-footer">
                <button className="show-original">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                    <span>Show original</span>
                </button>

                <div className="footer-actions">
                    <button className="regenerate-btn">
                        <RotateCw className="w-4 h-4" />
                        <span>Regenerate</span>
                    </button>
                    <button className="apply-btn shadow-lg" onClick={() => onApply(alternatives[currentIndex])}>
                        <Check className="w-4 h-4" />
                        <span>Apply</span>
                    </button>
                </div>
            </div>

            <div className="shortcut-hints">
                <span>← → navigate</span>
                <span>Enter apply</span>
                <span>Esc close</span>
            </div>
        </div>
    );
};

export default AIAlternativesPopup;
