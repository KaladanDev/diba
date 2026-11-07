import { describe, it, expect } from 'vitest'
import { render, within } from '@testing-library/react'
import { commands, page } from '@vitest/browser/context'
import type { ReactNode } from 'react'
import { DibaProvider } from '../../provider/DibaProvider'
import { settled } from '../../test/visual'
import { DibaSurface } from '../../sdui'

/**
 * The extra components' status and hints — Tooltip, Badge, ProgressCircle and Meter —
 * drawing the copied components. `hints_blocks_test.dart` holds Flutter's.
 */

function Card({ locale = 'fa-IR', children }: { locale?: string; children: ReactNode }) {
  return (
    <DibaProvider theme="light" locale={locale} dir={locale.startsWith('fa') ? 'rtl' : 'ltr'}>
      <div
        data-reduce-motion="true"
        style={{
          background: 'var(--surface)',
          color: 'var(--foreground)',
          padding: 32,
          width: 480,
        }}
      >
        {children}
      </div>
    </DibaProvider>
  )
}

const paint = (tree: Record<string, unknown>, locale?: string) =>
  render(
    <Card locale={locale}>
      <DibaSurface tree={tree as never} />
    </Card>,
  )

describe('Tooltip', () => {
  it('shows its words over a button under the pointer, after its delay', async () => {
    await page.viewport(1280, 800)
    const { container } = paint({
      type: 'Tooltip',
      props: { content: 'ارسال رایگان', delay: 0 },
      children: [{ type: 'Button', children: 'ارسال' }],
    })
    await settled(50)
    const button = container.querySelector('button')!
    // The pointer onto it from beside it, as a mouse arrives: React Aria counts a hover once the
    // pointer has moved.
    const r = button.getBoundingClientRect()
    await commands.pointer(r.left - 30, r.top + r.height / 2, 'move')
    await commands.pointer(r.left + r.width / 2, r.top + r.height / 2, 'move')
    await settled(400)
    const tip = document.querySelector('[data-slot="tooltip-content"], .tooltip')
    expect(tip?.textContent).toContain('ارسال رایگان')
  })

  it('text, which cannot take focus, is wrapped so a keyboard reaches the words', async () => {
    const { container } = paint({
      type: 'Tooltip',
      props: { content: 'کد اقتصادی' },
      children: [{ type: 'Text', children: 'کد' }],
    })
    await settled(50)
    const trigger = container.querySelector<HTMLElement>('[aria-label="کد اقتصادی"]')!
    expect(trigger.tabIndex).toBe(0)
  })

  // The original's `break-all` broke Persian words in the middle, «رایگان ا / ست».
  it('wraps between words, at most 320 across', async () => {
    await page.viewport(1280, 800)
    const content =
      'هزینهٔ ارسال برای سفارش‌های بالای ۵۰۰ هزار تومان رایگان است و به همهٔ شهرها می‌رسد.'
    const { container } = paint({
      type: 'Tooltip',
      props: { content, delay: 0 },
      children: [{ type: 'Button', children: 'ارسال' }],
    })
    await settled(50)
    const r = container.querySelector('button')!.getBoundingClientRect()
    await commands.pointer(r.left - 30, r.top + r.height / 2, 'move')
    await commands.pointer(r.left + r.width / 2, r.top + r.height / 2, 'move')
    await settled(400)
    const tip = document.querySelector<HTMLElement>('.tooltip')!
    expect(tip.getBoundingClientRect().width).toBeLessThanOrEqual(320)
    expect(getComputedStyle(tip).wordBreak).toBe('normal')
    // Each line ends at a word's end: every line's last letter comes before a space or the end.
    const text = tip.firstChild?.nodeType === 3 ? tip.firstChild : [...tip.childNodes].at(-1)!
    const range = document.createRange()
    const ends: number[] = []
    let top = -1
    for (let i = 0; i < content.length; i++) {
      range.setStart(text, i)
      range.setEnd(text, i + 1)
      const y = range.getBoundingClientRect().top
      if (top >= 0 && Math.abs(y - top) > 4) ends.push(i)
      top = y
    }
    expect(ends.length).toBeGreaterThan(0)
    for (const i of ends) expect(content[i - 1]).toBe(' ')
  })
})

