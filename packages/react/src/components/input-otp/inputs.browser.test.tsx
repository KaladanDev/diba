import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { page, userEvent } from '@vitest/browser/context'
import type { ReactNode } from 'react'
import { DibaProvider } from '../../provider/DibaProvider'
import { settled } from '../../test/visual'
import { DibaSurface } from '../../sdui'

/**
 * The extra components' inputs — InputOTP, ButtonGroup, Pagination and ColorSwatchPicker —
 * drawing the copied components. `inputs_blocks_test.dart` holds Flutter's.
 */

function Card({ children }: { children: ReactNode }) {
  return (
    <DibaProvider theme="light" locale="fa-IR" dir="rtl">
      <div
        data-reduce-motion="true"
        style={{
          background: 'var(--surface)',
          color: 'var(--foreground)',
          padding: 16,
          width: 560,
        }}
      >
        {children}
      </div>
    </DibaProvider>
  )
}

/** A tree whose events reach `call(event, { v })`. */
function paint(tree: Record<string, unknown>, events: string[] = ['onChange']) {
  const call = vi.fn(async () => {})
  const actions = Object.fromEntries(
    events.map((event) => [event, { do: 'call', action: event, value: 'v' }]),
  )
  const view = render(
    <Card>
      <DibaSurface tree={{ ...tree, actions } as never} handlers={{ call }} />
    </Card>,
  )
  return { call, ...view }
}

const last = (call: ReturnType<typeof vi.fn>, event: string) =>
  (call.mock.calls.filter((c) => c[0] === event).at(-1) as unknown[] | undefined)?.[1]

describe('InputOTP', () => {
  it('six boxes as two threes; Persian digits typed leave as Latin; a full code completes', async () => {
    await page.viewport(1280, 800)
    const { container, call } = paint({ type: 'InputOTP', props: { label: 'کد تأیید' } }, [
      'onChange',
      'onComplete',
    ])
    await settled(50)
    expect(container.querySelectorAll('[data-slot="input-otp-slot"]').length).toBe(6)
    expect(container.querySelectorAll('[data-slot="input-otp-group"]').length).toBe(2)
    const input = container.querySelector<HTMLInputElement>('input')!
    await userEvent.click(input)
    await userEvent.keyboard('۱۲۳۴۵۶')
    await settled(80)
    expect(last(call, 'onChange')).toEqual({ v: '123456' })
    expect(last(call, 'onComplete')).toEqual({ v: '123456' })
  })

  it('four boxes, its error under it', async () => {
    const { container } = paint({
      type: 'InputOTP',
      props: { label: 'کد', length: 4, errorMessage: 'کد درست نیست.' },
    })
    await settled(50)
    expect(container.querySelectorAll('[data-slot="input-otp-slot"]').length).toBe(4)
    expect(container.querySelector('[data-slot="field-error"]')!.textContent).toBe('کد درست نیست.')
  })

  // Digit slots read left to right; Flutter's read so already.
  it("reads left to right on a Persian page, in Persian digits, at the page's start", async () => {
    const { container, call } = paint({
      type: 'InputOTP',
      props: { label: 'کد', defaultValue: '1234' },
    })
    await settled(50)
    const slots = [...container.querySelectorAll<HTMLElement>('[data-slot="input-otp-slot"]')]
    const lefts = slots.map((s) => s.getBoundingClientRect().left)
    expect(lefts).toEqual([...lefts].sort((a, b) => a - b))
    expect(slots.slice(0, 4).map((s) => s.textContent)).toEqual(['۱', '۲', '۳', '۴'])
    // The code still sits at the start, the right of a Persian page.
    const field = container.querySelector<HTMLElement>('.input-otp')!.getBoundingClientRect()
    expect(slots.at(-1)!.getBoundingClientRect().right).toBeCloseTo(field.right, 0)
    // What is sent stays Latin.
    const input = container.querySelector<HTMLInputElement>('input')!
    await userEvent.click(input)
    await userEvent.keyboard('5')
    await settled(80)
    expect(last(call, 'onChange')).toEqual({ v: '12345' })
  })
})

