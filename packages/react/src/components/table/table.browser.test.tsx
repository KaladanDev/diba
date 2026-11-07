import { describe, it, expect, onTestFinished } from 'vitest'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { DibaProvider, type DibaTheme } from '../../provider/DibaProvider'
import { DibaSurface } from '../../sdui'
import { settled, toRgb } from '../../test/visual'
import { Pagination } from '../pagination'
import { Table } from './index'

/**
 * The table as a page uses it: its selection boxes named as React Aria names them, a sorted
 * column at the end with its words over its figures, and the page shown marked in its footer.
 */

function Page({
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
        style={{ background: 'var(--background)', padding: 16, width: 640 }}
      >
        {children}
      </div>
    </DibaProvider>
  )
}

const cell = (children: string) => ({ type: 'Cell', children })

/** A block's table of two orders, keyed by ids a server sends, with the sum at the end. */
const orders = (sortable: boolean) => ({
  type: 'Table',
  props: {
    label: 'سفارش‌ها',
    selectionMode: 'multiple',
    defaultSortColumn: 'total',
    defaultSortDirection: 'descending',
  },
  children: [
    {
      type: 'TableHeader',
      children: [
        { type: 'Column', props: { id: 'order', isRowHeader: true }, children: 'سفارش' },
        { type: 'Column', props: { id: 'buyer' }, children: 'خریدار' },
        {
          type: 'Column',
          props: { id: 'total', align: 'end', allowsSorting: sortable },
          children: 'مبلغ',
        },
      ],
    },
    {
      type: 'TableBody',
      children: [
        {
          type: 'Row',
          props: { id: '7c2e91a4-0b5d-4f1e-9a63-2d8f5c1e0b47' },
          children: [cell('۱۰۴۱'), cell('نیلوفر رستمی'), cell('۱٬۲۸۰٬۰۰۰ تومان')],
        },
        {
          type: 'Row',
          props: { id: 'e01b6f3c-5a2d-4c88-b1f7-93a4d6e2c510' },
          children: [cell('۱۰۴۲'), cell('آرش کریمی'), cell('۳۲۰٬۰۰۰ تومان')],
        },
      ],
    },
  ],
})

/** What a screen reader calls an element: its labelling elements' words, or its aria-label. */
function nameOf(el: Element) {
  const by = el.getAttribute('aria-labelledby')
  if (!by) return el.getAttribute('aria-label') ?? ''
  return by
    .split(' ')
    .map((id) => {
      const target = document.getElementById(id)
      return target === el ? (el.getAttribute('aria-label') ?? '') : (target?.textContent ?? '')
    })
    .join(' ')
}

/** The box round some text in [el]: its words, not the box they sit in. */
function words(el: Element) {
  const range = document.createRange()
  range.selectNodeContents(el)
  return range.getBoundingClientRect()
}

describe('a block’s selection boxes', () => {
  // English is checked in names-en.browser.test.tsx, a page of its own: React Aria keeps one set of
  // strings a page, and a Persian page here has given it Diba's.
  for (const [dir, all, row] of [['rtl', 'انتخاب همه', 'انتخاب ۱۰۴۱']] as const) {
    it(`on a ${dir} page: "${all}", and "${row}" after the row's header, never its id`, async () => {
      const view = render(
        <Page dir={dir}>
          <DibaSurface tree={orders(false) as never} />
        </Page>,
      )
      onTestFinished(() => view.unmount())
      await settled(100)
      const [head, first] = [...view.container.querySelectorAll('input[type="checkbox"]')]
      expect(nameOf(head!)).toBe(all)
      expect(nameOf(first!)).toBe(row)
      expect(nameOf(first!)).not.toMatch(/7c2e91a4/)
    })
  }
})

