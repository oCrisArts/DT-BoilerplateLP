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
      await demo.getByLabel('Font Family',{exact:true}).selectOption('Georgia');
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
  const color = demo.locator('input[type=color]').first();
  await color.fill('#e34f73');
  assert.equal(await color.inputValue(),'#e34f73');
  await demo.getByRole('tab',{name:'Colors',exact:true}).focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await demo.getByRole('tab',{name:'Typography',exact:true}).getAttribute('aria-selected'),'true');
  await page.screenshot({path:`validation-output/${preset.id}.png`});
  await demo.getByRole('button',{name:'Back to presets'}).click();
  report.push(`${preset.name}: real groups, three tabs, color edit, type scale, search, keyboard navigation passed`);
}
for (const variant of ['A', 'B']) for (const width of [1920,1440,1024,768,390,320]) {
  await page.setViewportSize({width,height:900});
  await navigate(base + '/?pricing_variant=' + variant); await page.waitForSelector('.demo-presets');
  const pricing = page.locator('#pricing');
  assert.equal(await pricing.getAttribute('data-pricing-variant'), variant);
  const prices = await pricing.innerText();
  for (const price of variant === 'A' ? ['$5.99', '$49.90'] : ['Free', '$0', '$7.99', '$59.99', '$99.90']) assert.ok(prices.includes(price));
  assert.equal(await pricing.getByRole('button').count(), variant === 'A' ? 2 : 3);
  // Scroll all sections into view so reveal/parallax states are covered.
  for (const section of await page.locator('main > section').all()) { await section.scrollIntoViewIfNeeded(); await page.waitForTimeout(100); }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),`overflow at ${width}px`);
  for (const step of await page.locator('#how-it-works > div > div button[aria-pressed]').all()) {
    await step.click(); await page.waitForTimeout(80);
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
  funnels.push(await page.evaluate(() => (window.dataLayer || []).map(event => Array.from(event)).filter(event => ['pricing_experiment_view','pricing_click','checkout_started'].includes(event[1]))));
  await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({url:base+'/cancel?qa=checkout'})});
});
for (const [variant, plan, label] of [['A','monthly','Get Started'], ['A','lifetime','Get Lifetime Access'], ['B','monthly','Start Monthly'], ['B','annual','Get Annual'], ['B','lifetime','Get Lifetime']]) {
  await navigate(base + '/?pricing_variant=' + variant);
  await page.locator('#pricing').getByRole('button',{name:label,exact:true}).click();
  await page.waitForURL('**/cancel?qa=checkout');
  assert.deepEqual(requests.at(-1), {plan, variant, email:null, userId:null});
  const events = funnels.at(-1);
  assert.deepEqual(events.map(event=>event[1]), ['pricing_experiment_view','pricing_click','checkout_started']);
  for (const event of events) assert.equal(event[2].variant,variant);
  assert.equal(events[1][2].plan,plan); assert.equal(events[2][2].plan,plan);
}
await navigate(base+'/?pricing_variant=A&user_id=qa-user&email=qa%40example.com&plan=monthly');
await page.waitForURL('**/cancel?qa=checkout');
assert.deepEqual(requests.at(-1),{plan:'monthly',variant:'A',email:'qa@example.com',userId:'qa-user'});
await navigate(base+'/?pricing_variant=A&user_id=qa-user&email=qa%40example.com&plan=lifetime');
await page.waitForURL('**/cancel?qa=checkout');
assert.equal(requests.at(-1).plan,'lifetime');
await navigate(base+'/?pricing_variant=B&user_id=qa-user&email=qa%40example.com&plan=annual');
await page.waitForURL('**/cancel?qa=checkout');
assert.deepEqual(requests.at(-1),{plan:'annual',variant:'B',email:'qa@example.com',userId:'qa-user'});
report.push('All five paid checkouts: endpoint, variant, identity payload and redirects verified with intercepted responses');
await navigate(base+'/?user_id=qa-legacy&plan=monthly');
await page.waitForURL('**/cancel?qa=checkout');
assert.equal(requests.at(-1).variant,'A');
report.push('Existing plugin deep links keep legacy prices; GA funnel carries matching plan and variant');

await navigate(base);
const assigned = await page.evaluate(() => localStorage.getItem('starttokens_pricing_variant'));
assert.ok(['A','B'].includes(assigned));
await page.reload();
assert.equal(await page.locator('#pricing').getAttribute('data-pricing-variant'), assigned);
await navigate(base+'/?pricing_variant='+(assigned === 'A' ? 'B' : 'A'));
assert.notEqual(await page.locator('#pricing').getAttribute('data-pricing-variant'), assigned);
assert.equal(await page.evaluate(() => localStorage.getItem('starttokens_pricing_variant')), assigned);
await navigate(base+'/?pricing_variant=invalid');
assert.equal(await page.locator('#pricing').getAttribute('data-pricing-variant'), assigned);
report.push('Assignment survives reload; QA override is validated and does not replace the persisted assignment');

await navigate(base+'/?pricing_variant=B');
const free = page.locator('#pricing').getByRole('link',{name:'Generate for free'});
assert.equal(await free.getAttribute('href'),'https://www.figma.com/community/plugin/1651310914400769393');
for (const label of ['Fastest Way','Problem Solved','Presets','Features','Visual Docs','Pricing','FAQ']) {
  const link = page.locator('header nav').getByRole('link',{name:label,exact:true});
  const target = (await link.getAttribute('href')).split('#')[1];
  assert.equal(await page.locator('#'+target).count(),1);
}
assert.equal(await page.locator('#presets h3').count(),catalog.presets.length);
report.push('Catalog-driven presets, all navigation targets and free plugin installation link verified');
const sharedSections = [];
for (const variant of ['A','B']) {
  await navigate(base+'/?pricing_variant='+variant);
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
