import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChevronDown, Copy, Download, EllipsisVertical, Pencil, Share2, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { Selection } from 'react-aria-components'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Description } from '../description'
import { Header } from '../header'
import { Label } from '../label'
import { Dropdown } from './index'

// The Dropdown, every option it has and what it is built into. The docs page is Dropdown.mdx. A
// line comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta: Meta = {
  title: 'Components/Collections/Dropdown',
  component: Dropdown,
  parameters: { layout: 'fullscreen' },
}

export default meta

const keys = (selection: Selection) => (selection === 'all' ? ['all'] : [...selection].map(String))

/** A product's actions: edit, duplicate, export, share, and delete apart. */
function ProductActions({ onAction }: { onAction?: (key: string) => void }) {
  const t = useT()
  return (
    <Dropdown.Menu onAction={(key) => onAction?.(String(key))}>
      <Dropdown.Section>
        <Dropdown.Item id="edit" textValue={t('ویرایش', 'Edit')}>
          <Pencil />
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            <Label>{t('ویرایش', 'Edit')}</Label>
            <Description>{t('نام، قیمت و عکس‌ها', 'Name, price and photos')}</Description>
          </span>
        </Dropdown.Item>
        <Dropdown.Item id="duplicate" textValue={t('رونوشت', 'Duplicate')}>
          <Copy />
          <Label>{t('رونوشت', 'Duplicate')}</Label>
        </Dropdown.Item>
        <Dropdown.Item id="export" textValue={t('خروجی', 'Export')}>
          <Download />
          <Label>{t('خروجی', 'Export')}</Label>
        </Dropdown.Item>
      </Dropdown.Section>
      <Dropdown.Section>
        <Header>{t('خطرناک', 'Danger')}</Header>
        <Dropdown.Item id="delete" textValue={t('حذف', 'Delete')} variant="danger">
          <Trash2 />
          <Label>{t('حذف', 'Delete')}</Label>
        </Dropdown.Item>
      </Dropdown.Section>
    </Dropdown.Menu>
  )
}

