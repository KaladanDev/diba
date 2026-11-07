# @kaladan/diba-react

Diba's React components — [React Aria](https://react-spectrum.adobe.com/react-aria/) behaviour, Tailwind v4 styling, every colour and measurement from `@kaladan/diba-tokens`. Persian-first: right-to-left is the default, not a mode.

```bash
bun add @kaladan/diba-react
```

## Setup

Two things, once, at the root of the app. The stylesheet carries the tokens and the components' CSS, and the app compiles it with its own Tailwind:

```css
@import 'tailwindcss';
@import '@kaladan/diba-react/tailwind.css';
```

The provider establishes theme, direction and locale:

```tsx
import { DibaProvider, Button } from '@kaladan/diba-react'

export function App() {
  return (
    <DibaProvider locale="fa-IR" theme="light">
      <Button variant="primary">افزودن به سبد</Button>
    </DibaProvider>
  )
}
```

`DibaProvider` also reflects theme, direction and locale onto `<html>`, so overlays that portal to `document.body` match the tree they came from. It claims the document only if no other provider has, and puts the previous values back when it unmounts — mount a second one inside a host you do not own and pass `ownsDocument={false}`.

The faces are the app's. The tokens name them, `--db-font-family-fa` (Yekan Bakh, then Vazirmatn) and `--db-font-family-sans` (Inter), and the app loads the font files it is licensed for and sets them, for example by the provider's language:

```css
.db-root:lang(fa) {
  font-family: var(--db-font-family-fa);
}
.db-root:lang(en) {
  font-family: var(--db-font-family-sans);
}
```

Peer dependencies: React 19, `react-dom` 19 and Tailwind CSS 4, which compiles the stylesheet (with `@tailwindcss/vite`, say, or `@tailwindcss/postcss`).

## Theming

Everything is a CSS custom property, so a merchant re-theme is a variable override rather than a fork:

```css
[data-theme='light'] {
  --db-primary: oklch(0.823 0.115 69);
  --db-primary-fg: oklch(0.397 0.055 288);
}
```

The pairs matter more than the values. `--db-primary` is a fill chosen to hold `--db-primary-fg`; anything drawn _on_ a surface — a focus ring, a slider's track, a checked box — uses `--db-primary-emphasis` instead, because a colour picked to sit behind dark text is rarely legible as ink.

## Components

Most of Diba's components are third-party code under the Apache License 2.0, copied in with their source, their names and their API. Each such file says so at its top, and says when Kaladan changed it; `THIRD-PARTY-NOTICES.txt` holds the notice and the licence. The choices draw their state in Diba's roles (a gilt fill with slate-700 on it); the switch and the slider are Flutter's Material 3 ones, animated as Flutter's are, the slider's fill starting at the inline start, so it grows from the right in Persian. Diba's own sit beside them: Stack, Text, Spacer, Image, Snippet and the time picker.

The stylesheet is the copied one with Diba's tokens under it: `src/styles/themes/diba` sets its variables from `--db-*`, gilt accent, slate neutrals. The style recipes are also on `@kaladan/diba-react/variants`, which has no React in it, for a server component that wants `buttonVariants()`.

## Server-driven UI

`@kaladan/diba-react/sdui` renders trees the host did not write — an extension panel, a layout from a server — using these same components. It is a separate entry point so an app that only wants the components does not carry the manifest. The tree's types and its validator are `@kaladan/diba-schema`'s, which an app that imports them adds itself (`bun add @kaladan/diba-schema`).

```tsx
import { DibaExtension } from '@kaladan/diba-react/sdui'
import { validateTree } from '@kaladan/diba-schema/validate'

export function ShippingPanel({ orderId }: { orderId: string }) {
  return (
    <DibaExtension
      surface="order.detail.sidebar"
      context={{ orderId }}
      transport={callYourProxy}
      validate={validateTree}
    />
  )
}
```

A tree names components; it never carries them. The renderer forwards only manifest-declared props, refuses undeclared events, holds every URL prop to a URL rule, and drops a tree past a depth or node limit whole rather than in part. `validate` is required rather than defaulted, because skipping validation is the one mistake with no symptom.

The blocks draw the copied components the way the admin writes them by hand. The Flutter renderer has the same shape: the same allowlists, the same six verbs, the same value pairs, and Form checks in Diba's own words. Both are tested against the Flutter gallery's sample trees in `packages/schema/fixtures`. Toasts go through the host's `toast` handler, or Diba's own toast when there is a `ToastProvider` on the page.

## Accessibility

Behaviour, focus management and ARIA come from React Aria. Contrast is measured rather than assumed: the suite checks text against its composited background in both themes, and non-text contrast — rings, indicators, control edges — against WCAG 1.4.11.

React Aria ships no Persian, so Diba installs its own translations of the strings React Aria writes itself: a calendar's Previous and Next, a date segment's name, a table's sort announcement. Turn that off with `ariaStrings={false}` on a page that genuinely mixes languages.

## Development

```bash
bun run dev          # rebuilds dist as the TypeScript changes
bun run storybook    # every component, in Persian, at every variant
bun run test         # behaviour, in jsdom
bun run test:browser # appearance, in real Chromium
```

The stylesheet is not built here: `tailwind.css` ships as source and the app's own Tailwind compiles it, so an app linked to this folder picks up a CSS change at once, and a TypeScript change once `dev` has rebuilt.

## Licence

For building apps, extensions and themes for Kaladan, and only for that: see `LICENSE`. Parts are third-party code under their own licences, named in `THIRD-PARTY-NOTICES.txt`.
