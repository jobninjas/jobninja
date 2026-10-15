"use client";

import { useCallback, useState, useEffect, useRef } from 'react';
import { useBoardStore } from '@/store/board';
import { useDemoStore } from '@/lib/store';
import { Camera, CanvasMode, CanvasState, LayerType, Point, Color } from '@/types/canvas';
import { Toolbar, AGENTS } from './toolbar';
import { ZoomControls } from './zoom-controls';
import { LibraryModal } from './library-modal';
import { getStroke } from 'perfect-freehand';
import Link from 'next/link';
import { Play, Loader2, Plus, X, Bot, LayoutTemplate, Trash2, Upload, Plug, Mail, Calendar, MessageSquare, Database, Workflow, CheckCircle, FileText, ChevronRight, ArrowLeft, Presentation, Maximize, ChevronLeft } from 'lucide-react';
import { SelectionBox } from './selection-box';
import { resizeBounds } from '@/lib/geometry';
import { Side, XYWH } from '@/types/canvas';
import { InspectorPanel } from './inspector-panel';
import { FloatingToolbar } from './floating-toolbar';
import { EdgeToolbar } from './edge-toolbar';
import { PresentationViewer } from './presentation-viewer';
import { CandidateConciergeNode } from './candidate-concierge-node';
import { CandidateNodeBlock } from './candidate-node-block';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// MCP Connector definitions
const MCP_CONNECTORS = [
  { icon: Mail, label: 'Gmail', desc: 'Send emails to candidates automatically', color: 'text-red-500', bg: 'bg-red-50', agentRole: 'gmail-connector' },
  { icon: Calendar, label: 'Google Calendar', desc: 'Schedule interviews automatically', color: 'text-blue-500', bg: 'bg-blue-50', agentRole: 'gcalendar-connector' },
  { icon: MessageSquare, label: 'Slack', desc: 'Notify hiring managers in real-time', color: 'text-purple-500', bg: 'bg-purple-50', agentRole: 'slack-connector' },
  { icon: Database, label: 'Greenhouse ATS', desc: 'Sync candidates to your ATS', color: 'text-green-600', bg: 'bg-green-50', agentRole: 'greenhouse-connector' },
  { icon: Workflow, label: 'Workday', desc: 'Push hired candidates to Workday', color: 'text-indigo-600', bg: 'bg-indigo-50', agentRole: 'workday-connector' },
  { icon: FileText, label: 'DocuSign', desc: 'Send offer letters for e-signature', color: 'text-yellow-600', bg: 'bg-yellow-50', agentRole: 'docusign-connector' },
];

// Helper to convert freehand stroke points to SVG path data
const getSvgPathFromStroke = (stroke: number[][]) => {
  if (!stroke.length) return "";
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );
  d.push("Z");
  return d.join(" ");
};

const getPointerPos = (e: React.PointerEvent | React.WheelEvent | React.MouseEvent, camera: Camera): Point => {
  return {
    x: (e.clientX - camera.x) / camera.zoom,
    y: (e.clientY - camera.y) / camera.zoom,
  };
};
function getBoxIntersection(
  startX: number, startY: number,
  boxX: number, boxY: number, boxW: number, boxH: number, padding = 12
) {
  const endX = boxX + boxW / 2;
  const endY = boxY + boxH / 2;
  const dx = endX - startX;
  const dy = endY - startY;

  const halfW = boxW / 2 + padding;
  const halfH = boxH / 2 + padding;

  if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) return { x: endX, y: endY };

  const scaleX = Math.abs(dx) > 0.0001 ? halfW / Math.abs(dx) : Infinity;
  const scaleY = Math.abs(dy) > 0.0001 ? halfH / Math.abs(dy) : Infinity;
  const scale = Math.min(scaleX, scaleY, 1);
  
  return {
    x: endX - dx * scale,
    y: endY - dy * scale
  };
}

