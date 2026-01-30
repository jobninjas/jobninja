import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        const report = await prisma.evaluationReport.findUnique({
            where: { sessionId },
        });

        if (!report) {
            // If report doesn't exist yet, it's possible it's still generating
            return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            report
        });

    } catch (error) {
        console.error('Report fetch error:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
