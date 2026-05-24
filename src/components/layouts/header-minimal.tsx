import Logo from '@/components/ui/logo';
import cn from 'classnames';
import StaticMenu from './menu/static-menu';
import { useRouter } from 'next/router';
import { useAtom } from 'jotai';
import { displayMobileHeaderSearchAtom } from '@/store/display-mobile-header-search-atom';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { authorizationAtom } from '@/store/authorization-atom';
import SearchWithSuggestion from '@/components/ui/search/search-with-suggestion';
import Link from '@/components/ui/link';
import GroupsDropdownMenu from './menu/groups-menu';
import LanguageSwitcher from '@/components/ui/language-switcher';
import { useShopData } from '@/lib/hooks/use-shop-slug-context';
import { useUser } from '@/framework/user';

const CartCounterIconButton = dynamic(
  () => import('@/components/cart/cart-counter-icon-button'),
  { ssr: false }
);
const AuthorizedMenu = dynamic(() => import('./menu/authorized-menu'), {
  ssr: false,
});
const JoinButton = dynamic(() => import('./menu/join-button'), { ssr: false });

import { useState, useEffect } from 'react';

const HeaderMinimal = ({ layout }: { layout: string }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [displayMobileHeaderSearch] = useAtom(displayMobileHeaderSearchAtom);
  const [isAuthorize] = useAtom(authorizationAtom);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isMultilangEnable =
    process.env.NEXT_PUBLIC_ENABLE_MULTI_LANG === 'true' &&
    !!process.env.NEXT_PUBLIC_AVAILABLE_LANGUAGES;

  const { shop } = useShopData();
  const { me } = useUser();
  const isOrderingEnabled = shop?.settings?.enableOrdering !== false;

  return (
    <header className={cn('site-header-with-search h-14 md:h-16 lg:h-22')}>
      <div
        className={cn(
          'fixed z-[10005] flex h-14 w-full items-center justify-between border-b border-gray-100 bg-white/90 backdrop-blur-xl px-4 py-5 shadow-sm transition-all duration-300 md:h-16 lg:h-22 lg:px-10',
          {
            'px-5 lg:!px-12 xl:px-16': layout === 'compact',
          }
        )}
      >
        <div className="flex w-full items-center justify-between lg:w-auto">
          {/* Logo - Hidden when searching on mobile */}
          <div className={cn("transition-all duration-200 mx-2 lg:mx-4", displayMobileHeaderSearch ? "hidden lg:block opacity-0" : "block opacity-100")}>
            <Logo className={`${!isMultilangEnable ? 'mx-auto lg:mx-0' : 'ltr:ml-0 rtl:mr-0'}`} />
          </div>

          {/* Mobile Search Input - Shown when searching */}
          <div className={cn(
            "flex-1 px-4 lg:hidden transition-all duration-300",
            displayMobileHeaderSearch ? "block opacity-100" : "hidden opacity-0"
          )}>
            <SearchWithSuggestion label={t('text-search-label')} variant="minimal" />
          </div>

          <nav className="hidden lg:flex items-center space-x-10">
            <ul className="flex items-center list-none">
              <StaticMenu />
            </ul>
          </nav>
        </div>

        {/* Dynamic Center Search Bar */}
        <div className={cn(
          "hidden lg:block flex-1 max-w-xl px-10 transition-all duration-300 transform",
          isSticky ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        )}>
          <SearchWithSuggestion label={t('text-search-label')} variant="minimal" />
        </div>

        <div className={cn(
          "flex items-center space-x-6",
          displayMobileHeaderSearch ? "hidden lg:flex" : "flex"
        )}>
          <div className="hidden lg:block">
            <GroupsDropdownMenu variant="minimal" />
          </div>

          {isMultilangEnable && (
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>
          )}

          <div className="flex items-center space-x-6">
            {isOrderingEnabled && (
              <>
                <div className="hidden md:block mx-1">
                  <CartCounterIconButton />
                </div>
                <div className="flex items-center mx-1">
                  {isAuthorize && me?.wallet?.available_points !== undefined && (
                    <div className="flex items-center px-3 py-1 mr-2 text-sm font-semibold rounded bg-accent-100 text-accent">
                      <span className="ltr:mr-1 rtl:ml-1">{t('text-points')}:</span>
                      <span>{me.wallet.available_points}</span>
                    </div>
                  )}
                  {isAuthorize ? <AuthorizedMenu minimal={true} /> : <JoinButton />}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderMinimal;
