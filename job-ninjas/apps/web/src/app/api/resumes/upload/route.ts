import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
const pdfParse = require('pdf-parse');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const candidateId = formData.get('candidateId') as string;
    const file = formData.get('file') as File;

    if (!candidateId || !file) {
      return NextResponse.json({ success: false, error: 'Missing candidateId or file' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = '';

    if (file.type === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else {
      // Fallback for TXT or others
      extractedText = buffer.toString('utf-8');
    }

    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        resumeUrl: file.name, // Just store filename for MVP
        resumeText: extractedText,
      }
    });

    return NextResponse.json({ success: true, candidate: updatedCandidate });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
