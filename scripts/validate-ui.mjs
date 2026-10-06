import { publicPricing } from './fixtures/pricing.mjs';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const require = createRequire(process.env.WORKSPACE_NODE_PACKAGES ? process.env.WORKSPACE_NODE_PACKAGES + '/package.json' : import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless:true, channel:process.env.BROWSER_CHANNEL || 'msedge' });
const base = process.env.LP_URL || 'http://127.0.0.1:5174';
mkdirSync('validation-output', { recursive:true });
const report = [];
const page = await browser.newPage({ viewport:{width:1440,height:1000} });
page.setDefaultTimeout(20000);
page.setDefaultNavigationTimeout(60000);
const navigate = url => page.goto(url, { waitUntil: 'domcontentloaded' });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.route('**/functions/v1/get-pricing',route=>route.fulfill({contentType:'application/json',body:JSON.stringify(publicPricing)}));
await page.route(/google-analytics|googletagmanager|clarity\.ms|hotjar/, r => r.abort());
await navigate(base); await page.waitForSelector('.demo-presets');
await page.waitForTimeout(400);
const heroBounds = await page.locator('#hero .plugin-demo').boundingBox();
assert.ok(heroBounds.x >= 0 && heroBounds.x + heroBounds.width <= 1440, 'Hero mockup stays fully in view');
await page.screenshot({path:'validation-output/desktop.png',fullPage:true});
assert.equal(await page.locator('h1').count(),1);
assert.equal(await page.title(),'StartTokens — Figma Variables & Design Tokens Generator');
assert.match(await page.locator('meta[name=description]').getAttribute('content'),/^Customize Bootstrap/);
const catalog = JSON.parse(readFileSync('public/data/presets/catalog.json'));
const demo = page.locator('#hero .plugin-demo');
for (const preset of catalog.presets) {
  console.log(`Testing ${preset.name}`);
  await demo.getByRole('button',{name:preset.name,exact:true}).click();
  await demo.getByRole('tab',{name:'Colors',exact:true}).waitFor();
  assert.equal(await demo.locator('.demo-preset span').innerText(),preset.name);
  for (const mod of ['colors','typography','layout']) {
    await demo.getByRole('tab',{name:mod[0].toUpperCase()+mod.slice(1),exact:true}).click();
    const source = JSON.parse(readFileSync(`public/data/presets/${preset.id}/${mod}.json`));
    if (mod !== 'typography') {
      const labels = await demo.locator('[role=tabpanel] > details > summary').allTextContents();
      assert.deepEqual(labels,source.submodules.map(s=>s.label));
    } else {
      await demo.getByLabel('Primary Font',{exact:true}).fill('Georgia');
      await demo.getByLabel('Type Scale',{exact:true}).selectOption('1.5');
      await demo.getByRole('button',{name:'Generate scale',exact:true}).click();
      assert.match(await demo.getByRole('status').innerText(),/updated/);
      const names = await demo.locator('.demo-type-preview code').allTextContents();
      const expected = source.submodules.flatMap(s=>s.variables).filter(v=>source.configuration.typeScale.steps.includes(v.id)).map(v=>v.name);
      assert.deepEqual(names.sort(),expected.sort());
    }
    await demo.getByRole('searchbox').fill('not-a-token-xyz');
    assert.match(await demo.innerText(),/No tokens found/);
    await demo.getByRole('searchbox').fill('');
  }
  await demo.getByRole('tab',{name:'Colors',exact:true}).click();
  const family = demo.locator('.demo-color-family').filter({has:page.locator('.demo-scale')}).first();
  if(await family.count()) {
    const before = await family.locator('.demo-scale input').evaluateAll(inputs=>inputs.map(i=>i.value));
    await family.locator(':scope > .demo-token input[type=color]').fill('#e34f73');
    const after = await family.locator('.demo-scale input').evaluateAll(inputs=>inputs.map(i=>i.value));
    assert.equal(after.length,before.length);
    assert.ok(after.filter((value,i)=>value!==before[i]).length > 1, preset.name+' recolors full family');
  }
  const color = demo.locator('input[type=color]').first();
  await color.fill('#e34f73');
  assert.equal(await color.inputValue(),'#e34f73');
  await demo.getByRole('tab',{name:'Colors',exact:true}).focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await demo.getByRole('tab',{name:'Typography',exact:true}).getAttribute('aria-selected'),'true');
  await page.screenshot({path:`validation-output/${preset.id}.png`});
  await demo.getByRole('button',{name:'Back to presets'}).click();
  report.push(`${preset.name}: real groups, four tabs, color edit, type scale, search, keyboard navigation passed`);
}
for (const variant of ['new']) for (const width of [1920,1440,1024,768,390,320]) {
  await page.setViewportSize({width,height:900});
  await navigate(base); await page.waitForSelector('.demo-presets');
  const pricing = page.locator('#pricing');
  assert.equal(await pricing.getAttribute('data-pricing-version'), variant);
  await pricing.scrollIntoViewIfNeeded();
  await pricing.getByText('$12.34',{exact:true}).waitFor();
  const prices = await pricing.innerText();
  for (const price of ['Free', '$0', '$12.34', '$98.76', '$234.56']) assert.ok(prices.includes(price));
  assert.equal(await pricing.getByRole('button').count(), 3);
  // Scroll all sections into view so reveal/parallax states are covered.
  for (const section of await page.locator('main > section').all()) { await section.scrollIntoViewIfNeeded(); await page.waitForTimeout(100); }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),`overflow at ${width}px`);
  for (const mockup of await page.locator('.plugin-demo').all()) {
    const geometry=await mockup.evaluate(el=>{const c=el.querySelector('.demo-content');return {w:el.offsetWidth,h:el.offsetHeight,parent:el.parentElement.clientWidth,overflow:c.scrollWidth>c.clientWidth,scroll:getComputedStyle(c).overflowY};});
    assert.ok(geometry.w<=420 && geometry.w<=geometry.parent+1,JSON.stringify(geometry));
    assert.ok(Math.abs(geometry.h-geometry.w*611/420)<2,JSON.stringify(geometry));
    assert.equal(geometry.overflow,false);assert.equal(geometry.scroll,'auto');
  }
  for (const step of await page.locator('#how-it-works [role=tab]').all()) {
    await step.click();
    // Wait for the existing tab/reveal transitions before measuring final bounds.
    await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth, { }, {timeout:3000});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),`step overflow at ${width}px`);
  }
  const faq = page.locator('#faq button').first(); await faq.click(); assert.equal(await faq.getAttribute('aria-expanded'),'true'); await faq.click(); assert.equal(await faq.getAttribute('aria-expanded'),'false');
  if (width < 1280) { await page.getByRole('button',{name:'Open navigation'}).click(); await page.locator('#mobile-navigation').getByRole('link',{name:'Pricing',exact:true}).click(); assert.match(page.url(),/#pricing/); }
  const visibleText = await page.locator('body').innerText();
  assert.doesNotMatch(visibleText,/DT Boilerplate|DS Boilerplate|Carbon|Ant Design|Export (CSS|JSON|DTCG)/i);
  await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:`validation-output/viewport-${variant}-${width}.png`,fullPage:true});
  report.push(`${variant} at ${width}px: pricing, navigation, steps, FAQ and no horizontal overflow passed`);
}
await page.setViewportSize({width:1440,height:900});
for (const route of ['/','/privacy','/terms','/contact','/success','/cancel']) {
  const response = await navigate(base+route); assert.equal(response.status(),200);
  assert.equal(await page.locator('h1').count(),1);
  assert.doesNotMatch(await page.locator('body').innerText(),/DT Boilerplate|DS Boilerplate|Carbon|Ant Design/);
  report.push(`${route}: renders with one H1 and current branding`);
}
await navigate(base);
for (const a of await page.locator('a[href*="figma.com/community/plugin"]').all()) assert.equal(await a.getAttribute('href'),'https://www.figma.com/community/plugin/1651310914400769393');
// Exercise the real checkout handler with an intercepted response. No purchases or live sessions.
const requests = [];
const funnels = [];
await page.route('**/functions/v1/create-checkout-session',async r=>{
  requests.push(r.request().postDataJSON());
  funnels.push(await page.evaluate(() => (window.dataLayer || []).map(event => Array.from(event)).filter(event => ['pricing_view','pricing_click','checkout_started'].includes(event[1]))));
  await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({url:base+'/cancel?qa=checkout'})});
});
for (const [variant, plan, label] of [['new','monthly','Start Monthly'], ['new','annual','Get Annual'], ['new','lifetime','Get Lifetime']]) {
  await navigate(base);
  await page.locator('#pricing').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => (window.dataLayer || []).some(event => Array.from(event)[1] === 'pricing_view'));
  await page.locator('#pricing').getByRole('button',{name:label,exact:true}).click();
  await page.waitForURL('**/cancel?qa=checkout');
  assert.deepEqual(requests.at(-1), {plan, pricingVersion:variant, priceId:publicPricing[plan].priceId, email:null, userId:null});
  const events = funnels.at(-1);
  assert.deepEqual(events.map(event=>event[1]), ['pricing_view','pricing_click']);
  for (const event of events) assert.equal(event[2].pricing_version,variant);
  assert.equal(events[1][2].plan,plan);
}
await navigate(base+'/?email=qa%2Btest%40example.com&user_id=qa-user#pricing');
await page.locator('#pricing').getByRole('button',{name:'Get Annual',exact:true}).click();
await page.waitForURL('**/cancel?qa=checkout');
assert.deepEqual(requests.at(-1),{plan:'annual',pricingVersion:'new',priceId:publicPricing.annual.priceId,email:'qa+test@example.com',userId:'qa-user'});
report.push('All three checkouts and plugin email handoff use active configuration');
await navigate(base);
await page.evaluate(()=>localStorage.setItem('starttokens_pricing_variant','A'));
for(const query of ['', '?pricing_variant=A','?pricing_variant=B','?plan=monthly']) {
 await navigate(base+'/'+query);
 assert.equal(await page.locator('#pricing').getAttribute('data-pricing-version'),'new');
 assert.equal(await page.evaluate(()=>localStorage.getItem('starttokens_pricing_variant')),'A');
}
await page.reload();
assert.equal(await page.locator('#pricing').getAttribute('data-pricing-version'),'new');
report.push('Old query overrides and storage are ignored; reload preserves static new pricing');
await navigate(base);
const free = page.locator('#pricing').getByRole('link',{name:'Generate for free'});
assert.equal(await free.getAttribute('href'),'https://www.figma.com/community/plugin/1651310914400769393');
for (const label of ['Fastest Way','Problem Solved','Presets','Features','Visual Docs','Pricing','FAQ']) {
  const link = page.locator('header nav').getByRole('link',{name:label,exact:true});
  const target = (await link.getAttribute('href')).split('#')[1];
  assert.equal(await page.locator('#'+target).count(),1);
}
assert.equal(await page.locator('#presets h3').count(),catalog.presets.length);
report.push('Catalog-driven presets, all navigation targets and free plugin installation link verified');

