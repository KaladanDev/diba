import { describe, it, expect, onTestFinished } from 'vitest'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { DibaProvider } from '../../provider/DibaProvider'
import { DibaSurface } from '../../sdui'
import { settled, toRgb } from '../../test/visual'
import { Card } from '../card'
import { Pagination } from './index'

/**
 * A pager named in the page's language unless it is given a name, and its page shown marked on a
 * grey card as on the page.
 */

function Pager({ label, current = 2 }: { label?: string; current?: number }) {
  return (
    <Pagination aria-label={label}>
      <Pagination.Content>
        {[1, 2, 3].map((page) => (
          <Pagination.Item key={page}>
            <Pagination.Link isActive={page === current}>{page}</Pagination.Link>
          </Pagination.Item>
        ))}
      </Pagination.Content>
    </Pagination>
  )
}

function Page({
  theme = 'light',
  dir = 'rtl',
  children,
}: {
  theme?: 'light' | 'dark'
  dir?: 'rtl' | 'ltr'
  children: ReactNode
}) {
  return (
    <DibaProvider theme={theme} locale={dir === 'rtl' ? 'fa-IR' : 'en-US'} dir={dir}>
      <div style={{ background: 'var(--background)', padding: 16, width: 520 }}>
        {children}
        <div className="probe" style={{ background: 'var(--surface)' }} />
      </div>
    </DibaProvider>
  )
}

describe('a pager’s name', () => {
  it('is «صفحه‌بندی» on a Persian page, by hand or as a block, unless it is given one', async () => {
    const view = render(
      <Page>
        <Pager />
        <Pager label="صفحه‌های سفارش" />
        <DibaSurface tree={{ type: 'Pagination', props: { total: 3 } } as never} />
      </Page>,
    )
    onTestFinished(() => view.unmount())
    await settled(50)
    const names = [...view.container.querySelectorAll('nav')].map((nav) =>
      nav.getAttribute('aria-label'),
    )
    expect(names).toEqual(['صفحه‌بندی', 'صفحه‌های سفارش', 'صفحه‌بندی'])
  })
})

describe('the page shown', () => {
  for (const theme of ['light', 'dark'] as const) {
    it(`${theme}: on the surface on a grey card, on the fill elsewhere, and never the card’s grey`, async () => {
      const view = render(
        <Page theme={theme}>
          <Pager />
          {(['default', 'secondary', 'tertiary'] as const).map((variant) => (
            <Card key={variant} variant={variant}>
              <Pager />
            </Card>
          ))}
        </Page>,
      )
      onTestFinished(() => view.unmount())
      await settled(50)
      const fill = (el: Element) => toRgb(getComputedStyle(el).backgroundColor)
      const marks = [...view.container.querySelectorAll('[aria-current="page"]')].map(fill)
      const cards = [...view.container.querySelectorAll('.card')].map(fill)
      const surface = fill(view.container.querySelector('.probe')!)
      const [onPage, onDefault, onSecondary, onTertiary] = marks
      expect(onPage).toEqual(onDefault)
      expect(onPage).not.toEqual(surface)
      expect([onSecondary, onTertiary]).toEqual([surface, surface])
      marks.slice(1).forEach((mark, i) => expect(mark, `card ${i}`).not.toEqual(cards[i]))
    })
  }
})
