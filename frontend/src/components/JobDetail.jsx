import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import SideMenu from './SideMenu';
import './SideMenu.css';
import { 
  Bot, 
  UserCheck, 
  MapPin, 
  DollarSign, 
  Globe, 
  Home, 
  Building2,
  Briefcase,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  FileText,
  MessageSquare,
  Clock,
  Menu
} from 'lucide-react';
import { BRAND } from '../config/branding';
import { sampleJobs } from '../mock';

const JobDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  const job = sampleJobs.find(j => j.id === id);

  if (!job) {
    return (
      <div className="job-detail-page">
        <header className="nav-header">
          <button onClick={() => navigate('/')} className="nav-logo">
            <img src={BRAND.logoPath} alt={BRAND.logoAlt} className="logo-image" />
            <span className="logo-text">{BRAND.name}</span>
          </button>
        </header>
        <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h1>Job Not Found</h1>
          <p>The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/ai-ninja')} className="btn-primary" style={{ marginTop: '1rem' }}>
            <ArrowLeft className="w-4 h-4" /> Back to Job Board
          </Button>
        </div>
      </div>
    );
  }

  const getWorkTypeIcon = (type) => {
    switch (type) {
      case 'remote':
        return <Home className="w-4 h-4" />;
      case 'hybrid':
        return <Building2 className="w-4 h-4" />;
      case 'onsite':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Briefcase className="w-4 h-4" />;
    }
  };

  return (
    <div className="job-detail-page">
      {/* Side Menu */}
      <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />
      
      {/* Navigation Header */}
      <header className="nav-header">
        <button 
          onClick={() => setSideMenuOpen(true)} 
          className="hamburger-btn"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button onClick={() => navigate('/')} className="nav-logo">
          <img src={BRAND.logoPath} alt={BRAND.logoAlt} className="logo-image" />
          <span className="logo-text">{BRAND.name}</span>
        </button>
        <nav className="nav-links">
          <button onClick={() => navigate('/ai-ninja')} className="nav-link nav-link-active">
            <Bot className="w-4 h-4" /> AI Ninja
          </button>
          <button onClick={() => navigate('/human-ninja')} className="nav-link">
            <UserCheck className="w-4 h-4" /> Human Ninja
          </button>
          <button onClick={() => navigate('/pricing')} className="nav-link">Pricing</button>
        </nav>
        <div className="nav-actions">
          {isAuthenticated ? (
            <Button variant="secondary" className="btn-secondary" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          ) : (
            <>
              <Button variant="secondary" className="btn-secondary" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button className="btn-primary" onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="breadcrumb-bar">
        <div className="container">
          <button onClick={() => navigate('/ai-ninja')} className="breadcrumb-link">
            <ArrowLeft className="w-4 h-4" /> Back to Job Board
          </button>
        </div>
      </div>

      {/* Job Detail Content */}
      <div className="job-detail-content">
        <div className="container">
          <div className="job-detail-grid">
            {/* Main Content */}
            <div className="job-detail-main">
              <div className="job-header">
                <div className="job-header-info">
                  <h1 className="job-title-large">{job.title}</h1>
                  <p className="job-company-large">{job.company}</p>
                  <div className="job-meta-large">
                    <span className="meta-item">
                      <MapPin className="w-5 h-5" />
                      {job.location}
                    </span>
                    <span className="meta-item">
                      <DollarSign className="w-5 h-5" />
                      {job.salaryRange}
                    </span>
                    {job.postedDate && (
                      <span className="meta-item">
                        <Clock className="w-5 h-5" />
                        Posted {job.postedDate}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="job-tags-large">
                  <Badge variant="outline" className="work-type-badge-large">
                    {getWorkTypeIcon(job.type)}
                    {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                  </Badge>
                  {job.highPay && (
                    <Badge className="tag-high-pay">
                      <DollarSign className="w-4 h-4" /> High-paying
                    </Badge>
                  )}
                  {job.visaTags && job.visaTags.map(tag => (
                    <Badge key={tag} className="tag-visa">
                      <Globe className="w-4 h-4" /> {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="job-description-section">
                <h2>Job Description</h2>
                <div className="job-description-text">
                  {job.fullDescription.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="job-detail-sidebar">
              <Card className="apply-card">
                <h3 className="apply-card-title">
                  <Sparkles className="w-5 h-5" /> Apply with AI Ninja
                </h3>
                <div className="apply-features">
                  <div className="apply-feature">
                    <FileText className="w-4 h-4" />
                    <span>Tailored Resume</span>
                  </div>
                  <div className="apply-feature">
                    <MessageSquare className="w-4 h-4" />
                    <span>Custom Cover Letter</span>
                  </div>
                  <div className="apply-feature">
                    <Sparkles className="w-4 h-4" />
                    <span>Suggested Q&A Answers</span>
                  </div>
                </div>
                
                <Button 
                  className="btn-primary w-full btn-large"
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate(`/ai-ninja/apply/${job.id}`);
                    } else {
                      navigate('/signup');
                    }
                  }}
                >
                  <Bot className="w-5 h-5" /> Apply with AI Ninja
                </Button>

                <p className="apply-note">
                  AI Ninja will generate a tailored resume, cover letter, and suggested answers for this job. 
                  You submit the final application yourself.
                </p>

                <div className="apply-divider">
                  <span>or</span>
                </div>

                <Button
                  variant="outline"
                  className="btn-secondary w-full"
                  onClick={() => window.open(job.sourceUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" /> Open Original Job Posting
                </Button>
              </Card>

              {/* Human Ninja CTA */}
              <Card className="human-ninja-cta">
                <div className="cta-header">
                  <UserCheck className="w-6 h-6" />
                  <h4>No time to apply?</h4>
                </div>
                <p>Let Human Ninja handle your entire job search – we apply for you.</p>
                <Button 
                  variant="outline" 
                  className="btn-outline w-full"
                  onClick={() => navigate('/human-ninja')}
                >
                  Learn More
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <button onClick={() => navigate('/')} className="footer-logo-container">
                <img src={BRAND.logoPath} alt={BRAND.logoAlt} className="footer-logo-image" />
                <h3 className="footer-logo">{BRAND.name}</h3>
              </button>
              <p className="footer-tagline">{BRAND.tagline}</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{BRAND.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JobDetail;


