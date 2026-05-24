import { useRouter } from 'next/router';
import { NextSeo, NextSeoProps } from 'next-seo';
import { useTypes } from '@/framework/type';
import { useShops } from '@/framework/shop';
import { useEffect, useState } from 'react';

interface SeoProps extends NextSeoProps {
  title?: string;
  description?: string;
  url?: string;
  images?: any[] | null;
  canonical?: string;
}

const DEFAULT_DESCRIPTION = "Zone4Build - Premium Multi-Tenant SaaS Platform"; 
const DEFAULT_TITLE = "Zone4Build"; 

const Seo = ({
  title,
  description,
  images,
  url,
  canonical,
  ...props
}: SeoProps) => {
  const { locale, defaultLocale } = useRouter();
  const { types } = useTypes();
  const { shops } = useShops({ limit: 1000 });
  const [host, setHost] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHost(window.location.protocol + '//' + window.location.host);
    }
  }, []);

  const localePath = locale !== defaultLocale ? `/${locale}` : '';
  const cleanUrl = url?.replace(/^\//, '') || '';
  
  // Dynamic slugs from backend
  const marketplaceShops = types?.map((t: any) => t.slug) || [];
  
  const urlParts = cleanUrl.split('/');
  const firstSegment = urlParts[0];
  
  // Determine the active slug
  let currentSlug = (firstSegment && marketplaceShops.includes(firstSegment)) ? firstSegment : '';
  
  const currentHost = host || (typeof window !== 'undefined' ? window.location.host : '');
  const cleanHost = currentHost.replace(/^https?:\/\//, '');

  if (!currentSlug) {
    const hostParts = cleanHost.split('.');
    currentSlug = marketplaceShops.find(s => hostParts.includes(s)) || '';
  }

  // Fallback: If we are on a custom domain, find the shop that owns this domain
  let activeShop = shops?.find((s: any) => s.slug === currentSlug);
  
  if (!activeShop && cleanHost) {
      activeShop = shops?.find((s: any) => {
          const shopWebsite = s?.settings?.website?.replace(/^https?:\/\//, '').replace(/\/$/, '');
          return shopWebsite === cleanHost || shopWebsite === cleanHost.replace('www.', '');
      });
      if (activeShop) currentSlug = activeShop.slug;
  }

  const shopWebsite = activeShop?.settings?.website;
  const shopSeo = activeShop?.settings?.seo;

  const siteUrl = host || shopWebsite || process.env.NEXT_PUBLIC_SITE_URL || '';
  let absoluteUrl = canonical || shopSeo?.canonicalUrl;

  if (siteUrl && !absoluteUrl) {
    if (currentSlug === firstSegment && !siteUrl.includes(`${firstSegment}.`)) {
      try {
        const urlObj = new URL(siteUrl);
        const protocol = urlObj.protocol;
        
        // Base host identification
        let baseHost = urlObj.host;
        for (const s of marketplaceShops as string[]) {
          if (baseHost.startsWith(`${s}.`)) {
            baseHost = baseHost.replace(`${s}.`, '');
            break;
          }
        }
        
        const subPath = urlParts.slice(1).join('/');
        absoluteUrl = `${protocol}//${firstSegment}.${baseHost}${localePath}${subPath ? `/${subPath}` : ''}`;
      } catch (e) {
        absoluteUrl = `${siteUrl}${localePath}/${cleanUrl}`;
      }
    } else {
      absoluteUrl = `${siteUrl}${localePath}${cleanUrl ? `/${cleanUrl}` : ''}`;
    }
  }

  // Resolve metadata
  const activeType = types?.find((t: any) => t.slug === currentSlug);
  const shopLogo = activeShop?.logo?.original || activeType?.logo?.original;
  const siteTitle = activeShop?.name || activeType?.name || 'Zone4Build';
  const favicon = shopLogo || '/favicon.ico';
  
  const themeColor = activeShop?.settings?.branding?.primary_color || '#ffffff';

  // Prioritize Shop SEO settings > Explicit props > Default fallback
  const seoTitle = shopSeo?.metaTitle || title || siteTitle;
  const seoDescription = shopSeo?.metaDescription || description || activeType?.settings?.siteSubtitle || DEFAULT_DESCRIPTION;
  const ogTitle = shopSeo?.ogTitle || seoTitle;
  const ogDescription = shopSeo?.ogDescription || seoDescription;
  const ogImage = shopSeo?.ogImage?.original || images?.[0]?.image?.original || shopLogo;

  return (
    <>
      <NextSeo
        title={seoTitle}
        description={seoDescription}
        canonical={absoluteUrl}
        additionalMetaTags={[
          {
            name: 'theme-color',
            content: themeColor,
          },
          {
            name: 'keywords',
            content: shopSeo?.metaTags || '',
          },
          {
            name: 'apple-mobile-web-app-capable',
            content: 'yes',
          },
          {
            name: 'apple-mobile-web-app-status-bar-style',
            content: 'black-translucent',
          },
        ]}
        twitter={{
          handle: shopSeo?.twitterHandle || '@zone4build',
          site: '@zone4build',
          cardType: (shopSeo?.twitterCardType as any) || 'summary_large_image',
        }}
        additionalLinkTags={[
          {
            rel: 'icon',
            href: favicon,
          },
          {
            rel: 'apple-touch-icon',
            href: favicon,
          },
          {
            rel: 'manifest',
            href: '/api/manifest',
          },
        ]}
        openGraph={{
          url: absoluteUrl,
          title: ogTitle,
          description: ogDescription,
          site_name: siteTitle,
          images: images?.length 
            ? images.map((item: any) => ({
                url: item?.image?.original || item?.url,
                alt: item?.title || seoTitle,
              }))
            : ogImage 
              ? [{ url: ogImage, alt: ogTitle, width: 1200, height: 630 }]
              : [{ url: '/img/og-image.png', alt: 'Zone4Build Marketplace', width: 1200, height: 630 }],
        }}
        {...props}
      />
      {activeShop && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              'name': activeShop?.name,
              'image': shopLogo || ogImage,
              'description': activeShop?.description || seoDescription,
              'url': absoluteUrl,
              'telephone': activeShop?.settings?.contact || '',
              'address': {
                '@type': 'PostalAddress',
                'streetAddress': activeShop?.address?.street_address || '',
                'addressLocality': activeShop?.address?.city || '',
                'addressRegion': activeShop?.address?.state || '',
                'postalCode': activeShop?.address?.zip || '',
                'addressCountry': activeShop?.address?.country || ''
              }
            })
          }}
        />
      )}
    </>
  );
};

export default Seo;
