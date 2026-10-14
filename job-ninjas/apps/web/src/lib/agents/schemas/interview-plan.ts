import { z } from 'zod';

export const InterviewPlanSchema = z.object({
  objective: z.string().describe("The primary goal of this interview round"),
  durationMinutes: z.number(),
  sections: z.array(
    z.object({
      title: z.string(),
      duration: z.number(),
      focus: z.string(),
    })
  ),
  questions: z.array(
    z.object({
      questionText: z.string(),
      expectedSignals: z.array(z.string()).describe("What a strong answer should demonstrate"),
      redFlags: z.array(z.string()).describe("Warning signs in the candidate's response"),
    })
  )
});

export type InterviewPlan = z.infer<typeof InterviewPlanSchema>;
