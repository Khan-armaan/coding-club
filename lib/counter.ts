// lib/counter.ts
// In-memory visitor counter using singleton pattern
import { broadcastCountUpdate } from './websocket';
import {broadcastToSSE} from "../app/api/visitor-stream/route";
import './init'; // Initialize WebSocket server

class VisitorCounter {
  private static instance: VisitorCounter;
  private count: number = 0;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): VisitorCounter {
    if (!VisitorCounter.instance) {
      VisitorCounter.instance = new VisitorCounter();
    }
    return VisitorCounter.instance;
  }

  public getCount(): number {
    return this.count;
  }

  public incrementCount(): number {
    this.count++;
    console.log('Counter incremented to:', this.count);
    
    // Broadcast the update to all connected clients (WebSocket)
    broadcastCountUpdate(this.count);
    
    // Also broadcast to SSE clients
    this.broadcastToSSE(this.count);
    
    return this.count;
  }

  public resetCount(): number {
    const oldCount = this.count;
    this.count = 0;
    console.log('Counter reset from', oldCount, 'to 0');
    
    // Broadcast the update to all connected clients
    broadcastCountUpdate(this.count);
    this.broadcastToSSE(this.count);
    
    return oldCount;
  }

  public setCount(count: number): void {
    this.count = count;
    console.log('Counter set to:', count);
    
    // Broadcast the update to all connected clients
    broadcastCountUpdate(this.count);
    this.broadcastToSSE(this.count);
  }

  private broadcastToSSE(count: number): void {
    // Dynamic import to avoid circular dependency
    try {
    
      broadcastToSSE(count);
    } catch (error) {
      console.error('Error broadcasting to SSE:', error);
    }
  }
}

// Export functions that use the singleton instance
const counter = VisitorCounter.getInstance();

export async function getCount(): Promise<number> {
  try {
    const count = counter.getCount();
    return count;
  } catch (error) {
    console.error('Error getting count:', error);
    return 0;
  }
}

export async function incrementCount(): Promise<number> {
  try {
    const newCount = counter.incrementCount();
    return newCount;
  } catch (error) {
    console.error('Error incrementing count:', error);
    return 0;
  }
}

export async function resetCount(): Promise<number> {
  try {
    const oldCount = counter.resetCount();
    return oldCount;
  } catch (error) {
    console.error('Error resetting count:', error);
    return 0;
  }
}

export async function setCount(count: number): Promise<void> {
  try {
    counter.setCount(count);
  } catch (error) {
    console.error('Error setting count:', error);
  }
}
