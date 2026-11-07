import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowLeft, ArrowRight, Package, ShoppingBag, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link as LinkPrimitive } from 'react-aria-components'
import { DibaSurface } from '../../sdui'
import { goods } from '../../stories/people'
import { Device, Directions, Example, Grid, Stage, Themes, useT } from '../../stories/kit'
import { Button } from '../button'
import { Separator } from '../separator'
import { Card } from './index'

// The Card, every option it has and what it holds. The docs page is Card.mdx. A line comment, not
// a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Layout/Card',
  component: Card,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Card>

export default meta

type Variant = 'default' | 'secondary' | 'tertiary' | 'transparent'

/** One line of a record: what it is, and its value at the end. */
function Line({ name, value }: { name: string; value: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 14 }}>
      <span className="text-muted">{name}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}

/** A card that holds another: a title of its own, then what it holds. */
function Holder({
  variant,
  title,
  children,
}: {
  variant?: Variant
  title: string
  children: ReactNode
}) {
  return (
    <Card variant={variant}>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Content>{children}</Card.Content>
    </Card>
  )
}

/**
 * A card where its surface belongs: a secondary one inside the page's card, a tertiary one inside a
 * secondary one, each holder titled so its edge reads as its own and not as the card's padding.
 */
function InPlace({ variant, children }: { variant?: Variant; children: ReactNode }) {
  const t = useT()
  if (variant !== 'secondary' && variant !== 'tertiary') return <>{children}</>
  const held =
    variant === 'tertiary' ? (
      <Holder variant="secondary" title={t('در انتظار ارسال', 'Waiting to be sent')}>
        {children}
      </Holder>
    ) : (
      children
    )
  return <Holder title={t('سفارش‌های امروز', 'Today’s orders')}>{held}</Holder>
}

