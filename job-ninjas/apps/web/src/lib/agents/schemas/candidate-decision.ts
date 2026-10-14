import { z } from 'zod';

export const CandidateDecisionSchema = z.object({
  overallScore: z.number().min(0).max(100).describe("Overall holistic score based on resume and interview (0-100)"),
  recommendation: z.enum(['STRONG_HIRE', 'HIRE', 'NEEDS_REVIEW', 'NO_HIRE']).describe("The AI's advisory recommendation for the recruiter"),
  strengths: z.array(z.string()).describe("Key strengths synthesized from all previous artifacts"),
  concerns: z.array(z.string()).describe("Any concerns or weak points observed"),
  unresolvedQuestions: z.array(z.string()).describe("Questions that remain unanswered after the interview"),
  evidenceCoverage: z.string().describe("Summary of how well the provided evidence supports the recommendation"),
  rationale: z.string().describe("Detailed justification for the recommendation"),
  confidence: z.number().min(0).max(100).describe("AI confidence in this recommendation (0-100)"),
  compensationRecommendation: z.object({
    suggestedSalary: z.number(),
    currency: z.string(),
    notes: z.string().optional()
  }).optional().describe("Suggested compensation based on performance and market")
});

export type CandidateDecision = z.infer<typeof CandidateDecisionSchema>;
