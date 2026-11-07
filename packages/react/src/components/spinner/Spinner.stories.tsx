import type { Meta, StoryObj } from '@storybook/react-vite'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT } from '../../stories/kit'
import { Card } from '../card'
import { Spinner } from './index'

// The Spinner, every option it has and where it waits. The docs page is Spinner.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Feedback/Spinner',
  component: Spinner,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Spinner>

export default meta

type Size = 'sm' | 'md' | 'lg' | 'xl'
type Color = 'accent' | 'current' | 'success' | 'warning' | 'danger'

// ---- the playground ------------------------------------------------------------------------------

/** Every option on the controls. */
export const Playground: StoryObj<{ size: Size; color: Color }> = {
  args: { size: 'md', color: 'accent' },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'xl'],
      description: '16, 24, 32 or 40 across.',
      table: { category: 'Spinner', defaultValue: { summary: 'md' } },
    },
    color: {
      control: 'inline-radio',
      options: ['accent', 'current', 'success', 'warning', 'danger'],
      description: 'The status’s solid colour, or current for the text’s.',
      table: { category: 'Spinner', defaultValue: { summary: 'accent' } },
    },
  },
  render: function Render(args) {
    const t = useT()
    return (
      <Stage width={320}>
        <Example title={t('در حال بارگذاری', 'Loading')}>
          <Spinner {...args} />
        </Example>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Its sizes: 16, 24, 32 and 40 across. */
export const Sizes: StoryObj = {
  render: () => (
    <Grid min={120}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Example key={size} title={size}>
          <Spinner size={size} />
        </Example>
      ))}
    </Grid>
  ),
}

/** Its colours: the brand's, a status's, or the words' round it. */
export const Colors: StoryObj = {
  render: () => (
    <Grid min={120}>
      {(['accent', 'success', 'warning', 'danger', 'current'] as const).map((color) => (
        <Example key={color} title={color}>
          <span className="text-foreground">
            <Spinner color={color} />
          </span>
        </Example>
      ))}
    </Grid>
  ),
}

/** Beside words that say what it waits for: small, in their colour. */
export const WithWords: StoryObj = {
  name: 'Beside its words',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={360}>
        <div
          className="text-muted"
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}
        >
          <Spinner size="sm" color="current" aria-hidden />
          {t('در حال ذخیره…', 'Saving…')}
        </div>
      </Stage>
    )
  },
}

// ---- where it waits ------------------------------------------------------------------------------

/** The admin's home: a card's figures on their way, the spinner where they will be. */
export const LoadingCard: StoryObj = {
  name: 'Example: a card on its way',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={360}>
        <Card>
          <Card.Header>
            <Card.Title>{t('فروش امروز', 'Sales today')}</Card.Title>
          </Card.Header>
          <Card.Content>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
              <Spinner aria-label={t('در حال بارگذاری فروش امروز', 'Loading today’s sales')} />
            </div>
          </Card.Content>
        </Card>
      </Stage>
    )
  },
}

/** The storefront's search: results on their way, under the field. */
export const Searching: StoryObj = {
  name: 'Example: a storefront’s search',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={480}>
        <div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
          className="text-muted"
        >
          <Spinner size="lg" aria-hidden />
          <span style={{ fontSize: 14 }}>{t('در جست‌وجوی «شال»…', 'Searching for “scarf”…')}</span>
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Row() {
  const t = useT()
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" color="success" />
      <span className="text-muted" style={{ fontSize: 14 }}>
        {t('در حال بارگذاری…', 'Loading…')}
      </span>
    </div>
  )
}

/** In both themes: the track slate-300, or slate-700 in dark. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Row />
    </Themes>
  ),
}

/** On a Persian page and an English one: it turns the same way on both. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Row />
    </Directions>
  ),
}

/** On a phone. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Row />
    </Device>
  ),
}

/** The same spinner as a block, named for a screen reader in the page's language. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Spinner',
      props: { size: 'lg', label: t('در حال بارگذاری سفارش‌ها', 'Loading orders') },
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
