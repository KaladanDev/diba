import type { Meta, StoryObj } from '@storybook/react-vite'
import { Fragment, useId, useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Description } from '../description'
import { ErrorMessage } from '../error-message'
import { Label } from '../label'
import { InputOTP } from './index'

// The InputOTP, every option it has and what it is built into. The docs page is InputOTP.mdx. A
// line comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta: Meta = {
  title: 'Components/Forms/InputOTP',
  component: InputOTP,
  parameters: { layout: 'fullscreen' },
}

export default meta

/** A field's parts down the page: its label, the code, and what is under it. */
function Field({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</div>
}

/** Its boxes: six as two threes with a dash between them, any other number in one row. */
function Boxes({ length }: { length: number }) {
  const indexes = Array.from({ length }, (_, i) => i)
  const groups = length === 6 ? [indexes.slice(0, 3), indexes.slice(3)] : [indexes]
  return groups.map((group, i) => (
    <Fragment key={group[0]}>
      {i > 0 ? <InputOTP.Separator /> : null}
      <InputOTP.Group>
        {group.map((index) => (
          <InputOTP.Slot key={index} index={index} />
        ))}
      </InputOTP.Group>
    </Fragment>
  ))
}

/**
 * A code held in Latin digits, as a server reads it: the boxes show the page's, and Persian
 * digits typed or pasted are handed on as Latin. Digits only.
 */
function useCode(initial = '') {
  const [code, setCode] = useState(initial)
  return { code, props: { value: code, onChange: setCode, pattern: '^\\d*$' } }
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  label: string
  length: number
  variant: 'primary' | 'secondary'
  isDisabled: boolean
  isInvalid: boolean
}

/** Every option on the controls. Empty words take the sample's. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { label: '', length: 6, variant: 'primary', isDisabled: false, isInvalid: false },
  argTypes: {
    label: { control: 'text', table: { category: 'Example' } },
    length: {
      control: { type: 'range', min: 4, max: 8, step: 1 },
      description: 'maxLength: how many boxes; six are drawn as two threes.',
      table: { category: 'InputOTP' },
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      description: 'secondary for a field on a grey surface.',
      table: { category: 'InputOTP', defaultValue: { summary: 'primary' } },
    },
    isDisabled: { table: { category: 'InputOTP', defaultValue: { summary: 'false' } } },
    isInvalid: {
      description: 'With an ErrorMessage under it.',
      table: { category: 'InputOTP', defaultValue: { summary: 'false' } },
    },
  },
  render: function Render(args) {
    const t = useT()
    const { code, props } = useCode('1234')
    const [done, setDone] = useState<string | null>(null)
    const error = useId()
    const label = args.label || t('کد تأیید', 'Confirmation code')
    return (
      <Stage width={480} surface={args.variant === 'secondary'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Field>
            <Label>{label}</Label>
            <InputOTP
              {...props}
              maxLength={args.length}
              onComplete={() => setDone(code)}
              variant={args.variant}
              isDisabled={args.isDisabled}
              isInvalid={args.isInvalid}
              aria-label={label}
              aria-describedby={args.isInvalid ? error : undefined}
            >
              <Boxes length={args.length} />
            </InputOTP>
            {args.isInvalid ? (
              <ErrorMessage id={error}>{t('کد درست نیست.', 'The code is wrong.')}</ErrorMessage>
            ) : null}
          </Field>
          <Value label="value" value={code} />
          <Value label="onComplete" value={done} />
        </div>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Four boxes in a row; six as two threes, easier to read off a message. */
export const Lengths: StoryObj = {
  name: 'Four and six',
  render: function Render() {
    const t = useT()
    const four = useCode('2468')
    const six = useCode('135790')
    return (
      <Grid min={300}>
        <Example title={t('چهار رقم', 'Four digits')} note="maxLength={4}">
          <InputOTP {...four.props} maxLength={4} aria-label={t('کد', 'Code')}>
            <Boxes length={4} />
          </InputOTP>
        </Example>
        <Example title={t('شش رقم', 'Six digits')} note="maxLength={6}">
          <InputOTP {...six.props} maxLength={6} aria-label={t('کد', 'Code')}>
            <Boxes length={6} />
          </InputOTP>
        </Example>
      </Grid>
    )
  },
}

/** Persian digits typed or pasted are kept as Latin ones; the boxes show the page's. */
export const Digits: StoryObj = {
  name: 'Persian and Latin digits',
  render: function Render() {
    const t = useT()
    const { code, props } = useCode('123')
    return (
      <Stage width={420}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field>
            <Label>{t('کد تأیید', 'Confirmation code')}</Label>
            <InputOTP {...props} maxLength={6} aria-label={t('کد تأیید', 'Confirmation code')}>
              <Boxes length={6} />
            </InputOTP>
            <Description>
              {t('با رقم‌های فارسی یا لاتین بنویسید.', 'Type in Persian or Latin digits.')}
            </Description>
          </Field>
          <Value label={t('آنچه فرستاده می‌شود', 'What is sent')} value={code} />
        </div>
      </Stage>
    )
  },
}

/** A wrong code, said under it, the boxes in the danger colour; disabled; on a grey surface. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    const wrong = useCode('482913')
    const off = useCode('48')
    const grey = useCode('48')
    const error = useId()
    return (
      <Grid min={300}>
        <Example title={t('نادرست', 'Invalid')}>
          <Field>
            <InputOTP
              {...wrong.props}
              maxLength={6}
              isInvalid
              aria-label={t('کد تأیید', 'Confirmation code')}
              aria-describedby={error}
            >
              <Boxes length={6} />
            </InputOTP>
            <ErrorMessage id={error}>
              {t('کد درست نیست. دوباره بنویسید.', 'The code is wrong. Type it again.')}
            </ErrorMessage>
          </Field>
        </Example>
        <Example title={t('غیرفعال', 'Disabled')}>
          <InputOTP
            {...off.props}
            maxLength={6}
            isDisabled
            aria-label={t('کد تأیید', 'Confirmation code')}
          >
            <Boxes length={6} />
          </InputOTP>
        </Example>
        <Example title={t('روی زمینهٔ خاکستری', 'On a grey surface')} note='variant="secondary"'>
          <Stage width="100%" surface>
            <InputOTP
              {...grey.props}
              maxLength={6}
              variant="secondary"
              aria-label={t('کد تأیید', 'Confirmation code')}
            >
              <Boxes length={6} />
            </InputOTP>
          </Stage>
        </Example>
      </Grid>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** Confirming a phone number: where the code went, the code, and a way to have it sent again. */
export const ConfirmPhone: StoryObj = {
  name: 'Example: confirming a phone',
  render: function Render() {
    const t = useT()
    const { code, props } = useCode()
    const [checked, setChecked] = useState<string | null>(null)
    return (
      <Stage width={400} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="text-foreground" style={{ fontSize: 16, fontWeight: 600 }}>
              {t('شماره را تأیید کنید', 'Confirm your number')}
            </span>
            <span className="text-muted" style={{ fontSize: 14 }}>
              {t('کدی شش‌رقمی به ', 'A six-digit code went to ')}
              <bdi dir="ltr">{t('۰۹۱۲ ۳۴۵ ۶۷۸۹', '0912 345 6789')}</bdi>
              {t(' فرستادیم.', '.')}
            </span>
          </div>
          <InputOTP
            {...props}
            maxLength={6}
            autoComplete="one-time-code"
            onComplete={() => setChecked(code)}
            aria-label={t('کد تأیید', 'Confirmation code')}
          >
            <Boxes length={6} />
          </InputOTP>
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Button variant="primary" isDisabled={code.length < 6} onPress={() => setChecked(code)}>
              {t('تأیید', 'Confirm')}
            </Button>
            <Button variant="ghost" size="sm">
              {t('فرستادن دوباره', 'Send it again')}
            </Button>
          </div>
          <Value label={t('بررسی شد', 'Checked')} value={checked} />
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  const six = useCode('1357')
  const four = useCode('24')
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 300, maxWidth: '100%' }}
    >
      <Field>
        <Label>{t('کد تأیید', 'Confirmation code')}</Label>
        <InputOTP {...six.props} maxLength={6} aria-label={t('کد تأیید', 'Confirmation code')}>
          <Boxes length={6} />
        </InputOTP>
      </Field>
      <Field>
        <Label>{t('رمز کارت هدیه', 'Gift card PIN')}</Label>
        <InputOTP {...four.props} maxLength={4} aria-label={t('رمز کارت هدیه', 'Gift card PIN')}>
          <Boxes length={4} />
        </InputOTP>
      </Field>
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

/** A Persian page and an English one: the code reads left to right on both, at the page's start. */
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

/** The same field as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'InputOTP',
      props: {
        label: t('کد تأیید', 'Confirmation code'),
        description: t('کد پیامک‌شده را بنویسید.', 'Type the code we sent by text.'),
        defaultValue: '1234',
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
