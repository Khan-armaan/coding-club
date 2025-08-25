// app/api/reset-counter/route.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST() {
  try {
    console.log('API - Resetting unique visitor counter...');
    
    const oldCount = await redis.get('total_visitors') || 0;
    console.log('API - Old count before reset:', oldCount);
    
    // Reset the global counter to 0
    await redis.set('total_visitors', 0);
    
    // Clear unique visitor records by using a pattern (this is more complex with Upstash)
    // Instead, we'll use a reset generation approach
    const resetCounter = await redis.incr('reset_generation');
    console.log('API - New reset generation:', resetCounter);
    
    console.log('API - Unique visitor counter reset to 0');
    
    // Add reset notification to the queue for SSE
    const resetMessage = {
      type: 'COUNTER_RESET',
      count: 0
    };
    
    console.log('API - Broadcasting reset to all clients:', resetMessage);
    await redis.lpush('visitor_updates_queue', JSON.stringify(resetMessage));
    
    console.log('API - Reset completed successfully');
    return Response.json({ success: true, resetGeneration: resetCounter });
  } catch (error) {
    console.error('Reset counter error:', error);
    return Response.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
