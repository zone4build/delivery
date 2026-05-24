import Script from 'next/script';
import { Shop } from '@/types';

interface GoogleAdsProps {
  shop: Shop | null;
}

const GoogleAds: React.FC<GoogleAdsProps> = ({ shop }) => {
  const googleAdsId = shop?.settings?.google_ads_id;

  if (!googleAdsId) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
      />
      <Script
        id="google-ads-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAdsId}');
          `,
        }}
      />
    </>
  );
};

export default GoogleAds;
