import { useEffect, useLayoutEffect, useRef } from 'react'

/**
 * Flutter's toggle motion, for the checkbox and the radio. Ported from Flutter's own code,
 * Copyright 2014 The Flutter Authors, under its BSD licence: see THIRD-PARTY-NOTICES.txt.
 *
 * Flutter animates a checkbox or a radio with one controller, 200ms long, read through
 * `Curves.easeIn` going forward and `Curves.easeOut` going back (`ToggleableStateMixin`). Its
 * painters then draw each frame from that one number. This is the same controller, so the web
 * copy can paint from the same number with the same formulas, frame for frame.
 */

/** Flutter's `Cubic`: a CSS-style cubic Bézier from (0,0) to (1,1), solved for x by bisection. */
export function cubic(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, m: number) =>
    3 * a * (1 - m) * (1 - m) * m + 3 * b * (1 - m) * m * m + m * m * m
  return (t: number) => {
    if (t <= 0) return 0
    if (t >= 1) return 1
    let start = 0
    let end = 1
    for (;;) {
      const mid = (start + end) / 2
      const estimate = at(x1, x2, mid)
      if (Math.abs(t - estimate) < 0.001) return at(y1, y2, mid)
      if (estimate < t) start = mid
      else end = mid
    }
  }
}

export const easeIn = cubic(0.42, 0, 1, 1)
export const easeOut = cubic(0, 0, 0.58, 1)

/** Flutter's `kToggleDuration`. */
export const TOGGLE_MS = 200

export type ToggleStatus = 'forward' | 'reverse' | 'completed' | 'dismissed'

export interface TogglePosition {
  /** The controller's value through the curve of its direction, 0 to 1. */
  position: number
  status: ToggleStatus
  /** The value before the latest change: Flutter's `previousValue`. */
  previous: boolean | null
}

export function reducedMotion(element: Element | null) {
  if (typeof window === 'undefined') return true
  if (element?.closest('[data-reduce-motion="true"]')) return true
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Drives a toggle as `ToggleableStateMixin` does: forward to 1 for true (and for null, after
 * jumping to 0, when tristate), back to 0 for false, over the share of 200ms that is left, read
 * through easeIn going forward and easeOut going back. `paint` is called with each frame's
 * position inside the animation frame itself and writes to the DOM directly, so no frame waits
 * on a React render. The component renders the value at rest; a change paints its first frame
 * before the browser paints the commit, so the rest state never flashes.
 */
export function useToggleMotion(
  value: boolean | null,
  paint: (frame: TogglePosition) => void,
  options: { tristate?: boolean; element?: { current: Element | null } } = {},
) {
  const controller = useRef(value === false ? 0 : 1)
  const last = useRef(value)
  const frame = useRef(0)
  const painter = useRef(paint)
  painter.current = paint

  useIsomorphicLayoutEffect(() => {
    const previous = last.current
    if (previous === value) return
    last.current = value
    cancelAnimationFrame(frame.current)

    if (options.tristate && value === null) controller.current = 0
    const forward = value ?? true
    const target = forward ? 1 : 0
    const curve = forward ? easeIn : easeOut
    const moving: ToggleStatus = forward ? 'forward' : 'reverse'
    const rest: ToggleStatus = forward ? 'completed' : 'dismissed'

    if (reducedMotion(options.element?.current ?? null)) {
      controller.current = target
      painter.current({ position: target, status: rest, previous })
      return
    }

    const from = controller.current
    const duration = Math.abs(target - from) * TOGGLE_MS
    const started = performance.now()
    painter.current({ position: curve(from), status: moving, previous })
    const tick = (now: number) => {
      const done = duration === 0 ? 1 : Math.min(1, Math.max(0, now - started) / duration)
      controller.current = from + (target - from) * done
      if (done >= 1) {
        painter.current({ position: target, status: rest, previous })
        return
      }
      painter.current({ position: curve(controller.current), status: moving, previous })
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }, [value])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])
}

const percent = (fraction: number) => Math.round(Math.min(1, Math.max(0, fraction)) * 1000) / 10

/** A colour `fraction` of the way from `from` to `to`, both opaque, as `Color.lerp` mixes them. */
export function lerpColor(from: string, to: string, fraction: number) {
  const share = percent(fraction)
  if (share <= 0) return from
  if (share >= 100) return to
  return `color-mix(in srgb, ${to} ${share}%, ${from})`
}

/** A colour faded in from transparent, as the checkbox's fill and edge fade on Flutter's canvas. */
export function fadeColor(color: string, fraction: number) {
  const share = percent(fraction)
  if (share <= 0) return 'transparent'
  if (share >= 100) return color
  return `color-mix(in srgb, ${color} ${share}%, transparent)`
}

/**
 * `Color.lerp(Colors.transparent, color, fraction)` as the radio's background shows it: each
 * channel lerped straight from transparent black, so on the way in it is darker as well as
 * fainter, a tan between the white and the gilt. CSS mixes with premultiplied alpha, which would
 * skip that; mixing with black first, then with transparent, gives Flutter's colour. Filmed off
 * the gallery: the checkbox's fill does not darken this way, the radio's background does.
 */
export function fadeColorFromBlack(color: string, fraction: number) {
  const share = percent(fraction)
  if (share <= 0) return 'transparent'
  if (share >= 100) return color
  return `color-mix(in srgb, color-mix(in srgb, ${color} ${share}%, black) ${share}%, transparent)`
}

// ---- the checkbox, as Flutter's `_CheckboxPainter` draws it -------------------------------------

