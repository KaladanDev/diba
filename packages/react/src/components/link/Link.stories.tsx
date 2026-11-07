import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Card } from '../card'
import { Link } from './index'

// The Link, every option it has and where it goes. The docs page is Link.mdx. A line comment, not
// a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Navigation/Link',
  component: Link,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Link>

export default meta

/** Body text, 14 on 22, in the text's colour: what a link sits in. */
function Words({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-foreground" style={{ margin: 0, fontSize: 14, lineHeight: '22px' }}>
      {children}
    </p>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = { isDisabled: boolean; external: boolean }

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { isDisabled: false, external: false },
  argTypes: {
    isDisabled: {
      description: 'It cannot be followed, and is drawn at half.',
      table: { category: 'Link', defaultValue: { summary: 'false' } },
    },
    external: {
      description: 'target="_blank" with Link.Icon after its words: it opens another site.',
      table: { category: 'Example' },
    },
  },
  render: function Render({ isDisabled, external }) {
    const t = useT()
    return (
      <Stage width={480}>
        <Words>
          {t('پیش از فرستادن، ', 'Before you ship, read ')}
          <Link
            href={external ? 'https://tipaxco.com' : '#shipping-help'}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            isDisabled={isDisabled}
          >
            {t('راهنمای بسته‌بندی', 'the packing guide')}
            {external ? <Link.Icon /> : null}
          </Link>
          {t(' را بخوانید.', '.')}
        </Words>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** In a sentence: underlined in its own colour, so it is told apart without colour alone. */
export const InASentence: StoryObj = {
  name: 'In a sentence',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={520}>
        <Words>
          {t(
            'سفارش تا ۳ روز پس از رسیدن پس گرفته می‌شود؛ ',
            'An order can be returned within 3 days of arriving; ',
          )}
          <Link href="#returns">{t('شرایط بازگشت', 'the return terms')}</Link>
          {t(' همه را می‌گوید.', ' say the rest.')}
        </Words>
      </Stage>
    )
  },
}

/** To another site: a new tab, and the arrow after its words that says so. */
export const External: StoryObj = {
  name: 'To another site',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={480}>
        <Words>
          {t('بسته را در ', 'Track the parcel on ')}
          <Link href="https://tipaxco.com" target="_blank" rel="noopener noreferrer">
            {t('سایت تیپاکس', 'Tipax’s site')}
            <Link.Icon />
          </Link>
          {t(' دنبال کنید.', '.')}
        </Words>
      </Stage>
    )
  },
}

/** An icon of your own in Link.Icon: an arrow that turns with the page. */
export const WithIcon: StoryObj = {
  name: 'With an icon',
  render: function Render() {
    const t = useT()
    const Back = t('fa', 'en') === 'fa' ? ArrowRight : ArrowLeft
    const On = t('fa', 'en') === 'fa' ? ArrowLeft : ArrowRight
    return (
      <Grid min={240}>
        <Example title={t('پیش از واژه‌ها', 'Before its words')}>
          <Link href="#orders">
            <Link.Icon>
              <Back />
            </Link.Icon>
            {t('بازگشت به سفارش‌ها', 'Back to orders')}
          </Link>
        </Example>
        <Example title={t('پس از واژه‌ها', 'After its words')}>
          <Link href="#all">
            {t('همهٔ گزارش‌ها', 'All reports')}
            <Link.Icon>
              <On />
            </Link.Icon>
          </Link>
        </Example>
      </Grid>
    )
  },
}

/** Off: it cannot be followed or reached, drawn at half. */
export const Disabled: StoryObj = {
  name: 'Off',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={240}>
        <Example title={t('روشن', 'On')}>
          <Link href="#invoice">{t('دریافت فاکتور', 'Download the invoice')}</Link>
        </Example>
        <Example title="isDisabled" note={t('پیش از پرداخت', 'Before it is paid')}>
          <Link href="#invoice" isDisabled>
            {t('دریافت فاکتور', 'Download the invoice')}
          </Link>
        </Example>
      </Grid>
    )
  },
}

/** A press instead of a page: onPress, for a link that opens something here. */
export const OnPress: StoryObj = {
  name: 'Something here, not a page',
  render: function Render() {
    const t = useT()
    const [opened, setOpened] = useState(0)
    return (
      <Stage width={480}>
        <Words>
          {t('هزینهٔ ارسال را ', 'See how ')}
          <Link onPress={() => setOpened((n) => n + 1)}>
            {t('چگونه حساب می‌کنیم', 'we work out delivery')}
          </Link>
          {t('.', '.')}
        </Words>
        <Value label="onPress" value={opened} />
      </Stage>
    )
  },
}

// ---- where it goes -------------------------------------------------------------------------------

/** The admin: a setting's note with its guide, and a record's way to the customer it belongs to. */
export const InTheAdmin: StoryObj = {
  name: 'Example: in the admin',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={520}>
        <Card>
          <Card.Header>
            <Card.Title>{t('درگاه پرداخت', 'Payment gateway')}</Card.Title>
            <Card.Description>
              {t(
                'کلید درگاه را از پنل زرین‌پال بگیرید؛ ',
                'Get the gateway key from your Zarinpal panel; ',
              )}
              <Link href="#gateway-help">{t('راهنمای گام به گام', 'a step-by-step guide')}</Link>
              {t('.', '.')}
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <Words>
              {t('آخرین تغییر: ', 'Last changed by ')}
              <Link href="#staff/leila">{t('لیلا صادقی', 'Leila Sadeghi')}</Link>
              {t('، ۱۴ آبان', ', 5 Nov')}
            </Words>
          </Card.Content>
        </Card>
      </Stage>
    )
  },
}

/** The storefront's foot: its policies and its way to the shop, side by side. */
export const StoreFooter: StoryObj = {
  name: 'Example: a storefront’s foot',
  render: function Render() {
    const t = useT()
    const links = [
      t('درباره‌ی ما', 'About us'),
      t('شرایط بازگشت', 'Returns'),
      t('حریم خصوصی', 'Privacy'),
      t('تماس با ما', 'Contact'),
    ]
    return (
      <Stage width={640}>
        <nav
          aria-label={t('پیوندهای فروشگاه', 'Shop links')}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px' }}
        >
          {links.map((words) => (
            <Link key={words} href={`#${words}`}>
              {words}
            </Link>
          ))}
        </nav>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

/** In both themes: slate-700 in light, slate-300 in dark, its line its own colour. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <ReturnsLine />
    </Themes>
  ),
}

/** On a Persian page and an English one. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <ReturnsLine />
    </Directions>
  ),
}

/** On a phone, where a link wraps with its sentence. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <ReturnsLine />
    </Device>
  ),
}

function ReturnsLine() {
  const t = useT()
  return (
    <Words>
      {t('تا ۳ روز پس گرفته می‌شود؛ ', 'Returned within 3 days; ')}
      <Link href="#returns">{t('شرایط بازگشت', 'the return terms')}</Link>
      {t('. بسته را در ', '. Track it on ')}
      <Link href="https://tipaxco.com" target="_blank" rel="noopener noreferrer">
        {t('سایت تیپاکس', 'Tipax’s site')}
        <Link.Icon />
      </Link>
      {t(' دنبال کنید.', '.')}
    </Words>
  )
}

/** The same link as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 2 },
      children: [
        {
          type: 'Link',
          props: { href: '/policies/returns' },
          children: t('شرایط بازگشت', 'Return terms'),
        },
        {
          type: 'Link',
          props: { href: 'https://tipaxco.com', isExternal: true },
          children: t('سایت تیپاکس', 'Tipax’s site'),
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
