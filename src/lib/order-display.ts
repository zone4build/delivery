type TranslateFn = (key: string) => string;

export function parseNumberish(
  value: unknown,
  fallback = 0
): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function getPaymentTypeLabel(
  paymentTypeRaw: unknown,
  t: TranslateFn
): string {
  const raw =
    typeof paymentTypeRaw === 'string' ? paymentTypeRaw.trim().toLowerCase() : '';

  if (raw === 'cod' || raw === 'cash_on_delivery' || raw === 'cash') {
    return t('text-cash-on-delivery');
  }
  if (raw === 'stripe') return t('text-stripe');
  if (raw === 'full_wallet_payment') return t('text-wallet');
  if (!raw) return 'N/A';

  return raw
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char: string) => char.toUpperCase());
}
