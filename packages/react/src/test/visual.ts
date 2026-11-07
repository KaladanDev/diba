/**
 * Helpers for the browser suite. Everything here needs a rendering engine —
 * resolving a colour, measuring a box — which is exactly what the jsdom suite
 * cannot do.
 */

let probe: CanvasRenderingContext2D | null = null

function canvas(): CanvasRenderingContext2D {
  if (!probe) {
    const element = document.createElement('canvas')
    element.width = element.height = 1
    probe = element.getContext('2d', { willReadFrequently: true })!
  }
  return probe
}

/** Resolve any CSS colour (oklch, color-mix, a variable's value) to sRGB. */
export function toRgb(color: string): [number, number, number] {
  const ctx = canvas()
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 1, 1)
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return [r!, g!, b!]
}

/** The same, keeping the alpha — which is the whole point of a tint. */
export function toRgba(color: string): [number, number, number, number] {
  const ctx = canvas()
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  return [r!, g!, b!, a! / 255]
}

/** True when a colour is fully transparent — the shape the label bug took. */
export function isTransparent(color: string): boolean {
  const match = color.match(/\/\s*0(?:\.0+)?\s*\)/)
  return Boolean(match) || color === 'transparent' || color === 'rgba(0, 0, 0, 0)'
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG contrast ratio between two resolved colours, to two decimals. */
export function contrast(foreground: string, background: string): number {
  const [hi, lo] = [
    relativeLuminance(toRgb(foreground)),
    relativeLuminance(toRgb(background)),
  ].sort((a, b) => b - a)
  return Number(((hi! + 0.05) / (lo! + 0.05)).toFixed(2))
}

/**
 * The colour actually painted behind an element.
 *
 * Every translucent layer up the tree is composited, not just the first one
 * found. A row stripe is a 3% tint of the ink over the surface; handing that
 * tint back on its own makes `toRgb` paint it over black, and the reading comes
 * out at 1.2 — a component failure that is really a measurement one. Alpha is
 * how a tint works, so it has to survive the walk.
 */
export function backgroundBehind(element: Element): string {
  const layers: [number, number, number, number][] = []
  let node: Element | null = element

  while (node) {
    const layer = toRgba(getComputedStyle(node).backgroundColor)
    if (layer[3] > 0) {
      layers.push(layer)
      if (layer[3] >= 1) break // opaque: nothing behind it shows through
    }
    node = node.parentElement
  }

  // Nothing opaque up to the root: the browser canvas is the bottom layer.
  if (!layers.length || layers[layers.length - 1]![3] < 1) layers.push([255, 255, 255, 1])

  let [r, g, b] = layers[layers.length - 1]!
  for (let i = layers.length - 2; i >= 0; i--) {
    const [fr, fg, fb, alpha] = layers[i]!
    r = fr * alpha + r * (1 - alpha)
    g = fg * alpha + g * (1 - alpha)
    b = fb * alpha + b * (1 - alpha)
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

/** Contrast of an element's text against whatever is painted behind it. */
export function textContrast(element: Element): number {
  return contrast(getComputedStyle(element).color, backgroundBehind(element))
}

/** Round a box to whole pixels, which is all these assertions care about. */
export function box(element: Element) {
  const r = element.getBoundingClientRect()
  return {
    top: Math.round(r.top),
    left: Math.round(r.left),
    right: Math.round(r.right),
    bottom: Math.round(r.bottom),
    width: Math.round(r.width),
    height: Math.round(r.height),
  }
}

/** True when the page has grown a horizontal scrollbar — i.e. something escaped. */
export function hasHorizontalOverflow(): boolean {
  const el = document.documentElement
  return el.scrollWidth > el.clientWidth
}

/** Let a CSS transition settle before measuring the end state. */
export function settled(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Wait for every transition and animation on an element to finish.
 *
 * A fixed sleep is a guess about a duration, and it was wrong: `field.css`
 * transitions `background-color` over 250ms, a suite measured at 60ms, and the
 * shared-field comparison failed roughly one full run in three with a colour
 * two or three sRGB units off — a background caught mid-fade, which reads
 * exactly like a component that draws a different box.
 *
 * `getAnimations()` knows what is actually running, so this needs no number.
 * A cancelled animation rejects; that is a finished animation for our
 * purposes.
 */
export async function settledOn(element: Element): Promise<void> {
  await Promise.all(element.getAnimations().map((a) => a.finished.catch(() => undefined)))
}

declare module '@vitest/browser/context' {
  interface BrowserCommands {
    /** The real mouse at a point in the test's frame (vitest.browser.config.ts). */
    pointer: (x: number, y: number, action: 'move' | 'down' | 'up') => Promise<void>
  }
}
