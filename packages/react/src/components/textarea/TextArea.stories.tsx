import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { useLocale } from 'react-aria-components'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Description } from '../description'
import { FieldError } from '../field-error'
import { Label } from '../label'
import { TextField } from '../textfield'
import { TextArea } from './index'

// The TextArea, every option it has and what it is built into. The docs page is TextArea.mdx. A
// line comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta: Meta = {
  title: 'Components/Forms/TextArea',
  component: TextArea,
  parameters: { layout: 'fullscreen' },
}

export default meta

/** Fields down the page, 20 apart, as wide as a form's column. */
function Column({ children, width = 420 }: { children: ReactNode; width?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width, maxWidth: '100%' }}>
      {children}
    </div>
  )
}

/** How many letters are left, in the reader's digits. */
function useLeft() {
  const { locale } = useLocale()
  const t = useT()
  return (used: number, max: number) =>
    t(
      `${new Intl.NumberFormat(locale).format(max - used)} حرف مانده`,
      `${new Intl.NumberFormat(locale).format(max - used)} letters left`,
    )
}

const DESCRIPTION_FA =
  'شالی از ابریشم خالص، دست‌باف در یزد. نقش‌های ترمه با نخ طلایی بافته شده‌اند و رنگ‌ها با شستشوی ملایم ثابت می‌مانند.'
const DESCRIPTION_EN =
  'A scarf of pure silk, hand-woven in Yazd. The termeh patterns are woven in gold thread, and the colours hold through a gentle wash.'

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  label: string
  placeholder: string
  rows: number
  maxLength: number
  variant: 'primary' | 'secondary'
  dir: 'auto' | 'ltr' | 'rtl'
  isRequired: boolean
  isDisabled: boolean
  isReadOnly: boolean
  isInvalid: boolean
}

/** Every option on the controls. Empty words take the sample's. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    label: '',
    placeholder: '',
    rows: 4,
    maxLength: 300,
    variant: 'primary',
    dir: 'auto',
    isRequired: false,
    isDisabled: false,
    isReadOnly: false,
    isInvalid: false,
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Example' } },
    placeholder: { control: 'text', table: { category: 'TextArea' } },
    rows: {
      control: { type: 'range', min: 2, max: 12, step: 1 },
      description: 'Lines drawn before it scrolls.',
      table: { category: 'TextArea' },
    },
    maxLength: {
      control: { type: 'number', min: 0, max: 2000 },
      description: 'The most letters, and the count under it; 0 for none.',
      table: { category: 'TextField' },
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      description: 'secondary for a field on a grey surface.',
      table: { category: 'TextField', defaultValue: { summary: 'primary' } },
    },
    dir: {
      control: 'inline-radio',
      options: ['auto', 'ltr', 'rtl'],
      description: 'The text’s direction: auto follows its first letter.',
      table: { category: 'TextArea' },
    },
    isRequired: { table: { category: 'TextField', defaultValue: { summary: 'false' } } },
    isDisabled: { table: { category: 'TextField', defaultValue: { summary: 'false' } } },
    isReadOnly: { table: { category: 'TextField', defaultValue: { summary: 'false' } } },
    isInvalid: {
      description: 'With a FieldError under it.',
      table: { category: 'TextField', defaultValue: { summary: 'false' } },
    },
  },
  render: function Render(args) {
    const t = useT()
    const left = useLeft()
    const [value, setValue] = useState(t(DESCRIPTION_FA, DESCRIPTION_EN))
    return (
      <Stage width={480} surface={args.variant === 'secondary'}>
        <Column>
          <TextField
            value={value}
            onChange={setValue}
            variant={args.variant}
            fullWidth
            maxLength={args.maxLength || undefined}
            isRequired={args.isRequired}
            isDisabled={args.isDisabled}
            isReadOnly={args.isReadOnly}
            isInvalid={args.isInvalid}
          >
            <Label>{args.label || t('توضیح محصول', 'Product description')}</Label>
            <TextArea rows={args.rows} dir={args.dir} placeholder={args.placeholder} />
            <Description>
              {args.maxLength
                ? left(value.length, args.maxLength)
                : t('برای خریدار.', 'For the buyer.')}
            </Description>
            <FieldError>{t('توضیح را کامل‌تر بنویسید.', 'Write a fuller description.')}</FieldError>
          </TextField>
          <Value label="value" value={value} />
        </Column>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** As many lines as are drawn before it scrolls. The reader can drag its corner taller. */