describe('Badge', () => {
  const badge = (props: Record<string, unknown>, locale?: string) =>
    paint(
      { type: 'Badge', props, children: [{ type: 'Avatar', props: { name: 'نیلوفر رستمی' } }] },
      locale,
    )

  it('a count in Persian digits, past max as «۹۹+», at the top end: the left in Persian', async () => {
    await page.viewport(1280, 800)
    const { container } = badge({ content: 128, label: '۱۲۸ سفارش' })
    await settled(50)
    const el = container.querySelector<HTMLElement>('[data-slot="badge"]')!
    expect(el.textContent).toBe('۹۹+')
    expect(el.getAttribute('aria-label')).toBe('۱۲۸ سفارش')
    const anchor = container.querySelector('[data-slot="badge-anchor"]')!.getBoundingClientRect()
    const box = el.getBoundingClientRect()
    // Its middle, not an edge: a wide badge reaches past the anchor's middle from either corner.
    expect(box.left + box.width / 2).toBeLessThan(anchor.left + anchor.width / 2)
    expect(box.top).toBeLessThan(anchor.top + anchor.height / 2)
  })

  it('a label names it for a screen reader, as an image, a dot too; without one it is its text', async () => {
    const on = { type: 'Avatar', props: { name: 'نیلوفر رستمی' } }
    const { container } = paint({
      type: 'Stack',
      props: { direction: 'horizontal', gap: 8 },
      children: [
        { type: 'Badge', props: { content: 3, label: '۳ پیام تازه' }, children: [on] },
        { type: 'Badge', props: { color: 'success', size: 'sm', label: 'آنلاین' }, children: [on] },
        { type: 'Badge', props: { content: 5 }, children: [on] },
      ],
    })
    await settled(50)
    const [count, dot, bare] = container.querySelectorAll('[data-slot="badge"]')
    const view = within(container)
    // A span's own aria-label is ignored; as an image it is read, and its digits are not.
    expect(view.getByRole('img', { name: '۳ پیام تازه' })).toBe(count)
    expect(view.getByRole('img', { name: 'آنلاین' })).toBe(dot)
    expect(bare!.getAttribute('role')).toBeNull()
    expect(bare!.textContent).toBe('۵')
  })

  it('in English the top end is the right; under max a count is itself', async () => {
    const { container } = badge({ content: 3 }, 'en-US')
    await settled(50)
    const el = container.querySelector<HTMLElement>('[data-slot="badge"]')!
    expect(el.textContent).toBe('3')
    const anchor = container.querySelector('[data-slot="badge-anchor"]')!.getBoundingClientRect()
    const box = el.getBoundingClientRect()
    expect(box.left + box.width / 2).toBeGreaterThan(anchor.left + anchor.width / 2)
  })
})

describe('ProgressCircle and Meter', () => {
  it('a ring, named for a screen reader, at its value', async () => {
    const { container } = paint({
      type: 'ProgressCircle',
      props: { value: 60, label: 'پیشرفت', size: 'lg' },
    })
    await settled(50)
    const ring = container.querySelector('[role="progressbar"]')!
    expect(ring.getAttribute('aria-label')).toBe('پیشرفت')
    expect(ring.getAttribute('aria-valuenow')).toBe('60')
  })

  it('a meter draws its label and its value as a percentage, in Persian digits', async () => {
    const { container } = paint({
      type: 'Meter',
      props: { label: 'فضای ذخیره', value: 80 },
    })
    await settled(50)
    const meter = container.querySelector('[role="meter"], [role="progressbar"]')!
    expect(meter.textContent).toContain('فضای ذخیره')
    expect(meter.textContent).toContain('۸۰٪')
  })
})
