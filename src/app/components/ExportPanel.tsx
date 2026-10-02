import {useMemo,useState} from 'react';
import type {Variable} from '@/data/preset-contract/types';
import {exportTokens} from '@/data/preset-contract/exports.mjs';

const formats={dtcg:['DTCG','tokens.json','application/json'],css:['CSS','tokens.css','text/css'],scss:['SCSS','tokens.scss','text/plain'],sass:['Sass','tokens.sass','text/plain'],tailwind:['Tailwind','tailwind.config.mjs','text/javascript']} as const;
export function ExportPanel({tokens}:{tokens:Variable[]}){
  const [format,setFormat]=useState<keyof typeof formats>('dtcg'),[status,setStatus]=useState('');
  const files=useMemo(()=>{try{return {value:exportTokens(tokens),error:''};}catch(e){return {value:null,error:String(e)};}},[tokens]);
  const content=files.value?.[format]||'';
  const copy=async()=>{
    try{
      let copied=false;
      try{await navigator.clipboard.writeText(content);copied=true;}catch{/* Figma iframe permissions may require the selection-based clipboard API. */}
      if(!copied){const active=document.activeElement as HTMLElement|null;const input=document.createElement('textarea');input.value=content;input.style.position='fixed';input.style.opacity='0';document.body.appendChild(input);input.select();try{copied=document.execCommand('copy');}finally{input.remove();active?.focus();}if(!copied)throw Error('Clipboard unavailable');}
      setStatus('Copied.');
    }catch{setStatus('Unable to copy. Select the preview text or download the file.');}
  };
  const download=()=>{
    const [,name,type]=formats[format],url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus('Download started.');
  };
  return <details className="my-4 min-w-0 rounded-lg border border-border bg-card p-3"><summary className="cursor-pointer font-medium">Export</summary><p className="my-2 text-sm text-muted-foreground">Current demo configuration. Generate Figma Variables in the plugin.</p><label className="block text-sm">Format<select aria-label="Export format" value={format} onChange={e=>{setFormat(e.target.value as keyof typeof formats);setStatus('');}} className="my-2 w-full rounded border border-border bg-card p-2">{Object.entries(formats).map(([key,[label]])=><option key={key} value={key}>{label}</option>)}</select></label>{files.error?<p role="alert">{files.error}</p>:<><textarea aria-label="Export preview" readOnly value={content} spellCheck={false} className="h-64 w-full resize-y rounded border border-border bg-secondary p-2 font-mono text-xs"/><div className="mt-2 flex gap-2"><button onClick={copy} className="rounded border border-border px-4 py-2">Copy</button><button onClick={download} className="rounded bg-primary px-4 py-2 text-primary-foreground">Download</button></div></>}<p role="status" className="mt-2 text-sm">{status}</p></details>;
}
