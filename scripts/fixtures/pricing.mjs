// Deliberately different values from the former LP constants.
export const stripePrices = [
  { id: 'price_test_monthly', active: true, lookup_key: 'starttoken_monthly', unit_amount: 1234, currency: 'usd', type: 'recurring', billing_scheme: 'per_unit', recurring: { interval: 'month', interval_count: 1, usage_type: 'licensed' } },
  { id: 'price_test_annual', active: true, lookup_key: 'starttoken_annual', unit_amount: 9876, currency: 'usd', type: 'recurring', billing_scheme: 'per_unit', recurring: { interval: 'year', interval_count: 1, usage_type: 'licensed' } },
  { id: 'price_test_lifetime', active: true, lookup_key: 'starttoken_lifetime', unit_amount: 23456, currency: 'usd', type: 'one_time', billing_scheme: 'per_unit', recurring: null },
];
export const publicPricing = Object.fromEntries(stripePrices.map(price => [price.lookup_key.replace('starttoken_', ''), { priceId: price.id, amount: price.unit_amount, currency: price.currency, interval: price.recurring?.interval ?? null }]));
