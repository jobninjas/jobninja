import { generateObject } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';

export interface GenerateStructuredOutputOptions<T> {
  systemPrompt: string;
  input: string;
  schema: z.Schema<T>;
  modelName?: string; 
}

/**
 * Abstraction for LLM generation.
 * This guarantees structured output matching the provided Zod schema.
 */
export async function generateStructuredOutput<T>({
  systemPrompt,
  input,
  schema,
  modelName = 'llama-3.3-70b-versatile',
}: GenerateStructuredOutputOptions<T>): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is missing in server environment.');
  }

  const groq = createGroq({
    apiKey,
  });

  const { object } = await generateObject({
    model: groq(modelName),
    schema: schema,
    system: systemPrompt,
    prompt: input,
  });

  return object;
}
