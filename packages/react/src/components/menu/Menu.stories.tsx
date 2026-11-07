import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileText, Printer, StickyNote, Tag, XCircle } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { Selection } from 'react-aria-components'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Description } from '../description'
import { Header } from '../header'
import { Label } from '../label'
import { Separator } from '../separator'
import { Menu } from './index'

// The Menu, every option it has and what it is built into. The docs page is Menu.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta: Meta = {
  title: 'Components/Collections/Menu',
  component: Menu,
  parameters: { layout: 'fullscreen' },
}

export default meta

/** A side panel's column, on a card. */
function Panel({ children, width = 280 }: { children: ReactNode; width?: number }) {
  return (
    <Stage width={width} surface>
      {children}
    </Stage>
  )
}

const keys = (selection: Selection) => (selection === 'all' ? ['all'] : [...selection].map(String))

/** An order's actions, the last apart and in the danger colour. */
function OrderActions({ onAction }: { onAction?: (key: string) => void }) {
  const t = useT()
  return (
    <Menu
      aria-label={t('کارهای سفارش', 'Order actions')}
      onAction={(key) => onAction?.(String(key))}
    >
      <Menu.Item id="invoice" textValue={t('چاپ فاکتور', 'Print the invoice')}>
        <Printer />
        <Label>{t('چاپ فاکتور', 'Print the invoice')}</Label>
      </Menu.Item>
      <Menu.Item id="label" textValue={t('برچسب ارسال', 'Shipping label')}>
        <Tag />
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          <Label>{t('برچسب ارسال', 'Shipping label')}</Label>
          <Description>{t('برای پست پیشتاز', 'For express post')}</Description>
        </span>
      </Menu.Item>
      <Menu.Item id="note" textValue={t('یادداشت', 'Add a note')}>
        <StickyNote />
        <Label>{t('یادداشت', 'Add a note')}</Label>
      </Menu.Item>
      <Separator />
      <Menu.Item id="cancel" textValue={t('لغو سفارش', 'Cancel the order')} variant="danger">
        <XCircle />
        <Label>{t('لغو سفارش', 'Cancel the order')}</Label>
      </Menu.Item>
    </Menu>
  )
}

