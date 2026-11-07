# Extracted token reference

The source of truth for Diba's **shape, spacing, elevation and motion**. Everything
below was read out of an upstream component library's published v2 packages, not transcribed
from docs.

| Package               | Version  | What it gave us                                                                                                                                                                                                                  |
| --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| upstream theme        | `2.4.26` | `defaultLayout` / `lightLayout` / `darkLayout`, the Tailwind plugin (`src/plugin.ts`), the shared class utils (`src/utils/classes.ts`), the `@keyframes` + animation table, and every component's `tailwind-variants` definition |
| upstream motion utils | `2.1.28` | `TRANSITION_EASINGS`, `TRANSITION_DEFAULTS`, `TRANSITION_VARIANTS` — the overlay motion curves                                                                                                                                   |

Extracted 2026-08-05. Those packages target **Tailwind v3**; Diba is on **Tailwind v4**, so a
few utility names shifted meaning (noted inline). Diba keeps v3's _look_ and v4's _plumbing_.

## Scope

**Taken:** radius, border widths, divider weight, opacity states, elevation geometry,
focus-ring metrics, z-index layers, motion (durations, easings, interaction scales),
and the per-size geometry of every component.

**Not taken (by request):**

- **Colors.** Its blue/purple/green/yellow/red/zinc palettes and its
  `content1..4` / `default-*` semantic layer are dropped. Diba keeps **Lapis & Gilt**.
- **Type.** Its `fontSize`/`lineHeight` scale is dropped. Diba keeps Inter +
  Yekan Bakh and its own `text-*` ramp.

Shadow **geometry and alpha** are upstream's; the shadow **ink** is Diba's
(`oklch(0.235 0.03 285)` instead of pure black), because ink is a color.

---

## 1. Layout defaults (`defaultLayout`)

```js
dividerWeight:   "1px"
disabledOpacity: ".5"
hoverOpacity:    ".8"  // light
hoverOpacity:    ".9"  // dark

radius:      { small: "8px",  medium: "12px", large: "14px" }
borderWidth: { small: "1px",  medium: "2px",  large: "3px"  }

// excluded — type
fontSize:    { tiny: "0.75rem", small: "0.875rem", medium: "1rem", large: "1.125rem" }
lineHeight:  { tiny: "1rem",    small: "1.25rem",  medium: "1.5rem", large: "1.75rem" }
```

The Tailwind plugin also registers extra border widths `1px / 1.5px / 3px / 5px`,
`scale-80` / `scale-85`, and `backgroundSize.stripe-size: 1.25rem`.

### Elevation

Three layers per shadow — a wide diffuse ambient, a tighter drop, and a `0 0 1px` hairline
that reads as a border. That hairline is most of why those surfaces look crisp.

```js
// light
small:  0px 0px  5px 0px rgb(0 0 0/.02), 0px  2px 10px 0px rgb(0 0 0/.06), 0px 0px 1px 0px rgb(0 0 0/.3)
medium: 0px 0px 15px 0px rgb(0 0 0/.03), 0px  2px 30px 0px rgb(0 0 0/.08), 0px 0px 1px 0px rgb(0 0 0/.3)
large:  0px 0px 30px 0px rgb(0 0 0/.04), 0px 30px 60px 0px rgb(0 0 0/.12), 0px 0px 1px 0px rgb(0 0 0/.3)

// dark — hairline flips to an inset white rim
small:  0px 0px  5px 0px rgb(0 0 0/.05), 0px  2px 10px 0px rgb(0 0 0/.2),  inset 0px 0px 1px 0px rgb(255 255 255/.15)
medium: 0px 0px 15px 0px rgb(0 0 0/.06), 0px  2px 30px 0px rgb(0 0 0/.22), inset 0px 0px 1px 0px rgb(255 255 255/.15)
large:  0px 0px 30px 0px rgb(0 0 0/.07), 0px 30px 60px 0px rgb(0 0 0/.26), inset 0px 0px 1px 0px rgb(255 255 255/.15)
```

