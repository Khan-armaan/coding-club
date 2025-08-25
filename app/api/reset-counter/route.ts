// app/api/reset-counter/route.ts
import { resetCount, getCount } from '@/lib/counter';

export async function POST() {
  try {
    console.log('API - Resetting counter...');
    
    const oldCount = await resetCount();
    const newCount = await getCount();
    console.log('API - Counter reset from:', oldCount, 'to', newCount);
    
    return Response.json({ success: true, oldCount, newCount });
  } catch (error) {
    console.error('Reset counter error:', error);
    return Response.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
