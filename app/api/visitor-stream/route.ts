// app/api/visitor-stream/route.ts
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  let isActive = true;
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial visitor count
      const sendInitialCount = async () => {
        try {
          const count = await redis.get('total_visitors') || 0;
          console.log('SSE - Sending initial count:', count);
          const data = `data: ${JSON.stringify({ type: 'INITIAL_COUNT', count })}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (error) {
          console.error('Failed to send initial count:', error);
        }
      };

      sendInitialCount();

      // Poll for updates from Redis queue
      const pollForUpdates = async () => {
        console.log('SSE - Starting to poll for updates...');
        while (isActive) {
          try {
            // Use BRPOP for blocking pop to reduce Redis calls
            const message = await redis.rpop('visitor_updates_queue');
            if (message && isActive) {
              console.log('SSE - Received message from queue:', message);
              const data = `data: ${message}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
            
            // Small delay to prevent overwhelming Redis
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error('SSE polling error:', error);
            // If connection is broken, close the stream
            if (isActive) {
              const errorData = `data: ${JSON.stringify({ type: 'ERROR', message: 'Connection error' })}\n\n`;
              controller.enqueue(encoder.encode(errorData));
              controller.close();
              break;
            }
          }
        }
        console.log('SSE - Polling stopped');
      };

      // Send keepalive messages every 30 seconds
      const keepAlive = setInterval(() => {
        if (isActive) {
          try {
            const keepAliveData = `data: ${JSON.stringify({ type: 'KEEPALIVE' })}\n\n`;
            controller.enqueue(encoder.encode(keepAliveData));
          } catch {
            clearInterval(keepAlive);
          }
        } else {
          clearInterval(keepAlive);
        }
      }, 30000);

      pollForUpdates();
    },
    
    cancel() {
      // Cleanup when connection closes
      isActive = false;
      console.log('SSE connection closed');
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
