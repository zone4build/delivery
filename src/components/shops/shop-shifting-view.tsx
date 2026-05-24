import React from 'react';
import { useTranslation } from 'next-i18next';
import { Shop } from '@/types';
import dynamic from 'next/dynamic';

const ShopSlider = dynamic(() => import('./shop-slider'), {
    ssr: false,
    loading: () => (
        <div className="flex h-32 items-center justify-center rounded border border-gray-200 bg-gray-50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-accent border-gray-300" />
        </div>
    ),
});

const ShopShiftingView: React.FC<{ shops: Shop[] }> = ({ shops }) => {
    const { t } = useTranslation('common');

    return (
        <div className="w-full px-4 py-8 lg:px-8">
            <div className="mb-6 flex flex-col items-start justify-between sm:flex-row sm:items-center border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-heading lg:text-2xl">
                    {t('text-shops')}
                </h2>
            </div>

            <div className="w-full transition-all duration-300">
                <ShopSlider shops={shops} />
            </div>
        </div>
    );
};

export default ShopShiftingView;
