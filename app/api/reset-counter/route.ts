// app/api/reset-counter/route.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST() {
  try {
    console.log('API - Resetting global counter...');
    
    const oldCount = await redis.get('total_visitors') || 0;
    console.log('API - Old count before reset:', oldCount);
    
    // Reset the global counter
    await redis.set('total_visitors', 0);
    
    // Clear all global visitor records (this is more complex, so we'll use a different approach)
    // Instead of deleting all keys, we'll increment a reset counter to invalidate old visitor records
    const resetId = await redis.incr('reset_counter');
    console.log('API - Reset ID:', resetId);
    
    console.log('API - Global counter and visitor records invalidated');
    
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
