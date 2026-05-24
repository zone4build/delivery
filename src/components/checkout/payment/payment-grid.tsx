import { RadioGroup } from '@headlessui/react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import Alert from '@/components/ui/alert';
import StripePayment from '@/components/checkout/payment/stripe';
import CashOnDelivery from '@/components/checkout/payment/cash-on-delivery';
import { useAtom } from 'jotai';
import { paymentGatewayAtom, PaymentMethodName } from '@/store/checkout';
import cn from 'classnames';
import { useCart } from '@/store/quick-cart/cart.context';
import { useShops } from '@/framework/shop';
import { useEffect } from 'react';

interface PaymentMethodInformation {
  name: string;
  value: PaymentMethodName;
  icon: string;
  component: React.FunctionComponent;
}

const PaymentGrid: React.FC<{
  className?: string;
  theme?: 'bw';
  children?: React.ReactNode;
}> = ({ className, theme }) => {
  const [gateway, setGateway] = useAtom<PaymentMethodName>(paymentGatewayAtom);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation('common');
  const { items } = useCart();
  const shopId = items[0]?.shop_id;
  const { shops } = useShops({
    limit: 1,
    is_active: 1,
    shop_id: shopId,
  });

  // Find the specific shop from the loaded shops (since we don't have a direct getShop hook that takes an ID easily accessible here without slug)
  // In a real scenario, we might want to fetch the specific shop by ID or slug.
  // Assuming simple case where we can find the shop in the list or we need to refine how we get the shop settings.
  // Actually, let's use the shops list and find the matching ID.
  const currentShop = shops.find((s: any) => s.id === shopId) || shops[0];

  // If we can't find a shop (e.g. empty cart), default to true to show all options, 
  // though checkout is likely disabled anyway. 
  // If we found a shop but payment_settings is missing, default to true (backward compatibility).
  const isOnlinePaymentEnabled = currentShop?.payment_settings?.enable_online_payment === true;
  // Payment Methods Mapping Object

  const AVAILABLE_PAYMENT_METHODS_MAP: Record<
    PaymentMethodName,
    PaymentMethodInformation
  > = {
    STRIPE: {
      name: 'Stripe',
      value: 'STRIPE',
      icon: '/payment/stripe.png',
      component: StripePayment,
    },
    CASH_ON_DELIVERY: {
      name: t('text-cash-on-delivery'),
      value: 'CASH_ON_DELIVERY',
      icon: '',
      component: CashOnDelivery,
    },
  };

  const filteredPaymentMethods = (isOnlinePaymentEnabled
    ? AVAILABLE_PAYMENT_METHODS_MAP
    : {
      CASH_ON_DELIVERY: AVAILABLE_PAYMENT_METHODS_MAP.CASH_ON_DELIVERY,
    }) as Record<string, PaymentMethodInformation>;

  useEffect(() => {
    if (!isOnlinePaymentEnabled && gateway === 'STRIPE') {
      setGateway('CASH_ON_DELIVERY');
    }
  }, [isOnlinePaymentEnabled, gateway, setGateway]);

  const PaymentMethod = filteredPaymentMethods[gateway] || filteredPaymentMethods['CASH_ON_DELIVERY'];
  const Component = PaymentMethod?.component ?? StripePayment;
  return (
    <div className={className}>
      {errorMessage ? (
        <Alert
          message={t(`common:${errorMessage}`)}
          variant="error"
          closeable={true}
          className="mt-5"
          onClose={() => setErrorMessage(null)}
        />
      ) : null}

      <RadioGroup value={gateway} onChange={setGateway}>
        <RadioGroup.Label className="mb-5 block text-base font-semibold text-heading">
          {t('text-choose-payment')}
        </RadioGroup.Label>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {Object.values(filteredPaymentMethods).map(
            ({ name, icon, value }) => (
              <RadioGroup.Option value={value} key={value}>
                {({ checked }) => (
                  <div
                    className={cn(
                      'relative flex h-full w-full cursor-pointer items-center justify-center rounded border border-gray-200 bg-light py-3 text-center',
                      checked && '!border-accent bg-light shadow-600',
                      {
                        '!border-gray-800 bg-light shadow-600':
                          theme === 'bw' && checked,
                      }
                    )}
                  >
                    {icon ? (
                      <>
                        {/* eslint-disable */}
                        <img src={icon} alt={name} className="h-[30px]" />
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-heading">
                        {name}
                      </span>
                    )}
                  </div>
                )}
              </RadioGroup.Option>
            )
          )}
        </div>
      </RadioGroup>
      <div>
        <Component />
      </div>
    </div>
  );
};

export default PaymentGrid;
