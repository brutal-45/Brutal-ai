import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Try to initialize ZAI to check config
    let apiKeyConfigured = false;
    try {
      await ZAI.create();
      apiKeyConfigured = true;
    } catch {
      apiKeyConfigured = false;
    }
    
    const memoryUsage = process.memoryUsage();
    
    return NextResponse.json({
      status: apiKeyConfigured ? 'healthy' : 'degraded',
      timestamp: Date.now(),
      uptime: Math.floor(process.uptime()),
      version: '2.4.2',
      service: 'Brutal.ai API',
      apiKey: {
        configured: apiKeyConfigured,
        message: apiKeyConfigured ? 'API key configured' : 'ZAI_API_KEY not configured',
      },
      ...(!apiKeyConfigured && {
        setupInstructions: {
          vercel: [
            '1. Vercel Dashboard → Project → Settings → Environment Variables',
            '2. Add: ZAI_API_KEY = your-api-key',
            '3. Select: Production, Preview, Development',
            '4. Save and Redeploy',
          ],
          local: [
            '1. Create .env file',
            '2. Add: ZAI_API_KEY=your-api-key',
            '3. Restart server',
          ],
        },
      }),
      system: {
        memory: {
          heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        },
        uptime: formatUptime(process.uptime()),
        nodeVersion: process.version,
      },
    });
  } catch {
    return NextResponse.json({ status: 'unhealthy', timestamp: Date.now() }, { status: 503 });
  }
}

export async function HEAD() {
  return new NextResponse(null, { status: 200, headers: { 'X-Health-Status': 'healthy' } });
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(' ');
}
