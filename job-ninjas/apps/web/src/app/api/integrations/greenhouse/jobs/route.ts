import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Harvest API Key is required' }, { status: 400 });
    }

    // Demo / Sandbox jobs
    if (apiKey.toLowerCase() === 'demo' || apiKey.toLowerCase() === 'test') {
      return NextResponse.json({
        success: true,
        jobs: [
          { id: 'gh-job-101', name: 'Lead Full-Stack Engineer', department: 'Engineering', status: 'open' },
          { id: 'gh-job-102', name: 'Senior AI/ML Engineer', department: 'AI Research', status: 'open' },
          { id: 'gh-job-103', name: 'Principal Cloud Architect', department: 'Infrastructure', status: 'open' },
          { id: 'gh-job-104', name: 'Staff Product Designer', department: 'Product', status: 'open' },
        ]
      });
    }

    // Real Greenhouse Harvest API v3
    const basicAuth = Buffer.from(`${apiKey}:`).toString('base64');
    const ghRes = await fetch('https://harvest.greenhouse.io/v3/jobs?status=open&per_page=50', {
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!ghRes.ok) {
      const errText = await ghRes.text();
      return NextResponse.json({ success: false, error: `Failed to fetch Greenhouse jobs: ${errText}` }, { status: ghRes.status });
    }

    const ghJobs = await ghRes.json();
    const formattedJobs = ghJobs.map((job: any) => ({
      id: String(job.id),
      name: job.name,
      department: job.departments?.[0]?.name || 'General',
      status: job.status
    }));

    return NextResponse.json({ success: true, jobs: formattedJobs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
