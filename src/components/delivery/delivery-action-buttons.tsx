import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { CheckCircle, AlertTriangle } from '@/components/icons';

interface Props {
    orderId: string | number;
    orderStatus: number;
    codeVerified?: boolean;
    onStatusUpdate?: (newStatus: number) => void;
}

const DeliveryActionButtons = ({ orderId, orderStatus, codeVerified = true, onStatusUpdate }: Props) => {
    const { t } = useTranslation('common');
    const { openModal } = useModalAction();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleConfirmDelivery = () => {
        openModal('CONFIRM_DELIVERY', { orderId, onSuccess: onStatusUpdate });
    };

    const handleReportIssue = () => {
        openModal('REPORT_DELIVERY_ISSUE', { orderId, onSuccess: onStatusUpdate });
    };

    // Only show action buttons if order is "Out for Delivery" (serial 6)
    if (orderStatus !== 6) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-border-200 bg-white p-4 shadow-lg md:relative md:border-0 md:shadow-none">
            <div className="mx-auto flex max-w-screen-sm flex-col gap-3">
                {/* Primary Action: Confirm Delivery */}
                <button
                    onClick={handleConfirmDelivery}
                    disabled={isUpdating || !codeVerified}
                    className="flex items-center justify-center rounded-lg bg-accent px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <CheckCircle className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                    {t('text-confirm-delivery', 'Confirm Delivery')}
                </button>
                {!codeVerified && (
                    <p className="text-center text-xs text-gray-500">
                        🔐 {t('text-enter-code-to-confirm', 'Enter the customer\'s delivery code above to enable this button')}
                    </p>
                )}

                {/* Secondary Action: Report Issue */}
                <button
                    onClick={handleReportIssue}
                    disabled={isUpdating}
                    className="flex items-center justify-center rounded-lg border-2 border-orange-500 bg-white px-6 py-3 text-base font-semibold text-orange-500 transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <AlertTriangle className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                    {t('text-report-issue', 'Report Issue')}
                </button>
            </div>
        </div>
    );
};

export default DeliveryActionButtons;
