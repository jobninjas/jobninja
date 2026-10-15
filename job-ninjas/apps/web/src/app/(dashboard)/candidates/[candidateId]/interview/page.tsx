"use client";

import { use, useEffect, useState } from 'react';
import { Upload, Check, AlertCircle, FileText, Loader2, Sparkles, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function InterviewWorkspace({ params }: { params: Promise<{ candidateId: string }> }) {
  const resolvedParams = use(params);
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [savingTranscript, setSavingTranscript] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [activeInterview, setActiveInterview] = useState<any>(null);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/candidates?candidateId=${resolvedParams.candidateId}`);
      const data = await res.json();
      if (data.success && data.candidate) {
        setCandidate(data.candidate);
        if (data.candidate.interviews && data.candidate.interviews.length > 0) {
          const latest = data.candidate.interviews[0];
          setActiveInterview(latest);
          if (latest.transcriptText) {
            setTranscript(latest.transcriptText);
          }
        }
        // Check if there are artifacts for interview analysis
        const analysisArtifact = data.candidate.artifacts?.find((a: any) => a.artifactType === 'InterviewAnalysis');
        if (analysisArtifact && analysisArtifact.data) {
          setAnalysisResult(analysisArtifact.data);
        }
      }
    } catch (err) {
      console.error('Failed to load candidate:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [resolvedParams.candidateId]);

  const handleSaveTranscript = async () => {
    if (!transcript) return alert('Please enter a transcript');
    try {
      setSavingTranscript(true);
      let interviewId = activeInterview?.id;
      if (!interviewId) {
        const createRes = await fetch('/api/interviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateId: resolvedParams.candidateId,
            title: 'Technical Interview',
          }),
        });
        const createData = await createRes.json();
        if (createData.success) {
          interviewId = createData.interview.id;
          setActiveInterview(createData.interview);
        }
      }

      if (interviewId) {
        await fetch('/api/interviews/transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            interviewId,
            transcriptText: transcript,
          }),
        });
        alert('Transcript saved successfully!');
      }
    } catch (err: any) {
      alert('Error saving transcript: ' + err.message);
    } finally {
      setSavingTranscript(false);
    }
  };

  const handleAnalyze = async () => {
    if (!transcript) return alert('Please save a transcript before running analysis.');
    try {
      setAnalyzing(true);
      // Run the Interview Analysis agent
      const res = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'agent-interview-analysis',
          roleId: candidate.roleId,
          candidateId: candidate.id,
          upstreamNodeIds: [],
        }),
      });
      const data = await res.json();
      if (data.success && data.output) {
        setAnalysisResult(data.output);
      } else {
        alert(data.error || 'Failed to analyze transcript');
      }
    } catch (err: any) {
      alert('Error running AI analysis: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Loading interview workspace...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p className="text-base font-semibold mb-2">Candidate record not found</p>
        <Link href="/candidates" className="text-sm text-blue-600 hover:underline">
          &larr; Return to candidate list
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto h-full overflow-y-auto font-sans">
      <Link href="/candidates" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-4 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to candidates
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Technical Interview Workspace</h2>
          <p className="text-sm text-slate-500 mt-1">
            Candidate: <span className="font-semibold text-slate-800">{candidate.firstName} {candidate.lastName}</span> ({candidate.email}) &bull; Stage: <span className="font-semibold text-blue-600">{candidate.stage}</span>
          </p>
        </div>
        {candidate.role && (
          <Link
            href={`/roles/${candidate.role.id}/board`}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            Open Role Board &rarr;
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Candidate Info & Resume preview */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Applicant Profile</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Position:</span>
                <span className="font-medium text-slate-800">{candidate.role?.title || 'General'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Location:</span>
                <span className="font-medium text-slate-800">{candidate.location || 'Remote'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Travel Budget:</span>
                <span className="font-medium text-slate-800">{candidate.travelBudget ? `$${candidate.travelBudget}` : 'N/A'}</span>
              </div>
            </div>

            {candidate.resumeText && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Resume Excerpt</p>
                <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-600 max-h-40 overflow-y-auto font-mono whitespace-pre-wrap">
                  {candidate.resumeText.slice(0, 500)}...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Transcript input and AI scorecard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Interview Transcript</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveTranscript}
                  disabled={savingTranscript}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {savingTranscript ? 'Saving...' : 'Save Transcript'}
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Run AI Analysis
                </button>
              </div>
            </div>

            <textarea
              className="w-full h-52 p-3.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
              placeholder="Paste raw transcript from Zoom, Google Meet, or notes here..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
          </div>

          {/* AI Analysis Result */}
          {analysisResult && (
            <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
              <div className="flex items-center gap-2 mb-4 text-blue-700">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">AI Interview Scorecard</h3>
              </div>

              {analysisResult.summary && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Executive Summary</p>
                  <p className="text-sm text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    {analysisResult.summary}
                  </p>
                </div>
              )}

              {analysisResult.competencies && Array.isArray(analysisResult.competencies) && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Competency Evaluation</p>
                  <div className="space-y-2">
                    {analysisResult.competencies.map((comp: any, idx: number) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{comp.name}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{comp.evidence}</p>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${comp.score === 'Strong' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : comp.score === 'Weak' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                          {comp.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysisResult.followUps && Array.isArray(analysisResult.followUps) && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recommended Follow-up Questions</p>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                    {analysisResult.followUps.map((q: string, idx: number) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
