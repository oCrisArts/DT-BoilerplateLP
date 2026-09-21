import { useEffect, useId, useRef, useState } from 'react';
import { catalog, loadPreset } from '@/data/presets';
import type { LoadedPreset, Module, ModuleId, Variable } from '@/data/preset-contract/types';
import './plugin-demo.css';

const logos = (id: string) => `/images/presets/${id === 'starttoken' ? 'starttokens' : id}.svg`;
const subtitles = {
  colors: 'Customize color values and preview each framework scale.',
  typography: 'Set type values and regenerate the framework scale.',
  layout: 'Adjust layout values while preserving framework token names.',
};
const variables = (m: Module) => m.submodules.flatMap(s => s.variables);
const pixels = (v: Variable, value = v.displayValue) => Number.parseFloat(value) * (v.unit === 'rem' || v.unit === 'em' ? 16 : 1);
const matches = (v: Variable, q: string) => `${v.name} ${v.figmaName}`.toLowerCase().includes(q.toLowerCase());

/** A small, local-only demonstration. No Figma generation or checkout implementation. */
export default function PluginMockup({ initialModule, className = '' }: { initialModule?: ModuleId; className?: string }) {
  const uid = useId();
  const [source, setSource] = useState<LoadedPreset>();
  const [selected, setSelected] = useState(Boolean(initialModule));
  const [active, setActive] = useState<ModuleId>(initialModule ?? 'colors');
  const [query, setQuery] = useState('');
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ratio, setRatio] = useState(1.25);
  const request = useRef(0);
  const content = useRef<HTMLDivElement>(null);
  const select = async (id: string) => {
    const ticket = ++request.current;
    setLoading(true); setError(false);
    try {
      const data = await loadPreset(id);
      if (ticket !== request.current) return;
      setSource(data); setSelected(true); setEdits({}); setQuery(''); setStatus(''); setRatio(1.25);
    } catch { if (ticket === request.current) setError(true); }
    finally { if (ticket === request.current) setLoading(false); }
  };
  useEffect(() => {
    if (initialModule) void select(catalog.defaultPreset);
    return () => { request.current++; };
  }, []);
  useEffect(() => { content.current?.scrollTo(0, 0); }, [active, selected, source]);
  const module = source?.modules.find(m => m.module === active);
  const value = (v: Variable) => edits[v.id] ?? v.displayValue;
  const edit = (v: Variable, next: string) => { setEdits(prev => ({ ...prev, [v.id]: next })); setStatus(''); };
  const back = () => { setSelected(false); setActive('colors'); setQuery(''); setStatus(''); };
  const type = module?.module === 'typography' ? module : undefined;
  const config = type?.configuration;
  const typeVars = type ? variables(type) : [];
  const family = typeVars.find(v => v.id === config?.fontFamily.default);
  const base = typeVars.find(v => v.id === config?.baseSize.default);
  const line = typeVars.find(v => v.id === config?.lineHeight.default);
  const steps = typeVars.filter(v => config?.typeScale.steps.includes(v.id)).sort((a,b) => pixels(b) - pixels(a));
  const generateScale = () => {
    if (!base) return;
    // Demo uses only the preset's explicit size steps, retaining every name and unit.
    const sizes = [...new Set(steps.map(v => pixels(v)))].sort((a,b) => a-b);
    const anchor = sizes.indexOf(pixels(base));
    const next: Record<string,string> = {};
    for (const v of steps) {
      const px = pixels(base, value(base)) * ratio ** (sizes.indexOf(pixels(v)) - Math.max(0, anchor));
      const n = px / (v.unit === 'rem' || v.unit === 'em' ? 16 : 1);
      next[v.id] = `${Number(n.toFixed(3))}${v.unit ?? ''}`;
    }
    setEdits(prev => ({ ...prev, ...next })); setStatus('Typography scale updated in this demo.');
  };
  const tokenField = (v: Variable) => <label className="demo-token" key={v.id}>
    <span title={v.name}>{v.name}</span>
    {v.type === 'COLOR' && <input aria-label={`${v.name} color picker`} type="color" value={/^#[\da-f]{6}$/i.test(value(v)) ? value(v) : rgbaHex(v)} onChange={e => edit(v, e.target.value)} style={{ background: value(v) }} />}
    <input aria-label={`${v.name} value`} type={v.type === 'FLOAT' ? 'number' : 'text'} step="any" value={v.type === 'FLOAT' ? Number.parseFloat(value(v)) : value(v)} onChange={e => {
      if (v.type === 'FLOAT') { if (e.target.value !== '' && Number.isFinite(e.target.valueAsNumber)) edit(v, `${e.target.value}${v.unit ?? ''}`); }
      else edit(v, e.target.value);
    }} />{v.unit && <small>{v.unit}</small>}
  </label>;
  return <div className={`plugin-demo bg-white relative rounded-[16px] flex flex-col w-[300px] h-[470px] max-w-full ${className}`} aria-label="Interactive StartTokens plugin demo" style={{ boxShadow: '0px 24px 64px -12px rgba(0,0,0,0.14), 0px 0px 0px 1px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.08)' }}>
    <div className="demo-header"><img src={logos('starttoken')} alt="" width="14" height="22" /><span>StartTokens</span><small>v0.1</small></div>
    {selected && source && <>
      <div className="demo-preset"><button onClick={back} aria-label="Back to presets">←</button><img src={logos(source.preset.id)} alt="" width="25" height="25" /><span>{source.preset.metadata.name}</span></div>
      <div role="tablist" aria-label="Token categories" className="demo-tabs">{source.modules.map((m,i) => <button key={m.module} role="tab" id={`${uid}-${m.module}`} aria-selected={active === m.module} aria-controls={`${uid}-panel`} tabIndex={active === m.module ? 0 : -1} onClick={() => { setActive(m.module); setQuery(''); }} onKeyDown={e => {
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
        e.preventDefault(); const mods = source.modules;
        const n = e.key === 'Home' ? 0 : e.key === 'End' ? mods.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + mods.length) % mods.length;
        setActive(mods[n].module); setQuery(''); document.getElementById(`${uid}-${mods[n].module}`)?.focus();
      }}><span aria-hidden="true" className="material-symbols-outlined">{m.tabIcon}</span>{m.label}</button>)}</div>
    </>}
    <div className="demo-content" ref={content}>
      {loading && <p role="status">Loading preset…</p>}
      {error && <p role="alert">Unable to load preset. <button onClick={() => void select(source?.preset.id ?? catalog.defaultPreset)}>Try again</button></p>}
      {!selected ? <><h2>Welcome</h2><p>Choose a preset to customize your design token package.</p><div className="demo-presets">{catalog.presets.map(p => <button key={p.id} disabled={loading} onClick={() => void select(p.id)}><img src={logos(p.id)} alt="" width="30" height="30" /><span>{p.name}</span></button>)}</div></> : module && <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-${active}`} tabIndex={0}>
        <p>{subtitles[active]}</p><p className="demo-helper">Token names stay unchanged — only values are customized.</p>
        <input className="demo-search" type="search" aria-label="Search tokens" placeholder="Search tokens…" value={query} onChange={e => setQuery(e.target.value)} />
        {type && family && base && line ? <>
          <details open><summary>Configuration</summary><div className="demo-configuration">
            <label>Font Family<select aria-label="Font Family" value={value(family)} disabled={!config?.fontFamily.customizable} onChange={e => edit(family,e.target.value)}>{[...new Set([family.displayValue, 'Source Sans 3', 'Arial', 'Georgia', 'Courier New'])].map(f => <option key={f}>{f}</option>)}</select></label>
            <label>Base Size<input aria-label="Base Size" type="number" min="1" max="96" step="any" value={pixels(base,value(base))} disabled={!config?.baseSize.customizable} onChange={e => { if (e.target.valueAsNumber > 0 && e.target.valueAsNumber <= 96) edit(base, `${e.target.valueAsNumber / (base.unit === 'rem' || base.unit === 'em' ? 16 : 1)}${base.unit ?? ''}`); }} /> <small>px</small></label>
            <label>Type Scale<select aria-label="Type Scale" value={ratio} disabled={!config?.typeScale.customizable} onChange={e => setRatio(Number(e.target.value))}>{[[1.067,'Minor Second'],[1.125,'Major Second'],[1.2,'Minor Third'],[1.25,'Major Third'],[1.333,'Perfect Fourth'],[1.5,'Perfect Fifth'],[1.618,'Golden Ratio']].map(([r,n]) => <option key={r} value={r}>{n} · {r}</option>)}</select></label>
            <label>Line Height<input aria-label="Line Height" type="number" min="0.5" max="100" step="0.1" value={Number.parseFloat(value(line))} disabled={!config?.lineHeight.customizable} onChange={e => { if (e.target.valueAsNumber > 0 && e.target.valueAsNumber <= 100) edit(line, `${e.target.value}${line.unit ?? ''}`); }} /></label>
            <button className="demo-generate-scale" onClick={generateScale}>Generate scale</button>
          </div></details>
          <details open><summary>Generated scale</summary>{steps.filter(v => matches(v,query)).map(v => <div key={v.id} className="demo-type-preview"><span style={{ fontFamily: value(family), fontSize: Math.max(10,Math.min(38,pixels(v,value(v)))) , lineHeight: line.unit ? '1.4' : Math.min(3,Number.parseFloat(value(line))) }}>Aa</span><span><small>{value(v)}</small><code>{v.name}</code></span></div>)}</details>
        </> : module.submodules.filter(s => s.label.toLowerCase().includes(query.toLowerCase()) || s.variables.some(v => matches(v,query))).map((s,i) => {
          const list = s.variables.filter(v => s.label.toLowerCase().includes(query.toLowerCase()) || matches(v,query));
          return <details key={`${source?.preset.id}-${active}-${s.id}-${Boolean(query)}`} open={query ? true : i === 0}><summary>{s.label}</summary>
            {active === 'colors' ? colorFamilies(list).map(group => <div key={group[0].id} className="demo-color-family">{tokenField(group.find(v => /-500$/.test(v.name)) ?? group[0])}{group.length > 1 && <><div className="demo-scale">{group.map(v => <label key={v.id} title={`${v.name}: ${value(v)}`}><input type="color" aria-label={`${v.name} scale color`} value={/^#[\da-f]{6}$/i.test(value(v)) ? value(v) : rgbaHex(v)} onChange={e => edit(v,e.target.value)} style={{ background: value(v) }} /><span>{v.name.match(/(\d+)$/)?.[1]}</span></label>)}</div><details><summary>Edit individual tokens</summary>{group.map(tokenField)}</details></>}</div>) : list.map(v => <div key={v.id}>{tokenField(v)}
              {['space','spacing'].includes(s.id) && <div className="demo-spacing" style={{width:`${Math.max(1,Math.min(100,pixels(v,value(v))/2))}%`}} />}
              {s.id === 'radius' && <div className="demo-radius" style={{borderRadius:`${Math.max(0,Math.min(100,pixels(v,value(v))))}px`}} />}
              {s.id === 'grid' && /col(umn)?s?/i.test(v.name) && !v.unit && <div className="demo-grid" aria-label={`${value(v)} columns`} style={{gridTemplateColumns:`repeat(${Math.max(1,Math.min(24,Math.round(Number.parseFloat(value(v)))))},1fr)`}}>{Array.from({length:Math.max(1,Math.min(24,Math.round(Number.parseFloat(value(v)))))},(_,i) => <span key={i}/>)}</div>}
            </div>)}
          </details>;
        })}
        {query && !variables(module).some(v => matches(v,query)) && !module.submodules.some(s => s.label.toLowerCase().includes(query.toLowerCase())) && <p role="status">No tokens found.</p>}
        <p role="status" className="demo-helper">{status}</p>
      </div>}
    </div>
    {selected && <div className="demo-footer"><button onClick={() => setStatus('Demo preview ready. Install StartTokens on Figma to generate native Variables and Visual Documentation.')}>Generate tokens <span aria-hidden="true">▷</span></button><small>Interactive demo · Generate in Figma</small></div>}
  </div>;
}
function colorFamilies(list: Variable[]) {
  const families = new Map<string,Variable[]>();
  for (const v of list) { const key = v.figmaName.replace(/-\d+$/, ''); families.set(key,[...(families.get(key) ?? []),v]); }
  return [...families.values()];
}
const pickerColors = new Map<string, string>();
function rgbaHex(v: Variable) {
  if (typeof v.value === 'object') return '#' + [v.value.r,v.value.g,v.value.b].map(n => Math.round(n*255).toString(16).padStart(2,'0')).join('');
  // Native HSL/OKLCH values are displayed directly by CSS. Picker starts from the rendered color.
  if (typeof document !== 'undefined') {
    if (pickerColors.has(v.displayValue)) return pickerColors.get(v.displayValue)!;
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
    if (ctx) { ctx.fillStyle = v.displayValue; ctx.fillRect(0,0,1,1); const hex = '#' + [...ctx.getImageData(0,0,1,1).data].slice(0,3).map(n => n.toString(16).padStart(2,'0')).join(''); pickerColors.set(v.displayValue,hex); return hex; }
  }
  return '#000000';
}
