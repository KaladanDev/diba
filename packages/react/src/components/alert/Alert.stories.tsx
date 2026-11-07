import type { Meta, StoryObj } from '@storybook/react-vite'
import { BellRing, CloudOff, Gift, PackageCheck, ShieldAlert, Sparkles } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Page, Stage, Themes, useT } from '../../stories/kit'
import { Button } from '../button'
import { CloseButton } from '../close-button'
import { Alert } from './index'

// The Alert, every option it has and what it is built into. The docs page is Alert.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Feedback/Alert',
  component: Alert,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Alert>

export default meta

type Status = 'default' | 'accent' | 'success' | 'warning' | 'danger'
const STATUSES: Status[] = ['default', 'accent', 'success', 'warning', 'danger']

/** A row of actions under the words, 8 below them and 8 apart. */
function Actions({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>{children}</div>
}

/** An alert's words for each status, in the reader's language. */
function said(t: ReturnType<typeof useT>, status: Status) {
  return {
    default: {
      title: t('یادداشت سفارش', 'Order note'),
      description: t('خریدار خواسته بسته‌بندی کادویی باشد.', 'The buyer asked for gift wrapping.'),
    },
    accent: {
      title: t('دورهٔ آزمایشی تا ۳ روز دیگر', 'Your trial ends in 3 days'),
      description: t(
        'برای ادامهٔ فروش، یکی از طرح‌ها را برگزینید.',
        'Choose a plan to keep selling.',
      ),
    },
    success: {
      title: t('تغییرات ذخیره شد', 'Changes saved'),
      description: t('قیمت تازه در فروشگاه دیده می‌شود.', 'The new price shows in your store.'),
    },
    warning: {
      title: t('موجودی رو به پایان', 'Running low'),
      description: t('از شال ابریشم ۳ عدد مانده است.', 'Only 3 silk scarves are left.'),
    },
    danger: {
      title: t('پرداخت انجام نشد', 'The payment failed'),
      description: t(
        'درگاه پاسخ نداد. چند دقیقهٔ دیگر دوباره بکوشید.',
        "The gateway didn't answer. Try again in a few minutes.",
      ),
    },
  }[status]
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  status: Status
  title: string
  description: string
  showIndicator: boolean
  dismissible: boolean
  actions: boolean
  width: number
}

/** Every option on the controls. Empty title or description leave them out. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    status: 'accent',
    title: '',
    description: '',
    showIndicator: true,
    dismissible: false,
    actions: false,
    width: 640,
  },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: STATUSES,
      description: "What it is about, which its tint, mark and title's colour say.",
      table: { category: 'Alert', defaultValue: { summary: 'default' } },
    },
    title: {
      control: 'text',
      description: "Alert.Title; empty, the status's sample.",
      table: { category: 'Example' },
    },
    description: {
      control: 'text',
      description: "Alert.Description; empty, the status's sample.",
      table: { category: 'Example' },
    },
    showIndicator: {
      description: 'Alert.Indicator, the mark before the words.',
      table: { category: 'Example' },
    },
    dismissible: { description: 'A close button at the end.', table: { category: 'Example' } },
    actions: { description: 'Buttons under the words.', table: { category: 'Example' } },
    width: {
      control: { type: 'range', min: 280, max: 960, step: 20 },
      description: 'How wide the example is drawn.',
      table: { category: 'Example' },
    },
  },
  render: function Render({
    status,
    title,
    description,
    showIndicator,
    dismissible,
    actions,
    width,
  }) {
    const t = useT()
    const sample = said(t, status)
    return (
      <Stage width={width}>
        <Alert status={status}>
          {showIndicator ? <Alert.Indicator /> : null}
          <Alert.Content>
            <Alert.Title>{title || sample.title}</Alert.Title>
            <Alert.Description>{description || sample.description}</Alert.Description>
            {actions ? (
              <Actions>
                <Button size="sm">{t('انجام بده', 'Do it')}</Button>
                <Button size="sm" variant="tertiary">
                  {t('بعداً', 'Later')}
                </Button>
              </Actions>
            ) : null}
          </Alert.Content>
          {dismissible ? <CloseButton aria-label={t('بستن', 'Close')} /> : null}
        </Alert>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** The five statuses: a tint, a mark and a title's colour each. */
export const Statuses: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={720}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STATUSES.map((status) => (
            <Alert key={status} status={status}>
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{said(t, status).title}</Alert.Title>
                <Alert.Description>{said(t, status).description}</Alert.Description>
              </Alert.Content>
            </Alert>
          ))}
        </div>
      </Stage>
    )
  },
}

