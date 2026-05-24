import { useAtom } from 'jotai';
import { scannerAtom } from '@/store/scanner-atom';
import BarcodeScanner from '@/components/ui/scanner/barcode-scanner';
import { useUpdateOrder } from '@/framework/order';
import { toast } from 'react-toastify';
import client from '@/framework/client';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import Spinner from '@/components/ui/loaders/spinner/spinner';

export default function ManagedScanner() {
  const [scanner, setScanner] = useAtom(scannerAtom);
  const { updateOrder } = useUpdateOrder();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);

  if (!scanner.display) return null;

  const handleScan = async (trackingNumber: string) => {
    if (loading) return;
    
    setLoading(true);
    try {
      // 1. Fetch order details to get the numeric ID
      const order = await client.orders.get(trackingNumber);
      
      if (!order) {
        toast.error(t('text-order-not-found', 'Order not found'));
        setLoading(false);
        return;
      }

      // 2. Update status to 6 (Out for Delivery)
      updateOrder({
        id: order.id,
        status_id: 6,
      }, {
        onSuccess: () => {
          setScanner({ display: false });
          toast.success(`${t('text-order', 'Order')} ${trackingNumber} ${t('text-is-out-for-delivery', 'is now out for delivery')}`);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || t('text-error-updating-order', 'Error updating order'));
        },
        onSettled: () => {
          setLoading(false);
        }
      });
    } catch (error: any) {
      toast.error(t('text-order-not-found', 'Order not found or access denied'));
      setLoading(false);
    }
  };

  return (
    <>
      <BarcodeScanner 
        onScan={handleScan} 
        onClose={() => setScanner({ display: false })} 
      />
      {loading && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/20">
          <Spinner className="h-12 w-12" />
        </div>
      )}
    </>
  );
}
