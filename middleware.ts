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
    
    console.log('Middleware - Visitor info:', { ip, country });
    
    // Create unique visitor identifier (more permanent)
    const visitorId = Buffer.from(`${ip}-${userAgent}`).toString('base64').substring(0, 32);
    
    // Get current reset counter to ensure we're not counting reset visitors
    const resetCounter = await redis.get('reset_counter') || 0;
    const globalVisitorKey = `global_visitor:${resetCounter}:${visitorId}`;
    
    console.log('Middleware - Checking if visitor exists:', { visitorId, resetCounter });
    
    // Check if this visitor has ever visited (globally, not just today)
    const hasVisitedBefore = await redis.exists(globalVisitorKey);
    
    console.log('Middleware - Has visited before:', hasVisitedBefore);
    
    if (!hasVisitedBefore) {
      // This is a completely new visitor
      console.log('Middleware - New global visitor detected!');
      
      // Increment global total count
      const newCount = await redis.incr('total_visitors');
      
      console.log('Middleware - New global count:', newCount);
      
      // Store visitor details permanently (with expiration of 1 year)
      await redis.setex(globalVisitorKey, 365 * 24 * 60 * 60, JSON.stringify({
        ip,
        country,
        firstVisit: Date.now(),
        userAgent: userAgent.substring(0, 200)
      }));
      
      const updateMessage = {
        type: 'NEW_VISITOR',
        count: newCount,
        visitor: { country, timestamp: Date.now() }
      };
      
      console.log('Middleware - Pushing to queue:', updateMessage);
      
      // Add to real-time updates queue for SSE
      await redis.lpush('visitor_updates_queue', JSON.stringify(updateMessage));
      
      console.log('Middleware - Successfully pushed to visitor_updates_queue');
    } else {
      console.log('Middleware - Returning visitor, no count increment');
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
