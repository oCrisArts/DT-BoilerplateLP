import { ACTIVE_PRICING_VERSION } from './pricing';

type AnalyticsFunction = ((...args: unknown[]) => void) & { q?: unknown[][] };
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: AnalyticsFunction;
    clarity?: AnalyticsFunction;
    hj?: AnalyticsFunction;
    _hjSettings?: { hjid: number; hjsv: number };
  }
}
export const GA_MEASUREMENT_ID = 'G-RTPS80KJ2B';
export const SECTIONS = ['hero','problem-solved','presets','how-it-works','features','visual-docs','pricing','faq'] as const;
export type SectionId = typeof SECTIONS[number];
type Context = Record<string, string | number | boolean | undefined>;
type EventName = 'page_view' | 'section_view' | 'hero_cta_click' | 'pricing_view' | 'pricing_click' | 'figma_install_click' | 'faq_expand' | 'checkout_started' | 'checkout_success_view' | 'checkout_cancelled';
const ROUTES = new Set(['/','/privacy','/terms','/contact','/success','/cancel']);
const ATTRIBUTION_KEY = 'starttokens_analytics_attribution';
const CHECKOUT_KEY = 'starttokens_analytics_checkout';
let initialized = false, currentPath: string | undefined, section: SectionId | undefined, pricingViewed = false, debug = false;
let attribution: Context = {};
const safe = (run: () => void) => { try { run(); } catch { /* Analytics must never interrupt navigation or checkout. */ } };
function read(key: string): Context {
  try {
    const value = JSON.parse(sessionStorage.getItem(key) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}
function save(key: string, value: Context) { safe(() => sessionStorage.setItem(key,JSON.stringify(value))); }
function campaignValue(value: unknown) { return typeof value === 'string' && !/[@\r\n]/.test(value) ? value.slice(0,100) : undefined; }
function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  const stored = read(ATTRIBUTION_KEY);
  const incoming = ['source','medium','campaign'].some(key=>params.has(`utm_${key}`));
  attribution = Object.fromEntries(['source','medium','campaign'].map(key=>[key,campaignValue(incoming ? params.get(`utm_${key}`) : stored[key])]).filter(([,value])=>value));
  if (incoming) save(ATTRIBUTION_KEY,attribution);
}
function checkoutContext() {
  const data = read(CHECKOUT_KEY);
  return {
    plan: ['monthly','annual','lifetime'].includes(String(data.plan)) ? data.plan : undefined,
    pricing_version: ['legacy','new'].includes(String(data.pricing_version)) ? data.pricing_version : ACTIVE_PRICING_VERSION,
  };
}
function script(id: string, src: string) {
  if (document.getElementById(id)) return;
  const node=document.createElement('script');node.id=id;node.async=true;node.src=src;document.head.appendChild(node);
}
export function initializeAnalytics() {
  if(initialized || typeof window==='undefined') return;
  initialized=true;
  debug=new URLSearchParams(window.location.search).get('analytics_debug')==='1';
  captureAttribution();
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer!.push(arguments);};
  window.clarity=window.clarity||function(...args){(window.clarity!.q ||= []).push(args);};
  window.hj=window.hj||function(...args){(window.hj!.q ||= []).push(args);};
  window._hjSettings={hjid:6735993,hjsv:6};
  safe(()=>window.gtag!('js',new Date()));
  safe(()=>window.gtag!('config',GA_MEASUREMENT_ID,{send_page_view:false,page_location:window.location.origin+window.location.pathname,...(debug?{debug_mode:true}:{})}));
  script('starttokens-ga','https://www.googletagmanager.com/gtag/js?id='+GA_MEASUREMENT_ID);
  script('starttokens-clarity','https://www.clarity.ms/tag/xbmw6k7sfz');
  script('starttokens-hotjar','https://static.hotjar.com/c/hotjar-6735993.js?sv=6');
}
function trackEvent(name: EventName, extra: Context = {}) {
  if(typeof window==='undefined')return;
  const context = Object.fromEntries(Object.entries({
    ...attribution,page_path:window.location.pathname,
    section_id:window.location.pathname==='/'?section:undefined,
    pricing_version:ACTIVE_PRICING_VERSION,...extra,
  }).filter(([,v])=>v!==undefined));
  // Never send the raw query string: plugin handoffs can contain an email/user_id.
  const location=window.location.origin+window.location.pathname;
  safe(()=>window.gtag?.('event',name,{...context,page_location:location,...(debug?{debug_mode:true}:{})}));
  // These APIs accept event names, not GA-style event payloads. Context is sent
  // separately as anonymous tags/attributes; it represents session state.
  for(const [key,value] of Object.entries(context))safe(()=>window.clarity?.('set',key,String(value)));
  safe(()=>window.clarity?.('event',name));
  safe(()=>window.hj?.('identify',null,context));
  safe(()=>window.hj?.('event',name));
  // Bounded qualifiers preserve section/plan identity in recording timelines.
  const qualifier=name==='section_view'?context.section_id:['pricing_click','checkout_started'].includes(name)?[context.pricing_version,context.plan].filter(Boolean).join('_'):undefined;
  if(qualifier){safe(()=>window.clarity?.('event',`${name}_${qualifier}`));safe(()=>window.hj?.('event',`${name}_${qualifier}`));}
}
export function trackPageView(path: string) {
  if(!ROUTES.has(path)||currentPath===path)return;
  const previous=currentPath;currentPath=path;section=undefined;pricingViewed=false;captureAttribution();
  const context=path==='/success'||path==='/cancel'?checkoutContext():{};
  trackEvent('page_view',{...context,page_title:document.title,page_referrer:previous?window.location.origin+previous:undefined});
  if(path==='/success')trackEvent('checkout_success_view',context);
  if(path==='/cancel')trackEvent('checkout_cancelled',context);
}
export function trackSectionView(id: SectionId, direction: 'up' | 'down' | 'none') {
  if(window.location.pathname!=='/'||!SECTIONS.includes(id)||section===id)return;
  trackPageView('/');const previous=section;section=id;
  const url=window.location.pathname+window.location.search+'#'+id;
  if(window.location.hash!=='#'+id)window.history.replaceState(window.history.state,'',url);
  trackEvent('section_view',{section_id:id,previous_section:previous??'none',scroll_direction:direction});
  if(id==='pricing'&&!pricingViewed){pricingViewed=true;trackEvent('pricing_view',{section_id:'pricing'});}
}
export function trackHeroCTA(){trackEvent('hero_cta_click',{section_id:'hero'});}
export function trackFigmaInstallClick(event?: { currentTarget: HTMLElement }, plan?: string){
  const id=event?.currentTarget.closest('section')?.id;
  if(id==='hero')trackHeroCTA();
  trackEvent('figma_install_click',{section_id:id||section,plan});
}
export function trackPricingClick(plan?: string, pricingVersion?: string){trackEvent('pricing_click',{section_id:'pricing',plan,pricing_version:pricingVersion??ACTIVE_PRICING_VERSION});}
export function trackFAQExpand(question: string){trackEvent('faq_expand',{section_id:'faq',question});}
export function trackCheckoutStarted(plan: string, pricingVersion = ACTIVE_PRICING_VERSION){
  const context={plan,pricing_version:pricingVersion};save(CHECKOUT_KEY,context);trackEvent('checkout_started',{...context,section_id:'pricing'});
}

// Server integration contract only: never dispatch purchase from the browser.
export interface VerifiedPurchase {
  client_id: string; transaction_id: string; value: number; currency: string;
  plan: 'monthly' | 'annual' | 'lifetime'; pricing_version: 'legacy' | 'new'; session_id?: number;
}
export function buildPurchaseMeasurementPayload(purchase: VerifiedPurchase) {
  const {client_id,transaction_id,value,currency,plan,pricing_version,session_id}=purchase;
  if(!client_id||!transaction_id||!Number.isFinite(value)||value<0||!/^[A-Z]{3}$/.test(currency)||!['monthly','annual','lifetime'].includes(plan)||!['legacy','new'].includes(pricing_version))throw new Error('Invalid verified purchase');
  return {client_id,events:[{name:'purchase',params:{transaction_id,value,currency,plan,pricing_version,...(session_id?{session_id,engagement_time_msec:1}:{}),items:[{item_id:plan,item_name:`StartTokens ${plan}`,price:value,quantity:1}]}}]};
}