export const Canvas = ({ boardId }: { boardId: string }) => {
  const layerIds = useBoardStore(state => state.layerIds);
  const layers = useBoardStore(state => state.layers);
  const insertLayer = useBoardStore(state => state.insertLayer);
  const translateSelectedLayers = useBoardStore(state => state.translateSelectedLayers);
  const updateLayer = useBoardStore(state => state.updateLayer);
  const selections = useBoardStore(state => state.selections);
  const setSelection = useBoardStore(state => state.setSelection);
  const edges = useBoardStore(state => state.edges);
  const edgeIds = useBoardStore(state => state.edgeIds);
  const insertEdge = useBoardStore(state => state.insertEdge);
  const deleteLayers = useBoardStore(state => state.deleteLayers);
  const deleteEdge = useBoardStore(state => state.deleteEdge);
  const setInspectedNodeId = useBoardStore(state => state.setInspectedNodeId);
  const insertTemplate = useBoardStore(state => state.insertTemplate);
  
  const roles = useDemoStore(state => state.roles);
  const [roleData, setRoleData] = useState<any>(null);

  useEffect(() => {
    if (!boardId || boardId === 'new-workflow') return;
    fetch('/api/roles')
      .then(res => res.json())
      .then(data => {
        const rolesList = Array.isArray(data) ? data : data?.roles || [];
        const match = rolesList.find((r: any) => r.id === boardId);
        if (match) setRoleData(match);
      })
      .catch(console.error);
  }, [boardId]);

  const currentRole = roleData || roles.find(r => r.id === boardId);

  const getInitialConfig = (roleType?: string) => {
    if (!roleType) return undefined;
    if (['entry-node', 'resume-verifier', 'resume-analyzer'].includes(roleType)) {
      return {
        jobTitle: currentRole?.title || "",
        jobDescription: currentRole?.jobDescription || "",
      };
    }
    return undefined;
  };

  const [canvasState, setCanvasState] = useState<CanvasState>({ mode: CanvasMode.None });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [quickAddMenuFor, setQuickAddMenuFor] = useState<string | null>(null);
  const [presentationMode, setPresentationMode] = useState<{ active: boolean, layerId?: string }>({ active: false });

  useEffect(() => {
    (window as any).__setPresentationMode = setPresentationMode;
    return () => {
      delete (window as any).__setPresentationMode;
    };
  }, []);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMcpPanelOpen, setIsMcpPanelOpen] = useState(false);
  const [showNewBoardDialog, setShowNewBoardDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRunSingleAgent = async (layerId: string) => {
    const layer = layers[layerId];
    if (!layer || layer.type !== LayerType.Agent) return;
    
    // Inputs, human gates, and outputs don't "run" the same way in MVP
    if (!layer.agentRole?.startsWith('agent-')) {
       updateLayer(layerId, { status: 'success' });
       return;
    }

    updateLayer(layerId, { status: 'running', errorDetails: null });
    
    // Find incoming edges
    const incomingEdges = Object.values(edges).filter(e => e.toNodeId === layerId);
    const upstreamNodeIds = incomingEdges.map(e => e.fromNodeId);

    let activeCandId = window.localStorage.getItem('activeCandidateId') || '';
    if (!activeCandId) {
      for (const upId of upstreamNodeIds) {
        const upLayer = layers[upId];
        if (upLayer?.config?.candidateId) {
          activeCandId = upLayer.config.candidateId;
          break;
        }
      }
    }

    try {
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: layerId,
          agentType: layer.agentRole,
          roleId: currentRole?.id || boardId, 
          candidateId: activeCandId,
          upstreamNodeIds
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        updateLayer(layerId, { 
          status: 'success', 
          output: data.output,
          // Store output visually in a note or just show green
        });
        
        // MVP Visual Output: create a sticky note below it to display the result
        const outEdges = Object.values(edges).filter(e => e.fromNodeId === layerId);
        const connectedNotes = outEdges.map(e => layers[e.toNodeId]).filter(l => l?.type === LayerType.Note);
        const noteX = layer.x + (layer.width || 250) + 100;
        const noteY = layer.y + (connectedNotes.length * 170);
        
        const noteId = insertLayer(LayerType.Note, { x: noteX, y: noteY }, { r: 217, g: 249, b: 157 });
        updateLayer(noteId, { 
          value: `[REAL AGENT EXECUTION]\n\nType: ${layer.agentRole}\nStatus: SUCCESS\n\nOutput:\n${JSON.stringify(data.output, null, 2).substring(0, 300)}...`,
          width: 320,
          height: 250
        });
        insertEdge(layerId, noteId);
        
      } else {
        updateLayer(layerId, { status: 'error', errorDetails: data.error || data.missingInputs?.join(', ') });
        
        const noteX = layer.x + (layer.width || 250) + 100;
        const noteY = layer.y;
        const noteId = insertLayer(LayerType.Note, { x: noteX, y: noteY }, { r: 254, g: 202, b: 202 });
        updateLayer(noteId, { 
          value: `[EXECUTION FAILED]\n\nError: ${data.error}\nMissing: ${data.missingInputs?.join(', ')}`,
          width: 300,
          height: 160
        });
        insertEdge(layerId, noteId);
      }
    } catch (e: any) {
      updateLayer(layerId, { status: 'error', errorDetails: e.message });
    }
  };

  useEffect(() => {
    // Show new board setup dialog when canvas is empty (freshly created)
    if (layerIds.length === 0) {
      setShowNewBoardDialog(true);
    }
  }, []);

  // Handle file drag-and-drop onto canvas
  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;

    const dropPoint = {
      x: (e.clientX - camera.x) / camera.zoom,
      y: (e.clientY - camera.y) / camera.zoom,
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isOfficeDoc = file.name.match(/\.(ppt|pptx)$/i);
      
      if (isOfficeDoc) {
        // Mock extraction: generate 10 slides horizontally
        for (let s = 1; s <= 10; s++) {
          const slideX = dropPoint.x + (s - 1) * 800;
          const slideY = dropPoint.y;
          const slideId = insertLayer(LayerType.Slide, { x: slideX, y: slideY }, { r: 255, g: 255, b: 255 });
          updateLayer(slideId, { 
            fileName: `${file.name} - Slide ${s}`,
            value: `${file.name} - Slide ${s}`,
            fileSrc: `/extracted_slides/slide_${s}.png`
          } as any);
        }
      } else {
        const nodeX = dropPoint.x + (i % 3) * 300;
        const nodeY = dropPoint.y + Math.floor(i / 3) * 200;
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          if (file.type.startsWith('image/')) {
            insertLayer(LayerType.Image, { x: nodeX, y: nodeY }, { r: 255, g: 255, b: 255 }, undefined, undefined, base64);
          } else {
            const id = insertLayer(LayerType.Slide, { x: nodeX, y: nodeY }, { r: 255, g: 255, b: 255 });
            updateLayer(id, { fileSrc: base64, value: file.name, fileName: file.name } as any);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }, [camera, insertLayer, updateLayer]);

  // Handle template selection on new board dialog
  const handleTemplateSetup = useCallback((templateId: string | null) => {
    setShowNewBoardDialog(false);
    if (!templateId) return; // User chose blank canvas

    const cx = 200;
    const cy = 200;
    const gap = 340;

    if (templateId === 'standard') {
      const n1 = insertLayer(LayerType.Agent, { x: cx, y: cy }, { r: 255, g: 255, b: 255 }, undefined, 'entry-node', undefined, getInitialConfig('entry-node'));
      const n2 = insertLayer(LayerType.Agent, { x: cx + gap, y: cy }, { r: 255, g: 255, b: 255 }, undefined, 'resume-verifier', undefined, getInitialConfig('resume-verifier'));
      const n3 = insertLayer(LayerType.Agent, { x: cx + gap * 2, y: cy }, { r: 255, g: 255, b: 255 }, undefined, 'interview-topic-generator', undefined, getInitialConfig('interview-topic-generator'));
      const n4 = insertLayer(LayerType.Agent, { x: cx + gap * 3, y: cy }, { r: 255, g: 255, b: 255 }, undefined, 'offer-negotiator', undefined, getInitialConfig('offer-negotiator'));
      const n5 = insertLayer(LayerType.Agent, { x: cx + gap * 4, y: cy }, { r: 255, g: 255, b: 255 }, undefined, 'onboarding-agent', undefined, getInitialConfig('onboarding-agent'));
      insertEdge(n1, n2); insertEdge(n2, n3); insertEdge(n3, n4); insertEdge(n4, n5);
    } else if (templateId === 'tech') {
      const n1 = insertLayer(LayerType.Agent, { x: cx, y: cy }, { r: 255, g: 255, b: 255 }, undefined, 'entry-node', undefined, getInitialConfig('entry-node'));
      const n2 = insertLayer(LayerType.Agent, { x: cx + gap, y: cy }, { r: 255, g: 255, b: 255 }, undefined, 'resume-verifier', undefined, getInitialConfig('resume-verifier'));
      const n3 = insertLayer(LayerType.Agent, { x: cx + gap * 2, y: cy }, { r: 255, g: 255, b: 255 }, undefined, 'tech-assessor', undefined, getInitialConfig('tech-assessor'));
      const n4 = insertLayer(LayerType.Agent, { x: cx + gap * 3, y: cy }, { r: 255, g: 255, b: 255 }, undefined, 'transcript-analyzer', undefined, getInitialConfig('transcript-analyzer'));
      const n5 = insertLayer(LayerType.Agent, { x: cx + gap * 4, y: cy }, { r: 255, g: 255, b: 255 }, undefined, 'candidate-ranker', undefined, getInitialConfig('candidate-ranker'));
      insertEdge(n1, n2); insertEdge(n2, n3); insertEdge(n3, n4); insertEdge(n4, n5);
    } else if (templateId === 'highvolume') {
      const n1 = insertLayer(LayerType.Agent, { x: cx, y: cy }, { r: 255, g: 255, b: 255 }, undefined, 'sourcing-agent', undefined, getInitialConfig('sourcing-agent'));
      const n2 = insertLayer(LayerType.Agent, { x: cx + gap, y: cy - 80 }, { r: 255, g: 255, b: 255 }, undefined, 'resume-verifier', undefined, getInitialConfig('resume-verifier'));
      const n3 = insertLayer(LayerType.Agent, { x: cx + gap, y: cy + 80 }, { r: 255, g: 255, b: 255 }, undefined, 'background-checker', undefined, getInitialConfig('background-checker'));
      const n4 = insertLayer(LayerType.Agent, { x: cx + gap * 2, y: cy }, { r: 255, g: 255, b: 255 }, undefined, 'candidate-ranker', undefined, getInitialConfig('candidate-ranker'));
      const n5 = insertLayer(LayerType.Agent, { x: cx + gap * 3, y: cy }, { r: 255, g: 255, b: 255 }, undefined, 'offer-negotiator', undefined, getInitialConfig('offer-negotiator'));
      insertEdge(n1, n2); insertEdge(n1, n3); insertEdge(n2, n4); insertEdge(n3, n4); insertEdge(n4, n5);
    }
  }, [insertLayer, insertEdge, currentRole]);

  // Workflow orchestration engine
  // Workflow orchestration engine
  const runWorkflow = async () => {
    if (isRunning) return;
    setIsRunning(true);
    
    const agentIds = layerIds.filter(id => layers[id]?.type === LayerType.Agent);
    if (agentIds.length === 0) {
      setIsRunning(false);
      return;
    }

    // Reset status
    agentIds.forEach(id => updateLayer(id, { status: 'idle', result: undefined }));
    
    // Very naive topological execution for MVP: run left to right based on X coordinate
    const sortedAgentIds = [...agentIds].sort((a, b) => layers[a].x - layers[b].x);
    
    for (const id of sortedAgentIds) {
      await handleRunSingleAgent(id);
    }

    setIsRunning(false);
  };
  
  // Track pencil drawing state locally before committing
  const [pencilDraft, setPencilDraft] = useState<Point[] | null>(null);

  // Disable default browser zooming
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Poll for MCP commands
  useEffect(() => {
    let active = true;
    const poll = async () => {
      if (!active) return;
      try {
        const res = await fetch('/api/mcp-sync');
        if (res.ok) {
          const { commands } = await res.json();
          commands.forEach((cmd: any) => {
            if (cmd.action === 'add_agent') {
              insertLayer(
                LayerType.Agent,
                cmd.x || 100,
                cmd.y || 100,
                '',
                cmd.title || 'AI Agent',
                undefined,
                undefined,
                cmd.agentRole
              );
            }
          });
        }
      } catch (err) {
        console.error('MCP Sync Error:', err);
      }
      if (active) setTimeout(poll, 2000);
    };
    poll();
    return () => { active = false; };
  }, [insertLayer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selected = selections['local-user'];
        if (selected && selected.length > 0) {
          selected.forEach(id => {
            if (layerIds.includes(id)) {
              deleteLayers([id]);
            } else if (edgeIds.includes(id)) {
              deleteEdge(id);
            }
          });
          setSelection([]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selections, deleteLayers, deleteEdge, setSelection, layerIds, edgeIds]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.ctrlKey) {
      // Zooming
      const zoomSensitivity = 0.005;
      const delta = -e.deltaY * zoomSensitivity;
      setCamera(c => {
        const newZoom = Math.min(Math.max(c.zoom * (1 + delta), 0.1), 5);
        
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const newX = mouseX - (mouseX - c.x) * (newZoom / c.zoom);
        const newY = mouseY - (mouseY - c.y) * (newZoom / c.zoom);
        
        return { x: newX, y: newY, zoom: newZoom };
      });
    } else {
      // Panning
      setCamera(c => ({
        x: c.x - e.deltaX,
        y: c.y - e.deltaY,
        zoom: c.zoom
      }));
    }
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const isMiddleClick = e.button === 1;
    const isSpacePressed = e.shiftKey; // Fallback if we don't have global spacebar tracking

    const point = getPointerPos(e, camera);

    if (canvasState.mode === CanvasMode.Inserting) {
      const newLayerId = insertLayer(canvasState.layerType, point, { r: 255, g: 255, b: 255 }, undefined, canvasState.agentRole, (canvasState as any).src, getInitialConfig(canvasState.agentRole));
      
      if (canvasState.layerType === LayerType.Slide && (canvasState as any).fileSrc) {
        updateLayer(newLayerId, { 
          fileSrc: (canvasState as any).fileSrc, 
          value: (canvasState as any).fileName 
        });
      }
      
      setCanvasState({ mode: CanvasMode.None });
      return;
    }

    if (canvasState.mode === CanvasMode.Pencil) {
      setPencilDraft([point]);
      return;
    }

    if (isMiddleClick || isSpacePressed) {
      setCanvasState({ mode: CanvasMode.Pressing, origin: { x: e.clientX, y: e.clientY } });
      return;
    }

    if (e.target instanceof SVGElement && e.target.tagName === 'svg') {
      setCanvasState({ mode: CanvasMode.SelectionNet, origin: point, current: point });
      setSelection([]); // Clear selection
      setInspectedNodeId(null); // Close inspector
    }
  }, [canvasState, camera, insertLayer, setSelection, setInspectedNodeId]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    
    if (canvasState.mode === CanvasMode.Pressing) {
      setCamera(c => ({
        x: c.x + e.movementX,
        y: c.y + e.movementY,
        zoom: c.zoom
      }));
    } else if (canvasState.mode === CanvasMode.Resizing) {
      const point = getPointerPos(e, camera);
      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point
      );

      if (Math.abs(bounds.width) > 10 && Math.abs(bounds.height) > 10) {
        updateLayer(selections['local-user'][0], {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        });
      }
    } else if (canvasState.mode === CanvasMode.Translating) {
      // Adjust movement for zoom scale
      const offset = { 
        x: e.movementX / camera.zoom, 
        y: e.movementY / camera.zoom 
      };
      translateSelectedLayers(offset, selections['local-user'] || []);
    } else if (canvasState.mode === CanvasMode.Pencil && pencilDraft) {
      const point = getPointerPos(e, camera);
      setPencilDraft([...pencilDraft, point]);
    } else if (canvasState.mode === CanvasMode.SelectionNet) {
      const point = getPointerPos(e, camera);
      setCanvasState({ ...canvasState, current: point });
    } else if (canvasState.mode === CanvasMode.Connecting && canvasState.fromNodeId) {
      setCanvasState({ ...canvasState, currentPoint: getPointerPos(e, camera) });
    }
  }, [canvasState, camera, selections, translateSelectedLayers, pencilDraft]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (canvasState.mode === CanvasMode.Pencil && pencilDraft) {
      // Commit drawing
      insertLayer(
        LayerType.Path, 
        pencilDraft[0], 
        { r: 0, g: 0, b: 0 },
        pencilDraft.map(p => [p.x, p.y])
      );
      setPencilDraft(null);
    }

    if (canvasState.mode !== CanvasMode.None && canvasState.mode !== CanvasMode.Pencil && canvasState.mode !== CanvasMode.Inserting && canvasState.mode !== CanvasMode.Connecting) {
      setCanvasState({ mode: CanvasMode.None });
    }
  }, [canvasState, pencilDraft, insertLayer]);

  const onResizeHandlePointerDown = useCallback((corner: Side, initialBounds: XYWH) => {
    setCanvasState({
      mode: CanvasMode.Resizing,
      initialBounds,
      corner
    });
  }, []);

  const onLayerPointerDown = useCallback((e: React.PointerEvent, layerId: string) => {
    if (canvasState.mode === CanvasMode.Pencil || canvasState.mode === CanvasMode.Inserting) return;
    
    e.stopPropagation();

    if (canvasState.mode === CanvasMode.Connecting) {
      if (canvasState.fromNodeId) {
        if (canvasState.fromNodeId !== layerId) {
          insertEdge(canvasState.fromNodeId, layerId);
        }
        setCanvasState({ mode: CanvasMode.None });
      } else {
        setCanvasState({ mode: CanvasMode.Connecting, fromNodeId: layerId, currentPoint: getPointerPos(e, camera) });
      }
      return;
    }
    
    // Add to selection if not already selected
    const currentSelection = selections['local-user'] || [];
    if (!currentSelection.includes(layerId)) {
      setSelection([layerId]);
    }
    
    setCanvasState({ mode: CanvasMode.Translating, current: getPointerPos(e, camera) });
  }, [canvasState, selections, setSelection, camera, insertEdge]);

  const onLayerPointerUp = useCallback((e: React.PointerEvent, layerId: string) => {
    if (canvasState.mode === CanvasMode.Connecting && canvasState.fromNodeId && canvasState.fromNodeId !== layerId) {
      insertEdge(canvasState.fromNodeId, layerId);
      setCanvasState({ mode: CanvasMode.None });
      e.stopPropagation();
    }
  }, [canvasState, insertEdge]);

  const renderLayer = (layerId: string) => {
    const layer = layers[layerId];
    if (!layer) return null;
    
    const isSelected = (selections['local-user'] || []).includes(layerId);
    
    return (
      <g 
        key={layerId} 
        transform={`translate(${layer.x}, ${layer.y})`} 
        className={`group ${canvasState.mode === CanvasMode.None ? "cursor-move" : ""}`}
        onPointerDown={(e) => onLayerPointerDown(e, layerId)}
        onPointerUp={(e) => onLayerPointerUp(e, layerId)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setInspectedNodeId(layerId);
        }}
      >
        {layer.type === LayerType.Slide && (
          <foreignObject
            x={0}
            y={0}
            width={layer.width || 800}
            height={layer.height || 450}
            className="overflow-visible"
          >
            <div 
              className={`w-full h-full flex flex-col ${
                isSelected ? 'ring-2 ring-indigo-500' : 'ring-1 ring-slate-300'
              } bg-transparent pointer-events-none rounded-xl relative`}
            >
              <div className="absolute -top-12 left-0 flex items-center gap-2 pointer-events-auto">
                <div 
                  className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors group/play"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if ((layer as any).fileSrc) {
                      setPresentationMode({ active: true, layerId });
                      try { document.documentElement.requestFullscreen(); } catch(e) {}
                    }
                  }}
                >
                  <Play className={`w-4 h-4 ${(layer as any).fileSrc ? 'text-indigo-600 fill-indigo-600 group-hover/play:scale-110' : 'text-slate-400'} transition-transform`} />
                  <span className="text-sm font-semibold text-slate-700">{(layer as any).fileName || layer.value || 'Slide / Presentation'}</span>
                </div>
              </div>
              
              <div className="w-full h-full border-2 border-dashed border-slate-300/50 bg-slate-50/80 rounded-xl flex items-center justify-center pointer-events-auto overflow-hidden group/slide" onPointerDown={(e) => {
                if (!isSelected) {
                   onLayerPointerDown(e, layerId);
                } else {
                   e.stopPropagation(); // allow interacting with contents if selected
                }
              }}>
                {(layer as any).fileSrc ? (
                  <div className="w-full h-full relative flex flex-col items-center justify-center bg-white">
                    {/* Render Image or iframe for PDF */}
                    {((layer as any).fileSrc.startsWith('data:image') || (layer as any).fileSrc.match(/\.(jpeg|jpg|gif|png)$/)) ? (
                       <img src={(layer as any).fileSrc} alt="Presentation Slide" className="w-full h-full object-contain bg-white" />
                    ) : ((layer as any).fileSrc.startsWith('data:application/pdf') || (layer as any).fileSrc.endsWith('.pdf')) ? (
                       <iframe src={(layer as any).fileSrc} className="w-full h-full bg-white border-none" title="Presentation Viewer" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-900 text-white relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-violet-500"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent blur-2xl pointer-events-none"></div>
                            <div className="z-10 flex flex-col items-center text-center p-12">
                              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl border border-white/20 backdrop-blur-md">
                                <FileText className="w-10 h-10 text-blue-300 drop-shadow-md" />
                              </div>
                              <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight drop-shadow-md bg-gradient-to-br from-white to-blue-200 bg-clip-text text-transparent">{(layer as any).fileName?.replace(/\.[^/.]+$/, "") || 'Presentation'}</h2>
                              <p className="text-blue-200/80 text-lg mb-8 font-medium max-w-lg">Job Ninjas Interactive Presentation</p>
                            </div>
                         </div>
                    )}
                    <div className="absolute inset-0 bg-transparent" /> {/* Event shield */}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-8 w-full h-full cursor-pointer hover:bg-slate-100/50 transition-colors">
                    <Presentation className="w-10 h-10 text-indigo-400 mb-3" />
                    <span className="font-semibold text-slate-600 mb-1">Upload Presentation</span>
                    <span className="text-xs text-slate-400">PDF, PPTX, or Images</span>
                    <input 
                      type="file" 
                      accept=".pdf,.pptx,image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const isOfficeDoc = file.name.match(/\.(ppt|pptx|doc|docx)$/i);
                          if (isOfficeDoc) {
                             updateLayer(layerId, { fileName: file.name, value: file.name } as any);
                             const formData = new FormData();
                             formData.append('file', file);
                             fetch('/api/upload', { method: 'POST', body: formData })
                               .then(res => res.json())
                               .then(data => {
                                 if (data.url) updateLayer(layerId, { fileSrc: data.url } as any);
                               })
                               .catch(err => console.error(err));
                          } else {
                             const reader = new FileReader();
                             reader.onload = (event) => {
                               updateLayer(layerId, { fileSrc: event.target?.result as string, fileName: file.name } as any);
                             };
                             reader.readAsDataURL(file);
                          }
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </foreignObject>
        )}
        {layer.type === LayerType.Rectangle && (
          <rect 
            width={layer.width || 250} 
            height={layer.height || 120} 
            fill="#ffffff" 
            stroke={isSelected ? "#3b82f6" : "#e2e8f0"}
            strokeWidth={isSelected ? 2 : 1}
            rx={8}
            className="shadow-md"
          />
        )}
        
        {layer.type === LayerType.Agent && (
          <>
          {layer.agentRole === 'candidate-concierge' ? (
            <foreignObject
              width={Math.max(layer.width || 960, 960)}
              height={Math.max(layer.height || 560, 560)}
              className="overflow-visible"
              style={{ position: 'relative', zIndex: 10 }}
            >
              <CandidateConciergeNode layerId={layerId} layer={layer} isSelected={isSelected} />
            </foreignObject>
          ) : (
          <foreignObject
            width={layer.width || 250}
            height={Math.max(layer.height || 164, 164)}
            className="overflow-visible"
          >
            {layer.agentRole === 'candidate-node' ? (
              <CandidateNodeBlock layer={layer} isSelected={isSelected} />
            ) : ((layer.agentRole === 'word-doc' || layer.agentRole === 'excel-doc') && !(layer as any).displayMode) ? (
              <div className="w-full h-full rounded-2xl border-2 border-indigo-500 shadow-2xl flex flex-col items-center justify-center p-6 bg-white gap-4">
                <div className="text-center space-y-1">
                  <h4 className="font-bold text-foreground text-sm">Display Options</h4>
                  <p className="text-xs text-muted-foreground">How do you want to show this document?</p>
                </div>
                <div className="flex w-full gap-2">
                  <button 
                    onPointerDown={(e) => { 
                      e.stopPropagation(); 
                      updateLayer(layerId, { displayMode: 'doc' } as any); 
                    }}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer pointer-events-auto"
                  >
                    Doc Mode
                  </button>
                  <button 
                    onPointerDown={(e) => { 
                      e.stopPropagation(); 
                      updateLayer(layerId, {
                        type: LayerType.Slide,
                        width: 800,
                        height: 450,
                        fileSrc: layer.config?.docUrl || undefined,
                        fileName: layer.value || 'Document',
                        agentRole: undefined,
                        status: undefined,
                        displayMode: undefined
                      } as any);
                    }}
                    className="flex-1 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer pointer-events-auto"
                  >
                    <Maximize className="w-3 h-3" />
                    View Mode
                  </button>
                </div>
              </div>
            ) : (
            <div 
              className={`w-full h-full rounded-2xl border flex flex-col overflow-hidden bg-white/95 backdrop-blur-xl shadow-xl transition-all duration-300 ${
                isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-indigo-500/20 scale-[1.02] z-50' : 'border-slate-200 shadow-slate-200/50 hover:shadow-slate-300/50 hover:border-slate-300'
              }`}
            >
              <div className="bg-slate-50/80 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const meta = AGENTS.find(a => a.role === layer.agentRole) || AGENTS.find(a => a.role === 'custom-agent');
                    const Icon = meta?.icon;
                    return (
                      <>
                        <div className={`p-1.5 rounded-md ${meta?.bg} ${meta?.color}`}>
                          {Icon ? <Icon className="w-4 h-4" /> : <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>}
                        </div>
                        <span className="font-bold text-[13px] text-slate-700 capitalize tracking-tight">
                          {meta?.label || layer.agentRole?.replace('-', ' ') || 'AI Agent'}
                        </span>
                      </>
                    );
                  })()}
                </div>
                {/* Status indicator */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{layer.status || 'IDLE'}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    layer.status === 'running' ? 'bg-blue-500 animate-pulse' :
                    layer.status === 'success' ? 'bg-emerald-500' :
                    layer.status === 'error' ? 'bg-red-500' :
                    'bg-slate-300'
                  }`} />
                </div>
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between bg-white">
                <div className="mb-2">
                  <h4 className="font-extrabold text-slate-900 text-[17px] mb-1 leading-tight">{layer.value || 'AI Agent'}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {layer.result ? 'Result available' : 'Waiting for input to process.'}
                  </p>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  {layer.agentRole !== 'word-doc' && layer.agentRole !== 'excel-doc' && layer.agentRole !== 'entry-node' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRunSingleAgent(layerId); }}
                      disabled={layer.status === 'running'}
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 disabled:bg-emerald-50/50 disabled:text-emerald-600/50 text-[13px] font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {layer.status === 'running' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                      Run
                    </button>
                  )}
                  {(layer.agentRole === 'word-doc' || layer.agentRole === 'excel-doc') && (
                    <button 
                      onPointerDown={(e) => { 
                        e.stopPropagation(); 
                        updateLayer(layerId, {
                          type: LayerType.Slide,
                          width: 800,
                          height: 450,
                          fileSrc: layer.config?.docUrl || undefined,
                          fileName: layer.value || 'Document',
                          agentRole: undefined,
                          status: undefined
                        } as any);
                      }}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-semibold rounded transition-colors flex items-center gap-1 cursor-pointer pointer-events-auto"
                    >
                      <Maximize className="w-3 h-3" />
                      View Mode
                    </button>
                  )}
                  <button className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-semibold rounded transition-colors">
                    Configure
                  </button>
                </div>
              </div>
            </div>
            )}
          </foreignObject>
          )}
          </>
        )}

        {layer.type === LayerType.Note && (
          <foreignObject
            x={0}
            y={0}
            width={layer.width || 250}
            height={layer.height || 200}
            className="overflow-visible"
          >
            <div 
              className={`w-full h-full rounded-2xl bg-white border flex flex-col overflow-hidden transition-all ${
                isSelected ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-slate-200'
              }`}
              style={{
                boxShadow: layer.fill ? `0 12px 40px -12px rgba(${layer.fill.r}, ${layer.fill.g}, ${layer.fill.b}, 0.35)` : '0 12px 40px -12px rgba(0,0,0,0.08)'
              }}
            >
              <div 
                className="h-2 w-full shrink-0"
                style={{ backgroundColor: layer.fill ? `rgb(${layer.fill.r}, ${layer.fill.g}, ${layer.fill.b})` : '#fef08a' }}
              />
              <div className="p-5 flex-1 flex flex-col bg-slate-50/30">
                <textarea
                  value={layer.value || ""}
                  onChange={(e) => updateLayer(layerId, { value: e.target.value })}
                  placeholder={isSelected ? "Type note here..." : ""}
                  className={`w-full h-full bg-transparent border-none outline-none resize-none placeholder:text-slate-400 font-medium text-slate-700 text-[13px] leading-relaxed ${!isSelected && 'pointer-events-none'}`}
                  onPointerDown={(e) => isSelected ? e.stopPropagation() : undefined}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </foreignObject>
        )}

        {layer.type === LayerType.Ellipse && (
          <ellipse 
            cx={(layer.width || 100) / 2} 
            cy={(layer.height || 100) / 2}
            rx={(layer.width || 100) / 2}
            ry={(layer.height || 100) / 2}
            fill="#f8fafc" 
            stroke={isSelected ? "#3b82f6" : "#cbd5e1"}
            strokeWidth={isSelected ? 2 : 2}
          />
        )}

        {layer.type === LayerType.Path && layer.points && (
          <path
            d={getSvgPathFromStroke(getStroke(layer.points.map(p => [p[0], p[1]]), {
              size: 8,
              thinning: 0.5,
              smoothing: 0.5,
              streamline: 0.5,
            }))}
            fill={layer.fill ? `rgb(${layer.fill.r}, ${layer.fill.g}, ${layer.fill.b})` : "#000"}
          />
        )}

        {layer.type === LayerType.Text && (
          <foreignObject
            x={0}
            y={0}
            width={layer.width || 300}
            height={layer.height || 100}
          >
            <textarea
              value={layer.value || ""}
              onChange={(e) => updateLayer(layerId, { value: e.target.value })}
              placeholder={isSelected ? "Type text..." : "Text Layer"}
              className={`w-full h-full bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground ${!isSelected && 'pointer-events-none'}`}
              style={{
                fontFamily: (layer as any).fontFamily || 'inherit',
                fontSize: `${(layer as any).fontSize || 24}px`,
                color: (layer as any).color || '#334155',
                fontWeight: 500
              }}
              onPointerDown={(e) => isSelected ? e.stopPropagation() : undefined}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </foreignObject>
        )}

        {layer.type === LayerType.Image && (layer as any).src && (
          <image
            x={0}
            y={0}
            width={layer.width || 100}
            height={layer.height || 100}
            href={(layer as any).src}
            preserveAspectRatio="none"
          />
        )}
        
        {/* Inline editable text for Shapes */}
        {layer.type !== LayerType.Text && layer.type !== LayerType.Agent && layer.type !== LayerType.Image && layer.type !== LayerType.Path && layer.type !== LayerType.Note && layer.type !== LayerType.Slide && (
          <foreignObject
            x={0}
            y={0}
            width={layer.width || 100}
            height={layer.height || 100}
          >
            <div className={`w-full h-full p-4 flex flex-col overflow-hidden justify-center`}>
              <textarea
                value={layer.value || ""}
                onChange={(e) => updateLayer(layerId, { value: e.target.value })}
                placeholder={isSelected ? "Type here..." : ""}
                className={`w-full bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/50 ${!isSelected && 'pointer-events-none'}`}
                style={{
                  textAlign: 'center',
                  fontFamily: (layer as any).fontFamily || 'inherit',
                  fontSize: `${(layer as any).fontSize || 16}px`,
                  color: (layer as any).color || '#334155',
                  height: `${((layer as any).fontSize || 16) * 1.5 * (layer.value?.split('\n').length || 1)}px`,
                  minHeight: `${((layer as any).fontSize || 16) * 1.5}px`
                }}
                onPointerDown={(e) => isSelected ? e.stopPropagation() : undefined}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </foreignObject>
        )}

        {/* Quick Add Button on Hover */}
        <g className={`transition-opacity ${quickAddMenuFor === layerId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <path 
            d={`M ${layer.width || 100} ${(layer.height || 100) / 2} L ${(layer.width || 100) + 24} ${(layer.height || 100) / 2}`}
            stroke="#3b82f6" 
            strokeWidth="3" 
            markerEnd="url(#arrowhead)"
          />
          <foreignObject
            x={(layer.width || 100) + 16}
            y={(layer.height || 100) / 2 - 250}
            width={400}
            height={500}
            className="overflow-visible"
            style={{ pointerEvents: 'none' }}
          >
            <div className="relative w-full h-full pointer-events-none">
              <div className="absolute top-1/2 left-0 pointer-events-auto flex flex-col gap-2" style={{ transform: 'translateY(-50%)' }}>
                <button
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setQuickAddMenuFor(quickAddMenuFor === layerId ? null : layerId);
                  }}
                  className="w-8 h-8 rounded-full bg-card shadow-lg border border-border flex items-center justify-center text-muted-foreground hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all hover:scale-110 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    useBoardStore.getState().deleteLayers([layerId]);
                  }}
                  className="w-8 h-8 rounded-full bg-card shadow-lg border border-border flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all hover:scale-110 active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {quickAddMenuFor === layerId && (
                  <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2 bg-card shadow-2xl border border-border rounded-xl p-2 flex flex-col gap-1 w-64 animate-in fade-in zoom-in-95 pointer-events-auto">
                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider mb-1 flex justify-between items-center">
                      <span>Add Connected Node</span>
                      <button onClick={(e) => { e.stopPropagation(); setQuickAddMenuFor(null); }} className="hover:text-foreground"><X className="w-3 h-3" /></button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto pr-1">
                      {AGENTS.map((agent) => (
                        <button
                          key={agent.role}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const newId = insertLayer(
                              LayerType.Agent,
                              { x: layer.x + (layer.width || 100) + 100, y: layer.y },
                              { r: 255, g: 255, b: 255 },
                              undefined,
                              agent.role,
                              undefined,
                              getInitialConfig(agent.role)
                            );
                            insertEdge(layerId, newId);
                            setSelection([newId]);
                            setQuickAddMenuFor(null);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors group/agent text-left"
                        >
                          <div className={`p-1.5 rounded-md ${agent.bg} ${agent.color}`}>
                            <agent.icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-foreground group-hover/agent:text-foreground">
                            {agent.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </foreignObject>
        </g>
      </g>
    );
  };

  return (
    <main 
      className="h-full w-full relative touch-none overflow-hidden bg-background" 
      style={{ 
        cursor: canvasState.mode === CanvasMode.Pressing ? 'grabbing' : 
                canvasState.mode === CanvasMode.Inserting ? 'crosshair' : 
                canvasState.mode === CanvasMode.Pencil ? 'crosshair' : 'default' 
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleFileDrop}
      >
      
      {/* === FEATURE 1.5: Blank Canvas Onboarding === */}
      {layerIds.length === 0 && !isDragOver && (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-4 text-slate-400">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
              <Plus className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-xl font-bold text-slate-300">Your canvas is empty</p>
            <p className="text-sm">Drag an agent from the toolbar below to start building your pipeline.</p>
          </div>
        </div>
      )}

      {/* === FEATURE 1: Drag & Drop overlay === */}
      {isDragOver && (
        <div className="absolute inset-0 z-[200] bg-blue-500/10 border-4 border-dashed border-blue-400 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-blue-500" />
            <p className="text-xl font-bold text-slate-800">Drop files here</p>
            <p className="text-sm text-slate-500">PDFs, Word, Excel files will be auto-parsed into canvas nodes</p>
          </div>
        </div>
      )}

      {/* Hidden file input for toolbar upload button */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.ppt,.pptx"
        className="hidden"
        onChange={(e) => {
          const fakeEvent = { preventDefault: () => {}, dataTransfer: { files: e.target.files }, clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 } as unknown as React.DragEvent;
          if (e.target.files?.length) handleFileDrop(fakeEvent);
        }}
      />

      {/* === FEATURE 3: New Board Setup Dialog === */}
      {showNewBoardDialog && (
        <div className="absolute inset-0 z-[300] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-2xl overflow-hidden border border-slate-100 transform transition-all">
            {/* Minimal Header */}
            <div className="px-8 pt-10 pb-6 text-center">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Workflow className="w-8 h-8 text-slate-900" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Create New Pipeline</h2>
              <p className="text-slate-500 text-[15px]">Select an AI agent template or start with a blank canvas.</p>
            </div>

            <div className="px-8 pb-4 space-y-3">
              {[
                { id: 'standard', label: 'Standard Hiring Pipeline', desc: 'Job Details → Resume Verifier → Interview → Offer → Onboarding', tags: ['5 agents', 'All roles'], icon: '🎯' },
                { id: 'tech', label: 'Tech Engineering Pipeline', desc: 'Resume → Tech Assessment → Transcript Analyzer → Candidate Ranker', tags: ['5 agents', 'Engineering'], icon: '💻' },
                { id: 'highvolume', label: 'High-Volume Hiring', desc: 'Sourcing → Parallel screening → Ranking → Offer', tags: ['4 agents', 'Retail / Sales'], icon: '⚡' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTemplate(t.id); }}
                  className={`w-full text-left rounded-2xl p-5 transition-all duration-200 border relative overflow-hidden group ${
                    selectedTemplate === t.id 
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                      {t.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-slate-900 text-[15px]">{t.label}</p>
                        <div className="flex gap-2">
                          {t.tags.map(tag => (
                            <span key={tag} className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-[13px] text-slate-500 truncate pr-4">{t.desc}</p>
                    </div>
                  </div>
                  {/* Subtle active indicator */}
                  {selectedTemplate === t.id && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                      <CheckCircle className="w-5 h-5 text-slate-900" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="p-8 pt-4 flex gap-4 bg-white">
              <button
                onClick={() => handleTemplateSetup(null)}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-[15px] hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Start Blank
              </button>
              <button
                onClick={() => handleTemplateSetup(selectedTemplate)}
                disabled={!selectedTemplate}
                className="flex-[2] py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-[15px] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                Build Pipeline <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === FEATURE 2: MCP Connector Side Panel === */}
      {isMcpPanelOpen && (
        <div className="absolute top-0 right-0 h-full w-80 z-[100] bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <Plug className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800">MCP Connectors</h3>
            </div>
            <button onClick={() => setIsMcpPanelOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Click to add a connector to the canvas</p>
            {MCP_CONNECTORS.map((conn) => (
              <button
                key={conn.agentRole}
                onClick={() => {
                  const cx = (window.innerWidth / 2 - camera.x) / camera.zoom;
                  const cy = (window.innerHeight / 2 - camera.y) / camera.zoom;
                  insertLayer(LayerType.Agent, { x: cx, y: cy }, { r: 255, g: 255, b: 255 }, undefined, conn.agentRole);
                  setIsMcpPanelOpen(false);
                }}
                className="w-full text-left flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className={`p-2 rounded-lg ${conn.bg} ${conn.color} shrink-0 group-hover:scale-110 transition-transform`}>
                  <conn.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{conn.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{conn.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-400 text-center">More connectors coming soon. Connect via custom MCP API.</p>
          </div>
        </div>
      )}

      {/* Fullscreen Presentation Overlay */}
      {presentationMode.active && presentationMode.layerId && (
        <PresentationViewer 
          layers={layers} 
          startLayerId={presentationMode.layerId} 
          onClose={() => setPresentationMode({ active: false })} 
        />
      )}

      <Toolbar canvasState={canvasState} setCanvasState={setCanvasState} onOpenTemplates={() => setIsTemplatesOpen(true)} />
      <LibraryModal isOpen={isTemplatesOpen} onClose={() => setIsTemplatesOpen(false)} camera={camera} />
      <ZoomControls camera={camera} setCamera={setCamera} />
      <InspectorPanel boardId={boardId} />
      
      {/* Top Left Header / Home Bar */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
        <Link 
          href="/dashboard"
          className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600 hover:text-indigo-600"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-2">
          <Workflow className="w-4 h-4 text-indigo-500" />
          <h1 className="font-semibold text-slate-800 text-sm">
            {boardId === 'new-workflow' ? 'New AI Workflow' : (currentRole?.title || boardId)}
          </h1>
        </div>
      </div>
      
      {/* Toolbar extra buttons: Upload Files + MCP Connectors */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all"
          title="Upload resumes or documents"
        >
          <Upload className="w-4 h-4 text-blue-500" />
          Upload Files
        </button>
        <button
          onClick={() => setIsMcpPanelOpen(v => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium shadow-sm transition-all ${isMcpPanelOpen ? 'bg-blue-600 text-white border border-blue-600' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:shadow-md'}`}
          title="MCP Connectors (Gmail, Slack, Calendar...)"
        >
          <Plug className="w-4 h-4" />
          Connectors
        </button>
      </div>
      
      {/* Run Workflow Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={runWorkflow}
          disabled={isRunning}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all
            ${isRunning 
              ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-xl hover:-translate-y-0.5'}
          `}
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          {isRunning ? 'Running Pipeline...' : 'Run Agents'}
        </button>
      </div>

      {/* Grid Pattern and Arrowhead */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        <defs>
          <pattern id="grid-pattern" x={camera.x % (24 * camera.zoom)} y={camera.y % (24 * camera.zoom)} width={24 * camera.zoom} height={24 * camera.zoom} patternUnits="userSpaceOnUse">
            <circle cx={1 * camera.zoom} cy={1 * camera.zoom} r={1} fill="#cbd5e1" />
          </pattern>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
          </marker>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>

      <svg
        className="h-full w-full absolute inset-0 z-10"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <g style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }}>
          {/* Render edges */}
          {edgeIds.map(edgeId => {
            const edge = edges[edgeId];
            if (!edge) return null;
            const fromLayer = layers[edge.fromNodeId];
            const toLayer = layers[edge.toNodeId];
            if (!fromLayer || !toLayer) return null;
            
            const startCenter = { x: fromLayer.x + (fromLayer.width || 100) / 2, y: fromLayer.y + (fromLayer.height || 100) / 2 };
            const endCenter = { x: toLayer.x + (toLayer.width || 100) / 2, y: toLayer.y + (toLayer.height || 100) / 2 };

            const p1 = getBoxIntersection(endCenter.x, endCenter.y, fromLayer.x, fromLayer.y, fromLayer.width || 100, fromLayer.height || 100, 0);
            const p2 = getBoxIntersection(startCenter.x, startCenter.y, toLayer.x, toLayer.y, toLayer.width || 100, toLayer.height || 100, 16);
            
            const isSelected = selections['local-user']?.includes(edgeId);
            
            const isNoteOrDoc = (l: any) => l.type === LayerType.Note || l.agentRole === 'word-doc' || l.agentRole === 'excel-doc';
            let pathD = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;

            return (
              <g key={edgeId}>
                <path
                  d={pathD}
                  stroke={isSelected ? "#3b82f6" : "#64748b"}
                  strokeWidth={isSelected ? "4" : "3"}
                  strokeDasharray="6,6"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  pointerEvents="auto"
                  className="cursor-pointer transition-all hover:stroke-blue-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelection([edgeId]);
                  }}
                />
                {isSelected && (
                  <EdgeToolbar edgeId={edgeId} zoom={camera.zoom} />
                )}
              </g>
            );
          })}

          {[...layerIds].sort((a, b) => {
            const isSlideA = layers[a]?.type === LayerType.Slide ? -1 : 1;
            const isSlideB = layers[b]?.type === LayerType.Slide ? -1 : 1;
            return isSlideA - isSlideB;
          }).map(layerId => renderLayer(layerId))}

          {/* Render in-progress edge */}
          {canvasState.mode === CanvasMode.Connecting && canvasState.fromNodeId && canvasState.currentPoint && (
            (() => {
              const fromLayer = layers[canvasState.fromNodeId];
              if (!fromLayer) return null;
              const startCenter = { x: fromLayer.x + (fromLayer.width || 100) / 2, y: fromLayer.y + (fromLayer.height || 100) / 2 };
              const p1 = getBoxIntersection(canvasState.currentPoint.x, canvasState.currentPoint.y, fromLayer.x, fromLayer.y, fromLayer.width || 100, fromLayer.height || 100, 0);
              const p2 = canvasState.currentPoint;
              
              const isNoteOrDoc = fromLayer.type === LayerType.Note || fromLayer.agentRole === 'word-doc' || fromLayer.agentRole === 'excel-doc';
              let pathD = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;

              return (
                <path
                  d={pathD}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  pointerEvents="none"
                />
              );
            })()
          )}

          {/* Render in-progress drawing */}
          {pencilDraft && pencilDraft.length > 0 && (
            <path
              d={getSvgPathFromStroke(getStroke(pencilDraft.map(p => [p.x, p.y]), {
                size: 8,
                thinning: 0.5,
                smoothing: 0.5,
                streamline: 0.5,
              }))}
              fill="#3b82f6"
            />
          )}
          
          {/* Render selection net */}
          {canvasState.mode === CanvasMode.SelectionNet && canvasState.current && (
            <rect
              x={Math.min(canvasState.origin.x, canvasState.current.x)}
              y={Math.min(canvasState.origin.y, canvasState.current.y)}
              width={Math.abs(canvasState.origin.x - canvasState.current.x)}
              height={Math.abs(canvasState.origin.y - canvasState.current.y)}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#3b82f6"
              strokeWidth={1}
            />
          )}

          {/* Edge selected: Quick add in between */}
          {selections['local-user']?.length === 1 && edges[selections['local-user'][0]] && (
            (() => {
              const edgeId = selections['local-user'][0];
              const edge = edges[edgeId];
              if (!edge) return null;
              
              const fromLayer = layers[edge.fromNodeId];
              const toLayer = layers[edge.toNodeId];
              if (!fromLayer || !toLayer) return null;

              const startCenter = { x: fromLayer.x + (fromLayer.width || 100) / 2, y: fromLayer.y + (fromLayer.height || 100) / 2 };
              const endCenter = { x: toLayer.x + (toLayer.width || 100) / 2, y: toLayer.y + (toLayer.height || 100) / 2 };

              const midX = (startCenter.x + endCenter.x) / 2;
              const midY = (startCenter.y + endCenter.y) / 2;

              return (
                <g>
                  <foreignObject
                    x={midX - 250}
                    y={midY - 250}
                    width={500}
                    height={500}
                    className="overflow-visible"
                    style={{ pointerEvents: 'none' }}
                  >
                    <div className="relative w-full h-full pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 pointer-events-auto flex flex-col gap-2" style={{ transform: 'translate(-50%, -50%)' }}>
                        <button
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setQuickAddMenuFor(quickAddMenuFor === edgeId ? null : edgeId);
                          }}
                          className="w-8 h-8 rounded-full bg-card shadow-lg border border-border flex items-center justify-center text-muted-foreground hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all hover:scale-110 active:scale-95"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <button
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            deleteEdge(edgeId);
                            setSelection([]);
                          }}
                          className="w-8 h-8 rounded-full bg-card shadow-lg border border-border flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all hover:scale-110 active:scale-95"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {quickAddMenuFor === edgeId && (
                          <div className="absolute top-1/2 left-full ml-2 -translate-y-1/2 bg-card shadow-2xl border border-border rounded-xl p-2 flex flex-col gap-1 w-64 animate-in fade-in zoom-in-95 pointer-events-auto">
                            <div className="text-xs font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider mb-1 flex justify-between items-center">
                              <span>Insert Node Between</span>
                              <button onClick={(e) => { e.stopPropagation(); setQuickAddMenuFor(null); }} className="hover:text-foreground"><X className="w-3 h-3" /></button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto pr-1">
                              {AGENTS.map((agent) => (
                                <button
                                  key={agent.role}
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    const newId = insertLayer(
                                      LayerType.Agent,
                                      { x: midX - 125, y: midY - 60 },
                                      { r: 255, g: 255, b: 255 },
                                      undefined,
                                      agent.role,
                                      undefined,
                                      getInitialConfig(agent.role)
                                    );
                                    deleteEdge(edgeId);
                                    insertEdge(edge.fromNodeId, newId);
                                    insertEdge(newId, edge.toNodeId);
                                    setSelection([newId]);
                                    setQuickAddMenuFor(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors group text-left"
                                >
                                  <div className={`p-1.5 rounded-md ${agent.bg} ${agent.color}`}>
                                    <agent.icon className="w-4 h-4" />
                                  </div>
                                  <span className="text-sm font-medium text-foreground group-hover:text-foreground">
                                    {agent.label}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </foreignObject>
                </g>
              );
            })()
          )}

          {/* Render SelectionBox for resizing if exactly one layer is selected */}
          {selections['local-user']?.length === 1 && layers[selections['local-user'][0]] && (
            (() => {
              const layerId = selections['local-user'][0];
              const layer = layers[layerId];
              if (!layer) return null;
              
              // Only rectangles, ellipses, text, notes, images, agents have bounding boxes.
              // Paths do too but they might require different logic. Let's just pass the bounds.
              const bounds = {
                x: layer.x,
                y: layer.y,
                width: layer.width || 100,
                height: layer.height || 100
              };

              return (
                <g>
                  <SelectionBox
                    bounds={bounds}
                    zoom={camera.zoom}
                    onResizeHandlePointerDown={onResizeHandlePointerDown}
                  />
                  <FloatingToolbar
                    layerId={layerId}
                    bounds={bounds}
                    zoom={camera.zoom}
                  />
                </g>
              );
            })()
          )}
        </g>
      </svg>
    </main>
  );
};

























