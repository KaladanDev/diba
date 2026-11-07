import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/**
 * What the Foundations pages draw with: every value they show is read from the page as the
 * browser resolved it, from the same stylesheet an app loads, so a page cannot say one thing while
 * the components do another. Nothing here ships in the package.
 */

/** sRGB channels 0–255 and alpha 0–1 of a CSS colour the browser has resolved, or null. */
export function rgbaOf(colour: string): [number, number, number, number] | null {
  const c = colour.trim()
  let m = c.match(/^rgba?\(([^)]+)\)$/)
  if (m) {
    const parts = m[1]!
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(Number)
    return [parts[0]!, parts[1]!, parts[2]!, parts[3] ?? 1]
  }
  m = c.match(/^oklch\(([^)]+)\)$/)
  if (m) {
    const [lPart, cPart, hPart, aPart] = m[1]!.split(/[\s/]+/).filter(Boolean)
    const L = lPart!.endsWith('%') ? parseFloat(lPart!) / 100 : parseFloat(lPart!)
    const C = parseFloat(cPart!)
    const hue = (parseFloat(hPart!) || 0) * (Math.PI / 180)
    const a = C * Math.cos(hue)
    const b = C * Math.sin(hue)
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b
    const s_ = L - 0.0894841775 * a - 1.291485548 * b
    const l = l_ ** 3
    const mm = m_ ** 3
    const s = s_ ** 3
    const lin = [
      4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
    ]
    const gamma = (v: number) =>
      Math.round(
        255 * Math.min(1, Math.max(0, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)),
      )
    const alpha = aPart ? (aPart.endsWith('%') ? parseFloat(aPart) / 100 : parseFloat(aPart)) : 1
    return [gamma(lin[0]!), gamma(lin[1]!), gamma(lin[2]!), alpha]
  }
  m = c.match(/^#([0-9a-f]{6})$/i)
  if (m) {
    const n = parseInt(m[1]!, 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1]
  }
  return null
}

/** `#rrggbb`, or `#rrggbb · 50%` for a colour with alpha. */
export function hexOf(colour: string): string {
  const rgba = rgbaOf(colour)
  if (!rgba) return ''
  const hex =
    '#' +
    rgba
      .slice(0, 3)
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  return rgba[3] < 1 ? `${hex} · ${Math.round(rgba[3] * 100)}%` : hex
}

function luminance([r, g, b]: [number, number, number, number]) {
  const ch = (v: number) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

/** WCAG contrast of two opaque colours, to one decimal, or null when either is unknown. */
export function contrastOf(a: string, b: string): number | null {
  const x = rgbaOf(a)
  const y = rgbaOf(b)
  if (!x || !y) return null
  const [hi, lo] = [luminance(x), luminance(y)].sort((p, q) => q - p) as [number, number]
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 10) / 10
}

/** The palette the theme draws from, by name, as `#rrggbb` → `slate-200`. */
const SCALES: Record<string, (string | number)[]> = {
  slate: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  saffron: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  iris: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  paper: [0, 50, 100, 200],
  emerald: [400, 500, 600, 700],
  garnet: [300, 400, 500, 600, 700],
  orange: [400, 500, 600, 700, 800],
  sky: [400, 500, 600, 700],
}
export const palette = SCALES

/**
 * Reads what the browser resolved for each variable on an element of its own, inside the theme
 * it is drawn in; re-read when [deps] change. Empty strings outside a browser (jsdom resolves no
 * stylesheet).
 */
export function useResolved(
  variables: string[],
  property:
    'backgroundColor' | 'color' | 'boxShadow' | 'borderRadius' | 'fontFamily' = 'backgroundColor',
) {
  const probe = useRef<HTMLSpanElement>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const key = variables.join('|')
  useLayoutEffect(() => {
    const el = probe.current
    if (!el) return
    const out: Record<string, string> = {}
    for (const v of variables) {
      el.style.setProperty(
        property === 'backgroundColor'
          ? 'background-color'
          : property === 'color'
            ? 'color'
            : property === 'boxShadow'
              ? 'box-shadow'
              : property === 'borderRadius'
                ? 'border-radius'
                : 'font-family',
        `var(${v})`,
      )
      out[v] = getComputedStyle(el)[property]
    }
    setValues(out)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, property])
  const element = (
    <span ref={probe} aria-hidden style={{ position: 'absolute', width: 0, height: 0 }} />
  )
  return [values, element] as const
}

/** The palette step a colour is, `slate-200`, or '' when it is none of them. */
export function useStepNames() {
  const variables = Object.entries(SCALES).flatMap(([scale, steps]) =>
    steps.map((s) => `--db-${scale}-${s}`),
  )
  const [values, probe] = useResolved(variables)
  const byHex = new Map<string, string>()
  for (const [v, c] of Object.entries(values)) {
    const hex = hexOf(c)
    if (hex && !byHex.has(hex)) byHex.set(hex, v.replace('--db-', ''))
  }
  return [(colour: string) => byHex.get(hexOf(colour)) ?? '', probe] as const
}

/** A value as code, left to right on either page. */
export function Mono({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <code
      dir="ltr"
      style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 12,
        unicodeBidi: 'isolate',
        ...style,
      }}
    >
      {children}
    </code>
  )
}

/** A ratio, marked as passing or not against the bar it is held to. */
export function Ratio({ value, bar = 4.5 }: { value: number | null; bar?: number }) {
  if (value == null) return null
  const ok = value >= bar
  return (
    <span
      dir="ltr"
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: ok ? 'var(--db-success-emphasis)' : 'var(--db-danger-emphasis)',
        unicodeBidi: 'isolate',
      }}
    >
      {value.toFixed(1)}:1 {ok ? '✓' : '✗'}
    </span>
  )
}
