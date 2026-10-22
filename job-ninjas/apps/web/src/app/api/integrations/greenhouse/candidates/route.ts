import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { apiKey, jobId } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Harvest API Key is required' }, { status: 400 });
    }

    // Demo / Sandbox candidates
    if (apiKey.toLowerCase() === 'demo' || apiKey.toLowerCase() === 'test') {
      return NextResponse.json({
        success: true,
        candidates: [
          {
            candidateId: 'gh-cand-8801',
            applicationId: 'gh-app-9901',
            firstName: 'Marcus',
            lastName: 'Vance',
            email: 'marcus.vance@techlead.io',
            location: 'Austin, TX',
            stage: 'Application Review',
            appliedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            hasResume: true,
            resumeFileName: 'Marcus_Vance_Staff_Engineer_Resume.pdf',
            resumeTextSample: 'Staff Software Engineer with 9 years designing fault-tolerant distributed architectures in Node.js, Go, Next.js, and PostgreSQL. Spearheaded migration to Kubernetes reducing deployment cycle by 70%...'
          },
          {
            candidateId: 'gh-cand-8802',
            applicationId: 'gh-app-9902',
            firstName: 'Elena',
            lastName: 'Rostova',
            email: 'elena.rostova@cloudforge.ai',
            location: 'Seattle, WA',
            stage: 'Application Review',
            appliedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            hasResume: true,
            resumeFileName: 'Elena_Rostova_Resume.pdf',
            resumeTextSample: 'Principal Frontend Architect specializing in React, Next.js, WebGL/Three.js canvas workflows, and high-frequency real-time web applications. Author of open-source design token pipelines...'
          },
          {
            candidateId: 'gh-cand-8803',
            applicationId: 'gh-app-9903',
            firstName: 'David',
            lastName: 'Kim',
            email: 'david.kim.dev@proton.me',
            location: 'San Francisco, CA',
            stage: 'Recruiter Screen',
            appliedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            hasResume: true,
            resumeFileName: 'David_Kim_FullStack_2026.pdf',
            resumeTextSample: 'Senior Full-Stack Engineer with 6 years experience across TypeScript, Python, FastAPI, Prisma, and PostgreSQL. Built AI agent pipelines utilizing vector databases and semantic caching...'
          },
          {
            candidateId: 'gh-cand-8804',
            applicationId: 'gh-app-9904',
            firstName: 'Amina',
            lastName: 'Bello',
            email: 'amina.bello@eng.org',
            location: 'Chicago, IL',
            stage: 'Technical Screen',
            appliedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
            hasResume: true,
            resumeFileName: 'Amina_Bello_CV.pdf',
            resumeTextSample: 'Distributed Systems & Backend Lead with extensive experience scaling transactional workloads, message queues with Kafka, and automated CI/CD microservice deployments...'
          }
        ]
      });
    }

    // Real Greenhouse Harvest API v3
    const basicAuth = Buffer.from(`${apiKey}:`).toString('base64');
    let url = 'https://harvest.greenhouse.io/v3/applications?status=active&per_page=50';
    if (jobId && !jobId.startsWith('gh-job-')) {
      url += `&job_id=${encodeURIComponent(jobId)}`;
    }

    const appRes = await fetch(url, {
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!appRes.ok) {
      const errText = await appRes.text();
      return NextResponse.json({ success: false, error: `Failed to fetch applications: ${errText}` }, { status: appRes.status });
    }

    const applications = await appRes.json();
    
    // For each application, fetch or parse candidate details
    const candidateList = applications.map((app: any) => {
      const candidate = app.candidate || {};
      const resumeAttachment = (app.attachments || []).find((a: any) => a.type === 'resume') || app.attachments?.[0];
      
      return {
        candidateId: String(app.candidate_id || candidate.id),
        applicationId: String(app.id),
        firstName: candidate.first_name || (app.name ? app.name.split(' ')[0] : 'Applicant'),
        lastName: candidate.last_name || (app.name ? app.name.split(' ').slice(1).join(' ') : `#${app.id}`),
        email: candidate.email_addresses?.[0]?.value || app.email || '',
        location: candidate.addresses?.[0]?.value || 'Not specified',
        stage: app.current_stage?.name || 'Application Review',
        appliedAt: app.applied_at || app.created_at,
        hasResume: !!resumeAttachment,
        resumeUrl: resumeAttachment?.url || null,
        resumeFileName: resumeAttachment?.filename || 'Resume.pdf'
      };
    });

    return NextResponse.json({ success: true, candidates: candidateList });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
