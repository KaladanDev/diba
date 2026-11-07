import type { Meta, StoryObj } from '@storybook/react-vite'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT } from '../../stories/kit'
import { Card } from '../card'
import { Label } from '../label'
import { Meter } from './index'

// The Meter, every option it has and what it measures. The docs page is Meter.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Feedback/Meter',
  component: Meter,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Meter>

export default meta

type Color = 'default' | 'accent' | 'success' | 'warning' | 'danger'
type Size = 'sm' | 'md' | 'lg'

/** A meter with its label and value, as most stories draw it. */
function Gauge({
  label,
  value,
  maxValue,
  color,
  size,
  valueLabel,
  showValue = true,
}: {
  label?: string
  value: number
  maxValue?: number
  color?: Color
  size?: Size
  valueLabel?: string
  showValue?: boolean
}) {
  return (
    <Meter
      value={value}
      maxValue={maxValue}
      color={color}
      size={size}
      valueLabel={valueLabel}
      aria-label={label ? undefined : valueLabel}
    >
      {label ? <Label>{label}</Label> : null}
      {showValue ? <Meter.Output /> : null}
      <Meter.Track>
        <Meter.Fill />
      </Meter.Track>
    </Meter>
  )
}

/** The colour of how full it is: green, then amber from 70%, red from 90%. */
const toneOf = (share: number): Color =>
  share >= 0.9 ? 'danger' : share >= 0.7 ? 'warning' : 'success'

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = { value: number; color: Color; size: Size; showValue: boolean }

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { value: 80, color: 'accent', size: 'md', showValue: true },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100 },
      description: 'How much is used, between minValue and maxValue.',
      table: { category: 'Meter' },
    },
    color: {
      control: 'inline-radio',
      options: ['default', 'accent', 'success', 'warning', 'danger'],
      description: 'The fill: a status’s solid colour, or the secondary text’s for default.',
      table: { category: 'Meter', defaultValue: { summary: 'accent' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'The track 4, 8 or 12 tall.',
      table: { category: 'Meter', defaultValue: { summary: 'md' } },
    },
    showValue: { description: 'Meter.Output beside the label.', table: { category: 'Example' } },
  },
  render: function Render(args) {
    const t = useT()
    return (
      <Stage width={420}>
        <Gauge label={t('فضای ذخیره', 'Storage')} {...args} />
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Its sizes: the track 4, 8 and 12 tall. */
export const Sizes: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={260}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Example key={size} title={size}>
            <Gauge label={t('فضای ذخیره', 'Storage')} value={45} size={size} />
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Its colours, and the one to choose as it fills: green, amber, then red. */
export const Colors: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={260}>
        {(['accent', 'success', 'warning', 'danger', 'default'] as const).map((color) => (
          <Example key={color} title={color}>
            <Gauge label={t('مصرف', 'Used')} value={65} color={color} />
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Its value in words of your own: what is used of how much. */
export const Values: StoryObj = {
  name: 'Its value in words',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        <Example title={t('درصد', 'A percent')} note={t('پیش‌فرض', 'The default')}>
          <Gauge label={t('فضای ذخیره', 'Storage')} value={80} />
        </Example>
        <Example title={t('از چند', 'Of how many')} note="valueLabel">
          <Gauge
            label={t('کالاها', 'Products')}
            value={86}
            maxValue={100}
            color={toneOf(0.86)}
            valueLabel={t('۸۶ از ۱۰۰', '86 of 100')}
          />
        </Example>
      </Grid>
    )
  },
}

// ---- what it measures ----------------------------------------------------------------------------

/** The admin's plan: what the shop has used of its plan's limits. */
export const PlanUsage: StoryObj = {
  name: 'Example: a plan’s limits',
  render: function Render() {
    const t = useT()
    const limits = [
      [t('کالاها', 'Products'), 86, 100, t('۸۶ از ۱۰۰', '86 of 100')],
      [t('فضای ذخیره', 'Storage'), 8, 10, t('۸ از ۱۰ گیگابایت', '8 of 10 GB')],
      [t('کارکنان', 'Staff'), 2, 5, t('۲ از ۵', '2 of 5')],
    ] as const
    return (
      <Stage width={460}>
        <Card>
          <Card.Header>
            <Card.Title>{t('طرح پایه', 'Basic plan')}</Card.Title>
            <Card.Description>{t('تا ۱۴ آذر', 'Until 5 Dec')}</Card.Description>
          </Card.Header>
          <Card.Content>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {limits.map(([label, used, of, words]) => (
                <Gauge
                  key={label}
                  label={label}
                  value={used}
                  maxValue={of}
                  color={toneOf(used / of)}
                  valueLabel={words}
                />
              ))}
            </div>
          </Card.Content>
        </Card>
      </Stage>
    )
  },
}

/** The storefront's product page: how few are left. */
export const FewLeft: StoryObj = {
  name: 'Example: few left',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={320}>
        <Gauge
          label={t('فقط ۳ عدد باقی مانده', 'Only 3 left')}
          value={3}
          maxValue={20}
          color="danger"
          size="sm"
          showValue={false}
        />
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Pair() {
  const t = useT()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Gauge label={t('فضای ذخیره', 'Storage')} value={80} color="warning" />
      <Gauge
        label={t('کالاها', 'Products')}
        value={40}
        color="success"
        valueLabel={t('۴۰ از ۱۰۰', '40 of 100')}
      />
    </div>
  )
}

/** In both themes: the track the neutral fill, the fill the status's. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Pair />
    </Themes>
  ),
}

/** On a Persian page and an English one: it fills from the start. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Pair />
    </Directions>
  ),
}

/** On a phone. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Pair />
    </Device>
  ),
}

/** The same meter as a block. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Meter',
      props: {
        label: t('فضای ذخیره', 'Storage'),
        value: 8,
        maxValue: 10,
        valueLabel: t('۸ از ۱۰ گیگابایت', '8 of 10 GB'),
        color: 'warning',
      },
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
