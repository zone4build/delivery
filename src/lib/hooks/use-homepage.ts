import { TYPES_PER_PAGE } from '@/framework/client/variables';
import { useTypes } from '@/framework/type';
import { useRouter } from 'next/router';

export default function useHomepage() {
  const { types } = useTypes({
    limit: TYPES_PER_PAGE,
  });
  const router = useRouter();

  const getSubdomain = () => {
    // 1. Priority: router query if we have internal rewrite
    const pages = router.query.pages as string[];
    if (pages && pages.length > 0) {
      if (types?.some((t: any) => t.slug === pages[0])) {
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

  if (!types) {
    return {
      homePage: {
        slug: subdomain || '',
      },
    };
  }
  return {
    homePage: types.find((type: any) => type?.settings?.isHome || type.slug === subdomain) ?? {
      slug: 'map',
    },
  };
}
