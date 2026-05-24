import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { deliveryMethodAtom } from '@/store/checkout';
import { useTranslation } from 'next-i18next';
import classNames from 'classnames';
import { useSettings } from '@/framework/settings';
import { useShopData } from '@/lib/hooks/use-shop-slug-context';

export const DeliveryPickupToggle = () => {
    const { t } = useTranslation('common');
    const [deliveryMethod, setDeliveryMethod] = useAtom(deliveryMethodAtom);
    const { settings } = useSettings();
    const { deliveryConfig } = settings;
    const { shop, isLoading } = useShopData();

    const isDeliveryEnabled = shop?.settings?.enableDelivery !== false;
    const showDeliveryTab = isDeliveryEnabled;

    useEffect(() => {
        if (!isLoading && !isDeliveryEnabled && deliveryMethod === 'delivery') {
            setDeliveryMethod('pickup');
        }
    }, [isDeliveryEnabled, isLoading, deliveryMethod, setDeliveryMethod]);

    if (isLoading) return null;

    // If only one option is available, hide the toggle but keep the logic
    const singleOption = !showDeliveryTab;

    return (
        <div className="flex flex-col mb-8 bg-light p-5 rounded shadow-sm">
            <h3 className="text-lg font-semibold text-heading mb-4">
                {t('text-delivery-method', 'Delivery Method')}
            </h3>
            
            {!singleOption ? (
                <div className="flex items-center space-x-4">
                    {showDeliveryTab && (
                        <button
                            onClick={() => setDeliveryMethod('delivery')}
                            className={classNames(
                                'flex-1 py-3 px-4 rounded border font-semibold transition-all',
                                deliveryMethod === 'delivery'
                                    ? 'border-accent bg-accent text-light'
                                    : 'border-gray-200 bg-transparent text-body'
                            )}
                        >
                            🚚 {deliveryConfig?.homeDelivery?.title || t('text-home-delivery')}
                        </button>
                    )}
                    <button
                        onClick={() => setDeliveryMethod('pickup')}
                        className={classNames(
                            'flex-1 py-3 px-4 rounded border font-semibold transition-all',
                            deliveryMethod === 'pickup'
                                ? 'border-accent bg-accent text-light'
                                : 'border-gray-200 bg-transparent text-body'
                        )}
                    >
                        🏬 {deliveryConfig?.pickup?.title || t('text-self-pickup')}
                    </button>
                </div>
            ) : (
                <div className="py-2 px-4 bg-gray-50 rounded border border-gray-200 text-heading font-medium">
                    {deliveryMethod === 'pickup' ? (
                        <span>🏬 {deliveryConfig?.pickup?.title || t('text-self-pickup')}</span>
                    ) : (
                        <span>🚚 {deliveryConfig?.homeDelivery?.title || t('text-home-delivery')}</span>
                    )}
                </div>
            )}

            <p className="mt-2 text-sm text-gray-500 italic">
                {deliveryMethod === 'pickup'
                    ? deliveryConfig?.pickup?.description || t('text-pickup-description', 'Come to the store and take it yourself (0€ fee)')
                    : deliveryConfig?.homeDelivery?.description || t('text-delivery-description', 'Delivered to your doorstep (+50€ fee)')}
            </p>

            {deliveryMethod === 'pickup' && shop?.settings?.pickup_instructions && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded">
                    <h4 className="text-sm font-bold text-orange-800 mb-1">
                        {t('text-pickup-instructions', 'Pickup Instructions')}
                    </h4>
                    <p className="text-sm text-orange-700 whitespace-pre-line">
                        {shop.settings.pickup_instructions}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DeliveryPickupToggle;