const SORTS = [
  { id: 'newest', fa: 'تازه‌ترین', en: 'Newest' },
  { id: 'cheapest', fa: 'ارزان‌ترین', en: 'Cheapest' },
  { id: 'bestselling', fa: 'پرفروش‌ترین', en: 'Best-selling' },
]

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = { selectionMode: 'none' | 'single' | 'multiple' }

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { selectionMode: 'none' },
  argTypes: {
    selectionMode: {
      control: 'inline-radio',
      options: ['none', 'single', 'multiple'],
      description: 'Actions; or one choice, or several, each marked with a tick.',
      table: { category: 'Menu', defaultValue: { summary: 'none' } },
    },
  },
  render: function Render(args) {
    const t = useT()
    const [pressed, setPressed] = useState<string | null>(null)
    const [selected, setSelected] = useState<Selection>(new Set(['newest']))
    return (
      <Panel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {args.selectionMode === 'none' ? (
            <OrderActions onAction={setPressed} />
          ) : (
            <Menu
              aria-label={t('ترتیب', 'Sort by')}
              selectionMode={args.selectionMode}
              selectedKeys={selected}
              onSelectionChange={setSelected}
            >
              {SORTS.map((s) => (
                <Menu.Item key={s.id} id={s.id} textValue={t(s.fa, s.en)}>
                  <Menu.ItemIndicator />
                  <Label>{t(s.fa, s.en)}</Label>
                </Menu.Item>
              ))}
            </Menu>
          )}
          <Value label="onAction" value={pressed} />
          <Value label="selectedKeys" value={keys(selected)} />
        </div>
      </Panel>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Actions with an icon each, a second line, a separator, and a dangerous one last. */
export const Actions: StoryObj = {
  render: () => (
    <Panel>
      <OrderActions />
    </Panel>
  ),
}

/** Titled groups, and an item that cannot be pressed. */
export const Sections: StoryObj = {
  name: 'Sections and disabled items',
  render: function Render() {
    const t = useT()
    return (
      <Panel>
        <Menu aria-label={t('کارهای محصول', 'Product actions')} disabledKeys={['archive']}>
          <Menu.Section>
            <Header>{t('ویرایش', 'Editing')}</Header>
            <Menu.Item id="edit">{t('ویرایش', 'Edit')}</Menu.Item>
            <Menu.Item id="copy">{t('رونوشت', 'Duplicate')}</Menu.Item>
          </Menu.Section>
          <Menu.Section>
            <Header>{t('انبار', 'Stock')}</Header>
            <Menu.Item id="stock">{t('موجودی', 'Adjust the stock')}</Menu.Item>
            <Menu.Item id="archive">{t('بایگانی', 'Archive')}</Menu.Item>
          </Menu.Section>
        </Menu>
      </Panel>
    )
  },
}

/** A choice, marked with a tick at the item's start. */
export const Choice: StoryObj = {
  name: 'A choice',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={240}>
        <Example title={t('یکی', 'One')} note='selectionMode="single"'>
          <Menu
            aria-label={t('ترتیب', 'Sort by')}
            selectionMode="single"
            defaultSelectedKeys={['newest']}
          >
            {SORTS.map((s) => (
              <Menu.Item key={s.id} id={s.id} textValue={t(s.fa, s.en)}>
                <Menu.ItemIndicator />
                <Label>{t(s.fa, s.en)}</Label>
              </Menu.Item>
            ))}
          </Menu>
        </Example>
        <Example title={t('چندتا', 'Several')} note='selectionMode="multiple"'>
          <Menu
            aria-label={t('نمایش', 'Show')}
            selectionMode="multiple"
            defaultSelectedKeys={['photos', 'prices']}
          >
            <Menu.Item id="photos" textValue={t('عکس‌ها', 'Photos')}>
              <Menu.ItemIndicator />
              <Label>{t('عکس‌ها', 'Photos')}</Label>
            </Menu.Item>
            <Menu.Item id="prices" textValue={t('قیمت‌ها', 'Prices')}>
              <Menu.ItemIndicator />
              <Label>{t('قیمت‌ها', 'Prices')}</Label>
            </Menu.Item>
            <Menu.Item id="stock" textValue={t('موجودی', 'Stock')}>
              <Menu.ItemIndicator />
              <Label>{t('موجودی', 'Stock')}</Label>
            </Menu.Item>
          </Menu>
        </Example>
      </Grid>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** An order page's side panel: its actions, always in sight. */
export const OrderPanel: StoryObj = {
  name: 'Example: an order’s side panel',
  render: function Render() {
    const t = useT()
    const [pressed, setPressed] = useState<string | null>(null)
    return (
      <Stage width={320} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}>
          <span
            className="text-foreground"
            style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 16, fontWeight: 600 }}
          >
            <FileText size={18} />
            {t('سفارش ۱۲۴۰', 'Order 1240')}
          </span>
          <OrderActions onAction={setPressed} />
          <Value label="onAction" value={pressed} />
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  return (
    <div style={{ width: 260, maxWidth: '100%' }}>
      <OrderActions />
    </div>
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

/** A Persian page and an English one: the icon at each item's start. */
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

/** The same menu as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Menu',
      props: { label: t('کارهای سفارش', 'Order actions') },
      children: [
        {
          type: 'DropdownItem',
          props: { id: 'invoice' },
          children: t('چاپ فاکتور', 'Print the invoice'),
        },
        { type: 'DropdownItem', props: { id: 'note' }, children: t('یادداشت', 'Add a note') },
        {
          type: 'DropdownItem',
          props: { id: 'cancel', variant: 'danger' },
          children: t('لغو سفارش', 'Cancel the order'),
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
