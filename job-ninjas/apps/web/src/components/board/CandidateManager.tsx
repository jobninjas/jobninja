"use client";

import { useState, useEffect } from "react";
import { 
  Users, Plus, Upload, CheckCircle2, FileText, ChevronDown, 
  ChevronUp, Loader2, Database, AlertCircle, X, Check, ArrowRight
} from "lucide-react";
import { GreenhouseImportModal } from "./greenhouse-import-modal";

export default function CandidateManager({ roleId, roleTitle }: { roleId: string; roleTitle?: string }) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isGreenhouseOpen, setIsGreenhouseOpen] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  
  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchCandidates = async (preferredId?: string) => {
    try {
      setLoadingCandidates(true);
      const res = await fetch(`/api/candidates?roleId=${roleId}`);
      const data = await res.json();
      if (data.success && data.candidates) {
        setCandidates(data.candidates);
        const stored = preferredId || (typeof window !== 'undefined' ? window.localStorage.getItem('activeCandidateId') : null);
        const matched = data.candidates.find((c: any) => c.id === stored) || data.candidates[0];
        if (matched) {
          setActiveId(matched.id);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('activeCandidateId', matched.id);
            window.dispatchEvent(new CustomEvent('candidateChanged', { detail: { candidate: matched } }));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load candidates for board:', err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    if (!roleId) return;
    fetchCandidates();
  }, [roleId]);

  useEffect(() => {
    const handleCandidateChanged = (e: any) => {
      if (e.detail?.candidate?.id) {
        setActiveId(e.detail.candidate.id);
      }
    };
    window.addEventListener('candidateChanged', handleCandidateChanged);
    return () => window.removeEventListener('candidateChanged', handleCandidateChanged);
  }, []);

  const handleSelectCandidate = (id: string) => {
    setActiveId(id);
    const matched = candidates.find(c => c.id === id);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('activeCandidateId', id);
      window.dispatchEvent(new CustomEvent('candidateChanged', { detail: { candidate: matched } }));
    }
  };

  const handleCreate = async () => {
    if (!firstName || !lastName || !email) return alert("Please fill in first name, last name, and email.");
    
    try {
      setUploading(true);
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId, firstName, lastName, email, location })
      });
      const data = await res.json();
      if (data.success && data.candidate) {
        const newId = data.candidate.id;
        
        if (resumeFile) {
          const formData = new FormData();
          formData.append('candidateId', newId);
          formData.append('file', resumeFile);
          await fetch('/api/resumes/upload', { method: 'POST', body: formData });
        }
        
        await fetchCandidates(newId);
        setIsCreating(false);
        setIsExpanded(false);
        setFirstName("");
        setLastName("");
        setEmail("");
        setLocation("");
        setResumeFile(null);
      } else {
        alert(data.error || 'Failed to create candidate');
      }
    } catch (e: any) {
      alert("Error creating candidate: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleGreenhouseImportSuccess = (imported: any[]) => {
    fetchCandidates(imported[0]?.id);
    setIsExpanded(false);
  };

  const activeCandidate = candidates.find(c => c.id === activeId);

  return (
    <>
      {/* Positioned on top-left beside JobNinjas logo (left-52) so it NEVER collides with Inspector */}
      <div className="absolute top-6 left-52 z-40 flex flex-col font-sans transition-all duration-200">
        
        {/* Compact Pill Bar */}
        <div className="bg-white/95 backdrop-blur-md shadow-md hover:shadow-lg rounded-2xl border border-slate-200/80 px-3.5 py-2 flex items-center gap-3 transition-all">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
            title="Click to switch candidate or manage pipeline"
          >
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-100 transition-colors">
              <Users className="w-4 h-4" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {activeCandidate ? `${activeCandidate.firstName} ${activeCandidate.lastName}` : (loadingCandidates ? "Loading..." : "No Candidates")}
                </span>
                {activeCandidate && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {activeCandidate.stage || 'APPLIED'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                {activeCandidate?.resumeText ? (
                  <span className="text-emerald-600 flex items-center gap-0.5 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Resume Ready
                  </span>
                ) : (
                  <span className="text-amber-500 flex items-center gap-0.5 font-medium">
                    <AlertCircle className="w-3 h-3 text-amber-500" /> No Resume
                  </span>
                )}
                <span>• {candidates.length} in pipeline</span>
              </div>
            </div>

            <div className="p-1 text-slate-400 group-hover:text-slate-600">
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {/* Quick Actions in Pill */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200/70">
            <button
              onClick={() => setIsGreenhouseOpen(true)}
              title="Import candidates from Greenhouse ATS"
              className="px-2 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200/60 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Database className="w-3 h-3 text-emerald-600" /> ATS
            </button>
            <button
              onClick={() => {
                setIsExpanded(true);
                setIsCreating(true);
              }}
              className="px-2.5 py-1 text-[11px] font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
        </div>

        {/* Expanded Drawer / Dropdown */}
        {isExpanded && (
          <div className="mt-2 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-200/80 p-4 w-[380px] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Candidate Pipeline</span>
              <button 
                onClick={() => { setIsExpanded(false); setIsCreating(false); }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Create Candidate Form */}
            {isCreating ? (
              <div className="flex flex-col gap-2 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">New Applicant</p>
                  <button onClick={() => setIsCreating(false)} className="text-[11px] text-slate-400 hover:text-slate-700">Cancel</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="border border-slate-200 bg-white p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="First Name *"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                  <input
                    className="border border-slate-200 bg-white p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Last Name *"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </div>
                <input
                  className="border border-slate-200 bg-white p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Email *"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <input
                  className="border border-slate-200 bg-white p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Location (e.g. San Francisco, CA)"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />

                <div className="border border-dashed border-slate-300 p-2.5 rounded-lg text-center bg-white relative cursor-pointer hover:bg-indigo-50/30 transition-colors">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".pdf,.txt,.docx"
                    onChange={e => e.target.files && setResumeFile(e.target.files[0])}
                  />
                  <div className="flex items-center justify-center gap-2 text-slate-600">
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="truncate text-[11px] font-medium">{resumeFile ? resumeFile.name : "Upload Resume (PDF/TXT)"}</span>
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={uploading}
                  className="bg-indigo-600 text-white font-bold rounded-lg py-2 mt-1 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 text-xs shadow-xs cursor-pointer"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Save Candidate
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Candidate List / Switcher */}
                <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {candidates.map(c => {
                    const isSelected = c.id === activeId;
                    return (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCandidate(c.id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400' 
                            : 'bg-white border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{c.firstName} {c.lastName}</span>
                            {c.atsId && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                ATS
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">{c.email}</span>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {c.stage}
                          </span>
                          <span className="text-[10px]">
                            {c.resumeText ? (
                              <span className="text-emerald-600 font-bold">✓ Resume</span>
                            ) : (
                              <span className="text-amber-500 font-medium">No Resume</span>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full py-2 border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5 mt-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Candidate
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Greenhouse Import Modal */}
      <GreenhouseImportModal
        isOpen={isGreenhouseOpen}
        onClose={() => setIsGreenhouseOpen(false)}
        roleId={roleId}
        roleTitle={roleTitle}
        onImportSuccess={handleGreenhouseImportSuccess}
      />
    </>
  );
}
