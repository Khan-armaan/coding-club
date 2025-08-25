// app/api/debug/route.ts
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: NextRequest) {
  try {
    // Test basic Redis operations
    const testKey = `debug_test_${Date.now()}`;
    
    // Test SET
    await redis.set(testKey, 'test_value', { ex: 60 });
    
    // Test GET
    const testValue = await redis.get(testKey);
    
    // Test current visitor count
    const currentCount = await redis.get('total_visitors') || 0;
    
    // Test queue length
    const queueLength = await redis.llen('visitor_updates_queue');
    
    // Get headers info
    const headers = {
      'x-forwarded-for': request.headers.get('x-forwarded-for'),
      'x-real-ip': request.headers.get('x-real-ip'),
      'x-vercel-ip-country': request.headers.get('x-vercel-ip-country'),
      'x-vercel-forwarded-for': request.headers.get('x-vercel-forwarded-for'),
      'user-agent': request.headers.get('user-agent')?.substring(0, 100),
    };
    
    // Clean up test key
    await redis.del(testKey);
    
    return Response.json({
      status: 'success',
      redis: {
        connected: true,
        testOperation: testValue === 'test_value',
        currentCount: parseInt(currentCount.toString()),
        queueLength
      },
      headers,
      environment: {
        hasRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL,
        hasRedisToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    
    return Response.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        hasRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL,
        hasRedisToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
