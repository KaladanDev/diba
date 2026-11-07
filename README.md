# Diba · دیبا

Kaladan's design system, component library and cross-platform rendering contract, cut from one set of tokens so every surface (storefront themes, the merchant admin, apps and their extensions) looks like **one fabric**.

> **Diba** (دیبا): a fine Persian silk brocade.

A right-to-left, Persian-first React component library driven entirely by tokens, with a Flutter renderer and server-driven UI on the same contract.

## Packages

Bun workspaces:

| Package                                  | Publishes              | Role                                                                                                                                |
| ---------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [`packages/tokens`](./packages/tokens)   | `@kaladan/diba-tokens` | One OKLCH token source → CSS variables, a Tailwind v4 theme layer, TypeScript types and the Flutter theme                           |
| [`packages/schema`](./packages/schema)   | `@kaladan/diba-schema` | The component manifest → prop types, the JSON Schema a server-driven tree is checked against, and the Flutter renderer's allowlists |
| [`packages/react`](./packages/react)     | `@kaladan/diba-react`  | The React components (React Aria, Tailwind v4, tailwind-variants), the server-driven UI renderer, and Storybook                     |
| [`packages/flutter`](./packages/flutter) | not yet                | The Flutter theme and server-driven UI renderer, and its gallery                                                                    |

## Stack

React 19 · TypeScript (strict) · Tailwind CSS v4 · React Aria Components · tailwind-variants · Style Dictionary v4 · tsup · Storybook 9 · Changesets · Flutter. Package manager: **Bun**.

## Getting started

```bash
bun install          # install the workspace
bun run tokens       # build design tokens → packages/tokens/dist
bun run build        # build every package
bun run typecheck    # type-check every package
bun run test         # behaviour, in jsdom
bun run test:browser # appearance, in a real Chromium
```

## Two test suites

`bun run test` runs in jsdom and covers **behaviour**: what is in the DOM, what has focus, what a
callback received. It is fast, and it is where most tests belong.

`bun run test:browser` runs the same components in a real Chromium with the compiled stylesheet,
and covers **appearance**: resolved colours, measured geometry, contrast ratios, document
overflow. jsdom applies no CSS, so every computed colour there is an empty string and every box
is zero by zero. Put a test here only if it needs a rendering engine.

It needs a browser once:

```bash
bunx playwright install chromium chromium-headless-shell
```

Where Playwright's own download host cannot be reached, prefix that command with
`PLAYWRIGHT_DOWNLOAD_HOST=https://cdn.npmmirror.com/binaries/playwright`, which serves the same
builds.

## Theme

Diba's theme sets the stylesheet's variables from Diba's tokens: a gilt accent on slate
neutrals, in light and in dark. An app re-themes by overriding CSS variables; nothing in a
component hard-codes a colour.

Diba's token variables are namespaced `--db-`, because the stylesheet lands in storefronts and
extensions, where a bare `--primary` would be a coin flip; the theme sets the components' role
variables (`--accent`, `--surface-secondary` and the rest) from them. Override the tokens:

```css
[data-theme='light'] {
  --db-primary: oklch(0.823 0.115 69);
  --db-primary-fg: oklch(0.397 0.055 288);
  --db-radius-md: 8px;
}
```

## Licence

For building apps, extensions and themes for Kaladan, and only for that: see each package's
`LICENSE`. Parts of `@kaladan/diba-react` and of the Flutter package are third-party code under
their own licences, named in their `THIRD-PARTY-NOTICES.txt`.
