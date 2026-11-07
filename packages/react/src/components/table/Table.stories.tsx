import type { Meta, StoryObj } from '@storybook/react-vite'
import { Eye, Printer, Trash2, Truck } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import type { Key, Selection, SortDescriptor } from 'react-aria-components'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { face, goods, people } from '../../stories/people'
import { Button } from '../button'
import { Card } from '../card'
import { Checkbox } from '../checkbox'
import { Chip } from '../chip'
import { Pagination } from '../pagination'
import { Separator } from '../separator'
import { Spinner } from '../spinner'
import { Toolbar } from '../toolbar'
import { Tooltip } from '../tooltip'
import { Table } from './index'

// The Table, every option it has and what it lists. The docs page is Table.mdx. A line comment,
// not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Data Display/Table',
  component: Table,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Table>

export default meta

// ---- the orders most stories list ----------------------------------------------------------------

type Status = 'waiting' | 'paid' | 'shipped' | 'cancelled'
type Order = { id: number; who: number; items: number; total: number; status: Status; day: number }

const orders: Order[] = [
  { id: 1041, who: 0, items: 3, total: 1_280_000, status: 'waiting', day: 14 },
  { id: 1042, who: 1, items: 1, total: 320_000, status: 'paid', day: 14 },
  { id: 1043, who: 2, items: 2, total: 960_000, status: 'shipped', day: 13 },
  { id: 1044, who: 3, items: 5, total: 2_450_000, status: 'shipped', day: 13 },
  { id: 1045, who: 4, items: 1, total: 185_000, status: 'cancelled', day: 12 },
  { id: 1046, who: 5, items: 4, total: 1_740_000, status: 'paid', day: 12 },
  { id: 1047, who: 6, items: 2, total: 640_000, status: 'waiting', day: 11 },
  { id: 1048, who: 7, items: 1, total: 410_000, status: 'shipped', day: 11 },
  { id: 1049, who: 0, items: 6, total: 3_120_000, status: 'shipped', day: 10 },
  { id: 1050, who: 2, items: 2, total: 720_000, status: 'paid', day: 10 },
  { id: 1051, who: 3, items: 1, total: 290_000, status: 'waiting', day: 9 },
  { id: 1052, who: 5, items: 3, total: 1_050_000, status: 'shipped', day: 9 },
]

const STATUS: Record<
  Status,
  [fa: string, en: string, color: 'warning' | 'accent' | 'success' | 'danger']
> = {
  waiting: ['در انتظار ارسال', 'Waiting', 'warning'],
  paid: ['پرداخت‌شده', 'Paid', 'accent'],
  shipped: ['ارسال‌شده', 'Shipped', 'success'],
  cancelled: ['لغو شده', 'Cancelled', 'danger'],
}

/** An order's words in the story's language: its number, its buyer, its sums and its day. */
function useWords() {
  const t = useT()
  const fa = t('fa', 'en') === 'fa'
  const locale = fa ? 'fa-IR' : 'en-US'
  const num = (v: number) => v.toLocaleString(locale)
  return {
    t,
    fa,
    num,
    money: (v: number) => `${num(v)} ${t('تومان', 'toman')}`,
    // A Persian order number stands alone; a # before it would turn round in a right-to-left line.
    code: (v: number) => (fa ? v.toLocaleString(locale, { useGrouping: false }) : `#${v}`),
    date: (day: number) => (fa ? `${num(day)} آبان` : `${day - 9} Nov`),
    name: (who: number) => (fa ? people[who]!.fa : people[who]!.en),
    status: (s: Status) => STATUS[s][fa ? 0 : 1],
  }
}

/** The box a table that chooses draws at each row's start: Flutter's checkbox, named by React Aria. */
function Box() {
  return (
    <Checkbox slot="selection">
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
      </Checkbox.Content>
    </Checkbox>
  )
}

/** An order's status, as the admin tags one. */
function StatusChip({ status }: { status: Status }) {
  const w = useWords()
  return (
    <Chip size="sm" variant="soft" color={STATUS[status][2]}>
      {w.status(status)}
    </Chip>
  )
}

/** Sorted as [sort] asks: by number, buyer, sum or day. */
function sortOrders(rows: Order[], sort: SortDescriptor, name: (who: number) => string) {
  const by: Record<string, (o: Order) => number | string> = {
    order: (o) => o.id,
    buyer: (o) => name(o.who),
    total: (o) => o.total,
    date: (o) => o.day,
  }
  const key = by[String(sort.column)] ?? by.order!
  const sorted = [...rows].sort((a, b) => {
    const [x, y] = [key(a), key(b)]
    return typeof x === 'string' ? x.localeCompare(y as string) : x - (y as number)
  })
  return sort.direction === 'descending' ? sorted.reverse() : sorted
}

