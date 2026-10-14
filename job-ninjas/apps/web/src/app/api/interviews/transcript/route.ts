import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { interviewId, transcriptText } = await req.json();

    if (!interviewId || !transcriptText) {
      return NextResponse.json({ success: false, error: 'Missing interviewId or transcriptText' }, { status: 400 });
    }

    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        transcriptText,
        status: 'COMPLETED'
      }
    });

    return NextResponse.json({ success: true, interview: updatedInterview });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