describe('a column at the end, sorted', () => {
  for (const dir of ['rtl', 'ltr'] as const) {
    it(`on a ${dir} page: its words end where its figures end, the chevron 4 before them`, async () => {
      for (const how of ['by hand', 'as a block'] as const) {
        const view = render(
          <Page dir={dir}>
            {how === 'as a block' ? (
              <DibaSurface tree={orders(true) as never} />
            ) : (
              <Table>
                <Table.ScrollContainer>
                  <Table.Content
                    aria-label="سفارش‌ها"
                    sortDescriptor={{ column: 'total', direction: 'descending' }}
                  >
                    <Table.Header>
                      <Table.Column id="order" isRowHeader>
                        سفارش
                      </Table.Column>
                      <Table.Column id="total" allowsSorting align="end">
                        {({ sortDirection }) => (
                          <Table.SortableColumnHeader sortDirection={sortDirection}>
                            مبلغ
                          </Table.SortableColumnHeader>
                        )}
                      </Table.Column>
                    </Table.Header>
                    <Table.Body>
                      <Table.Row id="1041">
                        <Table.Cell>۱۰۴۱</Table.Cell>
                        <Table.Cell align="end">۱٬۲۸۰٬۰۰۰ تومان</Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Content>
                </Table.ScrollContainer>
              </Table>
            )}
          </Page>,
        )
        await settled(100)
        const heading = view.container.querySelector('[data-slot="table-sortable-column-header"]')!
        const label = words(heading.childNodes[0] as never)
        const chevron = heading.querySelector('svg')!.getBoundingClientRect()
        const cells = [...view.container.querySelectorAll('.table__body .table__row')].map((r) =>
          [...r.querySelectorAll('.table__cell')].at(-1)!,
        )
        const figures = words(cells[0]!)
        if (dir === 'rtl') {
          expect(Math.abs(label.left - figures.left), how).toBeLessThanOrEqual(1)
          expect(Math.round(chevron.left - label.right), how).toBe(4)
        } else {
          expect(Math.abs(label.right - figures.right), how).toBeLessThanOrEqual(1)
          expect(Math.round(label.left - chevron.right), how).toBe(4)
        }
        view.unmount()
      }
    })
  }

  it('one at the start keeps its words at the start and the chevron at its end', async () => {
    const view = render(
      <Page>
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="سفارش‌ها"
              sortDescriptor={{ column: 'order', direction: 'ascending' }}
            >
              <Table.Header>
                <Table.Column id="order" isRowHeader allowsSorting>
                  {({ sortDirection }) => (
                    <Table.SortableColumnHeader sortDirection={sortDirection}>
                      سفارش
                    </Table.SortableColumnHeader>
                  )}
                </Table.Column>
                <Table.Column id="buyer">خریدار</Table.Column>
              </Table.Header>
              <Table.Body>
                <Table.Row id="1041">
                  <Table.Cell>۱۰۴۱</Table.Cell>
                  <Table.Cell>نیلوفر رستمی</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </Page>,
    )
    onTestFinished(() => view.unmount())
    await settled(100)
    const column = view.container.querySelector('.table__column')!.getBoundingClientRect()
    const heading = view.container.querySelector('[data-slot="table-sortable-column-header"]')!
    const label = words(heading.childNodes[0] as never)
    const chevron = heading.querySelector('svg')!.getBoundingClientRect()
    // A Persian page: the words at the right, the chevron at the column's left, 16 in.
    expect(Math.round(column.right - label.right)).toBe(16)
    expect(Math.round(chevron.left - column.left)).toBe(16)
  })
})

describe('the page shown, in a table’s footer', () => {
  for (const theme of ['light', 'dark'] as const) {
    it(`${theme}: marked with the body's surface, not the frame's grey`, async () => {
      const view = render(
        <Page theme={theme}>
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="سفارش‌ها">
                <Table.Header>
                  <Table.Column isRowHeader>سفارش</Table.Column>
                </Table.Header>
                <Table.Body>
                  <Table.Row id="1041">
                    <Table.Cell>۱۰۴۱</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
            <Table.Footer>
              <Pagination size="sm">
                <Pagination.Content>
                  <Pagination.Item>
                    <Pagination.Link isActive>۱</Pagination.Link>
                  </Pagination.Item>
                  <Pagination.Item>
                    <Pagination.Link>۲</Pagination.Link>
                  </Pagination.Item>
                </Pagination.Content>
              </Pagination>
            </Table.Footer>
          </Table>
          <div className="probe" style={{ background: 'var(--surface)' }} />
        </Page>,
      )
      onTestFinished(() => view.unmount())
      await settled(100)
      const fill = (el: Element) => toRgb(getComputedStyle(el).backgroundColor)
      const shown = view.container.querySelector('[aria-current="page"]')!
      const frame = view.container.querySelector('.table-root')!
      const surface = view.container.querySelector('.probe')!
      expect(fill(shown)).toEqual(fill(surface))
      expect(fill(shown)).not.toEqual(fill(frame))
    })
  }
})
