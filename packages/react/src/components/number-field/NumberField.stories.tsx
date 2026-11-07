import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Description } from '../description'
import { FieldError } from '../field-error'
import { Form } from '../form'
import { Label } from '../label'
import { NumberField } from './index'

// The NumberField, every option it has and what it is built into. The docs page is
// NumberField.mdx. A line comment, not a doc comment: the docs plugin replaces a commented meta's
// parameters with one.
const meta: Meta = {
  title: 'Components/Forms/NumberField',
  component: NumberField,
  parameters: { layout: 'fullscreen' },
}

export default meta

/** Fields down the page, 20 apart, as wide as a form's column. */
function Column({ children, width = 320 }: { children: ReactNode; width?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width, maxWidth: '100%' }}>
      {children}
    </div>
  )
}

/** The box: − and + either side of the figure, and a word after it when there is one. */
function Insides({ steppers = true, unit }: { steppers?: boolean; unit?: string }) {
  return (
    <NumberField.Group>
      {steppers ? <NumberField.DecrementButton /> : null}
      <NumberField.Input />
      {unit ? <span data-slot="unit">{unit}</span> : null}
      {steppers ? <NumberField.IncrementButton /> : null}
    </NumberField.Group>
  )
}

/** Toman has no currency code: a whole number, and the word beside it. */
const TOMAN = { maximumFractionDigits: 0 } satisfies Intl.NumberFormatOptions

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  label: string
  format: 'decimal' | 'percent' | 'toman' | 'dollar'
  minValue: number
  maxValue: number
  step: number
  steppers: boolean
  variant: 'primary' | 'secondary'
  isRequired: boolean
  isDisabled: boolean
  isReadOnly: boolean
  isInvalid: boolean
}

const FORMATS: Record<PlaygroundArgs['format'], Intl.NumberFormatOptions> = {
  decimal: {},
  percent: { style: 'percent' },
  toman: TOMAN,
  dollar: { style: 'currency', currency: 'USD' },
}

/** Every option on the controls. Empty words take the sample's. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    label: '',
    format: 'decimal',
    minValue: 0,
    maxValue: 100,
    step: 1,
    steppers: true,
    variant: 'primary',
    isRequired: false,
    isDisabled: false,
    isReadOnly: false,
    isInvalid: false,
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Example' } },
    format: {
      control: 'inline-radio',
      options: ['decimal', 'percent', 'toman', 'dollar'],
      description:
        'formatOptions: a plain number, a percent of a fraction, toman with its word, a currency.',
      table: { category: 'NumberField' },
    },
    minValue: { control: 'number', table: { category: 'NumberField' } },
    maxValue: { control: 'number', table: { category: 'NumberField' } },
    step: {
      control: { type: 'number', min: 0.01 },
      description: 'What − and + and the arrow keys add; the value snaps to it on leaving.',
      table: { category: 'NumberField', defaultValue: { summary: '1' } },
    },
    steppers: {
      description: 'The − and + buttons; without them the figure sits at the start.',
      table: { category: 'Example' },
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      description: 'secondary for a field on a grey surface.',
      table: { category: 'NumberField', defaultValue: { summary: 'primary' } },
    },
    isRequired: { table: { category: 'NumberField', defaultValue: { summary: 'false' } } },
    isDisabled: { table: { category: 'NumberField', defaultValue: { summary: 'false' } } },
    isReadOnly: { table: { category: 'NumberField', defaultValue: { summary: 'false' } } },
    isInvalid: {
      description: 'With a FieldError under it.',
      table: { category: 'NumberField', defaultValue: { summary: 'false' } },
    },
  },
  render: function Render(args) {
    const t = useT()
    const [value, setValue] = useState(args.format === 'percent' ? 0.15 : 12)
    return (
      <Stage width={480} surface={args.variant === 'secondary'}>
        <Column>
          <NumberField
            value={value}
            onChange={setValue}
            formatOptions={FORMATS[args.format]}
            minValue={args.minValue}
            maxValue={args.maxValue}
            step={args.step}
            variant={args.variant}
            isRequired={args.isRequired}
            isDisabled={args.isDisabled}
            isReadOnly={args.isReadOnly}
            isInvalid={args.isInvalid}
            fullWidth
          >
            <Label>{args.label || t('تعداد', 'Quantity')}</Label>
            <Insides
              steppers={args.steppers}
              unit={args.format === 'toman' ? t('تومان', 'toman') : undefined}
            />
            <FieldError>{t('موجودی کافی نیست.', 'Not enough in stock.')}</FieldError>
          </NumberField>
          <Value label="value" value={value} />
        </Column>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** With − and + the figure is centred between them; without them it sits at the start. */
