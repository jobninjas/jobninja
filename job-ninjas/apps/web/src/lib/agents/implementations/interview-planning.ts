import { AgentDefinition } from '../types';
import { generateStructuredOutput } from '../../ai/client';
import { InterviewPlanSchema } from '../schemas/interview-plan';
import { ResumeAnalysis } from '../schemas/resume-analysis';

export const InterviewPlanningAgent: AgentDefinition = {
  id: 'agent-interview-plan',
  name: 'Interview Planning Agent',
  description: 'Generates a custom interview plan based on the job description and the candidate\'s resume analysis.',
  requiredInputs: ['ResumeAnalysis'],
  execute: async (context) => {
    const { role } = context;
    const resumeAnalysis = context.upstreamOutputs['ResumeAnalysis'] as ResumeAnalysis;

    const systemPrompt = `You are an expert technical interviewer and hiring manager.
Your task is to design a targeted 60-minute technical interview plan for this candidate.
Base your questions on the job description AND the specific strengths/gaps found in the Resume Analysis.

ROLE: ${role.title}
JOB DESCRIPTION:
${role.jobDescription}

CANDIDATE STRENGTHS:
${resumeAnalysis.strengths.join('\n')}

CANDIDATE GAPS / FOCUS AREAS:
${resumeAnalysis.interviewFocusAreas.join('\n')}
`;

    const input = `Create a detailed interview plan that targets the candidate's gaps and verifies their strengths. Ensure questions are behavioral and technical.`;

    const plan = await generateStructuredOutput({
      systemPrompt,
      input,
      schema: InterviewPlanSchema,
      modelName: 'llama-3.3-70b-versatile',
    });

    return {
      outputPayload: plan,
      artifacts: [
        {
          type: 'InterviewPlan',
          data: plan,
        },
      ],
      events: [
        {
          type: 'interview.plan_created',
          payload: { duration: plan.durationMinutes },
        },
      ],
      nextActions: ['Interview Analysis'],
    };
  },
};
