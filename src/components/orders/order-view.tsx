import { useEffect } from 'react';
import dayjs from 'dayjs';
import Link from '@/components/ui/link';
import usePrice from '@/lib/use-price';
import { formatAddress } from '@/lib/format-address';
import { formatString } from '@/lib/format-string';
import { getPaymentTypeLabel, parseNumberish } from '@/lib/order-display';
import { useShopRoutes } from '@/lib/hooks/use-shop-routes';
import { useTranslation } from 'next-i18next';
import { useCart } from '@/store/quick-cart/cart.context';
import { CheckMark } from '@/components/icons/checkmark';
import Badge from '@/components/ui/badge';
import { OrderItems } from '@/components/orders/order-items';
import { useAtom } from 'jotai';
import { clearCheckoutAtom } from '@/store/checkout';
import SuborderItems from '@/components/orders/suborder-items';
import Spinner from '@/components/ui/loaders/spinner/spinner';
import isEmpty from 'lodash/isEmpty';
import OrderStatuses from '@/components/orders/statuses';
import { useOrder } from '@/framework/order';
import { useRouter } from 'next/router';
import { useUser } from '@/framework/rest/user';
import DeliveryOrderDetail from '@/components/delivery/delivery-order-detail';
import ProgressBar from '@/components/ui/progress-bar';
import SuborderAccordion from '@/components/orders/suborder-accordion';


