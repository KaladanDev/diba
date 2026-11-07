import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Bell,
  CreditCard,
  History,
  Lock,
  MapPin,
  Package,
  Palette,
  Plus,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Store,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { createElement, useState, type ReactNode } from 'react'
import type { Key } from 'react-aria-components'
import { DibaSurface } from '../../sdui'
import {
  Device,
  Directions,
  Example,
  Grid,
  Page,
  Stage,
  Themes,
  useT,
  Value,
} from '../../stories/kit'
import { Button } from '../button'
import { Checkbox } from '../checkbox'
import { CheckboxGroup } from '../checkbox-group'
import { Chip } from '../chip'
import { Description } from '../description'
import { Input } from '../input'
import { Label } from '../label'
import { Slider } from '../slider'
import { Switch } from '../switch'
import { TextField } from '../textfield'
import { Accordion } from './index'

// The Accordion, every option it has and what it is built into, for anyone choosing what to
// build: the copied one, in Diba's look on both platforms. The docs page is
// Accordion.mdx. A line comment, not a doc comment: the docs plugin replaces a commented meta's
// parameters with one.
const meta = {
  title: 'Components/Navigation/Accordion',
  component: Accordion,
  // Fullscreen: the canvas pads itself, on the theme's page colour.
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Accordion>

export default meta

// ---- the parts every story writes --------------------------------------------------------------

type T = ReturnType<typeof useT>

type Entry = {
  id: string
  title: string
  description?: string
  icon?: LucideIcon
  extra?: ReactNode
  isDisabled?: boolean
  content: ReactNode
}

/** An icon 16 across and muted, 12 before its title, as the block draws one. */
function Lead({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon aria-hidden className="text-muted size-4 shrink-0" style={{ marginInlineEnd: 12 }} />
}

/** The items of [entries], each a heading whose trigger opens its panel. */
function items(entries: Entry[], indicator?: (entry: Entry) => ReactNode) {
  return entries.map((entry) => (
    <Accordion.Item key={entry.id} id={entry.id} isDisabled={entry.isDisabled}>
      <Accordion.Heading>
        <Accordion.Trigger>
          {entry.icon ? <Lead icon={entry.icon} /> : null}
          {entry.description ? (
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span>{entry.title}</span>
              <span className="text-muted" style={{ fontSize: 12, fontWeight: 400 }}>
                {entry.description}
              </span>
            </span>
          ) : (
            entry.title
          )}
          {entry.extra}
          {indicator ? (
            indicator(entry)
          ) : (
            // Beside an extra, which takes the end itself, the chevron does not push.
            <Accordion.Indicator style={entry.extra ? { marginInlineStart: 0 } : undefined} />
          )}
        </Accordion.Trigger>
      </Accordion.Heading>
      <Accordion.Panel>
        <Accordion.Body>{entry.content}</Accordion.Body>
      </Accordion.Panel>
    </Accordion.Item>
  ))
}

/** A storefront's questions, the example most stories open with. */
function faq(t: T, { icons = false, descriptions = false } = {}): Entry[] {
  return [
    {
      id: 'shipping',
      icon: icons ? Truck : undefined,
      title: t('ارسال چقدر طول می‌کشد؟', 'How long does delivery take?'),
      description: descriptions ? t('تهران و شهرستان‌ها', 'Tehran and other cities') : undefined,
      content: t(
        'سفارش‌های تهران یک تا دو روز کاری و شهرستان‌ها دو تا چهار روز کاری می‌رسند. کد رهگیری پس از ارسال پیامک می‌شود.',
        'Orders in Tehran arrive in one to two working days, elsewhere in two to four. A tracking code is texted once it ships.',
      ),
    },
    {
      id: 'returns',
      icon: icons ? RotateCcw : undefined,
      title: t('می‌توانم سفارش را مرجوع کنم؟', 'Can I return an order?'),
      description: descriptions
        ? t('تا هفت روز پس از تحویل', 'Up to seven days after delivery')
        : undefined,
      content: t(
        'تا هفت روز پس از تحویل، کالای استفاده‌نشده را بی‌پرسش پس می‌گیریم و هزینه به همان کارت برمی‌گردد.',
        'Within seven days of delivery we take back unused items, no questions asked, and refund the same card.',
      ),
    },
    {
      id: 'payment',
      icon: icons ? CreditCard : undefined,
      title: t('چه روش‌های پرداختی دارید؟', 'Which payment methods do you take?'),
      description: descriptions
        ? t('کارت، کیف پول و پرداخت در محل', 'Card, wallet and cash on delivery')
        : undefined,
      content: t(
        'همهٔ کارت‌های عضو شتاب، کیف پول کالادان و در تهران پرداخت در محل.',
        'Every Shetab card, the Kaladan wallet and, in Tehran, cash on delivery.',
      ),
    },
    {
      id: 'security',
      icon: icons ? ShieldCheck : undefined,
      title: t('پرداخت من امن است؟', 'Is my payment secure?'),
      description: descriptions ? t('درگاه شاپرک', 'Through Shaparak') : undefined,
      content: t(
        'پرداخت در درگاه شاپرک انجام می‌شود و شمارهٔ کارت شما هرگز به فروشگاه نمی‌رسد.',
        'You pay on a Shaparak gateway; your card number never reaches the shop.',
      ),
    },
  ]
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  variant: 'default' | 'surface'
  allowsMultipleExpanded: boolean
  hideSeparator: boolean
  isDisabled: boolean
  icons: boolean
  descriptions: boolean
  width: number
}

/** Every option on the controls, on a storefront's questions. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    variant: 'default',
    allowsMultipleExpanded: false,
    hideSeparator: false,
    isDisabled: false,
    icons: false,
    descriptions: false,
    width: 640,
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'surface'],
      description: "`surface` draws the items on a card's paper, 24 round.",
      table: { category: 'Accordion', defaultValue: { summary: 'default' } },
    },
    allowsMultipleExpanded: {
      description: 'More than one item open at a time.',
      table: { category: 'Accordion', defaultValue: { summary: 'false' } },
    },
    hideSeparator: {
      description: 'No line between items.',
      table: { category: 'Accordion', defaultValue: { summary: 'false' } },
    },
    isDisabled: {
      description: 'No item opens or closes.',
      table: { category: 'Accordion', defaultValue: { summary: 'false' } },
    },
    icons: { description: 'An icon before each title.', table: { category: 'Example' } },
    descriptions: {
      description: 'A second line under each title.',
      table: { category: 'Example' },
    },
    width: {
      control: { type: 'range', min: 280, max: 960, step: 20 },
      description: 'How wide the example is drawn.',
      table: { category: 'Example' },
    },
  },
  render: function Render({ icons, descriptions, width, ...props }) {
    const t = useT()
    return (
      <Stage width={width}>
        <Accordion {...props} defaultExpandedKeys={['shipping']}>
          {items(faq(t, { icons, descriptions }))}
        </Accordion>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Default lies on the page; surface on a card's paper, its own. */
export const Variants: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={320}>
        <Example
          title={t('پیش‌فرض', 'Default')}
          note={t('روی صفحه، خطی میان بخش‌ها', 'On the page, a line between items')}
        >
          <Accordion defaultExpandedKeys={['shipping']}>{items(faq(t))}</Accordion>
        </Example>
        <Example
          title={t('رویه', 'Surface')}
          note={t('روی کاغذ کارت، ۲۴ گرد', "On a card's paper, 24 round")}
        >
          <Accordion variant="surface" defaultExpandedKeys={['shipping']}>
            {items(faq(t))}
          </Accordion>
        </Example>
      </Grid>
    )
  },
}

