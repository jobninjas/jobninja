"use client";

import { useEffect, useState } from 'react';
import { Play, CheckCircle, Clock, Workflow, ArrowRight, Plus, Loader2, Sparkles, Layers } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WorkflowsPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkflows() {
      try {
        setLoading(true);
        const res = await fetch('/api/roles');
        const data = await res.json();
        if (data.success && data.roles) {
          setRoles(data.roles);
        }
      } catch (e) {
        console.error('Failed to load workflow boards:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkflows();
  }, []);

  return (
    <div className="p-8 h-full flex flex-col gap-8 relative overflow-y-auto font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden flex-shrink-0">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Workflow className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Autonomous Hiring Workflows</h2>
          </div>
          <p className="text-indigo-100 text-base leading-relaxed mb-6">
            Every job role in JobNinjas operates an interconnected AI pipeline. Sourcing agents pass candidate intelligence to resume verifiers, interview planners, transcript analyzers, and concierge nodes on an infinite canvas with human-in-the-loop decision gates.
          </p>
          <Link
            href="/roles"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Role Workflow
          </Link>
        </div>
      </div>

      {/* Workflows List */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Active Pipeline Boards</h3>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium">Loading workflows...</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Workflow className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">No active workflow pipelines</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
              Create a role to deploy a tailored agent graph with resume intelligence, interview analysis, and concierge bookings.
            </p>
            <Link
              href="/roles"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create First Workflow
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                      {role.department}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      LIVE
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">{role.title}</h4>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                    {role.jobDescription || 'Autonomous recruiting pipeline with connected AI agents and decision gates.'}
                  </p>

                  <div className="space-y-1.5 border-t border-slate-100 pt-3 mb-4 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="font-medium text-slate-800">{role.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Candidates in DAG:</span>
                      <span className="font-medium text-slate-800">{role.candidates?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hiring Manager:</span>
                      <span className="font-medium text-slate-800">{role.hiringManager}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/roles/${role.id}/board`}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Open Canvas Board
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
