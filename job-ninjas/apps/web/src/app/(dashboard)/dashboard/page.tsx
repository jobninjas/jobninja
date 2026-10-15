"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase, Users, Bot, Clock, Plus, ChevronRight,
  Loader2, CheckCircle2, AlertCircle, ArrowUpRight
} from "lucide-react";

function timeAgo(iso: string) {
  if (!iso) return "just now";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const DEPT_COLORS: Record<string, string> = {
  Engineering: "bg-blue-500",
  Product: "bg-violet-500",
  Design: "bg-pink-500",
  Marketing: "bg-orange-500",
  Operations: "bg-emerald-500",
  Sales: "bg-amber-500",
  HR: "bg-rose-500",
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    openRoles: 0,
    totalRoles: 0,
    totalCandidates: 0,
    agentRuns: 0,
    interviews: 0,
  });
  const [roles, setRoles] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsRes, rolesRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/roles'),
        ]);

        const statsData = await statsRes.json();
        const rolesData = await rolesRes.json();

        if (statsData.success) {
          setStats(statsData.stats);
          setActivity(statsData.activity || []);
        }

        if (rolesData.success) {
          setRoles(rolesData.roles || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const statCards = [
    {
      label: "Open Roles",
      value: stats.openRoles,
      sub: `${stats.totalRoles} total pipelines`,
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Candidates in Pipeline",
      value: stats.totalCandidates,
      sub: "Active applicants",
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Agent Runs",
      value: stats.agentRuns,
      sub: "Total AI executions",
      icon: Bot,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Interviews Recorded",
      value: stats.interviews,
      sub: "Technical & culture rounds",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="p-6 max-w-full font-sans">
      {/* Welcome header */}
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Good morning, Recruiting Team</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Live metrics and activity across your autonomous hiring pipelines.</p>
        </div>
        <Link
          href="/roles"
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Role
        </Link>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Syncing live dashboard metrics...</p>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            {statCards.map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-[12px] font-semibold text-slate-700 mt-0.5">{s.label}</p>
                  <p className="text-[11px] text-slate-400">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom two-col layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Active boards (2/3 width) */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[14px] font-bold text-slate-900">Hiring Role Boards</h2>
                <Link href="/roles" className="flex items-center gap-1 text-[12px] text-blue-600 hover:text-blue-700 font-medium">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {roles.length === 0 ? (
                  <div className="py-14 flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <Plus className="w-6 h-6" />
                    </div>
                    <p className="text-[13px] font-semibold text-slate-700">No active boards</p>
                    <p className="text-xs text-slate-400 max-w-sm">Create a role to configure your first visual agent workflow.</p>
                    <Link href="/roles"
                      className="px-4 py-2 bg-blue-600 text-white text-[12px] font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                      + Create Role Board
                    </Link>
                  </div>
                ) : (
                  roles.slice(0, 6).map((role, idx) => (
                    <Link key={role.id} href={`/roles/${role.id}/board`}
                      className={`flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors group ${idx !== 0 ? "border-t border-slate-50" : ""}`}>
                      <div className={`w-8 h-8 rounded-xl ${DEPT_COLORS[role.department] ?? "bg-slate-400"} flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm`}>
                        {role.title.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{role.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{role.department} &bull; {role.location} &bull; {role.candidates?.length || 0} candidates</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${role.status === 'open' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {role.status.toUpperCase()}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Live Activity (1/3 width) */}
            <div>
              <h2 className="text-[14px] font-bold text-slate-900 mb-3">Recent Pipeline Activity</h2>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                {activity.length === 0 ? (
                  <div className="py-10 text-center text-slate-400">
                    <p className="text-xs">No execution history yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Run an agent on any role board to see real-time events.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {activity.map((item) => (
                      <div key={item.id} className="flex items-start gap-2.5 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${item.type === 'agent' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                          {item.type === 'agent' ? <Bot className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-slate-800 leading-snug">{item.text}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(item.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
