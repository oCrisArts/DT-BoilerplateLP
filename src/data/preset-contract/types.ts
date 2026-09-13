export type ModuleId = 'colors' | 'typography' | 'layout';
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
  baseSize: ConfigurableReference;
  typeScale: { kind: 'explicit'; steps: string[]; customizable: boolean };
  lineHeight: ConfigurableReference;
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
  | ModuleBase<'layout', LayoutConfiguration>;
export interface Preset {
  schemaVersion: 1;
  id: string;
  metadata: { name: string; version: string; description: string; sources: { url: string; version: string }[] };
  capabilities: {
    colors: { groups: string[] };
    typography: { fontFamily: boolean; baseSize: boolean; typeScale: boolean; lineHeight: boolean };
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
