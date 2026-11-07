import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Description } from '../description'
import { FieldError } from '../field-error'
import { Form } from '../form'
import { Label } from '../label'
import { Checkbox } from './index'

// The Checkbox, every option it has and what it is built into. The docs page is Checkbox.mdx. A
// line comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta: Meta = {
  title: 'Components/Forms/Checkbox',
  component: Checkbox,
  parameters: { layout: 'fullscreen' },
}

export default meta

/** Options down the page, 16 apart. */
function Column({ children, width = 360 }: { children: ReactNode; width?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width, maxWidth: '100%' }}>
      {children}
    </div>
  )
}

/** A checkbox's parts: the box, its words beside it, and help or an error under them. */
function Box({
  label,
  help,
  error,
  ...props
}: Omit<React.ComponentProps<typeof Checkbox>, 'children'> & {
  label?: ReactNode
  help?: ReactNode
  /** Its words, or true for what its own check finds. */
  error?: ReactNode | true
}) {
  return (
    <Checkbox {...props}>
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        {label ? <Label>{label}</Label> : null}
      </Checkbox.Content>
      {help ? <Description>{help}</Description> : null}
      {error === true ? <FieldError /> : error ? <FieldError>{error}</FieldError> : null}
    </Checkbox>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  label: string
  description: string
  isIndeterminate: boolean
  variant: 'primary' | 'secondary'
  isRequired: boolean
  isDisabled: boolean
  isReadOnly: boolean
  isInvalid: boolean
}

/** Every option on the controls. Empty words take the sample's. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    label: '',
    description: '',
    isIndeterminate: false,
    variant: 'primary',
    isRequired: false,
    isDisabled: false,
    isReadOnly: false,
    isInvalid: false,
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Example' } },
    description: { control: 'text', table: { category: 'Example' } },
    isIndeterminate: {
      description: 'Neither on nor off: some of what it stands for is chosen.',
      table: { category: 'Checkbox', defaultValue: { summary: 'false' } },
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      description: 'secondary for a checkbox on a grey surface.',
      table: { category: 'Checkbox', defaultValue: { summary: 'primary' } },
    },
    isRequired: { table: { category: 'Checkbox', defaultValue: { summary: 'false' } } },
    isDisabled: { table: { category: 'Checkbox', defaultValue: { summary: 'false' } } },
    isReadOnly: { table: { category: 'Checkbox', defaultValue: { summary: 'false' } } },
    isInvalid: {
      description: 'With a FieldError under it.',
      table: { category: 'Checkbox', defaultValue: { summary: 'false' } },
    },
  },
  render: function Render(args) {
    const t = useT()
    const [selected, setSelected] = useState(true)
    return (
      <Stage width={480} surface={args.variant === 'secondary'}>
        <Column>
          <Box
            isSelected={selected}
            onChange={setSelected}
            isIndeterminate={args.isIndeterminate}
            variant={args.variant}
            isRequired={args.isRequired}
            isDisabled={args.isDisabled}
            isReadOnly={args.isReadOnly}
            isInvalid={args.isInvalid}
            label={args.label || t('موجودی را دنبال کن', 'Track stock')}
            help={
              args.description ||
              t('با هر فروش از موجودی کم می‌شود.', 'Each sale takes one from the stock.')
            }
            error={t('برای این محصول لازم است.', 'This product needs it.')}
          />
          <Value label="isSelected" value={selected} />
        </Column>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Off, on, and neither; each disabled too. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={220}>
        <Example title={t('خاموش', 'Off')}>
          <Box label={t('بسته‌بندی کادویی', 'Gift wrap')} />
        </Example>
        <Example title={t('روشن', 'On')}>
          <Box label={t('بسته‌بندی کادویی', 'Gift wrap')} defaultSelected />
        </Example>
        <Example title={t('نیمه', 'Mixed')} note="isIndeterminate">
          <Box label={t('همهٔ رنگ‌ها', 'All colours')} isIndeterminate />
        </Example>
        <Example title={t('غیرفعال، خاموش', 'Disabled, off')}>
          <Box label={t('بسته‌بندی کادویی', 'Gift wrap')} isDisabled />
        </Example>
        <Example title={t('غیرفعال، روشن', 'Disabled, on')}>
          <Box label={t('بسته‌بندی کادویی', 'Gift wrap')} isDisabled defaultSelected />
        </Example>
        <Example title={t('فقط خواندنی', 'Read-only')}>
          <Box label={t('بسته‌بندی کادویی', 'Gift wrap')} isReadOnly defaultSelected />
        </Example>
      </Grid>
    )
  },
}

/** Words beside it, help under them; a long label wraps beside the box. */
export const LabelAndHelp: StoryObj = {
  name: 'Label and help',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <Box
          label={t('فروش با موجودی صفر', 'Sell when out of stock')}
          help={t(
            'سفارش پذیرفته می‌شود و پس از رسیدن کالا فرستاده می‌شود.',
            'Orders are taken and sent once the goods arrive.',
          )}
        />
        <Box
          defaultSelected
          label={t(
            'نام فروشگاه را روی برچسب ارسال چاپ کن، تا خریدار بسته را در میان بسته‌های دیگر بشناسد',
            'Print the shop’s name on the shipping label, so the buyer knows the parcel among the others',
          )}
        />
        <Example title={t('بدون نوشته', 'With no words')} note="aria-label">
          <Box aria-label={t('انتخاب سفارش ۱۲۴۰', 'Select order 1240')} />
        </Example>
      </Column>
    )
  },
}

