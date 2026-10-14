import { AgentDefinition } from '../types';
import { generateStructuredOutput } from '../../ai/client';
import { CandidateDecisionSchema } from '../schemas/candidate-decision';
import { ResumeAnalysis } from '../schemas/resume-analysis';
import { InterviewAnalysis } from '../schemas/interview-analysis';

export const CandidateDecisionAgent: AgentDefinition = {
  id: 'agent-decision',
  name: 'Candidate Evidence Synthesis Agent',
  description: 'Synthesizes resume and interview analyses to generate a comprehensive hiring recommendation for the recruiter.',
  requiredInputs: ['ResumeAnalysis', 'InterviewAnalysis'],
  execute: async (context) => {
    const { candidate, role } = context;
    const resumeAnalysis = context.upstreamOutputs['ResumeAnalysis'] as ResumeAnalysis;
    const interviewAnalysis = context.upstreamOutputs['InterviewAnalysis'] as InterviewAnalysis;

    const systemPrompt = `You are an expert hiring committee advisor for JobNinjas.
Your job is to synthesize all available evidence for a candidate and provide a comprehensive recommendation to the human recruiter.
You do NOT make the final decision. You provide advisory support (STRONG_HIRE, HIRE, NEEDS_REVIEW, or NO_HIRE).

Role Requirements:
Title: ${role.title}
Department: ${role.department || 'Engineering'}
Required Skills: ${(role.requirements as string[])?.join(', ') || 'Not specified'}

Candidate Context:
Name: ${candidate.firstName} ${candidate.lastName}
Resume Score: ${resumeAnalysis.overallScore} / 100
Interview Score: ${interviewAnalysis.overallScore} / 100

Resume Analysis:
${JSON.stringify(resumeAnalysis, null, 2)}

Interview Analysis:
${JSON.stringify(interviewAnalysis, null, 2)}`;

    const input = `Evaluate the candidate and provide a final synthesis recommendation. Are they a good fit?`;

    const decision = await generateStructuredOutput({
      systemPrompt,
      input,
      schema: CandidateDecisionSchema,
      modelName: 'llama-3.3-70b-versatile',
    });

    return {
      outputPayload: decision,
      artifacts: [
        {
          type: 'CandidateDecision',
          data: decision,
        },
      ],
      events: [
        {
          type: 'candidate.recommendation_ready',
          payload: { recommendation: decision.recommendation, confidence: decision.confidence },
        },
      ],
    };
  },
};
