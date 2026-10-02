# Icon catalog v1.0.0

This is the canonical icon dataset. The plugin validates and copies it before its build for offline use. `catalog.json` records the version and SHA-256 of each library. SVG artwork is never a Figma Variable. Only the preset's configuration, library properties and project size tokens become Variables.

Regenerate with `node scripts/generate-icon-catalog.mjs`; validate with `node scripts/validate-icons.mjs` and `node --test scripts/icons.test.mjs`. npm sources are pinned and checked against the registry's SHA-512 integrity. Google SVGs are pinned to commit `737e3324305806514d7909874fa1818ae1808232`.

| Library | Official source | Version | License / scope |
| --- | --- | --- | --- |
| Bootstrap Icons | https://github.com/twbs/icons | 1.13.1 | MIT; complete package SVGs |
| Material Symbols | https://github.com/google/material-design-icons | pinned commit above | Apache-2.0; 40 common symbols, outlined/rounded/sharp, unfilled/filled; SVG axes wght=400, GRAD=0, opsz=24 |
| Lucide | https://github.com/lucide-icons/lucide | 0.487.0 | ISC; complete lucide-static SVGs |
| Phosphor | https://github.com/phosphor-icons/core | 2.1.1 | MIT; thin, light, regular, bold, fill and duotone SVGs |
| Font Awesome | https://github.com/FortAwesome/Font-Awesome | 6.7.2 | CC BY 4.0 icons; free solid, regular and brands; brand marks retain their owners' trademarks |
| Remix Icon | https://github.com/Remix-Design/RemixIcon | 4.6.0 | Apache-2.0; line and fill SVGs |

Delivery describes the library's supported integration methods. The plugin inserts scalable SVG artwork regardless of the web project's selected delivery. Material Symbols' static subset exposes its actual axes rather than promising unsupported weights or optical sizes. Lucide exposes stroke width; Phosphor and Font Awesome expose their native styles. Color behavior is documented as a project configuration; SVG previews inherit their context color.

Bootstrap uses native 1em artwork and a -0.125em alignment. Material keeps the 20/24/40/48 optical size profile. Bulma's small/normal/medium/large project scale follows its 16/24/32/48 icon wrappers. Tailwind supplies no icon library: Lucide is an explicit project recommendation and its scale follows the spacing unit. StartToken has its own 12/16/20/24/32/40 project scale. Icon size token names are project extensions, never misrepresented as official framework tokens.
