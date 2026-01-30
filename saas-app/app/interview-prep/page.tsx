'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Briefcase, FileText, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InterviewPrepSetup() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [jd, setJd] = useState('');
    const [roleTitle, setRoleTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleCreateSession = async () => {
        if (!file || !jd || !roleTitle) return;

        setIsCreating(true);
        try {
            const formData = new FormData();
            formData.append('resume', file);
            formData.append('jd', jd);
            formData.append('roleTitle', roleTitle);

            const response = await fetch('/api/interview/create-session', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.sessionId) {
                router.push(`/interview-prep/${data.sessionId}`);
            }
        } catch (error) {
            console.error('Failed to create session:', error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                        AI Interview Prep
                    </h1>
                    <p className="text-lg text-slate-600">
                        Practice for your next role with our real-time voice-based mock interviewer.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="p-8 space-y-8">
                        {/* Step 1: Role */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Briefcase size={20} />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800">What role are you applying for?</h2>
                            </div>
                            <input
                                type="text"
                                placeholder="e.g. Senior Software Engineer"
                                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                value={roleTitle}
                                onChange={(e) => setRoleTitle(e.target.value)}
                            />
                        </section>

                        {/* Step 2: Resume */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <FileText size={20} />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800">Upload your Resume</h2>
                            </div>
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-slate-50 hover:border-blue-400 cursor-pointer transition">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-10 h-10 text-slate-400 mb-2" />
                                    <p className="mb-2 text-sm text-slate-500">
                                        <span className="font-semibold">{file ? file.name : "Click to upload"}</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-slate-400">PDF or DOCX (MAX. 5MB)</p>
                                </div>
                                <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                            </label>
                        </section>

                        {/* Step 3: Job Description */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Play size={20} />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800">Paste the Job Description</h2>
                            </div>
                            <textarea
                                placeholder="Paste the full JD details here..."
                                className="w-full h-48 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                                value={jd}
                                onChange={(e) => setJd(e.target.value)}
                            />
                        </section>

                        <div className="pt-4">
                            <Button
                                className="w-full h-16 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                onClick={handleCreateSession}
                                disabled={!file || !jd || !roleTitle || isCreating}
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Preparing your Interview...
                                    </>
                                ) : (
                                    <>
                                        Ready to Practice?
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
