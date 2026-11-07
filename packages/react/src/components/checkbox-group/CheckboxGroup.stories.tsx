import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Checkbox } from '../checkbox'
import { Description } from '../description'
import { FieldError } from '../field-error'
import { Form } from '../form'
import { Label } from '../label'
import { CheckboxGroup } from './index'

// The CheckboxGroup, every option it has and what it is built into. The docs page is
// CheckboxGroup.mdx. A line comment, not a doc comment: the docs plugin replaces a commented meta's
// parameters with one.
const meta: Meta = {
  title: 'Components/Forms/CheckboxGroup',
  component: CheckboxGroup,
  parameters: { layout: 'fullscreen' },
}

export default meta

/** One option of a group: the box, its words, and help under them. */
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
    <Checkbox value={value} isDisabled={isDisabled}>
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Label>{children}</Label>
      </Checkbox.Content>
      {help ? <Description>{help}</Description> : null}
    </Checkbox>
  )
}

/** Options side by side, 16 apart, wrapping on a narrow page into rows 32 apart. */
function Row({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>{children}</div>
}

const CARRIERS = [
  {
    id: 'post',
    fa: 'پست پیشتاز',
    en: 'Express post',
    helpFa: '۲ تا ۴ روز کاری',
    helpEn: '2 to 4 working days',
  },
  {
    id: 'tipax',
    fa: 'تیپاکس',
    en: 'Tipax',
    helpFa: '۱ تا ۳ روز کاری',
    helpEn: '1 to 3 working days',
  },
  {
    id: 'courier',
    fa: 'پیک شهری',
    en: 'City courier',
    helpFa: 'همان روز، فقط تهران',
    helpEn: 'Same day, Tehran only',
  },
]

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  label: string
  description: string
  across: boolean
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
    across: false,
    variant: 'primary',
    isRequired: false,
    isDisabled: false,
    isReadOnly: false,
    isInvalid: false,
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Example' } },
    description: { control: 'text', table: { category: 'Example' } },
    across: {
      description: 'The options side by side, in a row of their own.',
      table: { category: 'Example' },
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      description: 'secondary on a grey surface; its checkboxes take it.',
      table: { category: 'CheckboxGroup', defaultValue: { summary: 'primary' } },
    },
    isRequired: { table: { category: 'CheckboxGroup', defaultValue: { summary: 'false' } } },
    isDisabled: { table: { category: 'CheckboxGroup', defaultValue: { summary: 'false' } } },
    isReadOnly: { table: { category: 'CheckboxGroup', defaultValue: { summary: 'false' } } },
    isInvalid: {
      description: 'With a FieldError under it.',
      table: { category: 'CheckboxGroup', defaultValue: { summary: 'false' } },
    },
  },
  render: function Render(args) {
    const t = useT()
    const [value, setValue] = useState<string[]>(['post'])
    const options = CARRIERS.map((c) => (
      <Option key={c.id} value={c.id}>
        {t(c.fa, c.en)}
      </Option>
    ))
    return (
      <Stage width={480} surface={args.variant === 'secondary'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <CheckboxGroup
            value={value}
            onChange={setValue}
            variant={args.variant}
            isRequired={args.isRequired}
            isDisabled={args.isDisabled}
            isReadOnly={args.isReadOnly}
            isInvalid={args.isInvalid}
          >
            <Label>{args.label || t('روش‌های ارسال', 'Delivery methods')}</Label>
            {args.across ? <Row>{options}</Row> : options}
            <Description>
              {args.description ||
                t('خریدار از میان این‌ها برمی‌گزیند.', 'The buyer picks one of these.')}
            </Description>
            <FieldError>{t('دست‌کم یکی را روشن کنید.', 'Turn one on at least.')}</FieldError>
          </CheckboxGroup>
          <Value label="value" value={value} />
        </div>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** One under another, or side by side in a row of their own. */
export const Orientation: StoryObj = {
  name: 'Down and across',
  render: function Render() {
    const t = useT()
    const sizes = ['S', 'M', 'L', 'XL']
    return (
      <Grid min={260}>
        <Example title={t('زیر هم', 'Down')}>
          <CheckboxGroup defaultValue={['M', 'L']}>
            <Label>{t('اندازه‌های موجود', 'Sizes in stock')}</Label>
            {sizes.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </CheckboxGroup>
        </Example>
        <Example title={t('کنار هم', 'Across')}>
          <CheckboxGroup defaultValue={['M', 'L']}>
            <Label>{t('اندازه‌های موجود', 'Sizes in stock')}</Label>
            <Row>
              {sizes.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Row>
          </CheckboxGroup>
        </Example>
      </Grid>
    )
  },
}

/** Help under the group, and under an option of its own. */
export const Help: StoryObj = {
  name: 'Help',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420}>
        <CheckboxGroup defaultValue={['post', 'tipax']}>
          <Label>{t('روش‌های ارسال', 'Delivery methods')}</Label>
          {CARRIERS.map((c) => (
            <Option key={c.id} value={c.id} help={t(c.helpFa, c.helpEn)}>
              {t(c.fa, c.en)}
            </Option>
          ))}
          <Description>
            {t('خریدار از میان این‌ها برمی‌گزیند.', 'The buyer picks one of these.')}
          </Description>
        </CheckboxGroup>
      </Stage>
    )
  },
}

/** Disabled as a whole, one option disabled, and read-only. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    const options = (off?: string) =>
      CARRIERS.map((c) => (
        <Option key={c.id} value={c.id} isDisabled={c.id === off}>
          {t(c.fa, c.en)}
        </Option>
      ))
    return (
      <Grid min={240}>
        <Example title={t('یک گزینه غیرفعال', 'One option disabled')}>
          <CheckboxGroup defaultValue={['post']}>
            <Label>{t('روش‌های ارسال', 'Delivery methods')}</Label>
            {options('courier')}
          </CheckboxGroup>
        </Example>
        <Example title={t('همه غیرفعال', 'All disabled')}>
          <CheckboxGroup defaultValue={['post']} isDisabled>
            <Label>{t('روش‌های ارسال', 'Delivery methods')}</Label>
            {options()}
          </CheckboxGroup>
        </Example>
        <Example title={t('فقط خواندنی', 'Read-only')}>
          <CheckboxGroup defaultValue={['post', 'tipax']} isReadOnly>
            <Label>{t('روش‌های ارسال', 'Delivery methods')}</Label>
            {options()}
          </CheckboxGroup>
        </Example>
      </Grid>
    )
  },
}

/** Your own check, shown at once, and what the server said. */
export const Validation: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={260}>
        <Example title={t('بررسی شما', 'Your own check')} note='validationBehavior="aria"'>
          <CheckboxGroup
            defaultValue={['post', 'tipax', 'courier']}
            validationBehavior="aria"
            validate={(value) =>
              value.length > 2 ? t('حداکثر دو روش.', 'Two methods at most.') : null
            }
          >
            <Label>{t('روش‌های ارسال', 'Delivery methods')}</Label>
            {CARRIERS.map((c) => (
              <Option key={c.id} value={c.id}>
                {t(c.fa, c.en)}
              </Option>
            ))}
            <FieldError />
          </CheckboxGroup>
        </Example>
        <Example title={t('از سرور', 'From the server')} note="isInvalid">
          <CheckboxGroup defaultValue={['courier']} isInvalid>
            <Label>{t('روش‌های ارسال', 'Delivery methods')}</Label>
            {CARRIERS.map((c) => (
              <Option key={c.id} value={c.id}>
                {t(c.fa, c.en)}
              </Option>
            ))}
            <FieldError>
              {t(
                'پیک شهری برای شهر شما فعال نیست.',
                'The city courier is not active in your city.',
              )}
            </FieldError>
          </CheckboxGroup>
        </Example>
      </Grid>
    )
  },
}

