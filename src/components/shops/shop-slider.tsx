import React from 'react';
import { Swiper, SwiperSlide, Navigation } from '@/components/ui/slider';
import { Shop } from '@/types';
import ShopCard from '@/components/ui/cards/shop';
import { useTranslation } from 'next-i18next';
import { ArrowNext, ArrowPrev } from '@/components/icons';

const shopSliderBreakpoints = {
    320: {
        slidesPerView: 1,
        spaceBetween: 10,
    },
    640: {
        slidesPerView: 2,
        spaceBetween: 16,
    },
    1024: {
        slidesPerView: 3,
        spaceBetween: 20,
    },
    1280: {
        slidesPerView: 4,
        spaceBetween: 24,
    },
};

const ShopSlider: React.FC<{ shops: Shop[] }> = ({ shops }) => {
    const { t } = useTranslation('common');

    if (!shops.length) {
        return (
            <div className="flex h-32 items-center justify-center rounded border border-gray-200 bg-gray-50 text-gray-500 text-sm">
                {t('text-no-shops')}
            </div>
        );
    }

    return (
        <div className="relative group">
            <Swiper
                id="shops-slider"
                breakpoints={shopSliderBreakpoints}
                modules={[Navigation]}
                navigation={{
                    nextEl: '.shop-next',
                    prevEl: '.shop-prev',
                }}
                className="!px-1"
            >
                {shops.map((shop) => (
                    <SwiperSlide key={shop.id} className="py-2">
                        <ShopCard shop={shop} />
                    </SwiperSlide>
                ))}
            </Swiper>

            <div
                className="shop-prev absolute z-10 flex items-center justify-center w-9 h-9 -mt-4 transition-all duration-200 border rounded-full shadow-xl cursor-pointer top-2/4 ltr:-left-4 rtl:-right-4 bg-light border-border-200 border-opacity-70 text-heading hover:bg-accent hover:text-light hover:border-accent opacity-0 group-hover:opacity-100"
                role="button"
            >
                <span className="sr-only">{t('common:text-previous')}</span>
                <ArrowPrev width={18} height={18} />
            </div>
            <div
                className="shop-next absolute z-10 flex items-center justify-center w-9 h-9 -mt-4 transition-all duration-200 border rounded-full shadow-xl cursor-pointer top-2/4 ltr:-right-4 rtl:-left-4 bg-light border-border-200 border-opacity-70 text-heading hover:bg-accent hover:text-light hover:border-accent opacity-0 group-hover:opacity-100"
                role="button"
            >
                <span className="sr-only">{t('common:text-next')}</span>
                <ArrowNext width={18} height={18} />
            </div>
        </div>
    );
};

export default ShopSlider;
