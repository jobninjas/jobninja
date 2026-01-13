import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from './ui/card';
import {
  Bot,
  UserCheck,
  ClipboardList,
  Search,
  Sparkles,
  Send,
  Check,
  ArrowRight,
  Clock,
  Shield,
  Users,
  Menu
} from 'lucide-react';
import { BRAND, PRICING } from '../config/branding';
import BookCallModal from './BookCallModal';
import SideMenu from './SideMenu';
import Header from './Header';
import './SideMenu.css';

const HumanNinja = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isBookCallModalOpen, setIsBookCallModalOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  const steps = [
    {
      icon: <ClipboardList className="w-8 h-8" />,
      title: "Intake call / form",
      description: "Share your resume, LinkedIn, target roles, locations, salary expectations, and visa situation. We get to know exactly what you're looking for."
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Targeted role search",
      description: "We shortlist relevant roles (visa-friendly, remote, higher-paying, etc.) from our job board and other sources that match your profile."
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-assisted, human-led tailoring",
      description: "We use AI to draft your application materials quickly, then our human specialists review, edit, and decide where to apply. Quality over quantity."
    },
    {
      icon: <Send className="w-8 h-8" />,
      title: "Manual applying + tracking",
      description: "We submit applications for you and log everything into your Application Tracker. You focus on preparing for interviews."
    }
  ];

  const humanNinjaPlans = [
    PRICING.HUMAN_STARTER,
    {
      ...PRICING.HUMAN_GROWTH,
      popular: true
    },
    PRICING.HUMAN_SCALE,
    PRICING.HUMAN_ENTERPRISE
  ];

  return (
    <div className="human-ninja-page">
      {/* Side Menu */}
      <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />

      {/* Navigation Header */}
      <Header onMenuClick={() => setSideMenuOpen(true)} />

      {/* Hero Section */}
      <section className="human-ninja-hero">
        <div className="container">
          <div className="hero-badge-premium">
            <UserCheck className="w-5 h-5" />
            <span>Human Ninja – Done-for-You</span>
          </div>
          <h1 className="human-ninja-title">
            No time to apply? <span className="text-gradient">Let a human Ninja run your search.</span>
          </h1>
          <p className="human-ninja-subtitle">
            Our team handles the grind: shortlisting roles, prepping applications, and keeping your pipeline updated – while you focus on interviews.
          </p>
          <div className="hero-cta">
            <Button className="btn-primary btn-large" onClick={() => setIsBookCallModalOpen(true)}>
              Book Free Consultation
            </Button>
            <Button variant="outline" className="btn-secondary btn-large" onClick={() => navigate('/pricing')}>
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How Human Ninja Works</h2>
          <p className="section-subtitle">We handle your entire job application process in 4 simple steps</p>

          <div className="steps-grid">
            {steps.map((step, index) => (
              <Card key={index} className="step-card">
                <div className="step-number">{index + 1}</div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <h2 className="section-title">Why Choose Human Ninja?</h2>
          <div className="benefits-grid">
            <Card className="benefit-card">
              <Clock className="w-8 h-8 benefit-icon" />
              <h3>Save 20+ Hours/Week</h3>
              <p>Stop spending evenings and weekends on tedious job applications. We handle the grind.</p>
            </Card>
            <Card className="benefit-card">
              <Shield className="w-8 h-8 benefit-icon" />
              <h3>Protected Reputation</h3>
              <p>We never spam. One smart, targeted application per company – protecting your professional image.</p>
            </Card>
            <Card className="benefit-card">
              <Users className="w-8 h-8 benefit-icon" />
              <h3>Real Human Judgment</h3>
              <p>AI helps us work faster, but every decision and submission is made by a human specialist.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section - Dark Theme */}
      <section className="py-16 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <h1 className="text-center text-4xl font-semibold lg:text-5xl">Human Ninja Pricing</h1>
            <p className="text-muted-foreground">Our team applies for you using AI + human judgment. You focus on interviews.</p>
          </div>

          <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-2 lg:grid-cols-4">
            {humanNinjaPlans.map((plan, index) => (
              <Card key={plan.id} className={`flex flex-col bg-zinc-900 text-white border-none shadow-none ${plan.popular ? 'relative' : ''}`}>
                {plan.popular && (
                  <span className="absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full bg-gradient-to-r from-purple-400 to-amber-300 px-3 py-1 text-xs font-medium text-amber-950 ring-1 ring-inset ring-white/20 ring-offset-1 ring-offset-gray-950/5">Popular</span>
                )}

                <CardHeader className={plan.popular ? 'pt-8' : ''}>
                  <CardTitle className="font-medium text-white">{plan.name}</CardTitle>
                  <span className="my-3 block text-2xl font-semibold text-white">
                    {plan.priceDisplay}
                    {!plan.isEnterprise && <span className="text-lg font-normal text-gray-400"> / {plan.applications} apps</span>}
                  </span>
                  <CardDescription className="text-sm text-gray-400">
                    {plan.isEnterprise ? 'For high-volume needs' : 'Per package'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 flex-1">
                  <hr className="border-dashed border-zinc-700" />
                  <ul className="list-outside space-y-3 text-sm">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-300">
                        <Check className="size-3 text-gray-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="mt-auto">
                  <Button
                    variant="outline"
                    className={`w-full ${plan.popular ? 'bg-zinc-800 border-blue-500 text-white hover:bg-zinc-700' : 'bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700'}`}
                    onClick={() => setIsBookCallModalOpen(true)}
                  >
                    {plan.isEnterprise ? 'Contact Us' : 'Get Started'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            We do not guarantee a job or visa outcome. We run a serious, structured job search process so you're not doing this alone.
          </p>
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
              <Button variant="outline" className="btn-secondary w-full" onClick={() => navigate('/ai-ninja')}>
                Try AI Ninja
              </Button>
            </Card>

            <Card className="comparison-card human-card active">
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
              <Button className="btn-primary w-full" onClick={() => setIsBookCallModalOpen(true)}>
                Book Consultation
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <Card className="cta-card">
            <h2>Ready to let a Ninja handle your job search?</h2>
            <p>Book a free consultation to discuss your goals and get started.</p>
            <Button className="btn-primary btn-large" onClick={() => setIsBookCallModalOpen(true)}>
              <UserCheck className="w-5 h-5" /> Book Free Consultation
            </Button>
          </Card>
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

      {/* Book Call Modal */}
      <BookCallModal
        isOpen={isBookCallModalOpen}
        onClose={() => setIsBookCallModalOpen(false)}
      />
    </div>
  );
};

export default HumanNinja;


