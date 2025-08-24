// app/api/visitor-count/route.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
  try {
    const count = await redis.get('total_visitors') || 0;
    console.log('API - Getting visitor count:', count);
    return Response.json({ count });
  } catch (error) {
    console.error('Get visitor count error:', error);
    return Response.json({ count: 0, error: 'Failed to fetch count' }, { status: 500 });
  }
}
