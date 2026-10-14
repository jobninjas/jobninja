import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export function MarketingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 text-blue-600 flex items-center justify-center">
              <Image src="/logo.png" alt="Job Ninjas" width={32} height={32} className="object-contain  transition-transform group-hover:scale-105" unoptimized />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">Job Ninjas</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600">
            <Link href="/product" className="hover:text-blue-600 transition-colors">Product</Link>
            <Link href="/solutions" className="hover:text-blue-600 transition-colors">Solutions</Link>
            <Link href="/resources" className="hover:text-blue-600 transition-colors">Resources</Link>
            <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block font-medium text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
            <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm flex items-center">
              Sign up free <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function MarketingFooter() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/product" className="hover:text-blue-600">Features</Link></li>
              <li><Link href="/product" className="hover:text-blue-600">Integrations</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-600">Pricing</Link></li>
              <li><Link href="/product" className="hover:text-blue-600">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Solutions</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/solutions" className="hover:text-blue-600">For Startups</Link></li>
              <li><Link href="/solutions" className="hover:text-blue-600">For Enterprise</Link></li>
              <li><Link href="/solutions" className="hover:text-blue-600">For Agencies</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/resources" className="hover:text-blue-600">Documentation</Link></li>
              <li><Link href="/resources" className="hover:text-blue-600">Blog</Link></li>
              <li><Link href="/resources" className="hover:text-blue-600">Community</Link></li>
              <li><Link href="/resources" className="hover:text-blue-600">Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/about" className="hover:text-blue-600">About</Link></li>
              <li><Link href="/careers" className="hover:text-blue-600">Careers</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-600">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-200 text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-5 h-5 text-slate-400 grayscale opacity-50 flex items-center justify-center">
              <Image src="/logo.png" alt="Job Ninjas" width={20} height={20} className="object-contain" unoptimized />
            </div>
            <span>&copy; {new Date().getFullYear()} Job Ninjas Inc. All rights reserved.</span>
          </div>
          <div className="flex gap-4 text-slate-400">
            {/* Social Links could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}


