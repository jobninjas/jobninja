import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AgentRegistry } from '@/lib/agents/registry';
import { AgentContext } from '@/lib/agents/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentType, nodeId, roleId, candidateId, upstreamNodeIds } = body;

    if (!agentType || !roleId || !candidateId || candidateId === 'MVP-CANDIDATE') {
      return NextResponse.json(
        { error: 'Candidate required. Connect a candidate or select one before running this agent.' },
        { status: 400 }
      );
    }

    const agentDef = AgentRegistry[agentType];
    if (!agentDef) {
      return NextResponse.json(
        { error: `Agent type '${agentType}' not found in registry.` },
        { status: 404 }
      );
    }

    // Load Context
    const role = await prisma.role.findUnique({ 
      where: { id: roleId } 
    });
    
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!role || !candidate) {
      return NextResponse.json(
        { error: 'Role or Candidate not found in Database' },
        { status: 404 }
      );
    }
    
    const resolvedRoleId = role.id;
    const resolvedCandidateId = candidate.id;

    // Create AgentRun (RUNNING)
    const run = await prisma.agentRun.create({
      data: {
        organizationId: role.organizationId,
        roleId: resolvedRoleId,
        candidateId: resolvedCandidateId,
        nodeId,
        agentType,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    // Resolve Upstream Dependencies
    const upstreamOutputs: Record<string, any> = {};
    if (upstreamNodeIds && Array.isArray(upstreamNodeIds)) {
      // Find the latest successful runs for these nodes
      const upstreamRuns = await prisma.agentRun.findMany({
        where: {
          nodeId: { in: upstreamNodeIds },
          candidateId: resolvedCandidateId,
          status: 'SUCCESS',
        },
        include: { artifacts: true },
        orderBy: { completedAt: 'desc' },
      });

      // Simple implementation: map artifact types to outputs
      for (const urun of upstreamRuns) {
        for (const artifact of urun.artifacts) {
          if (!upstreamOutputs[artifact.artifactType]) {
            upstreamOutputs[artifact.artifactType] = artifact.data;
          }
        }
      }
    }

    // Validate Required Inputs
    const missingInputs = agentDef.requiredInputs.filter(
      (req) => !upstreamOutputs[req]
    );

    if (missingInputs.length > 0) {
      await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: 'ERROR',
          errorDetails: `Missing required inputs: ${missingInputs.join(', ')}`,
          completedAt: new Date(),
        },
      });
      return NextResponse.json(
        { status: 'BLOCKED', missingInputs },
        { status: 400 }
      );
    }

    // Special check for Resume Intelligence
    if (agentType === 'agent-resume' && (!candidate.resumeText || candidate.resumeText.trim() === '')) {
      await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: 'ERROR',
          errorDetails: 'Missing Resume. Upload a resume first.',
          completedAt: new Date(),
        },
      });
      return NextResponse.json(
        { status: 'MISSING_INPUT', error: 'Resume required' },
        { status: 400 }
      );
    }

    const context: AgentContext = {
      runId: run.id,
      roleId: resolvedRoleId,
      candidateId: resolvedCandidateId,
      organizationId: role.organizationId,
      nodeId,
      upstreamOutputs,
      role,
      candidate,
    };

    // Execute Agent
    try {
      const result = await agentDef.execute(context);

      // Persist Artifacts
      if (result.artifacts && result.artifacts.length > 0) {
        await prisma.agentArtifact.createMany({
          data: result.artifacts.map((a) => ({
            agentRunId: run.id,
            candidateId: resolvedCandidateId,
            artifactType: a.type,
            data: a.data,
          })),
        });
      }

      // Persist Events
      if (result.events && result.events.length > 0) {
        await prisma.agentEvent.createMany({
          data: result.events.map((e) => ({
            eventType: e.type,
            roleId: resolvedRoleId,
            candidateId: resolvedCandidateId,
            agentRunId: run.id,
            payload: e.payload,
          })),
        });
      }

      // Mark Success
      await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: 'SUCCESS',
          outputPayload: result.outputPayload,
          completedAt: new Date(),
        },
      });

      return NextResponse.json({
        runId: run.id,
        status: 'SUCCESS',
        output: result.outputPayload,
        events: result.events,
      });
    } catch (agentError: any) {
      // Mark Error
      await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: 'ERROR',
          errorDetails: agentError.message || String(agentError),
          completedAt: new Date(),
        },
      });
      return NextResponse.json(
        { status: 'ERROR', error: agentError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { status: 'ERROR', error: error.message },
      { status: 500 }
    );
  }
}
