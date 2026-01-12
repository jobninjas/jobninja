import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
    Linkedin,
    Copy,
    Check,
    User,
    FileText,
    Briefcase,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import SideMenu from './SideMenu';
import Header from './Header';
import './LinkedInExamples.css';

const LinkedInExamples = () => {
    const [sideMenuOpen, setSideMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('headlines');
    const [expandedExample, setExpandedExample] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const headlines = [
        {
            role: 'Software Engineer',
            examples: [
                'Senior Software Engineer | Building Scalable Systems at TechCorp | Python, AWS, Kubernetes',
                'Full-Stack Developer | React & Node.js Expert | Open Source Contributor',
                'Software Engineer | Turning Complex Problems into Elegant Solutions | ML Enthusiast',
                'Backend Engineer @ StartupName | API Design | Distributed Systems | Let\'s Connect!'
            ]
        },
        {
            role: 'Product Manager',
            examples: [
                'Product Manager | Driving 0→1 Products | B2B SaaS | Previously at Google',
                'Senior PM | Customer-Obsessed Product Leader | Scaling Products to $100M+ ARR',
                'Product Manager | Data-Driven Decision Maker | Agile Expert | MBA',
                'VP Product | Building Products Users Love | Mentor | Speaker'
            ]
        },
        {
            role: 'Data Scientist',
            examples: [
                'Data Scientist | ML/AI Specialist | Turning Data into Business Impact',
                'Senior Data Scientist @ FAANG | PhD Statistics | Python, TensorFlow, PyTorch',
                'Data Scientist | NLP & Computer Vision | Published Researcher',
                'Lead Data Scientist | Building ML Products | Team Builder | Speaker'
            ]
        },
        {
            role: 'Marketing',
            examples: [
                'Growth Marketing Manager | 300% YoY Growth | B2B SaaS Expert',
                'Digital Marketing Strategist | SEO & Paid Media | $10M+ in Revenue Generated',
                'Head of Marketing | Brand Builder | Storyteller | Previous: Nike, Apple',
                'Content Marketing Lead | Driving Organic Growth | B2B Technology'
            ]
        }
    ];

    const summaries = [
        {
            role: 'Software Engineer',
            content: `I'm a passionate software engineer with 6+ years of experience building products that impact millions of users.

Currently at TechCorp, I lead the backend infrastructure team responsible for processing 1M+ requests per second. I specialize in distributed systems, API design, and cloud architecture.

What drives me:
→ Solving complex technical challenges
→ Mentoring junior engineers
→ Building products that make a difference

Previously, I helped scale a startup from 10K to 1M users, redesigning the entire data pipeline and reducing costs by 40%.

Technologies: Python, Go, AWS, Kubernetes, PostgreSQL, Redis

Open to connecting with fellow engineers and discussing opportunities in senior/staff engineering roles.

📫 Let's connect!`
        },
        {
            role: 'Product Manager',
            content: `Product leader with 8+ years of experience launching and scaling products from 0→1 and beyond.

I've led cross-functional teams at both startups and Fortune 500 companies, delivering products that generated $50M+ in revenue. My superpower? Translating complex customer needs into simple, elegant solutions.

Key achievements:
• Led the launch of ProductX, reaching 100K users in 6 months
• Grew monthly active users by 200% through data-driven feature development
• Built and mentored a team of 5 product managers

My approach:
1. Start with the customer problem
2. Validate with data
3. Iterate fast, learn faster
4. Never stop asking "why?"

Currently exploring my next opportunity in fintech or healthtech.

Let's connect and share product war stories! ☕`
        },
        {
            role: 'Recent Graduate',
            content: `Recent Computer Science graduate from Stanford University, eager to make an impact in the tech industry.

During my time at Stanford, I:
→ Maintained a 3.9 GPA while working part-time as a TA
→ Built 3 full-stack applications used by 500+ students
→ Completed internships at Google and a YC startup
→ Led the CS Club with 200+ members

Technical skills: Python, JavaScript, React, Node.js, SQL, AWS

Beyond coding, I'm passionate about using technology to solve real-world problems. My senior project—an AI-powered mental health app—is currently being piloted at 3 universities.

I'm looking for software engineering roles where I can learn from experienced engineers while contributing to meaningful products.

Always happy to connect with fellow new grads and industry professionals!`
        }
    ];

    const aboutSections = [
        {
            role: 'Career Changer',
            content: `After 10 years in consulting, I made the leap into product management—and I've never looked back.

My journey: Management Consultant → MBA → Product Manager

Why the change?
I realized I wanted to build, not just advise. Product management lets me combine my strategic thinking with the thrill of shipping real products to real users.

What I bring from consulting:
✓ Structured problem-solving
✓ Stakeholder management
✓ Data analysis and synthesis
✓ Executive communication

What I've learned in product:
✓ Customer discovery and validation
✓ Agile and Scrum methodologies
✓ Technical collaboration with engineers
✓ Metrics-driven decision making

Currently a PM at a Series B fintech startup, leading our payments product. We've grown 5x since I joined.

If you're considering a similar transition, I'm happy to share my experience. Let's connect!`
        },
        {
            role: 'Freelancer/Consultant',
            content: `Independent UX/UI Designer helping startups create products users love.

After 7 years at design agencies and tech companies, I started my own practice to work more closely with founders who are changing the world.

What I do:
🎨 End-to-end product design
📱 Mobile and web app design
🔍 User research and testing
📐 Design systems and component libraries

Clients include: YC startups, Fortune 500 companies, and everything in between.

My approach:
Every pixel has a purpose. I believe great design is invisible—it just works. I combine deep user empathy with business strategy to create experiences that drive growth.

Results:
→ 40% increase in conversion for fintech app
→ 3x improvement in user retention for SaaS platform
→ Design system serving 20+ products

Currently accepting projects for Q2 2025.

Let's create something amazing together.`
        }
    ];

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const toggleExpand = (index) => {
        setExpandedExample(expandedExample === index ? null : index);
    };

    const tabs = [
        { id: 'headlines', label: 'Headlines', icon: User },
        { id: 'summaries', label: 'Summaries', icon: FileText },
        { id: 'about', label: 'About Sections', icon: Briefcase }
    ];

    return (
        <div className="linkedin-examples-page">
            <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />
            <Header onMenuClick={() => setSideMenuOpen(true)} />

            <div className="examples-container">
                <div className="examples-hero">
                    <div className="hero-badge linkedin-badge">
                        <Linkedin className="w-5 h-5" />
                        <span>LinkedIn Examples</span>
                    </div>
                    <h1>LinkedIn Profile <span className="text-gradient-blue">Examples Library</span></h1>
                    <p>Browse professional examples for headlines, summaries, and about sections</p>
                </div>

                {/* Tabs */}
                <div className="examples-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Headlines */}
                {activeTab === 'headlines' && (
                    <div className="headlines-grid">
                        {headlines.map((category, catIndex) => (
                            <Card key={catIndex} className="category-card">
                                <h3>{category.role}</h3>
                                <div className="examples-list">
                                    {category.examples.map((example, exIndex) => (
                                        <div key={exIndex} className="example-item headline-item">
                                            <p>{example}</p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(example, `${catIndex}-${exIndex}`)}
                                            >
                                                {copiedIndex === `${catIndex}-${exIndex}` ? (
                                                    <Check className="w-4 h-4" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Summaries */}
                {activeTab === 'summaries' && (
                    <div className="summaries-list">
                        {summaries.map((item, index) => (
                            <Card key={index} className="summary-card">
                                <div className="summary-header" onClick={() => toggleExpand(index)}>
                                    <h3>{item.role} Example</h3>
                                    <div className="summary-actions">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); copyToClipboard(item.content, `summary-${index}`); }}
                                        >
                                            {copiedIndex === `summary-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                        {expandedExample === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>
                                {expandedExample === index && (
                                    <div className="summary-content">
                                        <pre>{item.content}</pre>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}

                {/* About Sections */}
                {activeTab === 'about' && (
                    <div className="about-list">
                        {aboutSections.map((item, index) => (
                            <Card key={index} className="about-card">
                                <div className="about-header" onClick={() => toggleExpand(`about-${index}`)}>
                                    <h3>{item.role} Example</h3>
                                    <div className="about-actions">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); copyToClipboard(item.content, `about-${index}`); }}
                                        >
                                            {copiedIndex === `about-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                        {expandedExample === `about-${index}` ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>
                                {expandedExample === `about-${index}` && (
                                    <div className="about-content">
                                        <pre>{item.content}</pre>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinkedInExamples;
