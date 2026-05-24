import { useTranslation } from 'next-i18next';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';

export function useRedeemPointsForCoupon() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();

  return useMutation(client.users.redeemPointsForCoupon, {
    onSuccess: () => {
      toast.success(t('toast-coupon-generated'));
      queryClient.invalidateQueries(API_ENDPOINTS.USERS_ME);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ?? t('error-something-wrong');
      toast.error(typeof message === 'string' ? message : t('error-something-wrong'));
    },
  });
}
