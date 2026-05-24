import { Image } from '@/components/ui/image';
import { MapPin } from '@/components/icons/map-pin';
import { useTranslation } from 'next-i18next';
import { formatAddress } from '@/lib/format-address';
import { useShopRoutes } from '@/lib/hooks/use-shop-routes';
import Link from '@/components/ui/link';
import isEmpty from 'lodash/isEmpty';
import { productPlaceholder } from '@/lib/placeholders';

type ShopCardProps = {
  shop: any;
};

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  const routes = useShopRoutes();
  const { t } = useTranslation();

  const isNew = false;

  return (
    <Link href={routes.shop(shop.slug)}>
      <div className="relative flex cursor-pointer items-center rounded border border-gray-200 p-5">
        {isNew && (
          <span className="absolute top-2 rounded bg-blue-500 px-2 py-1 text-xs text-light ltr:right-2 rtl:left-2">
            {t('common:text-new')}
          </span>
        )}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-300">
          <Image
            alt={t('common:text-logo')}
            src={shop?.logo?.thumbnail ?? productPlaceholder}
            layout="fill"
            objectFit="cover"
          />
        </div>

        <div className="flex flex-col ltr:ml-4 rtl:mr-4">
          <span className="mb-1 text-lg font-semibold text-heading">
            {shop?.name}
          </span>
          <span className="flex text-xs text-body mb-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted ltr:mr-1 rtl:ml-1" />
            {!isEmpty(formatAddress(shop?.address))
              ? formatAddress(shop?.address)
              : t('common:text-no-address')}
          </span>
          
          {/* Shop Tags - Intent Badges */}
          {shop?.shop_tags && shop.shop_tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {shop.shop_tags.slice(0, 3).map((tag: any) => (
                <span 
                  key={tag.id} 
                  className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold rounded-full uppercase tracking-wider"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;
