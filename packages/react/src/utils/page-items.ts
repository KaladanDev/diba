/** A slot in the row: a page to go to, or the gap where pages were left out. */
export type PageItem = number | 'ellipsis'

const range = (start: number, end: number): number[] =>
  Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) => start + i)

export interface PageItemsOptions {
  /** The current 1-based page. */
  page: number
  /** How many pages there are. */
  total: number
  /** Pages shown either side of the current one. @default 1 */
  siblings?: number
  /**
   * Pages pinned at each end. Clamped to at least one: a pagination that
   * cannot reach page 1 is not one.
   * @default 1
   */
  boundaries?: number
}

/**
 * Which pages to show, and where the gaps go.
 *
 * Pure, and separate from the component, because this is the part of a
 * pagination that is actually hard — every off-by-one lives here, and none of
 * them need a DOM to find. The window is kept a *constant width* as the reader
 * moves through: the row must not resize under the pointer between page four
 * and page five, which is what a naive `current ± siblings` does at both ends.
 */
export function pageItems({
  page,
  total,
  siblings = 1,
  boundaries = 1,
}: PageItemsOptions): PageItem[] {
  if (total <= 0) return []

  const edge = Math.max(1, boundaries)
  const near = Math.max(0, siblings)
  const current = Math.min(Math.max(page, 1), total)

  // Room for both ends, both sides of the current page, the current page
  // itself, and the two slots the ellipses would have taken. Below this a gap
  // would hide fewer pages than it costs.
  if (total <= edge * 2 + near * 2 + 3) return range(1, total)

  const startPages = range(1, edge)
  const endPages = range(total - edge + 1, total)

  const windowStart = Math.max(Math.min(current - near, total - edge - near * 2 - 1), edge + 2)
  const windowEnd = Math.min(Math.max(current + near, edge + near * 2 + 2), endPages[0]! - 2)

  return [
    ...startPages,
    // A gap that would hide exactly one page is worse than showing it.
    ...(windowStart > edge + 2
      ? (['ellipsis'] as const)
      : edge + 1 < total - edge
        ? [edge + 1]
        : []),
    ...range(windowStart, windowEnd),
    ...(windowEnd < total - edge - 1
      ? (['ellipsis'] as const)
      : total - edge > edge
        ? [total - edge]
        : []),
    ...endPages,
  ]
}
