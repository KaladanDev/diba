import type { Meta, StoryObj } from '@storybook/react-vite'
import { Image, Info, Package, Star, Truck } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { Key } from 'react-aria-components'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Tabs } from './index'

// The Tabs, every option they have and what they split. The docs page is Tabs.mdx. A line comment,
// not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Navigation/Tabs',
  component: Tabs,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Tabs>

export default meta

type Variant = 'primary' | 'secondary'
type Section = {
  id: string
  label: string
  icon?: ReactNode
  isDisabled?: boolean
  body: ReactNode
}

/** A panel's words, muted as a card's body is. */
function Body({ children }: { children: ReactNode }) {
  return (
    <p className="text-muted" style={{ margin: 0, fontSize: 14, lineHeight: '20px' }}>
      {children}
    </p>
  )
}

/** A product's sections, the tabs most stories draw. */
function sections(t: ReturnType<typeof useT>, icons = false): Section[] {
  return [
    {
      id: 'details',
      label: t('مشخصات', 'Details'),
      icon: icons ? <Info /> : undefined,
      body: (
        <Body>
          {t(
            'چای سیاه بهاره از باغ‌های لاهیجان، ۵۰۰ گرم.',
            'Spring black tea from Lahijan, 500 g.',
          )}
        </Body>
      ),
    },
    {
      id: 'pictures',
      label: t('تصویرها', 'Pictures'),
      icon: icons ? <Image /> : undefined,
      body: (
        <Body>
          {t('۴ تصویر؛ نخستین، تصویر اصلی است.', '4 pictures; the first is the main one.')}
        </Body>
      ),
    },
    {
      id: 'stock',
      label: t('موجودی', 'Stock'),
      icon: icons ? <Package /> : undefined,
      body: <Body>{t('۱۲ عدد در انبار تهران.', '12 in the Tehran store.')}</Body>,
    },
  ]
}

/** Tabs and their panels from a list of sections. */
function Sectioned({
  items,
  variant,
  orientation,
  isDisabled,
  label,
  selectedKey,
  onSelectionChange,
}: {
  items: Section[]
  variant?: Variant
  orientation?: 'horizontal' | 'vertical'
  isDisabled?: boolean
  label: string
  selectedKey?: Key
  onSelectionChange?: (key: Key) => void
}) {
  return (
    <Tabs
      variant={variant}
      orientation={orientation}
      isDisabled={isDisabled}
      selectedKey={selectedKey}
      onSelectionChange={onSelectionChange}
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label={label}>
          {items.map((item) => (
            <Tabs.Tab key={item.id} id={item.id} isDisabled={item.isDisabled}>
              {item.icon}
              {item.label}
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
      {items.map((item) => (
        <Tabs.Panel key={item.id} id={item.id}>
          {item.body}
        </Tabs.Panel>
      ))}
    </Tabs>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  variant: Variant
  orientation: 'horizontal' | 'vertical'
  icons: boolean
  isDisabled: boolean
  disabledTab: boolean
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    variant: 'primary',
    orientation: 'horizontal',
    icons: false,
    isDisabled: false,
    disabledTab: false,
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      description: 'A segmented pill on a track, or a line under the chosen tab.',
      table: { category: 'Tabs', defaultValue: { summary: 'primary' } },
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Tabs in a row over the panel, or a column beside it.',
      table: { category: 'Tabs', defaultValue: { summary: 'horizontal' } },
    },
    isDisabled: {
      description: 'Every tab is off.',
      table: { category: 'Tabs', defaultValue: { summary: 'false' } },
    },
    icons: { description: 'An icon before each label.', table: { category: 'Example' } },
    disabledTab: { description: 'The last tab is off.', table: { category: 'Example' } },
  },
  render: function Render({ variant, orientation, icons, isDisabled, disabledTab }) {
    const t = useT()
    const items = sections(t, icons).map((item, i, all) =>
      disabledTab && i === all.length - 1 ? { ...item, isDisabled: true } : item,
    )
    return (
      <Stage width={480} surface>
        <Sectioned
          items={items}
          variant={variant}
          orientation={orientation}
          isDisabled={isDisabled}
          label={t('بخش‌های محصول', 'Product sections')}
        />
      </Stage>
    )
  },
}

// ---- their options -------------------------------------------------------------------------------

/** A pill on a track, or a line under the chosen tab. */
export const Variants: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        {(['primary', 'secondary'] as const).map((variant) => (
          <Example
            key={variant}
            title={variant}
            note={
              variant === 'primary'
                ? t('پیش‌فرض: قرص روی ریل', 'The default: a pill on a track')
                : t('خطی زیر برگزیده', 'A line under the chosen one')
            }
          >
            <Sectioned
              items={sections(t)}
              variant={variant}
              label={t('بخش‌های محصول', 'Product sections')}
            />
          </Example>
        ))}
      </Grid>
    )
  },
}

