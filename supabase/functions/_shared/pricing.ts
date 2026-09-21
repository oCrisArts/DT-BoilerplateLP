// Defaults are the existing, owner-provided Stripe IDs verified against Stripe.
// Secrets can override these mappings without changing the active LP version.
export const LEGACY_MONTHLY = 'price_1Tl5f2GjwjNbQit1yFRXBqBA';
export const LEGACY_LIFETIME = 'price_1Tl5YCGjwjNbQit1821CEBPI';

export function getPrices(env: (name: string) => string | undefined) {
  return {
    legacy: {
      monthly: env('STRIPE_PRICE_MONTHLY_LEGACY') || LEGACY_MONTHLY,
      lifetime: env('STRIPE_PRICE_LIFETIME_LEGACY') || LEGACY_LIFETIME,
    },
    new: {
      monthly: env('STRIPE_PRICE_MONTHLY_NEW') || 'price_1UIAm9GjwjNbQit1eNhhv5vX',
      annual: env('STRIPE_PRICE_ANNUAL_NEW') || 'price_1UIAnuGjwjNbQit1MngrZ5qo',
      lifetime: env('STRIPE_PRICE_LIFETIME_NEW') || 'price_1UIAocGjwjNbQit11jG4GtK1',
    },
  };
}

export function identifyPrice(priceId: string, env: (name: string) => string | undefined) {
  const prices = getPrices(env);
  // Always recognize the original IDs, even after legacy env values are configured.
  if ([LEGACY_LIFETIME, prices.legacy.lifetime, prices.new.lifetime].filter(Boolean).includes(priceId)) return 'lifetime';
  if ([LEGACY_MONTHLY, prices.legacy.monthly, prices.new.monthly].filter(Boolean).includes(priceId)) return 'monthly';
  if (prices.new.annual && priceId === prices.new.annual) return 'annual';
  return undefined;
}
