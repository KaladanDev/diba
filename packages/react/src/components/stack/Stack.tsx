import type { ComponentPropsWithoutRef, ElementType, Ref } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

/**
 * Blocks in a column or a row, a gap apart. Drawn by its own rules (stack.css), from Diba's space
 * tokens, as a tree's Stack block draws it: no utility class, so it draws in any host. A row runs
 * as the page reads, from the right on a Persian page, with no rule of its own for it.
 */
const variants = {
  direction: {
    vertical: 'db-stack--vertical',
    horizontal: 'db-stack--horizontal',
  },
  gap: {
    0: 'db-stack--gap-0',
    1: 'db-stack--gap-1',
    2: 'db-stack--gap-2',
    3: 'db-stack--gap-3',
    4: 'db-stack--gap-4',
    5: 'db-stack--gap-5',
    6: 'db-stack--gap-6',
    8: 'db-stack--gap-8',
    10: 'db-stack--gap-10',
    12: 'db-stack--gap-12',
    16: 'db-stack--gap-16',
  },
  align: {
    start: 'db-stack--align-start',
    center: 'db-stack--align-center',
    end: 'db-stack--align-end',
    stretch: 'db-stack--align-stretch',
    baseline: 'db-stack--align-baseline',
  },
  justify: {
    start: 'db-stack--justify-start',
    center: 'db-stack--justify-center',
    end: 'db-stack--justify-end',
    between: 'db-stack--justify-between',
    around: 'db-stack--justify-around',
  },
  wrap: {
    true: 'db-stack--wrap',
    false: '',
  },
}

const stack = tv({
  base: 'db-stack',
  variants,
  defaultVariants: {
    direction: 'vertical',
    gap: 4,
    align: 'stretch',
    justify: 'start',
    wrap: false,
  },
})

/** The values each enum prop accepts — derived from the variant config; consumed by the contract drift test. */
export const stackOptions = {
  direction: Object.keys(variants.direction),
  gap: Object.keys(variants.gap),
  align: Object.keys(variants.align),
  justify: Object.keys(variants.justify),
}

export interface StackProps extends ComponentPropsWithoutRef<'div'>, VariantProps<typeof stack> {
  as?: ElementType
  /** Typed for the default `div`; `as` widens the element, so the cast below stands in. */
  ref?: Ref<HTMLDivElement>
}

export function Stack({
  as: As = 'div',
  direction,
  gap,
  align,
  justify,
  wrap,
  className,
  ref,
  ...props
}: StackProps) {
  return (
    <As
      ref={ref as never}
      data-slot="stack"
      className={stack({ direction, gap, align, justify, wrap, className })}
      {...props}
    />
  )
}
