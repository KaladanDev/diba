import type { Meta, StoryObj } from '@storybook/react-vite'
import { BadgeCheck, Clock, Truck, X } from 'lucide-react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT } from '../../stories/kit'
import { goods } from '../../stories/people'
import { Card } from '../card'
import { Chip } from './index'

// The Chip, every option it has and what it labels. The docs page is Chip.mdx. A line comment,
// not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Data Display/Chip',
  component: Chip,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Chip>

export default meta

type Variant = 'primary' | 'secondary' | 'soft' | 'tertiary'
type Color = 'default' | 'accent' | 'success' | 'warning' | 'danger'
type Size = 'sm' | 'md' | 'lg'

/** An order's statuses, each in its tone. */
function useStatuses() {
  const t = useT()
  return [
    ['warning', t('در انتظار ارسال', 'Waiting'), Clock],
    ['accent', t('پرداخت‌شده', 'Paid'), BadgeCheck],
    ['success', t('ارسال‌شده', 'Shipped'), Truck],
    ['danger', t('لغو شده', 'Cancelled'), X],
    ['default', t('پیش‌نویس', 'Draft'), null],
  ] as const
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = { variant: Variant; color: Color; size: Size; icon: boolean }

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { variant: 'soft', color: 'success', size: 'sm', icon: false },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'soft', 'tertiary'],
      description: 'Solid, on the second surface, tinted, or clear inside a hairline.',
      table: { category: 'Chip', defaultValue: { summary: 'soft' } },
    },
    color: {
      control: 'inline-radio',
      options: ['default', 'accent', 'success', 'warning', 'danger'],
      description: 'Its tone: a status’s, the brand’s, or none.',
      table: { category: 'Chip', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: '24, 28 or 32 tall.',
      table: { category: 'Chip', defaultValue: { summary: 'sm' } },
    },
    icon: { description: 'An icon before its words.', table: { category: 'Example' } },
  },
  render: function Render({ icon, ...args }) {
    const t = useT()
    return (
      <Stage width={320}>
        <Chip {...args}>
          {icon ? <Truck /> : null}
          <Chip.Label>{t('ارسال‌شده', 'Shipped')}</Chip.Label>
        </Chip>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Its four looks, in one tone. */
export const Variants: StoryObj = {
  render: function Render() {
    const t = useT()
    const notes: Record<Variant, string> = {
      soft: t('رنگ وضعیت، کم‌رنگ', 'The status, tinted'),
      secondary: t('روی سطح دوم', 'On the second surface'),
      primary: t('رنگ کامل', 'Solid'),
      tertiary: t('بی رنگ، با لبه', 'Clear, with an edge'),
    }
    return (
      <Grid min={160}>
        {(['soft', 'secondary', 'primary', 'tertiary'] as const).map((variant) => (
          <Example key={variant} title={variant} note={notes[variant]}>
            <Chip variant={variant} color="success">
              {t('ارسال‌شده', 'Shipped')}
            </Chip>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Its tones, soft: the status at 12% over the surface with its ink. */
export const Colors: StoryObj = {
  render: function Render() {
    const statuses = useStatuses()
    return (
      <Grid min={150}>
        {statuses.map(([color, words]) => (
          <Example key={color} title={color}>
            <Chip variant="soft" color={color}>
              {words}
            </Chip>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Every tone in every look. */
export const AllLooks: StoryObj = {
  name: 'Every tone in every look',
  render: function Render() {
    const statuses = useStatuses()
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {(['soft', 'secondary', 'primary', 'tertiary'] as const).map((variant) => (
          <Example key={variant} title={variant}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {statuses.map(([color, words]) => (
                <Chip key={color} variant={variant} color={color}>
                  {words}
                </Chip>
              ))}
            </div>
          </Example>
        ))}
      </div>
    )
  },
}

/** Its sizes: 24, 28 and 32 tall, a third of that in at each end. */
export const Sizes: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={140}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Example key={size} title={size}>
            <Chip size={size} variant="soft" color="accent">
              {t('ویژه', 'Featured')}
            </Chip>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** An icon before its words: 0.55 of its height, 4 from them. */
export const WithIcons: StoryObj = {
  name: 'With icons',
  render: function Render() {
    const statuses = useStatuses()
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {statuses
          .filter(([, , Icon]) => Icon)
          .map(([color, words, Icon]) => (
            <Chip key={color} variant="soft" color={color}>
              {Icon ? <Icon /> : null}
              <Chip.Label>{words}</Chip.Label>
            </Chip>
          ))}
      </div>
    )
  },
}

// ---- what it labels ------------------------------------------------------------------------------

/** The admin's order: its status and its delivery, under its number. */
export const OrderStatus: StoryObj = {
  name: 'Example: an order’s status',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420}>
        <Card>
          <Card.Header>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Card.Title>{t('سفارش ۱۰۴۱', 'Order 1041')}</Card.Title>
              <Chip variant="soft" color="warning">
                {t('در انتظار ارسال', 'Waiting')}
              </Chip>
              <Chip variant="soft" color="accent">
                {t('پرداخت‌شده', 'Paid')}
              </Chip>
            </div>
            <Card.Description>{t('۱۴ آبان، ۱۸:۲۰', '5 Nov, 18:20')}</Card.Description>
          </Card.Header>
        </Card>
      </Stage>
    )
  },
}

/** The storefront's product: what is special about it, on its picture. */
export const OnAProduct: StoryObj = {
  name: 'Example: on a product',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={240}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={goods.tea.photo}
              alt=""
              style={{ display: 'block', width: '100%', aspectRatio: '1', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                top: 12,
                insetInlineStart: 12,
                display: 'flex',
                gap: 4,
              }}
            >
              <Chip variant="primary" color="danger">
                {t('۲۰٪ تخفیف', '20% off')}
              </Chip>
              <Chip variant="secondary">{t('ارسال رایگان', 'Free delivery')}</Chip>
            </div>
          </div>
          <Card.Content style={{ padding: '0 16px 16px' }}>
            <Card.Title>{t(goods.tea.fa, goods.tea.en)}</Card.Title>
            <Card.Description>{t('۲۵۶٬۰۰۰ تومان', '256,000 toman')}</Card.Description>
          </Card.Content>
        </Card>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Row() {
  const statuses = useStatuses()
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {statuses.map(([color, words]) => (
        <Chip key={color} variant="soft" color={color}>
          {words}
        </Chip>
      ))}
    </div>
  )
}

/** In both themes: soft is the status at 12% over the surface, 22% in dark. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Row />
    </Themes>
  ),
}

/** On a Persian page and an English one. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Row />
    </Directions>
  ),
}

/** On a phone, a row of them wrapping. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Row />
    </Device>
  ),
}

/** The same chips as a block: soft and small unless the tree says otherwise. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { direction: 'horizontal', gap: 2, wrap: true },
      children: [
        {
          type: 'Chip',
          props: { color: 'warning', icon: 'clock' },
          children: t('در انتظار ارسال', 'Waiting'),
        },
        {
          type: 'Chip',
          props: { color: 'success', icon: 'truck' },
          children: t('ارسال‌شده', 'Shipped'),
        },
        {
          type: 'Chip',
          props: { variant: 'primary', color: 'danger' },
          children: t('۲۰٪ تخفیف', '20% off'),
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
