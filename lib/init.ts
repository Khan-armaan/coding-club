// lib/init.ts
import { initializeWebSocket } from './websocket';

// Initialize WebSocket server when the module is imported
if (typeof window === 'undefined') {
  // Only run on server side
  console.log('Initializing WebSocket server...');
  initializeWebSocket();
}
