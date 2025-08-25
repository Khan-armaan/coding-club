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
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const country = request.headers.get('x-vercel-ip-country') || 
                   request.headers.get('cf-ipcountry') || 
                   'unknown';
    
    console.log('Middleware - New visit from:', { ip, country });
    
    // Create unique visitor identifier with reset generation
    const visitorId = Buffer.from(`${ip}-${userAgent}`).toString('base64').substring(0, 32);
    const resetGeneration = await redis.get('reset_generation') || 0;
    const uniqueVisitorKey = `unique_visitor:${resetGeneration}:${visitorId}`;
    
    console.log('Middleware - Checking if unique visitor:', { 
      visitorId: visitorId.substring(0, 10) + '...', 
      resetGeneration 
    });
    
    // Check if this is a new unique visitor (use Redis SET with NX to ensure atomicity)
    const wasNewVisitor = await redis.set(uniqueVisitorKey, JSON.stringify({
      ip,
      country,
      userAgent: userAgent.substring(0, 200),
      firstVisit: Date.now()
    }), { 
      ex: 365 * 24 * 60 * 60, // Expire after 1 year
      nx: true // Only set if key doesn't exist
    });
    
    if (wasNewVisitor === 'OK') {
      // This is a completely new unique visitor
      const newCount = await redis.incr('total_visitors');
      
      console.log('Middleware - NEW UNIQUE VISITOR! Count incremented to:', newCount);
      
      // Send real-time update to all connected clients
      const updateMessage = {
        type: 'NEW_VISITOR',
        count: newCount,
        visitor: { country, timestamp: Date.now() }
      };
      
      console.log('Middleware - Broadcasting to all clients:', updateMessage);
      
      // Push to FRONT of queue (LPUSH) so it's processed immediately
      const queueLength = await redis.lpush('visitor_updates_queue', JSON.stringify(updateMessage));
      console.log('Middleware - Queue length after push:', queueLength);
      
      console.log('Middleware - Successfully broadcasted new unique visitor update');
    } else {
      console.log('Middleware - Returning visitor detected, no count increment');
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
