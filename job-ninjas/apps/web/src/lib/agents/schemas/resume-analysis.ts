import { z } from 'zod';

export const ResumeAnalysisSchema = z.object({
  candidateSummary: z.string().describe("A brief 2-3 sentence professional summary of the candidate."),
  skills: z.array(
    z.object({
      name: z.string(),
      status: z.enum(['VERIFIED', 'PARTIAL', 'NOT_FOUND']),
      evidence: z.string().describe("Snippet from resume proving this skill, or 'Not mentioned'"),
    })
  ).describe("Key skills extracted from the resume and verified against job requirements."),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      duration: z.string(),
      relevanceScore: z.number().min(1).max(10),
    })
  ),
  requirements: z.object({
    meetsBasic: z.boolean(),
    missingBasic: z.array(z.string()).describe("List of missing basic requirements, or empty array if none"),
  }),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  overallMatch: z.number().min(1).max(100),
  interviewFocusAreas: z.array(z.string()).describe("Topics the interviewer should probe deeper on based on resume gaps or impressive claims."),
});

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;
