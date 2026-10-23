"use client";

import { useBoardStore } from "@/store/board";
import { LayerType } from "@/types/canvas";
import { 
  Settings2, X, Trash2, Play, Loader2, Copy, Check, 
  ChevronDown, ChevronRight, RefreshCw, Cpu, Database, 
  User, FileText, CheckCircle2, AlertCircle, Info, 
  Sliders, Layers, Sparkles, ArrowDownRight, ArrowUpRight,
  Code2, ExternalLink, Upload, Edit3, Save, AlertTriangle,
  Building, Briefcase, ThumbsUp, ThumbsDown, Award, CalendarDays,
  DollarSign, MapPin
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useDemoStore } from "@/lib/store";
import { getNodeSpec, NodeDescription } from "@/lib/agents/node-specs";

export const InspectorPanel = ({ boardId }: { boardId?: string }) => {
  const { inspectedNodeId, setInspectedNodeId, layers, updateLayer, deleteLayers, edges } = useBoardStore();
  const roles = useDemoStore(state => state.roles);
  const currentRole = roles.find(r => r.id === boardId);
  const selectedIds = inspectedNodeId ? [inspectedNodeId] : [];
  
  const [width, setWidth] = useState(560);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'parameters' | 'output'>('parameters');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [inputViewMode, setInputViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [outputViewMode, setOutputViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [availableCandidates, setAvailableCandidates] = useState<any[]>([]);

  // Real Database Role & JD Editing
  const [dbRole, setDbRole] = useState<any>(null);
  const [isEditingJd, setIsEditingJd] = useState(false);
  const [jdText, setJdText] = useState("");
  const [savingJd, setSavingJd] = useState(false);

  // Resume Upload & Manual Paste
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [pastedResumeText, setPastedResumeText] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUploadError, setResumeUploadError] = useState<string | null>(null);
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState<string | null>(null);

  // Drag-to-resize inspector drawer
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newWidth = window.innerWidth - e.clientX - 16;
    if (newWidth > 380 && newWidth < 1200) {
      setWidth(newWidth);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Fetch real role from DB
  const fetchRole = useCallback(() => {
    if (!boardId || boardId === 'new-workflow') return;
    fetch('/api/roles')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data?.roles || [];
        const match = list.find((r: any) => r.id === boardId);
        if (match) {
          setDbRole(match);
          setJdText(match.jobDescription || "");
        }
      })
      .catch(console.error);
  }, [boardId]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  // Fetch candidates for current role to ensure accurate context
  const fetchCandidates = useCallback(() => {
    if (!boardId || boardId === 'new-workflow') return;
    fetch(`/api/candidates?roleId=${boardId}`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data?.candidates || [];
        setAvailableCandidates(list);
        const storedCandId = typeof window !== 'undefined' ? window.localStorage.getItem('activeCandidateId') : null;
        const matched = list.find((c: any) => c.id === storedCandId) || list[0];
        if (matched) {
          setSelectedCandidate(matched);
        }
      })
      .catch(console.error);
  }, [boardId]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  useEffect(() => {
    const handleCandidateChanged = (e: any) => {
      if (e.detail?.candidate) {
        setSelectedCandidate(e.detail.candidate);
      }
    };
    window.addEventListener('candidateChanged', handleCandidateChanged);
    return () => window.removeEventListener('candidateChanged', handleCandidateChanged);
  }, []);

  // Save Job Description to DB
  const handleSaveJd = async () => {
    if (!boardId) return;
    try {
      setSavingJd(true);
      const res = await fetch('/api/roles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: boardId, jobDescription: jdText })
      });
      const data = await res.json();
      if (data.success && data.role) {
        setDbRole(data.role);
        setIsEditingJd(false);
      }
    } catch (err) {
      console.error('Failed to save JD:', err);
    } finally {
      setSavingJd(false);
    }
  };

  // Upload Resume File
  const handleUploadResumeFile = async (file: File) => {
    if (!selectedCandidate?.id) return;
    setUploadingResume(true);
    setResumeUploadError(null);
    setResumeUploadSuccess(null);
    try {
      const formData = new FormData();
      formData.append('candidateId', selectedCandidate.id);
      formData.append('file', file);
      const res = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.candidate) {
        setSelectedCandidate(data.candidate);
        setResumeUploadSuccess(`Resume parsed (${data.candidate.resumeText?.length || 0} characters)`);
        setIsEditingResume(false);
        fetchCandidates();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('candidateChanged', { detail: { candidate: data.candidate } }));
        }
      } else {
        setResumeUploadError(data.error || 'Failed to upload resume');
      }
    } catch (err: any) {
      setResumeUploadError(err.message || 'Error uploading file');
    } finally {
      setUploadingResume(false);
    }
  };

  // Save Pasted Resume Text
  const handleSavePastedResume = async () => {
    if (!selectedCandidate?.id || !pastedResumeText.trim()) return;
    setUploadingResume(true);
    setResumeUploadError(null);
    setResumeUploadSuccess(null);
    try {
      const res = await fetch('/api/candidates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedCandidate.id,
          resumeText: pastedResumeText.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.candidate) {
        setSelectedCandidate(data.candidate);
        setResumeUploadSuccess('Resume text saved successfully!');
        setIsEditingResume(false);
        setPastedResumeText('');
        fetchCandidates();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('candidateChanged', { detail: { candidate: data.candidate } }));
        }
      } else {
        setResumeUploadError(data.error || 'Failed to save resume text');
      }
    } catch (err: any) {
      setResumeUploadError(err.message || 'Error saving resume');
    } finally {
      setUploadingResume(false);
    }
  };

  // UNCONDITIONAL RESOLUTION FOR RULES OF HOOKS
  const layerId = selectedIds.length === 1 ? selectedIds[0] : null;
  const layer = layerId ? layers[layerId] : null;
  const nodeSpec: NodeDescription = getNodeSpec(layer?.agentRole);

  const effectiveRole = dbRole || currentRole;

  // Incoming edges and upstream nodes
  const incomingEdges = useMemo(() => {
    if (!layerId) return [];
    return Object.values(edges).filter(e => e.toNodeId === layerId);
  }, [edges, layerId]);

  const upstreamNodeIds = useMemo(() => {
    return incomingEdges.map(e => e.fromNodeId);
  }, [incomingEdges]);

  const upstreamLayers = useMemo(() => {
    return upstreamNodeIds.map(id => layers[id]).filter(Boolean);
  }, [upstreamNodeIds, layers]);

  // Collect client upstream outputs from layers in state
  const clientUpstreamOutputs = useMemo(() => {
    const outputs: Record<string, any> = {};
    for (const upId of upstreamNodeIds) {
      const upLayer = layers[upId] as any;
      if (upLayer?.outputData) {
        if (upLayer.agentRole === 'agent-resume') outputs['ResumeAnalysis'] = upLayer.outputData;
        if (upLayer.agentRole === 'agent-interview-plan') outputs['InterviewPlan'] = upLayer.outputData;
        if (upLayer.agentRole === 'agent-interview-analysis') outputs['InterviewAnalysis'] = upLayer.outputData;
        if (upLayer.agentRole === 'agent-decision') outputs['CandidateDecision'] = upLayer.outputData;
        if (upLayer.agentRole === 'agent-concierge') outputs['ConciergeItinerary'] = upLayer.outputData;
      }
    }
    return outputs;
  }, [upstreamNodeIds, layers]);

  // Resolved candidate ID
  const activeCandidateId = selectedCandidate?.id || (typeof window !== 'undefined' ? window.localStorage.getItem('activeCandidateId') : null);

  // Compile real input view data
  const consolidatedInputData = useMemo(() => {
    if (!layer) return {};
    if ((layer as any).inputData) return (layer as any).inputData;
    return {
      role: effectiveRole ? {
        id: effectiveRole.id,
        title: effectiveRole.title,
        location: effectiveRole.location,
        description: effectiveRole.jobDescription
      } : null,
      candidate: selectedCandidate ? {
        id: selectedCandidate.id,
        firstName: selectedCandidate.firstName,
        lastName: selectedCandidate.lastName,
        email: selectedCandidate.email,
        location: selectedCandidate.location,
        stage: selectedCandidate.stage || selectedCandidate.currentStage || 'APPLIED',
        currentStage: selectedCandidate.stage || selectedCandidate.currentStage || 'APPLIED',
        hasResume: !!selectedCandidate.resumeText,
        resumePreview: selectedCandidate.resumeText ? selectedCandidate.resumeText.slice(0, 200) + '...' : null
      } : null,
      upstreamOutputs: clientUpstreamOutputs
    };
  }, [layer, effectiveRole, selectedCandidate, clientUpstreamOutputs]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConfigChange = (key: string, value: any) => {
    if (!layerId) return;
    const currentConfig = (layer as any)?.config || {};
    updateLayer(layerId, {
      config: {
        ...currentConfig,
        [key]: value
      }
    });
  };

  const handleRunAgent = async () => {
    if (!layerId || !layer) return;
    updateLayer(layerId, { status: 'running', errorDetails: undefined });
    setActiveTab('output');
    try {
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: layer.agentRole,
          nodeId: layerId,
          roleId: boardId,
          candidateId: activeCandidateId,
          upstreamNodeIds,
          clientUpstreamOutputs
        })
      });
      const data = await response.json();
      if (!response.ok || data.status === 'ERROR' || data.status === 'BLOCKED') {
        updateLayer(layerId, { 
          status: 'error', 
          errorDetails: data.error || data.missingInputs?.join(', ') || 'Evaluation step failed',
          inputData: data.input,
          executionTimeMs: data.executionTimeMs
        });
      } else {
        updateLayer(layerId, { 
          status: 'success', 
          outputData: data.output,
          inputData: data.input,
          executionTimeMs: data.executionTimeMs,
          runId: data.runId,
          errorDetails: undefined
        });
      }
    } catch (err: any) {
      updateLayer(layerId, { status: 'error', errorDetails: err.message });
    }
  };

  // Safe to return null if no node is inspected
  if (!layerId || !layer) return null;

  const executionOutput = (layer as any).outputData || (layer as any).executionOutput;
  const executionTimeSec = (layer as any).executionTimeMs ? ((layer as any).executionTimeMs / 1000).toFixed(2) + 's' : null;

  return (
    <div 
      className="absolute right-4 top-20 bottom-4 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_12px_50px_rgba(0,0,0,0.18)] border border-slate-200/80 overflow-hidden z-40 flex flex-col font-sans transition-all duration-150"
      style={{ width: `${width}px` }}
    >
      {/* Drag handle */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-indigo-500/30 group flex items-center justify-center transition-colors z-50"
        onMouseDown={handleMouseDown}
      >
        <div className="w-1 h-10 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors" />
      </div>

      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${nodeSpec.bg} ${nodeSpec.color} flex items-center justify-center shadow-xs`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="font-bold text-[15px] text-slate-800 bg-transparent hover:bg-white/80 focus:bg-white px-1.5 py-0.5 -ml-1.5 rounded-md border border-transparent hover:border-slate-200 focus:border-indigo-400 focus:outline-none transition-all"
                value={layer.value || nodeSpec.displayName}
                onChange={(e) => updateLayer(layerId, { value: e.target.value })}
              />
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${nodeSpec.bg} ${nodeSpec.color}`}>
                {nodeSpec.category}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">{nodeSpec.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {layer.agentRole?.startsWith('agent-') && (
            <button
              onClick={handleRunAgent}
              disabled={layer.status === 'running'}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Evaluate active candidate with current step"
            >
              {layer.status === 'running' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Evaluate Candidate
                </>
              )}
            </button>
          )}

          <button 
            onClick={() => setInspectedNodeId(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recruiter 3-Tab Navigator */}
      <div className="flex items-center border-b border-slate-200/70 bg-white px-5 gap-6 text-[13px] font-semibold">
        <button
          onClick={() => setActiveTab('input')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'input'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowDownRight className="w-4 h-4" />
          Inputs
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
            {incomingEdges.length > 0 || selectedCandidate ? 'Ready' : '0'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('parameters')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'parameters'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          AI Settings
        </button>

        <button
          onClick={() => setActiveTab('output')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'output'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          Evaluation Results
          {layer.status === 'success' && (
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          )}
          {layer.status === 'error' && (
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          )}
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-5 bg-slate-50/40">

        {/* ─────────── TAB 1: INPUTS ─────────── */}
        {activeTab === 'input' && (
          <div className="flex flex-col gap-4">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Connected Pipeline Steps</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {incomingEdges.length} connected input step(s)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setInputViewMode('formatted')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    inputViewMode === 'formatted' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Recruiter View
                </button>
                <button
                  onClick={() => setInputViewMode('raw')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    inputViewMode === 'raw' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Debug JSON
                </button>
                <button
                  onClick={() => handleCopy(JSON.stringify(consolidatedInputData, null, 2), 'input-json')}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
                  title="Copy Data"
                >
                  {copiedKey === 'input-json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Candidate Selector */}
            {availableCandidates.length > 0 && (
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 flex flex-col gap-2 shadow-xs">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  Active Candidate for Evaluation
                </label>
                <select
                  value={selectedCandidate?.id || ''}
                  onChange={(e) => {
                    const found = availableCandidates.find(c => c.id === e.target.value);
                    if (found) {
                      setSelectedCandidate(found);
                      if (typeof window !== 'undefined') {
                        window.localStorage.setItem('activeCandidateId', found.id);
                        window.dispatchEvent(new CustomEvent('candidateChanged', { detail: { candidate: found } }));
                      }
                    }
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableCandidates.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.email}) - {c.stage || c.currentStage || 'APPLIED'} {c.resumeText ? '✓ Resume' : '⚠️ No Resume'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {inputViewMode === 'formatted' ? (
              <div className="flex flex-col gap-3">
                {/* Job Requisition Block with Inline JD Editing */}
                <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                      Job Requisition Profile
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-400">{effectiveRole?.department || 'Engineering'}</span>
                      <button
                        onClick={() => setIsEditingJd(!isEditingJd)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        {isEditingJd ? 'Cancel' : (effectiveRole?.jobDescription ? 'Edit JD' : 'Add JD')}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-slate-800">{effectiveRole?.title || 'Open Position'}</p>

                  {/* Inline JD Editor */}
                  {isEditingJd ? (
                    <div className="flex flex-col gap-2 mt-1">
                      <textarea
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Paste or type the full job description, requirements, and responsibilities here..."
                        className="w-full text-xs font-normal p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] text-slate-700"
                      />
                      <button
                        onClick={handleSaveJd}
                        disabled={savingJd}
                        className="self-end px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {savingJd ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save Job Description
                      </button>
                    </div>
                  ) : effectiveRole?.jobDescription ? (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-600 line-clamp-4 leading-relaxed">
                      {effectiveRole.jobDescription}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-bold text-amber-800">Job Description Missing</span>
                        <p className="text-[11px] text-amber-700 leading-snug">
                          The AI needs a job description to accurately evaluate candidate match. Click "Add JD" above to paste one.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Candidate Block with Inline Resume Dropzone */}
                <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-violet-600" />
                      Candidate Profile & Resume
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedCandidate?.resumeText ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {selectedCandidate?.resumeText ? '✓ Resume Attached' : '⚠️ No Resume'}
                      </span>
                      <button
                        onClick={() => setIsEditingResume(!isEditingResume)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        {isEditingResume ? 'Cancel' : (selectedCandidate?.resumeText ? 'Replace' : 'Upload')}
                      </button>
                    </div>
                  </div>

                  {selectedCandidate ? (
                    <div className="text-xs text-slate-700 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{selectedCandidate.firstName} {selectedCandidate.lastName}</span>
                        <span className="text-slate-400"> • {selectedCandidate.email}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">{selectedCandidate.location || 'Remote'}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">No candidate selected.</div>
                  )}

                  {/* Feedback alerts */}
                  {resumeUploadSuccess && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{resumeUploadSuccess}</span>
                    </div>
                  )}
                  {resumeUploadError && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{resumeUploadError}</span>
                    </div>
                  )}

                  {/* Interactive Upload/Paste zone */}
                  {(!selectedCandidate?.resumeText || isEditingResume) && selectedCandidate && (
                    <div className="flex flex-col gap-2.5 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 animate-in fade-in duration-150">
                      <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Attach Candidate Resume
                      </p>

                      {/* File Upload Zone */}
                      <div className="border border-slate-200 bg-white p-3 rounded-lg text-center relative cursor-pointer hover:bg-indigo-50/30 hover:border-indigo-300 transition-colors">
                        <input
                          type="file"
                          accept=".pdf,.txt,.docx,.doc"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          disabled={uploadingResume}
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleUploadResumeFile(e.target.files[0]);
                            }
                          }}
                        />
                        <div className="flex flex-col items-center justify-center gap-1">
                          {uploadingResume ? (
                            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5 text-indigo-600" />
                          )}
                          <span className="text-xs font-semibold text-slate-700">
                            {uploadingResume ? 'Parsing resume text...' : 'Click or Drag Resume (PDF / DOCX / TXT)'}
                          </span>
                          <span className="text-[10px] text-slate-400">Text content will be extracted automatically</span>
                        </div>
                      </div>

                      {/* Or Paste Text Option */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Or Paste Raw Resume Text / Bio</label>
                        <textarea
                          value={pastedResumeText}
                          onChange={(e) => setPastedResumeText(e.target.value)}
                          placeholder="Paste resume summary, work history, or LinkedIn profile here..."
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[80px]"
                        />
                        <button
                          onClick={handleSavePastedResume}
                          disabled={uploadingResume || !pastedResumeText.trim()}
                          className="self-end px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {uploadingResume ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                          Save Pasted Resume
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Existing Resume Preview */}
                  {selectedCandidate?.resumeText && !isEditingResume && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-600 font-mono line-clamp-4 leading-relaxed">
                      {selectedCandidate.resumeText}
                    </div>
                  )}
                </div>

                {/* Upstream Artifacts */}
                <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Previous Step Findings ({Object.keys(clientUpstreamOutputs).length})
                  </span>
                  {Object.keys(clientUpstreamOutputs).length === 0 ? (
                    <div className="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-200 rounded-lg">
                      No previous step outputs yet. Run upstream nodes to pass data here.
                    </div>
                  ) : (
                    Object.entries(clientUpstreamOutputs).map(([key, val]) => (
                      <div key={key} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 text-xs">
                        <span className="font-bold text-indigo-700">{key}:</span>
                        <pre className="text-[10px] text-slate-600 mt-1 max-h-24 overflow-y-auto font-mono">
                          {JSON.stringify(val, null, 2)}
                        </pre>
                      </div>
                    ))
                  )}
                </div>

                {/* Step Requirements Checklist */}
                <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-slate-500" />
                    Step Requirements Checklist
                  </span>
                  <div className="flex flex-col gap-1.5 mt-1">
                    {nodeSpec.inputs.map((input, idx) => {
                      const isSatisfied = 
                        (input.name === 'candidate' && !!selectedCandidate) ||
                        (input.name === 'resumeText' && !!selectedCandidate?.resumeText) ||
                        (input.name === 'role' && !!effectiveRole) ||
                        (!!clientUpstreamOutputs[input.name]);
                      return (
                        <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-md bg-slate-50 border border-slate-100">
                          <span className="font-semibold text-slate-700">{input.name} <span className="text-slate-400 text-[10px]">({input.type})</span></span>
                          {isSatisfied ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <CheckCircle2 className="w-3 h-3" /> Ready
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                              <AlertCircle className="w-3 h-3" /> Waiting
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-xl p-4 text-slate-100 font-mono text-xs overflow-x-auto shadow-inner max-h-[500px]">
                <pre>{JSON.stringify(consolidatedInputData, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* ─────────── TAB 2: AI SETTINGS ─────────── */}
        {activeTab === 'parameters' && (
          <div className="flex flex-col gap-5">
            {/* Model & Agent Architecture */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                AI Screening Model
              </label>
              <select
                className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                value={(layer as any).config?.model || nodeSpec.defaultModel || 'openai/gpt-oss-120b'}
                onChange={(e) => handleConfigChange('model', e.target.value)}
              >
                <option value="openai/gpt-oss-120b">Groq: openai/gpt-oss-120b (Recommended - Strict Structured Evaluation)</option>
                <option value="openai/gpt-oss-20b">Groq: openai/gpt-oss-20b (Ultra Fast Screening)</option>
                <option value="qwen/qwen3.8-27b">Groq: qwen/qwen3.8-27b (Alternative Model)</option>
              </select>
              <p className="text-[11px] text-slate-400">Strict structured evaluation with Zod schema verification enabled.</p>
            </div>

            {/* System Prompt & Instructions */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  AI Evaluation Instructions
                </label>
                <button
                  onClick={() => handleConfigChange('prompt', nodeSpec.defaultPrompt || '')}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset to default
                </button>
              </div>
              <textarea
                className="w-full px-3.5 py-3 text-xs leading-relaxed text-slate-700 bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs resize-none min-h-[140px]"
                value={(layer as any).config?.prompt ?? (nodeSpec.defaultPrompt || '')}
                onChange={(e) => handleConfigChange('prompt', e.target.value)}
                placeholder="Custom evaluation guidelines for this step..."
              />
            </div>

            {/* Node Description & Output Contract */}
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">Step Objective & Guidelines</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{nodeSpec.description}</p>
              
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">Outputs Produced by this Step:</span>
                <div className="flex flex-wrap gap-1.5">
                  {nodeSpec.outputs.map((out, i) => (
                    <span key={i} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {out.name} ({out.type})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom parameters depending on agent type */}
            {layer.agentRole === 'agent-concierge' && (
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex flex-col gap-3">
                <span className="text-xs font-bold text-indigo-900">Ophelia Travel Concierge Parameters</span>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-600">Onsite Office Hub / City</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                    placeholder="e.g. San Francisco, CA"
                    value={(layer as any).config?.location || "San Francisco, CA"}
                    onChange={(e) => handleConfigChange("location", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────── TAB 3: EVALUATION RESULTS ─────────── */}
        {activeTab === 'output' && (
          <div className="flex flex-col gap-4">
            {/* Status Bar */}
            <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  layer.status === 'success' ? 'bg-emerald-500' :
                  layer.status === 'running' ? 'bg-indigo-500 animate-pulse' :
                  layer.status === 'error' ? 'bg-rose-500' : 'bg-slate-300'
                }`} />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  {layer.status === 'success' ? 'Evaluation Complete' :
                   layer.status === 'running' ? 'Evaluating Step...' :
                   layer.status === 'error' ? 'Evaluation Failed' : 'Idle / Ready'}
                </span>
                {executionTimeSec && (
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {executionTimeSec}
                  </span>
                )}
              </div>

              {executionOutput && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setOutputViewMode('formatted')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      outputViewMode === 'formatted' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Recruiter View
                  </button>
                  <button
                    onClick={() => setOutputViewMode('raw')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      outputViewMode === 'raw' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Debug JSON
                  </button>
                  <button
                    onClick={() => handleCopy(JSON.stringify(executionOutput, null, 2), 'output-json')}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
                    title="Copy Output"
                  >
                    {copiedKey === 'output-json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Error Display */}
            {layer.status === 'error' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col gap-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  Evaluation Incomplete
                </div>
                <p className="text-xs text-rose-700 font-sans leading-relaxed bg-white/70 p-3 rounded-lg border border-rose-100">
                  {(layer as any).errorDetails || 'An error occurred during evaluation.'}
                </p>
                <button
                  onClick={handleRunAgent}
                  className="self-start mt-1 text-xs font-bold text-rose-800 hover:text-rose-950 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Retry Evaluation
                </button>
              </div>
            )}

            {/* Output Display */}
            {executionOutput ? (
              outputViewMode === 'formatted' ? (
                <div className="flex flex-col gap-3">
                  {/* RESUME VERIFIER VISUAL */}
                  {layer.agentRole === 'agent-resume' && (
                    <div className="flex flex-col gap-3">
                      {/* Match Score Card */}
                      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Candidate Match Score</p>
                          <p className="text-3xl font-black text-indigo-600">{executionOutput.overallMatch}%</p>
                        </div>
                        <div className="w-28 bg-slate-100 h-3.5 rounded-full overflow-hidden border border-slate-200">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all"
                            style={{ width: `${executionOutput.overallMatch}%` }}
                          />
                        </div>
                      </div>

                      {/* Summary */}
                      {executionOutput.candidateSummary && (
                        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-1.5">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Executive Summary</p>
                          <p className="text-xs text-slate-700 leading-relaxed">{executionOutput.candidateSummary}</p>
                        </div>
                      )}

                      {/* Verified Skills */}
                      {executionOutput.skills && (
                        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified Competencies</p>
                          <div className="flex flex-wrap gap-1.5">
                            {executionOutput.skills.map((s: any, i: number) => (
                              <span 
                                key={i}
                                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${
                                  s.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  s.status === 'PARTIAL' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                {s.name} • {s.status}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interview Focus Areas */}
                      {executionOutput.interviewFocusAreas && (
                        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recommended Interview Probes</p>
                          <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1">
                            {executionOutput.interviewFocusAreas.map((area: string, i: number) => (
                              <li key={i}>{area}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* INTERVIEW PLAN VISUAL */}
                  {layer.agentRole === 'agent-interview-plan' && (
                    <div className="flex flex-col gap-3">
                      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Plan Objective</p>
                        <p className="text-xs text-slate-700 leading-relaxed">{executionOutput.objective}</p>
                        <p className="text-xs font-bold text-indigo-600 mt-1">Total Duration: {executionOutput.durationMinutes || 60} mins</p>
                      </div>

                      {executionOutput.sections && (
                        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Agenda Breakdown</p>
                          <div className="space-y-2">
                            {executionOutput.sections.map((sec: any, i: number) => (
                              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                                <div className="flex justify-between font-bold text-slate-800">
                                  <span>{sec.title}</span>
                                  <span className="text-indigo-600 font-mono">{sec.duration}m</span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">{sec.focus}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* INTERVIEW ANALYSIS VISUAL */}
                  {layer.agentRole === 'agent-interview-analysis' && (
                    <div className="flex flex-col gap-3">
                      {/* Overall recommendation badge */}
                      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Interviewer Recommendation</p>
                          <p className="text-xl font-black text-slate-800">{executionOutput.recommendation || 'ADVANCE'}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                          executionOutput.recommendation === 'REJECT' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          executionOutput.recommendation === 'HOLD' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {executionOutput.recommendation || 'ADVANCE TO NEXT ROUND'}
                        </span>
                      </div>

                      {/* Candidate Score breakdown */}
                      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2.5">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Competency Scores</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {executionOutput.scores && Object.entries(executionOutput.scores).map(([k, v]: any) => (
                            <div key={k} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-slate-500">{k}</span>
                              <span className="text-lg font-black text-slate-800">{v}/10</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strengths */}
                      {executionOutput.strengths && (
                        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-1.5">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 text-emerald-700">
                            <ThumbsUp className="w-3.5 h-3.5" /> Key Candidate Strengths
                          </p>
                          <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1">
                            {executionOutput.strengths.map((s: string, idx: number) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Red Flags / Concerns */}
                      {executionOutput.concerns && (
                        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-1.5">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 text-amber-700">
                            <AlertCircle className="w-3.5 h-3.5" /> Identified Concerns / Probes
                          </p>
                          <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1">
                            {executionOutput.concerns.map((c: string, idx: number) => (
                              <li key={idx}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CANDIDATE DECISION VISUAL */}
                  {layer.agentRole === 'agent-decision' && (
                    <div className="flex flex-col gap-3">
                      <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hiring Committee Verdict</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                              {executionOutput.decision || executionOutput.finalDecision || 'HIRE'}
                            </h3>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Confidence</p>
                            <p className="text-xl font-black text-indigo-600">{executionOutput.confidence || '92'}%</p>
                          </div>
                        </div>

                        {executionOutput.justification && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                            {executionOutput.justification}
                          </div>
                        )}

                        {executionOutput.nextSteps && (
                          <div className="flex flex-col gap-1">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recommended Next Action</p>
                            <p className="text-xs font-semibold text-slate-800">{executionOutput.nextSteps}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CONCIERGE TRAVEL ITINERARY VISUAL */}
                  {layer.agentRole === 'agent-concierge' && (
                    <div className="flex flex-col gap-3">
                      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ophelia Onsite Travel Plan</p>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Bookings Ready
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {executionOutput.summary || 'Travel itinerary prepared for candidate onsite interview.'}
                        </p>
                      </div>

                      {executionOutput.hotels && (
                        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Selected Accommodations</p>
                          <div className="space-y-2">
                            {executionOutput.hotels.map((h: any, idx: number) => (
                              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-slate-800">{h.name}</p>
                                  <p className="text-[11px] text-slate-500">{h.location || 'Near Office'}</p>
                                </div>
                                <span className="font-bold text-indigo-700">{h.price || '$220/night'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fallback structured display */}
                  {!['agent-resume', 'agent-interview-plan', 'agent-interview-analysis', 'agent-decision', 'agent-concierge'].includes(layer.agentRole || '') && (
                    <div className="bg-slate-900 rounded-xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto shadow-inner max-h-[500px]">
                      <pre>{JSON.stringify(executionOutput, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900 rounded-xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto shadow-inner max-h-[500px]">
                  <pre>{JSON.stringify(executionOutput, null, 2)}</pre>
                </div>
              )
            ) : layer.status !== 'error' && (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
                <Sparkles className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-700">No evaluation results yet</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Click "Evaluate Candidate" to run this AI screening step and view structured recruiter results.
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200/70 bg-white flex items-center justify-between">
        <button 
          onClick={() => {
            deleteLayers([layerId]);
            setInspectedNodeId(null);
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors border border-rose-100 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Step
        </button>

        <span className="text-[10px] font-mono text-slate-400">
          Step ID: {layerId}
        </span>
      </div>
    </div>
  );
};
