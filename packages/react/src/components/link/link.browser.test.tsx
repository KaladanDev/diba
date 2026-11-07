import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { DibaProvider, type DibaTheme } from '../../provider/DibaProvider'
import { Link } from '../../index'
import { settled, textContrast, toRgb } from '../../test/visual'

const themes: DibaTheme[] = ['light', 'dark']

/** A card, as an admin section draws one; see button.browser.test.tsx. */
function Card({ theme, children }: { theme: DibaTheme; children: ReactNode }) {
  return (
    <DibaProvider theme={theme} locale="fa-IR" dir="rtl">
      <div
        data-reduce-motion="true"
        style={{ background: 'var(--surface)', color: 'var(--foreground)', padding: 16 }}
      >
        {children}
      </div>
    </DibaProvider>
  )
}

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name)

/**
 * A link is the admin's link colour, slate-700 or slate-300, the same on Flutter, always
 * underlined in 1px of its own colour as Flutter's is (the original underlined it only under a
 * hover), and clears AA on a card.
 */
describe('link', () => {
  for (const theme of themes) {
    it(`${theme}: slate, underlined in its own colour, and clears AA`, async () => {
      const { container } = render(
        <Card theme={theme}>
          <Link href="/orders">سفارش‌ها</Link>
        </Card>,
      )
      await settled(50)
      const link = container.querySelector('.link')!
      const slate = token(`--db-slate-${theme === 'light' ? 700 : 300}`)
      expect(toRgb(getComputedStyle(link).color)).toEqual(toRgb(slate.trim()))
      expect(getComputedStyle(link).textDecorationLine).toBe('underline')
      expect(getComputedStyle(link).textDecorationThickness).toBe('1px')
      expect(toRgb(getComputedStyle(link).textDecorationColor)).toEqual(toRgb(slate.trim()))
      expect(textContrast(link)).toBeGreaterThanOrEqual(4.5)
    })
  }
})
