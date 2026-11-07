import type { Meta, StoryObj } from '@storybook/react-vite'
import { Menu, ShoppingBag, SlidersHorizontal } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { goods } from '../../stories/people'
import { Example, Grid, Stage, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Checkbox } from '../checkbox'
import { CheckboxGroup } from '../checkbox-group'
import { Label } from '../label'
import { Separator } from '../separator'
import { Drawer } from './index'

// The Drawer, every option it has and what it holds. The docs page is Drawer.mdx. Each story is
// its own frame in the docs, where the main ones show their drawer open: a drawer covers whatever
// page it is on. A line comment, not a doc comment: the docs plugin replaces a commented meta's
// parameters with one.
const meta = {
  title: 'Components/Overlays/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, height: '600px' } },
  },
} satisfies Meta<typeof Drawer>

export default meta

type Placement = 'bottom' | 'top' | 'left' | 'right'
type Backdrop = 'opaque' | 'blur' | 'transparent'

type PanelProps = {
  /** The trigger's words. */
  label: ReactNode
  title: string
  children: ReactNode
  /** The footer's buttons; none leaves it out. */
  footer?: (close: () => void) => ReactNode
  placement?: Placement
  backdrop?: Backdrop
  /** The bar a bottom drawer is dragged by. */
  handle?: boolean
  closeButton?: boolean
  isDismissable?: boolean
  isKeyboardDismissDisabled?: boolean
  defaultOpen?: boolean
  trigger?: 'primary' | 'secondary' | 'tertiary'
}

/**
 * A drawer as the admin opens one: a handle on a bottom one, the close button in its corner, the
 * heading, the body, and the footer's buttons at the end.
 */
function Panel({
  label,
  title,
  children,
  footer,
  placement = 'bottom',
  backdrop,
  handle = placement === 'bottom',
  closeButton = true,
  isDismissable,
  isKeyboardDismissDisabled,
  defaultOpen,
  trigger = 'secondary',
}: PanelProps) {
  return (
    <Drawer defaultOpen={defaultOpen}>
      <Button variant={trigger}>{label}</Button>
      <Drawer.Backdrop
        variant={backdrop}
        isDismissable={isDismissable}
        isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      >
        <Drawer.Content placement={placement}>
          <Drawer.Dialog>
            {({ close }: { close: () => void }) => (
              <>
                {handle ? <Drawer.Handle /> : null}
                {closeButton ? <Drawer.CloseTrigger /> : null}
                <Drawer.Header>
                  <Drawer.Heading>{title}</Drawer.Heading>
                </Drawer.Header>
                <Drawer.Body>{children}</Drawer.Body>
                {footer ? <Drawer.Footer>{footer(close)}</Drawer.Footer> : null}
              </>
            )}
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  )
}

/** Its blocks 16 apart, as a block's body lays them out. */
const column = { display: 'flex', flexDirection: 'column', gap: 16 } as const

