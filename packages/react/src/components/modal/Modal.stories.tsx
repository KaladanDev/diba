import type { Meta, StoryObj } from '@storybook/react-vite'
import { MapPin, Ruler, UserPlus } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { goods } from '../../stories/people'
import { Example, Grid, Stage, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Description } from '../description'
import { Input } from '../input'
import { Label } from '../label'
import { Radio } from '../radio'
import { RadioGroup } from '../radio-group'
import { TextArea } from '../textarea'
import { TextField } from '../textfield'
import { Modal } from './index'

// The Modal, every option it has and what it holds. The docs page is Modal.mdx. Each story is its
// own frame in the docs, where the main ones show their dialog open: a modal covers whatever page
// it is on. A line comment, not a doc comment: the docs plugin replaces a commented meta's
// parameters with one.
const meta = {
  title: 'Components/Overlays/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, height: '600px' } },
  },
} satisfies Meta<typeof Modal>

export default meta

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'cover' | 'full'
type Placement = 'auto' | 'top' | 'center' | 'bottom'
type Backdrop = 'opaque' | 'blur' | 'transparent'
type Scroll = 'inside' | 'outside'

/** A moment's work, as a server's answer takes. */
const work = (ms = 1200) => new Promise<void>((done) => setTimeout(done, ms))

type FrameProps = {
  /** The trigger's words. */
  label: string
  title: string
  /** The mark over the heading, or none. */
  icon?: ReactNode
  children: ReactNode
  /** The footer's answer; none leaves only the close button. */
  confirm?: string
  /** Runs when confirmed; the button waits for it. */
  onConfirm?: () => Promise<void> | void
  size?: Size
  placement?: Placement
  scroll?: Scroll
  backdrop?: Backdrop
  /** A close button in the corner. */
  closeButton?: boolean
  isDismissable?: boolean
  isKeyboardDismissDisabled?: boolean
  defaultOpen?: boolean
  trigger?: 'primary' | 'secondary' | 'tertiary'
}

/**
 * A modal as the admin opens one: an icon over the heading, the body, and cancel and the answer at
 * the end; its close button in the corner. The answer waits for its work, then closes it.
 */