type Options = {
  variant?: 'primary' | 'secondary'
  selectionMode?: 'none' | 'single' | 'multiple'
  sorting?: boolean
  totals?: boolean
  empty?: boolean
  rows?: Order[]
}

/** The orders as a table, with whichever options a story turns on. */
function Orders({
  variant,
  selectionMode = 'none',
  sorting = false,
  totals = false,
  empty = false,
  rows = orders.slice(0, 5),
}: Options) {
  const w = useWords()
  const [sort, setSort] = useState<SortDescriptor>({ column: 'order', direction: 'ascending' })
  const shown = empty ? [] : sorting ? sortOrders(rows, sort, w.name) : rows
  const choosing = selectionMode !== 'none'
  const column = (id: string, words: string, align?: 'end') => (
    <Table.Column id={id} allowsSorting={sorting} isRowHeader={id === 'order'} align={align}>
      {({ sortDirection }) =>
        sorting ? (
          <Table.SortableColumnHeader sortDirection={sortDirection}>
            {words}
          </Table.SortableColumnHeader>
        ) : (
          words
        )
      }
    </Table.Column>
  )
  return (
    <Table variant={variant}>
      <Table.ScrollContainer>
        <Table.Content
          aria-label={w.t('سفارش‌ها', 'Orders')}
          selectionMode={selectionMode}
          sortDescriptor={sorting ? sort : undefined}
          onSortChange={setSort}
        >
          <Table.Header>
            {choosing ? (
              <Table.Column id="select">
                {selectionMode === 'multiple' ? <Box /> : null}
              </Table.Column>
            ) : null}
            {column('order', w.t('سفارش', 'Order'))}
            {column('buyer', w.t('خریدار', 'Buyer'))}
            {column('total', w.t('مبلغ', 'Total'), 'end')}
            <Table.Column id="status">{w.t('وضعیت', 'Status')}</Table.Column>
          </Table.Header>
          <Table.Body
            renderEmptyState={() => (
              <div className="table__empty">{w.t('هنوز سفارشی نرسیده است.', 'No orders yet.')}</div>
            )}
          >
            {shown.map((o) => (
              <Table.Row key={o.id} id={String(o.id)}>
                {choosing ? (
                  <Table.Cell>
                    <Box />
                  </Table.Cell>
                ) : null}
                <Table.Cell>{w.code(o.id)}</Table.Cell>
                <Table.Cell>{w.name(o.who)}</Table.Cell>
                <Table.Cell align="end">{w.money(o.total)}</Table.Cell>
                <Table.Cell>
                  <StatusChip status={o.status} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
          {totals && shown.length ? (
            <Table.Foot>
              <Table.Row id="sum" isDisabled={choosing}>
                {choosing ? <Table.Cell>{''}</Table.Cell> : null}
                <Table.Cell>{w.t('جمع', 'Total')}</Table.Cell>
                <Table.Cell>{''}</Table.Cell>
                <Table.Cell align="end">
                  {w.money(shown.reduce((s, o) => s + o.total, 0))}
                </Table.Cell>
                <Table.Cell>{''}</Table.Cell>
              </Table.Row>
            </Table.Foot>
          ) : null}
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}

// ---- the playground ------------------------------------------------------------------------------

/** Every option on the controls. */
export const Playground: StoryObj<Options> = {
  args: { variant: 'primary', selectionMode: 'none', sorting: false, totals: false, empty: false },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      description: 'A grey frame round a white body, or the rows on what is under them.',
      table: { category: 'Table', defaultValue: { summary: 'primary' } },
    },
    selectionMode: {
      control: 'inline-radio',
      options: ['none', 'single', 'multiple'],
      description: 'On Table.Content: whether rows can be chosen, one or several.',
      table: { category: 'Table.Content', defaultValue: { summary: 'none' } },
    },
    sorting: {
      description: 'allowsSorting on the order, buyer and total columns.',
      table: { category: 'Example' },
    },
    totals: { description: 'A Table.Foot row with the sum.', table: { category: 'Example' } },
    empty: { description: 'No rows: the body says so.', table: { category: 'Example' } },
    rows: { table: { disable: true } },
  },
  render: (args) => (
    <Stage width={720}>
      <Orders {...args} />
    </Stage>
  ),
}

// ---- its options ---------------------------------------------------------------------------------

/** Its two looks: a grey frame round a white body, or the rows on what is under them. */
export const Variants: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={460}>
        <Example title="primary" note={t('قاب خاکستری، بدنهٔ سفید', 'A grey frame, a white body')}>
          <Orders variant="primary" rows={orders.slice(0, 3)} />
        </Example>
        <Example title="secondary" note={t('بی قاب، روی کارت', 'No frame, on a card')}>
          <Card>
            <Orders variant="secondary" rows={orders.slice(0, 3)} />
          </Card>
        </Example>
      </Grid>
    )
  },
}