/** One line of a record: what it is, and its value at the end. */
function Line({ name, value }: { name: string; value: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
      <span>{name}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}

/** An order's details, the record most stories open. */
function OrderDetails() {
  const t = useT()
  return (
    <div style={column}>
      <Line name={t('خریدار', 'Buyer')} value={t('مریم احمدی', 'Maryam Ahmadi')} />
      <Line name={t('اقلام', 'Items')} value={t('۳ قلم', '3 items')} />
      <Line name={t('ارسال', 'Delivery')} value={t('تیپاکس', 'Tipax')} />
      <Line name={t('پرداخت', 'Paid')} value={t('۱۴ آبان، ۱۸:۲۰', '5 Nov, 18:20')} />
      <Separator />
      <Line name={t('جمع', 'Total')} value={t('۱٬۲۸۰٬۰۰۰ تومان', '1,280,000 toman')} />
    </div>
  )
}

/** The order drawer's words and buttons. */
function order(t: ReturnType<typeof useT>) {
  return {
    label: t('سفارش ۱۰۴۱', 'Order 1041'),
    title: t('سفارش ۱۰۴۱', 'Order 1041'),
    children: <OrderDetails />,
    footer: (close: () => void) => (
      <>
        <Button variant="tertiary" onPress={close}>
          {t('بستن', 'Close')}
        </Button>
        <Button onPress={close}>{t('چاپ برچسب', 'Print label')}</Button>
      </>
    ),
  }
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  placement: Placement
  backdrop: Backdrop
  isDismissable: boolean
  isKeyboardDismissDisabled: boolean
  handle: boolean
  closeButton: boolean
}

/** Every option on the controls; it opens as the page does, and again from its trigger. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    placement: 'bottom',
    backdrop: 'opaque',
    isDismissable: true,
    isKeyboardDismissDisabled: false,
    handle: true,
    closeButton: true,
  },
  argTypes: {
    placement: {
      control: 'inline-radio',
      options: ['bottom', 'top', 'left', 'right'],
      description:
        'The edge it slides in from. left and right are the page’s start and end: on a Persian page left is the right edge.',
      table: { category: 'Drawer.Content', defaultValue: { summary: 'bottom' } },
    },
    backdrop: {
      control: 'inline-radio',
      options: ['opaque', 'blur', 'transparent'],
      description: 'What is under it: dimmed, blurred, or as it is.',
      table: { category: 'Drawer.Backdrop', defaultValue: { summary: 'opaque' } },
    },
    isDismissable: {
      description: 'A press outside, or dragging it toward its edge, closes it.',
      table: { category: 'Drawer.Backdrop', defaultValue: { summary: 'true' } },
    },
    isKeyboardDismissDisabled: {
      description: 'Escape does not close it.',
      table: { category: 'Drawer.Backdrop', defaultValue: { summary: 'false' } },
    },
    handle: { description: 'Drawer.Handle on its inner edge.', table: { category: 'Example' } },
    closeButton: {
      description: 'Drawer.CloseTrigger in the corner.',
      table: { category: 'Example' },
    },
  },
  render: function Render(args) {
    const t = useT()
    return (
      <Stage>
        <Panel
          {...order(t)}
          {...args}
          handle={args.handle && args.placement === 'bottom'}
          defaultOpen
        />
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Each edge: the bottom, the top, and the page's start and end. */
export const Placements: StoryObj = {
  render: function Render() {
    const t = useT()
    const said = order(t)
    const names: Record<Placement, string> = {
      bottom: t('پایین', 'Bottom'),
      top: t('بالا', 'Top'),
      left: t('آغاز صفحه (left)', 'Page start (left)'),
      right: t('پایان صفحه (right)', 'Page end (right)'),
    }
    return (
      <Stage width={760}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(['bottom', 'top', 'left', 'right'] as const).map((placement) => (
            <Panel key={placement} {...said} label={names[placement]} placement={placement} />
          ))}
        </div>
      </Stage>
    )
  },
}

/** Opened from the page's end, as a record beside its list opens. */
export const FromTheEnd: StoryObj = {
  name: 'From the end',
  render: function Render() {
    const t = useT()
    return (
      <Stage>
        <Panel {...order(t)} placement="right" defaultOpen />
      </Stage>
    )
  },
}

/** What lies under it: the page dimmed, blurred, or as it is. */
export const Backdrops: StoryObj = {
  render: function Render() {
    const t = useT()
    const said = order(t)
    return (
      <Stage width={760}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p className="text-muted" style={{ margin: 0, fontSize: 14, lineHeight: '22px' }}>
            {t(
              'این بند زیر کشو می‌ماند تا تفاوت پس‌زمینه‌ها دیده شود: تیره، مات یا همان‌طور که هست.',
              'This paragraph stays under the drawer so the backdrops show: dimmed, blurred, or as it is.',
            )}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(['opaque', 'blur', 'transparent'] as const).map((backdrop) => (
              <Panel key={backdrop} {...said} label={backdrop} backdrop={backdrop} />
            ))}
          </div>
        </div>
      </Stage>
    )
  },
}

/** A body taller than 85% of the window scrolls between the heading and the footer. */
export const LongBody: StoryObj = {
  name: 'A long body',
  render: function Render() {
    const t = useT()
    const lines = Array.from({ length: 16 }, (_, i) => i + 1)
    return (
      <Stage>
        <Panel
          {...order(t)}
          title={t('تاریخچهٔ سفارش', 'Order history')}
          label={t('تاریخچه', 'History')}
          defaultOpen
        >
          <div style={column}>
            {lines.map((n) => (
              <Line
                key={n}
                name={t(`رویداد ${n.toLocaleString('fa-IR')}`, `Event ${n}`)}
                value={t('۱۴ آبان', '5 Nov')}
              />
            ))}
          </div>
        </Panel>
      </Stage>
    )
  },
}

