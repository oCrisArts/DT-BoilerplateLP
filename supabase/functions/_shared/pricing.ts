export const LOOKUP_KEYS = {
  monthly: 'starttoken_monthly',
  annual: 'starttoken_annual',
  lifetime: 'starttoken_lifetime',
} as const;
export type PaidPlan = keyof typeof LOOKUP_KEYS;
export type PublicPrice = { priceId: string; amount: number; currency: string; interval: 'month' | 'year' | null };
export type StripePrice = {
  id: string; active?: boolean; lookup_key?: string | null; unit_amount?: number | null;
  currency?: string; type?: string; billing_scheme?: string;
  recurring?: { interval: string; interval_count: number; usage_type?: string } | null;
};
type PriceClient = { prices: { list: (params: { active: boolean; lookup_keys: string[]; limit: number }) => Promise<{ data: StripePrice[] }> } };

function matchesPlan(price: StripePrice, plan: PaidPlan) {
  return plan === 'lifetime'
    ? price.type === 'one_time' && !price.recurring
    : price.type === 'recurring' && price.recurring?.interval === (plan === 'monthly' ? 'month' : 'year') && price.recurring.interval_count === 1 && price.recurring.usage_type === 'licensed';
}

// amount is Stripe's unit_amount in minor currency units; no monetary defaults live here.
export async function resolvePricing(stripe: PriceClient, plans: PaidPlan[] = ['monthly', 'annual', 'lifetime']) {
  const result = await stripe.prices.list({ active: true, lookup_keys: plans.map(plan => LOOKUP_KEYS[plan]), limit: 10 });
  return Object.fromEntries(plans.map(plan => {
    const matches = result.data.filter(price => price.lookup_key === LOOKUP_KEYS[plan] && price.active);
    const price = matches[0];
    if (matches.length !== 1 || !price.id || !matchesPlan(price, plan) || price.billing_scheme !== 'per_unit' ||
      !Number.isSafeInteger(price.unit_amount) || price.unit_amount! < 0 || !/^[a-z]{3}$/.test(price.currency || '')) {
      throw new Error('Pricing unavailable for ' + plan);
    }
    return [plan, { priceId: price.id, amount: price.unit_amount!, currency: price.currency!, interval: price.recurring?.interval ?? null }];
  })) as Record<PaidPlan, PublicPrice>;
}

// Technical compatibility for already-published clients with no pricingVersion or variant A.
export const LEGACY_MONTHLY = 'price_1Tl5f2GjwjNbQit1yFRXBqBA';
export const LEGACY_LIFETIME = 'price_1Tl5YCGjwjNbQit1821CEBPI';
export function getLegacyPrices(env: (name: string) => string | undefined) {
  return {
    monthly: env('STRIPE_PRICE_MONTHLY_LEGACY') || LEGACY_MONTHLY,
    lifetime: env('STRIPE_PRICE_LIFETIME_LEGACY') || LEGACY_LIFETIME,
  };
}

export function identifyPrice(price: StripePrice, env: (name: string) => string | undefined, metadata: Record<string, string> = {}) {
  const lookup = price.lookup_key || (metadata.price_id === price.id ? metadata.pricing_lookup_key : undefined);
  const plan = (Object.keys(LOOKUP_KEYS) as PaidPlan[]).find(plan => LOOKUP_KEYS[plan] === lookup);
  if (plan && matchesPlan(price, plan)) return plan;
  const legacy = getLegacyPrices(env);
  if ([LEGACY_LIFETIME, legacy.lifetime].includes(price.id)) return 'lifetime';
  if ([LEGACY_MONTHLY, legacy.monthly].includes(price.id)) return 'monthly';
  return undefined;
}
