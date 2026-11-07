import { createElement, type CSSProperties } from 'react'
import { useLocale } from 'react-aria-components'
import { Image } from '../../components/image/Image'
import { Snippet } from '../../components/snippet/Snippet'
import { formatNumber } from '../format'
import type { Block } from '../node'
import { propsOf } from './common'

/**
 * Group 7, Diba's own blocks: layout, words and pictures, drawn with their own
 * styles in the copy's tokens, so a host needs no utility classes for them.
 */

/** A space token, 0 to 16: a quarter of a rem each, as v3's spacing counts. */
const space = (token: unknown, fallback = 4) => `${(Number(token ?? fallback) || 0) * 0.25}rem`

const ALIGN: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
}
const JUSTIFY: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
}

const StackBlock: Block = ({ node }) => {
  const p = propsOf(node)
  return (
    <div
      data-slot="stack"
      style={{
        display: 'flex',
        flexDirection: p.direction === 'horizontal' ? 'row' : 'column',
        gap: space(p.gap),
        alignItems: ALIGN[p.align] ?? 'stretch',
        justifyContent: JUSTIFY[p.justify] ?? 'flex-start',
        flexWrap: p.wrap ? 'wrap' : 'nowrap',
      }}
    >
      {node.children}
    </div>
  )
}

/** v3's type scale: a size and its line, in pixels. */
const SIZE: Record<string, [number, number]> = {
  xs: [12, 16],
  sm: [14, 20],
  md: [16, 24],
  lg: [18, 28],
  xl: [20, 28],
  '2xl': [24, 32],
  '3xl': [30, 36],
  '4xl': [36, 40],
  '5xl': [48, 48],
}
const LEADING: Record<string, number | undefined> = {
  tight: 1.25,
  snug: 1.375,
  normal: undefined,
  relaxed: 1.625,
}
const WEIGHT: Record<string, number> = { normal: 400, medium: 500, semibold: 600, bold: 700 }
/** The copy's text colours: an ink for each tone, readable on a surface. */
const TONE: Record<string, string> = {
  default: 'var(--foreground)',
  muted: 'var(--muted)',
  accent: 'var(--accent-soft-foreground)',
  success: 'var(--success-soft-foreground)',
  warning: 'var(--warning-soft-foreground)',
  danger: 'var(--danger-soft-foreground)',
}

/** Words, or a number in the reader's digits; a heading when it has a level. */
const TextBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const { locale } = useLocale()
  const [size, line] = SIZE[p.size] ?? SIZE.md!
  const level = Math.round(Number(p.headingLevel))
  const lines = Math.round(Number(p.maxLines))
  const words =
    typeof p.number === 'number'
      ? formatNumber(p.number, locale, {
          style: p.formatStyle,
          currency: p.currency,
          maximumFractionDigits: p.maximumFractionDigits,
        })
      : node.text
  const style: CSSProperties = {
    margin: 0,
    fontSize: size,
    lineHeight: LEADING[p.leading] ?? `${line}px`,
    fontWeight: WEIGHT[p.weight] ?? 400,
    color: TONE[p.tone] ?? TONE.default,
    textAlign: p.align,
    ...(p.isMono
      ? {
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          fontVariantNumeric: 'tabular-nums',
        }
      : null),
    ...(lines >= 1
      ? {
          display: '-webkit-box',
          WebkitLineClamp: lines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }
      : null),
  }
  return createElement(
    level >= 1 && level <= 6 ? `h${level}` : 'span',
    {
      'data-slot': 'text',
      dir: p.dir === 'ltr' ? 'ltr' : undefined,
      style: lines >= 1 ? style : { ...style, display: style.display ?? 'block' },
    },
    words,
  )
}

const ImageBlock: Block = ({ node }) => {
  const p = propsOf(node)
  return (
    <Image
      src={p.src}
      alt={p.alt ?? ''}
      // No ratio, the picture's own shape, as Flutter's.
      ratio={p.ratio ?? 'auto'}
      fit={p.fit}
      radius={p.radius}
      isZoomable={p.isZoomable}
    />
  )
}

const SpacerBlock: Block = ({ node }) => {
  const p = propsOf(node)
  return (
    <div
      aria-hidden
      data-slot="spacer"
      style={{ flexShrink: 0, [p.axis === 'inline' ? 'width' : 'height']: space(p.size) }}
    />
  )
}

/** A key or a URL with its copy button; v3's surface words for its look. */
const SnippetBlock: Block = ({ node }) => {
  const p = propsOf(node)
  return (
    <Snippet
      variant={p.variant === 'secondary' ? 'secondary' : 'default'}
      size={p.size}
      // No symbol unless the tree gives one, as Flutter's.
      symbol={p.symbol}
      hideSymbol={p.hideSymbol}
      hideCopyButton={p.hideCopyButton}
      copyText={p.copyText}
      onCopy={node.on.onCopy ? (text: string) => void node.fire('onCopy', text) : undefined}
    >
      {node.text ?? ''}
    </Snippet>
  )
}

/** The scales the blocks draw their enums with, for the contract test to hold the schema to. */
export const ownScales = {
  ALIGN,
  JUSTIFY,
  SIZE,
  LEADING,
  WEIGHT,
  TONE,
}

export const ownBlocks: Record<string, Block> = {
  Stack: StackBlock,
  Text: TextBlock,
  Image: ImageBlock,
  Spacer: SpacerBlock,
  Snippet: SnippetBlock,
}
