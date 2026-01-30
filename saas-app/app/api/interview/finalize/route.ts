import { NextRequest, NextResponse } from 'next/server';
import { InterviewOrchestrator } from '@/lib/ai-interview/orchestrator';

export async function POST(req: NextRequest) {
    try {
        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        const orchestrator = new InterviewOrchestrator(sessionId);
        const report = await orchestrator.finalizeAndGenerateReport();

        return NextResponse.json({
            success: true,
            report
        });

    } catch (error) {
        console.error('Finalization error:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
