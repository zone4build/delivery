import classNames from 'classnames';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useShopSlug } from '@/lib/hooks/use-shop-slug-context';
import { shopRoute } from '@/config/routes';

export interface LinkProps extends NextLinkProps {
  className?: string;
  title?: string;
  target?: string;
  variant?: 'button';
  children?: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({
  children,
  variant,
  title,
  target,
  className,
  href,
  ...props
}) => {
  const slug = useShopSlug();
  const finalHref = typeof href === 'string' && href.startsWith('/') ? shopRoute(slug, href) : href;

  return (
    <NextLink href={finalHref} {...props} legacyBehavior>
      <a
        className={classNames(
          {
            "inline-flex items-center justify-center flex-shrink-0 font-semibold leading-none rounded outline-none px-3 py-0 h-9 text-sm bg-accent text-light border border-transparent hover:bg-accent-hover transition duration-300 ease-in-out focus:outline-none focus:shadow focus:ring-1 focus:ring-accent-700'":
              variant === 'button',
          },
          className
        )}
        title={title}
        target={target}
      >
        {children}
      </a>
    </NextLink>
  );
};

export default Link;
