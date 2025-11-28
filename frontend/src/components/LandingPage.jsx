import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Check, X, TrendingUp, Users, Clock, Target, Search, FileText, Send, ChevronRight } from 'lucide-react';
import {
  heroStats,
  targetUsers,
  howItWorksSteps,
  comparisonData,
  pricingPlans,
  metricsData,
  faqData,
  aboutContent
} from '../mock';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [animatedStats, setAnimatedStats] = useState({
    jobsThisWeek: 0,
    totalJobsApplied: 0,
    hoursSaved: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentRole: '',
    targetRole: '',
    urgency: ''
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  // Animate numbers on load
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats({
        jobsThisWeek: Math.floor(heroStats.jobsThisWeek * progress),
        totalJobsApplied: Math.floor(heroStats.totalJobsApplied * progress),
        hoursSaved: Math.floor(heroStats.hoursSaved * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(heroStats);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUrgencyChange = (value) => {
    setFormData({
      ...formData,
      urgency: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          current_role: formData.currentRole,
          target_role: formData.targetRole,
          urgency: formData.urgency
        }),
      });

      if (response.ok) {
        setFormSubmitted(true);
        setFormData({ name: '', email: '', phone: '', currentRole: '', targetRole: '', urgency: '' });
        setTimeout(() => setFormSubmitted(false), 5000);
      } else {
        console.error('Failed to submit:', await response.text());
        alert('Failed to join waitlist. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to join waitlist. Please try again.');
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <header className="nav-header">
        <button onClick={() => navigate('/')} className="nav-logo">
          <img src="/logo.png" alt="Nova Ninjas" className="logo-image" />
          <span className="logo-text">Nova Ninjas</span>
        </button>
        <nav className="nav-links">
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <button onClick={() => navigate('/pricing')} className="nav-link">Pricing</button>
          <a href="#faq" className="nav-link">FAQ</a>
          <a href="#contact" className="nav-link">Contact</a>
        </nav>
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <Button variant="secondary" className="btn-secondary" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </>
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

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">We apply to 20–40 applications for you, every day.</h1>
            <p className="hero-subtitle">
              Human job application specialists who do the applying for you, so you can focus on learning, networking, and interviews.
            </p>
            <div className="hero-cta">
              <Button className="btn-primary btn-large" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}>
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              </Button>
              <Button variant="secondary" className="btn-secondary btn-large">Book a 15-min call</Button>
            </div>
          </div>
          <div className="hero-dashboard">
            <Card className="dashboard-card">
              <div className="dashboard-header">
                <h3>Our Dashboard</h3>
                <span className="dashboard-badge">Live</span>
              </div>
              <div className="dashboard-stats">
                <div className="stat-item">
                  <TrendingUp className="stat-icon" />
                  <div className="stat-content">
                    <p className="stat-label">Jobs applied this week</p>
                    <p className="stat-value">{animatedStats.jobsThisWeek}</p>
                  </div>
                </div>
                <div className="stat-item">
                  <Target className="stat-icon" />
                  <div className="stat-content">
                    <p className="stat-label">Total jobs applied</p>
                    <p className="stat-value">{animatedStats.totalJobsApplied}</p>
                  </div>
                </div>
                <div className="stat-item">
                  <Clock className="stat-icon" />
                  <div className="stat-content">
                    <p className="stat-label">Estimated hours saved</p>
                    <p className="stat-value">{animatedStats.hoursSaved}h</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Who We Help Section */}
      <section className="section who-we-help">
        <div className="container">
          <h2 className="section-title">Who we help</h2>
          <div className="user-cards">
            {targetUsers.map(user => (
              <Card key={user.id} className="user-card">
                <Users className="card-icon" />
                <h3 className="card-title">{user.title}</h3>
                <p className="card-description">{user.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section how-it-works">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <div className="steps-container">
            {howItWorksSteps.map((step, index) => (
              <div key={step.id} className="step-item">
                <div className="step-number">{step.id}</div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
                {index < howItWorksSteps.length - 1 && (
                  <ChevronRight className="step-arrow" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="section comparison">
        <div className="container">
          <h2 className="section-title">Why we're different</h2>
          <p className="section-subtitle">Human Application Crew vs. Generic AI Bots</p>
          <div className="comparison-table">
            <div className="table-header">
              <div className="header-cell feature-header"></div>
              <div className="header-cell">Nova Ninjas</div>
              <div className="header-cell">AI Bots</div>
            </div>
            {comparisonData.map((row, index) => (
              <div key={index} className="table-row">
                <div className="table-cell feature-cell">{row.feature}</div>
                <div className="table-cell check-cell">
                  {row.novaJobCrew ? <Check className="check-icon" /> : <X className="x-icon" />}
                </div>
                <div className="table-cell check-cell">
                  {row.aiBots ? <Check className="check-icon" /> : <X className="x-icon" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section pricing">
        <div className="container">
          <h2 className="section-title">Plans & Pricing</h2>
          <p className="section-subtitle">Transparent pricing based on your needs</p>
          <div className="pricing-grid">
            {pricingPlans.map(plan => (
              <Card key={plan.id} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
                {plan.featured && <div className="featured-badge">Most Popular</div>}
                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-applications">
                    <span className="applications-number">{plan.applications}</span>
                    <span className="applications-period">{plan.period}</span>
                  </div>
                  <div className="plan-price">
                    <span className="price">{plan.price}</span>
                    <span className="price-subtext">{plan.priceSubtext}</span>
                  </div>
                  <p className="plan-best-for">{plan.bestFor}</p>
                </div>
                <ul className="plan-features">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <Check className="feature-check" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className={plan.featured ? 'btn-primary w-full' : 'btn-secondary w-full'}>
                  Choose {plan.name}
                </Button>
              </Card>
            ))}
          </div>
          <p className="pricing-disclaimer">
            We don't guarantee a job offer, but we eliminate the repetitive grind so you can focus on interviews and skill-building.
          </p>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="section metrics">
        <div className="container">
          <div className="metrics-grid">
            {metricsData.map(metric => (
              <div key={metric.id} className="metric-item">
                <p className="metric-number">{metric.number}</p>
                <p className="metric-label">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section faq">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="faq-accordion">
            {faqData.map(faq => (
              <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                <AccordionTrigger className="faq-question">{faq.question}</AccordionTrigger>
                <AccordionContent className="faq-answer">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* About & Contact Section */}
      <section id="contact" className="section about-contact">
        <div className="container">
          <div className="about-content">
            <h2 className="section-title">{aboutContent.title}</h2>
            <p className="about-story">{aboutContent.story}</p>
          </div>
          <Card className="contact-card">
            <h3 className="contact-title">Join the Waitlist</h3>
            <p className="contact-subtitle">Get early access and priority onboarding</p>
            {formSubmitted ? (
              <div className="form-success">
                <Check className="success-icon" />
                <p>Thank you! We'll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="currentRole">Current or Previous Role</Label>
                  <Input
                    id="currentRole"
                    name="currentRole"
                    value={formData.currentRole}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="targetRole">Target Role</Label>
                  <Input
                    id="targetRole"
                    name="targetRole"
                    value={formData.targetRole}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select onValueChange={handleUrgencyChange} value={formData.urgency}>
                    <SelectTrigger id="urgency">
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Exploring options</SelectItem>
                      <SelectItem value="medium">Medium - Actively searching</SelectItem>
                      <SelectItem value="high">High - Need job ASAP</SelectItem>
                      <SelectItem value="urgent">Urgent - Visa/timeline pressure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="btn-primary w-full">
                  <Send className="button-icon" />
                  Join Waitlist
                </Button>
              </form>
            )}
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <button onClick={() => navigate('/')} className="footer-logo-container">
                <img src="/logo.png" alt="Nova Ninjas" className="footer-logo-image" />
                <h3 className="footer-logo">Nova Ninjas</h3>
              </button>
              <p className="footer-tagline">Human-powered job applications for serious job seekers</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4 className="footer-heading">Product</h4>
                <a href="#how-it-works" className="footer-link">How It Works</a>
                <a href="#pricing" className="footer-link">Pricing</a>
                <a href="#faq" className="footer-link">FAQ</a>
              </div>
              <div className="footer-column">
                <h4 className="footer-heading">Company</h4>
                <a href="#contact" className="footer-link">About Us</a>
                <a href="#contact" className="footer-link">Contact</a>
                <a href="#" className="footer-link">Privacy Policy</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Nova Ninjas. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
