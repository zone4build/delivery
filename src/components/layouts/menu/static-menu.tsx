import Link from '@/components/ui/link';
import { useShopRoutes } from '@/lib/hooks/use-shop-routes';
import { useTranslation } from 'next-i18next';



const StaticMenu = () => {
  const { t } = useTranslation('common');
  const routes = useShopRoutes();
  
  const headerLinks = [
    { href: routes.contactUs, icon: null, label: 'nav-menu-contact' },
  ];

  return (
    <>
      {headerLinks.map(({ href, label, icon }) => (
        <li key={`${href}${label}`}>
          <Link
            href={href}
            className="flex items-center px-5 py-2 rounded-full font-bold text-heading no-underline transition-all duration-200 border border-transparent hover:bg-accent/5 hover:text-accent focus:text-accent whitespace-nowrap"
          >
            {icon && <span className="ltr:mr-2 rtl:ml-2">{icon}</span>}
            {t(label)}
          </Link>
        </li>
      ))}
    </>
  );
};

export default StaticMenu;
