# Preset data contract (version 1)

This directory is the canonical source for both the landing page and the Figma plugin. Edit data here; the plugin's `src/data/presets` is a generated offline mirror. The canonical TypeScript contract and runtime validator live in the LP's `src/data/preset-contract` and are synchronized to the same source directory in the plugin.

`catalog.json` lists preset IDs, display names, manifest paths and `defaultPreset`. Readers resolve each manifest and its module paths instead of assuming three global JSON URLs. Paths are relative to the containing catalog or manifest. All presets use the `Catalog`, `Preset` and discriminated `Module` types in `src/data/preset-contract/types.ts`, with runtime checks in the adjacent `validate.mjs`.

## Modules

Each module carries `schemaVersion`, `module`, `label`, `tabIcon`, ordered `submodules`, and a module-specific `configuration`. Groups contain variables with stable IDs, names, native values, display values, optional units and optional alias references. References are scoped to the containing preset. Variable IDs may repeat between presets, but never inside one preset.

- Colors supports arbitrary groups. StartToken has palette, semantic and token groups; Bootstrap has palette and theme groups; Tailwind has native color-family scales; Bulma has palette and role groups. COLOR values may be normalized RGBA objects or native CSS color strings. Do not convert OKLCH or HSL to invented RGB approximations.
- Typography configuration identifies the default font family, base size, explicit type scale and line height by variable ID. `customizable` describes future editor support. Family and line-height options reference existing variables. Explicit scale steps preserve the supplied values; they do not imply a geometric ratio. Tailwind's per-size line-height expressions are preserved in a separate group.
- Layout capabilities independently declare grid, breakpoints, spacing, radius and tokens. Missing features are false and have no placeholder data. StartToken's existing `space` group is retained as the spacing capability. Tailwind exposes its native spacing multiplier, not an invented finite spacing scale. `grid: false` for Tailwind means this dataset supplies no fixed grid configuration; the framework still supports grid utilities.

Numbers retain their native unit (`px`, `rem`, `em`, or unitless). CSS expressions remain strings. A rem is not assumed to be a fixed pixel count. StartToken retains its existing IDs, order, values, aliases and presentation fields unchanged.

## Provenance and scope

Framework presets are curated subsets of official defaults, not exhaustive exports of every component or utility. Each manifest records versioned upstream source URLs:

- Bootstrap 5.3.3: Sass palette and theme colors, font stacks and sizes, weights and line heights, grid, breakpoints, spacers and radii.
- Tailwind CSS 4.1.12: the complete default color palette and selected typography, breakpoint, radius and spacing theme namespaces. CSS values are preserved from the installed version's official `theme.css`.
- Bulma 1.0.2: initial/derived Sass colors and typography, body size/line height, column gap, minimum-width breakpoints, spacing helpers and radii. Breakpoint arithmetic is resolved using the official 32px gap.

The active UI remains on the catalog's default, StartToken. No preset selector or framework generation conversion is introduced here. Future generation support must handle native CSS color strings, font stacks, relative units and expressions before exposing framework presets in the UI.

## Validation and synchronization

Run `node scripts/validate-presets.mjs` and `node --test scripts/presets.test.mjs` in the LP. The LP build validates the dataset. The plugin build runs `scripts/sync-variable-data.mjs`, which validates the source before mirroring the entire directory and removing stale generated files. Set `PRESET_SOURCE_DIR` to the LP's absolute `public/data/presets` directory when the repositories are not siblings. Missing or invalid sources fail the build; the sync never silently uses stale data.
