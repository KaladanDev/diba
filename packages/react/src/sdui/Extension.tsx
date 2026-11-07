import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { DibaNode } from '@kaladan/diba-schema'
import { DibaSurface, type DibaSurfaceHandlers } from './Surface'
import type { TreeLimits } from './guards'
import { isSafeUrl } from './guards'

/**
 * What the host sends an extension.
 *
 * The same shape for the first render and for every action after it — an
 * extension that has to answer "give me the panel" and "the button was pressed"
 * with two different endpoints has two places to get the context wrong.
 */
export interface DibaRequest {
  /** Which slot in the admin this is, e.g. `order.detail.sidebar`. */
  surface: string
  /** What the host already knows. The extension needs no ids of its own. */
  context?: Record<string, unknown>
  /** Absent on the first render; present when an action fired. */
  action?: { name: string; payload: Record<string, unknown> }
}

/**
 * A host effect an extension may ask for when it answers.
 *
 * The toast after a `call` returns uses the `toast` verb's words — `status`,
 * `title` and `description` — and the Flutter renderer's `DibaEffect` is
 * the same shape.
 */
export interface DibaEffect {
  /** default, accent, success, warning or danger. */
  status?: 'default' | 'accent' | 'success' | 'warning' | 'danger'
  title?: string
  description?: string
  /** Checked before it reaches the host, exactly like the `navigate` verb. */
  navigate?: string
}

/**
 * What an extension sends back: a tree, an effect, or both.
 *
 * Effects exist because some things an extension legitimately wants are not
 * shaped like a tree: a toast after a save lives for a few seconds and belongs
 * to the answer, not to the panel.
 */
export interface DibaResponse {
  /** New UI for the surface. Replaces what is there; validated before it renders. */
  tree?: unknown
  effect?: DibaEffect
}

/**
 * How the host talks to an extension.
 *
 * Injected rather than built in, because this is where authentication, the
 * timeout budget and the proxy live, and none of those belong to a component
 * library. The host should proxy: an extension that receives the request
 * directly also receives the merchant's session.
 */
export type DibaTransport = (request: DibaRequest) => Promise<DibaResponse>

export type ValidationResult = { ok: true } | { ok: false; errors: string[] }

export interface DibaExtensionProps {
  surface: string
  transport: DibaTransport
  context?: Record<string, unknown>

  /**
   * How a tree is checked before it renders. Pass `validateTree` from
   * `@kaladan/diba-schema/validate`.
   *
   * Required rather than optional-with-a-default, and not imported here on
   * purpose. A default would put Ajv in every bundle that touches this file
   * including hosts that already validate upstream; an optional prop would let
   * a host skip validation by saying nothing at all, which is the one mistake
   * with no symptom. Making it a required argument means the decision is always
   * visible at the call site.
   */
  validate: (tree: unknown) => ValidationResult

  limits?: TreeLimits
  /** Everything the extension asked the host to do, and everything refused. */
  handlers?: Omit<DibaSurfaceHandlers, 'call'>
  onEffect?: (effect: DibaEffect) => void
  onRefuse?: (reason: string) => void
  /** Shown while the first tree is in flight. */
  pending?: ReactNode
  /** Shown when the extension cannot be rendered, with the reasons. */
  fallback?: (reasons: string[]) => ReactNode
}

type State =
  | { status: 'pending' }
  | { status: 'ready'; tree: DibaNode }
  | { status: 'failed'; reasons: string[] }

/**
 * One extension panel, from fetch to render to the round trip after a press.
 *
 * The renderer draws a tree and the schema says whether a tree is legal; this
 * is the part that gets one, keeps it honest, and sends the presses back. It
 * refuses whole rather than in part at every step — a panel showing half an
 * extension is indistinguishable to a merchant from a broken admin.
 */
export function DibaExtension({
  surface,
  transport,
  context,
  validate,
  limits,
  handlers,
  onEffect,
  onRefuse,
  pending,
  fallback,
}: DibaExtensionProps) {
  const [state, setState] = useState<State>({ status: 'pending' })

  /** Reading these during a dispatch without re-subscribing on every render. */
  const latest = useRef({ transport, context, validate, onEffect, onRefuse, handlers })
  latest.current = { transport, context, validate, onEffect, onRefuse, handlers }

  /** Takes an answer; false when its tree is one that may not be drawn. */
  const apply = useCallback((response: DibaResponse): boolean => {
    const { validate: check, onEffect: effectHandler, onRefuse: refuse } = latest.current

    if (response.effect) {
      const { navigate, ...rest } = response.effect
      if (navigate !== undefined && !isSafeUrl(navigate)) {
        refuse?.(`effect: navigate to a refused URL: ${navigate}`)
        effectHandler?.(rest)
      } else {
        effectHandler?.(response.effect)
      }
    }

    if (response.tree === undefined) return true
    const result = check(response.tree)
    if (!result.ok) {
      for (const reason of result.errors) refuse?.(reason)
      setState({ status: 'failed', reasons: result.errors })
      return false
    }
    setState({ status: 'ready', tree: response.tree as DibaNode })
    return true
  }, [])

  /**
   * Why the extension's answer could not be used, or null when it could: no answer at all, or a
   * tree that may not be drawn, as Flutter's counts it.
   */
  const send = useCallback(
    async (request: DibaRequest, cancelled?: () => boolean): Promise<string | null> => {
      try {
        const response = await latest.current.transport(request)
        if (cancelled?.()) return 'cancelled'
        return apply(response) ? null : 'the extension answered with a tree it may not draw'
      } catch (error) {
        if (cancelled?.()) return 'cancelled'
        // The extension's server is somebody else's uptime. A panel that fails
        // to load is an ordinary event the admin carries on from.
        const reason = error instanceof Error ? error.message : String(error)
        latest.current.onRefuse?.(`transport failed: ${reason}`)
        setState({ status: 'failed', reasons: [reason] })
        return 'the extension did not answer'
      }
    },
    [apply],
  )

  useEffect(() => {
    let gone = false
    setState({ status: 'pending' })
    void send({ surface, context: latest.current.context }, () => gone)
    return () => {
      gone = true
    }
  }, [surface, send, JSON.stringify(context)])

  /**
   * A `call`, resolved when the extension has answered and rejected when
   * it could not be reached or answered with a tree that may not be drawn,
   * which stops the rest of the event's list, as Flutter's does: "save, then
   * close" must not close a dialog whose save did not happen.
   */
  const call = useCallback(
    async (name: string, payload: Record<string, unknown>) => {
      const failed = await send({
        surface,
        context: latest.current.context,
        action: { name, payload },
      })
      if (failed) throw new Error(failed)
    },
    [surface, send],
  )

  if (state.status === 'pending') return <>{pending ?? null}</>
  if (state.status === 'failed') return <>{fallback?.(state.reasons) ?? null}</>

  return (
    <DibaSurface
      tree={state.tree}
      limits={limits}
      handlers={{ ...handlers, call }}
      onRefuse={onRefuse}
    />
  )
}
