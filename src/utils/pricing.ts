export type PricingVersion = 'legacy' | 'new';
export type PaidPlan = 'monthly' | 'annual' | 'lifetime';

// Version sent to checkout and analytics; legacy remains only for old API clients.
export const ACTIVE_PRICING_VERSION: PricingVersion = 'new';

export const SUPABASE_URL = 'https://lyexuguaeuwdtjeqwmst.supabase.co';
// Public anonymous project key; this is not the Stripe secret or service-role key.
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZXh1Z3VhZXV3ZHRqZXF3bXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMDUwNjUsImV4cCI6MjA5NzY4MTA2NX0.6CXtpaQJHqpWOW0WocuT2Yjpd3ivTzree5JUOj5NfZ0';
export type PublicPrice = { priceId: string; amount: number; currency: string; interval: 'month' | 'year' | null };
export type PublicPricing = Record<PaidPlan, PublicPrice>;

export function validatePricing(data: unknown): PublicPricing {
  if (!data || typeof data !== 'object') throw new Error('Invalid pricing');
  for (const [plan, interval] of [['monthly', 'month'], ['annual', 'year'], ['lifetime', null]] as const) {
    const price = (data as PublicPricing)[plan];
    if (!price || typeof price.priceId !== 'string' || !price.priceId.startsWith('price_') ||
      !Number.isSafeInteger(price.amount) || price.amount < 0 || typeof price.currency !== 'string' ||
      !/^[a-z]{3}$/i.test(price.currency) || price.interval !== interval) throw new Error('Invalid pricing');
    formatPrice(price);
  }
  return data as PublicPricing;
}

// Stripe unit_amount uses minor units, including its ISK/UGX compatibility rules.
export function formatPrice(price: Pick<PublicPrice, 'amount' | 'currency'>, locale = 'en-US') {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: price.currency.toUpperCase() });
  const digits = ['isk', 'ugx'].includes(price.currency.toLowerCase()) ? 2 : formatter.resolvedOptions().maximumFractionDigits;
  return formatter.format(price.amount / 10 ** digits);
}

export async function fetchPricing(): Promise<PublicPricing> {
  const response = await fetch(SUPABASE_URL + '/functions/v1/get-pricing', { headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Pricing temporarily unavailable');
  return validatePricing(await response.json());
}
