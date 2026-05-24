import { verifiedResponseAtom } from '@/store/checkout';
import { useAtom } from 'jotai';
import isEmpty from 'lodash/isEmpty';
import dynamic from 'next/dynamic';
import { useShops } from '@/framework/shop';
import { useRouter } from 'next/router';
import { useCart } from '@/store/quick-cart/cart.context';
import { useTranslation } from 'next-i18next';
import Alert from '@/components/ui/alert';
import { resolveShopSlug } from '@/lib/shop-utils';

const UnverifiedItemList = dynamic(
  () => import('@/components/checkout/item/unverified-item-list')
);
const VerifiedItemList = dynamic(
  () => import('@/components/checkout/item/verified-item-list')
);

export const RightSideView = ({
  hideTitle = false,
}: {
  hideTitle?: boolean;
}) => {
  const { t } = useTranslation('common');
  const { query }: any = useRouter();
  const { items } = useCart();
  const { shops } = useShops({ limit: 100, is_active: 1 });
  
  const shopSlug = query?.shop || query?.slug || resolveShopSlug();
  const cartShopId = items[0]?.shop_id;

  // Find the active shop from the list (pre-fetched by SEO component usually)
  const shop = shops?.find((s: any) => 
    (shopSlug && s.slug === shopSlug) || (cartShopId && s.id === cartShopId)
  );

  const [verifiedResponse] = useAtom(verifiedResponseAtom);

  const isSurCommande = shop?.settings?.isSurCommande;
  const surCommandeMessage = shop?.settings?.surCommandeMessage || t('text-sur-commande-warning');

  return (
    <div className="flex w-full flex-col">
      {isSurCommande && (
        <Alert
          message={surCommandeMessage!}
          variant="warning"
          className="mb-4"
        />
      )}
      {isEmpty(verifiedResponse) ? (
        <UnverifiedItemList hideTitle={hideTitle} />
      ) : (
        <VerifiedItemList />
      )}
    </div>
  );
};

export default RightSideView;

