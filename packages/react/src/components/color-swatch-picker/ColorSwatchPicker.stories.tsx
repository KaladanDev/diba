import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { Color } from 'react-aria-components'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, Value, useT } from '../../stories/kit'
import { Card, Chip, Description, Label, Stack, Text } from '../../index'
import { ColorSwatchPicker } from './index'

// The ColorSwatchPicker, every option it has and what it builds. The docs page is
// ColorSwatchPicker.mdx. A line comment, not a doc comment: the docs plugin replaces a commented
// meta's parameters with one.
const meta = {
  title: 'Components/Colors/ColorSwatchPicker',
  component: ColorSwatchPicker,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ColorSwatchPicker>

export default meta

type Variant = 'circle' | 'square'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Layout = 'grid' | 'stack'

/** Labels' colours: the five hues names and avatars take, and slate. */
const hues = [
  { hex: '#c9821f', fa: 'زعفرانی', en: 'Saffron' },
  { hex: '#a8323e', fa: 'لاکی', en: 'Garnet' },
  { hex: '#1f7a5c', fa: 'زمردی', en: 'Emerald' },
  { hex: '#2f78b5', fa: 'آسمانی', en: 'Sky' },
  { hex: '#454263', fa: 'نیلی', en: 'Iris' },
  { hex: '#64748b', fa: 'سربی', en: 'Slate' },
]

/** A scarf's colours, two of them light. */
const scarves = [
  { hex: '#8c2f39', fa: 'عنابی', en: 'Maroon' },
  { hex: '#2f4a6b', fa: 'سرمه‌ای', en: 'Navy' },
  { hex: '#e7c873', fa: 'طلایی', en: 'Gold' },
  { hex: '#f4efe6', fa: 'شیری', en: 'Cream' },
  { hex: '#2b2b2b', fa: 'مشکی', en: 'Black' },
]

/** The swatches of a list of colours, each named in the page's language. */
function Swatches({
  colors,
  disabled = [],
}: {
  colors: { hex: string; fa: string; en: string }[]
  disabled?: string[]
}) {
  const t = useT()
  return colors.map((c) => (
    <ColorSwatchPicker.Item
      key={c.hex}
      color={c.hex}
      aria-label={t(c.fa, c.en)}
      isDisabled={disabled.includes(c.hex)}
    >
      <ColorSwatchPicker.Swatch />
      <ColorSwatchPicker.Indicator />
    </ColorSwatchPicker.Item>
  ))
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = { variant: Variant; size: Size; layout: Layout; isDisabled: boolean }

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { variant: 'circle', size: 'md', layout: 'grid', isDisabled: false },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['circle', 'square'],
      description: 'Round swatches, or square ones with rounded corners.',
      table: { category: 'ColorSwatchPicker', defaultValue: { summary: 'circle' } },
    },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: '16, 24, 32, 36 or 40 across.',
      table: { category: 'ColorSwatchPicker', defaultValue: { summary: 'md' } },
    },
    layout: {
      control: 'inline-radio',
      options: ['grid', 'stack'],
      description: 'A row that wraps, or a column.',
      table: { category: 'ColorSwatchPicker', defaultValue: { summary: 'grid' } },
    },
    isDisabled: {
      control: 'boolean',
      description: 'On an item: that colour cannot be chosen.',
      table: { category: 'ColorSwatchPicker.Item', defaultValue: { summary: 'false' } },
    },
  },
  render: function Render({ isDisabled, ...props }) {
    const t = useT()
    return (
      <Stage width={360}>
        <Stack gap={2}>
          <Label id="playground-label">{t('رنگ برچسب', 'Label colour')}</Label>
          <ColorSwatchPicker {...props} aria-labelledby="playground-label" defaultValue="#1f7a5c">
            <Swatches colors={hues} disabled={isDisabled ? hues.map((h) => h.hex) : []} />
          </ColorSwatchPicker>
        </Stack>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Round or square. */
export const Shapes: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={240}>
        {(['circle', 'square'] as const).map((variant) => (
          <Example key={variant} title={`variant="${variant}"`}>
            <ColorSwatchPicker
              variant={variant}
              aria-label={t('رنگ', 'Colour')}
              defaultValue="#a8323e"
            >
              <Swatches colors={hues} />
            </ColorSwatchPicker>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Five sizes, the ring round the chosen one thicker on the larger. */
export const Sizes: StoryObj = {
  render: function Render() {
    const t = useT()
    const across = { xs: 16, sm: 24, md: 32, lg: 36, xl: 40 }
    return (
      <Grid min={240}>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Example key={size} title={`size="${size}"`} note={`${across[size]}px`}>
            <Stack gap={3}>
              {(['circle', 'square'] as const).map((variant) => (
                <ColorSwatchPicker
                  key={variant}
                  size={size}
                  variant={variant}
                  aria-label={t('رنگ', 'Colour')}
                  defaultValue="#2f78b5"
                >
                  <Swatches colors={hues.slice(0, 5)} />
                </ColorSwatchPicker>
              ))}
            </Stack>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** A row that wraps, or a column. */
export const Layouts: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={200}>
        {(['grid', 'stack'] as const).map((layout) => (
          <Example
            key={layout}
            title={`layout="${layout}"`}
            note={
              layout === 'grid' ? t('ردیفی که می‌شکند', 'A row that wraps') : t('ستونی', 'A column')
            }
          >
            <div style={{ maxWidth: 160 }}>
              <ColorSwatchPicker
                layout={layout}
                aria-label={t('رنگ', 'Colour')}
                defaultValue="#c9821f"
              >
                <Swatches colors={hues} />
              </ColorSwatchPicker>
            </div>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Chosen, the ring in its own colour and the tick on it; dark on a light colour. */
export const Chosen: StoryObj = {
  name: 'The chosen one',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={200}>
        {scarves.map((c) => (
          <Example key={c.hex} title={t(c.fa, c.en)} note={c.hex}>
            <ColorSwatchPicker size="xl" aria-label={t('رنگ', 'Colour')} value={c.hex}>
              <Swatches colors={[c]} />
            </ColorSwatchPicker>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Its value, held by the page: a colour, which says itself as #rrggbb. */
export const Controlled: StoryObj = {
  render: function Render() {
    const t = useT()
    const [value, setValue] = useState<Color | string>('#2f78b5')
    return (
      <Stage width={360}>
        <Stack gap={3}>
          <ColorSwatchPicker
            aria-label={t('رنگ برچسب', 'Label colour')}
            value={value}
            onChange={setValue}
          >
            <Swatches colors={hues} />
          </ColorSwatchPicker>
          <Value label="value" value={typeof value === 'string' ? value : value.toString('hex')} />
        </Stack>
      </Stage>
    )
  },
}

/** A colour that cannot be chosen: a scarf's sold out one. */
export const Disabled: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={360}>
        <Stack gap={2}>
          <ColorSwatchPicker aria-label={t('رنگ', 'Colour')} defaultValue="#8c2f39">
            <Swatches colors={scarves} disabled={['#e7c873']} />
          </ColorSwatchPicker>
          <Text size="xs" tone="muted">
            {t('طلایی ناموجود است.', 'Gold is sold out.')}
          </Text>
        </Stack>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** The admin's labels: a label's colour, its chip shown as it will be. */
export const LabelColour: StoryObj = {
  name: 'Example: a label’s colour',
  render: function Render() {
    const t = useT()
    const [value, setValue] = useState<Color | string>('#1f7a5c')
    const hex = (typeof value === 'string' ? value : value.toString('hex')).toLowerCase()
    const hue = hues.find((h) => h.hex === hex) ?? hues[0]!
    return (
      <Stage width={420}>
        <Card>
          <Card.Header>
            <Card.Title>{t('برچسب تازه', 'A new label')}</Card.Title>
          </Card.Header>
          <Card.Content>
            <Stack gap={4}>
              <Stack gap={2}>
                <Label id="label-colour">{t('رنگ', 'Colour')}</Label>
                <ColorSwatchPicker
                  aria-labelledby="label-colour"
                  value={value}
                  onChange={setValue}
                  size="sm"
                >
                  <Swatches colors={hues} />
                </ColorSwatchPicker>
              </Stack>
              <Stack direction="horizontal" gap={2} align="center">
                <Text size="sm" tone="muted">
                  {t('پیش‌نمایش', 'Preview')}
                </Text>
                <Chip style={{ background: `${hue.hex}1f`, color: hue.hex }}>
                  {t('مشتری ویژه', 'VIP customer')}
                </Chip>
              </Stack>
            </Stack>
          </Card.Content>
        </Card>
      </Stage>
    )
  },
}

/** The admin's theme settings: the storefront's accent, from the theme's own. */
export const ThemeAccent: StoryObj = {
  name: 'Example: a theme’s accent',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420}>
        <Card variant="secondary">
          <Stack gap={2}>
            <Label id="accent-label">{t('رنگ اصلی ویترین', 'Storefront accent')}</Label>
            <ColorSwatchPicker
              aria-labelledby="accent-label"
              aria-describedby="accent-help"
              variant="square"
              size="lg"
              defaultValue="#c9821f"
            >
              <Swatches colors={hues.slice(0, 5)} />
            </ColorSwatchPicker>
            <Description id="accent-help">
              {t(
                'دکمه‌ها و پیوندهای ویترین این رنگ را می‌گیرند.',
                'The storefront’s buttons and links take it.',
              )}
            </Description>
          </Stack>
        </Card>
      </Stage>
    )
  },
}

/** A product's page on the storefront: its colours, the chosen one named beside its label. */
export const ProductColours: StoryObj = {
  name: 'Example: a product’s colours',
  render: function Render() {
    const t = useT()
    const [value, setValue] = useState<Color | string>('#2f4a6b')
    const hex = (typeof value === 'string' ? value : value.toString('hex')).toLowerCase()
    const chosen = scarves.find((s) => s.hex === hex)
    return (
      <Stage width={360}>
        <Stack gap={2}>
          <Text size="sm">
            <span id="scarf-colour" style={{ fontWeight: 500 }}>
              {t('رنگ', 'Colour')}
            </span>
            {chosen ? (
              <Text tone="muted" as="span">
                {t(`: ${chosen.fa}`, `: ${chosen.en}`)}
              </Text>
            ) : null}
          </Text>
          <ColorSwatchPicker
            aria-labelledby="scarf-colour"
            value={value}
            onChange={setValue}
            size="lg"
          >
            <Swatches colors={scarves} disabled={['#f4efe6']} />
          </ColorSwatchPicker>
          <Text size="xs" tone="muted">
            {t('شیری ناموجود است.', 'Cream is sold out.')}
          </Text>
        </Stack>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Both() {
  const t = useT()
  return (
    <Stack gap={4}>
      <Stack gap={2}>
        <Label id="both-label">{t('رنگ برچسب', 'Label colour')}</Label>
        <ColorSwatchPicker aria-labelledby="both-label" defaultValue="#a8323e">
          <Swatches colors={hues} />
        </ColorSwatchPicker>
      </Stack>
      <Stack gap={2}>
        <Label id="both-scarf">{t('رنگ شال', 'Scarf colour')}</Label>
        <ColorSwatchPicker aria-labelledby="both-scarf" variant="square" defaultValue="#f4efe6">
          <Swatches colors={scarves} />
        </ColorSwatchPicker>
      </Stack>
    </Stack>
  )
}

/** In both themes: the ring round the chosen one on either paper. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Both />
    </Themes>
  ),
}

/** On a Persian page and an English one: the row starts at the right in Persian. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Both />
    </Directions>
  ),
}

/** On a phone. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Both />
    </Device>
  ),
}

/** The colours an app sends, as a tree; the one chosen goes back as #rrggbb. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'ColorSwatchPicker',
      props: {
        label: t('رنگ برچسب', 'Label colour'),
        colors: hues.map((h) => h.hex),
        defaultValue: '#1f7a5c',
      },
      actions: { onChange: { do: 'call', action: 'labels.colour' } },
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
