import type { Meta, StoryObj } from '@storybook/react-vite'
import { LogOut, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Example, Grid, Stage, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Checkbox } from '../checkbox'
import { Input } from '../input'
import { Label } from '../label'
import { TextField } from '../textfield'
import { AlertDialog } from './index'

// The AlertDialog, every option it has and what it asks. The docs page is AlertDialog.mdx. Each
// story is its own frame in the docs, where the main ones show their dialog open: a modal covers
// whatever page it is on. A line comment, not a doc comment: the docs plugin replaces a commented
// meta's parameters with one.
const meta = {
  title: 'Components/Overlays/AlertDialog',
  component: AlertDialog,
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, height: '600px' } },
  },
} satisfies Meta<typeof AlertDialog>

export default meta

type Status = 'default' | 'accent' | 'success' | 'warning' | 'danger'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'cover'
type Placement = 'auto' | 'top' | 'center' | 'bottom'
type Backdrop = 'opaque' | 'blur' | 'transparent'

type ConfirmProps = {
  /** The trigger's words. */
  label: string
  title: string
  body?: ReactNode
  confirm: string
  cancel?: string
  status?: Status
  size?: Size
  placement?: Placement
  backdrop?: Backdrop
  /** The mark: the status's by default, any element of yours, or none. */
  icon?: ReactNode | false
  /** A close button in the corner. */
  closeButton?: boolean
  /** A press outside closes it. */
  isDismissable?: boolean
  /** Escape does not close it. */
  isKeyboardDismissDisabled?: boolean
  defaultOpen?: boolean
  /** Runs when confirmed; the confirm button waits for it, and cancel with it. */
  onConfirm?: () => Promise<void> | void
  /** The trigger's look. */
  trigger?: 'secondary' | 'danger' | 'danger-soft' | 'primary'
}

/**
 * A confirmation, as the admin asks one: the status's mark beside the heading, the detail under it,
 * cancel and confirm at the end. Confirming waits for its work, cancel waiting with it.
 */
