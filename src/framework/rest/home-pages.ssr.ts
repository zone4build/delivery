import type {
  CategoryQueryOptions,
  HomePageProps,
  PopularProductQueryOptions,
  SettingsQueryOptions,
  TypeQueryOptions,
} from '@/types';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import invariant from 'tiny-invariant';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import {
  CATEGORIES_PER_PAGE,
  PRODUCTS_PER_PAGE,
  TYPES_PER_PAGE,
} from './client/variables';

type ParsedQueryParams = {
  pages: string[];
};

// This function gets called at build time
export const getStaticPaths: GetStaticPaths<ParsedQueryParams> = async ({
  locales,
}) => {
  invariant(locales, 'locales is not defined');

  try {
    const data = await client.types.all({ limit: 100 });
    const paths = data?.flatMap((type) =>
      locales?.map((locale) => ({ params: { pages: [type.slug] }, locale }))
    );
    // We'll pre-render only these paths at build time also with the slash route.
    return {
      paths: paths.concat(
        locales?.map((locale) => ({ params: { pages: [] }, locale }))
      ),
      fallback: 'blocking',
    };
  } catch (error) {
    // If API is not available during build (e.g., in CI/CD), return empty paths
    // Pages will be generated on-demand thanks to fallback: 'blocking'
    console.warn('API not available during build, using fallback mode:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps<
  HomePageProps,
  ParsedQueryParams
> = async ({ locale, params }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    [API_ENDPOINTS.SETTINGS, { language: locale }],
    ({ queryKey }) => client.settings.all(queryKey[1] as SettingsQueryOptions)
  );
  const types = await queryClient.fetchQuery(
    [API_ENDPOINTS.TYPES, { limit: TYPES_PER_PAGE, language: locale }],
    ({ queryKey }) => client.types.all(queryKey[1] as TypeQueryOptions)
  );

  const { pages } = params!;
  let pageType: string | undefined;
  let subPage: string | undefined;

  if (pages && pages.length > 0) {
    // We have paths, likely from a subdomain rewrite or direct access
    // e.g., ['grocery'] or ['grocery', 'map']
    if (types.some((t) => t.slug === pages[0])) {
      pageType = pages[0];
      subPage = pages[1];
    } else {
      pageType = pages[0];
    }
  } else {
    // Root of the main domain
    const homeType = types.find((type) => type?.settings?.isHome);
    if (!homeType) {
      // Final fallback if no home is designated - use first available type for context
      // but force subPage to 'map' to display the map page
      pageType = types?.[0]?.slug;
      subPage = 'map';
    } else {
      pageType = homeType.slug;
    }
  }

  // Handle /map or other sub-pages internally
  if (subPage === 'map') {
    // We could potentially redirect or render the Map component directly
    // For now, let's just pass this info to the props
  }

  if (!pageType || !types?.some((t: any) => t.slug === pageType)) {
    // Instead of forcing a browser redirect to /map, we just internally
    // default to the first available type and render the map layout.
    pageType = types?.[0]?.slug;
    subPage = 'map';
  }

  await queryClient.prefetchQuery(
    [API_ENDPOINTS.TYPES, { slug: pageType, language: locale }],
    ({ queryKey }: any) => client.types.get(queryKey[1])
  );
  const productVariables = {
    type: pageType,
    limit: PRODUCTS_PER_PAGE,
  };
  await queryClient.prefetchInfiniteQuery(
    [API_ENDPOINTS.PRODUCTS, { limit: PRODUCTS_PER_PAGE, type: pageType, language: locale }],
    ({ queryKey }) => client.products.all(queryKey[1] as any)
  );

  const popularProductVariables = {
    type_slug: pageType,
    limit: 10,
    with: 'type;author',
    language: locale
  };

  // Only prefetch popular products for `book` demo
  if (pageType === 'book') {
    await queryClient.prefetchQuery(
      [API_ENDPOINTS.PRODUCTS_POPULAR, popularProductVariables],
      ({ queryKey }) =>
        client.products.popular(queryKey[1] as PopularProductQueryOptions)
    );
  }

  const categoryVariables = {
    type: pageType,
    limit: CATEGORIES_PER_PAGE,
    language: locale,
    parent:
      types.find((t) => t.slug === pageType)?.settings.layoutType === 'minimal'
        ? 'all'
        : 'null',
  };
  await queryClient.prefetchInfiniteQuery(
    [API_ENDPOINTS.CATEGORIES, categoryVariables],
    ({ queryKey }) => client.categories.all(queryKey[1] as CategoryQueryOptions)
  );

  await queryClient.prefetchInfiniteQuery(
    [API_ENDPOINTS.SHOPS, { limit: 100 }],
    ({ queryKey }) => client.shops.all(queryKey[1] as any)
  );

  return {
    props: {
      variables: {
        popularProducts: popularProductVariables,
        products: productVariables,
        categories: categoryVariables,
        types: {
          type: pageType,
          subPage: subPage || null,
        },
      },
      layout:
        types.find((t) => t.slug === pageType)?.settings.layoutType ??
        'default',
      ...(await serverSideTranslations(locale!, ['common', 'banner'])),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
    revalidate: 120,
  };
};

/* Fix : locales: 14kB,
popularProducts: 30kB,
category: 22kB,
groups: 8kB,
group: 2kB,
settings: 2kB,
perProduct: 4.2 * 30 = 120kB,
total = 14 + 30 + 22 + 8 + 2 + 2 + 120 = 198kB
others: 225 - 198 = 27kB

 */
