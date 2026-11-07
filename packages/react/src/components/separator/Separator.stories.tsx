import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bold, Italic, Underline } from 'lucide-react'
import type { ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT } from '../../stories/kit'
import { Button } from '../button'
import { Card } from '../card'
import { Toolbar } from '../toolbar'
import { Separator } from './index'

// The Separator, every option it has and where it goes. The docs page is Separator.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Layout/Separator',
  component: Separator,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Separator>

export default meta

type Variant = 'default' | 'secondary' | 'tertiary'

/** One line of a record: what it is, and its value at the end. */
function Line({ name, value }: { name: string; value: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 14 }}>
      <span className="text-muted">{name}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}

/** A checkout's lines, a separator, and the total: where a separator is most often drawn. */
function Totals({ variant }: { variant?: Variant }) {
  const t = useT()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Line name={t('کالاها', 'Items')} value={t('۱٬۲۸۰٬۰۰۰ تومان', '1,280,000 toman')} />
      <Line name={t('ارسال', 'Delivery')} value={t('۴۵٬۰۰۰ تومان', '45,000 toman')} />
      <Separator variant={variant} />
      <Line name={t('جمع', 'Total')} value={t('۱٬۳۲۵٬۰۰۰ تومان', '1,325,000 toman')} />
    </div>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = { orientation: 'horizontal' | 'vertical'; variant: Variant }

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { orientation: 'horizontal', variant: 'default' },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Across, between sections; or down, between things in a row.',
      table: { category: 'Separator', defaultValue: { summary: 'horizontal' } },
    },
    variant: {
      control: 'inline-radio',
      options: ['default', 'secondary', 'tertiary'],
      description: 'Its colour, for the surface it lies on.',
      table: { category: 'Separator', defaultValue: { summary: 'default' } },
    },
  },
  render: function Render({ orientation, variant }) {
    const t = useT()
    return (
      <Stage width={420} surface>
        {orientation === 'horizontal' ? (
          <Totals variant={variant} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
            <span className="text-foreground">{t('۱۲ سفارش', '12 orders')}</span>
            <Separator orientation="vertical" variant={variant} />
            <span className="text-muted">{t('۳ در انتظار', '3 waiting')}</span>
          </div>
        )}
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Across, between a list's lines and its total. */
export const Horizontal: StoryObj = {
  render: () => (
    <Stage width={420} surface>
      <Totals />
    </Stage>
  ),
}

/** Down, between things in a row: as tall as the row, at least 8. */
export const Vertical: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={520} surface>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
          <span className="text-foreground">{t('۱۲ سفارش', '12 orders')}</span>
          <Separator orientation="vertical" />
          <span className="text-muted">{t('۳ در انتظار', '3 waiting')}</span>
          <Separator orientation="vertical" />
          <span className="text-muted">{t('۹ ارسال‌شده', '9 shipped')}</span>
        </div>
      </Stage>
    )
  },
}

/** Its colour for the surface under it: the page's card, a card inside it, a step further. */
export const Variants: StoryObj = {
  render: function Render() {
    const t = useT()
    const surfaces: [Variant, string, string][] = [
      ['default', 'default', t('روی کارت صفحه', 'On a page’s card')],
      ['secondary', 'secondary', t('روی کارتی درون کارت', 'On a card inside a card')],
      ['tertiary', 'tertiary', t('یک پله بیشتر', 'One step further')],
    ]
    return (
      <Grid min={240}>
        {surfaces.map(([variant, card, note]) => (
          <Example key={variant} title={variant} note={note}>
            <Card variant={card as Variant}>
              <Card.Content>
                <Totals variant={variant} />
              </Card.Content>
            </Card>
          </Example>
        ))}
      </Grid>
    )
  },
}

// ---- where it goes -------------------------------------------------------------------------------

/** In a toolbar it runs across the toolbar, whatever it is told: down in a row of buttons. */
export const InAToolbar: StoryObj = {
  name: 'Example: in a toolbar',
  render: function Render() {
    const t = useT()
    return (
      <Stage surface>
        <Toolbar aria-label={t('قالب', 'Format')}>
          <Button isIconOnly size="sm" variant="tertiary" aria-label={t('پررنگ', 'Bold')}>
            <Bold />
          </Button>
          <Button isIconOnly size="sm" variant="tertiary" aria-label={t('کج', 'Italic')}>
            <Italic />
          </Button>
          <Button isIconOnly size="sm" variant="tertiary" aria-label={t('زیرخط', 'Underline')}>
            <Underline />
          </Button>
          <Separator />
          <Button size="sm" variant="tertiary">
            {t('پیوند', 'Link')}
          </Button>
        </Toolbar>
      </Stage>
    )
  },
}

/** Between a card's sections: its details, then its history. */
export const InACard: StoryObj = {
  name: 'Example: between a card’s sections',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420}>
        <Card>
          <Card.Header>
            <Card.Title>{t('سفارش ۱۰۴۱', 'Order 1041')}</Card.Title>
          </Card.Header>
          <Card.Content>
            <Line name={t('خریدار', 'Buyer')} value={t('مریم احمدی', 'Maryam Ahmadi')} />
            <Line name={t('ارسال', 'Delivery')} value={t('تیپاکس', 'Tipax')} />
            <Separator style={{ margin: '8px 0' }} />
            <Line name={t('پرداخت', 'Paid')} value={t('۱۴ آبان', '5 Nov')} />
            <Line name={t('ارسال‌شده', 'Shipped')} value={t('۱۵ آبان', '6 Nov')} />
          </Card.Content>
        </Card>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

/** In both themes. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Totals />
    </Themes>
  ),
}

/** On a Persian page and an English one. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Totals />
    </Directions>
  ),
}

/** On a phone. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Totals />
    </Device>
  ),
}

/** The same separator as a tree, between two blocks. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 3 },
      children: [
        {
          type: 'Text',
          props: { size: 'sm' },
          children: t('کالاها: ۱٬۲۸۰٬۰۰۰ تومان', 'Items: 1,280,000 toman'),
        },
        { type: 'Separator' },
        {
          type: 'Text',
          props: { size: 'sm', weight: 'medium' },
          children: t('جمع: ۱٬۳۲۵٬۰۰۰ تومان', 'Total: 1,325,000 toman'),
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