function Confirm({
  label,
  title,
  body,
  confirm,
  cancel,
  status = 'danger',
  size,
  placement,
  backdrop,
  icon,
  closeButton = false,
  isDismissable,
  isKeyboardDismissDisabled,
  defaultOpen,
  onConfirm,
  trigger = 'secondary',
}: ConfirmProps) {
  const t = useT()
  const [pending, setPending] = useState(false)
  return (
    <AlertDialog defaultOpen={defaultOpen}>
      <Button variant={trigger}>{label}</Button>
      <AlertDialog.Backdrop
        variant={backdrop}
        isDismissable={isDismissable}
        isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      >
        <AlertDialog.Container size={size} placement={placement}>
          <AlertDialog.Dialog>
            {({ close }: { close: () => void }) => (
              <>
                {closeButton ? <AlertDialog.CloseTrigger aria-label={t('بستن', 'Close')} /> : null}
                <AlertDialog.Header>
                  {icon === false ? null : (
                    <AlertDialog.Icon status={status}>{icon ?? undefined}</AlertDialog.Icon>
                  )}
                  <AlertDialog.Heading>{title}</AlertDialog.Heading>
                </AlertDialog.Header>
                {body ? <AlertDialog.Body>{body}</AlertDialog.Body> : null}
                <AlertDialog.Footer>
                  <Button variant="tertiary" isDisabled={pending} onPress={close}>
                    {cancel ?? t('انصراف', 'Cancel')}
                  </Button>
                  <Button
                    variant={status === 'danger' ? 'danger' : 'primary'}
                    isPending={pending}
                    onPress={async () => {
                      setPending(true)
                      await onConfirm?.()
                      setPending(false)
                      close()
                    }}
                  >
                    {confirm}
                  </Button>
                </AlertDialog.Footer>
              </>
            )}
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}

/** A moment's work, as a server's answer takes. */
const work = (ms = 1500) => new Promise<void>((done) => setTimeout(done, ms))

/** Deleting a product, the example most stories ask. */
function deleting(t: ReturnType<typeof useT>) {
  return {
    label: t('حذف محصول', 'Delete product'),
    title: t('«شال ابریشم» حذف شود؟', 'Delete “Silk scarf”?'),
    body: t(
      'محصول، تصویرها و موجودی‌اش برای همیشه پاک می‌شوند. سفارش‌های گذشته دست نمی‌خورند.',
      'The product, its pictures and its stock are removed for good. Past orders are kept.',
    ),
    confirm: t('حذف', 'Delete'),
  }
}

/** What each status asks. */
function asking(t: ReturnType<typeof useT>, status: Status) {
  return {
    default: {
      label: t('بایگانی', 'Archive'),
      title: t('سفارش بایگانی شود؟', 'Archive the order?'),
      body: t(
        'از فهرست سفارش‌ها برداشته می‌شود و هر زمان برمی‌گردد.',
        'It leaves the order list, and can come back any time.',
      ),
      confirm: t('بایگانی', 'Archive'),
    },
    accent: {
      label: t('انتشار پوسته', 'Publish theme'),
      title: t('پوستهٔ «ترمه» منتشر شود؟', 'Publish the “Termeh” theme?'),
      body: t('خریداران از همین حالا آن را می‌بینند.', 'Buyers see it from now on.'),
      confirm: t('انتشار', 'Publish'),
    },
    success: {
      label: t('ارسال شد', 'Mark shipped'),
      title: t('سفارش ارسال‌شده ثبت شود؟', 'Mark the order as shipped?'),
      body: t(
        'برای خریدار پیامک کد رهگیری فرستاده می‌شود.',
        'The buyer is texted the tracking code.',
      ),
      confirm: t('ثبت', 'Mark shipped'),
    },
    warning: {
      label: t('ترک صفحه', 'Leave page'),
      title: t('تغییرات ذخیره نشده‌اند', 'Your changes aren’t saved'),
      body: t('اگر صفحه را ترک کنید، از دست می‌روند.', 'If you leave the page they are lost.'),
      confirm: t('ترک بی ذخیره', 'Leave without saving'),
    },
    danger: deleting(t),
  }[status]
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  status: Status
  size: Size
  placement: Placement
  backdrop: Backdrop
  icon: boolean
  closeButton: boolean
  isDismissable: boolean
  isKeyboardDismissDisabled: boolean
  slowConfirm: boolean
}

/** Every option on the controls; it opens as the page does, and again from its trigger. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    status: 'danger',
    size: 'md',
    placement: 'auto',
    backdrop: 'opaque',
    icon: true,
    closeButton: false,
    isDismissable: false,
    isKeyboardDismissDisabled: true,
    slowConfirm: true,
  },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['default', 'accent', 'success', 'warning', 'danger'],
      description: 'Its mark’s colour, and confirm is danger for danger, primary for the rest.',
      table: { category: 'AlertDialog.Icon', defaultValue: { summary: 'danger' } },
    },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg', 'cover'],
      description: 'How wide it is; cover fills the window.',
      table: { category: 'AlertDialog.Container', defaultValue: { summary: 'md' } },
    },
    placement: {
      control: 'inline-radio',
      options: ['auto', 'top', 'center', 'bottom'],
      description: 'auto is the bottom of a phone and the middle from 640 wide.',
      table: { category: 'AlertDialog.Container', defaultValue: { summary: 'auto' } },
    },
    backdrop: {
      control: 'inline-radio',
      options: ['opaque', 'blur', 'transparent'],
      description: 'What is under it: dimmed, blurred, or as it is.',
      table: { category: 'AlertDialog.Backdrop', defaultValue: { summary: 'opaque' } },
    },
    isDismissable: {
      description: 'A press outside closes it.',
      table: { category: 'AlertDialog.Backdrop', defaultValue: { summary: 'false' } },
    },
    isKeyboardDismissDisabled: {
      description: 'Escape does not close it.',
      table: { category: 'AlertDialog.Backdrop', defaultValue: { summary: 'true' } },
    },
    icon: { description: 'AlertDialog.Icon beside the heading.', table: { category: 'Example' } },
    closeButton: {
      description: 'AlertDialog.CloseTrigger in the corner.',
      table: { category: 'Example' },
    },
    slowConfirm: {
      description: 'Confirming waits a moment, as for a server.',
      table: { category: 'Example' },
    },
  },
  render: function Render({ status, icon, slowConfirm, ...props }) {
    const t = useT()
    return (
      <Stage>
        <Confirm
          {...asking(t, status)}
          {...props}
          status={status}
          icon={icon ? undefined : false}
          trigger={status === 'danger' ? 'danger-soft' : 'secondary'}
          onConfirm={slowConfirm ? () => work() : undefined}
          defaultOpen
        />
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** One status each: what it asks sets its mark, and danger makes confirm red. */
export const Statuses: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={760}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(['default', 'accent', 'success', 'warning', 'danger'] as const).map((status) => (
            <Confirm key={status} {...asking(t, status)} status={status} />
          ))}
        </div>
      </Stage>
    )
  },
}

/** Its widths, xs to cover; md is 448. */
export const Sizes: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={760}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(['xs', 'sm', 'md', 'lg', 'cover'] as const).map((size) => (
            <Confirm key={size} {...deleting(t)} label={size} size={size} />
          ))}
        </div>
      </Stage>
    )
  },
}

