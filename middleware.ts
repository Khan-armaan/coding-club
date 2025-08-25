// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function middleware(request: NextRequest) {
  console.log('Middleware - Request received for:', request.nextUrl.pathname);
  
  // Skip API routes and static files
  if (request.nextUrl.pathname.startsWith('/api/') || 
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }
  
  try {
    // Better IP detection for Vercel
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const vercelIP = request.headers.get('x-vercel-forwarded-for');
    
    const ip = vercelIP || forwardedFor?.split(',')[0] || realIP || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const country = request.headers.get('x-vercel-ip-country') || 
                   request.headers.get('cf-ipcountry') || 
                   'unknown';
    
    console.log('Middleware - Visit from:', { ip: ip.substring(0, 15) + '...', country });
    
    // Create unique visitor identifier
    const visitorData = `${ip}-${userAgent}`;
    const visitorId = Buffer.from(visitorData).toString('base64').substring(0, 32);
    const resetGeneration = await redis.get('reset_generation').catch(() => 0) || 0;
    const uniqueVisitorKey = `unique_visitor:${resetGeneration}:${visitorId}`;
    
    console.log('Middleware - Checking visitor:', visitorId.substring(0, 10) + '...');
    
    // Check if unique visitor with timeout
    const wasNewVisitor = await Promise.race([
      redis.set(uniqueVisitorKey, JSON.stringify({
        ip: ip.substring(0, 15), // Truncate for privacy
        country,
        userAgent: userAgent.substring(0, 200),
        firstVisit: Date.now()
      }), { 
        ex: 365 * 24 * 60 * 60, // 1 year expiry
        nx: true // Only set if doesn't exist
      }),
      new Promise(resolve => setTimeout(() => resolve(null), 3000)) // 3s timeout
    ]);
    
    if (wasNewVisitor === 'OK') {
      console.log('Middleware - NEW UNIQUE VISITOR detected!');
      
      // Increment counter with timeout
      const newCount = await Promise.race([
        redis.incr('total_visitors'),
        new Promise(resolve => setTimeout(() => resolve(0), 3000))
      ]).catch(() => 0);
      
      console.log('Middleware - Counter incremented to:', newCount);
      
      if (typeof newCount === 'number' && newCount > 0) {
        // Add to queue with timeout
        const updateMessage = {
          type: 'NEW_VISITOR',
          count: newCount,
          visitor: { country, timestamp: Date.now() }
        };
        
        await Promise.race([
          redis.lpush('visitor_updates_queue', JSON.stringify(updateMessage)),
          new Promise(resolve => setTimeout(() => resolve(null), 2000))
        ]).catch(error => {
          console.error('Queue push failed:', error);
        });
        
        console.log('Middleware - Update queued successfully');
      }
    } else {
      console.log('Middleware - Returning visitor, no increment');
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
