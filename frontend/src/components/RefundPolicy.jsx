import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    Clock,
    CreditCard,
    HelpCircle,
    Mail,
    ArrowLeft,
    Info,
    ChevronRight
} from 'lucide-react';
import { BRAND } from '../config/branding';
import { Button } from './ui/button';
import { Card } from './ui/card';
import Header from './Header';
import SideMenu from './SideMenu';

const RefundPolicy = () => {
    const navigate = useNavigate();
    const [sideMenuOpen, setSideMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Side Menu */}
            <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />

            {/* Navigation Header */}
            <Header onMenuClick={() => setSideMenuOpen(true)} />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-primary mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
                    <p className="text-xl text-gray-600">
                        Transparent and fair policies for the {BRAND.name} community.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Main Policy Card */}
                    <Card className="p-8 border-none shadow-xl bg-white/80 backdrop-blur-sm">
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Info className="w-6 h-6 text-primary" />
                                <h2 className="text-2xl font-semibold text-gray-800">Overview</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                At {BRAND.name}, we strive to provide the best possible experience for our users. We understand that circumstances change, and we've designed our refund policy to be as fair and straightforward as possible.
                            </p>
                        </section>

                        <div className="grid md:grid-cols-2 gap-8">
                            <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <Bot className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-bold text-gray-800">AI Ninja (Self-Serve)</h3>
                                </div>
                                <ul className="space-y-3 text-gray-600 text-sm">
                                    <li className="flex gap-2">
                                        <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span>Refunds are available within <strong>7 days</strong> of purchase if no AI applications have been generated.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span>Monthly subscriptions can be canceled at any time to prevent future billing.</span>
                                    </li>
                                </ul>
                            </section>

                            <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <UserCheck className="w-5 h-5 text-orange-500" />
                                    <h3 className="text-lg font-bold text-gray-800">Human Ninja (Done-for-You)</h3>
                                </div>
                                <ul className="space-y-3 text-gray-600 text-sm">
                                    <li className="flex gap-2">
                                        <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span>Refunds are case-by-case before the application process begins.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span>Once our specialists start searching and tailoring for you, service fees are non-refundable.</span>
                                    </li>
                                </ul>
                            </section>
                        </div>

                        <section className="mt-10 pt-10 border-t border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="w-6 h-6 text-primary" />
                                <h2 className="text-2xl font-semibold text-gray-800">Processing Timeline</h2>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Once a refund is approved:
                            </p>
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                                <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                                <p className="text-sm text-blue-800">
                                    Refunds typically take <strong>5-10 business days</strong> to appear on your original payment method, depending on your bank or credit card issuer.
                                </p>
                            </div>
                        </section>
                    </Card>

                    {/* Contact Section */}
                    <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Need Help?</h3>
                        <p className="text-gray-600 mb-6">
                            If you have questions about a refund or need assistance with your account, our support team is here to help.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button
                                onClick={() => window.location.href = 'mailto:support@novaninja.com'}
                                className="h-12 px-8 rounded-xl bg-green-600 hover:bg-green-700 text-white border-none"
                            >
                                <Mail className="w-4 h-4 mr-2" /> Email Support
                            </Button>
                            <Button variant="outline" className="h-12 px-8 rounded-xl border-2" onClick={() => navigate('/dashboard')}>
                                <HelpCircle className="w-4 h-4 mr-2" /> Help Center
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t py-8 mt-auto">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-500 text-sm">
                        {BRAND.copyright} • {BRAND.name} is a strategic talent acceleration platform.
                    </p>
                </div>
            </footer>
        </div>
    );
};

// Mock Bot/UserCheck icons if they are not available (they should be from lucide-react in this project)
const Bot = ({ className }) => <div className={className}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg></div>;
const UserCheck = ({ className }) => <div className={className}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></svg></div>;

export default RefundPolicy;
