import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideMenu from './SideMenu';
import Header from './Header';
import { 
  Briefcase, Calendar, CheckCircle2, ChevronRight, BrainCircuit, 
  Target, TrendingUp, Mic, ShieldCheck, Sparkles, Award, Star
} from 'lucide-react';
import './SideMenu.css';
import './AINinja.css';
import { BRAND } from '../config/branding';
import { apiCall } from '../config/api';

const AINinja = () => {
  const navigate = useNavigate();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  
  // Waitlist Form State
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '' });
  const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success, error

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitWaitlist = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setFormStatus('submitting');
    
    try {
      const result = await apiCall('/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.mobile,
          source: 'ai_ninja'
        })
      });
      console.log('Waitlist submission success:', result);
      setFormStatus('success');
      setFormData({ name: '', email: '', mobile: '' });
    } catch (error) {
      console.error('Waitlist submission failed:', error);
      // In a real app we might show an error state, but failing silently or alerting works for MVP
      alert('Failed to join waitlist. Please try again.');
      setFormStatus('idle');
    }
  };

  const scrollToWaitlist = () => {
    const el = document.getElementById('waitlist-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Moved Header and SideMenu to DashboardLayout wrapping this route */}

      {/* Main Light Theme Sub-Wrapper */}
      <div className="ninja-wrapper">
        
        {/* 🔥 HERO SECTION */}
        <section className="ninja-hero-bg" style={{ padding: '6rem 2rem 4rem', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '2rem', color: '#2563eb', fontSize: '0.875rem', fontWeight: 600 }}>
            <Sparkles size={16} />
            Introduing AI Ninja
          </div>
          
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', maxWidth: '900px', letterSpacing: '-0.03em', color: '#0f172a' }}>
            Turn Your Resume Into <br/>
            <span className="ninja-gradient-text">Daily Interview Mastery</span>
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: '#475569', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
            AI Ninja analyzes your skills, builds a personalized monthly roadmap, and trains you every day with real interview simulations.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '4rem' }}>
            <button onClick={scrollToWaitlist} className="ninja-btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Join Waitlist <ChevronRight size={20} />
            </button>
            <button onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })} className="ninja-btn-outline" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              See How It Works
            </button>
          </div>

          {/* Setup Mockup */}
          <div className="ninja-glass-card" style={{ maxWidth: '900px', width: '100%', margin: '0 auto', padding: '1rem', background: '#ffffff' }}>
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'left', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 600 }}>Current Score</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>84<span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>/100</span></div>
                <div style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}><TrendingUp size={14}/> +12 this week</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 600 }}>Today's Focus</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>System Design & Scaling</div>
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Day 14 of 30 Roadmap</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="pulse-ring" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mic size={24} color="white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ⚡ HOW IT WORKS */}
        <section id="how-it-works" style={{ padding: '6rem 2rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>How AI Ninja Works</h2>
              <p style={{ fontSize: '1.1rem', color: '#64748b' }}>A continuous loop of preparation and perfection.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {[
                { icon: <Briefcase size={24} />, title: '1. Upload Resume', desc: 'AI extracts your skills and identifies gaps instantly.' },
                { icon: <Target size={24} />, title: '2. Select Your Skills', desc: 'Choose what you know and what you want to learn.' },
                { icon: <Calendar size={24} />, title: '3. Get Monthly Roadmap', desc: 'AI generates a 30-day structured plan with daily topics.' },
                { icon: <Mic size={24} />, title: '4. Daily AI Interviews', desc: 'Practice every day with chat or voice-based mock interviews.' },
                { icon: <BrainCircuit size={24} />, title: '5. Get Scored & Improve', desc: 'Receive detailed feedback, scores, and specific improvement suggestions.' },
                { icon: <TrendingUp size={24} />, title: '6. Track Progress', desc: 'Monitor your growth with real performance analytics over time.' }
              ].map((step, i) => (
                <div key={i} className="ninja-glass-card" style={{ padding: '2rem', background: '#ffffff' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    {step.icon}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>{step.title}</h3>
                  <p style={{ color: '#475569', lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 🧠 FEATURES SECTION */}
        <section style={{ padding: '6rem 2rem', background: '#ffffff' }}>
           <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>Mastering Every Aspect</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {[
                'Personalized Skill Analysis', 'Adaptive Interview Questions', 'Real-Time Feedback & Scoring',
                'Monthly Performance Reports', 'Voice + Chat Interview Modes', 'Weakness Detection & Plan'
              ].map((feature, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <CheckCircle2 size={24} color="#3b82f6" />
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 💎 FREE VS PAID */}
        <section style={{ padding: '6rem 2rem', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>Choose Your Path</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {/* Free Tier */}
              <div className="ninja-glass-card" style={{ padding: '3rem 2rem', background: '#ffffff' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Free</h3>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', color: '#0f172a' }}>$0 <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>/ forever</span></div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {['Resume analysis', 'Skill suggestions', 'Monthly roadmap', 'Chat-based interviews', 'Basic feedback reports'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569' }}>
                      <CheckCircle2 size={18} color="#94a3b8" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Tier */}
              <div className="ninja-glass-card ninja-pro-card" style={{ padding: '3rem 2rem', background: '#ffffff', border: '2px solid #3b82f6' }}>
                <div className="ninja-pro-badge">Most Popular</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }} className="ninja-gradient-text">AI Ninja Pro</h3>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', color: '#0f172a' }}>Coming Soon</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                    <CheckCircle2 size={18} color="#3b82f6" /> Everything in free
                  </li>
                  {['Daily AI voice interviews', 'Scheduled interview sessions', 'Advanced feedback & scoring', 'Monthly performance reports', 'Leaderboard access (visible to recruiters)'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569' }}>
                      <CheckCircle2 size={18} color="#3b82f6" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 🏆 LEADERBOARD */}
        <section style={{ padding: '6rem 2rem', background: '#ffffff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Get Noticed by Recruiters</h2>
              <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '2rem', lineHeight: 1.6 }}>
                Top-performing AI Ninja users appear on an exclusive leaderboard. 
                Recruiters use this to bypass the resume pile and discover candidates who consistently prove their skills.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['Ranked by Skills', 'Ranked by Performance', 'Ranked by Consistency'].map((item, i) => (
                   <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Award size={20} color="#3b82f6" /> <span style={{ fontWeight: 600, color: '#0f172a' }}>{item}</span>
                   </div>
                ))}
              </div>
            </div>
            
            <div className="ninja-glass-card" style={{ padding: '1.5rem', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>
                <span style={{ fontWeight: 700 }}>Global Leaderboard</span>
                <span style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: 600 }}>Top 1%</span>
              </div>
              {[
                { name: 'Alex F.', role: 'Senior React Dev', score: 98 },
                { name: 'Sarah J.', role: 'Backend Engineer', score: 96 },
                { name: 'Michael T.', role: 'Product Manager', score: 94 },
              ].map((user, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: i !== 2 ? '1px solid #e2e8f0' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{i+1}</div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{user.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.role}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#10b981' }}>{user.score}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 🎯 TRUST SECTION */}
        <section style={{ padding: '4rem 2rem', background: '#f8fafc', textAlign: 'center' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
            {[
              { icon: <ShieldCheck size={32} />, text: 'Not theory — daily real interview practice' },
              { icon: <Star size={32} />, text: 'Not courses — actual skill evaluation' },
              { icon: <TrendingUp size={32} />, text: 'Not guessing — data-driven improvement' }
            ].map((trust, i) => (
              <div key={i} style={{ flex: '1 1 250px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: '#3b82f6' }}>{trust.icon}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{trust.text}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 🚀 FINAL CTA & WAITLIST */}
        <section id="waitlist-section" style={{ padding: '8rem 2rem', textAlign: 'center', position: 'relative', background: '#ffffff' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 60%)', zIndex: 0, pointerEvents: 'none' }}></div>
          
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>Stop Preparing. <br/><span className="ninja-gradient-text">Start Proving.</span></h2>
            <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '3rem' }}>Join AI Ninja and train like real interviews every single day.</p>
            
            <div className="ninja-glass-card" style={{ padding: '3rem 2rem', textAlign: 'left', border: '1px solid rgba(59, 130, 246, 0.2)', background: '#ffffff', boxShadow: '0 10px 30px -5px rgba(59, 130, 246, 0.1)' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '0.75rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                <span style={{ fontWeight: 600, color: '#2563eb' }}>Limited early access:</span> Join today and get <strong style={{ color: '#0f172a' }}>10% OFF</strong> when we launch.
              </div>

              {formStatus === 'success' ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ display: 'inline-flex', background: '#10b981', borderRadius: '50%', padding: '1rem', marginBottom: '1rem' }}>
                    <CheckCircle2 size={32} color="white" />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>You're on the list!</h3>
                  <p style={{ color: '#64748b' }}>Keep an eye on your inbox. We'll notify you as soon as your spot opens up.</p>
                </div>
              ) : (
                <form onSubmit={submitWaitlist} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name *</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="ninja-input" placeholder="John Doe" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address *</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="ninja-input" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 500 }}>Mobile Number</label>
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} className="ninja-input" placeholder="+1 (555) 000-0000" />
                  </div>
                  <button type="submit" disabled={formStatus === 'submitting'} className="ninja-btn-primary" style={{ padding: '16px', fontSize: '1.1rem', marginTop: '1rem', opacity: formStatus === 'submitting' ? 0.7 : 1 }}>
                    {formStatus === 'submitting' ? 'Reserving...' : 'Reserve My Spot'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid #e2e8f0', padding: '2rem 0', textAlign: 'center', color: '#64748b', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <p style={{ fontSize: '0.875rem' }}>{BRAND.copyright} - JobNinjas.space</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default AINinja;