/** A title alone, a description alone, or both. */
export const Content: StoryObj = {
  render: function Render() {
    const t = useT()
    const sample = said(t, 'success')
    return (
      <Grid min={300}>
        <Example title={t('فقط عنوان', 'A title alone')}>
          <Alert status="success">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{sample.title}</Alert.Title>
            </Alert.Content>
          </Alert>
        </Example>
        <Example title={t('فقط توضیح', 'A description alone')}>
          <Alert status="success">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{sample.description}</Alert.Description>
            </Alert.Content>
          </Alert>
        </Example>
        <Example title={t('هر دو', 'Both')}>
          <Alert status="success">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{sample.title}</Alert.Title>
              <Alert.Description>{sample.description}</Alert.Description>
            </Alert.Content>
          </Alert>
        </Example>
      </Grid>
    )
  },
}

/** Buttons under the words: what to do about it. */
export const WithActions: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={320}>
        <Example title={t('یک کار', 'One action')}>
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{said(t, 'danger').title}</Alert.Title>
              <Alert.Description>{said(t, 'danger').description}</Alert.Description>
              <Actions>
                <Button size="sm" variant="danger">
                  {t('دوباره بکوش', 'Try again')}
                </Button>
              </Actions>
            </Alert.Content>
          </Alert>
        </Example>
        <Example title={t('دو کار', 'Two actions')}>
          <Alert status="accent">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{said(t, 'accent').title}</Alert.Title>
              <Alert.Description>{said(t, 'accent').description}</Alert.Description>
              <Actions>
                <Button size="sm">{t('دیدن طرح‌ها', 'See plans')}</Button>
                <Button size="sm" variant="tertiary">
                  {t('بعداً', 'Later')}
                </Button>
              </Actions>
            </Alert.Content>
          </Alert>
        </Example>
      </Grid>
    )
  },
}

/** A close button at the end takes it away; it comes back from the page here, to try again. */
export const Dismissible: StoryObj = {
  render: function Render() {
    const t = useT()
    const [open, setOpen] = useState(true)
    return (
      <Stage>
        {open ? (
          <Alert status="success">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{said(t, 'success').title}</Alert.Title>
              <Alert.Description>{said(t, 'success').description}</Alert.Description>
            </Alert.Content>
            <CloseButton aria-label={t('بستن', 'Close')} onPress={() => setOpen(false)} />
          </Alert>
        ) : (
          <Button size="sm" variant="secondary" onPress={() => setOpen(true)}>
            {t('نشان دادن دوباره', 'Show it again')}
          </Button>
        )}
      </Stage>
    )
  },
}

/** Any mark in place of the status's, or none. */
export const CustomIndicator: StoryObj = {
  render: function Render() {
    const t = useT()
    const icon = (Icon: typeof Gift) => <Icon aria-hidden />
    return (
      <Grid min={300}>
        <Example
          title={t('آیکون خودتان', 'Your own icon')}
          note="<Alert.Indicator><Gift /></Alert.Indicator>"
        >
          <Alert status="accent">
            <Alert.Indicator>{icon(Gift)}</Alert.Indicator>
            <Alert.Content>
              <Alert.Title>{t('کد تخفیف فعال شد', 'Discount code is live')}</Alert.Title>
              <Alert.Description>
                {t('۲۰٪ تا پایان هفته.', '20% until the end of the week.')}
              </Alert.Description>
            </Alert.Content>
          </Alert>
        </Example>
        <Example
          title={t('بی نشانه', 'No mark')}
          note={t('بی Alert.Indicator', 'No Alert.Indicator')}
        >
          <Alert status="warning">
            <Alert.Content>
              <Alert.Title>{said(t, 'warning').title}</Alert.Title>
              <Alert.Description>{said(t, 'warning').description}</Alert.Description>
            </Alert.Content>
          </Alert>
        </Example>
        <Example title={t('در هر وضعیت', 'In every status')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(
              [
                ['default', BellRing],
                ['accent', Sparkles],
                ['success', PackageCheck],
                ['warning', CloudOff],
                ['danger', ShieldAlert],
              ] as const
            ).map(([status, Icon]) => (
              <Alert key={status} status={status}>
                <Alert.Indicator>{icon(Icon)}</Alert.Indicator>
                <Alert.Content>
                  <Alert.Title>{said(t, status).title}</Alert.Title>
                </Alert.Content>
              </Alert>
            ))}
          </div>
        </Example>
      </Grid>
    )
  },
}

