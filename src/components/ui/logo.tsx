import React from 'react';
import { Image } from '@/components/ui/image';
import cn from 'classnames';
import Link from '@/components/ui/link';
import { useSettings } from '@/framework/settings';
import { resolveShopSlug, resolveShopSlugForApi } from '@/lib/shop-utils';
import { useShop } from '@/framework/shop';
import { useRouter } from 'next/router';
import { useTypes } from '@/framework/type';

const Logo: React.FC<React.AnchorHTMLAttributes<{}>> = ({
  className,
  ...props
}) => {
  const { settings }: any = useSettings();
  const { types } = useTypes();
  const validSlugs = types?.map((t: any) => t.slug);
  
  const router = useRouter();
  const [slug, setSlug] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setSlug(resolveShopSlugForApi(window.location.hostname, window.location.pathname));
    }
  }, [router.asPath]);

  const { shop }: any = useShop(slug || '');

  const logo = shop?.logo || settings?.logo;
  const siteTitle = shop?.name || settings?.siteTitle;

  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center no-underline outline-none focus:outline-none shrink-0',
        className
      )}
      {...props}
    >
      {logo?.original ? (
        <div className="relative h-10 w-32 md:h-12 md:w-40 flex items-center justify-center transition-transform hover:opacity-80">
          <Image
            src={logo.original}
            alt={siteTitle || 'Logo'}
            layout="fill"
            objectFit="contain"
            objectPosition="left"
            loading="eager"
          />
        </div>
      ) : (
        <div className="text-3xl font-bold tracking-tight">
          <span className="text-[var(--primary-color)]">{siteTitle || 'Zone'}</span>
          <span className="text-[var(--secondary-color)]">4Build</span>
        </div>
      )}
    </Link>
  );
};

export default Logo;
