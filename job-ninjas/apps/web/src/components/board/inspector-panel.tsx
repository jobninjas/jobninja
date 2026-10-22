"use client";

import { useBoardStore } from "@/store/board";
import { LayerType } from "@/types/canvas";
import { 
  Settings2, X, Trash2, Play, Loader2, Copy, Check, 
  ChevronDown, ChevronRight, RefreshCw, Cpu, Database, 
  User, FileText, CheckCircle2, AlertCircle, Info, 
  Sliders, Layers, Sparkles, ArrowDownRight, ArrowUpRight,
  Code2, ExternalLink
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useDemoStore } from "@/lib/store";
import { getNodeSpec, NodeDescription } from "@/lib/agents/node-specs";

export const InspectorPanel = ({ boardId }: { boardId?: string }) => {
  const { inspectedNodeId, setInspectedNodeId, layers, updateLayer, deleteLayers, edges } = useBoardStore();
  const roles = useDemoStore(state => state.roles);
  const currentRole = roles.find(r => r.id === boardId);
  const selectedIds = inspectedNodeId ? [inspectedNodeId] : [];
  
  const [width, setWidth] = useState(540);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'parameters' | 'output'>('parameters');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [inputViewMode, setInputViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [outputViewMode, setOutputViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [availableCandidates, setAvailableCandidates] = useState<any[]>([]);

  // Drag-to-resize inspector drawer
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newWidth = window.innerWidth - e.clientX - 16;
    if (newWidth > 360 && newWidth < 1100) {
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

  // Fetch candidates for current role to ensure accurate context
  useEffect(() => {
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

  // UNCONDITIONAL RESOLUTION FOR RULES OF HOOKS
  const layerId = selectedIds.length === 1 ? selectedIds[0] : null;
  const layer = layerId ? layers[layerId] : null;
  const nodeSpec: NodeDescription = getNodeSpec(layer?.agentRole);

  // Incoming edges and upstream nodes (always called unconditionally)
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

  // Compile real input view data (always called unconditionally)
  const consolidatedInputData = useMemo(() => {
    if (!layer) return {};
    if ((layer as any).inputData) return (layer as any).inputData;
    return {
      role: currentRole ? {
        id: currentRole.id,
        title: currentRole.title,
        location: currentRole.location,
        description: currentRole.jobDescription
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
  }, [layer, currentRole, selectedCandidate, clientUpstreamOutputs]);

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
          errorDetails: data.error || data.missingInputs?.join(', ') || 'Agent execution failed',
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

  // NOW safe to return null if no node is inspected (all hooks have been executed in identical order)
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

      {/* Header (n8n node modal top bar) */}
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
              title="Test Step / Execute with Current Inputs"
            >
              {layer.status === 'running' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Test step
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

      {/* n8n 3-Tab Navigator */}
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
          Input
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
            {incomingEdges.length > 0 || selectedCandidate ? '1 item' : '0'}
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
          Parameters
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
          Output
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

        {/* ─────────── TAB 1: INPUT ─────────── */}
        {activeTab === 'input' && (
          <div className="flex flex-col gap-4">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Incoming Data</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {incomingEdges.length} connected upstream
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setInputViewMode('formatted')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    inputViewMode === 'formatted' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Formatted
                </button>
                <button
                  onClick={() => setInputViewMode('raw')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    inputViewMode === 'raw' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Raw JSON
                </button>
                <button
                  onClick={() => handleCopy(JSON.stringify(consolidatedInputData, null, 2), 'input-json')}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
                  title="Copy JSON"
                >
                  {copiedKey === 'input-json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Candidate Selector / Context */}
            {availableCandidates.length > 0 && (
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 flex flex-col gap-2 shadow-xs">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  Target Candidate Record
                </label>
                <select
                  value={selectedCandidate?.id || ''}
                  onChange={(e) => {
                    const found = availableCandidates.find(c => c.id === e.target.value);
                    if (found) {
                      setSelectedCandidate(found);
                      if (typeof window !== 'undefined') {
                        window.localStorage.setItem('activeCandidateId', found.id);
                      }
                    }
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableCandidates.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.email}) - {c.stage || c.currentStage || 'APPLIED'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {inputViewMode === 'formatted' ? (
              <div className="flex flex-col gap-3">
                {/* Role Block */}
                <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      Role Context
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{currentRole?.department || 'Engineering'}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{currentRole?.title || 'Open Role'}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-3">
                    {currentRole?.jobDescription || 'No job description provided.'}
                  </p>
                </div>

                {/* Candidate Block */}
                <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-violet-600" />
                      Candidate Credentials
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedCandidate?.resumeText ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {selectedCandidate?.resumeText ? 'Resume Attached' : 'No Resume'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700">
                    <span className="font-bold">{selectedCandidate?.firstName} {selectedCandidate?.lastName}</span>
                    <span className="text-slate-400"> • {selectedCandidate?.email}</span>
                  </div>
                  {selectedCandidate?.resumeText && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-600 font-mono line-clamp-4 leading-relaxed">
                      {selectedCandidate.resumeText}
                    </div>
                  )}
                </div>

                {/* Upstream Artifacts */}
                <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Upstream Node Outputs ({Object.keys(clientUpstreamOutputs).length})
                  </span>
                  {Object.keys(clientUpstreamOutputs).length === 0 ? (
                    <div className="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-200 rounded-lg">
                      No upstream agent outputs yet. Connect upstream nodes or run them first.
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

                {/* Port Contract Checklist */}
                <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-slate-500" />
                    Expected Input Ports
                  </span>
                  <div className="flex flex-col gap-1.5 mt-1">
                    {nodeSpec.inputs.map((input, idx) => {
                      const isSatisfied = 
                        (input.name === 'candidate' && !!selectedCandidate) ||
                        (input.name === 'resumeText' && !!selectedCandidate?.resumeText) ||
                        (input.name === 'role' && !!currentRole) ||
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

        {/* ─────────── TAB 2: PARAMETERS ─────────── */}
        {activeTab === 'parameters' && (
          <div className="flex flex-col gap-5">
            {/* Model & Agent Architecture */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                LLM Execution Engine
              </label>
              <select
                className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                value={(layer as any).config?.model || nodeSpec.defaultModel || 'openai/gpt-oss-120b'}
                onChange={(e) => handleConfigChange('model', e.target.value)}
              >
                <option value="openai/gpt-oss-120b">Groq: openai/gpt-oss-120b (Recommended - Strict Schema & Fast)</option>
                <option value="openai/gpt-oss-20b">Groq: openai/gpt-oss-20b (Ultra Fast)</option>
                <option value="qwen/qwen3.8-27b">Groq: qwen/qwen3.8-27b (Alternative)</option>
              </select>
              <p className="text-[11px] text-slate-400">Strict JSON structured output mode enabled.</p>
            </div>

            {/* System Prompt & Instructions */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Agent System Instructions
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
                placeholder="Custom agent prompt instructions..."
              />
            </div>

            {/* Node Description & Output Contract */}
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">Node Capabilities</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{nodeSpec.description}</p>
              
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">Produces Output Schema:</span>
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
                <span className="text-xs font-bold text-indigo-900">Ophelia Concierge Configuration</span>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-600">Travel City / Hub</label>
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

        {/* ─────────── TAB 3: OUTPUT ─────────── */}
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
                  {layer.status === 'success' ? 'Success' :
                   layer.status === 'running' ? 'Executing Node...' :
                   layer.status === 'error' ? 'Execution Error' : 'Idle / Not Run'}
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
                    Visual
                  </button>
                  <button
                    onClick={() => setOutputViewMode('raw')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      outputViewMode === 'raw' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Raw JSON
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
                  Execution Failed
                </div>
                <p className="text-xs text-rose-700 font-mono leading-relaxed bg-white/70 p-3 rounded-lg border border-rose-100">
                  {(layer as any).errorDetails || 'Unknown error occurred during agent execution.'}
                </p>
                <button
                  onClick={handleRunAgent}
                  className="self-start mt-1 text-xs font-bold text-rose-800 hover:text-rose-950 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Retry execution
                </button>
              </div>
            )}

            {/* Output Display */}
            {executionOutput ? (
              outputViewMode === 'formatted' ? (
                <div className="flex flex-col gap-3">
                  {/* Domain-specific visual summary */}
                  {layer.agentRole === 'agent-resume' && (
                    <div className="flex flex-col gap-3">
                      {/* Match Score Card */}
                      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Candidate Match Score</p>
                          <p className="text-3xl font-black text-indigo-600">{executionOutput.overallMatch}%</p>
                        </div>
                        <div className="w-24 bg-slate-100 h-3 rounded-full overflow-hidden">
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

                  {/* Interview Plan Visual */}
                  {layer.agentRole === 'agent-interview-plan' && (
                    <div className="flex flex-col gap-3">
                      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Plan Objective</p>
                        <p className="text-xs text-slate-700 leading-relaxed">{executionOutput.objective}</p>
                        <p className="text-xs font-bold text-indigo-600 mt-1">Duration: {executionOutput.durationMinutes || 60} mins</p>
                      </div>

                      {executionOutput.sections && (
                        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Agenda Breakdown</p>
                          <div className="space-y-2">
                            {executionOutput.sections.map((sec: any, i: number) => (
                              <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                                <div className="flex justify-between font-bold text-slate-800">
                                  <span>{sec.title}</span>
                                  <span className="text-indigo-600">{sec.duration}m</span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">{sec.focus}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fallback structured display */}
                  {layer.agentRole !== 'agent-resume' && layer.agentRole !== 'agent-interview-plan' && (
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
                <p className="text-xs font-bold text-slate-700">No output yet</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Click "Test step" to execute this node and view structured outputs and performance metrics.
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
          Delete Node
        </button>

        <span className="text-[10px] font-mono text-slate-400">
          ID: {layerId}
        </span>
      </div>
    </div>
  );
};
