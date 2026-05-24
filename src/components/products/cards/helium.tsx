import { Image } from '@/components/ui/image';
import cn from 'classnames';
import usePrice from '@/lib/use-price';
import { AddToCart } from '@/components/products/add-to-cart/add-to-cart';
import { useTranslation } from 'next-i18next';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { productPlaceholder } from '@/lib/placeholders';
import CartIcon from '@/components/icons/cart';

type HeliumProps = {
  product: any;
  className?: string;
};

import { motion } from 'framer-motion';

const Helium: React.FC<HeliumProps> = ({ product, className }) => {
  const { t } = useTranslation('common');
  const { name, image, unit, quantity, min_price, max_price, product_type } =
    product ?? {};
  const { price, basePrice, discount } = usePrice({
    amount: product.sale_price ? product.sale_price : product.price!,
    baseAmount: product.price,
    currencyCode: product?.currency,
  });
  const { price: minPrice } = usePrice({
    amount: min_price,
    currencyCode: product?.currency,
  });
  const { price: maxPrice } = usePrice({
    amount: max_price,
    currencyCode: product?.currency,
  });

  const { openModal } = useModalAction();

  function handleProductQuickView() {
    return openModal('PRODUCT_DETAILS', product.slug);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'product-card cart-type-helium group h-full overflow-hidden rounded-[2rem] border border-gray-100 bg-light transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5',
        className
      )}
    >
      <div
        onClick={handleProductQuickView}
        className="relative flex h-48 w-auto items-center justify-center sm:h-64"
        role="button"
      >
        <span className="sr-only">{t('text-product-image')}</span>
        <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-gray-50 m-2 shadow-inner">
          <Image
            src={image?.original ?? productPlaceholder}
            alt={name}
            layout="fill"
            objectFit="cover"
            className="product-image transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        {discount && (
          <div className="absolute top-3 rounded-full bg-yellow-500 px-1.5 text-xs font-semibold leading-6 text-light ltr:right-3 rtl:left-3 sm:px-2 md:top-4 md:px-2.5 ltr:md:right-4 rtl:md:left-4">
            {discount}
          </div>
        )}
      </div>
      {/* End of product image */}

      <header className="relative p-3 md:p-5 md:py-6">
        <h3
          onClick={handleProductQuickView}
          role="button"
          className="mb-1 truncate text-lg font-black text-heading tracking-tight hover:text-accent transition-colors"
        >
          {name}
        </h3>
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-60">{unit}</p>
        {/* End of product info */}

        <div className="relative mt-7 flex min-h-6 items-center justify-between md:mt-8">
          {product_type.toLowerCase() === 'variable' ? (
            <>
              <div>
                <span className="text-sm font-semibold text-accent md:text-[15px]">
                  {minPrice}
                </span>
                <span> - </span>
                <span className="text-sm font-semibold text-accent md:text-[15px]">
                  {maxPrice}
                </span>
              </div>

              {Number(quantity) > 0 && (
                <button
                  onClick={handleProductQuickView}
                  className="order-5 flex items-center justify-center rounded-full border-2 border-border-100 bg-light py-2 px-3 text-sm font-semibold text-accent transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-light focus:border-accent focus:bg-accent focus:text-light focus:outline-none sm:order-4 sm:justify-start sm:px-4"
                >
                  <CartIcon className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  <span>{t('text-cart')}</span>
                </button>
              )}
            </>
          ) : (
            <>
              <div className="relative">
                {basePrice && (
                  <del className="absolute -top-4 text-xs italic text-muted text-opacity-75 md:-top-5">
                    {basePrice}
                  </del>
                )}
                <span className="text-xl font-black text-accent tracking-tighter">
                  {price}
                </span>
              </div>

              {Number(quantity) > 0 && (
                <AddToCart data={product} variant="single" />
              )}
            </>
          )}

          {Number(quantity) <= 0 && (
            <div className="rounded bg-red-500 px-2 py-1 text-xs text-light">
              {t('text-out-stock')}
            </div>
          )}
          {/* End of product price */}
        </div>
      </header>
    </motion.article>
  );
};

export default Helium;
