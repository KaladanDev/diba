import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, Value, useT } from '../../stories/kit'
import { Alert, Card, Chip, Description, Label, Stack, Text } from '../../index'
import { Snippet, snippetOptions, type SnippetSize, type SnippetVariant } from './Snippet'

// The Snippet, every option it has and what it builds. The docs page is Snippet.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Typography/Snippet',
  component: Snippet,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Snippet>

export default meta

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  text: string
  variant: SnippetVariant
  size: SnippetSize
  symbol: string
  hideCopyButton: boolean
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    text: 'bun add @kaladan/diba-react',
    variant: 'default',
    size: 'md',
    symbol: '$',
    hideCopyButton: false,
  },
  argTypes: {
    text: {
      control: 'text',
      description: 'What it shows, its children; and what it copies, unless `copyText` says else.',
      table: { category: 'Snippet' },
    },
    variant: {
      control: 'inline-radio',
      options: snippetOptions.variant,
      description: 'On the second surface, or outlined.',
      table: { category: 'Snippet', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'inline-radio',
      options: snippetOptions.size,
      description: 'The room round the words; the words stay 14 on 21.',
      table: { category: 'Snippet', defaultValue: { summary: 'md' } },
    },
    symbol: {
      control: 'text',
      description: 'A prompt before each line, drawn and never copied; none unless given.',
      table: { category: 'Snippet' },
    },
    hideCopyButton: {
      control: 'boolean',
      description: 'Only to be read.',
      table: { category: 'Snippet', defaultValue: { summary: 'false' } },
    },
  },
  render: ({ text, ...props }) => (
    <Stage width={480}>
      <Snippet {...props}>{text}</Snippet>
    </Stage>
  ),
}

// ---- its options ---------------------------------------------------------------------------------

/** Its two variants: on the second surface, and outlined. */
export const Variants: StoryObj = {
  render: () => (
    <Grid min={220}>
      {snippetOptions.variant.map((variant) => (
        <Example key={variant} title={`variant="${variant}"`}>
          <Snippet variant={variant}>kaladan.shop/hooks/orders</Snippet>
        </Example>
      ))}
    </Grid>
  ),
}

/** On a grey card a default snippet takes the surface, so it keeps its frame. */
export const OnGrey: StoryObj = {
  name: 'On a grey card',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={220}>
        {(['default', 'secondary', 'tertiary'] as const).map((card) => (
          <Example key={card} title={`<Card variant="${card}">`}>
            <Card variant={card}>
              <Stack gap={2}>
                <Text size="sm" tone="muted">
                  {t('کد رهگیری', 'Tracking number')}
                </Text>
                <Snippet size="sm">852319047712</Snippet>
              </Stack>
            </Card>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Three sizes: the room round the words grows, the words do not. */
export const Sizes: StoryObj = {
  render: () => (
    <Grid min={220}>
      {snippetOptions.size.map((size) => (
        <Example
          key={size}
          title={`size="${size}"`}
          note={{ sm: '8 × 4', md: '12 × 6', lg: '16 × 8' }[size]}
        >
          <Snippet size={size}>DB-1041</Snippet>
        </Example>
      ))}
    </Grid>
  ),
}

/** The prompt: none unless given; «$» for a command, or another. */
export const Prompts: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={220}>
        <Example title={t('بی نشانه', 'None')} note={t('پیش‌فرض', 'The default')}>
          <Snippet>pk_live_51Nc8dEKa1aDaN</Snippet>
        </Example>
        <Example title={t('یک فرمان', 'A command')} note='symbol="$"'>
          <Snippet symbol="$">bun run build</Snippet>
        </Example>
        <Example title={t('دیگری', 'Another')} note='symbol=">"'>
          <Snippet symbol=">">Get-ChildItem</Snippet>
        </Example>
      </Grid>
    )
  },
}

/** Several lines, a command each, copied as one block with the newlines kept. */
export const SeveralLines: StoryObj = {
  render: () => (
    <Stage width={420}>
      <Snippet symbol="$">{['cd kits/diba', 'bun install', 'bun run build']}</Snippet>
    </Stage>
  ),
}

/** What lands on the clipboard need not be what is shown, and what it says when it has. */
export const Copying: StoryObj = {
  render: function Render() {
    const t = useT()
    const [copied, setCopied] = useState<string | null>(null)
    return (
      <Grid min={260}>
        <Example
          title={t('کوتاه نشان می‌دهد، کامل رونوشت می‌کند', 'Shows it short, copies it whole')}
          note="copyText"
        >
          <Stack gap={2} align="start">
            <Snippet copyText="DB-1041-8F2C-4A19-B7E0" onCopy={setCopied}>
              DB-1041…
            </Snippet>
            <Value label="onCopy" value={copied} />
          </Stack>
        </Example>
        <Example title={t('فقط خواندنی', 'Only to be read')} note="hideCopyButton">
          <Snippet hideCopyButton>{t('کد پیگیری: ۸۵۲۳۱۹۰۴', 'Tracking: 85231904')}</Snippet>
        </Example>
      </Grid>
    )
  },
}

/** Too long for its box: it scrolls inside its frame, the copy button kept in view. */
export const Long: StoryObj = {
  render: () => (
    <Stage width={320}>
      <Snippet>{'https://badam.kaladan.shop/hooks/orders?secret=5f2c8a19b7e04a1d'}</Snippet>
    </Stage>
  ),
}

// ---- what it builds ------------------------------------------------------------------------------

/** An app's settings in the admin: its key and the address its events are sent to. */
export const AppKeys: StoryObj = {
  name: 'Example: an app’s keys',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={560}>
        <Card>
          <Card.Header>
            <Card.Title>{t('دسترسی برنامه', 'App access')}</Card.Title>
            <Card.Description>
              {t('این‌ها را در برنامهٔ خود بگذارید.', 'Put these in your app.')}
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <Stack gap={4}>
              <Stack gap={1}>
                <Label>{t('کلید', 'Key')}</Label>
                <Snippet copyText="kld_live_5f2c8a19b7e04a1d9e3c">
                  kld_live_5f2c••••••••9e3c
                </Snippet>
                <Description>
                  {t('مانند گذرواژه نگهش دارید.', 'Keep it as you would a password.')}
                </Description>
              </Stack>
              <Stack gap={1}>
                <Label>{t('نشانی رویدادها', 'Events address')}</Label>
                <Snippet variant="secondary">https://badam.kaladan.shop/hooks/orders</Snippet>
              </Stack>
            </Stack>
          </Card.Content>
        </Card>
      </Stage>
    )
  },
}

