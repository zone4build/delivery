import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useOrder } from '@/framework/order';
import Spinner from '@/components/ui/loaders/spinner/spinner';
import ErrorMessage from '@/components/ui/error-message';
import DeliveryOrderDetail from '@/components/delivery/delivery-order-detail';
import { getLayout } from '@/components/layouts/layout';
export { getServerSideProps } from '@/framework/order.ssr';

export default function OrderDetailsPage() {
  const { query } = useRouter();
  const { t } = useTranslation('common');
  const { order, isLoading, error } = useOrder({
    tracking_number: query.tracking_number!.toString(),
    order_id: query.order_id as string,
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!order) return <ErrorMessage message={t('text-order-not-found', 'Order not found')} />;

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto w-full max-w-screen-lg">
        <DeliveryOrderDetail order={order} />
      </div>
    </div>
  );
}

OrderDetailsPage.authenticationRequired = true;
OrderDetailsPage.getLayout = getLayout;
