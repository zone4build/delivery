import type { CategoryPaginator, CategoryQueryOptions } from '@/types';
import { useInfiniteQuery } from 'react-query';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { mapPaginatorData } from '@/framework/utils/data-mappers';
import { useRouter } from "next/router";

export function useCategories(options?: Partial<CategoryQueryOptions>) {
  const { locale } = useRouter();

  const formattedOptions = {
    ...options,
    language: locale
  }

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery<CategoryPaginator, Error>(
    [API_ENDPOINTS.CATEGORIES, formattedOptions],
    ({ queryKey, pageParam }) =>
      client.categories.all(Object.assign({}, queryKey[1], pageParam)),
    {
      getNextPageParam: ({ current_page, last_page }) =>
        last_page > current_page && { page: current_page + 1 },
      // Avoid category refetches when focusing search input/devtools
      // so search-bar interaction only triggers product lookups.
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  function handleLoadMore() {
    fetchNextPage();
  }

  return {
    categories: data?.pages?.flatMap((page) => page.data) ?? [],
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
