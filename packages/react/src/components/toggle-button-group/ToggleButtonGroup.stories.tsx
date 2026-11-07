import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bold, Italic, LayoutGrid, List, Underline } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { Selection } from 'react-aria-components'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { ToggleButton } from '../toggle-button'
import { Tooltip } from '../tooltip'
import { ToggleButtonGroup } from './index'

// The ToggleButtonGroup, every option it has and what it is built into. The docs page is
// ToggleButtonGroup.mdx. A line comment, not a doc comment: the docs plugin replaces a commented
// meta's parameters with one.
const meta: Meta = {
  title: 'Components/Buttons/ToggleButtonGroup',
  component: ToggleButtonGroup,
  parameters: { layout: 'fullscreen' },
}

export default meta

/** Examples down the page, 16 apart. */
function Column({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
}

const SPAN = [
  { id: 'day', fa: 'روز', en: 'Day' },
  { id: 'week', fa: 'هفته', en: 'Week' },
  { id: 'month', fa: 'ماه', en: 'Month' },
  { id: 'year', fa: 'سال', en: 'Year' },
]

/** A report's span: day, week, month, year. */
function Span(props: Omit<React.ComponentProps<typeof ToggleButtonGroup>, 'children'>) {
  const t = useT()
  return (
    <ToggleButtonGroup aria-label={t('بازهٔ گزارش', 'Report span')} {...props}>
      {SPAN.map((s) => (
        <ToggleButton key={s.id} id={s.id}>
          {t(s.fa, s.en)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

const keys = (selection: Selection) => (selection === 'all' ? ['all'] : [...selection].map(String))

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  selectionMode: 'single' | 'multiple'
  disallowEmptySelection: boolean
  isDetached: boolean
  size: 'sm' | 'md' | 'lg'
  orientation: 'horizontal' | 'vertical'
  fullWidth: boolean
  isDisabled: boolean
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    selectionMode: 'single',
    disallowEmptySelection: true,
    isDetached: false,
    size: 'md',
    orientation: 'horizontal',
    fullWidth: false,
    isDisabled: false,
  },
  argTypes: {
    selectionMode: {
      control: 'inline-radio',
      options: ['single', 'multiple'],
      description: 'One pressed at a time, or any number.',
      table: { category: 'ToggleButtonGroup', defaultValue: { summary: 'single' } },
    },
    disallowEmptySelection: {
      description: 'One stays pressed: pressing it again keeps it.',
      table: { category: 'ToggleButtonGroup', defaultValue: { summary: 'false' } },
    },
    isDetached: {
      description: 'Each toggle a pill of its own, 4 apart, rather than one joined pill.',
      table: { category: 'ToggleButtonGroup', defaultValue: { summary: 'false' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Its toggles 32, 36 or 40 tall.',
      table: { category: 'ToggleButtonGroup', defaultValue: { summary: 'md' } },
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      table: { category: 'ToggleButtonGroup', defaultValue: { summary: 'horizontal' } },
    },
    fullWidth: {
      description: 'As wide as its column, the toggles sharing it.',
      table: { category: 'ToggleButtonGroup', defaultValue: { summary: 'false' } },
    },
    isDisabled: { table: { category: 'ToggleButtonGroup', defaultValue: { summary: 'false' } } },
  },
  render: function Render(args) {
    const [selected, setSelected] = useState<Selection>(new Set(['week']))
    return (
      <Stage width={520}>
        <Column>
          <Span {...args} selectedKeys={selected} onSelectionChange={setSelected} />
          <Value label="selectedKeys" value={keys(selected)} />
        </Column>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** One joined pill, or a pill for each toggle. */
export const AttachedAndDetached: StoryObj = {
  name: 'Joined and apart',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        <Example title={t('پیوسته', 'Joined')}>
          <Span selectionMode="single" disallowEmptySelection defaultSelectedKeys={['week']} />
        </Example>
        <Example title={t('جدا', 'Apart')} note="isDetached">
          <Span
            isDetached
            selectionMode="single"
            disallowEmptySelection
            defaultSelectedKeys={['week']}
          />
        </Example>
      </Grid>
    )
  },
}

/** One at a time, or several: an order list's payment filter. */
export const OneOrSeveral: StoryObj = {
  name: 'One or several',
  render: function Render() {
    const t = useT()
    const [several, setSeveral] = useState<Selection>(new Set(['paid', 'unpaid']))
    return (
      <Column>
        <Example title={t('یکی', 'One')} note='selectionMode="single"'>
          <Span selectionMode="single" disallowEmptySelection defaultSelectedKeys={['month']} />
        </Example>
        <Example title={t('چندتا', 'Several')} note='selectionMode="multiple"'>
          <ToggleButtonGroup
            aria-label={t('وضعیت پرداخت', 'Payment status')}
            isDetached
            size="sm"
            selectionMode="multiple"
            selectedKeys={several}
            onSelectionChange={setSeveral}
          >
            <ToggleButton id="paid">{t('پرداخت‌شده', 'Paid')}</ToggleButton>
            <ToggleButton id="unpaid">{t('پرداخت‌نشده', 'Unpaid')}</ToggleButton>
            <ToggleButton id="refunded">{t('بازپرداخت', 'Refunded')}</ToggleButton>
          </ToggleButtonGroup>
          <Value label="selectedKeys" value={keys(several)} />
        </Example>
      </Column>
    )
  },
}

/** Small, medium and large. */
export const Sizes: StoryObj = {
  render: () => (
    <Column>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Span key={size} size={size} selectionMode="single" defaultSelectedKeys={['day']} />
      ))}
    </Column>
  ),
}

/** Down the page, and across the whole column. */
export const Layout: StoryObj = {
  name: 'Down, and the whole width',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={260}>
        <Example title={t('زیر هم', 'Down')} note='orientation="vertical"'>
          <Span orientation="vertical" selectionMode="single" defaultSelectedKeys={['week']} />
        </Example>
        <Example title={t('هم‌عرض ستون', 'The column’s width')} note="fullWidth">
          <Span fullWidth selectionMode="single" defaultSelectedKeys={['week']} />
        </Example>
      </Grid>
    )
  },
}

/** Icons alone, each named and given a tooltip; a hairline between them. */
export const Icons: StoryObj = {
  name: 'Icons only',
  render: function Render() {
    const t = useT()
    const tools = [
      { id: 'bold', fa: 'پررنگ', en: 'Bold', icon: <Bold /> },
      { id: 'italic', fa: 'کج', en: 'Italic', icon: <Italic /> },
      { id: 'underline', fa: 'زیرخط', en: 'Underline', icon: <Underline /> },
    ]
    return (
      <Example title={t('قلم', 'Type')} note="isIconOnly + ToggleButtonGroup.Separator">
        <ToggleButtonGroup
          aria-label={t('قلم', 'Type')}
          selectionMode="multiple"
          defaultSelectedKeys={['bold']}
        >
          {tools.map((tool, i) => (
            <Tooltip key={tool.id} delay={500}>
              <ToggleButton id={tool.id} isIconOnly aria-label={t(tool.fa, tool.en)}>
                {i > 0 ? <ToggleButtonGroup.Separator /> : null}
                {tool.icon}
              </ToggleButton>
              <Tooltip.Content placement="top" showArrow>
                <Tooltip.Arrow />
                {t(tool.fa, tool.en)}
              </Tooltip.Content>
            </Tooltip>
          ))}
        </ToggleButtonGroup>
      </Example>
    )
  },
}

/** Disabled, the group is drawn at half; one toggle may be disabled alone. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        <Example title={t('همه غیرفعال', 'All disabled')}>
          <Span isDisabled selectionMode="single" defaultSelectedKeys={['month']} />
        </Example>
        <Example title={t('یکی غیرفعال', 'One disabled')}>
          <ToggleButtonGroup
            aria-label={t('بازهٔ گزارش', 'Report span')}
            selectionMode="single"
            defaultSelectedKeys={['day']}
          >
            <ToggleButton id="day">{t('روز', 'Day')}</ToggleButton>
            <ToggleButton id="week">{t('هفته', 'Week')}</ToggleButton>
            <ToggleButton id="year" isDisabled>
              {t('سال', 'Year')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Example>
      </Grid>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** A product list's view, as a grid or a list, beside its report span. */
export const ListHeader: StoryObj = {
  name: 'Example: a list’s view',
  render: function Render() {
    const t = useT()
    const [view, setView] = useState<Selection>(new Set(['grid']))
    return (
      <Stage width={560} surface>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'space-between',
            padding: 8,
          }}
        >
          <Span
            size="sm"
            selectionMode="single"
            disallowEmptySelection
            defaultSelectedKeys={['month']}
          />
          <ToggleButtonGroup
            aria-label={t('نمایش', 'View')}
            size="sm"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={view}
            onSelectionChange={setView}
          >
            <ToggleButton id="grid" isIconOnly aria-label={t('شبکه', 'Grid')}>
              <LayoutGrid />
            </ToggleButton>
            <ToggleButton id="list" isIconOnly aria-label={t('فهرست', 'List')}>
              <ToggleButtonGroup.Separator />
              <List />
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  return (
    <Column>
      <Span size="sm" selectionMode="single" defaultSelectedKeys={['week']} />
      <Span size="sm" isDetached selectionMode="multiple" defaultSelectedKeys={['day', 'month']} />
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

/** A Persian page and an English one: the first toggle at the start. */
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

/** The same group as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'ToggleButtonGroup',
      props: {
        label: t('بازهٔ گزارش', 'Report span'),
        isDetached: false,
        defaultSelectedKeys: ['week'],
      },
      children: SPAN.map((s) => ({
        type: 'ToggleButton',
        props: { id: s.id },
        children: t(s.fa, s.en),
      })),
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
