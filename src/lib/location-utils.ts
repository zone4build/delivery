/**
 * Currency Mapping and Exchange Rate Utilities
 * Mirrored from ui/shop
 */

export const COUNTRY_CURRENCY_MAP: Record<string, { currency: string; symbol: string }> = {
  TN: { currency: 'TND', symbol: 'د.ت' },
  AE: { currency: 'AED', symbol: 'د.إ' },
  QA: { currency: 'QAR', symbol: 'ر.ق' },
  US: { currency: 'USD', symbol: '$' },
  BE: { currency: 'EUR', symbol: '€' },
  FR: { currency: 'EUR', symbol: '€' },
  DE: { currency: 'EUR', symbol: '€' },
};

// Base exchange rates (Target per 1 USD) - Fallback values
// In a production app, these should be fetched from an API
export const EXCHANGE_RATES: Record<string, number> = {
  TND: 3.12,
  AED: 3.67,
  QAR: 3.64,
  USD: 1.0,
  EUR: 0.93,
};

export interface LocationInfo {
  country: string;
  currency: string;
  rate: number;
}

export async function detectLocation(): Promise<LocationInfo> {
  // Development or Native bypass: Avoid rate limits and CORS blocks
  const isLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    (window as any).Capacitor?.isNativePlatform()
  );

  if (isLocal) {
    return {
      country: 'BE',
      currency: 'EUR',
      rate: 0.93,
    };
  }

  try {
    let data;

    // Attempt 1: ipwho.is (Primary - generous free tier, HTTPS)
    try {
      const response = await fetch('https://ipwho.is/');
      if (response.ok) {
        const rawData = await response.json();
        if (rawData.success === false) throw new Error('ipwho.is rate limited');
        data = {
          country_code: rawData.country_code,
          currency: rawData.currency?.code,
        };
      } else {
        throw new Error('ipwho.is HTTP error');
      }
    } catch (e) {
      console.warn('[Location] Primary API (ipwho.is) failed, trying fallback (ipapi.co)...');

      // Attempt 2: ipapi.co (Fallback - strict daily limits)
      const fallbackResponse = await fetch('https://ipapi.co/json/');
      if (fallbackResponse.ok) {
        data = await fallbackResponse.json();
      } else {
        throw new Error('Both location APIs failed');
      }
    }

    console.log('[Location] API Response:', data.country_code, data.currency);

    const country = data.country_code || 'US';
    const mapping = COUNTRY_CURRENCY_MAP[country] || COUNTRY_CURRENCY_MAP['US'];

    const info = {
      country,
      currency: mapping.currency,
      rate: EXCHANGE_RATES[mapping.currency] || 1.0,
    };

    console.log('[Location] Success:', info.currency);
    return info;
  } catch (error) {
    return {
      country: 'US',
      currency: 'USD',
      rate: 1.0,
    };
  }
}