/** "All" over a list: on when all are, off when none, and mixed between. */
export const SelectAll: StoryObj = {
  name: 'Choosing all',
  render: function Render() {
    const t = useT()
    const colours = [
      { id: 'red', fa: 'زرشکی', en: 'Crimson' },
      { id: 'teal', fa: 'فیروزه‌ای', en: 'Turquoise' },
      { id: 'gold', fa: 'طلایی', en: 'Gold' },
    ]
    const [chosen, setChosen] = useState<string[]>(['red'])
    const all = chosen.length === colours.length
    return (
      <Column>
        <Box
          label={t('همهٔ رنگ‌ها', 'All colours')}
          isSelected={all}
          isIndeterminate={chosen.length > 0 && !all}
          onChange={(on) => setChosen(on ? colours.map((c) => c.id) : [])}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingInlineStart: 28 }}>
          {colours.map((c) => (
            <Box
              key={c.id}
              label={t(c.fa, c.en)}
              isSelected={chosen.includes(c.id)}
              onChange={(on) =>
                setChosen((now) => (on ? [...now, c.id] : now.filter((id) => id !== c.id)))
              }
            />
          ))}
        </div>
        <Value label="chosen" value={chosen} />
      </Column>
    )
  },
}

/** Required, and what the server said. */
export const Validation: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <Box
          isInvalid
          label={t('شرایط فروشگاه را خوانده‌ام', 'I have read the shop’s terms')}
          error={t('برای ثبت سفارش لازم است.', 'Needed to place the order.')}
        />
        <Box
          isInvalid
          defaultSelected
          label={t('ارسال با پست پیشتاز', 'Express post')}
          error={t('پست پیشتاز به این شهر نمی‌رود.', 'Express post does not reach this city.')}
        />
      </Column>
    )
  },
}

/** On a grey surface, the secondary variant. */
export const OnASurface: StoryObj = {
  name: 'On a grey surface',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420} surface>
        <Column>
          <Box variant="secondary" label={t('بسته‌بندی کادویی', 'Gift wrap')} />
          <Box
            variant="secondary"
            defaultSelected
            label={t('فاکتور در بسته', 'Invoice in the parcel')}
          />
        </Column>
      </Stage>
    )
  },
}

/** In a form: on, it sends its value under its name; a required one left off stops the form. */
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
          style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}
        >
          <Box name="newsletter" value="yes" defaultSelected label={t('خبرنامه', 'Newsletter')} />
          <Box
            name="terms"
            value="accepted"
            isRequired
            label={t('شرایط را می‌پذیرم', 'I accept the terms')}
            error
          />
          <div>
            <Button type="submit" variant="primary">
              {t('ثبت', 'Submit')}
            </Button>
          </div>
          <Value label={t('فرستاده شد', 'Sent')} value={sent} />
        </Form>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** A product's stock settings, as the product page asks them. */
export const StockSettings: StoryObj = {
  name: 'Example: stock settings',
  render: function Render() {
    const t = useT()
    const [track, setTrack] = useState(true)
    return (
      <Stage width={520} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}>
          <span className="text-foreground" style={{ fontSize: 16, fontWeight: 600 }}>
            {t('موجودی', 'Inventory')}
          </span>
          <Box
            isSelected={track}
            onChange={setTrack}
            label={t('موجودی را دنبال کن', 'Track stock')}
            help={t('با هر فروش از موجودی کم می‌شود.', 'Each sale takes one from the stock.')}
          />
          <Box
            isDisabled={!track}
            label={t('فروش با موجودی صفر', 'Sell when out of stock')}
            help={t(
              'سفارش پذیرفته می‌شود و بعد فرستاده می‌شود.',
              'Orders are taken and sent later.',
            )}
          />
          <Box defaultSelected label={t('این محصول مالیات دارد', 'Charge tax on this product')} />
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
      <Box
        defaultSelected
        label={t('موجودی را دنبال کن', 'Track stock')}
        help={t('با هر فروش کم می‌شود.', 'Each sale takes one.')}
      />
      <Box label={t('بسته‌بندی کادویی', 'Gift wrap')} />
      <Box isIndeterminate label={t('همهٔ رنگ‌ها', 'All colours')} />
      <Box isDisabled defaultSelected label={t('ارسال رایگان', 'Free delivery')} />
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

/** A Persian page and an English one: the box at the start, its words after it. */
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

/** The same checkbox as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 4 },
      children: [
        {
          type: 'Checkbox',
          props: {
            label: t('موجودی را دنبال کن', 'Track stock'),
            description: t(
              'با هر فروش از موجودی کم می‌شود.',
              'Each sale takes one from the stock.',
            ),
            defaultSelected: true,
          },
        },
        {
          type: 'Checkbox',
          props: {
            label: t('شرایط را می‌پذیرم', 'I accept the terms'),
            errorMessage: t('برای ادامه لازم است.', 'Needed to go on.'),
          },
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
