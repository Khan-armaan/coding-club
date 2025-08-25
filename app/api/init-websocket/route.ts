// app/api/init-websocket/route.ts
import { initializeWebSocket } from '@/lib/websocket';

export async function GET() {
  try {
    initializeWebSocket();
    return Response.json({ success: true, message: 'WebSocket server initialized' });
  } catch (error) {
    console.error('Failed to initialize WebSocket:', error);
    return Response.json({ success: false, error: 'Failed to initialize WebSocket' }, { status: 500 });
  }
}
