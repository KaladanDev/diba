/**
 * The shape of a Diba component manifest entry. This is the language-neutral
 * contract: one entry per component describes its props, slots/children, and
 * declared actions. Codegen turns these into TS prop types, a JSON Schema that
 * validates SDUI documents, and the Flutter renderer's allowlists.
 */

/**
 * What a prop holds. `string[]` and `[number, number]` are for
 * `selectedKeys` and a range Slider. There is no
 * object type; sorting is two flat props instead.
 */
export type PropType =
  'string' | 'number' | 'boolean' | 'enum' | 'node' | 'token' | 'string[]' | '[number, number]'

export type ComponentCategory =
  | 'primitive'
  | 'layout'
  | 'controls'
  | 'form'
  | 'data'
  | 'content'
  | 'feedback'
  | 'navigation'
  | 'commerce'

/**
 * A string prop that carries a URL, and the rule it is held to:
 * `url` passes `isSafeUrl`; `image-url` is http(s), relative or `data:image`.
 * Every other string is plain text and is not checked by value.
 */
export type PropFormat = 'url' | 'image-url'

export interface PropSpec {
  /** One type, or a list when the prop takes either: a Slider's number or pair. */
  type: PropType | PropType[]
  description?: string
  /** Required in the contract (no default; must be supplied). */
  required?: boolean
  /** Human-facing text that must be localizable. */
  i18n?: boolean
  default?: string | number | boolean
  /** Allowed values when `type` is `enum` (strings or numbers). */
  values?: Array<string | number>
  /** Token family when `type` is `token`: `space`, `color`, or `icon` (a name from the icon list). */
  token?: string
  /** Set on a string that carries a URL. */
  format?: PropFormat
}

export interface SlotSpec {
  description?: string
  /** Component names this slot accepts, or `*` for any Diba node. */
  accepts: string[] | '*'
}

export interface ActionSpec {
  description?: string
  /** Name of the payload type handed to the action handler. */
  payload?: string
}

export interface ChildrenSpec {
  description?: string
  /** `*` = any Diba node(s); `text` = a plain (localizable) string; or a list of component names. */
  accepts: '*' | 'text' | string[]
  /** A plain string is accepted in place of the nodes: a Table cell holds text or blocks. */
  text?: boolean
}

/**
 * What a block always renders with and a tree cannot set, such as
 * SearchField's search icon. Opening one later means moving it into `props`.
 */
export interface FixedSpec {
  value: string | number | boolean
  description?: string
}

export interface ComponentManifest {
  name: string
  category: ComponentCategory
  description?: string
  /** Whether this component can render in the SDUI tier (data-only, no web-isms). */
  sduiSafe: boolean
  props?: Record<string, PropSpec>
  children?: ChildrenSpec
  slots?: Record<string, SlotSpec>
  actions?: Record<string, ActionSpec>
  fixed?: Record<string, FixedSpec>
}

/** One entry of the icon list. */
export interface IconSpec {
  /** Lucide's kebab-case name, as for left-to-right. */
  name: string
  /** Turns to face the other way under right-to-left: `arrow-right` means "next". */
  mirrored?: boolean
}
