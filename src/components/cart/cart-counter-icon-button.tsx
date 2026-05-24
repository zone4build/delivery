import { CartOutlinedIcon } from '@/components/icons/cart-outlined';
import { useState, useEffect } from 'react';
import CartCheckBagIcon from '@/components/icons/cart-check-bag';
import { useCart } from '@/store/quick-cart/cart.context';
import { useAtom } from 'jotai';
import { drawerAtom } from '@/store/drawer-atom';

const CartCounterIconButton = () => {
  const { totalUniqueItems } = useCart();
  const [_, setDisplayCart] = useAtom(drawerAtom);
  const [isHydrated, setIsHydrated] = useState(false);

  // Prevent hydration mismatch by waiting for client-side hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  function handleCartSidebar() {
    setDisplayCart({ display: true, view: 'cart' });
  }

  // Don't show cart count during SSR to prevent hydration mismatch
  const displayCount = isHydrated ? totalUniqueItems : 0;

  return (
    <button
      className="flex items-center justify-center shrink-0 h-auto focus:outline-none transform"
      onClick={handleCartSidebar}
      aria-label="cart-button"
    >
      <div className="flex items-center relative">
        <CartCheckBagIcon />
        {displayCount > 0 && (
          <span className="cart-counter-badge flex items-center justify-center bg-accent text-light absolute -top-3 ltr:-right-3 rtl:-left-3 rounded-full font-bold min-w-[20px] h-5 px-1 text-[10px] shadow-lg">
            {displayCount}
          </span>
        )}
      </div>
    </button>
  );
};

export default CartCounterIconButton;
