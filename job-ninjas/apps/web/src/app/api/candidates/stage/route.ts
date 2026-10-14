import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { candidateId, stage } = await req.json();

    if (!candidateId || !stage) {
      return NextResponse.json({ success: false, error: 'Missing candidateId or stage' }, { status: 400 });
    }

    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: { stage }
    });

    return NextResponse.json({ success: true, candidate: updatedCandidate });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
