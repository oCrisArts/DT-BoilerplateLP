import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'msedge'});
try {
 const page=await browser.newPage({viewport:{width:420,height:747}});
 await page.addInitScript(()=>{
  window.requests=[];let attempts=0;
  window.addEventListener('message',event=>{
   const message=event.data?.pluginMessage;if(!message)return;window.requests.push(message);
   if(message.type==='list-fonts')window.postMessage({pluginMessage:++attempts===1?{type:'available-fonts',fonts:[],error:'Font list failed'}:{type:'available-fonts',fonts:[{family:'Team Primary',style:'Regular'},{family:'Team Primary',style:'Bold'},{family:'Team Secondary',style:'Regular'}]}},'*');
  });
 });
 await page.goto('http://127.0.0.1:5175',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'StartToken',exact:true}).click();
 await page.getByRole('tab',{name:/Typography/}).click();
 assert.equal(await page.getByRole('button',{name:'Monospace Font',exact:true}).count(),0);
 await page.getByRole('button',{name:'Primary Font',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'Font list failed'}).waitFor();
 await page.getByRole('button',{name:'Retry loading fonts'}).click();
 for(const role of ['Primary','Secondary']){
  if(role==='Secondary')await page.getByRole('button',{name:role+' Font',exact:true}).click();
  await page.getByRole('textbox',{name:'Search '+role+' Font'}).fill('team '+role);
  const choice=page.getByRole('button',{name:new RegExp('Team '+role+'.*quick brown')});
  await choice.waitFor();assert.equal(await choice.count(),1);await choice.click();
  await page.getByRole('button',{name:role+' Font',exact:true}).filter({hasText:'Team '+role}).waitFor();
 }
 await page.getByRole('button',{name:'Generate tokens',exact:true}).click();
 await page.waitForFunction(()=>window.requests.some(m=>m.type==='generate-variables'));
 const requests=await page.evaluate(()=>window.requests);
 assert.equal(requests.filter(m=>m.type==='list-fonts').length,2);
 assert.equal(requests.some(m=>m.type==='validate-font'),false);
 const tokens=requests.findLast(m=>m.type==='generate-variables').tokens;
 for(const role of ['primary','secondary']){const font=tokens.find(t=>t.figmaName==='Typography/Family/font-family-'+role);assert.equal(font.type,'STRING');assert.equal(font.value,'Team '+role[0].toUpperCase()+role.slice(1));}
 assert.equal(tokens.some(t=>/font-family-(sans|icon)$/.test(t.name)),false);
 assert.equal(new Set(tokens.map(t=>t.figmaName)).size,tokens.length);
 console.log('Font picker: error/retry, family grouping, search, immediate selection and both StartToken values passed.');
} finally {await browser.close();}
