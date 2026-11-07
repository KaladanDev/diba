# @kaladan/diba-tokens

One OKLCH source, compiled to every platform Diba runs on. Colour, type, space, radius, motion — 434 tokens from the JSON under `src/tokens`, which ships with the package so a consumer can read the source rather than infer it from the output.

```bash
bun add @kaladan/diba-tokens
```

## What it emits

| Output                      | For                                                           |
| --------------------------- | ------------------------------------------------------------- |
| `theme.css`                 | CSS variables — primitives at `:root`, semantics per theme    |
| `tailwind.css`              | A Tailwind v4 `@theme inline` layer, so tokens name utilities |
| `tokens.js` / `tokens.d.ts` | Typed variable references and resolved values for both themes |
| `DibaTokens.dart`           | sRGB `Color`s, the scales, and a Material 3 `ThemeData`       |

```css
@import '@kaladan/diba-tokens/tailwind.css';
```

Every emitted name carries a `db` namespace — `--db-primary`, not `--primary`. Diba ships precompiled CSS into merchant storefronts and third-party panels, where a bare `--primary` is a coin flip against whatever else is on the page.

## Two layers

**Primitives** are named for what they look like: `iris`, `saffron`, `neutral`, `paper`. **Semantics** are named for what they do: `primary`, `accent`, `fg`, `border`. Only semantics change between light and dark — a theme is a different set of answers, not a different set of questions.

Three distinctions in the semantic layer are worth knowing, because each was learned by shipping the bug:

- **A line colour is not an ink colour.** `--db-border-strong` marks a control's edge; drawing a star or a caret with it gives 1.4:1.
- **A fill is not an ink.** `--db-primary` is chosen to hold `--db-primary-fg`, which puts it near 1.7:1 as text. Anything drawn _on_ a surface uses `--db-primary-emphasis`.
- **A focus ring is ground, not figure.** It stays iris even though primary is the gold, because a ring's whole job is to be seen.

## The Flutter target

OKLCH is resolved to sRGB at build time — Dart has no OKLCH parser and Flutter's `Color` is sRGB, so shipping the strings would push an unsolved problem across a language boundary. Out-of-gamut colours come back by reducing chroma rather than clipping channels, because clipping shifts hue.

`DibaTheme.light()` and `.dark()` return real `ThemeData`. Do not rebuild them with `ColorScheme.fromSeed()`: it takes `primary` at tone 40, which assumes primary holds white text, and Diba's gold holds dark text — the brand comes back a dark olive.

## Changing a token

Edit the JSON under `src/tokens`, run `bun run build`, and every platform moves together. The colour tests will tell you if a change breaks a contrast pair before it reaches anybody.

## Licence

For building apps, extensions and themes for Kaladan, and only for that: see `LICENSE`.
