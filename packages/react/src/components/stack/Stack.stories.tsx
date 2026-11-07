import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { goods } from '../../stories/people'
import { Device, Directions, Example, Grid, Stage, useT } from '../../stories/kit'
import { Button } from '../button'
import { Card } from '../card'
import { Chip } from '../chip'
import { Stack } from './Stack'

// The Stack, every option it has and what it lays out. The docs page is Stack.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Layout/Stack',
  component: Stack,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Stack>

export default meta

type Gap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16

/** A tile to lay out, as wide as its words. */
function Tile({ children, tall }: { children: ReactNode; tall?: boolean }) {
  return (
    <div
      className="text-foreground"
      style={{
        background: 'var(--default)',
        borderRadius: 12,
        padding: tall ? '20px 12px' : '8px 12px',
        fontSize: 14,
      }}
    >
      {children}
    </div>
  )
}

/** Three tiles: an order's lines. */
function Tiles() {
  const t = useT()
  return (
    <>
      <Tile>{t('سفارش ۱۰۴۱', 'Order 1041')}</Tile>
      <Tile tall>{t('۳ قلم', '3 items')}</Tile>
      <Tile>{t('۱٬۲۸۰٬۰۰۰ تومان', '1,280,000 toman')}</Tile>
    </>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  direction: 'vertical' | 'horizontal'
  gap: Gap
  align: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify: 'start' | 'center' | 'end' | 'between' | 'around'
  wrap: boolean
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { direction: 'vertical', gap: 4, align: 'stretch', justify: 'start', wrap: false },
  argTypes: {
    direction: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      description: 'A column, or a row that runs as the page reads.',
      table: { category: 'Stack', defaultValue: { summary: 'vertical' } },
    },
    gap: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16],
      description: 'The space between, a step of 4: 4 is 16.',
      table: { category: 'Stack', defaultValue: { summary: '4' } },
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
      description: 'Across the stack: a column’s width, a row’s height.',
      table: { category: 'Stack', defaultValue: { summary: 'stretch' } },
    },
    justify: {
      control: 'inline-radio',
      options: ['start', 'center', 'end', 'between', 'around'],
      description: 'Along the stack, when there is room to spare.',
      table: { category: 'Stack', defaultValue: { summary: 'start' } },
    },
    wrap: {
      description: 'A row runs onto the next line when it is full.',
      table: { category: 'Stack', defaultValue: { summary: 'false' } },
    },
  },
  render: (args) => (
    <Stage width={520} surface>
      <Stack {...args} style={{ minHeight: args.direction === 'vertical' ? 200 : undefined }}>
        <Tiles />
      </Stack>
    </Stage>
  ),
}

// ---- its options ---------------------------------------------------------------------------------

/** A column and a row; a row runs as the page reads, from the right on a Persian page. */
export const ColumnAndRow: StoryObj = {
  name: 'Column and row',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={260}>
        <Example title={t('ستون', 'A column')} note='direction="vertical"'>
          <Stack>
            <Tiles />
          </Stack>
        </Example>
        <Example title={t('ردیف', 'A row')} note='direction="horizontal"'>
          <Stack direction="horizontal">
            <Tiles />
          </Stack>
        </Example>
      </Grid>
    )
  },
}

