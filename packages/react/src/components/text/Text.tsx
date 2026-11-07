import type { ComponentPropsWithoutRef, ElementType, Ref } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

/**
 * Drawn by its own rules (text.css): the scale, weights and colours a tree's Text block draws,
 * each size with its own line and each tone a colour that reads on a surface. No utility class, so
 * it draws in any host. `primary` is the accent's colour, kept for the name it had.
 */
const variants = {
  size: {
    xs: 'db-text--xs',
    sm: 'db-text--sm',
    md: 'db-text--md',
    lg: 'db-text--lg',
    xl: 'db-text--xl',
    '2xl': 'db-text--2xl',
    '3xl': 'db-text--3xl',
    '4xl': 'db-text--4xl',
    '5xl': 'db-text--5xl',
  },
  weight: {
    normal: 'db-text--normal',
    medium: 'db-text--medium',
    semibold: 'db-text--semibold',
    bold: 'db-text--bold',
  },
  tone: {
    default: 'db-text--default',
    muted: 'db-text--muted',
    primary: 'db-text--primary',
    accent: 'db-text--accent',
    success: 'db-text--success',
    warning: 'db-text--warning',
    danger: 'db-text--danger',
  },
  align: {
    start: 'db-text--start',
    center: 'db-text--center',
    end: 'db-text--end',
  },
  leading: {
    tight: 'db-text--tight',
    snug: 'db-text--snug',
    normal: 'db-text--leading-normal',
    relaxed: 'db-text--relaxed',
  },
  truncate: {
    true: 'db-text--truncate',
  },
}

const text = tv({
  base: 'db-text',
  variants,
  defaultVariants: {
    size: 'md',
    weight: 'normal',
    tone: 'default',
    leading: 'normal',
  },
})

/** The values each enum prop accepts — derived from the variant config; consumed by the contract drift test. */
export const textOptions = {
  size: Object.keys(variants.size),
  weight: Object.keys(variants.weight),
  tone: Object.keys(variants.tone),
  align: Object.keys(variants.align),
  leading: Object.keys(variants.leading),
}

export interface TextProps
  extends Omit<ComponentPropsWithoutRef<'span'>, 'color'>, VariantProps<typeof text> {
  as?: ElementType
  /** Typed for the default `span`; `as` widens the element, so the cast below stands in. */
  ref?: Ref<HTMLElement>
}

/** Words in the type scale: a size, a weight and a colour that mean the same on every page. */
export function Text({
  as: As = 'span',
  size,
  weight,
  tone,
  align,
  leading,
  truncate,
  className,
  ref,
  ...props
}: TextProps) {
  return (
    <As
      ref={ref as never}
      data-slot="text"
      className={text({ size, weight, tone, align, leading, truncate, className })}
      {...props}
    />
  )
}
