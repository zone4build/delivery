import { useEffect } from 'react';
import { useCategories } from '@/framework/category';
import { useSetAtom } from 'jotai';
import { shopCategoriesAtom } from '@/store/map-search-atom';

export const ShopCategoriesLoader = () => {
  const setShopCategories = useSetAtom(shopCategoriesAtom);
  const { categories, isLoading } = useCategories({
    category_type: 'shop',
    limit: 50,
  });

  useEffect(() => {
    console.log('Fetching Shop Categories...', { isLoading, categories });
    if (!isLoading && categories.length > 0) {
      console.log('Setting Shop Categories:', categories);
      setShopCategories(categories);
    }
  }, [categories, isLoading, setShopCategories]);

  return null;
};
