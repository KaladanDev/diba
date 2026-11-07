import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { DibaProvider } from '../../provider/DibaProvider'
import { Spacer, spacerOptions } from './Spacer'
import { Stack } from '../stack/Stack'
import { box, settled } from '../../test/visual'

const el = () => document.querySelector<HTMLElement>('[data-slot="spacer"]')!

describe('spacer appearance', () => {
  describe('on the block axis', () => {
    it('pushes what follows down by its size', async () => {
      render(
        <div style={{ width: 200 }}>
          <p style={{ margin: 0 }}>یک</p>
          <Spacer size={8} />
          <p style={{ margin: 0 }} data-testid="after">
            دو
          </p>
        </div>,
      )
      await settled(60)
      // 8 on the shared scale is 2rem.
      expect(box(el()).height).toBe(32)
    })

    it('and takes no width worth speaking of', async () => {
      render(
        <div style={{ width: 200 }}>
          <Spacer size={8} />
        </div>,
      )
      await settled(60)
      expect(box(el()).width).toBeLessThanOrEqual(1)
    })
  })

  describe('on the inline axis', () => {
    it('pushes what follows along by its size', async () => {
      render(
        <div style={{ display: 'flex', width: 300 }}>
          <span>یک</span>
          <Spacer size={8} axis="inline" />
          <span>دو</span>
        </div>,
      )
      await settled(60)
      expect(box(el()).width).toBe(32)
      expect(box(el()).height).toBeLessThanOrEqual(1)
    })

    /**
     * The load-bearing rule. A flex item shrinks to fit, and a spacer's whole
     * content is nothing — so a shrinkable one collapses to zero exactly when
     * the row is tight enough to need it.
     */
    it('and holds its size in a row too tight to hold it', async () => {
      render(
        <div style={{ display: 'flex', width: 90 }}>
          <span style={{ flex: '1 1 auto' }}>یک عبارت نسبتاً بلند</span>
          <Spacer size={8} axis="inline" />
          <span style={{ flex: '1 1 auto' }}>دو</span>
        </div>,
      )
      await settled(60)
      expect(box(el()).width).toBe(32)
    })
  })

  describe('the scale', () => {
    it('is the one Stack uses, step for step', async () => {
      for (const size of spacerOptions.size) {
        const step = Number(size)
        const { unmount } = render(
          <DibaProvider locale="fa-IR" dir="rtl">
            <Stack gap={step as never} data-testid="stack">
              <span>یک</span>
              <span>دو</span>
            </Stack>
            <Spacer size={step as never} />
          </DibaProvider>,
        )
        await settled(20)
        const gap = parseFloat(
          getComputedStyle(document.querySelector('[data-slot="stack"]')!).rowGap,
        )
        expect(box(el()).height, `size ${step}`).toBe(Math.round(gap))
        unmount()
      }
    })

    it('grows from step to step', async () => {
      const heights: number[] = []
      for (const size of [1, 4, 8, 16] as const) {
        const { unmount } = render(<Spacer size={size} />)
        await settled(20)
        heights.push(box(el()).height)
        unmount()
      }
      expect(heights).toEqual([...heights].sort((a, b) => a - b))
      expect(new Set(heights).size).toBe(heights.length)
    })

    it('and zero is genuinely nothing', async () => {
      render(<Spacer size={0} />)
      await settled(20)
      expect(box(el()).height).toBe(0)
    })
  })
})
