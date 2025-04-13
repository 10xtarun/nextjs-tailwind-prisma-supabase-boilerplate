import { NextRequest, NextResponse } from 'next/server';
import chalk from 'chalk';

export function middleware(request: NextRequest) {
  console.log(chalk.blue(`Request: ${request.method} ${request.url}`));

  const response = NextResponse.next();

  response.headers.set('x-hello-from-middleware', 'hello');

  return response;
}

export const config = {
  matcher: '/api/:path*',
}; 