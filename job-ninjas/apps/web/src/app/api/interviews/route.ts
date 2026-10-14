import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { candidateId, title, scheduledAt } = await req.json();

    if (!candidateId) {
      return NextResponse.json({ success: false, error: 'Missing candidateId' }, { status: 400 });
    }

    const interview = await prisma.interview.create({
      data: {
        candidateId,
        title: title || 'Technical Interview',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        status: 'SCHEDULED'
      }
    });

    return NextResponse.json({ success: true, interview });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
