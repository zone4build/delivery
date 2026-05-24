import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import ErrorMessage from '@/components/ui/error-message';
import { useShopsDiscovery } from '@/framework/shop';
import { useAtomValue } from 'jotai';
import { availableShopIdsAtom, categorySearchAtom } from '@/store/map-search-atom';

const AutoSuggestion = dynamic(() => import('@/components/ui/auto-suggestion'));

interface GlobalDiscoveryProps {
  className?: string;
  searchQuery: string;
  visible: boolean;
}

const GlobalDiscoverySuggestion: React.FC<GlobalDiscoveryProps> = ({
  searchQuery,
  className,
  visible,
}) => {
  const availableShopIds = useAtomValue(availableShopIdsAtom);
  const selectedCategory = useAtomValue(categorySearchAtom);
  
  // If we have available shop IDs from the map, pass them directly
  const shopFilter = availableShopIds?.length > 0 
    ? availableShopIds.join(',') 
    : undefined;

  const { isLoading, shops, error } = useShopsDiscovery({
    search: searchQuery,
    category_id: selectedCategory ?? undefined,
    shop_id: shopFilter,
  }, {
    // Enable if we have a search term OR a category filter
    enabled: visible && (searchQuery.length > 2 || selectedCategory) && availableShopIds?.length > 0
  });

  // Flatten the matching_products from all shops into a single list for AutoSuggestion
  const accumulatedProducts = useMemo(() => {
    return shops?.flatMap(shop => 
      (shop as any).matching_products?.map((product: any) => ({
        ...product,
        shop: {
          id: shop.id,
          slug: shop.slug,
          name: shop.name
        }
      }))
    ).filter(Boolean) ?? [];
  }, [shops]);

  if (error) return <ErrorMessage message={error.message} />;

  return (
    <AutoSuggestion
      suggestions={accumulatedProducts}
      notFound={!isLoading && !accumulatedProducts.length}
      visible={visible}
      className={className}
      showLoaders={isLoading && !accumulatedProducts.length}
    />
  );
};

export default GlobalDiscoverySuggestion;
