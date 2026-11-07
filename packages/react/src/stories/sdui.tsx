import { useState, type ReactNode } from 'react'
import type { DibaNode } from '@kaladan/diba-schema'
import { validateTree } from '@kaladan/diba-schema/validate'
import { DibaSurface, type DibaSurfaceHandlers, type TreeLimits } from '../sdui'
import { Card } from '../components/card'
import { Grid, useT } from './kit'

/**
 * What the SDUI pages are built with: a tree beside what it draws, and a log of everything that
 * reached the host. Nothing here ships in the package.
 */

/** A block of JSON, left to right, as an extension would send it. */
export function Json({ value, maxHeight = 420 }: { value: unknown; maxHeight?: number }) {
  return (
    <pre
      dir="ltr"
      className="text-foreground"
      style={{
        margin: 0,
        fontSize: 12,
        lineHeight: '18px',
        background: 'var(--default)',
        borderRadius: 16,
        padding: 16,
        overflow: 'auto',
        maxHeight,
      }}
    >
      {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
    </pre>
  )
}

/** The lines that reached the host, newest last. */
export function Log({ lines, empty }: { lines: string[]; empty: string }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {lines.length === 0 ? (
        <p className="text-muted" style={{ margin: 0, fontSize: 13 }}>
          {empty}
        </p>
      ) : null}
      {lines.map((line, i) => (
        <pre
          key={i}
          dir="ltr"
          className="text-foreground"
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            fontSize: 12,
            lineHeight: '18px',
            background: 'var(--surface-secondary)',
            borderRadius: 10,
            padding: '6px 10px',
          }}
        >
          {line}
        </pre>
      ))}
    </div>
  )
}

/** A small heading over a column. */
export function Heading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-foreground" style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
      {children}
    </h3>
  )
}

/**
 * A tree, what it draws, and what reached the host: every handler logs, and so does every
 * refusal. [validate] adds what the schema says of it.
 */
export function TreeDemo({
  tree,
  handlers,
  limits,
  validate = false,
  showTree = true,
  children,
}: {
  tree: DibaNode | Record<string, unknown>
  handlers?: DibaSurfaceHandlers
  limits?: TreeLimits
  validate?: boolean
  showTree?: boolean
  children?: ReactNode
}) {
  const t = useT()
  const [log, setLog] = useState<string[]>([])
  const add = (line: string) => setLog((l) => [...l, line])
  const checked = validate ? validateTree(tree) : null
  return (
    <Grid min={320}>
      {showTree ? (
        <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
          <Heading>{t('درخت', 'The tree')}</Heading>
          <Json value={tree} />
        </div>
      ) : null}
      <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Heading>{t('آنچه کشیده می‌شود', 'What is drawn')}</Heading>
          <Card>
            <Card.Content>
              <DibaSurface
                tree={tree as DibaNode}
                limits={limits}
                handlers={{
                  call: (action, payload) => {
                    add(`call ${action} ${JSON.stringify(payload)}`)
                    return handlers?.call?.(action, payload)
                  },
                  navigate: (to) => {
                    add(`navigate ${to}`)
                    handlers?.navigate?.(to)
                  },
                  open: (target) => {
                    add(`open ${target}`)
                    handlers?.open?.(target)
                  },
                  toast: (toast) => {
                    add(
                      `toast ${toast.status}${toast.title ? ` "${toast.title}"` : ''}${toast.actionLabel ? ` [${toast.actionLabel}]` : ''}`,
                    )
                    handlers?.toast?.(toast)
                  },
                }}
                // The surface reports a refusal while it renders; the log waits for that to end.
                onRefuse={(reason) => queueMicrotask(() => add(`refused: ${reason}`))}
              />
            </Card.Content>
          </Card>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          <Heading>{t('آنچه به میزبان رسید', 'What reached the host')}</Heading>
          <Log lines={log} empty={t('هنوز چیزی نرسیده.', 'Nothing yet.')} />
        </div>
        {checked ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <Heading>{t('آنچه شِما می‌گوید', 'What the schema says')}</Heading>
            <Log lines={checked.ok ? [] : checked.errors} empty={t('درست است.', 'It is valid.')} />
          </div>
        ) : null}
        {children}
      </div>
    </Grid>
  )
}
