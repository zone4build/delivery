import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || '';
  const url = req.nextUrl.clone();
  const userAgent = req.headers.get('user-agent') || '';

  // ── Step 0: Fast path bypasses ──────────────────────────────────────────
  const isProbe = userAgent.toLowerCase().includes('kube-probe');
  const isHealthPath = url.pathname === '/health' || url.pathname === '/ready';

  if (isHealthPath || isProbe) {
    return new NextResponse('OK', { status: 200 });
  }

  // ── Step 1: Static assets and Next.js internals ─────────────────────────
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // ── Step 2: Security ────────────────────────────────────────────────────
  const maliciousPaths = [
    '/.env', '/.git', '/.htaccess', '/config.php',
    '/wp-admin', '/wp-login.php', '/etc/passwd',
    '/phpinfo', '/.aws', '/.ssh',
  ];
  if (maliciousPaths.some(p => url.pathname.includes(p))) {
    return new NextResponse(null, { status: 403 });
  }

  // ── Step 3: Set Headers ────────────────────────────────────────────────
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-tenant-id, Authorization');
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
  response.headers.set('x-tenant-id', tenantId);

  return response;
}

export const config = {
  matcher: ['/', '/((?!api|_next/static|_next/image).*)'],
};
