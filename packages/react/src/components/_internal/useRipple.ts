import { useCallback, useRef, useState, useSyncExternalStore, type RefObject } from 'react'
import type { PressEvent } from 'react-aria-components'

export interface Ripple {
  key: number
  /** Offset of the circle's top-left corner from the host's top-left, in px. */
  x: number
  y: number
  size: number
  /** Seconds — a bigger circle has further to travel, so it gets longer. */
  duration: number
}

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

const supportsMatchMedia = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'

function subscribe(onChange: () => void) {
  if (!supportsMatchMedia()) return () => {}
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/**
 * Tracks the OS "reduce motion" setting, live. The CSS honours it too; this is
 * for the JS side, so a user who asked for less motion never even pays for the
 * ripple nodes.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => (supportsMatchMedia() ? window.matchMedia(REDUCED_MOTION).matches : false),
    () => false, // server render: assume motion is fine, the client corrects it
  )
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)

/**
 * A press ripple for buttons, cards and list items.
 *
 * Each circle is a plain element running
 * one CSS keyframe animation and removing itself on `animationend`. Same feel,
 * no animation library in the dependency tree — which matters for a package
 * that ships precompiled CSS.
 *
 * `host` is the element the circles are positioned against, which is not always
 * the press target: a press that lands on a child (an icon, a label span) gives
 * coordinates relative to *that* child, so they get corrected here.
 */
export function useRipple(enabled: boolean, host: RefObject<HTMLElement | null>) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const nextKey = useRef(0)

  const onPress = useCallback(
    (event: PressEvent) => {
      const element = host.current
      if (!enabled || !element) return

      const size = Math.max(element.clientWidth, element.clientHeight)
      if (size === 0) return // not laid out (jsdom, `display: none`)

      // Keyboard and virtual presses carry no coordinates; a circle growing out
      // of the top-left corner reads as a glitch, so those start from the centre.
      const positional = event.pointerType !== 'keyboard' && event.pointerType !== 'virtual'
      let originX = element.clientWidth / 2
      let originY = element.clientHeight / 2

      if (positional) {
        originX = event.x
        originY = event.y
        const target = event.target as HTMLElement | null
        if (target && target !== element && element.contains(target)) {
          const from = target.getBoundingClientRect()
          const to = element.getBoundingClientRect()
          originX += from.left - to.left
          originY += from.top - to.top
        }
      }

      setRipples((current) => [
        ...current,
        {
          key: nextKey.current++,
          size,
          x: originX - size / 2,
          y: originY - size / 2,
          duration: clamp(0.01 * size, 0.2, size > 100 ? 0.75 : 0.5),
        },
      ])
    },
    [enabled, host],
  )

  const onComplete = useCallback((key: number) => {
    setRipples((current) => current.filter((ripple) => ripple.key !== key))
  }, [])

  return { ripples, onPress, onComplete }
}
