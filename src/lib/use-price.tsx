import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSettings } from '@/framework/settings';
import { useLocation } from '@/lib/hooks/use-location';

export function formatPrice({
  amount,
  currencyCode,
  locale,
}: {
  amount: number;
  currencyCode: string;
  locale: string;
}) {
  const formatCurrency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'code', // Use currency code instead of symbol
  });

  return formatCurrency.format(amount);
}

export function formatVariantPrice({
  amount,
  baseAmount,
  currencyCode,
  locale,
}: {
  baseAmount: number;
  amount: number;
  currencyCode: string;
  locale: string;
}) {
  const hasDiscount = baseAmount > amount;
  const formatDiscount = new Intl.NumberFormat(locale, { style: 'percent' });
  const discount = hasDiscount
    ? formatDiscount.format((baseAmount - amount) / baseAmount)
    : null;

  const price = formatPrice({ amount, currencyCode, locale });
  const basePrice = hasDiscount
    ? formatPrice({ amount: baseAmount, currencyCode, locale })
    : null;

  return { price, basePrice, discount };
}

export default function usePrice(
  data?: {
    amount: number | string;
    baseAmount?: number | string;
    currencyCode?: string;
  } | null
) {
  const { currency: locationCurrency, loaded: locationLoaded } = useLocation();
  const {
    // @ts-ignore
    settings: { currency: settingsCurrency },
  } = useSettings();
  
  // Priority: Shop Setting (synced to location via _app.tsx) > Global Setting > fallback
  const fallbackCurrency = 'EUR'; // Default to EUR if all else fails
  const activeCurrency = (locationLoaded ? locationCurrency : null) || settingsCurrency || fallbackCurrency;

  const normalizedAmount =
    typeof data?.amount === 'number'
      ? data.amount
      : typeof data?.amount === 'string'
        ? Number.parseFloat(data.amount)
        : NaN;
  const normalizedBaseAmount =
    typeof data?.baseAmount === 'number'
      ? data.baseAmount
      : typeof data?.baseAmount === 'string'
        ? Number.parseFloat(data.baseAmount)
        : undefined;

  const { amount, baseAmount, currencyCode } = {
    ...data,
    amount: Number.isFinite(normalizedAmount) ? normalizedAmount : 0,
    baseAmount:
      typeof normalizedBaseAmount === 'number' && Number.isFinite(normalizedBaseAmount)
        ? normalizedBaseAmount
        : undefined,
    currencyCode: data?.currencyCode || activeCurrency || fallbackCurrency,
  };

  const { locale } = useRouter();
  const value = useMemo(() => {
    const currentLocale = locale ? locale : 'fr';
    if (typeof amount !== 'number' || !currencyCode) {
      return formatPrice({
        amount: 0,
        currencyCode: currencyCode || fallbackCurrency,
        locale: currentLocale,
      });
    }
    return baseAmount
      ? formatVariantPrice({
          amount,
          baseAmount,
          currencyCode,
          locale: currentLocale,
        })
      : formatPrice({ amount, currencyCode, locale: currentLocale });
  }, [amount, baseAmount, currencyCode, locale]);

  return typeof value === 'string'
    ? { price: value, basePrice: null, discount: null }
    : value;
}
