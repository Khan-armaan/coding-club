// lib/counter.ts
// Upstash Redis visitor counter
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const COUNTER_KEY = 'visitor_counter';

export async function getCount(): Promise<number> {
  try {
    const count = await redis.get(COUNTER_KEY);
    return count ? Number(count) : 0;
  } catch (error) {
    console.error('Error getting count:', error);
    return 0;
  }
}

export async function incrementCount(): Promise<number> {
  try {
    const newCount = await redis.incr(COUNTER_KEY);
    console.log('Counter incremented to:', newCount);
    return newCount;
  } catch (error) {
    console.error('Error incrementing count:', error);
    return 0;
  }
}

export async function resetCount(): Promise<number> {
  try {
    const oldCount = await getCount();
    await redis.set(COUNTER_KEY, 0);
    console.log('Counter reset from', oldCount, 'to 0');
    return oldCount;
  } catch (error) {
    console.error('Error resetting count:', error);
    return 0;
  }
}

export async function setCount(count: number): Promise<void> {
  try {
    await redis.set(COUNTER_KEY, count);
    console.log('Counter set to:', count);
  } catch (error) {
    console.error('Error setting count:', error);
  }
}
