import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const require = createRequire(process.env.WORKSPACE_NODE_PACKAGES + '/package.json');
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless:true });
const base = process.env.LP_URL || 'http://127.0.0.1:5174';
mkdirSync('validation-output', { recursive:true });
const report = [];
const page = await browser.newPage({ viewport:{width:1440,height:1000} });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.route(/google-analytics|googletagmanager|clarity\.ms|hotjar/, r => r.abort());
await page.goto(base); await page.waitForSelector('.demo-presets');
await page.screenshot({path:'validation-output/desktop.png',fullPage:true});
assert.equal(await page.locator('h1').count(),1);
assert.equal(await page.title(),'StartTokens — Figma Variables & Design Tokens Generator');
assert.match(await page.locator('meta[name=description]').getAttribute('content'),/^Customize Bootstrap/);
const catalog = JSON.parse(readFileSync('public/data/presets/catalog.json'));
const demo = page.locator('#hero .plugin-demo');
for (const preset of catalog.presets) {
  await demo.getByRole('button',{name:preset.name,exact:true}).click();
  await demo.getByRole('tab',{name:'Colors',exact:true}).waitFor();
  assert.equal(await demo.locator('.demo-preset span').innerText(),preset.name);
  for (const mod of ['colors','typography','layout']) {
    await demo.getByRole('tab',{name:mod,exact:true}).click();
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
for (const width of [1440,768,390,320]) {
  await page.setViewportSize({width,height:900});
  await page.goto(base); await page.waitForSelector('.demo-presets');
  // Scroll all sections into view so reveal/parallax states are covered.
  for (const section of await page.locator('main > section').all()) { await section.scrollIntoViewIfNeeded(); await page.waitForTimeout(100); }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),`overflow at ${width}px`);
  for (const step of await page.locator('#how-it-works > div > div button[aria-pressed]').all()) {
    await step.click(); await page.waitForTimeout(80);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),`step overflow at ${width}px`);
  }
  const faq = page.locator('#faq button').first(); await faq.click(); assert.equal(await faq.getAttribute('aria-expanded'),'true'); await faq.click(); assert.equal(await faq.getAttribute('aria-expanded'),'false');
  if (width < 768) { await page.getByRole('button',{name:'Open navigation'}).click(); await page.locator('#mobile-navigation').getByRole('link',{name:'Pricing',exact:true}).click(); assert.match(page.url(),/#pricing/); }
  const visibleText = await page.locator('body').innerText();
  assert.doesNotMatch(visibleText,/DT Boilerplate|DS Boilerplate|Carbon|Ant Design|Export (CSS|JSON|DTCG)/i);
  await page.screenshot({path:`validation-output/viewport-${width}.png`,fullPage:true});
  report.push(`${width}px: navigation, steps, FAQ and no horizontal overflow passed`);
}
await page.setViewportSize({width:1440,height:900});
for (const route of ['/','/privacy','/terms','/contact','/success','/cancel']) {
  const response = await page.goto(base+route); assert.equal(response.status(),200);
  assert.equal(await page.locator('h1').count(),1);
  assert.doesNotMatch(await page.locator('body').innerText(),/DT Boilerplate|DS Boilerplate|Carbon|Ant Design/);
  report.push(`${route}: renders with one H1 and current branding`);
}
await page.goto(base);
for (const a of await page.locator('a[href*="figma.com/community/plugin"]').all()) assert.equal(await a.getAttribute('href'),'https://www.figma.com/community/plugin/1651310914400769393');
// Exercise the real checkout handler with an intercepted response. No purchases or live sessions.
const requests = [];
await page.route('**/functions/v1/create-checkout-session',async r=>{
  requests.push(r.request().postDataJSON());
  await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({url:base+'/cancel?qa=checkout'})});
});
await page.goto(base+'/?user_id=qa-user&email=qa%40example.com&plan=monthly');
await page.waitForURL('**/cancel?qa=checkout');
assert.deepEqual(requests.at(-1),{plan:'monthly',email:'qa@example.com',userId:'qa-user'});
await page.goto(base+'/?user_id=qa-user&email=qa%40example.com&plan=lifetime');
await page.waitForURL('**/cancel?qa=checkout');
assert.equal(requests.at(-1).plan,'lifetime');
report.push('Monthly/lifetime checkout: existing endpoint, payload and redirect verified using intercepted responses');
await page.emulateMedia({reducedMotion:'reduce'}); await page.goto(base);
assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
await page.getByRole('button',{name:/06 Visual Documentation/}).click();
const first = await page.locator('#how-it-works img[alt*="Visual Foundations"]').getAttribute('src');
await page.waitForTimeout(4300);
assert.equal(await page.locator('#how-it-works img[alt*="Visual Foundations"]').getAttribute('src'),first);
report.push('Reduced motion: automatic scrolling and carousel autoplay disabled');
assert.deepEqual(errors,[]);
writeFileSync('validation-output/report.json',JSON.stringify({report,errors},null,2));
console.log(report.join('\n'));
await browser.close();
