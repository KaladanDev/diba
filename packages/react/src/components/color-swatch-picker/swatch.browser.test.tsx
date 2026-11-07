import { describe, it, expect, afterEach } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { DibaProvider } from '../../provider/DibaProvider'
import { contrast, settled } from '../../test/visual'
import { ColorSwatchPicker } from './index'

/**
 * The chosen swatch's tick is clear on its colour: black on a light one, white on the rest, by
 * relative luminance as Flutter's is. The original's rule for the black tick named the indicator twice
 * and matched nothing, so on cream or gold the white tick vanished (2026-11-06).
 */

afterEach(cleanup)

const colours = [
  ['cream', '#f4efe6', 'black'],
  ['gold', '#e7c873', 'black'],
  ['saffron', '#c9821f', 'black'],
  ['grey', '#9ca3af', 'black'],
  ['slate', '#64748b', 'white'],
  ['navy', '#2f4a6b', 'white'],
  ['maroon', '#8c2f39', 'white'],
] as const

describe('the tick on the chosen swatch', () => {
  for (const [name, hex, ink] of colours) {
    it(`${name}: ${ink}, and at least 4.5 from the colour`, async () => {
      render(
        <DibaProvider locale="fa-IR" dir="rtl" ownsDocument={false}>
          <ColorSwatchPicker aria-label="رنگ" value={hex} size="xl">
            <ColorSwatchPicker.Item color={hex}>
              <ColorSwatchPicker.Swatch />
              <ColorSwatchPicker.Indicator />
            </ColorSwatchPicker.Item>
          </ColorSwatchPicker>
        </DibaProvider>,
      )
      await settled(300)
      const tick = document.querySelector<SVGElement>(
        '[data-slot="color-swatch-picker-checkmark"]',
      )!
      const swatch = document.querySelector<HTMLElement>(
        '[data-slot="color-swatch-picker-swatch"]',
      )!
      const drawn = getComputedStyle(tick).color
      expect(drawn).toBe(ink === 'black' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)')
      expect(contrast(drawn, getComputedStyle(swatch).backgroundColor)).toBeGreaterThanOrEqual(4.5)
    })
  }
})
