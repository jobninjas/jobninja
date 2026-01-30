'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Trophy, AlertTriangle, Target, Zap,
    RotateCcw, Download, CheckCircle2, BarChart3,
    ChevronRight, Quote, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EvaluationReportPage() {
    const { sessionId } = useParams();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/interview/report?sessionId=${sessionId}`);
                const data = await res.json();
                if (data.success) {
                    setReport(data.report);
                }
            } catch (err) {
                console.error('Report fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6" />
                <p className="text-slate-600 font-medium">Generating your evaluation report...</p>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Report Not Found</h2>
                <p className="text-slate-600 mb-8">We couldn't find the evaluation for this session.</p>
                <Button onClick={() => window.location.href = '/interview-prep'}>Return Home</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Evaluation Report</h1>
                        <p className="text-slate-600">Mock Interview Performance Analysis</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2">
                            <Download size={18} /> Download PDF
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={() => window.location.href = '/interview-prep'}>
                            <RotateCcw size={18} /> Practice Again
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Scores & Summary */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Score Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 z-0" />
                            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-6 relative z-10">Role-Fit Score</h3>
                            <div className="relative z-10 mb-6">
                                <span className="text-7xl font-black text-blue-600">{report.roleFitScore}</span>
                                <span className="text-2xl text-slate-400 font-bold">/100</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 mb-6">
                                <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${report.roleFitScore}%` }} />
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed px-4">
                                Your performance shows strong alignment with the technical requirements but could benefit from more structured STAR responses.
                            </p>
                        </div>

                        {/* Metric Breakdown */}
                        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
                            <h3 className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase opacity-50 mb-8">
                                <BarChart3 size={16} /> Skills Matrix
                            </h3>
                            <div className="space-y-6">
                                {Object.entries(report.scores || {}).map(([key, value]: [string, any]) => (
                                    <div key={key}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="capitalize font-medium text-slate-300">{key}</span>
                                            <span className="font-mono text-blue-400 font-bold">{value}/10</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full transition-all duration-1000" style={{ width: `${(value / 10) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Summary section */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                            <h3 className="flex items-center gap-3 text-xl font-bold text-slate-900 mb-6">
                                <Target className="text-indigo-600" /> Interview Summary
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                {report.summary}
                            </p>
                        </div>

                        {/* Strengths & Gaps */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100">
                                <h4 className="flex items-center gap-2 text-emerald-800 font-bold mb-6">
                                    <Zap size={20} /> Strengths
                                </h4>
                                <ul className="space-y-4">
                                    {report.strengths.map((s: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-sm text-emerald-700 leading-relaxed font-medium">
                                            <CheckCircle2 size={18} className="shrink-0 mt-0.5 opacity-60" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100">
                                <h4 className="flex items-center gap-2 text-amber-800 font-bold mb-6">
                                    <AlertTriangle size={20} /> Areas for Growth
                                </h4>
                                <ul className="space-y-4">
                                    {report.gaps.map((g: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-sm text-amber-700 leading-relaxed font-medium">
                                            <ChevronRight size={18} className="shrink-0 mt-0.5 opacity-60" />
                                            {g}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Actionable Fixes */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-8">Top 10 Actionable Fixes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {report.actionableFixes.map((fix: string, i: number) => (
                                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition hover:border-blue-200 hover:bg-white group">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:text-blue-600 group-hover:border-blue-200">
                                            {i + 1}
                                        </span>
                                        <p className="text-sm text-slate-600 font-semibold group-hover:text-slate-900 transition">{fix}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rewrites */}
                        <div className="bg-indigo-900 rounded-3xl p-8 text-white">
                            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                                <RotateCcw className="text-indigo-400" /> Optimized Answer Rewrites
                            </h3>
                            <div className="space-y-8">
                                {report.rewrittenAnswers?.map((item: any, i: number) => (
                                    <div key={i} className="space-y-4">
                                        <div className="relative p-6 bg-white/5 rounded-2xl border border-white/10 blur-[0.2px]">
                                            <Quote className="absolute top-4 left-4 text-white/10" size={40} />
                                            <div className="relative z-10">
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 block mb-2">Original Answer</span>
                                                <p className="text-slate-300 text-sm italic italic leading-relaxed">"{item.original}"</p>
                                            </div>
                                        </div>
                                        <div className="relative p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                            <div className="relative z-10">
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block mb-2">Optimized Version</span>
                                                <p className="text-emerald-50 text-sm leading-relaxed font-medium">{item.improved}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
