import { AgentDefinition } from './types';
import { ResumeIntelligenceAgent } from './implementations/resume-intelligence';
import { InterviewPlanningAgent } from './implementations/interview-planning';
import { InterviewAnalysisAgent } from './implementations/interview-analysis';
import { CandidateDecisionAgent } from './implementations/candidate-decision';
import { CandidateConciergeAgent } from './implementations/candidate-concierge';

export const AgentRegistry: Record<string, AgentDefinition> = {
  'agent-resume': ResumeIntelligenceAgent,
  'agent-resume-intel': ResumeIntelligenceAgent,
  'resume-intelligence': ResumeIntelligenceAgent,
  
  'agent-interview-plan': InterviewPlanningAgent,
  'interview-planning': InterviewPlanningAgent,
  
  'agent-interview-analysis': InterviewAnalysisAgent,
  'interview-analysis': InterviewAnalysisAgent,
  
  'agent-decision': CandidateDecisionAgent,
  'candidate-decision': CandidateDecisionAgent,
  
  'agent-concierge': CandidateConciergeAgent,
  'candidate-concierge': CandidateConciergeAgent,
};
