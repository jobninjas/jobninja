"use client";

import { useState, useEffect } from "react";
import { X, Check, Loader2, Sparkles, AlertCircle, FileText, CheckCircle2, RefreshCw, Database } from "lucide-react";

interface GreenhouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: string;
  roleTitle?: string;
  onImportSuccess: (candidates: any[]) => void;
}

export function GreenhouseImportModal({
  isOpen,
  onClose,
  roleId,
  roleTitle,
  onImportSuccess
}: GreenhouseModalProps) {
  const [apiKey, setApiKey] = useState("demo");
  const [isConnected, setIsConnected] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [loadingJobs, setLoadingJobs] = useState(false);

  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Restore saved key from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = window.localStorage.getItem('gh_harvest_key');
      if (savedKey) {
        setApiKey(savedKey);
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setError(null);
    setIsVerifying(true);
    try {
      const res = await fetch('/api/integrations/greenhouse/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
      const data = await res.json();
      if (data.success) {
        setIsConnected(true);
        setAccountInfo(data.user || data.accountName);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('gh_harvest_key', apiKey);
        }
        await loadJobs();
      } else {
        setIsConnected(false);
        setError(data.error || 'Connection failed');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch('/api/integrations/greenhouse/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
      const data = await res.json();
      if (data.success && data.jobs) {
        setJobs(data.jobs);
        // Find best match for current role title
        const matched = data.jobs.find((j: any) =>
          roleTitle && (j.name.toLowerCase().includes(roleTitle.toLowerCase()) || roleTitle.toLowerCase().includes(j.name.toLowerCase()))
        );
        const activeJobId = matched ? matched.id : (data.jobs[0]?.id || "");
        setSelectedJobId(activeJobId);
        if (activeJobId) {
          loadCandidates(activeJobId);
        }
      }
    } catch (e: any) {
      setError('Failed to load Greenhouse jobs');
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadCandidates = async (jobId: string) => {
    setLoadingCandidates(true);
    setError(null);
    try {
      const res = await fetch('/api/integrations/greenhouse/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, jobId })
      });
      const data = await res.json();
      if (data.success && data.candidates) {
        setCandidates(data.candidates);
        // Pre-select all candidates by default
        setSelectedCandidateIds(data.candidates.map((c: any) => c.candidateId));
      } else {
        setError(data.error || 'Failed to load candidates');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const toggleCandidate = (id: string) => {
    setSelectedCandidateIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCandidateIds.length === candidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(candidates.map(c => c.candidateId));
    }
  };

  const handleImport = async () => {
    if (selectedCandidateIds.length === 0) return;
    setIsImporting(true);
    setError(null);

    const candidatesToImport = candidates.filter(c => selectedCandidateIds.includes(c.candidateId));

    try {
      const res = await fetch('/api/integrations/greenhouse/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId,
          apiKey,
          candidates: candidatesToImport
        })
      });

      const data = await res.json();
      if (data.success && data.candidates) {
        setImportSuccessMessage(`Successfully imported ${data.importedCount} candidate(s) to this board!`);
        onImportSuccess(data.candidates);
        setTimeout(() => {
          onClose();
          setImportSuccessMessage(null);
        }, 1200);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden font-sans">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                Greenhouse ATS Connector
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 tracking-wide">
                  Harvest API v3
                </span>
              </h2>
              <p className="text-xs text-slate-500">Sync live candidate requisitions and resumes into this board</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {importSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{importSuccessMessage}</span>
            </div>
          )}

          {/* Section 1: Greenhouse Credentials */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Greenhouse Harvest API Key
              </label>
              {isConnected && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Enter Greenhouse Harvest API Key (or 'demo')"
                className="flex-1 text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-mono"
              />
              <button
                onClick={handleTestConnection}
                disabled={isVerifying || !apiKey}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {isConnected ? "Re-sync" : "Connect"}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              💡 Tip: Type <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono">demo</code> to test with high-fidelity candidate resumes in sandbox mode.
            </p>
          </div>

          {/* Section 2: Choose Job */}
          {isConnected && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Select Job Opening
              </label>
              {loadingJobs ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Loading Greenhouse jobs...
                </div>
              ) : (
                <select
                  value={selectedJobId}
                  onChange={e => {
                    setSelectedJobId(e.target.value);
                    loadCandidates(e.target.value);
                  }}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-medium outline-none focus:border-emerald-500 focus:bg-white cursor-pointer"
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.name} ({j.department})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Section 3: Candidates Table */}
          {isConnected && selectedJobId && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. Select Candidates to Import ({selectedCandidateIds.length} of {candidates.length} selected)
                </label>
                {candidates.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900"
                  >
                    {selectedCandidateIds.length === candidates.length ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>

              {loadingCandidates ? (
                <div className="flex flex-col items-center justify-center p-8 text-xs text-slate-500 gap-2 border border-slate-100 rounded-2xl bg-slate-50">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                  <span>Fetching candidate pipeline from Greenhouse...</span>
                </div>
              ) : candidates.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No active applicants found in this Greenhouse job requisition.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {candidates.map(c => {
                    const isSelected = selectedCandidateIds.includes(c.candidateId);
                    return (
                      <div
                        key={c.candidateId}
                        onClick={() => toggleCandidate(c.candidateId)}
                        className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-800">{c.firstName} {c.lastName}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {c.stage}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">{c.email} • {c.location}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {c.hasResume && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-100/70 text-emerald-800 border border-emerald-200/50">
                              <FileText className="w-3 h-3 text-emerald-600" /> Resume Attached
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <p className="text-xs text-slate-500">
            {selectedCandidateIds.length > 0 ? `${selectedCandidateIds.length} candidate(s) ready to import` : 'Select candidates above'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={isImporting || selectedCandidateIds.length === 0}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-emerald-600/20"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Importing Candidates...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Import Selected Candidates
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