/** One item open at a time, the default, or as many as the reader wants. */
export const Expansion: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={320}>
        <Example
          title={t('یکی در هر بار', 'One at a time')}
          note={t('باز کردن یکی، دیگری را می‌بندد', 'Opening one closes the other')}
        >
          <Accordion defaultExpandedKeys={['shipping']}>{items(faq(t))}</Accordion>
        </Example>
        <Example title={t('چندتایی', 'Several at once')} note="allowsMultipleExpanded">
          <Accordion allowsMultipleExpanded defaultExpandedKeys={['shipping', 'returns']}>
            {items(faq(t))}
          </Accordion>
        </Example>
        <Example
          title={t('همه بسته', 'All closed')}
          note={t('بی defaultExpandedKeys', 'No defaultExpandedKeys')}
        >
          <Accordion>{items(faq(t))}</Accordion>
        </Example>
      </Grid>
    )
  },
}

/** Its open items held by the page, which can open or close every one of them. */
export const Controlled: StoryObj = {
  render: function Render() {
    const t = useT()
    const entries = faq(t, { icons: true })
    const [open, setOpen] = useState<Set<Key>>(new Set(['shipping']))
    return (
      <Stage>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button
              size="sm"
              variant="secondary"
              onPress={() => setOpen(new Set(entries.map((e) => e.id)))}
            >
              {t('باز کردن همه', 'Expand all')}
            </Button>
            <Button size="sm" variant="secondary" onPress={() => setOpen(new Set())}>
              {t('بستن همه', 'Collapse all')}
            </Button>
          </div>
          <Accordion allowsMultipleExpanded expandedKeys={open} onExpandedChange={setOpen}>
            {items(entries)}
          </Accordion>
          <Value label="expandedKeys" value={[...open]} />
        </div>
      </Stage>
    )
  },
}

