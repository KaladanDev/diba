import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { manifest, type ComponentManifest, type PropSpec } from '@kaladan/diba-schema'
import * as recipes from './styles/recipes'
import { DibaProvider } from './provider/DibaProvider'
import { Button } from './components/button'
import { draft3Blocks } from './sdui/registry'
import { valuePair, type Item, type NodeContext } from './sdui/node'
import { placementOf } from './sdui/blocks/common'
import { snippetOptions } from './components/snippet/Snippet'
import { imageOptions } from './components/image/Image'
import { ownScales } from './sdui/blocks/own'

/**
 * Holds the language-neutral manifest (diba-schema) and the React side to
 * each other, so a change to either that forgets the other fails here.
 *
 * Draft 3's blocks draw the copied components through an adapter,
 * so the checks are against what the copy can render (the schema surface's
 * contract section): every schema value exists in the implementation, every
 * `fixed` value is valid there, and every schema prop is taken by its block.
 */

const norm = (values: ReadonlyArray<string | number>) => [...values.map(String)].sort()
const components = manifest.components as Record<string, ComponentManifest>
const typesOf = (p: PropSpec) => (Array.isArray(p.type) ? p.type : [p.type])

type Recipe = { variants?: Record<string, Record<string, unknown>> }
const recipe = (name: string, variant: string): string[] => {
  const variants = (recipes as unknown as Record<string, Recipe>)[name]?.variants?.[variant]
  if (!variants) throw new Error(`${name} has no variant "${variant}"`)
  return Object.keys(variants)
}

/** A draft-3 enum drawn by one of the copy's style recipes: its values are the recipe's keys. */
const BY_RECIPE: Record<string, [string, string]> = {
  'Button.variant': ['buttonVariants', 'variant'],
  'Button.size': ['buttonVariants', 'size'],
  'LinkButton.variant': ['buttonVariants', 'variant'],
  'LinkButton.size': ['buttonVariants', 'size'],
  'ToggleButtonGroup.size': ['toggleButtonVariants', 'size'],
  'ToggleButtonGroup.orientation': ['toggleButtonGroupVariants', 'orientation'],
  'TextField.variant': ['inputVariants', 'variant'],
  'TextArea.variant': ['textAreaVariants', 'variant'],
  'SearchField.variant': ['searchFieldVariants', 'variant'],
  'NumberField.variant': ['numberFieldVariants', 'variant'],
  'DateField.variant': ['dateInputGroupVariants', 'variant'],
  'DateRangePicker.variant': ['dateInputGroupVariants', 'variant'],
  'TimeField.variant': ['dateInputGroupVariants', 'variant'],
  'Select.variant': ['selectVariants', 'variant'],
  'ComboBox.variant': ['inputVariants', 'variant'],
  'ListBoxItem.variant': ['listboxItemVariants', 'variant'],
  'DropdownItem.variant': ['menuItemVariants', 'variant'],
  'Checkbox.variant': ['checkboxVariants', 'variant'],
  'CheckboxGroup.variant': ['checkboxGroupVariants', 'variant'],
  'RadioGroup.variant': ['radioGroupVariants', 'variant'],
  'Switch.size': ['switchVariants', 'size'],
  'Alert.status': ['alertVariants', 'status'],
  'Chip.variant': ['chipVariants', 'variant'],
  'Chip.color': ['chipVariants', 'color'],
  'Chip.size': ['chipVariants', 'size'],
  'TagGroup.size': ['tagVariants', 'size'],
  'TagGroup.variant': ['tagVariants', 'variant'],
  'Spinner.size': ['spinnerVariants', 'size'],
  'Spinner.color': ['spinnerVariants', 'color'],
  'ProgressBar.color': ['progressBarVariants', 'color'],
  'ProgressBar.size': ['progressBarVariants', 'size'],
  'Avatar.size': ['avatarVariants', 'size'],
  'Avatar.color': ['avatarVariants', 'color'],
  'Avatar.variant': ['avatarVariants', 'variant'],
  'AvatarGroup.size': ['avatarVariants', 'size'],
  'AvatarGroup.color': ['avatarVariants', 'color'],
  'AvatarGroup.variant': ['avatarVariants', 'variant'],
  'AvatarGroup.overlap': ['avatarGroupVariants', 'overlap'],
  'Card.variant': ['cardVariants', 'variant'],
  'Table.variant': ['tableVariants', 'variant'],
  'Modal.size': ['modalVariants', 'size'],
  'Modal.scroll': ['modalVariants', 'scroll'],
  'Modal.backdrop': ['modalVariants', 'variant'],
  'AlertDialog.size': ['alertDialogVariants', 'size'],
  'AlertDialog.status': ['alertDialogVariants', 'status'],
  'AlertDialog.backdrop': ['alertDialogVariants', 'variant'],
  'Tabs.variant': ['tabsVariants', 'variant'],
  'Accordion.variant': ['accordionVariants', 'variant'],
  'Separator.orientation': ['separatorVariants', 'orientation'],
  'Separator.variant': ['separatorVariants', 'variant'],
  'Drawer.backdrop': ['drawerVariants', 'variant'],
  'SwitchGroup.orientation': ['switchGroupVariants', 'orientation'],
  'Toolbar.orientation': ['toolbarVariants', 'orientation'],
  'Sheet.backdrop': ['sheetVariants', 'backdrop'],
  'Badge.color': ['badgeVariants', 'color'],
  'Badge.variant': ['badgeVariants', 'variant'],
  'Badge.size': ['badgeVariants', 'size'],
  'ProgressCircle.color': ['progressCircleVariants', 'color'],
  'ProgressCircle.size': ['progressCircleVariants', 'size'],
  'Meter.color': ['meterVariants', 'color'],
  'Meter.size': ['meterVariants', 'size'],
  'InputOTP.variant': ['inputOTPVariants', 'variant'],
  'ButtonGroup.orientation': ['buttonGroupVariants', 'orientation'],
  'ButtonGroup.size': ['buttonVariants', 'size'],
  'ButtonGroup.variant': ['buttonVariants', 'variant'],
  'Pagination.size': ['paginationVariants', 'size'],
  'ColorSwatchPicker.variant': ['colorSwatchPickerVariants', 'variant'],
  'ColorSwatchPicker.size': ['colorSwatchPickerVariants', 'size'],
  'ColorSwatchPicker.layout': ['colorSwatchPickerVariants', 'layout'],
}

