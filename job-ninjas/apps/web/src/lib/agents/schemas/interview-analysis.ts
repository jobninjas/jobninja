import { z } from 'zod';

export const InterviewAnalysisSchema = z.object({
  technicalScore: z.number().min(1).max(10),
  communicationScore: z.number().min(1).max(10),
  strengthsDemonstrated: z.array(z.string()),
  redFlagsSpotted: z.array(z.string()).optional(),
  feedbackSummary: z.string(),
  overallRecommendation: z.enum(['STRONG_HIRE', 'HIRE', 'LEAN_HIRE', 'NO_HIRE']),
});

export type InterviewAnalysis = z.infer<typeof InterviewAnalysisSchema>;