/** An icon before each label, 16 and 8 before it. */
export const WithIcons: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={480} surface>
        <Sectioned items={sections(t, true)} label={t('بخش‌های محصول', 'Product sections')} />
      </Stage>
    )
  },
}

/** A column beside the panel: the up and down arrows move along it. */
export const Vertical: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        {(['primary', 'secondary'] as const).map((variant) => (
          <Example key={variant} title={variant}>
            <Sectioned
              items={sections(t, true)}
              variant={variant}
              orientation="vertical"
              label={t('بخش‌های محصول', 'Product sections')}
            />
          </Example>
        ))}
      </Grid>
    )
  },
}

/** One tab off, or all of them. */
export const Disabled: StoryObj = {
  render: function Render() {
    const t = useT()
    const items = sections(t).map((item) =>
      item.id === 'stock' ? { ...item, isDisabled: true } : item,
    )
    return (
      <Grid min={300}>
        <Example title={t('یک برگه', 'One tab')} note="isDisabled on Tabs.Tab">
          <Sectioned items={items} label={t('بخش‌های محصول', 'Product sections')} />
        </Example>
        <Example title={t('همه', 'All of them')} note="isDisabled on Tabs">
          <Sectioned
            items={sections(t)}
            isDisabled
            label={t('بخش‌های محصول', 'Product sections')}
          />
        </Example>
      </Grid>
    )
  },
}

/** More tabs than room: the row scrolls, with arrows at its ends. */
export const ManyTabs: StoryObj = {
  name: 'More than fit',
  render: function Render() {
    const t = useT()
    const months = [
      t('فروردین', 'January'),
      t('اردیبهشت', 'February'),
      t('خرداد', 'March'),
      t('تیر', 'April'),
      t('مرداد', 'May'),
      t('شهریور', 'June'),
      t('مهر', 'July'),
      t('آبان', 'August'),
      t('آذر', 'September'),
      t('دی', 'October'),
      t('بهمن', 'November'),
      t('اسفند', 'December'),
    ]
    const items = months.map((month, i) => ({
      id: String(i),
      label: month,
      body: <Body>{t(`فروش ${month}`, `Sales in ${month}`)}</Body>,
    }))
    return (
      <Stage width={360} surface>
        <Sectioned items={items} variant="secondary" label={t('ماه‌ها', 'Months')} />
      </Stage>
    )
  },
}

/** Chosen by the page, which knows which tab shows. */
export const Controlled: StoryObj = {
  render: function Render() {
    const t = useT()
    const [key, setKey] = useState<Key>('pictures')
    return (
      <Stage width={480} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Sectioned
            items={sections(t)}
            selectedKey={key}
            onSelectionChange={setKey}
            label={t('بخش‌های محصول', 'Product sections')}
          />
          <Value label="selectedKey" value={key} />
        </div>
      </Stage>
    )
  },
}

// ---- what they split -----------------------------------------------------------------------------

