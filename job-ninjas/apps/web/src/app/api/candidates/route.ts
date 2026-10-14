import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const candidate = await prisma.candidate.create({
      data: {
        roleId: data.roleId,
        organizationId: 'org_demo', // mock for now if no auth
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        location: data.location || null,
        travelBudget: data.travelBudget || null,
        stage: 'APPLIED',
      }
    });
    return NextResponse.json({ success: true, candidate });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
