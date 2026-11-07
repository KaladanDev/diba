import type { Meta, StoryObj } from '@storybook/react-vite'
import { CircleHelp, Link2, Share2, Truck } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { goods } from '../../stories/people'
import { Device, Example, Grid, Stage, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Input } from '../input'
import { Label } from '../label'
import { NumberField } from '../number-field'
import { TextField } from '../textfield'
import { Popover } from './index'

// The Popover, every option it has and what it holds. The docs page is Popover.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Overlays/Popover',
  component: Popover,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Popover>

export default meta

type Placement = NonNullable<React.ComponentProps<typeof Popover.Content>['placement']>

/** A frame tall enough for an open popover, which the docs page would otherwise cut. */
const frame = (height: string) => ({ docs: { story: { inline: false, height } } })

/** The words most stories' popovers hold: what the platform's fee is. */
function fee(t: ReturnType<typeof useT>) {
  return {
    label: t('کارمزد', 'Fee'),
    heading: t('کارمزد چیست؟', 'What is the fee?'),
    body: t(
      '۲٪ از هر سفارش، پس از تسویه. سفارش لغوشده کارمزد ندارد.',
      '2% of each order, after settlement. A cancelled order has none.',
    ),
  }
}

/** A help button and its popover: a heading and a line, as the admin explains a term. */
function Help({
  placement,
  showArrow,
  offset,
  isNonModal,
  defaultOpen,
  label,
  children,
}: {
  placement?: Placement
  showArrow?: boolean
  offset?: number
  isNonModal?: boolean
  defaultOpen?: boolean
  label?: string
  children?: ReactNode
}) {
  const t = useT()
  const said = fee(t)
  return (
    <Popover defaultOpen={defaultOpen}>
      <Button variant="ghost">
        <CircleHelp />
        {label ?? said.label}
      </Button>
      <Popover.Content placement={placement} offset={offset} isNonModal={isNonModal}>
        <Popover.Dialog style={{ maxWidth: 280 }}>
          {showArrow ? <Popover.Arrow /> : null}
          {children ?? (
            <>
              <Popover.Heading>{said.heading}</Popover.Heading>
              <p className="text-muted" style={{ margin: '4px 0 0' }}>
                {said.body}
              </p>
            </>
          )}
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  )
}

/** A centre to open from, with room on every side. */
function Centre({ children, height = 360 }: { children: ReactNode; height?: number }) {
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
  offset: number
  isNonModal: boolean
}

/** Every option on the controls; it opens as the page does, and again from its button. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { placement: 'bottom', showArrow: false, offset: 8, isNonModal: false },
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top',
        'top start',
        'top end',
        'bottom',
        'bottom start',
        'bottom end',
        'start',
        'start top',
        'start bottom',
        'end',
        'end top',
        'end bottom',
      ],
      description:
        'A side of the trigger, then where along it. Start and end follow the page’s direction.',
      table: { category: 'Popover.Content', defaultValue: { summary: 'bottom' } },
    },
    offset: {
      control: { type: 'number', min: 0, max: 32 },
      description: 'The gap to the trigger.',
      table: { category: 'Popover.Content', defaultValue: { summary: '8' } },
    },
    isNonModal: {
      description: 'Leaves the page usable while open: a hint, not a task.',
      table: { category: 'Popover.Content', defaultValue: { summary: 'false' } },
    },
    showArrow: {
      description: 'Popover.Arrow, pointing at the trigger.',
      table: { category: 'Example' },
    },
  },
  parameters: frame('420px'),
  render: (args) => (
    <Centre>
      <Help {...args} defaultOpen />
    </Centre>
  ),
}

// ---- its options ---------------------------------------------------------------------------------

/** Open under its trigger, with the arrow pointing at it. */
export const Open: StoryObj = {
  parameters: frame('320px'),
  render: () => (
    <Centre height={240}>
      <Help showArrow defaultOpen />
    </Centre>
  ),
}

/** Each side of its trigger: start and end follow the page, the right being the start in Persian. */
export const Placements: StoryObj = {
  parameters: frame('420px'),
  render: function Render() {
    const sides = ['top', 'bottom', 'start', 'end'] as const
    return (
      <Centre>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: 16 }}>
          {sides.map((side) => (
            <Help key={side} label={side} placement={side} showArrow />
          ))}
        </div>
      </Centre>
    )
  },
}

