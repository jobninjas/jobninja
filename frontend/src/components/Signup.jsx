import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from './ui/card';
import { Menu } from 'lucide-react';
import SideMenu from './SideMenu';
import './SideMenu.css';
import { BRAND } from '../config/branding';

import { useGoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, googleLogin, isAuthenticated, loading: authLoading } = useAuth();
  const referralCode = searchParams.get('ref');

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setSubmitting(true);
        const result = await googleLogin(tokenResponse.access_token, referralCode);
        if (result.success) {
          navigate('/');
        }
      } catch (err) {
        setError('Google signup failed. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    onError: () => setError('Google signup failed. Please try again.')
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);

    try {
      const result = await signup(formData.email, formData.password, formData.name, referralCode);
      if (result.success) {
        navigate('/'); // Redirect to home page after signup
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] py-12 px-4">
      <Card className="w-full max-w-[440px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-4 md:p-8">
        <CardHeader className="space-y-6 pt-2 pb-8">
          <div className="flex justify-center">
            <Link to="/" className="flex items-center gap-2">
              <img src={BRAND.logoPath} alt={BRAND.logoAlt} className="h-10" />
              <span className="text-3xl font-bold tracking-tight text-[#0a0a0a]">{BRAND.name}</span>
            </Link>
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-[28px] font-bold tracking-tight text-[#1a1a1a]">Create account</h1>
            <p className="text-[#666666] text-[15px]">
              First time? We will sign you up automatically.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Social Login */}
          <Button
            variant="outline"
            className="w-full py-6 border-[#e5e7eb] text-[#1a1a1a] font-semibold text-base rounded-full hover:bg-gray-50 flex items-center justify-center gap-3"
            onClick={() => handleGoogleLogin()}
            disabled={submitting}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.5 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.7-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.5z" fill="#4285F4" />
              <path d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1.1.7-2.5 1.1-4.2 1.1-3.2 0-5.9-2.2-6.9-5.1H1.4v2.6C3.4 20.8 7.4 24 12 24z" fill="#34A853" />
              <path d="M5.1 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.5.4-2.1V7.3H1.4C.5 8.9 0 10.4 0 12s.5 3.1 1.4 4.7l3.7-2.6z" fill="#FBBC05" />
              <path d="M12 4.8c1.8 0 3.3.6 4.6 1.8L20 3.2C17.9 1.2 15.1 0 12 0 7.4 0 3.4 3.2 1.4 7.3l3.7 2.6c1-2.9 3.7-5.1 6.9-5.1z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#f0f0f0]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-[#999999] font-medium tracking-wider">OR</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 text-sm font-medium text-red-800 bg-red-50 border border-red-100 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[13px] font-bold text-[#4b5563] ml-1 uppercase tracking-wide">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-12 px-5 border-[#e5e7eb] bg-white text-base rounded-xl focus:ring-2 focus:ring-[#22c55e]/20 focus:border-[#22c55e]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-bold text-[#4b5563] ml-1 uppercase tracking-wide">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-12 px-5 border-[#e5e7eb] bg-white text-base rounded-xl focus:ring-2 focus:ring-[#22c55e]/20 focus:border-[#22c55e]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" title="password" className="text-[13px] font-bold text-[#4b5563] ml-1 uppercase tracking-wide">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-12 px-5 border-[#e5e7eb] bg-white text-base rounded-xl focus:ring-2 focus:ring-[#22c55e]/20 focus:border-[#22c55e]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" title="confirmPassword" className="text-[13px] font-bold text-[#4b5563] ml-1 uppercase tracking-wide">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="h-12 px-5 border-[#e5e7eb] bg-white text-base rounded-xl focus:ring-2 focus:ring-[#22c55e]/20 focus:border-[#22c55e]"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-14 bg-[#22c55e] hover:bg-[#16a34a] text-white text-lg font-bold rounded-full shadow-[0_4px_14px_rgba(34,197,94,0.39)] transition-all active:scale-[0.98]"
                disabled={submitting}
              >
                {submitting ? 'Creating account...' : 'Continue'}
              </Button>
            </div>
          </form>

          <div className="pt-2 text-center">
            <p className="text-[15px] text-[#666666]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#22c55e] font-bold hover:underline ml-1">
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-center text-[12px] text-[#999999] leading-relaxed px-4">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-[#666666]">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline hover:text-[#666666]">Privacy Policy</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
