import SearchBox from '@/components/ui/search/search-box';
import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';
import AutoSuggestionBox from '@/components/search-view/suggestion';
import GlobalDiscoverySuggestion from '@/components/search-view/global-discovery-suggestion';
import cn from 'classnames';
import { useAtom } from 'jotai';
import { mapSearchAtom } from '@/store/map-search-atom';
import { useShopApiSlug } from '@/lib/hooks/use-shop-slug-context';

interface Props {
  label: string;
  className?: string;
  variant?: 'minimal' | 'normal' | 'with-shadow';
  [key: string]: unknown;
}

const SearchWithSuggestion: React.FC<Props> = ({
  label,
  className,
  variant,
  ...props
}) => {
  const { t } = useTranslation();

  const [searchTerm, updateSearchTerm] = useState('');
  const [mapSearch, setMapSearch] = useAtom(mapSearchAtom);
  const apiSlug = useShopApiSlug();

  // If apiSlug exists, we're inside a specific shop → use original search
  // If apiSlug is null, we're on the home/map page → use global discovery
  const isInsideShop = Boolean(apiSlug);

  // State for the debounced search term used by the suggestion boxes
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search update to prevent focus loss and heavy re-renders while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (!isInsideShop) {
        setMapSearch(searchTerm);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, isInsideShop, setMapSearch]);

  const handleOnChange = (e: any) => {
    const { value: inputValue } = e.target;
    updateSearchTerm(inputValue);
  };

  const onSearch = (e: any) => {
    e.preventDefault();
    if (!searchTerm) return;
  };

  function clearSearch() {
    updateSearchTerm('');
    setDebouncedSearchTerm('');
    if (!isInsideShop) {
      setMapSearch('');
    }
  }
  return (
    <div className={cn('relative w-full', className)}>
      <SearchBox
        label={label}
        onSubmit={onSearch}
        onClearSearch={clearSearch}
        onChange={handleOnChange}
        value={searchTerm}
        name="search"
        placeholder={t('common:text-search-placeholder-minimal')}
        variant={variant}
        {...props}
      />

      {isInsideShop ? (
        <AutoSuggestionBox
          searchQuery={debouncedSearchTerm}
          visible={Boolean(debouncedSearchTerm.length > 2)}
        />
      ) : (
        <GlobalDiscoverySuggestion
          searchQuery={debouncedSearchTerm}
          visible={Boolean(debouncedSearchTerm.length > 2)}
        />
      )}
    </div>
  );
};

export default SearchWithSuggestion;
