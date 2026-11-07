# @kaladan/diba-schema

The contract between Diba's platforms. One manifest per component under `src/manifest` — its props, children, slots and events, in no particular language — compiled into the types, schema and allowlists that React and Flutter both answer to.

```bash
bun add @kaladan/diba-schema
```

## What it emits

| Output                    | For                                                          |
| ------------------------- | ------------------------------------------------------------ |
| `manifest.json`           | The merged manifest and the icon list, as data               |
| `schema.json`             | JSON Schema (2020-12) validating an SDUI document            |
| `index.js` / `index.d.ts` | Per-component prop types, the `DibaNode` union, the manifest |
| `validate.js`             | `validateTree`, on a separate entry so Ajv is opt-in         |
| `manifest.g.dart`         | The same allowlists for the Flutter renderer                 |
| `icons.g.dart`            | The icon list as a const table for Flutter                   |

Two renderers that disagree about which props are permitted is a security bug on whichever one is more generous, so neither restates the rules — both read these.

## The tree

```ts
import type { DibaNode } from '@kaladan/diba-schema'

const panel: DibaNode = {
  type: 'Modal',
  props: { title: 'تأیید حذف' },
  slots: { trigger: { type: 'Button', children: 'حذف' } },
  children: [{ type: 'Text', children: 'این کار بازگشت‌پذیر نیست.' }],
}
```

A node carries at most five things: a `type` naming a component, `props`, `children`, `slots` — named positions like a Modal's trigger or a Card's footer — and `actions`, what its events do, from the six verbs below. Nothing in that vocabulary can express code.

Props are strings, numbers, booleans, enums, tokens, lists of strings (`selectedKeys`) and number pairs (a range Slider). A prop that carries a URL says so with `format: "url"` or `"image-url"`, and the renderers hold exactly those props to their URL rules; every other string is plain text. Icons are names from `src/icons.json`, written as for left-to-right.

## The six verbs

```ts
actions: {
  onPress: [
    { do: 'call', action: 'label.print', with: ['weight'] },
    { do: 'toast', status: 'success', title: 'چاپ شد' },
    { do: 'close' },
  ],
}
```

`setState`, `navigate`, `open`, `call`, `toast` and `close` — one shape each, and that is the entire event surface. An event holds one action or an ordered list of them; each waits for the one before, and a failed `call` stops the list. An extension says "call `cart.add`", a name the host looks up; there is no verb that runs a function and no field that carries one. Only `call` reaches the extension's server.

## Validating

```ts
import { validateTree } from '@kaladan/diba-schema/validate'

const result = validateTree(payload)
if (!result.ok) console.warn(result.errors)
// [ '/children/1/props/size must be equal to one of the allowed values' ]
```

This catches what a renderer structurally cannot: a _declared_ prop holding a value the contract does not allow. `{ type: 'Button', props: { variant: 'nonsense' } }` passes every renderer check there is — `variant` really is a Button prop — and then matches no variant, so the button renders with no fill and no colour. A typo becomes an invisible control.

Errors name the node they came from rather than the whole union. Ajv reports every branch it tried, so one wrong boolean arrives as fifteen lines from components the tree never mentioned; `validateTree` walks the tree and checks each node against its own component's schema instead.

## The fixtures

`fixtures/` holds what both platforms test against: Diba's message table, its email and URL rules, what a number prints as, and the Flutter gallery's sample trees. The schema's tests validate every sample tree, and the gallery's tests hold `samples.json` to the gallery's code.

## Adding a component

Add a manifest entry, run `bun run build`. The build refuses a manifest that names a component it does not have — `children.accepts` and a slot's `accepts` must resolve — because a contract that cannot describe itself should not produce types at all.

Both renderers have a test holding them to this manifest, so a new entry shows up as a failing coverage check rather than as silence.

## Licence

For building apps, extensions and themes for Kaladan, and only for that: see `LICENSE`.
