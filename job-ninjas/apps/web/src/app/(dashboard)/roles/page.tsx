"use client";

import Link from "next/link";
import {
  Plus, X, LayoutGrid, List, ChevronDown,
  Star, MoreHorizontal, Users, Clock, Search, Filter, Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RoleRecord {
  id: string;
  title: string;
  department: string;
  location: string;
  hiringManager: string;
  jobDescription?: string;
  status: string;
  createdAt: string;
  candidates?: any[];
  boards?: any[];
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

function getBoardColor(dept: string) {
  return DEPT_COLORS[dept] ?? "bg-slate-400";
}

function timeAgo(iso: string) {
  if (!iso) return "recently";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/roles');
      const data = await res.json();
      if (data.success && data.roles) {
        setRoles(data.roles);
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    hiringManager: "",
    jobDescription: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    try {
      setCreating(true);
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && data.role) {
        setRoles((prev) => [data.role, ...prev]);
        setIsModalOpen(false);
        setFormData({
          title: "",
          department: "",
          location: "",
          hiringManager: "",
          jobDescription: "",
        });
        router.push(`/roles/${data.role.id}/board`);
      } else {
        alert(data.error || 'Failed to create role');
      }
    } catch (err: any) {
      alert('Error creating role: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const filtered = roles.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    const matchesDept =
      departmentFilter === "all" || r.department.toLowerCase() === departmentFilter.toLowerCase();
    return matchesSearch && matchesDept;
  });

  return (
    <div className="p-6 max-w-full font-sans">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Job Roles & Workflows</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Manage live hiring pipelines, agent DAGs, and candidates.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Create Role
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mr-1">
          <Filter className="w-3.5 h-3.5" />
          Filter by
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="text-[12px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 outline-none hover:bg-slate-50 cursor-pointer"
        >
          <option value="all">All departments</option>
          {Object.keys(DEPT_COLORS).map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles..."
              className="text-[12px] text-slate-700 outline-none w-44 placeholder-slate-400 bg-transparent"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
            <button onClick={() => setViewMode("grid")}
              className={`p-1.5 transition-colors ${viewMode === "grid" ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("list")}
              className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading roles from database...</p>
        </div>
      ) : (
        <>
          {/* LIST VIEW */}
          {viewMode === "list" && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_40px] gap-4 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                {["Role & Pipeline", "Candidates", "Department", "Status", "Created", ""].map((h) => (
                  <span key={h} className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{h}</span>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">No roles found</p>
                  <p className="text-xs text-slate-400">Create a role to launch your first hiring operating system.</p>
                  <button onClick={() => setIsModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    + Create Role
                  </button>
                </div>
              ) : (
                filtered.map((role) => (
                  <div key={role.id}
                    className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_40px] gap-4 px-4 py-3.5 border-b border-slate-50 hover:bg-slate-50/70 transition-colors group items-center">

                    {/* Name */}
                    <Link href={`/roles/${role.id}/board`} className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl ${getBoardColor(role.department)} flex items-center justify-center text-white text-[12px] font-bold shrink-0 shadow-sm`}>
                        {role.title.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{role.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{role.location} &bull; Manager: {role.hiringManager}</p>
                      </div>
                    </Link>

                    {/* Candidates count */}
                    <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-700">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{role.candidates?.length || 0} in pipeline</span>
                    </div>

                    {/* Department */}
                    <span className="text-[12px] text-slate-600 truncate">{role.department || "General"}</span>

                    {/* Status */}
                    <span className={`inline-flex w-fit items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full
                      ${role.status === "open" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        role.status === "closed" ? "bg-red-50 text-red-600 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${role.status === "open" ? "bg-emerald-500" : role.status === "closed" ? "bg-red-400" : "bg-amber-400"}`}></span>
                      {role.status.toUpperCase()}
                    </span>

                    {/* Created */}
                    <span className="text-[12px] text-slate-500">{timeAgo(role.createdAt)}</span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setStarred((s) => { const n = new Set(s); n.has(role.id) ? n.delete(role.id) : n.add(role.id); return n; })}
                        className="p-1 rounded hover:bg-slate-200 transition-colors">
                        <Star className={`w-3.5 h-3.5 ${starred.has(role.id) ? "fill-amber-400 text-amber-400" : "text-slate-400"}`} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* GRID VIEW */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <button onClick={() => setIsModalOpen(true)}
                className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 transition-colors flex flex-col items-center justify-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                  <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <span className="text-[13px] font-medium text-slate-500 group-hover:text-blue-600 transition-colors">Create new role</span>
              </button>

              {filtered.map((role) => (
                <Link key={role.id} href={`/roles/${role.id}/board`}
                  className="aspect-[4/3] rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md hover:border-slate-300 transition-all group flex flex-col">
                  <div className={`flex-1 ${getBoardColor(role.department)} opacity-85 flex items-center justify-center relative p-4 text-white`}>
                    <span className="text-4xl font-extrabold opacity-30 absolute">{role.title.charAt(0)}</span>
                    <span className="text-xs font-bold uppercase tracking-wider bg-black/20 px-2.5 py-1 rounded-full backdrop-blur-sm z-10">
                      {role.department}
                    </span>
                  </div>
                  <div className="p-3.5 flex items-center gap-2.5 border-t border-slate-100 bg-white">
                    <div className={`w-7 h-7 rounded-lg ${getBoardColor(role.department)} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                      {role.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-slate-900 truncate">{role.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{role.candidates?.length || 0} candidates &bull; {timeAgo(role.createdAt)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-[15px] font-bold text-slate-900">Create New Hiring Pipeline</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Job Title *</label>
                <input required type="text" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-[13px] text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                  placeholder="e.g. Senior Backend Architect" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Department *</label>
                  <select required value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-[13px] text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select Department...</option>
                    {Object.keys(DEPT_COLORS).map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Location *</label>
                  <input required type="text" value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-[13px] text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                    placeholder="New York, NY or Remote" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Hiring Manager *</label>
                <input required type="text" value={formData.hiringManager}
                  onChange={(e) => setFormData({ ...formData, hiringManager: e.target.value })}
                  className="w-full px-3 py-2 text-[13px] text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                  placeholder="e.g. Alex Mercer" />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Job Description & Requirements</label>
                <textarea rows={3} value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  className="w-full px-3 py-2 text-[13px] text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-slate-400"
                  placeholder="Summarize key requirements and qualifications..." />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="px-5 py-2 text-[13px] font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Role Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
