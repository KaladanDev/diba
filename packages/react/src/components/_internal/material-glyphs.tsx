/**
 * Material's icons as Flutter draws them, for the blocks whose look is Flutter's: Snippet's
 * copy and its tick. The paths are Material Icons' (Apache License 2.0), on its 24 square, each
 * checked pixel for pixel against the glyph Flutter draws from its MaterialIcons font.
 */
const PATHS = {
  /** `Icons.copy`, content_copy. */
  copy: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
  /** `Icons.check`. */
  check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
} as const

export type MaterialGlyphName = keyof typeof PATHS

/** One of Material's icons, [size] square, in the text's colour. Decorative. */
export function MaterialGlyph({
  name,
  size,
  className,
}: {
  name: MaterialGlyphName
  size: number
  className?: string
}) {
  return (
    <svg
      aria-hidden="true"
      data-glyph={name}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