/** The product's actions behind a button. */
function Actions({
  open,
  placement,
  children,
}: {
  open?: boolean
  placement?: React.ComponentProps<typeof Dropdown.Popover>['placement']
  children?: ReactNode
}) {
  const t = useT()
  return (
    <Dropdown defaultOpen={open}>
      <Button variant="secondary">
        {t('کارها', 'Actions')}
        <ChevronDown />
      </Button>
      <Dropdown.Popover placement={placement}>{children ?? <ProductActions />}</Dropdown.Popover>
    </Dropdown>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  selectionMode: 'none' | 'single' | 'multiple'
  placement: 'bottom start' | 'bottom end' | 'top start' | 'top end'
  isDisabled: boolean
}

/** Every option on the controls; the menu opens from the button. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { selectionMode: 'none', placement: 'bottom end', isDisabled: false },
  argTypes: {
    selectionMode: {
      control: 'inline-radio',
      options: ['none', 'single', 'multiple'],
      description: 'Actions; or one choice, or several, highlighted.',
      table: { category: 'Dropdown.Menu', defaultValue: { summary: 'none' } },
    },
    placement: {
      control: 'select',
      options: ['bottom start', 'bottom end', 'top start', 'top end'],
      description: 'Where the menu opens against the button; it flips when there is no room.',
      table: { category: 'Dropdown.Popover', defaultValue: { summary: 'bottom' } },
    },
    isDisabled: {
      description: 'On the trigger: the menu cannot be opened.',
      table: { category: 'Example' },
    },
  },
  parameters: { docs: { story: { inline: false, height: '420px' } } },
  render: function Render(args) {
    const t = useT()
    const [pressed, setPressed] = useState<string | null>(null)
    const [selected, setSelected] = useState<Selection>(new Set(['price']))
    return (
      <Stage width={480}>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}
        >
          <Dropdown>
            <Button variant="secondary" isDisabled={args.isDisabled}>
              {args.selectionMode === 'none' ? t('کارها', 'Actions') : t('ستون‌ها', 'Columns')}
              <ChevronDown />
            </Button>
            <Dropdown.Popover placement={args.placement}>
              {args.selectionMode === 'none' ? (
                <ProductActions onAction={setPressed} />
              ) : (
                <Dropdown.Menu
                  selectionMode={args.selectionMode}
                  selectedKeys={selected}
                  onSelectionChange={setSelected}
                >
                  <Dropdown.Item id="price">{t('قیمت', 'Price')}</Dropdown.Item>
                  <Dropdown.Item id="stock">{t('موجودی', 'Stock')}</Dropdown.Item>
                  <Dropdown.Item id="sales">{t('فروش', 'Sales')}</Dropdown.Item>
                </Dropdown.Menu>
              )}
            </Dropdown.Popover>
          </Dropdown>
          <Value label="onAction" value={pressed} />
          <Value label="selectedKeys" value={keys(selected)} />
        </div>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Open: the menu under its button, its end at the button's; a section, icons, a dangerous item. */
export const Open: StoryObj = {
  parameters: { docs: { story: { inline: false, height: '360px' } } },
  render: () => (
    <Stage width={480}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Actions open />
      </div>
    </Stage>
  ),
}

/** Choosing: several columns at once, each chosen one on the neutral fill, with no tick. */
export const Choosing: StoryObj = {
  name: 'Choosing',
  parameters: { docs: { story: { inline: false, height: '320px' } } },
  render: function Render() {
    const t = useT()
    const [selected, setSelected] = useState<Selection>(new Set(['price', 'stock']))
    return (
      <Stage width={480}>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}
        >
          <Dropdown defaultOpen>
            <Button variant="secondary">
              {t('ستون‌ها', 'Columns')}
              <ChevronDown />
            </Button>
            <Dropdown.Popover placement="bottom start">
              <Dropdown.Menu
                selectionMode="multiple"
                selectedKeys={selected}
                onSelectionChange={setSelected}
              >
                <Dropdown.Item id="price">{t('قیمت', 'Price')}</Dropdown.Item>
                <Dropdown.Item id="stock">{t('موجودی', 'Stock')}</Dropdown.Item>
                <Dropdown.Item id="sales">{t('فروش', 'Sales')}</Dropdown.Item>
                <Dropdown.Item id="sku">{t('کد کالا', 'SKU')}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
          <Value label="selectedKeys" value={keys(selected)} />
        </div>
      </Stage>
    )
  },
}

/** A submenu, opened from an item with a chevron toward the page's end. */
export const Submenu: StoryObj = {
  parameters: { docs: { story: { inline: false, height: '320px' } } },
  render: function Render() {
    const t = useT()
    return (
      <Stage width={520}>
        <Dropdown defaultOpen>
          <Button variant="secondary">
            {t('کارها', 'Actions')}
            <ChevronDown />
          </Button>
          <Dropdown.Popover placement="bottom start">
            <Dropdown.Menu>
              <Dropdown.Item id="edit" textValue={t('ویرایش', 'Edit')}>
                <Pencil />
                <Label>{t('ویرایش', 'Edit')}</Label>
              </Dropdown.Item>
              <Dropdown.SubmenuTrigger>
                <Dropdown.Item id="share" textValue={t('هم‌رسانی', 'Share')}>
                  <Share2 />
                  <Label>{t('هم‌رسانی', 'Share')}</Label>
                  <Dropdown.SubmenuIndicator />
                </Dropdown.Item>
                <Dropdown.Popover>
                  <Dropdown.Menu>
                    <Dropdown.Item id="link">{t('رونوشت پیوند', 'Copy the link')}</Dropdown.Item>
                    <Dropdown.Item id="telegram">{t('تلگرام', 'Telegram')}</Dropdown.Item>
                    <Dropdown.Item id="whatsapp">{t('واتس‌اپ', 'WhatsApp')}</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown.SubmenuTrigger>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </Stage>
    )
  },
}