const EDGE = 18
const STROKE = 2
const RADIUS = 2

export interface CheckboxPaint {
  /** The box's inset on every side, and its size: Flutter squeezes it by a stroke at mid-turn. */
  inset: number
  size: number
  /** How far the inside has turned from empty to the fill colour, 0 to 1. */
  fill: number
  /** The edge's width, and how far it has faded from the edge colour to nothing. */
  edgeWidth: number
  edgeFade: number
  mark: null | { kind: 'check' | 'dash'; progress: number }
}

function outerAt(t: number) {
  const inset = 1 - Math.abs(t - 0.5) * 2
  return { inset, size: EDGE - inset * STROKE }
}

/** `_CheckboxPainter.paint`, ported line for line. */
export function paintCheckbox(
  previous: boolean | null,
  value: boolean | null,
  { position, status }: Pick<TogglePosition, 'position' | 'status'>,
): CheckboxPaint {
  const tNormalized = status === 'forward' || status === 'completed' ? position : 1 - position
  if (previous === false || value === false) {
    const t = value === false ? 1 - tNormalized : tNormalized
    const outer = outerAt(t)
    const fill = t >= 0.25 ? 1 : t * 4
    if (t <= 0.5) {
      return { ...outer, fill, edgeWidth: STROKE * (1 - t), edgeFade: t, mark: null }
    }
    const shrink = (t - 0.5) * 2
    const kind = previous === null || value === null ? 'dash' : 'check'
    return { ...outer, fill, edgeWidth: 0, edgeFade: 1, mark: { kind, progress: shrink } }
  }
  const outer = outerAt(1)
  if (tNormalized <= 0.5) {
    const kind = (previous ?? false) ? 'check' : 'dash'
    return {
      ...outer,
      fill: 1,
      edgeWidth: 0,
      edgeFade: 1,
      mark: { kind, progress: 1 - tNormalized * 2 },
    }
  }
  const kind = (value ?? false) ? 'check' : 'dash'
  return {
    ...outer,
    fill: 1,
    edgeWidth: 0,
    edgeFade: 1,
    mark: { kind, progress: (tNormalized - 0.5) * 2 },
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const point = (x: number, y: number) =>
  `${Math.round(x * 1000) / 1000} ${Math.round(y * 1000) / 1000}`

/** `_drawCheck`: the short stroke first, then the long one. Points are 18ths of the box. */
export function checkPath(progress: number) {
  const s = [EDGE * 0.15, EDGE * 0.45] as const
  const m = [EDGE * 0.4, EDGE * 0.7] as const
  const e = [EDGE * 0.85, EDGE * 0.25] as const
  if (progress < 0.5) {
    const t = progress * 2
    return `M ${point(...s)} L ${point(lerp(s[0], m[0], t), lerp(s[1], m[1], t))}`
  }
  const t = (progress - 0.5) * 2
  return `M ${point(...s)} L ${point(...m)} L ${point(lerp(m[0], e[0], t), lerp(m[1], e[1], t))}`
}

/** `_drawDash`: from the middle outwards. */
export function dashPath(progress: number) {
  const y = EDGE * 0.5
  const start = lerp(EDGE * 0.2, EDGE * 0.5, 1 - progress)
  const end = lerp(EDGE * 0.5, EDGE * 0.8, progress)
  return `M ${point(start, y)} L ${point(end, y)}`
}

export const CHECKBOX = { EDGE, STROKE, RADIUS }

// ---- the radio, as Flutter's `_RadioPainter` draws it ------------------------------------------

/** Flutter's `_kOuterRadius` and `_kInnerRadius`. */
export const RADIO = { OUTER: 8, INNER: 4.5, STROKE: 2 }

// ---- what the SVGs are given, at rest and in every frame ---------------------------------------

export interface CheckboxColours {
  edge: string
  fill: string
  mark: string
}

/** The attributes of the checkbox SVG's three parts for one frame of `paintCheckbox`. */
export function checkboxAttributes(paint: CheckboxPaint, colours: CheckboxColours) {
  const half = paint.edgeWidth / 2
  return {
    fill: {
      x: paint.inset,
      y: paint.inset,
      width: paint.size,
      height: paint.size,
      fill: fadeColor(colours.fill, paint.fill),
    },
    edge: {
      x: paint.inset + half,
      y: paint.inset + half,
      width: Math.max(0, paint.size - paint.edgeWidth),
      height: Math.max(0, paint.size - paint.edgeWidth),
      rx: Math.max(0, RADIUS - half),
      strokeWidth: paint.edgeWidth,
      stroke: fadeColor(colours.edge, 1 - paint.edgeFade),
      visible: paint.edgeWidth > 0,
    },
    mark: {
      d:
        paint.mark && paint.mark.progress > 0
          ? paint.mark.kind === 'check'
            ? checkPath(paint.mark.progress)
            : dashPath(paint.mark.progress)
          : '',
      kind: paint.mark?.kind ?? 'none',
      stroke: colours.mark,
    },
  }
}

export interface RadioColours {
  ring: string
  fill: string
  dot: string
}

/** The attributes of the radio SVG's three circles at position `v`, as `_RadioPainter` paints. */
export function radioAttributes(v: number, colours: RadioColours) {
  return {
    disc: fadeColorFromBlack(colours.fill, v),
    ring: lerpColor(colours.ring, colours.fill, v),
    dot: { r: RADIO.INNER * v, fill: lerpColor(colours.ring, colours.dot, v) },
  }
}