function Frame({
  label,
  title,
  icon,
  children,
  confirm,
  onConfirm,
  size,
  placement,
  scroll,
  backdrop,
  closeButton = true,
  isDismissable,
  isKeyboardDismissDisabled,
  defaultOpen,
  trigger = 'secondary',
}: FrameProps) {
  const t = useT()
  const [pending, setPending] = useState(false)
  return (
    <Modal defaultOpen={defaultOpen}>
      <Button variant={trigger}>{label}</Button>
      <Modal.Backdrop
        variant={backdrop}
        isDismissable={isDismissable}
        isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      >
        <Modal.Container size={size} placement={placement} scroll={scroll}>
          <Modal.Dialog>
            {({ close }: { close: () => void }) => (
              <>
                {closeButton ? <Modal.CloseTrigger /> : null}
                <Modal.Header>
                  {icon ? <Modal.Icon>{icon}</Modal.Icon> : null}
                  <Modal.Heading>{title}</Modal.Heading>
                </Modal.Header>
                <Modal.Body>{children}</Modal.Body>
                {confirm ? (
                  <Modal.Footer>
                    <Button variant="tertiary" isDisabled={pending} onPress={close}>
                      {t('انصراف', 'Cancel')}
                    </Button>
                    <Button
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
                  </Modal.Footer>
                ) : null}
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}

/** Its blocks 16 apart, as a block's body lays them out. */
const column = { display: 'flex', flexDirection: 'column', gap: 16 } as const

/** An order's delivery address, the form most stories open. */
function AddressForm() {
  const t = useT()
  return (
    <div style={column}>
      <TextField defaultValue={t('تهران', 'Tehran')}>
        <Label>{t('شهر', 'City')}</Label>
        <Input />
      </TextField>
      <TextField
        defaultValue={t('خیابان ولیعصر، کوچهٔ نهم، پلاک ۱۲', '12 Ninth Alley, Valiasr St')}
      >
        <Label>{t('نشانی', 'Address')}</Label>
        <TextArea rows={2} />
      </TextField>
    </div>
  )
}

/** The address modal's words. */
function editing(t: ReturnType<typeof useT>) {
  return {
    label: t('ویرایش نشانی', 'Edit address'),
    title: t('ویرایش نشانی', 'Edit address'),
    icon: <MapPin aria-hidden />,
    confirm: t('ذخیره', 'Save'),
    children: <AddressForm />,
  }
}

/** A shop's terms of sale, longer than a window: what scrolling is for. */
function Terms() {
  const t = useT()
  const clauses = [
    t('سفارش پس از پرداخت ثبت می‌شود.', 'An order is placed once it is paid.'),
    t(
      'ارسال در شهر تهران ۱ تا ۲ روز و در شهرهای دیگر ۲ تا ۵ روز کاری است.',
      'Delivery takes 1 to 2 working days in Tehran and 2 to 5 elsewhere.',
    ),
    t(
      'کالا تا ۷ روز پس از تحویل، اگر استفاده نشده باشد، پس گرفته می‌شود.',
      'Goods may be returned within 7 days of delivery, unused.',
    ),
    t(
      'هزینهٔ ارسال مرجوعی با خریدار است، مگر کالا آسیب‌دیده رسیده باشد.',
      'The buyer pays for a return, unless the goods arrived damaged.',
    ),
    t(
      'پول ظرف ۳ روز کاری پس از رسیدن مرجوعی به کارت خریدار برمی‌گردد.',
      'The money goes back to the buyer’s card within 3 working days of the return arriving.',
    ),
    t('قیمت‌ها به تومان و با مالیات بر ارزش افزوده است.', 'Prices are in toman and include VAT.'),
  ]
  return (
    <div style={column}>
      {[...clauses, ...clauses].map((clause, i) => (
        <p key={i} style={{ margin: 0 }}>
          {`${(i + 1).toLocaleString(t('fa-IR', 'en-US'))}. ${clause}`}
        </p>
      ))}
    </div>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  size: Size
  placement: Placement
  scroll: Scroll
  backdrop: Backdrop
  isDismissable: boolean
  isKeyboardDismissDisabled: boolean
  icon: boolean
  closeButton: boolean
  long: boolean
}

/** Every option on the controls; it opens as the page does, and again from its trigger. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    size: 'md',
    placement: 'auto',
    scroll: 'inside',
    backdrop: 'opaque',
    isDismissable: true,
    isKeyboardDismissDisabled: false,
    icon: true,
    closeButton: true,
    long: false,
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg', 'cover', 'full'],
      description: 'How wide it is: 320 to 512; cover fills the window, full is the window.',
      table: { category: 'Modal.Container', defaultValue: { summary: 'md' } },
    },
    placement: {
      control: 'inline-radio',
      options: ['auto', 'top', 'center', 'bottom'],
      description: 'auto is the bottom of a phone and the middle from 640 wide.',
      table: { category: 'Modal.Container', defaultValue: { summary: 'auto' } },
    },
    scroll: {
      control: 'inline-radio',
      options: ['inside', 'outside'],
      description: 'A long body scrolls inside the panel, or the panel scrolls on the page.',
      table: { category: 'Modal.Container', defaultValue: { summary: 'inside' } },
    },
    backdrop: {
      control: 'inline-radio',
      options: ['opaque', 'blur', 'transparent'],
      description: 'What is under it: dimmed, blurred, or as it is.',
      table: { category: 'Modal.Backdrop', defaultValue: { summary: 'opaque' } },
    },
    isDismissable: {
      description: 'A press outside closes it.',
      table: { category: 'Modal.Backdrop', defaultValue: { summary: 'true' } },
    },
    isKeyboardDismissDisabled: {
      description: 'Escape does not close it.',
      table: { category: 'Modal.Backdrop', defaultValue: { summary: 'false' } },
    },
    icon: { description: 'Modal.Icon over the heading.', table: { category: 'Example' } },
    closeButton: {
      description: 'Modal.CloseTrigger in the corner.',
      table: { category: 'Example' },
    },
    long: {
      description: 'A body longer than the window, to see scroll.',
      table: { category: 'Example' },
    },
  },
  render: function Render({ icon, long, ...props }) {
    const t = useT()
    const said = editing(t)
    return (
      <Stage>
        {long ? (
          <Frame
            {...props}
            label={t('شرایط فروش', 'Terms of sale')}
            title={t('شرایط فروش', 'Terms of sale')}
            confirm={t('پذیرفتم', 'I agree')}
            defaultOpen
          >
            <Terms />
          </Frame>
        ) : (
          <Frame
            {...said}
            {...props}
            icon={icon ? said.icon : undefined}
            onConfirm={() => work()}
            defaultOpen
          />
        )}
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Its widths: xs 320, sm 384, md 448, lg 512; cover fills the window, full is the window. */
export const Sizes: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={760}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(['xs', 'sm', 'md', 'lg', 'cover', 'full'] as const).map((size) => (
            <Frame key={size} {...editing(t)} label={size} size={size} />
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
            <Frame key={placement} {...editing(t)} label={placement} placement={placement} />
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
              <Frame key={backdrop} {...editing(t)} label={backdrop} backdrop={backdrop} />
            ))}
          </div>
        </div>
      </Stage>
    )
  },
}

