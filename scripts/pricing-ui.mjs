import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { publicPricing } from './fixtures/pricing.mjs';

const server = await createServer({ server: { host: '127.0.0.1', port: 0, hmr: false } });
let browser;
try {
  await server.listen();
  const base = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(20000);
  const errors = [], checkouts = [];
  let requests = 0, mode = 'loading', displayed = structuredClone(publicPricing), release;
  const gate = new Promise(resolve => { release = resolve; });
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.dismiss());
  await page.route(/google-analytics|googletagmanager|clarity\.ms|hotjar/, route => route.abort());
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
  await page.route('**/functions/v1/get-pricing', async route => {
    requests++;
    if (mode === 'loading') await gate;
    if (mode === 'network') return route.abort('failed');
    return route.fulfill({ status: mode === 'error' ? 503 : 200, contentType: 'application/json', body: JSON.stringify(mode === 'error' ? { error: 'Unavailable' } : displayed) });
  });
  let stale = true;
  await page.route('**/functions/v1/create-checkout-session', route => {
    checkouts.push(route.request().postDataJSON());
    if (stale) {
      displayed.annual = { ...displayed.annual, priceId: 'price_rotated_annual', amount: 10789 };
      stale = false;
      return route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ code: 'price_changed' }) });
    }
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ url: base + '/cancel?qa=pricing' }) });
  });
  await page.goto(base);
  await page.locator('#hero').waitFor();
  assert.equal(requests, 0, 'pricing must load when its section becomes relevant');
  const pricing = page.locator('#pricing');
  await pricing.scrollIntoViewIfNeeded();
  await pricing.getByRole('status').waitFor();
  assert.equal(await pricing.locator('article').count(), 4);
  assert.equal(await pricing.locator('article button:disabled').count(), 3);
  mode = 'success';release();
  await pricing.getByText('$12.34', { exact: true }).waitFor();
  for (const value of ['$98.76', '$234.56']) await pricing.getByText(value, { exact: true }).waitFor();
  assert.equal(await pricing.locator('article button:disabled').count(), 0);
  for (const width of [1920, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await pricing.scrollIntoViewIfNeeded();
    assert.ok(await pricing.evaluate(element => element.scrollWidth <= element.clientWidth), `pricing overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await pricing.getByRole('button', { name: 'Get Annual', exact: true }).click();
  await pricing.getByText('$107.89', { exact: true }).waitFor();
  assert.equal(checkouts.length, 1, 'a changed price must not automatically create another checkout');
  assert.equal(checkouts[0].priceId, publicPricing.annual.priceId);
  await pricing.getByRole('button', { name: 'Get Annual', exact: true }).click();
  await page.waitForURL('**/cancel?qa=pricing');
  assert.equal(checkouts[1].priceId, 'price_rotated_annual');
  assert.equal(checkouts[1].plan, 'annual');
  assert.equal(checkouts[1].pricingVersion, 'new');
  for (const failure of ['network', 'error']) {
    mode = failure;
    await page.goto(base + '/#pricing');
    await pricing.getByRole('alert').waitFor();
    assert.equal(await pricing.locator('article').count(), 4);
    assert.equal(await pricing.locator('article button:disabled').count(), 3);
    assert.ok(await pricing.getByRole('link', { name: 'Generate for free' }).getAttribute('href'));
    mode = 'success';
    await pricing.getByRole('button', { name: 'Retry', exact: true }).click();
    await pricing.getByText('$12.34', { exact: true }).waitFor();
    assert.equal(await pricing.locator('article button:disabled').count(), 0);
    // Force a new mount for the next failure scenario.
    await page.goto(base + '/cancel');
  }
  assert.deepEqual(errors, []);
  console.log('PASS pricing UI: deferred fetch, Stripe values, loading, network/HTTP fallback, retry, responsive cards and price-bound checkout after refresh.');
} finally {
  await browser?.close();
  await server.close();
}
