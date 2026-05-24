import useLayout from '@/lib/hooks/use-layout';
import dynamic from 'next/dynamic';
import Footer from './footer';

import { ShopCategoriesLoader } from '@/framework/rest/shop-categories';

// Import components that use Jotai atoms as client-side only
const Header = dynamic(() => import('./header'), { ssr: false });
const HeaderMinimal = dynamic(() => import('./header-minimal'), { ssr: false });
const MobileNavigation = dynamic(() => import('./mobile-navigation'), { ssr: false });
const ManagedScanner = dynamic(() => import('@/components/ui/scanner/managed-scanner'), { ssr: false });

export default function SiteLayout({ children }: React.PropsWithChildren<{}>) {
  const { layout } = useLayout();
  return (
    <div className="flex min-h-screen flex-col bg-gray-100 transition-colors duration-150">
      <ShopCategoriesLoader />
      {['minimal', 'compact'].includes(layout) ? (
        <HeaderMinimal layout={layout} />
      ) : (
        <Header layout={layout} />
      )}
      {children}
      {['compact'].includes(layout) && <Footer />}
      <MobileNavigation />
      <ManagedScanner />
    </div>
  );
}
export const getLayout = (page: React.ReactElement) => (
  <SiteLayout>{page}</SiteLayout>
);
