import type { CSSProperties, Ref } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

/**
 * The same scale Stack's `gap` uses. Complete static strings, because Tailwind
 * cannot see a class assembled at runtime.
 */
const variants = {
  size: {
    0: 'db-spacer--0',
    1: 'db-spacer--1',
    2: 'db-spacer--2',
    3: 'db-spacer--3',
    4: 'db-spacer--4',
    5: 'db-spacer--5',
    6: 'db-spacer--6',
    8: 'db-spacer--8',
    10: 'db-spacer--10',
    12: 'db-spacer--12',
    16: 'db-spacer--16',
  },
  axis: { block: 'db-spacer--block', inline: 'db-spacer--inline' },
}

const spacer = tv({ base: 'db-spacer', variants, defaultVariants: { size: 4, axis: 'block' } })

export type SpacerSize = NonNullable<VariantProps<typeof spacer>['size']>
export type SpacerAxis = NonNullable<VariantProps<typeof spacer>['axis']>

/**
 * Keys, not numbers — matching Stack, whose `gap` is the same scale. The
 * contract test compares these against the manifest's advertised values, and
 * the manifest is JSON, where an enum of steps is a list of names.
 */
export const spacerOptions = {
  size: Object.keys(variants.size),
  axis: Object.keys(variants.axis),
}

export interface SpacerProps {
  /**
   * A step on the same scale as Stack's `gap`, so a spacer and a gap of the
   * same number are the same distance.
   * @default 4
   */
  size?: SpacerSize
  /**
   * Which way it pushes. `block` for a gap between stacked things, `inline`
   * for one between things in a row — logical, so it does not need mirroring
   * for Persian.
   * @default 'block'
   */
  axis?: SpacerAxis
  className?: string
  style?: CSSProperties
  ref?: Ref<HTMLSpanElement>
}

/**
 * Empty space, on purpose.
 *
 * Reach for `Stack`'s `gap` first. A gap is a property of the group, so adding
 * or removing something inside it cannot leave a spacer stranded against a
 * heading it no longer separates — which is the failure mode this component
 * has, and the reason it is not the default answer to "these are too close
 * together".
 *
 * Where it earns its place is the one-off: a single extra breath before a
 * footer, a push in a row that no gap describes because it belongs to one item
 * rather than to the row. For that, a named step on the shared scale beats a
 * hand-written margin nobody will ever find again.
 *
 * Hidden from assistive technology, because it is not there.
 */
export function Spacer({ size, axis, className, style, ref }: SpacerProps) {
  return (
    <span
      ref={ref}
      aria-hidden
      data-slot="spacer"
      className={spacer({ size, axis, className })}
      style={style}
    />
  )
}