/** On a grey surface: the group's variant reaches its checkboxes. */
export const OnASurface: StoryObj = {
  name: 'On a grey surface',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420} surface>
        <CheckboxGroup variant="secondary" defaultValue={['tipax']}>
          <Label>{t('روش‌های ارسال', 'Delivery methods')}</Label>
          {CARRIERS.map((c) => (
            <Option key={c.id} value={c.id}>
              {t(c.fa, c.en)}
            </Option>
          ))}
        </CheckboxGroup>
      </Stage>
    )
  },
}

/** In a form: every chosen value under the group's name; a required group left empty stops it. */
export const InAForm: StoryObj = {
  name: 'In a form',
  render: function Render() {
    const t = useT()
    const [sent, setSent] = useState<Record<string, FormDataEntryValue[]> | null>(null)
    return (
      <Stage width={420} surface>
        <Form
          onSubmit={(e) => {
            e.preventDefault()
            const data = new FormData(e.currentTarget)
            setSent({ carriers: data.getAll('carriers') })
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}
        >
          <CheckboxGroup name="carriers" isRequired>
            <Label>{t('روش‌های ارسال', 'Delivery methods')}</Label>
            {CARRIERS.map((c) => (
              <Option key={c.id} value={c.id}>
                {t(c.fa, c.en)}
              </Option>
            ))}
            <FieldError />
          </CheckboxGroup>
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

/** Which payment methods the shop takes, with what each costs. */
export const PaymentMethods: StoryObj = {
  name: 'Example: payment methods',
  render: function Render() {
    const t = useT()
    const [value, setValue] = useState<string[]>(['card', 'cod'])
    return (
      <Stage width={520} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}>
          <span className="text-foreground" style={{ fontSize: 16, fontWeight: 600 }}>
            {t('پرداخت', 'Payment')}
          </span>
          <CheckboxGroup value={value} onChange={setValue}>
            <Label>{t('روش‌های پرداخت', 'Payment methods')}</Label>
            <Option value="card" help={t('کارمزد ۱٪', '1% fee')}>
              {t('درگاه بانکی', 'Bank gateway')}
            </Option>
            <Option value="cod" help={t('فقط برای پیک شهری', 'City courier only')}>
              {t('پرداخت در محل', 'Pay on delivery')}
            </Option>
            <Option value="wallet" help={t('به‌زودی', 'Coming soon')} isDisabled>
              {t('کیف پول', 'Wallet')}
            </Option>
          </CheckboxGroup>
          <Value label="value" value={value} />
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
      <CheckboxGroup defaultValue={['post']}>
        <Label>{t('روش‌های ارسال', 'Delivery methods')}</Label>
        {CARRIERS.map((c) => (
          <Option
            key={c.id}
            value={c.id}
            help={c.id === 'courier' ? t(c.helpFa, c.helpEn) : undefined}
          >
            {t(c.fa, c.en)}
          </Option>
        ))}
        <Description>
          {t('خریدار از میان این‌ها برمی‌گزیند.', 'The buyer picks one of these.')}
        </Description>
      </CheckboxGroup>
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
      type: 'CheckboxGroup',
      props: {
        label: t('روش‌های ارسال', 'Delivery methods'),
        description: t('خریدار از میان این‌ها برمی‌گزیند.', 'The buyer picks one of these.'),
        defaultValue: ['post'],
      },
      children: CARRIERS.map((c) => ({
        type: 'Checkbox',
        props: { value: c.id, label: t(c.fa, c.en) },
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
