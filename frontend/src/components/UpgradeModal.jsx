import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X, Zap, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UpgradeModal = ({ tier, limit, resetDate, onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const hasUsedTrial = user?.has_used_free_trial;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4">
            <Card className="max-w-md w-full p-6 relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {hasUsedTrial ? (
                            <Zap className="w-8 h-8 text-blue-600" />
                        ) : (
                            <Gift className="w-8 h-8 text-blue-600" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Resume Limit Reached</h2>

                    {!hasUsedTrial ? (
                        <div className="space-y-2">
                            <p className="text-gray-600 font-medium">
                                You've reached your daily free limit.
                            </p>
                            <p className="text-blue-600 font-bold bg-blue-50 py-2 rounded-lg">
                                Good news! You're eligible for a 7-day FREE trial of AI Ninja Pro.
                            </p>
                        </div>
                    ) : tier === 'free' ? (
                        <p className="text-gray-600">
                            You've used all {limit} free resumes. Upgrade to a paid plan to keep generating tailored resumes!
                        </p>
                    ) : (
                        <>
                            <p className="text-gray-600 mb-2">
                                You've reached your {limit} resume limit for this billing cycle.
                            </p>
                            {resetDate && (
                                <p className="text-sm text-gray-500">
                                    Resets on: {new Date(resetDate).toLocaleDateString()}
                                </p>
                            )}
                        </>
                    )}
                </div>

                <div className="space-y-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-2">
                            What you get with AI Ninja Pro:
                        </h3>
                        <ul className="text-sm text-slate-700 space-y-2">
                            <li className="flex items-start gap-2">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                <span>Unlimited tailored resumes & cover letters</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                <span>Custom job description analysis</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                <span>AI Interview Practice & Prep</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <Button
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-200 transition-all border-none"
                    onClick={() => {
                        onClose();
                        navigate('/pricing');
                    }}
                >
                    {!hasUsedTrial ? 'Start 1-Week Free Trial' : 'Upgrade to AI Ninja Pro'}
                </Button>

                <p className="text-center mt-4 text-sm text-gray-400">
                    {!hasUsedTrial ? 'No commitment. Cancel anytime before trial ends.' : 'Cancel anytime. Boost your job search today.'}
                </p>
            </Card>
        </div>
    );
};

export default UpgradeModal;