/** React Aria's placements, which the schema's are mapped onto. */
const PLACEMENTS = [
  'bottom',
  'bottom left',
  'bottom right',
  'bottom start',
  'bottom end',
  'top',
  'top left',
  'top right',
  'top start',
  'top end',
  'left',
  'left top',
  'left bottom',
  'start',
  'start top',
  'start bottom',
  'right',
  'right top',
  'right bottom',
  'end',
  'end top',
  'end bottom',
]
const SELECTION = ['none', 'single', 'multiple']
const FORMAT = ['decimal', 'percent', 'currency']

/** A draft-3 enum drawn by React Aria or the DOM rather than a recipe: its values are theirs. */
const BY_PLATFORM: Record<string, ReadonlyArray<string | number>> = {
  'Button.iconPlacement': ['start', 'end'],
  'Button.type': ['button', 'submit', 'reset'],
  'LinkButton.iconPlacement': ['start', 'end'],
  'ToggleButtonGroup.selectionMode': SELECTION,
  'TextField.type': ['text', 'email', 'tel', 'url', 'password', 'search'],
  'TextField.inputMode': ['none', 'text', 'decimal', 'numeric', 'tel', 'search', 'email', 'url'],
  'TextField.dir': ['auto', 'ltr', 'rtl'],
  'TextField.autoComplete': [
    'name',
    'email',
    'tel',
    'tel-national',
    'street-address',
    'postal-code',
    'organization',
    'one-time-code',
    'new-password',
    'current-password',
    'off',
  ],
  'TextField.autoCapitalize': ['none', 'off', 'on', 'sentences', 'words', 'characters'],
  'TextArea.dir': ['auto', 'ltr', 'rtl'],
  'TextArea.autoCapitalize': ['none', 'off', 'on', 'sentences', 'words', 'characters'],
  'NumberField.formatStyle': FORMAT,
  'DateField.granularity': ['day', 'hour', 'minute', 'second'],
  'DateField.hourCycle': [12, 24],
  // auto keeps the reader's calendar; the others name a Unicode calendar.
  'DateField.calendarSystem': ['auto', 'persian', 'gregorian'],
  'Calendar.calendarSystem': ['auto', 'persian', 'gregorian'],
  'RangeCalendar.calendarSystem': ['auto', 'persian', 'gregorian'],
  'DateRangePicker.granularity': ['day', 'hour', 'minute', 'second'],
  'DateRangePicker.hourCycle': [12, 24],
  'DateRangePicker.calendarSystem': ['auto', 'persian', 'gregorian'],
  'TimeField.granularity': ['hour', 'minute', 'second'],
  'TimeField.hourCycle': [12, 24],
  'Select.selectionMode': SELECTION,
  'ComboBox.menuTrigger': ['input', 'focus', 'manual'],
  'ListBox.selectionMode': SELECTION,
  'Dropdown.selectionMode': SELECTION,
  'CheckboxGroup.orientation': ['horizontal', 'vertical'],
  'RadioGroup.orientation': ['horizontal', 'vertical'],
  'Slider.formatStyle': FORMAT,
  'TagGroup.selectionMode': SELECTION,
  'ProgressBar.formatStyle': FORMAT,
  'Table.selectionMode': SELECTION,
  'Table.sortDirection': ['ascending', 'descending'],
  'Table.defaultSortDirection': ['ascending', 'descending'],
  'Column.align': ['start', 'center', 'end'],
  'Modal.placement': ['auto', 'top', 'center', 'bottom'],
  // Start and end are mapped onto the page's left and right.
  'Drawer.placement': ['bottom', 'top', 'start', 'end'],
  // Start and end are mapped to the page's edges, the others passed.
  'Sheet.placement': ['bottom', 'top', 'start', 'end'],
  'Menu.selectionMode': SELECTION,
  // Turned onto the copy's left and right by the page's direction.
  'Badge.placement': ['top-end', 'top-start', 'bottom-end', 'bottom-start'],
  'Meter.formatStyle': FORMAT,
}

