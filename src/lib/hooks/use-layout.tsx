import { TYPES_PER_PAGE } from '@/framework/client/variables';
import { useTypes } from '@/framework/type';
import { useRouter } from 'next/router';
const useLayout = () => {
  const data = useTypes({
    limit: TYPES_PER_PAGE,
  });
  const router = useRouter();

  // Extract subdomain for shop context
  const getSubdomain = () => {
    // 1. Priority: router query if we have internal rewrite
    const pages = router.query.pages as string[];
    if (pages && pages.length > 0) {
      if (data?.types?.some((t) => t.slug === pages[0])) {
        return pages[0];
      }
    }

    // 2. Fallback: Hostname extraction
    if (typeof window === 'undefined') return null;
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      const sub = parts[0];
      const excluded = ['www', 'localhost', '127', 'admin'];
      if (!excluded.some((ex) => sub.includes(ex))) {
        return sub;
      }
    }
    return null;
  };

  const subdomain = getSubdomain();
  const regex = /^\/$|^\/\?(.*)/;

  if (regex.test(router?.asPath) || subdomain) {
    const homePage =
      data?.types?.find((type) => type?.settings?.isHome || type.slug === subdomain) ??
      data?.types?.[0];
    return {
      layout: homePage?.settings?.layoutType ?? 'default',
      page: homePage,
    };
  }

  const page =
    data?.types?.find((type) => router.asPath.includes(type.slug) || type.slug === subdomain);
  return {
    layout: page?.settings?.layoutType ?? 'default',
    page,
  };
};

export default useLayout;
