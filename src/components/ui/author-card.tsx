import cn from 'classnames';
import { avatarPlaceholder } from '@/lib/placeholders';
import { Image } from '@/components/ui/image';
import Link from '@/components/ui/link';
import { useShopRoutes } from '@/lib/hooks/use-shop-routes';

interface AuthorItemProps {
  item: any;
}

const AuthorCard: React.FC<AuthorItemProps> = ({ item }) => {
  const routes = useShopRoutes();
  return (
    <Link
      href={routes.author(item?.slug)}
      className={cn(
      'group relative flex cursor-pointer flex-col items-center bg-light text-center'
    )}
  >
    <span
      className={cn(
        'relative mb-6 flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-350'
      )}
    >
      <Image
        src={item?.image?.original! ?? avatarPlaceholder}
        alt={item?.name!}
        layout="fill"
        objectFit="contain"
      />
    </span>
    <span className="block text-center font-semibold text-heading transition-colors group-hover:text-orange-500">
      {item.name}
    </span>
    </Link>
  );
};

export default AuthorCard;
