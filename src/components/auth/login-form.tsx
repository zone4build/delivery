import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Script from 'next/script';
import { useEffect, useRef } from 'react';
import Logo from '@/components/ui/logo';
import Alert from '@/components/ui/alert';
import Input from '@/components/ui/forms/input';
import PasswordInput from '@/components/ui/forms/password-input';
import Button from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import * as yup from 'yup';
import { GoogleIcon } from '@/components/icons/google';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { MobileIcon } from '@/components/icons/mobile-icon';
import { Form } from '@/components/ui/forms/form';
import type { LoginUserInput } from '@/types';
import { AnonymousIcon } from '@/components/icons/anonymous-icon';
import { useRouter } from 'next/router';
import { Routes, shopRoute } from '@/config/routes';
import { useShopSlug, useShopApiSlug } from '@/lib/hooks/use-shop-slug-context';
import { useToken } from '@/lib/hooks/use-token';
import { useAtom } from 'jotai';
import { authorizationAtom } from '@/store/authorization-atom';
import { useSettings } from '@/framework/settings';
import { useShop } from '@/framework/shop';
import { isNativeApp, getNativeGoogleToken } from '@/lib/capacitor-utils';

const loginFormSchema = yup.object().shape({
  email: yup
    .string()
    .email('error-email-format')
    .required('error-email-required'),
  password: yup.string().required('error-password-required'),
});

