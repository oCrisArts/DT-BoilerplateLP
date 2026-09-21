// Color math reused from the plugin's src/app/token-values.ts.
import type { Variable } from '@/data/preset-contract/types';
export type RGBA = { r: number; g: number; b: number; a: number };
export type HSV = { h: number; s: number; v: number; a: number };
export const clamp = (n: number, max = 1) => Math.max(0, Math.min(max, n));
export const round = (n: number) => Number(n.toFixed(4));
export const pixels = (variable: Variable, value = variable.displayValue) => parseFloat(value) * (variable.unit === 'rem' || variable.unit === 'em' ? 16 : 1);

export function hsvToRgb({ h, s, v, a }: HSV): RGBA {
  const f = (n: number) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return { r: f(5), g: f(3), b: f(1), a };
}
export function rgbToHsv({ r, g, b, a }: RGBA): HSV {
  const v = Math.max(r, g, b), min = Math.min(r, g, b), d = v - min;
  const h = !d ? 0 : ((v === r ? (g - b) / d : v === g ? 2 + (b - r) / d : 4 + (r - g) / d) * 60 + 360) % 360;
  return { h, s: v ? d / v : 0, v, a };
}
export function rgbToHsl(rgb: RGBA) {
  const hsv = rgbToHsv(rgb), l = hsv.v * (1 - hsv.s / 2);
  return { h: hsv.h, s: l === 0 || l === 1 ? 0 : (hsv.v - l) / Math.min(l, 1 - l), l, a: rgb.a };
}
export function hslToRgb(h: number, s: number, l: number, a = 1) {
  const v = l + s * Math.min(l, 1 - l);
  return hsvToRgb({ h, s: v ? 2 * (1 - l / v) : 0, v, a });
}
export function hex(rgb: RGBA, alpha = true) {
  const channel = (v: number) => Math.round(clamp(v) * 255).toString(16).padStart(2, '0');
  return '#' + [rgb.r, rgb.g, rgb.b, ...(alpha && rgb.a < 1 ? [rgb.a] : [])].map(channel).join('');
}
export function oklch(rgb: RGBA) {
  const linear = (v: number) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
  const r = linear(rgb.r), g = linear(rgb.g), b = linear(rgb.b);
  const l = Math.cbrt(.4122214708*r + .5363325363*g + .0514459929*b);
  const m = Math.cbrt(.2119034982*r + .6806995451*g + .1073969566*b);
  const s = Math.cbrt(.0883024619*r + .2817188376*g + .6299787005*b);
  const A = 1.9779984951*l - 2.428592205*m + .4505937099*s;
  const B = .0259040371*l + .7827717662*m - .808675766*s;
  return { l: .2104542553*l + .793617785*m - .0040720468*s, c: Math.hypot(A, B), h: (Math.atan2(B,A)*180/Math.PI+360)%360 };
}
function fromOklch(l: number, c: number, h: number, a = 1): RGBA {
  const A = c*Math.cos(h*Math.PI/180), B = c*Math.sin(h*Math.PI/180);
  const L = (l+.3963377774*A+.2158037573*B)**3, M = (l-.1055613458*A-.0638541728*B)**3, S = (l-.0894841775*A-1.291485548*B)**3;
  const gamma = (v: number) => clamp(v <= .0031308 ? 12.92*v : 1.055*Math.pow(v,1/2.4)-.055);
  return { r: gamma(4.0767416621*L-3.3077115913*M+.2309699292*S), g: gamma(-1.2684380046*L+2.6097574011*M-.3413193965*S), b: gamma(-.0041960863*L-.7034186147*M+1.707614701*S), a };
}
export function parseColor(raw: string): RGBA | null {
  const s = raw.trim();
  if (/^#[\da-f]{3,4}$|^#[\da-f]{6}([\da-f]{2})?$/i.test(s)) {
    let v = s.slice(1); if (v.length < 5) v = [...v].map(c=>c+c).join('');
    return { r: parseInt(v.slice(0,2),16)/255, g: parseInt(v.slice(2,4),16)/255, b: parseInt(v.slice(4,6),16)/255, a: v.length===8 ? parseInt(v.slice(6,8),16)/255 : 1 };
  }
  const match = s.match(/^(rgba?|hsla?|oklch)\(([^)]+)\)$/i);
  if (!match) return null;
  const parts = match[2].trim().split(/[\s,/]+/);
  if (parts.length < 3 || parts.length > 4 || parts.some(p=>!/^[-+]?(?:\d*\.)?\d+(?:%|deg)?$/.test(p))) return null;
  const [x,y,z] = parts.map(parseFloat), alpha = parts[3] ? parseFloat(parts[3])/(parts[3].includes('%')?100:1) : 1;
  if (alpha < 0 || alpha > 1) return null;
  const h = ((x%360)+360)%360;
  if (/^rgb/i.test(match[1])) {
    const channels=parts.slice(0,3).map(p=>parseFloat(p)/(p.includes('%')?100:255));
    if(channels.some(c=>c<0||c>1))return null;
    return {r:channels[0],g:channels[1],b:channels[2],a:alpha};
  }
  if (/^hsl/i.test(match[1])) return y<0||y>100||z<0||z>100 ? null : hslToRgb(h,y/100,z/100,alpha);
  return fromOklch(x/(parts[0].includes('%')?100:1),y,z,alpha);
}
export function colorValue(rgb: RGBA, original: Variable): string {
  if (original.displayValue.startsWith('oklch')) { const c=oklch(rgb); return `oklch(${round(c.l*100)}% ${round(c.c)} ${round(c.h)}${rgb.a<1?` / ${round(rgb.a)}`:''})`; }
  if (original.displayValue.startsWith('hsl')) { const c=rgbToHsl(rgb); return `hsl(${round(c.h)}, ${round(c.s*100)}%, ${round(c.l*100)}%${rgb.a<1?` / ${round(rgb.a)}`:''})`; }
  return hex(rgb);
}
export function colorFamilies(variables: Variable[]) {
  const groups = new Map<string,Variable[]>();
  for (const v of variables) {
    const leaf = v.figmaName.split('/').pop()!;
    const match = leaf.match(/^(.*)-(\d{2,3})$/);
    const key = match ? match[1] : v.id;
    groups.set(key,[...(groups.get(key)||[]),v]);
  }
  return [...groups.values()].map(tokens=>({ tokens, base:tokens.find(v=>/-500$/.test(v.figmaName)) || tokens[Math.floor(tokens.length/2)] }));
}
// Keep each family's original lightness profile and step identifiers. Tailwind uses
// OKLCH; the other presets retain their original HSL/HSV relationships.
export function recolorFamily(tokens: Variable[], base: Variable, next: RGBA) {
  const old = parseColor(base.displayValue)!;
  const a = rgbToHsv(old), b = rgbToHsv(next), ao = oklch(old), bo = oklch(next);
  const relative = (n:number, original:number, target:number) => n<=original ? (original ? n/original*target : target) : target+(n-original)/(1-original || 1)*(1-target);
  return Object.fromEntries(tokens.map(v=>{
    const rgb=parseColor(v.displayValue)!;
    if(v.id===base.id)return [v.id,colorValue(next,v)];
    let result: RGBA;
    if(v.displayValue.startsWith('oklch')) {
      const c=oklch(rgb); result=fromOklch(relative(c.l,ao.l,bo.l),ao.c>.0001?c.c*bo.c/ao.c:bo.c, c.h+bo.h-ao.h,next.a);
    } else {
      const c=rgbToHsv(rgb); result=hsvToRgb({h:(c.h+b.h-a.h+360)%360,s:clamp(a.s?c.s*b.s/a.s:b.s),v:relative(c.v,a.v,b.v),a:next.a});
    }
    return [v.id,colorValue(result,v)];
  }));
}
