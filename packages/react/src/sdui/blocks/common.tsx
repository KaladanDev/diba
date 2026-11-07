import { createContext, type ReactNode } from 'react'
import { useLocale } from 'react-aria-components'
import { Description } from '../../components/description'
import { FieldError } from '../../components/field-error'
import { Label } from '../../components/label'
import { fieldErrorVariants } from '../../styles/recipes'
import { dibaIcons, dibaMirroredIcons } from '../icons.g'
import { sayer, type Say } from '../messages'
import type { NodeContext } from '../node'

/** A tree's props, read loosely: the schema has already said what each holds. */
export type Props = Record<string, any>

export const propsOf = (node: { props: Record<string, unknown> }) => node.props as Props

/** Diba's own words in the reader's language. */
export function useSay(): Say {
  return sayer(useLocale().locale)
}

/**
 * An icon from the list, by its kebab-case name.
 *
 * Trees name icons as for left-to-right; a mirrored one turns to face the
 * other way on a right-to-left page, so `arrow-right` means "next" on both.
 */
export function Icon({ name, size = 16 }: { name?: unknown; size?: number }) {
  const { direction } = useLocale()
  if (typeof name !== 'string') return null
  const Glyph = dibaIcons[name]
  if (!Glyph) return null
  const flip = direction === 'rtl' && dibaMirroredIcons.has(name)
  return (
    <Glyph
      size={size}
      aria-hidden
      data-slot="icon"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    />
  )
}

/** The message a field shows: the server's, else its own client check's. */
export const errorOf = (node: NodeContext): string | undefined =>
  (propsOf(node).errorMessage as string | undefined) ?? node.clientError ?? undefined

/**
 * A field's label, help and error around its control, as v3 draws them: the
 * label above, help and error under. `isLabelHidden` keeps the label for
 * a screen reader only, through the field's `aria-label`.
 */
export function FieldParts({ node, children }: { node: NodeContext; children: ReactNode }) {
  const p = propsOf(node)
  const error = errorOf(node)
  return (
    <>
      {p.label && !p.isLabelHidden ? <Label>{p.label}</Label> : null}
      {children}
      {p.description ? <Description>{p.description}</Description> : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </>
  )
}

/** The `aria-label` a field takes when its label is hidden. */
export const hiddenLabel = (node: NodeContext): string | undefined => {
  const p = propsOf(node)
  return p.isLabelHidden ? p.label : undefined
}

/**
 * An error under a control React Aria does not validate — a switch, a toggle
 * group, a tag group — drawn as FieldError draws one, red.
 */
export function ErrorText({ children, id }: { children?: string; id?: string }) {
  if (!children) return null
  return (
    <span id={id} className={fieldErrorVariants()} data-slot="field-error" data-visible>
      {children}
    </span>
  )
}

/** The first two words' first letters, Latin ones in capitals: as dumb as the Flutter side's, on purpose. */
export function initials(name: unknown): string {
  if (typeof name !== 'string') return ''
  // A zero-width non-joiner between them, so two Persian letters stay two
  // letters: «ن‌ر», where «نر» would read as a word.
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => [...w][0]!.toUpperCase())
    .join('\u200c')
}

/** The five of Diba's hues a name's avatar takes, in the order {@link hueOf} counts them. */
export const nameHues = ['saffron', 'garnet', 'emerald', 'sky', 'iris'] as const

/**
 * The hue a name always gets. The hash stays under 2^53 at every step, so Flutter's,
 * compiled to JavaScript or not, counts the same.
 */
export function hueOf(name: string): (typeof nameHues)[number] {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 1000003
  return nameHues[h % nameHues.length]!
}

/**
 * The schema's placements, a side then where along it, in React Aria's words.
 * Along a start or end side, start and end mean top and bottom.
 */
export function placementOf(value: unknown): any {
  if (typeof value !== 'string') return undefined
  const [side, along] = value.split(/[\s-]+/)
  if (!along) return side
  if (side === 'start' || side === 'end') {
    return `${side} ${along === 'start' ? 'top' : along === 'end' ? 'bottom' : along}`
  }
  return `${side} ${along}`
}

/** The block for a node that only its parent draws: a Select's option, a Table's row. */
export function Nothing() {
  return null
}

/**
 * What a ButtonGroup block gives its buttons: its size, variant, disabled state and width,
 * for each button that sets none of its own. The original's group hands them only to its direct
 * children, and a tree's buttons are blocks, so the block hands them on itself.
 */
export const ButtonGroupBlockContext = createContext<{
  size?: unknown
  variant?: unknown
  isDisabled?: unknown
  fullWidth?: unknown
} | null>(null)
