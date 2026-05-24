import type { AppProps, AppContext } from 'next/app';
import App from 'next/app';
import { appWithTranslation } from 'next-i18next';
import Cookies from 'js-cookie';
import { SessionProvider } from 'next-auth/react';
import dynamic from 'next/dynamic';
import '@/assets/css/main.css';
import 'leaflet/dist/leaflet.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { ModalProvider } from '@/components/ui/modal/modal.context';
import DefaultSeo from '@/components/seo/default-seo';
import GoogleAds from '@/components/seo/google-ads';
import { SearchProvider } from '@/components/ui/search/search.context';
import PrivateRoute from '@/lib/private-route';
import { CartProvider } from '@/store/quick-cart/cart.context';
import SocialLogin from '@/components/auth/social-login';
import { NextPageWithLayout } from '@/types';
import QueryProvider from '@/framework/client/query-provider';
import { getDirection } from '@/lib/constants';
import { useRouter } from 'next/router';
import { useNotifications } from '@/lib/use-notifications';
import { useMemo, useEffect, useRef } from 'react';
import { useSettings } from '@/framework/settings';
import { resolveShopSlug } from '@/lib/shop-utils';
import { useShop } from '@/framework/shop';
import { useTypes } from '@/framework/type';
import { useLocation } from '@/lib/hooks/use-location';
import { ShopSlugProvider, useShopSlug, useShopApiSlug } from '@/lib/hooks/use-shop-slug-context';
import { getNativePlugin } from '@/lib/capacitor-utils';

const ManagedModal = dynamic(
  () => import('@/components/ui/modal/managed-modal'),
  { ssr: false }
);
const ManagedDrawer = dynamic(
  () => import('@/components/ui/drawer/managed-drawer'),
  { ssr: false }
);

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function hexToRgb(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : null;
}

const MaintenanceView = dynamic(
  () => import('@/components/maintenance/maintenance-view'),
  { ssr: false }
);

