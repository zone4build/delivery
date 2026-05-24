import usePrice from '@/lib/use-price';
import { formatAddress } from '@/lib/format-address';
import { getPaymentTypeLabel, parseNumberish } from '@/lib/order-display';
import OrderStatuses from '@/components/orders/statuses';
import { useTranslation } from 'next-i18next';
import Link from '@/components/ui/link';
import { useShopRoutes } from '@/lib/hooks/use-shop-routes';
import { Eye } from '@/components/icons/eye-icon';
import { OrderItems } from './order-items';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { SadFaceIcon } from '@/components/icons/sad-face';
import Badge from '@/components/ui/badge';
import type { Order } from '@/types';
import ProgressBar from '@/components/ui/progress-bar';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

interface Props {
  order: Order;
}
const RenderStatusBadge: React.FC<{
  status: string;
}> = ({ status }) => {
  const { t } = useTranslation('common');

  switch (status.toLowerCase()) {
    case 'approved':
      return (
        <Badge
          text={`${t('text-refund')} ${t('text-approved')}`}
          color="bg-accent"
          className="ltr:mr-4 rtl:ml-4"
        />
      );

    case 'rejected':
      return (
        <Badge
          text={`${t('text-refund')} ${t('text-rejected')}`}
          color="bg-red-500"
          className="ltr:mr-4 rtl:ml-4"
        />
      );
    case 'processing':
      return (
        <Badge
          text={`${t('text-refund')} ${t('text-processing')}`}
          color="bg-yellow-500"
          className="ltr:mr-4 rtl:ml-4"
        />
      );
    // case 'pending':
    default:
      return (
        <Badge
          text={`${t('text-refund')} ${t('text-pending')}`}
          color="bg-purple-500"
          className="ltr:mr-4 rtl:ml-4"
        />
      );
  }
};
function RefundView({
  status,
  orderId,
}: {
  status: string;
  orderId: string | number;
}) {
  const { t } = useTranslation('common');
  const { openModal } = useModalAction();

  return (
    <>
      {status ? (
        <RenderStatusBadge status={status} />
      ) : (
        <button
          className="flex items-center text-sm font-semibold text-body transition-colors hover:text-accent disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:text-gray-400 ltr:mr-4 rtl:ml-4"
          onClick={() => openModal('REFUND_REQUEST', orderId)}
          disabled={Boolean(status)}
        >
          <SadFaceIcon width={18} className="ltr:mr-2 rtl:ml-2" />
          {t('text-ask-refund')}
        </button>
      )}
    </>
  );
}

