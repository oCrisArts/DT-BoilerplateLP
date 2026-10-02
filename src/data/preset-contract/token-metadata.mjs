// Shared by validation, Figma generation and every export. Paths are never mutated.
export function category(t) {
  if(t.type==='COLOR')return 'colors';
  const n=`${t.submodule}/${t.name}`.toLowerCase();
  if(t.module==='typography'){
    if(/line.?height|leading/.test(n))return 'lineHeight';
    if(/tracking|letter.?spacing/.test(n))return 'letterSpacing';
    if(/weight/.test(n))return 'fontWeight';
    if(/family|typeface|(?:[-/.])font$/.test(n)&&t.type==='STRING')return 'fontFamily';
    if(/sizes|size|--text-/.test(n))return 'fontSize';
  }
  if(t.module==='layout'){
    if(/breakpoint/.test(n))return 'screens';
    if(/radius|shape/.test(n))return 'borderRadius';
    if(/border.?width/.test(n))return 'borderWidth';
    if(/border.?style/.test(n))return 'borderStyle';
    if(/opacity/.test(n))return 'opacity';
    if(/space|spacing|padding|gap|gutter|margin/.test(n))return 'spacing';
    if(/width|height|size/.test(n))return 'sizing';
  }
  return undefined;
}
export function scopesFor(t) {
  if(t.type==='COLOR')return ['ALL_SCOPES'];
  const c=category(t);
  if(t.type==='STRING')return c==='fontFamily'?['FONT_FAMILY']:['ALL_SCOPES'];
  const scopes={fontSize:['FONT_SIZE'],fontWeight:['FONT_WEIGHT'],lineHeight:['LINE_HEIGHT'],letterSpacing:['LETTER_SPACING'],borderRadius:['CORNER_RADIUS'],borderWidth:['STROKE_FLOAT'],opacity:['OPACITY'],spacing:['GAP','WIDTH_HEIGHT'],sizing:['WIDTH_HEIGHT'],screens:['WIDTH_HEIGHT']};
  return scopes[c]||['ALL_SCOPES'];
}
export function codeName(path) {
  return path.replace(/^Colors\//,'Color/').replace(/^Layout\/Space\//,'Space/').replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
export function codeSyntax(t) {
  const name=codeName(t.figmaName),c=category(t);
  return {css:`var(--${name})`,scss:`$${name}`,sass:`$${name}`,tailwind:c?`theme(${JSON.stringify(c+'.'+name)})`:`var(--${name})`};
}
export function tokenTier(t) {
  if(t.tier)return t.tier;
  if(/\/(Button|Input|Label)\//i.test(t.figmaName)||t.name.startsWith('--md-comp-'))return 'component';
  if(t.reference||t.name.startsWith('--md-sys-')||['roles','theme'].includes(t.submodule))return 'semantic';
  return 'primitive';
}