/** A press outside, Escape, or dragging it toward its edge close it by default; each can be turned off. */
export const Dismissing: StoryObj = {
  render: function Render() {
    const t = useT()
    const said = order(t)
    return (
      <Grid min={220}>
        <Example
          title={t('بیرون، Escape یا کشیدن', 'Outside, Escape or a drag')}
          note={t('پیش‌فرض', 'The default')}
        >
          <div>
            <Panel {...said} label={t('باز کن', 'Open')} />
          </div>
        </Example>
        <Example
          title={t('فقط دکمه‌ها و Escape', 'Its buttons and Escape')}
          note="isDismissable={false}"
        >
          <div>
            <Panel {...said} label={t('باز کن', 'Open')} isDismissable={false} handle={false} />
          </div>
        </Example>
        <Example
          title={t('فقط دکمه‌هایش', 'Only its buttons')}
          note="isDismissable={false} isKeyboardDismissDisabled"
        >
          <div>
            <Panel
              {...said}
              label={t('باز کن', 'Open')}
              isDismissable={false}
              isKeyboardDismissDisabled
              handle={false}
            />
          </div>
        </Example>
      </Grid>
    )
  },
}

/** Opened and closed by the page, which knows whether it is open. */
export const Controlled: StoryObj = {
  render: function Render() {
    const t = useT()
    const [open, setOpen] = useState(false)
    return (
      <Stage>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}
        >
          <Button variant="secondary" onPress={() => setOpen(true)}>
            {t('سفارش ۱۰۴۱', 'Order 1041')}
          </Button>
          <Value label="isOpen" value={open} />
          <Drawer isOpen={open} onOpenChange={setOpen}>
            <Drawer.Backdrop>
              <Drawer.Content placement="right">
                <Drawer.Dialog>
                  <Drawer.CloseTrigger />
                  <Drawer.Header>
                    <Drawer.Heading>{t('سفارش ۱۰۴۱', 'Order 1041')}</Drawer.Heading>
                  </Drawer.Header>
                  <Drawer.Body>
                    <OrderDetails />
                  </Drawer.Body>
                  <Drawer.Footer>
                    <Button onPress={() => setOpen(false)}>{t('چاپ برچسب', 'Print label')}</Button>
                  </Drawer.Footer>
                </Drawer.Dialog>
              </Drawer.Content>
            </Drawer.Backdrop>
          </Drawer>
        </div>
      </Stage>
    )
  },
}

// ---- what it holds -------------------------------------------------------------------------------

/** The admin's filters for the order list, from the page's start. */
export const Filters: StoryObj = {
  name: 'Example: filters',
  render: function Render() {
    const t = useT()
    const [chosen, setChosen] = useState<string[]>(['paid'])
    const statuses = [
      ['pending', t('در انتظار پرداخت', 'Awaiting payment')],
      ['paid', t('پرداخت‌شده', 'Paid')],
      ['shipped', t('ارسال‌شده', 'Shipped')],
      ['returned', t('مرجوعی', 'Returned')],
    ] as const
    return (
      <Stage>
        <Panel
          label={
            <>
              <SlidersHorizontal />
              {t('فیلترها', 'Filters')}
            </>
          }
          title={t('فیلترها', 'Filters')}
          placement="left"
          defaultOpen
          footer={(close) => (
            <>
              <Button variant="tertiary" onPress={() => setChosen([])}>
                {t('پاک کردن', 'Clear')}
              </Button>
              <Button onPress={close}>{t('نمایش سفارش‌ها', 'Show orders')}</Button>
            </>
          )}
        >
          <CheckboxGroup value={chosen} onChange={setChosen}>
            <Label>{t('وضعیت', 'Status')}</Label>
            {statuses.map(([value, name]) => (
              <Checkbox key={value} value={value}>
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Label>{name}</Label>
                </Checkbox.Content>
              </Checkbox>
            ))}
          </CheckboxGroup>
        </Panel>
      </Stage>
    )
  },
}

