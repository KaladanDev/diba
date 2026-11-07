import type { Meta, StoryObj } from '@storybook/react-vite'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT } from '../../stories/kit'
import { Card } from '../card'
import { Label } from '../label'
import { ProgressBar } from './index'

// The ProgressBar, every option it has and what it waits on. The docs page is ProgressBar.mdx. A
// line comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Feedback/ProgressBar',
  component: ProgressBar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ProgressBar>

export default meta

type Color = 'default' | 'accent' | 'success' | 'warning' | 'danger'
type Size = 'sm' | 'md' | 'lg'

/** A bar with its label and value, as most stories draw it. */
function Bar({
  label,
  value,
  color,
  size,
  isIndeterminate,
  showValue = true,
  valueLabel,
  maxValue,
}: {
  label?: string
  value?: number
  color?: Color
  size?: Size
  isIndeterminate?: boolean
  showValue?: boolean
  valueLabel?: string
  maxValue?: number
}) {
  return (
    <ProgressBar
      value={value}
      maxValue={maxValue}
      color={color}
      size={size}
      isIndeterminate={isIndeterminate}
      valueLabel={valueLabel}
      aria-label={label ? undefined : valueLabel}
    >
      {label ? <Label>{label}</Label> : null}
      {showValue ? <ProgressBar.Output /> : null}
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  value: number
  color: Color
  size: Size
  isIndeterminate: boolean
  showValue: boolean
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { value: 60, color: 'accent', size: 'md', isIndeterminate: false, showValue: true },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100 },
      description: 'How far along, between minValue and maxValue.',
      table: { category: 'ProgressBar' },
    },
    color: {
      control: 'inline-radio',
      options: ['default', 'accent', 'success', 'warning', 'danger'],
      description: 'The fill: a status’s solid colour, or the neutral fill.',
      table: { category: 'ProgressBar', defaultValue: { summary: 'accent' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'The track 4, 8 or 20 tall.',
      table: { category: 'ProgressBar', defaultValue: { summary: 'md' } },
    },
    isIndeterminate: {
      description: 'No telling how far: two lines run along it.',
      table: { category: 'ProgressBar', defaultValue: { summary: 'false' } },
    },
    showValue: {
      description: 'ProgressBar.Output beside the label.',
      table: { category: 'Example' },
    },
  },
  render: function Render(args) {
    const t = useT()
    return (
      <Stage width={420}>
        <Bar label={t('بارگذاری عکس‌ها', 'Uploading photos')} {...args} />
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Its sizes: the track 4, 8 and 20 tall. */
export const Sizes: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={260}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Example key={size} title={size}>
            <Bar label={t('بارگذاری', 'Uploading')} value={45} size={size} />
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Its colours: the brand's, a status's, or the neutral fill for default. */
export const Colors: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={260}>
        {(['accent', 'success', 'warning', 'danger', 'default'] as const).map((color) => (
          <Example key={color} title={color}>
            <Bar label={t('پیشرفت', 'Progress')} value={65} color={color} />
          </Example>
        ))}
      </Grid>
    )
  },
}

/** No telling how far: Material's two lines run along it, mirrored on a Persian page. */
export const Indeterminate: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420}>
        <Bar
          label={t('آماده‌سازی گزارش', 'Preparing the report')}
          isIndeterminate
          showValue={false}
        />
      </Stage>
    )
  },
}

/** Its value in words of your own: a count, or a sum in toman. */
export const Values: StoryObj = {
  name: 'Its value in words',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        <Example title={t('شمار', 'A count')} note="valueLabel">
          <Bar
            label={t('درون‌ریزی کالاها', 'Importing products')}
            value={42}
            maxValue={120}
            valueLabel={t('۴۲ از ۱۲۰', '42 of 120')}
          />
        </Example>
        <Example title={t('مبلغ', 'A sum')} note="valueLabel">
          <Bar
            label={t('هدف فروش ماه', 'This month’s target')}
            value={32}
            maxValue={50}
            color="success"
            valueLabel={t('۳۲ از ۵۰ میلیون تومان', '32 of 50 million toman')}
          />
        </Example>
      </Grid>
    )
  },
}

/** Without a label: named for a screen reader with aria-label. */
export const WithoutLabel: StoryObj = {
  name: 'Without a label',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420}>
        <Example title={t('فقط نوار', 'The bar alone')}>
          <ProgressBar value={70} aria-label={t('بارگذاری عکس', 'Uploading the photo')}>
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
        </Example>
      </Stage>
    )
  },
}

// ---- what it waits on ----------------------------------------------------------------------------

/** The admin: a spreadsheet of products coming in, row by row. */
export const Import: StoryObj = {
  name: 'Example: an import',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={460}>
        <Card>
          <Card.Header>
            <Card.Title>{t('درون‌ریزی کالاها', 'Importing products')}</Card.Title>
            <Card.Description>{t('kalaha-aban.xlsx', 'kalaha-aban.xlsx')}</Card.Description>
          </Card.Header>
          <Card.Content>
            <Bar
              label={t('ردیف‌ها', 'Rows')}
              value={84}
              maxValue={120}
              valueLabel={t('۸۴ از ۱۲۰', '84 of 120')}
            />
          </Card.Content>
        </Card>
      </Stage>
    )
  },
}

/** The storefront's cart: how far to free delivery. */
export const FreeDelivery: StoryObj = {
  name: 'Example: to free delivery',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={380}>
        <Card variant="secondary">
          <Card.Content>
            <Bar
              label={t('۱۸۰٬۰۰۰ تومان تا ارسال رایگان', '180,000 toman to free delivery')}
              value={320}
              maxValue={500}
              color="success"
              size="sm"
              showValue={false}
            />
          </Card.Content>
        </Card>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Pair() {
  const t = useT()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Bar label={t('بارگذاری عکس‌ها', 'Uploading photos')} value={60} />
      <Bar label={t('آماده‌سازی', 'Preparing')} isIndeterminate showValue={false} />
    </div>
  )
}

/** In both themes: the track the off-track shade, the fill the brand's. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Pair />
    </Themes>
  ),
}

/** On a Persian page and an English one: it fills from the start, the right on a Persian page. */
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

/** The same bar as a block: a toman's value in the page's words. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'ProgressBar',
      props: {
        label: t('هدف فروش ماه', 'This month’s target'),
        value: 32000000,
        maxValue: 50000000,
        formatStyle: 'currency',
        currency: 'IRT',
        color: 'success',
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
