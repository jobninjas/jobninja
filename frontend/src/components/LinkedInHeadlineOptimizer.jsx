import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Linkedin, Sparkles, Loader2, Copy, Check, RefreshCw } from 'lucide-react';
import { BRAND } from '../config/branding';
import { API_URL } from '../config/api';
import SideMenu from './SideMenu';
import Header from './Header';

const LinkedInHeadlineOptimizer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [headlines, setHeadlines] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [currentHeadline, setCurrentHeadline] = useState('');
  const [targetRole, setTargetRole] = useState('');

  const generateHeadlines = async () => {
    if (!currentHeadline) {
      alert('Please enter your current headline');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/ai/linkedin-headline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          current_headline: currentHeadline,
          target_role: targetRole
        })
      });

      const data = await response.json();
      setHeadlines(data.headlines || []);
    } catch (error) {
      console.error('Error generating headlines:', error);
      alert('Failed to generate headlines. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyHeadline = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
      <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />
      <Header onMenuClick={() => setSideMenuOpen(true)} />

      <section style={{
        background: 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)',
        padding: '4rem 2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Linkedin style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
            LinkedIn Headline Optimizer
          </h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
            Get 10 optimized headline options with keywords that recruiters search for
          </p>
        </div>
      </section>

      <section style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Card style={{ border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
            <CardHeader>
              <CardTitle>Enter Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                    Current LinkedIn Headline *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Software Engineer at Google"
                    value={currentHeadline}
                    onChange={(e) => setCurrentHeadline(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                    Target Role (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Senior Product Manager"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <Button
                  onClick={generateHeadlines}
                  disabled={loading}
                  style={{
                    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)',
                    color: 'white',
                    padding: '1rem',
                    fontSize: '1.125rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Headlines...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate 10 Optimized Headlines
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {headlines.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Your Optimized Headlines</h2>
                <Button
                  onClick={generateHeadlines}
                  style={{
                    background: 'white',
                    color: '#0a66c2',
                    border: '1px solid #0a66c2',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </Button>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {headlines.map((headline, index) => (
                  <Card key={index} style={{ border: '1px solid #e2e8f0' }}>
                    <CardContent style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{
                              background: 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)',
                              color: 'white',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}>
                              {index + 1}
                            </span>
                          </div>
                          <p style={{ fontSize: '1rem', color: '#1e293b', margin: 0, lineHeight: 1.6 }}>
                            {headline}
                          </p>
                        </div>
                        <Button
                          onClick={() => copyHeadline(headline, index)}
                          style={{
                            background: copiedId === index ? '#10b981' : '#0a66c2',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            flexShrink: 0
                          }}
                        >
                          {copiedId === index ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', border: 'none' }}>
                <CardContent style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#1e3a8a' }}>
                    💡 LinkedIn Headline Tips
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e40af', lineHeight: 1.8 }}>
                    <li>Use keywords that recruiters search for in your industry</li>
                    <li>Include your value proposition, not just your job title</li>
                    <li>Keep it under 220 characters (LinkedIn's limit)</li>
                    <li>Update your headline when changing career focus</li>
                    <li>Test different headlines and see which gets more profile views</li>
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      <footer style={{ background: '#0f172a', padding: '2rem', color: '#94a3b8', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>{BRAND.copyright}</p>
      </footer>
    </div >
  );
};

export default LinkedInHeadlineOptimizer;
