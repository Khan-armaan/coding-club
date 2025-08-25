// middleware.ts
// Middleware is disabled - counter tracking is now handled in API routes
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('Middleware - Request received for:', request.nextUrl.pathname, '(but doing nothing)');
  return NextResponse.next();
}

export const config = {
  matcher: [],  // Empty matcher disables middleware
};
