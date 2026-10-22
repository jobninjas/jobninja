"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Canvas } from "@/components/board/canvas";
import CandidateManager from "@/components/board/CandidateManager";
import { useBoardStore } from "@/store/board";
import { LayerType } from "@/types/canvas";
import { Loader2 } from "lucide-react";

export default function RoleBoardPage({ params }: { params?: Promise<{ roleId: string }> | { roleId: string } }) {
  const routeParams = useParams();
  const roleId = (routeParams?.roleId as string) || "";
  
  const layerIds = useBoardStore(state => state.layerIds);
  const layers = useBoardStore(state => state.layers);
  const edgeIds = useBoardStore(state => state.edgeIds);
  const edges = useBoardStore(state => state.edges);
  
  const setLayerIds = useBoardStore(state => state.setLayerIds);
  const setLayers = useBoardStore(state => state.setLayers);
  const setEdgeIds = useBoardStore(state => state.setEdgeIds);
  const setEdges = useBoardStore(state => state.setEdges);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const initialLoadRef = useRef(false);

  // Load initial state
  useEffect(() => {
    if (!roleId) return;
    setLoading(true);
    // Optimistically clear the board to prevent flickering old data
    setLayerIds([]);
    setLayers({});
    setEdgeIds([]);
    setEdges({});
    
    fetch(`/api/boards/${roleId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setLayerIds(data.layerIds || []);
          setLayers(data.layers || {});
          setEdgeIds(data.edgeIds || []);
          setEdges(data.edges || {});
        } else {
          // Explicitly clear if board doesn't exist yet
          setLayerIds([]);
          setLayers({});
          setEdgeIds([]);
          setEdges({});
        }
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        initialLoadRef.current = true;
      });
  }, [roleId, setLayerIds, setLayers, setEdgeIds, setEdges]);

  // Save changes automatically
  const saveTimeout = useRef<any>(null);
  
  useEffect(() => {
    if (loading || !initialLoadRef.current || !roleId) return;
    
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    
    setSaving(true);
    saveTimeout.current = setTimeout(() => {
      fetch(`/api/boards/${roleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layerIds, layers, edgeIds, edges })
      })
      .finally(() => setSaving(false));
    }, 1500); // Debounce saves by 1.5s
    
    return () => clearTimeout(saveTimeout.current);
  }, [layerIds, layers, edgeIds, edges, roleId, loading]);

  if (loading && !initialLoadRef.current) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
        <p>Loading your workflow...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <div className="absolute top-6 left-6 z-50 flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-slate-200/50 cursor-pointer hover:bg-white transition-colors" onClick={() => window.location.href='/roles'}>
        <img src="/logo.png" alt="JobNinjas" className="w-8 h-8 object-contain" />
        <span className="font-extrabold text-slate-800 tracking-tight">JobNinjas</span>
      </div>

      {/* Candidate Pipeline Management & ATS Ingestion Widget */}
      {roleId && <CandidateManager roleId={roleId} />}

      {saving && (
        <div className="absolute bottom-6 right-6 z-50 bg-card/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm text-xs font-medium text-muted-foreground flex items-center gap-2 border border-border/50">
          <Loader2 className="w-3 h-3 animate-spin" />
          Saving...
        </div>
      )}
      <Canvas boardId={roleId} />
    </div>
  );
}
