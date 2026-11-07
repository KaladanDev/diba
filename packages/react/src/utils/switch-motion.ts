import { useEffect, useRef, type RefObject } from 'react'
import {
  cubic,
  easeIn,
  easeOut,
  lerpColor,
  reducedMotion,
  useIsomorphicLayoutEffect,
} from './toggle-motion'

/**
 * Flutter's M3 switch motion, for the switch. Ported from Flutter's own code, Copyright 2014
 * The Flutter Authors, under its BSD licence: see THIRD-PARTY-NOTICES.txt.
 *
 * Flutter moves a switch with one controller, 300ms long (`_SwitchConfigM3.toggleDuration`), and
 * `_SwitchPainter` draws every frame from it:
 * - the thumb's place, through `Curves.easeOutBack` going on and its flip going off, so it lands a
 *   little past its end and settles, either way;
 * - the thumb's size, through a sequence on the controller itself: going on, a quick stretch from
 *   16 into a 34-by-22 pill over the first 11%, a long settle into 24 over the next 72%, then
 *   still; going off, the same backwards. The thumb runs as a pill and lands round;
 * - the track's and the thumb's colours, through `Curves.easeOut` going on and `easeIn` going off,
 *   so most of the change comes first.
 * A curve keeps the direction its animation began in until it rests, as `CurvedAnimation` does, so
 * a switch turned back mid-way does not jump.
 *
 * The web copy drew it with CSS transitions: a round thumb growing on easeOutBack and colours
 * fading evenly. It looked the same at rest and moved stiffly; filmed beside Flutter's, the pill
 * and the early colour were what it lacked.
 */
export const SWITCH_MS = 300

const easeOutBack = cubic(0.175, 0.885, 0.32, 1.275)
const flip = (curve: (t: number) => number) => (t: number) => 1 - curve(1 - t)
const stretch = cubic(0.31, 0, 0.56, 1)
const settle = cubic(0.2, 0, 0, 1)

type Size = readonly [number, number]
const OFF: Size = [16, 16]
const ON: Size = [24, 24]
const PILL: Size = [34, 22]

const lerpSize = (a: Size, b: Size, t: number): Size => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
]

/** `thumbSizeAnimation`: Flutter's `TweenSequence` on the controller's value, in M3 units. */
export function thumbSize(value: number, forward: boolean): Size {
  if (forward) {
    if (value < 0.11) return lerpSize(OFF, PILL, stretch(value / 0.11))
    if (value < 0.83) return lerpSize(PILL, ON, settle((value - 0.11) / 0.72))
    return ON
  }
  if (value < 0.17) return OFF
  if (value < 0.89) return lerpSize(OFF, PILL, flip(settle)((value - 0.17) / 0.72))
  return lerpSize(PILL, ON, flip(stretch)((value - 0.89) / 0.11))
}

export type SwitchStatus = 'forward' | 'reverse' | 'completed' | 'dismissed'

export interface SwitchFrame {
  /** The thumb's centre along the track, 16 to 36 in M3 units, past either end while it lands. */
  centre: number
  /** The thumb's width and height, in M3 units. */
  width: number
  height: number
  /** How far the colours have gone from off to on, 0 to 1. */
  colour: number
}

/** `CurvedAnimation.value`: the curve of the direction it began in, and the ends as they are. */
function curved(
  value: number,
  status: SwitchStatus,
  began: 'forward' | 'reverse' | null,
  curve: (t: number) => number,
  reverseCurve: (t: number) => number,
) {
  if (value === 0 || value === 1) return value
  return (began ?? status) === 'reverse' ? reverseCurve(value) : curve(value)
}

/** `_SwitchPainter.paint`'s thumb and colours, from the controller's value and status. */
export function switchFrame(
  value: number,
  status: SwitchStatus,
  began: 'forward' | 'reverse' | null = null,
): SwitchFrame {
  const position = curved(value, status, began, easeOutBack, flip(easeOutBack))
  const [width, height] = thumbSize(value, status === 'dismissed' || status === 'forward')
  return {
    centre: 16 + 20 * position,
    width,
    height,
    colour: curved(value, status, began, easeOut, easeIn),
  }
}

/**
 * Paints a frame onto the thumb and its track, scaled by the switch's `--switch-k`. At rest the
 * inline styles go, and the stylesheet draws the thumb, so its hover, its press and its sizes
 * stay the stylesheet's.
 */
function paint(thumb: HTMLElement, frame: SwitchFrame | null) {
  const track = thumb.parentElement
  const k = (n: number) => `calc(${Math.round(n * 1000) / 1000}px * var(--switch-k))`
  if (!frame) {
    for (const p of ['width', 'height', 'margin-inline-start', 'background-color'])
      thumb.style.removeProperty(p)
    track?.style.removeProperty('background-color')
    return
  }
  thumb.style.setProperty('width', k(frame.width))
  thumb.style.setProperty('height', k(frame.height))
  thumb.style.setProperty('margin-inline-start', k(frame.centre - frame.width / 2))
  thumb.style.setProperty(
    'background-color',
    lerpColor('var(--db-control-thumb-off)', 'var(--db-control-on-fill)', frame.colour),
  )
  track?.style.setProperty(
    'background-color',
    lerpColor('var(--switch-control-bg)', 'var(--switch-control-bg-checked)', frame.colour),
  )
}

/**
 * Drives a switch's thumb as Flutter's controller does: forward to 1 when it turns on, back to 0
 * when it turns off, over the share of 300ms that is left, painting each frame inside the
 * animation frame itself, so none waits on a React render. The first frame is painted before the
 * browser paints the change, so the rest state never flashes.
 */
export function useSwitchMotion(selected: boolean, thumb: RefObject<HTMLElement | null>) {
  const controller = useRef(selected ? 1 : 0)
  const last = useRef(selected)
  const began = useRef<'forward' | 'reverse' | null>(null)
  const frame = useRef(0)

  useIsomorphicLayoutEffect(() => {
    if (last.current === selected) return
    last.current = selected
    cancelAnimationFrame(frame.current)
    const element = thumb.current
    if (!element) return

    const target = selected ? 1 : 0
    const moving: SwitchStatus = selected ? 'forward' : 'reverse'
    if (reducedMotion(element)) {
      controller.current = target
      began.current = null
      paint(element, null)
      return
    }

    // A switch turned back mid-way keeps the curves it began with.
    began.current ??= moving
    const from = controller.current
    const duration = Math.abs(target - from) * SWITCH_MS
    const started = performance.now()
    paint(element, switchFrame(from, moving, began.current))
    const tick = (now: number) => {
      const done = duration === 0 ? 1 : Math.min(1, Math.max(0, now - started) / duration)
      controller.current = from + (target - from) * done
      if (done >= 1) {
        began.current = null
        paint(element, null)
        return
      }
      paint(element, switchFrame(controller.current, moving, began.current))
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }, [selected])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])
}
