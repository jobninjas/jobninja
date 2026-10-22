"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Upload, CheckCircle2, FileText, ChevronDown, Loader2, Database, AlertCircle, X, Check } from "lucide-react";
import { GreenhouseImportModal } from "./greenhouse-import-modal";

export default function CandidateManager({ roleId, roleTitle }: { roleId: string; roleTitle?: string }) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string>("");
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
  };

  const activeCandidate = candidates.find(c => c.id === activeId);

  return (
    <>
      <div className="absolute top-6 right-6 z-40 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl border border-slate-200/80 p-3.5 flex flex-col gap-2.5 min-w-[340px] max-w-[380px] font-sans">
        
        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs text-slate-800 tracking-tight">Active Candidate Context</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsGreenhouseOpen(true)}
              title="Import candidates from Greenhouse ATS"
              className="px-2 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200/60 transition-colors flex items-center gap-1 shadow-xs"
            >
              <Database className="w-3 h-3 text-emerald-600" /> ATS
            </button>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="px-2.5 py-1 text-[11px] font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3 h-3" /> {isCreating ? "Cancel" : "Add"}
            </button>
          </div>
        </div>

        {/* Create Candidate Form */}
        {isCreating ? (
          <div className="flex flex-col gap-2 text-xs animate-in fade-in duration-150 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Add Applicant to Board</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                className="border border-slate-200 bg-white p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="First Name *"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
              <input
                className="border border-slate-200 bg-white p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Last Name *"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>
            <input
              className="border border-slate-200 bg-white p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Email *"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="border border-slate-200 bg-white p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Location (e.g. San Francisco, CA)"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />

            <div className="border border-dashed border-slate-300 p-2.5 rounded-lg text-center bg-white relative cursor-pointer hover:bg-blue-50/30 transition-colors">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".pdf,.txt,.docx"
                onChange={e => e.target.files && setResumeFile(e.target.files[0])}
              />
              <div className="flex items-center justify-center gap-2 text-slate-600">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span className="truncate text-[11px] font-medium">{resumeFile ? resumeFile.name : "Upload Resume (PDF/TXT)"}</span>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={uploading}
              className="bg-blue-600 text-white font-bold rounded-lg py-2 mt-1 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 text-xs shadow-xs"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Save & Attach Candidate
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Candidate Selector */}
            {candidates.length > 0 ? (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Pipeline Candidates ({candidates.length})
                  </label>
                  {loadingCandidates && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                </div>
                <select
                  value={activeId}
                  onChange={e => handleSelectCandidate(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-2 bg-slate-50 text-slate-800 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.stage})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic p-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No candidates in this pipeline yet. Click &quot;Add&quot; or &quot;ATS&quot; to import.
              </div>
            )}

            {/* Active Candidate Status Card */}
            {activeCandidate && (
              <div className="text-xs bg-slate-50/90 border border-slate-200/80 p-2.5 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{activeCandidate.firstName} {activeCandidate.lastName}</span>
                    {activeCandidate.atsId && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Greenhouse
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    {activeCandidate.stage}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[200px]">{activeCandidate.email}</span>
                  <span>{activeCandidate.location || 'Remote'}</span>
                </div>

                <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    {activeCandidate.resumeText ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resume Parsed ({activeCandidate.resumeText.length} chars)
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-500" /> No resume attached
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-slate-400">ID: {activeCandidate.id.slice(0, 8)}</span>
                </div>
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
