import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Copy, Check, Target, MessageCircle, Briefcase } from 'lucide-react';
import { BRAND } from '../config/branding';
import SideMenu from './SideMenu';
import Header from './Header';

const InterviewFramework = () => {
    const navigate = useNavigate();
    const [sideMenuOpen, setSideMenuOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [selectedFramework, setSelectedFramework] = useState('star');

    const frameworks = {
        star: {
            name: 'STAR Method',
            description: 'For behavioral interview questions',
            icon: <Target className="w-5 h-5" />,
            structure: [
                { label: 'Situation', description: 'Set the context for your story', example: 'In my previous role as a marketing manager at XYZ Corp...' },
                { label: 'Task', description: 'Describe the challenge or responsibility', example: 'I was tasked with increasing our social media engagement by 50% in Q3...' },
                { label: 'Action', description: 'Explain what you did', example: 'I developed a comprehensive content strategy that included daily posts, influencer partnerships, and user-generated content campaigns...' },
                { label: 'Result', description: 'Share the outcome with metrics', example: 'As a result, we achieved a 73% increase in engagement, gained 10K new followers, and generated $50K in sales from social channels.' }
            ],
            template: `**Situation:** [Set the context - where, when, what was happening]

**Task:** [What was the challenge or goal you needed to achieve]

**Action:** [What specific steps did you take? Be detailed]

**Result:** [What was the outcome? Include metrics if possible]`,
            examples: [
                {
                    question: '"Tell me about a time you overcame a challenge"',
                    answer: `**Situation:** In my role as a project manager, our team was behind schedule on a critical product launch with only 2 weeks until the deadline.

**Task:** I needed to get the project back on track without compromising quality or burning out the team.

**Action:** I reorganized the team into focused pods, eliminated non-essential meetings, implemented daily 15-minute standups, and personally took on some coding tasks to help the developers.

**Result:** We launched on time with all core features complete. The product received a 4.8/5 rating from early users, and our team actually reported feeling less stressed than before the reorganization.`
                }
            ]
        },
        car: {
            name: 'CAR Method',
            description: 'Simpler alternative to STAR',
            icon: <Briefcase className="w-5 h-5" />,
            structure: [
                { label: 'Context', description: 'Brief background of the situation', example: 'While working as a sales rep at ABC Company...' },
                { label: 'Action', description: 'What you did', example: 'I implemented a new follow-up system using automated emails and personalized video messages...' },
                { label: 'Result', description: 'The outcome', example: 'This increased my close rate from 15% to 28% and I became the top performer in my region.' }
            ],
            template: `**Context:** [Brief background]

**Action:** [What you did]

**Result:** [The outcome with metrics]`,
            examples: [
                {
                    question: '"Describe a time you improved a process"',
                    answer: `**Context:** Our customer support team was overwhelmed with repetitive questions, leading to slow response times.

**Action:** I created a comprehensive FAQ database and implemented a chatbot for common queries, freeing up the team to handle complex issues.

**Result:** Average response time dropped from 4 hours to 45 minutes, and customer satisfaction scores increased by 35%.`
                }
            ]
        },
        soar: {
            name: 'SOAR Method',
            description: 'For highlighting achievements',
            icon: <MessageCircle className="w-5 h-5" />,
            structure: [
                { label: 'Situation', description: 'The context', example: 'Our company was losing market share to competitors...' },
                { label: 'Obstacle', description: 'The specific challenge', example: 'Our product was perceived as outdated and expensive...' },
                { label: 'Action', description: 'Your solution', example: 'I led a complete product redesign and pricing restructure...' },
                { label: 'Result', description: 'The impact', example: 'We regained 15% market share and revenue increased by $2M.' }
            ],
            template: `**Situation:** [The context]

**Obstacle:** [The specific challenge or problem]

**Action:** [Your solution and what you did]

**Result:** [The measurable impact]`,
            examples: [
                {
                    question: '"Tell me about your biggest achievement"',
                    answer: `**Situation:** Our startup was struggling to acquire users in a competitive market.

**Obstacle:** We had limited marketing budget and were unknown compared to established competitors.

**Action:** I developed a viral referral program that rewarded both referrers and new users, and partnered with micro-influencers for authentic promotion.

**Result:** We grew from 500 to 50,000 users in 6 months, with 60% coming from referrals, and secured Series A funding based on this growth.`
                }
            ]
        }
    };

    const currentFramework = frameworks[selectedFramework];

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
            <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />
            <Header onMenuClick={() => setSideMenuOpen(true)} />

            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                padding: '4rem 2rem',
                textAlign: 'center',
                color: 'white'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                        Interview Answer Framework
                    </h1>
                    <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
                        Master the STAR, CAR, and SOAR methods for behavioral interviews
                    </p>
                </div>
            </section>

            {/* Framework Selector */}
            <section style={{ padding: '2rem', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {Object.entries(frameworks).map(([key, framework]) => (
                        <Button
                            key={key}
                            onClick={() => setSelectedFramework(key)}
                            style={{
                                background: selectedFramework === key ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' : 'white',
                                color: selectedFramework === key ? 'white' : '#64748b',
                                border: selectedFramework === key ? 'none' : '1px solid #e2e8f0',
                                padding: '0.75rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {framework.icon}
                            {framework.name}
                        </Button>
                    ))}
                </div>
            </section>

            {/* Framework Content */}
            <section style={{ padding: '4rem 2rem' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {/* Framework Description */}
                    <Card style={{ marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                        <CardHeader>
                            <CardTitle style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {currentFramework.icon}
                                {currentFramework.name}
                            </CardTitle>
                            <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>{currentFramework.description}</p>
                        </CardHeader>
                    </Card>

                    {/* Structure Breakdown */}
                    <Card style={{ marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                        <CardHeader>
                            <CardTitle>Framework Structure</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                {currentFramework.structure.map((step, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            flexShrink: 0
                                        }}>
                                            {index + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem', color: '#1e293b' }}>
                                                {step.label}
                                            </h4>
                                            <p style={{ color: '#64748b', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                                {step.description}
                                            </p>
                                            <p style={{ color: '#475569', fontSize: '0.875rem', fontStyle: 'italic', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', margin: 0 }}>
                                                Example: "{step.example}"
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Template */}
                    <Card style={{ marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                        <CardHeader>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <CardTitle>Answer Template</CardTitle>
                                <Button
                                    onClick={() => copyToClipboard(currentFramework.template, 'template')}
                                    style={{
                                        background: copiedId === 'template' ? '#10b981' : '#ec4899',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {copiedId === 'template' ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy Template
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <pre style={{
                                background: '#f8fafc',
                                padding: '1.5rem',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                lineHeight: 1.8,
                                whiteSpace: 'pre-wrap',
                                fontFamily: "'Inter', sans-serif",
                                color: '#1e293b',
                                margin: 0
                            }}>
                                {currentFramework.template}
                            </pre>
                        </CardContent>
                    </Card>

                    {/* Example Answers */}
                    <Card style={{ border: '1px solid #e2e8f0' }}>
                        <CardHeader>
                            <CardTitle>Example Answer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {currentFramework.examples.map((example, index) => (
                                <div key={index}>
                                    <p style={{ fontWeight: 600, color: '#ec4899', marginBottom: '1rem' }}>
                                        Question: {example.question}
                                    </p>
                                    <pre style={{
                                        background: '#fef2f2',
                                        padding: '1.5rem',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        lineHeight: 1.8,
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: "'Inter', sans-serif",
                                        color: '#1e293b',
                                        margin: 0,
                                        border: '1px solid #fecaca'
                                    }}>
                                        {example.answer}
                                    </pre>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Tips */}
                    <Card style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', border: 'none' }}>
                        <CardContent style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#1e3a8a' }}>
                                💡 Pro Tips for Using These Frameworks
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e40af', lineHeight: 1.8 }}>
                                <li>Prepare 5-7 stories that can be adapted to different questions</li>
                                <li>Always include specific metrics and numbers in your results</li>
                                <li>Practice out loud - it should sound natural, not robotic</li>
                                <li>Keep answers to 1-2 minutes maximum</li>
                                <li>Focus on YOUR actions, not what the team did</li>
                                <li>End with a positive result, even if the situation was challenging</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#0f172a', padding: '2rem', color: '#94a3b8', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>{BRAND.copyright}</p>
            </footer>
        </div>
    );
};

export default InterviewFramework;
