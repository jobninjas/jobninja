import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await params;

    const board = await prisma.board.findUnique({
      where: { roleId },
    });

    if (!board) {
      // Return a clean, empty canvas layout ready for the recruiter to build
      return NextResponse.json({
        roleId,
        layers: {},
        layerIds: [],
        edges: {},
        edgeIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      ...board,
      layers: typeof board.layers === 'string' ? JSON.parse(board.layers) : board.layers,
      layerIds: typeof board.layerIds === 'string' ? JSON.parse(board.layerIds) : board.layerIds,
      edges: typeof board.edges === 'string' ? JSON.parse(board.edges || '{}') : (board.edges || {}),
      edgeIds: typeof board.edgeIds === 'string' ? JSON.parse(board.edgeIds || '[]') : (board.edgeIds || []),
    });
  } catch (error: any) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch board' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await params;
    const body = await request.json();
    const { layers, layerIds, edges, edgeIds } = body;

    // Resolve organizationId from role or fallback to default organization
    let organizationId: string | null = null;
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (role) {
      organizationId = role.organizationId;
    } else {
      let defaultOrg = await prisma.organization.findFirst();
      if (!defaultOrg) {
        defaultOrg = await prisma.organization.create({
          data: {
            name: 'JobNinjas Organization',
            domain: 'jobninjas.ai',
          },
        });
      }
      organizationId = defaultOrg.id;
    }

    const board = await prisma.board.upsert({
      where: { roleId },
      update: {
        layers: JSON.stringify(layers || {}),
        layerIds: JSON.stringify(layerIds || []),
        edges: JSON.stringify(edges || {}),
        edgeIds: JSON.stringify(edgeIds || []),
      },
      create: {
        roleId,
        organizationId,
        layers: JSON.stringify(layers || {}),
        layerIds: JSON.stringify(layerIds || []),
        edges: JSON.stringify(edges || {}),
        edgeIds: JSON.stringify(edgeIds || []),
      },
    });

    return NextResponse.json({ success: true, boardId: board.id });
  } catch (error: any) {
    console.error('Error saving board:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save board' },
      { status: 500 }
    );
  }
}
