"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Upload } from "lucide-react";

export default function CandidateManager({ roleId }: { roleId: string }) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  
  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    // We would fetch candidates for this role from the DB here
    // For MVP, we might rely on the creation flow directly.
    const stored = window.localStorage.getItem('activeCandidateId');
    if (stored) setActiveId(stored);
  }, []);

  const handleCreate = async () => {
    if (!firstName || !lastName || !email) return alert("Fill required fields");
    
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId, firstName, lastName, email })
      });
      const data = await res.json();
      if (data.candidate) {
        const newId = data.candidate.id;
        
        if (resumeFile) {
          const formData = new FormData();
          formData.append('candidateId', newId);
          formData.append('file', resumeFile);
          await fetch('/api/resumes/upload', { method: 'POST', body: formData });
        }
        
        setCandidates(prev => [...prev, data.candidate]);
        setActiveId(newId);
        window.localStorage.setItem('activeCandidateId', newId);
        setIsCreating(false);
      }
    } catch (e) {
      alert("Error creating candidate");
    }
  };

  const handleAddTranscript = async () => {
    if (!activeId || !transcript) return;
    try {
      const iRes = await fetch('/api/interviews', { method: 'POST', body: JSON.stringify({ candidateId: activeId }) });
      const iData = await iRes.json();
      if (iData.interview) {
        await fetch('/api/interviews/transcript', { method: 'POST', body: JSON.stringify({ interviewId: iData.interview.id, transcriptText: transcript }) });
        alert('Transcript added!');
        setTranscript('');
      }
    } catch (e) {}
  };

  return (
    <div className="absolute top-4 right-4 z-50 bg-white shadow-lg rounded-xl border p-3 flex flex-col gap-2 min-w-[300px]">
      <div className="flex justify-between items-center border-b pb-2">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Users className="w-4 h-4 text-blue-600" /> Active Candidate
        </div>
        <button onClick={() => setIsCreating(!isCreating)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {isCreating ? (
        <div className="flex flex-col gap-2 text-sm mt-2">
          <input className="border p-1.5 rounded" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
          <input className="border p-1.5 rounded" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
          <input className="border p-1.5 rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          
          <div className="border border-dashed border-slate-300 p-2 rounded text-center bg-slate-50 mt-1 relative cursor-pointer hover:bg-slate-100">
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.txt,.docx" onChange={e => e.target.files && setResumeFile(e.target.files[0])} />
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Upload className="w-4 h-4" /> {resumeFile ? resumeFile.name : "Upload Resume (PDF/TXT)"}
            </div>
          </div>
          
          <button onClick={handleCreate} className="bg-blue-600 text-white font-bold rounded py-1.5 mt-2 hover:bg-blue-700">Create & Select</button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-1">
          {activeId ? (
            <div className="text-sm bg-blue-50 text-blue-800 p-2 rounded font-medium border border-blue-100">
              ID: <span className="font-mono text-xs opacity-70">{activeId}</span>
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic p-2 text-center">
              No candidate selected. Click + to create.
            </div>
          )}
          
          <div className="flex flex-col gap-1 border-t pt-2 mt-2">
            <p className="text-xs font-bold text-slate-500">Interview Transcript</p>
            <textarea className="border text-xs p-1 h-16 rounded" placeholder="Paste transcript..." value={transcript} onChange={e => setTranscript(e.target.value)} />
            <button onClick={handleAddTranscript} className="bg-emerald-600 text-white text-xs py-1 rounded">Upload Transcript</button>
          </div>
          
          <button onClick={() => { setActiveId(""); window.localStorage.removeItem('activeCandidateId'); }} className="text-xs text-slate-400 hover:text-slate-600 text-right mt-2 border-t pt-2">Clear Selection</button>
        </div>
      )}
    </div>
  );
}
