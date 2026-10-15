"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Upload, CheckCircle2, FileText, ChevronDown, Loader2 } from "lucide-react";

export default function CandidateManager({ roleId }: { roleId: string }) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  
  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchCandidates = async () => {
    try {
      setLoadingCandidates(true);
      const res = await fetch(`/api/candidates?roleId=${roleId}`);
      const data = await res.json();
      if (data.success && data.candidates) {
        setCandidates(data.candidates);
        const stored = typeof window !== 'undefined' ? window.localStorage.getItem('activeCandidateId') : null;
        if (stored && data.candidates.some((c: any) => c.id === stored)) {
          setActiveId(stored);
        } else if (data.candidates.length > 0) {
          setActiveId(data.candidates[0].id);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('activeCandidateId', data.candidates[0].id);
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
    fetchCandidates();
  }, [roleId]);

  const handleSelectCandidate = (id: string) => {
    setActiveId(id);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('activeCandidateId', id);
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
        
        await fetchCandidates();
        handleSelectCandidate(newId);
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

  const handleAddTranscript = async () => {
    if (!activeId || !transcript.trim()) return alert("Please enter transcript text.");
    try {
      setUploading(true);
      const iRes = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: activeId })
      });
      const iData = await iRes.json();
      if (iData.interview) {
        await fetch('/api/interviews/transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interviewId: iData.interview.id, transcriptText: transcript })
        });
        alert('Interview transcript uploaded successfully!');
        setTranscript('');
      }
    } catch (e: any) {
      alert("Error uploading transcript: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const activeCandidate = candidates.find(c => c.id === activeId);

  return (
    <div className="absolute top-6 right-6 z-40 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl border border-slate-200/80 p-4 flex flex-col gap-3 min-w-[320px] max-w-[360px] font-sans">
      <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2 font-bold text-xs text-slate-800 uppercase tracking-wider">
          <Users className="w-4 h-4 text-blue-600" /> Active Candidate Context
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> {isCreating ? "Select" : "New"}
        </button>
      </div>

      {isCreating ? (
        <div className="flex flex-col gap-2 text-xs animate-in fade-in duration-150">
          <p className="font-semibold text-slate-700">Add Applicant to Role</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="border border-slate-200 p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="First Name *"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
            <input
              className="border border-slate-200 p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Last Name *"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </div>
          <input
            className="border border-slate-200 p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Email *"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="border border-slate-200 p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Location (e.g. New York, NY)"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />

          <div className="border border-dashed border-slate-300 p-2.5 rounded-lg text-center bg-slate-50 relative cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept=".pdf,.txt,.docx"
              onChange={e => e.target.files && setResumeFile(e.target.files[0])}
            />
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span className="truncate">{resumeFile ? resumeFile.name : "Upload Resume (PDF/TXT)"}</span>
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={uploading}
            className="bg-blue-600 text-white font-semibold rounded-lg py-2 mt-1 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Create & Bind Candidate
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {candidates.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500">Select pipeline candidate:</label>
              <select
                value={activeId}
                onChange={e => handleSelectCandidate(e.target.value)}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.stage})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic p-3 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
              No candidates in this pipeline yet. Click &quot;+ New&quot; to add one.
            </div>
          )}

          {activeCandidate && (
            <div className="text-xs bg-blue-50/70 border border-blue-100 p-2.5 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-900">{activeCandidate.firstName} {activeCandidate.lastName}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                  {activeCandidate.stage}
                </span>
              </div>
              <p className="text-[11px] text-blue-700 truncate">{activeCandidate.email}</p>
              <p className="text-[10px] text-slate-400 font-mono pt-0.5">ID: {activeCandidate.id.slice(0, 18)}...</p>
            </div>
          )}

          {activeId && (
            <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-2">
              <p className="text-[11px] font-semibold text-slate-600">Add Interview Transcript</p>
              <textarea
                className="border border-slate-200 text-xs p-2 h-16 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400 font-mono resize-none"
                placeholder="Paste interview transcript text..."
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
              />
              <button
                onClick={handleAddTranscript}
                disabled={uploading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                Save Transcript
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
