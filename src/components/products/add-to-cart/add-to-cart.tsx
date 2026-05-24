import { useState, useEffect } from 'react';
import Counter from '@/components/ui/counter';
import AddToCartBtn from '@/components/products/add-to-cart/add-to-cart-btn';
import { cartAnimation } from '@/lib/cart-animation';
import { useCart } from '@/store/quick-cart/cart.context';
import { generateCartItem } from '@/store/quick-cart/generate-cart-item';

interface Props {
  data: any;
  variant?:
  | 'helium'
  | 'neon'
  | 'argon'
  | 'oganesson'
  | 'single'
  | 'big'
  | 'text';
  counterVariant?:
  | 'helium'
  | 'neon'
  | 'argon'
  | 'oganesson'
  | 'single'
  | 'details';
  counterClass?: string;
  variation?: any;
  disabled?: boolean;
}

import { useShopData } from '@/lib/hooks/use-shop-slug-context';
import { WhatsAppIcon } from '@/components/icons/whatsapp';
import { useTranslation } from 'next-i18next';
import cn from 'classnames';

export const AddToCart = ({
  data,
  variant = 'helium',
  counterVariant,
  counterClass,
  variation,
  disabled,
}: Props) => {
  const { t } = useTranslation('common');
  const [isHydrated, setIsHydrated] = useState(false);
  const { shop } = useShopData();
  const isOrderingEnabled = shop?.settings?.enableOrdering !== false;
  const shopContact = shop?.settings?.contact || (shop as any)?.owner?.profile?.contact;

  const {
    addItemToCart,
    removeItemFromCart,
    isInStock,
    getItemFromCart,
    isInCart,
    updateCartLanguage,
    language
  } = useCart();

  // Prevent hydration mismatch by waiting for client-side hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const item = generateCartItem(data, variation);

  function handleWhatsAppInquiry(e: React.MouseEvent) {
    e.stopPropagation();
    const phoneNumber = shopContact?.replace(/\D/g, '');
    const message = encodeURIComponent(`${t('text-whatsapp-inquiry-message', "Hello, I'm interested in")}: ${data.name} (${window.location.href})`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  }

  if (isHydrated && !isOrderingEnabled) {
    return (
      <button
        onClick={handleWhatsAppInquiry}
        className="flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-full transition-transform hover:scale-110 focus:outline-none shadow-md"
        style={{ backgroundColor: '#25D366', color: '#fff' }}
        title={t('text-contact-on-whatsapp', 'Contact on WhatsApp')}
      >
        <WhatsAppIcon className="h-5 w-5 md:h-6 md:w-6" />
      </button>
    );
  }

  const handleAddClick = (
    e: React.MouseEvent<HTMLButtonElement | MouseEvent>
  ) => {
    e.stopPropagation();
    // Check language and update
    if (item?.language !== language) {
      updateCartLanguage(item?.language);
    }
    addItemToCart(item, 1);
    if (!isInCart(item.id)) {
      cartAnimation(e);
    }
  };
  const handleRemoveClick = (e: any) => {
    e.stopPropagation();
    removeItemFromCart(item.id);
  };
  const outOfStock = isInCart(item?.id) && !isInStock(item.id);

  // Always render AddToCartBtn during SSR to prevent hydration mismatch
  const itemInCart = isHydrated && isInCart(item?.id);

  return !itemInCart ? (
    <AddToCartBtn
      disabled={disabled || outOfStock}
      variant={variant}
      onClick={handleAddClick}
    />
  ) : (
    <>
      <Counter
        value={getItemFromCart(item.id).quantity}
        onDecrement={handleRemoveClick}
        onIncrement={handleAddClick}
        variant={counterVariant || variant}
        className={counterClass}
        disabled={outOfStock}
      />
    </>
  );
};