/** The whole accordion disabled, or one item of it. */
export const Disabled: StoryObj = {
  render: function Render() {
    const t = useT()
    const entries = faq(t)
    return (
      <Grid min={320}>
        <Example title={t('همه غیرفعال', 'All disabled')} note="isDisabled">
          <Accordion isDisabled>{items(entries)}</Accordion>
        </Example>
        <Example
          title={t('یک بخش غیرفعال', 'One item disabled')}
          note="<Accordion.Item isDisabled>"
        >
          <Accordion>
            {items(entries.map((e) => (e.id === 'payment' ? { ...e, isDisabled: true } : e)))}
          </Accordion>
        </Example>
      </Grid>
    )
  },
}

/** No line between items, for a list that sits in its own space. */
export const WithoutSeparators: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={320}>
        <Example title={t('پیش‌فرض', 'Default')} note="hideSeparator">
          <Accordion hideSeparator defaultExpandedKeys={['shipping']}>
            {items(faq(t))}
          </Accordion>
        </Example>
        <Example title={t('رویه', 'Surface')} note="variant=surface hideSeparator">
          <Accordion variant="surface" hideSeparator defaultExpandedKeys={['shipping']}>
            {items(faq(t))}
          </Accordion>
        </Example>
      </Grid>
    )
  },
}

/** An icon before each title, and a second line under it. */
export const IconsAndDescriptions: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={320}>
        <Example
          title={t('با آیکون', 'With icons')}
          note={t('۱۶، کم‌رنگ، ۱۲ پیش از عنوان', '16, muted, 12 before the title')}
        >
          <Accordion>{items(faq(t, { icons: true }))}</Accordion>
        </Example>
        <Example title={t('با توضیح', 'With descriptions')}>
          <Accordion>{items(faq(t, { descriptions: true }))}</Accordion>
        </Example>
        <Example title={t('هر دو', 'Both')}>
          <Accordion variant="surface">
            {items(faq(t, { icons: true, descriptions: true }))}
          </Accordion>
        </Example>
      </Grid>
    )
  },
}

/** Something beside the title: a count, a status, before the chevron. */
export const TriggerExtras: StoryObj = {
  render: function Render() {
    const t = useT()
    const chip = (label: string, color: 'success' | 'warning' | 'danger' | 'default') => (
      <Chip
        size="sm"
        variant="soft"
        color={color}
        style={{ marginInlineStart: 'auto', marginInlineEnd: 12 }}
      >
        <Chip.Label>{label}</Chip.Label>
      </Chip>
    )
    const entries: Entry[] = [
      {
        id: 'unpaid',
        icon: Receipt,
        title: t('در انتظار پرداخت', 'Awaiting payment'),
        extra: chip(t('۳', '3'), 'warning'),
        content: t('سه سفارش هنوز پرداخت نشده‌اند.', 'Three orders are not paid yet.'),
      },
      {
        id: 'ready',
        icon: Package,
        title: t('آمادهٔ ارسال', 'Ready to ship'),
        extra: chip(t('۱۲', '12'), 'success'),
        content: t('دوازده سفارش بسته‌بندی شده‌اند.', 'Twelve orders are packed.'),
      },
      {
        id: 'returns',
        icon: RotateCcw,
        title: t('درخواست مرجوعی', 'Return requests'),
        extra: chip(t('۱', '1'), 'danger'),
        content: t('یک درخواست بررسی نشده.', 'One request is waiting for review.'),
      },
    ]
    return (
      <Stage>
        <Accordion variant="surface" allowsMultipleExpanded>
          {items(entries, () => (
            <Accordion.Indicator style={{ marginInlineStart: 0 }} />
          ))}
        </Accordion>
      </Stage>
    )
  },
}

