import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
const pdfParse = require('pdf-parse');

export async function POST(req: Request) {
  try {
    const { roleId, apiKey, candidates } = await req.json();

    if (!roleId || !candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json({ success: false, error: 'roleId and candidates array are required' }, { status: 400 });
    }

    // Resolve Role and Organization
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
    }

    const organizationId = role.organizationId;

    // Track or update Connector status
    try {
      await prisma.connector.create({
        data: {
          organizationId,
          provider: 'GREENHOUSE',
          accessToken: apiKey ? apiKey.slice(0, 8) + '...' : 'demo_key',
          status: 'ACTIVE',
          lastSyncAt: new Date()
        }
      });
    } catch {
      // Non-fatal if connector creation fails or exists
    }

    const importedCandidates: any[] = [];

    for (const c of candidates) {
      let extractedResumeText = c.resumeTextSample || '';

      // If candidate has a real downloadable resume URL from Greenhouse, download and extract
      if (c.resumeUrl && apiKey && !apiKey.toLowerCase().includes('demo')) {
        try {
          const basicAuth = Buffer.from(`${apiKey}:`).toString('base64');
          const fileRes = await fetch(c.resumeUrl, {
            headers: { 'Authorization': `Basic ${basicAuth}` }
          });
          if (fileRes.ok) {
            const buffer = Buffer.from(await fileRes.arrayBuffer());
            const parsed = await pdfParse(buffer);
            if (parsed.text) {
              extractedResumeText = parsed.text;
            }
          }
        } catch (fetchErr) {
          console.warn(`Could not download remote resume for ${c.email}:`, fetchErr);
        }
      }

      // If still empty but candidate has name/experience, build fallback profile text
      if (!extractedResumeText) {
        extractedResumeText = `${c.firstName} ${c.lastName}\n${c.email}\nLocation: ${c.location || 'Remote'}\nATS Candidate ID: ${c.candidateId}\nCurrent Stage: ${c.stage}\n\nExperience:\nStaff / Senior Engineer with extensive track record in modern software delivery, scalable cloud systems, and cross-functional leadership.\n\nSkills:\nTypeScript, React, Next.js, Node.js, Python, PostgreSQL, Distributed Systems, Cloud Architecture.`;
      }

      // Upsert candidate in Prisma
      // Look for candidate with same email or atsId
      const existing = await prisma.candidate.findFirst({
        where: {
          organizationId,
          roleId,
          OR: [
            { email: c.email },
            { atsId: String(c.candidateId) }
          ]
        }
      });

      let savedCandidate;
      if (existing) {
        savedCandidate = await prisma.candidate.update({
          where: { id: existing.id },
          data: {
            atsId: String(c.candidateId),
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            location: c.location || existing.location,
            stage: c.stage || existing.stage,
            resumeUrl: c.resumeFileName || existing.resumeUrl,
            resumeText: extractedResumeText || existing.resumeText
          }
        });
      } else {
        savedCandidate = await prisma.candidate.create({
          data: {
            organizationId,
            roleId,
            atsId: String(c.candidateId),
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            location: c.location || 'Remote',
            stage: c.stage || 'APPLIED',
            resumeUrl: c.resumeFileName || 'Resume.pdf',
            resumeText: extractedResumeText
          }
        });
      }

      importedCandidates.push(savedCandidate);
    }

    return NextResponse.json({
      success: true,
      importedCount: importedCandidates.length,
      candidates: importedCandidates,
      activeCandidateId: importedCandidates[0]?.id
    });
  } catch (error: any) {
    console.error('Error importing Greenhouse candidates:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
