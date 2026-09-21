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
  STRIPE_PRICE_MONTHLY_NEW: 'price_1UIAm9GjwjNbQit1eNhhv5vX',
  STRIPE_PRICE_ANNUAL_NEW: 'price_1UIAnuGjwjNbQit1MngrZ5qo',
  STRIPE_PRICE_LIFETIME_NEW: 'price_1UIAocGjwjNbQit11jG4GtK1',
};
const matrix = [
  ['A','monthly',legacyMonthly], ['A','lifetime',legacyLifetime],
  ['B','monthly',env.STRIPE_PRICE_MONTHLY_NEW], ['B','annual',env.STRIPE_PRICE_ANNUAL_NEW], ['B','lifetime',env.STRIPE_PRICE_LIFETIME_NEW],
];
function harness(name, options = {}) {
  const calls = { sessions: [], writes: [] };
  const session = {id:'cs_test', customer:'cus_test', customer_details:{email:'qa@example.com'}, subscription:options.lifetime ? null : 'sub_test'};
  class Stripe {
    static createFetchHttpClient() { return {}; }
    checkout = {sessions:{
      create: async params => { calls.sessions.push(params); return {url:'https://checkout.stripe.com/test',id:'cs_test'}; },
      retrieve: async () => ({line_items:{data:[{price:{id:options.price,product:'same_product_for_every_new_price'}}]}}),
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
for(const [variant,plan,price] of matrix) {
  test(`checkout ${variant}/${plan}: price, mode, metadata and preserved redirects`,async () => {
    const h=harness('create-checkout-session');
    const res=await h.handler(request({variant,plan,email:'qa@example.com',userId:'qa-user'}));
    assert.equal(res.status,200);
    const params=h.sessions[0];
    assert.equal(params.line_items[0].price,price);
    assert.equal(params.mode,plan==='lifetime'?'payment':'subscription');
    assert.equal(params.metadata.pricing_variant,variant);
    assert.equal(params.metadata.plan,plan);
    assert.equal(params.metadata.user_id,'qa-user');
    assert.equal(params.customer_email,'qa@example.com');
    assert.equal(params.allow_promotion_codes,true);
    assert.equal(params.success_url,'https://starttokens.test/success');
    assert.equal(params.cancel_url,'https://starttokens.test/cancel');
    assert.equal(res.headers.get('Access-Control-Allow-Origin'),'*');
  });
  test(`webhook ${variant}/${plan}: recognizes price, existing schema and lifetime`,async () => {
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
test('legacy callers without variant remain on A; env overrides and missing new price fail safely',async () => {
  const h=harness('create-checkout-session');
  assert.equal((await h.handler(request({plan:'monthly'}))).status,200);
  assert.equal(h.sessions[0].line_items[0].price,legacyMonthly);
  const configured=harness('create-checkout-session',{env:{STRIPE_PRICE_MONTHLY_LEGACY:'price_configured'}});
  await configured.handler(request({plan:'monthly'}));
  assert.equal(configured.sessions[0].line_items[0].price,'price_configured');
  const missing=harness('create-checkout-session',{env:{STRIPE_PRICE_ANNUAL_NEW:undefined}});
  assert.equal((await missing.handler(request({plan:'annual',variant:'B'}))).status,503);
  assert.equal(missing.sessions.length,0);
});
test('invalid combinations return 400 without contacting Stripe; CORS preserved',async () => {
  const h=harness('create-checkout-session');
  for(const body of [{variant:'A',plan:'annual'},{variant:'C',plan:'monthly'},{variant:'B',plan:'free'},{plan:'bogus'},{plan:'annual'}]) assert.equal((await h.handler(request(body))).status,400);
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

test('assignment is balanced, persisted, QA-only override does not replace storage', () => {
  const values=new Map(); let random=0.1;
  const source=readFileSync('src/utils/pricing-experiment.ts','utf8').replace(/export /g,'');
  const context=vm.createContext({URLSearchParams,window:{location:{search:''}},localStorage:{getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)},Math:{random:()=>random}});
  vm.runInContext(transformSync(source,{loader:'ts'}).code,context);
  assert.equal(context.getPricingVariant(),'A'); random=0.9;
  assert.equal(context.getPricingVariant(),'A');
  context.window.location.search='?pricing_variant=B'; assert.equal(context.getPricingVariant(),'B');
  context.window.location.search='?pricing_variant=invalid'; assert.equal(context.getPricingVariant(),'A');
  values.clear(); context.window.location.search=''; assert.equal(context.getPricingVariant(),'B');
  context.window.location.search='?plan=monthly&user_id=legacy'; assert.equal(context.getPricingVariant(),'A');
  context.window.location.search=''; assert.equal(context.getPricingVariant(),'B');
});
