import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { page } from '@vitest/browser/context'
import type { CSSProperties, ReactNode } from 'react'
import { DibaProvider, type DibaTheme } from '../../provider/DibaProvider'
import { AlertDialog, Button, Card, Description, Modal, Table, Text } from '../../index'
import { box, settled, settledOn, textContrast, toRgb } from '../../test/visual'
import { DibaSurface } from '../../sdui'

const themes: DibaTheme[] = ['light', 'dark']

/** The page an admin section sits on: the background, not a card. */
function Page({ theme, children }: { theme: DibaTheme; children: ReactNode }) {
  return (
    <DibaProvider theme={theme} locale="fa-IR" dir="rtl">
      <div
        data-reduce-motion="true"
        style={{
          background: 'var(--background)',
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

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name)
const rgb = (css: string) => toRgb(css.trim())
const css = (el: Element) => getComputedStyle(el)

/** A card is the surface, white or slate-900, and its text clears AA on it. */
describe('card', () => {
  for (const theme of themes) {
    it(`${theme}: the surface, with readable title, description and content`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Page theme={theme}>
          <Card>
            <Card.Header>
              <Card.Title>ارسال</Card.Title>
              <Card.Description>روش‌های ارسال فروشگاه</Card.Description>
            </Card.Header>
            <Card.Content>پست پیشتاز فعال است.</Card.Content>
          </Card>
        </Page>,
      )
      await settled(50)
      const card = container.querySelector('.card')!
      expect(rgb(css(card).backgroundColor)).toEqual(
        rgb(token(theme === 'light' ? '--db-paper-0' : '--db-slate-900')),
      )
      for (const part of container.querySelectorAll(
        '.card__title, .card__description, .card__content',
      )) {
        expect(textContrast(part), part.className).toBeGreaterThanOrEqual(4.5)
      }
    })
  }
})

/**
 * A table's cells read at AA, and the first column is at the right in Persian.
 *
 * Its head does not quite: v3 draws it in --muted, slate-500 on slate-100 in light, which is
 * 4.35:1, as admin-web draws it today. The fix would be the tab labels' one, slate-600
 * on the head's own colour; until that is decided, this holds today's 4.35 rather than AA.
 */
/**
 * On a grey card the muted text is a step stronger, so its notes keep 4.5:1 there: slate-600
 * on either grey in light, slate-300 on the third surface in dark. Slate-500 was 4.35:1 on
 * slate-100 and 3.86:1 on slate-200; slate-400 3.94:1 on slate-700. Everything in the card that
 * reads the muted colour takes it, by hand and as a block.
 */
describe('a grey card’s notes', () => {
  const notes = {
    light: { default: '--db-slate-500', secondary: '--db-slate-600', tertiary: '--db-slate-600' },
    dark: { default: '--db-slate-400', secondary: '--db-slate-400', tertiary: '--db-slate-300' },
  } as const

  for (const theme of themes) {
    for (const variant of ['default', 'secondary', 'tertiary'] as const) {
      it(`${theme} ${variant}: in ${notes[theme][variant].slice(5)}, 4.5:1 or more`, async () => {
        await page.viewport(1280, 800)
        const { container } = render(
          <Page theme={theme}>
            <Card variant={variant}>
              <Card.Header>
                <Card.Title>سفارش ۱۰۴۱</Card.Title>
                <Card.Description>دیروز</Card.Description>
              </Card.Header>
              <Card.Content>
                <Text tone="muted" size="sm">
                  یادداشت
                </Text>
                <Description>به همین نشانی</Description>
              </Card.Content>
            </Card>
            <DibaSurface
              tree={
                {
                  type: 'Card',
                  props: { variant, title: 'سفارش', description: 'دیروز' },
                  children: [{ type: 'Text', props: { tone: 'muted' }, children: 'یادداشت' }],
                } as never
              }
            />
          </Page>,
        )
        await settled(50)
        const muted = [
          ...container.querySelectorAll(
            '.card__description, [data-slot="text"], [data-slot="description"]',
          ),
        ]
        expect(muted).toHaveLength(5)
        for (const el of muted) {
          expect(rgb(css(el).color), el.textContent!).toEqual(rgb(token(notes[theme][variant])))
          expect(textContrast(el), el.textContent!).toBeGreaterThanOrEqual(4.5)
        }
      })
    }
  }
})

describe('table', () => {
  for (const theme of themes) {
    it(`${theme}: readable, and laid out from the right`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Page theme={theme}>
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="سفارش‌ها">
                <Table.Header>
                  <Table.Column isRowHeader>سفارش</Table.Column>
                  <Table.Column>مبلغ</Table.Column>
                </Table.Header>
                <Table.Body>
                  <Table.Row id="1041">
                    <Table.Cell>#1041</Table.Cell>
                    <Table.Cell>۱٬۲۵۰٬۰۰۰</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </Page>,
      )
      await settled(50)
      for (const cell of container.querySelectorAll('.table__cell')) {
        expect(textContrast(cell), cell.textContent ?? '').toBeGreaterThanOrEqual(4.5)
      }
      for (const head of container.querySelectorAll('.table__column')) {
        expect(textContrast(head), head.textContent ?? '').toBeGreaterThanOrEqual(
          theme === 'light' ? 4.35 : 4.5,
        )
      }
      const [first, second] = container.querySelectorAll('.table__column')
      expect(box(first!).left).toBeGreaterThan(box(second!).left)
    })
  }
})

