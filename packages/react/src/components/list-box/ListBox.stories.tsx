import type { Meta, StoryObj } from '@storybook/react-vite'
import { Copy, Download, Pencil, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { Selection } from 'react-aria-components'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Description } from '../description'
import { Header } from '../header'
import { Label } from '../label'
import { ListBox } from './index'

// The ListBox, every option it has and what it is built into. The docs page is ListBox.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta: Meta = {
  title: 'Components/Collections/ListBox',
  component: ListBox,
  parameters: { layout: 'fullscreen' },
}

export default meta

/** A list as wide as a side panel's column, on a card. */
function Panel({ children, width = 300 }: { children: ReactNode; width?: number }) {
  return (
    <Stage width={width} surface>
      {children}
    </Stage>
  )
}

const COLUMNS = [
  { id: 'name', fa: 'نام محصول', en: 'Product name' },
  { id: 'price', fa: 'قیمت', en: 'Price' },
  { id: 'stock', fa: 'موجودی', en: 'Stock' },
  { id: 'sku', fa: 'کد کالا', en: 'SKU' },
  { id: 'sales', fa: 'فروش ماه', en: 'Sales this month' },
]

const keys = (selection: Selection) => (selection === 'all' ? ['all'] : [...selection].map(String))

/** The columns an export may hold, each an option. */
function Columns({ choice = true }: { choice?: boolean }) {
  const t = useT()
  return COLUMNS.map((c) => (
    <ListBox.Item key={c.id} id={c.id} textValue={t(c.fa, c.en)}>
      {choice ? <ListBox.ItemIndicator kind="choice" /> : null}
      {t(c.fa, c.en)}
    </ListBox.Item>
  ))
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = { selectionMode: 'none' | 'single' | 'multiple'; marked: boolean }

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { selectionMode: 'multiple', marked: true },
  argTypes: {
    selectionMode: {
      control: 'inline-radio',
      options: ['none', 'single', 'multiple'],
      description: 'Nothing chosen, an action each; one; or several.',
      table: { category: 'ListBox', defaultValue: { summary: 'none' } },
    },
    marked: {
      description:
        'A ListBox.ItemIndicator kind="choice" at each option’s start: a radio or a checkbox.',
      table: { category: 'Example' },
    },
  },
  render: function Render(args) {
    const t = useT()
    const [selected, setSelected] = useState<Selection>(new Set(['name', 'price']))
    const [pressed, setPressed] = useState<string | null>(null)
    return (
      <Panel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ListBox
            aria-label={t('ستون‌های خروجی', 'Columns to export')}
            selectionMode={args.selectionMode}
            selectedKeys={selected}
            onSelectionChange={setSelected}
            onAction={(key) => setPressed(String(key))}
          >
            <Columns choice={args.marked && args.selectionMode !== 'none'} />
          </ListBox>
          <Value label="selectedKeys" value={keys(selected)} />
          <Value label="onAction" value={pressed} />
        </div>
      </Panel>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** One choice marked with a radio, several with checkboxes, at each option's start. */
export const Choices: StoryObj = {
  name: 'One choice and several',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={260}>
        <Example title={t('یکی', 'One')} note='selectionMode="single"'>
          <ListBox
            aria-label={t('مرتب‌سازی', 'Sort by')}
            selectionMode="single"
            defaultSelectedKeys={['price']}
          >
            <Columns />
          </ListBox>
        </Example>
        <Example title={t('چندتا', 'Several')} note='selectionMode="multiple"'>
          <ListBox
            aria-label={t('ستون‌های خروجی', 'Columns to export')}
            selectionMode="multiple"
            defaultSelectedKeys={['name', 'stock']}
          >
            <Columns />
          </ListBox>
        </Example>
      </Grid>
    )
  },
}

/** Actions, chosen nothing: an icon each, a second line, and a dangerous one last. */
export const Actions: StoryObj = {
  render: function Render() {
    const t = useT()
    const [pressed, setPressed] = useState<string | null>(null)
    return (
      <Panel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ListBox
            aria-label={t('کارهای محصول', 'Product actions')}
            onAction={(key) => setPressed(String(key))}
          >
            <ListBox.Item id="edit" textValue={t('ویرایش', 'Edit')}>
              <Pencil />
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <Label>{t('ویرایش', 'Edit')}</Label>
                <Description>{t('نام، قیمت و عکس‌ها', 'Name, price and photos')}</Description>
              </span>
            </ListBox.Item>
            <ListBox.Item id="duplicate" textValue={t('رونوشت', 'Duplicate')}>
              <Copy />
              <Label>{t('رونوشت', 'Duplicate')}</Label>
            </ListBox.Item>
            <ListBox.Item id="export" textValue={t('خروجی', 'Export')}>
              <Download />
              <Label>{t('خروجی', 'Export')}</Label>
            </ListBox.Item>
            <ListBox.Item id="delete" textValue={t('حذف', 'Delete')} variant="danger">
              <Trash2 />
              <Label>{t('حذف', 'Delete')}</Label>
            </ListBox.Item>
          </ListBox>
          <Value label="onAction" value={pressed} />
        </div>
      </Panel>
    )
  },
}

/** Titled groups, and an option that cannot be chosen. */
export const Sections: StoryObj = {
  name: 'Sections and disabled options',
  render: function Render() {
    const t = useT()
    return (
      <Panel>
        <ListBox
          aria-label={t('ستون‌های خروجی', 'Columns to export')}
          selectionMode="multiple"
          defaultSelectedKeys={['name']}
          disabledKeys={['sales']}
        >
          <ListBox.Section>
            <Header>{t('محصول', 'Product')}</Header>
            {COLUMNS.slice(0, 2).map((c) => (
              <ListBox.Item key={c.id} id={c.id} textValue={t(c.fa, c.en)}>
                <ListBox.ItemIndicator kind="choice" />
                {t(c.fa, c.en)}
              </ListBox.Item>
            ))}
          </ListBox.Section>
          <ListBox.Section>
            <Header>{t('انبار و فروش', 'Stock and sales')}</Header>
            {COLUMNS.slice(2).map((c) => (
              <ListBox.Item key={c.id} id={c.id} textValue={t(c.fa, c.en)}>
                <ListBox.ItemIndicator kind="choice" />
                {t(c.fa, c.en)}
              </ListBox.Item>
            ))}
          </ListBox.Section>
        </ListBox>
      </Panel>
    )
  },
}

/** A list with nothing in it says so. */
export const Empty: StoryObj = {
  name: 'Nothing in it',
  render: function Render() {
    const t = useT()
    return (
      <Panel>
        <ListBox
          aria-label={t('فیلترهای ذخیره‌شده', 'Saved filters')}
          renderEmptyState={() => (
            <div className="text-muted" style={{ padding: '8px 12px', fontSize: 14 }}>
              {t('هنوز فیلتری ذخیره نشده.', 'No saved filters yet.')}
            </div>
          )}
        >
          {[]}
        </ListBox>
      </Panel>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** An export's columns, chosen in a side panel, with a count of them. */
export const ExportColumns: StoryObj = {
  name: 'Example: an export’s columns',
  render: function Render() {
    const t = useT()
    const [selected, setSelected] = useState<Selection>(new Set(['name', 'price', 'stock']))
    const count = selected === 'all' ? COLUMNS.length : selected.size
    return (
      <Panel width={320}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span className="text-foreground" style={{ fontSize: 16, fontWeight: 600 }}>
            {t('ستون‌های خروجی', 'Columns to export')}
          </span>
          <ListBox
            aria-label={t('ستون‌های خروجی', 'Columns to export')}
            selectionMode="multiple"
            selectedKeys={selected}
            onSelectionChange={setSelected}
          >
            <Columns />
          </ListBox>
          <span className="text-muted" style={{ fontSize: 12 }}>
            {t(`${new Intl.NumberFormat('fa-IR').format(count)} ستون`, `${count} columns`)}
          </span>
        </div>
      </Panel>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <div style={{ width: 280, maxWidth: '100%' }}>
      <ListBox
        aria-label={t('ستون‌های خروجی', 'Columns to export')}
        selectionMode="multiple"
        defaultSelectedKeys={['name', 'stock']}
      >
        <Columns />
      </ListBox>
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

/** A Persian page and an English one: the mark at each option's start. */
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

/** The same list as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'ListBox',
      props: {
        label: t('ستون‌های خروجی', 'Columns to export'),
        selectionMode: 'multiple',
        defaultSelectedKeys: ['name', 'price'],
      },
      children: COLUMNS.slice(0, 4).map((c) => ({
        type: 'ListBoxItem',
        props: { id: c.id },
        children: t(c.fa, c.en),
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
