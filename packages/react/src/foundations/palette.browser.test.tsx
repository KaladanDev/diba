import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { DibaProvider, type DibaTheme } from '../provider/DibaProvider'
import { contrast } from '../test/visual'

/**
 * The palette's own contrast guarantees, measured rather than assumed.
 *
 * These are not component tests — no component appears in them. They exist
 * because a token is used in twenty places and reviewed in none: `fg-muted`
 * sat at 3.52:1 on paper for the whole of this library's life, quietly failing
 * AA in every description, caption and secondary line, and it took rendering a
 * toast in a real browser to notice. A token is exactly the kind of thing that
 * should be checked once, centrally, at the bottom.
 */

/** The two papers any text in this library can land on. */
const SURFACES = ['--db-surface', '--db-bg'] as const

/** Ink that carries meaning, and so owes WCAG AA at body size: 4.5:1. */
const BODY_INK = ['--db-fg', '--db-fg-muted'] as const

/** Ink chosen to sit *on* light paper — the `-emphasis` ramp exists for this. */
const EMPHASIS_INK = [
  '--db-primary-emphasis',
  '--db-accent-emphasis',
  '--db-success-emphasis',
  '--db-danger-emphasis',
  '--db-warning-emphasis',
  '--db-info-emphasis',
] as const

/** Ink that must be legible on the solid fill of its own colour role. */
const SOLID_PAIRS = [
  ['--db-primary-fg', '--db-primary'],
  ['--db-accent-fg', '--db-accent'],
  ['--db-success-fg', '--db-success'],
  ['--db-danger-fg', '--db-danger'],
  ['--db-warning-fg', '--db-warning'],
  ['--db-info-fg', '--db-info'],
] as const

function readVars(theme: DibaTheme) {
  const { unmount } = render(
    <DibaProvider theme={theme}>
      <span />
    </DibaProvider>,
  )
  const cs = getComputedStyle(document.documentElement)
  const value = (name: string) => cs.getPropertyValue(name).trim()
  const vars = Object.fromEntries(
    [...SURFACES, ...BODY_INK, ...EMPHASIS_INK, ...SOLID_PAIRS.flat()].map((n) => [n, value(n)]),
  )
  unmount()
  return vars as Record<string, string>
}

describe.each(['light', 'dark'] as const)('palette contrast (%s)', (theme) => {
  const vars = readVars(theme)

  describe.each(SURFACES)('on %s', (surface) => {
    it.each(BODY_INK)('%s clears AA for body text', (ink) => {
      expect(contrast(vars[ink]!, vars[surface]!)).toBeGreaterThanOrEqual(4.5)
    })

    it.each(EMPHASIS_INK)('%s clears AA for body text', (ink) => {
      expect(contrast(vars[ink]!, vars[surface]!)).toBeGreaterThanOrEqual(4.5)
    })
  })

  it.each(SOLID_PAIRS)('%s clears AA on %s', (ink, fill) => {
    expect(contrast(vars[ink]!, vars[fill]!)).toBeGreaterThanOrEqual(4.5)
  })

  /** Muted has to stay *muted*, or the fix above would have flattened the page. */
  it('keeps muted text lighter than body text', () => {
    expect(contrast(vars['--db-fg-muted']!, vars['--db-surface']!)).toBeLessThan(
      contrast(vars['--db-fg']!, vars['--db-surface']!),
    )
  })
})
