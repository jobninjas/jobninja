"use client";

import { useState } from "react";
import { 
  MousePointer2, LayoutTemplate, Square, Circle, Triangle, Type, Bot, Pen, ArrowUpRight, 
  StickyNote, ChevronRight, Briefcase, MessageSquare, CheckSquare, FileText, Image as ImageIcon,
  Database, TableProperties, Building2, Building, Plug, Mail, BarChart, Search, ShieldCheck, Code, Users, Handshake, Presentation,
  PlaneTakeoff, UserCheck
} from "lucide-react";
import { CanvasMode, LayerType } from "@/types/canvas";
import { useBoardStore } from "@/store/board";

interface ToolbarProps {
  canvasState: any;
  setCanvasState: (newState: any) => void;
  onOpenTemplates?: () => void;
}

export const NODE_CATEGORIES = [
  {
    category: "Inputs",
    items: [
      { icon: Briefcase, label: "Job Details", role: "input-job-details", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
      { icon: UserCheck, label: "Candidate", role: "input-candidate", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
      { icon: FileText, label: "Resume", role: "input-resume", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
      { icon: MessageSquare, label: "Interview Transcript", role: "input-transcript", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
    ]
  },
  {
    category: "Real AI Agents",
    items: [
      { icon: Bot, label: "Resume Intelligence Agent", role: "agent-resume", color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400" },
      { icon: Bot, label: "Interview Planning Agent", role: "agent-interview-plan", color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400" },
      { icon: Bot, label: "Interview Analysis Agent", role: "agent-interview-analysis", color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400" },
      { icon: Bot, label: "Candidate Decision Agent", role: "agent-decision", color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400" },
      { icon: PlaneTakeoff, label: "Candidate Concierge Agent", role: "agent-concierge", color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400" },
    ]
  },
  {
    category: "Integrations",
    items: [
      { icon: Plug, label: "Ophelia", role: "integration-ophelia", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
      { icon: Building, label: "ATS / Workday", role: "integration-ats", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
      { icon: Database, label: "Database", role: "integration-db", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
      { icon: Plug, label: "MCP/API", role: "integration-mcp", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
    ]
  },
  {
    category: "Human Gates",
    items: [
      { icon: ShieldCheck, label: "Shortlist Approval", role: "gate-shortlist", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" },
      { icon: ShieldCheck, label: "Interview Decision", role: "gate-interview", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" },
      { icon: ShieldCheck, label: "Final Decision", role: "gate-final", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" },
      { icon: ShieldCheck, label: "Transaction Approval", role: "gate-transaction", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" },
    ]
  },
  {
    category: "Outputs",
    items: [
      { icon: FileText, label: "Candidate Profile", role: "output-profile", color: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-900/30 dark:text-slate-400" },
      { icon: FileText, label: "Interview Plan", role: "output-interview-plan", color: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-900/30 dark:text-slate-400" },
      { icon: FileText, label: "Interview Evaluation", role: "output-evaluation", color: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-900/30 dark:text-slate-400" },
      { icon: FileText, label: "Candidate Decision", role: "output-decision", color: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-900/30 dark:text-slate-400" },
      { icon: FileText, label: "Candidate Experience / Itinerary", role: "output-itinerary", color: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-900/30 dark:text-slate-400" },
    ]
  }
];

export const Toolbar = ({ canvasState, setCanvasState, onOpenTemplates }: ToolbarProps) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const insertLayer = useBoardStore(state => state.insertLayer);

  const shapes = [
    { icon: Square, label: "Rectangle", type: LayerType.Rectangle },
    { icon: Circle, label: "Ellipse", type: LayerType.Ellipse },
  ];

  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-4 z-40 flex gap-2">
      <div className="bg-card shadow-lg border border-border rounded-xl flex flex-col p-1.5 gap-1.5">
        <ToolButton
          icon={MousePointer2}
          isActive={
            canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.Translating ||
            canvasState.mode === CanvasMode.SelectionNet ||
            canvasState.mode === CanvasMode.Pressing ||
            canvasState.mode === CanvasMode.Resizing
          }
          onClick={() => { setCanvasState({ mode: CanvasMode.None }); setActiveMenu(null); }}
          tooltip="Select (V)"
        />
        
        <div className="w-full h-px bg-muted/50 my-0.5" />
        
        <ToolButton
          icon={Presentation}
          isActive={canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Slide}
          onClick={() => { setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Slide }); setActiveMenu(null); }}
          tooltip="Slide / Frame (F)"
        />

        <ToolButton
          icon={LayoutTemplate}
          isActive={false}
          onClick={() => { onOpenTemplates?.(); setActiveMenu(null); }}
          tooltip="Templates"
        />

        <ToolButton
          icon={Type}
          isActive={canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Text}
          onClick={() => { setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Text }); setActiveMenu(null); }}
          tooltip="Text (T)"
        />

        <ToolButton
          icon={StickyNote}
          isActive={canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Note}
          onClick={() => { setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Note }); setActiveMenu(null); }}
          tooltip="Sticky Note (N)"
        />

        {/* Shapes Menu */}
        <div className="relative group">
          <ToolButton
            icon={Square}
            isActive={canvasState.mode === CanvasMode.Inserting && (canvasState.layerType === LayerType.Rectangle || canvasState.layerType === LayerType.Ellipse)}
            onClick={() => setActiveMenu(activeMenu === 'shapes' ? null : 'shapes')}
            tooltip="Shapes (R)"
          />
          {activeMenu === 'shapes' && (
            <div className="absolute left-full top-0 ml-2 bg-card shadow-xl border border-border rounded-xl p-2 flex flex-col gap-1 w-48 animate-in fade-in slide-in-from-left-2">
              <div className="text-xs font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider mb-1">Shapes</div>
              {shapes.map((shape) => (
                <button
                  key={shape.label}
                  onClick={() => {
                    setCanvasState({ mode: CanvasMode.Inserting, layerType: shape.type });
                    setActiveMenu(null);
                  }}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors text-foreground hover:text-blue-700 text-sm"
                >
                  <shape.icon className="w-4 h-4" />
                  {shape.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <ToolButton
          icon={ArrowUpRight}
          isActive={canvasState.mode === CanvasMode.Connecting}
          onClick={() => { setCanvasState({ mode: CanvasMode.Connecting }); setActiveMenu(null); }}
          tooltip="Connection line (L)"
        />

        <ToolButton
          icon={Pen}
          isActive={canvasState.mode === CanvasMode.Pencil}
          onClick={() => { setCanvasState({ mode: CanvasMode.Pencil }); setActiveMenu(null); }}
          tooltip="Pen (P)"
        />

        <label className="p-2.5 rounded-lg transition-all relative group flex items-center justify-center hover:bg-muted/50 text-foreground cursor-pointer" title="Upload Image">
          <ImageIcon className="w-5 h-5" />
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const base64 = event.target?.result as string;
                  setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Image, src: base64 } as any);
                };
                reader.readAsDataURL(file);
              }
              e.target.value = '';
            }} 
          />
        </label>

        <label className="p-2.5 rounded-lg transition-all relative group flex items-center justify-center hover:bg-muted/50 text-foreground cursor-pointer" title="Upload Document / Presentation">
          <FileText className="w-5 h-5" />
          <input 
            type="file" 
            accept=".pdf,.ppt,.pptx,.doc,.docx" 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const base64 = event.target?.result as string;
                  // For documents, insert as a Slide layer so they can be viewed in presentation mode
                  setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Slide, fileSrc: base64, fileName: file.name } as any);
                };
                reader.readAsDataURL(file);
              }
              e.target.value = '';
            }} 
          />
        </label>

        <ToolButton
          icon={Presentation}
          isActive={canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Slide}
          onClick={() => { setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Slide }); setActiveMenu(null); }}
          tooltip="Presentation/Document Slide"
        />

        {/* Agents Menu */}
        <div className="relative group mt-2">
          <div className="w-full h-px bg-muted/50 my-0.5 absolute -top-3 left-0" />
          <button
            onClick={() => setActiveMenu(activeMenu === 'agents' ? null : 'agents')}
            className={`
              p-2 rounded-xl transition-all relative flex items-center justify-center
              ${activeMenu === 'agents' || (canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Agent) 
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md' 
                : 'hover:bg-muted/50 text-indigo-600'}
            `}
            title="AI Agents"
          >
            <Bot className="w-5 h-5" />
            <SparklesIcon />
          </button>
          
          {activeMenu === 'agents' && (
            <div className="absolute left-full bottom-0 ml-2 bg-card shadow-xl border border-border rounded-xl p-2 flex flex-col gap-1 w-64 max-h-[80vh] overflow-y-auto scrollbar-thin animate-in fade-in slide-in-from-left-2">
              <div className="text-xs font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider mb-1 sticky top-0 bg-card z-10">Workflow Nodes</div>
              {NODE_CATEGORIES.map((group) => (
                <div key={group.category} className="mb-2">
                  <div className="text-[10px] font-bold text-muted-foreground/70 px-2 py-1 uppercase tracking-wider">
                    {group.category}
                  </div>
                  {group.items.map((agent) => (
                    <button
                      key={agent.role}
                      onClick={() => {
                        setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Agent, agentRole: agent.role });
                        setActiveMenu(null);
                      }}
                      className="flex items-center gap-3 px-2 py-2 hover:bg-muted rounded-lg transition-colors text-foreground text-sm group/btn w-full"
                    >
                      <div className={`p-1.5 rounded-md ${agent.bg} ${agent.color}`}>
                        <agent.icon className="w-4 h-4 shrink-0" />
                      </div>
                      <span className="font-medium text-left leading-tight">{agent.label}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ToolButton = ({ icon: Icon, isActive, onClick, tooltip }: any) => {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`
        p-2.5 rounded-lg transition-all relative group flex items-center justify-center
        ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-muted/50 text-foreground'}
      `}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};

const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 absolute -top-1 -right-1 text-amber-400 fill-amber-400 animate-pulse">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

export const AGENTS = NODE_CATEGORIES.flatMap(c => c.items);