function ManagedApp({
  Component,
  pageProps,
  authenticationRequired,
}: {
  Component: NextPageWithLayout;
  pageProps: any;
  authenticationRequired: boolean;
}) {
  const router = useRouter();
  const { locale, asPath } = router;
  const dir = getDirection(locale);

  const slug = useShopSlug();
  const apiSlug = useShopApiSlug();
  const { shop, isLoading: shopLoading }: any = useShop(apiSlug || '');
  const { settings }: any = useSettings();
  const { currency: locationCurrency, setLocation, loaded: locationLoaded, initializing: locationInitializing } = useLocation();

  // ─── Maintenance Mode Check ───────────────────────────────────────────
  const isMaintenance = shop?.settings?.isUnderMaintenance || shop?.is_active === false;
  
  // ─── Refs: track what we have already acted on ───────────────────────
  // Using refs for "have we done this yet" flags — NOT in dependency arrays
  const syncedCurrencyRef = useRef<string | null>(null);
  const syncedLocaleRef = useRef<string | null>(null);
  const prevSlugRef = useRef<string | null>(null);

  // Reset sync state when navigating to a different shop
  useEffect(() => {
    if (slug && slug !== prevSlugRef.current) {
      prevSlugRef.current = slug;
      syncedCurrencyRef.current = null;
      syncedLocaleRef.current = null;
    }
  }, [slug]);

  // ─── Currency sync ────────────────────────────────────────────────────
  // Gate: wait for location to finish loading from storage/detection
  // This prevents the race between "restored USD" and "shop wants EUR"
  useEffect(() => {
    if (locationInitializing || !locationLoaded) return;

    const activeCurrency = shop?.settings?.currency || settings?.currency;
    if (!activeCurrency) return;

    // Already synced this exact currency for this shop — do nothing
    if (syncedCurrencyRef.current === activeCurrency) return;

    // Currency matches what's already in location — just record it
    if (activeCurrency === locationCurrency) {
      syncedCurrencyRef.current = activeCurrency;
      return;
    }

    // Needs update — record BEFORE calling setLocation to prevent re-entrancy
    syncedCurrencyRef.current = activeCurrency;
    setLocation((prev: any) => ({
      ...prev,
      currency: activeCurrency,
      rate: shop?.settings?.currencyRate ?? prev?.rate ?? 1.0,
    }));
  }, [
    locationInitializing,
    locationLoaded,
    locationCurrency,
    shop?.settings?.currency,
    shop?.settings?.currencyRate,
    settings?.currency,
    setLocation,
  ]);

  // ─── Locale sync ──────────────────────────────────────────────────────
  // Completely independent from currency — no chaining, no ref dependency
  useEffect(() => {
    const activeLanguage = shop?.settings?.defaultLanguage;
    if (!activeLanguage) return;
    if (activeLanguage === locale) return;
    if (Cookies.get('NEXT_LOCALE')) return;

    // Already attempted this locale for this shop
    if (syncedLocaleRef.current === activeLanguage) return;

    syncedLocaleRef.current = activeLanguage;
    Cookies.set('NEXT_LOCALE', activeLanguage, { expires: 365 });
    router.replace(asPath, asPath, { locale: activeLanguage });
  }, [shop?.settings?.defaultLanguage, locale, asPath, router]);

  // ─── Branding ─────────────────────────────────────────────────────────
  const branding = shop?.settings?.branding || settings?.branding;

  const brandingStyle = useMemo((): React.CSSProperties => {
    // Return empty object until shop loads — prevents SSR/client hydration mismatch
    if (!branding) return {};

    const primaryColor = branding.primary_color || '#009f7f';
    const secondaryColor = branding.secondary_color || '#019376';
    const primaryRGB = hexToRgb(primaryColor);
    const secondaryRGB = hexToRgb(secondaryColor);

    const style: Record<string, string> = {
      '--primary-color': primaryColor,
      '--secondary-color': secondaryColor,
      '--color-accent': primaryRGB || '0, 159, 127',
      '--color-accent-hover': secondaryRGB || '1, 147, 118',
    };

    if (primaryRGB) {
      style['--color-accent-200'] = primaryRGB;
      style['--color-accent-300'] = primaryRGB;
      style['--color-accent-400'] = primaryRGB;
      style['--color-accent-500'] = primaryRGB;
      style['--color-accent-600'] = secondaryRGB ?? primaryRGB;
      style['--color-accent-700'] = secondaryRGB ?? primaryRGB;
    }

    if (branding.font_family) {
      style['--font-family'] = branding.font_family;
    }

    return style as React.CSSProperties;
  }, [branding]);

  // ─── Notifications ────────────────────────────────────────────────────
  const { subscribeToTopic } = useNotifications({
    userId: pageProps.session?.user?.id,
    authToken: pageProps.session?.token,
    autoRequest: true,
    onMessage: (payload) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Foreground notification:', payload);
      }
    },
  });

  useEffect(() => {
    if (!slug || !pageProps.session?.token) return;
    subscribeToTopic(`shop_notifications_${slug}`).catch((err) => {
      console.error('Failed to subscribe to shop topic:', err);
    });
  }, [slug, pageProps.session?.token, subscribeToTopic]);

  // ─── Capacitor back button ────────────────────────────────────────────
  useEffect(() => {
    const AppPlugin = getNativePlugin('App');
    if (!AppPlugin) return;

    let listenerHandle: any = null;

    const initBackButton = async () => {
      try {
        const handle = await AppPlugin.addListener('backButton', () => {
          if (window.location.pathname !== '/') {
            router.back();
          } else {
            AppPlugin.exitApp();
          }
        });
        listenerHandle = handle;
      } catch (err) {
        console.warn('[Capacitor] Failed to add backButton listener:', err);
      }
    };

    initBackButton();

    return () => { 
      if (listenerHandle?.remove) {
        listenerHandle.remove();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isMaintenance && !shopLoading && slug) {
    return (
      <div dir={dir} style={brandingStyle}>
        <MaintenanceView
          shopName={shop?.name}
          title={shop?.settings?.maintenance?.title}
          description={shop?.settings?.maintenance?.description}
          image={shop?.settings?.maintenance?.image}
        />
      </div>
    );
  }

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <div dir={dir} style={brandingStyle}>
      <SearchProvider>
        <ModalProvider>
          <CartProvider>
            <>
              <DefaultSeo />
              <GoogleAds shop={shop} />
              {authenticationRequired ? (
                <PrivateRoute>{getLayout(<Component {...pageProps} />)}</PrivateRoute>
              ) : (
                getLayout(<Component {...pageProps} />)
              )}
              <ManagedModal />
              <ManagedDrawer />
              {/* @ts-ignore */}
              <ToastContainer autoClose={2000} theme="colored" />
              <SocialLogin />
            </>
          </CartProvider>
        </ModalProvider>
      </SearchProvider>
    </div>
  );
}

function CustomApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  const authenticationRequired = Component.authenticationRequired ?? false;

  return (
    <SessionProvider session={session}>
      <QueryProvider pageProps={pageProps}>
        <ShopSlugProvider>
          <ManagedApp
            Component={Component}
            pageProps={{ ...pageProps, session }}
            authenticationRequired={authenticationRequired}
          />
        </ShopSlugProvider>
      </QueryProvider>
    </SessionProvider>
  );
}

CustomApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};

export default appWithTranslation(CustomApp as any);