import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { CheckCircle, AlertCircle, Users, Phone, Mail } from 'lucide-react';
import { BRAND } from '../config/branding';
import SideMenu from './SideMenu';
import Header from './Header';

const ReferenceCheckPrep = () => {
    const navigate = useNavigate();
    const [sideMenuOpen, setSideMenuOpen] = useState(false);

    const commonQuestions = [
        {
            question: "How do you know the candidate?",
            tip: "Prep your reference to mention specific projects you worked on together",
            example: "I was Sarah's direct manager for 2 years at XYZ Corp, where she led our marketing team."
        },
        {
            question: "What were their main responsibilities?",
            tip: "Make sure they can speak to your key achievements",
            example: "Sarah managed a team of 5, oversaw our social media strategy, and was responsible for our $500K marketing budget."
        },
        {
            question: "What are their strengths?",
            tip: "Align this with the job you're applying for",
            example: "Sarah excels at data-driven decision making and has exceptional leadership skills. She increased our engagement by 150%."
        },
        {
            question: "What areas could they improve?",
            tip: "Prepare a 'weakness' that's actually a strength",
            example: "Sometimes Sarah can be too detail-oriented, which occasionally slows down projects, but it ensures exceptional quality."
        },
        {
            question: "Would you rehire them?",
            tip: "This should always be a strong yes",
            example: "Absolutely, without hesitation. Sarah was one of our top performers and I'd love to work with her again."
        },
        {
            question: "How did they handle pressure/deadlines?",
            tip: "Have a specific example ready",
            example: "During our Q4 campaign, Sarah managed 3 major launches simultaneously and delivered everything on time with outstanding results."
        },
        {
            question: "How did they work with the team?",
            tip: "Emphasize collaboration and leadership",
            example: "Sarah was a natural leader who mentored junior team members and fostered a collaborative environment."
        },
        {
            question: "Why did they leave?",
            tip: "Keep it positive and forward-looking",
            example: "Sarah was seeking new challenges and growth opportunities that aligned with her career goals."
        }
    ];

    const prepSteps = [
        {
            title: "Choose the Right References",
            icon: <Users className="w-6 h-6" />,
            tips: [
                "Direct managers are best (not peers or subordinates)",
                "Recent references (within last 2-3 years)",
                "People who can speak to skills relevant to the new role",
                "Have 3-5 references ready (companies usually check 2-3)"
            ]
        },
        {
            title: "Ask Permission First",
            icon: <Phone className="w-6 h-6" />,
            tips: [
                "Never list someone without asking them first",
                "Explain the role you're applying for",
                "Confirm their current contact information",
                "Ask if they're comfortable being a reference"
            ]
        },
        {
            title: "Prep Your References",
            icon: <Mail className="w-6 h-6" />,
            tips: [
                "Send them your updated resume",
                "Share the job description",
                "Remind them of specific projects/achievements",
                "Give them a heads up when to expect a call",
                "Provide talking points aligned with the role"
            ]
        }
    ];

    const emailTemplate = `Subject: Reference Request for [Company Name] Opportunity

Hi [Reference Name],

I hope you're doing well! I'm excited to share that I'm in the final stages of the interview process for a [Position] role at [Company Name].

They've requested references, and I was hoping you'd be comfortable serving as one. The role focuses on [key responsibilities], which aligns well with the work we did together on [specific project].

If you're able to help, here are a few key points that might be helpful to mention:
• [Achievement 1]
• [Achievement 2]
• [Skill/quality relevant to new role]

I've attached my current resume and the job description for your reference. The hiring manager may reach out in the next week or so.

Please let me know if you have any questions or if there's anything I can provide to make this easier for you!

Thank you so much for your support.

Best regards,
[Your Name]
[Your Phone]
[Your Email]`;

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
            <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />
            <Header onMenuClick={() => setSideMenuOpen(true)} />

            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '4rem 2rem',
                textAlign: 'center',
                color: 'white'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                        Reference Check Prep
                    </h1>
                    <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
                        Prepare your references to give you the best recommendation possible
                    </p>
                </div>
            </section>

            {/* Prep Steps */}
            <section style={{ padding: '4rem 2rem' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>
                        How to Prepare Your References
                    </h2>

                    <div style={{ display: 'grid', gap: '2rem', marginBottom: '3rem' }}>
                        {prepSteps.map((step, index) => (
                            <Card key={index} style={{ border: '1px solid #e2e8f0' }}>
                                <CardHeader>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}>
                                            {step.icon}
                                        </div>
                                        <CardTitle style={{ fontSize: '1.25rem' }}>{step.title}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 1.8, color: '#475569' }}>
                                        {step.tips.map((tip, tipIndex) => (
                                            <li key={tipIndex}>{tip}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Common Questions */}
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>
                        What Employers Will Ask Your References
                    </h2>

                    <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '3rem' }}>
                        {commonQuestions.map((item, index) => (
                            <Card key={index} style={{ border: '1px solid #e2e8f0' }}>
                                <CardContent style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            fontSize: '0.875rem',
                                            flexShrink: 0
                                        }}>
                                            {index + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
                                                "{item.question}"
                                            </h4>
                                            <p style={{ color: '#10b981', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                                                💡 {item.tip}
                                            </p>
                                            <p style={{ color: '#64748b', fontSize: '0.875rem', fontStyle: 'italic', background: '#f0fdf4', padding: '0.75rem', borderRadius: '6px', margin: 0 }}>
                                                Example: "{item.example}"
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Email Template */}
                    <Card style={{ border: '1px solid #e2e8f0' }}>
                        <CardHeader>
                            <CardTitle>Email Template to Send Your References</CardTitle>
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
                                {emailTemplate}
                            </pre>
                        </CardContent>
                    </Card>

                    {/* Red Flags */}
                    <Card style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', border: 'none' }}>
                        <CardContent style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertCircle className="w-6 h-6" />
                                Red Flags to Avoid
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#7f1d1d', lineHeight: 1.8 }}>
                                <li>Listing someone who doesn't know you well or can't speak to your work</li>
                                <li>Using personal references instead of professional ones</li>
                                <li>Not giving your references a heads up before the company calls</li>
                                <li>Providing outdated contact information</li>
                                <li>Listing someone who you left on bad terms with</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Success Tips */}
                    <Card style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', border: 'none' }}>
                        <CardContent style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle className="w-6 h-6" />
                                Pro Tips for Success
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#064e3b', lineHeight: 1.8 }}>
                                <li>Send a thank you note after your reference helps you</li>
                                <li>Keep them updated on your job search progress</li>
                                <li>Return the favor - offer to be a reference for them</li>
                                <li>Maintain relationships even when you're not job searching</li>
                                <li>If you get the job, let them know and thank them again!</li>
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

export default ReferenceCheckPrep;