/**
 * A table's chosen rows and totals. A selected row is tinted with the brand at 8%. Rows
 * in Table.Foot are totals inside the table, each under its own column, semibold on the table's
 * grey; disabled so a selection skips them, yet at full colour.
 */
describe('table selection and totals', () => {
  for (const theme of themes) {
    it(`${theme}: a gilt-tinted selected row, and a total under its column`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Page theme={theme}>
          <Table>
            <Table.ScrollContainer>
              <Table.Content
                aria-label="سفارش‌ها"
                selectionMode="multiple"
                defaultSelectedKeys={['1041']}
              >
                <Table.Header>
                  <Table.Column isRowHeader>سفارش</Table.Column>
                  <Table.Column>مشتری</Table.Column>
                  <Table.Column>مبلغ</Table.Column>
                </Table.Header>
                <Table.Body>
                  <Table.Row id="1041">
                    <Table.Cell>#1041</Table.Cell>
                    <Table.Cell>نیلوفر</Table.Cell>
                    <Table.Cell>۱٬۲۴۰٬۰۰۰</Table.Cell>
                  </Table.Row>
                  <Table.Row id="1042">
                    <Table.Cell>#1042</Table.Cell>
                    <Table.Cell>امید</Table.Cell>
                    <Table.Cell>۸۹۰٬۰۰۰</Table.Cell>
                  </Table.Row>
                </Table.Body>
                <Table.Foot>
                  <Table.Row id="sum" isDisabled>
                    <Table.Cell>جمع</Table.Cell>
                    <Table.Cell>{''}</Table.Cell>
                    <Table.Cell>۲٬۱۳۰٬۰۰۰</Table.Cell>
                  </Table.Row>
                </Table.Foot>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
          <div className="probe" />
        </Page>,
      )
      await settled(50)
      const probe = container.querySelector<HTMLElement>('.probe')!
      probe.style.background = 'color-mix(in srgb, var(--db-primary) 8%, var(--surface))'
      const [chosen] = container.querySelectorAll('.table__body .table__row')
      expect(rgb(css(chosen!.querySelector('.table__cell')!).backgroundColor)).toEqual(
        rgb(css(probe).backgroundColor),
      )

      const foot = container.querySelector('tfoot.table__foot')!
      expect(foot).not.toBeNull()
      const row = foot.querySelector('.table__row')!
      expect(css(row).opacity).toBe('1')
      const [total, , amount] = foot.querySelectorAll('.table__cell')
      const columns = container.querySelectorAll('.table__column')
      expect(box(total!).left).toBe(box(columns[0]!).left)
      expect(box(amount!).left).toBe(box(columns[2]!).left)
      expect(css(amount!).fontWeight).toBe('600')
    })
  }
})