/** Where along a side: at the trigger's start, its middle, or its end. */
export const Alignment: StoryObj = {
  parameters: frame('360px'),
  render: function Render() {
    const t = useT()
    return (
      <Stage width={760}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBlockEnd: 200 }}>
          {(['bottom start', 'bottom', 'bottom end'] as const).map((placement) => (
            <Help key={placement} label={placement} placement={placement}>
              <p style={{ margin: 0 }}>
                {t('یک خط، برای دیدن جایش.', 'A line, to see where it sits.')}
              </p>
            </Help>
          ))}
        </div>
      </Stage>
    )
  },
}

/** With an arrow, the gap to its trigger is the arrow's; without, 8. */
export const Arrow: StoryObj = {
  parameters: frame('320px'),
  render: function Render() {
    const t = useT()
    return (
      <Grid min={220}>
        <Example title={t('بی پیکان', 'No arrow')} note={t('پیش‌فرض', 'The default')}>
          <Help />
        </Example>
        <Example title={t('با پیکان', 'With an arrow')} note="<Popover.Arrow />">
          <Help showArrow />
        </Example>
      </Grid>
    )
  },
}

/** A hint that leaves the page usable, beside a popover that holds the focus until it closes. */
export const NonModal: StoryObj = {
  name: 'Non-modal',
  parameters: frame('320px'),
  render: function Render() {
    const t = useT()
    return (
      <Grid min={220}>
        <Example
          title={t('تا بسته شود', 'Until it closes')}
          note={t('پیش‌فرض: بیرونش را می‌پوشاند', 'The default: it covers what is outside')}
        >
          <Help />
        </Example>
        <Example title={t('صفحه در دسترس', 'The page stays usable')} note="isNonModal">
          <Help isNonModal />
        </Example>
      </Grid>
    )
  },
}

/** Opened and closed by the page, which knows whether it is open. */
export const Controlled: StoryObj = {
  parameters: frame('320px'),
  render: function Render() {
    const t = useT()
    const said = fee(t)
    const [open, setOpen] = useState(false)
    return (
      <Stage>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}
        >
          <Popover isOpen={open} onOpenChange={setOpen}>
            <Button variant="ghost">
              <CircleHelp />
              {said.label}
            </Button>
            <Popover.Content placement="bottom start">
              <Popover.Dialog style={{ maxWidth: 280 }}>
                <Popover.Heading>{said.heading}</Popover.Heading>
                <p className="text-muted" style={{ margin: '4px 0 0' }}>
                  {said.body}
                </p>
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
          <Value label="isOpen" value={open} />
        </div>
      </Stage>
    )
  },
}

/** Opened from something that is not a button: Popover.Trigger makes it one. */
export const CustomTrigger: StoryObj = {
  name: 'From any element',
  parameters: frame('320px'),
  render: function Render() {
    const t = useT()
    return (
      <Stage>
        <Popover>
          <Popover.Trigger>
            <span
              className="text-foreground"
              style={{ textDecoration: 'underline dotted', textUnderlineOffset: 4 }}
            >
              {t('تسویه', 'Settlement')}
            </span>
          </Popover.Trigger>
          <Popover.Content placement="bottom start">
            <Popover.Dialog style={{ maxWidth: 280 }}>
              <p style={{ margin: 0 }}>
                {t(
                  'پرداخت فروش هر هفته به حساب شما، سه‌شنبه‌ها.',
                  'Your sales paid into your account each week, on Tuesdays.',
                )}
              </p>
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      </Stage>
    )
  },
}

// ---- what it holds -------------------------------------------------------------------------------

/** Editing a product's stock where it is listed, without leaving the list. */
export const QuickEdit: StoryObj = {
  name: 'Example: edit stock in place',
  parameters: frame('360px'),
  render: function Render() {
    const t = useT()
    const [stock, setStock] = useState(12)
    const [draft, setDraft] = useState(stock)
    const [open, setOpen] = useState(false)
    const close = () => setOpen(false)
    return (
      <Stage>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="text-foreground">{t(goods.scarf.fa, goods.scarf.en)}</span>
          <Popover
            isOpen={open}
            onOpenChange={(next) => {
              if (next) setDraft(stock)
              setOpen(next)
            }}
          >
            <Button variant="secondary" size="sm">
              {t(`${stock.toLocaleString('fa-IR')} عدد`, `${stock} in stock`)}
            </Button>
            <Popover.Content placement="bottom start">
              <Popover.Dialog>
                <form
                  style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 220 }}
                  onSubmit={(event) => {
                    event.preventDefault()
                    setStock(draft)
                    close()
                  }}
                >
                  <Popover.Heading>{t('موجودی', 'Stock')}</Popover.Heading>
                  <NumberField
                    aria-label={t('موجودی', 'Stock')}
                    value={draft}
                    onChange={setDraft}
                    minValue={0}
                    autoFocus
                  >
                    <NumberField.Group>
                      <NumberField.DecrementButton />
                      <NumberField.Input />
                      <NumberField.IncrementButton />
                    </NumberField.Group>
                  </NumberField>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button variant="tertiary" size="sm" onPress={close}>
                      {t('انصراف', 'Cancel')}
                    </Button>
                    <Button type="submit" size="sm">
                      {t('ذخیره', 'Save')}
                    </Button>
                  </div>
                </form>
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
        </div>
      </Stage>
    )
  },
}

