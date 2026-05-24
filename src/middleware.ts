import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LOCALE_PREFIXES, PLATFORM_SUBDOMAINS, getAccessMode } from '@/lib/routing-constants';

// ─── Path extraction for marketplace hub only ─────────────────────────────
function resolveMarketplacePath(pathname: string): {
  shopSlug: string | null;
  cleanPath: string;
} {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return { shopSlug: null, cleanPath: '/' };

  let localePrefix: string | null = null;
  let slugIndex = 0;

  if (LOCALE_PREFIXES.has(segments[0])) {
    localePrefix = segments[0];
    slugIndex = 1;
  }

  const shopSlug = segments[slugIndex] ?? null;
  if (!shopSlug) return { shopSlug: null, cleanPath: '/' };

  const rest = segments.slice(slugIndex + 1);
  const cleanParts = [...(localePrefix ? [localePrefix] : []), ...rest];
  const cleanPath = cleanParts.length > 0 ? '/' + cleanParts.join('/') : '/';

  return { shopSlug, cleanPath };
}

// ─── System pages — handled by dedicated Next.js page files ──────────────
const SYSTEM_PAGE_PATHS = [
  '/checkout', '/checkout/digital', '/checkout/guest',
  '/profile', '/orders', '/order-received', '/help',
  '/contact', '/privacy', '/terms', '/change-password',
  '/downloads', '/offers', '/questions', '/refunds',
  '/reports', '/wishlists', '/coupon-generator', '/logout', '/login',
  '/map', '/forgotPassword', '/search',
];

function isSystemPagePath(pagePath: string): boolean {
  return SYSTEM_PAGE_PATHS.some(
    p => pagePath === p || pagePath.startsWith(p + '/')
  );
}

