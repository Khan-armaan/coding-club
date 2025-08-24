// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function middleware(request: NextRequest) {
  console.log('Middleware - Request received for:', request.nextUrl.pathname);
  
  try {
    // Get visitor info from request
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const country = request.headers.get('x-vercel-ip-country') || 'unknown';
    
    // Create unique visitor identifier
    const visitorId = Buffer.from(`${ip}-${userAgent}`).toString('base64');
    const visitorKey = `visitor:${visitorId}`;
    const todayKey = `visitors:${new Date().toDateString()}`;
    
    // Check if this is a new visitor today
    const isNewVisitor = await redis.sadd(todayKey, visitorId);
    
    console.log('Middleware - Visitor check:', {
      visitorId: visitorId.substring(0, 20) + '...',
      country,
      isNewVisitor,
      todayKey
    });
    
    if (isNewVisitor) {
      // Increment total count
      const newCount = await redis.incr('total_visitors');
      
      console.log('Middleware - New visitor detected:', {
        newCount,
        country,
        timestamp: new Date().toISOString()
      });
      
      // Store visitor details
      await redis.hset(visitorKey, {
        ip,
        country,
        timestamp: Date.now(),
        userAgent: userAgent.substring(0, 200)
      });
      
      const updateMessage = {
        type: 'NEW_VISITOR',
        count: newCount,
        visitor: { country, timestamp: Date.now() }
      };
      
      console.log('Middleware - Pushing to queue:', updateMessage);
      
      // Add to real-time updates queue for SSE
      await redis.lpush('visitor_updates_queue', JSON.stringify(updateMessage));
      
      console.log('Middleware - Successfully pushed to visitor_updates_queue');
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
