// app/api/reset-counter/route.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST() {
  try {
    console.log('API - Resetting counter...');
    
    const oldCount = await redis.get('total_visitors') || 0;
    console.log('API - Old count before reset:', oldCount);
    
    await redis.set('total_visitors', 0);
    await redis.del(`visitors:${new Date().toDateString()}`);
    
    console.log('API - Counter and daily visitors cleared');
    
    // Add reset notification to the queue for SSE
    const resetMessage = {
      type: 'COUNTER_RESET',
      count: 0
    };
    
    console.log('API - Adding reset message to queue:', resetMessage);
    await redis.lpush('visitor_updates_queue', JSON.stringify(resetMessage));
    
    console.log('API - Reset completed successfully');
    return Response.json({ success: true });
  } catch (error) {
    console.error('Reset counter error:', error);
    return Response.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