/** Where it opens: auto, top, center or bottom. */
export const Placements: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={760}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(['auto', 'top', 'center', 'bottom'] as const).map((placement) => (
            <Confirm key={placement} {...deleting(t)} label={placement} placement={placement} />
          ))}
        </div>
      </Stage>
    )
  },
}

/** What lies under it: the page dimmed, blurred, or as it is. */
export const Backdrops: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={760}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p className="text-muted" style={{ margin: 0, fontSize: 14, lineHeight: '22px' }}>
            {t(
              'این بند زیر پنجره می‌ماند تا تفاوت پس‌زمینه‌ها دیده شود: تیره، مات یا همان‌طور که هست.',
              'This paragraph stays under the dialog so the backdrops show: dimmed, blurred, or as it is.',
            )}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(['opaque', 'blur', 'transparent'] as const).map((backdrop) => (
              <Confirm key={backdrop} {...deleting(t)} label={backdrop} backdrop={backdrop} />
            ))}
          </div>
        </div>
      </Stage>
    )
  },
}

/** Confirming waits for its work: confirm spins, cancel waits, and it closes when done. */
export const PendingConfirm: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage>
        <Confirm {...deleting(t)} trigger="danger-soft" onConfirm={() => work(2500)} defaultOpen />
      </Stage>
    )
  },
}

/** Opened and closed by the page, which knows whether it is open. */
export const Controlled: StoryObj = {
  render: function Render() {
    const t = useT()
    const [open, setOpen] = useState(false)
    const [answer, setAnswer] = useState<string | null>(null)
    const said = deleting(t)
    return (
      <Stage>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}
        >
          <Button variant="danger-soft" onPress={() => setOpen(true)}>
            {said.label}
          </Button>
          <Value label="isOpen" value={open} />
          <Value label={t('پاسخ', 'answer')} value={answer} />
          <AlertDialog isOpen={open} onOpenChange={setOpen}>
            <AlertDialog.Backdrop>
              <AlertDialog.Container>
                <AlertDialog.Dialog>
                  <AlertDialog.Header>
                    <AlertDialog.Icon status="danger" />
                    <AlertDialog.Heading>{said.title}</AlertDialog.Heading>
                  </AlertDialog.Header>
                  <AlertDialog.Body>{said.body}</AlertDialog.Body>
                  <AlertDialog.Footer>
                    <Button
                      variant="tertiary"
                      onPress={() => {
                        setAnswer('cancel')
                        setOpen(false)
                      }}
                    >
                      {t('انصراف', 'Cancel')}
                    </Button>
                    <Button
                      variant="danger"
                      onPress={() => {
                        setAnswer('confirm')
                        setOpen(false)
                      }}
                    >
                      {said.confirm}
                    </Button>
                  </AlertDialog.Footer>
                </AlertDialog.Dialog>
              </AlertDialog.Container>
            </AlertDialog.Backdrop>
          </AlertDialog>
        </div>
      </Stage>
    )
  },
}

/** By default only its buttons close it; a press outside or Escape can be let close it too. */
export const Dismissing: StoryObj = {
  render: function Render() {
    const t = useT()
    const said = deleting(t)
    return (
      <Grid min={220}>
        <Example title={t('فقط دکمه‌ها', 'Its buttons only')} note={t('پیش‌فرض', 'The default')}>
          <div>
            <Confirm {...said} label={t('باز کن', 'Open')} />
          </div>
        </Example>
        <Example title={t('فشار بیرون آن', 'A press outside')} note="isDismissable">
          <div>
            <Confirm {...said} label={t('باز کن', 'Open')} isDismissable />
          </div>
        </Example>
        <Example title="Escape" note="isKeyboardDismissDisabled={false}">
          <div>
            <Confirm {...said} label={t('باز کن', 'Open')} isKeyboardDismissDisabled={false} />
          </div>
        </Example>
      </Grid>
    )
  },
}

/** A mark of your own, none, or a close button in the corner as well. */
export const IconAndCloseButton: StoryObj = {
  name: 'Icon and close button',
  render: function Render() {
    const t = useT()
    const said = deleting(t)
    return (
      <Stage width={760}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Confirm
            {...said}
            label={t('آیکون خودتان', 'Your own icon')}
            icon={<Trash2 aria-hidden />}
          />
          <Confirm {...said} label={t('بی نشانه', 'No mark')} icon={false} />
          <Confirm {...said} label={t('با دکمهٔ بستن', 'With a close button')} closeButton />
        </div>
      </Stage>
    )
  },
}

