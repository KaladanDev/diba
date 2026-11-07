import type { Meta, StoryObj } from '@storybook/react-vite'
import { PackageCheck } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Example, Grid, Stage, useT } from '../../stories/kit'
import { Button } from '../button'
import { Toast, toast } from './index'

// The Toast, every option it has and what it says. The docs page is Toast.mdx. Each story is its
// own frame in the docs with its own toast region, where the main ones show their toasts as they
// load: a page has one region, and every toast goes to it. A line comment, not a doc comment: the
// docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Feedback/Toast',
  component: Toast,
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, height: '360px' } },
  },
} satisfies Meta<typeof Toast>

export default meta

type Variant = 'default' | 'accent' | 'success' | 'warning' | 'danger'
type Placement = NonNullable<React.ComponentProps<typeof Toast.Provider>['placement']>

/**
 * The page's one toast region, and the toasts a frame shows before anything is pressed. Opening a
 * story clears what another showed, the queue being the page's; a story drawn and at once drawn
 * again shows its own once, from the drawing that stays.
 */
function Region({
  onOpen,
  ...props
}: React.ComponentProps<typeof Toast.Provider> & { onOpen?: () => void }) {
  const latest = useRef(onOpen)
  latest.current = onOpen
  useEffect(() => {
    toast.clear()
    const timer = setTimeout(() => latest.current?.(), 100)
    return () => clearTimeout(timer)
  }, [])
  return <Toast.Provider {...props} />
}

/** A row of buttons, each showing a toast. */
function Row({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>
}

/** What each variant says, as the admin says it. */
function said(t: ReturnType<typeof useT>, variant: Variant) {
  return {
    default: {
      button: t('یادداشت', 'Note'),
      title: t('پیش‌نویس ذخیره شد', 'Draft saved'),
      description: t('هر زمان می‌توانید آن را منتشر کنید.', 'You can publish it any time.'),
    },
    accent: {
      button: t('خبر', 'News'),
      title: t('پوستهٔ تازه‌ای رسید', 'A new theme is out'),
      description: t('«ترمه ۳» در فروشگاه پوسته‌ها.', '“Termeh 3” is in the theme store.'),
    },
    success: {
      button: t('موفق', 'Success'),
      title: t('محصول ذخیره شد', 'Product saved'),
      description: t('خریداران از همین حالا آن را می‌بینند.', 'Buyers see it from now on.'),
    },
    warning: {
      button: t('هشدار', 'Warning'),
      title: t('موجودی رو به پایان است', 'Running low'),
      description: t('از «شال ابریشم» ۲ عدد مانده.', '2 “Silk scarf” left.'),
    },
    danger: {
      button: t('خطا', 'Error'),
      title: t('پرداخت انجام نشد', 'The payment failed'),
      description: t('کارت را بررسی کنید و دوباره بکوشید.', 'Check the card and try again.'),
    },
  }[variant]
}

/** A moment's work, as a server's answer takes. */
const work = (ms = 1800) => new Promise<void>((done) => setTimeout(done, ms))

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  variant: Variant
  description: boolean
  action: boolean
  timeout: number
  placement: Placement
  width: number
  maxVisibleToasts: number
}

