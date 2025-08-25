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

      // Send initial count immediately
      const sendInitialCount = async () => {
        try {
          const count = await redis.get('total_visitors') || 0;
          console.log('SSE - Sending initial count:', count);
          const data = `data: ${JSON.stringify({ type: 'INITIAL_COUNT', count: parseInt(count.toString()) })}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (error) {
          console.error('SSE - Failed to send initial count:', error);
        }
      };

      // Poll for new messages from the queue
      const pollMessages = async () => {
        console.log('SSE - Starting message polling...');
        
        while (isActive) {
          try {
            // Check for messages in the queue
            const message = await redis.rpop('visitor_updates_queue');
            
            if (message && isActive) {
              console.log('SSE - Received from queue:', message);
              try {
                const data = `data: ${message}\n\n`;
                controller.enqueue(encoder.encode(data));
                console.log('SSE - Message sent to client');
              } catch (controllerError) {
                console.error('SSE - Controller error:', controllerError);
                isActive = false;
                break;
              }
            }
            
            // Wait before checking again (shorter interval for better responsiveness)
            await new Promise(resolve => setTimeout(resolve, 200));
            
          } catch (error) {
            console.error('SSE - Polling error:', error);
            // Only break if it's a critical error
            if (error instanceof Error && error.message?.includes('Controller is already closed')) {
              isActive = false;
              break;
            }
            // Wait longer on error
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        console.log('SSE - Polling stopped');
      };

      // Start sending initial count and then poll for messages
      sendInitialCount().then(() => {
        pollMessages();
      });

      // Cleanup function
      return () => {
        console.log('SSE - Client disconnected');
        isActive = false;
      };
    },
    
    cancel() {
      console.log('SSE - Stream cancelled');
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
