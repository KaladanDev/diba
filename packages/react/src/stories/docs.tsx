import { manifest } from '@kaladan/diba-schema'
import type { CSSProperties, ReactNode } from 'react'

/**
 * Blocks for a component's docs page (its .mdx): a props table per part, the block's props as the
 * schema says them, and a keyboard table. Drawn in the docs page's own type, not Diba's: they
 * document the component, they are not it. A published page says what a component is and how to
 * use it, never how it came to be: no decision tags, no look history.
 */

const cell: CSSProperties = {
  textAlign: 'start',
  verticalAlign: 'top',
  padding: '10px 12px',
  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  fontSize: 13,
  lineHeight: '20px',
}
const head: CSSProperties = { ...cell, fontWeight: 600, fontSize: 12, color: 'rgba(0, 0, 0, 0.6)' }
const code: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
  background: 'rgba(0, 0, 0, 0.05)',
  borderRadius: 4,
  padding: '1px 5px',
  whiteSpace: 'nowrap',
}

function Table({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div style={{ overflowX: 'auto', margin: '16px 0 32px' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%' }} dir="ltr">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} style={head}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((value, j) => (
                <td key={j} style={cell}>
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const Code = ({ children }: { children: ReactNode }) => <code style={code}>{children}</code>

/** A component's parts and what each is (MDX here has no Markdown tables). */
export function Parts({ rows }: { rows: [part: string, is: ReactNode][] }) {
  return (
    <Table
      columns={['Part', 'What it is']}
      rows={rows.map(([part, is]) => [<Code key="p">{part}</Code>, is])}
    />
  )
}

/** One row of a part's props: its name, type, default and what it does. */
export type PropRow = [
  name: string,
  type: string,
  defaultValue: string | null,
  description: ReactNode,
]

/** A part's props, as the component takes them. */
export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <Table
      columns={['Prop', 'Type', 'Default', 'Description']}
      rows={rows.map(([name, type, value, description]) => [
        <Code key="n">{name}</Code>,
        <Code key="t">{type}</Code>,
        value === null ? '—' : <Code key="d">{value}</Code>,
        description,
      ])}
    />
  )
}

type Spec = {
  type: string | string[]
  description?: string
  required?: boolean
  i18n?: boolean
  default?: unknown
  values?: unknown[]
  format?: string
  token?: string
}
type Component = {
  description?: string
  props?: Record<string, Spec>
  children?: { accepts: string | string[]; description?: string }
  slots?: Record<string, { accepts: string | string[]; description?: string }>
  actions?: Record<string, { description?: string; payload?: string }>
  fixed?: Record<string, { value: unknown; description?: string }>
}

/**
 * The working notes a reader must never meet: decision tags, leave-out markers, asides, the owner,
 * the look history. Neither a docs page, a file a package ships, nor the public repository may
 * hold one. A shop's, a store's or a copyright's owner is just a word, and `${owner}` a name.
 */
export const WORKING =
  /\b[DC]\d{1,2}\b|⟨|\((?:\*\*)?[HEW](?:\*\*)?[:)]|(?<!\{)(?<!hop )(?<!tore )(?<!right )\bowner\b|\blook picker\b|\bfinali[sz]ed\b|looks\.json|LookNote|\bdraft \d\b/

/**
 * The manifest's text, without the working notes it may carry: decision tags such as (D43) or
 * (C9), leave-out markers such as (H) or (**E**: …), and ⟨…⟩ asides.
 */
export const clean = (text: string | undefined) =>
  (text ?? '')
    .replace(/\s*⟨[^⟩]*⟩/g, '')
    .replace(/\s*\((?:D|C)\d{1,2}\b[^)]*\)/g, '')
    .replace(/\s*\((?:\*\*)?[HEW](?:\*\*)?(?::[^)]*)?\)/g, '')
    .replace(/\s+([.,;:])/g, '$1')
    .trim()

const typeOf = (spec: Spec) => {
  const types = Array.isArray(spec.type) ? spec.type : [spec.type]
  if (types.includes('enum') && spec.values)
    return spec.values.map((v) => JSON.stringify(v)).join(' | ')
  if (spec.token) return `${types.join(' | ')} (${spec.token})`
  if (spec.format) return `${types.join(' | ')} (${spec.format})`
  return types.join(' | ')
}

/**
 * A block's props as the schema says them (packages/schema/src/manifest): what a tree may set,
 * which both renderers draw. Read from the manifest, so it cannot drift from it.
 */
export function SchemaProps({ name }: { name: string }) {
  const spec = (manifest.components as Record<string, Component | undefined>)[name]
  if (!spec) return <p>No block named {name}.</p>
  const rows: ReactNode[][] = Object.entries(spec.props ?? {}).map(([prop, p]) => [
    <Code key="n">{prop}</Code>,
    <Code key="t">{typeOf(p)}</Code>,
    p.default === undefined ? (
      p.required ? (
        'required'
      ) : (
        '—'
      )
    ) : (
      <Code key="d">{JSON.stringify(p.default)}</Code>
    ),
    <span key="x" style={{ fontSize: 13, lineHeight: '20px' }}>
      {clean(p.description)}
      {p.i18n ? ' Localizable text.' : ''}
    </span>,
  ])
  const accepts = (a: string | string[]) =>
    Array.isArray(a) ? a.join(', ') : a === '*' ? 'any block' : a
  if (spec.children)
    rows.push([
      <Code key="n">children</Code>,
      accepts(spec.children.accepts),
      '—',
      clean(spec.children.description),
    ])
  for (const [slot, s] of Object.entries(spec.slots ?? {}))
    rows.push([
      <Code key="n">{`slots.${slot}`}</Code>,
      accepts(s.accepts),
      '—',
      clean(s.description),
    ])
  for (const [action, a] of Object.entries(spec.actions ?? {}))
    rows.push([
      <Code key="n">{`actions.${action}`}</Code>,
      a.payload ?? '—',
      '—',
      clean(a.description),
    ])
  for (const [part, f] of Object.entries(spec.fixed ?? {}))
    rows.push([
      <Code key="n">{part}</Code>,
      'fixed',
      <Code key="d">{JSON.stringify(f.value)}</Code>,
      clean(f.description),
    ])
  return (
    <>
      {spec.description ? <p>{clean(spec.description)}</p> : null}
      <Table columns={['Prop', 'Type', 'Default', 'Description']} rows={rows} />
    </>
  )
}

/** Which key does what. */
export function Keys({ rows }: { rows: [keys: string, does: ReactNode][] }) {
  return (
    <Table
      columns={['Key', 'Does']}
      rows={rows.map(([keys, does]) => [
        <span key="k" style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>
          {keys.split(' ').map((k) => (
            <kbd
              key={k}
              style={{
                ...code,
                border: '1px solid rgba(0,0,0,0.15)',
                borderBottomWidth: 2,
                background: 'white',
              }}
            >
              {k}
            </kbd>
          ))}
        </span>,
        does,
      ])}
    />
  )
}
