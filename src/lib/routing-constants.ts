export const LOCALE_PREFIXES = new Set([
  'fr', 'en', 'de', 'es', 'nl', 'pt', 'it', 'ar', 'zh', 'ja', 'ko', 'tr'
]);

export const PLATFORM_SUBDOMAINS = new Set([
  'store', 'admin', 'api', 'shop', 'dev-shop', 'localhost',
  process.env.NEXT_PUBLIC_TENANT_ID || 'store2200'
]);

export const MAIN_DOMAINS = ['zone4build.com', 'netlify.app', 'localhost'];

export const NEXTAUTH_INTERNAL_PATHS = new Set([
  'session', 'csrf', 'providers', '_log', 'signout', 'error', 'verify-request', 'callback'
]);

export const RESERVED_SLUGS = new Set([
  'checkout', 'map', 'orders', 'profile', 'logout', 'login', 'register', 'privacy', 'terms', 'contact', 'about-us'
]);

/**
 * Returns which "mode" the current hostname is operating in.
 *
 * subdomain   → gustomenu.zone4build.com   — slug from subdomain, no path prefix needed
 * marketplace → dev-shop.zone4build.com    — slug from path, prefix needed in links
 * custom      → gustomenu.org              — slug from subdomain/domain, no path prefix needed
 */
export type ShopAccessMode = 'subdomain' | 'marketplace' | 'custom';

export function getAccessMode(hostname: string): ShopAccessMode {
  const normalized = hostname.replace(/^www\./, '').toLowerCase().split(':')[0];
  const parts = normalized.split('.');
  const subdomain = parts[0];

  // Check if this is one of our main domains
  const isMainDomain = MAIN_DOMAINS.some(d => normalized.endsWith(d));

  if (isMainDomain) {
    // dev-shop.zone4build.com, store.zone4build.com → marketplace
    if (PLATFORM_SUBDOMAINS.has(subdomain)) {
      return 'marketplace';
    }
    // gustomenu.zone4build.com → subdomain tenant
    if (parts.length >= 3) {
      return 'subdomain';
    }
    // zone4build.com itself → treat as subdomain (will have no slug)
    return 'subdomain';
  }

  // gustomenu.org, custom-shop.com → custom domain
  return 'custom';
}