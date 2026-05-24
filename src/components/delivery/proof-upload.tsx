import { useState } from 'react';
import Button from '@/components/ui/button';
import FileInput from '@/components/ui/forms/file-input'; // Assuming this exists or using standard input
import { useTranslation } from 'next-i18next';
import { useUpdateOrder } from '@/framework/order';

interface DeliveryProofProps {
    orderId: string | number;
    onSuccess?: () => void;
}

export const DeliveryProof: React.FC<DeliveryProofProps> = ({ orderId, onSuccess }) => {
    const { t } = useTranslation('common');
    const [photo, setPhoto] = useState<any>(null);
    const [notes, setNotes] = useState('');
    const { updateOrder, isLoading } = useUpdateOrder();

    const handleSubmit = async () => {
        // 1. In a real app, you would upload the photo to S3/Cloudinary first
        // 2. Then save the URL and notes to the generic 'delivery_proof' JSONB field

        const deliveryData = {
            delivery_proof: {
                photo_url: photo?.[0]?.thumbnail || 'pending_upload', // Simplified for demo
                notes: notes,
                timestamp: new Date().toISOString(),
            },
            status_id: 7, // 7 is 'Delivered' according to DB
        };

        updateOrder({
            id: orderId,
            ...deliveryData,
        }, {
            onSuccess: () => {
                if (onSuccess) onSuccess();
            }
        });
    };

    return (
        <div className="p-5 border border-dashed border-gray-300 rounded-md bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-4">{t('text-delivery-proof')}</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('text-capture-photo')}
                </label>
                <FileInput
                    name="proof_photo"
                    control={null as any}
                    multiple={false}
                    //@ts-ignore
                    onChange={setPhoto}
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('text-delivery-notes')}
                </label>
                <textarea
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded focus:outline-none focus:border-accent"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('text-add-details-placeholder')}
                />
            </div>

            <Button
                loading={isLoading}
                disabled={!photo}
                onClick={handleSubmit}
                className="w-full"
            >
                {t('text-confirm-delivery')}
            </Button>
        </div>
    );
};

export default DeliveryProof;