const OrderDetails = ({ order }: Props) => {
  const rawOrder = order as any;
  const routes = useShopRoutes();
  const { t } = useTranslation('common');
  const {
    id,
    products,
    status,
    shipping_address,
    tracking_number,
    refund,
  }: any = order ?? {};
  const paymentTypeRaw =
    rawOrder?.payment_type ?? rawOrder?.payment_method ?? rawOrder?.payment_gateway;
  const paymentType = getPaymentTypeLabel(paymentTypeRaw, t);
  const walletUsedPoints = parseNumberish(
    rawOrder?.wallet_points_used ?? rawOrder?.wallet_point?.points_used,
    0
  );
  const estimatedDeliveryMinutes = parseNumberish(order?.delivery_time_estimation, 0);

  const { price: amount } = usePrice({
    amount: order?.amount,
    currencyCode: order?.currency,
  });
  const { price: discount } = usePrice({
    amount: order?.discount ?? 0,
    currencyCode: order?.currency,
  });
  const { price: total } = usePrice({
    amount: order?.total,
    currencyCode: order?.currency,
  });
  const { price: delivery_fee } = usePrice({
    amount: order?.delivery_fee ?? 0,
    currencyCode: order?.currency,
  });
  const { price: sales_tax } = usePrice({
    amount: order?.sales_tax,
    currencyCode: order?.currency,
  });

  return (
    <div className="flex w-full flex-col border border-border-200 bg-white lg:w-2/3">
      {/* Full-width Order ID Header */}
      <div className="flex flex-col border-b border-border-200 p-5 md:p-8">
        <h2 className="text-lg font-bold text-heading md:text-2xl">
          {t('text-order-details')} - {tracking_number}
        </h2>
      </div>

      <div className="flex flex-col border-b border-border-200 sm:flex-row">
        {/* Left Column: Addresses */}
        <div className="flex w-full flex-col border-b border-border-200 px-5 py-6 sm:border-b-0 ltr:sm:border-r rtl:sm:border-l md:px-8 md:w-1/2">
          <div className="mb-4">
            <span className="mb-3 block text-sm font-bold uppercase tracking-wider text-heading">
              {t('text-shipping-address')}
            </span>

            <span className="text-sm leading-relaxed text-body">
              {formatAddress(shipping_address)}
            </span>
          </div>
          <div className="rounded-lg border border-border-200 bg-gray-50 p-3">
            <span className="block text-xs font-semibold uppercase tracking-wide text-body">
              {t('text-deliver-time')}
            </span>
            <span className="mt-1 block text-sm font-medium text-heading">
              {order?.delivery_time || 'N/A'}
            </span>
          </div>
        </div>

        {/* Right Column: Totals & Refund Info */}
        <div className="flex w-full flex-col px-5 py-6 md:px-8 md:w-1/2 bg-gray-50/50">
          <div className="mb-4 flex justify-between">
            <span className="text-sm text-body">{t('text-sub-total')}</span>
            <span className="text-sm font-semibold text-heading">{amount || 0}</span>
          </div>

          <div className="mb-4 flex justify-between">
            <span className="text-sm text-body">{t('text-discount')}</span>
            <span className="text-sm font-semibold text-heading">{discount || 0}</span>
          </div>

          <div className="mb-4 flex justify-between">
            <span className="text-sm text-body">{t('text-delivery-fee')}</span>
            <span className="text-sm font-semibold text-heading">{delivery_fee || 0}</span>
          </div>
          <div className="mb-4 flex justify-between border-b border-border-200 pb-4">
            <span className="text-sm text-body">{t('text-tax')}</span>
            <span className="text-sm font-semibold text-heading">{sales_tax || 0}</span>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <span className="text-base font-bold text-heading">
              {t('text-total')}
            </span>
            <span className="text-base font-bold text-accent">{total || 0}</span>
          </div>

          <div className="mb-2 flex justify-between">
            <span className="text-sm text-body">{t('text-payment-method')}</span>
            <span className="text-sm font-semibold text-heading">{paymentType}</span>
          </div>
          <div className="mb-2 flex justify-between">
            <span className="text-sm text-body">{t('text-points-used')}</span>
            <span className="text-sm font-semibold text-heading">{walletUsedPoints}</span>
          </div>
          <div className="mb-2 flex justify-between">
            <span className="text-sm text-body">{t('text-deliver-time')}</span>
            <span className="text-sm font-semibold text-heading">
              {order?.delivery_time || 'N/A'}
            </span>
          </div>
          <div className="mb-4 flex justify-between border-b border-border-200 pb-4">
            <span className="text-sm text-body">
              {t('text-estimated-delivery-time')}
            </span>
            <span className="text-sm font-semibold text-heading">
              {estimatedDeliveryMinutes > 0
                ? `${estimatedDeliveryMinutes} ${t('text-min')}`
                : 'N/A'}
            </span>
          </div>

          {/* Refund / Delivery Code Section */}
          <div className="mt-auto pt-6 border-t border-border-200">
            <div className="flex flex-col gap-4">
              {order?.delivery_code && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-heading uppercase tracking-tight">
                    {t('text-delivery-code')}:
                  </span>
                  <Badge
                    text={order.delivery_code}
                    color="bg-accent"
                    className="font-mono tracking-widest px-3 py-1"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between mt-2">
                <RefundView status={refund?.status} orderId={id} />

                {/* @ts-ignore */}
                <Link
                  href={routes.order(tracking_number)}
                  className="flex items-center text-sm font-bold text-accent no-underline transition duration-200 hover:text-accent-hover"
                >
                  <Eye width={20} className="ltr:mr-2 rtl:ml-2" />
                  {t('text-sub-orders')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Table */}
      <div>
        <div className="flex w-full items-center justify-center px-6">
          <OrderStatuses status={status?.serial} language={order?.language} />
        </div>
        <OrderItems products={products} orderId={id} />
      </div>

      {estimatedDeliveryMinutes > 0 && (
        <div className="border-t border-border-200 p-5">
          <h3 className="mb-2 text-sm font-bold text-heading">
            {t('text-delivery-progress')}
          </h3>
          <div className="mb-4 flex items-center justify-between text-xs text-body">
            <span>{t('text-deliver-time')}</span>
            <span>{order?.delivery_time || 'N/A'}</span>
          </div>
          <div className="rounded-lg border border-border-200 bg-gray-50 p-4">
            <div className="flex justify-between text-sm text-body">
              <span>{t('text-out-for-delivery')}</span>
              <span>{estimatedDeliveryMinutes} {t('text-min')}</span>
            </div>
            <DeliveryProgress
              startTime={order.updated_at}
              estimation={estimatedDeliveryMinutes}
            />
          </div>
        </div>
      )}

      {order?.delivery_proof && (
        <div className="border-t border-border-200 p-5">
          <h3 className="mb-4 text-sm font-bold text-heading">
            {t('text-delivery-proof', 'Delivery Proof')}
          </h3>
          <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
            {order.delivery_proof.photo_url && (
              <div className="mb-4 w-full md:mb-0 md:w-1/3">
                <img
                  src={order.delivery_proof.photo_url}
                  alt="Delivery Proof"
                  className="rounded border border-border-200 shadow-sm"
                />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm text-body italic">
                "{order.delivery_proof.notes || t('text-no-delivery-notes', 'No specific notes provided.')}"
              </p>
              <p className="mt-2 text-xs text-gray-400">
                {t('text-delivered-at', 'Delivered at')}: {new Date(order.delivery_proof.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;

const DeliveryProgress = ({ startTime, estimation }: { startTime: any, estimation: number }) => {
  const { t } = useTranslation('common');
  const [progress, setProgress] = useState(0);
  const [remaining, setRemaining] = useState(estimation);

  useEffect(() => {
    const calculateProgress = () => {
      const start = dayjs(startTime);
      const now = dayjs();
      const elapsedMinutes = now.diff(start, 'minute');
      const newProgress = Math.min(100, Math.max(0, (elapsedMinutes / estimation) * 100));
      setProgress(newProgress);
      setRemaining(Math.max(0, estimation - elapsedMinutes));
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [startTime, estimation]);

  return (
    <div>
      <div className="mt-3">
        <ProgressBar
          value={progress}
          total={100}
          className="h-2.5 rounded-full bg-gray-200"
          color="bg-accent"
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-body">
        <span>{Math.round(progress)}%</span>
        <p>
        {remaining > 0
          ? `${t('text-arriving-in')} ~${remaining} ${t('text-min')}`
          : t('text-delivery-completed')}
        </p>
      </div>
    </div>
  );
};
