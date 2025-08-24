// app/api/reset-counter/route.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST() {
  try {
    await redis.set('total_visitors', 0);
    await redis.del(`visitors:${new Date().toDateString()}`);
    
    // Add reset notification to the queue for SSE
    await redis.lpush('visitor_updates_queue', JSON.stringify({
      type: 'COUNTER_RESET',
      count: 0
    }));
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Reset counter error:', error);
    return Response.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
