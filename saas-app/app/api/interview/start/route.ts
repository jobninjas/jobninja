import { NextRequest, NextResponse } from 'next/server';
import { InterviewOrchestrator } from '@/lib/ai-interview/orchestrator';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        const orchestrator = new InterviewOrchestrator(sessionId);
        const firstQuestion = await orchestrator.generateInitialQuestion();

        await prisma.interviewSession.update({
            where: { id: sessionId },
            data: { status: 'active' }
        });

        return NextResponse.json({
            success: true,
            ...firstQuestion
        });

    } catch (error) {
        console.error('Interview start error:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
