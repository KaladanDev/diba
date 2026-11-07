import { describe, expect, it } from 'vitest'
import { switchFrame, thumbSize } from './switch-motion'

/**
 * Flutter's M3 switch, frame by frame: the numbers `_SwitchPainter` draws from its one
 * 300ms controller. The browser test films the same thing on the page.
 */
describe('the switch, as Flutter paints it', () => {
  it('stretches the thumb into a 34-by-22 pill early, and lands it round', () => {
    expect(thumbSize(0, true)).toEqual([16, 16])
    expect(thumbSize(0.11, true)).toEqual([34, 22])
    const mid = thumbSize(0.5, true)
    expect(mid[0]).toBeGreaterThan(mid[1])
    expect(thumbSize(0.83, true)).toEqual([24, 24])
    expect(thumbSize(1, true)).toEqual([24, 24])
  })

  it('does the same backwards going off: still at first, a pill, then small', () => {
    expect(thumbSize(1, false)[0]).toBeCloseTo(24, 3)
    expect(thumbSize(0.89, false)).toEqual([34, 22])
    expect(thumbSize(0.17, false)).toEqual([16, 16])
    expect(thumbSize(0.05, false)).toEqual([16, 16])
  })

  it('carries the thumb a little past its end either way, on easeOutBack', () => {
    const on = [0.3, 0.5, 0.7, 0.9].map((v) => switchFrame(v, 'forward').centre)
    expect(Math.max(...on)).toBeGreaterThan(36)
    const off = [0.1, 0.3, 0.5, 0.7].map((v) => switchFrame(v, 'reverse').centre)
    expect(Math.min(...off)).toBeLessThan(16)
    expect(switchFrame(1, 'completed').centre).toBe(36)
    expect(switchFrame(0, 'dismissed').centre).toBe(16)
  })

  it('turns most of the colour first: easeOut on, easeIn off', () => {
    expect(switchFrame(0.5, 'forward').colour).toBeGreaterThan(0.6)
    // Going off the controller runs 1 to 0; halfway, the colour has left more than half.
    expect(switchFrame(0.5, 'reverse').colour).toBeLessThan(0.4)
  })

  it('keeps the curves it began with when turned back mid-way', () => {
    expect(switchFrame(0.4, 'reverse', 'forward')).toEqual({
      ...switchFrame(0.4, 'forward'),
      ...{ width: thumbSize(0.4, false)[0], height: thumbSize(0.4, false)[1] },
    })
  })
})