/** The space between, on the scale of 4: 1 is 4, 4 is 16, 8 is 32. */
export const Gaps: StoryObj = {
  render: function Render() {
    return (
      <Grid min={180}>
        {([0, 1, 2, 4, 6, 8] as const).map((gap) => (
          <Example key={gap} title={`gap={${gap}}`} note={`${gap * 4}px`}>
            <Stack direction="horizontal" gap={gap}>
              <Tile>۱</Tile>
              <Tile>۲</Tile>
              <Tile>۳</Tile>
            </Stack>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Across a row: its tiles at its top, middle, bottom, stretched, or on their words' line. */
export const Alignment: StoryObj = {
  render: function Render() {
    return (
      <Grid min={220}>
        {(['start', 'center', 'end', 'stretch', 'baseline'] as const).map((align) => (
          <Example key={align} title={`align="${align}"`}>
            <Stack direction="horizontal" gap={2} align={align}>
              <Tiles />
            </Stack>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Along a row with room to spare: at its start, middle or end, or spread. */
export const Justify: StoryObj = {
  render: function Render() {
    return (
      <Stack gap={6}>
        {(['start', 'center', 'end', 'between', 'around'] as const).map((justify) => (
          <Example key={justify} title={`justify="${justify}"`}>
            <Stack direction="horizontal" gap={2} justify={justify}>
              <Tile>۱</Tile>
              <Tile>۲</Tile>
              <Tile>۳</Tile>
            </Stack>
          </Example>
        ))}
      </Stack>
    )
  },
}

/** A full row runs onto the next line: tags, say. */
export const Wrapping: StoryObj = {
  render: function Render() {
    const t = useT()
    const tags = [
      t('چای سیاه', 'Black tea'),
      t('بهاره', 'Spring'),
      t('لاهیجان', 'Lahijan'),
      t('۵۰۰ گرم', '500 g'),
      t('ارسال رایگان', 'Free delivery'),
      t('پرفروش', 'Best seller'),
    ]
    return (
      <Stage width={260} surface>
        <Stack direction="horizontal" gap={2} wrap>
          {tags.map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </Stack>
      </Stage>
    )
  },
}

// ---- what it lays out ----------------------------------------------------------------------------

/** A page's header: its title at the start, its actions at the end. */
export const PageHeader: StoryObj = {
  name: 'Example: a page’s header',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={720} surface>
        <Stack direction="horizontal" justify="between" align="center" gap={4}>
          <Stack gap={1}>
            <span className="text-foreground" style={{ fontSize: 20, fontWeight: 600 }}>
              {t('محصول‌ها', 'Products')}
            </span>
            <span className="text-muted" style={{ fontSize: 14 }}>
              {t('۴۸ محصول، ۳ پیش‌نویس', '48 products, 3 drafts')}
            </span>
          </Stack>
          <Stack direction="horizontal" gap={2}>
            <Button variant="secondary">{t('خروجی', 'Export')}</Button>
            <Button>{t('افزودن محصول', 'Add product')}</Button>
          </Stack>
        </Stack>
      </Stage>
    )
  },
}

/** A storefront's product row: picture, words, and price at the end. */
export const ProductRow: StoryObj = {
  name: 'Example: a product in the cart',
  render: function Render() {
    const t = useT()
    const tea = goods.tea
    return (
      <Stage width={480}>
        <Card>
          <Stack direction="horizontal" gap={3} align="center">
            <img src={tea.photo} alt="" width={56} height={56} style={{ borderRadius: 12 }} />
            <Stack gap={1} style={{ flex: 1 }}>
              <span className="text-foreground" style={{ fontSize: 14, fontWeight: 500 }}>
                {t(tea.fa, tea.en)}
              </span>
              <span className="text-muted" style={{ fontSize: 12 }}>
                {t('۲ عدد', 'Qty 2')}
              </span>
            </Stack>
            <span className="text-foreground" style={{ fontSize: 14 }}>
              {t('۶۴۰٬۰۰۰ تومان', '640,000 toman')}
            </span>
          </Stack>
        </Card>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

/** On a Persian page and an English one: a row starts at the page's start. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Stack direction="horizontal" gap={2}>
        <Tiles />
      </Stack>
    </Directions>
  ),
}

/** On a phone: a row that does not fit wraps when asked. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Stack direction="horizontal" gap={2} wrap>
        <Tiles />
      </Stack>
    </Device>
  ),
}

/** The same stack as a tree: the block draws its own gaps, so a host needs no utility classes. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { direction: 'horizontal', gap: 2, wrap: true },
      children: [
        { type: 'Chip', children: t('چای سیاه', 'Black tea') },
        { type: 'Chip', children: t('بهاره', 'Spring') },
        { type: 'Chip', children: t('لاهیجان', 'Lahijan') },
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