function MarketplaceOrderView({ order, language }: any) {
  const routes = useShopRoutes();
  const { t } = useTranslation('common');
  const { me } = useUser();
  const { resetCart } = useCart();
  const [, resetCheckout] = useAtom(clearCheckoutAtom);
  const router = useRouter();

  // Fallback: read delivery_code from sessionStorage if not in API response
  // (delivery_code is captured at order creation time and saved to sessionStorage)
  const storedDeliveryCode = typeof window !== 'undefined'
    ? sessionStorage.getItem(`delivery_code_${order?.tracking_number}`)
    : null;
  const deliveryCode = order?.delivery_code || storedDeliveryCode;
  const paymentTypeRaw =
    order?.payment_type ?? order?.payment_method ?? order?.payment_gateway;
  const paymentType = getPaymentTypeLabel(paymentTypeRaw, t);
  const walletUsedPoints = parseNumberish(
    order?.wallet_points_used ?? order?.wallet_point?.points_used,
    0
  );
  const estimatedDeliveryMinutes = parseNumberish(order?.delivery_time_estimation, 0);
  const deliveryProgress = (() => {
    if (!estimatedDeliveryMinutes || !order?.updated_at) return 0;
    const elapsed = dayjs().diff(dayjs(order.updated_at), 'minute');
    return Math.min(100, Math.max(0, (elapsed / estimatedDeliveryMinutes) * 100));
  })();

  useEffect(() => {
    resetCart();
    resetCheckout();
  }, [resetCart, resetCheckout]);

  console.log('ORDER DATA IN VIEW:', order);
  const { price: total } = usePrice({
    amount: order?.paid_total!,
    currencyCode: order?.currency,
  });
  const { price: wallet_total } = usePrice({
    amount: order?.wallet_point?.amount!,
    currencyCode: order?.currency,
  });
  const { price: sub_total } = usePrice({
    amount: order?.amount!,
    currencyCode: order?.currency,
  });
  const { price: shipping_charge } = usePrice({
    amount: order?.delivery_fee ?? 0,
    currencyCode: order?.currency,
  });
  const { price: tax } = usePrice({
    amount: order?.sales_tax ?? 0,
    currencyCode: order?.currency,
  });
  const { price: discount } = usePrice({
    amount: order?.discount ?? 0,
    currencyCode: order?.currency,
  });
  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto w-full max-w-screen-lg rounded border bg-light p-6 shadow-sm sm:p-8 lg:p-12">
        <h2 className="mb-9 flex flex-col items-center justify-between text-base font-bold text-heading sm:mb-12 sm:flex-row">
          <span className="order-2 mt-5 ltr:mr-auto rtl:ml-auto sm:order-1 sm:mt-0">
            <span className="ltr:mr-4 rtl:ml-4">{t('text-status')} :</span>
            <Badge
              text={typeof order?.status?.name === 'object'
                ? (order?.status?.name[order?.language || 'en'] || order?.status?.name['en'])
                : order?.status?.name!}
              className="whitespace-nowrap text-sm font-normal"
            />
          </span>
          <div className="flex items-center space-x-4 rtl:space-x-reverse sm:order-2">
            <button
              onClick={() => router.reload()}
              className="inline-flex items-center text-sm font-semibold text-accent hover:text-accent-hover transition-colors focus:outline-none"
            >
              <svg className="h-4 w-4 ltr:mr-2 rtl:ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('text-refresh', 'Refresh')}
            </button>
            <Link
              href={routes.home}
              className="inline-flex items-center text-base font-normal text-accent underline hover:text-accent-hover hover:no-underline"
            >
              {t('text-back-to-home')}
            </Link>
          </div>
        </h2>

        {order?.children && order?.children?.length > 0 ? (
          <div className="mb-12">
            <h2 className="mb-6 text-xl font-bold text-heading">
              {t('text-details', 'Details')} ({order.children.length})
            </h2>
            <div className="mb-6 flex items-start rounded border border-border-200 p-4 bg-gray-50">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-dark px-2 ltr:mr-3 rtl:ml-3">
                <CheckMark className="h-2 w-2 shrink-0 text-light" />
              </span>
              <p className="text-sm text-heading">
                <span className="font-bold">{t('text-note', 'Note')}:</span>{' '}
                {t('message-sub-order', 'This order has products from multiple vendors. So we divided this order into multiple vendor orders.')}
              </p>
            </div>
            <SuborderAccordion suborders={order?.children} />
          </div>
        ) : null}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 md:mb-12 lg:grid-cols-4">
          <div className="rounded border border-border-200 py-4 px-5 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-heading">
              {t('text-order-number')}
            </h3>
            <p className="text-sm text-body-dark">{order?.tracking_number}</p>
          </div>
          <div className="rounded border border-border-200 py-4 px-5 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-heading">
              {t('text-date')}
            </h3>
            <p className="text-sm text-body-dark">
              {dayjs(order?.created_at).format('MMMM D, YYYY')}
            </p>
          </div>
          <div className="rounded border border-border-200 py-4 px-5 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-heading">
              {t('text-total')}
            </h3>
            <p className="text-sm text-body-dark">{total}</p>
          </div>
          <div className="rounded border border-border-200 py-4 px-5 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-heading">
              {t('text-payment-method')}
            </h3>
            <p className="text-sm text-body-dark">
              {paymentType}
            </p>
          </div>
          {deliveryCode && (
            <div className="rounded border border-border-200 py-4 px-5 shadow-sm bg-accent/10">
              <h3 className="mb-2 text-sm font-semibold text-accent">
                {t('text-delivery-code')}
              </h3>
              <p className="text-lg font-bold text-accent tracking-widest">
                {deliveryCode}
              </p>
            </div>
          )}
        </div>
        {/* end of order received */}

        {/* start of order Status */}
        <div className="mb-8 flex w-full items-center justify-center md:mb-12">
          <OrderStatuses status={order?.status?.serial} language={language} />
        </div>
        {/* end of order Status */}

        <div className="flex flex-col lg:flex-row">
          <div className="mb-12 w-full lg:mb-0 lg:w-1/2 ltr:lg:pr-3 rtl:lg:pl-3">
            <h2 className="mb-6 text-xl font-bold text-heading">
              {t('text-total-amount')}
            </h2>
            <div>
              <p className="mt-5 flex text-body-dark">
                <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                  {t('text-sub-total')}
                </strong>
                :
                <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12">
                  {sub_total || '—'}
                </span>
              </p>
              <p className="mt-5 flex text-body-dark">
                <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                  {t('text-shipping-charge')}
                </strong>
                :
                <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12">
                  {shipping_charge || '—'}
                </span>
              </p>
              <p className="mt-5 flex text-body-dark">
                <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                  {t('text-tax')}
                </strong>
                :
                <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12">
                  {tax || '—'}
                </span>
              </p>
              <p className="mt-5 flex text-body-dark">
                <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                  {t('text-discount')}
                </strong>
                :
                <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12">
                  {discount || '—'}
                </span>
              </p>
              <p className="mt-5 flex text-body-dark">
                <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                  {t('text-total')}
                </strong>
                :
                <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12">
                  {total || '—'}
                </span>
              </p>
              {wallet_total && (
                <p className="mt-5 flex text-body-dark">
                  <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                    {t('text-paid-from-wallet')}
                  </strong>
                  :
                  <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12">
                    {wallet_total}
                  </span>
                </p>
              )}
              <p className="mt-5 flex text-body-dark">
                <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                  {t('text-points-used')}
                </strong>
                :
                <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12">
                  {walletUsedPoints}
                </span>
              </p>
            </div>
          </div>
          {/* end of total amount */}

          <div className="w-full lg:w-1/2 ltr:lg:pl-3 rtl:lg:pr-3">
            <h2 className="mb-6 text-xl font-bold text-heading">
              {t('text-order-details')}
            </h2>
            <div>
              <p className="mt-5 flex text-body-dark">
                <strong className="w-4/12 text-sm font-semibold text-heading">
                  {t('text-total-item')}
                </strong>
                :
                <span className="w-8/12 text-sm ltr:pl-4 rtl:pr-4 ">
                  {formatString(order?.products?.length, t('text-item'))}
                </span>
              </p>
              {!isEmpty(order?.delivery_time) && (
                <p className="mt-5 flex text-body-dark">
                  <strong className="w-4/12 text-sm font-semibold text-heading">
                    {t('text-deliver-time')}
                  </strong>
                  :
                  <span className="w-8/12 text-sm ltr:pl-4 rtl:pr-4 ">
                    {order?.delivery_time}
                  </span>
                </p>
              )}
              {estimatedDeliveryMinutes > 0 && (
                <p className="mt-5 flex text-body-dark">
                  <strong className="w-4/12 text-sm font-semibold text-heading">
                    {t('text-estimated-delivery-time')}
                  </strong>
                  :
                  <span className="w-8/12 text-sm ltr:pl-4 rtl:pr-4 ">
                    {estimatedDeliveryMinutes} {t('text-min')}
                  </span>
                </p>
              )}
              {!isEmpty(order?.shipping_address) && (
                <p className="mt-5 flex text-body-dark">
                  <strong className="w-4/12 text-sm font-semibold text-heading">
                    {t('text-shipping-address')}
                  </strong>
                  :
                  <span className="w-8/12 text-sm ltr:pl-4 rtl:pr-4 ">
                    {formatAddress(order?.shipping_address!)}
                  </span>
                </p>
              )}
            </div>
          </div>
          {/* end of order details */}
        </div>
        <div className="mt-12">
          <OrderItems products={order?.products} orderId={order?.id} />
        </div>
        {estimatedDeliveryMinutes > 0 && (
          <div className="mt-8 rounded-lg border border-border-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between text-sm text-body">
              <span>{t('text-delivery-progress')}</span>
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                {Math.round(deliveryProgress)}%
              </span>
            </div>
            <ProgressBar
              value={deliveryProgress}
              total={100}
              className="h-2.5 rounded-full bg-gray-200"
              color="bg-accent"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-body">
              <span>{t('text-deliver-time')}: {order?.delivery_time || 'N/A'}</span>
              <span>
                {estimatedDeliveryMinutes} {t('text-min')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Order() {
  const { query } = useRouter();
  const { order, isLoading } = useOrder({
    tracking_number: query.tracking_number!.toString(),
    order_id: query.order_id as string,
  });
  const { me } = useUser();

  if (isLoading) {
    return <Spinner showText={false} />;
  }

  // Check if user has delivery role
  const userRoles = (me as any)?.permissions?.map((p: any) => p.name?.toLowerCase()) || [];
  const isDeliveryPerson = userRoles.includes('delivery');

  // Show delivery UI for delivery personnel
  if (isDeliveryPerson && order) {
    return (
      <div className="p-4 sm:p-8">
        <div className="mx-auto w-full max-w-screen-lg">
          <DeliveryOrderDetail order={order} />
        </div>
      </div>
    );
  }

  // Show customer UI for everyone else
  return <MarketplaceOrderView order={order} language={order?.language} />;
}
