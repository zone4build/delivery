import { useTranslation } from 'next-i18next';

const PointsInfoView = () => {
  const { t } = useTranslation('common');

  return (
    <div className="flex h-full w-full max-w-lg flex-col rounded-lg bg-light p-6 md:p-10">
      <div className="flex items-center justify-center mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-accent">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <h3 className="mb-4 text-center text-xl font-bold text-heading">
        {t('text-points-how-it-works', 'How Reward Points Work')}
      </h3>

      <div className="space-y-6 text-sm text-body">
        <section>
          <h4 className="mb-1 font-bold text-heading">{t('text-earning-points', 'Earning Points')}</h4>
          <p>
            {t('text-earning-points-desc', 'Earn 1 point for every 10€ spent on any shop in our marketplace. The more you shop, the more you earn!')}
          </p>
        </section>

        <section>
          <h4 className="mb-1 font-bold text-heading">{t('text-spending-points', 'Spending Points')}</h4>
          <p>
            {t('text-spending-points-desc', 'Redeem your points at checkout for instant discounts. Each point is worth 0.10€.')}
          </p>
        </section>

        <section>
          <h4 className="mb-1 font-bold text-heading">{t('text-points-expiration', 'No Expiration')}</h4>
          <p>
            {t('text-points-expiration-desc', 'Your points never expire! Use them whenever you want to save on your favorite local products.')}
          </p>
        </section>
      </div>

      <div className="mt-8">
        <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-black italic">
          {t('text-points-footer', 'Happy Shopping on Zone4Build')}
        </p>
      </div>
    </div>
  );
};

export default PointsInfoView;
