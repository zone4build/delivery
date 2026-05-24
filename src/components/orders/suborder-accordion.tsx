import { Disclosure } from '@headlessui/react';
import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import usePrice from '@/lib/use-price';
import Badge from '@/components/ui/badge';
import { OrderItems } from '@/components/orders/order-items';
import { ArrowDownIcon } from '@/components/icons/arrow-down';
import cn from 'classnames';

interface SuborderAccordionProps {
  suborders: any[];
}

const SuborderAccordion: React.FC<SuborderAccordionProps> = ({ suborders }) => {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-4">
      {suborders?.map((suborder: any) => {
        const { price: total } = usePrice({
          amount: suborder?.paid_total!,
          currencyCode: suborder?.currency,
        });

        return (
          <Disclosure key={suborder.id}>
            {({ open }) => (
              <div className="overflow-hidden rounded-lg border border-border-200 bg-white shadow-sm transition-all hover:border-accent/30">
                <Disclosure.Button className="flex w-full items-center justify-between px-5 py-4 text-left focus:outline-none focus-visible:ring focus-visible:ring-accent/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 rtl:sm:space-x-reverse">
                    <span className="text-sm font-bold text-heading uppercase tracking-tighter">
                      {typeof suborder?.shop?.name === 'object' 
                        ? (suborder?.shop?.name[suborder?.language || 'en'] || suborder?.shop?.name['en']) 
                        : suborder?.shop?.name ?? t('text-shop')}
                    </span>
                    <span className="hidden sm:block h-4 w-px bg-gray-200" />
                    <span className="text-xs font-semibold text-body-dark">
                      #{suborder.tracking_number}
                    </span>
                    <Badge
                      text={typeof suborder?.status?.name === 'object'
                        ? (suborder?.status?.name[suborder?.language || 'en'] || suborder?.status?.name['en'])
                        : suborder?.status?.name}
                      style={{ backgroundColor: suborder?.status?.color }}
                      className="mt-1 sm:mt-0"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <span className="text-sm font-black text-accent">{total}</span>
                    <ArrowDownIcon
                      className={cn(
                        'h-5 w-5 text-gray-400 transition-transform duration-200',
                        { 'rotate-180': open }
                      )}
                    />
                  </div>
                </Disclosure.Button>

                <Disclosure.Panel className="px-5 pb-5 pt-0">
                  <div className="border-t border-gray-100 pt-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 mb-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          {t('text-date')}
                        </span>
                        <span className="text-sm font-semibold text-heading">
                          {dayjs(suborder.created_at).format('MMMM D, YYYY')}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          {t('text-payment-method')}
                        </span>
                        <span className="text-sm font-semibold text-heading uppercase">
                          {suborder.payment_gateway}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          {t('text-total-item')}
                        </span>
                        <span className="text-sm font-semibold text-heading">
                          {suborder?.products?.length} {t('text-item')}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          {t('text-delivery-code', 'Delivery Code')}
                        </span>
                        <span className="text-sm font-semibold text-heading uppercase">
                          {suborder?.delivery_code ?? '—'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-8 mt-2">
                      <div className="flex justify-between items-end mb-2">
                         <span className="text-xs font-bold text-heading uppercase tracking-widest">{t('text-status')}: {suborder?.status?.name}</span>
                         <span className="text-[10px] font-medium text-body uppercase">{Math.min(100, (suborder?.status?.serial / 6) * 100).toFixed(0)}% Complete</span>
                      </div>
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                        <div 
                          className="absolute left-0 top-0 h-full bg-accent transition-all duration-1000 ease-out" 
                          style={{ width: `${(suborder?.status?.serial / 6) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-gray-50 bg-gray-50/50 p-2 sm:p-4">
                      <OrderItems products={suborder?.products} orderId={suborder?.id} />
                    </div>
                  </div>
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        );
      })}
    </div>
  );
};

export default SuborderAccordion;
