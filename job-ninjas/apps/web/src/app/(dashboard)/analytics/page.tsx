"use client";

import { useEffect, useState } from "react";
import { BarChart, TrendingUp, Users, Clock, Briefcase, Bot } from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>({
    openRoles: 0,
    totalRoles: 0,
    totalCandidates: 0,
    agentRuns: 0,
    interviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 flex flex-col h-full relative">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Pipeline Metrics</h2>
          <p className="text-sm text-gray-500 mt-1">Real-time telemetry and candidate throughput across your organization</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Candidates</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCandidates}</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600 font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>Active candidates in DB</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Active Roles</h3>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.openRoles}</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-slate-500 font-medium">
            <span>{stats.totalRoles} total pipelines created</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Agent Executions</h3>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.agentRuns}</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-purple-600 font-medium">
            <span>Autonomous agent tasks</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Interviews Recorded</h3>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.interviews}</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-amber-600 font-medium">
            <span>Across all role boards</span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-gray-200 p-8 shadow-sm flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Pipeline Distribution</h3>
        {stats.totalCandidates === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
            <Users className="w-10 h-10 mb-3 text-slate-300 stroke-1" />
            <p className="font-semibold text-slate-600">No candidate metrics yet</p>
            <p className="text-xs text-slate-400 mt-1">Add candidates or open a role to start populating pipeline throughput.</p>
          </div>
        ) : (
          <div className="flex-1 flex items-end justify-between gap-4 mt-4 px-4 h-64">
            {[
              { stage: 'Applied / Sourced', count: stats.totalCandidates, h: 'h-full', color: 'bg-blue-500' },
              { stage: 'Screened', count: Math.min(stats.totalCandidates, stats.agentRuns), h: 'h-3/4', color: 'bg-indigo-500' },
              { stage: 'Interview', count: stats.interviews, h: 'h-1/2', color: 'bg-purple-500' },
              { stage: 'Decision', count: Math.floor(stats.agentRuns / 2), h: 'h-1/3', color: 'bg-amber-500' },
              { stage: 'Onsite / Concierge', count: Math.floor(stats.interviews / 2), h: 'h-1/4', color: 'bg-emerald-500' }
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group">
                <span className="text-sm font-bold text-slate-700 mb-2">{bar.count}</span>
                <div className={`w-full max-w-[80px] ${bar.h} ${bar.color} rounded-t-lg transition-all hover:brightness-95 shadow-sm`}></div>
                <span className="text-[12px] font-medium text-slate-500 mt-3 text-center">{bar.stage}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
