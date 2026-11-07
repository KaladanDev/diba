import { describe, it, expect, onTestFinished } from 'vitest'
import { act, render } from '@testing-library/react'
import { commands, page, userEvent } from '@vitest/browser/context'
import type { ReactNode } from 'react'
import { DibaProvider } from '../../provider/DibaProvider'
import { DibaSurface } from '../../sdui'
import { settled } from '../../test/visual'
import { Button, Drawer, Toast, toast, Tooltip } from '../../index'

/**
 * The overlays as a page uses them: a drawer that slides in from its own edge and the hand drags
 * back toward it, on a Persian page as on an English one; a toast's close button the keyboard can see; and a tooltip that waits as
 * long by hand as its block does.
 */

function Page({ dir = 'rtl', children }: { dir?: 'rtl' | 'ltr'; children: ReactNode }) {
  return (
    <DibaProvider theme="light" locale={dir === 'rtl' ? 'fa-IR' : 'en-US'} dir={dir}>
      <div data-reduce-motion="true" style={{ padding: 16 }}>
        {children}
      </div>
    </DibaProvider>
  )
}

type Placement = 'bottom' | 'top' | 'left' | 'right'

function Order({ placement, open = true }: { placement: Placement; open?: boolean }) {
  return (
    <Drawer defaultOpen={open}>
      <Button>سفارش</Button>
      <Drawer.Backdrop>
        <Drawer.Content placement={placement}>
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Heading>سفارش ۱۰۴۱</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body>۳ قلم، ارسال با تیپاکس.</Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  )
}

const isOpen = () =>
  !!document.querySelector('.drawer__dialog') &&
  document.querySelector('.drawer__content')?.getAttribute('data-exiting') !== 'true'

/**
 * Drags from the drawer's heading by [dx, dy] in [steps] moves [ms] apart, then lets go: what a
 * hand does. Returns the panel's transform at the last move.
 */
async function drag([dx, dy]: [number, number], steps: number, ms: number) {
  const heading = document.querySelector<HTMLElement>('.drawer__heading')!
  const dialog = document.querySelector<HTMLElement>('.drawer__dialog')!
  const r = heading.getBoundingClientRect()
  const x = r.left + 40
  const y = r.top + 8
  const at = (type: string, i: number) =>
    heading.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        pointerId: 1,
        pointerType: 'mouse',
        button: 0,
        clientX: x + (dx * i) / steps,
        clientY: y + (dy * i) / steps,
      }),
    )
  at('pointerdown', 0)
  for (let i = 1; i <= steps; i++) {
    await new Promise((done) => setTimeout(done, ms))
    at('pointermove', i)
  }
  const moved = dialog.style.transform
  at('pointerup', steps)
  await settled(500)
  return moved
}

describe('a drawer dragged by hand', () => {
  // Which way is out, on screen, for each edge on each page: a start drawer is at the right of a
  // Persian page, so it goes out to the right.
  const cases: [dir: 'rtl' | 'ltr', placement: Placement, out: [number, number]][] = [
    ['rtl', 'left', [1, 0]],
    ['rtl', 'right', [-1, 0]],
    ['ltr', 'left', [-1, 0]],
    ['ltr', 'right', [1, 0]],
    ['rtl', 'bottom', [0, 1]],
    ['rtl', 'top', [0, -1]],
  ]

  it.each(cases)(
    'on a %s page, a %s drawer goes out toward its own edge',
    async (dir, placement, out) => {
      await page.viewport(1024, 700)
      const view = render(
        <Page dir={dir}>
          <Order placement={placement} />
        </Page>,
      )
      await settled(500)
      const moved = await drag([out[0] * 240, out[1] * 240], 12, 30)
      expect(moved).not.toMatch(/\(0px\)/)
      expect(isOpen()).toBe(false)
      view.unmount()
    },
  )

  it.each(cases)(
    'on a %s page, a %s drawer stays when dragged into the page',
    async (dir, placement, out) => {
      await page.viewport(1024, 700)
      const view = render(
        <Page dir={dir}>
          <Order placement={placement} />
        </Page>,
      )
      await settled(500)
      const moved = await drag([-out[0] * 240, -out[1] * 240], 12, 30)
      expect(moved).toMatch(/\(0px\)/)
      expect(isOpen()).toBe(true)
      view.unmount()
    },
  )

  it.each(cases)(
    'on a %s page, a %s drawer stays when flicked into the page',
    async (dir, placement, out) => {
      await page.viewport(1024, 700)
      const view = render(
        <Page dir={dir}>
          <Order placement={placement} />
        </Page>,
      )
      await settled(500)
      await drag([-out[0] * 120, -out[1] * 120], 4, 8)
      expect(isOpen()).toBe(true)
      view.unmount()
    },
  )
})