/** An order's parcel in the admin: its tracking number, to paste into the post's site. */
export const Tracking: StoryObj = {
  name: 'Example: a parcel’s tracking number',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420}>
        <Card variant="secondary">
          <Stack gap={3}>
            <Stack direction="horizontal" justify="between" align="center">
              <Card.Title>{t('مرسوله', 'Parcel')}</Card.Title>
              <Chip color="success">{t('ارسال شد', 'Sent')}</Chip>
            </Stack>
            <Stack gap={1}>
              <Text size="sm" tone="muted">
                {t('کد رهگیری پست', 'Post tracking number')}
              </Text>
              <Snippet size="sm">852319047712</Snippet>
            </Stack>
          </Stack>
        </Card>
      </Stage>
    )
  },
}

/** A discount code given to a buyer on the storefront, to copy into the cart. */
export const DiscountCode: StoryObj = {
  name: 'Example: a discount code for a buyer',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420}>
        <Alert status="accent">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{t('۱۰٪ تخفیف شب یلدا', '10% off for Yalda night')}</Alert.Title>
            <Alert.Description>
              {t('این کد را در سبد خرید بنویسید.', 'Enter this code in your cart.')}
            </Alert.Description>
            <div style={{ marginTop: 8 }}>
              <Snippet variant="secondary" size="sm">
                YALDA
              </Snippet>
            </div>
          </Alert.Content>
        </Alert>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Pair() {
  return (
    <Stack gap={2} align="start">
      <Snippet symbol="$">bun add @kaladan/diba-react</Snippet>
      <Snippet variant="secondary">https://badam.kaladan.shop/hooks/orders</Snippet>
    </Stack>
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

/** On a Persian page and an English one: left to right on both, the copy at the frame's end. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Pair />
    </Directions>
  ),
}

/** On a phone: a long address scrolls inside its frame. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Pair />
    </Device>
  ),
}

/** A key and an address as a tree: no prompt unless the tree gives one. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 2 },
      children: [
        {
          type: 'Text',
          props: { size: 'sm', tone: 'muted' },
          children: t('کلید برنامه', 'App key'),
        },
        {
          type: 'Snippet',
          props: { copyText: 'kld_live_5f2c8a19b7e04a1d9e3c' },
          children: 'kld_live_5f2c••••9e3c',
        },
        {
          type: 'Snippet',
          props: { variant: 'secondary', size: 'sm' },
          children: 'https://badam.kaladan.shop/hooks',
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
