// src/config/routes.ts

export const Routes = {
  home: '/',
  checkout: '/checkout',
  checkoutDigital: '/checkout/digital',
  checkoutGuest: '/checkout/guest',
  profile: '/profile',
  changePassword: '/change-password',
  orders: '/',
  order: (tracking_number: string) =>
    `/orders/${encodeURIComponent(tracking_number)}`,
  refunds: '/refunds',
  help: '/help',
  logout: '/logout',
  coupons: '/offers',
  orderReceived: '/order-received',
  products: '/products',
  product: (slug: string) => `/products/${encodeURIComponent(slug)}`,
  privacy: '/privacy',
  terms: '/terms',
  contactUs: '/contact',
  shops: '/shops',
  shop: (slug: string) => `/${encodeURIComponent(slug)}`,
  downloads: '/downloads',
  authors: '/authors',
  author: (slug: string) => `/authors/${encodeURIComponent(slug)}`,
  manufacturers: '/manufacturers',
  manufacturer: (slug: string) =>
    `/manufacturers/${encodeURIComponent(slug)}`,
  search: '/search',
  wishlists: '/wishlists',
  couponGenerator: '/coupon-generator',
  questions: '/questions',
  reports: '/reports',
};

/**
 * Prefixes a route with the shop slug when on the marketplace hub.
 *
 * shopRoute('gustomenu', '/checkout')   → '/gustomenu/checkout'
 * shopRoute(null,        '/checkout')   → '/checkout'
 * shopRoute('gustomenu', '/')           → '/gustomenu'
 */
export function shopRoute(
  shopSlug: string | null | undefined,
  route: string
): string {
  if (!shopSlug) return route;
  // Avoid double slash when route is exactly '/'
  const clean = route === '/' ? '' : route.startsWith('/') ? route : `/${route}`;
  if (clean === `/${shopSlug}` || clean.startsWith(`/${shopSlug}/`)) {
    return clean || '/';
  }
  return `/${shopSlug}${clean}`;
}