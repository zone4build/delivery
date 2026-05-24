import { Order } from '@/types';
import { Phone, MapPin, Navigation } from '@/components/icons';
import { useTranslation } from 'next-i18next';

interface Props {
    order: Order;
}

const CustomerContactCard = ({ order }: Props) => {
    const { t } = useTranslation('common');
    const { customer, shipping_address }: any = order ?? {};

    const handleCall = () => {
        if (order?.customer_contact) {
            window.location.href = `tel:${order.customer_contact}`;
        }
    };

    const handleNavigate = () => {
        if (shipping_address) {
            const address = `${shipping_address.street_address}, ${shipping_address.city}, ${shipping_address.state} ${shipping_address.zip}`;
            const encodedAddress = encodeURIComponent(address);
            // Open in Google Maps
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
        }
    };

    return (
        <div className="mb-4 rounded-lg border border-border-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-heading">
                {t('text-customer-information', 'Customer Information')}
            </h3>

            {/* Customer Name */}
            <div className="mb-3 flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <div className="ltr:ml-3 rtl:mr-3">
                    <p className="text-sm font-medium text-heading">{customer?.name || t('text-guest', 'Guest')}</p>
                    <p className="text-xs text-body">{customer?.email || ''}</p>
                </div>
            </div>

            {/* Phone Number with Call Button */}
            {order?.customer_contact && (
                <div className="mb-3 flex items-center justify-between rounded-md bg-gray-50 p-3">
                    <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-600 ltr:mr-2 rtl:ml-2" />
                        <span className="text-sm text-body">{order.customer_contact}</span>
                    </div>
                    <button
                        onClick={handleCall}
                        className="flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
                    >
                        <Phone className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                        {t('text-call', 'Call')}
                    </button>
                </div>
            )}

            {/* Delivery Address with Navigate Button */}
            {shipping_address && (
                <div className="rounded-md bg-gray-50 p-3">
                    <div className="mb-2 flex items-start">
                        <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-600 ltr:mr-2 rtl:ml-2" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-heading">{t('text-delivery-address', 'Delivery Address')}</p>
                            <p className="mt-1 text-sm text-body">
                                {shipping_address.street_address}
                                {shipping_address.city && `, ${shipping_address.city}`}
                                {shipping_address.state && `, ${shipping_address.state}`}
                                {shipping_address.zip && ` ${shipping_address.zip}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleNavigate}
                        className="mt-2 flex w-full items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                    >
                        <Navigation className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {t('text-navigate', 'Navigate')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CustomerContactCard;
