import type { Meta, StoryObj } from '@storybook/react-vite'
import { Download, Package, Plus, ShoppingBag, TrendingDown, TrendingUp, Users } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { Key, Selection } from 'react-aria-components'
import { Device, Directions, Stage, Themes, useT } from '../stories/kit'
import { face, people } from '../stories/people'
import {
  Breadcrumbs,
  Button,
  buttonVariants,
  Card,
  Chip,
  Description,
  Input,
  Label,
  Link,
  ListBox,
  Meter,
  Pagination,
  SearchField,
  Select,
  Separator,
  Stack,
  Switch,
  Table,
  Text,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '../index'

// The admin's pages, composed from the basics: a page's head, the day's figures, a list to work
// through, a settings section and a record's page. The docs page is Admin.mdx. A line comment,
// not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Patterns/Admin pages',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

/** A number in the story's digits. */
function useNum() {
  const t = useT()
  const locale = t('fa-IR', 'en-US')
  return (v: number) => v.toLocaleString(locale)
}

/** A page's head: the way back up, its title and what it is, and its actions at the end. */
function PageHead({
  trail,
  title,
  help,
  children,
}: {
  trail: [string, string][]
  title: string
  help?: string
  children?: ReactNode
}) {
  return (
    <Stack gap={3}>
      <Breadcrumbs>
        {trail.map(([words, href]) => (
          <Breadcrumbs.Item key={words} href={href || undefined}>
            {words}
          </Breadcrumbs.Item>
        ))}
      </Breadcrumbs>
      <Stack direction="horizontal" gap={3} align="center" wrap>
        <Stack gap={1} style={{ flex: 1, minWidth: 220 }}>
          <Text as="h1" size="2xl" weight="semibold">
            {title}
          </Text>
          {help ? (
            <Text size="sm" tone="muted">
              {help}
            </Text>
          ) : null}
        </Stack>
        {children}
      </Stack>
    </Stack>
  )
}

/** A page's head with its actions: one primary way on, the rest quieter. */
export const PageHeads: StoryObj = {
  name: 'A page’s head',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={880}>
        <PageHead
          trail={[
            [t('پیشخوان', 'Dashboard'), '#home'],
            [t('کالاها', 'Products'), ''],
          ]}
          title={t('کالاها', 'Products')}
          help={t('۱۲۴ کالا، ۸ ناموجود', '124 products, 8 sold out')}
        >
          <Stack direction="horizontal" gap={2}>
            <Button size="sm" variant="secondary">
              <Download />
              {t('خروجی', 'Export')}
            </Button>
            <Link href="#products/new" className={buttonVariants({ size: 'sm' })}>
              <Plus />
              {t('افزودن کالا', 'Add product')}
            </Link>
          </Stack>
        </PageHead>
      </Stage>
    )
  },
}

/** A figure on its card: what it counts, its value, and how it moved. */
function Figure({
  icon,
  name,
  value,
  change,
  up,
}: {
  icon: ReactNode
  name: string
  value: string
  change: string
  up: boolean
}) {
  return (
    <Card>
      <Stack gap={2}>
        <Stack direction="horizontal" gap={2} align="center">
          <span style={{ display: 'inline-flex', color: 'var(--muted)' }} aria-hidden>
            {icon}
          </span>
          <Text size="sm" tone="muted">
            {name}
          </Text>
        </Stack>
        <Text size="2xl" weight="semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </Text>
        <div>
          <Chip variant="soft" color={up ? 'success' : 'danger'}>
            {up ? <TrendingUp /> : <TrendingDown />}
            <Chip.Label>{change}</Chip.Label>
          </Chip>
        </div>
      </Stack>
    </Card>
  )
}

