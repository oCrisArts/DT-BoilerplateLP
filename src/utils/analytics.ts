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
}

// Funnel tracking functions
export function trackHeroCTA() {
  trackEvent('hero_cta_click');
}

export function trackInstallPlugin() {
  trackEvent('install_plugin_click');
}

export function trackFAQExpand(question: string) {
  trackEvent('faq_expand', { question });
}

export function trackCheckoutStarted(plan: string) {
  trackEvent('checkout_started', { plan });
}

export function trackPurchase(value: number, currency: string) {
  trackEvent('purchase', { value, currency });
}