describe('ButtonGroup', () => {
  it("its buttons take its variant and size where they set none; one's own stays", async () => {
    const { container } = paint(
      {
        type: 'ButtonGroup',
        props: { variant: 'outline', size: 'md' },
        children: [
          { type: 'Button', children: 'روز' },
          { type: 'Button', props: { variant: 'primary' }, children: 'ماه' },
        ],
      },
      [],
    )
    await settled(50)
    const [day, month] = [...container.querySelectorAll<HTMLElement>('[data-slot="button"]')]
    expect(day!.className).toContain('button--outline')
    expect(day!.className).toContain('button--md')
    expect(month!.className).toContain('button--primary')
    expect(container.querySelector('[data-slot="button-group"]')).not.toBeNull()
  })

  it('down the page, its buttons are one width, the widest; across it, each its own', async () => {
    const group = (orientation: string) =>
      paint(
        {
          type: 'ButtonGroup',
          props: { orientation },
          children: [
            { type: 'Button', children: 'ویرایش' },
            { type: 'Button', children: 'رونوشت محصول' },
            { type: 'Button', children: 'حذف' },
          ],
        },
        [],
      )
    const widths = (container: HTMLElement) =>
      [...container.querySelectorAll<HTMLElement>('[data-slot="button"]')].map(
        (button) => button.getBoundingClientRect().width,
      )
    const down = group('vertical')
    await settled(50)
    const column = down.container.querySelector('[data-slot="button-group"]')!
    for (const width of widths(down.container)) {
      expect(width).toBeCloseTo(column.getBoundingClientRect().width, 1)
    }
    down.unmount()
    const across = group('horizontal')
    await settled(50)
    const [edit, copy, remove] = widths(across.container)
    expect(copy).toBeGreaterThan(edit!)
    expect(edit).toBeGreaterThan(remove!)
  })
})

describe('Pagination', () => {
  it('previous, the pages near and at the ends in Persian digits, next; a page pressed is sent', async () => {
    await page.viewport(1280, 800)
    const { container, call } = paint({
      type: 'Pagination',
      props: { label: 'صفحه‌ها', total: 12, defaultPage: 6 },
    })
    await settled(50)
    const nav = container.querySelector('nav')!
    expect(nav.getAttribute('aria-label')).toBe('صفحه‌ها')
    const words = [...nav.querySelectorAll('li')].map((li) => li.textContent?.trim())
    expect(words).toEqual(['قبلی', '۱', '…', '۵', '۶', '۷', '…', '۱۲', 'بعدی'].map((w) => w))
    const seven = [...nav.querySelectorAll<HTMLElement>('[data-slot="pagination-link"]')].find(
      (l) => l.textContent === '۷',
    )!
    await userEvent.click(seven)
    await settled(50)
    expect(last(call, 'onChange')).toEqual({ v: 7 })
    await userEvent.click(nav.querySelector<HTMLElement>('[data-slot="pagination-next"]')!)
    await settled(50)
    expect(last(call, 'onChange')).toEqual({ v: 8 })
  })

  it('on the first page, previous is disabled', async () => {
    const { container } = paint({ type: 'Pagination', props: { total: 4 } })
    await settled(50)
    const previous = container.querySelector('[data-slot="pagination-previous"]')!
    expect(previous.hasAttribute('disabled') || previous.getAttribute('data-disabled')).toBeTruthy()
  })

  // The original's row ran off the page's edge where its pages did not fit; it wraps, as
  // Flutter's does.
  it('pages too many for the row wrap within it', async () => {
    await page.viewport(420, 800)
    const { container } = render(
      <DibaProvider theme="light" locale="fa-IR" dir="rtl">
        <div style={{ width: 300 }}>
          <DibaSurface
            tree={{ type: 'Pagination', props: { total: 12, defaultPage: 6 } } as never}
          />
        </div>
      </DibaProvider>,
    )
    await settled(50)
    const box = container.querySelector<HTMLElement>('nav')!.getBoundingClientRect()
    const items = [...container.querySelectorAll<HTMLElement>('[data-slot="pagination-item"]')]
    for (const item of items) {
      const r = item.getBoundingClientRect()
      expect(r.left).toBeGreaterThanOrEqual(box.left - 0.5)
      expect(r.right).toBeLessThanOrEqual(box.right + 0.5)
    }
    const rows = new Set(items.map((i) => Math.round(i.getBoundingClientRect().top)))
    expect(rows.size).toBeGreaterThan(1)
  })
})

describe('ColorSwatchPicker', () => {
  it('a swatch a colour the app sent; the one chosen is sent as #rrggbb', async () => {
    await page.viewport(1280, 800)
    const { container, call } = paint({
      type: 'ColorSwatchPicker',
      props: {
        label: 'رنگ برند',
        colors: ['#e8a33d', '#3f8f6b', 'not a colour'],
        defaultValue: '#e8a33d',
      },
    })
    await settled(50)
    const swatches = [
      ...container.querySelectorAll<HTMLElement>('[data-slot="color-swatch-picker-item"]'),
    ]
    expect(swatches.length).toBe(2)
    await userEvent.click(swatches[1]!)
    await settled(50)
    expect(last(call, 'onChange')).toEqual({ v: '#3f8f6b' })
  })
})
