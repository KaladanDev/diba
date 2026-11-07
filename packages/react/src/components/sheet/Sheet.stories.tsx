import type { Meta, StoryObj } from '@storybook/react-vite'
import { SlidersHorizontal } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { goods } from '../../stories/people'
import { Example, Grid, Stage, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Label } from '../label'
import { Radio } from '../radio'
import { RadioGroup } from '../radio-group'
import { Separator } from '../separator'
import { Sheet } from './index'

// The Sheet, every option it has and what it holds. The docs page is Sheet.mdx. Each story is its
// own frame in the docs, where the main ones show their sheet open: a sheet covers whatever page it
// is on. A line comment, not a doc comment: the docs plugin replaces a commented meta's parameters
// with one.
const meta = {
  title: 'Components/Overlays/Sheet',
  component: Sheet,
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, height: '600px' } },
  },
} satisfies Meta<typeof Sheet>

export default meta

type Placement = 'bottom' | 'top' | 'left' | 'right'
type Backdrop = 'opaque' | 'blur' | 'transparent'

type PanelProps = {
  /** The trigger's words. */
  label: ReactNode
  title: string
  children: ReactNode
  /** The footer's buttons; none leaves it out. */
  footer?: ReactNode
  placement?: Placement
  snapPoints?: string[]
  isDetached?: boolean
  isDismissable?: boolean
  backdrop?: Backdrop
  closeButton?: boolean
  defaultOpen?: boolean
  trigger?: 'primary' | 'secondary' | 'tertiary'
}

/**
 * A sheet as a shop opens one: a handle on its inner edge when it comes from the bottom or the top,
 * the close button in its corner, the heading, the body and the footer's buttons at the end.
 */
