// app/api/websocket/route.ts
import { NextRequest } from 'next/server';
import { initializeWebSocket } from '@/lib/websocket';
import { getCount } from '@/lib/counter';

export async function GET(request: NextRequest) {
  const io = initializeWebSocket();
  console.log(io);
  // Send current count to newly connected clients
  const currentCount = await getCount();
  
  return new Response(
    new ReadableStream({
      start(controller) {
        // Set up WebSocket-like streaming
         // @ts-ignore
        const sendData = (data: any) => {
          const chunk = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(new TextEncoder().encode(chunk));
        };

        // Send initial count
        sendData({ type: 'count-update', count: currentCount });

        // Keep connection alive
        const heartbeat = setInterval(() => {
          sendData({ type: 'heartbeat', timestamp: Date.now() });
        }, 30000);

        // Cleanup on close
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeat);
          controller.close();
        });
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
