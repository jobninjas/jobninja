import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [openRoles, totalRoles, totalCandidates, agentRuns, interviews, recentRuns, recentCandidates] = await Promise.all([
      prisma.role.count({ where: { status: 'open' } }),
      prisma.role.count(),
      prisma.candidate.count(),
      prisma.agentRun.count(),
      prisma.interview.count(),
      prisma.agentRun.findMany({
        take: 5,
        orderBy: { startedAt: 'desc' },
        include: {
          role: { select: { title: true } },
          candidate: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.candidate.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          role: { select: { title: true } },
        },
      }),
    ]);

    // Build unified recent activity feed
    const activity = [
      ...recentRuns.map((run) => ({
        id: run.id,
        type: 'agent',
        text: `${run.agentType.replace('agent-', '').replace('-', ' ').toUpperCase()} ran for ${run.candidate?.firstName || 'Candidate'} on ${run.role?.title || 'Role'}`,
        status: run.status,
        timestamp: run.completedAt || run.startedAt,
      })),
      ...recentCandidates.map((c) => ({
        id: c.id,
        type: 'candidate',
        text: `New applicant ${c.firstName} ${c.lastName} entered ${c.role?.title || 'General'} pipeline (${c.stage})`,
        status: 'SUCCESS',
        timestamp: c.createdAt,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

    return NextResponse.json({
      success: true,
      stats: {
        openRoles,
        totalRoles,
        totalCandidates,
        agentRuns,
        interviews,
      },
      activity,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
