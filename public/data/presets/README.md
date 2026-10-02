# Preset data contract (version 1)

This directory is the canonical source for both the landing page and the Figma plugin. Edit data here; the plugin's `src/data/presets` is a generated offline mirror. The canonical TypeScript contract and runtime validator live in the LP's `src/data/preset-contract` and are synchronized to the same source directory in the plugin.

`catalog.json` lists preset IDs, display names, manifest paths and `defaultPreset`. Readers resolve each manifest and its ordered modules: Colors → Typography → Icons → Layout. Paths are relative to the containing catalog or manifest. All presets use the `Catalog`, `Preset` and discriminated `Module` types in `src/data/preset-contract/types.ts`, with runtime checks in the adjacent `validate.mjs`.

## Modules

Each module carries `schemaVersion`, `module`, `label`, `tabIcon`, ordered `submodules`, and a module-specific `configuration`. Groups contain variables with stable IDs, names, native values, display values, optional units and optional alias references. References are scoped to the containing preset. Variable IDs may repeat between presets, but never inside one preset.

- Colors supports arbitrary groups. StartToken has palette, semantic and token groups; Bootstrap has palette and theme groups; Tailwind has native color-family scales; Bulma has palette and role groups. COLOR values may be normalized RGBA objects or native CSS color strings. Do not convert OKLCH or HSL to invented RGB approximations.
- Typography configuration identifies the default font family, base size, explicit type scale and line height by variable ID. `customizable` describes future editor support. Family and line-height options reference existing variables. Explicit scale steps preserve the supplied values; they do not imply a geometric ratio. Tailwind's per-size line-height expressions are preserved in a separate group.
- Layout capabilities independently declare grid, breakpoints, spacing, radius and tokens. Missing features are false and have no placeholder data. StartToken's existing `space` group is retained as the spacing capability. Tailwind exposes its native spacing multiplier, not an invented finite spacing scale. `grid: false` for Tailwind means this dataset supplies no fixed grid configuration; the framework still supports grid utilities.

Numbers retain their native unit (`px`, `rem`, `em`, or unitless). CSS expressions remain strings. A rem is not assumed to be a fixed pixel count. StartToken Grayscale is renamed Black (including aliases), with a mirrored White palette using the same native scale profile and editing mechanism.

`typography.configuration.fontRoles` maps supported semantic controls directly to native token IDs. StartToken supports Primary (DM Sans) and Secondary (Sora) only; Bootstrap and Bulma support Primary (sans) and Monospace; Tailwind also maps Secondary to serif; Material maps Primary to brand and Secondary to plain. No semantic font token duplicates are created. Native aliases resolve after edits; brand and plain remain independent. Each preset records its reference ratio so regenerating at the original ratio preserves its native explicit proportions and units.

`iconography.configuration` references configuration Variables and each preset's project size steps. Library-specific style and property Variables are materialized only for the selected library. The separately versioned `../icons` catalog contains the artwork and upstream provenance; the sync validates catalog hashes before updating either offline dataset.

## Provenance and scope

Framework presets are curated subsets of official defaults, not exhaustive exports of every component or utility. Each manifest records versioned upstream source URLs:

- Bootstrap 5.3.3: Sass palette and theme colors, font stacks and sizes, weights and line heights, grid, breakpoints, spacers and radii.
- Tailwind CSS 4.1.12: the complete default color palette and selected typography, breakpoint, radius and spacing theme namespaces. CSS values are preserved from the installed version's official `theme.css`.
- Bulma 1.0.2: initial/derived Sass colors and typography, body size/line height, column gap, minimum-width breakpoints, spacing helpers and radii. Breakpoint arithmetic is resolved using the official 32px gap.

The landing page's interactive demo reads this catalog and lazily fetches the selected preset. Native CSS colors, relative units, groups and token names are retained. Local demo edits never change these files. The plugin uses the same dataset as an offline build mirror; its generation logic stays in the plugin.

StartToken maps Primary to `Typography/Family/font-family-primary` and Secondary to `Typography/Family/font-family-secondary`. Both are STRING Variables using the selected families; documentation loads both fonts when rendering specimens. There is one shared size scale and no Monospace or icon font in Typography. Generation renames legacy `Typography/Family/font-family-sans` in place when possible and removes that legacy duplicate if Primary already exists.

## Validation and synchronization

Run `node scripts/validate-presets.mjs` and `node --test scripts/presets.test.mjs` in the LP. The LP build validates the dataset. The plugin build runs `scripts/sync-variable-data.mjs`, which validates the source before mirroring the entire directory and removing stale generated files. Set `PRESET_SOURCE_DIR` to the LP's absolute `public/data/presets` directory when the repositories are not siblings. Missing or invalid sources fail the build; the sync never silently uses stale data.

## Foundations and compatibility

Run `node scripts/complete-foundations.mjs` to apply the additive, idempotent foundation migration. `upgrade-foundations.mjs` calls the same migration. Existing IDs, names, values, units, Variable Paths and existing reference edges are regression-tested against `scripts/fixtures/foundations-baseline.json`.

