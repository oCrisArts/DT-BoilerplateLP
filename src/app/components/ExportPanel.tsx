import chevron from '@/assets/figma/a78dc.svg?inline';
import './generation-result.css';
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
  return <details open className="result-export"><summary><span className="material-symbols-outlined" aria-hidden="true">download_2</span>Export<img src={chevron} alt="" width="14" height="14"/></summary><p>Current configuration · the same payload used by Generate tokens.</p><label>Format<select aria-label="Export format" value={format} onChange={e=>{setFormat(e.target.value as keyof typeof formats);setStatus('');}}>{Object.entries(formats).map(([key,[label]])=><option key={key} value={key}>{label}</option>)}</select></label>{files.error?<p role="alert">{files.error}</p>:<><textarea aria-label="Export preview" readOnly value={content} spellCheck={false}/><div className="result-actions"><button onClick={copy}>Copy <span className="material-symbols-outlined" aria-hidden="true">file_copy</span></button><button onClick={download}>Download <span className="material-symbols-outlined" aria-hidden="true">download_2</span></button></div></>}{status&&<p role="status">{status}</p>}</details>;
}
