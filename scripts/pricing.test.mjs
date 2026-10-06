import { stripePrices, publicPricing } from './fixtures/pricing.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';

const legacyMonthly = 'price_1Tl5f2GjwjNbQit1yFRXBqBA';
const legacyLifetime = 'price_1Tl5YCGjwjNbQit1821CEBPI';
const env = {
  STRIPE_SECRET_KEY: 'test-only', STRIPE_WEBHOOK_SECRET: 'test-only',
  SUPABASE_URL: 'https://example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-only', BASE_URL: 'https://starttokens.test',
};
const matrix = [
  ['legacy','monthly',legacyMonthly], ['legacy','lifetime',legacyLifetime],
  ['new','monthly',publicPricing.monthly.priceId], ['new','annual',publicPricing.annual.priceId], ['new','lifetime',publicPricing.lifetime.priceId],
];
function harness(name, options = {}) {
  const calls = { sessions: [], writes: [], lookups: [] };
  const session = {metadata:options.metadata || {},id:'cs_test', customer:'cus_test', customer_details:{email:'qa@example.com'}, subscription:options.lifetime ? null : 'sub_test'};
  class Stripe {
    static createFetchHttpClient() { return {}; }
    prices = {list:async params => {
      calls.lookups.push(params);
      if(options.stripeError) throw Error('Sensitive upstream secret test-only');
      return {data:(options.prices || stripePrices).filter(price=>price.active && params.lookup_keys.includes(price.lookup_key))};
    }};
    checkout = {sessions:{
      create: async params => { calls.sessions.push(params); return {url:'https://checkout.stripe.com/test',id:'cs_test'}; },
      retrieve: async () => ({metadata:options.metadata || {},line_items:{data:[{price:options.checkoutPrice || stripePrices.find(price=>price.id===options.price) || {id:options.price}}]}}),
    }};
    webhooks = {constructEventAsync:async () => {
      if(options.invalidSignature) throw Error('Invalid signature');
      return {type:'checkout.session.completed',data:{object:session}};
    }};
  }
  const db = {
    select() {return this;}, eq() {return this;},
    single: async () => ({data:options.existing ?? null,error:null}),
    update(data) {calls.writes.push(data);return this;},
    insert: async data => {calls.writes.push(data);return {error:null};},
  };
  const context = vm.createContext({
    Stripe, createClient:() => ({from:() => db}), Response, Request, crypto:globalThis.crypto,
    console:{log(){},error(){}}, Deno:{env:{get:key => ({...env,...options.env})[key]}},
    serve:handler => {calls.handler = handler;},
  });
  const shared = readFileSync('supabase/functions/_shared/pricing.ts','utf8').replace(/export /g,'');
  const source = readFileSync(`supabase/functions/${name}/index.ts`,'utf8').replace(/^import .*$/gm,'');
  vm.runInContext(transformSync(shared+'\n'+source,{loader:'ts',format:'iife'}).code,context);
  return calls;
}
const request = body => new Request('https://example.invalid',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
for(const [pricingVersion,plan,price] of matrix) {
  test(`checkout ${pricingVersion}/${plan}: price, mode, metadata and preserved redirects`,async () => {
    const h=harness('create-checkout-session');
    const res=await h.handler(request({pricingVersion,plan,priceId:price,email:'qa@example.com',userId:'qa-user'}));
    assert.equal(res.status,200);
    const params=h.sessions[0];
    assert.equal(params.line_items[0].price,price);
    assert.equal(params.mode,plan==='lifetime'?'payment':'subscription');
    assert.equal(params.metadata.pricing_version,pricingVersion);
    assert.equal(params.metadata.plan,plan);
    if(pricingVersion==='new'){assert.equal(params.metadata.price_id,price);assert.equal(params.metadata.pricing_lookup_key,'starttoken_'+plan);assert.deepEqual(JSON.parse(JSON.stringify(h.lookups[0])),{active:true,lookup_keys:['starttoken_'+plan],limit:10});}
    assert.equal(params.metadata.user_id,'qa-user');
    assert.equal(params.customer_email,'qa@example.com');
    assert.equal(params.allow_promotion_codes,true);
    assert.equal(params.success_url,'https://starttokens.test/success');
    assert.equal(params.cancel_url,'https://starttokens.test/cancel');
    assert.equal(res.headers.get('Access-Control-Allow-Origin'),'*');
  });
  test(`webhook ${pricingVersion}/${plan}: recognizes price, existing schema and lifetime`,async () => {
    for(const existing of [null,{id:'existing',lifetime:false}]) {
      const h=harness('stripe-webhook',{price,existing,lifetime:plan==='lifetime'});
      const res=await h.handler(new Request('https://example.invalid',{method:'POST',headers:{'Stripe-Signature':'test'},body:'{}'}));
      assert.equal(res.status,200);
      assert.equal(h.writes[0].subscription_status,'active');
      assert.equal(h.writes[0].lifetime,plan==='lifetime');
      assert.equal(h.writes[0].stripe_customer_id,'cus_test');
      assert.equal(h.writes[0].stripe_subscription_id,plan==='lifetime'?null:'sub_test');
      for(const forbidden of ['plan','pricing_variant','stripe_price_id']) assert.ok(!(forbidden in h.writes[0]));
    }
  });
}
test('legacy compatibility remains isolated from lookup-based plans',async () => {
  const h=harness('create-checkout-session');
  assert.equal((await h.handler(request({plan:'monthly'}))).status,200);
  assert.equal(h.sessions[0].line_items[0].price,legacyMonthly);
  assert.equal(h.lookups.length,0);
  const configured=harness('create-checkout-session',{env:{STRIPE_PRICE_MONTHLY_LEGACY:'price_configured'}});
  await configured.handler(request({plan:'monthly'}));
  assert.equal(configured.sessions[0].line_items[0].price,'price_configured');
});

test('invalid combinations return 400 without contacting Stripe; CORS preserved',async () => {
  const h=harness('create-checkout-session');
  for(const body of [{pricingVersion:'legacy',plan:'annual'},{pricingVersion:'invalid',plan:'monthly'},{variant:'A',plan:'annual'},{variant:'C',plan:'monthly'},{variant:'B',plan:'free'},{plan:'bogus'},{plan:'annual'}]) assert.equal((await h.handler(request(body))).status,400);
  assert.equal(h.sessions.length,0);
  assert.equal((await h.handler(new Request('https://example.invalid',{method:'OPTIONS'}))).status,200);
});
test('webhook rejects unknown prices/signatures and never downgrades a lifetime buyer',async () => {
  for(const options of [{price:'price_unknown'},{price:legacyMonthly,invalidSignature:true}]) {
    const h=harness('stripe-webhook',options);
    assert.equal((await h.handler(new Request('https://example.invalid',{method:'POST',headers:{'Stripe-Signature':'test'},body:'{}'}))).status,400);
    assert.equal(h.writes.length,0);
  }
  const h=harness('stripe-webhook',{price:legacyMonthly,existing:{id:'existing',lifetime:true}});
  await h.handler(new Request('https://example.invalid',{method:'POST',headers:{'Stripe-Signature':'test'},body:'{}'}));
  assert.equal(h.writes[0].lifetime,true);
});

test('pricing uses a single static configuration, default new', () => {
  const source=readFileSync('src/utils/pricing.ts','utf8');
  assert.match(source,/ACTIVE_PRICING_VERSION: PricingVersion = 'new'/);
  assert.doesNotMatch(source,/Math.random|localStorage/);
});
for(const [pricingVersion,plan,price] of matrix) test(`verify-license accepts ${pricingVersion}/${plan} webhook state`, async()=>{
 const hook=harness('stripe-webhook',{price,lifetime:plan==='lifetime'});
 await hook.handler(new Request('https://example.invalid',{method:'POST',headers:{'Stripe-Signature':'test'},body:'{}'}));
 const license=harness('verify-license',{existing:hook.writes[0]});
 const response=await license.handler(request({email:'qa@example.com'}));
 assert.equal((await response.json()).premium,true);
});

test('already-published A/B API clients remain compatible',async()=>{
 for(const [variant,plan,price] of [['A','monthly',legacyMonthly],['A','lifetime',legacyLifetime],['B','annual',publicPricing.annual.priceId]]){
  const h=harness('create-checkout-session');
  assert.equal((await h.handler(request({variant,plan}))).status,200);
  assert.equal(h.sessions[0].line_items[0].price,price);
 }
});

const getRequest = () => new Request('https://example.invalid', {method:'GET'});
test('get-pricing returns only public active Stripe prices, with CORS and no secrets',async()=>{
  const h=harness('get-pricing');
  const res=await h.handler(getRequest());
  assert.equal(res.status,200);assert.equal(res.headers.get('Access-Control-Allow-Origin'),'*');
  const data=await res.json();assert.deepEqual(data,publicPricing);
  assert.deepEqual(JSON.parse(JSON.stringify(h.lookups[0])),{active:true,lookup_keys:['starttoken_monthly','starttoken_annual','starttoken_lifetime'],limit:10});
  for(const price of Object.values(data))assert.deepEqual(Object.keys(price).sort(),['amount','currency','interval','priceId']);
  assert.equal((await h.handler(new Request('https://example.invalid',{method:'OPTIONS'}))).status,204);
  assert.equal((await h.handler(request({}))).status,405);
});

test('public prices and checkout always use the same Stripe Price; rotated or forged IDs cannot silently change the charge',async()=>{
  const response=await harness('get-pricing').handler(getRequest());const displayed=await response.json();
  for(const plan of ['monthly','annual','lifetime']){
    const checkout=harness('create-checkout-session');
    assert.equal((await checkout.handler(request({plan,pricingVersion:'new',priceId:displayed[plan].priceId}))).status,200);
    assert.equal(checkout.sessions[0].line_items[0].price,displayed[plan].priceId);
  }
  const prices=stripePrices.map(price=>({...price,id:price.id+'_rotated',unit_amount:price.unit_amount+100}));
  const stale=harness('create-checkout-session',{prices});
  const result=await stale.handler(request({plan:'monthly',pricingVersion:'new',priceId:displayed.monthly.priceId}));
  assert.equal(result.status,409);assert.equal((await result.json()).code,'price_changed');assert.equal(stale.sessions.length,0);
  const refreshed=await (await harness('get-pricing',{prices}).handler(getRequest())).json();
  assert.equal(refreshed.monthly.amount,publicPricing.monthly.amount+100);
  assert.equal((await stale.handler(request({plan:'monthly',pricingVersion:'new',priceId:refreshed.monthly.priceId}))).status,200);
  assert.equal(stale.sessions[0].line_items[0].price,refreshed.monthly.priceId);
  const invalid=harness('create-checkout-session');
  assert.equal((await invalid.handler(request({plan:'monthly',pricingVersion:'new'}))).status,400);
  assert.equal((await invalid.handler(request({plan:'lifetime',pricingVersion:'new',priceId:displayed.monthly.priceId}))).status,409);
  assert.equal(invalid.sessions.length,0);
});

test('missing/inactive/duplicate/invalid prices and Stripe outages fail without exposing upstream details',async()=>{
  const invalidSets=[[],stripePrices.slice(1),stripePrices.map(p=>({...p,active:false})),[...stripePrices,stripePrices[0]],
    stripePrices.map(p=>({...p,unit_amount:null})),stripePrices.map(p=>({...p,billing_scheme:'tiered'})),
    stripePrices.map(p=>({...p,recurring:{interval:'day',interval_count:1,usage_type:'licensed'}})),
    stripePrices.map(p=>({...p,recurring:{interval:'month',interval_count:2,usage_type:'licensed'}}))];
  for(const options of [...invalidSets.map(prices=>({prices})),{stripeError:true},{env:{STRIPE_SECRET_KEY:undefined}}]){
    const response=await harness('get-pricing',options).handler(getRequest());
    assert.equal(response.status,503);assert.equal(response.headers.get('Access-Control-Allow-Origin'),'*');
    assert.deepEqual(await response.json(),{error:'Pricing temporarily unavailable'});
  }
  const h=harness('create-checkout-session',{stripeError:true});
  assert.equal((await h.handler(request({pricingVersion:'new',plan:'monthly',priceId:publicPricing.monthly.priceId}))).status,503);
  assert.equal(h.sessions.length,0);
});

test('webhook identifies replaced Prices by lookup key and completed sessions by stable metadata after key transfer',async()=>{
  for(const original of stripePrices)for(const transferred of [false,true]){
    const plan=original.lookup_key.replace('starttoken_','');
    const price={...original,id:'price_replaced_'+plan,lookup_key:transferred?null:original.lookup_key,active:!transferred};
    const h=harness('stripe-webhook',{checkoutPrice:price,lifetime:plan==='lifetime',metadata:{plan,price_id:price.id,pricing_lookup_key:original.lookup_key}});
    assert.equal((await h.handler(new Request('https://example.invalid',{method:'POST',headers:{'Stripe-Signature':'test'},body:'{}'}))).status,200);
    assert.equal(h.writes[0].lifetime,plan==='lifetime');
  }
  for(const options of [
    {checkoutPrice:{...stripePrices[0],lookup_key:'starttoken_lifetime'}},
    {checkoutPrice:{...stripePrices[0],lookup_key:null},metadata:{plan:'lifetime'}},
    {checkoutPrice:{...stripePrices[0],lookup_key:null},metadata:{price_id:'another_price',pricing_lookup_key:'starttoken_monthly'}},
  ]){
    const h=harness('stripe-webhook',options);
    assert.equal((await h.handler(new Request('https://example.invalid',{method:'POST',headers:{'Stripe-Signature':'test'},body:'{}'}))).status,400);
    assert.equal(h.writes.length,0);
  }
});

test('frontend formats Stripe minor units with Intl and validates missing public data',()=>{
  const context=vm.createContext({module:{exports:{}},Intl,fetch(){},AbortSignal});
  vm.runInContext(transformSync(readFileSync('src/utils/pricing.ts','utf8'),{loader:'ts',format:'cjs'}).code,context);
  const {formatPrice,validatePricing}=context.module.exports;
  assert.equal(formatPrice(publicPricing.monthly),'$12.34');
  assert.equal(formatPrice({amount:1500,currency:'jpy'}),'¥1,500');
  assert.equal(formatPrice({amount:12345,currency:'kwd'}),new Intl.NumberFormat('en-US',{style:'currency',currency:'KWD'}).format(12.345));
  assert.equal(validatePricing(publicPricing),publicPricing);
  for(const data of [null,{}, {...publicPricing,annual:{...publicPricing.annual,amount:-1}}, {...publicPricing,lifetime:{...publicPricing.lifetime,interval:'month'}}])assert.throws(()=>validatePricing(data));
  assert.doesNotMatch(readFileSync('src/app/App.tsx','utf8'),/\$7\.99|\$59\.99|\$99\.90|STRIPE_SECRET_KEY/);
});

test('Stripe can configure a zero amount without a local monetary override',async()=>{
  const prices=stripePrices.map(price=>({...price,unit_amount:0}));
  const response=await harness('get-pricing',{prices}).handler(getRequest());
  assert.equal(response.status,200);
  const data=await response.json();assert.equal(data.monthly.amount,0);
  const h=harness('create-checkout-session',{prices});
  assert.equal((await h.handler(request({plan:'monthly',pricingVersion:'new',priceId:data.monthly.priceId}))).status,200);
});
