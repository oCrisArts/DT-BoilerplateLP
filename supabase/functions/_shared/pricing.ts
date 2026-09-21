export const LEGACY_MONTHLY = 'price_1Tl5f2GjwjNbQit1yFRXBqBA';
export const LEGACY_LIFETIME = 'price_1Tl5YCGjwjNbQit1821CEBPI';

export function getPrices(env: (name: string) => string | undefined) {
  return {
    A: {
      monthly: env('STRIPE_PRICE_MONTHLY_LEGACY') || LEGACY_MONTHLY,
      lifetime: env('STRIPE_PRICE_LIFETIME_LEGACY') || LEGACY_LIFETIME,
    },
    B: {
      monthly: env('STRIPE_PRICE_MONTHLY_NEW'),
      annual: env('STRIPE_PRICE_ANNUAL_NEW'),
      lifetime: env('STRIPE_PRICE_LIFETIME_NEW'),
    },
  };
}

export function identifyPrice(priceId: string, env: (name: string) => string | undefined) {
  const prices = getPrices(env);
  // Always recognize the original IDs, even after legacy env values are configured.
  if ([LEGACY_LIFETIME, prices.A.lifetime, prices.B.lifetime].filter(Boolean).includes(priceId)) return 'lifetime';
  if ([LEGACY_MONTHLY, prices.A.monthly, prices.B.monthly].filter(Boolean).includes(priceId)) return 'monthly';
  if (prices.B.annual && priceId === prices.B.annual) return 'annual';
  return undefined;
}
