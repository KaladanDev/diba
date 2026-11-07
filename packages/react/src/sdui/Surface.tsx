import {
  cloneElement,
  createElement,
  useReducer,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react'
import { useLocale } from 'react-aria-components'
import { manifest, type DibaAction, type DibaNode } from '@kaladan/diba-schema'
import { toast as dibaToast } from '../components/toast'
import { registry } from './registry'
import { checkTree, isSafeImageUrl, isSafeUrl, type TreeLimits } from './guards'
import { graphemes } from '../utils/rules'
import { EMAIL, WEB_URL, sayer, type Say } from './messages'
import {
  serialisable,
  valuePair,
  type Fire,
  type FormHooks,
  type Item,
  type NodeContext,
} from './node'

/** The statuses a toast may carry, the colour words of the contract. */
const STATUSES = new Set(['default', 'accent', 'success', 'warning', 'danger'])

/** A toast an action asked for, for a host that draws its own. */
export interface DibaToast {
  status: 'default' | 'accent' | 'success' | 'warning' | 'danger'
  title?: string
  description?: string
  /** An "Undo": its label, and what pressing it runs. */
  actionLabel?: string
  onAction?: () => void
}

/**
 * The host's side of the contract.
 *
 * Routing, the host's own destinations, talking to the extension's server and
 * toasts are capabilities only the host has. `setState` and `close` never
 * leave this component.
 */
export interface DibaSurfaceHandlers {
  /**
   * A `call` reached the host. `payload` holds only the state keys the action
   * named in `with`, a Form's named fields when a Form submitted, and the
   * event's own value under the action's `value` key when it names one —
   * nothing else, since this is on its way to a third party.
   *
   * Return a promise to say when it is done: AlertDialog keeps its confirm
   * button pending until then. Reject it to say the call failed, which stops
   * the rest of the event's list. To respond with new UI, hand this component a
   * new `tree`.
   */
  call?: (action: string, payload: Record<string, unknown>) => unknown
  /** A `navigate`. The URL has already been checked; a refused scheme never gets here. */
  navigate?: (to: string) => void
  /** An `open`: one of the host's own destinations, by a name it recognises. */
  open?: (target: string) => void
  /** A `toast`. Without one, Diba's own toast, which needs a ToastProvider on the page. */
  toast?: (toast: DibaToast) => void
}

export interface DibaSurfaceProps {
  /** The tree to render. Validate it against the generated JSON Schema first. */
  tree: DibaNode
  handlers?: DibaSurfaceHandlers
  limits?: TreeLimits
  /**
   * Something in the tree was refused. Called with a reason, for every drop —
   * an unknown component, an undeclared prop, a URL that would not pass.
   *
   * Worth wiring to real logging. A tree that renders with half its buttons
   * missing looks to a merchant exactly like a broken extension, and the author
   * has no way to find out otherwise.
   */
  onRefuse?: (reason: string) => void
}

/** What a Form's onSubmit hands its action: the named fields, nothing else. */
export class DibaFormValues {
  constructor(readonly values: Record<string, unknown>) {}
}

type Raw = Record<string, unknown>
const isObject = (v: unknown): v is Raw => v !== null && typeof v === 'object' && !Array.isArray(v)

/** An event's steps: one action, or an ordered list. */
const stepsOf = (action: unknown): DibaAction[] =>
  (Array.isArray(action) ? action : [action]).filter(isObject) as unknown as DibaAction[]

const isEmpty = (v: unknown) =>
  v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)

/**
 * The client checks a Form runs before its onSubmit fires:
 * isRequired, minLength, maxLength, type email and url, and number ranges, in
 * Diba's own words.
 */
function checkField(type: string, p: Raw, value: unknown, say: Say, n: (v: number) => string) {
  const required = p.isRequired === true
  switch (type) {
    case 'TextField':
    case 'TextArea':
    case 'SearchField': {
      const text = typeof value === 'string' ? value : ''
      if (text === '') return required ? say('required') : null
      if (typeof p.minLength === 'number' && graphemes(text) < p.minLength)
        return say('tooShort', n(p.minLength))
      if (typeof p.maxLength === 'number' && graphemes(text) > p.maxLength)
        return say('tooLong', n(p.maxLength))
      if (p.type === 'email' && !EMAIL.test(text)) return say('invalidEmail')
      if (p.type === 'url' && !WEB_URL.test(text)) return say('invalidUrl')
      return null
    }
    case 'NumberField': {
      if (typeof value !== 'number' || Number.isNaN(value)) return required ? say('required') : null
      if (typeof p.minValue === 'number' && value < p.minValue) return say('atLeast', n(p.minValue))
      if (typeof p.maxValue === 'number' && value > p.maxValue) return say('atMost', n(p.maxValue))
      return null
    }
    case 'Checkbox':
      return required && value !== true ? say('required') : null
    case 'CheckboxGroup':
      return required && isEmpty(value) ? say('chooseOne') : null
    case 'DateField':
    case 'Select':
    case 'ComboBox':
    case 'RadioGroup':
      return required && isEmpty(value) ? say('required') : null
    default:
      return null
  }
}

