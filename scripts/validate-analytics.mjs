import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.env.WORKSPACE_NODE_PACKAGES ? process.env.WORKSPACE_NODE_PACKAGES+'/package.json' : import.meta.url);
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,channel:'msedge'});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const calls=[];await page.exposeFunction('captureAnalytics',(provider,args)=>calls.push({provider,args}));
await page.addInitScript(()=>{for(const [name,provider] of [['gtag','ga'],['clarity','clarity'],['hj','hj']])window[name]=(...args)=>window.captureAnalytics(provider,args);});
await page.route(/googletagmanager|google-analytics|clarity\.ms|hotjar/,route=>route.abort());
let checkoutMode='success';await page.route('**/functions/v1/create-checkout-session',route=>route.fulfill({status:checkoutMode==='success'?200:500,contentType:'application/json',body:JSON.stringify(checkoutMode==='success'?{url:'http://127.0.0.1:5174/success'}:{error:'test failure'})}));
page.on('dialog',dialog=>dialog.dismiss());
const events=name=>calls.filter(c=>c.provider==='ga'&&c.args[0]==='event'&&c.args[1]===name);
try{
 await page.goto('http://127.0.0.1:5174/?analytics_debug=1&utm_source=qa&utm_medium=test&utm_campaign=analytics');
 await page.waitForSelector('#hero');await page.waitForTimeout(500);
 assert.equal(events('page_view').length,1);assert.equal(events('pricing_view').length,0);
 for(const name of ['Privacy','Terms','Contact']){await page.locator('footer').getByRole('link',{name,exact:true}).click();await page.waitForURL('**/'+name.toLowerCase());await page.waitForTimeout(100);assert.equal(events('page_view').at(-1).args[2].page_path,'/'+name.toLowerCase());}
 await page.getByRole('link',{name:'StartTokens',exact:true}).click();await page.waitForSelector('#hero');
 const pageCount=events('page_view').length;
 for(const id of ['problem-solved','presets','how-it-works','features','visual-docs','pricing','faq']){
  await page.evaluate(id=>window.scrollTo({top:document.getElementById(id).offsetTop-200,behavior:'instant'}),id);
  await page.waitForFunction(id=>location.hash==='#'+id,id);await page.waitForTimeout(80);
 }
 assert.equal(events('page_view').length,pageCount);assert.equal(events('pricing_view').length,1);
 await page.locator('#faq button').first().click();assert.equal(events('faq_expand').length,1);
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(()=>location.hash==='#hero');
 const popupPromise=page.waitForEvent('popup');await page.locator('#hero a').click();const popup=await popupPromise;await popup.close();
 assert.equal(events('hero_cta_click').length,1);assert.equal(events('figma_install_click').length,1);
 checkoutMode='failure';await page.locator('#pricing').getByRole('button',{name:'Get Annual',exact:true}).click();await page.waitForTimeout(300);assert.equal(events('checkout_started').length,0);
 checkoutMode='success';await page.locator('#pricing').getByRole('button',{name:'Get Annual',exact:true}).click();await page.waitForURL('**/success');await page.waitForTimeout(300);
 assert.equal(events('checkout_started').length,1);assert.equal(events('checkout_success_view').length,1);assert.equal(events('purchase').length,0);assert.equal(events('checkout_success_view')[0].args[2].plan,'annual');
 await page.getByRole('button',{name:'Return to Home'}).click();await page.waitForSelector('#hero');
 await page.goto('http://127.0.0.1:5174/cancel');await page.waitForSelector('h1');await page.waitForTimeout(200);assert.equal(events('checkout_cancelled').length,1);
 for(const name of ['page_view','section_view','hero_cta_click','pricing_view','pricing_click','figma_install_click','faq_expand','checkout_started','checkout_success_view','checkout_cancelled'])for(const provider of ['clarity','hj'])assert.equal(calls.filter(c=>c.provider===provider&&c.args[0]==='event'&&c.args[1]===name).length,events(name).length,provider+' '+name);
 console.log('PASS SPA routes, scroll/hash without duplicate page_view, all provider events, failed/successful checkout, no purchase, email-free context.');
}finally{await browser.close();}
