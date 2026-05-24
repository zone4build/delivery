import { useTranslation } from 'next-i18next';

interface Props {
    currentStatus: number;
}

const DeliveryTimeline = ({ currentStatus }: Props) => {
    const { t } = useTranslation('common');

    const statuses = [
        { serial: 4, label: t('text-assigned', 'Assigned'), key: 'assigned' },
        { serial: 5, label: t('text-picked-up', 'Picked Up'), key: 'picked_up' },
        { serial: 6, label: t('text-out-for-delivery', 'Out for Delivery'), key: 'out_for_delivery' },
        { serial: 11, label: t('text-delivered', 'Delivered'), key: 'delivered' },
    ];

    return (
        <div className="mb-6 rounded-lg border border-border-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-heading">
                {t('text-delivery-progress', 'Delivery Progress')}
            </h3>
            <div className="relative flex items-center justify-between">
                {/* Progress Line */}
                <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-gray-200">
                    <div
                        className="h-full bg-accent transition-all duration-300"
                        style={{
                            width: `${((statuses.findIndex(s => s.serial === currentStatus) + 1) / statuses.length) * 100}%`,
                        }}
                    />
                </div>

                {/* Status Points */}
                {statuses.map((status, index) => {
                    const isCompleted = currentStatus >= status.serial;
                    const isCurrent = currentStatus === status.serial;

                    return (
                        <div key={status.key} className="relative z-10 flex flex-col items-center">
                            {/* Circle */}
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${isCompleted
                                        ? 'border-accent bg-accent text-white'
                                        : 'border-gray-300 bg-white text-gray-400'
                                    } ${isCurrent ? 'ring-4 ring-accent ring-opacity-30' : ''}`}
                            >
                                {isCompleted ? (
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ) : (
                                    <span className="text-sm font-semibold">{index + 1}</span>
                                )}
                            </div>
                            {/* Label */}
                            <span
                                className={`mt-2 text-center text-xs ${isCompleted ? 'font-medium text-heading' : 'text-body'
                                    }`}
                            >
                                {status.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DeliveryTimeline;
