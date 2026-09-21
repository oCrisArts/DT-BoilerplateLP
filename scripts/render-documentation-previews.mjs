// Reproducible documentation illustrations from the canonical tokens, not edited legacy screenshots.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(process.env.WORKSPACE_NODE_PACKAGES ? process.env.WORKSPACE_NODE_PACKAGES + '/package.json' : import.meta.url);
const { chromium } = require('playwright');
const sharp = require('sharp');
const browser = await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL || 'msedge'});
const page = await browser.newPage({viewport:{width:886,height:540},deviceScaleFactor:2});
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
for (const [index,module] of ['colors','typography','layout'].entries()) {
  const data = JSON.parse(readFileSync(`public/data/presets/starttoken/${module}.json`));
  const groups = module === 'colors' ? [{label:'Primary',variables:data.submodules[0].variables.filter(v=>v.name.startsWith('Primary'))}] : module === 'typography' ? data.submodules.filter(s=>s.id==='sizes') : data.submodules;
  const html = `<!doctype html><html><head><style>
  @font-face{font-family:Source;src:url(${process.env.LP_URL || 'http://127.0.0.1:5174'}/fonts/SourceSans3VF-Upright.otf.woff2)}
  *{box-sizing:border-box}body{margin:0;background:transparent;font-family:Source,Arial,sans-serif;color:#273142;padding:0 20px 40px}
  article{background:white;width:846px;height:500px;overflow:hidden;padding:28px 35px;box-shadow:0 20px 30px #14253830}
  h1{font-size:25px;margin:0 0 5px;color:#2863c8;font-weight:700}p{font-size:10px;color:#647080;margin:0 0 22px}h2{font-size:17px;color:#2863c8;margin:18px 0 8px}table{border-collapse:separate;border-spacing:0;width:100%;font-size:10px;border:1px solid #e6e7eb;border-radius:5px;overflow:hidden}th{text-align:left;background:#f7f8fa;font-size:9px}td,th{padding:4px 8px;border-bottom:1px solid #e6e7eb;height:28px}td:last-child{font-family:monospace;font-size:8px;color:#767d87}.swatch{width:22px;height:22px;border:1px solid #0000000d;border-radius:4px}.preview{background:#ebedfa;border:1px solid #818bdd;height:18px;width:55px}code{font-size:9px;color:#697080}
  </style></head><body><article><h1>StartTokens — ${data.label}</h1><p>Visual Foundations · StartToken preset · Customized values, original framework token names</p>${groups.map(g=>`<h2>${esc(g.label)}</h2><table><thead><tr><th>Preview</th><th>Variable Name</th><th>Value</th><th>Variable Path</th></tr></thead><tbody>${g.variables.slice(0,module==='typography'?12:10).map(v=>`<tr><td>${module==='colors'?`<div class="swatch" style="background:${esc(v.displayValue)}"></div>`:module==='typography'?`<span style="font-size:${Math.min(22,Math.max(10,Number.parseFloat(v.displayValue)))}px">Aa</span>`:`<div class="preview" style="${g.id==='radius'?`border-radius:${esc(v.displayValue)}`:''}"></div>`}</td><td>${esc(v.name)}</td><td><code>${esc(v.displayValue)}</code></td><td>${esc(v.figmaName)}</td></tr>`).join('')}</tbody></table>`).join('')}</article></body></html>`;
  await page.setContent(html); await page.evaluate(()=>document.fonts.ready);
  const png = await page.screenshot({omitBackground:true});
  await sharp(png).resize(886,540).webp({quality:88}).toFile(`public/images/how-it-works/visual-doc-${index+1}.webp`);
}
await browser.close();
console.log('Rendered three WebP documentation illustrations from canonical StartToken values (886×540).');
