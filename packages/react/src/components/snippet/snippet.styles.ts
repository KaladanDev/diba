import { tv, type VariantProps } from 'tailwind-variants'

/**
 * Prop → class-name map. All the visual weight lives in `snippet.css`; this
 * only decides which BEM classes land on the element, so every value here is a
 * complete static string — Tailwind cannot see a class assembled at runtime.
 *
 * The block's words, on both platforms: `default` on the second surface, `secondary` outlined.
 */
const variants = {
  variant: {
    default: 'db-snippet--default',
    secondary: 'db-snippet--secondary',
  },
  size: {
    sm: 'db-snippet--sm',
    md: 'db-snippet--md',
    lg: 'db-snippet--lg',
  },
}

export const snippet = tv({
  base: 'db-snippet',
  variants,
  defaultVariants: { variant: 'default', size: 'md' },
})

export type SnippetVariant = NonNullable<VariantProps<typeof snippet>['variant']>
export type SnippetSize = NonNullable<VariantProps<typeof snippet>['size']>

export const snippetOptions = {
  variant: Object.keys(variants.variant) as SnippetVariant[],
  size: Object.keys(variants.size) as SnippetSize[],
}
