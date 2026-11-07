import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Download,
  EllipsisVertical,
  ExternalLink,
  Pencil,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import {
  Device,
  Directions,
  Example,
  Grid,
  Page,
  Stage,
  Themes,
  useT,
  Value,
} from '../../stories/kit'
import { Input } from '../input'
import { Label } from '../label'
import { Spinner } from '../spinner'
import { TextField } from '../textfield'
import { Tooltip } from '../tooltip'
import { Button } from './index'

// The Button, every option it has and what it is built into. The docs page is Button.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
// Typed as a plain Meta: Button's props carry a key its declarations cannot name.
const meta: Meta = {
  title: 'Components/Buttons/Button',
  component: Button,
  parameters: { layout: 'fullscreen' },
}

export default meta

type Variant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'danger' | 'danger-soft'
type Size = 'sm' | 'md' | 'lg'
const VARIANTS: Variant[] = [
  'primary',
  'secondary',
  'tertiary',
  'outline',
  'ghost',
  'danger',
  'danger-soft',
]
const SIZES: Size[] = ['sm', 'md', 'lg']

/** Whether the story is drawn in Persian. */
function usePersian() {
  const t = useT()
  return t('fa', 'en') === 'fa'
}

/** Buttons in a row, 12 apart. */
function Row({ children, gap = 12 }: { children: ReactNode; gap?: number }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap }}>{children}</div>
  )
}

/** The arrow that points onward: left on a Persian page, right on an English one. */
function Onward() {
  return usePersian() ? <ChevronLeft aria-hidden /> : <ChevronRight aria-hidden />
}

