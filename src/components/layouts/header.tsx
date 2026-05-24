import Logo from '@/components/ui/logo';
import cn from 'classnames';
import StaticMenu from './menu/static-menu';
import { useAtom, useSetAtom } from 'jotai';
import { displayMobileHeaderSearchAtom } from '@/store/display-mobile-header-search-atom';
import { scannerAtom } from '@/store/scanner-atom';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { authorizationAtom } from '@/store/authorization-atom';
import { useIsHomePage } from '@/lib/use-is-homepage';
import { useMemo } from 'react';
import { useHeaderSearch } from '@/layouts/headers/header-search-atom';
import LanguageSwitcher from '@/components/ui/language-switcher';
import { useShopData } from '@/lib/hooks/use-shop-slug-context';
import { useUser } from '@/framework/user';
import { getAccessMode } from '@/lib/routing-constants';
import { useModalAction } from '@/components/ui/modal/modal.context';

const SearchWithSuggestion = dynamic(() => import('@/components/ui/search/search-with-suggestion'));
const AuthorizedMenu = dynamic(() => import('./menu/authorized-menu'), {
  ssr: false,
});
const JoinButton = dynamic(() => import('./menu/join-button'), { ssr: false });

const Header = ({ layout }: { layout?: string }) => {
  const { t } = useTranslation('common');
  const { show, hideHeaderSearch } = useHeaderSearch();
  const { openModal } = useModalAction();
  const [displayMobileHeaderSearch] = useAtom(displayMobileHeaderSearchAtom);
  const setScanner = useSetAtom(scannerAtom);
  const [isAuthorize] = useAtom(authorizationAtom);
  const isHomePage = useIsHomePage();
  const isMultilangEnable =
    process.env.NEXT_PUBLIC_ENABLE_MULTI_LANG === 'true' &&
    !!process.env.NEXT_PUBLIC_AVAILABLE_LANGUAGES;

  const { shop } = useShopData();
  const { me } = useUser();
  const isOrderingEnabled = shop?.settings?.enableOrdering !== false;

  // useEffect(() => {
  //   if (!isHomePage) {
  //     hideHeaderSearch();
  //   }
  // }, [isHomePage]);
  const isFlattenHeader = useMemo(
    () => !show && isHomePage && layout !== 'modern',
    [show, isHomePage, layout]
  );
  return (
    <header
      className={cn('site-header-with-search overflow-visible h-14 md:h-16 lg:h-22', {
        'lg:!h-auto': isFlattenHeader,
      })}
    >
      <div
        className={cn(
          'fixed z-[10005] overflow-visible flex h-14 w-full transform-gpu items-center justify-between border-b border-border-200 bg-light px-4 py-5 shadow-sm transition-transform duration-300 md:h-16 lg:h-22 lg:px-8',
          {
            'lg:absolute lg:border-0 lg:bg-transparent lg:shadow-none':
              isFlattenHeader,
          }
        )}
      >
        <div className="flex w-full items-center justify-between lg:w-auto">
          {/* Logo - Hidden when searching on mobile */}
          <div className={cn("transition-all duration-200", displayMobileHeaderSearch ? "hidden lg:block opacity-0" : "block opacity-100")}>
            <Logo className="shrink-0" />
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

        <div className={cn(
          "flex items-center space-x-6",
          displayMobileHeaderSearch ? "hidden lg:flex" : "flex"
        )}>
          {/* Removed GroupsDropdownMenu as it's not needed for delivery app */}

          {isMultilangEnable && (
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>
          )}

          <div className="flex items-center space-x-4">
            {isOrderingEnabled && (
              <div className="flex items-center space-x-4">
                {isAuthorize && me?.wallet?.available_points !== undefined && (
                  <div className="flex items-center px-3 py-1 text-sm font-semibold rounded bg-accent-100 text-accent group relative cursor-pointer" onClick={() => openModal('POINTS_INFO')}>
                    <span className="ltr:mr-1 rtl:ml-1">{t('text-points')}:</span>
                    <span>{me.wallet.available_points}</span>
                    <svg
                      className="w-3.5 h-3.5 ml-1.5 opacity-60 hover:opacity-100 transition-opacity"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                {isAuthorize && (
                  <button
                    onClick={() => setScanner({ display: true })}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-heading transition-colors hover:bg-gray-200"
                    title={t('text-scan-order', 'Scan Order')}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 17h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                  </button>
                )}
                {isAuthorize ? <AuthorizedMenu /> : <JoinButton />}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