function Panel({
  label,
  title,
  children,
  footer,
  placement = 'bottom',
  snapPoints,
  isDetached,
  isDismissable,
  backdrop,
  closeButton = true,
  defaultOpen,
  trigger = 'secondary',
}: PanelProps) {
  const handle = placement === 'bottom' || placement === 'top' ? <Sheet.Handle /> : null
  return (
    <Sheet
      defaultOpen={defaultOpen}
      placement={placement}
      snapPoints={snapPoints}
      isDetached={isDetached}
      isDismissable={isDismissable}
    >
      <Sheet.Trigger>
        <Button variant={trigger}>{label}</Button>
      </Sheet.Trigger>
      <Sheet.Backdrop variant={backdrop}>
        <Sheet.Content>
          <Sheet.Dialog>
            {placement === 'bottom' ? handle : null}
            {closeButton ? <Sheet.CloseTrigger /> : null}
            <Sheet.Header>
              <Sheet.Heading>{title}</Sheet.Heading>
            </Sheet.Header>
            <Sheet.Body>{children}</Sheet.Body>
            {footer ? <Sheet.Footer>{footer}</Sheet.Footer> : null}
            {placement === 'top' ? handle : null}
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
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

/** The order sheet's words and buttons, which most stories open. */
function order(t: ReturnType<typeof useT>) {
  return {
    label: t('سفارش ۱۰۴۱', 'Order 1041'),
    title: t('سفارش ۱۰۴۱', 'Order 1041'),
    children: (
      <div style={column}>
        <Line name={t('خریدار', 'Buyer')} value={t('مریم احمدی', 'Maryam Ahmadi')} />
        <Line name={t('اقلام', 'Items')} value={t('۳ قلم', '3 items')} />
        <Line name={t('ارسال', 'Delivery')} value={t('تیپاکس', 'Tipax')} />
        <Separator />
        <Line name={t('جمع', 'Total')} value={t('۱٬۲۸۰٬۰۰۰ تومان', '1,280,000 toman')} />
      </div>
    ),
    footer: (
      <>
        <Sheet.Close>
          <Button variant="tertiary">{t('بستن', 'Close')}</Button>
        </Sheet.Close>
        <Sheet.Close>
          <Button>{t('چاپ برچسب', 'Print label')}</Button>
        </Sheet.Close>
      </>
    ),
  }
}

/** A long list, for a sheet that stops on its way up. */
function History() {
  const t = useT()
  return (
    <div style={column}>
      {Array.from({ length: 14 }, (_, i) => i + 1).map((n) => (
        <Line
          key={n}
          name={t(`رویداد ${n.toLocaleString('fa-IR')}`, `Event ${n}`)}
          value={t('۱۴ آبان', '5 Nov')}
        />
      ))}
    </div>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  placement: Placement
  stops: 'none' | '33%' | '50%' | '33%, 66%'
  isDetached: boolean
  isDismissable: boolean
  backdrop: Backdrop
}

/** Every option on the controls; it opens as the page does, and again from its trigger. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    placement: 'bottom',
    stops: 'none',
    isDetached: false,
    isDismissable: true,
    backdrop: 'opaque',
  },
  argTypes: {
    placement: {
      control: 'inline-radio',
      options: ['bottom', 'top', 'left', 'right'],
      description:
        'The window’s edge it comes from: left is the left, whatever the page’s direction.',
      table: { category: 'Sheet', defaultValue: { summary: 'bottom' } },
    },
    stops: {
      control: 'inline-radio',
      options: ['none', '33%', '50%', '33%, 66%'],
      description:
        'snapPoints: where it stops on its way, each a share of its height; it opens on the first, and all of it is the last.',
      table: { category: 'Sheet' },
    },
    isDetached: {
      description: 'Floats 8 from the edge, round all round.',
      table: { category: 'Sheet', defaultValue: { summary: 'false' } },
    },
    isDismissable: {
      description: 'Swiping it away, a press outside or Escape closes it.',
      table: { category: 'Sheet', defaultValue: { summary: 'true' } },
    },
    backdrop: {
      control: 'inline-radio',
      options: ['opaque', 'blur', 'transparent'],
      description: 'What is under it: dimmed, blurred, or as it is.',
      table: { category: 'Sheet.Backdrop', defaultValue: { summary: 'opaque' } },
    },
  },
  render: function Render({ stops, ...args }) {
    const t = useT()
    const said = order(t)
    return (
      <Stage>
        <Panel
          {...said}
          {...args}
          snapPoints={stops === 'none' ? undefined : stops.split(', ')}
          defaultOpen
        >
          {stops === 'none' ? said.children : <History />}
        </Panel>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Each edge of the window: the bottom, the top, the left and the right. */
export const Placements: StoryObj = {
  render: function Render() {
    const t = useT()
    const said = order(t)
    const names: Record<Placement, string> = {
      bottom: t('پایین', 'Bottom'),
      top: t('بالا', 'Top'),
      left: t('چپ', 'Left'),
      right: t('راست', 'Right'),
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

/** Stopping at a third of its height first; dragged up, it is all of it, and the page dims. */
export const SnapPoints: StoryObj = {
  name: 'Stops on the way',
  render: function Render() {
    const t = useT()
    return (
      <Stage>
        <Panel
          {...order(t)}
          title={t('تاریخچهٔ سفارش', 'Order history')}
          label={t('تاریخچه', 'History')}
          snapPoints={['33%']}
          defaultOpen
        >
          <History />
        </Panel>
      </Stage>
    )
  },
}

/** Off the edge, 8 from every side and round all round. */
export const Detached: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage>
        <Panel {...order(t)} isDetached defaultOpen />
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
              'این بند زیر برگه می‌ماند تا تفاوت پس‌زمینه‌ها دیده شود: تیره، مات یا همان‌طور که هست.',
              'This paragraph stays under the sheet so the backdrops show: dimmed, blurred, or as it is.',
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

/** A swipe toward its edge, a press outside or Escape closes it by default; or only its buttons do. */
export const Dismissing: StoryObj = {
  render: function Render() {
    const t = useT()
    const said = order(t)
    return (
      <Grid min={220}>
        <Example
          title={t('کشیدن یا فشار بیرون', 'A swipe or a press outside')}
          note={t('پیش‌فرض', 'The default')}
        >
          <div>
            <Panel {...said} label={t('باز کن', 'Open')} />
          </div>
        </Example>
        <Example title={t('فقط دکمه‌هایش', 'Only its buttons')} note="isDismissable={false}">
          <div>
            <Panel {...said} label={t('باز کن', 'Open')} isDismissable={false} />
          </div>
        </Example>
      </Grid>
    )
  },
}

/** Opened and closed by the page, which knows whether it is open; no trigger of its own. */
export const Controlled: StoryObj = {
  render: function Render() {
    const t = useT()
    const said = order(t)
    const [open, setOpen] = useState(false)
    return (
      <Stage>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}
        >
          <Button variant="secondary" onPress={() => setOpen(true)}>
            {said.label}
          </Button>
          <Value label="isOpen" value={open} />
          <Sheet isOpen={open} onOpenChange={setOpen}>
            <Sheet.Backdrop>
              <Sheet.Content>
                <Sheet.Dialog>
                  <Sheet.Handle />
                  <Sheet.CloseTrigger />
                  <Sheet.Header>
                    <Sheet.Heading>{said.title}</Sheet.Heading>
                  </Sheet.Header>
                  <Sheet.Body>{said.children}</Sheet.Body>
                  <Sheet.Footer>
                    <Button onPress={() => setOpen(false)}>{t('چاپ برچسب', 'Print label')}</Button>
                  </Sheet.Footer>
                </Sheet.Dialog>
              </Sheet.Content>
            </Sheet.Backdrop>
          </Sheet>
        </div>
      </Stage>
    )
  },
}

// ---- what it holds -------------------------------------------------------------------------------

/** A storefront's size picker on a phone: a choice, and the button to the cart. */
export const ChooseSize: StoryObj = {
  name: 'Example: choose a size',
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  parameters: { docs: { story: { inline: false, height: '700px' } } },
  render: function Render() {
    const t = useT()
    const [size, setSize] = useState('M')
    return (
      <Stage>
        <Panel
          label={t('افزودن به سبد', 'Add to cart')}
          title={t(goods.scarf.fa, goods.scarf.en)}
          trigger="primary"
          defaultOpen
          footer={
            <Sheet.Close>
              <Button fullWidth>{t('افزودن به سبد', 'Add to cart')}</Button>
            </Sheet.Close>
          }
        >
          <RadioGroup value={size} onChange={setSize} orientation="horizontal">
            <Label>{t('اندازه', 'Size')}</Label>
            {['S', 'M', 'L', 'XL'].map((value) => (
              <Radio key={value} value={value}>
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Label>{value}</Label>
                </Radio.Content>
              </Radio>
            ))}
          </RadioGroup>
        </Panel>
      </Stage>
    )
  },
}

/** A storefront's filters on a phone, stopping at half its height first. */
export const PhoneFilters: StoryObj = {
  name: 'Example: filters on a phone',
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  parameters: { docs: { story: { inline: false, height: '700px' } } },
  render: function Render() {
    const t = useT()
    const [sort, setSort] = useState('new')
    const sorts = [
      ['new', t('تازه‌ترین', 'Newest')],
      ['cheap', t('ارزان‌ترین', 'Cheapest')],
      ['dear', t('گران‌ترین', 'Dearest')],
      ['popular', t('پرفروش‌ترین', 'Best selling')],
    ] as const
    return (
      <Stage>
        <Panel
          label={
            <>
              <SlidersHorizontal />
              {t('مرتب‌سازی', 'Sort')}
            </>
          }
          title={t('مرتب‌سازی', 'Sort by')}
          snapPoints={['50%']}
          defaultOpen
        >
          <RadioGroup value={sort} onChange={setSort} aria-label={t('مرتب‌سازی', 'Sort by')}>
            {sorts.map(([value, name]) => (
              <Radio key={value} value={value}>
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Label>{name}</Label>
                </Radio.Content>
              </Radio>
            ))}
          </RadioGroup>
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

/** On an English page: the close button at the right, the footer's buttons ending there. */
export const LeftToRight: StoryObj = {
  name: 'Left to right',
  globals: { locale: 'en-US', dir: 'ltr' },
  render: function Render() {
    const t = useT()
    return (
      <Stage>
        <Panel {...order(t)} defaultOpen />
      </Stage>
    )
  },
}

/** On a phone, from the bottom, where a thumb reaches it. */
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

/** The same sheet as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Sheet',
      props: { title: t('سفارش ۱۰۴۱', 'Order 1041'), placement: 'bottom' },
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