/** An icon-only button, named, with its name in a tooltip under a hover or keyboard focus. */
function IconButton({
  label,
  variant = 'tertiary',
  size,
  children,
}: {
  label: string
  variant?: Variant
  size?: Size
  children: ReactNode
}) {
  return (
    <Tooltip delay={500}>
      <Button isIconOnly variant={variant} size={size} aria-label={label}>
        {children}
      </Button>
      <Tooltip.Content placement="top" showArrow>
        <Tooltip.Arrow />
        {label}
      </Tooltip.Content>
    </Tooltip>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  label: string
  variant: Variant
  size: Size
  icon: 'none' | 'start' | 'end' | 'only'
  isDisabled: boolean
  isPending: boolean
  fullWidth: boolean
}

/** Every option on the controls. An empty label takes the sample's. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    label: '',
    variant: 'primary',
    size: 'md',
    icon: 'start',
    isDisabled: false,
    isPending: false,
    fullWidth: false,
  },
  argTypes: {
    label: { control: 'text', description: 'Its words.', table: { category: 'Example' } },
    variant: {
      control: 'inline-radio',
      options: VARIANTS,
      description: 'How much it asks for attention, and whether it destroys.',
      table: { category: 'Button', defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'inline-radio',
      options: SIZES,
      description: '32, 36 or 40 tall; on a phone 36, 40 or 44.',
      table: { category: 'Button', defaultValue: { summary: 'md' } },
    },
    icon: {
      control: 'inline-radio',
      options: ['none', 'start', 'end', 'only'],
      description: 'An icon before the words, after them, or alone with isIconOnly.',
      table: { category: 'Example' },
    },
    isDisabled: { table: { category: 'Button', defaultValue: { summary: 'false' } } },
    isPending: {
      description:
        'Its work in flight: not pressable, still focusable, a spinner in the icon’s place.',
      table: { category: 'Button', defaultValue: { summary: 'false' } },
    },
    fullWidth: {
      description: 'As wide as its container.',
      table: { category: 'Button', defaultValue: { summary: 'false' } },
    },
  },
  render: function Render({ label, variant, size, icon, isDisabled, isPending, fullWidth }) {
    const t = useT()
    const words = label || t('افزودن محصول', 'Add a product')
    const mark = isPending ? <Spinner size="sm" color="current" /> : <Plus aria-hidden />
    return (
      <Stage width={fullWidth ? 480 : 640}>
        <Row>
          {icon === 'only' ? (
            <Button
              isIconOnly
              variant={variant}
              size={size}
              isDisabled={isDisabled}
              isPending={isPending}
              aria-label={words}
            >
              {mark}
            </Button>
          ) : (
            <Button
              variant={variant}
              size={size}
              isDisabled={isDisabled}
              isPending={isPending}
              fullWidth={fullWidth}
            >
              {icon === 'start' ? mark : null}
              {words}
              {icon === 'end' ? mark : null}
            </Button>
          )}
        </Row>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Seven variants, from what the page is for down to what destroys. */
export const Variants: StoryObj = {
  render: function Render() {
    const t = useT()
    const said: Record<Variant, [string, string]> = {
      primary: [
        t('ذخیره', 'Save'),
        t('کار اصلی صفحه، یکی در هر جا', "The page's main action, one in a place"),
      ],
      secondary: [t('انصراف', 'Cancel'), t('کاری کنار کار اصلی', 'An action beside the main one')],
      tertiary: [
        t('پیش‌نمایش', 'Preview'),
        t('کاری کم‌اهمیت‌تر، بی‌پس‌زمینه تا زیر نشانگر', 'A quieter one, no fill until hovered'),
      ],
      outline: [
        t('خروجی', 'Export'),
        t('با لبه، روی زمینه‌ای رنگی', 'Edged, on a coloured ground'),
      ],
      ghost: [
        t('مشاهدهٔ همه', 'See all'),
        t('کمترین، در نوار یا فهرست', 'The least, in a bar or a list'),
      ],
      danger: [t('حذف', 'Delete'), t('آنچه برنمی‌گردد', 'What cannot be undone')],
      'danger-soft': [
        t('بایگانی', 'Archive'),
        t('آنچه از دست می‌رود اما برمی‌گردد', 'What is lost but can come back'),
      ],
    }
    return (
      <Grid min={220}>
        {VARIANTS.map((variant) => (
          <Example key={variant} title={variant} note={said[variant][1]}>
            <Row>
              <Button variant={variant}>{said[variant][0]}</Button>
            </Row>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Three sizes: 32, 36 and 40 tall from 768 wide; 36, 40 and 44 under it, for a finger. */
export const Sizes: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {(['primary', 'secondary'] as const).map((variant) => (
          <Row key={variant}>
            {SIZES.map((size) => (
              <Button key={size} variant={variant} size={size}>
                <Plus aria-hidden />
                {t('افزودن', 'Add')} · {size}
              </Button>
            ))}
            {SIZES.map((size) => (
              <IconButton key={size} variant={variant} size={size} label={t('افزودن', 'Add')}>
                <Plus aria-hidden />
              </IconButton>
            ))}
          </Row>
        ))}
      </div>
    )
  },
}

/** An icon before the words, or after them for where it takes you. */
export const WithIcons: StoryObj = {
  name: 'With icons',
  render: function Render() {
    const t = useT()
    return (
      <Row>
        <Button variant="primary">
          <Plus aria-hidden />
          {t('افزودن محصول', 'Add a product')}
        </Button>
        <Button variant="secondary">
          <Download aria-hidden />
          {t('دریافت فاکتور', 'Download the invoice')}
        </Button>
        <Button variant="outline">
          {t('راهنما', 'Help')}
          <ExternalLink aria-hidden />
        </Button>
        <Button variant="tertiary">
          {t('بعدی', 'Next')}
          <Onward />
        </Button>
      </Row>
    )
  },
}

/** An icon alone, named for a screen reader, its name in a tooltip under a hover or focus. */
export const IconOnly: StoryObj = {
  name: 'Icon only',
  render: function Render() {
    const t = useT()
    const buttons: [Variant, string, ReactNode][] = [
      ['outline', t('ویرایش', 'Edit'), <Pencil key="e" aria-hidden />],
      ['ghost', t('کارهای دیگر', 'More actions'), <EllipsisVertical key="m" aria-hidden />],
      ['danger-soft', t('حذف', 'Delete'), <Trash2 key="d" aria-hidden />],
    ]
    return (
      <Row gap={32}>
        {buttons.map(([variant, label, icon]) => (
          <div
            key={variant}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <IconButton variant={variant} label={label}>
              {icon}
            </IconButton>
            <span className="text-muted" style={{ fontSize: 12 }}>
              {variant} · {label}
            </span>
          </div>
        ))}
      </Row>
    )
  },
}

/** Disabled, it fades and does nothing; pending, it waits for its work, still focusable. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    const [pending, setPending] = useState(false)
    return (
      <Grid min={260}>
        <Example title={t('غیرفعال', 'Disabled')}>
          <Row>
            <Button variant="primary" isDisabled>
              {t('ذخیره', 'Save')}
            </Button>
            <Button variant="secondary" isDisabled>
              {t('انصراف', 'Cancel')}
            </Button>
          </Row>
        </Example>
        <Example
          title={t('در انتظار', 'Pending')}
          note={t('بزنید: ۱٫۵ ثانیه کار', 'Press it: a second and a half of work')}
        >
          <Row>
            <Button
              variant="primary"
              isPending={pending}
              onPress={() => {
                setPending(true)
                setTimeout(() => setPending(false), 1500)
              }}
            >
              {pending ? <Spinner size="sm" color="current" /> : <Save aria-hidden />}
              {t('ذخیره', 'Save')}
            </Button>
          </Row>
        </Example>
      </Grid>
    )
  },
}

/** As wide as its container: the one thing to do on a narrow page. */
export const FullWidth: StoryObj = {
  name: 'Full width',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={400}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button variant="primary" size="lg" fullWidth>
            {t('پرداخت ۱٬۲۵۰٬۰۰۰ تومان', 'Pay 1,250,000 toman')}
          </Button>
          <Button variant="tertiary" fullWidth>
            {t('بازگشت به سبد', 'Back to the cart')}
          </Button>
        </div>
      </Stage>
    )
  },
}

/** In a form: submit sends it, reset puts every field back. */
export const InAForm: StoryObj = {
  name: 'In a form',
  render: function Render() {
    const t = useT()
    const [sent, setSent] = useState<string | null>(null)
    return (
      <Stage width={420} surface>
        <form
          style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}
          onSubmit={(event) => {
            event.preventDefault()
            setSent(String(new FormData(event.currentTarget).get('name')))
          }}
          onReset={() => setSent(null)}
        >
          <TextField name="name" defaultValue={t('شال ابریشم', 'Silk scarf')}>
            <Label>{t('نام محصول', "The product's name")}</Label>
            <Input />
          </TextField>
          <Row gap={8}>
            <Button type="submit" variant="primary">
              {t('ذخیره', 'Save')}
            </Button>
            <Button type="reset" variant="tertiary">
              {t('بازنشانی', 'Reset')}
            </Button>
          </Row>
          <Value label={t('فرستاده شد', 'Sent')} value={sent} />
        </form>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** A page's actions at the end of its title: one primary, the rest quieter. */
export const PageActions: StoryObj = {
  name: 'Example: a page’s actions',
  render: function Render() {
    const t = useT()
    return (
      <Page>
        <Stage width={960}>
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <h1 className="text-foreground" style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
              {t('محصولات', 'Products')}
            </h1>
            <Row gap={8}>
              <Button variant="secondary">
                <Download aria-hidden />
                {t('خروجی', 'Export')}
              </Button>
              <Button variant="primary">
                <Plus aria-hidden />
                {t('افزودن محصول', 'Add a product')}
              </Button>
              <IconButton variant="tertiary" label={t('کارهای دیگر', 'More actions')}>
                <EllipsisVertical aria-hidden />
              </IconButton>
            </Row>
          </header>
        </Stage>
      </Page>
    )
  },
}

/** A card's footer: what is lost but can come back, beside what cannot. */
export const DestructiveActions: StoryObj = {
  name: 'Example: archive or delete',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={560} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}>
          <span className="text-foreground" style={{ fontSize: 16, fontWeight: 600 }}>
            {t('شال ابریشم', 'Silk scarf')}
          </span>
          <span className="text-muted" style={{ fontSize: 14 }}>
            {t(
              'بایگانی آن را از فروشگاه برمی‌دارد و می‌شود برگرداند؛ حذف برنمی‌گردد.',
              'Archiving takes it out of the shop and can be undone; deleting cannot.',
            )}
          </span>
          <Row gap={8}>
            <Button variant="danger-soft">
              <Archive aria-hidden />
              {t('بایگانی', 'Archive')}
            </Button>
            <Button variant="danger">
              <Trash2 aria-hidden />
              {t('حذف', 'Delete')}
            </Button>
          </Row>
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Row gap={8}>
        {VARIANTS.map((variant) => (
          <Button key={variant} variant={variant} size="sm">
            {variant}
          </Button>
        ))}
      </Row>
      <Row gap={8}>
        <Button variant="primary">
          <Plus aria-hidden />
          {t('افزودن', 'Add')}
        </Button>
        <Button variant="tertiary">
          {t('بعدی', 'Next')}
          <Onward />
        </Button>
        <IconButton variant="outline" label={t('ویرایش', 'Edit')}>
          <Pencil aria-hidden />
        </IconButton>
        <Button variant="primary" isDisabled>
          {t('غیرفعال', 'Disabled')}
        </Button>
      </Row>
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

/** A Persian page and an English one: an icon before the words keeps to the reading side. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Sample />
    </Directions>
  ),
}

/** On a phone's width, where each size is a step taller for a finger. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Sample />
    </Device>
  ),
}

/** The same buttons as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    // A tree names an arrow as for left-to-right: the block turns a mirrored one on a Persian page.
    const tree = {
      type: 'Stack',
      props: { direction: 'horizontal', gap: 2, wrap: true },
      children: [
        {
          type: 'Button',
          props: { variant: 'primary', icon: 'plus' },
          children: t('افزودن محصول', 'Add a product'),
          actions: { onPress: { do: 'call', action: 'products.add' } },
        },
        {
          type: 'Button',
          props: { icon: 'chevron-right', iconPlacement: 'end' },
          children: t('بعدی', 'Next'),
        },
        {
          type: 'Button',
          props: {
            variant: 'outline',
            icon: 'pencil',
            isIconOnly: true,
            label: t('ویرایش', 'Edit'),
          },
        },
        {
          type: 'Button',
          props: { variant: 'primary', icon: 'check', isPending: true },
          children: t('در حال ذخیره', 'Saving'),
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