export const Rows: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={260}>
        {[2, 4, 8].map((rows) => (
          <Example key={rows} title={`rows={${rows}}`}>
            <TextField defaultValue={t(DESCRIPTION_FA, DESCRIPTION_EN)}>
              <Label>{t('توضیح محصول', 'Product description')}</Label>
              <TextArea rows={rows} />
            </TextField>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** A count of the letters left, under it in the help's place, as the reader types. */
export const Counter: StoryObj = {
  name: 'Letters left',
  render: function Render() {
    const t = useT()
    const left = useLeft()
    const [value, setValue] = useState(t('بسته را کادو کنید، لطفاً.', 'Gift-wrap it, please.'))
    return (
      <Column>
        <TextField value={value} onChange={setValue} maxLength={120}>
          <Label>{t('یادداشت سفارش', 'Order note')}</Label>
          <TextArea rows={3} />
          <Description>{left(value.length, 120)}</Description>
        </TextField>
      </Column>
    )
  },
}

/** Persian text, English text, and a mix: dir="auto" turns each paragraph by its first letter. */
export const Direction: StoryObj = {
  name: 'Direction of the text',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <TextField defaultValue={DESCRIPTION_EN}>
          <Label>{t('توضیح انگلیسی', 'English description')}</Label>
          <TextArea rows={3} dir="auto" />
        </TextField>
        <TextField defaultValue={DESCRIPTION_FA}>
          <Label>{t('توضیح فارسی', 'Persian description')}</Label>
          <TextArea rows={3} dir="auto" />
        </TextField>
      </Column>
    )
  },
}

/** Too short, or what the server said, under it in the help's place. */
export const Validation: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <TextField
          defaultValue={t('خوب بود.', 'It was good.')}
          validationBehavior="aria"
          validate={(value) =>
            value.length < 20 ? t('دست‌کم ۲۰ حرف بنویسید.', 'Write at least 20 letters.') : null
          }
        >
          <Label>{t('نظر شما', 'Your review')}</Label>
          <TextArea rows={3} />
          <FieldError />
        </TextField>
        <TextField isInvalid defaultValue={t('تماس بگیرید: ۰۹۱۲۱۲۳۴۵۶۷', 'Call me: 0912 123 4567')}>
          <Label>{t('یادداشت سفارش', 'Order note')}</Label>
          <TextArea rows={2} />
          <FieldError>
            {t('شماره تلفن را در یادداشت ننویسید.', "Don't put a phone number in the note.")}
          </FieldError>
        </TextField>
      </Column>
    )
  },
}

/** Disabled, read-only, and on a grey surface. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={280}>
        <Example title={t('غیرفعال', 'Disabled')}>
          <TextField isDisabled defaultValue={t(DESCRIPTION_FA, DESCRIPTION_EN)}>
            <Label>{t('توضیح محصول', 'Product description')}</Label>
            <TextArea rows={3} />
          </TextField>
        </Example>
        <Example title={t('فقط خواندنی', 'Read-only')}>
          <TextField isReadOnly defaultValue={t(DESCRIPTION_FA, DESCRIPTION_EN)}>
            <Label>{t('توضیح محصول', 'Product description')}</Label>
            <TextArea rows={3} />
          </TextField>
        </Example>
        <Example title={t('روی زمینهٔ خاکستری', 'On a grey surface')} note='variant="secondary"'>
          <Stage width="100%" surface>
            <TextField variant="secondary" defaultValue={t(DESCRIPTION_FA, DESCRIPTION_EN)}>
              <Label>{t('توضیح محصول', 'Product description')}</Label>
              <TextArea rows={3} />
            </TextField>
          </Stage>
        </Example>
      </Grid>
    )
  },
}

/** On its own, without a TextField: named by an aria-label. */
export const Alone: StoryObj = {
  name: 'On its own',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <Example title={t('بدون TextField', 'Without a TextField')} note="aria-label">
          <TextArea
            aria-label={t('پاسخ به نظر', 'Reply to the review')}
            placeholder={t('پاسخ خود را بنویسید', 'Write your reply')}
            rows={3}
            fullWidth
          />
        </Example>
      </Column>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** Replying to a buyer's review: their words, then yours. */
export const ReviewReply: StoryObj = {
  name: 'Example: replying to a review',
  render: function Render() {
    const t = useT()
    const [reply, setReply] = useState('')
    const [sent, setSent] = useState<string | null>(null)
    return (
      <Stage width={560} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}>
          <span className="text-foreground" style={{ fontSize: 14, fontWeight: 500 }}>
            {t('لیلا صادقی', 'Leila Sadeghi')}
          </span>
          <p className="text-muted" style={{ margin: 0, fontSize: 14, lineHeight: '22px' }}>
            {t(
              'رنگش دقیقاً همان است که در عکس بود. فقط کمی دیر رسید.',
              'The colour is just as in the photo. It only came a little late.',
            )}
          </p>
          <TextField value={reply} onChange={setReply}>
            <Label>{t('پاسخ شما', 'Your reply')}</Label>
            <TextArea
              rows={3}
              placeholder={t('از نظرتان سپاسگزاریم…', 'Thank you for your review…')}
            />
          </TextField>
          <div>
            <Button
              size="sm"
              variant="primary"
              isDisabled={!reply.trim()}
              onPress={() => setSent(reply)}
            >
              {t('فرستادن پاسخ', 'Send the reply')}
            </Button>
          </div>
          <Value label={t('فرستاده شد', 'Sent')} value={sent} />
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <Column width={320}>
      <TextField defaultValue={t(DESCRIPTION_FA, DESCRIPTION_EN)}>
        <Label>{t('توضیح محصول', 'Product description')}</Label>
        <TextArea rows={4} />
        <Description>{t('برای خریدار.', 'For the buyer.')}</Description>
      </TextField>
      <TextField>
        <Label>{t('یادداشت سفارش', 'Order note')}</Label>
        <TextArea rows={2} placeholder={t('اختیاری', 'Optional')} />
      </TextField>
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

/** The same field as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'TextArea',
      props: {
        label: t('توضیح محصول', 'Product description'),
        defaultValue: t(DESCRIPTION_FA, DESCRIPTION_EN),
        rows: 4,
        maxLength: 300,
        dir: 'auto',
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
