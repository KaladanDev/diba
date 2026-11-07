import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { page, userEvent } from '@vitest/browser/context'
import type { ReactNode } from 'react'
import { DibaProvider } from '../../provider/DibaProvider'
import { settled } from '../../test/visual'
import { DibaSurface } from '../../sdui'

/**
 * The extra components' structure — Tabs, an Accordion, a Separator, a Fieldset and a
 * Drawer — drawing the copied components. `structure_blocks_test.dart` holds Flutter's.
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
          width: 480,
        }}
      >
        {children}
      </div>
    </DibaProvider>
  )
}

/** A tree whose changes reach `call('save', { v })`. */
function paint(tree: Record<string, unknown>, event = 'onChange') {
  const call = vi.fn(async () => {})
  const withAction = { ...tree, actions: { [event]: { do: 'call', action: 'save', value: 'v' } } }
  const view = render(
    <Card>
      <DibaSurface tree={withAction as never} handlers={{ call }} />
    </Card>,
  )
  return { call, ...view }
}

const sent = (call: ReturnType<typeof vi.fn>) => (call.mock.calls.at(-1) as unknown[])[1]
const text = (s: string) => ({ type: 'Text', children: s })

const tabs = (variant = 'primary') => ({
  type: 'Tabs',
  props: { label: 'بخش‌ها', variant },
  children: [
    {
      type: 'Tab',
      props: { id: 'items', label: 'اقلام', icon: 'package' },
      children: [text('سه قلم')],
    },
    { type: 'Tab', props: { id: 'shipping', label: 'ارسال' }, children: [text('تیپاکس')] },
    {
      type: 'Tab',
      props: { id: 'notes', label: 'یادداشت', isDisabled: true },
      children: [text('هیچ')],
    },
  ],
})

describe('Tabs', () => {
  it('starts on the first tab, sends the tab chosen, and shows its panel', async () => {
    await page.viewport(1280, 800)
    const { container, call } = paint(tabs())
    await settled(80)
    expect(container.querySelector('[role="tablist"]')!.getAttribute('aria-label')).toBe('بخش‌ها')
    expect(container.querySelector('[role="tabpanel"]')!.textContent).toBe('سه قلم')
    const [, shipping, notes] = container.querySelectorAll<HTMLElement>('[role="tab"]')
    await userEvent.click(shipping!)
    await settled(80)
    expect(sent(call)).toEqual({ v: 'shipping' })
    expect(container.querySelector('[role="tabpanel"]')!.textContent).toBe('تیپاکس')
    expect(notes!.getAttribute('aria-disabled')).toBe('true')
  })

  it("a tab's icon is 8 before its label", async () => {
    const { container } = paint(tabs())
    await settled(50)
    const lead = container.querySelector<HTMLElement>('[role="tab"] [data-slot="lead-icon"]')!
    expect(getComputedStyle(lead).marginInlineEnd).toBe('8px')
  })

  it('secondary is the line variant', async () => {
    const { container } = paint(tabs('secondary'))
    await settled(50)
    expect(container.querySelector('[data-slot="tabs"]')!.className).toContain('secondary')
  })
})

const accordion = (props: Record<string, unknown> = {}) => ({
  type: 'Accordion',
  props: { defaultExpandedKeys: ['ship'], ...props },
  children: [
    { type: 'AccordionItem', props: { id: 'ship', title: 'ارسال' }, children: [text('دو روز')] },
    {
      type: 'AccordionItem',
      props: { id: 'return', title: 'مرجوعی', icon: 'rotate-ccw' },
      children: [text('هفت روز')],
    },
    {
      type: 'AccordionItem',
      props: { id: 'pay', title: 'پرداخت', isDisabled: true },
      children: [],
    },
  ],
})

describe('Accordion', () => {
  it('opens what the tree opened; one at a time, the one pressed is sent', async () => {
    await page.viewport(1280, 800)
    const { container, call } = paint(accordion(), 'onExpandedChange')
    await settled(80)
    const triggers = [...container.querySelectorAll<HTMLElement>('[data-slot="accordion-trigger"]')]
    expect(triggers.map((t) => t.getAttribute('aria-expanded'))).toEqual(['true', 'false', 'false'])
    await userEvent.click(triggers[1]!)
    await settled(80)
    expect(sent(call)).toEqual({ v: ['return'] })
    expect(triggers[2]!.hasAttribute('disabled') || triggers[2]!.dataset.disabled === 'true').toBe(
      true,
    )
  })

  it('with more allowed, both stay open', async () => {
    const { container, call } = paint(
      accordion({ allowsMultipleExpanded: true }),
      'onExpandedChange',
    )
    await settled(80)
    const triggers = [...container.querySelectorAll<HTMLElement>('[data-slot="accordion-trigger"]')]
    await userEvent.click(triggers[1]!)
    await settled(80)
    expect((sent(call) as { v: string[] }).v.sort()).toEqual(['return', 'ship'])
  })

  it("an item's icon is 12 before its title, muted", async () => {
    const { container } = paint(accordion())
    await settled(50)
    const lead = container.querySelector<HTMLElement>('[data-slot="lead-icon"]')!
    expect(getComputedStyle(lead).marginInlineEnd).toBe('12px')
  })
})

