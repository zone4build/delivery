import { useState } from 'react';
import Card from '@/components/ui/cards/card';
import { useTranslation } from 'next-i18next';
import PhoneInput from '@/components/ui/forms/phone-input';
import Button from '@/components/ui/button';
import { useUpdateUser } from '@/framework/user';
// OTP verification temporarily disabled
// import OtpForm from '@/components/otp/otp-form';

interface Props {
  userId: string;
  profileId: string;
  contact: string;
}

const ProfileContact = ({ userId, profileId, contact }: Props) => {
  const { t } = useTranslation('common');
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(contact || '');
  const { mutate: updateProfile, isLoading } = useUpdateUser();

  function handleSave() {
    if (!userId) return;
    updateProfile({
      id: userId,
      profile: {
        id: profileId,
        contact: `+${phone}`,
      },
    });
    setIsEditing(false);
  }

  return (
    <Card className="flex w-full flex-col mt-4">
      <div className="mb-5 flex items-center justify-between md:mb-8">
        <p className="text-lg capitalize text-heading lg:text-xl">
          {t('text-contact-number')}
        </p>
        <button
          className="flex items-center text-sm font-semibold text-accent transition-colors duration-200 hover:text-accent-hover focus:text-accent-hover focus:outline-none"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing
            ? t('text-cancel', 'Annuler')
            : Boolean(contact)
            ? t('text-update')
            : t('text-add')}
        </button>
      </div>

      <div className="grid grid-cols-1">
        {/* @ts-expect-error PhoneInput FC type mismatch with React 18 */}
        <PhoneInput
          country="tn"
          value={phone}
          disabled={!isEditing}
          onChange={(value: string) => setPhone(value)}
          inputClass="!p-0 ltr:!pr-4 rtl:!pl-4 ltr:!pl-14 rtl:!pr-14 !flex !items-center !w-full !appearance-none !transition !duration-300 !ease-in-out !text-heading !text-sm focus:!outline-none focus:!ring-0 !border !border-border-base !rounded focus:!border-accent !h-12"
          dropdownClass="focus:!ring-0 !border !border-border-base !shadow-350"
        />
      </div>

      {isEditing && (
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave} loading={isLoading} disabled={isLoading}>
            {t('text-save', 'Enregistrer')}
          </Button>
        </div>
      )}

      {/* OTP verification — re-enable when ready
      {isEditing && (
        <div className="mt-2">
          <OtpForm phoneNumber={contact} onVerifySuccess={onContactUpdate} />
        </div>
      )}
      */}
    </Card>
  );
};

export default ProfileContact;
