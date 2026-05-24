import Logo from '@/components/ui/logo';
import cn from 'classnames';
import { useAtom } from 'jotai';
// import { displayHeaderSearchAtom } from '@/store/display-header-search-atom';
import { displayMobileHeaderSearchAtom } from '@/store/display-mobile-header-search-atom';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { authorizationAtom } from '@/store/authorization-atom';
import { useIsHomePage } from '@/lib/use-is-homepage';
import { useEffect } from 'react';
import SearchWithSuggestion from '@/components/ui/search/search-with-suggestion';
import Link from '@/components/ui/link';
import MegaMenu from '@/components/ui/mega-menu';
import ListMenu from '@/components/ui/list-menu';
import { ArrowDownIcon } from '@/components/icons/arrow-down';
import GroupsDropdownMenu from './menu/groups-menu';
import { useShopData } from '@/lib/hooks/use-shop-slug-context';

const Search = dynamic(() => import('@/components/ui/search/search'));

const CartCounterIconButton = dynamic(
  () => import('@/components/cart/cart-counter-icon-button'),
  { ssr: false }
);
const AuthorizedMenu = dynamic(() => import('./menu/authorized-menu'), {
  ssr: false,
});
const JoinButton = dynamic(() => import('./menu/join-button'), { ssr: false });

interface MenuProps {
  data: any;
  className?: string;
}

const HeaderWithMegaMenu: React.FC<MenuProps> = ({ data, className }) => {
  const { t } = useTranslation('common');
  // const [_, setDisplayHeaderSearch] = useAtom(displayHeaderSearchAtom);
  const [displayMobileHeaderSearch] = useAtom(displayMobileHeaderSearchAtom);
  const [isAuthorize] = useAtom(authorizationAtom);
  const isHomePage = useIsHomePage();
  const { shop } = useShopData();
  const isOrderingEnabled = shop?.settings?.enableOrdering !== false;
  // useEffect(() => {
  //   if (!isHomePage) {
  //     setDisplayHeaderSearch(false);
  //   }
  // }, [isHomePage, setDisplayHeaderSearch]);
  useEffect(() => {
    if (!isHomePage) {
      // setDisplayHeaderSearch(false);
    }
  }, [isHomePage]);

  return (
    <>
      <header
        className={cn(
          'site-header-with-search w-full h-auto z-[10005] fixed shadow-sm'
        )}
      >
        <div
          className={cn(
            'flex justify-between items-center w-full h-14 md:h-16 lg:h-22 px-4 lg:px-10 py-5 bg-white/90 backdrop-blur-xl border-b border-gray-100 transition-all duration-300 relative z-10'
          )}
        >
          <div className="flex items-center space-x-10">
            <Logo className="shrink-0 mx-2 lg:mx-4" />

            <div className="hidden lg:block w-full max-w-md">
              <Search label={t('text-search-label')} variant="minimal" />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden lg:block">
              <GroupsDropdownMenu variant="minimal" />
            </div>
            
            {isOrderingEnabled && (
              <div className="flex items-center space-x-6">
                <div className="hidden md:block mx-1">
                  <CartCounterIconButton />
                </div>
                <div className="flex items-center mx-1">
                  {isAuthorize ? <AuthorizedMenu minimal={true} /> : <JoinButton />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mega menu */}
        <nav
          className={cn(
            `headerMenu flex w-full bg-white relative border-t border-b border-border-200 px-4 lg:px-12`,
            className
          )}
        >
          {data?.map((item: any) => (
            <div
              className={`menuItem group cursor-pointer py-4 ${
                item.subMenu ? 'relative' : ''
              }`}
              key={item.id}
            >
              <Link
                href={item.path}
                className="inline-flex items-center text-sm xl:text-base text-heading px-4 py-2 font-bold relative rounded-full transition-all duration-200 hover:bg-accent/5 hover:text-accent focus:text-accent"
              >
                {t(item.label)}
                {(item?.columns || item.subMenu) && (
                  <span className="opacity-30 text-heading text-xs mt-1 xl:mt-0.5 ltr:ml-1.5 rtl:mr-1.5 w-2.5 flex justify-end">
                    <ArrowDownIcon className="transition duration-300 ease-in-out transform group-hover:-rotate-180" />
                  </span>
                )}
              </Link>

              {item?.columns && Array.isArray(item.columns) && (
                <MegaMenu columns={item.columns} />
              )}

              {item?.subMenu && Array.isArray(item.subMenu) && (
                <div className="subMenu shadow-md border border-gray-200 bg-white absolute ltr:left-0 rtl:right-0 opacity-0 group-hover:opacity-100">
                  <ul className="text-body text-sm py-5">
                    {item.subMenu.map((menu: any, index: number) => {
                      const dept: number = 1;
                      const menuName: string = `sidebar-menu-${dept}-${index}`;

                      return (
                        <ListMenu
                          dept={dept}
                          data={menu}
                          hasSubMenu={menu.subMenu}
                          menuName={menuName}
                          key={menuName}
                          menuIndex={index}
                        />
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </nav>
      </header>
      <div className="block h-40 w-full" />
    </>
  );
};

export default HeaderWithMegaMenu;
