import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get('roleId');
    const candidateId = searchParams.get('candidateId');

    if (candidateId) {
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
        include: {
          role: true,
          interviews: {
            orderBy: { createdAt: 'desc' },
          },
          artifacts: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!candidate) {
        return NextResponse.json({ success: false, error: 'Candidate not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, candidate, candidates: [candidate] });
    }

    const candidates = await prisma.candidate.findMany({
      where: roleId ? { roleId } : {},
      include: {
        role: {
          select: {
            id: true,
            title: true,
            department: true,
          },
        },
        interviews: {
          select: {
            id: true,
            status: true,
            scheduledAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, candidates });
  } catch (error: any) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { roleId, firstName, lastName, email, location, travelBudget, stage } = data;

    if (!roleId || !firstName || !lastName || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: roleId, firstName, lastName, email' },
        { status: 400 }
      );
    }

    // Resolve organizationId from role or fallback to first organization
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    let organizationId = role?.organizationId;
    if (!organizationId) {
      const defaultOrg = await prisma.organization.findFirst();
      if (!defaultOrg) {
        const newOrg = await prisma.organization.create({
          data: {
            name: 'JobNinjas Organization',
            domain: 'jobninjas.ai',
          },
        });
        organizationId = newOrg.id;
      } else {
        organizationId = defaultOrg.id;
      }
    }

    const candidate = await prisma.candidate.create({
      data: {
        roleId,
        organizationId,
        firstName,
        lastName,
        email,
        location: location || null,
        travelBudget: travelBudget ? parseFloat(String(travelBudget)) : null,
        stage: stage || 'APPLIED',
      },
      include: {
        role: true,
      },
    });

    return NextResponse.json({ success: true, candidate });
  } catch (error: any) {
    console.error('Error creating candidate:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create candidate' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json();
    const { id, firstName, lastName, email, location, resumeText, resumeUrl, stage, travelBudget } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    const updated = await prisma.candidate.update({
      where: { id },
      data: {
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(resumeText !== undefined ? { resumeText } : {}),
        ...(resumeUrl !== undefined ? { resumeUrl } : {}),
        ...(stage !== undefined ? { stage } : {}),
        ...(travelBudget !== undefined ? { travelBudget: parseFloat(String(travelBudget)) } : {}),
      },
      include: {
        role: true,
      }
    });

    return NextResponse.json({ success: true, candidate: updated });
  } catch (error: any) {
    console.error('Error updating candidate:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update candidate' },
      { status: 500 }
    );
  }
}
