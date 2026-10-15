"use client";

import { useBoardStore } from "@/store/board";
import { LayerType } from "@/types/canvas";
import { Settings2, X, GripVertical, Trash2, Play, Loader2, Upload, Bot } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useDemoStore } from "@/lib/store";

export const InspectorPanel = ({ boardId }: { boardId?: string }) => {
  const { inspectedNodeId, setInspectedNodeId, layers, updateLayer, deleteLayers, insertLayer, insertEdge } = useBoardStore();
  const roles = useDemoStore(state => state.roles);
  const currentRole = roles.find(r => r.id === boardId);
  const selectedIds = inspectedNodeId ? [inspectedNodeId] : [];
  
  const [width, setWidth] = useState(500);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newWidth = window.innerWidth - e.clientX - 16; // 16px right margin
    if (newWidth > 300 && newWidth < 1000) {
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

  if (selectedIds.length !== 1) return null;
  
  const layerId = selectedIds[0];
  const layer = layers[layerId];
  
  if (!layer) return null;

  const handleConfigChange = (key: string, value: string) => {
    const currentConfig = (layer as any).config || {};
    updateLayer(layerId, {
      config: {
        ...currentConfig,
        [key]: value
      }
    });
  };

  const handleTextChange = (value: string) => {
    updateLayer(layerId, { value });
  };

  const handleRunAgent = async () => {
    updateLayer(layerId, { status: 'running' });
    try {
      const activeCand = typeof window !== 'undefined' ? window.localStorage.getItem('activeCandidateId') : null;
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: layer.agentRole,
          nodeId: layerId,
          roleId: boardId,
          candidateId: activeCand,
          upstreamNodeIds: []
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        updateLayer(layerId, { status: 'error', errorDetails: data.error });
      } else {
        updateLayer(layerId, { status: 'success', executionOutput: data.output });
      }
    } catch (err: any) {
      updateLayer(layerId, { status: 'error', errorDetails: err.message });
    }
  };

  const isEntryNode = layer.type === LayerType.Agent && layer.agentRole === 'entry-node';
  const isAgent = layer.type === LayerType.Agent && layer.agentRole !== 'entry-node';
  const isNote = layer.type === LayerType.Note;
  const isText = layer.type === LayerType.Text;

  return (
    <div 
      className="absolute right-4 top-20 bottom-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-slate-200/60 overflow-hidden z-40 flex flex-col font-sans"
      style={{ width: `${width}px` }}
    >
      <div 
        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/20 group flex items-center justify-center transition-colors"
        onMouseDown={handleMouseDown}
      >
        <div className="w-1 h-8 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors" />
      </div>

      <div className="p-4 border-b border-border flex items-center justify-between bg-transparent border-b border-slate-100 pl-6">
        <div className="flex items-center gap-3">
          <Settings2 className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-sm text-slate-800">{isEntryNode ? "Job Details" : "Agent Configuration"}</h3>
        </div>
        <button 
          onClick={() => setInspectedNodeId(null)}
          className="text-slate-500 hover:text-slate-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-5">
        {isEntryNode && (
          <div className="flex flex-col flex-1 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Job Title</label>
              <input
                type="text"
                className="w-full px-4 py-3 text-[15px] font-semibold text-slate-900 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all shadow-sm"
                placeholder="e.g. Senior Frontend Engineer"
                value={(layer as any).config?.jobTitle || currentRole?.title || ""}
                onChange={(e) => handleConfigChange("jobTitle", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 flex-1 mb-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Job Description</label>
              <textarea
                className="w-full flex-1 px-4 py-4 text-[14px] leading-relaxed text-slate-700 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all shadow-sm resize-none text-slate-800 placeholder:text-slate-400"
                placeholder="Paste the job requirements and description here..."
                value={(layer as any).config?.jobDescription || currentRole?.jobDescription || ""}
                onChange={(e) => handleConfigChange("jobDescription", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Candidate Resumes</label>
              <label className="flex items-center justify-center gap-2 w-full px-4 py-3 text-[14px] font-semibold text-indigo-600 bg-white border border-indigo-200 border-dashed rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all">
                <Upload className="w-4 h-4" />
                Upload Resumes / PDFs
                <input type="file" multiple accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => {
                   const files = Array.from(e.target.files || []);
                   if (files.length > 0) {
                     // For demo purposes, we just store the file names
                     const fileNames = files.map(f => f.name).join(', ');
                     const existing = (layer as any).config?.resumes || '';
                     handleConfigChange("resumes", existing ? `${existing}, ${fileNames}` : fileNames);
                   }
                }} />
              </label>
              {((layer as any).config?.resumes) && (
                 <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-1">
                   {((layer as any).config?.resumes).split(',').map((name: string, i: number) => (
                      <span key={i} className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{name.trim()}</span>
                   ))}
                 </div>
              )}
            </div>
          </div>
        )}

        {isAgent && (
          <div className="flex flex-col flex-1 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Agent Title</label>
              <input
                type="text"
                className="w-full px-4 py-3 text-[15px] font-semibold text-slate-900 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all shadow-sm"
                value={layer.value || ""}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="e.g. Custom AI Agent"
              />
            </div>

            {/* Custom inputs based on agent role */}
            {layer.agentRole === 'candidate-node' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200 shrink-0">
                    <span className="text-xl font-bold text-indigo-700">{layer.value ? layer.value.charAt(0) : "C"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-slate-900 text-[15px]">{layer.value || "Unknown Candidate"}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span> Final Interview
                    </p>
                    <p className="text-[12px] text-slate-600 mt-1">sarah.chen@example.com • +1 (555) 019-2831</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resume Document</label>
                  <div className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-200 hover:border-indigo-400 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/10 group-hover:to-indigo-900/20 z-10 transition-colors" />
                    <div className="flex items-center justify-center p-8 bg-slate-50 relative overflow-hidden">
                      {/* Fake Resume Thumbnail */}
                      <div className="w-32 h-44 bg-white shadow-md border border-slate-200 p-3 flex flex-col gap-2 scale-90 group-hover:scale-95 transition-transform duration-300">
                        <div className="h-2 w-1/2 bg-slate-300 rounded-sm"></div>
                        <div className="h-1.5 w-1/3 bg-slate-200 rounded-sm"></div>
                        <div className="h-4"></div>
                        <div className="h-1 w-full bg-slate-200 rounded-sm"></div>
                        <div className="h-1 w-full bg-slate-200 rounded-sm"></div>
                        <div className="h-1 w-4/5 bg-slate-200 rounded-sm"></div>
                        <div className="h-4"></div>
                        <div className="h-1 w-full bg-slate-200 rounded-sm"></div>
                        <div className="h-1 w-full bg-slate-200 rounded-sm"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20 transition-opacity">
                        <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium text-xs shadow-lg flex items-center gap-1.5">
                          View PDF
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Candidate Notes</label>
                  <textarea
                    className="w-full px-4 py-3 text-[13px] text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-none resize-none min-h-[100px]"
                    placeholder="Recruiter notes..."
                    defaultValue={"- Exceptional systems knowledge\n- 5 years at Palantir as FDE\n- Great communicator"}
                  />
                </div>
              </div>
            )}

            {layer.agentRole === 'ophelia-agent' && (
              <div className="flex flex-col gap-6">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                      <Bot className="w-4 h-4" /> Ophelia Integration
                    </h4>
                    <span className="px-2 py-1 bg-indigo-200 text-indigo-700 text-[10px] font-bold uppercase rounded-md">Connected</span>
                  </div>
                  <p className="text-[13px] text-indigo-800/80 leading-relaxed">
                    This agent uses Ophelia to fully automate post-interview candidate processing.
                  </p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trigger Condition</label>
                  <select className="w-full px-4 py-3 text-[14px] font-medium text-slate-900 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 border border-slate-200/60 rounded-xl focus:outline-none transition-all shadow-sm">
                    <option>When Candidate moved to "Offer"</option>
                    <option>When Candidate is "Selected"</option>
                    <option>Custom Webhook</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ophelia Workflows Executed</label>
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[13px] font-medium text-slate-700">Generate Employment Contract</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[13px] font-medium text-slate-700">Initiate Checkr Background Screen</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[13px] font-medium text-slate-700">Send IT Equipment Form</span>
                    </div>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[14px] font-semibold transition-colors shadow-sm">
                  <Play className="w-4 h-4 fill-current" />
                  Run Test Execution
                </button>
              </div>
            )}

            {layer.agentRole === 'database-connector' && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Database Connection</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 text-[14px] text-slate-900 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all shadow-sm"
                  placeholder="postgresql://user:password@localhost:5432/db"
                  value={(layer as any).config?.dbUrl || ""}
                  onChange={(e) => handleConfigChange("dbUrl", e.target.value)}
                />
              </div>
            )}

            {(layer.agentRole === 'mcp-api-connector' || layer.agentRole === 'workday-venus-connector') && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">MCP / API Endpoint</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 text-[14px] text-slate-900 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all shadow-sm"
                    placeholder="https://api.workday.com/v1"
                    value={(layer as any).config?.endpoint || ""}
                    onChange={(e) => handleConfigChange("endpoint", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">API Key</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 text-[14px] text-slate-900 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all shadow-sm"
                    placeholder="sk_..."
                    value={(layer as any).config?.apiKey || ""}
                    onChange={(e) => handleConfigChange("apiKey", e.target.value)}
                  />
                </div>
              </div>
            )}

            {(layer.agentRole === 'resume-verifier' || layer.agentRole === 'interview-topic-generator' || layer.agentRole === 'tech-assessor' || layer.agentRole === 'candidate-ranker') && (
              <div className="flex flex-col gap-3 p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60 shadow-sm mt-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Data Bindings</label>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-slate-700">Candidate Data</p>
                    <p className="text-[11px] text-slate-500">Ingested from Previous Nodes</p>
                  </div>
                </div>

                <div className="w-px h-3 bg-slate-200 ml-3"></div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-slate-700">Job Description (JD)</p>
                    <p className="text-[11px] text-slate-500">Global Role Context</p>
                  </div>
                </div>
              </div>
            )}

            {layer.agentRole === 'onboarding-agent' && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Integration (MCP)</label>
                <select
                  className="w-full px-4 py-3 text-[14px] text-slate-900 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all shadow-sm appearance-none"
                  value={(layer as any).config?.emailMcp || "gmail"}
                  onChange={(e) => handleConfigChange("emailMcp", e.target.value)}
                >
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook / Office 365</option>
                  <option value="custom">Custom SMTP</option>
                </select>
              </div>
            )}
            
            {layer.agentRole !== 'word-doc' && layer.agentRole !== 'excel-doc' && (
              <div className="flex flex-col gap-2 flex-1 mb-4 pt-6 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Custom Instructions</label>
                <textarea
                  className="w-full flex-1 px-4 py-4 text-[14px] leading-relaxed text-slate-700 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all shadow-sm resize-none text-slate-800 placeholder:text-slate-400"
                  placeholder="Specific instructions for this agent's task..."
                  value={(layer as any).config?.instructions || ""}
                  onChange={(e) => handleConfigChange("instructions", e.target.value)}
                />
              </div>
            )}
            {(layer.agentRole === 'word-doc' || layer.agentRole === 'excel-doc') && (
              <div className="flex flex-col gap-2 pt-6 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Document Content Link</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 text-[14px] text-slate-900 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all shadow-sm"
                  placeholder="Paste URL or document path..."
                  value={(layer as any).config?.docUrl || ""}
                  onChange={(e) => handleConfigChange("docUrl", e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {(isNote || isText || layer.type === LayerType.Rectangle || layer.type === LayerType.Ellipse) && (
          <>
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Font Family</label>
              <select
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                value={(layer as any).fontFamily || "inherit"}
                onChange={(e) => updateLayer(layerId, { fontFamily: e.target.value } as any)}
              >
                <option value="inherit">Default (Sans)</option>
                <option value="ui-serif, Georgia, serif">Serif</option>
                <option value="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace">Monospace</option>
                <option value="'Comic Sans MS', 'Comic Sans', cursive">Comic Sans (Playful)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Font Size (px)</label>
              <input
                type="number"
                min="8"
                max="120"
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                value={(layer as any).fontSize || (isNote ? 16 : isText ? 24 : 16)}
                onChange={(e) => updateLayer(layerId, { fontSize: parseInt(e.target.value) || 16 } as any)}
              />
            </div>
          </>
        )}

        <div className="mt-auto pt-6 pb-2 border-t border-border/50 flex flex-col gap-3">
          {layer.type === LayerType.Agent && layer.agentRole !== 'entry-node' && layer.agentRole !== 'word-doc' && layer.agentRole !== 'excel-doc' && (
            <button 
              onClick={handleRunAgent}
              disabled={layer.status === 'running'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              {layer.status === 'running' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running Agent...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Run Agent Workflow
                </>
              )}
            </button>
          )}
          
          <button 
            onClick={() => {
              deleteLayers([layerId]);
              setInspectedNodeId(null);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition-colors border border-red-100"
          >
            <Trash2 className="w-4 h-4" />
            Delete {isAgent ? (layer.agentRole === 'word-doc' || layer.agentRole === 'excel-doc' ? 'Document' : 'Agent') : 'Node'}
          </button>
        </div>
      </div>
    </div>
  );
};


