import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { customerContactAtom } from '@/store/checkout';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { PlusIcon } from '@/components/icons/plus-icon';
import { useTranslation } from 'next-i18next';
import classNames from 'classnames';
import PhoneInput from '@/components/ui/forms/phone-input';

interface ContactProps {
  contact: string | undefined | null;
  label: string;
  count?: number;
  className?: string;
  gridClassName?: string;
}

const ContactGrid = ({
  contact,
  label,
  count,
  className,
  gridClassName,
}: ContactProps) => {
  const [contactNumber, setContactNumber] = useAtom(customerContactAtom);
  const { openModal } = useModalAction();
  const { t } = useTranslation('common');

  useEffect(() => {
    if (contact && !contactNumber) {
      setContactNumber(contact);
    }
  }, [contact, contactNumber, setContactNumber]);

  function onAddOrChange() {
    openModal('ADD_OR_UPDATE_CHECKOUT_CONTACT');
  }
  return (
    <div className={className}>
      <div
        className={classNames('mb-5 flex items-center justify-between', {
          'md:mb-8': count,
        })}
      >
        <div className="flex items-center space-x-3 rtl:space-x-reverse md:space-x-4">
          {count && (
            <span className="flex items-center justify-center w-8 h-8 text-base rounded-full bg-accent text-light lg:text-xl">
              {count}
            </span>
          )}
          <p className="text-lg capitalize text-heading lg:text-xl">{label}</p>
        </div>
      </div>

      <div className={classNames('w-full', gridClassName)}>
        <PhoneInput
          country="us"
          value={contactNumber}
          onChange={(value: string) => setContactNumber(value)}
          inputClass="!p-0 ltr:!pr-4 rtl:!pl-4 ltr:!pl-14 rtl:!pr-14 !flex !items-center !w-full !appearance-none !transition !duration-300 !ease-in-out !text-heading !text-sm focus:!outline-none focus:!ring-0 !border !border-border-base !rounded focus:!border-accent !h-12"
          dropdownClass="focus:!ring-0 !border !border-border-base !shadow-350"
        />
      </div>
    </div>
  );
};

export default ContactGrid;
