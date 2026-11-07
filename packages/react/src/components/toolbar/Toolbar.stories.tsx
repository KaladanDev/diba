import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ArrowDownUp,
  Bold,
  ChevronDown,
  Italic,
  LayoutGrid,
  List,
  Printer,
  Trash2,
  Truck,
  Underline,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT } from '../../stories/kit'
import { Button } from '../button'
import { Dropdown } from '../dropdown'
import { Separator } from '../separator'
import { ToggleButton } from '../toggle-button'
import { ToggleButtonGroup } from '../toggle-button-group'
import { Toolbar } from './index'

// The Toolbar, every option it has and what it holds. The docs page is Toolbar.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Layout/Toolbar',
  component: Toolbar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Toolbar>

export default meta

/** Text formatting: three toggles, a separator, a button. */
function Formatting({
  orientation,
  isAttached,
}: {
  orientation?: 'horizontal' | 'vertical'
  isAttached?: boolean
}) {
  const t = useT()
  return (
    <Toolbar
      aria-label={t('قالب متن', 'Text format')}
      orientation={orientation}
      isAttached={isAttached}
    >
      <ToggleButtonGroup
        aria-label={t('سبک', 'Style')}
        selectionMode="multiple"
        defaultSelectedKeys={['bold']}
      >
        <ToggleButton id="bold" isIconOnly aria-label={t('پررنگ', 'Bold')}>
          <Bold />
        </ToggleButton>
        <ToggleButton id="italic" isIconOnly aria-label={t('کج', 'Italic')}>
          <ToggleButtonGroup.Separator />
          <Italic />
        </ToggleButton>
        <ToggleButton id="underline" isIconOnly aria-label={t('زیرخط', 'Underline')}>
          <ToggleButtonGroup.Separator />
          <Underline />
        </ToggleButton>
      </ToggleButtonGroup>
      <Separator />
      <Button variant="tertiary">{t('پیوند', 'Link')}</Button>
    </Toolbar>
  )
}

/** The bulk actions over chosen orders: print, ship, and delete apart. */
function BulkActions({
  orientation,
  isAttached,
}: {
  orientation?: 'horizontal' | 'vertical'
  isAttached?: boolean
}) {
  const t = useT()
  return (
    <Toolbar
      aria-label={t('کارهای گروهی', 'Bulk actions')}
      orientation={orientation}
      isAttached={isAttached}
    >
      <Button variant="secondary">
        <Printer />
        {t('چاپ برچسب', 'Print labels')}
      </Button>
      <Button variant="secondary">
        <Truck />
        {t('ارسال شد', 'Mark shipped')}
      </Button>
      <Separator />
      <Button variant="danger-soft">
        <Trash2 />
        {t('حذف', 'Delete')}
      </Button>
    </Toolbar>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = { orientation: 'horizontal' | 'vertical'; isAttached: boolean }

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { orientation: 'horizontal', isAttached: false },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'A row, the side arrows moving along it; or a column, the up and down arrows.',
      table: { category: 'Toolbar', defaultValue: { summary: 'horizontal' } },
    },
    isAttached: {
      description: 'On a bar of its own: the surface, 24 round, 4 in, with the overlay’s shadow.',
      table: { category: 'Toolbar', defaultValue: { summary: 'false' } },
    },
  },
  render: (args) => (
    <Stage surface>
      <BulkActions {...args} />
    </Stage>
  ),
}

// ---- its options ---------------------------------------------------------------------------------

/** A row: a separator in it runs down, half its height. */
export const Horizontal: StoryObj = {
  render: () => (
    <Stage surface>
      <Formatting />
    </Stage>
  ),
}

/** A column: a separator in it runs across, half its width. */
export const Vertical: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={220}>
        <Example title={t('کارهای گروهی', 'Bulk actions')}>
          <BulkActions orientation="vertical" />
        </Example>
        <Example title={t('قالب متن', 'Text format')}>
          <Formatting orientation="vertical" />
        </Example>
      </Grid>
    )
  },
}

/** On a bar of its own, as it floats over a list. */
export const Attached: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={260}>
        <Example title={t('ردیف', 'A row')}>
          <Formatting isAttached />
        </Example>
        <Example title={t('ستون', 'A column')}>
          <BulkActions orientation="vertical" isAttached />
        </Example>
      </Grid>
    )
  },
}

