# Material Design 3 source snapshot

Exact, unmodified token sources from Google Material Web **v2.5.0**, commit
`b4de401eb665ec63474f39319a4ba8f2145974cc`:
[official repository](https://github.com/material-components/material-web/tree/b4de401eb665ec63474f39319a4ba8f2145974cc/tokens).
The generated upstream design token version is **Google Material 3 v0.192**.
Upstream files are Copyright Google LLC, Apache-2.0; see [LICENSE](LICENSE).

`../materialdesign-data.mjs` reads the public `$supported-tokens` allowlists and
resolves defaults from `tokens/versions/v0_192`. The preset includes:

- 49 system colors, using official `values-light()` and the reference palette.
- 5 typeface references plus 62 typescale tokens: 15 roles with font, size,
  line-height and weight; the two supported prominent label weights.
- 7 scalar system shapes, including `corner-full: 9999px`.

Typography retains native **rem** units, shapes retain **px**, and references
retain the exact Material namespace. Unsupported tracking/composite typography
tokens and multi-corner Sass-only shape shorthands are intentionally excluded.
No dark-mode capability or artificial grid/spacing/breakpoints are introduced.

The contract requires a spacing strategy descriptor in every layout module. Its
presence does not enable spacing: Material's spacing capability is false and
there is no spacing submodule or spacing token.

From the canonical LP project:

```sh
node scripts/materialdesign-data.mjs
node scripts/materialdesign-data.mjs --check
node scripts/validate-presets.mjs
```

Generation honors `PRESET_SOURCE_DIR`; otherwise it writes to
`public/data/presets`. It only writes the Material directory and catalog.
The plugin's existing sync copies those files to its offline mirror. Builds do
not need network access to reconstruct or validate this dataset.

The existing font picker edits the brand reference. Material customization also
updates plain and resolves role references unless they have an explicit override.
The 15 size tokens are passed to the existing type-scale calculation. This is a
user-selected customization; the untouched preset keeps the official explicit
Material sizes and line heights.
