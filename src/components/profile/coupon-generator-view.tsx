import Card from '@/components/ui/cards/card';
import Button from '@/components/ui/button';
import { useUser } from '@/framework/user';
import { useRedeemPointsForCoupon } from '@/framework/rest/points-coupon';
import { useShop } from '@/framework/rest/shop';
import { useShopApiSlug } from '@/lib/hooks/use-shop-slug-context';
import {
  MIN_REDEEM_POINTS,
  POINTS_PER_ONE_PERCENT,
  POINTS_REDEEM_STEP,
  buildRedeemPointsCouponPayload,
  isValidRedeemPoints,
} from '@/lib/points-coupon-payload';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';

function PointsToCouponArrow({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 12h36M32 5l11 7-11 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CouponGeneratorView() {
  const { t } = useTranslation('common');
  const { me, isLoading: userLoading } = useUser();
  const apiSlug = useShopApiSlug();
  const { shop } = useShop(apiSlug ?? '');
  const { mutate, isLoading } = useRedeemPointsForCoupon();

  const available = me?.wallet?.available_points ?? 0;
  const maxRedeemable =
    Math.floor(Number(available) / POINTS_REDEEM_STEP) * POINTS_REDEEM_STEP;

  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (maxRedeemable < MIN_REDEEM_POINTS) {
      setPoints(0);
      return;
    }
    setPoints((prev) => {
      if (prev < MIN_REDEEM_POINTS || prev > maxRedeemable) {
        return Math.min(MIN_REDEEM_POINTS, maxRedeemable);
      }
      return prev;
    });
  }, [maxRedeemable]);

  const shopIdNum = shop?.id != null ? Number(shop.id) : undefined;
  const shopIdForPayload =
    shopIdNum != null && !Number.isNaN(shopIdNum) ? shopIdNum : undefined;

  const discountPercent = useMemo(() => {
    if (!isValidRedeemPoints(points)) return 0;
    return points / POINTS_PER_ONE_PERCENT;
  }, [points]);

  const payloadPreview = useMemo(() => {
    try {
      if (!isValidRedeemPoints(points)) return null;
      return buildRedeemPointsCouponPayload(points, shopIdForPayload);
    } catch {
      return null;
    }
  }, [points, shopIdForPayload]);

  const handleSubmit = () => {
    if (points > maxRedeemable) return;
    try {
      mutate(buildRedeemPointsCouponPayload(points, shopIdForPayload));
    } catch {
      // validation handled by UI
    }
  };

  const bumpPoints = (delta: number) => {
    setPoints((p) => {
      const next = p + delta;
      if (next < MIN_REDEEM_POINTS) return MIN_REDEEM_POINTS;
      if (next > maxRedeemable) return maxRedeemable;
      return next;
    });
  };

  const canRedeem = maxRedeemable >= MIN_REDEEM_POINTS;
  const canDecrease = canRedeem && points > MIN_REDEEM_POINTS;
  const canIncrease = canRedeem && points < maxRedeemable;

  if (userLoading || !me) {
    return null;
  }

  const couponDisplay = canRedeem ? discountPercent : null;

  const pointsCircleClass =
    'relative flex min-h-[13.5rem] min-w-[13.5rem] w-[min(78vw,13.5rem)] max-w-[100%] flex-col items-center justify-center rounded-full border-[3px] border-accent/45 bg-gradient-to-b from-light to-accent/5 px-3 py-4 text-center shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] ring-4 ring-accent/10 sm:min-h-[15rem] sm:min-w-[15rem] sm:w-[15rem] sm:px-4';

  const stepBtnClass =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-accent/40 bg-light text-xl font-bold leading-none text-accent shadow-sm transition hover:border-accent hover:bg-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-border-200 disabled:text-muted disabled:opacity-40 sm:h-12 sm:w-12';

  const couponCircleClass =
    'relative flex aspect-square w-[min(42vw,9.5rem)] shrink-0 flex-col items-center justify-center rounded-full border-[3px] text-center shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] sm:w-40 sm:border-[3px] border-heading/15 bg-gradient-to-b from-gray-50 to-light ring-4 ring-heading/5';

  return (
    <Card className="w-full overflow-hidden shadow-none sm:shadow">
      <div className="border-b border-border-200 bg-gradient-to-br from-light via-gray-50/80 to-light px-5 py-6 sm:px-10 sm:py-8">
        <h1 className="text-xl font-semibold tracking-tight text-heading sm:text-2xl">
          {t('text-coupon-generator-title')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body">
          {t('text-coupon-generator-intro')}
        </p>
      </div>

      <div className="px-5 py-8 sm:px-10">
        <div className="mb-8 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border-200 bg-light px-4 py-2 text-sm shadow-sm">
            <span className="font-semibold text-heading">
              {t('text-available-points-label')}
            </span>
            <span className="tabular-nums text-accent">{available}</span>
          </span>
        </div>

        {!canRedeem ? (
          <p className="text-center text-sm text-body">
            {t('error-insufficient-points')}
          </p>
        ) : (
          <>
            <div className="mx-auto flex max-w-xl flex-col items-center gap-2 sm:flex-row sm:items-stretch sm:justify-center sm:gap-0">
              {/* Points circle with − / + */}
              <div className="flex flex-col items-center sm:flex-1">
                <div className={pointsCircleClass}>
                  <div className="flex w-full max-w-[11.5rem] items-center justify-between gap-1 sm:max-w-[13rem]">
                    <button
                      type="button"
                      className={stepBtnClass}
                      aria-label={t('text-points-decrease')}
                      disabled={!canDecrease}
                      onClick={() => bumpPoints(-POINTS_REDEEM_STEP)}
                    >
                      −
                    </button>
                    <div className="min-w-0 flex-1 text-center">
                      <span className="block text-[clamp(1.65rem,7vw,2.5rem)] font-bold leading-none tabular-nums text-accent sm:text-[2.35rem]">
                        {points}
                      </span>
                      <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-accent/80 sm:text-xs">
                        {t('text-points')}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={stepBtnClass}
                      aria-label={t('text-points-increase')}
                      disabled={!canIncrease}
                      onClick={() => bumpPoints(POINTS_REDEEM_STEP)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <p className="mt-3 max-w-[14rem] text-center text-xs leading-snug text-muted sm:max-w-none">
                  {t('text-points-to-redeem')}
                </p>
                <p className="mt-1 max-w-[16rem] text-center text-[11px] leading-snug text-muted/90 sm:text-xs">
                  {t('text-points-step-hint', {
                    min: MIN_REDEEM_POINTS,
                    step: POINTS_REDEEM_STEP,
                    max: maxRedeemable,
                  })}
                </p>
              </div>

              <div
                className="flex h-10 items-center justify-center text-accent sm:h-auto sm:w-14 sm:shrink-0 sm:self-center"
                aria-hidden
              >
                <PointsToCouponArrow className="h-5 w-14 rotate-90 sm:h-6 sm:w-16 sm:rotate-0 rtl:sm:scale-x-[-1]" />
              </div>

              <div className="flex flex-col items-center sm:flex-1">
                <div className={couponCircleClass}>
                  <span className="text-[clamp(1.75rem,8vw,2.75rem)] font-bold leading-none tabular-nums text-heading sm:text-5xl">
                    {couponDisplay != null && couponDisplay > 0
                      ? `${Math.round(couponDisplay * 100) / 100}%`
                      : '—'}
                  </span>
                  <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-body sm:text-xs">
                    {t('text-discount')}
                  </span>
                </div>
                <p className="mt-3 max-w-[10rem] text-center text-xs leading-snug text-muted sm:max-w-none">
                  {t('text-discount-preview')}
                </p>
              </div>
            </div>

            <div className="mx-auto mt-10 flex max-w-md justify-center sm:justify-start">
              <Button
                type="button"
                className="w-full min-w-[200px] sm:w-auto"
                loading={isLoading}
                disabled={isLoading || !payloadPreview}
                onClick={handleSubmit}
              >
                {t('button-generate-coupon')}
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
