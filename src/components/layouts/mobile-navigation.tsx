import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { NavbarIcon } from '@/components/icons/navbar-icon';
import { HomeIcon } from '@/components/icons/home-icon';
import { ShoppingBagIcon } from '@/components/icons/shopping-bag-icon';
import { UserIcon } from '@/components/icons/user-icon';
import { useTranslation } from 'next-i18next';
import { useCart } from '@/store/quick-cart/cart.context';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useAtom } from 'jotai';
import { drawerAtom } from '@/store/drawer-atom';
import { authorizationAtom } from '@/store/authorization-atom';
import { useIsRTL } from '@/lib/locals';
import { useShopRoutes } from '@/lib/hooks/use-shop-routes';

export default function MobileNavigation({
  children,
}: React.PropsWithChildren<{}>) {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { openModal, closeModal } = useModalAction();
  const [isAuthorize] = useAtom(authorizationAtom);
  const [drawerView, setDrawerView] = useAtom(drawerAtom);
  const { isRTL } = useIsRTL();
  const routes = useShopRoutes();

  const { totalUniqueItems } = useCart();
  const [isHydrated, setIsHydrated] = useState(false);

  // Ultra-Wide Map Page Detection
  const isMapPage = 
    router.asPath.includes('/map') || 
    router.pathname.includes('/map') ||
    Object.values(router.query).some(val => 
      Array.isArray(val) ? val.includes('map') : val === 'map'
    );

  // Prevent hydration mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Navigation is now visible on all pages including map
  if (!isHydrated) return null;

  const displayCount = isHydrated ? totalUniqueItems : 0;

  function handleSidebar(view: string) {
    if (drawerView.display && drawerView.view === view) {
      return setDrawerView({ display: false, view: '' });
    }
    setDrawerView({ display: true, view });
  }

  function handleHome() {
    closeModal();
    setDrawerView({ display: false, view: '' });
    // Smooth redirect to the home page (map) using SPA navigation
    router.push('/');
  }

  function handleJoin() {
    return openModal('LOGIN_VIEW');
  }

  return (
    <div className="visible h-12 md:h-14 lg:hidden">
      <div className="fixed bottom-6 left-0 right-0 z-[10010] flex justify-center px-4 w-full pointer-events-none">
        <nav className="flex h-14 w-full max-w-sm items-center justify-between bg-white/70 backdrop-blur-2xl px-6 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/40 pointer-events-auto">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleSidebar('MAIN_MENU_VIEW')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-heading hover:bg-accent/5 hover:text-accent focus:outline-none transition-colors"
          >
            <span className="sr-only">{t('text-burger-menu')}</span>
            <NavbarIcon className={`${isRTL && 'rotate-180 transform'} h-5 w-5`} />
          </motion.button>

          <div className="flex-shrink-0">
            {children}
          </div>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleHome}
            className="flex h-10 w-10 items-center justify-center rounded-full text-heading hover:bg-accent/5 hover:text-accent focus:outline-none transition-colors"
          >
            <span className="sr-only">{t('text-home')}</span>
            <HomeIcon className="h-5 w-5" />
          </motion.button>



          {isAuthorize ? (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => handleSidebar('AUTH_MENU_VIEW')}
              className="flex h-10 w-10 items-center justify-center rounded-full text-heading hover:bg-accent/5 hover:text-accent focus:outline-none transition-colors"
            >
              <span className="sr-only">{t('text-user')}</span>
              <UserIcon className="h-5 w-5" />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleJoin}
              className="flex h-10 w-10 items-center justify-center rounded-full text-heading hover:bg-accent/5 hover:text-accent focus:outline-none transition-colors"
            >
              <span className="sr-only">{t('text-user')}</span>
              <UserIcon className="h-5 w-5" />
            </motion.button>
          )}
        </nav>
      </div>
    </div>
  );
}
