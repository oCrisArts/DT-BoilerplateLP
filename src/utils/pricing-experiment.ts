export type PricingVariant = 'A' | 'B';
export type PaidPlan = 'monthly' | 'annual' | 'lifetime';
export const PRICING_STORAGE_KEY = 'starttokens_pricing_variant';

// QA overrides never overwrite the visitor's original assignment.
export function getPricingVariant(): PricingVariant {
  const params = new URLSearchParams(window.location.search);
  const override = params.get('pricing_variant');
  if (override === 'A' || override === 'B') return override;
  // Existing plugin checkout links promise legacy prices and bypass the experiment.
  if (['monthly', 'lifetime'].includes(params.get('plan') ?? '')) return 'A';
  try {
    const saved = localStorage.getItem(PRICING_STORAGE_KEY);
    if (saved === 'A' || saved === 'B') return saved;
  } catch { /* Storage may be disabled; keep the assignment in component state. */ }
  const variant = Math.random() < 0.5 ? 'A' : 'B';
  try { localStorage.setItem(PRICING_STORAGE_KEY, variant); } catch { /* See above. */ }
  return variant;
}
