// lib/websocket.ts
import { Server } from 'socket.io';
import { createServer } from 'http';
let io: Server | null = null;

export function initializeWebSocket(): Server {
  if (!io) {
  
    const server = createServer();
    
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    const port = process.env.SOCKET_PORT || 3001;
    server.listen(port, () => {
      console.log(`WebSocket server running on port ${port}`);
    });
  }

  return io;
}

export function getWebSocketInstance(): Server | null {
  return io;
}

export function broadcastCountUpdate(count: number): void {
  if (io) {
    io.emit('count-update', { count, timestamp: new Date().toISOString() });
    console.log('Broadcasted count update:', count);
  }
}