| Preset | Additions / native limits |
| --- | --- |
| StartToken | Space 0 (0px), radius-full (9999px), breakpoints mobile/tablet/desktop/wide (0/768/1024/1440px), border widths 0/1/2/4/8px, none/solid/dashed/dotted/double borders, opacity 0/.25/.5/.75/1, tracking tight/normal/wide (-.025/0/.025em). These are StartToken's own defaults, not attributed to another framework. |
| Bootstrap 5.3.3 | Native border-widths map 1–5px, border-style solid and opacity utilities 0/25/50/75/100. Existing zero spacing, breakpoints and pill radius retained. No global tracking token is invented. |
| Tailwind 4.1.12 | Native --tracking-* scale in em. Its --spacing multiplier, breakpoints and radius theme stay intact. Utilities such as rounded-full, spacing zero, arbitrary border widths/styles and opacity are not fabricated into finite theme-token scales. |
| Bulma 1.0.2 | control-border-width (1px), input-border-style (solid), button-disabled-opacity (.5). Existing zero spacing, breakpoints and radius-rounded retained. No global tracking scale is invented. |
| Material Web 2.5.0 | Existing scalar shape tokens retained. Referenced native md-ref-palette primitives added for the existing system color aliases. No artificial layout scale: the checked-in public supported-token lists exclude tracking and do not expose the requested additional layout foundations. |

Native sources: [Bootstrap variables](https://github.com/twbs/bootstrap/blob/v5.3.3/scss/_variables.scss), [Bootstrap utilities](https://github.com/twbs/bootstrap/blob/v5.3.3/scss/_utilities.scss), [Tailwind theme](https://github.com/tailwindlabs/tailwindcss/blob/v4.1.12/packages/tailwindcss/theme.css), [Bulma controls](https://github.com/jgthms/bulma/blob/1.0.2/sass/utilities/controls.scss), [Bulma inputs](https://github.com/jgthms/bulma/blob/1.0.2/sass/form/shared.scss), [Bulma button opacity](https://bulma.io/documentation/elements/button/). Material sources and commit are recorded in `scripts/materialdesign-source/README.md`.

## Primitive → Semantic → Component

The optional `tier` field organizes tokens internally without moving groups or changing names/paths. Raw tonal scales remain primitives even when their historic group label is Semantic. Existing content/surface roles reference primitives; existing component aliases are retained exactly, including legacy direct primitive references. We do not insert duplicate pass-through roles just to force a three-level chain. Missing native Bootstrap/Bulma role references and Material system-to-reference-palette links are filled from upstream relationships, not inferred from coincident colors.

Runtime customization resolves references. An explicit edit to an alias overrides that relationship only in the final payload; it does not change the canonical preset. Unedited aliases remain actual Figma Variable aliases and references in the exports. No Light/Dark mode is added.

## Figma metadata and code names

All COLOR Variables use `ALL_SCOPES`, including semantic and component colors. Numeric typography, radius, borders, opacity, sizes and spacing use compatible scopes. Strings with no compatible narrow scope stay unrestricted. Scopes and code syntax are metadata, never additional tokens.

Code names derive deterministically from the full path: `Colors/Content/Primary/Text` → `--color-content-primary-text`; `Layout/Space/4` → `--space-4`. Other paths retain all segments, normalized to kebab case. Collisions fail validation rather than silently dropping a token. The [Figma API](https://developers.figma.com/docs/plugins/api/Variable/) has one WEB slot, populated with the CSS var() expression. SCSS/Sass/Tailwind mappings and tier/unit metadata are retained in plugin data. No fictitious Figma platform is used.

## Export

The shared `preset-contract/exports.mjs` prepares one final, alias-resolved payload used by generation and every exporter. The plugin and LP demo expose DTCG, CSS, SCSS, indented Sass and Tailwind previews with copy/download.

- CSS exports all tokens as Custom Properties, retaining aliases with var().
- SCSS and indented Sass emit dependencies first and preserve alias references. Sass has no declaration semicolons or braces.
- Tailwind exports a JS config (v3, or v4 through @config) with only categories present in the payload. Keys use deterministic full-path names, avoiding duplicate native leaf names. Its named `tokens` export retains every token, including values with no Tailwind category (for example icon configuration and border styles).
- DTCG/JSON retains path hierarchy, aliases, type/value and exact source names/units in `$extensions.org.starttokens`. DTCG 2025.10 supports px/rem dimensions; native em/percent values remain numbers with their original unit in this extension. General configuration strings and expressions use the `string` extension type, since the standard has no equivalent for every framework value. Consumers of these extensions must read their native unit/type metadata; there is no silent unit conversion. Color objects preserve their native srgb/hsl/oklch space. Reserved path characters are escaped reversibly, with the original name/path in the extension.

Validation: LP `node --test scripts/*.test.mjs`, `node scripts/export-ui.mjs`, `npm run build`; plugin `npm run sync:data`, `npm test`, `npm run build`. Export UI tests compare preview, clipboard and downloaded bytes to the exact message payload sent to the plugin. Integration tests verify real generation logic with a Figma API double, including aliases/scopes/code syntax and every documented Variable.