/** Every option on the controls; its button shows another toast. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    variant: 'success',
    description: true,
    action: false,
    timeout: 4000,
    placement: 'bottom',
    width: 460,
    maxVisibleToasts: 3,
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'accent', 'success', 'warning', 'danger'],
      description: 'Its colour and mark: toast(), toast.info(), .success(), .warning(), .danger().',
      table: { category: 'toast()', defaultValue: { summary: 'default' } },
    },
    description: {
      description: 'A line under the title.',
      table: { category: 'toast()' },
    },
    action: {
      description: 'actionProps: a button that does something, such as Undo.',
      table: { category: 'toast()' },
    },
    timeout: {
      control: { type: 'number', min: 0, step: 1000 },
      description: 'Milliseconds before it goes; 0 keeps it until it is closed.',
      table: { category: 'toast()', defaultValue: { summary: '4000' } },
    },
    placement: {
      control: 'select',
      options: ['bottom', 'bottom start', 'bottom end', 'top', 'top start', 'top end'],
      description: 'Where the region stands: start and end follow the page’s direction.',
      table: { category: 'Toast.Provider', defaultValue: { summary: 'bottom' } },
    },
    width: {
      control: { type: 'number', min: 280, step: 20 },
      description: 'Its width from 640 wide; under that, the window’s less 16 each side.',
      table: { category: 'Toast.Provider', defaultValue: { summary: '460' } },
    },
    maxVisibleToasts: {
      control: { type: 'number', min: 1, max: 6 },
      description: 'How many show in the stack; older ones wait behind.',
      table: { category: 'Toast.Provider', defaultValue: { summary: '3' } },
    },
  },
  render: function Render(args) {
    const t = useT()
    const words = said(t, args.variant)
    const show = () =>
      toast(words.title, {
        variant: args.variant,
        description: args.description ? words.description : undefined,
        actionProps: args.action
          ? { children: t('برگرداندن', 'Undo'), onPress: () => toast(t('برگشت', 'Undone')) }
          : undefined,
        timeout: args.timeout,
      })
    return (
      <Stage>
        <Button variant="secondary" onPress={show}>
          {t('نشان بده', 'Show a toast')}
        </Button>
        <Region
          onOpen={show}
          placement={args.placement}
          width={args.width}
          maxVisibleToasts={args.maxVisibleToasts}
        />
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Each variant's colour and mark: one button each. */
export const Variants: StoryObj = {
  render: function Render() {
    const t = useT()
    const variants = ['default', 'accent', 'success', 'warning', 'danger'] as const
    const show = (variant: Variant) => {
      const words = said(t, variant)
      toast(words.title, { variant, description: words.description })
    }
    return (
      <Stage width={760}>
        <Row>
          {variants.map((variant) => (
            <Button key={variant} variant="secondary" onPress={() => show(variant)}>
              {said(t, variant).button}
            </Button>
          ))}
        </Row>
        <Region onOpen={() => show('success')} />
      </Stage>
    )
  },
}

/** A title alone, a title and a line, and a button that does something. */
export const Content: StoryObj = {
  render: function Render() {
    const t = useT()
    const words = said(t, 'success')
    const undo = () =>
      toast.success(t('محصول حذف شد', 'Product deleted'), {
        actionProps: {
          children: t('برگرداندن', 'Undo'),
          onPress: () => toast(t('محصول برگشت', 'Product restored')),
        },
      })
    return (
      <Stage width={760}>
        <Row>
          <Button variant="secondary" onPress={() => toast.success(words.title)}>
            {t('فقط عنوان', 'A title alone')}
          </Button>
          <Button
            variant="secondary"
            onPress={() => toast.success(words.title, { description: words.description })}
          >
            {t('با یک خط', 'With a line')}
          </Button>
          <Button variant="secondary" onPress={undo}>
            {t('با دکمه', 'With a button')}
          </Button>
        </Row>
        <Region onOpen={undo} />
      </Stage>
    )
  },
}

/** Its own mark, none, or a spinner while its work runs. */
export const Indicators: StoryObj = {
  render: function Render() {
    const t = useT()
    const shipped = () =>
      toast.success(t('سفارش ۱۰۴۱ ارسال شد', 'Order 1041 shipped'), {
        indicator: <PackageCheck />,
      })
    return (
      <Stage width={760}>
        <Row>
          <Button variant="secondary" onPress={shipped}>
            {t('نشانهٔ خودتان', 'Your own mark')}
          </Button>
          <Button
            variant="secondary"
            onPress={() => toast(t('پیوند رونوشت شد', 'Link copied'), { indicator: null })}
          >
            {t('بی نشانه', 'No mark')}
          </Button>
          <Button
            variant="secondary"
            onPress={() =>
              toast(t('در حال بارگذاری…', 'Uploading…'), { isLoading: true, timeout: 3000 })
            }
          >
            {t('در حال کار', 'Working')}
          </Button>
        </Row>
        <Region onOpen={shipped} />
      </Stage>
    )
  },
}