/** A row's actions behind an icon button, named for the row. */
export const IconTrigger: StoryObj = {
  name: 'From an icon button',
  render: function Render() {
    const t = useT()
    return (
      <Example title={t('کارهای ردیف', 'A row’s actions')} note="isIconOnly + aria-label">
        <Dropdown>
          <Button
            variant="ghost"
            isIconOnly
            aria-label={t('کارهای شال ابریشم', 'Actions for Silk scarf')}
          >
            <EllipsisVertical />
          </Button>
          <Dropdown.Popover placement="bottom end">
            <ProductActions />
          </Dropdown.Popover>
        </Dropdown>
      </Example>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** An order list's rows, each with its actions at the end. */
export const OrderRows: StoryObj = {
  name: 'Example: a list’s rows',
  render: function Render() {
    const t = useT()
    const [pressed, setPressed] = useState<string | null>(null)
    const orders = [
      { id: '1240', fa: 'لیلا صادقی', en: 'Leila Sadeghi' },
      { id: '1241', fa: 'آرش کریمی', en: 'Arash Karimi' },
    ]
    return (
      <Stage width={520} surface>
        <div style={{ display: 'flex', flexDirection: 'column', padding: 8 }}>
          {orders.map((o) => (
            <div
              key={o.id}
              className="text-foreground"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 4px',
                borderBottom: '1px solid var(--separator)',
                fontSize: 14,
              }}
            >
              <span>
                {t(
                  `سفارش ${new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(Number(o.id))}`,
                  `Order ${o.id}`,
                )}{' '}
                · {t(o.fa, o.en)}
              </span>
              <Dropdown>
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  aria-label={t(`کارهای سفارش ${o.id}`, `Actions for order ${o.id}`)}
                >
                  <EllipsisVertical />
                </Button>
                <Dropdown.Popover placement="bottom end">
                  <Dropdown.Menu onAction={(key) => setPressed(`${o.id}: ${String(key)}`)}>
                    <Dropdown.Item id="open">{t('باز کردن', 'Open')}</Dropdown.Item>
                    <Dropdown.Item id="invoice">
                      {t('چاپ فاکتور', 'Print the invoice')}
                    </Dropdown.Item>
                    <Dropdown.Item id="cancel" variant="danger">
                      {t('لغو سفارش', 'Cancel the order')}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>
          ))}
          <Value label="onAction" value={pressed} />
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

/** Open in the dark theme. */
export const Dark: StoryObj = {
  name: 'Dark',
  globals: { theme: 'dark' },
  parameters: { docs: { story: { inline: false, height: '360px' } } },
  render: () => (
    <Stage width={480}>
      <Actions open placement="bottom start" />
    </Stage>
  ),
}

/** Open on an English page: the menu's start at the button's start. */
export const LeftToRight: StoryObj = {
  name: 'Left to right',
  globals: { locale: 'en-US', dir: 'ltr' },
  parameters: { docs: { story: { inline: false, height: '360px' } } },
  render: () => (
    <Stage width={480}>
      <Actions open placement="bottom start" />
    </Stage>
  ),
}

/** Closed triggers, side by side in both themes. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Actions />
    </Themes>
  ),
}

/** Closed triggers on a Persian page and an English one. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Actions />
    </Directions>
  ),
}

/** Open on a phone. */
export const OnAPhone: StoryObj = {
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  parameters: { docs: { story: { inline: false, height: '420px' } } },
  render: () => (
    <Device>
      <Actions open placement="bottom start" />
    </Device>
  ),
}

/** The same dropdown as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Dropdown',
      props: { placement: 'bottom start' },
      slots: {
        trigger: {
          type: 'Button',
          props: { variant: 'secondary' },
          children: t('کارها', 'Actions'),
        },
      },
      children: [
        {
          type: 'DropdownItem',
          props: { id: 'edit', icon: 'pencil' },
          children: t('ویرایش', 'Edit'),
        },
        {
          type: 'DropdownItem',
          props: { id: 'duplicate', icon: 'copy' },
          children: t('رونوشت', 'Duplicate'),
        },
        {
          type: 'DropdownItem',
          props: { id: 'delete', icon: 'trash-2', variant: 'danger' },
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
