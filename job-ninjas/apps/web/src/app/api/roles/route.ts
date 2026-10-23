import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        candidates: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            stage: true,
          },
        },
        boards: {
          select: {
            id: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, roles });
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { title, department, location, hiringManager, jobDescription } = data;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Job title is required' },
        { status: 400 }
      );
    }

    // Resolve or create default organization
    let organization = await prisma.organization.findFirst();
    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: 'JobNinjas Organization',
          domain: 'jobninjas.ai',
        },
      });
    }

    const role = await prisma.role.create({
      data: {
        organizationId: organization.id,
        title,
        department: department || 'Engineering',
        location: location || 'Remote',
        hiringManager: hiringManager || 'Hiring Manager',
        jobDescription: jobDescription || '',
        status: 'open',
      },
    });

    // Automatically initialize an empty board record for this role
    await prisma.board.create({
      data: {
        organizationId: organization.id,
        roleId: role.id,
        layers: JSON.stringify({}),
        layerIds: JSON.stringify([]),
        edges: JSON.stringify({}),
        edgeIds: JSON.stringify([]),
      },
    });

    return NextResponse.json({ success: true, role });
  } catch (error: any) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create role' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json();
    const { id, title, department, location, hiringManager, jobDescription, status } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Role ID is required for update' },
        { status: 400 }
      );
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(department !== undefined ? { department } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(hiringManager !== undefined ? { hiringManager } : {}),
        ...(jobDescription !== undefined ? { jobDescription } : {}),
        ...(status !== undefined ? { status } : {}),
      },
    });

    return NextResponse.json({ success: true, role: updatedRole });
  } catch (error: any) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update role' },
      { status: 500 }
    );
  }
}