/** A toast that follows a piece of work: a spinner while it runs, then how it went, in place. */
export const FollowingWork: StoryObj = {
  name: 'Following a piece of work',
  render: function Render() {
    const t = useT()
    const save = (fails: boolean) =>
      toast.promise(
        work().then(() => {
          if (fails) throw new Error('offline')
        }),
        {
          loading: t('در حال ذخیره…', 'Saving…'),
          success: t('محصول ذخیره شد', 'Product saved'),
          error: t('ذخیره نشد؛ اتصال را بررسی کنید', 'Not saved; check the connection'),
        },
      )
    return (
      <Stage width={760}>
        <Row>
          <Button variant="secondary" onPress={() => save(false)}>
            {t('ذخیره', 'Save')}
          </Button>
          <Button variant="secondary" onPress={() => save(true)}>
            {t('ذخیره، ناموفق', 'Save, failing')}
          </Button>
        </Row>
        <Region onOpen={() => save(false)} />
      </Stage>
    )
  },
}

/** How long it stays: four seconds by default, longer, or until it is closed. */
export const Timeouts: StoryObj = {
  render: function Render() {
    const t = useT()
    const words = said(t, 'default')
    return (
      <Grid min={180}>
        {([4000, 10000, 0] as const).map((timeout) => (
          <Example
            key={timeout}
            title={
              timeout === 0
                ? t('تا بسته شود', 'Until closed')
                : t(
                    `${(timeout / 1000).toLocaleString('fa-IR')} ثانیه`,
                    `${timeout / 1000} seconds`,
                  )
            }
            note={timeout === 4000 ? t('پیش‌فرض', 'The default') : `timeout: ${timeout}`}
          >
            <div>
              <Button variant="secondary" onPress={() => toast(words.title, { timeout })}>
                {t('نشان بده', 'Show')}
              </Button>
            </div>
          </Example>
        ))}
        <Region />
      </Grid>
    )
  },
}

/** Several at once: the newest in front, three in the stack; the pointer on them spreads them out. */
export const Stacking: StoryObj = {
  render: function Render() {
    const t = useT()
    const many = () => {
      for (const variant of ['default', 'warning', 'success'] as const) {
        const words = said(t, variant)
        toast(words.title, { variant, description: words.description, timeout: 0 })
      }
    }
    return (
      <Stage>
        <Row>
          <Button variant="secondary" onPress={many}>
            {t('سه تا با هم', 'Three at once')}
          </Button>
          <Button variant="tertiary" onPress={() => toast.clear()}>
            {t('بستن همه', 'Close all')}
          </Button>
        </Row>
        <Region onOpen={many} />
      </Stage>
    )
  },
}

/** Where the region stands, chosen here; start and end follow the page's direction. */
export const Placements: StoryObj = {
  render: function Render() {
    const t = useT()
    const [placement, setPlacement] = useState<Placement>('bottom')
    const places: Placement[] = [
      'top start',
      'top',
      'top end',
      'bottom start',
      'bottom',
      'bottom end',
    ]
    return (
      <Stage>
        <Row>
          {places.map((place) => (
            <Button
              key={place}
              variant={place === placement ? 'primary' : 'secondary'}
              onPress={() => {
                toast.clear()
                setPlacement(place)
                toast(t('اینجا', 'Here'), { description: place })
              }}
            >
              {place}
            </Button>
          ))}
        </Row>
        <Region placement={placement} />
      </Stage>
    )
  },
}

// ---- what it says --------------------------------------------------------------------------------