export async function middleware(req: NextRequest) {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || '';
  const url = req.nextUrl.clone();
  const host = req.headers.get('host') || '';
  const userAgent = req.headers.get('user-agent') || '';

  console.log(`[Middleware] Request: ${host}${url.pathname} (Locale: ${url.locale})`);

  // ── Step 0: Fast path bypasses ──────────────────────────────────────────
  const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}/.test(url.hostname);
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

  // ── Step 3: Detect access mode ──────────────────────────────────────────
  const accessMode = getAccessMode(host);

  // ── Step 4: Route by access mode ────────────────────────────────────────
  let resolvedShopSlug: string | null = null;
  let internalPathname: string | null = null;
  let pagePath: string = url.pathname;

  if (accessMode === 'marketplace') {
    // dev-shop.zone4build.com/fr/gustomenu/checkout
    // Extract slug from path
    const systemKeywords = new Set(['api', '_next', 'static', 'favicon', 'health']);
    const { shopSlug, cleanPath } = resolveMarketplacePath(url.pathname);

    if (!shopSlug || systemKeywords.has(shopSlug)) {
      // Hub landing page — no shop selected, render normally
      return applyHeaders(NextResponse.next());
    }

    resolvedShopSlug = shopSlug;
    pagePath = cleanPath;
    internalPathname = `/${resolvedShopSlug}${cleanPath === '/' ? '' : cleanPath}`;

  } else if (accessMode === 'subdomain') {
    // gustomenu.zone4build.com/checkout
    // Slug is the subdomain
    const normalized = host.replace(/^www\./, '').split(':')[0];
    resolvedShopSlug = normalized.split('.')[0];
    pagePath = url.pathname;

    // Idempotency — already has slug prefix
    if (
      url.pathname.startsWith(`/${resolvedShopSlug}/`) ||
      url.pathname === `/${resolvedShopSlug}`
    ) {
      const response = applyHeaders(NextResponse.next());
      response.headers.set('x-shop-slug', resolvedShopSlug);
      return response;
    }

    internalPathname = `/${resolvedShopSlug}${url.pathname}`;

  } else {
    // accessMode === 'custom'
    // gustomenu.org/fr or gustomenu.org/checkout
    // Derive slug from hostname (e.g. gustomenu.org -> gustomenu)
    const normalized = host.replace(/^www\./, '').split(':')[0];
    resolvedShopSlug = normalized.split('.')[0];
    pagePath = url.pathname;

    if (!resolvedShopSlug) {
      return applyHeaders(NextResponse.next());
    }

    // On custom domains, if it's the root or a subpath, we want to show the SHOP page
    // unless it's a system page.
    // For single-shop custom domains, we rewrite to /[slug] internally
    // to match the marketplace hub routing and design.
    internalPathname = `/${resolvedShopSlug}${url.pathname === '/' ? '' : url.pathname}`;
    console.log(`[Middleware] Custom domain rewrite: ${url.pathname} -> ${internalPathname}`);
  }

  // Helper to append mandatory headers
  function applyHeaders(res: NextResponse) {
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-tenant-id, x-shop-slug, Authorization');
    res.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.headers.set('x-tenant-id', tenantId);
    if (resolvedShopSlug) res.headers.set('x-shop-slug', resolvedShopSlug);
    return res;
  }

  if (!resolvedShopSlug || !internalPathname) {
    return applyHeaders(NextResponse.next());
  }

  // ── Step 5: System page check ───────────────────────────────────────────
  // Strip locale before checking system paths
  const pagePathWithoutLocale = (() => {
    const parts = pagePath.split('/').filter(Boolean);
    if (parts.length > 0 && LOCALE_PREFIXES.has(parts[0])) {
      return '/' + parts.slice(1).join('/') || '/';
    }
    return pagePath;
  })();

  if (isSystemPagePath(pagePathWithoutLocale)) {
    const response = applyHeaders(NextResponse.next());
    response.headers.set('x-shop-slug', resolvedShopSlug);
    response.cookies.set('SHOP_SLUG', resolvedShopSlug, {
      path: '/',
      maxAge: 86400,
      sameSite: 'lax',
    });
    if (accessMode === 'marketplace') {
      const subdomain = host.replace(/^www\./, '').split('.')[0];
      response.cookies.set('MARKETPLACE_ID', subdomain, {
        path: '/',
        maxAge: 86400,
      });
    }
    return response;
  }

  // ── Step 6: Locale redirect for root requests ───────────────────────────
  if (url.pathname === '/' && !req.cookies.has('NEXT_LOCALE')) {
    try {
      const apiEndpoint = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
      if (apiEndpoint) {
        const res = await fetch(`${apiEndpoint}/shops/${resolvedShopSlug}`, {
          headers: { 'x-tenant-id': tenantId },
          next: { revalidate: 3600 },
        });
        if (res.ok) {
          const shop = await res.json();
          const defaultLanguage = shop?.settings?.defaultLanguage;
          if (defaultLanguage && defaultLanguage !== req.nextUrl.locale) {
            const redirectUrl = req.nextUrl.clone();
            redirectUrl.locale = defaultLanguage;
            const redirectResponse = applyHeaders(NextResponse.redirect(redirectUrl));
            redirectResponse.cookies.set('NEXT_LOCALE', defaultLanguage, {
              path: '/',
              maxAge: 31536000,
            });
            return redirectResponse;
          }
        }
      }
    } catch (_) {}
  }

  // ── Step 7: Rewrite to internal shop path ───────────────────────────────
  url.pathname = internalPathname;

  // Background traffic report
  const apiEndpoint = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
  if (apiEndpoint) {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.ip ||
      '127.0.0.1';
    fetch(`${apiEndpoint}/monitoring/traffic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({
        shopSlug: resolvedShopSlug,
        channel: accessMode,
        marketplaceId: accessMode === 'marketplace'
          ? host.replace(/^www\./, '').split('.')[0]
          : null,
        ip,
        path: req.nextUrl.pathname,
        userAgent,
        referrer: req.headers.get('referer') || '',
      }),
    }).catch(() => {});
  }

  const response = applyHeaders(NextResponse.rewrite(url));
  response.cookies.set('SHOP_SLUG', resolvedShopSlug, {
    path: '/',
    maxAge: 86400,
    sameSite: 'lax',
  });

  if (accessMode === 'marketplace') {
    const subdomain = host.replace(/^www\./, '').split('.')[0];
    response.cookies.set('MARKETPLACE_ID', subdomain, {
      path: '/',
      maxAge: 86400,
    });
    response.headers.set('x-marketplace-id', subdomain);
  }

  return response;
}

export const config = {
  matcher: ['/', '/((?!api|_next/static|_next/image).*)'],
};
