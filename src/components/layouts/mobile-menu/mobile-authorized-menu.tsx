import { siteSettings } from '@/config/site';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import DrawerWrapper from '@/components/ui/drawer/drawer-wrapper';
import { useAtom } from 'jotai';
import { drawerAtom } from '@/store/drawer-atom';
import { useLogout, useUser } from '@/framework/user';
import { shopRoute } from '@/config/routes';
import { useShopSlug } from '@/lib/hooks/use-shop-slug-context';

export default function MobileAuthorizedMenu() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { me } = useUser();
  const [_, closeSidebar] = useAtom(drawerAtom);
  const { mutate: logout } = useLogout();
  const shopSlug = useShopSlug();

  function handleClick(path: string) {
    router.push(shopRoute(shopSlug, path));
    closeSidebar({ display: false, view: '' });
  }

  return (
    <DrawerWrapper>
      <ul className="flex-grow">

        {siteSettings.authorizedLinksMobile.map(({ href, label }) => (
          <li key={`${href}${label}`}>
            <span
              className="block cursor-pointer px-5 py-3 text-sm font-semibold capitalize text-heading transition duration-200 hover:text-accent md:px-8"
              onClick={() => handleClick(href)}
            >
              {t(label)}
            </span>
          </li>
        ))}

        <li>
          <span
            className="block cursor-pointer px-5 py-3 text-sm font-semibold capitalize text-heading transition duration-200 hover:text-accent md:px-8"
            onClick={() => logout()}
          >
            {t('auth-menu-logout')}
          </span>
        </li>
      </ul>
    </DrawerWrapper>
  );
}