/** A storefront's delivery estimate: a city in, a day out. */
export const DeliveryEstimate: StoryObj = {
  name: 'Example: when it arrives',
  parameters: frame('360px'),
  render: function Render() {
    const t = useT()
    const [city, setCity] = useState(t('تهران', 'Tehran'))
    const near = city.trim() === t('تهران', 'Tehran')
    return (
      <Stage>
        <Popover defaultOpen>
          <Button variant="tertiary">
            <Truck />
            {t('کی می‌رسد؟', 'When does it arrive?')}
          </Button>
          <Popover.Content placement="bottom start">
            <Popover.Dialog style={{ width: 260 }}>
              <Popover.Arrow />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <TextField value={city} onChange={setCity}>
                  <Label>{t('شهر شما', 'Your city')}</Label>
                  <Input />
                </TextField>
                <p className="text-muted" style={{ margin: 0 }}>
                  {near
                    ? t('فردا، با پیک فروشگاه.', 'Tomorrow, by the shop’s courier.')
                    : t('۲ تا ۵ روز کاری، با پست.', 'In 2 to 5 working days, by post.')}
                </p>
              </div>
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      </Stage>
    )
  },
}

/** Sharing a product: its link to copy, and where else to send it. */
export const ShareProduct: StoryObj = {
  name: 'Example: share a product',
  parameters: frame('320px'),
  render: function Render() {
    const t = useT()
    const [copied, setCopied] = useState(false)
    return (
      <Stage>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="text-foreground" style={{ fontWeight: 600 }}>
            {t(goods.tea.fa, goods.tea.en)}
          </span>
          <Popover defaultOpen onOpenChange={() => setCopied(false)}>
            <Button variant="secondary" isIconOnly aria-label={t('هم‌رسانی', 'Share')}>
              <Share2 />
            </Button>
            <Popover.Content placement="bottom start">
              <Popover.Dialog>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Popover.Heading>{t('هم‌رسانی', 'Share')}</Popover.Heading>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <code dir="ltr" className="text-muted" style={{ fontSize: 12 }}>
                      aftab.kaladan.shop/p/lahijan-tea
                    </code>
                    <Button size="sm" variant="secondary" onPress={() => setCopied(true)}>
                      <Link2 />
                      {copied ? t('رونوشت شد', 'Copied') : t('رونوشت', 'Copy')}
                    </Button>
                  </div>
                </div>
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

/** Open in the dark theme. */
export const Dark: StoryObj = {
  globals: { theme: 'dark' },
  parameters: frame('320px'),
  render: () => (
    <Centre height={240}>
      <Help showArrow defaultOpen />
    </Centre>
  ),
}

/** Open on an English page: its start at the trigger's start, the left. */
export const LeftToRight: StoryObj = {
  name: 'Left to right',
  globals: { locale: 'en-US', dir: 'ltr' },
  parameters: frame('320px'),
  render: () => (
    <Stage>
      <Help placement="bottom start" showArrow defaultOpen />
    </Stage>
  ),
}

/** Open on a phone: a popover still, 8 clear of the window's sides. */
export const OnAPhone: StoryObj = {
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  parameters: frame('420px'),
  render: () => (
    <Device>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Help placement="bottom" showArrow defaultOpen />
      </div>
    </Device>
  ),
}

/** The same popover as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const said = fee(t)
    const tree = {
      type: 'Popover',
      props: { title: said.heading, placement: 'bottom start', showArrow: true },
      slots: {
        trigger: {
          type: 'Button',
          props: { icon: 'circle-help', variant: 'ghost' },
          children: said.label,
        },
      },
      children: [{ type: 'Text', props: { size: 'sm' }, children: said.body }],
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
