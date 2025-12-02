import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check } from 'lucide-react';
import { pricingPlans } from '../mock';

// Stripe checkout temporarily disabled - will add payment link soon

const Pricing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleSubscribe = (planId) => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <img src="/logo.png" alt="Nova Ninjas" className="h-8" />
              <span className="text-xl font-bold text-primary">Nova Ninjas</span>
            </button>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button onClick={() => navigate('/signup')}>Get Started</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide mb-4 animate-pulse">
            🎉 LIMITED TIME OFFER - $100 OFF
          </div>
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">
            Human specialists applying to jobs on your behalf, every month
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg">
            <span className="text-xl">⚡</span>
            <span className="font-semibold">Only <strong className="text-pink-600">8 spots left</strong> — Filling fast!</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.featured ? 'border-primary border-2' : ''}`}>
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white">Most Popular</Badge>
                </div>
              )}
              {/* Savings Badge */}
              <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold">
                {plan.savings}
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                
                {/* Applications Highlight */}
                <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-4">
                  <span className="text-4xl font-extrabold text-green-600 block">{plan.applications}</span>
                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{plan.period}</span>
                </div>
                
                {/* Price with Strikethrough */}
                <div className="mt-4">
                  <span className="text-xl text-gray-400 line-through block">{plan.originalPrice}</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-green-600">{plan.price}</span>
                    <span className="text-gray-600">{plan.priceSubtext}</span>
                  </div>
                </div>
                
                {/* Urgency */}
                <div className="mt-3 inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-semibold">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Only {plan.spotsLeft} spots left!
                </div>
                
                <p className="text-sm text-gray-500 italic mt-3">{plan.bestFor}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.featured ? 'animate-pulse' : ''}`}
                  variant={plan.featured ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {isAuthenticated && user?.plan === plan.name
                    ? 'Current Plan'
                    : 'Get Started Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 text-sm text-gray-600">
          <p>All plans include a human application specialist. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
