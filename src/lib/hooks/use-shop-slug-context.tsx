import { createContext, useContext, useMemo, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useTypes } from '@/framework/type';
import { resolveShopSlug, resolveShopSlugForApi } from '@/lib/shop-utils';
import { getAccessMode, ShopAccessMode } from '@/lib/routing-constants';

interface ShopSlugContextValue {
  // For building Link hrefs — null on subdomain/custom (no prefix needed)
  slug: string | null;
  // For API calls — always the real shop slug
  apiSlug: string | null;
  mode: ShopAccessMode;
}

const ShopSlugContext = createContext<ShopSlugContextValue>({
  slug: null,
  apiSlug: null,
  mode: 'subdomain',
});

export function ShopSlugProvider({ children }: { children: ReactNode }) {
  const { types } = useTypes();
  const validSlugs = useMemo(() => types?.map((t: any) => t.slug), [types]);

  const slug = resolveShopSlug(validSlugs);

  const router = useRouter();

  const { apiSlug, mode } = useMemo(() => {
    if (typeof window === 'undefined') {
      return { apiSlug: null, mode: 'subdomain' as ShopAccessMode };
    }
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    return {
      apiSlug: resolveShopSlugForApi(hostname, pathname),
      mode: getAccessMode(hostname),
    };
  }, [router.asPath]);

  const value = useMemo(
    () => ({ slug, apiSlug, mode }),
    [slug, apiSlug, mode]
  );

  return (
    <ShopSlugContext.Provider value={value}>
      {children}
    </ShopSlugContext.Provider>
  );
}

import { useSettings } from '@/framework/settings';

// For building hrefs
export function useShopSlug(): string | null {
  const contextSlug = useContext(ShopSlugContext).slug;
  const { settings }: any = useSettings();
  
  if (!contextSlug && settings?.siteTitle) {
    return settings.siteTitle.toLowerCase();
  }
  
  return contextSlug;
}

// For API calls — always the real slug
export function useShopApiSlug(): string | null {
  return useContext(ShopSlugContext).apiSlug;
}

export function useShopAccessMode(): ShopAccessMode {
  return useContext(ShopSlugContext).mode;
}

import { useShop } from '@/framework/shop';

export function useShopData() {
  const apiSlug = useShopApiSlug();
  const { shop, isLoading } = useShop(apiSlug!);
  return { shop, isLoading };
}
