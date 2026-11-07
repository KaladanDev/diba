import type { Meta, StoryObj } from '@storybook/react-vite'
import { Copy, Info, Pencil, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { goods } from '../../stories/people'
import { Device, Example, Grid, Stage, useT } from '../../stories/kit'
import { Button } from '../button'
import { Tooltip } from './index'

// The Tooltip, every option it has and where it is used. The docs page is Tooltip.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Overlays/Tooltip',
  component: Tooltip,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Tooltip>

export default meta

type Placement = NonNullable<React.ComponentProps<typeof Tooltip.Content>['placement']>

/** A frame tall enough for an open tooltip, which the docs page would otherwise cut. */
const frame = (height: string) => ({ docs: { story: { inline: false, height } } })

/** The words most stories' tooltips say: when delivery is free. */
const free = (t: ReturnType<typeof useT>) => ({
  label: t('ارسال رایگان', 'Free delivery'),
  says: t(
    'ارسال برای سفارش‌های بالای ۵۰۰ هزار تومان رایگان است.',
    'Delivery is free on orders over 500,000 toman.',
  ),
})

/** A button and its tooltip. */
function Tip({
  children,
  says,
  placement,
  showArrow,
  delay,
  closeDelay,
  isDisabled,
  isOpen,
  defaultOpen,
  trigger,
}: {
  children: ReactNode
  says: ReactNode
  placement?: Placement
  showArrow?: boolean
  delay?: number
  closeDelay?: number
  isDisabled?: boolean
  isOpen?: boolean
  defaultOpen?: boolean
  trigger?: 'focus'
}) {
  return (
    <Tooltip
      delay={delay}
      closeDelay={closeDelay}
      isDisabled={isDisabled}
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      trigger={trigger}
    >
      {children}
      <Tooltip.Content placement={placement} showArrow={showArrow}>
        {showArrow ? <Tooltip.Arrow /> : null}
        {says}
      </Tooltip.Content>
    </Tooltip>
  )
}

/** A centre to open from, with room on every side. */
function Centre({ children, height = 240 }: { children: ReactNode; height?: number }) {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: height, width: '100%' }}>
      {children}
    </div>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  placement: Placement
  showArrow: boolean
  delay: number
  closeDelay: number
  isDisabled: boolean
}

/** Every option on the controls; it shows as the page opens, and again under the pointer. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { placement: 'top', showArrow: false, delay: 500, closeDelay: 500, isDisabled: false },
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top',
        'bottom',
        'start',
        'end',
        'top start',
        'top end',
        'bottom start',
        'bottom end',
      ],
      description: 'A side of what it describes; it turns to the other when there is no room.',
      table: { category: 'Tooltip.Content', defaultValue: { summary: 'top' } },
    },
    showArrow: {
      description: 'An arrow toward what it describes, 7 from it instead of 3.',
      table: { category: 'Tooltip.Content', defaultValue: { summary: 'false' } },
    },
    delay: {
      control: { type: 'number', min: 0, step: 100 },
      description: 'Milliseconds under the pointer before it shows; focus shows it at once.',
      table: { category: 'Tooltip', defaultValue: { summary: '500' } },
    },
    closeDelay: {
      control: { type: 'number', min: 0, step: 100 },
      description: 'Milliseconds it stays once the pointer leaves.',
      table: { category: 'Tooltip', defaultValue: { summary: '500' } },
    },
    isDisabled: {
      description: 'It never shows.',
      table: { category: 'Tooltip', defaultValue: { summary: 'false' } },
    },
  },
  parameters: frame('280px'),
  render: function Render(args) {
    const t = useT()
    const said = free(t)
    return (
      <Centre>
        <Tip {...args} says={said.says} defaultOpen={!args.isDisabled}>
          <Button variant="secondary">{said.label}</Button>
        </Tip>
      </Centre>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Showing above its button, the overlay's paper, 12 round. */
export const Open: StoryObj = {
  parameters: frame('200px'),
  render: function Render() {
    const t = useT()
    const said = free(t)
    return (
      <Centre height={160}>
        <Tip says={said.says} defaultOpen>
          <Button variant="secondary">{said.label}</Button>
        </Tip>
      </Centre>
    )
  },
}

