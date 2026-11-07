import { describe, it, expect } from 'vitest'
import { pageItems, type PageItem } from './page-items'

const pages = (items: PageItem[]) => items.filter((i): i is number => i !== 'ellipsis')

describe('pageItems', () => {
  it('shows everything while everything fits', () => {
    expect(pageItems({ page: 1, total: 7 })).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  /**
   * Ten pages, one sibling, one pinned end: seven slots, at every page. The
   * window slides and the gaps move from one side to the other, but the row
   * never changes width — which is the whole reason the near-the-edge case
   * shows *five* consecutive pages rather than the three a naive
   * `current ± siblings` would give.
   */
  it('slides a constant-width window along the list', () => {
    expect(pageItems({ page: 1, total: 10 })).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10])
    expect(pageItems({ page: 5, total: 10 })).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10])
    expect(pageItems({ page: 10, total: 10 })).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10])
  })

  /**
   * A gap standing in for exactly one page costs a slot and saves nothing, and
   * reads as if pages are missing. At page 1 that page is 2; at page 10 it is 9.
   */
  it('shows the page rather than a gap that would hide only it', () => {
    expect(pageItems({ page: 1, total: 10 })).toContain(2)
    expect(pageItems({ page: 10, total: 10 })).toContain(9)
  })

  it('takes a wider window and more pinned ends', () => {
    expect(pageItems({ page: 10, total: 20, siblings: 2 })).toEqual([
      1,
      'ellipsis',
      8,
      9,
      10,
      11,
      12,
      'ellipsis',
      20,
    ])
    expect(pageItems({ page: 10, total: 20, boundaries: 2 })).toEqual([
      1,
      2,
      'ellipsis',
      9,
      10,
      11,
      'ellipsis',
      19,
      20,
    ])
  })

  describe('edges', () => {
    it('has nothing to show for nothing', () => {
      expect(pageItems({ page: 1, total: 0 })).toEqual([])
      expect(pageItems({ page: 1, total: -3 })).toEqual([])
    })

    it('is a single page for a single page', () => {
      expect(pageItems({ page: 1, total: 1 })).toEqual([1])
    })

    it('survives a page outside the range it was given', () => {
      expect(pageItems({ page: 0, total: 10 })).toEqual(pageItems({ page: 1, total: 10 }))
      expect(pageItems({ page: 99, total: 10 })).toEqual(pageItems({ page: 10, total: 10 }))
    })

    /** A pagination that cannot reach page 1 is not one. */
    it('pins at least one page at each end however it is configured', () => {
      const items = pageItems({ page: 50, total: 100, boundaries: 0 })
      expect(items.at(0)).toBe(1)
      expect(items.at(-1)).toBe(100)
    })
  })

  /**
   * The invariants that matter more than any single expected array. Swept
   * across every page of several list lengths and window widths, because the
   * bugs in this function are all off-by-one at a boundary and none of them
   * need a browser to find.
   */
  describe('across every page of every shape', () => {
    const shapes = [
      { total: 1 },
      { total: 2 },
      { total: 5 },
      { total: 7 },
      { total: 8 },
      { total: 10 },
      { total: 11 },
      { total: 25 },
      { total: 100 },
      { total: 25, siblings: 0 },
      { total: 25, siblings: 3 },
      { total: 25, boundaries: 2 },
      { total: 25, siblings: 2, boundaries: 3 },
    ]

    for (const shape of shapes) {
      const name = `total=${shape.total} siblings=${shape.siblings ?? 1} boundaries=${shape.boundaries ?? 1}`

      it(`${name}: always reaches both ends and the page you are on`, () => {
        for (let page = 1; page <= shape.total; page++) {
          const items = pageItems({ ...shape, page })
          expect(items.at(0), `${name} page=${page}: first`).toBe(1)
          expect(items.at(-1), `${name} page=${page}: last`).toBe(shape.total)
          expect(pages(items), `${name} page=${page}: current`).toContain(page)
        }
      })

      it(`${name}: stays sorted, unique, and never shows two gaps in a row`, () => {
        for (let page = 1; page <= shape.total; page++) {
          const items = pageItems({ ...shape, page })
          const nums = pages(items)
          expect(nums, `${name} page=${page}: sorted`).toEqual([...nums].sort((a, b) => a - b))
          expect(new Set(nums).size, `${name} page=${page}: unique`).toBe(nums.length)
          expect(
            items.some((it, i) => it === 'ellipsis' && items[i + 1] === 'ellipsis'),
            `${name} page=${page}: adjacent gaps`,
          ).toBe(false)
          for (const n of nums) {
            expect(n, `${name} page=${page}: in range`).toBeGreaterThanOrEqual(1)
            expect(n, `${name} page=${page}: in range`).toBeLessThanOrEqual(shape.total)
          }
        }
      })

      /**
       * The one a reader actually feels: the row must not resize under the
       * pointer as they step through it, or the button they were aiming at
       * moves out from under them.
       */
      it(`${name}: keeps the row a constant width`, () => {
        const widths = new Set<number>()
        for (let page = 1; page <= shape.total; page++) {
          widths.add(pageItems({ ...shape, page }).length)
        }
        expect([...widths], `${name}: slot counts seen`).toHaveLength(1)
      })
    }
  })
})
