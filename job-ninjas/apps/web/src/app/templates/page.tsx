import Link from "next/link";
import { ArrowLeft, ArrowRight, Star, Search, ShieldAlert, FileText, Bot, BrainCircuit, HeartHandshake, Trophy, BadgeDollarSign, Rocket, Code2 } from "lucide-react";

const AGENTS = [
  {
    name: "Sourcing Agent",
    icon: Search,
    color: "bg-blue-50 text-blue-600 border-blue-100",
    isImportant: false,
    description: "Automatically scours LinkedIn, GitHub, and Dribbble to find passive candidates that perfectly match your open job descriptions. Reaches out via customized multi-channel sequences."
  },
  {
    name: "Resume Verifier",
    icon: ShieldAlert,
    color: "bg-rose-50 text-rose-600 border-rose-100",
    isImportant: true,
    description: "Cross-references candidate resume data against public databases, LinkedIn profiles, and university records to flag timeline discrepancies, degree exaggerations, and AI-hallucinated skills."
  },
  {
    name: "Tech Assessor",
    icon: Code2,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    isImportant: true,
    description: "Generates custom take-home assignments or live coding environments based on your tech stack. Automatically grades submissions for runtime efficiency, edge-case handling, and clean architecture."
  },
  {
    name: "Interview Topic Gen",
    icon: FileText,
    color: "bg-slate-50 text-slate-700 border-slate-200",
    isImportant: false,
    description: "Reads the candidate's resume and your job description to generate a custom 45-minute interview guide for hiring managers, complete with targeted behavioral and technical questions."
  },
  {
    name: "Transcript Analyzer",
    icon: BrainCircuit,
    color: "bg-violet-50 text-violet-600 border-violet-100",
    isImportant: true,
    description: "Hooks directly into Zoom/Teams to record, transcribe, and diarize the interview. Uses LLMs to evaluate candidate answers for technical depth and flags moments of hesitation or potential copilot usage."
  },
  {
    name: "Culture Fit Interviewer",
    icon: HeartHandshake,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    isImportant: false,
    description: "An interactive voice agent that conducts initial 15-minute phone screens with candidates to assess communication skills, core values alignment, and basic logistical requirements (salary, location)."
  },
  {
    name: "Candidate Ranker",
    icon: Trophy,
    color: "bg-amber-50 text-amber-600 border-amber-100",
    isImportant: false,
    description: "Aggregates scores from the Resume Verifier, Tech Assessor, and Transcript Analyzer to generate a final weighted ranking of all candidates in the pipeline, removing human bias."
  },
  {
    name: "Offer Negotiator",
    icon: BadgeDollarSign,
    color: "bg-green-50 text-green-600 border-green-100",
    isImportant: false,
    description: "Calculates optimal offer bands based on real-time market data, candidate expectations, and internal equity. Drafts the offer letter and handles basic candidate Q&A regarding benefits."
  },
  {
    name: "Onboarding Agent",
    icon: Rocket,
    color: "bg-cyan-50 text-cyan-600 border-cyan-100",
    isImportant: false,
    description: "Triggers the moment an offer is signed. Provisions IT equipment via MDM, creates Slack/Google Workspace accounts, and sends a customized week-one schedule to the new hire."
  }
];

export default function AgentTemplatesPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-24">
      {/* Header */}
      <div className="bg-slate-900 pt-16 pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-12 text-[14px] font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">Agent Library</h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            Explore the autonomous HR agents you can drag and drop onto your hiring canvas. Combine them to build fully automated pipelines.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 -mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AGENTS.map((agent) => (
            <div key={agent.name} className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all flex flex-col relative group overflow-hidden">
              {/* Important Star */}
              {agent.isImportant && (
                <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[11px] font-bold shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Essential
                </div>
              )}

              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 shadow-sm relative ${agent.color}`}>
                <agent.icon className="w-6 h-6 relative z-10" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">{agent.name}</h3>
              <p className="text-[14px] text-slate-500 leading-relaxed flex-1">
                {agent.description}
              </p>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link href="/workflows/new" className="text-[13px] font-bold text-slate-900 flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                  Add to Canvas <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
