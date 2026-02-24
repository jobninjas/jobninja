import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, DollarSign, ShieldAlert, UserX, Gavel, Mail, CheckCircle, XCircle } from 'lucide-react';
import { BRAND } from '../config/branding';
import { Card } from './ui/card';
import Header from './Header';
import SideMenu from './SideMenu';

const Section = ({ icon: Icon, title, children, color = 'text-blue-600' }) => (
    <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
            <Icon className={`w-6 h-6 ${color}`} />
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="text-gray-600 leading-relaxed space-y-3">{children}</div>
    </section>
);

const TermsAndConditions = () => {
    const navigate = useNavigate();
    const [sideMenuOpen, setSideMenuOpen] = useState(false);
    const EFFECTIVE_DATE = 'February 24, 2026';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />
            <Header onMenuClick={() => setSideMenuOpen(true)} />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-4">
                        <FileText className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Terms & Conditions</h1>
                    <p className="text-gray-500 text-sm">Effective Date: {EFFECTIVE_DATE}</p>
                    <p className="text-gray-600 mt-2 text-lg">
                        By using {BRAND.name}, you agree to the following terms. Please read them carefully.
                    </p>
                </div>

                {/* Key Highlights */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-green-800 text-sm">Free Trial</p>
                            <p className="text-green-700 text-sm">2 weeks free with up to 20 job applications per day. No credit card required to start.</p>
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex gap-3">
                        <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-blue-800 text-sm">Pro Access – $50/year</p>
                            <p className="text-blue-700 text-sm">One-time annual payment. Unlimited applications, all AI tools, full platform access.</p>
                        </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex gap-3">
                        <XCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-orange-800 text-sm">No Refunds</p>
                            <p className="text-orange-700 text-sm">All Pro purchases are final. This is a one-time payment, not a subscription — see Refund Policy for details.</p>
                        </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 flex gap-3">
                        <ShieldAlert className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-purple-800 text-sm">No Job Guarantee</p>
                            <p className="text-purple-700 text-sm">We provide tools and services to assist your job search. We do not guarantee employment outcomes.</p>
                        </div>
                    </div>
                </div>

                <Card className="p-8 border-none shadow-xl bg-white/80 backdrop-blur-sm space-y-8">

                    <Section icon={FileText} title="1. Acceptance of Terms">
                        <p>By accessing or using {BRAND.name} ("the Platform"), you agree to be bound by these Terms and Conditions ("Terms") and our Privacy Policy. If you do not agree, please do not use our services.</p>
                        <p>These Terms apply to all users, including free-tier users and Pro subscribers.</p>
                    </Section>

                    <Section icon={CheckCircle} title="2. Free Plan & Trial" color="text-green-600">
                        <p>The free plan of {BRAND.name} includes:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Access to the platform for free for the first <strong>14 days</strong> from account creation.</li>
                            <li>Up to <strong>20 job applications per day</strong> using our AI tools.</li>
                            <li>Access to core free tools (Resume Scanner, Bullet Point Generator, etc.).</li>
                        </ul>
                        <p>Once the daily limit of 20 applications is reached, you will be required to upgrade to Pro to continue applying for that day. Once the 14-day free trial period expires, Pro access is required for unlimited features.</p>
                    </Section>

                    <Section icon={DollarSign} title="3. Pro Access & Pricing" color="text-blue-600">
                        <p>Pro access is offered at <strong>$50 per year</strong> as a one-time annual payment. This is <strong>not a subscription</strong>. Key terms:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Pro access grants unlimited job applications, all AI tools, Interview Prep, Auto Fill, and full platform access for 12 months from the date of purchase.</li>
                            <li>After 12 months, you may renew at the then-current rate to continue Pro access.</li>
                            <li>No automatic renewals or recurring charges occur without your explicit action.</li>
                            <li>Pricing is subject to change. Price changes will not affect your current active Pro period.</li>
                        </ul>
                    </Section>

                    <Section icon={XCircle} title="4. Refund Policy" color="text-red-500">
                        <p>Because Pro access is a <strong>one-time payment</strong> (not a subscription), <strong>all purchases are final and non-refundable</strong>. By completing your purchase:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>You acknowledge that you have reviewed the platform during the free trial period.</li>
                            <li>You understand that digital services are delivered immediately upon purchase.</li>
                            <li>You agree that no refunds, chargebacks, or credits will be issued after payment is processed.</li>
                        </ul>
                        <p>In exceptional cases involving platform-wide outages or billing errors, please contact <a href={`mailto:${BRAND.supportEmail}`} className="text-blue-600 underline">{BRAND.supportEmail}</a> within 48 hours of purchase, and we will review on a case-by-case basis.</p>
                        <p>See our full <button onClick={() => { }} className="text-blue-600 underline">Refund Policy</button> for details.</p>
                    </Section>

                    <Section icon={UserX} title="5. Acceptable Use" color="text-orange-600">
                        <p>You agree not to use {BRAND.name} to:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Generate false, misleading, or fraudulent job application materials.</li>
                            <li>Violate any applicable laws or third-party terms of service (e.g., job boards).</li>
                            <li>Scrape, copy, or reverse-engineer any part of the platform.</li>
                            <li>Share your account credentials or Pro access with others.</li>
                            <li>Use automated bots or scripts to abuse platform features.</li>
                        </ul>
                        <p>We reserve the right to suspend or terminate accounts that violate these terms without a refund.</p>
                    </Section>

                    <Section icon={ShieldAlert} title="6. No Employment Guarantee" color="text-yellow-600">
                        <p>{BRAND.name} is a job search assistance platform. We provide AI-powered tools, resume tailoring, job matching, and application automation. By using our service, you acknowledge:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>We do <strong>not</strong> guarantee job interviews, offers, or employment outcomes.</li>
                            <li>Results vary based on your qualifications, market conditions, and employer decisions beyond our control.</li>
                            <li>AI-generated content (resumes, cover letters) should be reviewed by you before submission.</li>
                            <li>You are responsible for the accuracy of information in your profile and resume.</li>
                        </ul>
                    </Section>

                    <Section icon={Gavel} title="7. Intellectual Property" color="text-gray-600">
                        <p>All platform content, software, AI models, branding, and features are the intellectual property of {BRAND.name}. You retain full ownership of your personal data (resume, profile, application history).</p>
                        <p>By uploading content to our platform, you grant {BRAND.name} a limited, non-exclusive license to process that content to provide services to you.</p>
                    </Section>

                    <Section icon={ShieldAlert} title="8. Limitation of Liability" color="text-red-400">
                        <p>To the maximum extent permitted by law, {BRAND.name} shall not be liable for any indirect, incidental, or consequential damages arising from the use of our platform, including lost job opportunities or employment decisions made by third parties.</p>
                        <p>Our total liability to you for any claim shall not exceed the amount you paid for the service in the preceding 12 months.</p>
                    </Section>

                    <Section icon={Gavel} title="9. Governing Law" color="text-indigo-600">
                        <p>These Terms are governed by and construed in accordance with the laws of the United States. Any disputes shall be resolved through good-faith negotiation or, if necessary, binding arbitration.</p>
                    </Section>

                    <Section icon={Mail} title="10. Contact Us" color="text-blue-600">
                        <p>For questions about these Terms, contact us:</p>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-2">
                            <p><strong>{BRAND.name}</strong></p>
                            <p>Email: <a href={`mailto:${BRAND.supportEmail}`} className="text-blue-600 underline">{BRAND.supportEmail}</a></p>
                            <p>Website: <a href={BRAND.website} className="text-blue-600 underline">{BRAND.website}</a></p>
                        </div>
                    </Section>

                    <p className="text-sm text-gray-400 text-center pt-4 border-t border-gray-100">
                        We reserve the right to update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the updated Terms.
                    </p>
                </Card>
            </main>

            <footer className="bg-white border-t py-8 mt-auto">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-500 text-sm">{BRAND.copyright}</p>
                    <div className="flex justify-center gap-6 mt-2 text-sm">
                        <button onClick={() => navigate('/privacy-policy')} className="text-gray-500 hover:underline">Privacy Policy</button>
                        <button onClick={() => navigate('/terms')} className="text-blue-600 hover:underline">Terms & Conditions</button>
                        <button onClick={() => navigate('/refund-policy')} className="text-gray-500 hover:underline">Refund Policy</button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default TermsAndConditions;
