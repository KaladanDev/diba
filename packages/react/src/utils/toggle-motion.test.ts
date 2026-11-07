import { describe, it, expect } from 'vitest'
import { checkPath, dashPath, easeIn, easeOut, paintCheckbox } from './toggle-motion'

/**
 * The port of Flutter's toggle motion and `_CheckboxPainter`, held to Flutter's own formulas at
 * the moments they change: rest, the colour turning by a quarter, the squeeze at mid-turn, and
 * the check's two strokes.
 */
describe('the curves', () => {
  it('are Flutter’s easeIn and easeOut: slow then fast, and fast then slow', () => {
    expect(easeIn(0)).toBe(0)
    expect(easeIn(1)).toBe(1)
    expect(easeIn(0.5)).toBeCloseTo(0.315, 2)
    expect(easeOut(0.5)).toBeCloseTo(0.685, 2)
  })
})

describe('paintCheckbox', () => {
  const at = (position: number, status: 'forward' | 'reverse' | 'completed' | 'dismissed') => ({
    position,
    status,
  })

  it('rests empty with a 2px edge, and checked as a full box with the whole tick', () => {
    expect(paintCheckbox(false, false, at(0, 'dismissed'))).toEqual({
      inset: 0,
      size: 18,
      fill: 0,
      edgeWidth: 2,
      edgeFade: 0,
      mark: null,
    })
    expect(paintCheckbox(true, true, at(1, 'completed'))).toMatchObject({
      inset: 0,
      size: 18,
      fill: 1,
      edgeWidth: 0,
      mark: { kind: 'check', progress: 1 },
    })
  })

  it('turns the fill in the first quarter, and squeezes the box by a stroke at mid-turn', () => {
    const early = paintCheckbox(false, true, at(0.125, 'forward'))
    expect(early.fill).toBe(0.5)
    expect(early.edgeWidth).toBe(1.75)
    expect(early.mark).toBeNull()
    const mid = paintCheckbox(false, true, at(0.5, 'forward'))
    expect(mid).toMatchObject({ inset: 1, size: 16, fill: 1, edgeWidth: 1, mark: null })
  })

  it('draws the tick over the second half, and takes it back the same way when unchecked', () => {
    expect(paintCheckbox(false, true, at(0.75, 'forward')).mark).toEqual({
      kind: 'check',
      progress: 0.5,
    })
    expect(paintCheckbox(true, false, at(0.75, 'reverse')).mark).toEqual({
      kind: 'check',
      progress: 0.5,
    })
  })

  it('swaps a tick for a dash through an empty mark, as a tristate box does', () => {
    expect(paintCheckbox(true, null, at(0.25, 'forward')).mark).toEqual({
      kind: 'check',
      progress: 0.5,
    })
    expect(paintCheckbox(true, null, at(0.75, 'forward')).mark).toEqual({
      kind: 'dash',
      progress: 0.5,
    })
  })
})

describe('the marks', () => {
  it('draw Flutter’s tick, the short stroke first', () => {
    expect(checkPath(1)).toBe('M 2.7 8.1 L 7.2 12.6 L 15.3 4.5')
    expect(checkPath(0.25)).toBe('M 2.7 8.1 L 4.95 10.35')
    expect(checkPath(0.75)).toBe('M 2.7 8.1 L 7.2 12.6 L 11.25 8.55')
  })

  it('draw Flutter’s dash, from the middle outwards', () => {
    expect(dashPath(1)).toBe('M 3.6 9 L 14.4 9')
    expect(dashPath(0.5)).toBe('M 6.3 9 L 11.7 9')
  })
})
