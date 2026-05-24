import Loader from '@/components/ui/loaders/spinner/spinner';
import { useRouter } from 'next/router';
import { BackArrowRound } from '@/components/icons/back-arrow-round';
import { useUser, useLogout } from '@/framework/user';
import LoginView from '@/components/auth/login-form';
import { useTranslation } from 'next-i18next';

const PrivateRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { me, isAuthorized, isLoading } = useUser();
  const { t } = useTranslation('common');
  const { mutate: logout } = useLogout();

  const isUser = !!me;
  
  // 1. If not authorized, show login
  if (!isAuthorized && !isLoading) {
    return (
      <div className="relative flex justify-center w-full min-h-screen py-5 md:py-8">
        <button
          className="absolute flex items-center justify-center w-8 h-8 text-gray-200 transition-colors md:w-16 md:h-16 top-5 md:top-1/2 ltr:left-5 rtl:right-5 ltr:md:left-10 rtl:md:right-10 md:-mt-8 md:text-gray-300 hover:text-gray-400"
          onClick={router.back}
        >
          <BackArrowRound />
        </button>
        <div className="flex flex-col my-auto">
          <LoginView />
        </div>
      </div>
    );
  }

  // 2. If loading user profile, show spinner
  if (isLoading) {
    return <Loader showText={false} />;
  }

  // 3. If authorized, check for delivery role
  // We check if the user has 'delivery' in their permissions or if they have the delivery role
  const permissions = (me as any)?.permissions?.map((p: any) => p.name.toLowerCase()) || [];
  const hasDeliveryRole = permissions.includes('delivery_boy') || permissions.includes('delivery');

  if (isAuthorized && isUser && !hasDeliveryRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-xl shadow-card">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
             <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          </div>
          <h1 className="text-2xl font-bold text-heading mb-4">
            {t('text-access-denied', 'Access Denied')}
          </h1>
          <p className="text-body mb-8 leading-relaxed">
            {t('text-delivery-role-required', 'This application is exclusively for delivery personnel. Your account does not have the required permissions.')}
          </p>
          <button
            onClick={() => logout()}
            className="w-full py-3 px-6 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
          >
            {t('text-logout-and-switch', 'Logout and Switch Account')}
          </button>
        </div>
      </div>
    );
  }

  // 4. Success
  if (isUser && isAuthorized && hasDeliveryRole) {
    return <>{children}</>;
  }

  return <Loader showText={false} />;
};

export default PrivateRoute;
