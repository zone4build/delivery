import Scrollbar from '@/components/ui/scrollbar';
import { Menu, Transition } from '@headlessui/react';
import cn from 'classnames';
import { Fragment, useState, useMemo } from 'react';
import { getIcon } from '@/lib/get-icon';
import { CaretDown } from '@/components/icons/caret-down';
import * as groupIcons from '@/components/icons/groups';
import { useRouter } from 'next/router';
import Link from '@/components/ui/link';
import NextLink from 'next/link';
import { ArrowDownIcon } from '@/components/icons/arrow-down';
import { useTypes } from '@/framework/type';
import useHomepage from '@/lib/hooks/use-homepage';
import type { Type } from '@/types';
import { TYPES_PER_PAGE } from '@/framework/client/variables';
import { resolveShopSlug } from '@/lib/shop-utils';
import { SearchIcon } from '@/components/icons/search-icon';
import { useTranslation } from 'next-i18next';

interface GroupsMenuProps {
  className?: string;
  groups?: Type[];
  defaultGroup?: Type;
  variant?: 'colored' | 'minimal';
}

const GroupsMenu: React.FC<GroupsMenuProps> = ({
  className,
  groups,
  defaultGroup,
  variant = 'colored',
}) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedMenu = useMemo(() => {
    const found = groups?.find((type) => router.asPath.includes(type?.slug));
    if (found) return found;
    if (router.asPath === '/' || router.asPath === '/map') {
      return {
        name: t('nav-menu-home'),
        slug: '',
        icon: 'HomeIcon',
      };
    }
    return defaultGroup;
  }, [groups, router.asPath, defaultGroup, t]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groups;
    return groups?.filter((group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [groups, searchTerm]);

  return (
    <Menu
      as="div"
      className="relative z-[10010] inline-block ltr:text-left rtl:text-right"
    >
      <Menu.Button
        className={cn(
          'flex h-11 shrink-0 items-center text-sm font-semibold focus:outline-none md:text-base xl:px-4 transition-all duration-200',
          'rounded-full border border-border-200 bg-light xl:min-w-150 xl:border xl:text-accent shadow-sm hover:shadow-md',
          className
        )}
      >
        {({ open }) => (
          <>
            {variant === 'colored' && selectedMenu?.icon && (
              <span className="flex h-5 w-5 items-center justify-center ltr:mr-2 rtl:ml-2">
                {getIcon({
                  iconList: groupIcons,
                  iconName: selectedMenu?.icon,
                  className: 'max-h-full max-w-full',
                })}
              </span>
            )}
            <span className="whitespace-nowrap">{selectedMenu?.name || t('text-groups')}</span>
            <span className="flex pt-1 ltr:ml-auto ltr:pl-2.5 rtl:mr-auto rtl:pr-2.5">
              <CaretDown
                className={cn('transition-transform duration-200', {
                  'rotate-180': open,
                })}
              />
            </span>
          </>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          as="ul"
          className={cn(
            'absolute z-[10010] mt-3 w-64 overflow-hidden rounded-xl bg-light shadow-xl focus:outline-none ring-1 ring-black ring-opacity-5',
            {
              'ltr:right-0 ltr:origin-top-right rtl:left-0 rtl:origin-top-left':
                variant === 'minimal',
              'ltr:right-0 ltr:origin-top-right rtl:left-0 rtl:origin-top-left ltr:xl:right-auto ltr:xl:left-0 ltr:xl:origin-top-left rtl:xl:left-auto rtl:xl:right-0 rtl:xl:origin-top-right':
                variant !== 'minimal',
            }
          )}
        >
          {/* Search Input Area */}
          <div className="sticky top-0 z-10 bg-light p-3 border-b border-gray-100">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-gray-400 group-focus-within:text-accent" />
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all duration-200"
                placeholder={t('text-search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()} // Prevent closing menu on click
              />
            </div>
          </div>

          <Scrollbar
            className="h-full w-full max-h-72"
            options={{
              scrollbars: {
                autoHide: 'never',
              },
            }}
          >
            <div className="py-2">
              <Menu.Item>
                {({ active }) => (
                  <div
                    role="button"
                    onClick={() => router.push('/')}
                    className={cn(
                      'flex w-full items-center space-x-4 px-5 py-3 text-sm font-medium capitalize cursor-pointer transition-all duration-200 focus:outline-none rtl:space-x-reverse',
                      active || router.asPath === '/'
                        ? 'bg-gray-50 text-accent'
                        : 'text-body-dark hover:bg-gray-50 hover:text-accent'
                    )}
                  >
                    <span className="flex h-5 w-5 items-center justify-center">
                      {getIcon({
                        iconList: groupIcons,
                        iconName: 'HomeIcon',
                        className: 'max-h-full max-w-full',
                      })}
                    </span>
                    <span>{t('nav-menu-home')}</span>
                  </div>
                )}
              </Menu.Item>

              {filteredGroups && filteredGroups.length > 0 ? (
                filteredGroups.map(({ id, name, slug, icon }) => (
                  <Menu.Item key={id}>
                    {({ active }) => (
                      <div
                        role="button"
                        onClick={() => router.push(`/${slug}`)}
                        className={cn(
                          'flex w-full items-center space-x-4 px-5 py-3 text-sm font-medium capitalize cursor-pointer transition-all duration-200 focus:outline-none rtl:space-x-reverse',
                          active ? 'bg-gray-50 text-accent' : 'text-body-dark hover:bg-gray-50 hover:text-accent'
                        )}
                      >
                        {icon && variant === 'colored' && (
                          <span className="flex h-5 w-5 items-center justify-center">
                            {getIcon({
                              iconList: groupIcons,
                              iconName: icon,
                              className: 'max-h-full max-w-full',
                            })}
                          </span>
                        )}
                        <span>{name}</span>
                      </div>
                    )}
                  </Menu.Item>
                ))
              ) : (
                <div className="px-5 py-4 text-center text-sm text-gray-400 italic">
                  {t('text-no-result-found')}
                </div>
              )}
            </div>
          </Scrollbar>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

type GroupsDropdownMenuProps = {
  variant?: 'colored' | 'minimal';
};

const GroupsDropdownMenu: React.FC<GroupsDropdownMenuProps> = ({ variant }) => {
  const { types }: any = useTypes({
    limit: TYPES_PER_PAGE,
  });
  
  const validSlugs = types?.map((t: any) => t.slug);
  const isShopSubdomain = resolveShopSlug(validSlugs);
  const { homePage }: any = useHomepage();
  const router = useRouter();

  if (typeof window !== 'undefined') {
    const { getAccessMode } = require('@/lib/routing-constants');
    const mode = getAccessMode(window.location.hostname);
    
    // Hide the selector on custom domains or shop subdomains
    if (mode === 'custom' || mode === 'subdomain') {
      return null;
    }
  }

  // if (!types || types.length === 0) {
  //   return null;
  // }

  return (
    <GroupsMenu groups={types} defaultGroup={homePage} variant={variant} />
  );
};

export default GroupsDropdownMenu;
