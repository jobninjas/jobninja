import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check } from 'lucide-react';
import { pricingPlans } from '../mock';

// Real Stripe checkout integration
const createCheckoutSession = async (planId, userEmail, userId) => {
  try {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    
    // Call backend to create Stripe checkout session
    const response = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        user_email: userEmail,
        user_id: userId
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Show detailed error message from backend
      const errorMessage = data.detail || 'Failed to create checkout session';
      
      // Check if it's a Stripe configuration error
      if (errorMessage.includes('Stripe is not configured') || errorMessage.includes('Price ID not configured')) {
        alert(
          '⚠️ Payment Setup Required\n\n' +
          'Stripe payment is not yet configured.\n\n' +
          'To enable payments:\n' +
          '1. Sign up at dashboard.stripe.com\n' +
          '2. Get your API keys\n' +
          '3. Create subscription products\n' +
          '4. Add keys to backend/.env\n\n' +
          'See /app/STRIPE_SETUP_GUIDE.md for detailed instructions.'
        );
      } else {
        alert('Checkout Error: ' + errorMessage);
      }
      return;
    }
    
    // Redirect to Stripe Checkout
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('No checkout URL received');
    }
    
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Failed to start checkout. Please try again or contact support.');
  }
};

const Pricing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) {
      // Redirect to signup if not logged in
      navigate('/signup');
      return;
    }
    
    // Call real Stripe checkout with user details
    await createCheckoutSession(planId, user?.email, user?.id);
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
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">
            Human specialists applying to jobs on your behalf, every day
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.featured ? 'border-primary border-2' : ''}`}>
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price.replace('$', '')}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {plan.applications} applications {plan.period}
                </p>
                <p className="text-sm text-gray-500 italic mt-1">{plan.bestFor}</p>
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
                  className="w-full"
                  variant={plan.featured ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {isAuthenticated && user?.plan === plan.name
                    ? 'Current Plan'
                    : 'Subscribe Now'}
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