describe('Separator and Fieldset', () => {
  it('a separator is a line across, or down', async () => {
    const { container } = paint({
      type: 'Stack',
      children: [
        { type: 'Separator' },
        {
          type: 'Stack',
          props: { direction: 'horizontal' },
          children: [
            text('الف'),
            { type: 'Separator', props: { orientation: 'vertical' } },
            text('ب'),
          ],
        },
      ],
    })
    await settled(50)
    const [across, down] = [...container.querySelectorAll<HTMLElement>('[data-slot="separator"]')]
    expect(across!.getBoundingClientRect().height).toBe(1)
    expect(down!.getBoundingClientRect().width).toBe(1)
    expect(down!.getAttribute('aria-orientation')).toBe('vertical')
  })

  it('a fieldset draws its legend, its help and its fields', async () => {
    const { container } = paint({
      type: 'Fieldset',
      props: { legend: 'نشانی', description: 'روی فاکتور' },
      children: [{ type: 'TextField', props: { label: 'شهر' } }],
    })
    await settled(50)
    expect(container.querySelector('legend')!.textContent).toBe('نشانی')
    expect(container.querySelector('fieldset')!.textContent).toContain('روی فاکتور')
    expect(container.querySelector('fieldset input')).not.toBeNull()
  })
})

describe('Drawer', () => {
  const drawer = (placement: string) => ({
    type: 'Drawer',
    props: { title: 'سفارش ۱۰۴۱', placement },
    children: [text('سه قلم')],
    slots: {
      trigger: { type: 'Button', children: 'باز' },
      footer: { type: 'Button', children: 'بستن', actions: { onPress: { do: 'close' } } },
    },
  })

  it('opens from its trigger; on a Persian page start is the right edge, end the left', async () => {
    await page.viewport(1280, 800)
    for (const [placement, side] of [
      ['start', 'right'],
      ['end', 'left'],
    ] as const) {
      const { container, unmount } = paint(drawer(placement), 'onOpenChange')
      await settled(50)
      await userEvent.click(container.querySelector('button')!)
      await settled(500)
      const dialog = document.querySelector<HTMLElement>('[data-slot="drawer-dialog"]')!
      const box = dialog.getBoundingClientRect()
      if (side === 'right') expect(box.right).toBeCloseTo(window.innerWidth, 0)
      else expect(box.left).toBe(0)
      expect(dialog.textContent).toContain('سفارش ۱۰۴۱')
      unmount()
      await settled(100)
    }
  })

  it("a bottom one has a handle; the footer's close closes it", async () => {
    await page.viewport(1280, 800)
    const { container, call } = paint(drawer('bottom'), 'onOpenChange')
    await settled(50)
    await userEvent.click(container.querySelector('button')!)
    await settled(500)
    expect(document.querySelector('[data-slot="drawer-handle"]')).not.toBeNull()
    expect(sent(call)).toEqual({ v: true })
    const close = [...document.querySelectorAll<HTMLElement>('[data-slot="drawer-footer"] button')]
    await userEvent.click(close[0]!)
    await settled(600)
    expect(document.querySelector('[data-slot="drawer-dialog"]')).toBeNull()
    expect(sent(call)).toEqual({ v: false })
  })

  /**
   * Where a drawer's running slide heads: its transition's last keyframe. The computed value is
   * the animated one, where it is now.
   */
  const heading = (el: Element) => {
    const slide = el
      .getAnimations()
      .find((a) => (a as CSSTransition).transitionProperty === 'translate')!
    return ((slide.effect as KeyframeEffect).getKeyframes().at(-1) as Keyframe).translate
  }

  // A drawer moves as Flutter's does. Flutter's sheet slides the whole page in
  // over 250ms on easeOutCubic and out over 250ms on easeInCubic run back; its barrier fades on
  // Material's ease. As CSS transitions, the ones run back are the curves flipped.
  // `structure_look_test.dart` holds Flutter's.
  it("moves as Flutter's: in and out over 250ms on Flutter's curves, from the window's edge", async () => {
    await page.viewport(1280, 800)
    const { container } = paint(drawer('bottom'), 'onOpenChange')
    await settled(50)
    await userEvent.click(container.querySelector('button')!)
    await settled(500)
    // The slide is on the content, the window-sized wrapper React Aria watches, the panel in it.
    const content = document.querySelector<HTMLElement>('[data-slot="drawer-content"]')!
    const backdrop = document.querySelector<HTMLElement>('[data-slot="drawer-backdrop"]')!
    const style = (el: Element) => getComputedStyle(el)
    expect(style(content).transitionDuration).toBe('0.25s')
    expect(style(content).transitionTimingFunction).toBe('cubic-bezier(0.215, 0.61, 0.355, 1)')
    expect(style(backdrop).transitionDuration).toBe('0.25s')
    expect(style(backdrop).transitionTimingFunction).toBe('ease')

    const close = [...document.querySelectorAll<HTMLElement>('[data-slot="drawer-footer"] button')]
    await userEvent.click(close[0]!)
    // While it goes: the curves run back, and it heads the window's height down.
    expect(content.dataset.exiting).toBe('true')
    expect(style(content).transitionDuration).toBe('0.25s')
    expect(style(content).transitionTimingFunction).toBe('cubic-bezier(0.325, 0.81, 0.45, 0.945)')
    expect(heading(content)).toBe('0px 800px')
    expect(style(backdrop).transitionDuration).toBe('0.25s')
    expect(style(backdrop).transitionTimingFunction).toBe('cubic-bezier(0.75, 0, 0.75, 0.9)')
    await settled(600)
    expect(document.querySelector('[data-slot="drawer-dialog"]')).toBeNull()
  })

  it("from a side, the window's width away", async () => {
    await page.viewport(1280, 800)
    const { container } = paint(drawer('end'), 'onOpenChange')
    await settled(50)
    await userEvent.click(container.querySelector('button')!)
    await settled(500)
    const content = document.querySelector<HTMLElement>('[data-slot="drawer-content"]')!
    const close = [...document.querySelectorAll<HTMLElement>('[data-slot="drawer-footer"] button')]
    await userEvent.click(close[0]!)
    // A Persian page's end is the left: it leaves the window's width to the left.
    expect(heading(content)).toBe('-1280px')
    await settled(600)
  })
})