/** Any element as the indicator, turned as the item opens, or the chevron at the start. */
export const CustomIndicator: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={320}>
        <Example
          title={t('بعلاوه‌ای که ضربدر می‌شود', 'A plus that turns into a cross')}
          note={t('بازشده، ۴۵ درجه می‌چرخد', 'Turned 45° when open')}
        >
          <Accordion>
            {items(faq(t), () => (
              <Accordion.Indicator className="data-[expanded=true]:rotate-45">
                <Plus />
              </Accordion.Indicator>
            ))}
          </Accordion>
        </Example>
        <Example
          title={t('نشانگر در آغاز', 'The chevron at the start')}
          note={t('پیش از عنوان، ۱۲ فاصله', 'Before the title, 12 apart')}
        >
          <Accordion>
            {faq(t).map((entry) => (
              <Accordion.Item key={entry.id} id={entry.id}>
                <Accordion.Heading>
                  <Accordion.Trigger style={{ justifyContent: 'flex-start' }}>
                    <Accordion.Indicator style={{ marginInlineStart: 0, marginInlineEnd: 12 }} />
                    {entry.title}
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body>{entry.content}</Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Example>
      </Grid>
    )
  },
}

/** Fields, buttons and another accordion inside a panel. */
export const RichContent: StoryObj = {
  render: function Render() {
    const t = useT()
    const entries: Entry[] = [
      {
        id: 'contact',
        icon: Store,
        title: t('اطلاعات تماس فروشگاه', 'Store contact details'),
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TextField defaultValue="۰۲۱-۸۸۷۷۶۶۵۵">
              <Label>{t('تلفن پشتیبانی', 'Support phone')}</Label>
              <Input />
              <Description>
                {t('در پای صفحهٔ فروشگاه دیده می‌شود.', "Shown in the store's footer.")}
              </Description>
            </TextField>
            <TextField defaultValue="support@shop.ir">
              <Label>{t('ایمیل', 'Email')}</Label>
              <Input dir="ltr" />
            </TextField>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm">{t('ذخیره', 'Save')}</Button>
              <Button size="sm" variant="tertiary">
                {t('انصراف', 'Cancel')}
              </Button>
            </div>
          </div>
        ),
      },
      {
        id: 'nested',
        icon: History,
        title: t('سؤال‌های بیشتر', 'More questions'),
        content: <Accordion variant="surface">{items(faq(t).slice(0, 2))}</Accordion>,
      },
      {
        id: 'list',
        icon: MapPin,
        title: t('شعبه‌ها', 'Branches'),
        content: (
          <ul
            style={{
              margin: 0,
              paddingInlineStart: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <li>{t('تهران، خیابان ولیعصر', 'Tehran, Valiasr Street')}</li>
            <li>{t('اصفهان، چهارباغ', 'Isfahan, Chaharbagh')}</li>
            <li>{t('شیراز، خیابان زند', 'Shiraz, Zand Street')}</li>
          </ul>
        ),
      },
    ]
    return (
      <Stage>
        <Accordion allowsMultipleExpanded defaultExpandedKeys={['contact']}>
          {items(entries)}
        </Accordion>
      </Stage>
    )
  },
}

/** A long list: twenty items, keyboard reachable one by one. */
export const ManyItems: StoryObj = {
  render: function Render() {
    const t = useT()
    const entries: Entry[] = Array.from({ length: 20 }, (_, i) => {
      const n = (i + 1).toLocaleString(t('fa-IR', 'en-US'))
      return {
        id: `q${i + 1}`,
        title: t(`پرسش ${n}`, `Question ${n}`),
        content: t(`پاسخ پرسش ${n}.`, `The answer to question ${n}.`),
      }
    })
    return (
      <Stage>
        <Accordion>{items(entries)}</Accordion>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** A storefront's help page: questions in sections, each on its own card. */
export const FAQPage: StoryObj = {
  name: 'Example: FAQ page',
  render: function Render() {
    const t = useT()
    const all = faq(t)
    const sections = [
      { title: t('ارسال و تحویل', 'Shipping and delivery'), entries: all.slice(0, 2) },
      { title: t('پرداخت', 'Payment'), entries: all.slice(2) },
    ]
    return (
      <Page
        title={t('پرسش‌های پرتکرار', 'Frequently asked questions')}
        lead={t(
          'هر آنچه پیش از خرید باید بدانید. پاسخ پرسش خود را نیافتید؟ با پشتیبانی تماس بگیرید.',
          "Everything to know before you buy. Can't find your answer? Contact support.",
        )}
      >
        <Stage width={760}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {sections.map((section) => (
              <section
                key={section.title}
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                <h3 className="text-muted" style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                  {section.title}
                </h3>
                <Accordion variant="surface">{items(section.entries)}</Accordion>
              </section>
            ))}
          </div>
        </Stage>
      </Page>
    )
  },
}

/** An order in the admin: its items, delivery, payment and history, each opened on demand. */
export const OrderDetails: StoryObj = {
  name: 'Example: order details',
  render: function Render() {
    const t = useT()
    const row = (label: string, value: string) => (
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <span>{label}</span>
        <span className="text-foreground">{value}</span>
      </div>
    )
    const entries: Entry[] = [
      {
        id: 'items',
        icon: Package,
        title: t('اقلام', 'Items'),
        description: t('۳ قلم، ۱٬۲۴۰٬۰۰۰ تومان', '3 items, 1,240,000 toman'),
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {row(t('شال ابریشم × ۱', 'Silk scarf × 1'), t('۸۹۰٬۰۰۰ تومان', '890,000 toman'))}
            {row(t('کیف دستی × ۱', 'Handbag × 1'), t('۲۹۰٬۰۰۰ تومان', '290,000 toman'))}
            {row(t('هزینهٔ ارسال', 'Delivery'), t('۶۰٬۰۰۰ تومان', '60,000 toman'))}
          </div>
        ),
      },
      {
        id: 'delivery',
        icon: Truck,
        title: t('ارسال', 'Delivery'),
        description: t('تیپاکس، کد رهگیری ۴۵۱۲۸۸', 'Tipax, tracking 451288'),
        extra: (
          <Chip
            size="sm"
            variant="soft"
            color="success"
            style={{ marginInlineStart: 'auto', marginInlineEnd: 12 }}
          >
            <Chip.Label>{t('ارسال شد', 'Shipped')}</Chip.Label>
          </Chip>
        ),
        content: t(
          'تهران، خیابان ولیعصر، کوچهٔ نهم، پلاک ۱۲. تحویل تا فردا.',
          'Tehran, Valiasr Street, 9th Alley, No. 12. Arrives tomorrow.',
        ),
      },
      {
        id: 'payment',
        icon: CreditCard,
        title: t('پرداخت', 'Payment'),
        description: t('کارت شتاب، ۱۴ آبان ۱۸:۲۰', 'Shetab card, 5 Nov 18:20'),
        content: t('پرداخت‌شده از درگاه شاپرک.', 'Paid through a Shaparak gateway.'),
      },
      {
        id: 'history',
        icon: History,
        title: t('تاریخچه', 'History'),
        content: (
          <ol
            style={{
              margin: 0,
              paddingInlineStart: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <li>{t('ثبت سفارش · ۱۴ آبان ۱۸:۱۹', 'Placed · 5 Nov 18:19')}</li>
            <li>{t('پرداخت · ۱۴ آبان ۱۸:۲۰', 'Paid · 5 Nov 18:20')}</li>
            <li>{t('ارسال · ۱۵ آبان ۱۰:۰۲', 'Shipped · 6 Nov 10:02')}</li>
          </ol>
        ),
      },
    ]
    return (
      <Page title={t('سفارش ۱۰۴۱', 'Order 1041')}>
        <Stage width={720} surface>
          <Accordion allowsMultipleExpanded defaultExpandedKeys={['items']}>
            {items(entries)}
          </Accordion>
        </Stage>
      </Page>
    )
  },
}

/** Settings in sections, several open at once, each holding its switches. */
export const SettingsSections: StoryObj = {
  name: 'Example: settings',
  render: function Render() {
    const t = useT()
    const toggle = (label: string, on = false) => (
      <Switch defaultSelected={on}>
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Label>{label}</Label>
        </Switch.Content>
      </Switch>
    )
    // Spread as arguments, so the children need no keys.
    const column = (...children: ReactNode[]) =>
      createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
        ...children,
      )
    const entries: Entry[] = [
      {
        id: 'notifications',
        icon: Bell,
        title: t('اعلان‌ها', 'Notifications'),
        description: t('آنچه برایتان پیامک یا ایمیل می‌شود', 'What you are texted or emailed'),
        content: column(
          toggle(t('سفارش تازه', 'New order'), true),
          toggle(t('موجودی رو به پایان', 'Low stock'), true),
          toggle(t('گزارش هفتگی', 'Weekly report')),
        ),
      },
      {
        id: 'appearance',
        icon: Palette,
        title: t('ظاهر', 'Appearance'),
        description: t('پوسته و رنگ فروشگاه', "The store's theme and colours"),
        content: column(toggle(t('حالت تیره برای خریداران', 'Dark mode for buyers'))),
      },
      {
        id: 'security',
        icon: Lock,
        title: t('امنیت', 'Security'),
        description: t('ورود دومرحله‌ای و نشست‌ها', 'Two-step sign-in and sessions'),
        content: column(
          toggle(t('ورود دومرحله‌ای', 'Two-step sign-in'), true),
          <Button key="out" size="sm" variant="danger-soft">
            {t('خروج از همهٔ دستگاه‌ها', 'Sign out everywhere')}
          </Button>,
        ),
      },
    ]
    return (
      <Page title={t('تنظیمات', 'Settings')}>
        <Stage width={720}>
          <Accordion
            variant="surface"
            allowsMultipleExpanded
            defaultExpandedKeys={['notifications']}
          >
            {items(entries)}
          </Accordion>
        </Stage>
      </Page>
    )
  },
}

/** A storefront's filters on a phone: each filter folded, the chosen ones open. */
export const ProductFilters: StoryObj = {
  name: 'Example: filters on a phone',
  render: function Render() {
    const t = useT()
    const box = (value: string, label: string) => (
      <Checkbox key={value} value={value}>
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Label>{label}</Label>
        </Checkbox.Content>
      </Checkbox>
    )
    const entries: Entry[] = [
      {
        id: 'category',
        title: t('دسته', 'Category'),
        content: (
          <CheckboxGroup aria-label={t('دسته', 'Category')} defaultValue={['scarf']}>
            {box('scarf', t('شال و روسری', 'Scarves'))}
            {box('bag', t('کیف', 'Bags'))}
            {box('shoe', t('کفش', 'Shoes'))}
          </CheckboxGroup>
        ),
      },
      {
        id: 'price',
        title: t('قیمت', 'Price'),
        content: (
          <Slider defaultValue={[200, 900]} minValue={0} maxValue={1000} step={50}>
            <Label>{t('هزار تومان', 'Thousand toman')}</Label>
            <Slider.Output />
            <Slider.Track>
              <Slider.Fill />
              <Slider.Thumb index={0} />
              <Slider.Thumb index={1} />
            </Slider.Track>
          </Slider>
        ),
      },
      {
        id: 'size',
        title: t('اندازه', 'Size'),
        content: (
          <CheckboxGroup aria-label={t('اندازه', 'Size')}>
            {box('s', 'S')}
            {box('m', 'M')}
            {box('l', 'L')}
          </CheckboxGroup>
        ),
      },
    ]
    return (
      <Device>
        <Accordion allowsMultipleExpanded defaultExpandedKeys={['category', 'price']}>
          {items(entries)}
        </Accordion>
      </Device>
    )
  },
}

/** A product page's details under its buy button, separated, one open at a time. */
export const ProductDetails: StoryObj = {
  name: 'Example: product details',
  render: function Render() {
    const t = useT()
    const entries: Entry[] = [
      {
        id: 'about',
        title: t('دربارهٔ محصول', 'About this product'),
        content: t(
          'شال ابریشمی دست‌باف از کاشان، با رنگ‌های گیاهی. هر قطعه یگانه است.',
          'A hand-woven silk scarf from Kashan, dyed with plants. Each piece is one of a kind.',
        ),
      },
      {
        id: 'specs',
        title: t('مشخصات', 'Specifications'),
        content: (
          <dl
            style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px' }}
          >
            <dt>{t('جنس', 'Material')}</dt>
            <dd style={{ margin: 0 }} className="text-foreground">
              {t('ابریشم ۱۰۰٪', '100% silk')}
            </dd>
            <dt>{t('اندازه', 'Size')}</dt>
            <dd style={{ margin: 0 }} className="text-foreground">
              {t('۱۸۰ × ۷۰ سانتی‌متر', '180 × 70 cm')}
            </dd>
            <dt>{t('شست‌وشو', 'Care')}</dt>
            <dd style={{ margin: 0 }} className="text-foreground">
              {t('خشک‌شویی', 'Dry clean only')}
            </dd>
          </dl>
        ),
      },
      faq(t)[0]!,
      faq(t)[1]!,
    ]
    return (
      <Stage width={560}>
        <Accordion>{items(entries)}</Accordion>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

/** The light theme and the dark, side by side, whatever the toolbar says. */
export const LightAndDark: StoryObj = {
  render: function Render() {
    return (
      <Themes>
        <ThemeSample />
      </Themes>
    )
  },
}

function ThemeSample() {
  const t = useT()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Accordion defaultExpandedKeys={['shipping']}>{items(faq(t, { icons: true }))}</Accordion>
      <Accordion variant="surface" defaultExpandedKeys={['returns']}>
        {items(faq(t, { icons: true }))}
      </Accordion>
    </div>
  )
}

/** A Persian page and an English one: the chevron and the icons keep to the reading side. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: function Render() {
    return (
      <Directions>
        <ThemeSample />
      </Directions>
    )
  },
}

/** On a phone's width. */
export const OnAPhone: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Device>
        <Accordion variant="surface" defaultExpandedKeys={['shipping']}>
          {items(faq(t, { icons: true, descriptions: true }))}
        </Accordion>
      </Device>
    )
  },
}

/** The same accordion as a tree, the block an app or the server sends (Accordion, AccordionItem). */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Accordion',
      props: { variant: 'surface', defaultExpandedKeys: ['shipping'] },
      children: [
        {
          type: 'AccordionItem',
          props: {
            id: 'shipping',
            title: t('ارسال چقدر طول می‌کشد؟', 'How long does delivery take?'),
            icon: 'truck',
          },
          children: [
            {
              type: 'Text',
              props: {},
              children: t('دو تا چهار روز کاری.', 'Two to four working days.'),
            },
          ],
        },
        {
          type: 'AccordionItem',
          props: {
            id: 'returns',
            title: t('مرجوعی دارید؟', 'Do you take returns?'),
            icon: 'rotate-ccw',
          },
          children: [
            {
              type: 'Text',
              props: {},
              children: t('تا هفت روز، بی‌پرسش.', 'Up to seven days, no questions asked.'),
            },
          ],
        },
      ],
    }
    return (
      <Grid min={320}>
        <Example
          title={t('آنچه کشیده می‌شود', 'What is drawn')}
          note={t('در وب و در Flutter', 'On the web and in Flutter')}
        >
          <DibaSurface tree={tree as never} />
        </Example>
        <Example title={t('درخت', 'The tree')}>
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
              maxHeight: 420,
            }}
          >
            {JSON.stringify(tree, null, 2)}
          </pre>
        </Example>
      </Grid>
    )
  },
}
