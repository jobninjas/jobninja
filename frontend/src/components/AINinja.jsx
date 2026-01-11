import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import {
  Bot,
  UserCheck,
  Briefcase,
  MapPin,
  DollarSign,
  Globe,
  Home,
  Building2,
  ChevronRight,
  Sparkles,
  FileText,
  MessageSquare,
  Check,
  Menu,
  ExternalLink,
  X,
  Loader2,
  Search,
  Zap
} from 'lucide-react';
import { BRAND, PRODUCTS } from '../config/branding';
import { aiNinjaFAQ } from '../mock';
import { API_URL } from '../config/api';
import SideMenu from './SideMenu';
import Header from './Header';
import './SideMenu.css';

const AINinja = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = `${API_URL}/api/jobs?limit=50`;
        console.log('AI Ninja - Fetching jobs from:', url);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('AI Ninja - API Response:', data);

        // Handle both response formats: {success, jobs, pagination} OR {jobs, total}
        const jobsArray = data.jobs || [];

        if (jobsArray.length > 0) {
          const mappedJobs = jobsArray.map(job => ({
            id: job.id || job._id || job.externalId,
            title: job.title,
            company: job.company,
            location: job.location,
            salaryRange: job.salaryRange || 'Competitive',
            description: job.description,
            type: job.type || 'onsite',
            visaTags: job.visaTags || [],
            categoryTags: job.categoryTags || [],
            highPay: job.highPay || false,
            sourceUrl: job.sourceUrl
          }));
          setJobs(mappedJobs);
          console.log('AI Ninja - Loaded', mappedJobs.length, 'jobs');
        } else {
          setError('No jobs available at the moment');
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError(`Failed to load jobs: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);


  // Filter jobs based on active filter
  const filteredJobs = jobs.filter(job => {
    switch (activeFilter) {
      case 'high-paying':
        return job.highPay;
      case 'visa-friendly':
        return job.visaTags && job.visaTags.length > 0;
      case 'remote':
        return job.type === 'remote';
      default:
        return true;
    }
  });

  const filters = [
    { id: 'all', label: 'All Jobs', count: jobs.length },
    { id: 'high-paying', label: 'High-paying', count: jobs.filter(j => j.highPay).length },
    { id: 'visa-friendly', label: 'Visa-friendly', count: jobs.filter(j => j.visaTags?.length > 0).length },
    { id: 'remote', label: 'Remote', count: jobs.filter(j => j.type === 'remote').length },
  ];

  const getWorkTypeIcon = (type) => {
    switch (type) {
      case 'remote':
        return <Home className="w-3 h-3" />;
      case 'hybrid':
        return <Building2 className="w-3 h-3" />;
      case 'onsite':
        return <Briefcase className="w-3 h-3" />;
      default:
        return <Briefcase className="w-3 h-3" />;
    }
  };

  return (
    <div className="ai-ninja-page">
      {/* Side Menu */}
      <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />

      {/* Navigation Header */}
      <Header onMenuClick={() => setSideMenuOpen(true)} />

      {/* Hero Section */}
      <section className="ai-ninja-hero">
        <div className="container">
          <div className="hero-badge-premium">
            <Bot className="w-5 h-5" />
            <span>AI Ninja – Self-Serve</span>
          </div>
          <h1 className="ai-ninja-title">
            Apply smarter, <span className="text-gradient">not slower.</span>
          </h1>
          <p className="ai-ninja-subtitle">
            Browse visa-friendly, high-paying roles and use AI Ninja to tailor your resume and cover letter for each job in minutes.
          </p>
          <p className="ai-ninja-description">
            {BRAND.name} AI Ninja helps you skip the copy–paste chaos. Open a job, click "Apply with AI Ninja",
            upload your base resume, and get a tailored resume, cover letter, and suggested answers for common
            application questions. You stay in control of final submission – we just give you everything you need, fast.
          </p>

          <div className="ai-ninja-cta-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button className="btn-primary btn-large" onClick={() => navigate('/ai-apply')}>
              <Sparkles className="w-5 h-5 mr-2" />
              Get Tailored Resume & Cover Letter
            </Button>
          </div>

          {/* What you get */}
          <div className="ai-ninja-features">
            <div className="feature-item">
              <FileText className="w-5 h-5 text-primary" />
              <span>ATS-Optimized Resume</span>
            </div>
            <div className="feature-item">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span>Custom Cover Letter</span>
            </div>
            <div className="feature-item">
              <Search className="w-5 h-5 text-primary" />
              <span>ATS Match Score</span>
            </div>
          </div>

        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works-section" style={{ padding: '4rem 0', backgroundColor: '#f9fafb' }}>
        <div className="container">
          <h2 className="section-title text-center mb-12">How AI Ninja Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="step-card text-center p-6">
              <div className="step-icon-wrapper mb-4 mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Find a Job</h3>
              <p className="text-gray-600">Find any job listing on LinkedIn, Indeed, Glassdoor, or any company career page.</p>
            </div>
            <div className="step-card text-center p-6">
              <div className="step-icon-wrapper mb-4 mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Paste the Link</h3>
              <p className="text-gray-600">Paste the job URL into AI Ninja. We'll instantly extract the job description and requirements.</p>
            </div>
            <div className="step-card text-center p-6">
              <div className="step-icon-wrapper mb-4 mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Get Tailored Docs</h3>
              <p className="text-gray-600">Download your ATS-optimized resume and a custom cover letter tailored specifically for that role.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose AI Ninja Section */}
      <section className="why-ai-ninja" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why use AI Ninja?</h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="mt-1 bg-green-500 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>
                  <div>
                    <span className="font-bold">Beat the ATS:</span> Our AI identifies key skills and keywords the ATS is looking for and integrates them naturally into your resume.
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 bg-green-500 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>
                  <div>
                    <span className="font-bold">Save 2+ Hours per App:</span> No more staring at a blank page. Get a polished cover letter in seconds, not hours.
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 bg-green-500 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>
                  <div>
                    <span className="font-bold">Higher Match Score:</span> See exactly how well your profile aligns with the job before you even apply.
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 bg-green-500 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>
                  <div>
                    <span className="font-bold">Total Control:</span> You get editable documents. Make final tweaks and submit them yourself with confidence.
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8 flex items-center justify-center">
              <Bot className="w-48 h-48 text-green-600 opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Block */}
      <section className="comparison-section">
        <div className="container">
          <h2 className="section-title">AI Ninja vs Human Ninja</h2>
          <div className="comparison-grid">
            <Card className="comparison-card ai-card">
              <div className="comparison-header">
                <Bot className="w-8 h-8" />
                <h3>AI Ninja (SaaS)</h3>
              </div>
              <ul className="comparison-list">
                <li><Check className="w-4 h-4" /> You browse jobs on {BRAND.name}</li>
                <li><Check className="w-4 h-4" /> AI tailors your resume, cover letter and Q&A</li>
                <li><Check className="w-4 h-4" /> You submit the applications yourself</li>
                <li><Check className="w-4 h-4" /> Best for people who want speed and control</li>
              </ul>
              <Button className="btn-primary w-full" onClick={() => navigate('/pricing')}>
                Start with AI Ninja
              </Button>
            </Card>

            <Card className="comparison-card human-card">
              <div className="comparison-header">
                <UserCheck className="w-8 h-8" />
                <h3>Human Ninja (Service)</h3>
              </div>
              <ul className="comparison-list">
                <li><Check className="w-4 h-4" /> Our team finds and prioritizes roles</li>
                <li><Check className="w-4 h-4" /> Uses AI + human judgment for your applications</li>
                <li><Check className="w-4 h-4" /> We apply for you and keep everything tracked</li>
                <li><Check className="w-4 h-4" /> Best for people with no time or high visa/family pressure</li>
              </ul>
              <Button variant="secondary" className="btn-secondary w-full" onClick={() => navigate('/human-ninja')}>
                Learn About Human Ninja
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2 className="section-title">AI Ninja FAQ</h2>
          <Accordion type="single" collapsible className="faq-accordion">
            {aiNinjaFAQ.map(faq => (
              <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                <AccordionTrigger className="faq-question">{faq.question}</AccordionTrigger>
                <AccordionContent className="faq-answer">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

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
            <div className="footer-links">
              <div className="footer-column">
                <h4 className="footer-heading">Products</h4>
                <button onClick={() => navigate('/ai-ninja')} className="footer-link">AI Ninja</button>
                <button onClick={() => navigate('/human-ninja')} className="footer-link">Human Ninja</button>
                <button onClick={() => navigate('/pricing')} className="footer-link">Pricing</button>
              </div>
              <div className="footer-column">
                <h4 className="footer-heading">Account</h4>
                <button onClick={() => navigate('/login')} className="footer-link">Login</button>
                <button onClick={() => navigate('/signup')} className="footer-link">Sign Up</button>
                <button onClick={() => navigate('/dashboard')} className="footer-link">Dashboard</button>
              </div>
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

export default AINinja;