/** The admin's home: the day's figures, each on its card, and the plan's limit. */
export const Figures: StoryObj = {
  name: 'The day’s figures',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={960}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
            gap: 16,
          }}
        >
          <Figure
            icon={<ShoppingBag size={16} />}
            name={t('فروش امروز', 'Sales today')}
            value={t('۴٬۲۰۰٬۰۰۰ تومان', '4,200,000 toman')}
            change={t('۱۲٪ بیش از دیروز', '12% over yesterday')}
            up
          />
          <Figure
            icon={<Package size={16} />}
            name={t('آمادهٔ ارسال', 'Ready to ship')}
            value={t('۷ سفارش', '7 orders')}
            change={t('۲ کمتر از دیروز', '2 fewer than yesterday')}
            up={false}
          />
          <Figure
            icon={<Users size={16} />}
            name={t('خریداران تازه', 'New buyers')}
            value={t('۱۸', '18')}
            change={t('۵٪ بیش از هفتهٔ پیش', '5% over last week')}
            up
          />
          <Card>
            <Meter
              value={86}
              maxValue={100}
              color="warning"
              valueLabel={t('۸۶ از ۱۰۰', '86 of 100')}
            >
              <Label>{t('کالاهای طرح', 'Plan’s products')}</Label>
              <Meter.Output />
              <Meter.Track>
                <Meter.Fill />
              </Meter.Track>
            </Meter>
            <Link href="#plan">{t('گسترش طرح', 'Upgrade the plan')}</Link>
          </Card>
        </div>
      </Stage>
    )
  },
}

type Status = 'waiting' | 'shipped' | 'cancelled'
const orders: { id: number; who: number; total: number; status: Status }[] = [
  { id: 1041, who: 0, total: 1_280_000, status: 'waiting' },
  { id: 1042, who: 1, total: 320_000, status: 'shipped' },
  { id: 1043, who: 2, total: 960_000, status: 'shipped' },
  { id: 1044, who: 3, total: 2_450_000, status: 'waiting' },
  { id: 1045, who: 4, total: 185_000, status: 'cancelled' },
]
const TONE = { waiting: 'warning', shipped: 'success', cancelled: 'danger' } as const

