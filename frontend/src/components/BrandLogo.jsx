import React, { useState, useEffect } from 'react';
import './BrandLogo.css';

const BrandLogo = ({ className = "" }) => {
    return (
        <div className={`brand-logo-container ${className}`}>
            <span className="brand-name-static">jobNinjas</span>
            <span className="brand-suffix-ai">.ai</span>
        </div>
    );
};

export default BrandLogo;
