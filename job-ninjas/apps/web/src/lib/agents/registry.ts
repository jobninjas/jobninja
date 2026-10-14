import { AgentDefinition } from './types';
import { ResumeIntelligenceAgent } from './implementations/resume-intelligence';
import { InterviewPlanningAgent } from './implementations/interview-planning';
import { InterviewAnalysisAgent } from './implementations/interview-analysis';
import { CandidateDecisionAgent } from './implementations/candidate-decision';
import { CandidateConciergeAgent } from './implementations/candidate-concierge';

export const AgentRegistry: Record<string, AgentDefinition> = {
  'agent-resume': ResumeIntelligenceAgent,
  'agent-interview-plan': InterviewPlanningAgent,
  'agent-interview-analysis': InterviewAnalysisAgent,
  'agent-decision': CandidateDecisionAgent,
  'agent-concierge': CandidateConciergeAgent,
};
