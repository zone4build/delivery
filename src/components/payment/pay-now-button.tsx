import Button from '@/components/ui/button';
import { useCreatePaymentSession } from '@/framework/payment';
import { useTranslation } from 'next-i18next';

interface PayNowButtonProps {
    orderId: string;
    gateway?: string;
    variant?: 'normal' | 'outline' | 'custom';
    className?: string;
}

const PayNowButton: React.FC<PayNowButtonProps> = ({
    orderId,
    gateway = 'stripe',
    variant = 'normal',
    className,
}) => {
    const { t } = useTranslation('common');
    const { createPaymentSession, isLoading } = useCreatePaymentSession();

    return (
        <Button
            loading={isLoading}
            disabled={isLoading}
            onClick={() => createPaymentSession({ orderId, gateway })}
            variant={variant}
            className={className}
        >
            {t('text-pay-now')}
        </Button>
    );
};

export default PayNowButton;
