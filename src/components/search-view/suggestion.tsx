import dynamic from 'next/dynamic';
import ErrorMessage from '@/components/ui/error-message';
import { useProducts } from '@/framework/product';
import { useRouter } from "next/router";

const AutoSuggestion = dynamic(() => import('@/components/ui/auto-suggestion'));

interface AutoSuggestionProps {
  className?: string;
  searchQuery: string;
  visible: boolean;
}
const AutoSuggestionBox: React.FC<AutoSuggestionProps> = ({
  searchQuery,
  className,
  visible,
}) => {
  const { query } = useRouter();
  const { isLoading, products, error } = useProducts({
    type: query?.pages?.[0] as string,
    searchQuery
  });

  if (error) return <ErrorMessage message={error.message} />;

  return (
    <AutoSuggestion
      suggestions={products}
      notFound={!isLoading && !products.length}
      visible={visible}
      className={className}
      showLoaders={isLoading && !products.length}
    />
  );
};

export default AutoSuggestionBox;
