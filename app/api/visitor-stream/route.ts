// app/api/visitor-stream/route.ts
import { getCount } from '@/lib/counter';

// Global set to track all active connections
const connections = new Set<ReadableStreamDefaultController>();

// Function to broadcast updates to all connected clients
export function broadcastToSSE(count: number) {
  const data = JSON.stringify({ count, timestamp: new Date().toISOString() });
  const chunk = `data: ${data}\n\n`;
  
  connections.forEach(controller => {
    try {
      controller.enqueue(new TextEncoder().encode(chunk));
    } catch (error) {
      // Remove dead connections
      connections.delete(controller);
      //
      console.error('Error broadcasting to SSE client:', error);
    }
  });
}

export async function GET() {
  const currentCount = await getCount();
  
  return new Response(
    new ReadableStream({
      start(controller) {
        // Add this connection to our set
        connections.add(controller);
        
        // Send initial count
        const initialData = JSON.stringify({ 
          count: currentCount, 
          timestamp: new Date().toISOString() 
        });
        controller.enqueue(new TextEncoder().encode(`data: ${initialData}\n\n`));
        
        // Send heartbeat every 30 seconds to keep connection alive
        const heartbeat = setInterval(() => {
          try {
            const heartbeatData = JSON.stringify({ 
              type: 'heartbeat', 
              timestamp: new Date().toISOString() 
            });
            controller.enqueue(new TextEncoder().encode(`data: ${heartbeatData}\n\n`));
          } catch (error) {
            clearInterval(heartbeat);
            connections.delete(controller);
            // 
            console.error('Error sending heartbeat to SSE client:', error);
          }
        }, 30000);
        
        // Cleanup when client disconnects
        return () => {
          clearInterval(heartbeat);
          connections.delete(controller);
          console.log('SSE client disconnected, remaining connections:', connections.size);
        };
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    }
  );
}
