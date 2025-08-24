// app/api/visitor-stream/route.ts
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial visitor count
      redis.get('total_visitors').then(count => {
        const data = `data: ${JSON.stringify({ type: 'INITIAL_COUNT', count: count || 0 })}\n\n`;
        controller.enqueue(encoder.encode(data));
      });

      // Subscribe to Redis pub/sub for real-time updates
      const subscriber = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });

      const pollForUpdates = async () => {
        try {
          while (true) {
            const message = await subscriber.lpop('visitor_updates_queue');
            if (message) {
              const data = `data: ${message}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error('SSE error:', error);
          controller.close();
        }
      };

      pollForUpdates();
    },
    
    cancel() {
      // Cleanup when connection closes
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