/** A body longer than the window: it scrolls inside the panel, or the panel on the page. */
export const Scrolling: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={220}>
        {(['inside', 'outside'] as const).map((scroll) => (
          <Example
            key={scroll}
            title={
              scroll === 'inside'
                ? t('درون پنجره', 'Inside the panel')
                : t('روی صفحه', 'On the page')
            }
            note={`scroll="${scroll}"`}
          >
            <div>
              <Frame
                label={t('شرایط فروش', 'Terms of sale')}
                title={t('شرایط فروش', 'Terms of sale')}
                confirm={t('پذیرفتم', 'I agree')}
                scroll={scroll}
                defaultOpen={scroll === 'inside'}
              >
                <Terms />
              </Frame>
            </div>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Opened and closed by the page, which knows whether it is open. */
export const Controlled: StoryObj = {
  render: function Render() {
    const t = useT()
    const [open, setOpen] = useState(false)
    const [saved, setSaved] = useState(0)
    return (
      <Stage>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}
        >
          <Button variant="secondary" onPress={() => setOpen(true)}>
            {t('ویرایش نشانی', 'Edit address')}
          </Button>
          <Value label="isOpen" value={open} />
          <Value label={t('ذخیره‌ها', 'saves')} value={saved} />
          <Modal isOpen={open} onOpenChange={setOpen}>
            <Modal.Backdrop>
              <Modal.Container>
                <Modal.Dialog>
                  <Modal.CloseTrigger />
                  <Modal.Header>
                    <Modal.Heading>{t('ویرایش نشانی', 'Edit address')}</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <AddressForm />
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="tertiary" onPress={() => setOpen(false)}>
                      {t('انصراف', 'Cancel')}
                    </Button>
                    <Button
                      onPress={() => {
                        setSaved((n) => n + 1)
                        setOpen(false)
                      }}
                    >
                      {t('ذخیره', 'Save')}
                    </Button>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
        </div>
      </Stage>
    )
  },
}

/** A press outside and Escape close it by default; either can be turned off. */
export const Dismissing: StoryObj = {
  render: function Render() {
    const t = useT()
    const said = editing(t)
    return (
      <Grid min={220}>
        <Example
          title={t('بیرون یا Escape', 'Outside or Escape')}
          note={t('پیش‌فرض', 'The default')}
        >
          <div>
            <Frame {...said} label={t('باز کن', 'Open')} />
          </div>
        </Example>
        <Example
          title={t('نه با فشار بیرون', 'Not by a press outside')}
          note="isDismissable={false}"
        >
          <div>
            <Frame {...said} label={t('باز کن', 'Open')} isDismissable={false} />
          </div>
        </Example>
        <Example
          title={t('فقط دکمه‌هایش', 'Only its buttons')}
          note="isDismissable={false} isKeyboardDismissDisabled"
        >
          <div>
            <Frame
              {...said}
              label={t('باز کن', 'Open')}
              isDismissable={false}
              isKeyboardDismissDisabled
              closeButton={false}
            />
          </div>
        </Example>
      </Grid>
    )
  },
}

/** Opened from something that is not a button: Modal.Trigger makes it one. */
export const CustomTrigger: StoryObj = {
  name: 'From any element',
  render: function Render() {
    const t = useT()
    const scarf = goods.scarf
    return (
      <Stage>
        <Example
          title={t(scarf.fa, scarf.en)}
          note={t('تصویر را بزنید تا بزرگ شود.', 'Press the picture to enlarge it.')}
        >
          <Modal>
            <Modal.Trigger aria-label={t(`بزرگ‌نمایی ${scarf.fa}`, `Enlarge ${scarf.en}`)}>
              <img
                src={scarf.photo}
                alt=""
                width={96}
                height={96}
                style={{ display: 'block', borderRadius: 16 }}
              />
            </Modal.Trigger>
            <Modal.Backdrop>
              <Modal.Container size="lg">
                <Modal.Dialog>
                  <Modal.CloseTrigger />
                  <Modal.Header>
                    <Modal.Heading>{t(scarf.fa, scarf.en)}</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <img
                      src={scarf.photo}
                      alt=""
                      style={{ display: 'block', width: '100%', borderRadius: 16 }}
                    />
                  </Modal.Body>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
        </Example>
      </Stage>
    )
  },
}

/** An icon of its own over the heading, none, and no close button. */
export const IconAndCloseButton: StoryObj = {
  name: 'Icon and close button',
  render: function Render() {
    const t = useT()
    const said = editing(t)
    return (
      <Stage width={760}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Frame {...said} label={t('با آیکون', 'With an icon')} />
          <Frame {...said} label={t('بی آیکون', 'No icon')} icon={undefined} />
          <Frame {...said} label={t('بی دکمهٔ بستن', 'No close button')} closeButton={false} />
        </div>
      </Stage>
    )
  },
}

// ---- what it holds -------------------------------------------------------------------------------

/** Editing an order's address, its save waiting for the server. */
export const EditAddress: StoryObj = {
  name: 'Example: edit an address',
  render: function Render() {
    const t = useT()
    return (
      <Stage>
        <Frame {...editing(t)} onConfirm={() => work()} defaultOpen />
      </Stage>
    )
  },
}

/** Inviting a staff member: an address to send to and a role. */
export const InviteStaff: StoryObj = {
  name: 'Example: invite a staff member',
  render: function Render() {
    const t = useT()
    const roles = [
      ['manager', t('مدیر', 'Manager'), t('همه چیز جز صورت‌حساب', 'Everything but billing')],
      ['orders', t('سفارش‌ها', 'Orders'), t('سفارش‌ها و ارسال', 'Orders and shipping')],
      ['catalogue', t('کالاها', 'Catalogue'), t('محصول‌ها و موجودی', 'Products and stock')],
    ] as const
    return (
      <Stage>
        <Frame
          label={t('دعوت همکار', 'Invite staff')}
          title={t('دعوت همکار', 'Invite a staff member')}
          icon={<UserPlus aria-hidden />}
          confirm={t('فرستادن دعوت', 'Send invite')}
          onConfirm={() => work()}
          trigger="primary"
          defaultOpen
        >
          <div style={column}>
            <TextField type="tel" defaultValue="">
              <Label>{t('شمارهٔ همراه', 'Mobile number')}</Label>
              <Input placeholder="09121234567" dir="ltr" />
              <Description>
                {t('پیوند دعوت با پیامک فرستاده می‌شود.', 'The invite link is sent by text.')}
              </Description>
            </TextField>
            <RadioGroup defaultValue="orders">
              <Label>{t('نقش', 'Role')}</Label>
              {roles.map(([value, name, does]) => (
                <Radio key={value} value={value}>
                  <Radio.Content>
                    <Radio.Control>
                      <Radio.Indicator />
                    </Radio.Control>
                    <Label>{name}</Label>
                  </Radio.Content>
                  <Description>{does}</Description>
                </Radio>
              ))}
            </RadioGroup>
          </div>
        </Frame>
      </Stage>
    )
  },
}

/** A storefront's size guide: a table of measures, from a link-like button beside the sizes. */
export const SizeGuide: StoryObj = {
  name: 'Example: a size guide',
  render: function Render() {
    const t = useT()
    const n = (v: number) => v.toLocaleString(t('fa-IR', 'en-US'))
    const rows = [
      ['S', 88, 70],
      ['M', 96, 72],
      ['L', 104, 74],
      ['XL', 112, 76],
    ] as const
    const cell = {
      padding: '8px 12px',
      textAlign: 'start',
      borderBottom: '1px solid var(--border)',
    } as const
    return (
      <Stage>
        <Frame
          label={t('راهنمای اندازه', 'Size guide')}
          title={t('راهنمای اندازه', 'Size guide')}
          icon={<Ruler aria-hidden />}
          trigger="tertiary"
          size="lg"
          defaultOpen
        >
          <div style={column}>
            <span>
              {t(
                'اندازه‌ها به سانتی‌متر و روی تن است. اگر میان دو اندازه‌اید، بزرگ‌تر را بردارید.',
                'Measures are in centimetres, on the body. Between two sizes, take the larger.',
              )}
            </span>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr className="text-foreground">
                  <th style={cell}>{t('اندازه', 'Size')}</th>
                  <th style={cell}>{t('دور سینه', 'Chest')}</th>
                  <th style={cell}>{t('قد', 'Length')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([size, chest, length]) => (
                  <tr key={size}>
                    <td style={cell}>{size}</td>
                    <td style={cell}>{n(chest)}</td>
                    <td style={cell}>{n(length)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Frame>
      </Stage>
    )
  },
}

/** A storefront's quick view: the product's picture, price and a button to the cart. */
export const QuickView: StoryObj = {
  name: 'Example: a quick view',
  render: function Render() {
    const t = useT()
    const tea = goods.tea
    const [added, setAdded] = useState(false)
    return (
      <Stage>
        <Modal defaultOpen>
          <Button variant="secondary">{t('نگاه سریع', 'Quick view')}</Button>
          <Modal.Backdrop>
            <Modal.Container size="lg">
              <Modal.Dialog>
                {({ close }: { close: () => void }) => (
                  <>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Heading>{t(tea.fa, tea.en)}</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <img
                          src={tea.photo}
                          alt=""
                          width={120}
                          height={120}
                          style={{ display: 'block', borderRadius: 16, flexShrink: 0 }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <span
                            className="text-foreground"
                            style={{ fontSize: 16, fontWeight: 600 }}
                          >
                            {t('۳۲۰٬۰۰۰ تومان', '320,000 toman')}
                          </span>
                          <span>
                            {t(
                              'چای سیاه بهاره از باغ‌های لاهیجان، ۵۰۰ گرم.',
                              'Spring black tea from the gardens of Lahijan, 500 g.',
                            )}
                          </span>
                        </div>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="tertiary" onPress={close}>
                        {t('دیدن صفحهٔ محصول', 'See the product')}
                      </Button>
                      <Button
                        onPress={() => {
                          setAdded(true)
                          close()
                        }}
                      >
                        {added
                          ? t('در سبد است', 'In your cart')
                          : t('افزودن به سبد', 'Add to cart')}
                      </Button>
                    </Modal.Footer>
                  </>
                )}
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
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
        <Frame {...editing(t)} defaultOpen />
      </Stage>
    )
  },
}

/** On an English page: it reads from the left, the close button and the answers on the right. */
export const LeftToRight: StoryObj = {
  name: 'Left to right',
  globals: { locale: 'en-US', dir: 'ltr' },
  render: function Render() {
    const t = useT()
    return (
      <Stage>
        <Frame {...editing(t)} defaultOpen />
      </Stage>
    )
  },
}

/** On a phone it opens at the bottom, where a thumb reaches, 16 from the edges. */
export const OnAPhone: StoryObj = {
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  parameters: { docs: { story: { inline: false, height: '700px' } } },
  render: function Render() {
    const t = useT()
    return (
      <Stage>
        <Frame {...editing(t)} defaultOpen />
      </Stage>
    )
  },
}

/** The same modal as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Modal',
      props: { title: t('ویرایش نشانی', 'Edit address'), icon: 'map-pin', size: 'md' },
      slots: {
        trigger: {
          type: 'Button',
          props: { variant: 'secondary', icon: 'pencil' },
          children: t('ویرایش نشانی', 'Edit address'),
        },
        footer: {
          type: 'Button',
          props: { variant: 'primary' },
          children: t('ذخیره', 'Save'),
          actions: { onPress: { do: 'close' } },
        },
      },
      children: [
        {
          type: 'TextField',
          props: { label: t('شهر', 'City'), defaultValue: t('تهران', 'Tehran') },
        },
        { type: 'TextArea', props: { label: t('نشانی', 'Address'), rows: 2 } },
      ],
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
