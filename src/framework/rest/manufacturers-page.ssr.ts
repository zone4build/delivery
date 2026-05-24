import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { SettingsQueryOptions } from '@/types';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery(
      [API_ENDPOINTS.SETTINGS, { language: locale }],
      ({ queryKey }) => client.settings.all(queryKey[1] as SettingsQueryOptions)
    );
    await queryClient.prefetchQuery([API_ENDPOINTS.TYPES, { language: locale }], ({ queryKey }) =>
      client.types.all(queryKey[1] as any)
    );
    await queryClient.prefetchInfiniteQuery(
      [API_ENDPOINTS.MANUFACTURERS, { limit: 30, language: locale }],
      ({ queryKey }) => client.manufacturers.all(queryKey[1] as any)
    );
  } catch (error) {
    console.warn('API not available during build (manufacturers page), using fallback mode:', error);
  }

  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common', 'banner'])),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};
