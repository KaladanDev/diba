import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type FormEvent } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Alert } from '../alert'
import { Button } from '../button'
import { Description } from '../description'
import { FieldError } from '../field-error'
import { Input } from '../input'
import { Label } from '../label'
import { NumberField } from '../number-field'
import { TextField } from '../textfield'
import { Form } from './index'

// The Form, every option it has and what it submits. The docs page is Form.mdx. A line comment,
// not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Forms/Form',
  component: Form,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Form>

export default meta

/** Its fields 16 apart, as a block's form lays them out. */
const column = { display: 'flex', flexDirection: 'column', gap: 16 } as const

/** The named fields' values, as a submit hands them on. */
const valuesOf = (event: FormEvent<HTMLFormElement>) =>
  Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>

/** A moment's work, as a server's answer takes. */
const work = (ms = 1200) => new Promise<void>((done) => setTimeout(done, ms))

/** A discount code's fields: its code, how much off, and how many times it may be used. */
function DiscountFields() {
  const t = useT()
  return (
    <>
      <TextField name="code" isRequired minLength={4}>
        <Label>{t('کد تخفیف', 'Discount code')}</Label>
        <Input dir="ltr" placeholder="NOWRUZ" />
        <Description>{t('دست‌کم ۴ حرف.', 'At least 4 letters.')}</Description>
        <FieldError />
      </TextField>
      <NumberField name="percent" isRequired minValue={1} maxValue={90}>
        <Label>{t('درصد تخفیف', 'Percent off')}</Label>
        <NumberField.Group>
          <NumberField.Input />
          <span data-slot="unit">٪</span>
        </NumberField.Group>
        <FieldError />
      </NumberField>
    </>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = { validationBehavior: 'native' | 'aria'; serverError: boolean }

/** Every option on the controls; submitting shows what it would send. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { validationBehavior: 'native', serverError: false },
  argTypes: {
    validationBehavior: {
      control: 'inline-radio',
      options: ['native', 'aria'],
      description:
        'native: fields are checked on submit, and a wrong one stops it; aria: each is marked as it is typed, and nothing stops the submit.',
      table: { category: 'Form', defaultValue: { summary: 'native' } },
    },
    serverError: {
      description: 'validationErrors: what the server said about a field, by its name.',
      table: { category: 'Form' },
    },
  },
  render: function Render({ validationBehavior, serverError }) {
    const t = useT()
    const [sent, setSent] = useState<Record<string, string> | null>(null)
    return (
      <Stage width={420} surface>
        <Form
          validationBehavior={validationBehavior}
          validationErrors={
            serverError
              ? { code: t('این کد پیش‌تر ساخته شده.', 'This code already exists.') }
              : undefined
          }
          onSubmit={(event) => {
            event.preventDefault()
            setSent(valuesOf(event))
          }}
          style={column}
        >
          <DiscountFields />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit">{t('ساختن کد', 'Create code')}</Button>
            <Button type="reset" variant="tertiary">
              {t('پاک کردن', 'Clear')}
            </Button>
          </div>
          <Value label="onSubmit" value={sent} />
        </Form>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Checked on submit, the page's words, or marked as it is typed. */
export const Validation: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={280}>
        {(['native', 'aria'] as const).map((behavior) => (
          <Example
            key={behavior}
            title={
              behavior === 'native'
                ? t('هنگام فرستادن', 'On submit')
                : t('هنگام نوشتن', 'As it is typed')
            }
            note={`validationBehavior="${behavior}"`}
          >
            <Form
              validationBehavior={behavior}
              onSubmit={(event) => event.preventDefault()}
              style={column}
            >
              <DiscountFields />
              <div>
                <Button type="submit">{t('ساختن کد', 'Create code')}</Button>
              </div>
            </Form>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** What the server said, under the field it was about, and about the whole form at its foot. */
export const ServerErrors: StoryObj = {
  name: 'What the server said',
  render: function Render() {
    const t = useT()
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [failed, setFailed] = useState(false)
    const [pending, setPending] = useState(false)
    return (
      <Stage width={420} surface>
        <Form
          validationErrors={errors}
          onSubmit={async (event) => {
            event.preventDefault()
            setPending(true)
            await work()
            setPending(false)
            setErrors({ code: t('این کد پیش‌تر ساخته شده.', 'This code already exists.') })
            setFailed(true)
          }}
          style={column}
        >
          <DiscountFields />
          {failed ? (
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{t('کد ساخته نشد', 'The code was not created')}</Alert.Title>
                <Alert.Description>
                  {t(
                    'خطای زیر را درست کنید و دوباره بفرستید.',
                    'Fix the error above and send it again.',
                  )}
                </Alert.Description>
              </Alert.Content>
            </Alert>
          ) : null}
          <div>
            <Button type="submit" isPending={pending}>
              {t('ساختن کد', 'Create code')}
            </Button>
          </div>
        </Form>
      </Stage>
    )
  },
}

// ---- what it submits -----------------------------------------------------------------------------

/** A storefront's sign-in: a phone number, then a code. */
export const SignIn: StoryObj = {
  name: 'Example: sign in with a phone',
  render: function Render() {
    const t = useT()
    const [phone, setPhone] = useState<string | null>(null)
    return (
      <Stage width={360} surface>
        <Form
          onSubmit={(event) => {
            event.preventDefault()
            setPhone(valuesOf(event).phone ?? null)
          }}
          style={column}
        >
          <TextField name="phone" type="tel" isRequired pattern="09[0-9]{9}">
            <Label>{t('شمارهٔ همراه', 'Mobile number')}</Label>
            <Input dir="ltr" placeholder="09121234567" />
            <Description>
              {t('کد ورود به این شماره پیامک می‌شود.', 'A sign-in code is texted to it.')}
            </Description>
            <FieldError />
          </TextField>
          <Button type="submit" fullWidth>
            {t('فرستادن کد', 'Send code')}
          </Button>
          {phone ? <Value label={t('فرستاده به', 'sent to')} value={phone} /> : null}
        </Form>
      </Stage>
    )
  },
}

/** The admin's store details: saved as one, the button waiting for the server. */
export const StoreDetails: StoryObj = {
  name: 'Example: the store’s details',
  render: function Render() {
    const t = useT()
    const [pending, setPending] = useState(false)
    const [saved, setSaved] = useState(false)
    return (
      <Stage width={480} surface>
        <Form
          onSubmit={async (event) => {
            event.preventDefault()
            setPending(true)
            await work()
            setPending(false)
            setSaved(true)
          }}
          style={column}
        >
          <TextField name="name" isRequired defaultValue={t('چای‌خانهٔ آفتاب', 'Aftab Tea House')}>
            <Label>{t('نام فروشگاه', 'Store name')}</Label>
            <Input />
            <FieldError />
          </TextField>
          <TextField name="email" type="email" defaultValue="hello@aftab.shop">
            <Label>{t('ایمیل پشتیبانی', 'Support email')}</Label>
            <Input dir="ltr" />
            <FieldError />
          </TextField>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button type="submit" isPending={pending}>
              {t('ذخیره', 'Save')}
            </Button>
            {saved ? (
              <span className="text-muted" style={{ fontSize: 12 }}>
                {t('ذخیره شد', 'Saved')}
              </span>
            ) : null}
          </div>
        </Form>
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
        <Form onSubmit={(event) => event.preventDefault()} style={column}>
          <DiscountFields />
          <div>
            <Button type="submit">{t('ساختن کد', 'Create code')}</Button>
          </div>
        </Form>
      </Themes>
    )
  },
}

/** On a Persian page and an English one. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: function Render() {
    const t = useT()
    return (
      <Directions>
        <Form onSubmit={(event) => event.preventDefault()} style={column}>
          <DiscountFields />
          <div>
            <Button type="submit">{t('ساختن کد', 'Create code')}</Button>
          </div>
        </Form>
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
        <Form onSubmit={(event) => event.preventDefault()} style={column}>
          <DiscountFields />
          <Button type="submit" fullWidth>
            {t('ساختن کد', 'Create code')}
          </Button>
        </Form>
      </Device>
    )
  },
}

/** The same form as a tree: its fields, checked first, then its action with their values. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Form',
      props: { errorMessage: t('کد ساخته نشد.', 'The code was not created.') },
      actions: { onSubmit: { do: 'call', action: 'discounts.create' } },
      children: [
        {
          type: 'TextField',
          props: {
            name: 'code',
            label: t('کد تخفیف', 'Discount code'),
            isRequired: true,
            minLength: 4,
          },
        },
        {
          type: 'NumberField',
          props: {
            name: 'percent',
            label: t('درصد تخفیف', 'Percent off'),
            minValue: 1,
            maxValue: 90,
          },
        },
        { type: 'Button', props: { type: 'submit' }, children: t('ساختن کد', 'Create code') },
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
