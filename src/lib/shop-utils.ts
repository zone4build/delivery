import {
  LOCALE_PREFIXES,
  PLATFORM_SUBDOMAINS,
  MAIN_DOMAINS,
  getAccessMode,
  RESERVED_SLUGS,
} from './routing-constants';
import Cookies from 'js-cookie';

/**
 * Resolves the shop slug for use in client-side link building.
 * 
 * In subdomain or custom domain mode, the slug is NOT needed in the path,
 * so we return null to ensure links are built as /checkout instead of /gustomenu/checkout.
 * 
 * CLIENT-SIDE ONLY — never call this on the server.
 */
export function resolveShopSlug(validSlugs?: string[]): string | null {
  if (typeof window === 'undefined') return null;

  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const mode = getAccessMode(hostname);

  // On subdomain or custom domain, the domain IS the shop.
  // Links should never include a slug prefix — return null.
  // The middleware handles the internal rewrite using the subdomain/domain.
  if (mode === 'subdomain' || mode === 'custom') {
    return null;
  }

  // Marketplace hub — extract slug from path
  return extractSlugFromPath(pathname);
}

/**
 * API slug — used for fetching shop data from the backend.
 * Always returns the real shop slug regardless of access mode.
 * SAFE for both server and client — uses hostname/pathname passed as arguments.
 */
export function resolveShopSlugForApi(hostname: string, pathname: string): string | null {
  const mode = getAccessMode(hostname);

  if (mode === 'marketplace') {
    return extractSlugFromPath(pathname);
  }

  // Subdomain: gustomenu.zone4build.com → "gustomenu"
  // Custom:    gustomenu.org            → read from subdomain or tenantId
  const normalized = hostname.replace(/^www\./, '').toLowerCase();
  const parts = normalized.split('.');

  if (mode === 'subdomain' && parts.length >= 3) {
    return parts[0]; // "gustomenu" from "gustomenu.zone4build.com"
  }

  if (mode === 'custom') {
    // For custom domains, the slug must come from a lookup or header (on server)
    // or we return the first part of the domain as a guess (gustomenu.org -> gustomenu)
    return parts[0];
  }

  return null;
}

function extractSlugFromPath(pathname: string): string | null {
  const pathSegments = pathname.split('/').filter(Boolean);
  if (pathSegments.length === 0) return null;

  // /fr/gustomenu → locale at [0], slug at [1]
  if (pathSegments.length >= 2 && LOCALE_PREFIXES.has(pathSegments[0])) {
    const candidate = pathSegments[1];
    return PLATFORM_SUBDOMAINS.has(candidate) ? null : candidate;
  }

  // /gustomenu → slug at [0], unless it's just a locale
  const candidate = pathSegments[0];
  if (LOCALE_PREFIXES.has(candidate)) return null;
  if (PLATFORM_SUBDOMAINS.has(candidate)) return null;
  if (RESERVED_SLUGS.has(candidate)) return null;

  return candidate;
}

/**
 * Resolves the marketplace ID only for platform-hosted subdomains (e.g. dev-shop.zone4build.com).
 * Returns null for custom domains — marketplace_id is not required for direct access.
 */
export function resolveMarketplaceId(): string | null {
  if (typeof window === 'undefined') return null;

  const mode = getAccessMode(window.location.hostname);

  // Only marketplace mode requires a marketplace_id
  if (mode !== 'marketplace') return null;

  // Cookie already set (most common case)
  const fromCookie = Cookies.get('MARKETPLACE_ID');
  if (fromCookie) return fromCookie;

  // Fallback: derive from subdomain (e.g. dev-shop.zone4build.com → 'dev-shop')
  const subdomain = window.location.hostname
    .replace(/^www\./, '')
    .split('.')[0];

  // Inject cookie so subsequent requests don't need to re-derive it
  Cookies.set('MARKETPLACE_ID', subdomain, { expires: 1, path: '/' });
  return subdomain;
}

/**
 * Builds a shop-scoped path for use in Link href and router.push.
 *
 * marketplace: toShopRoute('gustomenu', '/checkout') → '/gustomenu/checkout'
 * subdomain:   toShopRoute(null, '/checkout')        → '/checkout'
 * custom:      toShopRoute(null, '/checkout')        → '/checkout'
 *
 * Never produces double slashes.
 */
export function toShopRoute(
  shopSlug: string | null | undefined,
  route: string
): string {
  // delivery-ui doesn't have shops, bypass slug prepending
  const clean = route === '/' ? '' : route.startsWith('/') ? route : `/${route}`;
  return clean || '/';
}

/**
 * Legacy alias for toShopRoute to maintain compatibility.
 */
export function shopPath(slug: string | null | undefined, path: string): string {
  return toShopRoute(slug, path);
}

export function isHubLandingPage(slug: string | null | undefined): boolean {
  return !slug;
}