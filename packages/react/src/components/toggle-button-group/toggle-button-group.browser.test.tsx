import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import type { ReactNode } from 'react'
import { DibaProvider, type DibaTheme } from '../../provider/DibaProvider'
import { ToggleButton, ToggleButtonGroup } from '../../index'
import { box, contrast, settled, settledOn, textContrast, toRgb } from '../../test/visual'

const themes: DibaTheme[] = ['light', 'dark']

/** A card, as an admin section draws one; see button.browser.test.tsx. */
function Card({
  theme,
  dir = 'rtl',
  children,
}: {
  theme: DibaTheme
  dir?: 'rtl' | 'ltr'
  children: ReactNode
}) {
  return (
    <DibaProvider theme={theme} locale={dir === 'rtl' ? 'fa-IR' : 'en-US'} dir={dir}>
      <div
        data-reduce-motion="true"
        style={{ background: 'var(--surface)', color: 'var(--foreground)', padding: 16 }}
      >
        {children}
      </div>
    </DibaProvider>
  )
}

function Days(props: Partial<React.ComponentProps<typeof ToggleButtonGroup>>) {
  return (
    <ToggleButtonGroup aria-label="روزها" defaultSelectedKeys={['sat']} {...props}>
      <ToggleButton id="sat">شنبه</ToggleButton>
      <ToggleButton id="sun">یکشنبه</ToggleButton>
      <ToggleButton id="mon">دوشنبه</ToggleButton>
    </ToggleButtonGroup>
  )
}

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name)
const rgb = (css: string) => toRgb(css.trim())

beforeEach(async () => {
  await page.viewport(1280, 800)
})

describe('toggle button group, attached', () => {
  it('is one pill: segments touch, and only the outer corners are round', async () => {
    const { container } = render(
      <Card theme="light">
        <Days />
      </Card>,
    )
    await settled(50)
    const [first, middle, last] = [...container.querySelectorAll('.toggle-button')]
    // Right to left: the first segment is the rightmost, and touches the next one.
    expect(box(first!).left).toBe(box(middle!).right)
    expect(box(middle!).left).toBe(box(last!).right)
    expect(getComputedStyle(first!).borderTopRightRadius).toBe('24px')
    expect(getComputedStyle(first!).borderTopLeftRadius).toBe('0px')
    expect(getComputedStyle(middle!).borderTopRightRadius).toBe('0px')
    expect(getComputedStyle(last!).borderTopLeftRadius).toBe('24px')
  })

  it('follows the group’s size: sm, md and lg are 32, 36 and 40 tall', async () => {
    for (const [size, want] of [
      ['sm', 32],
      ['md', 36],
      ['lg', 40],
    ] as const) {
      const { container, unmount } = render(
        <Card theme="light">
          <Days size={size} />
        </Card>,
      )
      await settled(50)
      for (const button of container.querySelectorAll('.toggle-button')) {
        expect(box(button).height, size).toBe(want)
      }
      unmount()
    }
  })

  it('stands its segments apart when detached', async () => {
    const { container } = render(
      <Card theme="light">
        <Days isDetached />
      </Card>,
    )
    await settled(50)
    const [first, second] = [...container.querySelectorAll('.toggle-button')]
    expect(box(first!).left).toBeGreaterThan(box(second!).right)
    expect(getComputedStyle(second!).borderTopRightRadius).toBe('24px')
  })

  // The original centred each at its own width, so a column's edges were ragged; Flutter's stretch.
  it('down the page, its toggles are one width, the widest, attached or apart', async () => {
    for (const isDetached of [false, true]) {
      const { container, unmount } = render(
        <Card theme="light">
          <Days orientation="vertical" isDetached={isDetached} />
        </Card>,
      )
      await settled(50)
      const group = box(container.querySelector('.toggle-button-group')!)
      const toggles = [...container.querySelectorAll('.toggle-button')].map((t) => box(t))
      for (const toggle of toggles) {
        expect(toggle.width).toBeCloseTo(group.width, 0)
        expect(toggle.left).toBeCloseTo(group.left, 0)
      }
      unmount()
    }
  })
})

/**
 * An unselected segment is the secondary fill. A selected one is gilt with slate-700 on it in
 * both themes, as a checked box is, and stands out from the card: the original's soft fill
 * was 1.05:1 against it in light.
 */
describe('toggle button colours', () => {
  for (const theme of themes) {
    it(`${theme}: selected and unselected follow Diba's roles, and clear AA`, async () => {
      const { container } = render(
        <Card theme={theme}>
          <Days />
        </Card>,
      )
      const selected = container.querySelector('.toggle-button[data-selected="true"]')!
      const other = container.querySelector('.toggle-button:not([data-selected="true"])')!
      // Their fills fade in: a fixed sleep read one mid-fade when the whole suite ran at once.
      await Promise.all([settledOn(selected), settledOn(other)])
      const slate = (light: number, dark: number) =>
        rgb(token(`--db-slate-${theme === 'light' ? light : dark}`))

      expect(rgb(getComputedStyle(other).backgroundColor)).toEqual(slate(200, 800))
      expect(rgb(getComputedStyle(selected).backgroundColor)).toEqual(rgb(token('--db-primary')))
      expect(rgb(getComputedStyle(selected).color)).toEqual(rgb(token('--db-slate-700')))

      for (const button of [selected, other]) {
        expect(textContrast(button), button.textContent!).toBeGreaterThanOrEqual(4.5)
      }
      const card = getComputedStyle(container.firstElementChild!).backgroundColor
      expect(contrast(getComputedStyle(selected).backgroundColor, card)).toBeGreaterThanOrEqual(1.7)
    })
  }
})
