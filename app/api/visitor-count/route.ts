// app/api/visitor-count/route.ts
import { getCount, incrementCount, setCount } from '@/lib/counter';

export async function GET() {
  try {
    const currentCount = getCount();
    console.log('API - Getting visitor count:', currentCount);
    return Response.json({ count: currentCount });
  } catch (error) {
    console.error('Get visitor count error:', error);
    return Response.json({ error: 'Failed to get visitor count' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.action === 'increment') {
      const newCount = incrementCount();
      console.log('API - Counter incremented to:', newCount);
      return Response.json({ count: newCount, action: 'incremented' });
    } else if (body.action === 'set' && typeof body.count === 'number') {
      setCount(body.count);
      console.log('API - Counter set to:', body.count);
      return Response.json({ count: body.count, action: 'set' });
    } else {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Post visitor count error:', error);
    return Response.json({ error: 'Failed to update visitor count' }, { status: 500 });
  }
}
