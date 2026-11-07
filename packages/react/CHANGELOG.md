# @kaladan/diba-react

## 0.1.0

### Minor Changes

- The first release, a preview for building apps on before 1.0. Each package ships its source beside its built code, under the licence in its `LICENSE`: for building apps, extensions and themes for Kaladan.

  - `@kaladan/diba-tokens`: Diba's design tokens, from one OKLCH source, as CSS variables in a light and a dark theme, a Tailwind v4 theme layer, TypeScript types and the Flutter theme.
  - `@kaladan/diba-schema`: the component manifest, the contract both platforms answer to. From it come each block's prop types, the `DibaNode` union, the JSON Schema a server-driven tree is checked against, `validateTree` (on `@kaladan/diba-schema/validate`) and the Flutter renderer's allowlists.
  - `@kaladan/diba-react`: Diba's components on React Aria and Tailwind v4, right-to-left and Persian first, in light and dark: actions, text fields, choices, pickers, dates and times in the page's calendar, status, containers and navigation. `DibaProvider` sets theme, direction and locale; `tailwind.css` is the stylesheet an app compiles with its own Tailwind; `@kaladan/diba-react/variants` holds the style recipes alone. `@kaladan/diba-react/sdui` renders server-driven trees with the same components: `DibaSurface` draws a tree, `DibaExtension` fetches one, and six verbs (`setState`, `call`, `navigate`, `open`, `toast`, `close`) are everything a tree can do.

### Patch Changes

- Updated dependencies:
  - @kaladan/diba-tokens@0.1.0
  - @kaladan/diba-schema@0.1.0
