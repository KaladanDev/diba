import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowLeft, ArrowRight, ExternalLink, FileDown, Plus, Settings } from 'lucide-react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT } from '../../stories/kit'
import { buttonVariants } from '../button'
import { Card } from '../card'
import { Tooltip } from '../tooltip'
import { Link } from './index'

// The LinkButton: a Link drawn as a button, every option it has and where it goes. The docs page
// is LinkButton.mdx. A line comment, not a doc comment: the docs plugin replaces a commented meta's
// parameters with one.
const meta = {
  title: 'Components/Buttons/LinkButton',
  component: Link,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Link>

export default meta

type Variant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'danger' | 'danger-soft'
type Size = 'sm' | 'md' | 'lg'

/** The arrow that points on, as the page reads. */
function useOn() {
  const t = useT()
  return t('fa', 'en') === 'fa' ? ArrowLeft : ArrowRight
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  variant: Variant
  size: Size
  icon: boolean
  isDisabled: boolean
  fullWidth: boolean
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { variant: 'primary', size: 'md', icon: true, isDisabled: false, fullWidth: false },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'outline', 'ghost', 'danger', 'danger-soft'],
      description: 'buttonVariants: its look, as a Button’s.',
      table: { category: 'buttonVariants', defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'buttonVariants: 32, 36 or 40 tall; on a phone 36, 40 or 44.',
      table: { category: 'buttonVariants', defaultValue: { summary: 'md' } },
    },
    fullWidth: {
      description: 'buttonVariants: as wide as its room.',
      table: { category: 'buttonVariants', defaultValue: { summary: 'false' } },
    },
    isDisabled: {
      description: 'It cannot be followed, and is drawn at half.',
      table: { category: 'Link', defaultValue: { summary: 'false' } },
    },
    icon: { description: 'An icon before its words.', table: { category: 'Example' } },
  },
  render: function Render({ variant, size, icon, isDisabled, fullWidth }) {
    const t = useT()
    return (
      <Stage width={480}>
        <Link
          href="#products/new"
          isDisabled={isDisabled}
          className={buttonVariants({ variant, size, fullWidth })}
        >
          {icon ? <Plus /> : null}
          {t('افزودن کالا', 'Add product')}
        </Link>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Its looks, a Button's: from the page's one main way on to the quietest. */
export const Variants: StoryObj = {
  render: function Render() {
    const t = useT()
    const looks: [Variant, string][] = [
      ['primary', t('افزودن کالا', 'Add product')],
      ['secondary', t('دیدن سفارش‌ها', 'See orders')],
      ['tertiary', t('همهٔ گزارش‌ها', 'All reports')],
      ['outline', t('پیش‌نمایش فروشگاه', 'Preview the shop')],
      ['ghost', t('راهنما', 'Help')],
      ['danger', t('بستن فروشگاه', 'Close the shop')],
      ['danger-soft', t('حذف حساب', 'Delete the account')],
    ]
    return (
      <Grid min={200}>
        {looks.map(([variant, words]) => (
          <Example key={variant} title={variant}>
            <Link href={`#${variant}`} className={buttonVariants({ variant })}>
              {words}
            </Link>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Its sizes: 32, 36 and 40 tall, a step taller on a phone. */
export const Sizes: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={180}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Example key={size} title={size}>
            <Link href="#orders" className={buttonVariants({ variant: 'secondary', size })}>
              {t('دیدن سفارش‌ها', 'See orders')}
            </Link>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** An icon before or after its words, 8 from them; an arrow on turns with the page. */
export const WithIcons: StoryObj = {
  name: 'With icons',
  render: function Render() {
    const t = useT()
    const On = useOn()
    return (
      <Grid min={220}>
        <Example title={t('پیش از واژه‌ها', 'Before its words')}>
          <Link href="#export" className={buttonVariants({ variant: 'secondary' })}>
            <FileDown />
            {t('دریافت گزارش', 'Download the report')}
          </Link>
        </Example>
        <Example title={t('پس از واژه‌ها', 'After its words')}>
          <Link href="#next" className={buttonVariants({ variant: 'primary' })}>
            {t('گام بعد', 'Next step')}
            <On />
          </Link>
        </Example>
      </Grid>
    )
  },
}

/** An icon alone: a circle, named by its aria-label, its name in a tooltip. */
export const IconOnly: StoryObj = {
  name: 'Icon only',
  render: function Render() {
    const t = useT()
    const name = t('تنظیمات فروشگاه', 'Shop settings')
    return (
      <Stage width={320}>
        <Example title={t('فقط نماد', 'Icon only')} note={name}>
          <Tooltip delay={500}>
            <Link
              href="#settings"
              aria-label={name}
              className={buttonVariants({ variant: 'tertiary', isIconOnly: true })}
            >
              <Settings />
            </Link>
            <Tooltip.Content placement="top" showArrow>
              <Tooltip.Arrow />
              {name}
            </Tooltip.Content>
          </Tooltip>
        </Example>
      </Stage>
    )
  },
}

/** To another site: a new tab, and an icon that says so. */
export const External: StoryObj = {
  name: 'To another site',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={320}>
        <Link
          href="https://next.zarinpal.com"
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: 'outline' })}
        >
          {t('پنل زرین‌پال', 'Zarinpal panel')}
          {/* It points away from the words: turned on a Persian page, as a Link's own arrow is. */}
          <ExternalLink style={t('fa', 'en') === 'fa' ? { scale: '-1 1' } : undefined} />
        </Link>
      </Stage>
    )
  },
}

/** Off, and as wide as its room. */
export const States: StoryObj = {
  name: 'Off, and full width',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={240}>
        <Example title="isDisabled" note={t('پیش از پرداخت', 'Before it is paid')}>
          <Link href="#invoice" isDisabled className={buttonVariants({ variant: 'secondary' })}>
            {t('دریافت فاکتور', 'Download the invoice')}
          </Link>
        </Example>
        <Example title="fullWidth">
          <Link
            href="#checkout"
            className={buttonVariants({ variant: 'primary', fullWidth: true })}
          >
            {t('ادامهٔ خرید', 'Go to checkout')}
          </Link>
        </Example>
      </Grid>
    )
  },
}

// ---- where it goes -------------------------------------------------------------------------------

/** The admin's products page: its way on at the end of its title. */
export const PageActions: StoryObj = {
  name: 'Example: a page’s way on',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={640}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2
            className="text-foreground"
            style={{ flex: 1, margin: 0, fontSize: 20, lineHeight: '28px', fontWeight: 600 }}
          >
            {t('کالاها', 'Products')}
          </h2>
          <Link href="#import" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
            {t('درون‌ریزی', 'Import')}
          </Link>
          <Link href="#products/new" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
            <Plus />
            {t('افزودن کالا', 'Add product')}
          </Link>
        </div>
      </Stage>
    )
  },
}