/** Long words wrap under the title; a list fits in the description. */
export const LongContent: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={560}>
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              {t('سه فیلد نیاز به بازبینی دارند', 'Three fields need a look')}
            </Alert.Title>
            <Alert.Description>
              <ul
                style={{
                  margin: '4px 0 0',
                  paddingInlineStart: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <li>{t('نام محصول نمی‌تواند خالی باشد.', "The product's name can't be empty.")}</li>
                <li>{t('قیمت باید بیشتر از صفر باشد.', 'The price must be more than zero.')}</li>
                <li>
                  {t(
                    'دست‌کم یک تصویر لازم است تا محصول در فروشگاه، صفحهٔ دسته و نتیجه‌های جست‌وجو دیده شود.',
                    'At least one picture is needed for the product to show in the store, its category and search results.',
                  )}
                </li>
              </ul>
            </Alert.Description>
          </Alert.Content>
        </Alert>
      </Stage>
    )
  },
}

/** Announced as it appears: role="alert" for what is urgent, role="status" for the rest. */
export const Announced: StoryObj = {
  render: function Render() {
    const t = useT()
    const [shown, setShown] = useState<'saved' | 'failed' | null>(null)
    return (
      <Stage>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button size="sm" variant="secondary" onPress={() => setShown('saved')}>
              {t('ذخیره', 'Save')}
            </Button>
            <Button size="sm" variant="danger-soft" onPress={() => setShown('failed')}>
              {t('پرداخت ناموفق', 'Fail a payment')}
            </Button>
          </div>
          {shown === 'saved' ? (
            <Alert status="success" role="status">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{said(t, 'success').title}</Alert.Title>
              </Alert.Content>
            </Alert>
          ) : null}
          {shown === 'failed' ? (
            <Alert status="danger" role="alert">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{said(t, 'danger').title}</Alert.Title>
                <Alert.Description>{said(t, 'danger').description}</Alert.Description>
              </Alert.Content>
            </Alert>
          ) : null}
        </div>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** A banner at the top of the admin: a trial ending, with what to do about it. */
export const PageBanner: StoryObj = {
  name: 'Example: page banner',
  render: function Render() {
    const t = useT()
    return (
      <Page title={t('پیشخوان', 'Home')}>
        <Stage width={960}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Alert status="accent">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{said(t, 'accent').title}</Alert.Title>
                <Alert.Description>{said(t, 'accent').description}</Alert.Description>
                <Actions>
                  <Button size="sm">{t('دیدن طرح‌ها', 'See plans')}</Button>
                </Actions>
              </Alert.Content>
              <CloseButton aria-label={t('بستن', 'Close')} />
            </Alert>
            <Stage width="100%" surface>
              <div className="text-muted" style={{ fontSize: 14, padding: 8 }}>
                {t('امروز ۱۲ سفارش تازه دارید.', 'You have 12 new orders today.')}
              </div>
            </Stage>
          </div>
        </Stage>
      </Page>
    )
  },
}

/** What failed in a form, above it, the fields listed. */
export const FormErrors: StoryObj = {
  name: 'Example: form errors',
  render: LongContent.render,
}

/** Inside a card: a note on an order, in the default status. */
export const InACard: StoryObj = {
  name: 'Example: in a card',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={560} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}>
          <h3 className="text-foreground" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            {t('سفارش ۱۰۴۱', 'Order 1041')}
          </h3>
          <Alert status="default">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{said(t, 'default').title}</Alert.Title>
              <Alert.Description>{said(t, 'default').description}</Alert.Description>
            </Alert.Content>
          </Alert>
          <Alert status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                {t('نشانی خریدار کد پستی ندارد.', "The buyer's address has no postcode.")}
              </Alert.Description>
            </Alert.Content>
          </Alert>
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {STATUSES.map((status) => (
        <Alert key={status} status={status}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{said(t, status).title}</Alert.Title>
            <Alert.Description>{said(t, status).description}</Alert.Description>
          </Alert.Content>
          {status === 'success' ? <CloseButton aria-label={t('بستن', 'Close')} /> : null}
        </Alert>
      ))}
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

/** A Persian page and an English one: the mark keeps to the reading side, the close button to the other. */
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

/** The same alert as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Alert',
      props: {
        status: 'warning',
        title: said(t, 'warning').title,
        description: said(t, 'warning').description,
        isDismissible: true,
      },
      slots: {
        actions: {
          type: 'Button',
          props: { size: 'sm' },
          children: t('افزودن موجودی', 'Add stock'),
        },
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