export const Steppers: StoryObj = {
  name: 'With and without steppers',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={260}>
        <Example title={t('با − و +', 'With − and +')}>
          <NumberField defaultValue={3} minValue={1} fullWidth>
            <Label>{t('تعداد', 'Quantity')}</Label>
            <Insides />
          </NumberField>
        </Example>
        <Example title={t('بدون آن‌ها', 'Without them')}>
          <NumberField defaultValue={120} minValue={0} fullWidth>
            <Label>{t('موجودی انبار', 'In stock')}</Label>
            <Insides steppers={false} />
          </NumberField>
        </Example>
      </Grid>
    )
  },
}

/** A number, a percent, toman, and another currency, each in the page's digits. */
export const Formats: StoryObj = {
  name: 'Formats',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={260}>
        <Example title={t('عدد', 'A number')} note="maximumFractionDigits: 1">
          <NumberField
            defaultValue={1.5}
            step={0.5}
            formatOptions={{ maximumFractionDigits: 1 }}
            fullWidth
          >
            <Label>{t('وزن (کیلوگرم)', 'Weight (kg)')}</Label>
            <Insides steppers={false} />
          </NumberField>
        </Example>
        <Example title={t('درصد', 'A percent')} note="style: 'percent', 0.15">
          <NumberField
            defaultValue={0.15}
            step={0.01}
            minValue={0}
            maxValue={1}
            formatOptions={{ style: 'percent' }}
            fullWidth
          >
            <Label>{t('تخفیف', 'Discount')}</Label>
            <Insides />
          </NumberField>
        </Example>
        <Example title={t('تومان', 'Toman')} note={t('با واژه‌اش کنار عدد', 'Its word beside it')}>
          <NumberField defaultValue={1250000} minValue={0} formatOptions={TOMAN} fullWidth>
            <Label>{t('قیمت', 'Price')}</Label>
            <Insides steppers={false} unit={t('تومان', 'toman')} />
          </NumberField>
        </Example>
        <Example title={t('ارز دیگر', 'Another currency')} note="style: 'currency', USD">
          <NumberField
            defaultValue={24.5}
            minValue={0}
            formatOptions={{ style: 'currency', currency: 'USD' }}
            fullWidth
          >
            <Label>{t('قیمت به دلار', 'Price in dollars')}</Label>
            <Insides steppers={false} />
          </NumberField>
        </Example>
      </Grid>
    )
  },
}

/** Kept between its least and most, and snapped to its step when the reader leaves it. */
export const RangeAndStep: StoryObj = {
  name: 'Least, most and step',
  render: function Render() {
    const t = useT()
    const [value, setValue] = useState(500)
    return (
      <Column>
        <NumberField
          value={value}
          onChange={setValue}
          minValue={0}
          maxValue={5000}
          step={250}
          formatOptions={TOMAN}
          fullWidth
        >
          <Label>{t('هزینهٔ ارسال', 'Delivery fee')}</Label>
          <Insides unit={t('تومان', 'toman')} />
          <Description>
            {t('از ۰ تا ۵٬۰۰۰، گام‌های ۲۵۰ تومانی.', 'From 0 to 5,000, in steps of 250.')}
          </Description>
        </NumberField>
        <Value label="value" value={value} />
      </Column>
    )
  },
}

/** Required, your own check, and what the server said. */
export const Validation: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <NumberField
          defaultValue={12}
          minValue={0}
          validationBehavior="aria"
          validate={(value) =>
            value > 8 ? t('فقط ۸ عدد در انبار است.', 'Only 8 are in stock.') : null
          }
          fullWidth
        >
          <Label>{t('تعداد', 'Quantity')}</Label>
          <Insides />
          <FieldError />
        </NumberField>
        <NumberField isInvalid defaultValue={900000} formatOptions={TOMAN} fullWidth>
          <Label>{t('قیمت با تخفیف', 'Sale price')}</Label>
          <Insides steppers={false} unit={t('تومان', 'toman')} />
          <FieldError>{t('از قیمت اصلی بیشتر است.', 'It is more than the full price.')}</FieldError>
        </NumberField>
      </Column>
    )
  },
}