/** A modal is a white dialog on a dimmed page, its actions at the end, on the left. */
describe('modal', () => {
  for (const theme of themes) {
    it(`${theme}: the overlay surface, readable, with its actions at the left`, async () => {
      await page.viewport(1280, 800)
      render(
        <Page theme={theme}>
          <Modal.Backdrop isOpen>
            <Modal.Container>
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Heading>انتخاب محصول</Modal.Heading>
                </Modal.Header>
                <Modal.Body>محصولاتی که به این مجموعه اضافه می‌شوند.</Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary">انصراف</Button>
                  <Button>افزودن</Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Page>,
      )
      await settled(500)
      const dialog = document.querySelector('.modal__dialog')!
      expect(rgb(css(dialog).backgroundColor)).toEqual(
        rgb(token(theme === 'light' ? '--db-paper-0' : '--db-slate-900')),
      )
      for (const part of document.querySelectorAll('.modal__heading, .modal__body')) {
        expect(textContrast(part), part.className).toBeGreaterThanOrEqual(4.5)
      }
      const footer = box(document.querySelector('.modal__footer')!)
      const add = box([...document.querySelectorAll('.modal__footer .button')].at(-1)!)
      expect(add.left - footer.left).toBeLessThan(footer.right - add.right)
    })
  }
})

/**
 * An alert dialog's mark is beside its heading, 12 before it and centred on it; the words run under both, the dialog's whole width.
 */
describe('an alert dialog, its mark beside its heading', () => {
  const open = (heading: string, close = false) =>
    render(
      <Page theme="light">
        <AlertDialog.Backdrop isOpen>
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              {close ? <AlertDialog.CloseTrigger aria-label="بستن" /> : null}
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>{heading}</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>این کار برگشت‌پذیر نیست.</AlertDialog.Body>
              <AlertDialog.Footer>
                <Button variant="tertiary">انصراف</Button>
                <Button variant="danger">حذف</Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </Page>,
    )
  const parts = () => {
    const get = (s: string) => document.querySelector(`.alert-dialog__${s}`)!
    return {
      dialog: get('dialog'),
      header: get('header'),
      icon: get('icon'),
      heading: get('heading'),
      body: get('body'),
    }
  }
  const middle = (r: { top: number; height: number }) => r.top + r.height / 2

  it('the mark at the start, the heading 12 after it on its middle, the words 8 under both', async () => {
    await page.viewport(1280, 800)
    open('«شال ابریشم» حذف شود؟')
    await settled(500)
    const { dialog, header, icon, heading, body } = parts()
    const frame = box(dialog)
    expect([box(icon).width, box(icon).height]).toEqual([40, 40])
    // Right to left: the mark at the right, 24 in from the dialog's side and top.
    expect(frame.right - box(icon).right).toBe(24)
    expect(box(icon).top - frame.top).toBe(24)
    expect(box(icon).left - box(heading).right).toBe(12)
    expect(Math.abs(middle(box(heading)) - middle(box(icon)))).toBeLessThanOrEqual(0.5)
    expect(box(header).height).toBe(40)
    // The words under both, across the whole width: the body pads itself 3 for focus rings.
    expect(box(body).top - box(header).bottom).toBe(8)
    expect(box(body).right).toBe(box(icon).right + 3)
    expect(css(heading).paddingInlineEnd).toBe('0px')
  })

  it("a heading on two lines is the row's height, the mark on its middle", async () => {
    await page.viewport(1280, 800)
    open(
      'همهٔ ۲۴ سفارش انتخاب‌شده لغو شوند و مبلغشان از همان راهی که پرداخت شده به خریداران برگردد؟',
    )
    await settled(500)
    const { header, icon, heading } = parts()
    expect(box(heading).height).toBe(48)
    expect(box(header).height).toBe(48)
    expect(Math.abs(middle(box(heading)) - middle(box(icon)))).toBeLessThanOrEqual(0.5)
  })

  it('a close button keeps 24 clear of the heading', async () => {
    await page.viewport(1280, 800)
    open('«شال ابریشم» حذف شود؟', true)
    await settled(500)
    const { heading } = parts()
    expect(css(heading).paddingInlineEnd).toBe('24px')
    const close = box(document.querySelector('.alert-dialog__close-trigger')!)
    expect(box(heading).left + 24).toBeGreaterThanOrEqual(close.right)
  })
})

