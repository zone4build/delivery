import Button from '@/components/ui/button';
import Input from '@/components/ui/forms/input';
import Label from '@/components/ui/forms/label';
import Radio from '@/components/ui/forms/radio/radio';
import TextArea from '@/components/ui/forms/text-area';
import Checkbox from '@/components/ui/forms/checkbox/checkbox';
import { useTranslation } from 'next-i18next';
import * as yup from 'yup';
import { useModalState } from '@/components/ui/modal/modal.context';
import { Form } from '@/components/ui/forms/form';
import { AddressType } from '@/framework/utils/constants';
import { useUpdateUser, useUser } from '@/framework/user';

type FormValues = {
  title: string;
  type: AddressType;
  is_default?: boolean;
  address: {
    country: string;
    city: string;
    state: string;
    zip: string;
    street_address: string;
  };
};

const addressSchema = yup.object().shape({
  type: yup
    .string()
    .oneOf([AddressType.Billing, AddressType.Shipping])
    .required('error-type-required'),
  title: yup.string().required('error-title-required'),
  is_default: yup.boolean(),
  address: yup.object().shape({
    country: yup.string().required('error-country-required'),
    city: yup.string().required('error-city-required'),
    state: yup.string().required('error-state-required'),
    zip: yup.string().required('error-zip-required'),
    street_address: yup.string().required('error-street-required'),
  }),
});

export const AddressForm: React.FC<any> = ({
  onSubmit,
  defaultValues,
  isLoading,
}) => {
  const { t } = useTranslation('common');

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      className="grid h-full grid-cols-2 gap-5"
      //@ts-ignore
      validationSchema={addressSchema}
      useFormProps={{
        shouldUnregister: true,
        defaultValues,
      }}
      resetValues={defaultValues}
    >
      {({ register, formState: { errors } }) => (
        <>
          <input type="hidden" {...register('type')} />


          <Input
            label={t('text-title')}
            {...register('title')}
            error={t(errors.title?.message!)}
            variant="outline"
            className="col-span-2"
          />

          <Input
            label={t('text-country')}
            {...register('address.country')}
            error={t(errors.address?.country?.message!)}
            variant="outline"
          />

          <Input
            label={t('text-city')}
            {...register('address.city')}
            error={t(errors.address?.city?.message!)}
            variant="outline"
          />

          <Input
            label={t('text-state')}
            {...register('address.state')}
            error={t(errors.address?.state?.message!)}
            variant="outline"
          />

          <Input
            label={t('text-zip')}
            {...register('address.zip')}
            error={t(errors.address?.zip?.message!)}
            variant="outline"
          />

          <TextArea
            label={t('text-street-address')}
            {...register('address.street_address')}
            error={t(errors.address?.street_address?.message!)}
            variant="outline"
            className="col-span-2"
          />

          <Checkbox
            {...register('is_default')}
            name="is_default"
            label={t('text-set-default-address')}
            className="col-span-2"
          />

          <Button
            className="col-span-2 w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            {Boolean(defaultValues) ? t('text-update') : t('text-save')}{' '}
            {t('text-address')}
          </Button>
        </>
      )}
    </Form>
  );
};

export default function CreateOrUpdateAddressForm() {
  const { t } = useTranslation('common');
  const {
    data: { customerId, address, type },
  } = useModalState();
  const { me } = useUser();
  const { mutate: updateProfile, isLoading } = useUpdateUser();

  function onSubmit(values: FormValues) {
    const formattedInput = {
      id: address?.id,
      // customer_id: customerId,
      title: values.title,
      type: values.type,
      is_default: values.is_default || false,
      address: {
        ...values.address,
      },
    };

    let newAddresses = [...(me?.address || [])];
    if (address?.id) {
      const index = newAddresses.findIndex((a) => a.id === address.id);
      if (index > -1) {
        newAddresses[index] = { ...newAddresses[index], ...formattedInput };
      }
    } else {
      newAddresses.push(formattedInput as any);
    }

    updateProfile({
      id: customerId,
      address: newAddresses,
    });
  }
  return (
    <div className="min-h-screen bg-light p-5 sm:p-8 md:min-h-0 md:rounded-xl">
      <h1 className="mb-4 text-center text-lg font-semibold text-heading sm:mb-6">
        {address ? t('text-update') : t('text-add-new')} {t('text-address')}
      </h1>
      <AddressForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        defaultValues={{
          title: address?.title ?? '',
          type: address?.type ?? type,
          is_default: address?.is_default ?? false,
          address: {
            ...address?.address,
          },
        }}
      />
    </div>
  );
}
