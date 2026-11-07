import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Description } from '../description'
import { FieldError } from '../field-error'
import { Form } from '../form'
import { Label } from '../label'
import { Radio } from '../radio'
import { RadioGroup } from './index'

// The RadioGroup and its Radio, every option they have and what they are built into. The docs
// page is RadioGroup.mdx. A line comment, not a doc comment: the docs plugin replaces a commented
// meta's parameters with one.
const meta: Meta = {
  title: 'Components/Forms/RadioGroup',
  component: RadioGroup,
  parameters: { layout: 'fullscreen' },
}

export default meta

/** One option: the radio, its words, and help under them. */
function Option({
  value,
  children,
  help,
  isDisabled,
}: {
  value: string
  children: ReactNode
  help?: ReactNode
  isDisabled?: boolean
}) {
  return (
    <Radio value={value} isDisabled={isDisabled}>
      <Radio.Content>
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
        <Label>{children}</Label>
      </Radio.Content>
      {help ? <Description>{help}</Description> : null}
    </Radio>
  )
}

const SHIPPING = [
  {
    id: 'post',
    fa: 'پست پیشتاز',
    en: 'Express post',
    helpFa: '۴۵٬۰۰۰ تومان، ۲ تا ۴ روز',
    helpEn: '45,000 toman, 2 to 4 days',
  },
  {
    id: 'tipax',
    fa: 'تیپاکس',
    en: 'Tipax',
    helpFa: '۶۰٬۰۰۰ تومان، ۱ تا ۳ روز',
    helpEn: '60,000 toman, 1 to 3 days',
  },
  {
    id: 'pickup',
    fa: 'تحویل حضوری',
    en: 'Collect in person',
    helpFa: 'رایگان، از فروشگاه یزد',
    helpEn: 'Free, from the Yazd shop',
  },
]

function Options({ help = false, off }: { help?: boolean; off?: string }) {
  const t = useT()
  return SHIPPING.map((s) => (
    <Option
      key={s.id}
      value={s.id}
      isDisabled={s.id === off}
      help={help ? t(s.helpFa, s.helpEn) : undefined}
    >
      {t(s.fa, s.en)}
    </Option>
  ))
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  label: string
  description: string
  orientation: 'vertical' | 'horizontal'
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
    orientation: 'vertical',
    variant: 'primary',
    isRequired: false,
    isDisabled: false,
    isReadOnly: false,
    isInvalid: false,
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Example' } },
    description: { control: 'text', table: { category: 'Example' } },
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      description: 'Down the page, or across it; the arrow keys follow.',
      table: { category: 'RadioGroup', defaultValue: { summary: 'vertical' } },
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      description: 'secondary on a grey surface.',
      table: { category: 'RadioGroup', defaultValue: { summary: 'primary' } },
    },
    isRequired: { table: { category: 'RadioGroup', defaultValue: { summary: 'false' } } },
    isDisabled: { table: { category: 'RadioGroup', defaultValue: { summary: 'false' } } },
    isReadOnly: { table: { category: 'RadioGroup', defaultValue: { summary: 'false' } } },
    isInvalid: {
      description: 'With a FieldError under it.',
      table: { category: 'RadioGroup', defaultValue: { summary: 'false' } },
    },
  },
  render: function Render(args) {
    const t = useT()
    const [value, setValue] = useState<string | null>('post')
    return (
      <Stage width={520} surface={args.variant === 'secondary'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <RadioGroup
            value={value}
            onChange={setValue}
            orientation={args.orientation}
            variant={args.variant}
            isRequired={args.isRequired}
            isDisabled={args.isDisabled}
            isReadOnly={args.isReadOnly}
            isInvalid={args.isInvalid}
          >
            <Label>{args.label || t('روش ارسال', 'Delivery method')}</Label>
            <Options />
            <Description>{args.description || t('برای این سفارش.', 'For this order.')}</Description>
            <FieldError>
              {t('این روش به شهر خریدار نمی‌رود.', 'This method does not reach the buyer’s city.')}
            </FieldError>
          </RadioGroup>
          <Value label="value" value={value} />
        </div>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Down the page, or across it. */
export const Orientation: StoryObj = {
  name: 'Down and across',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        <Example title={t('زیر هم', 'Down')} note='orientation="vertical"'>
          <RadioGroup defaultValue="post">
            <Label>{t('روش ارسال', 'Delivery method')}</Label>
            <Options />
          </RadioGroup>
        </Example>
        <Example title={t('کنار هم', 'Across')} note='orientation="horizontal"'>
          <RadioGroup defaultValue="post" orientation="horizontal">
            <Label>{t('روش ارسال', 'Delivery method')}</Label>
            <Options />
            <Description>{t('برای این سفارش.', 'For this order.')}</Description>
          </RadioGroup>
        </Example>
      </Grid>
    )
  },
}

/** Help under each option: what it costs and how long it takes. */
export const Help: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420}>
        <RadioGroup defaultValue="tipax">
          <Label>{t('روش ارسال', 'Delivery method')}</Label>
          <Options help />
        </RadioGroup>
      </Stage>
    )
  },
}