/** The admin's orders, by status, each with its count. */
export const OrderStatuses: StoryObj = {
  name: 'Example: orders by status',
  render: function Render() {
    const t = useT()
    const statuses = [
      ['all', t('همه', 'All'), 48],
      ['waiting', t('در انتظار', 'Waiting'), 3],
      ['ready', t('آمادهٔ ارسال', 'Ready to ship'), 7],
      ['shipped', t('ارسال‌شده', 'Shipped'), 38],
    ] as const
    return (
      <Stage width={560} surface>
        <Sectioned
          variant="secondary"
          label={t('وضعیت سفارش', 'Order status')}
          items={statuses.map(([id, label, count]) => ({
            id,
            label: `${label} (${count.toLocaleString(t('fa-IR', 'en-US'))})`,
            body: <Body>{t(`${count.toLocaleString('fa-IR')} سفارش`, `${count} orders`)}</Body>,
          }))}
        />
      </Stage>
    )
  },
}

/** A storefront's product page: what it is, its measures, and what buyers said. */
export const ProductPage: StoryObj = {
  name: 'Example: a product page',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={560}>
        <Sectioned
          variant="secondary"
          label={t('دربارهٔ محصول', 'About the product')}
          items={[
            {
              id: 'about',
              label: t('دربارهٔ آن', 'About'),
              body: (
                <Body>
                  {t(
                    'شال ابریشمی دست‌باف با نقش جهان، ۷۰ در ۱۸۰ سانتی‌متر.',
                    'A hand-woven silk scarf with the Naqsh-e Jahan pattern, 70 by 180 cm.',
                  )}
                </Body>
              ),
            },
            {
              id: 'delivery',
              label: t('ارسال', 'Delivery'),
              icon: <Truck />,
              body: (
                <Body>
                  {t('ارسال رایگان بالای ۵۰۰ هزار تومان.', 'Free delivery over 500,000 toman.')}
                </Body>
              ),
            },
            {
              id: 'reviews',
              label: t('نظرها', 'Reviews'),
              icon: <Star />,
              body: <Body>{t('۴٫۸ از ۵، از ۵۱ خریدار.', '4.8 of 5, from 51 buyers.')}</Body>,
            },
          ]}
        />
      </Stage>
    )
  },
}

// ---- everywhere they are drawn -------------------------------------------------------------------

/** In both themes. */
export const LightAndDark: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Themes>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Sectioned items={sections(t)} label={t('بخش‌های محصول', 'Product sections')} />
          <Sectioned
            items={sections(t)}
            variant="secondary"
            label={t('بخش‌های محصول', 'Product sections')}
          />
        </div>
      </Themes>
    )
  },
}

/** On a Persian page and an English one: the first tab at the start. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: function Render() {
    const t = useT()
    return (
      <Directions>
        <Sectioned items={sections(t, true)} label={t('بخش‌های محصول', 'Product sections')} />
      </Directions>
    )
  },
}

/** On a phone. */
export const OnAPhone: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Device>
        <Sectioned items={sections(t)} label={t('بخش‌های محصول', 'Product sections')} />
      </Device>
    )
  },
}

/** The same tabs as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Tabs',
      props: { label: t('بخش‌های محصول', 'Product sections') },
      children: [
        {
          type: 'Tab',
          props: { id: 'details', label: t('مشخصات', 'Details'), icon: 'info' },
          children: [
            {
              type: 'Text',
              props: { size: 'sm', tone: 'muted' },
              children: t('چای سیاه بهاره، ۵۰۰ گرم.', 'Spring black tea, 500 g.'),
            },
          ],
        },
        {
          type: 'Tab',
          props: { id: 'stock', label: t('موجودی', 'Stock'), icon: 'package' },
          children: [
            {
              type: 'Text',
              props: { size: 'sm', tone: 'muted' },
              children: t('۱۲ عدد در انبار.', '12 in stock.'),
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
            }}
          >
            {JSON.stringify(tree, null, 2)}
          </pre>
        </Example>
      </Grid>
    )
  },
}
