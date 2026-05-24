import { useUser } from '@/framework/user';
import OrderDetails from './order-details';
import DeliveryOrderDetail from '@/components/delivery/delivery-order-detail';
import type { Order } from '@/types';
import Spinner from '@/components/ui/loaders/spinner/spinner';

interface Props {
  order: Order;
}

export default function OrderDetailsWrapper({ order }: Props) {
  const { me, isLoading } = useUser();

  if (isLoading) return <Spinner />;

  // Check if user has delivery role
  const userRoles = (me as any)?.permissions?.map((p: any) => p.name?.toLowerCase()) || [];
  const isDeliveryPerson = userRoles.includes('delivery');

  if (isDeliveryPerson) {
    return <DeliveryOrderDetail order={order} />;
  }

  return <OrderDetails order={order} />;
}
