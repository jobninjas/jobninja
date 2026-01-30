import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseResumeFile, cleanExtractedText } from '@/lib/ai-interview/parser';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('resume') as File;
        const jd = formData.get('jd') as string;
        const roleTitle = formData.get('roleTitle') as string;
        const userId = formData.get('userId') as string || 'default-user'; // Replace with actual auth in prod

        if (!file || !jd || !roleTitle) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const rawText = await parseResumeFile(buffer, file.type);
        const cleanedText = cleanExtractedText(rawText);

        // Save resume document
        const resumeDoc = await prisma.resumeDocument.create({
            data: {
                userId,
                originalName: file.name,
                parsedText: cleanedText,
                // Optional: Extract structured JSON here if needed
            }
        });

        // Create interview session
        const session = await prisma.interviewSession.create({
            data: {
                userId,
                resumeId: resumeDoc.id,
                jobDescription: jd,
                roleTitle: roleTitle,
                status: 'pending',
            }
        });

        return NextResponse.json({
            success: true,
            sessionId: session.id,
            message: 'Session created successfully'
        });

    } catch (error) {
        console.error('Session creation error:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