/** A body that asks for more: a confirmation typed out, and a choice. */
export const RichBody: StoryObj = {
  render: function Render() {
    const t = useT()
    const [typed, setTyped] = useState('')
    const word = t('حذف', 'DELETE')
    return (
      <Stage>
        <AlertDialog defaultOpen>
          <Button variant="danger-soft">{t('حذف فروشگاه', 'Delete store')}</Button>
          <AlertDialog.Backdrop>
            <AlertDialog.Container>
              <AlertDialog.Dialog>
                {({ close }: { close: () => void }) => (
                  <>
                    <AlertDialog.Header>
                      <AlertDialog.Icon status="danger" />
                      <AlertDialog.Heading>
                        {t('فروشگاه حذف شود؟', 'Delete the store?')}
                      </AlertDialog.Heading>
                    </AlertDialog.Header>
                    <AlertDialog.Body>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <span>
                          {t(
                            'همهٔ محصول‌ها، سفارش‌ها و خریداران پاک می‌شوند. این کار برگشت ندارد.',
                            'Every product, order and buyer is removed. This cannot be undone.',
                          )}
                        </span>
                        <Checkbox defaultSelected>
                          <Checkbox.Content>
                            <Checkbox.Control>
                              <Checkbox.Indicator />
                            </Checkbox.Control>
                            <Label>
                              {t('یک نسخهٔ پشتیبان برایم بفرست', 'Email me a backup first')}
                            </Label>
                          </Checkbox.Content>
                        </Checkbox>
                        <TextField value={typed} onChange={setTyped}>
                          <Label>
                            {t(`برای تأیید «${word}» را بنویسید`, `Type ${word} to confirm`)}
                          </Label>
                          <Input />
                        </TextField>
                      </div>
                    </AlertDialog.Body>
                    <AlertDialog.Footer>
                      <Button variant="tertiary" onPress={close}>
                        {t('انصراف', 'Cancel')}
                      </Button>
                      <Button variant="danger" isDisabled={typed !== word} onPress={close}>
                        {t('حذف برای همیشه', 'Delete for good')}
                      </Button>
                    </AlertDialog.Footer>
                  </>
                )}
              </AlertDialog.Dialog>
            </AlertDialog.Container>
          </AlertDialog.Backdrop>
        </AlertDialog>
      </Stage>
    )
  },
}

// ---- what it asks --------------------------------------------------------------------------------

/** Discarding a form's changes, in the warning's colour. */
export const DiscardChanges: StoryObj = {
  name: 'Example: discard changes',
  render: function Render() {
    const t = useT()
    return (
      <Stage>
        <Confirm {...asking(t, 'warning')} status="warning" defaultOpen />
      </Stage>
    )
  },
}

/** Publishing a theme, in the accent's. */
export const PublishTheme: StoryObj = {
  name: 'Example: publish a theme',
  render: function Render() {
    const t = useT()
    return (
      <Stage>
        <Confirm
          {...asking(t, 'accent')}
          status="accent"
          trigger="primary"
          onConfirm={() => work()}
          defaultOpen
        />
      </Stage>
    )
  },
}

/** Signing out of every device, with its own mark. */
export const SignOutEverywhere: StoryObj = {
  name: 'Example: sign out everywhere',
  render: function Render() {
    const t = useT()
    return (
      <Stage>
        <Confirm
          label={t('خروج از همهٔ دستگاه‌ها', 'Sign out everywhere')}
          title={t('از همهٔ دستگاه‌ها خارج می‌شوید؟', 'Sign out on every device?')}
          body={t(
            'روی این دستگاه هم باید دوباره وارد شوید.',
            'You will have to sign in again here too.',
          )}
          confirm={t('خروج', 'Sign out')}
          icon={<LogOut aria-hidden />}
          trigger="danger-soft"
          defaultOpen
        />
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

/** In the dark theme, whatever the toolbar says. */
export const Dark: StoryObj = {
  globals: { theme: 'dark' },
  render: function Render() {
    const t = useT()
    return (
      <Stage>
        <Confirm {...deleting(t)} trigger="danger-soft" defaultOpen />
      </Stage>
    )
  },
}

/** On an English page: it reads from the left, the buttons ending on the right. */
export const LeftToRight: StoryObj = {
  name: 'Left to right',
  globals: { locale: 'en-US', dir: 'ltr' },
  render: function Render() {
    const t = useT()
    return (
      <Stage>
        <Confirm {...deleting(t)} trigger="danger-soft" defaultOpen />
      </Stage>
    )
  },
}

/** The same confirmation as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const said = deleting(t)
    const tree = {
      type: 'AlertDialog',
      props: {
        status: 'danger',
        title: said.title,
        description: said.body,
        confirmLabel: said.confirm,
      },
      slots: {
        trigger: { type: 'Button', props: { variant: 'danger-soft' }, children: said.label },
      },
    }
    return (
      <Grid min={320}>
        <Example
          title={t('آنچه کشیده می‌شود', 'What is drawn')}
          note={t('در وب و در Flutter', 'On the web and in Flutter')}
        >
          <div>
            <DibaSurface tree={tree as never} />
          </div>
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
