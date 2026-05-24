import type { Shop, ShopPaginator, ShopQueryOptions } from '@/types';
import { useInfiniteQuery, useQuery } from 'react-query';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { mapPaginatorData } from '@/framework/utils/data-mappers';

export function useShops(options?: Partial<ShopQueryOptions>, config?: any) {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery<ShopPaginator, Error>(
    [API_ENDPOINTS.SHOPS, options],
    ({ queryKey, pageParam }) =>
      client.shops.all(Object.assign({}, queryKey[1], pageParam)),
    {
      getNextPageParam: ({ current_page, last_page }) =>
        last_page > current_page && { page: current_page + 1 },
      ...config
    }
  );


  function handleLoadMore() {
    fetchNextPage();
  }

  const shops = data?.pages?.flatMap((page) => page.data) ?? [];

  return {
    shops,
    paginatorInfo: Array.isArray(data?.pages)
      ? mapPaginatorData(data?.pages[data.pages.length - 1])
      : null,
    isLoading,
    error,
    isFetching,
    isLoadingMore: isFetchingNextPage,
    loadMore: handleLoadMore,
    hasMore: Boolean(hasNextPage),
  };
}
export function useShop(slug: string) {
  const { data, isLoading, error } = useQuery<Shop, Error>(
    [API_ENDPOINTS.SHOPS, slug],
    () => client.shops.get(slug),
    {
      enabled: Boolean(slug),
    }
  );
  return {
    shop: data,
    isLoading,
    error,
  };
}
export function useShopsDiscovery(options?: Partial<ShopQueryOptions> & { search?: string }, config?: any) {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery<ShopPaginator, Error>(
    [API_ENDPOINTS.SHOPS_DISCOVERY, options],
    ({ queryKey, pageParam }) =>
      client.shops.discovery(Object.assign({}, queryKey[1], pageParam)),
    {
      getNextPageParam: ({ current_page, last_page }) =>
        last_page > current_page && { page: current_page + 1 },
      ...config
    }
  );

  function handleLoadMore() {
    fetchNextPage();
  }

  const shops = data?.pages?.flatMap((page) => page.data) ?? [];

  return {
    shops,
    paginatorInfo: Array.isArray(data?.pages)
      ? mapPaginatorData(data?.pages[data.pages.length - 1])
      : null,
    isLoading,
    error,
    isFetching,
    isLoadingMore: isFetchingNextPage,
    loadMore: handleLoadMore,
    hasMore: Boolean(hasNextPage),
  };
}