function LoginForm() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { openModal, closeModal } = useModalAction();
  const { setToken } = useToken();
  const [, setIsAuthorized] = useAtom(authorizationAtom);
  const isCheckout = router.pathname.includes('checkout');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const googleTokenClient = useRef<any>(null);
  
  const identityTenantId = process.env.NEXT_PUBLIC_TENANT_ID!;
  const shopSlug = useShopSlug();
  const apiSlug = useShopApiSlug();
  const { shop } = useShop(apiSlug!);
  const { settings } = useSettings();
  
  const shopGoogle = (shop?.settings as any)?.google as any;
  const globalGoogle = (settings as any)?.google as any;

  const hasGoogleAuth = 
    ((shop as any)?.settings?.google?.isEnable && (shop as any)?.settings?.google?.clientId) || 
    ((settings as any)?.google?.isEnable && (settings as any)?.google?.clientId);

  const googleClientId = shopGoogle?.clientId || globalGoogle?.clientId;

  // Common logic for handling Google Identity response (GSI / ID Token)
  const handleGoogleResponse = async (response: any) => {
    const idToken = response.credential; // GSI returns ID Token in 'credential' field
    
    if (idToken) {
      console.log('✅ Google ID Token received, signing in with NextAuth...');
      setIsSubmitting(true);
      try {
        const result = (await signIn('credentials', {
          google_id_token: idToken,
          tenantId: identityTenantId,
          redirect: false,
        })) as any;

        if (result?.ok) {
          const sessionResponse = await fetch('/api/auth/session');
          const sessionData = await sessionResponse.json();
          if (sessionData?.token) {
            setToken(sessionData.token);
            setIsAuthorized(true);
          }
          closeModal();
          const callbackUrl = (router.query.callbackUrl as string) || Routes.home;
          router.push(callbackUrl);
        } else {
          setLoginError('error-credential-wrong');
        }
      } catch (err) {
        console.error('Google Social Login Error:', err);
        setLoginError('error-credential-wrong');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Initialize Google Identity Services (GSI)
  const initializeGoogle = () => {
    if (
      typeof window !== 'undefined' &&
      (window as any).google?.accounts?.id &&
      googleClientId
    ) {
      (window as any).google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // [TRACE] Disabled the official 'Ref' button per user request. We using the blue button instead.
      /*
      const googleBtnDiv = document.getElementById('google-button-root');
      if (googleBtnDiv) {
        (window as any).google.accounts.id.renderButton(googleBtnDiv, {
          theme: 'outline',
          size: 'large',
          width: googleBtnDiv.offsetWidth,
        });
      }
      */
    }
  };

  useEffect(() => {
    initializeGoogle();
  }, [googleClientId]);

  const handleGoogleLogin = async () => {
    if (isNativeApp()) {
      setIsSubmitting(true);
      try {
        const idToken = await getNativeGoogleToken();
        if (idToken) {
          handleGoogleResponse({ credential: idToken });
        } else {
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error('Native Google Login Error:', error);
        setIsSubmitting(false);
      }
      return;
    }

    if ((window as any).google?.accounts?.id) {
       // Trigger the login popup ONLY on click
       (window as any).google.accounts.id.prompt();
    } else {
      console.warn('Google GSI script not fully loaded.');
    }
  };

  async function onSubmit({ email, password }: LoginUserInput) {
    setIsSubmitting(true);
    setLoginError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      }) as { error?: string; ok?: boolean } | undefined;

      if (result?.error) {
        setLoginError('error-credential-wrong');
      } else if (result?.ok) {
        // Login successful, NextAuth session is now populated
        console.log('✅ Login successful, fetching session...');

        // Fetch the session to get the access token
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();

        // Set the auth_token cookie that the UI depends on
        if (sessionData?.token) {
          setToken(sessionData.token);
          console.log('✅ auth_token cookie set');

          // Update the Jotai atom to immediately reflect the logged-in state in the UI
          setIsAuthorized(true);
          console.log('✅ UI state updated');
        }

        // Close the modal if it's open
        closeModal();

        // Redirect to home page or the page they were trying to access
        const callbackUrl = (router.query.callbackUrl as string) || Routes.home;
        router.push(shopRoute(shopSlug, callbackUrl));
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('error-credential-wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Alert
        variant="error"
        message={loginError && t(loginError)}
        className="mb-6"
        closeable={true}
        onClose={() => setLoginError(null)}
      />
      <Form<LoginUserInput>
        onSubmit={onSubmit}
        validationSchema={loginFormSchema}
      >
        {({ register, formState: { errors } }) => (
          <>
            <Input
              label={t('text-email')}
              {...register('email')}
              type="email"
              variant="outline"
              className="mb-5"
              error={t(errors.email?.message!)}
            />
            <PasswordInput
              label={t('text-password')}
              {...register('password')}
              error={t(errors.password?.message!)}
              variant="outline"
              className="mb-5"
              forgotPageRouteOnClick={() => openModal('FORGOT_VIEW')}
            />
            <div className="mt-8">
              <Button
                className="h-11 w-full sm:h-12"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {t('text-login')}
              </Button>
            </div>
          </>
        )}
      </Form>
      {/* //===============// */}
      <div className="relative mt-8 mb-6 flex flex-col items-center justify-center text-sm text-heading sm:mt-11 sm:mb-8">
        <hr className="w-full" />
        <span className="absolute -top-2.5 bg-light px-2 ltr:left-2/4 ltr:-ml-4 rtl:right-2/4 rtl:-mr-4">
          {t('text-or')}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-4">
        {hasGoogleAuth && (
          <Button
            className="!bg-accent !text-light hover:!bg-accent-hover h-11 w-full sm:h-12"
            disabled={isSubmitting}
            onClick={handleGoogleLogin}
          >
            <GoogleIcon className="h-4 w-4 ltr:mr-3 rtl:ml-3" />
            {t('text-login-google')}
          </Button>
        )}

        {isCheckout && (
          <Button
            className="h-11 w-full !bg-pink-700 !text-light hover:!bg-pink-800 sm:h-12"
            disabled={isSubmitting}
            onClick={() => router.push(shopRoute(shopSlug, Routes.checkoutGuest))}
          >
            <AnonymousIcon className="h-6 text-light ltr:mr-2 rtl:ml-2" />
            {t('text-guest-checkout')}
          </Button>
        )}
      </div>

      <div className="text-center text-sm text-body sm:text-base">
        {t('text-no-account')}{' '}
        <button
          onClick={() => openModal('REGISTER')}
          className="font-semibold text-accent underline transition-colors duration-200 hover:text-accent-hover hover:no-underline focus:text-accent-hover focus:no-underline focus:outline-none ltr:ml-1 rtl:mr-1"
        >
          {t('text-register')}
        </button>
      </div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ Google GSI Script Loaded');
          initializeGoogle();
        }}
      />
    </>
  );
}

export default function LoginView() {
  const { t } = useTranslation('common');
  return (
    <div className="flex h-full min-h-screen w-screen flex-col justify-center bg-light py-6 px-5 sm:p-8 md:h-auto md:min-h-0 md:max-w-[480px] md:rounded-xl">
      <div className="flex justify-center">
        <Logo />
      </div>
      <p className="mt-4 mb-8 text-center text-sm text-body sm:mt-5 sm:mb-10 md:text-base">
        {t('login-helper')}
      </p>
       <LoginForm />
    </div>
  );
}
