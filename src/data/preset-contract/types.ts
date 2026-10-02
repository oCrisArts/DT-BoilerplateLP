export type ModuleId = 'colors' | 'typography' | 'iconography' | 'layout';
export type VariableType = 'COLOR' | 'FLOAT' | 'STRING';
export interface Variable {
  id: string;
  module: string;
  submodule: string;
  name: string;
  figmaName: string;
  type: VariableType;
  value: string | number | { r: number; g: number; b: number; a: number };
  unit?: string;
  displayValue: string;
  preview?: string;
  icon?: string;
  reference?: string;
}
export interface Submodule { id: string; label: string; icon: string; variables: Variable[] }
export interface ConfigurableReference { default: string; customizable: boolean; options?: string[] }
export interface TypographyConfiguration {
  fontFamily: ConfigurableReference;
  fontRoles: Partial<Record<'primary' | 'secondary' | 'monospace', { label: string; token: string; customizable: boolean }>>;
  baseSize: ConfigurableReference;
  typeScale: { kind: 'explicit'; steps: string[]; customizable: boolean; referenceRatio: number };
  lineHeight: ConfigurableReference;
}
export interface IconographyConfiguration {
  library: string; delivery: string; nativeSize: string; baseSize: string; colorBehavior: string;
  verticalAlign?: string;
  scale: { kind: 'spacing' | 'proportional'; steps: string[]; baseValue: number };
  description: string;
}
export interface IconEntry { name: string; svg: string; tags: string[]; variant?: string }
export interface IconLibrary {
  schemaVersion: 1; id: string; name: string; provider: string; version: string;
  delivery: string[]; defaultSize: number; nativeSize: string; variants: string[];
  properties?: Record<string, { values: (string | number)[]; default: string | number }>;
  source: { url: string; integrity: string; license: string; scope?: string };
  icons: IconEntry[];
}
export interface ColorsConfiguration {
  structure: 'grouped' | 'scales';
  colorFormats: ('rgba' | 'hex' | 'hsl' | 'oklch')[];
}
export interface LayoutConfiguration {
  grid: { kind: 'none' | 'columns' | 'responsive-columns' };
  spacing: { kind: 'scale' | 'multiplier' };
}
type ModuleBase<K extends ModuleId, C> = {
  schemaVersion: 1;
  module: K;
  label: string;
  tabIcon: string;
  submodules: Submodule[];
  configuration: C;
};
export type Module =
  | ModuleBase<'colors', ColorsConfiguration>
  | ModuleBase<'typography', TypographyConfiguration>
  | ModuleBase<'iconography', IconographyConfiguration>
  | ModuleBase<'layout', LayoutConfiguration>;
export interface Preset {
  schemaVersion: 1;
  id: string;
  metadata: { name: string; version: string; description: string; sources: { url: string; version: string }[] };
  capabilities: {
    colors: { groups: string[] };
    typography: { fontFamily: boolean; baseSize: boolean; typeScale: boolean; lineHeight: boolean };
    iconography: { library: boolean; delivery: boolean; scale: boolean; colorBehavior: boolean };
    layout: { grid: boolean; breakpoints: boolean; spacing: boolean; radius: boolean; tokens: boolean };
  };
  modules: { id: ModuleId; path: string }[];
}
export interface Catalog {
  schemaVersion: 1;
  defaultPreset: string;
  presets: { id: string; name: string; path: string }[];
}
export interface LoadedPreset { preset: Preset; modules: Module[] }
