import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, within } from '@testing-library/react'
import { page, userEvent } from '@vitest/browser/context'
import type { ReactNode } from 'react'
import { DibaProvider, type DibaTheme } from '../../provider/DibaProvider'
import {
  Breadcrumbs,
  Button,
  Description,
  ErrorMessage,
  Label,
  Menu,
  Separator,
  Sheet,
  Switch,
  SwitchGroup,
  Tag,
  TagGroup,
  Toolbar,
} from '../../index'
import { box, settled, textContrast, toRgb } from '../../test/visual'
import { DibaSurface, type DibaSurfaceHandlers } from '../../sdui'

/**
 * The last six upstream components worth having, drawn by the copy's stylesheet in Diba's
 * theme. Sheet and SwitchGroup take the numbers of their kin, the drawer and the
 * checkbox and radio groups; the other four are as copied. Their blocks, which Flutter
 * draws too, are held to these numbers at the end, from trees; `six_look_test.dart`
 * holds Flutter's.
 */

const themes: DibaTheme[] = ['light', 'dark']

/** A card, as an admin section draws one; see button.browser.test.tsx. */
function Card({
  theme = 'light',
  dir = 'rtl',
  children,
}: {
  theme?: DibaTheme
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

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name)
const rgb = (css: string) => toRgb(css.trim())
const colour = (el: Element) => rgb(getComputedStyle(el).color)
const px = (value: string) => Math.round(parseFloat(value))

/** Wait for what React Aria does on its own clock, such as a sheet scrolling into view. */
async function until(done: () => boolean, ms = 3000) {
  const start = performance.now()
  while (!done()) {
    if (performance.now() - start > ms) throw new Error('timed out')
    await settled(25)
  }
}

beforeEach(async () => {
  await page.viewport(1024, 768)
})

describe('Breadcrumbs', () => {
  function Trail() {
    return (
      <Breadcrumbs>
        <Breadcrumbs.Item href="#home">پیشخوان</Breadcrumbs.Item>
        <Breadcrumbs.Item href="#orders">سفارش‌ها</Breadcrumbs.Item>
        <Breadcrumbs.Item>سفارش ۱۰۴۱</Breadcrumbs.Item>
      </Breadcrumbs>
    )
  }

  it('a long trail runs onto the next line, 4 under, and stays within its width', async () => {
    const { container } = render(
      <Card>
        <div style={{ width: 320 }}>
          <Breadcrumbs>
            <Breadcrumbs.Item href="#home">پیشخوان</Breadcrumbs.Item>
            <Breadcrumbs.Item href="#products">محصولات</Breadcrumbs.Item>
            <Breadcrumbs.Item href="#clothing">پوشاک</Breadcrumbs.Item>
            <Breadcrumbs.Item href="#scarves">شال و روسری</Breadcrumbs.Item>
            <Breadcrumbs.Item href="#silk">ابریشمی</Breadcrumbs.Item>
            <Breadcrumbs.Item>شال ابریشم دست‌باف یزد</Breadcrumbs.Item>
          </Breadcrumbs>
        </div>
      </Card>,
    )
    await settled(50)
    const list = container.querySelector('.breadcrumbs')!
    const items = [...list.querySelectorAll('.breadcrumbs__item')]
    const rows = [...new Set(items.map((item) => Math.round(box(item).top)))]
    expect(rows.length).toBeGreaterThan(1)
    for (const item of items) {
      expect(box(item).left).toBeGreaterThanOrEqual(box(list).left - 0.5)
      expect(box(item).right).toBeLessThanOrEqual(box(list).right + 0.5)
    }
    const first = items.find((item) => Math.round(box(item).top) === rows[0])!
    const second = items.find((item) => Math.round(box(item).top) === rows[1])!
    expect(Math.round(box(second).top - box(first).bottom)).toBe(4)
  })

  it('the block is a nav landmark, named «مسیر صفحه», "Breadcrumb" in English', async () => {
    for (const [dir, name] of [
      ['rtl', 'مسیر صفحه'],
      ['ltr', 'Breadcrumb'],
    ] as const) {
      const { container, unmount } = render(
        <Card dir={dir}>
          <DibaSurface
            tree={
              {
                type: 'Breadcrumbs',
                children: [
                  { type: 'BreadcrumbsItem', props: { href: '/orders' }, children: 'سفارش‌ها' },
                  { type: 'BreadcrumbsItem', children: 'سفارش ۱۰۴۱' },
                ],
              } as never
            }
          />
        </Card>,
      )
      await settled(50)
      const nav = within(container).getByRole('navigation', { name })
      expect(nav.querySelector('.breadcrumbs')).not.toBeNull()
      unmount()
    }
  })

  it('on a Persian page the steps run from the right, the chevrons turned to point on', async () => {
    for (const dir of ['rtl', 'ltr'] as const) {
      const { container, unmount } = render(
        <Card dir={dir}>
          <Trail />
        </Card>,
      )
      await settled(50)
      const [home, orders] = [...container.querySelectorAll('.breadcrumbs__item')]
      const chevron = container.querySelector('.breadcrumbs__separator')!
      if (dir === 'rtl') {
        expect(box(home!).left).toBeGreaterThan(box(orders!).right)
        expect(getComputedStyle(chevron).rotate).toBe('180deg')
      } else {
        expect(box(home!).right).toBeLessThan(box(orders!).left)
        expect(getComputedStyle(chevron).rotate).toBe('none')
      }
      expect(box(chevron).width).toBe(12)
      unmount()
    }
  })

  it('an English trail on a Persian page points on to the right, a Persian one on an English page to the left', async () => {
    // Tailwind's rtl variant took any element inside a right-to-left one for right-to-left.
    for (const [page, part, turned] of [
      ['rtl', 'ltr', 'none'],
      ['ltr', 'rtl', '180deg'],
    ] as const) {
      const { container, unmount } = render(
        <Card dir={page}>
          <div dir={part}>
            <Trail />
          </div>
        </Card>,
      )
      await settled(50)
      const chevron = container.querySelector('.breadcrumbs__separator')!
      expect(getComputedStyle(chevron).rotate).toBe(turned)
      unmount()
    }
  })

  for (const theme of themes) {
    it(`${theme}: steps muted, 14 on 20, medium, underlined only under the pointer; the page in the link colour`, async () => {
      const { container } = render(
        <Card theme={theme}>
          <Trail />
        </Card>,
      )
      await settled(50)
      const [home, , here] = [...container.querySelectorAll('.breadcrumbs__link')]
      const s = getComputedStyle(home!)
      expect([s.fontSize, s.lineHeight, s.fontWeight]).toEqual(['14px', '20px', '500'])
      expect(colour(home!)).toEqual(rgb(token('--muted')))
      expect(s.textDecorationLine).toBe('none')
      expect(colour(here!)).toEqual(rgb(token('--link')))
      expect(getComputedStyle(here!).textDecorationLine).toBe('none')
      for (const el of [home!, here!]) expect(textContrast(el)).toBeGreaterThanOrEqual(4.5)
      await userEvent.hover(home!)
      await settled(50)
      expect(getComputedStyle(home!).textDecorationLine).toBe('underline')
    })
  }
})

describe('Menu', () => {
  for (const theme of themes) {
    it(`${theme}: its items are the dropdown's, 36 tall, 16 round, 8 in; the danger one red`, async () => {
      const { container } = render(
        <Card theme={theme}>
          <Menu aria-label="کارهای سفارش" style={{ width: 240 }}>
            <Menu.Item id="print" textValue="چاپ">
              <Label>چاپ</Label>
            </Menu.Item>
            <Menu.Item id="cancel" textValue="لغو" variant="danger">
              <Label>لغو</Label>
            </Menu.Item>
          </Menu>
        </Card>,
      )
      await settled(50)
      const [print, cancel] = [...container.querySelectorAll('.menu-item')]
      const s = getComputedStyle(print!)
      expect(box(print!).height).toBe(36)
      expect(s.borderRadius).toBe('16px')
      expect(s.paddingInlineStart).toBe('8px')
      // The danger variant colours the item's Label, as the original's markup has it.
      const words = [print!, cancel!].map((item) => item.querySelector('.label')!)
      expect(colour(words[1]!)).toEqual(rgb(token('--danger')))
      for (const el of words) expect(textContrast(el)).toBeGreaterThanOrEqual(4.5)
    })
  }
})

describe('SwitchGroup', () => {
  function Group({ orientation }: { orientation?: 'horizontal' | 'vertical' }) {
    return (
      <SwitchGroup orientation={orientation}>
        {['اعلان سفارش', 'گزارش هفتگی', 'پیامک'].map((label) => (
          <Switch key={label}>
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Label>{label}</Label>
            </Switch.Content>
          </Switch>
        ))}
      </SwitchGroup>
    )
  }

  it('switches 24 apart down, as a checkbox group’s rows are; 16 across, from the right', async () => {
    const down = render(
      <Card>
        <Group />
      </Card>,
    )
    await settled(50)
    const rows = [...down.container.querySelectorAll('.switch')]
    expect(box(rows[1]!).top - box(rows[0]!).bottom).toBe(24)
    expect(box(rows[2]!).top - box(rows[1]!).bottom).toBe(24)
    down.unmount()

    const across = render(
      <Card>
        <Group orientation="horizontal" />
      </Card>,
    )
    await settled(50)
    const cols = [...across.container.querySelectorAll('.switch')]
    expect(box(cols[0]!).left - box(cols[1]!).right).toBe(16)
    expect(box(cols[0]!).top).toBe(box(cols[1]!).top)
  })
})

describe('ErrorMessage', () => {
  for (const theme of themes) {
    it(`${theme}: under a tag group, red, 12, in line with the help above it`, async () => {
      const { container } = render(
        <Card theme={theme}>
          <TagGroup selectionMode="multiple">
            <Label>دسته‌ها</Label>
            <TagGroup.List>
              <Tag id="scarf">شال</Tag>
            </TagGroup.List>
            <Description>محصول در این دسته‌ها دیده می‌شود.</Description>
            <ErrorMessage>دست‌کم یک دسته را برگزینید.</ErrorMessage>
          </TagGroup>
        </Card>,
      )
      await settled(50)
      const error = container.querySelector('.error-message')!
      const help = container.querySelector('.description')!
      expect(colour(error)).toEqual(rgb(token('--danger')))
      expect(getComputedStyle(error).fontSize).toBe('12px')
      expect(box(error).right).toBe(box(help).right)
      expect(box(error).top).toBeGreaterThanOrEqual(box(help).bottom)
      expect(textContrast(error)).toBeGreaterThanOrEqual(4.5)
    })
  }
})

describe('Toolbar', () => {
  function Bar(props: Partial<React.ComponentProps<typeof Toolbar>>) {
    return (
      <Toolbar aria-label="کارهای گروهی" {...props}>
        <Button variant="secondary">چاپ</Button>
        <Separator />
        <Button variant="secondary">برچسب</Button>
        <Button variant="danger">لغو</Button>
      </Toolbar>
    )
  }

  it('its controls 8 apart, a separator half their height between them', async () => {
    const { container } = render(
      <Card>
        <Bar />
      </Card>,
    )
    await settled(50)
    const [print, label] = [...container.querySelectorAll('.button')]
    const line = container.querySelector('.separator')!
    // Right to left: print, then the line, then the label, each 8 apart.
    expect(box(print!).left - box(line).right).toBe(8)
    expect(box(line).left - box(label!).right).toBe(8)
    expect(box(line).height).toBe(box(print!).height / 2)
    expect(box(line).top - box(print!).top).toBe(box(print!).height / 4)
  })

  for (const theme of themes) {
    it(`${theme}: attached, it is a bar on the surface, 24 round, 4 in, with the overlay's shadow`, async () => {
      const { container } = render(
        <Card theme={theme}>
          <Bar isAttached />
        </Card>,
      )
      await settled(50)
      const bar = container.querySelector('.toolbar')!
      const s = getComputedStyle(bar)
      expect(rgb(s.backgroundColor)).toEqual(rgb(token('--surface')))
      expect(s.borderRadius).toBe('24px')
      expect(s.padding).toBe('4px')
      expect(s.boxShadow).not.toBe('none')
    })
  }

  it('the arrow keys move along it, the left one onward on a Persian page', async () => {
    const { getByRole } = render(
      <Card>
        <Bar />
      </Card>,
    )
    await settled(50)
    await userEvent.tab()
    expect(document.activeElement?.textContent).toBe('چاپ')
    await userEvent.keyboard('{ArrowLeft}')
    expect(document.activeElement?.textContent).toBe('برچسب')
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement?.textContent).toBe('چاپ')
    expect(getByRole('toolbar')).toContainElement(document.activeElement as HTMLElement)
  })
})