/** Whether a component has a client check at all. */
const CHECKED = new Set([
  'TextField',
  'TextArea',
  'SearchField',
  'NumberField',
  'Checkbox',
  'CheckboxGroup',
  'DateField',
  'Select',
  'ComboBox',
  'RadioGroup',
])

/**
 * Renders a tree the host did not write.
 *
 * Every decision here is "what does this refuse", because the component set is
 * already trusted — the tree names components, it does not carry them. What is
 * left to get wrong is forwarding something the manifest never promised:
 * a prop that repositions a node over the host's chrome, an event the component
 * does not declare, a `javascript:` URL in a link.
 *
 * The counterpart of `DibaSurface` in the Flutter renderer, and deliberately
 * the same shape: the same allowlists from the same generated manifest, the
 * same guards in the same order, the same verbs, the same value pairs.
 */
export function DibaSurface({ tree, handlers, limits, onRefuse }: DibaSurfaceProps) {
  const { locale } = useLocale()
  const say = sayer(locale)
  const n = (v: number) => new Intl.NumberFormat(locale).format(v)

  /*
   * The surface's state lives in a ref and a render is asked for after each
   * change. A list of actions reads what the step before it wrote — "record
   * the choice, then send it" — within one event, before React has rendered.
   */
  const store = useRef({
    /** `setState`'s keys: what a `call` may send when it names them. */
    named: {} as Raw,
    /** Each node's own value, by its path in the tree. */
    byNode: {} as Raw,
    /** Each Form's state, by its path. */
    forms: {} as Record<string, { submitted: boolean; generation: number }>,
  })
  const [, rerender] = useReducer((x: number) => x + 1, 0)

  const latest = useRef({ tree, handlers, onRefuse, say })
  latest.current = { tree, handlers, onRefuse, say }

  /** Open overlays this tree opened, innermost last, for `close`. */
  const overlays = useRef<Array<() => void>>([])

  /** Render-time refusals, once per tree: a re-render is not a new mistake. */
  const reported = useRef({ tree: null as unknown, reasons: new Set<string>() })
  if (reported.current.tree !== tree) reported.current = { tree, reasons: new Set() }
  const refuseOnce = (reason: string) => {
    if (reported.current.reasons.has(reason)) return
    reported.current.reasons.add(reason)
    onRefuse?.(reason)
  }
  const refuse = (reason: string) => latest.current.onRefuse?.(reason)

  // ---- the verbs ------------------------------------------------------------

  const run = async (steps: DibaAction[], value: unknown): Promise<boolean> => {
    for (const step of steps) {
      if (!(await dispatch(step, value))) return false
    }
    return true
  }

  const dispatch = async (action: DibaAction, value: unknown): Promise<boolean> => {
    const host = latest.current.handlers
    switch (action.do) {
      case 'setState':
        store.current.named[action.key] = serialisable(value)
        rerender()
        return true
      case 'navigate':
        if (!isSafeUrl(action.to)) {
          refuse(`navigate to a refused URL: ${action.to}`)
          return true
        }
        host?.navigate?.(action.to)
        return true
      case 'open':
        host?.open?.(action.target)
        return true
      case 'call': {
        // Only the keys the action asked for, a Form's own named fields, and
        // the event's value if the action named a key for it. The store is not
        // a bag the extension gets to empty.
        const payload: Raw = {}
        if (value instanceof DibaFormValues) Object.assign(payload, value.values)
        for (const key of action.with ?? []) payload[key] = store.current.named[key] ?? null
        if (action.value !== undefined && !(value instanceof DibaFormValues)) {
          payload[action.value] = serialisable(value)
        }
        try {
          await host?.call?.(action.action, payload)
        } catch (error) {
          refuse(
            `call "${action.action}" failed: ${error instanceof Error ? error.message : String(error)}`,
          )
          return false
        }
        return true
      }
      case 'toast':
        showToast(action)
        return true
      case 'close': {
        const close = overlays.current.at(-1)
        if (!close) {
          refuse('close with no overlay open')
          return true
        }
        close()
        return true
      }
      default:
        refuse(`unknown action: ${String((action as { do?: unknown }).do)}`)
        return true
    }
  }

  const showToast = (action: Extract<DibaAction, { do: 'toast' }>) => {
    const status = action.status ?? 'default'
    if (!STATUSES.has(status)) {
      refuse(`toast: refused status "${status}"`)
      return
    }
    if (action.title === undefined && action.description === undefined) {
      refuse('toast with neither a title nor a description')
      return
    }
    // "Undo": a label, and actions of its own — but no toast among them, so a
    // toast cannot summon another toast.
    let steps = stepsOf(action.onAction)
    if (steps.some((s) => s.do === 'toast')) {
      refuse('toast: a toast inside onAction')
      steps = steps.filter((s) => s.do !== 'toast')
    }
    const undo = action.actionLabel !== undefined && steps.length > 0
    const onAction = undo ? () => void run(steps, null) : undefined
    const toast: DibaToast = {
      status,
      title: action.title,
      description: action.description,
      actionLabel: undo ? action.actionLabel : undefined,
      onAction,
    }
    const host = latest.current.handlers?.toast
    if (host) {
      host(toast)
      return
    }
    dibaToast(toast.title ?? toast.description, {
      variant: status,
      description: toast.title !== undefined ? toast.description : undefined,
      actionProps: undo ? { children: toast.actionLabel, onPress: onAction } : undefined,
    })
  }

  // ---- props ----------------------------------------------------------------

  /**
   * The props a component will accept from a tree, by name, with the schema's
   * defaults filled in for the ones the tree left out.
   *
   * Anything not declared in the manifest is dropped rather than forwarded —
   * `className` and `style` pass through on most components, and a tree that
   * could set them could reposition itself over the host, hide the chrome
   * around it, or paint itself to look like something it is not. URL props,
   * and only those, are held to a URL rule.
   */
  const filter = (type: string, declared: unknown, report: boolean) => {
    const spec = manifest.components[type]?.props ?? {}
    const props: Raw = {}
    const given = new Set<string>()
    if (isObject(declared)) {
      for (const [name, value] of Object.entries(declared)) {
        const prop = spec[name]
        if (!prop) {
          if (report) refuseOnce(`${type}: undeclared prop "${name}"`)
          continue
        }
        if (prop.format) {
          const safe =
            typeof value === 'string' &&
            (prop.format === 'image-url' ? isSafeImageUrl(value) : isSafeUrl(value))
          if (!safe) {
            if (report) refuseOnce(`${type}: refused value for "${name}"`)
            continue
          }
        }
        props[name] = value
        given.add(name)
      }
    }
    for (const [name, prop] of Object.entries(spec)) {
      if (!(name in props) && prop.default !== undefined) props[name] = prop.default
    }
    return { props, given }
  }

  const has = (key: string) => Object.prototype.hasOwnProperty.call(store.current.byNode, key)

  /** The main value of the node at [path]: pinned, else its own, else its default. */
  const valueOf = (type: string, props: Raw, path: string) => {
    const pair = valuePair(type, props)
    if (!pair) return store.current.byNode[path]
    if (props[pair.pinned] !== undefined) return props[pair.pinned]
    if (has(path)) return store.current.byNode[path]
    return props[pair.fallback]
  }

  // ---- forms ----------------------------------------------------------------

  /** Each Form's onSubmit, and each checked field's check, from the last render. */
  const formSubmit = useRef(new Map<string, Fire | undefined>())
  const checks = useRef(new Map<string, () => string | null>())
  checks.current = new Map()

  const formState = (path: string) =>
    (store.current.forms[path] ??= { submitted: false, generation: 0 })

  const inside = (path: string, form: string) =>
    path.startsWith(`${form}.`) || path.startsWith(`${form}:`)

  /** The node at [path] in the current tree, or undefined if it is gone. */
  const resolve = (path: string): unknown => {
    let node: unknown = latest.current.tree
    for (const m of path.slice(4).matchAll(/([.:])([^.:]+)/g)) {
      if (!isObject(node)) return undefined
      node =
        m[1] === '.'
          ? (Array.isArray(node.children) ? node.children : [])[Number(m[2])]
          : isObject(node.slots)
            ? node.slots[m[2]!]
            : undefined
    }
    return node
  }

  /** The named fields under a Form, each by its value pair. */
  const collect = (raw: unknown, path: string, into: Raw) => {
    if (!isObject(raw) || typeof raw.type !== 'string') return
    const type = raw.type
    if (!manifest.components[type]?.sduiSafe) return
    const { props } = filter(type, raw.props, false)
    if (typeof props.name === 'string' && valuePair(type, props)) {
      let value = valueOf(type, props, path)
      if (type === 'Checkbox' || type === 'Switch') value = value === true
      into[props.name] = serialisable(value)
    }
    // A group owns its children's values; they are not fields of their own.
    if (type === 'CheckboxGroup' || type === 'RadioGroup') return
    if (Array.isArray(raw.children)) {
      raw.children.forEach((child, i) => collect(child, `${path}.${i}`, into))
    }
  }

  const submit = async (formPath: string) => {
    const failed = [...checks.current].some(([path, check]) => inside(path, formPath) && check())
    const state = formState(formPath)
    if (failed) {
      state.submitted = true
      rerender()
      return
    }
    const values: Raw = {}
    collect(resolve(formPath), formPath, values)
    await formSubmit.current.get(formPath)?.(new DibaFormValues(values))
  }

  const reset = (formPath: string) => {
    for (const key of Object.keys(store.current.byNode)) {
      if (inside(key, formPath) || inside(key.split('#')[0]!, formPath))
        delete store.current.byNode[key]
    }
    const state = formState(formPath)
    state.generation++
    state.submitted = false
    rerender()
  }

  const hooksFor = (form: string): FormHooks => ({
    submit: () => submit(form),
    reset: () => reset(form),
  })

  // ---- the walk -------------------------------------------------------------

  const prepare = (raw: unknown, path: string, form: string | null): Item | null => {
    if (!isObject(raw) || typeof raw.type !== 'string') return null
    const type = raw.type
    const spec = manifest.components[type]
    if (!spec?.sduiSafe) {
      refuseOnce(`unknown component: ${type}`)
      return null
    }
    const Block = registry[type]
    if (!Block) {
      refuseOnce(`no React block for: ${type}`)
      return null
    }

    const { props, given } = filter(type, raw.props, true)

    const on: Record<string, Fire> = {}
    if (isObject(raw.actions)) {
      for (const [event, action] of Object.entries(raw.actions)) {
        if (!spec.actions?.[event]) {
          refuseOnce(`${type}: undeclared action "${event}"`)
          continue
        }
        const steps = stepsOf(action)
        if (steps.length) on[event] = (value) => run(steps, value)
      }
    }

    const isForm = type === 'Form'
    const inner = isForm ? path : form
    if (isForm) formSubmit.current.set(path, on.onSubmit)

    // A slot is refused on exactly the same terms as anything else in the
    // tree, and drawn through the same walk.
    const slots: Record<string, ReactNode> = {}
    if (isObject(raw.slots)) {
      for (const [name, node] of Object.entries(raw.slots)) {
        if (!spec.slots?.[name]) {
          refuseOnce(`${type}: undeclared slot "${name}"`)
          continue
        }
        const built = prepare(node, `${path}:${name}`, inner)
        if (built) slots[name] = built.element
      }
    }

    let text: string | undefined
    const items: Item[] = []
    if (typeof raw.children === 'string') {
      text = raw.children
    } else if (Array.isArray(raw.children)) {
      raw.children.forEach((child, i) => {
        const built = prepare(child, `${path}.${i}`, inner)
        if (built) items.push(built)
      })
    }

    const current = valueOf(type, props, path)
    const pair = valuePair(type, props)

    let clientError: string | null = null
    if (form && CHECKED.has(type)) {
      const check = () => checkField(type, props, valueOf(type, props, path), latest.current.say, n)
      checks.current.set(path, check)
      if (formState(form).submitted) clientError = check()
    }

    const key = (facet = '') => (facet ? `${path}#${facet}` : path)
    const node: NodeContext = {
      type,
      path,
      props,
      given,
      text,
      items,
      children: items.map((item) => item.element),
      slots,
      on,
      fire: (event, value) => on[event]?.(value) ?? Promise.resolve(true),
      current,
      pinned: pair !== null && props[pair.pinned] !== undefined,
      local: (facet) => store.current.byNode[key(facet)],
      setValue: (event, value, facet) => {
        store.current.byNode[key(facet)] = serialisable(value)
        rerender()
        return on[event]?.(value) ?? Promise.resolve(true)
      },
      refuse: (reason) => refuseOnce(`${type}: ${reason}`),
      clientError,
      form: isForm ? hooksFor(path) : form ? hooksFor(form) : null,
      overlay: (close) => {
        overlays.current.push(close)
        return () => {
          const at = overlays.current.lastIndexOf(close)
          if (at >= 0) overlays.current.splice(at, 1)
        }
      },
    }

    // A reset re-mounts what is inside its Form, so a field's own state — a
    // combo box's text, a date being typed — starts again from its default.
    const generation = form ? formState(form).generation : 0
    const elementKey = `${path}@${generation}`
    const element =
      'inline' in Block && Block.inline
        ? cloneElement((Block as (props: { node: NodeContext }) => ReactElement)({ node }), {
            key: elementKey,
          })
        : createElement(Block, { node, key: elementKey })
    return { type, props, given, text, items, path, element }
  }

  const tooBig = checkTree(tree, limits)
  if (!tooBig.ok) {
    // Refused whole rather than in part. Half a tree is a worse thing to show a
    // merchant than nothing, because nothing is obviously nothing.
    refuseOnce(tooBig.reason)
    return null
  }

  return <>{prepare(tree, 'root', null)?.element ?? null}</>
}
