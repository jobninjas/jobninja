import React, { useState, useEffect } from 'react';
import './BrandLogo.css';

const BrandLogo = ({ className = "" }) => {
    const [suffixIndex, setSuffixIndex] = useState(0);
    const suffixes = [
        { text: '.ai', duration: 10000 },
        { text: '.io', duration: 5000 },
        { text: '.org', duration: 5000 }
    ];

    useEffect(() => {
        let timeoutId;

        const rotate = (index) => {
            const currentSuffix = suffixes[index];
            setSuffixIndex(index);

            timeoutId = setTimeout(() => {
                rotate((index + 1) % suffixes.length);
            }, currentSuffix.duration);
        };

        rotate(0); // Start with .ai

        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <div className={`brand-logo-container ${className}`}>
            <span className="brand-name-static">jobNinjas</span>
            <span className="brand-suffix-animating">{suffixes[suffixIndex].text}</span>
        </div>
    );
};

export default BrandLogo;