/**
 * A draft-3 enum Diba's theme draws by a data attribute: every value but the default has
 * its own rule in the theme's stylesheet.
 */
const BY_THEME: Record<string, [attribute: string, fallback: string]> = {
  'Avatar.presence': ['data-presence', 'online'],
}
// Vitest runs from packages/react.
const dibaTheme = readFileSync('src/styles/themes/diba/components.css', 'utf8')

const keys = (o: object) => Object.keys(o)

/** Group 7's enums: drawn by the blocks' own scales, or by Diba's own components. */
const BY_OWN: Record<string, ReadonlyArray<string | number>> = {
  'Stack.direction': ['vertical', 'horizontal'],
  'Stack.align': keys(ownScales.ALIGN),
  'Stack.justify': keys(ownScales.JUSTIFY),
  'Text.size': keys(ownScales.SIZE),
  'Text.weight': keys(ownScales.WEIGHT),
  'Text.tone': keys(ownScales.TONE),
  'Text.align': ['start', 'center', 'end'],
  'Text.leading': keys(ownScales.LEADING),
  'Text.dir': ['auto', 'ltr'],
  'Text.formatStyle': FORMAT,
  'Image.fit': imageOptions.fit,
  'Image.radius': imageOptions.radius,
  'Spacer.axis': ['block', 'inline'],
  'Snippet.size': snippetOptions.size,
  'Snippet.variant': snippetOptions.variant,
}

/** Placements are mapped, not passed: what reaches React Aria is checked. */
const BY_MAPPING: Record<string, (value: string | number) => unknown> = {
  'Dropdown.placement': placementOf,
  'Popover.placement': placementOf,
  'Tooltip.placement': placementOf,
}

