import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Bot,
  FileText,
  Sparkles,
  Search,
  Zap,
  MessageSquare,
  Briefcase,
  Target,
  TrendingUp,
  Globe,
  BookOpen,
  FileCheck,
  Lightbulb,
  Pen,
  Users,
  ArrowRight,
  Check,
  ChevronRight,
  DollarSign,
  Linkedin,
  Clock,
  FileSearch,
  Scale
} from 'lucide-react';
import { BRAND } from '../config/branding';
import SideMenu from './SideMenu';
import Header from './Header';
import './SideMenu.css';

const AINinja = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  // All available tools organized by category
  const toolCategories = [
    {
      name: "Resume Tools",
      tools: [
        {
          icon: "/tool-icons/resume-scanner.png",
          name: "Resume Scanner",
          description: "Get ATS match score & tailored resume",
          path: "/scanner",
          color: "bg-blue-50"
        },
        {
          icon: "/tool-icons/one-click-optimize.png",
          name: "One-Click Optimize",
          description: "Instantly optimize your resume for any job",
          path: "/one-click-optimize",
          color: "bg-purple-50"
        },
        {
          icon: "/tool-icons/bullet-points.png",
          name: "Bullet Points Generator",
          description: "Create powerful achievement bullets",
          path: "/bullet-points",
          color: "bg-pink-50"
        },
        {
          icon: "/tool-icons/summary-generator.png",
          name: "Summary Generator",
          description: "Craft compelling professional summaries",
          path: "/summary-generator",
          color: "bg-orange-50"
        },
        {
          icon: "/tool-icons/chatgpt-resume.png",
          name: "ChatGPT Resume",
          description: "AI-powered resume writing assistant",
          path: "/chatgpt-resume",
          color: "bg-indigo-50"
        },
        {
          icon: "/tool-icons/career-gap.png",
          name: "Career Gap Explainer",
          description: "Turn your career gap into a professional story",
          path: "/career-gap",
          color: "bg-amber-50"
        }
      ]
    },
    {
      name: "Cover Letter & LinkedIn",
      tools: [
        {
          icon: "/tool-icons/chatgpt-cover-letter.png",
          name: "ChatGPT Cover Letter",
          description: "Generate personalized cover letters",
          path: "/chatgpt-cover-letter",
          color: "bg-emerald-50"
        },
        {
          icon: "/tool-icons/linkedin-optimizer.png",
          name: "LinkedIn Optimizer",
          description: "Optimize your LinkedIn profile",
          path: "/linkedin-optimizer",
          color: "bg-blue-50"
        },
        {
          icon: "/tool-icons/linkedin-examples.png",
          name: "LinkedIn Examples",
          description: "Browse professional LinkedIn examples",
          path: "/linkedin-examples",
          color: "bg-teal-50"
        },
        {
          icon: "/tool-icons/linkedin-headline.png",
          name: "LinkedIn Headline Optimizer",
          description: "10+ headline options with recruiter keywords",
          path: "/linkedin-headline",
          color: "bg-blue-50"
        }
      ]
    },
    {
      name: "Job Search & Career",
      tools: [
        {
          icon: "/tool-icons/job-board.png",
          name: "Job Board",
          description: "Browse 5M+ visa-friendly jobs",
          path: "/jobs",
          color: "bg-teal-50"
        },
        {
          icon: "/tool-icons/ai-apply-flow.png",
          name: "AI Apply Flow",
          description: "Complete AI-powered application flow",
          path: "/ai-apply",
          color: "bg-violet-50"
        },
        {
          icon: "/tool-icons/career-change.png",
          name: "Career Change Tool",
          description: "Transition to a new career path",
          path: "/career-change",
          color: "bg-indigo-50"
        },
        {
          icon: "/tool-icons/interview-prep.png",
          name: "Interview Prep",
          description: "Practice common interview questions",
          path: "/interview-prep",
          color: "bg-red-50"
        },
        {
          icon: "/tool-icons/job-decoder.png",
          name: "Job Description Decoder",
          description: "Spot red flags and hidden requirements",
          path: "/job-decoder",
          color: "bg-purple-50"
        },
        {
          icon: "/tool-icons/offer-comparator.png",
          name: "Offer Comparison Calculator",
          description: "Analyze multiple offers and total compensation",
          path: "/offer-comparator",
          color: "bg-teal-50"
        },
        {
          icon: "/tool-icons/salary-negotiator.png",
          name: "Salary Negotiation Script",
          description: "Personalized script to negotiate your best offer",
          path: "/salary-negotiator",
          color: "bg-green-50"
        }
      ]
    },
    {
      name: "Extension & Simulation",
      tools: [
        {
          icon: "/ninjasface.png",
          name: "LinkedIn Mockup",
          description: "See our Autofill Extension in action on LinkedIn",
          path: "/linkedin-mockup",
          color: "bg-blue-50"
        }
      ]
    },
    {
      name: "Templates & Resources",
      tools: [
        {
          icon: "/tool-icons/resume-templates.png",
          name: "Resume Templates",
          description: "Professional ATS-friendly templates",
          path: "/resume-templates",
          color: "bg-cyan-50"
        },
        {
          icon: "/tool-icons/cover-letter-templates.png",
          name: "Cover Letter Templates",
          description: "Ready-to-use cover letter formats",
          path: "/cover-letter-templates",
          color: "bg-fuchsia-50"
        },
        {
          icon: "/tool-icons/ats-guides.png",
          name: "ATS Guides",
          description: "Learn how to beat applicant tracking systems",
          path: "/ats-guides",
          color: "bg-amber-50"
        },
        {
          icon: "/tool-icons/networking-templates.png",
          name: "Networking Message Templates",
          description: "LinkedIn, email, and networking templates",
          path: "/networking-templates",
          color: "bg-indigo-50"
        },
        {
          icon: "/tool-icons/interview-framework.png",
          name: "Interview Answer Framework",
          description: "Master STAR, CAR, and SOAR methods",
          path: "/interview-framework",
          color: "bg-pink-50"
        },
        {
          icon: "/tool-icons/reference-prep.png",
          name: "Reference Check Prep",
          description: "Prepare references for the best recommendation",
          path: "/reference-prep",
          color: "bg-green-50"
        }
      ]
    }
  ];

  const totalTools = toolCategories.reduce((sum, cat) => sum + cat.tools.length, 0);

  return (
    <div className="ai-ninja-page" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />
      <Header onMenuClick={() => setSideMenuOpen(true)} />

      <Header onMenuClick={() => setSideMenuOpen(true)} />

      {/* All Tools Grid */}
      <section style={{ padding: '2rem 0', background: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 800,
              marginBottom: '0.5rem',
              color: '#0f172a',
              letterSpacing: '-0.02em'
            }}>
              Complete AI Toolkit
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Everything you need to optimize your job search, all in one place
            </p>
          </div>

          {toolCategories.map((category, idx) => (
            <div key={idx} style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '1rem',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '4px',
                  height: '24px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  borderRadius: '2px'
                }}></div>
                {category.name}
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {category.tools.map((tool, toolIdx) => (
                  <Card
                    key={toolIdx}
                    onClick={() => navigate(tool.path)}
                    style={{
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '1px solid #e2e8f0',
                      background: 'white',
                      borderRadius: '12px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >

                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      marginBottom: '0.25rem',
                      color: '#0f172a'
                    }}>
                      {tool.name}
                    </h4>

                    <p style={{
                      fontSize: '0.8rem',
                      color: '#64748b',
                      lineHeight: 1.4,
                      marginBottom: '0'
                    }}>
                      {tool.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Footer */}
      <footer style={{ background: 'transparent', padding: '2rem 0', color: '#64748b' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem' }}>{BRAND.copyright}</p>
        </div>
      </footer>
    </div>
  );
};

export default AINinja;
