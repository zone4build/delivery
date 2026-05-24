import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useModalAction } from '../ui/modal/modal.context';
import Button from '../ui/button';
import { useUpdateOrder } from '@/framework/order';
import { toast } from 'react-toastify';
import { useMutation } from 'react-query';
import client from '@/framework/rest/client';

interface Props {
    orderId: string | number;
    onSuccess?: (newStatus: number) => void;
}

const ConfirmDeliveryModal = ({ orderId, onSuccess }: Props) => {
    const { t } = useTranslation('common');
    const { closeModal } = useModalAction();
    const [notes, setNotes] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const { updateOrder, isLoading: isUpdatingOrder } = useUpdateOrder();
    const { mutate: upload, isLoading: isUploading } = useMutation(client.settings.upload);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (photoFile) {
            upload([photoFile], {
                onSuccess: (data) => {
                    const uploadedPhotoUrl = data?.[0]?.original;
                    submitOrderUpdate(uploadedPhotoUrl);
                },
                onError: (error: any) => {
                    toast.error(t('text-error-photo-upload', 'Error uploading photo'));
                }
            });
        } else {
            submitOrderUpdate(photoPreview || null);
        }
    };

    const submitOrderUpdate = (imageUrl: string | null) => {
        const deliveryProof = {
            photo_url: imageUrl,
            notes: notes || null,
            timestamp: new Date().toISOString(),
        };

        updateOrder(
            {
                id: orderId.toString(),
                status: 7, // Delivered status (id=7 in order_statuses)
                delivery_proof: deliveryProof,
            },
            {
                onSuccess: () => {
                    toast.success(t('text-delivery-confirmed', 'Delivery confirmed successfully'));
                    closeModal();
                    if (onSuccess) onSuccess(7);
                },
                onError: () => {
                    toast.error(t('text-error-confirm-delivery', 'Failed to confirm delivery'));
                },
            }
        );
    };

    const isLoading = isUpdatingOrder || isUploading;

    return (
        <div className="m-auto w-full max-w-md rounded-md bg-white p-6 sm:w-[500px]">
            <h3 className="mb-4 text-center text-lg font-semibold text-heading">
                {t('text-confirm-delivery', 'Confirm Delivery')}
            </h3>

            <form onSubmit={handleSubmit}>
                {/* Photo Upload */}
                <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-body">
                        {t('text-proof-of-delivery', 'Proof of Delivery (Photo)')}
                    </label>
                    <div className="flex flex-col gap-3">
                        {photoPreview && (
                            <div className="relative h-48 w-full overflow-hidden rounded-lg border border-border-200">
                                <img
                                    src={photoPreview}
                                    alt="Delivery proof"
                                    className="h-full w-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPhotoFile(null);
                                        setPhotoPreview('');
                                    }}
                                    className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border-200 bg-gray-50 px-4 py-8 transition-colors hover:border-accent hover:bg-gray-100">
                            <div className="text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <p className="mt-2 text-sm text-body">
                                    {photoPreview ? t('text-change-photo', 'Change Photo') : t('text-take-photo', 'Take Photo')}
                                </p>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Delivery Notes */}
                <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-body">
                        {t('text-delivery-notes', 'Delivery Notes')}
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full rounded border border-border-200 px-4 py-3 text-sm focus:border-accent focus:outline-none"
                        placeholder={t('text-add-notes', 'Add any notes about the delivery...')}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button
                        type="button"
                        onClick={closeModal}
                        variant="outline"
                        className="flex-1"
                    >
                        {t('text-cancel', 'Cancel')}
                    </Button>
                    <Button
                        type="submit"
                        loading={isLoading}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {t('text-confirm', 'Confirm')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ConfirmDeliveryModal;
