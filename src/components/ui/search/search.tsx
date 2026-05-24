import SearchBox from '@/components/ui/search/search-box';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useSearch } from './search.context';
interface Props {
  label: string;
  variant?: 'minimal' | 'normal' | 'with-shadow' | 'flat';
  [key: string]: unknown;
}

const Search: React.FC<Props> = ({ label, variant, ...props }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { searchTerm, updateSearchTerm } = useSearch();
  const handleOnChange = (e: any) => {
    const { value } = e.target;
    updateSearchTerm(value);
  };

  const onSearch = (e: any) => {
    e.preventDefault();
    if (!searchTerm) return;
    const { pages, ...restQuery } = router.query;
    router.push(
      {
        pathname: router.asPath.split('?')[0],
        query: { ...restQuery, text: searchTerm },
      },
      undefined,
      {
        scroll: false,
      }
    );
  };

  function clearSearch() {
    updateSearchTerm('');
    const { pages, text, ...restQuery } = router.query;
    if (text) {
      router.push(
        {
          pathname: router.asPath.split('?')[0],
          query: { ...restQuery },
        },
        undefined,
        {
          scroll: false,
        }
      );
    }
  }

  return (
    <SearchBox
      label={label}
      onSubmit={onSearch}
      onClearSearch={clearSearch}
      onChange={handleOnChange}
      value={searchTerm}
      name="search"
      placeholder={t('common:text-search-placeholder')}
      variant={variant}
      {...props}
    />
  );
};

export default Search;
