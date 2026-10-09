import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {exportTokens} from '../src/data/preset-contract/exports.mjs';
const browser=await chromium.launch({headless:true,channel:'msedge'});
mkdirSync('validation-output',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:420,height:747},acceptDownloads:true});
 await page.addInitScript(()=>{
  window.requests=[];window.copied='';Object.defineProperty(navigator,'clipboard',{value:{writeText:async s=>{window.copied=s;}}});
  window.addEventListener('message',e=>{const m=e.data?.pluginMessage;if(!m)return;window.requests.push(m);if(m.type==='list-fonts')window.postMessage({pluginMessage:{type:'available-fonts',fonts:[{family:'Inter',style:'Regular'}]}},'*');});
 });
 await page.goto('http://127.0.0.1:5175',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'StartToken',exact:true}).click();
 for(const name of ['Colors','Typography','Icons','Layout']){await page.getByRole('tab',{name:new RegExp(name)}).click();assert.equal(await page.getByLabel('Export format').count(),0);}
 await page.getByRole('tab',{name:/Typography/}).click();
 await page.getByLabel('Base Size').fill('24px');
 await page.getByRole('button',{name:'Generate scale',exact:true}).click();
 await page.getByRole('button',{name:'Generate tokens',exact:true}).click();
 await page.waitForFunction(()=>window.requests.some(m=>m.type==='generate-variables'));
 const payload=await page.evaluate(()=>window.requests.findLast(m=>m.type==='generate-variables').tokens),expected=exportTokens(payload);
 assert.equal(await page.getByLabel('Export format').count(),0);
 await page.evaluate(()=>window.postMessage({pluginMessage:{type:'variables-generation-failed',error:'Test generation failed'}},'*'));
 await page.getByText('Test generation failed',{exact:true}).waitFor();assert.equal(await page.getByLabel('Export format').count(),0);
 await page.getByRole('button',{name:'Generate tokens',exact:true}).click();
 await page.evaluate(()=>window.postMessage({pluginMessage:{type:'unlock-required'}},'*'));
 await page.getByText('Unlock StartTokens',{exact:true}).waitFor();assert.equal(await page.getByLabel('Export format').count(),0);
 await page.getByText('Unlock StartTokens',{exact:true}).locator('..').getByRole('button').click();
 await page.getByRole('button',{name:'Generate tokens',exact:true}).click();
 await page.getByLabel('Base Size').fill('30px');
 await page.evaluate(()=>window.postMessage({pluginMessage:{type:'variables-generated',count:186,created:180,updated:6,documentationGenerated:true}},'*'));
 await page.getByText('Your theme is ready',{exact:true}).waitFor();await page.getByText('186 variables generated',{exact:true}).waitFor();await page.getByText('StartToken documentation created',{exact:true}).waitFor();assert.equal(await page.getByRole('tab').count(),0);
 for(const [format,extension] of [['dtcg','json'],['css','css'],['scss','scss'],['sass','sass'],['tailwind','mjs']]){
  await page.getByLabel('Export format').selectOption(format);
  assert.equal(await page.getByLabel('Export preview').inputValue(),expected[format]);
  await page.getByRole('button',{name:'Copy',exact:true}).click();assert.equal(await page.evaluate(()=>window.copied),expected[format]);
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download',exact:true}).click();const file=await download;
  assert.ok(file.suggestedFilename().endsWith('.'+extension));assert.equal(readFileSync(await file.path(),'utf8'),expected[format]);
 }
 await page.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw Error('Denied');};document.execCommand=()=>{window.copied=document.activeElement.value;return true;};window.copied='';});
 await page.getByRole('button',{name:'Copy',exact:true}).click();assert.equal(await page.evaluate(()=>window.copied),expected.tailwind);
 await page.evaluate(()=>{document.execCommand=()=>false;});await page.getByRole('button',{name:'Copy',exact:true}).click();await page.getByText('Unable to copy. Select the preview text or download the file.').waitFor();
 for(const width of [320,768,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await page.setViewportSize({width:420,height:1000});await page.getByLabel('Export format').selectOption('dtcg');await page.locator('main').evaluate(e=>e.scrollTop=0);await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'validation-output/export-plugin-result.png'});
 await page.getByRole('button',{name:'Back to configuration'}).click();assert.equal(await page.getByLabel('Export format').count(),0);
 await page.getByRole('button',{name:'Generate tokens',exact:true}).click();await page.evaluate(()=>window.postMessage({pluginMessage:{type:'variables-generated',count:200,created:0,updated:200,documentationGenerated:false}},'*'));await page.getByText('StartToken documentation not generated',{exact:true}).waitFor();
 await page.goto('http://127.0.0.1:5174',{waitUntil:'domcontentloaded'});
 const demo=page.locator('#hero .plugin-demo');await demo.getByRole('button',{name:'StartToken',exact:true}).click();
 for(const name of ['Colors','Typography','Icons','Layout']){await demo.getByRole('tab',{name:new RegExp(name)}).click();assert.equal(await demo.getByLabel('Export format').count(),0);}
 await demo.getByRole('button',{name:/Generate tokens/}).click();await demo.getByText('Your theme is ready',{exact:true}).waitFor();assert.equal(await demo.getByRole('tab').count(),0);
 for(const format of ['dtcg','css','scss','sass','tailwind']){await demo.getByLabel('Export format').selectOption(format);const content=await demo.getByLabel('Export preview').inputValue();await demo.getByRole('button',{name:'Copy',exact:true}).click();assert.equal(await page.evaluate(()=>window.copied),content);const next=page.waitForEvent('download');await demo.getByRole('button',{name:'Download',exact:true}).click();assert.equal(readFileSync(await (await next).path(),'utf8'),content);}
 await demo.getByLabel('Export format').selectOption('css');assert.match(await demo.getByLabel('Export preview').inputValue(),/--space-0: 0px/);
 await demo.locator('.demo-content').evaluate(e=>e.scrollTop=0);await demo.screenshot({path:'validation-output/export-lp-result.png'});
 for(const width of [320,768,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await demo.getByRole('button',{name:'Back to configuration'}).click();assert.equal(await demo.getByLabel('Export format').count(),0);
 console.log('Export UI: five previews, copy/download bytes, generation payload parity, responsive plugin and LP demo passed.');
}catch(error){console.error(error);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(resolve=>setTimeout(resolve,5000))]);process.exit(process.exitCode||0);}
