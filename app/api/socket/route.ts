// app/api/socket/route.ts
import { NextResponse } from 'next/server';
import { Server } from 'socket.io';
import { getCount } from '@/lib/counter';

let io: Server;

export async function GET() {
  if (!io) {
    // @ts-ignore
    const httpServer = (global as any).httpServer;
    
    if (!httpServer) {
      // Create a simple HTTP server for Socket.IO
      const { createServer } = await import('http');
      const server = createServer();
       // @ts-ignore
      (global as any).httpServer = server;
      
      io = new Server(server, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        }
      });

      io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Send current count when client connects
        getCount().then(count => {
          socket.emit('count-update', { count });
        });

        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id);
        });
      });

      server.listen(3001, () => {
        console.log('Socket.IO server running on port 3001');
      });
    }
  }

  return NextResponse.json({ message: 'Socket.IO server initialized' });
}

// Export the io instance for use in other parts of the app
export { io };
