import { describe, it, expect, onTestFinished } from 'vitest'
import { render } from '@testing-library/react'
import { ArrowLeft, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { DibaProvider } from '../../provider/DibaProvider'
import { settled } from '../../test/visual'
import { Button, buttonVariants } from '../button'
import { Link } from './index'

/**
 * A link's icons and a link drawn as a button, as a page shows them: an icon 4
 * from a link's words on their middle, the arrow of a link to another site too, turned on a
 * right-to-left page so it points away from them; a link drawn as a button spaced as a Button and
 * never underlined, while a link stays underlined.
 */

function Page({ dir, children }: { dir: 'rtl' | 'ltr'; children: ReactNode }) {
  return (
    <DibaProvider theme="light" locale={dir === 'rtl' ? 'fa-IR' : 'en-US'} dir={dir}>
      <div data-reduce-motion="true" style={{ padding: 16, fontSize: 14 }}>
        {children}
      </div>
    </DibaProvider>
  )
}

/** The box round a link's words: its text nodes, not the link. */
function wordsOf(el: Element) {
  const text = [...el.childNodes].find(
    (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
  )!
  const range = document.createRange()
  range.selectNodeContents(text)
  return range.getBoundingClientRect()
}

const middle = (r: DOMRect) => r.top + r.height / 2

/** How far [icon] stands from [words], whichever side it is on. */
const apart = (icon: DOMRect, words: DOMRect) =>
  icon.left >= words.right ? icon.left - words.right : words.left - icon.right

describe('a link’s icon', () => {
  for (const dir of ['rtl', 'ltr'] as const) {
    it(`on a ${dir} page: 4 from its words, on their middle, before or after them`, async () => {
      const view = render(
        <Page dir={dir}>
          <Link href="#back">
            <Link.Icon>
              <ArrowLeft />
            </Link.Icon>
            بازگشت
          </Link>{' '}
          <Link href="#all">
            همه
            <Link.Icon>
              <ArrowLeft />
            </Link.Icon>
          </Link>
        </Page>,
      )
      onTestFinished(() => view.unmount())
      await settled(50)
      for (const link of view.container.querySelectorAll('.link')) {
        // The gap from the icon's box; the middle from the drawing in it, which padding could move.
        const icon = link.querySelector('[data-slot="link-icon"]')!.getBoundingClientRect()
        const drawn = link.querySelector('[data-slot="link-icon"] svg')!.getBoundingClientRect()
        const words = wordsOf(link)
        expect(Math.round(apart(icon, words))).toBe(4)
        expect(Math.abs(middle(drawn) - middle(words))).toBeLessThanOrEqual(1)
      }
    })

    it(`on a ${dir} page: a link to another site's arrow after its words, pointing away`, async () => {
      const view = render(
        <Page dir={dir}>
          <Link href="https://tipaxco.com" target="_blank" rel="noopener noreferrer">
            تیپاکس
            <Link.Icon />
          </Link>
        </Page>,
      )
      onTestFinished(() => view.unmount())
      await settled(50)
      const link = view.container.querySelector('.link')!
      const icon = link.querySelector('[data-slot="link-icon"]')!.getBoundingClientRect()
      const drawn = link.querySelector('[data-slot="link-icon"] svg')!.getBoundingClientRect()
      const words = wordsOf(link)
      // After the words: at their left on a Persian page, at their right on an English one.
      if (dir === 'rtl') expect(Math.round(words.left - icon.right)).toBe(4)
      else expect(Math.round(icon.left - words.right)).toBe(4)
      expect(Math.abs(middle(drawn) - middle(words))).toBeLessThanOrEqual(1)
      // The arrow points up and on: turned on a Persian page, where on is the left.
      const svg = link.querySelector('[data-slot="link-icon"] svg')!
      expect(getComputedStyle(svg).scale).toBe(dir === 'rtl' ? '-1 1' : 'none')
    })
  }

  it('a link stays underlined, at rest and under the pointer', async () => {
    const view = render(
      <Page dir="rtl">
        <Link href="#returns">شرایط بازگشت</Link>
      </Page>,
    )
    onTestFinished(() => view.unmount())
    await settled(50)
    const link = view.container.querySelector<HTMLElement>('.link')!
    expect(getComputedStyle(link).textDecorationLine).toBe('underline')
    link.setAttribute('data-hovered', 'true')
    expect(getComputedStyle(link).textDecorationLine).toBe('underline')
  })
})

describe('a link drawn as a button', () => {
  for (const dir of ['rtl', 'ltr'] as const) {
    it(`on a ${dir} page: its icon as far from its words as a Button's, and never underlined`, async () => {
      const view = render(
        <Page dir={dir}>
          <Link href="#new" className={buttonVariants({ variant: 'primary' })}>
            <Plus />
            افزودن کالا
          </Link>
          <Button>
            <Plus />
            افزودن کالا
          </Button>
        </Page>,
      )
      onTestFinished(() => view.unmount())
      await settled(50)
      const [link, button] = [
        view.container.querySelector<HTMLElement>('a')!,
        view.container.querySelector<HTMLElement>('button')!,
      ]
      const gap = (el: Element) =>
        Math.round(apart(el.querySelector('svg')!.getBoundingClientRect(), wordsOf(el)))
      expect(gap(link)).toBe(gap(button))
      expect(gap(link)).toBeGreaterThan(4)
      for (const state of [null, 'data-hovered', 'data-pressed']) {
        if (state) link.setAttribute(state, 'true')
        expect(getComputedStyle(link).textDecorationLine, state ?? 'at rest').toBe('none')
        if (state) link.removeAttribute(state)
      }
    })
  }
})