/** A list to work through: its search and a filter over a table, and its pages under it. */
export const ListPage: StoryObj = {
  name: 'A list to work through',
  render: function Render() {
    const t = useT()
    const num = useNum()
    const words: Record<Status, string> = {
      waiting: t('در انتظار ارسال', 'Waiting'),
      shipped: t('ارسال‌شده', 'Shipped'),
      cancelled: t('لغو شده', 'Cancelled'),
    }
    const [show, setShow] = useState<Selection>(new Set(['all']))
    const [query, setQuery] = useState('')
    const chosen = [...(show as Set<Key>)][0] ?? 'all'
    const rows = orders.filter(
      (o) =>
        (chosen === 'all' || o.status === chosen) &&
        (!query ||
          t(people[o.who]!.fa, people[o.who]!.en).includes(query) ||
          String(o.id).includes(query)),
    )
    return (
      <Stage width={880}>
        <Stack gap={4}>
          <PageHead
            trail={[
              [t('پیشخوان', 'Dashboard'), '#home'],
              [t('سفارش‌ها', 'Orders'), ''],
            ]}
            title={t('سفارش‌ها', 'Orders')}
          />
          <Stack direction="horizontal" gap={3} align="center" wrap>
            <SearchField
              aria-label={t('جست‌وجوی سفارش', 'Search orders')}
              value={query}
              onChange={setQuery}
              style={{ flex: 1, minWidth: 220 }}
            >
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input
                  placeholder={t('نام خریدار یا شمارهٔ سفارش', 'Buyer or order number')}
                />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <ToggleButtonGroup
              aria-label={t('وضعیت', 'Status')}
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={show}
              onSelectionChange={setShow}
              size="sm"
            >
              <ToggleButton id="all">{t('همه', 'All')}</ToggleButton>
              <ToggleButton id="waiting">{words.waiting}</ToggleButton>
              <ToggleButton id="shipped">{words.shipped}</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label={t('سفارش‌ها', 'Orders')}>
                <Table.Header>
                  <Table.Column isRowHeader>{t('سفارش', 'Order')}</Table.Column>
                  <Table.Column>{t('خریدار', 'Buyer')}</Table.Column>
                  <Table.Column>{t('وضعیت', 'Status')}</Table.Column>
                  <Table.Column align="end">{t('مبلغ', 'Total')}</Table.Column>
                </Table.Header>
                <Table.Body
                  renderEmptyState={() => (
                    <div className="table__empty">
                      {t('سفارشی با این جست‌وجو نیست.', 'No orders match.')}
                    </div>
                  )}
                >
                  {rows.map((o) => (
                    <Table.Row key={o.id} id={String(o.id)}>
                      <Table.Cell>{t(num(o.id).replace(/٬/g, ''), `#${o.id}`)}</Table.Cell>
                      <Table.Cell>{t(people[o.who]!.fa, people[o.who]!.en)}</Table.Cell>
                      <Table.Cell>
                        <Chip variant="soft" color={TONE[o.status]}>
                          {words[o.status]}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell align="end">
                        {t(`${num(o.total)} تومان`, `${num(o.total)} toman`)}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
            <Table.Footer>
              <Pagination size="sm" aria-label={t('صفحه‌های سفارش', 'Order pages')}>
                <Pagination.Summary>
                  {t(`${num(rows.length)} سفارش`, `${rows.length} orders`)}
                </Pagination.Summary>
                <Pagination.Content>
                  <Pagination.Item>
                    <Pagination.Link isActive>{num(1)}</Pagination.Link>
                  </Pagination.Item>
                </Pagination.Content>
              </Pagination>
            </Table.Footer>
          </Table>
        </Stack>
      </Stage>
    )
  },
}

/** A settings section: switches with what they do, a field, a choice, and the way to save. */
export const Settings: StoryObj = {
  name: 'A settings section',
  render: function Render() {
    const t = useT()
    const toggle = (label: string, help: string, on: boolean) => (
      <Switch defaultSelected={on}>
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Label>{label}</Label>
        </Switch.Content>
        <Description>{help}</Description>
      </Switch>
    )
    return (
      <Stage width={640}>
        <Card>
          <Card.Header>
            <Card.Title>{t('ارسال', 'Shipping')}</Card.Title>
            <Card.Description>
              {t('آنچه خریدار هنگام پرداخت می‌بیند.', 'What a buyer sees at checkout.')}
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <Stack gap={4}>
              {toggle(
                t('ارسال رایگان', 'Free delivery'),
                t('برای سفارش‌های بیش از حدی که می‌گذارید.', 'For orders over the amount you set.'),
                true,
              )}
              <TextField defaultValue="500000">
                <Label>{t('از چه مبلغی', 'From how much')}</Label>
                <Input dir="ltr" />
                <Description>{t('به تومان', 'In toman')}</Description>
              </TextField>
              <Select defaultSelectedKey="tipax">
                <Label>{t('روش پیش‌فرض', 'Default method')}</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="tipax">{t('تیپاکس', 'Tipax')}</ListBox.Item>
                    <ListBox.Item id="post">{t('پست پیشتاز', 'Express post')}</ListBox.Item>
                    <ListBox.Item id="courier">{t('پیک فروشگاه', 'Shop courier')}</ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
              <Separator />
              {toggle(
                t('تحویل حضوری', 'Pick up in person'),
                t(
                  'خریدار سفارش را از فروشگاه می‌برد.',
                  'The buyer collects the order from the shop.',
                ),
                false,
              )}
            </Stack>
          </Card.Content>
          <Card.Footer>
            <Stack direction="horizontal" gap={2} justify="end" style={{ width: '100%' }}>
              <Button size="sm" variant="tertiary">
                {t('انصراف', 'Cancel')}
              </Button>
              <Button size="sm">{t('ذخیره', 'Save')}</Button>
            </Stack>
          </Card.Footer>
        </Card>
      </Stage>
    )
  },
}

/** A record's page: what was ordered beside who ordered it and where it goes. */
export const RecordPage: StoryObj = {
  name: 'A record’s page',
  render: function Render() {
    const t = useT()
    const num = useNum()
    const fa = t('fa', 'en') === 'fa'
    const items = [
      [t('چای لاهیجان', 'Lahijan tea'), 2, 256_000],
      [t('شال ابریشم', 'Silk scarf'), 1, 960_000],
    ] as const
    const total = items.reduce((s, [, n, p]) => s + n * p, 0)
    return (
      <Stage width={960}>
        <Stack gap={4}>
          <PageHead
            trail={[
              [t('سفارش‌ها', 'Orders'), '#orders'],
              [t('سفارش ۱۰۴۱', 'Order 1041'), ''],
            ]}
            title={t('سفارش ۱۰۴۱', 'Order 1041')}
            help={t('۱۴ آبان، ۱۸:۲۰', '5 Nov, 18:20')}
          >
            <Chip variant="soft" color="warning">
              {t('در انتظار ارسال', 'Waiting')}
            </Chip>
            <Button size="sm">{t('چاپ برچسب', 'Print label')}</Button>
          </PageHead>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <Card style={{ gridColumn: 'span 2' }}>
              <Card.Header>
                <Card.Title>{t('اقلام', 'Items')}</Card.Title>
              </Card.Header>
              <Table variant="secondary">
                <Table.ScrollContainer>
                  <Table.Content aria-label={t('اقلام', 'Items')}>
                    <Table.Header>
                      <Table.Column isRowHeader>{t('کالا', 'Product')}</Table.Column>
                      <Table.Column align="end">{t('تعداد', 'Qty')}</Table.Column>
                      <Table.Column align="end">{t('مبلغ', 'Amount')}</Table.Column>
                    </Table.Header>
                    <Table.Body>
                      {items.map(([name, n, price]) => (
                        <Table.Row key={name} id={name}>
                          <Table.Cell>{name}</Table.Cell>
                          <Table.Cell align="end">{num(n)}</Table.Cell>
                          <Table.Cell align="end">{num(n * price)}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                    <Table.Foot>
                      <Table.Row id="sum">
                        <Table.Cell>{t('جمع', 'Total')}</Table.Cell>
                        <Table.Cell>{''}</Table.Cell>
                        <Table.Cell align="end">
                          {t(`${num(total)} تومان`, `${num(total)} toman`)}
                        </Table.Cell>
                      </Table.Row>
                    </Table.Foot>
                  </Table.Content>
                </Table.ScrollContainer>
              </Table>
            </Card>
            <Stack gap={4}>
              <Card>
                <Card.Header>
                  <Card.Title>{t('خریدار', 'Buyer')}</Card.Title>
                </Card.Header>
                <Stack direction="horizontal" gap={3} align="center">
                  {face({ person: people[0]!, persian: fa, hidden: true })}
                  <Stack gap={0}>
                    <Text size="sm" weight="medium">
                      {t(people[0]!.fa, people[0]!.en)}
                    </Text>
                    <Text size="sm" tone="muted">
                      <span dir="ltr">0912 345 6789</span>
                    </Text>
                  </Stack>
                </Stack>
              </Card>
              <Card>
                <Card.Header>
                  <Card.Title>{t('نشانی', 'Address')}</Card.Title>
                </Card.Header>
                <Text size="sm">
                  {t(
                    'تهران، خیابان ولیعصر، کوچهٔ نهم، پلاک ۱۲',
                    '12, Ninth Lane, Valiasr St, Tehran',
                  )}
                </Text>
                <Link href="#map">{t('دیدن روی نقشه', 'See it on the map')}</Link>
              </Card>
            </Stack>
          </div>
        </Stack>
      </Stage>
    )
  },
}

// ---- everywhere they are drawn -------------------------------------------------------------------

function Two() {
  const t = useT()
  return (
    <Stack gap={3}>
      <Figure
        icon={<ShoppingBag size={16} />}
        name={t('فروش امروز', 'Sales today')}
        value={t('۴٬۲۰۰٬۰۰۰ تومان', '4,200,000 toman')}
        change={t('۱۲٪ بیش از دیروز', '12% over yesterday')}
        up
      />
      <Figure
        icon={<Package size={16} />}
        name={t('آمادهٔ ارسال', 'Ready to ship')}
        value={t('۷ سفارش', '7 orders')}
        change={t('۲ کمتر از دیروز', '2 fewer than yesterday')}
        up={false}
      />
    </Stack>
  )
}

/** In both themes. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Two />
    </Themes>
  ),
}

/** On a Persian page and an English one. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Two />
    </Directions>
  ),
}

/** On a phone: a page's head, its actions wrapping under its title. */
export const OnAPhone: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Device>
        <PageHead
          trail={[
            [t('پیشخوان', 'Dashboard'), '#home'],
            [t('کالاها', 'Products'), ''],
          ]}
          title={t('کالاها', 'Products')}
          help={t('۱۲۴ کالا، ۸ ناموجود', '124 products, 8 sold out')}
        >
          <Link href="#products/new" className={buttonVariants({ size: 'sm' })}>
            <Plus />
            {t('افزودن کالا', 'Add product')}
          </Link>
        </PageHead>
      </Device>
    )
  },
}
