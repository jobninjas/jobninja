import { AgentDefinition } from '../types';
import { generateStructuredOutput } from '../../ai/client';
import { ResumeAnalysisSchema } from '../schemas/resume-analysis';

export const ResumeIntelligenceAgent: AgentDefinition = {
  id: 'agent-resume',
  name: 'Resume Intelligence Agent',
  description: 'Analyzes a candidate resume against job requirements to output structured verification data.',
  requiredInputs: [], // In MVP, we fetch directly from the candidate's DB record for simplicity, though normally this would be an upstream "Input Resume" artifact.
  execute: async (context) => {
    const { role, candidate } = context;

    if (!candidate.resumeText) {
      throw new Error("Candidate does not have resume text available. Please upload a resume first.");
    }

    const systemPrompt = `You are an expert technical recruiter and resume screener.
You will receive a job description and a candidate's parsed resume.
Analyze the resume rigidly against the job requirements.
Extract skills, verify experience, identify gaps, and recommend interview focus areas.

JOB DESCRIPTION:
${role.jobDescription}

ROLE: ${role.title} (${role.department})
`;

    const input = `CANDIDATE RESUME:
${candidate.resumeText}
`;

    const analysis = await generateStructuredOutput({
      systemPrompt,
      input,
      schema: ResumeAnalysisSchema,
      modelName: 'llama-3.3-70b-versatile',
    });

    return {
      outputPayload: analysis,
      artifacts: [
        {
          type: 'ResumeAnalysis',
          data: analysis,
        },
      ],
      events: [
        {
          type: 'resume.analysis_completed',
          payload: { score: analysis.overallMatch },
        },
      ],
      nextActions: ['Interview Planning'],
    };
  },
};