/** One option disabled, the whole group disabled, read-only; and none chosen yet. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={240}>
        <Example title={t('هنوز انتخاب نشده', 'Nothing chosen yet')}>
          <RadioGroup>
            <Label>{t('روش ارسال', 'Delivery method')}</Label>
            <Options />
          </RadioGroup>
        </Example>
        <Example title={t('یک گزینه غیرفعال', 'One option disabled')}>
          <RadioGroup defaultValue="post">
            <Label>{t('روش ارسال', 'Delivery method')}</Label>
            <Options off="tipax" />
          </RadioGroup>
        </Example>
        <Example title={t('همه غیرفعال', 'All disabled')}>
          <RadioGroup defaultValue="post" isDisabled>
            <Label>{t('روش ارسال', 'Delivery method')}</Label>
            <Options />
          </RadioGroup>
        </Example>
        <Example title={t('فقط خواندنی', 'Read-only')}>
          <RadioGroup defaultValue="pickup" isReadOnly>
            <Label>{t('روش ارسال', 'Delivery method')}</Label>
            <Options />
          </RadioGroup>
        </Example>
      </Grid>
    )
  },
}

/** What the server said, under the options. */
export const Validation: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420}>
        <RadioGroup defaultValue="tipax" isInvalid>
          <Label>{t('روش ارسال', 'Delivery method')}</Label>
          <Options />
          <FieldError>
            {t('تیپاکس به شهر خریدار نمی‌رود.', 'Tipax does not reach the buyer’s city.')}
          </FieldError>
        </RadioGroup>
      </Stage>
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
        <RadioGroup variant="secondary" defaultValue="pickup">
          <Label>{t('روش ارسال', 'Delivery method')}</Label>
          <Options />
        </RadioGroup>
      </Stage>
    )
  },
}

/** In a form: the chosen value under the group's name; a required group with none stops it. */
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
          <RadioGroup name="shipping" isRequired>
            <Label>{t('روش ارسال', 'Delivery method')}</Label>
            <Options />
            <FieldError />
          </RadioGroup>
          <div>
            <Button type="submit" variant="primary">
              {t('ادامه', 'Continue')}
            </Button>
          </div>
          <Value label={t('فرستاده شد', 'Sent')} value={sent} />
        </Form>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** The buyer's delivery choice at checkout, its cost added to the total. */
export const Checkout: StoryObj = {
  name: 'Example: delivery at checkout',
  render: function Render() {
    const t = useT()
    const costs: Record<string, number> = { post: 45000, tipax: 60000, pickup: 0 }
    const [value, setValue] = useState('post')
    const total = 1250000 + (costs[value] ?? 0)
    return (
      <Stage width={480} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}>
          <RadioGroup value={value} onChange={setValue}>
            <Label>{t('روش ارسال', 'Delivery method')}</Label>
            <Options help />
          </RadioGroup>
          <div
            className="text-foreground"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <span>{t('جمع کل', 'Total')}</span>
            <span>
              {t(
                `${new Intl.NumberFormat('fa-IR').format(total)} تومان`,
                `${new Intl.NumberFormat('en-US').format(total)} toman`,
              )}
            </span>
          </div>
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <div style={{ width: 300, maxWidth: '100%' }}>
      <RadioGroup defaultValue="post">
        <Label>{t('روش ارسال', 'Delivery method')}</Label>
        <Options help off="pickup" />
      </RadioGroup>
    </div>
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

/** A Persian page and an English one. */
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

/** The same group as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'RadioGroup',
      props: { label: t('روش ارسال', 'Delivery method'), defaultValue: 'post' },
      children: SHIPPING.map((s) => ({
        type: 'Radio',
        props: { value: s.id, label: t(s.fa, s.en), description: t(s.helpFa, s.helpEn) },
      })),
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
