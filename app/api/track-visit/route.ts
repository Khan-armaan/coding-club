// app/api/track-visit/route.ts
import { incrementCount } from '@/lib/counter';

export async function POST() {
  try {
    console.log('API - Tracking new visit...');
    const newCount = incrementCount();
    console.log('API - Visit tracked, new count:', newCount);
    return Response.json({ success: true, count: newCount });
  } catch (error) {
    console.error('Track visit error:', error);
    return Response.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