describe('a drawer opening and closing', () => {
  // The window's edge each comes from and goes back to: a start drawer is at the right of a
  // Persian page.
  const cases: [
    dir: 'rtl' | 'ltr',
    placement: Placement,
    edge: 'top' | 'bottom' | 'left' | 'right',
  ][] = [
    ['rtl', 'left', 'right'],
    ['rtl', 'right', 'left'],
    ['ltr', 'left', 'left'],
    ['ltr', 'right', 'right'],
    ['rtl', 'bottom', 'bottom'],
    ['rtl', 'top', 'top'],
  ]
  const frame = () => new Promise<void>((done) => requestAnimationFrame(() => done()))
  /** How far the panel is from where it rests, toward [edge]. */
  const away = (now: DOMRect, rest: DOMRect, edge: (typeof cases)[number][2]) =>
    ({
      top: rest.top - now.top,
      bottom: now.top - rest.top,
      left: rest.left - now.left,
      right: now.left - rest.left,
    })[edge]
  /**
   * The panel's box on each of the next [frames] frames it is shown. React Aria may hold the
   * overlay hidden for two frames first, while it waits to see whether an on-screen keyboard opens.
   */
  const watch = async (frames: number) => {
    const seen: DOMRect[] = []
    for (let i = 0; i < frames; i++) {
      await frame()
      const backdrop = document.querySelector<HTMLElement>('.drawer__backdrop')
      const dialog = document.querySelector<HTMLElement>('.drawer__dialog')
      if (!backdrop || !dialog || backdrop.style.opacity === '0') continue
      seen.push(dialog.getBoundingClientRect())
    }
    return seen
  }

  it.each(cases)(
    'on a %s page, a %s drawer slides in from the %s edge and back out to it',
    async (dir, placement, edge) => {
      await page.viewport(1024, 700)
      const view = render(
        <Page dir={dir}>
          <Order placement={placement} open={false} />
        </Page>,
      )
      // Taken down even when an expectation fails, so a drawer left open is not the next one's.
      onTestFinished(() => view.unmount())
      act(() => view.container.querySelector<HTMLElement>('button')!.click())
      const coming = await watch(8)
      await settled(500)
      const rest = document.querySelector<HTMLElement>('.drawer__dialog')!.getBoundingClientRect()
      const inward = coming.map((box) => away(box, rest, edge))
      // First seen at the edge, never at rest, and then on its way: a slide, not a jump.
      expect(inward[0]).toBeGreaterThan(200)
      expect(inward.some((d) => d > 1 && d < inward[0]! - 40)).toBe(true)

      await userEvent.keyboard('{Escape}')
      const going = (await watch(8)).map((box) => away(box, rest, edge))
      expect(Math.max(...going)).toBeGreaterThan(200)
      await settled(500)
      expect(document.querySelector('.drawer__dialog')).toBeNull()
    },
  )
})

describe("a toast's close button", () => {
  it('shows when the keyboard reaches it, as under the pointer', async () => {
    await page.viewport(1024, 700)
    const view = render(
      <Page>
        <Toast.Provider />
      </Page>,
    )
    act(() => {
      toast('محصول ذخیره شد', { timeout: 0, actionProps: { children: 'برگرداندن' } })
    })
    // The pointer away from it, so only the keyboard can show the button.
    await commands.pointer(4, 4, 'move')
    await settled(600)
    const close = document.querySelector<HTMLElement>('[data-slot="toast-close"]')!
    expect(getComputedStyle(close).opacity).toBe('0')
    act(() => document.querySelector<HTMLElement>('[data-slot="toast-region"]')!.focus())
    while (document.activeElement !== close) await userEvent.tab()
    await settled(300)
    expect(getComputedStyle(close).opacity).toBe('1')
    expect(getComputedStyle(close).pointerEvents).toBe('auto')
    act(() => toast.clear())
    await settled(400)
    view.unmount()
  })
})

describe('a tooltip', () => {
  it('shows after the pointer rests 500ms, by hand as its block does', async () => {
    await page.viewport(1024, 700)
    render(
      <Page>
        <div style={{ display: 'flex', gap: 200, padding: 80 }}>
          <Tooltip>
            <Button>by hand</Button>
            <Tooltip.Content>words</Tooltip.Content>
          </Tooltip>
          <DibaSurface
            tree={{
              type: 'Tooltip',
              props: { content: 'block words' },
              children: [{ type: 'Button', children: 'block' }],
            }}
          />
        </div>
      </Page>,
    )
    // A pointer that has moved on the page already, as a reader's has: React Aria shows a tooltip
    // under the pointer only once it knows the reader uses one.
    await commands.pointer(4, 4, 'move')
    await commands.pointer(12, 12, 'move')
    await settled(300)
    for (const name of ['by hand', 'block']) {
      const button = [...document.querySelectorAll('button')].find((b) => b.textContent === name)!
      await userEvent.hover(button)
      await settled(250)
      expect(document.querySelector('.tooltip')).toBeNull()
      await settled(650)
      expect(document.querySelector('.tooltip')?.textContent).toContain('words')
      await userEvent.unhover(button)
      await settled(1200)
    }
  })
})
