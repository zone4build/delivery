import { useState, useEffect, useRef } from 'react';
import usePrice from '@/lib/use-price';
import { useTranslation } from 'next-i18next';
import type { Order } from '@/types';
import CustomerContactCard from './customer-contact-card';
import DeliveryTimeline from './delivery-timeline';
import { OrderItems } from '../orders/order-items';
import Badge from '@/components/ui/badge';
import { API_ENDPOINTS } from '@/framework/rest/client/api-endpoints';
import client from '@/framework/rest/client';

interface Props {
    order: Order;
    onDelivered?: () => void;
}

const DeliveryOrderDetail = ({ order, onDelivered }: Props) => {
    const { t } = useTranslation('common');
    const [enteredCode, setEnteredCode] = useState('');
    const [validating, setValidating] = useState(false);
    const [codeValid, setCodeValid] = useState<boolean | null>(null);
    const [validationMessage, setValidationMessage] = useState('');
    const [delivering, setDelivering] = useState(false);
    const [delivered, setDelivered] = useState(false);
    const didDeliver = useRef(false);

    const {
        id,
        products,
        status,
        tracking_number,
        payment_gateway,
        total,
        delivery_time,
    }: any = order ?? {};

    const { price: codPrice } = usePrice({
        amount: total,
        currencyCode: order?.currency,
    });
    const isCOD = payment_gateway?.toLowerCase() === 'cod' || payment_gateway?.toLowerCase() === 'cash_on_delivery';

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        setEnteredCode(value);
        setCodeValid(null);
        setValidationMessage('');
        didDeliver.current = false;
    };

    // Step 1: Auto-validate after 4 characters
    useEffect(() => {
        if (enteredCode.trim().length === 4 && !didDeliver.current) {
            (async () => {
                setValidating(true);
                try {
                    const result: any = await client.orders.validateCode(id, enteredCode.trim());
                    setCodeValid(result.valid);
                    setValidationMessage(result.message);
                } catch {
                    setCodeValid(false);
                    setValidationMessage(t('text-code-validation-error', 'Unable to validate. Try again.'));
                } finally {
                    setValidating(false);
                }
            })();
        }
    }, [enteredCode, id, t]);

    // Step 2: When code is valid, directly update order to Delivered (status_id 7) — no modal
    useEffect(() => {
        if (codeValid === true && !didDeliver.current) {
            didDeliver.current = true;
            (async () => {
                setDelivering(true);
                try {
                    await client.orders.update({ id, status_id: 7 }); // 7 = Delivered
                    setDelivered(true);
                    onDelivered?.();
                } catch {
                    setValidationMessage(t('text-delivery-update-error', 'Code correct but failed to update order. Please try again.'));
                    setCodeValid(null);
                    didDeliver.current = false;
                } finally {
                    setDelivering(false);
                }
            })();
        }
    }, [codeValid, id, t, onDelivered]);

    const inputBorderClass = codeValid === null
        ? 'border-border-200 text-heading'
        : codeValid
            ? 'border-green-500 bg-green-50 text-green-700'
            : 'border-red-400 bg-red-50 text-red-600';

    return (
        <div className="flex w-full flex-col border border-border-200 bg-white lg:w-2/3">
            {/* Header */}
            <div className="border-b border-border-200 bg-white p-5">
                <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-heading">
                        {tracking_number}
                    </h2>
                    <Badge
                        text={delivered ? t('text-delivered', 'Delivered') : (status?.name || t('text-order-status', 'Status'))}
                        color={delivered ? 'bg-accent' : status?.serial === 6 ? 'bg-orange-500' : 'bg-gray-500'}
                    />
                </div>
                {delivery_time && (
                    <p className="text-sm text-body">
                        {t('text-delivery-time', 'Delivery Time')}: <span className="font-medium">{delivery_time}</span>
                    </p>
                )}
            </div>

            {/* Delivery Timeline */}
            <div className="bg-white p-5">
                <DeliveryTimeline currentStatus={delivered ? 7 : (status?.serial || 1)} />
            </div>

            {/* Customer Contact Card */}
            <div className="p-5">
                <CustomerContactCard order={order} />
            </div>

            {/* Delivery Code Verification — only when Out for Delivery */}
            {status?.serial === 6 && !delivered && (
                <div className="mx-5 mb-4 rounded-lg border-2 border-border-200 bg-white p-4 shadow-sm">
                    <p className="mb-1 text-sm font-semibold text-heading">
                        🔐 {t('text-verify-delivery-code', 'Verify Delivery Code')}
                    </p>
                    <p className="mb-3 text-xs text-body">
                        {t('text-ask-customer-code', 'Ask the customer to read their secret delivery code.')}
                    </p>
                    <input
                        type="text"
                        value={enteredCode}
                        onChange={handleCodeChange}
                        placeholder="----"
                        maxLength={4}
                        disabled={delivering}
                        className={`w-full rounded-md border-2 px-4 py-3 text-center text-2xl font-bold uppercase tracking-widest outline-none transition-all ${delivering
                            ? 'border-border-200 animate-pulse opacity-50'
                            : validating
                                ? 'border-border-200 animate-pulse'
                                : inputBorderClass
                            }`}
                    />
                    {delivering && (
                        <p className="mt-2 text-xs font-medium text-accent">
                            ⏳ {t('text-updating-order', 'Updating order...')}
                        </p>
                    )}
                    {codeValid === false && !delivering && (
                        <p className="mt-2 text-xs font-medium text-red-500">
                            ❌ {validationMessage || t('text-code-incorrect', 'Incorrect code. Please try again.')}
                        </p>
                    )}
                </div>
            )}

            {/* Success state after delivery confirmed */}
            {delivered && (
                <div className="mx-5 mb-4 rounded-lg border-2 border-green-300 bg-green-50 p-5 text-center">
                    <p className="text-2xl">✅</p>
                    <p className="mt-1 text-base font-semibold text-green-700">
                        {t('text-delivery-confirmed', 'Delivery Confirmed!')}
                    </p>
                    <p className="mt-1 text-xs text-green-600">
                        {t('text-order-marked-delivered', 'The order has been marked as delivered.')}
                    </p>
                </div>
            )}

            {/* COD Payment Information */}
            {isCOD && !delivered && (
                <div className="mx-5 mb-4 rounded-lg border-2 border-red-200 bg-red-50 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-heading">
                                {t('text-payment-method', 'Payment Method')}
                            </p>
                            <p className="text-xs text-body">{t('text-cash-on-delivery', 'Cash on Delivery')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-body">{t('text-amount-to-collect', 'Amount to Collect')}</p>
                            <p className="text-2xl font-bold text-red-600">{codPrice}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Items */}
            <div className="bg-white">
                <div className="border-b border-border-200 p-5">
                    <h3 className="text-base font-semibold text-heading">
                        {t('text-order-items', 'Order Items')}
                    </h3>
                </div>
                <OrderItems products={products} orderId={id} />
            </div>

            <div className="h-32 md:h-0" />
        </div>
    );
};

export default DeliveryOrderDetail;
