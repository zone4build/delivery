import { useMutation } from 'react-query';
import client from './client';
import { toast } from 'react-toastify';

export function useCreatePaymentSession() {
    const { mutate: createPaymentSession, isLoading } = useMutation(
        ({ orderId, gateway }: { orderId: string; gateway?: string }) =>
            client.payments.createSession(orderId, gateway),
        {
            onSuccess: (data) => {
                if (data?.url) {
                    window.location.href = data.url;
                }
            },
            onError: (error) => {
                const {
                    response: { data },
                }: any = error ?? {};
                toast.error(data?.message || 'Payment initiation failed');
            },
        }
    );

    return {
        createPaymentSession,
        isLoading,
    };
}
