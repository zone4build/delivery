import cn from 'classnames';
import { Swiper, SwiperSlide, Navigation } from '@/components/ui/slider';
import { Image } from '@/components/ui/image';
import { productPlaceholder } from '@/lib/placeholders';
import Search from '@/components/ui/search/search';
import type { Banner } from '@/types';
import { useHeaderSearch } from '@/layouts/headers/header-search-atom';
import { useIntersection } from 'react-use';
import { useEffect, useRef } from 'react';
import { SHOP_CATEGORIES } from '@/lib/category-utils';
import { useAtom } from 'jotai';
import { categorySearchAtom, shopCategoriesAtom } from '@/store/map-search-atom';
import { getIcon } from '@/lib/get-icon';
import * as categoryIcons from '@/components/icons/category';

interface BannerProps {
  banners: Banner[] | undefined;
  layout?: string;
}

const BannerWithSearch: React.FC<BannerProps> = ({ banners, layout }) => {
  const { showHeaderSearch, hideHeaderSearch } = useHeaderSearch();
  const [shopCategories] = useAtom(shopCategoriesAtom);
  const intersectionRef = useRef<HTMLElement>(null);
  const intersection = useIntersection(intersectionRef as any, {
    root: null,
    rootMargin: '0px',
    threshold: 1,
  });
  useEffect(() => {
    if (intersection && intersection.isIntersecting) {
      hideHeaderSearch();
      return;
    }
    if (intersection && !intersection.isIntersecting) {
      showHeaderSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intersection]);

  return (
    <div
      className={cn('relative hidden lg:block', {
        '!block': layout === 'minimal',
      })}
    >
      <div className="-z-1 overflow-hidden">
        <div className="relative">
          {/* @ts-ignore */}
          <Swiper
            id="banner"
            // loop={true}
            modules={[Navigation]}
            resizeObserver={true}
            allowTouchMove={false}
            slidesPerView={1}
          >
            {banners?.map((banner, idx) => (
              <SwiperSlide key={idx}>
                <div
                  className={cn('relative h-screen w-full', {
                    'max-h-140': layout === 'standard',
                    'max-h-[320px] md:max-h-[680px]': layout === 'minimal',
                  })}
                >
                  <Image
                    className="h-full min-h-140 w-full"
                    src={banner.image?.original ?? productPlaceholder}
                    alt={banner.title ?? ''}
                    layout="fill"
                    objectFit="cover"
                  />
                  <div
                    className={cn(
                      'absolute inset-0 mt-8 flex w-full flex-col items-center justify-center p-5 text-center md:px-20 lg:space-y-10',
                      {
                        'space-y-5 md:!space-y-8': layout === 'minimal',
                      }
                    )}
                  >
                    <h1
                      className={cn(
                        'text-2xl font-bold tracking-tight text-heading lg:text-4xl xl:text-5xl',
                        {
                          '!text-accent': layout === 'minimal',
                         }
                      )}
                    >
                      {banner?.title}
                    </h1>
                    <p className="text-sm text-heading lg:text-base xl:text-lg">
                      {banner?.description}
                    </p>
                    <div className="w-full max-w-3xl" ref={intersectionRef as React.RefObject<HTMLDivElement>}>
                      <Search label="search" />
                      
                      {/* Category Pills - Quick Intent Filters */}
                      <div className="mt-8 flex w-full overflow-x-auto no-scrollbar py-2 items-center justify-center space-x-3 flex-nowrap">
                        {(shopCategories.length > 0 ? shopCategories : SHOP_CATEGORIES).map((cat) => (
                          <CategoryPill key={cat.id} category={cat} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};


const CategoryPill = ({ category }: { category: any }) => {
  const [selectedCategory, setSelectedCategory] = useAtom(categorySearchAtom);
  const isActive = selectedCategory === category.id;
  
  return (
    <button
      onClick={() => setSelectedCategory(isActive ? null : category.id)}
      className={cn(
        "whitespace-nowrap px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all flex items-center shadow-xl border-2",
        isActive 
          ? "bg-accent text-white border-accent scale-105" 
          : "bg-white/90 text-heading border-white hover:bg-white hover:scale-105"
      )}
    >
      <span className="mr-2 text-base leading-none flex items-center justify-center h-5 w-5">
        {category.icon && category.icon.length > 2 ? (
          getIcon({
            iconList: categoryIcons,
            iconName: category.icon,
            className: isActive ? "text-white" : "text-accent",
          })
        ) : (
          category.icon || '🏠'
        )}
      </span>
      {category.name}
    </button>
  );
};



export default BannerWithSearch;