describe('Sheet', () => {
  function Order({ dir, theme }: { dir?: 'rtl' | 'ltr'; theme?: DibaTheme }) {
    return (
      <Card dir={dir} theme={theme}>
        <Sheet>
          <Sheet.Trigger>
            <Button>جزئیات</Button>
          </Sheet.Trigger>
          <Sheet.Backdrop>
            <Sheet.Content>
              <Sheet.Dialog>
                <Sheet.Handle />
                <Sheet.CloseTrigger />
                <Sheet.Header>
                  <Sheet.Heading>سفارش ۱۰۴۱</Sheet.Heading>
                </Sheet.Header>
                <Sheet.Body>
                  <p>۳ قلم، ارسال با تیپاکس.</p>
                </Sheet.Body>
                <Sheet.Footer>
                  <Sheet.Close>
                    <Button variant="secondary">بستن</Button>
                  </Sheet.Close>
                </Sheet.Footer>
              </Sheet.Dialog>
            </Sheet.Content>
          </Sheet.Backdrop>
        </Sheet>
      </Card>
    )
  }

  const dialog = () => document.querySelector<HTMLElement>('[data-slot="sheet-dialog"]')
  /** Open, and wait for React Aria to scroll the sheet up to the window's bottom edge. */
  async function open(view: ReturnType<typeof render>) {
    await settled(50)
    await userEvent.click(view.getByRole('button', { name: 'جزئیات' }))
    await until(() => {
      const d = dialog()
      return !!d && Math.abs(d.getBoundingClientRect().bottom - innerHeight) < 1
    })
    await settled(100)
    return dialog()!
  }

  for (const theme of themes) {
    it(`${theme}: from the bottom, full width, 16 round at its top; the drawer's heading, body and footer`, async () => {
      const view = render(<Order theme={theme} />)
      const d = await open(view)
      const at = (sel: string) => box(d.querySelector(sel)!)
      const edge = box(d)
      expect(edge.left).toBe(0)
      expect(edge.right).toBe(innerWidth)
      expect(getComputedStyle(d).borderRadius).toBe('16px 16px 0px 0px')
      expect(rgb(getComputedStyle(d).backgroundColor)).toEqual(rgb(token('--overlay')))
      expect(d).toHaveAttribute('role', 'dialog')
      expect(view.getByRole('dialog', { name: 'سفارش ۱۰۴۱' })).toBe(d)

      // The drawer's handle: 36 by 4 in the separator's colour, 12 under the edge.
      const bar = d.querySelector('[data-slot="sheet-handle-bar"]')!
      expect([
        at('[data-slot="sheet-handle-bar"]').width,
        at('[data-slot="sheet-handle-bar"]').height,
      ]).toEqual([36, 4])
      expect(at('[data-slot="sheet-handle-bar"]').top - edge.top).toBe(12)
      expect(rgb(getComputedStyle(bar).backgroundColor)).toEqual(rgb(token('--separator')))

      // The drawer's title: 16 on 24, medium, 36 from the edge after the handle, 24 in.
      const heading = d.querySelector('[data-slot="sheet-heading"]')!
      const h = getComputedStyle(heading)
      expect([h.fontSize, h.lineHeight, h.fontWeight]).toEqual(['16px', '24px', '500'])
      expect(at('[data-slot="sheet-heading"]').top - edge.top).toBe(36)
      expect(edge.right - at('[data-slot="sheet-heading"]').right).toBe(24)
      expect(textContrast(heading)).toBeGreaterThanOrEqual(4.5)

      // The drawer's body: 14 on 20, muted, 8 under the title; the footer 20 under it, 24 in.
      const body = d.querySelector('[data-slot="sheet-body"]')!
      expect([getComputedStyle(body).fontSize, px(getComputedStyle(body).lineHeight)]).toEqual([
        '14px',
        20,
      ])
      expect(colour(body)).toEqual(rgb(token('--muted')))
      const words = d.querySelector('[data-slot="sheet-body"] p')!
      expect(box(words).top - at('[data-slot="sheet-heading"]').bottom).toBe(16)
      expect(textContrast(words)).toBeGreaterThanOrEqual(4.5)
      const close = d.querySelector('[data-slot="sheet-footer"] .button')!
      expect(box(close).top - box(words).bottom).toBe(20)
      expect(edge.bottom - box(close).bottom).toBe(24)
      // At the footer's end: the left of a Persian page.
      expect(box(close).left - edge.left).toBe(24)
    })
  }

  it('its close button is 16 from the top and the end: the left on a Persian page, the right on an English one', async () => {
    for (const dir of ['rtl', 'ltr'] as const) {
      const view = render(<Order dir={dir} />)
      const d = await open(view)
      const x = d.querySelector('[data-slot="sheet-close-trigger"]')!
      expect(x).toHaveAttribute('aria-label', dir === 'rtl' ? 'بستن' : 'Close')
      expect(box(x).top - box(d).top).toBe(16)
      if (dir === 'rtl') expect(box(x).left - box(d).left).toBe(16)
      else expect(box(d).right - box(x).right).toBe(16)
      await userEvent.click(x)
      await until(() => !dialog() || dialog()!.getBoundingClientRect().top >= innerHeight - 1)
      view.unmount()
    }
  })

  it('a Sheet.Close in it closes it, and so does Escape', async () => {
    const view = render(<Order />)
    let d = await open(view)
    // The footer's button, not the close button, which has the same name.
    await userEvent.click(d.querySelector('[data-slot="sheet-footer"] .button')!)
    await until(() => !dialog() || dialog()!.getBoundingClientRect().top >= innerHeight - 1)
    d = await open(view)
    expect(d).toBeTruthy()
    await userEvent.keyboard('{Escape}')
    await until(() => !dialog() || dialog()!.getBoundingClientRect().top >= innerHeight - 1)
  })
})