/** An order's summary, the card most stories draw. */
function OrderCard({ variant, action = true }: { variant?: Variant; action?: boolean }) {
  const t = useT()
  return (
    <Card variant={variant}>
      <Card.Header>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Card.Title>{t('سفارش ۱۰۴۱', 'Order 1041')}</Card.Title>
            <Card.Description>{t('۱۴ آبان، ۱۸:۲۰', '5 Nov, 18:20')}</Card.Description>
          </div>
          {action ? (
            <Button size="sm" variant="tertiary">
              {t('جزئیات', 'Details')}
            </Button>
          ) : null}
        </div>
      </Card.Header>
      <Card.Content>
        <Line name={t('خریدار', 'Buyer')} value={t('مریم احمدی', 'Maryam Ahmadi')} />
        <Line name={t('اقلام', 'Items')} value={t('۳ قلم', '3 items')} />
        <Line name={t('جمع', 'Total')} value={t('۱٬۲۸۰٬۰۰۰ تومان', '1,280,000 toman')} />
      </Card.Content>
      <Card.Footer>
        <Button size="sm">{t('چاپ برچسب', 'Print label')}</Button>
      </Card.Footer>
    </Card>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  variant: Variant
  header: boolean
  action: boolean
  footer: boolean
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { variant: 'default', header: true, action: true, footer: true },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'secondary', 'tertiary', 'transparent'],
      description:
        'The surface, the second or the third surface, or none; secondary is a card inside a card.',
      table: { category: 'Card', defaultValue: { summary: 'default' } },
    },
    header: {
      description: 'Card.Header: its title and description.',
      table: { category: 'Example' },
    },
    action: { description: 'A button at the header’s end.', table: { category: 'Example' } },
    footer: { description: 'Card.Footer under the content.', table: { category: 'Example' } },
  },
  render: function Render({ variant, header, action, footer }) {
    const t = useT()
    return (
      <Stage width={420}>
        <InPlace variant={variant}>
          <Card variant={variant}>
            {header ? (
              <Card.Header>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Card.Title>{t('سفارش ۱۰۴۱', 'Order 1041')}</Card.Title>
                    <Card.Description>{t('۱۴ آبان، ۱۸:۲۰', '5 Nov, 18:20')}</Card.Description>
                  </div>
                  {action ? (
                    <Button size="sm" variant="tertiary">
                      {t('جزئیات', 'Details')}
                    </Button>
                  ) : null}
                </div>
              </Card.Header>
            ) : null}
            <Card.Content>
              <Line name={t('خریدار', 'Buyer')} value={t('مریم احمدی', 'Maryam Ahmadi')} />
              <Line name={t('جمع', 'Total')} value={t('۱٬۲۸۰٬۰۰۰ تومان', '1,280,000 toman')} />
            </Card.Content>
            {footer ? (
              <Card.Footer>
                <Button size="sm">{t('چاپ برچسب', 'Print label')}</Button>
              </Card.Footer>
            ) : null}
          </Card>
        </InPlace>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Its surfaces: the page's card, a card inside a card, a third step, and none. */
export const Variants: StoryObj = {
  render: function Render() {
    const t = useT()
    const notes: Record<Variant, string> = {
      default: t('کارت صفحه', 'A page’s card'),
      secondary: t('کارتی درون کارت', 'A card inside a card'),
      tertiary: t('یک پله بیشتر', 'One step further'),
      transparent: t('بی رویه، فقط فاصله‌ها', 'No surface, only its spacing'),
    }
    return (
      <Grid min={280}>
        {(['default', 'secondary', 'tertiary', 'transparent'] as const).map((variant) => (
          <Example key={variant} title={variant} note={notes[variant]}>
            <InPlace variant={variant}>
              <OrderCard variant={variant} action={false} />
            </InPlace>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** What it may hold: a header alone, content alone, or header, content and footer. */
export const Parts: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={240}>
        <Example title={t('فقط سربرگ', 'A header alone')}>
          <Card>
            <Card.Header>
              <Card.Title>{t('فروشگاه آماده است', 'Your shop is ready')}</Card.Title>
              <Card.Description>
                {t('محصول اولتان را بیفزایید.', 'Add your first product.')}
              </Card.Description>
            </Card.Header>
          </Card>
        </Example>
        <Example title={t('فقط محتوا', 'Content alone')}>
          <Card>
            <Card.Content>
              <span className="text-foreground" style={{ fontSize: 14 }}>
                {t('هنوز سفارشی نرسیده.', 'No orders yet.')}
              </span>
            </Card.Content>
          </Card>
        </Example>
        <Example title={t('همه', 'All three')}>
          <OrderCard action={false} />
        </Example>
      </Grid>
    )
  },
}

/** Edge to edge: no padding, clipping what it holds, as a picture or a table at its edges. */
export const Flush: StoryObj = {
  render: function Render() {
    const t = useT()
    const scarf = goods.scarf
    return (
      <Stage width={280}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <img
            src={scarf.photo}
            alt=""
            style={{ display: 'block', width: '100%', aspectRatio: '4 / 3', objectFit: 'cover' }}
          />
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Card.Title>{t(scarf.fa, scarf.en)}</Card.Title>
            <Card.Description>{t('۹۶۰٬۰۰۰ تومان', '960,000 toman')}</Card.Description>
          </div>
        </Card>
      </Stage>
    )
  },
}

/** A card that opens a page: the whole card is the link, the hand over it, a ring under the keyboard. */
export const AsALink: StoryObj = {
  name: 'As a link',
  render: function Render() {
    const t = useT()
    const Arrow = t('fa', 'en') === 'fa' ? ArrowLeft : ArrowRight
    return (
      <Stage width={360}>
        <LinkPrimitive
          href="#orders"
          aria-label={t('سفارش‌های امروز', 'Today’s orders')}
          style={{ display: 'block', color: 'inherit', textDecoration: 'none', borderRadius: 24 }}
        >
          <Card>
            <Card.Header>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ShoppingBag size={20} aria-hidden />
                <div style={{ flex: 1 }}>
                  <Card.Title>{t('سفارش‌های امروز', 'Today’s orders')}</Card.Title>
                  <Card.Description>
                    {t('۱۲ سفارش، ۳ در انتظار', '12 orders, 3 waiting')}
                  </Card.Description>
                </div>
                <Arrow size={16} aria-hidden />
              </div>
            </Card.Header>
          </Card>
        </LinkPrimitive>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** The admin's home: figures for the day, each on its own card. */
export const Figures: StoryObj = {
  name: 'Example: the day’s figures',
  render: function Render() {
    const t = useT()
    const figures = [
      [
        <ShoppingBag key="i" size={16} />,
        t('فروش امروز', 'Sales today'),
        t('۴٬۲۰۰٬۰۰۰ تومان', '4,200,000 toman'),
        t('۱۲٪ بیش از دیروز', '12% over yesterday'),
      ],
      [
        <Package key="i" size={16} />,
        t('آمادهٔ ارسال', 'Ready to ship'),
        t('۷ سفارش', '7 orders'),
        t('۲ از دیروز', '2 from yesterday'),
      ],
      [
        <TrendingUp key="i" size={16} />,
        t('بازدید', 'Visits'),
        t('۱٬۳۴۰', '1,340'),
        t('۸٪ بیش از هفتهٔ پیش', '8% over last week'),
      ],
    ] as const
    return (
      <Grid min={200}>
        {figures.map(([icon, name, value, change]) => (
          <Card key={name}>
            <Card.Header>
              <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon}
                <Card.Description>{name}</Card.Description>
              </div>
            </Card.Header>
            <Card.Content>
              <span
                className="text-foreground"
                style={{ fontSize: 24, lineHeight: '32px', fontWeight: 600 }}
              >
                {value}
              </span>
              <span className="text-success" style={{ fontSize: 12 }}>
                {change}
              </span>
            </Card.Content>
          </Card>
        ))}
      </Grid>
    )
  },
}

/** The admin's settings: a section's card, with a card inside it for a detail. */
export const Settings: StoryObj = {
  name: 'Example: a settings section',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={560}>
        <Card>
          <Card.Header>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Card.Title>{t('ارسال', 'Shipping')}</Card.Title>
                <Card.Description>
                  {t(
                    'روش‌ها و هزینه‌هایی که خریدار می‌بیند.',
                    'The methods and fees a buyer sees.',
                  )}
                </Card.Description>
              </div>
              <Button size="sm" variant="secondary">
                {t('افزودن روش', 'Add method')}
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <Card variant="secondary">
              <Card.Header>
                <Card.Title>{t('پست پیشتاز', 'Express post')}</Card.Title>
                <Card.Description>
                  {t('۴۵٬۰۰۰ تومان، ۲ تا ۴ روز', '45,000 toman, 2 to 4 days')}
                </Card.Description>
              </Card.Header>
            </Card>
            <Card variant="secondary">
              <Card.Header>
                <Card.Title>{t('پیک فروشگاه', 'Shop courier')}</Card.Title>
                <Card.Description>{t('تهران، همان روز', 'Tehran, same day')}</Card.Description>
              </Card.Header>
            </Card>
          </Card.Content>
        </Card>
      </Stage>
    )
  },
}

/** A storefront's product card: picture, name, price and the way to the cart. */
export const Product: StoryObj = {
  name: 'Example: a product',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={200}>
        {[goods.tea, goods.scarf].map((product, i) => (
          <Card key={product.en} style={{ padding: 0, overflow: 'hidden' }}>
            <img
              src={product.photo}
              alt=""
              style={{ display: 'block', width: '100%', aspectRatio: '1', objectFit: 'cover' }}
            />
            <Card.Content style={{ padding: '0 16px' }}>
              <Card.Title>{t(product.fa, product.en)}</Card.Title>
              <Card.Description>
                {i ? t('۹۶۰٬۰۰۰ تومان', '960,000 toman') : t('۳۲۰٬۰۰۰ تومان', '320,000 toman')}
              </Card.Description>
            </Card.Content>
            <Card.Footer style={{ padding: '0 16px 16px' }}>
              <Button size="sm" fullWidth>
                {t('افزودن به سبد', 'Add to cart')}
              </Button>
            </Card.Footer>
          </Card>
        ))}
      </Grid>
    )
  },
}

/** A storefront's checkout summary: lines, a separator, the total. */
export const OrderSummary: StoryObj = {
  name: 'Example: a checkout summary',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={360}>
        <Card>
          <Card.Header>
            <Card.Title>{t('خلاصهٔ سفارش', 'Order summary')}</Card.Title>
          </Card.Header>
          <Card.Content>
            <Line name={t('کالاها', 'Items')} value={t('۱٬۲۸۰٬۰۰۰ تومان', '1,280,000 toman')} />
            <Line name={t('ارسال', 'Delivery')} value={t('۴۵٬۰۰۰ تومان', '45,000 toman')} />
            <Separator />
            <Line name={t('جمع', 'Total')} value={t('۱٬۳۲۵٬۰۰۰ تومان', '1,325,000 toman')} />
          </Card.Content>
          <Card.Footer>
            <Button fullWidth>{t('پرداخت', 'Pay')}</Button>
          </Card.Footer>
        </Card>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

/** In both themes: a soft shadow in light, none in dark. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <OrderCard />
    </Themes>
  ),
}

/** On a Persian page and an English one: the action at the header's end. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <OrderCard />
    </Directions>
  ),
}

/** On a phone, the window's width less the page's margins. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <OrderCard />
    </Device>
  ),
}

/** The same card as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Card',
      props: {
        title: t('سفارش ۱۰۴۱', 'Order 1041'),
        description: t('۱۴ آبان، ۱۸:۲۰', '5 Nov, 18:20'),
      },
      slots: {
        action: {
          type: 'Button',
          props: { size: 'sm', variant: 'tertiary' },
          children: t('جزئیات', 'Details'),
        },
        footer: { type: 'Button', props: { size: 'sm' }, children: t('چاپ برچسب', 'Print label') },
      },
      children: [
        {
          type: 'Text',
          props: { size: 'sm' },
          children: t('مریم احمدی، ۳ قلم', 'Maryam Ahmadi, 3 items'),
        },
        {
          type: 'Text',
          props: { size: 'sm', weight: 'medium' },
          children: t('۱٬۲۸۰٬۰۰۰ تومان', '1,280,000 toman'),
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
