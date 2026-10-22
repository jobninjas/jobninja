import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

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

    let pdfParse: any = null;
    try {
      pdfParse = require('pdf-parse');
    } catch (e) {
      console.warn('pdf-parse failed to load, falling back to text parsing');
    }

    if (file.type === 'application/pdf' && pdfParse) {
      try {
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData?.text || '';
      } catch (parseErr) {
        console.warn('PDF parsing error, falling back to buffer string:', parseErr);
        extractedText = buffer.toString('utf-8');
      }
    } else {
      extractedText = buffer.toString('utf-8');
    }

    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        resumeUrl: file.name,
        resumeText: extractedText,
      }
    });

    return NextResponse.json({ success: true, candidate: updatedCandidate });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
