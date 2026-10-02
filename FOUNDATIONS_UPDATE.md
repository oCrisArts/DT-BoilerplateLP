# Foundations update — 2026-10-02

LP is the canonical source for five presets and the versioned six-library icon catalog. The plugin validates and synchronizes both before building, including SHA-256 catalog checks and npm source integrity. Typography maps supported semantic controls to existing native tokens without duplicate font Variables. Material brand/plain remain independent, and aliases resolve from the final edited values.

Colors → Typography → Icons → Layout is available in both applications. The plugin font picker queries all Figma fonts, searches by family and loads the selected face before applying. Iconography supports per-library delivery, native sizing, project size scales, library properties, searchable official SVGs, previews and insertion at a configured scale size. Figma Variables contain configuration and size tokens only. Visual Documentation uses the final generated tokens and selected SVG preview. StartToken replaces Grayscale with Black, adds White using the native neutral scale profile, and migrates existing Grayscale Variable names in place when generating.

## Validation

- Five preset contracts and the Material source generator check passed.
- Six canonical icon libraries validated; **18,073 SVGs** in total.
- Canonical/offline sync and byte equality passed.
- LP: 32 automated tests passed, including existing checkout/licensing and analytics regressions.
- Plugin: 26 automated tests passed, including native font handling, independent font roles, documentation, configured icon insertion and existing licensing behavior.
- Token-value checks passed for all five native typography profiles and color families.
- New panel browser interactions passed. Full LP browser regression passed for all presets, six viewport sizes, navigation and existing checkout flows.
- LP production build and plugin Vite build, inlined Figma HTML and ES2017 plugin bundle generated.

Screenshots and interaction reports are in `validation-output/foundations/`. Pricing, checkout and licensing implementation were preserved; pre-existing local plugin edits were retained. Changes are local, with no commit or push.

## Catalog and rendering limits

Material Symbols starts with **40 common symbols**, three styles and two fill variants (240 SVGs), pinned to Google's repository. Its static SVG axes are wght=400, GRAD=0 and opsz=24. Other libraries use their pinned official package SVGs. These limitations are explicit in library metadata and the panel; the catalog is not an exhaustive Material Symbols export.

The offline plugin contains the full catalog and an embedded Material Symbols interface font; its inlined HTML is approximately **18 MB**. Vite reports a large-chunk warning. DM Sans and optional type specimens retain their existing Google Fonts imports, so offline screenshots use system fallback fonts. Pixel-identical font rendering was not verified in the sandbox. Icon geometry and interaction behavior were verified locally against the supplied Figma designs.
