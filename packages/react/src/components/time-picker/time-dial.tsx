'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

/**
 * Diba's own: Material 3's clock dial, as Flutter paints it (`_DialPainter`): the labels
 * on a ring 28 in from the edge, the 24-hour clock's afternoon on a ring 28 further in; the hand
 * 2 wide from an 8 centre to a 48 dot over the label picked, whose words are drawn again inside
 * the dot in its own ink. A tap takes the nearest label (a minute to the nearest five), a drag
 * any minute; letting go of an hour turns the dial to the minutes.
 */

export type DialMode = 'hour' | 'minute'

export interface TimeOfDay {
  hour: number
  minute: number
}

const TWO_PI = 2 * Math.PI
/** Material's: the labels 28 in from the dial's edge, the inner ring 28 further in. */
const DIAL_PADDING = 28
const INNER_OFFSET = 28

const mod = (n: number, m: number) => ((n % m) + m) % m

/** Where a value sits on the dial: 0 at the top, turning clockwise. */
export function thetaFor(time: TimeOfDay, mode: DialMode): number {
  const fraction = mode === 'hour' ? (time.hour % 12) / 12 : time.minute / 60
  return mod(Math.PI / 2 - fraction * TWO_PI, TWO_PI)
}

/**
 * The time a point picks, as Flutter's `_getTimeForTheta`: an hour to the nearest one, on the
 * inner ring past noon on a 24-hour clock, else in the time's own half of the day; a minute to
 * the nearest one, or the nearest five for a tap.
 */
export function timeAt(
  time: TimeOfDay,
  mode: DialMode,
  twentyFour: boolean,
  theta: number,
  inner: boolean,
  roundMinutes: boolean,
): TimeOfDay {
  const fraction = mod(0.25 - mod(theta, TWO_PI) / TWO_PI, 1)
  if (mode === 'hour') {
    const hour = Math.round(fraction * 12) % 12
    const offset = twentyFour ? (inner ? 12 : 0) : time.hour >= 12 ? 12 : 0
    return { ...time, hour: hour + offset }
  }
  let minute = Math.round(fraction * 60) % 60
  if (roundMinutes) minute = (Math.floor((minute + 2) / 5) * 5) % 60
  return { ...time, minute }
}

/** Flutter's standard easing over the dial's 200ms. */
function standardEasing(t: number): number {
  // Cubic(0.4, 0.0, 0.2, 1.0), solved for x by bisection.
  const bez = (a: number, b: number, s: number) =>
    3 * a * s * (1 - s) ** 2 + 3 * b * s ** 2 * (1 - s) + s ** 3
  let lo = 0
  let hi = 1
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (bez(0.4, 0.2, mid) < t) lo = mid
    else hi = mid
  }
  return bez(0, 1, (lo + hi) / 2)
}

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

/** The hand's angle, turning the short way to its target over 200ms. */
function useTheta(target: number, hold: boolean): number {
  const [theta, setTheta] = useState(target)
  const current = useRef(target)
  useEffect(() => {
    if (hold || reducedMotion()) {
      current.current = target
      setTheta(target)
      return
    }
    let from = current.current
    // The nearest way round, as Flutter's `_nearest`.
    if (Math.abs(target - (from - TWO_PI)) < Math.abs(target - from)) from -= TWO_PI
    if (Math.abs(target - (from + TWO_PI)) < Math.abs(target - from)) from += TWO_PI
    const start = performance.now()
    let frame = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 200)
      const value = from + (target - from) * standardEasing(t)
      current.current = value
      setTheta(value)
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, hold])
  return theta
}

export interface TimeDialProps {
  time: TimeOfDay
  mode: DialMode
  twentyFour: boolean
  /** The dial's width: 256 standing, 244 lying (Material's). */
  size: number
  /** A label's words: an hour, 0 to 23, or a minute, 0 to 55. */
  labelText: (value: number, mode: DialMode) => string
  label: string
  valueText: string
  onChange: (time: TimeOfDay) => void
  /** An hour let go of: the dial turns to the minutes. */
  onHourPicked: () => void
}

