import React, { useState, useEffect } from 'react';
import './BrandLogo.css';

const BrandLogo = ({ className = "" }) => {
    const [suffixIndex, setSuffixIndex] = useState(0);
    const suffixes = ['.org', '.ai', '.io'];

    useEffect(() => {
        const interval = setInterval(() => {
            setSuffixIndex((prev) => (prev + 1) % suffixes.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`brand-logo-container ${className}`}>
            <span className="brand-name-static">jobNinjas</span>
            <span className="brand-suffix-animating">{suffixes[suffixIndex]}</span>
        </div>
    );
};

export default BrandLogo;
