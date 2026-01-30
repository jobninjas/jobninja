import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Bot, UserCheck, Menu, ChevronDown } from 'lucide-react';
import { BRAND } from '../config/branding';
import { useAuth } from '../contexts/AuthContext';
import BrandLogo from './BrandLogo';
import './Navbar.css';

const Navbar = ({ onOpenSideMenu, rightContent }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const currentPath = location.pathname;
  const [featuresOpen, setFeaturesOpen] = useState(false);

  const isActive = (path) => currentPath === path;

  const features = [
    { name: 'Interview Prep', path: '/landing/interview-prep' },
    { name: 'Resume AI', path: '/landing/resume-ai' },
    { name: 'Cover Letter', path: '/landing/cover-letter' },
    { name: 'Job Board', path: '/jobs' },
  ];

  return (
    <header className="nav-header nav-modern">
      <div className="nav-left">
        <button className="hamburger-btn" onClick={onOpenSideMenu}>
          <Menu className="w-5 h-5" />
        </button>
        <button onClick={() => { navigate('/'); window.scrollTo(0, 0); }} className="nav-logo">
          <img src={BRAND.logoPath} alt={BRAND.logoAlt} className="logo-image" />
          <BrandLogo className="logo-text" />
        </button>
      </div>
      <nav className="nav-links-modern">
        {/* Features Dropdown */}
        <div
          className="nav-dropdown"
          onMouseEnter={() => setFeaturesOpen(true)}
          onMouseLeave={() => setFeaturesOpen(false)}
        >
          <button className="nav-link-modern nav-dropdown-trigger">
            Features
            <ChevronDown className="w-4 h-4" />
          </button>
          {featuresOpen && (
            <div className="nav-dropdown-menu">
              {features.map((feature) => (
                <button
                  key={feature.path}
                  onClick={() => {
                    navigate(feature.path);
                    setFeaturesOpen(false);
                  }}
                  className="nav-dropdown-item"
                >
                  {feature.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/ai-ninja')}
          className={`nav-link-modern nav-ninja-btn ai ${isActive('/ai-ninja') ? 'active' : ''}`}
        >
          <Bot className="w-5 h-5" />
          <span>AI Ninja</span>
        </button>
        <button
          onClick={() => navigate('/human-ninja')}
          className={`nav-link-modern nav-ninja-btn human ${isActive('/human-ninja') ? 'active' : ''}`}
        >
          <UserCheck className="w-5 h-5" />
          <span>Human Ninja</span>
        </button>
        <button
          onClick={() => navigate('/pricing')}
          className={`nav-link-modern ${isActive('/pricing') ? 'text-primary font-semibold' : ''}`}
        >
          Pricing
        </button>
      </nav>
      <div className="nav-actions">
        {rightContent ? (
          rightContent
        ) : (
          !isAuthenticated && (
            <>
              <Button variant="ghost" className="btn-ghost" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button className="btn-primary-modern" onClick={() => navigate('/signup')}>
                Start now for free
              </Button>
            </>
          )
        )}
      </div>
    </header>
  );
};

export default Navbar;

