"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ChevronDown, ArrowRight, CheckCircle, Zap, Users, FileText,
  BarChart2, Bot, Workflow, Plug, Play, Star, Shield, Globe,
  Building2, GraduationCap, Headphones, TrendingUp, Clock, Mail,
  MessageSquare, Video, Calendar, Database, FileSpreadsheet, ListTodo,
  UserCheck, ShieldAlert, BrainCircuit, Activity, Briefcase, Book
} from "lucide-react";

const TOOLS = [
  { name: "Workday", domain: "workday.com", hex: "005CB9" },
  { name: "Greenhouse", domain: "greenhouse.io", hex: "00B289" },
  { name: "BambooHR", domain: "bamboohr.com", hex: "83C326" },
  { name: "Salesforce", domain: "salesforce.com", hex: "00A1E0" },
  { name: "LinkedIn", domain: "linkedin.com", hex: "0A66C2" },
  { name: "Gmail", domain: "google.com", hex: "EA4335" },
  { name: "Outlook", domain: "outlook.com", hex: "0078D4" },
  { name: "Slack", domain: "slack.com", hex: "E01E5A" },
  { name: "Zoom", domain: "zoom.us", hex: "0B5CFF" },
  { name: "Teams", domain: "microsoft.com", hex: "6264A7" },
  { name: "DocuSign", domain: "docusign.com", hex: "000000" },
  { name: "HackerRank", domain: "hackerrank.com", hex: "00EA64" },
  { name: "Notion", domain: "notion.so", hex: "000000" },
  { name: "Google Drive", domain: "drive.google.com", hex: "1FA463" },
  { name: "Calendly", domain: "calendly.com", hex: "006BFF" }
];

function ConnectorLogo({ name, domain, hex }: { name: string; domain: string; hex: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[14px] font-black shadow-sm" style={{ backgroundColor: `#${hex}` }}>
        {name.charAt(0)}
      </div>
    );
  }
  return (
    <img
      src={`https://logo.clearbit.com/${domain}`}
      alt={name}
      className="w-7 h-7 object-contain rounded-md bg-white"
      onError={() => setErr(true)}
    />
  );
}

