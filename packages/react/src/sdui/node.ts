import type { ComponentType, ReactNode } from 'react'

/**
 * A handler bound to the surface's dispatcher.
 *
 * It returns a promise so a block can wait for a `call` — AlertDialog keeps
 * its confirm button pending until the host answers. It resolves false
 * when a `call` in the event's list failed and stopped it.
 */
export type Fire = (value?: unknown) => Promise<boolean>

/**
 * A child node as data, already through the same allowlist and guards as a
 * node that is drawn.
 *
 * The groups — a Select's options, a Table's rows, an AvatarGroup's avatars —
 * read their children rather than place them. Reading the raw tree would skip
 * the manifest and the URL checks; an Avatar's `src` read raw is a URL nobody
 * looked at.
 */
export interface Item {
  type: string
  /** Manifest-declared props only, guards applied, schema defaults filled in. */
  props: Record<string, unknown>
  /** The props the tree itself set, before defaults: a group fills in only these. */
  given: Set<string>
  text?: string
  /** Its own children, the same way. */
  items: Item[]
  /** The node as the registry draws it, for a parent that places it after all. */
  element: ReactNode
  /** Where it sits in the tree, the key its local value is kept under. */
  path: string
}

/** The Form a node sits inside, for Button's `type` submit and reset. */
export interface FormHooks {
  /** Runs the client checks, then the Form's onSubmit. */
  submit: () => Promise<void>
  /** Restores every field inside the Form to its default. */
  reset: () => void
}

/** Everything a block is handed for one node. */
export interface NodeContext {
  type: string
  path: string
  /** Manifest-declared props only, guards applied, schema defaults filled in. */
  props: Record<string, unknown>
  /** The props the tree itself set, before defaults. */
  given: Set<string>
  text?: string
  items: Item[]
  /** The children, drawn. */
  children: ReactNode[]
  /** Each declared slot, drawn. */
  slots: Record<string, ReactNode>
  /** The declared events that carry an action. */
  on: Record<string, Fire>
  /** Fire an event without recording anything. */
  fire: (event: string, value?: unknown) => Promise<boolean>
  /** The node's main value, by [valuePair]: pinned, else local, else default. */
  current: unknown
  /** Whether the main value's pinned prop is set. */
  pinned: boolean
  /** A value kept for this node, or `undefined`; [facet] names a second one. */
  local: (facet?: string) => unknown
  /** Records a value for this node and fires [event] with it. */
  setValue: (event: string, value: unknown, facet?: string) => Promise<boolean>
  /** Tell the host something was refused, prefixed with the node's type. */
  refuse: (reason: string) => void
  /** The client check's message, once its Form has failed a submit. */
  clientError: string | null
  /** The Form this node is inside, or null. */
  form: FormHooks | null
  /** Registers an open overlay with the surface, so `close` can find it. */
  overlay: (close: () => void) => () => void
}

export type Block = ComponentType<{ node: NodeContext }>

/**
 * Which props make up a block's value pair: the pinned form and the default.
 *
 * One table for both the blocks and a Form's payload, so what a field shows
 * and what it submits cannot drift apart. The Flutter renderer's
 * `dibaValuePair` is the same table.
 */
export function valuePair(
  type: string,
  props: Record<string, unknown>,
): { pinned: string; fallback: string } | null {
  switch (type) {
    case 'TextField':
    case 'TextArea':
    case 'SearchField':
    case 'NumberField':
    case 'DateField':
    case 'InputOTP':
    case 'ColorSwatchPicker':
    case 'DateRangePicker':
    case 'TimeField':
    case 'Calendar':
    case 'RangeCalendar':
    case 'Slider':
    case 'RadioGroup':
    case 'CheckboxGroup':
      return { pinned: 'value', fallback: 'defaultValue' }
    case 'Checkbox':
    case 'Switch':
      return { pinned: 'isSelected', fallback: 'defaultSelected' }
    case 'Select':
      return props.selectionMode === 'multiple'
        ? { pinned: 'selectedKeys', fallback: 'defaultSelectedKeys' }
        : { pinned: 'selectedKey', fallback: 'defaultSelectedKey' }
    case 'ComboBox':
    case 'Tabs':
      return { pinned: 'selectedKey', fallback: 'defaultSelectedKey' }
    case 'Accordion':
      return { pinned: 'expandedKeys', fallback: 'defaultExpandedKeys' }
    case 'Pagination':
      return { pinned: 'page', fallback: 'defaultPage' }
    case 'ListBox':
    case 'TagGroup':
    case 'ToggleButtonGroup':
    case 'Dropdown':
    case 'Menu':
    case 'Table':
      return { pinned: 'selectedKeys', fallback: 'defaultSelectedKeys' }
    default:
      return null
  }
}

/**
 * Values that may be recorded and later sent to the extension.
 *
 * Handlers hand back whatever they like — a PressEvent, a Set of keys, a
 * CalendarDate. Storing those as-is would mean posting a live DOM object's
 * enumerable properties to a third-party server the next time an action names
 * that key, which is a data leak dressed as a convenience.
 */
export function serialisable(value: unknown): unknown {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (value instanceof Set) return [...value].map(String)
  if (Array.isArray(value)) return value.map((v) => serialisable(v))
  if (typeof value === 'object' && value.constructor === Object) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, serialisable(v)]),
    )
  }
  return null
}
