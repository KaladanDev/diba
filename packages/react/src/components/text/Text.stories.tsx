import type { Meta, StoryObj } from '@storybook/react-vite'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT } from '../../stories/kit'
import { Card } from '../card'
import { Text } from './Text'

// The Text, every option it has and what it says. The docs page is Text.mdx. A line comment, not a
// doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Typography/Text',
  component: Text,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Text>

export default meta

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
type Weight = 'normal' | 'medium' | 'semibold' | 'bold'
type Tone = 'default' | 'muted' | 'primary' | 'accent' | 'success' | 'warning' | 'danger'

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  size: Size
  weight: Weight
  tone: Tone
  align: 'start' | 'center' | 'end'
  leading: 'tight' | 'snug' | 'normal' | 'relaxed'
  truncate: boolean
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    size: 'md',
    weight: 'normal',
    tone: 'default',
    align: 'start',
    leading: 'normal',
    truncate: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'],
      description: 'Its size on the type scale: md is 16.',
      table: { category: 'Text', defaultValue: { summary: 'md' } },
    },
    weight: {
      control: 'inline-radio',
      options: ['normal', 'medium', 'semibold', 'bold'],
      table: { category: 'Text', defaultValue: { summary: 'normal' } },
    },
    tone: {
      control: 'inline-radio',
      options: ['default', 'muted', 'accent', 'success', 'warning', 'danger', 'primary'],
      description:
        'Its colour: the text’s, muted for notes, or a status’s that reads on a surface.',
      table: { category: 'Text', defaultValue: { summary: 'default' } },
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      description: 'Start and end follow the page’s direction.',
      table: { category: 'Text' },
    },
    leading: {
      control: 'inline-radio',
      options: ['tight', 'snug', 'normal', 'relaxed'],
      description: 'The space between its lines.',
      table: { category: 'Text', defaultValue: { summary: 'normal' } },
    },
    truncate: {
      description: 'One line, cut with an ellipsis.',
      table: { category: 'Text', defaultValue: { summary: 'false' } },
    },
  },
  render: function Render(args) {
    const t = useT()
    return (
      <Stage width={420} surface>
        <Text as="p" {...args}>
          {t(
            'چای سیاه بهاره از باغ‌های لاهیجان، چیده در اردیبهشت و خشک‌شده در سایه.',
            'Spring black tea from the gardens of Lahijan, picked in May and dried in the shade.',
          )}
        </Text>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** The type scale, xs to 5xl. */
export const Sizes: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={720} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const).map((size) => (
            <Text key={size} size={size}>
              {size} · {t('چای لاهیجان', 'Lahijan tea')}
            </Text>
          ))}
        </div>
      </Stage>
    )
  },
}

/** Its weights. */
export const Weights: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={520} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(['normal', 'medium', 'semibold', 'bold'] as const).map((weight) => (
            <Text key={weight} weight={weight} size="lg">
              {weight} · {t('چای لاهیجان', 'Lahijan tea')}
            </Text>
          ))}
        </div>
      </Stage>
    )
  },
}

/** Its colours: the text's, muted, and a status's. */
export const Tones: StoryObj = {
  render: function Render() {
    const t = useT()
    const said: Record<Tone, string> = {
      default: t('متن', 'The text'),
      muted: t('یادداشت', 'A note'),
      accent: t('پوستهٔ تازه', 'A new theme'),
      success: t('ارسال شد', 'Shipped'),
      warning: t('موجودی رو به پایان', 'Running low'),
      danger: t('پرداخت انجام نشد', 'The payment failed'),
      primary: t('همان رنگ تأکید', 'The accent’s colour'),
    }
    return (
      <Grid min={160}>
        {(Object.keys(said) as Tone[]).map((tone) => (
          <Example key={tone} title={tone}>
            <Text tone={tone}>{said[tone]}</Text>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** One line, cut with an ellipsis, however narrow. */
export const Truncated: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={220} surface>
        <Text as="p" truncate>
          {t(
            'شال ابریشمی دست‌باف با نقش جهان، ۷۰ در ۱۸۰',
            'Hand-woven silk scarf, Naqsh-e Jahan, 70 by 180',
          )}
        </Text>
      </Stage>
    )
  },
}

/** As another element: a heading a screen reader can jump to. */
export const AsAHeading: StoryObj = {
  name: 'As a heading',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={520} surface>
        <Text as="h2" size="xl" weight="semibold">
          {t('سفارش‌های امروز', 'Today’s orders')}
        </Text>
        <Text as="p" tone="muted" size="sm">
          {t('۱۲ سفارش، ۳ در انتظار پرداخت.', '12 orders, 3 awaiting payment.')}
        </Text>
      </Stage>
    )
  },
}

// ---- what it says --------------------------------------------------------------------------------

/** The admin's figure: a muted name, a large number, a status's line under it. */
export const Figure: StoryObj = {
  name: 'Example: a figure',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={280}>
        <Card>
          <Card.Content>
            <Text size="sm" tone="muted">
              {t('فروش امروز', 'Sales today')}
            </Text>
            <Text size="2xl" weight="semibold">
              {t('۴٬۲۰۰٬۰۰۰ تومان', '4,200,000 toman')}
            </Text>
            <Text size="xs" tone="success">
              {t('۱۲٪ بیش از دیروز', '12% over yesterday')}
            </Text>
          </Card.Content>
        </Card>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

/** In both themes. */
export const LightAndDark: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Themes>
        <Text size="lg" weight="medium">
          {t('چای لاهیجان', 'Lahijan tea')}
        </Text>
        <Text tone="muted" size="sm">
          {t('۵۰۰ گرم، بهاره', '500 g, spring')}
        </Text>
      </Themes>
    )
  },
}

/** On a Persian page and an English one: start and end follow it. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: function Render() {
    const t = useT()
    return (
      <Directions>
        <Text as="p" align="start">
          {t('آغاز', 'Start')}
        </Text>
        <Text as="p" align="end">
          {t('پایان', 'End')}
        </Text>
      </Directions>
    )
  },
}

/** On a phone. */
export const OnAPhone: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Device>
        <Text as="h2" size="xl" weight="semibold">
          {t('چای لاهیجان', 'Lahijan tea')}
        </Text>
        <Text as="p" tone="muted" size="sm">
          {t('چای سیاه بهاره، ۵۰۰ گرم.', 'Spring black tea, 500 g.')}
        </Text>
      </Device>
    )
  },
}

/** The same words as a tree; a number in the reader's digits and currency. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 1 },
      children: [
        {
          type: 'Text',
          props: { size: 'sm', tone: 'muted' },
          children: t('فروش امروز', 'Sales today'),
        },
        {
          type: 'Text',
          props: {
            size: '2xl',
            weight: 'semibold',
            number: 4200000,
            formatStyle: 'currency',
            currency: 'IRT',
          },
        },
        {
          type: 'Text',
          props: { size: 'xs', tone: 'success' },
          children: t('۱۲٪ بیش از دیروز', '12% over yesterday'),
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