export function TimeDial({
  time,
  mode,
  twentyFour,
  size,
  labelText,
  label,
  valueText,
  onChange,
  onHourPicked,
}: TimeDialProps) {
  const radius = size / 2
  const labelRadius = radius - DIAL_PADDING
  const innerRadius = labelRadius - INNER_OFFSET
  const [dragging, setDragging] = useState(false)
  const press = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const theta = useTheta(thetaFor(time, mode), dragging)
  const onInner = mode === 'hour' && twentyFour && time.hour >= 12
  const handRadius = onInner ? innerRadius : labelRadius
  const at = (angle: number, r: number) => ({
    x: radius + r * Math.cos(angle),
    y: radius - r * Math.sin(angle),
  })
  const dot = at(theta, handRadius)

  // Twelve to a ring from the top: the minutes in fives, the hours, and on a 24-hour clock the
  // afternoon's inside them.
  const labels =
    mode === 'minute'
      ? Array.from({ length: 12 }, (_, i) => ({
          text: labelText(i * 5, mode),
          inner: false,
          index: i,
        }))
      : Array.from({ length: twentyFour ? 24 : 12 }, (_, h) => ({
          text: labelText(h, mode),
          inner: h >= 12,
          index: h % 12,
        }))

  const drawLabels = (ink: string) =>
    labels.map((l) => {
      const p = at(Math.PI / 2 - (l.index * TWO_PI) / 12, l.inner ? innerRadius : labelRadius)
      return (
        <text
          key={`${l.inner}-${l.index}`}
          x={p.x}
          y={p.y}
          fill={ink}
          textAnchor="middle"
          dominantBaseline="central"
          className="time-picker__dial-label"
        >
          {l.text}
        </text>
      )
    })

  /** The time under a point, and whether it is on the inner ring. */
  const pick = (event: PointerEvent<SVGSVGElement>, roundMinutes: boolean) => {
    const box = event.currentTarget.getBoundingClientRect()
    // In the dial's own units, whatever it is drawn at: a picker fitted to a small window is
    // zoomed down, and its box with it.
    const scale = box.width / size || 1
    const dx = (event.clientX - box.left) / scale - radius
    const dy = (event.clientY - box.top) / scale - radius
    // Flutter's: the angle from the top, y downwards.
    const angle = mod(Math.atan2(dx, dy) - Math.PI / 2, TWO_PI)
    const ring = Math.min(1, Math.max(0, (Math.hypot(dx, dy) - innerRadius) / INNER_OFFSET))
    return timeAt(time, mode, twentyFour, angle, ring < 0.5, roundMinutes)
  }

  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    const step =
      event.key === 'ArrowUp' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowDown' || event.key === 'ArrowLeft'
          ? -1
          : 0
    if (!step) return
    event.preventDefault()
    if (mode === 'hour') onChange({ ...time, hour: mod(time.hour + step, 24) })
    else onChange({ ...time, minute: mod(time.minute + step, 60) })
  }

  const clip = `time-dial-clip-${mode}`
  return (
    <svg
      className="time-picker__dial"
      data-slot="time-picker-dial"
      data-mode={mode}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuetext={valueText}
      aria-valuenow={mode === 'hour' ? time.hour : time.minute}
      aria-valuemin={0}
      aria-valuemax={mode === 'hour' ? 23 : 59}
      onKeyDown={onKeyDown}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        press.current = { x: event.clientX, y: event.clientY, moved: false }
      }}
      onPointerMove={(event) => {
        const p = press.current
        if (!p) return
        if (!p.moved && Math.hypot(event.clientX - p.x, event.clientY - p.y) < 3) return
        p.moved = true
        setDragging(true)
        onChange(pick(event, false))
      }}
      onPointerUp={(event) => {
        const p = press.current
        if (!p) return
        press.current = null
        setDragging(false)
        // A drag keeps the minute it ended on; a tap takes the nearest five.
        onChange(pick(event, !p.moved))
        if (mode === 'hour') onHourPicked()
      }}
      onPointerCancel={() => {
        press.current = null
        setDragging(false)
      }}
    >
      <circle cx={radius} cy={radius} r={radius} className="time-picker__dial-face" />
      {drawLabels('var(--foreground)')}
      <circle cx={radius} cy={radius} r={4} className="time-picker__dial-hand" />
      <line
        x1={radius}
        y1={radius}
        x2={dot.x}
        y2={dot.y}
        strokeWidth={2}
        className="time-picker__dial-hand"
      />
      <circle cx={dot.x} cy={dot.y} r={24} className="time-picker__dial-hand" />
      {mode === 'minute' && time.minute % 5 !== 0 ? (
        <circle cx={dot.x} cy={dot.y} r={2} className="time-picker__dial-dot" />
      ) : null}
      <clipPath id={clip}>
        <circle cx={dot.x} cy={dot.y} r={24} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>{drawLabels('var(--accent-foreground)')}</g>
    </svg>
  )
}
