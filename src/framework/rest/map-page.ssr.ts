import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { SettingsQueryOptions } from '@/types';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery(
        [API_ENDPOINTS.SETTINGS, { language: locale }],
        ({ queryKey }) => client.settings.all(queryKey[1] as SettingsQueryOptions)
    );

    await queryClient.prefetchInfiniteQuery(
        [API_ENDPOINTS.SHOPS, { limit: 100 }],
        ({ queryKey }) => client.shops.all(queryKey[1] as any)
    );

    return {
        props: {
            layout: 'default',
            ...(await serverSideTranslations(locale!, ['common'])),
            dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
        },
        revalidate: 120,
    };
};
