import { useState, Fragment } from 'react';
import cn from 'classnames';
import { Listbox, Transition } from '@headlessui/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { CaretDown } from '@/components/icons/caret-down';
import { languageMenu } from '@/lib/locals';
import Cookies from 'js-cookie';

export default function LanguageSwitcher() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { asPath, locale, locales } = router;

  let filterItem = languageMenu?.filter((element) =>
    locales?.includes(element?.id)
  );

  const currentSelectedItem = locale
    ? filterItem?.find((o) => o?.value === locale)!
    : filterItem[2];
  const [selectedItem, setSelectedItem] = useState(currentSelectedItem);

  function handleItemClick(values: any) {
    Cookies.set('NEXT_LOCALE', values?.value, { expires: 365 });
    setSelectedItem(values);
    router.push(asPath, undefined, {
      locale: values?.value,
    });
  }

  return (
    <Listbox value={selectedItem} onChange={handleItemClick}>
      {({ open }) => (
        <div className="ms-2 lg:ms-0 relative z-[10010] xl:w-[130px]">
          <Listbox.Button className="relative flex h-11 w-full cursor-pointer items-center rounded-full border border-border-200 bg-light px-4 text-sm font-semibold text-accent shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none xl:h-auto xl:min-w-150 xl:py-2.5">
            <span className="relative block h-[38px] w-[38px] overflow-hidden rounded-full xl:hidden">
              <span className="relative top-[3px] block">
                {selectedItem.iconMobile}
              </span>
            </span>
            <span className="hidden items-center truncate xl:flex">
              <span className="text-xl ltr:mr-3 rtl:ml-3">
                {selectedItem.icon}
              </span>{' '}
              {t(selectedItem.name)}
            </span>
            <span className="pointer-events-none absolute inset-y-0 hidden items-center ltr:right-0 ltr:pr-4 rtl:left-0 rtl:pl-4 xl:flex">
              <CaretDown className={cn('transition-transform duration-200', {
                'rotate-180': open,
              })} aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              static
              className={`absolute z-[10010] mt-1 max-h-60 w-[130px] overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ltr:right-0 rtl:left-0 xl:w-full`}
            >
              {filterItem?.map((option, index) => (
                <Listbox.Option
                  key={index}
                  className={({ active }) =>
                    `${active ? 'bg-gray-100 text-amber-900' : 'text-gray-900'}
												relative cursor-pointer select-none py-2 px-3`
                  }
                  value={option}
                >
                  {({ selected, active }) => (
                    <span className="flex items-center">
                      <span className="text-xl">{option.icon}</span>
                      <span
                        className={`${
                          selected ? 'font-medium' : 'font-normal'
                        } block truncate ltr:ml-1.5 rtl:mr-1.5`}
                      >
                        {t(option.name)}
                      </span>
                      {selected ? (
                        <span
                          className={`${active && 'text-amber-600'}
                                 absolute inset-y-0 flex items-center ltr:left-0 ltr:pl-3 rtl:right-0 rtl:pr-3`}
                        />
                      ) : null}
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}
