import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useModalAction } from '../ui/modal/modal.context';
import Button from '../ui/button';
import { useUpdateOrder } from '@/framework/order';
import { toast } from 'react-toastify';

interface Props {
    orderId: string | number;
    onSuccess?: (newStatus: number) => void;
}

const ReportIssueModal = ({ orderId, onSuccess }: Props) => {
    const { t } = useTranslation('common');
    const { closeModal } = useModalAction();
    const [issueType, setIssueType] = useState('');
    const [notes, setNotes] = useState('');
    const { mutate: updateOrder, isLoading } = useUpdateOrder();

    const issueTypes = [
        { value: 'customer_not_available', label: t('text-customer-not-available', 'Customer Not Available') },
        { value: 'wrong_address', label: t('text-wrong-address', 'Wrong Address') },
        { value: 'customer_refused', label: t('text-customer-refused', 'Customer Refused Order') },
        { value: 'payment_issue', label: t('text-payment-issue', 'Payment Issue') },
        { value: 'other', label: t('text-other', 'Other') },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!issueType) {
            toast.error(t('text-select-issue-type', 'Please select an issue type'));
            return;
        }

        // Map issue type to order status
        let newStatusId = 9; // Default: Failed to contact Consignee
        if (issueType === 'payment_issue') {
            newStatusId = 8; // Failed to collect payment
        } else if (issueType === 'customer_refused') {
            newStatusId = 10; // Shipment Refused by Consignee
        }

        updateOrder(
            {
                id: orderId.toString(),
                status: newStatusId,
                // You might want to add a notes field to the order
            },
            {
                onSuccess: () => {
                    toast.success(t('text-issue-reported', 'Issue reported successfully'));
                    closeModal();
                    if (onSuccess) onSuccess(newStatusId);
                },
                onError: () => {
                    toast.error(t('text-error-occurred', 'An error occurred'));
                },
            }
        );
    };

    return (
        <div className="m-auto w-full max-w-md rounded-md bg-white p-6 sm:w-[450px]">
            <h3 className="mb-4 text-center text-lg font-semibold text-heading">
                {t('text-report-delivery-issue', 'Report Delivery Issue')}
            </h3>

            <form onSubmit={handleSubmit}>
                {/* Issue Type Selection */}
                <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-body">
                        {t('text-issue-type', 'Issue Type')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value)}
                        className="w-full rounded border border-border-200 px-4 py-3 text-sm focus:border-accent focus:outline-none"
                        required
                    >
                        <option value="">{t('text-select-issue', 'Select an issue')}</option>
                        {issueTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-body">
                        {t('text-additional-notes', 'Additional Notes')}
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="w-full rounded border border-border-200 px-4 py-3 text-sm focus:border-accent focus:outline-none"
                        placeholder={t('text-describe-issue', 'Describe the issue...')}
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
                        disabled={!issueType || isLoading}
                        className="flex-1"
                    >
                        {t('text-submit-report', 'Submit Report')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ReportIssueModal;
