import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Description } from '../description'
import { Form } from '../form'
import { Label } from '../label'
import { Switch } from './index'

// The Switch, every option it has and what it is built into. The docs page is Switch.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta: Meta = {
  title: 'Components/Controls/Switch',
  component: Switch,
  parameters: { layout: 'fullscreen' },
}

export default meta

/** Switches down the page, 24 apart, as a group's are. */
function Column({ children, width = 360 }: { children: ReactNode; width?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width, maxWidth: '100%' }}>
      {children}
    </div>
  )
}

/** A switch's parts: the track and its thumb, its words beside them, and help under them. */
function Toggle({
  label,
  help,
  ...props
}: Omit<React.ComponentProps<typeof Switch>, 'children'> & {
  label?: ReactNode
  help?: ReactNode
}) {
  return (
    <Switch {...props}>
      <Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        {label ? <Label>{label}</Label> : null}
      </Switch.Content>
      {help ? <Description>{help}</Description> : null}
    </Switch>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  label: string
  description: string
  size: 'sm' | 'md' | 'lg'
  isDisabled: boolean
  isReadOnly: boolean
}

/** Every option on the controls. Empty words take the sample's. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { label: '', description: '', size: 'md', isDisabled: false, isReadOnly: false },
  argTypes: {
    label: { control: 'text', table: { category: 'Example' } },
    description: { control: 'text', table: { category: 'Example' } },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description:
        'Material’s switch at 0.69, 0.8 or 0.91: a track 36 by 22, 42 by 26 or 48 by 29.',
      table: { category: 'Switch', defaultValue: { summary: 'md' } },
    },
    isDisabled: { table: { category: 'Switch', defaultValue: { summary: 'false' } } },
    isReadOnly: { table: { category: 'Switch', defaultValue: { summary: 'false' } } },
  },
  render: function Render(args) {
    const t = useT()
    const [on, setOn] = useState(true)
    return (
      <Stage width={480}>
        <Column>
          <Toggle
            isSelected={on}
            onChange={setOn}
            size={args.size}
            isDisabled={args.isDisabled}
            isReadOnly={args.isReadOnly}
            label={args.label || t('فروشگاه باز است', 'The shop is open')}
            help={
              args.description ||
              t(
                'بسته باشد، خریداران فقط محصولات را می‌بینند.',
                'Closed, buyers only see the products.',
              )
            }
          />
          <Value label="isSelected" value={on} />
        </Column>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Small, medium and large: the track, its thumb and its words in proportion. */
export const Sizes: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={200}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Example key={size} title={size} note={`size="${size}"`}>
            <Toggle size={size} defaultSelected label={t('اعلان سفارش', 'Order alerts')} />
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Off, on, and each disabled; read-only. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={200}>
        <Example title={t('خاموش', 'Off')}>
          <Toggle label={t('پیامک به خریدار', 'Text the buyer')} />
        </Example>
        <Example title={t('روشن', 'On')}>
          <Toggle defaultSelected label={t('پیامک به خریدار', 'Text the buyer')} />
        </Example>
        <Example title={t('غیرفعال، خاموش', 'Disabled, off')}>
          <Toggle isDisabled label={t('پیامک به خریدار', 'Text the buyer')} />
        </Example>
        <Example title={t('غیرفعال، روشن', 'Disabled, on')}>
          <Toggle isDisabled defaultSelected label={t('پیامک به خریدار', 'Text the buyer')} />
        </Example>
        <Example title={t('فقط خواندنی', 'Read-only')}>
          <Toggle isReadOnly defaultSelected label={t('پیامک به خریدار', 'Text the buyer')} />
        </Example>
      </Grid>
    )
  },
}

