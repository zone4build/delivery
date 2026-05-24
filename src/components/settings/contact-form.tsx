import type { CreateContactUsInput } from '@/types';
import Button from '@/components/ui/button';
import { Form } from '@/components/ui/forms/form';
import Input from '@/components/ui/forms/input';
import TextArea from '@/components/ui/forms/text-area';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { contactShop } from '@/lib/notification-api';

const contactFormSchema = yup.object().shape({
  name: yup.string().required('error-name-required'),
  email: yup
    .string()
    .email('error-email-format')
    .required('error-email-required'),
  subject: yup.string().required('error-subject-required'),
  description: yup.string().required('error-description-required'),
});

interface ContactFormProps {
  shopEmail?: string;
}

const ContactForm = ({ shopEmail }: ContactFormProps) => {
  const { t } = useTranslation('common');
  const { locale } = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(values: CreateContactUsInput) {
    setIsLoading(true);
    const result = await contactShop(values, shopEmail, locale || 'fr');
    setIsLoading(false);

    if (result.success) {
      toast.success(t('text-contact-us-success', 'Your message has been sent!'));
    } else {
      toast.error(t('error-something-wrong', 'Something went wrong. Please try again.'));
    }
  }

  return (
    <Form<CreateContactUsInput>
      onSubmit={onSubmit}
      validationSchema={contactFormSchema}
    >
      {({ register, formState: { errors } }) => (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              label={t('text-name')}
              {...register('name')}
              variant="outline"
              error={t(errors.name?.message!)}
            />
            <Input
              label={t('text-email')}
              {...register('email')}
              type="email"
              variant="outline"
              error={t(errors.email?.message!)}
            />
          </div>
          <Input
            label={t('text-subject')}
            {...register('subject')}
            variant="outline"
            className="my-6"
            error={t(errors.subject?.message!)}
          />
          <TextArea
            label={t('text-description')}
            {...register('description')}
            variant="outline"
            className="my-6"
            error={t(errors.description?.message!)}
          />

          <Button loading={isLoading} disabled={isLoading}>
            {t('text-submit')}
          </Button>
        </>
      )}
    </Form>
  );
};

export default ContactForm;