/** Disabled, read-only, and on a grey surface. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={240}>
        <Example title={t('غیرفعال', 'Disabled')}>
          <NumberField isDisabled defaultValue={3} fullWidth>
            <Label>{t('تعداد', 'Quantity')}</Label>
            <Insides />
          </NumberField>
        </Example>
        <Example title={t('فقط خواندنی', 'Read-only')}>
          <NumberField isReadOnly defaultValue={3} fullWidth>
            <Label>{t('تعداد', 'Quantity')}</Label>
            <Insides />
          </NumberField>
        </Example>
        <Example title={t('روی زمینهٔ خاکستری', 'On a grey surface')} note='variant="secondary"'>
          <Stage width="100%" surface>
            <NumberField variant="secondary" defaultValue={3} fullWidth>
              <Label>{t('تعداد', 'Quantity')}</Label>
              <Insides />
            </NumberField>
          </Stage>
        </Example>
      </Grid>
    )
  },
}

/** Its name sends the number, as Latin digits, whatever the page shows. */
export const InAForm: StoryObj = {
  name: 'In a form',
  render: function Render() {
    const t = useT()
    const [sent, setSent] = useState<Record<string, FormDataEntryValue> | null>(null)
    return (
      <Column>
        <Form
          onSubmit={(e) => {
            e.preventDefault()
            setSent(Object.fromEntries(new FormData(e.currentTarget)))
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <NumberField
            name="price"
            isRequired
            defaultValue={1250000}
            formatOptions={TOMAN}
            fullWidth
          >
            <Label>{t('قیمت', 'Price')}</Label>
            <Insides steppers={false} unit={t('تومان', 'toman')} />
            <FieldError />
          </NumberField>
          <NumberField name="stock" defaultValue={8} minValue={0} fullWidth>
            <Label>{t('موجودی', 'Stock')}</Label>
            <Insides />
          </NumberField>
          <div>
            <Button type="submit" variant="primary">
              {t('ذخیره', 'Save')}
            </Button>
          </div>
        </Form>
        <Value label={t('فرستاده شد', 'Sent')} value={sent} />
      </Column>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** A product's price, its sale price and its stock, as the product page asks them. */
export const PriceAndStock: StoryObj = {
  name: 'Example: price and stock',
  render: function Render() {
    const t = useT()
    const [price, setPrice] = useState(1250000)
    const [sale, setSale] = useState(990000)
    const off = price > 0 ? Math.round((1 - sale / price) * 100) : 0
    return (
      <Stage width={560} surface>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            padding: 8,
          }}
        >
          <NumberField
            value={price}
            onChange={setPrice}
            minValue={0}
            formatOptions={TOMAN}
            fullWidth
          >
            <Label>{t('قیمت', 'Price')}</Label>
            <Insides steppers={false} unit={t('تومان', 'toman')} />
          </NumberField>
          <NumberField
            value={sale}
            onChange={setSale}
            minValue={0}
            maxValue={price}
            formatOptions={TOMAN}
            fullWidth
          >
            <Label>{t('قیمت با تخفیف', 'Sale price')}</Label>
            <Insides steppers={false} unit={t('تومان', 'toman')} />
            <Description>
              {t(`${new Intl.NumberFormat('fa-IR').format(off)}٪ کمتر`, `${off}% less`)}
            </Description>
          </NumberField>
          <NumberField defaultValue={8} minValue={0} fullWidth>
            <Label>{t('موجودی', 'Stock')}</Label>
            <Insides />
          </NumberField>
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
      <NumberField defaultValue={3} minValue={1} fullWidth>
        <Label>{t('تعداد', 'Quantity')}</Label>
        <Insides />
      </NumberField>
      <NumberField defaultValue={1250000} formatOptions={TOMAN} fullWidth>
        <Label>{t('قیمت', 'Price')}</Label>
        <Insides steppers={false} unit={t('تومان', 'toman')} />
      </NumberField>
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

/** A Persian page and an English one: − at the start, + at the end, the digits the page's. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Sample />
    </Directions>
  ),
}

/** On a phone's width, where it is 40 tall. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Sample />
    </Device>
  ),
}

/** The same fields as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 5 },
      children: [
        {
          type: 'NumberField',
          props: { label: t('تعداد', 'Quantity'), defaultValue: 3, minValue: 1, maxValue: 8 },
        },
        {
          type: 'NumberField',
          props: {
            label: t('قیمت', 'Price'),
            defaultValue: 1250000,
            formatStyle: 'currency',
            currency: 'IRT',
            hideSteppers: true,
          },
        },
        {
          type: 'NumberField',
          props: {
            label: t('تخفیف', 'Discount'),
            defaultValue: 0.15,
            step: 0.01,
            minValue: 0,
            maxValue: 1,
            formatStyle: 'percent',
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