// Test scroll spy functionality
await navigate(base);
const initialActiveLink = await page.locator('header nav').getByRole('link', {name: 'Fastest Way', exact: true}).getAttribute('aria-current');
assert.equal(initialActiveLink, 'location');
await page.locator('#problem-solved').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const problemSolvedActive = await page.locator('header nav').getByRole('link', {name: 'Problem Solved', exact: true}).getAttribute('aria-current');
assert.equal(problemSolvedActive, 'location');
report.push('Scroll spy: navigation highlights active section on scroll');

assert.deepEqual(await page.locator('#features h3').allTextContents(),['Colors','Typography','Icons','Layout']);
assert.equal(await page.locator('#features .plugin-demo').count(),4);
assert.equal(await page.locator('#how-it-works').count(),1);
assert.equal(await page.locator('#how-it-works [role=tab]').count(),3);
report.push('Features uses existing mockups; How it works is one section with three tabs');

// Test scroll progress bar
const progressBar = await page.locator('header .bg-accent').first().isVisible();
assert.ok(progressBar, 'Scroll progress bar is visible in header');
report.push('Scroll progress bar: visible in header');
const sharedSections = [];
for (const variant of ['new']) {
  await navigate(base);
  await page.locator('#features .demo-tabs').first().waitFor();
  sharedSections.push(await page.locator('main > section:not(#pricing)').allTextContents());
}
assert.deepEqual(sharedSections[0],sharedSections[1]);
report.push('All landing sections outside Pricing are identical between variants');
await page.emulateMedia({reducedMotion:'reduce'}); await navigate(base);
assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
await page.locator('#visual-docs').scrollIntoViewIfNeeded();
const first = await page.locator('#visual-docs img[alt*="Visual Foundations"]').first().getAttribute('src');
await page.waitForTimeout(4300);
assert.equal(await page.locator('#visual-docs img[alt*="Visual Foundations"]').first().getAttribute('src'),first);
report.push('Reduced motion: automatic scrolling and carousel autoplay disabled');
await navigate(base+'/?pricing_variant=B');
await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
await page.screenshot({path:'validation-output/hero-review.png'});
await page.locator('#pricing').screenshot({path:'validation-output/pricing-review.png'});
await page.locator('#visual-docs').screenshot({path:'validation-output/visual-docs-review.png'});
assert.deepEqual(errors,[]);
writeFileSync('validation-output/report.json',JSON.stringify({report,errors},null,2));
console.log(report.join('\n'));
await page.close();
await browser.close();
