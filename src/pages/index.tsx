import OrderList, { useSelectedOrder } from '@/components/orders/order-list';
import Seo from '@/components/seo/seo';
import ErrorMessage from '@/components/ui/error-message';
import { useOrder, useOrders } from '@/framework/order';
import type { Order } from '@/types';
import Spinner from '@/components/ui/loaders/spinner/spinner';
import isEmpty from 'lodash/isEmpty';
import OrderDetailsWrapper from '@/components/orders/order-details-wrapper';
import OrderListMobile from '@/components/orders/order-list-mobile';
import NotFound from '@/components/ui/not-found';
import { getLayout as getSiteLayout } from '@/components/layouts/layout';
import DashboardSidebar from '@/components/dashboard/sidebar';
import { useTranslation } from 'next-i18next';
export { getStaticProps } from '@/framework/general.ssr';

function NoOrderFound() {
  return (
    <div className="my-auto flex h-[80vh] w-full items-center justify-center rounded bg-light p-5 md:p-8">
      <NotFound text="text-no-order-found" />
    </div>
  );
}

export default function DeliveryOrdersPage() {
  const { t } = useTranslation('common');
  const { orders, isLoading, error, hasMore, loadMore, isLoadingMore } =
    useOrders({
        limit: 20,
        assigned: true, // Show orders assigned to the delivery guy
    });
  const [selectedOrder] = useSelectedOrder();
  const selectedTrackingNumber = selectedOrder?.tracking_number ?? '';
  const { order: selectedOrderDetails } = useOrder({
    tracking_number: selectedTrackingNumber,
  });
  const resolvedSelectedOrder = selectedOrderDetails ?? selectedOrder;
  const ordersItem = orders as Order[];

  if (error) return <ErrorMessage message={error.message} />;
  
  if (isLoading && isEmpty(ordersItem)) {
    return (
      <div className="my-auto flex h-[80vh] w-full items-center justify-center rounded bg-light p-5 md:p-8">
        <Spinner simple className="h-10 w-10" />
      </div>
    );
  }

  if (!isLoading && isEmpty(ordersItem)) {
    return <NoOrderFound />;
  }
  
  return (
    <>
      <Seo noindex={true} nofollow={true} />
      <div className="hidden w-full overflow-hidden lg:flex">
        <OrderList
          orders={ordersItem}
          isLoadingMore={isLoadingMore}
          loadMore={loadMore}
          hasMore={hasMore}
        />
        {selectedOrder && (
          <OrderDetailsWrapper
            order={
              resolvedSelectedOrder ??
              ordersItem.find((order) => order.id === selectedOrder.id)!
            }
          />
        )}
      </div>
      <OrderListMobile
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
        hasNextPage={hasMore}
        orders={ordersItem}
      />
    </>
  );
}

const getLayout = (page: React.ReactElement) =>
  getSiteLayout(
    <div className="mx-auto flex w-full max-w-1920 flex-col items-start bg-light py-10 px-5 lg:bg-gray-100 xl:flex-row xl:py-14 xl:px-8 2xl:px-14">
      <DashboardSidebar className="hidden shrink-0 ltr:mr-8 rtl:ml-8 xl:block xl:w-80" />
      {page}
    </div>
  );

DeliveryOrdersPage.authenticationRequired = true;
DeliveryOrdersPage.getLayout = getLayout;
