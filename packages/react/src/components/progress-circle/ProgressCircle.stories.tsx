import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT } from '../../stories/kit'
import { Card } from '../card'
import { ProgressCircle } from './index'

// The ProgressCircle, every option it has and what it rounds. The docs page is ProgressCircle.mdx.
// A line comment, not a doc comment: the docs plugin replaces a commented meta's parameters with
// one.
const meta = {
  title: 'Components/Feedback/ProgressCircle',
  component: ProgressCircle,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ProgressCircle>

export default meta

type Color = 'default' | 'accent' | 'success' | 'warning' | 'danger'
type Size = 'sm' | 'md' | 'lg'

/** A ring, named for a screen reader. */
function Ring({
  label,
  value,
  color,
  size,
  isIndeterminate,
  id,
}: {
  label?: string
  value?: number
  color?: Color
  size?: Size
  isIndeterminate?: boolean
  id?: string
}) {
  return (
    <ProgressCircle
      value={value}
      color={color}
      size={size}
      isIndeterminate={isIndeterminate}
      aria-label={label}
      aria-labelledby={id}
    >
      <ProgressCircle.Track>
        <ProgressCircle.TrackCircle />
        <ProgressCircle.FillCircle />
      </ProgressCircle.Track>
    </ProgressCircle>
  )
}

/** A ring with its words beside it: they name it. */
function Beside({ words, ...ring }: { words: string } & Parameters<typeof Ring>[0]) {
  const id = useId()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Ring {...ring} id={id} />
      <span id={id} className="text-foreground" style={{ fontSize: 14 }}>
        {words}
      </span>
    </div>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = { value: number; color: Color; size: Size; isIndeterminate: boolean }

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { value: 60, color: 'accent', size: 'md', isIndeterminate: false },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100 },
      description: 'How far along, between minValue and maxValue.',
      table: { category: 'ProgressCircle' },
    },
    color: {
      control: 'inline-radio',
      options: ['default', 'accent', 'success', 'warning', 'danger'],
      description: 'The fill: a status’s solid colour, or the secondary text’s for default.',
      table: { category: 'ProgressCircle', defaultValue: { summary: 'accent' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: '20, 28 or 36 across.',
      table: { category: 'ProgressCircle', defaultValue: { summary: 'md' } },
    },
    isIndeterminate: {
      description: 'No telling how far: an arc turns round it.',
      table: { category: 'ProgressCircle', defaultValue: { summary: 'false' } },
    },
  },
  render: function Render(args) {
    const t = useT()
    return (
      <Stage width={360}>
        <Beside words={t('۳ از ۵ گام', '3 of 5 steps')} {...args} />
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Its sizes: 20, 28 and 36 across, the stroke 4 on each. */
export const Sizes: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={140}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Example key={size} title={size}>
            <Ring label={t('پیشرفت', 'Progress')} value={60} size={size} />
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Its colours: the brand's, a status's, or the secondary text's for default. */
export const Colors: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={140}>
        {(['accent', 'success', 'warning', 'danger', 'default'] as const).map((color) => (
          <Example key={color} title={color}>
            <Ring label={t('پیشرفت', 'Progress')} value={65} color={color} />
          </Example>
        ))}
      </Grid>
    )
  },
}

/** No telling how far: an arc turns round the ring. */
export const Indeterminate: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={360}>
        <Beside words={t('در حال بارگذاری عکس…', 'Uploading the photo…')} isIndeterminate />
      </Stage>
    )
  },
}

// ---- what it rounds ------------------------------------------------------------------------------

/** The admin's home: the shop's setup, and how much of it is done. */
export const Setup: StoryObj = {
  name: 'Example: the shop’s setup',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420}>
        <Card>
          <Card.Header>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Ring id="setup-title" value={60} size="lg" />
              <div style={{ flex: 1 }}>
                <Card.Title id="setup-title">
                  {t('راه‌اندازی فروشگاه', 'Setting up the shop')}
                </Card.Title>
                <Card.Description>
                  {t('۳ از ۵ گام انجام شده', '3 of 5 steps done')}
                </Card.Description>
              </div>
            </div>
          </Card.Header>
        </Card>
      </Stage>
    )
  },
}

/** The storefront's review form: each photo uploading, its ring on it. */
export const Uploads: StoryObj = {
  name: 'Example: photos uploading',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[100, 70, 20].map((value, i) => (
            <div
              key={i}
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                background: 'var(--surface-secondary)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Ring
                label={t(`عکس ${i + 1}`, `Photo ${i + 1}`)}
                value={value}
                color={value === 100 ? 'success' : 'accent'}
              />
            </div>
          ))}
        </div>
        <p className="text-muted" style={{ margin: '8px 0 0', fontSize: 12 }}>
          {t('۲ عکس در حال بارگذاری', '2 photos uploading')}
        </p>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Pair() {
  const t = useT()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Beside words={t('۳ از ۵ گام', '3 of 5 steps')} value={60} />
      <Beside words={t('در حال بارگذاری…', 'Loading…')} isIndeterminate />
    </div>
  )
}

/** In both themes: the ring the neutral fill, the fill the brand's. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Pair />
    </Themes>
  ),
}

/** On a Persian page and an English one. */
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

/** The same ring as a block, named for a screen reader by its label. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { direction: 'horizontal', gap: 3, align: 'center' },
      children: [
        {
          type: 'ProgressCircle',
          props: { value: 60, size: 'lg', label: t('راه‌اندازی فروشگاه', 'Shop setup') },
        },
        { type: 'Text', props: { size: 'sm' }, children: t('۳ از ۵ گام', '3 of 5 steps') },
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
