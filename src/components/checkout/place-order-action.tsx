import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import isEmpty from 'lodash/isEmpty';
import classNames from 'classnames';
import { useCreateOrder, useOrderStatuses } from '@/framework/order';
import { useShop } from '@/framework/shop';
import ValidationError from '@/components/ui/validation-error';
import Button from '@/components/ui/button';
import { formatOrderedProduct } from '@/lib/format-ordered-product';
import { useCart } from '@/store/quick-cart/cart.context';
import { resolveMarketplaceId } from '@/lib/shop-utils';
import {
  checkoutAtom,
  discountAtom,
  walletAtom,
  deliveryMethodAtom,
} from '@/store/checkout';
import {
  calculatePaidTotal,
  calculateTotal,
} from '@/store/quick-cart/cart.utils';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

export const PlaceOrderAction: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = (props) => {
  const { t } = useTranslation('common');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { createOrder, isLoading } = useCreateOrder();
  const { locale, query }: any = useRouter();
  const shopSlug = query?.shop || query?.slug || '';
  const { shop }: any = useShop(shopSlug);
  const { items } = useCart();

  const { orderStatuses } = useOrderStatuses({
    limit: 1,
    language: locale
  });

  const [
    {
      billing_address,
      shipping_address,
      delivery_time,
      delivery_method,
      coupon,
      verified_response,
      customer_contact,
      payment_gateway,
      token,
    },
  ] = useAtom(checkoutAtom);
  const [discount] = useAtom(discountAtom);
  const [use_wallet_points] = useAtom(walletAtom);

  useEffect(() => {
    setErrorMessage(null);
  }, [payment_gateway, token]);

  const available_items = items?.filter(
    (item) => !verified_response?.unavailable_products?.includes(item.id)
  );

  const subtotal = calculateTotal(available_items);
  const shipping_charge = delivery_method === 'pickup' ? 0 : (verified_response?.shipping_charge || 0);
  const total = calculatePaidTotal(
    {
      totalAmount: subtotal,
      tax: verified_response?.total_tax!,
      shipping_charge: shipping_charge,
    },
    Number(discount)
  );
  const handlePlaceOrder = () => {
    if (!customer_contact) {
      setErrorMessage('Contact Number Is Required');
      return;
    }
    if (!use_wallet_points && !payment_gateway) {
      setErrorMessage('Gateway Is Required');
      return;
    }
    let input = {
      //@ts-ignore
      products: available_items?.map((item) => formatOrderedProduct(item)),
      status_id: orderStatuses[0]?.id ?? '1',
      amount: subtotal,
      coupon_id: Number(coupon?.id),
      discount: discount ?? 0,
      paid_total: total,
      sales_tax: verified_response?.total_tax,
      delivery_fee: shipping_charge,
      total,
      delivery_time: delivery_time?.title,
      delivery_method,
      customer_contact,
      payment_gateway,
      use_wallet_points,
      billing_address: billing_address?.address
        ? {
          country: billing_address.address.country,
          city: billing_address.address.city,
          state: billing_address.address.state,
          zip: billing_address.address.zip,
          street_address: billing_address.address.street_address,
        }
        : billing_address
          ? {
            country: (billing_address as any).country,
            city: (billing_address as any).city,
            state: (billing_address as any).state,
            zip: (billing_address as any).zip,
            street_address: (billing_address as any).street_address,
          }
          : {},
      shipping_address: delivery_method === 'pickup' ? null : (
        shipping_address?.address
          ? {
            country: shipping_address.address.country,
            city: shipping_address.address.city,
            state: shipping_address.address.state,
            zip: shipping_address.address.zip,
            street_address: shipping_address.address.street_address,
          }
          : shipping_address
            ? {
              country: (shipping_address as any).country,
              city: (shipping_address as any).city,
              state: (shipping_address as any).state,
              zip: (shipping_address as any).zip,
              street_address: (shipping_address as any).street_address,
            }
            : {}
      ),
      marketplace_id: resolveMarketplaceId() ?? undefined,
    };

    //@ts-ignore
    createOrder({ ...input, shop_id: shop?.id });
  };
  const isDigitalCheckout = available_items.find((item) =>
    Boolean(item.is_digital)
  );

  const formatRequiredFields = isDigitalCheckout
    ? [customer_contact, payment_gateway, available_items]
    : [
      customer_contact,
      payment_gateway,
      billing_address,
      ...(delivery_method === 'pickup' ? [] : [shipping_address]),
      delivery_time,
      available_items,
    ];
  const isAllRequiredFieldSelected = formatRequiredFields.every(
    (item) => !isEmpty(item)
  );
  return (
    <>
      <Button
        loading={isLoading}
        className={classNames('mt-5 w-full', props.className)}
        onClick={handlePlaceOrder}
        disabled={!isAllRequiredFieldSelected}
        {...props}
      />
      {errorMessage && (
        <div className="mt-3">
          <ValidationError message={errorMessage} />
        </div>
      )}
      {!isAllRequiredFieldSelected && (
        <div className="mt-3">
          <ValidationError message={t('text-place-order-helper-text')} />
        </div>
      )}
    </>
  );
};
