import { AgentDefinition } from '../types';
import { generateStructuredOutput } from '../../ai/client';
import { InterviewAnalysisSchema } from '../schemas/interview-analysis';
import { InterviewPlan } from '../schemas/interview-plan';
import prisma from '../../prisma';

export const InterviewAnalysisAgent: AgentDefinition = {
  id: 'agent-interview-analysis',
  name: 'Interview Analysis Agent',
  description: 'Analyzes interview transcripts to score the candidate based on the interview plan.',
  requiredInputs: ['InterviewPlan'],
  execute: async (context) => {
    const { candidate } = context;
    const interviewPlan = context.upstreamOutputs['InterviewPlan'] as InterviewPlan;

    // Fetch the transcript for the candidate
    const interview = await prisma.interview.findFirst({
      where: { candidateId: candidate.id }
    });

    if (!interview || !interview.transcriptText) {
      throw new Error("No interview transcript found for this candidate.");
    }

    const systemPrompt = `You are an expert technical interviewer evaluating a candidate's transcript.
You must grade them against the provided INTERVIEW PLAN.
Look for the expected signals and penalize for red flags.

INTERVIEW PLAN:
${JSON.stringify(interviewPlan, null, 2)}
`;

    const input = `CANDIDATE TRANSCRIPT:
${interview.transcriptText}

Evaluate this transcript and provide a structured analysis.`;

    const analysis = await generateStructuredOutput({
      systemPrompt,
      input,
      schema: InterviewAnalysisSchema,
      modelName: 'llama-3.3-70b-versatile',
    });

    return {
      outputPayload: analysis,
      artifacts: [
        {
          type: 'InterviewAnalysis',
          data: analysis,
        },
      ],
      events: [
        {
          type: 'interview.analysis_completed',
          payload: { recommendation: analysis.overallRecommendation },
        },
      ],
      nextActions: ['Candidate Decision'],
    };
  },
};
