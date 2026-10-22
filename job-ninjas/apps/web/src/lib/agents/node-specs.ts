export interface NodePortSpec {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

export interface NodeDescription {
  role: string;
  displayName: string;
  subtitle: string;
  description: string;
  category: 'agent' | 'input' | 'integration' | 'gate' | 'output';
  color: string;
  bg: string;
  inputs: NodePortSpec[];
  outputs: NodePortSpec[];
  defaultModel?: string;
  defaultPrompt?: string;
  sampleInput?: any;
  sampleOutput?: any;
}

export const NODE_SPECS: Record<string, NodeDescription> = {
  // ─── AI AGENTS ───
  'agent-resume': {
    role: 'agent-resume',
    displayName: 'Resume Intelligence',
    subtitle: 'Extracts, verifies, and scores candidate credentials',
    description: 'Cross-checks candidate resume against the active job description using Groq LLM to verify technical skills, detect timeline gaps, calculate match percentage, and generate targeted interview probe questions.',
    category: 'agent',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 border-indigo-200',
    inputs: [
      { name: 'candidate', type: 'Candidate', description: 'Active candidate record (name, email, location)', required: true },
      { name: 'resumeText', type: 'string', description: 'Extracted text of candidate resume', required: true },
      { name: 'role', type: 'Role', description: 'Job requisition title, requirements, and description', required: true },
    ],
    outputs: [
      { name: 'ResumeAnalysis', type: 'object', description: 'Structured verification analysis with match score, verified skills, gaps, and focus areas' },
    ],
    defaultModel: 'openai/gpt-oss-120b',
    defaultPrompt: 'You are an expert technical recruiter. Analyze the candidate resume against job requirements. Extract verified skills, flag discrepancies, and suggest interview probe questions.',
    sampleOutput: {
      candidateSummary: "5+ years experienced ML engineer specializing in RAG architectures and Python production systems.",
      overallMatch: 78,
      skills: [
        { name: "Python", status: "VERIFIED", evidence: "Led production ML pipeline implementation" },
        { name: "RAG Systems", status: "VERIFIED", evidence: "Built enterprise vector search retrieval" },
        { name: "Kubernetes", status: "PARTIAL", evidence: "Containerized deployments via Docker" }
      ],
      strengths: ["Strong NLP and RAG background", "Production deployment experience"],
      gaps: ["Limited multi-cloud Kubernetes orchestration"],
      interviewFocusAreas: ["Evaluate depth of distributed vector indexing", "Probe experience with model latency optimization"]
    }
  },

  'agent-interview-plan': {
    role: 'agent-interview-plan',
    displayName: 'Interview Planning',
    subtitle: 'Generates targeted technical and behavioral interview guides',
    description: 'Consumes upstream Resume Intelligence output to synthesize a structured 60-minute interview plan targeting candidate weak spots and verifying claims.',
    category: 'agent',
    color: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-200',
    inputs: [
      { name: 'ResumeAnalysis', type: 'ResumeAnalysis', description: 'Upstream resume verification output and focus areas', required: true },
      { name: 'role', type: 'Role', description: 'Job requirements and role competencies', required: true },
    ],
    outputs: [
      { name: 'InterviewPlan', type: 'object', description: 'Comprehensive interview agenda, section breakdown, and question sets with evaluation rubrics' },
    ],
    defaultModel: 'openai/gpt-oss-120b',
    defaultPrompt: 'Design a targeted 60-minute technical interview plan. Base your questions specifically on the candidate gaps and focus areas identified by Resume Intelligence.',
    sampleOutput: {
      objective: "Verify depth of production RAG deployment and evaluate system reliability leadership.",
      durationMinutes: 60,
      sections: [
        { title: "Architecture Deep-Dive", duration: 25, focus: "RAG pipeline scaling and latency tradeoffs" },
        { title: "Behavioral & Mentorship", duration: 20, focus: "Cross-functional engineering leadership" },
        { title: "Candidate Q&A", duration: 15, focus: "Company mission and roadmap alignment" }
      ],
      questions: [
        {
          questionText: "How did you optimize embedding retrieval latency when query volume tripled in production?",
          expectedSignals: ["Understands HNSW indexing tradeoffs", "Quantization approaches", "Caching layers"],
          redFlags: ["Only mentions standard LangChain tutorials", "No concrete production numbers"]
        }
      ]
    }
  },

  'agent-interview-analysis': {
    role: 'agent-interview-analysis',
    displayName: 'Interview Analysis',
    subtitle: 'Scores transcripts for technical rigor and communication',
    description: 'Parses raw interview transcripts against the planned interview guide. Rates candidate technical depth, communication clarity, and highlights red flags or hesitation.',
    category: 'agent',
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
    inputs: [
      { name: 'InterviewPlan', type: 'InterviewPlan', description: 'The planned interview questions and signals', required: true },
      { name: 'transcript', type: 'string', description: 'Verbatim dialogue or recorded transcript of the interview', required: true },
    ],
    outputs: [
      { name: 'InterviewAnalysis', type: 'object', description: 'Technical score, communication score, strengths demonstrated, red flags, and hiring rating' },
    ],
    defaultModel: 'openai/gpt-oss-120b',
    defaultPrompt: 'Evaluate this interview transcript against the planned interview guide. Provide objective scores for technical depth and communication, citing exact quotes.',
    sampleOutput: {
      technicalScore: 8,
      communicationScore: 9,
      strengthsDemonstrated: [
        "Articulated multi-stage RAG cache invalidation clearly",
        "Honest and transparent when asked about unknown Kubernetes ingress topics"
      ],
      redFlagsSpotted: [],
      feedbackSummary: "Strong technical candidate with clear communication. Demonstrated genuine production engineering ownership.",
      overallRecommendation: "STRONG_HIRE"
    }
  },

  'agent-decision': {
    role: 'agent-decision',
    displayName: 'Candidate Decision',
    subtitle: 'Synthesizes holistic evidence into final recommendation',
    description: 'Combines resume intelligence and interview analysis artifacts into an executive recommendation with compensation guidelines and confidence ratings.',
    category: 'agent',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    inputs: [
      { name: 'ResumeAnalysis', type: 'ResumeAnalysis', description: 'Initial resume verification artifact', required: true },
      { name: 'InterviewAnalysis', type: 'InterviewAnalysis', description: 'Post-interview evaluation artifact', required: true },
    ],
    outputs: [
      { name: 'CandidateDecision', type: 'object', description: 'Final recommendation, holistic score (0-100), compensation bracket, and hiring rationale' },
    ],
    defaultModel: 'openai/gpt-oss-120b',
    defaultPrompt: 'Synthesize all evidence from resume screening and interview evaluation into a decisive hiring recommendation with compensation guidance.',
    sampleOutput: {
      overallScore: 88,
      recommendation: "STRONG_HIRE",
      strengths: ["Exceptional RAG architecture knowledge", "Strong culture alignment", "High technical bar"],
      concerns: ["Will need ramp-up time on Kubernetes container clusters"],
      unresolvedQuestions: ["Verify exact start date availability"],
      evidenceCoverage: "100% of core technical competencies evaluated with transcript evidence",
      rationale: "Candidate exceeds bar on core LLM engineering and communication. Fits senior IC profile seamlessly.",
      confidence: 94,
      compensationRecommendation: {
        suggestedSalary: 185000,
        currency: "USD",
        notes: "Top-tier offer recommended to close candidate quickly against competing offers"
      }
    }
  },

  'agent-concierge': {
    role: 'agent-concierge',
    displayName: 'Candidate Concierge',
    subtitle: 'Autonomous travel, hotel & dining orchestration',
    description: 'Searches real hotel availability and books travel logistics for onsite candidate rounds via Ophelia Travel API within candidate budget.',
    category: 'agent',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    inputs: [
      { name: 'CandidateDecision', type: 'CandidateDecision', description: 'Approved hiring or onsite interview decision', required: true },
      { name: 'candidate', type: 'Candidate', description: 'Candidate origin location and travel preferences', required: true },
    ],
    outputs: [
      { name: 'ConciergeItinerary', type: 'object', description: 'Complete itinerary with confirmed hotel, flight details, dinner reservation, and budget utilization' },
    ],
    defaultModel: 'openai/gpt-oss-120b',
    defaultPrompt: 'Plan candidate travel, luxury hotel stay, and welcome dining within the allocated travel budget.',
    sampleOutput: {
      status: "BOOKED",
      flightDetails: {
        airline: "Delta",
        flightNumber: "DL1420",
        departure: "ATL 08:30 AM",
        arrival: "JFK 11:15 AM",
        cost: 380
      },
      hotelDetails: {
        name: "Arlo Midtown Hotel New York",
        checkIn: "2026-10-24",
        checkOut: "2026-10-25",
        cost: 310
      },
      diningReservations: [
        { restaurantName: "Ci Siamo Manhattan West", time: "7:30 PM", partySize: 2 }
      ],
      welcomeMessage: "Welcome to New York, Sarah! Your stay at Arlo Midtown is confirmed. We look forward to meeting you tomorrow.",
      totalBudgetUtilized: 690
    }
  },

  // ─── INPUT NODES ───
  'input-job-details': {
    role: 'input-job-details',
    displayName: 'Job Details',
    subtitle: 'Job requisition parameters and requirements',
    description: 'Root input node containing the open requisition title, department, location, and requirements. Automatically supplies context to downstream screening and planning agents.',
    category: 'input',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    inputs: [],
    outputs: [
      { name: 'jobDetails', type: 'object', description: 'Requisition title, requirements, department, and location' }
    ]
  },

  'entry-node': {
    role: 'entry-node',
    displayName: 'Job Requisition',
    subtitle: 'Primary role definition and ATS specs',
    description: 'Defines the primary role description, minimum qualifications, and hiring manager context.',
    category: 'input',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    inputs: [],
    outputs: [
      { name: 'jobDetails', type: 'object', description: 'Requisition title and requirements' }
    ]
  },

  'input-candidate': {
    role: 'input-candidate',
    displayName: 'Candidate Profile',
    subtitle: 'Candidate identity, contact, and stage',
    description: 'Supplies candidate metadata (name, email, current location, stage, and travel budget) to downstream agents.',
    category: 'input',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    inputs: [],
    outputs: [
      { name: 'candidate', type: 'Candidate', description: 'Candidate metadata record' }
    ]
  },

  'candidate-node': {
    role: 'candidate-node',
    displayName: 'Candidate Node',
    subtitle: 'Active candidate context',
    description: 'Supplies candidate profile data and stage status.',
    category: 'input',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    inputs: [],
    outputs: [
      { name: 'candidate', type: 'Candidate', description: 'Candidate profile record' }
    ]
  },

  'input-resume': {
    role: 'input-resume',
    displayName: 'Resume Document',
    subtitle: 'Parsed PDF / DOCX resume file',
    description: 'Contains parsed text and metadata from the candidate resume upload.',
    category: 'input',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    inputs: [
      { name: 'candidate', type: 'Candidate', description: 'Candidate to whom resume belongs', required: true }
    ],
    outputs: [
      { name: 'resumeText', type: 'string', description: 'Extracted text content of resume' }
    ]
  },

  'input-transcript': {
    role: 'input-transcript',
    displayName: 'Interview Transcript',
    subtitle: 'Dialogue transcript from video / phone screen',
    description: 'Provides verbatim transcript text from Zoom, Teams, or recorded interview sessions.',
    category: 'input',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    inputs: [
      { name: 'candidate', type: 'Candidate', description: 'Candidate being interviewed', required: true }
    ],
    outputs: [
      { name: 'transcript', type: 'string', description: 'Verbatim transcript text' }
    ]
  },

  // ─── INTEGRATIONS ───
  'integration-ophelia': {
    role: 'integration-ophelia',
    displayName: 'Ophelia Travel API',
    subtitle: 'Live hotel availability & booking engine',
    description: 'Connects directly to the Ophelia luxury lodging and venue booking API for candidate travel arrangements.',
    category: 'integration',
    color: 'text-orange-600',
    bg: 'bg-orange-50 border-orange-200',
    inputs: [
      { name: 'location', type: 'string', description: 'Destination city', required: true },
      { name: 'dates', type: 'object', description: 'Check-in and check-out dates', required: true }
    ],
    outputs: [
      { name: 'hotelOptions', type: 'array', description: 'List of available luxury venues with pricing and real-time availability IDs' }
    ]
  },

  // ─── HUMAN GATES ───
  'gate-shortlist': {
    role: 'gate-shortlist',
    displayName: 'Recruiter Shortlist Gate',
    subtitle: 'Human approval before advancing to interviews',
    description: 'Halts autonomous execution until a human recruiter reviews and approves the Resume Intelligence score.',
    category: 'gate',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    inputs: [
      { name: 'ResumeAnalysis', type: 'object', description: 'Resume screening result to review', required: true }
    ],
    outputs: [
      { name: 'approved', type: 'boolean', description: 'Human approval flag' }
    ]
  },

  'gate-final': {
    role: 'gate-final',
    displayName: 'Hiring Committee Approval',
    subtitle: 'Executive sign-off on offer decision',
    description: 'Human gate requiring VP of Engineering or Hiring Manager approval before releasing offer and trigger concierge travel.',
    category: 'gate',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    inputs: [
      { name: 'CandidateDecision', type: 'object', description: 'Synthesized hiring decision', required: true }
    ],
    outputs: [
      { name: 'offerApproved', type: 'boolean', description: 'Offer authorization flag' }
    ]
  }
};

export function getNodeSpec(role?: any): NodeDescription {
  if (!role || typeof role !== 'string') {
    return {
      role: 'custom-agent',
      displayName: 'Custom Agent',
      subtitle: 'Configurable autonomous worker',
      description: 'Executes customized prompting and logic against candidate records.',
      category: 'agent',
      color: 'text-slate-600',
      bg: 'bg-slate-50 border-slate-200',
      inputs: [],
      outputs: [{ name: 'output', type: 'object', description: 'Result payload' }]
    };
  }
  return NODE_SPECS[role] || {
    role,
    displayName: role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    subtitle: 'Autonomous pipeline step',
    description: 'Configurable recruitment automation node.',
    category: role.startsWith('agent-') ? 'agent' : role.startsWith('input-') ? 'input' : 'integration',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 border-indigo-200',
    inputs: [],
    outputs: [{ name: 'output', type: 'object', description: 'Result payload' }]
  };
}
