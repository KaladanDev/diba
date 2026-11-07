import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Description } from '../description'
import { Label } from '../label'
import { Slider } from './index'

// The Slider, every option it has and what it is built into. The docs page is Slider.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta: Meta = {
  title: 'Components/Controls/Slider',
  component: Slider,
  parameters: { layout: 'fullscreen' },
}

export default meta

/** Sliders down the page, 24 apart, as wide as a form's column. */
function Column({ children, width = 360 }: { children: ReactNode; width?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width, maxWidth: '100%' }}>
      {children}
    </div>
  )
}

/** The track with its fill and a thumb for each value. */
function Track() {
  return (
    <Slider.Track>
      {({ state }) => (
        <>
          <Slider.Fill />
          {state.values.map((_, i) => (
            <Slider.Thumb key={i} index={i} />
          ))}
        </>
      )}
    </Slider.Track>
  )
}

/** A slider's parts: its name, its value, the track, and help under it. */
function Bar({
  label,
  help,
  ...props
}: Omit<React.ComponentProps<typeof Slider>, 'children'> & {
  label?: ReactNode
  help?: ReactNode
}) {
  return (
    <Slider {...props}>
      {label ? <Label>{label}</Label> : null}
      <Slider.Output />
      <Track />
      {help ? <Description>{help}</Description> : null}
    </Slider>
  )
}

const TOMAN = { maximumFractionDigits: 0 } satisfies Intl.NumberFormatOptions

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  label: string
  range: boolean
  minValue: number
  maxValue: number
  step: number
  isDisabled: boolean
}

/** Every option on the controls. Empty words take the sample's. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { label: '', range: false, minValue: 0, maxValue: 100, step: 1, isDisabled: false },
  argTypes: {
    label: { control: 'text', table: { category: 'Example' } },
    range: {
      description: 'Two thumbs: a value from one to the other.',
      table: { category: 'Example' },
    },
    minValue: { control: 'number', table: { category: 'Slider', defaultValue: { summary: '0' } } },
    maxValue: {
      control: 'number',
      table: { category: 'Slider', defaultValue: { summary: '100' } },
    },
    step: {
      control: { type: 'number', min: 1 },
      description: 'What each move takes; a dot marks each step when there are few.',
      table: { category: 'Slider', defaultValue: { summary: '1' } },
    },
    isDisabled: { table: { category: 'Slider', defaultValue: { summary: 'false' } } },
  },
  render: function Render(args) {
    const t = useT()
    const [value, setValue] = useState<number | number[]>(40)
    const shown = args.range
      ? Array.isArray(value)
        ? value
        : [20, 60]
      : Array.isArray(value)
        ? value[0]!
        : value
    return (
      <Stage width={480}>
        <Column>
          <Bar
            value={shown}
            onChange={setValue}
            minValue={args.minValue}
            maxValue={args.maxValue}
            step={args.step}
            isDisabled={args.isDisabled}
            label={args.label || t('تخفیف (٪)', 'Discount (%)')}
          />
          <Value label="value" value={shown} />
        </Column>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** One value, or a range between two thumbs. */
export const Range: StoryObj = {
  name: 'One value and a range',
  render: function Render() {
    const t = useT()
    const [range, setRange] = useState<number | number[]>([400000, 1500000])
    return (
      <Column>
        <Bar
          label={t('امتیاز کمینه', 'Lowest rating')}
          defaultValue={4}
          minValue={1}
          maxValue={5}
        />
        <Bar
          label={t('بازهٔ قیمت (تومان)', 'Price range (toman)')}
          value={range}
          onChange={setRange}
          minValue={0}
          maxValue={2000000}
          step={50000}
          formatOptions={TOMAN}
        />
        <Value label="value" value={range} />
      </Column>
    )
  },
}

/** A dot at each step when there are few of them; none on a fine one. */
export const Steps: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <Bar label={t('ستاره‌ها', 'Stars')} defaultValue={3} minValue={1} maxValue={5} step={1} />
        <Bar
          label={t('تخفیف (٪)', 'Discount (%)')}
          defaultValue={30}
          minValue={0}
          maxValue={50}
          step={10}
        />
        <Bar
          label={t('وزن (گرم)', 'Weight (g)')}
          defaultValue={350}
          minValue={0}
          maxValue={1000}
          step={1}
        />
      </Column>
    )
  },
}

/** Its value written in the page's digits and in its own format. */
export const Formats: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <Bar
          label={t('تخفیف', 'Discount')}
          defaultValue={0.25}
          minValue={0}
          maxValue={0.5}
          step={0.05}
          formatOptions={{ style: 'percent' }}
        />
        <Bar
          label={t('هزینهٔ ارسال (تومان)', 'Delivery fee (toman)')}
          defaultValue={45000}
          minValue={0}
          maxValue={100000}
          step={5000}
          formatOptions={TOMAN}
        />
      </Column>
    )
  },
}

/** Without its value written; with help; disabled. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <Slider defaultValue={60} aria-label={t('میزان صدا', 'Volume')}>
          <Track />
        </Slider>
        <Bar
          label={t('موجودی هشدار', 'Low-stock alert at')}
          defaultValue={5}
          minValue={0}
          maxValue={20}
          help={t(
            'وقتی موجودی به این عدد برسد خبر می‌دهیم.',
            'We tell you when the stock reaches it.',
          )}
        />
        <Bar label={t('تخفیف (٪)', 'Discount (%)')} defaultValue={20} isDisabled />
      </Column>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** A storefront's price filter: a range in toman, applied when the thumb is let go. */
export const PriceFilter: StoryObj = {
  name: 'Example: a price filter',
  render: function Render() {
    const t = useT()
    const [applied, setApplied] = useState<number | number[]>([200000, 1200000])
    return (
      <Stage width={360} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}>
          <Bar
            label={t('قیمت (تومان)', 'Price (toman)')}
            defaultValue={[200000, 1200000]}
            minValue={0}
            maxValue={2000000}
            step={50000}
            formatOptions={TOMAN}
            onChangeEnd={setApplied}
          />
          <Value label={t('فیلتر', 'Filter')} value={applied} />
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <Column width={300}>
      <Bar
        label={t('تخفیف (٪)', 'Discount (%)')}
        defaultValue={30}
        minValue={0}
        maxValue={50}
        step={10}
      />
      <Bar
        label={t('قیمت (تومان)', 'Price (toman)')}
        defaultValue={[200000, 1200000]}
        minValue={0}
        maxValue={2000000}
        step={50000}
        formatOptions={TOMAN}
      />
    </Column>
  )
}

/** The light theme and the dark, side by side, whatever the toolbar says. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Sample />
    </Themes>
  ),
}

/** A Persian page and an English one: the least at the start, the right on a Persian page. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Sample />
    </Directions>
  ),
}

/** On a phone's width. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Sample />
    </Device>
  ),
}

/** The same slider as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 6 },
      children: [
        {
          type: 'Slider',
          props: {
            label: t('تخفیف', 'Discount'),
            defaultValue: 30,
            maxValue: 50,
            step: 10,
            formatStyle: 'percent',
          },
        },
        {
          type: 'Slider',
          props: {
            label: t('قیمت', 'Price'),
            isRange: true,
            defaultValue: [200000, 1200000],
            maxValue: 2000000,
            step: 50000,
            formatStyle: 'currency',
            currency: 'IRT',
          },
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