const draft3 = Object.keys(draft3Blocks)

describe('every schema value exists in the copy', () => {
  for (const name of draft3) {
    for (const [prop, spec] of Object.entries(components[name]?.props ?? {})) {
      if (!typesOf(spec).includes('enum')) continue
      const key = `${name}.${prop}`
      it(key, () => {
        const values = spec.values ?? []
        if (BY_RECIPE[key]) {
          const [r, v] = BY_RECIPE[key]
          const known = recipe(r, v)
          for (const value of values) expect(known, `${key}: ${value}`).toContain(String(value))
        } else if (BY_PLATFORM[key]) {
          for (const value of values) expect(BY_PLATFORM[key], `${key}: ${value}`).toContain(value)
        } else if (BY_MAPPING[key]) {
          for (const value of values) expect(PLACEMENTS).toContain(BY_MAPPING[key](value))
        } else if (BY_OWN[key]) {
          for (const value of values) expect(BY_OWN[key], `${key}: ${value}`).toContain(value)
        } else if (BY_THEME[key]) {
          const [attribute, fallback] = BY_THEME[key]
          for (const value of values) {
            if (value !== fallback) expect(dibaTheme).toContain(`[${attribute}='${value}']`)
          }
        } else {
          throw new Error(`${key} is an enum with nothing to check it against`)
        }
      })
    }
  }
})

describe('every fixed value is valid in the copy', () => {
  it('names exactly the fixed parts the spec lists', () => {
    const fixed = Object.entries(components).flatMap(([name, c]) =>
      Object.entries(c.fixed ?? {}).map(([key, f]) => `${name}.${key}=${String(f.value)}`),
    )
    expect(fixed.sort()).toEqual([
      'Drawer.closeButton=true',
      'Form.validationBehavior=aria',
      'Modal.closeButton=true',
      'SearchField.clearButton=true',
      'SearchField.searchIcon=true',
      'Sheet.closeButton=true',
      'Sheet.handle=true',
    ])
  })

  it("Form's validation is one React Aria has", () => {
    expect(['aria', 'native']).toContain(components.Form?.fixed?.validationBehavior?.value)
  })
})

// ---- every schema prop is taken by its block ---------------------------------

/** A value of the prop's type, enough for a block to draw with. */
function sample(name: string, prop: string, spec: PropSpec): unknown {
  const type = typesOf(spec)[0]
  if (spec.format === 'url') return '/x'
  if (spec.format === 'image-url') return '/x.png'
  if (prop === 'unavailableDates') return ['2026-01-02']
  if (name === 'TimeField' && /value|Value/.test(prop)) return '14:30'
  if (/Date|Calendar/.test(name) && /value|Value/.test(prop)) {
    return typeof spec.type === 'string' && spec.type === 'string[]'
      ? ['2026-01-01', '2026-01-05']
      : '2026-01-01'
  }
  if (prop === 'currency') return 'USD'
  switch (type) {
    case 'enum':
      return spec.values?.[0]
    case 'boolean':
      return true
    case 'number':
      return 1
    case 'string[]':
      return ['a']
    case '[number, number]':
      return [1, 2]
    case 'token':
      return spec.token === 'icon' ? 'plus' : spec.token === 'space' ? 4 : 'x'
    default:
      return prop === 'id' ? 'a' : 'x'
  }
}

/** Every prop set, each read recorded in [read]. */
function recorded(name: string, read: Set<string>, path: string) {
  const values: Record<string, unknown> = {}
  for (const [prop, spec] of Object.entries(components[name]?.props ?? {})) {
    values[prop] = sample(name, prop, spec)
  }
  // Keys are unique in a collection.
  if ('id' in values) values.id = path
  // A Slider's pair is only a pair under isRange.
  if (name === 'Slider') values.defaultValue = values.value = [1, 2]
  return new Proxy(values, {
    get(target, key) {
      if (typeof key === 'string') read.add(key)
      return target[key as string]
    },
  })
}