/** Rows to choose, one or several: a box at each row's start, and one in the head for them all. */
export const Choosing: StoryObj = {
  name: 'Choosing rows',
  render: function Render() {
    const w = useWords()
    const [chosen, setChosen] = useState<Selection>(new Set(['1042']))
    const list = chosen === 'all' ? 'all' : [...chosen].map((k) => w.code(Number(k))).join(' ')
    return (
      <Grid min={460}>
        <Example title="single" note={w.t('یکی در هر بار', 'One at a time')}>
          <Orders selectionMode="single" rows={orders.slice(0, 3)} />
        </Example>
        <Example
          title="multiple"
          note={w.t('سفارش ۱۰۴۵ را نمی‌توان برگزید', 'Order 1045 cannot be chosen')}
        >
          <Table>
            <Table.ScrollContainer>
              <Table.Content
                aria-label={w.t('سفارش‌ها', 'Orders')}
                selectionMode="multiple"
                selectedKeys={chosen}
                onSelectionChange={setChosen}
                disabledKeys={['1045']}
              >
                <Table.Header>
                  <Table.Column id="select">
                    <Box />
                  </Table.Column>
                  <Table.Column id="order" isRowHeader>
                    {w.t('سفارش', 'Order')}
                  </Table.Column>
                  <Table.Column id="buyer">{w.t('خریدار', 'Buyer')}</Table.Column>
                  <Table.Column id="total" align="end">
                    {w.t('مبلغ', 'Total')}
                  </Table.Column>
                </Table.Header>
                <Table.Body>
                  {orders.slice(1, 5).map((o) => (
                    <Table.Row key={o.id} id={String(o.id)}>
                      <Table.Cell>
                        <Box />
                      </Table.Cell>
                      <Table.Cell>{w.code(o.id)}</Table.Cell>
                      <Table.Cell>{w.name(o.who)}</Table.Cell>
                      <Table.Cell align="end">{w.money(o.total)}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
          <Value label="selectedKeys" value={list || '—'} />
        </Example>
      </Grid>
    )
  },
}

/** Columns that sort: the hand over a heading, and the chevron at the sorted one's end. */
export const Sorting: StoryObj = {
  render: function Render() {
    const w = useWords()
    const [sort, setSort] = useState<SortDescriptor>({ column: 'total', direction: 'descending' })
    const rows = sortOrders(orders.slice(0, 6), sort, w.name)
    return (
      <Stage width={640}>
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label={w.t('سفارش‌ها', 'Orders')}
              sortDescriptor={sort}
              onSortChange={setSort}
            >
              <Table.Header>
                <Table.Column id="order" isRowHeader allowsSorting>
                  {({ sortDirection }) => (
                    <Table.SortableColumnHeader sortDirection={sortDirection}>
                      {w.t('سفارش', 'Order')}
                    </Table.SortableColumnHeader>
                  )}
                </Table.Column>
                <Table.Column id="buyer" allowsSorting>
                  {({ sortDirection }) => (
                    <Table.SortableColumnHeader sortDirection={sortDirection}>
                      {w.t('خریدار', 'Buyer')}
                    </Table.SortableColumnHeader>
                  )}
                </Table.Column>
                <Table.Column id="date" allowsSorting>
                  {({ sortDirection }) => (
                    <Table.SortableColumnHeader sortDirection={sortDirection}>
                      {w.t('تاریخ', 'Date')}
                    </Table.SortableColumnHeader>
                  )}
                </Table.Column>
                <Table.Column id="total" allowsSorting align="end">
                  {({ sortDirection }) => (
                    <Table.SortableColumnHeader sortDirection={sortDirection}>
                      {w.t('مبلغ', 'Total')}
                    </Table.SortableColumnHeader>
                  )}
                </Table.Column>
              </Table.Header>
              <Table.Body>
                {rows.map((o) => (
                  <Table.Row key={o.id} id={String(o.id)}>
                    <Table.Cell>{w.code(o.id)}</Table.Cell>
                    <Table.Cell>{w.name(o.who)}</Table.Cell>
                    <Table.Cell>{w.date(o.day)}</Table.Cell>
                    <Table.Cell align="end">{w.money(o.total)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
        <Value label="sortDescriptor" value={`${String(sort.column)}, ${sort.direction}`} />
      </Stage>
    )
  },
}

/** Totals under their columns, in Table.Foot: semibold on the table's grey. */
export const Totals: StoryObj = {
  render: function Render() {
    const w = useWords()
    const rows = orders.slice(0, 4)
    return (
      <Stage width={560}>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label={w.t('سفارش‌های امروز', 'Today’s orders')}>
              <Table.Header>
                <Table.Column isRowHeader>{w.t('سفارش', 'Order')}</Table.Column>
                <Table.Column align="end">{w.t('اقلام', 'Items')}</Table.Column>
                <Table.Column align="end">{w.t('مبلغ', 'Total')}</Table.Column>
              </Table.Header>
              <Table.Body>
                {rows.map((o) => (
                  <Table.Row key={o.id} id={String(o.id)}>
                    <Table.Cell>{w.code(o.id)}</Table.Cell>
                    <Table.Cell align="end">{w.num(o.items)}</Table.Cell>
                    <Table.Cell align="end">{w.money(o.total)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
              <Table.Foot>
                <Table.Row id="sum">
                  <Table.Cell>{w.t('جمع', 'Total')}</Table.Cell>
                  <Table.Cell align="end">
                    {w.num(rows.reduce((s, o) => s + o.items, 0))}
                  </Table.Cell>
                  <Table.Cell align="end">
                    {w.money(rows.reduce((s, o) => s + o.total, 0))}
                  </Table.Cell>
                </Table.Row>
              </Table.Foot>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </Stage>
    )
  },
}

/** No rows: the body says so in the middle, muted, on both looks. */
export const Empty: StoryObj = {
  name: 'With no rows',
  render: () => (
    <Grid min={460}>
      <Example title="primary">
        <Orders empty />
      </Example>
      <Example title="secondary">
        <Card>
          <Orders variant="secondary" empty />
        </Card>
      </Example>
    </Grid>
  ),
}

/** A row that opens its record: onRowAction on a press or Enter, or a row's href. */
export const OpeningARecord: StoryObj = {
  name: 'Rows that open a record',
  render: function Render() {
    const w = useWords()
    const [opened, setOpened] = useState<Key | null>(null)
    return (
      <Stage width={560}>
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label={w.t('سفارش‌ها', 'Orders')}
              onRowAction={(key) => setOpened(key)}
            >
              <Table.Header>
                <Table.Column isRowHeader>{w.t('سفارش', 'Order')}</Table.Column>
                <Table.Column>{w.t('خریدار', 'Buyer')}</Table.Column>
                <Table.Column align="end">{w.t('مبلغ', 'Total')}</Table.Column>
              </Table.Header>
              <Table.Body>
                {orders.slice(0, 4).map((o) => (
                  <Table.Row key={o.id} id={String(o.id)}>
                    <Table.Cell>{w.code(o.id)}</Table.Cell>
                    <Table.Cell>{w.name(o.who)}</Table.Cell>
                    <Table.Cell align="end">{w.money(o.total)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
        <Value label="onRowAction" value={opened == null ? '—' : w.code(Number(opened))} />
      </Stage>
    )
  },
}

/** What a cell holds: a person, a status, the actions on a row. */
export const Cells: StoryObj = {
  name: 'What a cell holds',
  render: function Render() {
    const w = useWords()
    return (
      <Stage width={760}>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label={w.t('سفارش‌ها', 'Orders')}>
              <Table.Header>
                <Table.Column isRowHeader>{w.t('سفارش', 'Order')}</Table.Column>
                <Table.Column>{w.t('خریدار', 'Buyer')}</Table.Column>
                <Table.Column>{w.t('وضعیت', 'Status')}</Table.Column>
                <Table.Column align="end">{w.t('کارها', 'Actions')}</Table.Column>
              </Table.Header>
              <Table.Body>
                {orders.slice(0, 4).map((o) => (
                  <Table.Row key={o.id} id={String(o.id)}>
                    <Table.Cell>{w.code(o.id)}</Table.Cell>
                    <Table.Cell>
                      <Person who={o.who} note={w.date(o.day)} />
                    </Table.Cell>
                    <Table.Cell>
                      <StatusChip status={o.status} />
                    </Table.Cell>
                    <Table.Cell>
                      <RowActions />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </Stage>
    )
  },
}

/** A buyer in a cell: their face, their name, and a note under it. */
function Person({ who, note }: { who: number; note: string }) {
  const w = useWords()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {face({ person: people[who]!, persian: w.fa, size: 'sm', hidden: true })}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span className="text-foreground" style={{ fontSize: 14, lineHeight: '20px' }}>
          {w.name(who)}
        </span>
        <span className="text-muted" style={{ fontSize: 12, lineHeight: '16px' }}>
          {note}
        </span>
      </div>
    </div>
  )
}

/** A row's actions, each an icon button named, its name in a tooltip as the Button page has it. */
function RowActions() {
  const w = useWords()
  const actions = [
    [w.t('دیدن', 'View'), <Eye key="i" />, 'tertiary'],
    [w.t('چاپ برچسب', 'Print label'), <Printer key="i" />, 'tertiary'],
    [w.t('حذف', 'Delete'), <Trash2 key="i" />, 'danger-soft'],
  ] as const
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
      {actions.map(([name, icon, variant]) => (
        <Tooltip key={name} delay={500}>
          <Button isIconOnly size="sm" variant={variant} aria-label={name}>
            {icon}
          </Button>
          <Tooltip.Content placement="top" showArrow>
            <Tooltip.Arrow />
            {name}
          </Tooltip.Content>
        </Tooltip>
      ))}
    </div>
  )
}

/** A page of a long list, and the way to the others in Table.Footer, the strip under it. */
export const Pages: StoryObj = {
  name: 'Pages',
  render: function Render() {
    const w = useWords()
    const [page, setPage] = useState(1)
    const per = 4
    const pages = Math.ceil(orders.length / per)
    const rows = orders.slice((page - 1) * per, page * per)
    return (
      <Stage width={640}>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label={w.t('سفارش‌ها', 'Orders')}>
              <Table.Header>
                <Table.Column isRowHeader>{w.t('سفارش', 'Order')}</Table.Column>
                <Table.Column>{w.t('خریدار', 'Buyer')}</Table.Column>
                <Table.Column align="end">{w.t('مبلغ', 'Total')}</Table.Column>
              </Table.Header>
              <Table.Body>
                {rows.map((o) => (
                  <Table.Row key={o.id} id={String(o.id)}>
                    <Table.Cell>{w.code(o.id)}</Table.Cell>
                    <Table.Cell>{w.name(o.who)}</Table.Cell>
                    <Table.Cell align="end">{w.money(o.total)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
          <Table.Footer>
            <Pager page={page} pages={pages} per={per} total={orders.length} onPage={setPage} />
          </Table.Footer>
        </Table>
      </Stage>
    )
  },
}

/** The way through a list's pages: which rows these are, and a link to each page. */
function Pager({
  page,
  pages,
  per,
  total,
  onPage,
}: {
  page: number
  pages: number
  per: number
  total: number
  onPage: (page: number) => void
}) {
  const w = useWords()
  const first = (page - 1) * per + 1
  const last = Math.min(page * per, total)
  return (
    <Pagination size="sm">
      <Pagination.Summary>
        {w.t(
          `${w.num(first)} تا ${w.num(last)} از ${w.num(total)}`,
          `${first} to ${last} of ${total}`,
        )}
      </Pagination.Summary>
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous isDisabled={page === 1} onPress={() => onPage(page - 1)}>
            <Pagination.PreviousIcon />
            {w.t('قبلی', 'Previous')}
          </Pagination.Previous>
        </Pagination.Item>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <Pagination.Item key={p}>
            <Pagination.Link isActive={p === page} onPress={() => onPage(p)}>
              {w.num(p)}
            </Pagination.Link>
          </Pagination.Item>
        ))}
        <Pagination.Item>
          <Pagination.Next isDisabled={page === pages} onPress={() => onPage(page + 1)}>
            {w.t('بعدی', 'Next')}
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  )
}

/** Columns the reader widens or narrows by the handle at their end: the web's only. */
export const Resizing: StoryObj = {
  name: 'Columns to resize',
  render: function Render() {
    const w = useWords()
    return (
      <Stage width={720}>
        <Table>
          <Table.ResizableContainer>
            <Table.Content aria-label={w.t('سفارش‌ها', 'Orders')}>
              <Table.Header>
                <Table.Column id="order" isRowHeader defaultWidth="1fr" minWidth={100}>
                  {w.t('سفارش', 'Order')}
                  <Table.ColumnResizer />
                </Table.Column>
                <Table.Column id="buyer" defaultWidth="2fr" minWidth={160}>
                  {w.t('خریدار', 'Buyer')}
                  <Table.ColumnResizer />
                </Table.Column>
                <Table.Column id="status" defaultWidth="1fr" minWidth={140}>
                  {w.t('وضعیت', 'Status')}
                  <Table.ColumnResizer />
                </Table.Column>
                <Table.Column id="total" defaultWidth="1fr" minWidth={140} align="end">
                  {w.t('مبلغ', 'Total')}
                </Table.Column>
              </Table.Header>
              <Table.Body>
                {orders.slice(0, 4).map((o) => (
                  <Table.Row key={o.id} id={String(o.id)}>
                    <Table.Cell>{w.code(o.id)}</Table.Cell>
                    <Table.Cell>{w.name(o.who)}</Table.Cell>
                    <Table.Cell>
                      <StatusChip status={o.status} />
                    </Table.Cell>
                    <Table.Cell align="end">{w.money(o.total)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ResizableContainer>
        </Table>
      </Stage>
    )
  },
}

/** A long list that loads more as its end comes into view, a spinner while it does. */
export const LoadingMore: StoryObj = {
  name: 'Loading more',
  render: function Render() {
    const w = useWords()
    const [count, setCount] = useState(5)
    const [loading, setLoading] = useState(false)
    const busy = useRef(false)
    const more = count < orders.length
    const load = () => {
      if (!more || busy.current) return
      busy.current = true
      setLoading(true)
      setTimeout(() => {
        setCount((c) => Math.min(c + 4, orders.length))
        setLoading(false)
        busy.current = false
      }, 1200)
    }
    return (
      <Stage width={560}>
        <Table>
          <Table.ScrollContainer style={{ height: 300, overflowY: 'auto' }}>
            <Table.Content aria-label={w.t('سفارش‌ها', 'Orders')}>
              <Table.Header>
                <Table.Column isRowHeader>{w.t('سفارش', 'Order')}</Table.Column>
                <Table.Column>{w.t('خریدار', 'Buyer')}</Table.Column>
                <Table.Column align="end">{w.t('مبلغ', 'Total')}</Table.Column>
              </Table.Header>
              <Table.Body>
                <Table.Collection items={orders.slice(0, count)}>
                  {(o) => (
                    <Table.Row id={String(o.id)}>
                      <Table.Cell>{w.code(o.id)}</Table.Cell>
                      <Table.Cell>{w.name(o.who)}</Table.Cell>
                      <Table.Cell align="end">{w.money(o.total)}</Table.Cell>
                    </Table.Row>
                  )}
                </Table.Collection>
                {more ? (
                  <Table.LoadMore isLoading={loading} onLoadMore={load}>
                    <Table.LoadMoreContent>
                      <Spinner size="md" />
                    </Table.LoadMoreContent>
                  </Table.LoadMore>
                ) : null}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </Stage>
    )
  },
}

// ---- what it lists -------------------------------------------------------------------------------

/** The admin's orders: chosen rows get the bulk actions, sorted columns, a page at a time. */
export const OrdersPage: StoryObj = {
  name: 'Example: the orders',
  render: function Render() {
    const w = useWords()
    const [chosen, setChosen] = useState<Selection>(new Set())
    const [sort, setSort] = useState<SortDescriptor>({ column: 'date', direction: 'descending' })
    const [page, setPage] = useState(1)
    const per = 5
    const sorted = useMemo(() => sortOrders(orders, sort, w.name), [sort, w.fa])
    const rows = sorted.slice((page - 1) * per, page * per)
    const count = chosen === 'all' ? orders.length : chosen.size
    const sortable = (id: string, words: string, align?: 'end') => (
      <Table.Column id={id} allowsSorting isRowHeader={id === 'order'} align={align}>
        {({ sortDirection }) => (
          <Table.SortableColumnHeader sortDirection={sortDirection}>
            {words}
          </Table.SortableColumnHeader>
        )}
      </Table.Column>
    )
    return (
      <Stage width={880}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 40 }}>
            <span className="text-foreground" style={{ flex: 1, fontSize: 14 }}>
              {count
                ? w.t(`${w.num(count)} سفارش برگزیده`, `${count} chosen`)
                : w.t(`${w.num(orders.length)} سفارش`, `${orders.length} orders`)}
            </span>
            {count ? (
              <Toolbar aria-label={w.t('کار با برگزیده‌ها', 'With the chosen')}>
                <Button size="sm" variant="secondary">
                  <Printer />
                  {w.t('چاپ برچسب', 'Print labels')}
                </Button>
                <Button size="sm" variant="secondary">
                  <Truck />
                  {w.t('ارسال شد', 'Mark shipped')}
                </Button>
                <Separator />
                <Button size="sm" variant="danger-soft">
                  {w.t('لغو', 'Cancel')}
                </Button>
              </Toolbar>
            ) : null}
          </div>
          <Table>
            <Table.ScrollContainer>
              <Table.Content
                aria-label={w.t('سفارش‌ها', 'Orders')}
                selectionMode="multiple"
                selectedKeys={chosen}
                onSelectionChange={setChosen}
                sortDescriptor={sort}
                onSortChange={setSort}
                style={{ minWidth: 720 }}
              >
                <Table.Header>
                  <Table.Column id="select">
                    <Box />
                  </Table.Column>
                  {sortable('order', w.t('سفارش', 'Order'))}
                  {sortable('buyer', w.t('خریدار', 'Buyer'))}
                  {sortable('date', w.t('تاریخ', 'Date'))}
                  <Table.Column id="status">{w.t('وضعیت', 'Status')}</Table.Column>
                  {sortable('total', w.t('مبلغ', 'Total'), 'end')}
                  <Table.Column id="actions" align="end">
                    {w.t('کارها', 'Actions')}
                  </Table.Column>
                </Table.Header>
                <Table.Body>
                  {rows.map((o) => (
                    <Table.Row key={o.id} id={String(o.id)}>
                      <Table.Cell>
                        <Box />
                      </Table.Cell>
                      <Table.Cell>{w.code(o.id)}</Table.Cell>
                      <Table.Cell>
                        <Person
                          who={o.who}
                          note={w.t(`${w.num(o.items)} قلم`, `${o.items} items`)}
                        />
                      </Table.Cell>
                      <Table.Cell>{w.date(o.day)}</Table.Cell>
                      <Table.Cell>
                        <StatusChip status={o.status} />
                      </Table.Cell>
                      <Table.Cell align="end">{w.money(o.total)}</Table.Cell>
                      <Table.Cell>
                        <RowActions />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
            <Table.Footer>
              <Pager
                page={page}
                pages={Math.ceil(orders.length / per)}
                per={per}
                total={orders.length}
                onPage={setPage}
              />
            </Table.Footer>
          </Table>
        </div>
      </Stage>
    )
  },
}

/** The admin's product page: its variants' stock and prices, in a secondary table on its card. */
export const Stock: StoryObj = {
  name: 'Example: a product’s variants',
  render: function Render() {
    const w = useWords()
    const variants = [
      [w.t('زرشکی', 'Crimson'), 'SC-01', 12, 960_000],
      [w.t('سرمه‌ای', 'Navy'), 'SC-02', 3, 960_000],
      [w.t('طلایی', 'Gold'), 'SC-03', 0, 1_040_000],
    ] as const
    return (
      <Stage width={600}>
        <Card>
          <Card.Header>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src={goods.scarf.photo}
                alt=""
                style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover' }}
              />
              <div>
                <Card.Title>{w.t(goods.scarf.fa, goods.scarf.en)}</Card.Title>
                <Card.Description>{w.t('۳ گونه', '3 variants')}</Card.Description>
              </div>
            </div>
          </Card.Header>
          <Card.Content>
            <Table variant="secondary">
              <Table.ScrollContainer>
                <Table.Content aria-label={w.t('گونه‌ها', 'Variants')}>
                  <Table.Header>
                    <Table.Column isRowHeader>{w.t('رنگ', 'Colour')}</Table.Column>
                    <Table.Column>{w.t('کد', 'SKU')}</Table.Column>
                    <Table.Column align="end">{w.t('موجودی', 'Stock')}</Table.Column>
                    <Table.Column align="end">{w.t('قیمت', 'Price')}</Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {variants.map(([colour, sku, stock, price]) => (
                      <Table.Row key={sku} id={sku}>
                        <Table.Cell>{colour}</Table.Cell>
                        <Table.Cell>
                          <span dir="ltr">{sku}</span>
                        </Table.Cell>
                        <Table.Cell align="end">
                          {stock ? (
                            w.num(stock)
                          ) : (
                            <Chip size="sm" variant="soft" color="danger">
                              {w.t('ناموجود', 'Sold out')}
                            </Chip>
                          )}
                        </Table.Cell>
                        <Table.Cell align="end">{w.money(price)}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </Card.Content>
        </Card>
      </Stage>
    )
  },
}

/** A buyer's account in the storefront: their orders, each opening its page. */
export const BuyerOrders: StoryObj = {
  name: 'Example: a buyer’s orders',
  render: function Render() {
    const w = useWords()
    return (
      <Stage width={600}>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label={w.t('سفارش‌های من', 'My orders')}>
              <Table.Header>
                <Table.Column isRowHeader>{w.t('سفارش', 'Order')}</Table.Column>
                <Table.Column>{w.t('تاریخ', 'Date')}</Table.Column>
                <Table.Column>{w.t('وضعیت', 'Status')}</Table.Column>
                <Table.Column align="end">{w.t('مبلغ', 'Total')}</Table.Column>
              </Table.Header>
              <Table.Body>
                {[orders[0]!, orders[8]!].map((o) => (
                  <Table.Row key={o.id} id={String(o.id)} href={`#orders/${o.id}`}>
                    <Table.Cell>{w.code(o.id)}</Table.Cell>
                    <Table.Cell>{w.date(o.day)}</Table.Cell>
                    <Table.Cell>
                      <StatusChip status={o.status} />
                    </Table.Cell>
                    <Table.Cell align="end">{w.money(o.total)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </Stage>
    )
  },
}

/** A product page in the storefront: its size chart, read-only, on the product's card. */
export const SizeChart: StoryObj = {
  name: 'Example: a size chart',
  render: function Render() {
    const w = useWords()
    const sizes = [
      ['S', 96, 68],
      ['M', 102, 70],
      ['L', 108, 72],
      ['XL', 114, 74],
    ] as const
    return (
      <Stage width={420}>
        <Card>
          <Card.Header>
            <Card.Title>{w.t('راهنمای اندازه', 'Size guide')}</Card.Title>
            <Card.Description>{w.t('به سانتی‌متر', 'In centimetres')}</Card.Description>
          </Card.Header>
          <Card.Content>
            <Table variant="secondary">
              <Table.ScrollContainer>
                <Table.Content aria-label={w.t('راهنمای اندازه', 'Size guide')}>
                  <Table.Header>
                    <Table.Column isRowHeader>{w.t('اندازه', 'Size')}</Table.Column>
                    <Table.Column align="end">{w.t('دور سینه', 'Chest')}</Table.Column>
                    <Table.Column align="end">{w.t('قد', 'Length')}</Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {sizes.map(([size, chest, length]) => (
                      <Table.Row key={size} id={size}>
                        <Table.Cell>
                          <span dir="ltr">{size}</span>
                        </Table.Cell>
                        <Table.Cell align="end">{w.num(chest)}</Table.Cell>
                        <Table.Cell align="end">{w.num(length)}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </Card.Content>
        </Card>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

/** In both themes: the grey frame and white body, slate-800 and slate-900 in dark. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Orders rows={orders.slice(0, 3)} totals />
    </Themes>
  ),
}

/** On a Persian page and an English one: the first column at the start, sums at the end. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Orders rows={orders.slice(0, 3)} totals />
    </Directions>
  ),
}

/** On a phone: the columns share the width, and a table they cannot fit scrolls across. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Orders rows={orders.slice(0, 4)} selectionMode="multiple" />
    </Device>
  ),
}

/** The same table as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const w = useWords()
    const cell = (children: string): Record<string, unknown> => ({ type: 'Cell', children })
    const chip = (s: Status) => ({
      type: 'Cell',
      children: [
        { type: 'Chip', props: { size: 'sm', color: STATUS[s][2] }, children: w.status(s) },
      ],
    })
    const rows = orders.slice(0, 3)
    const tree = {
      type: 'Table',
      props: {
        label: w.t('سفارش‌ها', 'Orders'),
        selectionMode: 'multiple',
        defaultSortColumn: 'total',
        defaultSortDirection: 'descending',
        emptyMessage: w.t('هنوز سفارشی نرسیده است.', 'No orders yet.'),
      },
      children: [
        {
          type: 'TableHeader',
          children: [
            {
              type: 'Column',
              props: { id: 'order', isRowHeader: true },
              children: w.t('سفارش', 'Order'),
            },
            { type: 'Column', props: { id: 'buyer' }, children: w.t('خریدار', 'Buyer') },
            { type: 'Column', props: { id: 'status' }, children: w.t('وضعیت', 'Status') },
            {
              type: 'Column',
              props: { id: 'total', allowsSorting: true, align: 'end' },
              children: w.t('مبلغ', 'Total'),
            },
          ],
        },
        {
          type: 'TableBody',
          children: rows.map((o) => ({
            type: 'Row',
            props: { id: String(o.id) },
            children: [
              cell(w.code(o.id)),
              cell(w.name(o.who)),
              chip(o.status),
              cell(w.money(o.total)),
            ],
          })),
        },
        {
          type: 'TableFooter',
          children: [
            {
              type: 'Row',
              props: { id: 'sum' },
              children: [
                cell(w.t('جمع', 'Total')),
                cell(''),
                cell(''),
                cell(w.money(rows.reduce((s, o) => s + o.total, 0))),
              ],
            },
          ],
        },
      ],
    }
    return (
      <Grid min={420}>
        <Example
          title={w.t('آنچه کشیده می‌شود', 'What is drawn')}
          note={w.t('در وب و در Flutter', 'On the web and in Flutter')}
        >
          <DibaSurface tree={tree as never} />
        </Example>
        <Example title={w.t('درخت', 'The tree')}>
          <pre
            dir="ltr"
            className="text-foreground"
            style={{
              margin: 0,
              fontSize: 12,
              lineHeight: '18px',
              background: 'var(--default)',
              borderRadius: 16,
              padding: 16,
              overflow: 'auto',
              maxHeight: 480,
            }}
          >
            {JSON.stringify(tree, null, 2)}
          </pre>
        </Example>
      </Grid>
    )
  },
}