/** A storefront's cart, from the page's end: its items, the total and the way to pay. */
export const Cart: StoryObj = {
  name: 'Example: a cart',
  render: function Render() {
    const t = useT()
    const items = [
      [goods.tea, t('۳۲۰٬۰۰۰ تومان', '320,000 toman'), t('۲ عدد', '2')],
      [goods.scarf, t('۹۶۰٬۰۰۰ تومان', '960,000 toman'), t('۱ عدد', '1')],
    ] as const
    return (
      <Stage>
        <Panel
          label={
            <>
              <ShoppingBag />
              {t('سبد خرید', 'Cart')}
            </>
          }
          title={t('سبد خرید', 'Your cart')}
          placement="right"
          defaultOpen
          footer={(close) => (
            <>
              <Button variant="tertiary" onPress={close}>
                {t('ادامهٔ خرید', 'Keep shopping')}
              </Button>
              <Button onPress={close}>{t('پرداخت', 'Check out')}</Button>
            </>
          )}
        >
          <div style={column}>
            {items.map(([product, price, count]) => (
              <div key={product.en} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <img
                  src={product.photo}
                  alt=""
                  width={56}
                  height={56}
                  style={{ borderRadius: 12, flexShrink: 0 }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                  <span className="text-foreground">{t(product.fa, product.en)}</span>
                  <span>{t(`تعداد: ${count}`, `Qty: ${count}`)}</span>
                </div>
                <span className="text-foreground">{price}</span>
              </div>
            ))}
            <Separator />
            <Line name={t('جمع', 'Total')} value={t('۱٬۶۰۰٬۰۰۰ تومان', '1,600,000 toman')} />
          </div>
        </Panel>
      </Stage>
    )
  },
}

/** A storefront's menu on a phone, from the page's start. */
export const StoreMenu: StoryObj = {
  name: 'Example: a shop’s menu',
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  parameters: { docs: { story: { inline: false, height: '700px' } } },
  render: function Render() {
    const t = useT()
    const links = [
      t('چای و دمنوش', 'Tea and infusions'),
      t('شال و روسری', 'Scarves'),
      t('صنایع دستی', 'Handicrafts'),
      t('درباره ما', 'About us'),
    ]
    return (
      <Stage>
        <Panel
          label={
            <>
              <Menu />
              {t('فهرست', 'Menu')}
            </>
          }
          title={t('چای‌خانهٔ آفتاب', 'Aftab Tea House')}
          placement="left"
          trigger="tertiary"
          defaultOpen
        >
          <nav style={column}>
            {links.map((link) => (
              <a
                key={link}
                href="#menu"
                className="text-foreground"
                style={{ textDecoration: 'none' }}
              >
                {link}
              </a>
            ))}
          </nav>
        </Panel>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

/** In the dark theme, whatever the toolbar says. */
export const Dark: StoryObj = {
  globals: { theme: 'dark' },
  render: function Render() {
    const t = useT()
    return (
      <Stage>
        <Panel {...order(t)} defaultOpen />
      </Stage>
    )
  },
}

/** On an English page: its start is the left, so a start drawer slides in from there. */
export const LeftToRight: StoryObj = {
  name: 'Left to right',
  globals: { locale: 'en-US', dir: 'ltr' },
  render: function Render() {
    const t = useT()
    return (
      <Stage>
        <Panel {...order(t)} placement="right" defaultOpen />
      </Stage>
    )
  },
}

/** On a phone, from the bottom, where a thumb reaches its buttons. */
export const OnAPhone: StoryObj = {
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  parameters: { docs: { story: { inline: false, height: '700px' } } },
  render: function Render() {
    const t = useT()
    return (
      <Stage>
        <Panel {...order(t)} defaultOpen />
      </Stage>
    )
  },
}

/** The same drawer as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Drawer',
      props: { title: t('سفارش ۱۰۴۱', 'Order 1041'), placement: 'end' },
      slots: {
        trigger: {
          type: 'Button',
          props: { variant: 'secondary' },
          children: t('سفارش ۱۰۴۱', 'Order 1041'),
        },
        footer: {
          type: 'Button',
          children: t('چاپ برچسب', 'Print label'),
          actions: { onPress: { do: 'close' } },
        },
      },
      children: [
        { type: 'Text', children: t('۳ قلم، ارسال با تیپاکس.', '3 items, sent by Tipax.') },
        { type: 'Text', children: t('پرداخت‌شده در ۱۴ آبان.', 'Paid on 5 Nov.') },
      ],
    }
    return (
      <Grid min={320}>
        <Example
          title={t('آنچه کشیده می‌شود', 'What is drawn')}
          note={t('در وب و در Flutter', 'On the web and in Flutter')}
        >
          <div>
            <DibaSurface tree={tree as never} />
          </div>
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