/** Which children each parent draws, and the child types inside those. */
const NESTED: Record<string, string[]> = {
  ToggleButtonGroup: ['ToggleButton'],
  Select: ['ListBoxItem', 'ListBoxSection'],
  ComboBox: ['ListBoxItem'],
  ListBox: ['ListBoxItem', 'ListBoxSection'],
  ListBoxSection: ['ListBoxItem'],
  Dropdown: ['DropdownItem', 'DropdownSection'],
  DropdownSection: ['DropdownItem'],
  CheckboxGroup: ['Checkbox'],
  RadioGroup: ['Radio'],
  TagGroup: ['Tag'],
  AvatarGroup: ['Avatar'],
  Table: ['TableHeader', 'TableBody', 'TableFooter'],
  TableHeader: ['Column'],
  TableBody: ['Row'],
  TableFooter: ['Row'],
  Row: ['Cell'],
  Tabs: ['Tab'],
  ButtonGroup: ['Button'],
  Accordion: ['AccordionItem'],
  Breadcrumbs: ['BreadcrumbsItem'],
  Menu: ['DropdownItem', 'DropdownSection'],
}

function itemOf(type: string, reads: Map<string, Set<string>>, path: string): Item {
  if (!reads.has(type)) reads.set(type, new Set())
  const props = recorded(type, reads.get(type)!, path)
  return {
    type,
    props,
    given: new Set(Object.keys(components[type]?.props ?? {})),
    text: 'x',
    items: (NESTED[type] ?? []).map((child, i) => itemOf(child, reads, `${path}.${i}`)),
    element: null,
    path,
  }
}

function contextFor(name: string, reads: Map<string, Set<string>>): NodeContext {
  const own = itemOf(name, reads, 'root')
  const spec = components[name]!
  const on = Object.fromEntries(
    Object.keys(spec.actions ?? {}).map((event) => [event, async () => true]),
  )
  const slots = Object.fromEntries(
    Object.keys(spec.slots ?? {}).map((slot) => [slot, createElement(Button, null, 'x')]),
  )
  return {
    type: name,
    path: 'root',
    props: own.props,
    given: own.given,
    text: 'x',
    items: own.items,
    children: [],
    slots,
    on,
    fire: async () => true,
    current: undefined,
    pinned: false,
    local: () => undefined,
    setValue: async () => true,
    refuse: () => {},
    clientError: null,
    form: null,
    overlay: () => () => {},
  }
}

/**
 * Props the surface takes for the block: the value pair (the surface works out
 * the value a block shows, from the pinned and the default form).
 */
function takenBySurface(name: string): string[] {
  const pairs = [valuePair(name, {}), valuePair(name, { selectionMode: 'multiple' })]
  const taken = pairs.flatMap((pair) => (pair ? [pair.pinned, pair.fallback] : []))
  // A value's name is what a Form's payload calls it.
  return taken.length ? [...taken, 'name'] : taken
}

describe('every schema prop is taken by its block', () => {
  const reads = new Map<string, Set<string>>()
  const drawn = draft3.filter((name) => {
    // The blocks that draw nothing themselves are drawn by their parent.
    const parents = Object.entries(NESTED).filter(([, kids]) => kids.includes(name))
    return parents.length === 0 || ['Avatar', 'Checkbox', 'Button'].includes(name)
  })

  for (const name of drawn) {
    it(`${name} draws with every prop set`, () => {
      const Block = draft3Blocks[name]!
      render(
        createElement(DibaProvider, {
          ownsDocument: false,
          children: createElement(Block, { node: contextFor(name, reads) }),
        }),
      )
    })
  }

  for (const name of draft3) {
    it(`${name}: every prop is read`, () => {
      const read = new Set([...(reads.get(name) ?? []), ...takenBySurface(name)])
      const unread = Object.keys(components[name]?.props ?? {}).filter((prop) => !read.has(prop))
      expect(unread, `${name} has props its block never reads`).toEqual([])
    })
  }
})