/** Each side of what it describes: start and end follow the page, the right being the start in Persian. */
export const Placements: StoryObj = {
  parameters: frame('320px'),
  render: function Render() {
    const t = useT()
    return (
      <Centre height={280}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: '72px 160px' }}>
          {(['top', 'bottom', 'start', 'end'] as const).map((placement) => (
            <Tip key={placement} says={t('چند کلمه', 'A few words')} placement={placement} isOpen>
              <Button variant="secondary">{placement}</Button>
            </Tip>
          ))}
        </div>
      </Centre>
    )
  },
}

/** With an arrow it sits 7 from what it describes; without, 3. */
export const Arrow: StoryObj = {
  parameters: frame('200px'),
  render: function Render() {
    const t = useT()
    const said = free(t)
    return (
      <Centre height={160}>
        <div style={{ display: 'flex', gap: 160 }}>
          <Tip says={t('بی پیکان', 'No arrow')} isOpen>
            <Button variant="secondary">{said.label}</Button>
          </Tip>
          <Tip says={t('با پیکان', 'With an arrow')} showArrow isOpen>
            <Button variant="secondary">{said.label}</Button>
          </Tip>
        </div>
      </Centre>
    )
  },
}

/** Up to 320 across, its words wrapping between words, never inside one. */
export const LongWords: StoryObj = {
  name: 'Long words',
  parameters: frame('240px'),
  render: function Render() {
    const t = useT()
    return (
      <Centre height={200}>
        <Tip
          says={t(
            'سفارش‌هایی که تا ساعت ۱۴ پرداخت شوند همان روز ارسال می‌شوند؛ سفارش‌های پس از آن، روز کاری بعد.',
            'Orders paid by 2 pm are sent the same day; orders after that, on the next working day.',
          )}
          defaultOpen
        >
          <Button variant="secondary">{t('زمان ارسال', 'When it ships')}</Button>
        </Tip>
      </Centre>
    )
  },
}

