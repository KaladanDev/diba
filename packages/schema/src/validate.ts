// With its extension: Node resolves an ES module's import exactly, and ajv has
// no `exports` map to fill one in. Without it this file loads in a bundler and
// nowhere else.
import Ajv2020 from 'ajv/dist/2020.js'
import type { ErrorObject, ValidateFunction } from 'ajv'
import schema from '../dist/schema.json' with { type: 'json' }
import { manifest } from '../dist/index'

/**
 * Validating a tree before anything renders it.
 *
 * The renderers refuse what a schema cannot express — an unknown component, a
 * `javascript:` URL, a prop the manifest never declared, a tree too deep to be
 * worth drawing. This is the other half, and neither half is enough alone.
 *
 * What only the schema catches is a *declared* prop carrying a value the
 * contract does not allow. `{ type: 'Button', props: { variant: 'nonsense' } }`
 * passes every renderer check there is — `variant` really is a Button prop — and
 * then `tailwind-variants` matches no variant, so the button renders as
 * `button button--sm`: no fill, no ink, no colour. A typo in an extension's
 * payload becomes an invisible control, silently, with nothing logged.
 *
 * So: validate first, render second. This is deliberately a separate entry
 * point — a host that already validates upstream should not pay for Ajv twice.
 */

const SCHEMA_ID = schema.$id

/**
 * Two instances, because the two questions cost differently.
 *
 * Whether a tree is legal is asked of the union, and `DibaNode` is a oneOf of
 * 74 branches, so every node is tried against every branch. With `allErrors`,
 * a branch whose `type` is wrong still validates everything beneath it, and
 * the cost multiplies at every level: the gallery's table, six deep, took over
 * five seconds. Stopping at the first fault drops a wrong branch at its `type`.
 *
 * Why it is illegal is asked one node at a time, of that node's own schema
 * with its children held back, where every fault is worth reporting.
 */
const judge = new Ajv2020({ strict: false })
const ajv = new Ajv2020({ allErrors: true, strict: false })

let compiled: ValidateFunction | null = null

/** Compiled once — the schema covers 74 components and is not cheap to build. */
function validator(): ValidateFunction {
  if (!compiled) {
    compiled = judge.compile(schema)
    ajv.addSchema(schema)
  }
  return compiled
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v)

const dedupe = (lines: string[]) => [...new Set(lines)]

/** Every distinct message Ajv gave, as a last resort. */
function raw(errors: ErrorObject[]): string[] {
  return dedupe(errors.map((e) => `${e.instancePath || '(root)'} ${e.message ?? 'is invalid'}`))
}

/**
 * Why the tree is wrong, said once and in the right place.
 *
 * Ajv cannot tell you this on its own. `DibaNode` is a union of 74 branches and
 * it reports every branch it tried, so one wrong boolean came back as fifteen
 * lines — twelve of them "must have required property 'alt'" and the like, from
 * Image, Kbd and Pagination, components the tree never mentioned. Filtering by
 * branch is not possible either: Ajv's `schemaPath` is relative
 * (`#/properties/type/const`) and names no branch at all.
 *
 * So the union answers whether the tree is legal, and this answers why: walk
 * it, and check each node against its own component's schema, where there is no
 * union left to be ambiguous about. Children are held back and recursed into
 * separately, or validating a node would drag the whole subtree back through
 * the union and reintroduce exactly the noise this exists to remove. Slots are
 * held back the same way, since each holds a node of its own.
 */
function locate(tree: unknown, path: string, out: string[], accepts?: string[] | '*'): void {
  const where = path || '(root)'
  const below = (rest: string) => `${where === '(root)' ? '' : where}${rest}`

  if (!isObject(tree)) {
    out.push(`${where} is not a node`)
    return
  }
  const type = tree.type
  if (typeof type !== 'string') {
    out.push(`${where} has no component type`)
    return
  }

  const spec = manifest.components[type]
  const check = ajv.getSchema(`${SCHEMA_ID}#/$defs/${type}`)
  if (!spec || !spec.sduiSafe || !check) {
    out.push(`${where} unknown component: ${type}`)
    return
  }
  if (accepts && accepts !== '*' && !accepts.includes(type)) {
    out.push(`${where} ${type} is not allowed here; this place takes ${accepts.join(', ')}`)
    return
  }

  const { children, slots, ...rest } = tree
  if (!check(rest)) {
    for (const e of check.errors ?? []) {
      out.push(`${where}${e.instancePath} ${e.message ?? 'is invalid'}`)
    }
  }

  if (slots !== undefined) {
    if (!isObject(slots)) {
      out.push(`${where}/slots must be an object`)
    } else {
      for (const [name, node] of Object.entries(slots)) {
        const slot = spec.slots?.[name]
        if (!slot) out.push(`${where}/slots ${type} has no slot "${name}"`)
        else locate(node, below(`/slots/${name}`), out, slot.accepts)
      }
    }
  }

  if (children === undefined) return
  const taken = spec.children
  if (!taken) {
    out.push(`${where} ${type} takes no children`)
    return
  }
  const takes = taken.accepts
  if (takes === 'text') {
    if (typeof children !== 'string') out.push(`${where}/children must be text`)
  } else if (typeof children === 'string' && taken.text) {
    return
  } else if (!Array.isArray(children)) {
    out.push(`${where}/children must be a list of nodes`)
  } else {
    children.forEach((child, i) => locate(child, below(`/children/${i}`), out, takes))
  }
}

export type ValidationResult = { ok: true } | { ok: false; errors: string[] }

/**
 * Whether a tree is a legal SDUI document.
 *
 * Returns the reasons rather than throwing: an invalid tree from an extension
 * is an ordinary event a host has to report and carry on from, not an
 * exceptional one.
 */
export function validateTree(tree: unknown): ValidationResult {
  const validate = validator()
  if (validate(tree)) return { ok: true }

  // The union is the authority on legality; the walk is the authority on
  // wording. If they ever disagree — the walk finding nothing the union
  // rejected — Ajv's own messages are better than claiming there is no problem.
  const located: string[] = []
  locate(tree, '', located)
  return { ok: false, errors: located.length ? dedupe(located) : raw(validate.errors ?? []) }
}