/** The storefront's cart: the way to checkout, and back to the shop. */
export const CartActions: StoryObj = {
  name: 'Example: a cart’s ways on',
  render: function Render() {
    const t = useT()
    const On = useOn()
    return (
      <Stage width={360}>
        <Card>
          <Card.Header>
            <Card.Title>{t('سبد خرید', 'Your cart')}</Card.Title>
            <Card.Description>
              {t('۳ کالا، ۱٬۳۲۵٬۰۰۰ تومان', '3 items, 1,325,000 toman')}
            </Card.Description>
          </Card.Header>
          <Card.Footer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <Link href="#checkout" className={buttonVariants({ fullWidth: true })}>
                {t('ادامهٔ خرید', 'Go to checkout')}
                <On />
              </Link>
              <Link href="#shop" className={buttonVariants({ variant: 'ghost', fullWidth: true })}>
                {t('بازگشت به فروشگاه', 'Back to the shop')}
              </Link>
            </div>
          </Card.Footer>
        </Card>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Pair() {
  const t = useT()
  const On = useOn()
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Link href="#checkout" className={buttonVariants({ variant: 'primary' })}>
        {t('ادامهٔ خرید', 'Go to checkout')}
        <On />
      </Link>
      <Link href="#shop" className={buttonVariants({ variant: 'secondary' })}>
        {t('بازگشت', 'Back')}
      </Link>
    </div>
  )
}

/** In both themes. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Pair />
    </Themes>
  ),
}

/** On a Persian page and an English one: the arrow on points as the page reads. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Pair />
    </Directions>
  ),
}

/** On a phone. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Pair />
    </Device>
  ),
}

/** The same links as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { direction: 'horizontal', gap: 2, wrap: true },
      children: [
        {
          type: 'LinkButton',
          props: { href: '/products/new', variant: 'primary', icon: 'plus' },
          children: t('افزودن کالا', 'Add product'),
        },
        {
          type: 'LinkButton',
          props: {
            href: '/settings',
            isIconOnly: true,
            icon: 'settings',
            label: t('تنظیمات', 'Settings'),
          },
        },
        {
          type: 'LinkButton',
          props: { href: 'https://next.zarinpal.com', isExternal: true, variant: 'outline' },
          children: t('پنل زرین‌پال', 'Zarinpal panel'),
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