/** Words beside it, help under them; with no words, an aria-label. */
export const LabelAndHelp: StoryObj = {
  name: 'Label and help',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <Toggle
          defaultSelected
          label={t('حالت آزمایشی', 'Test mode')}
          help={t(
            'سفارش‌ها ثبت می‌شوند ولی پولی جابه‌جا نمی‌شود.',
            'Orders are placed but no money moves.',
          )}
        />
        <Toggle
          label={t(
            'وقتی موجودی محصولی به پنج رسید، به من و به همهٔ کارکنان انبار خبر بده',
            'Tell me and everyone in the stockroom when a product is down to five',
          )}
        />
        <Example title={t('بدون نوشته', 'With no words')} note="aria-label">
          <Toggle
            aria-label={t('نمایش شال ابریشم در فروشگاه', 'Show the silk scarf in the shop')}
          />
        </Example>
      </Column>
    )
  },
}

/** In a form: on, it sends its value under its name; off, nothing. */
export const InAForm: StoryObj = {
  name: 'In a form',
  render: function Render() {
    const t = useT()
    const [sent, setSent] = useState<Record<string, FormDataEntryValue> | null>(null)
    return (
      <Stage width={420} surface>
        <Form
          onSubmit={(e) => {
            e.preventDefault()
            setSent(Object.fromEntries(new FormData(e.currentTarget)))
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 8 }}
        >
          <Toggle name="open" defaultSelected label={t('فروشگاه باز است', 'The shop is open')} />
          <Toggle name="reviews" value="shown" label={t('نمایش نظرها', 'Show reviews')} />
          <div>
            <Button type="submit" variant="primary">
              {t('ذخیره', 'Save')}
            </Button>
          </div>
          <Value label={t('فرستاده شد', 'Sent')} value={sent} />
        </Form>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** A product's visibility in the list: each row's switch takes effect as it is turned. */
export const ProductVisibility: StoryObj = {
  name: 'Example: showing products',
  render: function Render() {
    const t = useT()
    const [shown, setShown] = useState<Record<string, boolean>>({
      scarf: true,
      tea: true,
      kilim: false,
    })
    const rows = [
      { id: 'scarf', fa: 'شال ابریشم', en: 'Silk scarf' },
      { id: 'tea', fa: 'چای لاهیجان', en: 'Lahijan tea' },
      { id: 'kilim', fa: 'گلیم دست‌باف', en: 'Hand-woven kilim' },
    ]
    return (
      <Stage width={480} surface>
        <div style={{ display: 'flex', flexDirection: 'column', padding: 8 }}>
          {rows.map((r) => (
            <div
              key={r.id}
              className="text-foreground"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 4px',
                borderBottom: '1px solid var(--separator)',
                fontSize: 14,
              }}
            >
              <span>{t(r.fa, r.en)}</span>
              <Toggle
                size="sm"
                aria-label={t(`نمایش ${r.fa} در فروشگاه`, `Show ${r.en} in the shop`)}
                isSelected={shown[r.id]}
                onChange={(on) => setShown((now) => ({ ...now, [r.id]: on }))}
              />
            </div>
          ))}
          <Value
            label={t('دیده می‌شوند', 'Shown')}
            value={rows.filter((r) => shown[r.id]).map((r) => r.id)}
          />
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <Column width={300}>
      <Toggle
        defaultSelected
        label={t('فروشگاه باز است', 'The shop is open')}
        help={t('خریداران می‌توانند بخرند.', 'Buyers can buy.')}
      />
      <Toggle label={t('حالت آزمایشی', 'Test mode')} />
      <Toggle isDisabled defaultSelected label={t('پیامک به خریدار', 'Text the buyer')} />
    </Column>
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

/** A Persian page and an English one: on is toward the end of the track, the left on a Persian page. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Sample />
    </Directions>
  ),
}

/** On a phone's width. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Sample />
    </Device>
  ),
}

/** The same switch as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Switch',
      props: {
        label: t('فروشگاه باز است', 'The shop is open'),
        description: t('خریداران می‌توانند بخرند.', 'Buyers can buy.'),
        defaultSelected: true,
      },
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