`shadow-xs` (Tailwind's own, `0 1px 2px rgb(0 0 0/.05)`) is used on the input wrapper and
the bordered tab list.

## 2. Focus ring

Upstream focuses with **outline**, not ring, except where the ring must sit on a parent:

```js
dataFocusVisibleClasses      = ["outline-solid outline-transparent",
                                "data-[focus-visible=true]:z-10",
                                "data-[focus-visible=true]:outline-2",
                                "data-[focus-visible=true]:outline-focus",
                                "data-[focus-visible=true]:outline-offset-2"]

groupDataFocusVisibleClasses = [..., "ring-2", "ring-focus", "ring-offset-2", "ring-offset-background"]
```

So: **2px, offset 2px, focus color, raised to z-10.** Nothing uses a box-shadow ring.

## 3. Motion

```js
TRANSITION_EASINGS = {
  ease:       [0.36, 0.66, 0.4,  1   ],
  easeIn:     [0.4,  0,    1,    1   ],
  easeOut:    [0,    0,    0.2,  1   ],
  easeInOut:  [0.4,  0,    0.2,  1   ],
  spring:     [0.155, 1.105, 0.295, 1.12],  // == the plugin's `soft-spring`
  springOut:  [0.57, -0.15, 0.62, 0.07],
  softSpring: [0.16, 1.11, 0.3,  1.02],
}
TRANSITION_DEFAULTS = { enter: 0.2s easeOut, exit: 0.1s easeIn }
```

> Upstream names two different curves "soft spring": the Tailwind plugin's `soft-spring`
> equals framer's `spring`. Diba disambiguates — `--easing-spring` is the plugin curve,
> `--easing-spring-soft` is framer's `softSpring`.

Durations: `0ms`, `250ms` (the default for every `transition-*` utility, all `ease`),
`400ms`. Named animations:

| Animation           | Timing                                             |
| ------------------- | -------------------------------------------------- |
| `appearance-in`     | 250ms ease-out (opacity 0→1, scale .95 → 1.05 → 1) |
| `appearance-out`    | 60ms ease-in (scale 1 → .85)                       |
| `spinner-spin`      | 800ms, ease or linear, infinite                    |
| `drip-expand`       | 420ms linear (ripple: scale 0→2, opacity .2→0)     |
| `sway`              | 750ms ease                                         |
| `fade-out`          | 1.2s linear (spinner bars, delay `-1.2s + 0.1s*i`) |
| `blink`             | 1.4s                                               |
| `indeterminate-bar` | 1.5s `cubic-bezier(0.65, 0.815, 0.735, 0.395)`     |
| `shimmer`           | 2s (skeleton)                                      |

Interaction scales: pressed **0.97**, overlay exit **0.85**, enter-from **0.95**,
overshoot **1.05**, popover trigger while open **0.97 @ opacity 0.7**.
Overlay variants: `scaleSpring` (enter spring 0.2s bounce 0, exit easeOut 0.15s) and
`scaleSpringOpacity` (enter spring 0.3s from scale 0.8, exit 0.15s to 0.96).

## 4. Z-index layers

`0` base · `10` raised (content, cursor, badge) · `20` docked · `30` navbar menu ·
`40` navbar · `50` modal/backdrop · `100` toast.

## 5. Component geometry

Sizes are `sm / md / lg` unless noted. All values verbatim from the `tv()` definitions.

### Button

|           | sm        | md          | lg                |
| --------- | --------- | ----------- | ----------------- |
| height    | 32        | 40          | 48                |
| padding-x | 12        | 16          | 24                |
| min-width | 64        | 80          | 96                |
| gap       | 8         | 8           | 12                |
| radius    | small (8) | medium (12) | large (14)        |
| icon-only | 32²       | 40²         | 48² (gap 0, px 0) |

Base: `data-[pressed]:scale-[0.97]`, `transition-transform-colors-opacity`,
`overflow-hidden`, `tap-highlight-transparent`, child SVG capped at 32px.
Hover on solid/faded/flat/bordered/shadow = `opacity-hover`; on light/ghost it's a
color wash instead. Variants: `solid · bordered · light · flat · faded · shadow · ghost`.

### Input / Select / Textarea

|                          | sm    | md     | lg    |
| ------------------------ | ----- | ------ | ----- |
| height                   | 32    | 40     | 48    |
| height (label inside)    | 48    | 56     | 64    |
| padding-x                | 8     | 12     | 12    |
| padding-y (label inside) | 6     | 8      | 10    |
| radius                   | small | medium | large |

Wrapper base `px-3 gap-3 shadow-xs`; start/end content adds 6px; helper block `p-1 gap-1.5`.
Variants: `flat · faded · bordered · underlined`. Underlined draws a 2px `after:` bar that
animates `w-0 → w-full` on focus. The floating label translates by
`-(50% + fontSize/2 - 8|6|4px)` per size.

### Card

Header / body / footer all `p-3` (12). Default **radius large, shadow medium**.
Pressable adds `scale-[0.97]`; blurred uses `backdrop-blur-md backdrop-saturate-150`.

### Modal

Header `px-6 py-4` · body `px-6 py-2 gap-3` · footer `px-6 py-4 gap-2`.
Base margin `1` → `6` (x) / `16` (y) at `sm:`. Default radius large, **shadow small**,
backdrop opaque (`overlay/50`); blur backdrop = `backdrop-blur-md saturate-150 overlay/30`.
Mobile enters by sliding (`--slide-exit: 80px`), desktop by scaling (`--scale-exit: 103%`).

### Popover / Tooltip

Content `px-2.5 py-1`; arrow is a 10px rotated square with 2px radius, offset
`spacing.5/4 - 1.5px` from the edge. Default radius large, shadow medium.
Popover backdrop blur is `backdrop-blur-sm` (4px in Tailwind v3 = **`blur-xs`** in v4).

### Menu / Listbox / Dropdown

List `p-1 gap-1`, items `gap-0.5`. Item `px-2 py-1.5 gap-2 rounded-small`, title `text-small`,
description `text-tiny`, selected icon 12², shortcut `px-1 py-0.5 border-small`.
Empty state `h-10 px-2 py-1.5`.

### Chip

|                   | sm  | md  | lg  |
| ----------------- | --- | --- | --- |
| height            | 24  | 28  | 32  |
| padding-x         | 4   | 4   | 8   |
| content padding-x | 4   | 8   | 8   |
| avatar            | 16  | 20  | 24  |

Dot variant: 8px circle. Same 7 variants as Button, plus `dot`.

### Tabs

|             | sm     | md     | lg     |
| ----------- | ------ | ------ | ------ |
| tab height  | 28     | 32     | 36     |
| tab radius  | small  | small  | medium |
| list radius | medium | medium | large  |

List `p-1 gap-2 bg-default-100`; tab `px-3 py-1`; panel `py-3 px-1`.
Cursor animates `left,top,width,height` over **250ms ease-out**; underlined cursor is a
2px bar at 80% width. Unselected hover drops to `opacity-disabled`; disabled tab is `opacity-30`.

### Switch

|       | sm      | md      | lg      |
| ----- | ------- | ------- | ------- |
| track | 40 × 24 | 48 × 28 | 56 × 32 |
| thumb | 16      | 20      | 24      |

Track `px-1 rounded-full`; thumb `rounded-full shadow-small`, travels by `ms-4/5/6`;
start/end content inset 6px.

### Checkbox / Radio

Box 16 / 20 / 24 for both. Checkbox radius is **derived**:
`calc(radius-medium × 0.5 | 0.6 | 0.7)`. Check icon 12×8, 16×12, 20×16.
Radio dot 6 / 8 / 10. Label gap 8.

### Others

- **Avatar** 32 / 40 / 56.
- **Spinner** 20 / 32 / 40, stroke 2 / 3 / 3, dots 4 / 6 / 8.
- **Pagination** item 32 / 36 / 40 square-ish (`min-w`, auto width), px 4 / 8 / 8.
- **Progress** track height 4 / 12 / 20.
- **Slider** thumb 20 / 24 / 28 with an inner dot 16 / 20 / 20; thumb radius
  `calc(radius-small / 2)`, inner `/ 3`.
- **Alert** `px-4 py-3 gap-x-1`, 36px round icon box, min-height 40.
- **Accordion** trigger `py-4 gap-3`, content `py-2` (compact: `py-2` / `py-1`).
- **Kbd** `px-1.5 py-0.5 rounded-small shadow-small`.
- **Snippet** `px-1.5 py-0.5` / `px-3 py-1.5` / `px-4 py-2`.
- **Divider** 1px, via `h-divider` / `w-divider`.

---

## 6. Where each value now lives in Diba

| Upstream v2                      | Diba token                                         | CSS var                                               |
| -------------------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| `radius.small/medium/large`      | `radius.sm/md/lg`                                  | `--radius-sm` …                                       |
| `borderWidth.small/medium/large` | `border-width.sm/md/lg`                            | `--border-width-sm` …                                 |
| `dividerWeight`                  | `divider.weight`                                   | `--divider-weight`                                    |
| outline-2 / offset-2             | `focus.width`, `focus.offset`                      | `--focus-width`, `--focus-offset`                     |
| `disabledOpacity`                | `opacity.disabled`                                 | `--opacity-disabled`                                  |
| `hoverOpacity` (light/dark)      | `hover.opacity` _(dual-mode)_                      | `--hover-opacity`                                     |
| `boxShadow.*` (light/dark)       | `shadow.sm/md/lg` _(dual-mode)_ + `shadow.xs`      | `--shadow-*`                                          |
| `TRANSITION_EASINGS`             | `easing.*`                                         | `--easing-*`, Tailwind `ease-*`                       |
| 250ms / 400ms / enter / exit     | `duration.*`                                       | `--duration-*`                                        |
| keyframe durations               | `anim.*`                                           | `--anim-*`                                            |
| pressed 0.97, exit 0.85, …       | `scale.*`                                          | `--scale-*`                                           |
| `z-10 … z-[100]`                 | `z.*`                                              | `--z-raised` … `--z-toast`                            |
| `backdrop-blur-sm/md`            | `blur.xs/sm/md`                                    | `--blur-*`                                            |
| per-size component geometry      | `component/control.json`, `component/surface.json` | `--control-*`, `--field-*`, `--chip-*`, `--card-*`, … |

Radius moved from Diba's old `6 / 10 / 14` to upstream's **`8 / 12 / 14`**; `xl` (20) and
`2xl` (28) are Diba extras for hero surfaces and have no upstream equivalent.
The space scale gained `0.5 · 1.5 · 2.5 · 3.5 · 7 · 9 · 11 · 14` — steps upstream's
components actually use.

## 7. Still open

- **Line-height pairing.** Upstream pairs each font size with a line height
  (`0.875rem → 1.25rem`). Diba's `leading.*` is a separate unitless ramp. Left alone
  because type was out of scope — worth revisiting when Text lands.
- **Border-width and duration utilities.** Tailwind v4 has no `--border-width-*` or
  `--duration-*` theme namespace, so those tokens are CSS vars only. The component
  layer will need thin custom utilities
  (`.border-md { border-width: var(--border-width-md) }`).
- **Variant taxonomy.** Upstream's 7 surface variants
  (`solid · bordered · light · flat · faded · shadow · ghost`) are a color-layer decision,
  not a token. Which subset Diba ships is a step-2 call.