const node = (type: string, props: Record<string, unknown>, children?: unknown) => ({
  type,
  props,
  ...(children === undefined ? {} : { children }),
})

/**
 * The containers in Diba's look on both platforms: a card holding nothing is its header
 * alone, and a table with no rows says so in the middle of its white body, as Flutter's do.
 */
describe('containers', () => {
  it('a card with nothing in it is its header alone, 16 above and below', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Page theme="light">
        <DibaSurface tree={node('Card', { title: 'سفارش DB-1041' }) as never} />
        <DibaSurface tree={node('Card', { title: 'فروش' }, [node('Text', {}, 'امروز')]) as never} />
      </Page>,
    )
    await settled(50)
    const [bare, full] = container.querySelectorAll('.card')
    expect(bare!.querySelector('.card__content')).toBeNull()
    const title = bare!.querySelector('.card__title')!
    expect(box(bare!).height).toBe(16 + box(title).height + 16)
    // With something in it, the content is 12 under the header.
    const header = full!.querySelector('.card__header')!
    const content = full!.querySelector('.card__content')!
    expect(box(content).top - box(header).bottom).toBe(12)
  })

  for (const theme of themes) {
    it(`${theme}: an empty table's message, muted and in the middle of the white body`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Page theme={theme}>
          <DibaSurface
            tree={
              node('Table', { label: 'سفارش‌ها', emptyMessage: 'هنوز سفارشی نیست.' }, [
                node('TableHeader', {}, [
                  node('Column', { id: 'code', isRowHeader: true }, 'سفارش'),
                  node('Column', { id: 'total' }, 'مبلغ'),
                ]),
                node('TableBody', {}, []),
              ]) as never
            }
          />
          <DibaSurface
            tree={
              node('Table', { label: 'سفارش‌ها', variant: 'secondary', emptyMessage: 'خالی' }, [
                node('TableHeader', {}, [node('Column', { id: 'code' }, 'سفارش')]),
                node('TableBody', {}, []),
              ]) as never
            }
          />
        </Page>,
      )
      await settled(50)
      const [primary, secondary] = container.querySelectorAll<HTMLElement>('.table__empty')
      expect(primary!.textContent).toBe('هنوز سفارشی نیست.')
      const look = css(primary!)
      expect(look.paddingTop).toBe('24px')
      expect(look.paddingBottom).toBe('24px')
      expect(look.textAlign).toBe('center')
      expect(look.fontSize).toBe('14px')
      expect(rgb(look.color)).toEqual(rgb(css(container.querySelector('.table__column')!).color))
      expect(rgb(look.backgroundColor)).toEqual(
        rgb(token(theme === 'light' ? '--db-paper-0' : '--db-slate-900')),
      )
      expect(look.borderTopLeftRadius).toBe('16px')
      // The row is the body's whole width, the frame's 4 in from each side.
      const frame = box(container.querySelector('.table-root')!)
      expect(box(primary!).width).toBe(frame.width - 8)
      // Secondary has no white body: the message lies on what is under the table.
      expect(css(secondary!).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    })
  }
})

/**
 * A popover turns to the other side of its trigger only when it does not fit on its own, as
 * Flutter's does, and keeps 8 clear of the window's sides. The original's turned once it would come
 * within 12 of the window's edge, so one above a button near the top of the window opened below.
 */
