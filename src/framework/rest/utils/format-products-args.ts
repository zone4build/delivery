import { ProductQueryOptions } from '@/types';

export const formatProductsArgs = (options?: Partial<ProductQueryOptions>) => {
  // Destructure
  const {
    limit = 30,
    price,
    categories,
    name,
    searchType,
    searchQuery,
    text,
    ...restOptions
  } = options || {};

  return {
    limit,
    ...(price && { min_price: price as string }),
    ...(name && { name: name.toString() }),
    ...(categories && { categories: categories.toString() }),
    ...(searchType && { type: searchType.toString() }),
    ...(text && { text: text.toString() }),
    ...(searchQuery && { text: searchQuery.toString() }),
    ...restOptions,
  };
};
