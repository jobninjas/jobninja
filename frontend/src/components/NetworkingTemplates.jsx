import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Copy, Check, Mail, MessageSquare, Users, Linkedin } from 'lucide-react';
import { BRAND } from '../config/branding';
import SideMenu from './SideMenu';
import Header from './Header';

const NetworkingTemplates = () => {
    const navigate = useNavigate();
    const [sideMenuOpen, setSideMenuOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const templates = [
        {
            id: 'linkedin-connection',
            title: 'LinkedIn Connection Request',
            icon: <Linkedin className="w-5 h-5" />,
            context: 'When connecting with someone you don\'t know',
            template: `Hi [Name],

I came across your profile and was impressed by your work in [their field/company]. I'm currently [your role/situation] and would love to connect and learn from your experience in [specific area].

Looking forward to connecting!

Best,
[Your Name]`
        },
        {
            id: 'cold-email-recruiter',
            title: 'Cold Email to Recruiter',
            icon: <Mail className="w-5 h-5" />,
            context: 'Reaching out to a recruiter about opportunities',
            template: `Subject: [Your Role] with [X] years experience - Interested in [Company]

Hi [Recruiter Name],

I hope this email finds you well. I'm a [Your Role] with [X] years of experience in [industry/skills], and I'm very interested in opportunities at [Company].

I've been following [Company]'s work in [specific area] and believe my background in [relevant experience] would be a strong fit for your team.

Would you be open to a brief call to discuss potential opportunities?

I've attached my resume for your review.

Best regards,
[Your Name]
[LinkedIn URL]
[Phone]`
        },
        {
            id: 'follow-up-interview',
            title: 'Post-Interview Follow-Up',
            icon: <MessageSquare className="w-5 h-5" />,
            context: 'After an interview to show continued interest',
            template: `Subject: Thank you - [Position] Interview

Hi [Interviewer Name],

Thank you for taking the time to speak with me today about the [Position] role. I really enjoyed learning more about [specific topic discussed] and the team's approach to [specific project/challenge].

Our conversation reinforced my enthusiasm for the opportunity. I'm particularly excited about [specific aspect of the role] and believe my experience with [relevant skill] would allow me to contribute immediately.

Please don't hesitate to reach out if you need any additional information.

Looking forward to hearing from you!

Best,
[Your Name]`
        },
        {
            id: 'informational-interview',
            title: 'Informational Interview Request',
            icon: <Users className="w-5 h-5" />,
            context: 'When seeking career advice from someone in your target role',
            template: `Subject: Quick coffee chat about [their role/industry]?

Hi [Name],

I hope you're doing well! I'm currently exploring opportunities in [field/industry] and came across your profile. Your career path from [previous role] to [current role] is exactly the trajectory I'm hoping to follow.

Would you be open to a 15-20 minute coffee chat (virtual or in-person) where I could learn from your experience? I'd love to hear your insights on [specific topic].

I'm happy to work around your schedule!

Thanks for considering,
[Your Name]`
        },
        {
            id: 'networking-event-followup',
            title: 'Networking Event Follow-Up',
            icon: <MessageSquare className="w-5 h-5" />,
            context: 'After meeting someone at a conference or event',
            template: `Subject: Great meeting you at [Event Name]!

Hi [Name],

It was great meeting you at [Event Name] yesterday! I really enjoyed our conversation about [topic you discussed].

I'd love to stay in touch and continue the conversation. Would you be interested in connecting on LinkedIn?

[Optional: Include a specific follow-up question or offer to help with something they mentioned]

Looking forward to staying connected!

Best,
[Your Name]`
        },
        {
            id: 'referral-request',
            title: 'Employee Referral Request',
            icon: <Users className="w-5 h-5" />,
            context: 'Asking a connection to refer you for a role',
            template: `Subject: Referral request for [Position] at [Company]

Hi [Name],

I hope you're doing well! I saw that [Company] is hiring for a [Position] role, and I'm very interested in applying. Given your experience there, I wanted to reach out and see if you'd be comfortable providing a referral.

I believe my background in [relevant experience] aligns well with the role's requirements, particularly [specific requirement].

I completely understand if you're not able to, but I'd really appreciate any support you could provide!

I've attached my resume for your reference.

Thanks so much,
[Your Name]`
        }
    ];

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
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                padding: '4rem 2rem',
                textAlign: 'center',
                color: 'white'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                        Networking Message Templates
                    </h1>
                    <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
                        Ready-to-use templates for LinkedIn, email, and networking events
                    </p>
                </div>
            </section>

            {/* Templates Grid */}
            <section style={{ padding: '4rem 2rem' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gap: '2rem' }}>
                        {templates.map((template) => (
                            <Card key={template.id} style={{ border: '1px solid #e2e8f0' }}>
                                <CardHeader>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}>
                                            {template.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <CardTitle style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                                                {template.title}
                                            </CardTitle>
                                            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                                                {template.context}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => copyToClipboard(template.template, template.id)}
                                            style={{
                                                background: copiedId === template.id ? '#10b981' : '#6366f1',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            {copiedId === template.id ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    Copy
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
                                        lineHeight: 1.6,
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: "'Inter', sans-serif",
                                        color: '#1e293b',
                                        margin: 0
                                    }}>
                                        {template.template}
                                    </pre>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Tips Section */}
                    <Card style={{ marginTop: '3rem', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: 'none' }}>
                        <CardContent style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#92400e' }}>
                                💡 Pro Tips
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#78350f', lineHeight: 1.8 }}>
                                <li>Always personalize the template - mention specific details about the person or company</li>
                                <li>Keep messages concise - respect their time</li>
                                <li>Include a clear call-to-action (what you want them to do)</li>
                                <li>Proofread before sending - typos hurt credibility</li>
                                <li>Follow up if you don't hear back in 5-7 days</li>
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

export default NetworkingTemplates;
