import { useShopSlug } from '@/lib/hooks/use-shop-slug-context';
import { Routes, shopRoute } from '@/config/routes';
import { useMemo } from 'react';

export function useShopRoutes() {
  const slug = useShopSlug();

  return useMemo(() => ({
    slug,
    home:            shopRoute(slug, Routes.home),
    search:          shopRoute(slug, Routes.search),
    checkout:        shopRoute(slug, Routes.checkout),
    checkoutDigital: shopRoute(slug, Routes.checkoutDigital),
    checkoutGuest:   shopRoute(slug, Routes.checkoutGuest),
    profile:         shopRoute(slug, Routes.profile),
    changePassword:  shopRoute(slug, Routes.changePassword),
    orders:          shopRoute(slug, Routes.orders),
    order:           (tracking_number: string) =>
                       shopRoute(slug, Routes.order(tracking_number)),
    refunds:         shopRoute(slug, Routes.refunds),
    help:            shopRoute(slug, Routes.help),
    logout:          shopRoute(slug, Routes.logout),
    coupons:         shopRoute(slug, Routes.coupons),
    orderReceived:   shopRoute(slug, Routes.orderReceived),
    products:        shopRoute(slug, Routes.products),
    product:         (productSlug: string) =>
                       shopRoute(slug, Routes.product(productSlug)),
    privacy:         shopRoute(slug, Routes.privacy),
    terms:           shopRoute(slug, Routes.terms),
    contactUs:       shopRoute(slug, Routes.contactUs),
    shops:           Routes.shops,
    shop:            (s: string) => Routes.shop(s),
    downloads:       shopRoute(slug, Routes.downloads),
    authors:         shopRoute(slug, Routes.authors),
    author:          (authorSlug: string) =>
                       shopRoute(slug, Routes.author(authorSlug)),
    manufacturers:   shopRoute(slug, Routes.manufacturers),
    manufacturer:    (mSlug: string) =>
                       shopRoute(slug, Routes.manufacturer(mSlug)),
    wishlists:       shopRoute(slug, Routes.wishlists),
    couponGenerator: shopRoute(slug, Routes.couponGenerator),
    questions:       shopRoute(slug, Routes.questions),
    reports:         shopRoute(slug, Routes.reports),
  }), [slug]);
}
