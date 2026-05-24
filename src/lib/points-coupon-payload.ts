import type { RedeemPointsCouponRequest } from '@/types';

/** Wallet points that equal 1% off (150 pts → 1.5%). */
export const POINTS_PER_ONE_PERCENT = 100;

/** Smallest amount you can redeem (50 alone is not allowed). */
export const MIN_REDEEM_POINTS = 100;

/** Redeem only in these increments: 100, 150, 200, 250, … */
export const POINTS_REDEEM_STEP = 50;

export function isValidRedeemPoints(points: number): boolean {
  return (
    Number.isFinite(points) &&
    points >= MIN_REDEEM_POINTS &&
    points % POINTS_REDEEM_STEP === 0
  );
}

export function buildRedeemPointsCouponPayload(
  points: number,
  shopId?: number
): RedeemPointsCouponRequest {
  if (!isValidRedeemPoints(points)) {
    throw new Error('points_invalid');
  }
  const discount_percentage = points / POINTS_PER_ONE_PERCENT;
  const payload: RedeemPointsCouponRequest = {
    points,
    discount_percentage,
    type: 'generated',
  };
  if (shopId != null && Number.isFinite(shopId)) {
    payload.shop_id = shopId;
  }
  return payload;
}
