import { CloseIcon } from '@/components/icons/close-icon';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { getDirection } from '@/lib/constants';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export default function Modal({ open, onClose, children }: ModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation('common');

  const { locale } = useRouter();
  const dir = getDirection(locale);
  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100000] overflow-y-auto"
        initialFocus={cancelButtonRef}
        static
        open={open}
        onClose={onClose}
        dir={dir}
      >
        <div className="min-h-full text-center md:p-5">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 h-full w-full bg-gray-900 bg-opacity-50" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="min-w-content relative inline-block max-w-full align-middle transition-all ltr:text-left rtl:text-right mt-12 md:mt-0">
              <button
                onClick={onClose}
                aria-label="Close panel"
                ref={cancelButtonRef}
                className="absolute top-4 left-4 z-[100] flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur text-heading shadow-xl outline-none focus:outline-none transition-all hover:bg-white lg:hidden"
              >
                <span className="sr-only">{t('text-close')}</span>
                <CloseIcon className="h-5 w-5" />
              </button>
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
