import { Image } from '@/components/ui/image';
import cn from 'classnames';
import usePrice from '@/lib/use-price';
import { AddToCart } from '@/components/products/add-to-cart/add-to-cart';
import { useTranslation } from 'next-i18next';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { productPlaceholder } from '@/lib/placeholders';
import { PlusIcon } from '@/components/icons/plus-icon';

type NeonProps = {
  product: any;
  className?: string;
};

import { motion } from 'framer-motion';

const Neon: React.FC<NeonProps> = ({ product, className }) => {
  const { t } = useTranslation('common');
  const { name, image, quantity, min_price, max_price, product_type } =
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
        'product-card cart-type-neon group h-full overflow-hidden rounded-[2rem] border border-gray-100 bg-light transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5',
        className
      )}
    >
      <div
        className="relative flex h-48 w-auto cursor-pointer items-center justify-center sm:h-64"
        onClick={handleProductQuickView}
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
          <div className="absolute top-3 rounded bg-accent px-1.5 text-xs font-semibold leading-6 text-light ltr:right-3 rtl:left-3 sm:px-2 md:top-4 md:px-2.5 ltr:md:right-4 rtl:md:left-4">
            {discount}
          </div>
        )}
      </div>
      {/* End of product image */}

      <header className="p-3 md:p-6">
        {product_type.toLowerCase() === 'variable' ? (
          <div className="mb-2">
            <span className="text-sm font-semibold text-heading md:text-base">
              {minPrice}
            </span>
            <span> - </span>
            <span className="text-sm font-semibold text-heading md:text-base">
              {maxPrice}
            </span>
          </div>
        ) : (
          <div className="mb-2 flex items-center">
            <span className="text-sm font-semibold text-heading md:text-base">
              {price}
            </span>
            {basePrice && (
              <del className="text-xs text-muted ltr:ml-2 rtl:mr-2 md:text-sm">
                {basePrice}
              </del>
            )}
          </div>
        )}
        {/* End of product price */}

        <h3
          className="mb-4 cursor-pointer truncate text-sm font-black text-heading tracking-tight hover:text-accent transition-colors"
          onClick={handleProductQuickView}
        >
          {name}
        </h3>
        {/* End of product title */}

        {product_type.toLowerCase() === 'variable' ? (
          <>
            {Number(quantity) > 0 && (
              <button
                onClick={handleProductQuickView}
                className="group flex h-7 w-full items-center justify-between rounded bg-gray-100 text-xs text-body-dark transition-colors hover:border-accent hover:bg-accent hover:text-light focus:border-accent focus:bg-accent focus:text-light focus:outline-none md:h-9 md:text-sm"
              >
                <span className="flex-1">{t('text-add')}</span>
                <span className="grid h-7 w-7 place-items-center bg-gray-200 transition-colors duration-200 group-hover:bg-accent-600 group-focus:bg-accent-600 ltr:rounded-tr ltr:rounded-br rtl:rounded-tl rtl:rounded-bl md:h-9 md:w-9">
                  <PlusIcon className="h-4 w-4 stroke-2" />
                </span>
              </button>
            )}
          </>
        ) : (
          <>
            {Number(quantity) > 0 && (
              <AddToCart variant="neon" data={product} />
            )}
          </>
        )}

        {Number(quantity) <= 0 && (
          <div className="rounded bg-red-500 px-2 py-1.5 text-center text-xs text-light sm:py-2.5">
            {t('text-out-stock')}
          </div>
        )}
        {/* End of add to cart */}
      </header>
    </motion.article>
  );
};

export default Neon;