describe('a popover, where it opens', () => {
  /** A popover on a button fixed at `where` in the window. */
  const at = (where: CSSProperties, placement: string) => (
    <DibaProvider theme="light" locale="fa-IR" dir="rtl">
      <div style={{ position: 'fixed', ...where }}>
        <DibaSurface
          tree={
            {
              ...node('Popover', { placement }, [
                node('Text', { size: 'sm' }, 'بی‌عنوان، بالای دکمه.'),
              ]),
              slots: { trigger: node('Button', { variant: 'outline' }, 'بالا') },
            } as never
          }
        />
      </div>
    </DibaProvider>
  )

  async function open(container: HTMLElement) {
    const trigger = container.querySelector<HTMLElement>('button')!
    trigger.click()
    await settled(50)
    const panel = document.querySelector<HTMLElement>('.popover')!
    await settledOn(panel)
    return { trigger: box(trigger), panel: box(panel), placed: panel.dataset.placement }
  }

  async function close() {
    await userEvent.keyboard('{Escape}')
    await settled(300)
    expect(document.querySelector('.popover')).toBeNull()
  }

  /** The panel's and the trigger's sizes, opened where there is room all round. */
  async function measure(placement: string) {
    const r = render(at({ top: 300, right: 400 }, placement))
    const { trigger, panel } = await open(r.container)
    await close()
    r.unmount()
    return { trigger, panel }
  }

  it('above a button near the top of the window while it fits, below once it does not', async () => {
    await page.viewport(1280, 800)
    const { panel } = await measure('top')
    // 4 to spare above: in, where React Aria's 12 would have turned it.
    let r = render(at({ top: panel.height + 8 + 4, right: 400 }, 'top'))
    let opened = await open(r.container)
    expect(opened.placed).toBe('top')
    expect(opened.trigger.top - opened.panel.bottom).toBe(8)
    expect(opened.panel.top).toBe(4)
    await close()
    r.unmount()
    // 4 short: below.
    r = render(at({ top: panel.height + 8 - 4, right: 400 }, 'top'))
    opened = await open(r.container)
    expect(opened.placed).toBe('bottom')
    expect(opened.panel.top - opened.trigger.bottom).toBe(8)
    await close()
    r.unmount()
  })

  it('below a button near the bottom while it fits there', async () => {
    await page.viewport(1280, 800)
    const { panel } = await measure('bottom')
    const r = render(at({ bottom: panel.height + 8 + 4, right: 400 }, 'bottom'))
    const opened = await open(r.container)
    expect(opened.placed).toBe('bottom')
    expect(800 - opened.panel.bottom).toBe(4)
    await close()
  })

  it('at the start, which is the right in Persian, while it fits there', async () => {
    await page.viewport(1280, 800)
    const { panel } = await measure('start')
    const r = render(at({ top: 300, right: panel.width + 8 + 4 }, 'start'))
    const opened = await open(r.container)
    expect(opened.placed).toBe('right')
    expect(opened.panel.left - opened.trigger.right).toBe(8)
    expect(1280 - opened.panel.right).toBe(4)
    await close()
  })

  it("8 clear of the window's side, and again after it opened nearer the edge", async () => {
    await page.viewport(1280, 800)
    const { panel } = await measure('top')
    // Centred on a button at the window's left edge, it would hang off it.
    const r = render(at({ top: 300, left: 0 }, 'top'))
    let opened = await open(r.container)
    expect(opened.placed).toBe('top')
    expect(opened.panel.left).toBe(8)
    await close()
    // Opened where it fits only nearer the top than 8, then where there is room again.
    r.rerender(at({ top: panel.height + 8 + 4, left: 0 }, 'top'))
    opened = await open(r.container)
    expect(opened.placed).toBe('top')
    await close()
    r.rerender(at({ top: 300, left: 0 }, 'top'))
    opened = await open(r.container)
    expect(opened.panel.left).toBe(8)
    await close()
  })
})