/** The admin: a product deleted, with a way back. */
export const UndoDelete: StoryObj = {
  name: 'Example: undo a delete',
  render: function Render() {
    const t = useT()
    const [deleted, setDeleted] = useState(false)
    const remove = () => {
      setDeleted(true)
      toast(t('«شال ابریشم» حذف شد', '“Silk scarf” deleted'), {
        actionProps: {
          children: t('برگرداندن', 'Undo'),
          onPress: () => setDeleted(false),
        },
        timeout: 8000,
      })
    }
    return (
      <Stage>
        <Row>
          <Button variant="danger-soft" isDisabled={deleted} onPress={remove}>
            {deleted ? t('حذف شد', 'Deleted') : t('حذف محصول', 'Delete product')}
          </Button>
        </Row>
        <Region onOpen={remove} />
      </Stage>
    )
  },
}

/** A storefront: added to the cart, with the way to it. */
export const AddedToCart: StoryObj = {
  name: 'Example: added to the cart',
  render: function Render() {
    const t = useT()
    const add = () =>
      toast.success(t('به سبد افزوده شد', 'Added to your cart'), {
        description: t('چای لاهیجان، ۱ عدد', 'Lahijan tea, 1'),
        actionProps: { children: t('دیدن سبد', 'View cart'), variant: 'secondary' },
      })
    return (
      <Stage>
        <Button onPress={add}>{t('افزودن به سبد', 'Add to cart')}</Button>
        <Region onOpen={add} placement="top" />
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
    const words = said(t, 'success')
    const show = () => toast.success(words.title, { description: words.description, timeout: 0 })
    return (
      <Stage>
        <Button variant="secondary" onPress={show}>
          {t('نشان بده', 'Show a toast')}
        </Button>
        <Region onOpen={show} />
      </Stage>
    )
  },
}

/** On an English page: its mark on the left, a start region at the left. */
export const LeftToRight: StoryObj = {
  name: 'Left to right',
  globals: { locale: 'en-US', dir: 'ltr' },
  render: function Render() {
    const t = useT()
    const words = said(t, 'success')
    const show = () => toast.success(words.title, { description: words.description, timeout: 0 })
    return (
      <Stage>
        <Button variant="secondary" onPress={show}>
          {t('نشان بده', 'Show a toast')}
        </Button>
        <Region onOpen={show} placement="bottom start" />
      </Stage>
    )
  },
}

/** On a phone: the window's width less 16 each side, its button under its words. */
export const OnAPhone: StoryObj = {
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  parameters: { docs: { story: { inline: false, height: '560px' } } },
  render: function Render() {
    const t = useT()
    const show = () =>
      toast(t('«شال ابریشم» حذف شد', '“Silk scarf” deleted'), {
        description: t('تصویرها و موجودی‌اش هم.', 'Its pictures and stock too.'),
        actionProps: { children: t('برگرداندن', 'Undo') },
        timeout: 0,
      })
    return (
      <Stage>
        <Button variant="secondary" onPress={show}>
          {t('نشان بده', 'Show a toast')}
        </Button>
        <Region onOpen={show} />
      </Stage>
    )
  },
}

/** A tree asks for a toast as an action, here on a button's press. */
export const ServerDriven: StoryObj = {
  name: 'As an action (SDUI)',
  parameters: { docs: { story: { inline: false, height: '420px' } } },
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Button',
      props: { variant: 'secondary', icon: 'printer' },
      children: t('چاپ برچسب', 'Print label'),
      actions: {
        onPress: {
          do: 'toast',
          status: 'success',
          title: t('برچسب چاپ شد', 'Label printed'),
          description: t('سفارش ۱۰۴۱', 'Order 1041'),
        },
      },
    }
    return (
      <Grid min={320}>
        <Example
          title={t('آنچه کشیده می‌شود', 'What is drawn')}
          note={t('در وب و در Flutter: دکمه را بزنید', 'On the web and in Flutter: press it')}
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
        <Region />
      </Grid>
    )
  },
}