export default function Home() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">

      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <Image src="/logo.png" alt="JobNinjas" width={36} height={36} className="object-contain" priority unoptimized />
              <span className="font-extrabold text-slate-900 text-xl tracking-tight">JobNinjas</span>
            </Link>
            <div className="hidden lg:flex items-center gap-2">
              {/* Product Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 text-[14px] font-medium text-slate-700 group-hover:text-slate-900 rounded-lg group-hover:bg-slate-50 transition-colors">
                  Product <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                </button>
                <div className="absolute top-full left-0 w-64 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-slate-100 p-2 flex flex-col gap-1">
                    {[
                      { title: "Agentic Canvas", desc: "Visual pipeline builder", icon: Workflow, href: "/product/canvas" },
                      { title: "Resume Parser", desc: "Instant skill extraction", icon: FileText, href: "/product/resume-parser" },
                      { title: "Interview Copilot", desc: "Live transcript analysis", icon: Video, href: "/product/copilot" },
                      { title: "ATS Integrations", desc: "Workday & Greenhouse sync", icon: Plug, href: "/product/integrations" },
                    ].map((item) => (
                      <Link key={item.title} href={item.href} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="bg-blue-50 text-blue-600 rounded-lg p-2 shrink-0"><item.icon className="w-4 h-4" /></div>
                        <div>
                          <p className="text-[13px] font-bold text-slate-900">{item.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Use Cases Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 text-[14px] font-medium text-slate-700 group-hover:text-slate-900 rounded-lg group-hover:bg-slate-50 transition-colors">
                  Use Cases <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                </button>
                <div className="absolute top-full left-0 w-64 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-slate-100 p-2 flex flex-col gap-1">
                    {[
                      { title: "Technical Hiring", icon: Bot, href: "/use-cases/technical" },
                      { title: "Executive Search", icon: Users, href: "/use-cases/executive" },
                      { title: "High-Volume", icon: Database, href: "/use-cases/high-volume" },
                      { title: "Campus Recruiting", icon: GraduationCap, href: "/use-cases/campus" },
                    ].map((item) => (
                      <Link key={item.title} href={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <item.icon className="w-4 h-4 text-slate-400" />
                        <span className="text-[13px] font-bold text-slate-900">{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Solutions Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 text-[14px] font-medium text-slate-700 group-hover:text-slate-900 rounded-lg group-hover:bg-slate-50 transition-colors">
                  Solutions <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                </button>
                <div className="absolute top-full left-0 w-64 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-slate-100 p-2 flex flex-col gap-1">
                    {[
                      { title: "For Startups", icon: Zap, href: "/solutions/startups" },
                      { title: "For Enterprise", icon: Building2, href: "/solutions/enterprise" },
                      { title: "For Agencies", icon: Briefcase, href: "/solutions/agencies" },
                    ].map((item) => (
                      <Link key={item.title} href={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <item.icon className="w-4 h-4 text-slate-400" />
                        <span className="text-[13px] font-bold text-slate-900">{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resources Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 text-[14px] font-medium text-slate-700 group-hover:text-slate-900 rounded-lg group-hover:bg-slate-50 transition-colors">
                  Resources <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                </button>
                <div className="absolute top-full left-0 w-64 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-slate-100 p-2 flex flex-col gap-1">
                    {[
                      { title: "Blog", icon: FileText, href: "/resources/blog" },
                      { title: "Case Studies", icon: BarChart2, href: "/resources/case-studies" },
                      { title: "Documentation", icon: Book, href: "/resources/docs" },
                    ].map((item) => (
                      <Link key={item.title} href={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <item.icon className="w-4 h-4 text-slate-400" />
                        <span className="text-[13px] font-bold text-slate-900">{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="/templates" className="px-3 py-2 text-[14px] font-medium text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors">Templates</Link>
              <Link href="/pricing" className="px-3 py-2 text-[14px] font-medium text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors">Pricing</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-[14px] font-medium text-slate-700 hover:text-slate-900 transition-colors">Login</Link>
            <button className="px-4 py-2 text-[14px] font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">Contact sales</button>
            <Link href="/login" className="px-4 py-2 text-[14px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* ─── NEW ULTRA-PREMIUM HERO ─── */}
      <section className="relative overflow-hidden bg-[#FAFAFA] pt-28 pb-32 font-sans">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, #6366f1, transparent 70%)" }}></div>

        <div className="text-center max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-[0_2px_8px_rgb(0,0,0,0.04)] text-[12px] font-bold text-slate-700 mb-8 tracking-wide">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            The Agentic HR Canvas
          </div>
          <h1 className="text-[48px] sm:text-[72px] font-black text-slate-900 tracking-tight leading-[1.05] mb-6">
            Hire with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">autonomous</span> precision.
          </h1>
          <p className="text-[18px] text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            The enterprise canvas where your team and complex AI agents collaborate. Run deep profile analysis, detect fraud, and sync with Workday in real-time.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login" className="px-6 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-[14px] shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:bg-slate-800 transition-all">
              Start building for free
            </Link>
            <Link href="/demo" className="px-6 py-3.5 rounded-xl bg-white text-slate-700 font-bold text-[14px] border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
              Book a demo
            </Link>
          </div>
        </div>

        {/* The Canvas Visual Mockup */}
        <div className="mt-20 max-w-[1100px] mx-auto px-6 relative z-10">
          <div className="rounded-[32px] border border-slate-200/60 bg-white/40 backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-3">
            <div className="rounded-[24px] bg-[#F8F9FA] border border-slate-200/80 overflow-hidden relative h-[480px] w-full flex items-center justify-center shadow-inner">
              {/* Grid Pattern */}
              <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

              {/* Inner Fixed-Size wrapper for perfect scaling */}
              <div className="relative w-[1024px] h-[440px] scale-[0.55] sm:scale-75 md:scale-90 lg:scale-100 origin-center transition-transform">

                {/* SVG Paths */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm">
                  <defs>
                    <marker id="arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L6,3 z" fill="#cbd5e1" />
                    </marker>
                  </defs>
                  {/* Lines */}
                  <path d="M 248 220 C 265 220, 270 120, 286 120" stroke="#cbd5e1" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
                  <path d="M 248 220 C 265 220, 270 320, 286 320" stroke="#cbd5e1" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
                  <path d="M 498 120 L 536 120" stroke="#cbd5e1" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
                  <path d="M 498 320 L 536 320" stroke="#cbd5e1" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
                  <path d="M 748 120 C 765 120, 770 220, 786 220" stroke="#cbd5e1" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
                  <path d="M 748 320 C 765 320, 770 220, 786 220" stroke="#cbd5e1" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
                </svg>

                {/* Node 0: Inbound */}
                <div className="absolute left-[40px] top-[190px] w-52 bg-white border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl p-3.5 flex items-center gap-3 transition-transform hover:-translate-y-1 cursor-default">
                  <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                    <Database className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 leading-tight">Inbound Application</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight font-medium">Greenhouse Webhook</p>
                  </div>
                </div>

                {/* Node 1: Fraud */}
                <div className="absolute left-[290px] top-[90px] w-52 bg-white border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl p-3.5 flex items-center gap-3 transition-transform hover:-translate-y-1 cursor-default">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 leading-tight">Candidate Anti-Fraud</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight font-medium">Identity & integrity checks</p>
                  </div>
                </div>

                {/* Node 2: Profile */}
                <div className="absolute left-[290px] top-[290px] w-52 bg-white border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl p-3.5 flex items-center gap-3 transition-transform hover:-translate-y-1 cursor-default">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 leading-tight">Deep Profile Analysis</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight font-medium">Cross-platform validation</p>
                  </div>
                </div>

                {/* Node 3: Transcript */}
                <div className="absolute left-[540px] top-[90px] w-52 bg-white border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl p-3.5 flex items-center gap-3 transition-transform hover:-translate-y-1 cursor-default">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                    <BrainCircuit className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 leading-tight">Transcript Analyzer</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight font-medium">Technical depth scoring</p>
                  </div>
                </div>

                {/* Node 4: Copilot */}
                <div className="absolute left-[540px] top-[290px] w-52 bg-white border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl p-3.5 flex items-center gap-3 transition-transform hover:-translate-y-1 cursor-default">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 leading-tight">Copilot Detection</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight font-medium">Live interview monitoring</p>
                  </div>
                </div>

                {/* Node 5: ATS Sync */}
                <div className="absolute left-[790px] top-[190px] w-52 bg-slate-900 border border-slate-800 shadow-[0_12px_30px_rgb(0,0,0,0.15)] rounded-2xl p-3.5 flex items-center gap-3 transition-transform hover:-translate-y-1 cursor-default">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 relative">
                    <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full animate-pulse -mt-1 -mr-1 border border-slate-800"></div>
                    <Database className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-white leading-tight">Workday & Greenhouse</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-tight font-medium">Bidirectional API Sync</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LOGOS STRIP ─── */}
      <section className="border-y border-slate-100 bg-slate-50 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[13px] font-semibold text-slate-400 uppercase tracking-widest mb-8">Trusted by recruiting teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-10 opacity-60 grayscale">
            {["Acme Corp", "Globex Inc", "Soylent Co", "Initech", "Umbrella", "Vandelay"].map((c) => (
              <span key={c} className="text-xl font-black text-slate-600 tracking-tight">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHAT JOBNINJA DOES ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[13px] font-bold text-blue-600 uppercase tracking-widest mb-3">The intelligent hiring canvas</p>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-5">Everything your team needs<br />to hire with AI</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">From the first job posting to the signed offer letter, JobNinjas automates every step with purpose-built AI agents on a shared canvas your whole HR team can see.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 bg-[#0A0A0A] border border-slate-800 rounded-3xl p-8 text-white overflow-hidden relative min-h-[300px] shadow-[0_20px_40px_rgb(0,0,0,0.2)]">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                  <Workflow className="w-5 h-5 text-slate-300 relative z-10" />
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-2.5">Visual AI Pipeline Builder</h3>
                <p className="text-slate-400 text-[15px] leading-relaxed max-w-md">Drag, drop and connect AI agents on an infinite canvas. Build any hiring workflow in minutes, not months.</p>
              </div>
              <div className="absolute right-6 bottom-6 flex items-center gap-2 opacity-80">
                {["Source", "Screen", "Interview", "Offer", "Onboard"].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-300 whitespace-nowrap backdrop-blur-sm">{s}</div>
                    {i < 4 && <div className="w-4 h-px bg-slate-700"></div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/80 shadow-[inset_0_1px_0_white,0_2px_6px_rgb(0,0,0,0.02)] flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-violet-500/10 blur-xl rounded-full"></div>
                <Users className="w-5 h-5 text-slate-700 relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2.5">Smart Candidate Tracking</h3>
              <p className="text-slate-500 text-[14px] leading-relaxed">AI-powered applicant cards with auto-scored skills, culture fit predictions, and one-click scheduling.</p>
              <div className="mt-6 bg-slate-50 rounded-xl border border-slate-100 p-3.5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-[11px] font-bold">A</div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">Alex M. — React Engineer</p>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">94 / 100 AI Match Score</p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-slate-800 h-1.5 rounded-full" style={{ width: "94%" }}></div></div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/80 shadow-[inset_0_1px_0_white,0_2px_6px_rgb(0,0,0,0.02)] flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full"></div>
                <FileText className="w-5 h-5 text-slate-700 relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2.5">Resume Intelligence</h3>
              <p className="text-slate-500 text-[14px] leading-relaxed">Drop PDFs, Excel sheets, or Word docs onto the canvas. AI parses, scores, and routes them instantly.</p>
              <div className="mt-6 flex gap-2 flex-wrap">
                {["PDF", "Excel", "Word", "ATS Export"].map((f) => (
                  <span key={f} className="text-[11px] font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200/50">{f}</span>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/80 shadow-[inset_0_1px_0_white,0_2px_6px_rgb(0,0,0,0.02)] flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-rose-500/10 blur-xl rounded-full"></div>
                <Video className="w-5 h-5 text-slate-700 relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2.5">Transcript Analysis</h3>
              <p className="text-slate-500 text-[14px] leading-relaxed">AI reviews recorded interviews, scores technical depth, sentiment, and culture fit — posted directly on the board.</p>
              <div className="mt-6 space-y-3">
                {[{ label: "Technical Depth", pct: 87 }, { label: "Communication", pct: 91 }, { label: "Culture Fit", pct: 76 }].map((m) => (
                  <div key={m.label} className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-slate-500 w-28 shrink-0">{m.label}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-slate-800 rounded-full" style={{ width: m.pct + "%" }}></div></div>
                    <span className="text-[11px] font-bold text-slate-700">{m.pct}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all lg:col-span-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/80 shadow-[inset_0_1px_0_white,0_2px_6px_rgb(0,0,0,0.02)] flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full"></div>
                <Plug className="w-5 h-5 text-slate-700 relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2.5">Connect Every Tool Your HR Team Already Uses</h3>
              <p className="text-slate-500 text-[14px] leading-relaxed mb-8">One-click connectors for your ATS, HRIS, calendar, email, and collaboration tools. No engineering needed.</p>
              <div className="flex flex-wrap gap-4">
                {TOOLS.map((t) => (
                  <div key={t.name} className="flex items-center gap-3 bg-white border border-slate-200/60 rounded-xl px-4 py-3 shadow-[0_2px_8px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all">
                    <ConnectorLogo name={t.name} domain={t.domain} hex={t.hex} />
                    <span className="text-[13px] font-bold text-slate-800 tracking-tight">{t.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── CONNECTING EXCEL / DOCS / FORMS ─── */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[13px] font-bold text-blue-600 uppercase tracking-widest mb-3">Works with your existing stack</p>
              <h2 className="text-4xl font-black text-slate-900 leading-tight mb-6">Connect Excel, Docs, Forms and your ATS in one click</h2>
              <p className="text-[16px] text-slate-500 leading-relaxed mb-8">Drag your candidate spreadsheet onto the canvas. Drop in a job description Word doc. Connect your Google Form applications. JobNinjas reads them all and routes data to the right AI agents automatically.</p>
              <div className="space-y-4">
                {[
                  { icon: FileSpreadsheet, color: "text-green-600", bg: "bg-green-50", title: "Excel / Google Sheets", desc: "Bulk-import candidate lists and auto-populate pipeline stages" },
                  { icon: FileText, color: "text-blue-600", bg: "bg-blue-50", title: "Word / Google Docs", desc: "Drop JDs or scorecards — AI parses criteria and scores resumes" },
                  { icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", title: "ATS Sync", desc: "Two-way sync with Greenhouse, Lever, Workday, and more" },
                  { icon: ListTodo, color: "text-slate-900", bg: "bg-slate-100", title: "Forms & Surveys", desc: "Google Forms, Typeform, and custom intake forms routed automatically" },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl ${f.bg} shadow-sm border border-slate-200 flex items-center justify-center shrink-0`}>
                      <f.icon className={`w-7 h-7 ${f.color}`} />
                    </div>
                    <div className="pt-1.5">
                      <p className="text-[16px] font-bold text-slate-900">{f.title}</p>
                      <p className="text-[14px] text-slate-500 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400/60"></div><div className="w-3 h-3 rounded-full bg-yellow-400/60"></div><div className="w-3 h-3 rounded-full bg-green-400/60"></div></div>
                  <span className="text-[11px] text-slate-400 ml-2">JobNinjas Canvas</span>
                </div>
                <div className="p-6 bg-white" style={{ backgroundImage: "radial-gradient(#e2e8f0 1px,transparent 1px)", backgroundSize: "20px 20px" }}>
                  <div className="flex gap-4 flex-wrap">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 w-52">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-7 h-7 rounded bg-green-600 flex items-center justify-center shadow-sm">
                          <FileSpreadsheet className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[13px] font-bold text-slate-800">candidates_q4.xlsx</span>
                      </div>
                      <div className="space-y-1.5">
                        {["Alex M. - React Sr", "Sarah K. - PM Lead", "James R. - DevOps"].map((r) => (
                          <div key={r} className="flex items-center gap-2 text-[10px] text-slate-600 py-0.5 border-b border-slate-50">
                            <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />{r}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-[10px] text-green-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>48 rows imported
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg width="40" height="20"><defs><marker id="a2" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto"><polygon points="0 0,6 2.5,0 5" fill="#4f46e5" /></marker></defs><path d="M2 10 L34 10" stroke="#4f46e5" strokeWidth="2" fill="none" markerEnd="url(#a2)" /></svg>
                    </div>
                    <div className="bg-indigo-50 rounded-2xl border border-indigo-200 shadow-md p-4 w-44">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center mb-2 mx-auto"><Bot className="w-4 h-4 text-white" /></div>
                      <p className="text-[12px] font-bold text-indigo-900 text-center mb-1">Resume Screener</p>
                      <div className="w-full bg-indigo-100 rounded-full h-1.5 mb-1"><div className="bg-indigo-600 h-1.5 rounded-full animate-pulse" style={{ width: "65%" }}></div></div>
                      <p className="text-[10px] text-indigo-500 text-center">Scoring 48 resumes...</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-4 flex-wrap">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 w-52">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center shadow-sm">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[13px] font-bold text-slate-800">jd_sr_react_eng.docx</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-2">Senior React Engineer - 5+ yrs, Next.js, TypeScript, System Design, Remote OK...</p>
                      <div className="mt-2.5 flex gap-1.5 flex-wrap">
                        <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">React</span>
                        <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">TypeScript</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 w-52">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center shadow-sm">
                          <ListTodo className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[13px] font-bold text-slate-800">Application Form</span>
                      </div>
                      <div className="space-y-1.5 mt-2"><div className="h-2.5 bg-slate-100 rounded-full w-full"></div><div className="h-2.5 bg-slate-100 rounded-full w-4/5"></div><div className="h-2.5 bg-violet-100 rounded-full w-3/5"></div></div>
                      <p className="text-[10px] text-violet-600 font-bold mt-3">12 new submissions today</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── USE CASES ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[13px] font-bold text-blue-600 uppercase tracking-widest mb-3">Use cases</p>
            <h2 className="text-4xl font-black text-slate-900 mb-4">The canvas for every hiring moment</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Whether you are hiring 1 person or 1,000, JobNinjas scales with your team.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Building2, color: "bg-blue-600", title: "Tech Hiring", desc: "Source 1000+ engineers, screen with AI, run technical assessments — all on one board." },
              { icon: GraduationCap, color: "bg-violet-600", title: "Campus Recruiting", desc: "Manage high-volume grad hiring with automated screening and bulk scheduling." },
              { icon: TrendingUp, color: "bg-emerald-600", title: "Executive Search", desc: "Confidential pipelines with dedicated AI agents for C-suite and VP roles." },
              { icon: Headphones, color: "bg-amber-600", title: "High-Volume Ops", desc: "Handle thousands of applications with parallel AI agents running 24/7." },
            ].map((u) => (
              <div key={u.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group cursor-pointer">
                <div className={`w-11 h-11 rounded-xl ${u.color} flex items-center justify-center mb-5`}><u.icon className="w-5 h-5 text-white" /></div>
                <h3 className="text-[16px] font-bold text-slate-900 mb-2">{u.title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">{u.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-[12px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-3">HR teams love JobNinjas</h2>
            <p className="text-slate-400 text-lg">Real results from teams using AI-powered hiring</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "We cut time-to-hire from 6 weeks to 11 days. The AI sourcing agent alone saved our team 40 hours a week.", name: "Sarah Chen", role: "Head of Talent, TechCorp", avatar: "S" },
              { quote: "The transcript analyzer is mind-blowing. It spots things we miss in interviews and gives consistent scoring across all candidates.", name: "Marcus Johnson", role: "HR Director, GrowthCo", avatar: "M" },
              { quote: "We scaled from 20 to 200 hires per quarter without adding a single recruiter. JobNinjas is the entire team.", name: "Priya Patel", role: "VP People Ops, ScaleUp", avatar: "P" },
            ].map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-7">
                <div className="flex gap-1 mb-4">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-slate-300 text-[15px] leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">{t.avatar}</div>
                  <div>
                    <p className="text-[13px] font-bold text-white">{t.name}</p>
                    <p className="text-[11px] text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[{ value: "73%", label: "Faster time-to-hire" }, { value: "10x", label: "More candidates screened" }, { value: "2.4M+", label: "Resumes analyzed" }, { value: "98%", label: "HR team satisfaction" }].map((s) => (
            <div key={s.label}>
              <p className="text-5xl font-black text-slate-900 mb-2">{s.value}</p>
              <p className="text-[14px] text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[13px] font-bold text-blue-600 uppercase tracking-widest mb-3">Simple pricing</p>
          <h2 className="text-4xl font-black text-slate-900 mb-4">Start free. Scale as you grow.</h2>
          <p className="text-slate-500 text-lg mb-10">No per-seat pricing. No hidden fees. One plan that grows with your team.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { name: "Free", price: "0", period: "forever", features: ["3 hiring boards", "5 AI agent runs/day", "Basic connectors", "1 team member"], cta: "Start free", highlight: false },
              { name: "Team", price: "49", period: "per month", features: ["Unlimited boards", "500 AI runs/day", "All integrations", "Up to 15 members"], cta: "Start 14-day trial", highlight: true },
              { name: "Enterprise", price: "Custom", period: "contact us", features: ["Unlimited everything", "Dedicated AI agents", "SSO & compliance", "Dedicated support"], cta: "Contact sales", highlight: false },
            ].map((p) => (
              <div key={p.name} className={`rounded-2xl border-2 p-7 text-left ${p.highlight ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-200 bg-white"}`}>
                <p className={`text-[13px] font-bold uppercase tracking-widest mb-2 ${p.highlight ? "text-indigo-200" : "text-slate-400"}`}>{p.name}</p>
                <p className={`text-4xl font-black mb-1 ${p.highlight ? "text-white" : "text-slate-900"}`}>{p.price === "Custom" ? "Custom" : "$" + p.price}</p>
                <p className={`text-[12px] mb-6 ${p.highlight ? "text-indigo-200" : "text-slate-400"}`}>{p.period}</p>
                <div className="space-y-2.5 mb-7">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${p.highlight ? "text-indigo-200" : "text-emerald-500"}`} />
                      <span className={`text-[13px] ${p.highlight ? "text-indigo-100" : "text-slate-700"}`}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href={p.name === "Enterprise" ? "/solutions" : "/login"}
                  className={`block text-center text-[13px] font-bold py-3 rounded-xl transition-colors ${p.highlight ? "bg-white text-indigo-600 hover:bg-indigo-50" : "bg-slate-900 text-white hover:bg-slate-800"}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 text-white text-center"
        style={{ background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#0891b2 100%)" }}>
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-5xl font-black mb-5 leading-tight">Start hiring smarter today</h2>
          <p className="text-indigo-100 text-lg mb-10">Join thousands of HR teams replacing spreadsheets and manual work with intelligent AI hiring pipelines.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="flex items-center justify-center gap-2 bg-white text-indigo-600 font-bold text-[16px] px-8 py-4 rounded-xl shadow-lg hover:bg-indigo-50 transition-colors">
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/solutions" className="flex items-center justify-center gap-2 border-2 border-white/30 text-white font-bold text-[16px] px-8 py-4 rounded-xl hover:bg-white/10 transition-colors">
              Book a demo
            </Link>
          </div>
          <p className="mt-6 text-indigo-200 text-[13px]">Free for up to 3 boards. No credit card required.</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-950 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <Image src="/logo.png" alt="JobNinjas" width={32} height={32} className="object-contain" unoptimized />
                <span className="text-white font-extrabold text-lg">JobNinjas</span>
              </div>
              <p className="text-[14px] leading-relaxed mb-5">The intelligent hiring canvas for modern HR teams. AI-powered sourcing, screening, and onboarding on one collaborative board.</p>
              <div className="flex gap-3">
                {["Li", "Tw", "Gh"].map((s) => (
                  <div key={s} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-bold hover:bg-white/10 cursor-pointer transition-colors">{s}</div>
                ))}
              </div>
            </div>
            {[
              { title: "Product", links: ["AI Agents", "Pipelines", "Integrations", "Templates", "Changelog"] },
              { title: "Solutions", links: ["Tech Hiring", "Campus Recruiting", "Executive Search", "High-Volume", "Agencies"] },
              { title: "Resources", links: ["Blog", "Documentation", "Guides", "Webinars", "Status"] },
              { title: "Company", links: ["About", "Careers", "Press", "Privacy", "Terms"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-white font-bold text-[13px] mb-4">{col.title}</p>
                <div className="space-y-2.5">
                  {col.links.map((l) => (
                    <Link key={l} href="#" className="block text-[13px] text-slate-400 hover:text-white transition-colors">{l}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px]">
            <p>&copy; 2024 JobNinjas, Inc. All rights reserved.</p>
            <p>Built for HR teams who move fast.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
