import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Lock, ArrowRight, Check } from 'lucide-react';

/**
 * SubscriptionWall Component
 * 
 * Blocks access to tools for users without active subscription or trial.
 * Shows upgrade modal with pricing information.
 * 
 * Usage:
 *   <SubscriptionWall>
 *     <YourToolComponent />
 *   </SubscriptionWall>
 */
const SubscriptionWall = ({ children }) => {
    const navigate = useNavigate();
    // Destructure with defaults to prevent crashes if context is partial
    const {
        isAuthenticated = false,
        hasActiveSubscription = false,
        isTrialActive = false,
        loading = true,
        user
    } = useAuth() || {};

    console.log('SubscriptionWall State:', { isAuthenticated, hasActiveSubscription, isTrialActive, loading, user: user?.email });

    // Handle loading state to prevent flash of content or white screen
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-gray-500 text-sm">Verifying access...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, redirect to signup
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <Card className="max-w-md w-full p-8 text-center shadow-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Sign In Required
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Please sign in or create an account to access this tool.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => navigate('/login')} variant="outline">
                            Log In
                        </Button>
                        <Button onClick={() => navigate('/signup')}>
                            Sign Up Free
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // If authenticated but no active subscription/trial, show upgrade wall WITH background blur
    if (!hasActiveSubscription && !isTrialActive) {
        return (
            <div className="relative min-h-screen w-full bg-gray-50">
                {/* Background Content (Blurred) */}
                <div className="filter blur-md pointer-events-none select-none opacity-40 h-full w-full overflow-hidden fixed inset-0 z-0">
                    {children}
                </div>

                {/* Overlay - Using fixed to ensure it covers the viewport */}
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <Card className="max-w-lg w-full p-8 text-center shadow-2xl relative bg-white animate-in zoom-in-95 duration-200">
                        <div className="md:w-24 md:h-24 w-20 h-20 bg-transparent rounded-full flex items-center justify-center mx-auto mb-4">
                            <img
                                src="/ninjasface.png"
                                alt="Ninja Pro"
                                className="w-full h-full object-contain drop-shadow-md"
                            />
                        </div>
                        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
                            Unlock Ninja Pro
                        </h2>
                        <p className="text-lg text-gray-600 mb-6">
                            Get unlimited access to AI Cover Letters and all other tools with a <strong>2-week free trial</strong>.
                        </p>

                        {/* Feature highlights */}
                        <div className="bg-slate-50 rounded-xl p-5 mb-6 text-left border border-slate-100 shadow-inner">
                            <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Pro Features Include:</h3>
                            <ul className="space-y-2.5 text-slate-600 text-sm">
                                <li className="flex items-start gap-2.5">
                                    <div className="mt-0.5 bg-green-100 p-0.5 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                                    <span>Unlimited AI Cover Letters & Resumes</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <div className="mt-0.5 bg-green-100 p-0.5 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                                    <span>Auto-Fill Chrome Extension Access</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <div className="mt-0.5 bg-green-100 p-0.5 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                                    <span>AI Interview Preparation Coach</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <div className="mt-0.5 bg-green-100 p-0.5 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                                    <span>Exclusive Job Board with Match Scores</span>
                                </li>
                            </ul>
                        </div>

                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all"
                            onClick={() => navigate('/pricing')}
                        >
                            Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                        <p className="text-xs text-gray-400 mt-4">Cancel anytime. No questions asked.</p>

                    </Card>
                </div>
            </div>
        );
    }

    // User has active subscription or trial - render the tool safely
    return <div className="subscription-wall-content">{children}</div>;
};

export default SubscriptionWall;
