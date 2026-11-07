import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, useT } from '../../stories/kit'
import { Button } from '../button'
import { Spacer, type SpacerSize } from './Spacer'

// The Spacer, every option it has and where it pushes. The docs page is Spacer.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Layout/Spacer',
  component: Spacer,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Spacer>

export default meta

/** A tile, to show the room between two. */
function Tile({ children }: { children: ReactNode }) {
  return (
    <div
      className="text-foreground"
      style={{ background: 'var(--default)', borderRadius: 12, padding: '8px 12px', fontSize: 14 }}
    >
      {children}
    </div>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = { size: SpacerSize; axis: 'block' | 'inline' }

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { size: 4, axis: 'block' },
  argTypes: {
    size: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16],
      description: 'A step of 4, as a Stack’s gap: 4 is 16.',
      table: { category: 'Spacer', defaultValue: { summary: '4' } },
    },
    axis: {
      control: 'inline-radio',
      options: ['block', 'inline'],
      description: 'Down, between stacked things; or across, between things in a row.',
      table: { category: 'Spacer', defaultValue: { summary: 'block' } },
    },
  },
  render: function Render({ size, axis }) {
    const t = useT()
    return (
      <Stage width={420} surface>
        <div
          style={{
            display: 'flex',
            flexDirection: axis === 'inline' ? 'row' : 'column',
            alignItems: 'flex-start',
          }}
        >
          <Tile>{t('بالا', 'Before')}</Tile>
          <Spacer size={size} axis={axis} />
          <Tile>{t('پایین', 'After')}</Tile>
        </div>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Its sizes, on the scale of 4. */
export const Sizes: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={140}>
        {([1, 2, 4, 6, 8, 12] as const).map((size) => (
          <Example key={size} title={`size={${size}}`} note={`${size * 4}px`}>
            <div>
              <Tile>{t('بالا', 'Before')}</Tile>
              <Spacer size={size} />
              <Tile>{t('پایین', 'After')}</Tile>
            </div>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Across a row: it pushes as the row reads, from the right on a Persian page. */
export const Inline: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420} surface>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Tile>{t('آغاز', 'Start')}</Tile>
          <Spacer axis="inline" size={8} />
          <Tile>{t('پس از ۳۲', 'After 32')}</Tile>
        </div>
      </Stage>
    )
  },
}

// ---- where it pushes -----------------------------------------------------------------------------

/** A form's buttons set further from its fields than the fields are from each other. */
export const BeforeButtons: StoryObj = {
  name: 'Example: room before a form’s buttons',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={360} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Tile>{t('نام فروشگاه', 'Store name')}</Tile>
          <Tile>{t('ایمیل پشتیبانی', 'Support email')}</Tile>
          <Spacer size={4} />
          <Button>{t('ذخیره', 'Save')}</Button>
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

/** On a Persian page and an English one. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: function Render() {
    const t = useT()
    return (
      <Directions>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Tile>{t('آغاز', 'Start')}</Tile>
          <Spacer axis="inline" size={8} />
          <Tile>{t('پس از ۳۲', 'After 32')}</Tile>
        </div>
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
        <Tile>{t('بالا', 'Before')}</Tile>
        <Spacer size={6} />
        <Tile>{t('پس از ۲۴', 'After 24')}</Tile>
      </Device>
    )
  },
}

/** The same room as a tree, between two blocks in a Stack with no gap. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 0 },
      children: [
        { type: 'Text', props: { size: 'sm' }, children: t('نام فروشگاه', 'Store name') },
        { type: 'Spacer', props: { size: 6 } },
        { type: 'Button', children: t('ذخیره', 'Save') },
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
