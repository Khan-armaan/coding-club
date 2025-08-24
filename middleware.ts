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
    
    // Increment counter for EVERY visit (not just unique visitors)
    const newCount = await redis.incr('total_visitors');
    
    console.log('Middleware - Visit count incremented to:', newCount);
    
    // Create visitor info for this visit
    const visitInfo = {
      ip,
      country,
      userAgent: userAgent.substring(0, 200),
      timestamp: Date.now()
    };
    
    // Store this visit (optional - for analytics)
    const visitKey = `visit:${Date.now()}:${Math.random().toString(36).substring(2, 15)}`;
    await redis.setex(visitKey, 24 * 60 * 60, JSON.stringify(visitInfo)); // Store for 24 hours
    
    // Send real-time update to all connected clients
    const updateMessage = {
      type: 'NEW_VISITOR',
      count: newCount,
      visitor: { country, timestamp: Date.now() }
    };
    
    console.log('Middleware - Broadcasting to all clients:', updateMessage);
    
    // Add to real-time updates queue for SSE
    await redis.lpush('visitor_updates_queue', JSON.stringify(updateMessage));
    
    console.log('Middleware - Successfully broadcasted visit update');
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
