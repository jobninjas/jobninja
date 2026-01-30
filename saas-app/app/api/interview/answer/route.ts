import { NextRequest, NextResponse } from 'next/server';
import { InterviewOrchestrator } from '@/lib/ai-interview/orchestrator';
import { openai } from '@/lib/openai';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const sessionId = formData.get('sessionId') as string;
        const audioFile = formData.get('audio') as File;
        const textAnswer = formData.get('text') as string;

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        let finalAnswer = textAnswer;

        // Handle audio transcription if audio is provided
        if (audioFile) {
            const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

            // We need to write to a temp file or use a stream because OpenAI API expects a File object or path
            // In a serverless env, we can use the web File object if supported or a Buffer with a filename
            const transcription = await openai.audio.transcriptions.create({
                file: audioFile, // Next.js File object usually works here
                model: 'whisper-1',
            });
            finalAnswer = transcription.text;
        }

        if (!finalAnswer) {
            return NextResponse.json({ error: 'No answer provided' }, { status: 400 });
        }

        const orchestrator = new InterviewOrchestrator(sessionId);
        const result = await orchestrator.processAnswerAndGetNext(finalAnswer);

        return NextResponse.json({
            success: true,
            answerTranscript: finalAnswer,
            ...result
        });

    } catch (error) {
        console.error('Answer processing error:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