/** How long the pointer rests before it shows: at once, the default half second, or 1.5. */
export const Delay: StoryObj = {
  render: function Render() {
    const t = useT()
    const said = free(t)
    return (
      <Grid min={180}>
        {([0, 500, 1500] as const).map((delay) => (
          <Example
            key={delay}
            title={`${delay.toLocaleString(t('fa-IR', 'en-US'))} ${t('میلی‌ثانیه', 'ms')}`}
            note={delay === 500 ? t('پیش‌فرض', 'The default') : `delay={${delay}}`}
          >
            <div>
              <Tip says={said.says} delay={delay}>
                <Button variant="secondary">{t('بگذار روی من', 'Rest on me')}</Button>
              </Tip>
            </div>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** What it may describe: a button as it is; anything else inside Tooltip.Trigger, which the keyboard reaches. */
export const Triggers: StoryObj = {
  render: function Render() {
    const t = useT()
    const scarf = goods.scarf
    return (
      <Grid min={200}>
        <Example title={t('دکمهٔ آیکون', 'An icon button')} note={t('خودش', 'As it is')}>
          <div>
            <Tip says={t('ویرایش', 'Edit')}>
              <Button isIconOnly variant="tertiary" aria-label={t('ویرایش', 'Edit')}>
                <Pencil />
              </Button>
            </Tip>
          </div>
        </Example>
        <Example title={t('یک واژه', 'A word')} note="Tooltip.Trigger">
          <div>
            <Tip says={t('مالیات بر ارزش افزوده، ۱۰٪', 'Value added tax, 10%')}>
              <Tooltip.Trigger>
                <span
                  className="text-foreground"
                  style={{ textDecoration: 'underline dotted', textUnderlineOffset: 4 }}
                >
                  {t('ارزش افزوده', 'VAT')}
                </span>
              </Tooltip.Trigger>
            </Tip>
          </div>
        </Example>
        <Example title={t('یک تصویر', 'A picture')} note="Tooltip.Trigger">
          <div>
            <Tip says={t(scarf.fa, scarf.en)}>
              <Tooltip.Trigger aria-label={t(scarf.fa, scarf.en)}>
                <img
                  src={scarf.photo}
                  alt=""
                  width={48}
                  height={48}
                  style={{ display: 'block', borderRadius: 12 }}
                />
              </Tooltip.Trigger>
            </Tip>
          </div>
        </Example>
      </Grid>
    )
  },
}

/** Only on the keyboard's focus, or never. */
export const FocusAndDisabled: StoryObj = {
  name: 'Focus only, or off',
  render: function Render() {
    const t = useT()
    const said = free(t)
    return (
      <Grid min={200}>
        <Example title={t('فقط با فوکوس', 'On focus only')} note='trigger="focus"'>
          <div>
            <Tip says={said.says} trigger="focus">
              <Button variant="secondary">{said.label}</Button>
            </Tip>
          </div>
        </Example>
        <Example title={t('خاموش', 'Off')} note="isDisabled">
          <div>
            <Tip says={said.says} isDisabled>
              <Button variant="secondary">{said.label}</Button>
            </Tip>
          </div>
        </Example>
      </Grid>
    )
  },
}

// ---- where it is used ----------------------------------------------------------------------------

/** A product row's icon buttons, each named by its tooltip as well as to a screen reader. */
export const RowActions: StoryObj = {
  name: 'Example: a row’s icon buttons',
  parameters: frame('200px'),
  render: function Render() {
    const t = useT()
    const actions = [
      ['edit', <Pencil key="i" />, t('ویرایش', 'Edit')],
      ['duplicate', <Copy key="i" />, t('رونوشت', 'Duplicate')],
      ['delete', <Trash2 key="i" />, t('حذف', 'Delete')],
    ] as const
    return (
      <Stage>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBlockStart: 48,
          }}
        >
          <span className="text-foreground">{t(goods.tea.fa, goods.tea.en)}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {actions.map(([id, icon, name]) => (
              <Tip key={id} says={name} defaultOpen={id === 'duplicate'}>
                <Button isIconOnly size="sm" variant="tertiary" aria-label={name}>
                  {icon}
                </Button>
              </Tip>
            ))}
          </div>
        </div>
      </Stage>
    )
  },
}

/** A storefront's product page: free delivery explained beside the price. */
export const FreeDelivery: StoryObj = {
  name: 'Example: free delivery',
  parameters: frame('220px'),
  render: function Render() {
    const t = useT()
    const said = free(t)
    return (
      <Stage>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBlockStart: 72 }}>
          <span className="text-foreground" style={{ fontWeight: 600 }}>
            {t('۳۲۰٬۰۰۰ تومان', '320,000 toman')}
          </span>
          <Tip says={said.says} showArrow defaultOpen>
            <Tooltip.Trigger aria-label={said.label}>
              <span
                className="text-success"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12 }}
              >
                {said.label}
                <Info size={14} aria-hidden />
              </span>
            </Tooltip.Trigger>
          </Tip>
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

/** Showing in the dark theme. */
export const Dark: StoryObj = {
  globals: { theme: 'dark' },
  parameters: frame('200px'),
  render: function Render() {
    const t = useT()
    const said = free(t)
    return (
      <Centre height={160}>
        <Tip says={said.says} showArrow defaultOpen>
          <Button variant="secondary">{said.label}</Button>
        </Tip>
      </Centre>
    )
  },
}

/** Showing on an English page. */
export const LeftToRight: StoryObj = {
  name: 'Left to right',
  globals: { locale: 'en-US', dir: 'ltr' },
  parameters: frame('200px'),
  render: function Render() {
    const t = useT()
    const said = free(t)
    return (
      <Centre height={160}>
        <Tip says={said.says} placement="end" defaultOpen>
          <Button variant="secondary">{said.label}</Button>
        </Tip>
      </Centre>
    )
  },
}

/** On a phone, where a finger has no pointer to rest: it shows on the keyboard's focus. */
export const OnAPhone: StoryObj = {
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  parameters: frame('320px'),
  render: function Render() {
    const t = useT()
    const said = free(t)
    return (
      <Device>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBlockStart: 80 }}>
          <Tip says={said.says} defaultOpen>
            <Button variant="secondary">{said.label}</Button>
          </Tip>
        </div>
      </Device>
    )
  },
}

/** The same tooltip as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const said = free(t)
    const tree = {
      type: 'Tooltip',
      props: { content: said.says, placement: 'top' },
      children: [{ type: 'Button', props: { variant: 'secondary' }, children: said.label }],
    }
    return (
      <Grid min={320}>
        <Example
          title={t('آنچه کشیده می‌شود', 'What is drawn')}
          note={t(
            'در وب و در Flutter: نشانگر را رویش نگه دارید',
            'On the web and in Flutter: rest the pointer on it',
          )}
        >
          <div style={{ paddingBlockStart: 48 }}>
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
