// app/api/visitor-count/route.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
  const count = await redis.get('total_visitors') || 0;
  return Response.json({ count });
}

// app/api/reset-counter/route.ts
export async function POST() {
  await redis.set('total_visitors', 0);
  await redis.del(`visitors:${new Date().toDateString()}`);
  
  // Notify all connected clients
  await redis.publish('visitor_updates', JSON.stringify({
    type: 'COUNTER_RESET',
    count: 0
  }));
  
  return Response.json({ success: true });
}
