import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { DibaProvider } from '../../provider/DibaProvider'
import { settled } from '../../test/visual'
import { DibaSurface } from '../../sdui'

/**
 * Group 7, Diba's own blocks — Stack, Text, Image, Spacer and Snippet — drawn with their own
 * styles in the copy's tokens, so a host needs no utility classes for them. `own_blocks_test.dart` holds Flutter's.
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
          width: 520,
        }}
      >
        {children}
      </div>
    </DibaProvider>
  )
}

function paint(tree: Record<string, unknown>, events: string[] = []) {
  const call = vi.fn(async (..._args: unknown[]) => {})
  const actions = Object.fromEntries(
    events.map((event) => [event, { do: 'call', action: event, value: 'v' }]),
  )
  const view = render(
    <Card>
      <DibaSurface
        tree={{ ...tree, ...(events.length ? { actions } : null) } as never}
        handlers={{ call }}
      />
    </Card>,
  )
  return { call, ...view }
}

const css = (el: Element) => getComputedStyle(el)

describe('Stack, Spacer and Text', () => {
  it('a stack lays its blocks out itself: a row, 8 apart, wrapping', async () => {
    const { container } = paint({
      type: 'Stack',
      props: { direction: 'horizontal', gap: 2, wrap: true, justify: 'between' },
      children: [
        { type: 'Text', children: 'الف' },
        { type: 'Text', children: 'ب' },
      ],
    })
    await settled(30)
    const stack = container.querySelector<HTMLElement>('[data-slot="stack"]')!
    expect(css(stack).display).toBe('flex')
    expect(css(stack).flexDirection).toBe('row')
    expect(css(stack).columnGap).toBe('8px')
    expect(css(stack).flexWrap).toBe('wrap')
    expect(css(stack).justifyContent).toBe('space-between')
  })

  it('a spacer is 32 of room for size 8, across for inline', async () => {
    const { container } = paint({
      type: 'Stack',
      children: [
        { type: 'Spacer', props: { size: 8 } },
        { type: 'Spacer', props: { size: 4, axis: 'inline' } },
      ],
    })
    await settled(30)
    const [down, across] = [...container.querySelectorAll<HTMLElement>('[data-slot="spacer"]')]
    expect(down!.getBoundingClientRect().height).toBe(32)
    expect(across!.style.width).toBe('1rem')
  })

  it('a heading at its level, v3’s size, the muted ink, a clamp, a mono code', async () => {
    const { container } = paint({
      type: 'Stack',
      children: [
        { type: 'Text', props: { size: '2xl', headingLevel: 2 }, children: 'سفارش‌ها' },
        { type: 'Text', props: { tone: 'muted', maxLines: 2 }, children: 'متن' },
        { type: 'Text', props: { isMono: true, dir: 'ltr' }, children: 'SKU-1' },
      ],
    })
    await settled(30)
    const [heading, muted, mono] = [
      ...container.querySelectorAll<HTMLElement>('[data-slot="text"]'),
    ]
    expect(heading!.tagName).toBe('H2')
    expect(css(heading!).fontSize).toBe('24px')
    expect(muted!.style.color).toBe('var(--muted)')
    expect(css(muted!).webkitLineClamp).toBe('2')
    expect(mono!.getAttribute('dir')).toBe('ltr')
    expect(css(mono!).fontVariantNumeric).toBe('tabular-nums')
  })

  it('a number in the reader’s digits, toman composed after it', async () => {
    const { container } = paint({
      type: 'Text',
      props: { number: 1240000, formatStyle: 'currency', currency: 'IRT' },
    })
    await settled(30)
    expect(container.querySelector('[data-slot="text"]')!.textContent).toBe('۱٬۲۴۰٬۰۰۰ تومان')
  })
})

describe('Image', () => {
  it('a picture, 12 round for md, named by its alt', async () => {
    const { container } = paint({
      type: 'Image',
      props: { src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', alt: 'شال', ratio: '1' },
    })
    await settled(50)
    const image = container.querySelector<HTMLElement>('.db-image')!
    expect(getComputedStyle(image).borderRadius).toBe('12px')
    expect(
      container.querySelector('img')?.getAttribute('alt') ?? image.getAttribute('aria-label'),
    ).toBe('شال')
  })
})

describe('Snippet', () => {
  it('a snippet: secondary is the outline; its copy button is there', async () => {
    const { container } = paint({
      type: 'Snippet',
      props: { variant: 'secondary' },
      children: 'bun add diba',
    })
    await settled(30)
    expect(container.querySelector('.db-snippet--secondary')).not.toBeNull()
    expect(container.querySelector('.db-snippet__copy')).not.toBeNull()
  })
})

/** What [value] computes to here. */
const colour = (value: string) => {
  const probe = document.createElement('i')
  probe.style.color = value
  document.body.append(probe)
  const out = getComputedStyle(probe).color
  probe.remove()
  return out
}

/**
 * Snippet is Flutter's, drawn to the numbers Flutter draws;
 * `own_look_test.dart` holds Flutter's own.
 */
describe('Snippet is Flutter’s', () => {
  it('a snippet: 12 by 6 in, 12 round on the second surface, the words left to right with the copy a 40 round button right after them; no symbol unless given', async () => {
    const { container } = paint({ type: 'Snippet', children: 'bun add diba' })
    await settled(30)
    const frame = container.querySelector<HTMLElement>('[data-slot="snippet"]')!
    expect(css(frame).paddingInlineStart).toBe('12px')
    expect(css(frame).paddingTop).toBe('6px')
    expect(css(frame).borderTopLeftRadius).toBe('12px')
    expect(css(frame).backgroundColor).toBe(colour('var(--surface-secondary)'))
    expect(frame.getBoundingClientRect().height).toBe(52)
    const code = container.querySelector<HTMLElement>('.db-snippet__code')!
    const copy = container.querySelector<HTMLElement>('.db-snippet__copy')!
    expect(copy.getBoundingClientRect().width).toBe(40)
    expect(copy.getBoundingClientRect().left).toBeCloseTo(code.getBoundingClientRect().right, 0)
    expect(code.getBoundingClientRect().left - frame.getBoundingClientRect().left).toBe(12)
    expect(container.querySelector('.db-snippet__symbol')).toBeNull()
    expect(copy.querySelector('svg')!.dataset.glyph).toBe('copy')
  })

  it('secondary: nothing inside a 1 line in the border’s colour', async () => {
    const { container } = paint({
      type: 'Snippet',
      props: { variant: 'secondary' },
      children: 'bun add diba',
    })
    await settled(30)
    const frame = container.querySelector<HTMLElement>('[data-slot="snippet"]')!
    expect(css(frame).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(css(frame).borderTopWidth).toBe('1px')
    expect(css(frame).borderTopColor).toBe(colour('var(--border)'))
  })
})
