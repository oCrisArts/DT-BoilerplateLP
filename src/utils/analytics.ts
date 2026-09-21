// Analytics tracking functions for Google Analytics, Microsoft Clarity, and Hotjar

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
    hj?: (...args: any[]) => void;
  }
}

// Google Analytics
function trackGAEvent(eventName: string, parameters?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
}

// Microsoft Clarity
function trackClarityEvent(eventName: string, parameters?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('event', eventName);
  }
}

// Hotjar
function trackHotjarEvent(eventName: string) {
  if (typeof window !== 'undefined' && window.hj) {
    window.hj('event', eventName);
  }
}

// Combined tracking function
function trackEvent(eventName: string, parameters?: Record<string, any>) {
  trackGAEvent(eventName, parameters);
  trackClarityEvent(eventName, parameters);
  trackHotjarEvent(eventName);
  if (parameters?.variant) {
    window.clarity?.('set', 'pricing_variant', parameters.variant);
    // Clarity/Hotjar events do not support arbitrary payloads.
    const segment = `${eventName}_${parameters.variant}${parameters.plan ? `_${parameters.plan}` : ''}`;
    trackClarityEvent(segment);
    trackHotjarEvent(segment);
  }
}

// Funnel tracking functions
export function trackHeroCTA() {
  trackEvent('hero_cta_click');
}

export function trackPricingClick(plan?: string, variant?: string) {
  trackEvent('pricing_click', { plan, variant });
}

export function trackPricingExperimentView(variant: string) {
  trackEvent('pricing_experiment_view', { variant });
}

export function trackInstallPlugin() {
  trackEvent('install_plugin_click');
}

export function trackFAQExpand(question: string) {
  trackEvent('faq_expand', { question });
}

export function trackCheckoutStarted(plan: string, variant?: string) {
  trackEvent('checkout_started', { plan, variant });
}

export function trackPurchase(value: number, currency: string) {
  trackEvent('purchase', { value, currency });
}
