// app/api/visitor-stream/route.ts
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: NextRequest) {
  console.log('SSE - New client connected');
  
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let isActive = true;
      let pollInterval: NodeJS.Timeout;

      // Send initial count with timeout
      const sendInitialCount = async () => {
        try {
          const count = await Promise.race([
            redis.get('total_visitors'),
            new Promise(resolve => setTimeout(() => resolve(0), 5000))
          ]).catch(() => 0) || 0;
          
          console.log('SSE - Sending initial count:', count);
          const data = `data: ${JSON.stringify({ type: 'INITIAL_COUNT', count: parseInt(count.toString()) })}\n\n`;
          
          if (isActive) {
            controller.enqueue(encoder.encode(data));
          }
        } catch (error) {
          console.error('SSE - Failed to send initial count:', error);
        }
      };

      // Poll for messages with better error handling
      const pollMessages = () => {
        if (!isActive) return;
        
        redis.rpop('visitor_updates_queue')
          .then(message => {
            if (message && isActive) {
              console.log('SSE - Received from queue:', message);
              const data = `data: ${message}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          })
          .catch(error => {
            console.error('SSE - Polling error:', error);
          });
        
        // Schedule next poll
        if (isActive) {
          pollInterval = setTimeout(pollMessages, 1000);
        }
      };

      // Send keepalive every 25 seconds (Vercel has 30s timeout)
      const keepAliveInterval = setInterval(() => {
        if (isActive) {
          try {
            const keepAlive = `data: ${JSON.stringify({ type: 'KEEPALIVE', timestamp: Date.now() })}\n\n`;
            controller.enqueue(encoder.encode(keepAlive));
          } catch (error) {
            console.error('SSE - Keepalive error:', error);
            isActive = false;
            clearInterval(keepAliveInterval);
          }
        } else {
          clearInterval(keepAliveInterval);
        }
      }, 25000);

      // Start processes
      sendInitialCount().then(() => {
        pollMessages();
      });

      // Cleanup
      return () => {
        console.log('SSE - Client disconnected');
        isActive = false;
        clearInterval(keepAliveInterval);
        if (pollInterval) {
          clearTimeout(pollInterval);
        }
      };
    },
    
    cancel() {
      console.log('SSE - Stream cancelled');
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
