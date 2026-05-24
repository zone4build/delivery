import Button from '@/components/ui/button';
import { verifiedTokenAtom } from '@/store/checkout';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import getStripe from '@/lib/get-stripejs';
import { useAtom } from 'jotai';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { toast } from "react-toastify";

const StripePayment: React.FC<{ children?: React.ReactNode }> = () => {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col items-center justify-center p-5 border border-gray-200 rounded-md">
      <p className="text-sm text-body text-center">
        {t('text-stripe-redirect-message', 'You will be redirected to Stripe to complete your payment securely.')}
      </p>
    </div>
  );
};

export default StripePayment;
