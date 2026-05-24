import { useRouter } from 'next/router';
import { useShopRoutes } from '@/lib/hooks/use-shop-routes';
import { useTranslation } from 'next-i18next';
import DrawerWrapper from '@/components/ui/drawer/drawer-wrapper';
import { useAtom } from 'jotai';
import { drawerAtom } from '@/store/drawer-atom';



export default function MobileMainMenu() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [_, closeSidebar] = useAtom(drawerAtom);
  const routes = useShopRoutes();

  const headerLinks = [
    { href: routes.contactUs, label: 'nav-menu-contact' },
  ];

  function handleClick(path: string) {
    router.push(path);
    closeSidebar({ display: false, view: '' });
  }

  return (
    <DrawerWrapper>
      <ul className="flex-grow pt-10">
        {headerLinks.map(({ href, label }) => (
          <li key={`${href}${label}`}>
            <button
              onClick={() => handleClick(href)}
              className="flex cursor-pointer items-center py-3 px-5 text-sm font-semibold capitalize text-heading transition duration-200 hover:text-accent md:px-8"
            >
              {t(label)}
            </button>
          </li>
        ))}
      </ul>
    </DrawerWrapper>
  );
}
