import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Harvest API Key is required' }, { status: 400 });
    }

    // Demo / Sandbox key
    if (apiKey.toLowerCase() === 'demo' || apiKey.toLowerCase() === 'test') {
      return NextResponse.json({
        success: true,
        isDemo: true,
        accountName: 'Acme Corp (Greenhouse Sandbox)',
        user: { name: 'Demo Recruiter', email: 'recruiter@acme-corp.demo' }
      });
    }

    // Real Greenhouse Harvest API v3 validation
    // Uses HTTP Basic Auth: apiKey as username, empty password
    const basicAuth = Buffer.from(`${apiKey}:`).toString('base64');
    const ghRes = await fetch('https://harvest.greenhouse.io/v3/users/me', {
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!ghRes.ok) {
      const errBody = await ghRes.text();
      return NextResponse.json({ 
        success: false, 
        error: `Greenhouse authentication failed (${ghRes.status}): ${errBody || 'Invalid Harvest API Key or permissions.'}` 
      }, { status: 401 });
    }

    const userData = await ghRes.json();
    return NextResponse.json({
      success: true,
      isDemo: false,
      user: userData
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
