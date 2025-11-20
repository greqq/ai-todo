// Health check endpoint for Docker and AWS ECS
// This endpoint is pinged by:
// - Docker HEALTHCHECK
// - AWS ECS health checks
// - Load balancers
// - Monitoring systems

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check - returns 200 if server is running
    // You can add more checks here:
    // - Database connectivity
    // - External API availability
    // - Memory usage
    
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
