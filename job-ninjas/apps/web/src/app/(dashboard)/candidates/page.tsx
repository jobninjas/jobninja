"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Loader2, ArrowRight, Briefcase, Mail, MapPin, Plus } from "lucide-react";
import Link from "next/link";

interface CandidateRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  location?: string;
  stage: string;
  createdAt: string;
  role?: {
    id: string;
    title: string;
    department: string;
  };
  interviews?: any[];
}

const STAGE_COLORS: Record<string, string> = {
  APPLIED: "bg-blue-50 text-blue-700 border-blue-200",
  SCREENING: "bg-violet-50 text-violet-700 border-violet-200",
  SHORTLISTED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  INTERVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  OFFER: "bg-purple-50 text-purple-700 border-purple-200",
  HIRED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function CandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/candidates');
      const data = await res.json();
      if (data.success && data.candidates) {
        setCandidates(data.candidates);
      }
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const filtered = candidates.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.role?.title && c.role.title.toLowerCase().includes(search.toLowerCase()));
    const matchesStage = stageFilter === "all" || c.stage.toUpperCase() === stageFilter.toUpperCase();
    return matchesSearch && matchesStage;
  });

  return (
    <div className="p-6 max-w-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Candidates</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Real applicant records synced across all role pipelines.</p>
        </div>
        <Link
          href="/roles"
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Briefcase className="w-4 h-4" />
          View Role Pipelines
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates, emails, roles..."
            className="text-[12px] text-slate-700 outline-none w-60 placeholder-slate-400 bg-transparent"
          />
        </div>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="text-[12px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 outline-none hover:bg-slate-50 cursor-pointer"
        >
          <option value="all">All stages</option>
          <option value="APPLIED">Applied</option>
          <option value="SCREENING">Screening</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OFFER">Offer</option>
          <option value="HIRED">Hired</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading candidate records...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Candidate Name</th>
                <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Applied Role</th>
                <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Stage</th>
                <th scope="col" className="px-6 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filtered.map((candidate) => (
                <tr
                  key={candidate.id}
                  onClick={() => router.push(`/candidates/${candidate.id}/interview`)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {candidate.firstName?.[0] || 'C'}{candidate.lastName?.[0] || ''}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {candidate.firstName} {candidate.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {candidate.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-[12px] font-medium text-slate-700">
                      {candidate.role?.title || 'General Pipeline'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {candidate.role?.department || 'Operations'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[12px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {candidate.location || 'Remote'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${STAGE_COLORS[candidate.stage.toUpperCase()] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {candidate.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-[12px] text-slate-400 group-hover:text-blue-600 font-medium">
                    <span className="inline-flex items-center gap-1">
                      Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">No candidates in pipeline</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                      Candidates can be added directly inside any Role Board canvas or through the Candidate Manager tool.
                    </p>
                    <Link
                      href="/roles"
                      className="px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-block"
                    >
                      Go to Roles
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
