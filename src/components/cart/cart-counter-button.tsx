import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CartCheckBagIcon from '@/components/icons/cart-check-bag';
import { formatString } from '@/lib/format-string';
import usePrice from '@/lib/use-price';
import { drawerAtom } from '@/store/drawer-atom';
import { useCart } from '@/store/quick-cart/cart.context';
import { useAtom } from 'jotai';
import { useTranslation } from 'next-i18next';

const CartCounterButton = () => {
  const { t } = useTranslation();
  const { items, totalUniqueItems, total } = useCart();
  const [_, setDisplayCart] = useAtom(drawerAtom);
  const [isHydrated, setIsHydrated] = useState(false);

  const { price: totalPrice } = usePrice({
    amount: total,
    currencyCode: items?.[0]?.currency,
  });

  // Prevent hydration mismatch by waiting for client-side hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  function handleCartSidebar() {
    setDisplayCart({ display: true, view: 'cart' });
  }

  // Don't show cart data during SSR to prevent hydration mismatch
  const displayItems = isHydrated ? totalUniqueItems : 0;
  const displayPrice = isHydrated ? totalPrice : '';

  const router = useRouter();
  const isMapPage = 
    router.pathname.includes('/map') || 
    router.asPath.includes('/map') || 
    (router.query.pages as string[])?.includes('map') ||
    (typeof window !== 'undefined' && window.location.pathname.includes('/map'));

  return (
    <button
      className={`${
        isMapPage ? 'flex' : 'hidden lg:flex'
      } product-cart flex-col items-center justify-center p-3 pt-3.5 fixed top-1/2 -mt-12 ltr:right-0 rtl:left-0 z-[10020] shadow-900 rounded ltr:rounded-tr-none rtl:rounded-tl-none ltr:rounded-br-none rtl:rounded-bl-none bg-accent text-light text-sm font-semibold transition-colors duration-200 focus:outline-none hover:bg-accent-hover`}
      onClick={handleCartSidebar}
    >
      <span className="flex pb-0.5">
        <CartCheckBagIcon className="shrink-0" width={14} height={16} />
        <span className="flex ltr:ml-2 rtl:mr-2">
          {formatString(displayItems, t('common:text-item'))}
        </span>
      </span>
      {displayItems > 0 && (
        <span className="bg-light rounded w-full py-2 px-2 text-accent mt-3">
          {displayPrice}
        </span>
      )}
    </button>
  );
};

export default CartCounterButton;