// ---- the blocks, from trees ------------------------------------------------------------

describe('the blocks', () => {
  type Tree = Record<string, unknown>
  const n = (type: string, props: Tree = {}, children?: unknown, more: Tree = {}): Tree => ({
    type,
    props,
    ...(children !== undefined ? { children } : {}),
    ...more,
  })
  function paint(tree: Tree, handlers: DibaSurfaceHandlers = {}) {
    return render(
      <Card>
        <DibaSurface tree={tree as never} handlers={handlers} />
      </Card>,
    )
  }

  it('Breadcrumbs: its items are the steps, links but the last, which is current', async () => {
    const { container } = paint(
      n('Breadcrumbs', {}, [
        n('BreadcrumbsItem', { href: '/home' }, 'پیشخوان'),
        n('BreadcrumbsItem', {}, 'سفارش ۱۰۴۱'),
      ]),
    )
    await settled(50)
    const steps = [...container.querySelectorAll('.breadcrumbs__link')]
    expect(steps[0]).toHaveAttribute('href', '/home')
    expect(steps[1]).toHaveAttribute('aria-current', 'page')
    expect(container.querySelectorAll('.breadcrumbs__separator')).toHaveLength(1)
  })

  it("Toolbar: a Separator in it runs across it, whatever the tree's says", async () => {
    const { container } = paint(
      n('Toolbar', { label: 'کارها' }, [
        n('Button', { variant: 'secondary' }, 'چاپ'),
        n('Separator', { orientation: 'horizontal' }),
        n('Button', { variant: 'secondary' }, 'برچسب'),
      ]),
    )
    await settled(50)
    const line = container.querySelector('.separator')!
    const button = container.querySelector('.button')!
    expect(line).toHaveClass('separator--vertical')
    expect(box(line).width).toBe(1)
    expect(box(line).height).toBe(box(button).height / 2)
  })

  it("Menu: a choice is Lucide's check, 16, on the chosen row, 8 from its start, the words 28 in; a press is sent", async () => {
    const call = vi.fn(async () => {})
    const { container } = paint(
      n('Menu', { label: 'ترتیب', selectionMode: 'single', defaultSelectedKeys: ['newest'] }, [
        n('DropdownItem', { id: 'newest' }, 'تازه‌ترین'),
        n('DropdownItem', { id: 'cheapest' }, 'ارزان‌ترین'),
      ]),
    )
    await settled(50)
    const [chosen] = [...container.querySelectorAll('.menu-item')]
    const tick = chosen!.querySelector('.menu-item__indicator')!
    expect(box(chosen!).right - box(tick).right).toBe(8)
    // Lucide's check filling the 16 square, drawn in on the chosen row alone.
    const check = tick.querySelector('svg.lucide-check')!
    expect(box(check).width).toBe(16)
    expect(check).toHaveAttribute('stroke-dashoffset', '0')
    const other = container.querySelectorAll('.menu-item')[1]!.querySelector('svg.lucide-check')!
    expect(other).toHaveAttribute('stroke-dashoffset', '24')
    expect(getComputedStyle(chosen!).paddingInlineStart).toBe('28px')
    expect(chosen).toHaveAttribute('aria-checked', 'true')
    const actions = paint(
      n('Menu', { label: 'کارها' }, [n('DropdownItem', { id: 'print' }, 'چاپ')], {
        actions: { onAction: { do: 'call', action: 'run', value: 'v' } },
      }),
      { call },
    )
    await settled(50)
    await userEvent.click(actions.getByRole('menuitem', { name: 'چاپ' }))
    await settled(50)
    expect(call).toHaveBeenCalledWith('run', { v: 'print' })
  })

  it('TagGroup: the group is described by its help and its error, which stay where the tag group draws them', async () => {
    const { container } = paint(
      n('TagGroup', { label: 'دسته‌ها', description: 'راهنما', errorMessage: 'دست‌کم یکی' }, [
        n('Tag', { id: 'a' }, 'شال'),
      ]),
    )
    await settled(50)
    const help = container.querySelector('.description')!
    const error = container.querySelector('[data-slot="field-error"]')!
    const grid = container.querySelector('[role="grid"]')!
    expect(grid.getAttribute('aria-describedby')).toBe(`${help.id} ${error.id}`)
    expect(box(error).top - box(help).bottom).toBe(4)
    expect(getComputedStyle(error).paddingInlineStart).toBe('4px')
  })

  const sheet = (props: Tree = {}) =>
    n('Sheet', { title: 'سفارش ۱۰۴۱', ...props }, [n('Text', {}, 'سه قلم')], {
      slots: {
        trigger: n('Button', {}, 'جزئیات'),
        footer: n('Button', { variant: 'secondary' }, 'بستن', {
          actions: { onPress: { do: 'close' } },
        }),
      },
    })
  const dialog = () => document.querySelector<HTMLElement>('[data-slot="sheet-dialog"]')

  it("Sheet: the drawer's numbers from a tree; end is the left of a Persian page; a close in its footer closes it", async () => {
    const view = paint(sheet({ placement: 'end' }))
    await settled(50)
    await userEvent.click(view.getByRole('button', { name: 'جزئیات' }))
    await until(() => !!dialog() && Math.abs(dialog()!.getBoundingClientRect().left) < 1)
    const d = dialog()!
    expect(box(d).width).toBe(Math.min(384, Math.round(innerWidth * 0.96)))
    expect(box(d).height).toBe(innerHeight)
    const heading = d.querySelector('[data-slot="sheet-heading"]')!
    expect(box(heading).top - box(d).top).toBe(24)
    expect(view.getByRole('dialog', { name: 'سفارش ۱۰۴۱' })).toBe(d)
    await userEvent.click(d.querySelector('[data-slot="sheet-footer"] .button')!)
    await until(() => !dialog() || dialog()!.getBoundingClientRect().right <= 1)
  })

  it('Sheet: with a stop it opens on a third of itself, the page not dimmed yet', async () => {
    const view = paint(sheet({ snapPoints: ['33%'] }))
    await settled(50)
    await userEvent.click(view.getByRole('button', { name: 'جزئیات' }))
    // Wait for React Aria's scroll to come to rest, which under the whole suite's load takes
    // longer than alone, then say where it rested.
    let last = Number.NaN
    let still = 0
    await until(() => {
      const d = dialog()
      if (!d) return false
      const top = d.getBoundingClientRect().top
      still = Math.abs(top - last) < 0.5 ? still + 1 : 0
      last = top
      return still >= 8 && top < innerHeight - 1
    }, 10000)
    // With stops it is the window's height, and rests showing a third of it.
    const rect = dialog()!.getBoundingClientRect()
    expect(Math.round(rect.height)).toBe(innerHeight)
    const shown = innerHeight - rect.top
    expect(
      Math.abs(shown - 0.33 * innerHeight),
      JSON.stringify({ shown, innerHeight }),
    ).toBeLessThan(2)
    const backdrop = document.querySelector('[data-slot="sheet-backdrop"]')!
    expect(Number(getComputedStyle(backdrop).opacity)).toBeLessThan(0.05)
  })
})