/** What it may hold: buttons, groups of buttons and toggles, a dropdown, separators. */
export const WhatItHolds: StoryObj = {
  name: 'What it holds',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={760} surface>
        <Toolbar aria-label={t('نمایش محصول‌ها', 'Product view')}>
          <ToggleButtonGroup
            aria-label={t('چیدمان', 'Layout')}
            selectionMode="single"
            disallowEmptySelection
            defaultSelectedKeys={['grid']}
          >
            <ToggleButton id="grid" isIconOnly aria-label={t('شبکه', 'Grid')}>
              <LayoutGrid />
            </ToggleButton>
            <ToggleButton id="list" isIconOnly aria-label={t('فهرست', 'List')}>
              <ToggleButtonGroup.Separator />
              <List />
            </ToggleButton>
          </ToggleButtonGroup>
          <Separator />
          <Dropdown>
            <Button variant="secondary">
              <ArrowDownUp />
              {t('مرتب‌سازی', 'Sort')}
              <ChevronDown />
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu>
                <Dropdown.Item id="new">{t('تازه‌ترین', 'Newest')}</Dropdown.Item>
                <Dropdown.Item id="cheap">{t('ارزان‌ترین', 'Cheapest')}</Dropdown.Item>
                <Dropdown.Item id="popular">{t('پرفروش‌ترین', 'Best selling')}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
          <Button variant="tertiary">{t('فیلترها', 'Filters')}</Button>
        </Toolbar>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** The admin's order list: a bar of bulk actions over the chosen rows. */
export const OverAList: StoryObj = {
  name: 'Example: over a list',
  render: function Render() {
    const t = useT()
    const rows: [string, string, ReactNode][] = [
      ['1041', t('مریم احمدی', 'Maryam Ahmadi'), t('۱٬۲۸۰٬۰۰۰ تومان', '1,280,000 toman')],
      ['1042', t('کاوه مرادی', 'Kaveh Moradi'), t('۳۲۰٬۰۰۰ تومان', '320,000 toman')],
      ['1043', t('رضا جعفری', 'Reza Jafari'), t('۹۶۰٬۰۰۰ تومان', '960,000 toman')],
    ]
    return (
      <Stage width={560} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="text-muted" style={{ fontSize: 14 }}>
              {t('۳ سفارش برگزیده', '3 orders chosen')}
            </span>
            <BulkActions isAttached />
          </div>
          {rows.map(([id, buyer, total]) => (
            <div
              key={id}
              style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 14 }}
            >
              <span className="text-foreground">{t(`سفارش ${id}`, `Order ${id}`)}</span>
              <span className="text-muted">{buyer}</span>
              <span className="text-foreground">{total}</span>
            </div>
          ))}
        </div>
      </Stage>
    )
  },
}

/** A product's description editor: the formatting bar over its words. */
export const Editor: StoryObj = {
  name: 'Example: a description editor',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={560} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Formatting />
          <div
            className="text-foreground"
            style={{
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 12,
              fontSize: 14,
              lineHeight: '22px',
              minHeight: 96,
            }}
          >
            <b>{t('چای لاهیجان', 'Lahijan tea')}</b>{' '}
            {t(
              'از باغ‌های شمال، بهاره و خوش‌رنگ.',
              'from the northern gardens, spring-picked and bright.',
            )}
          </div>
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

/** In both themes. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Formatting />
        <BulkActions isAttached />
      </div>
    </Themes>
  ),
}

/** On a Persian page and an English one: the arrows move as the page reads. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <BulkActions />
    </Directions>
  ),
}

/** On a phone: a long row is the page's to wrap or scroll. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Formatting isAttached />
    </Device>
  ),
}

/** The same toolbar as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Toolbar',
      props: { label: t('کارهای گروهی', 'Bulk actions'), isAttached: true },
      children: [
        {
          type: 'Button',
          props: { variant: 'secondary', icon: 'printer' },
          children: t('چاپ برچسب', 'Print labels'),
        },
        {
          type: 'Button',
          props: { variant: 'secondary', icon: 'truck' },
          children: t('ارسال شد', 'Mark shipped'),
        },
        { type: 'Separator' },
        {
          type: 'Button',
          props: { variant: 'danger-soft', icon: 'trash-2' },
          children: t('حذف', 'Delete'),
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
