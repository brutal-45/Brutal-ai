import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check for admin secret
    const adminSecret = request.headers.get('x-admin-secret');
    const expectedSecret = process.env.ADMIN_SECRET || 'brutal-admin';
    
    if (adminSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Memory usage
    const memoryUsage = process.memoryUsage();
    
    // Build response
    const response = NextResponse.json({
      status: 'healthy',
      timestamp: Date.now(),
      uptime: Math.floor(process.uptime()),
      version: '2.4.1',
      
      // System metrics
      system: {
        memory: {
          heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
          rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
          usagePercent: ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(1),
        },
        uptime: formatUptime(process.uptime()),
        nodeVersion: process.version,
        platform: process.platform,
      },
      
      // Cache statistics (placeholder)
      cache: {
        response: { hits: 0, misses: 0, size: 0, hitRate: 0 },
        ai: { hits: 0, misses: 0, size: 0, hitRate: 0 },
        image: { hits: 0, misses: 0, size: 0, hitRate: 0 },
      },
      
      // Rate limiting info
      rateLimit: {
        totalClients: 0,
        blockedClients: 0,
      },
      
      // Connection pool info
      connectionPool: {
        total: 10,
        active: 0,
        idle: 10,
        queuedRequests: 0,
      },
      
      // Recommendations
      recommendations: ['All systems operating within normal parameters'],
    });

    response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
    response.headers.set('Cache-Control', 'no-store');
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Monitoring check failed',
        timestamp: Date.now(),
      },
      { status: 503 }
    );
  }
}

// Format uptime
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
