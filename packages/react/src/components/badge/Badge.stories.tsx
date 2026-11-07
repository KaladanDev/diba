import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bell, Check, Inbox, MessageSquare, ShoppingBag, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLocale } from 'react-aria-components'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT } from '../../stories/kit'
import { face, goods, people } from '../../stories/people'
import { Button } from '../button'
import { Badge } from './index'

// The Badge, every option it has and what it is built into. The docs page is Badge.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Data Display/Badge',
  component: Badge,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Badge>

export default meta

type Color = 'default' | 'accent' | 'success' | 'warning' | 'danger'
type Variant = 'primary' | 'secondary' | 'soft'
type Size = 'sm' | 'md' | 'lg'
type Corner = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'
const COLORS: Color[] = ['default', 'accent', 'success', 'warning', 'danger']
const VARIANTS: Variant[] = ['primary', 'secondary', 'soft']
const SIZES: Size[] = ['sm', 'md', 'lg']
const CORNERS: Corner[] = ['top-end', 'top-start', 'bottom-end', 'bottom-start']

/** Whether the story is drawn in Persian. */
function usePersian() {
  const t = useT()
  return t('fa', 'en') === 'fa'
}

/**
 * A corner by the page's direction, as the block turns one: Badge's placements are the page's
 * left and right, so a Persian page's end is its left.
 */
function useCorner() {
  const { direction } = useLocale()
  return (corner: Corner) => {
    const [edge, along] = corner.split('-') as ['top' | 'bottom', 'start' | 'end']
    const right = (along === 'end') !== (direction === 'rtl')
    return `${edge}-${right ? 'right' : 'left'}` as const
  }
}

/** A count in the reader's digits, past [max] as max and a plus, as the block writes one. */
function useCount() {
  const { locale } = useLocale()
  return (n: number, max = 99) => {
    const digits = new Intl.NumberFormat(locale)
    return n > max ? `${digits.format(max)}+` : digits.format(n)
  }
}

/** An icon button, named with what its badge says, the badge then hidden. */
function IconButton({
  label,
  icon,
  children,
}: {
  label: string
  icon: ReactNode
  children?: ReactNode
}) {
  return (
    <Badge.Anchor>
      <Button isIconOnly variant="secondary" aria-label={label}>
        {icon}
      </Button>
      {children}
    </Badge.Anchor>
  )
}

/** A product's picture, 64 across and 16 round. */
function Picture({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={64}
      height={64}
      style={{ display: 'block', borderRadius: 16, objectFit: 'cover' }}
    />
  )
}

/** Things in a row, 24 apart, their badges given room. */
function Row({ children, gap = 24 }: { children: ReactNode; gap?: number }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap, padding: 8 }}>
      {children}
    </div>
  )
}

/** A caption under what it names. */
function Captioned({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {children}
      <span className="text-muted" style={{ fontSize: 12 }}>
        {caption}
      </span>
    </div>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  content: 'a count' | 'words' | 'an icon' | 'a dot'
  count: number
  max: number
  color: Color
  variant: Variant
  size: Size
  placement: Corner
  on: 'an avatar' | 'an icon button' | 'a picture'
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    content: 'a count',
    count: 5,
    max: 99,
    color: 'danger',
    variant: 'primary',
    size: 'md',
    placement: 'top-end',
    on: 'an icon button',
  },
  argTypes: {
    content: {
      control: 'inline-radio',
      options: ['a count', 'words', 'an icon', 'a dot'],
      description: "The badge's children; none draws a dot.",
      table: { category: 'Example' },
    },
    count: {
      control: { type: 'number', min: 0, max: 5000 },
      description: "In the reader's digits.",
      table: { category: 'Example' },
    },
    max: {
      control: { type: 'number', min: 1, max: 999 },
      description: 'Past it, the count is max and a plus.',
      table: { category: 'Example' },
    },
    color: {
      control: 'inline-radio',
      options: COLORS,
      table: { category: 'Badge', defaultValue: { summary: 'default' } },
    },
    variant: {
      control: 'inline-radio',
      options: VARIANTS,
      description: 'Solid, the colour on the neutral fill, or the soft tint.',
      table: { category: 'Badge', defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'inline-radio',
      options: SIZES,
      description: 'At least 16, 28 or 32 across.',
      table: { category: 'Badge', defaultValue: { summary: 'md' } },
    },
    placement: {
      control: 'inline-radio',
      options: CORNERS,
      description: "The corner, by the page's direction: turned to Badge's left and right.",
      table: { category: 'Badge', defaultValue: { summary: 'top-right' } },
    },
    on: {
      control: 'inline-radio',
      options: ['an avatar', 'an icon button', 'a picture'],
      description: 'What Badge.Anchor holds.',
      table: { category: 'Example' },
    },
  },
  render: function Render({ content, count, max, color, variant, size, placement, on }) {
    const t = useT()
    const persian = usePersian()
    const corner = useCorner()
    const counted = useCount()
    const badge = (
      <Badge
        color={color}
        variant={variant}
        size={size}
        placement={corner(placement)}
        aria-hidden={on === 'an icon button' ? true : undefined}
      >
        {content === 'a count' ? (
          counted(count, max)
        ) : content === 'words' ? (
          t('تازه', 'New')
        ) : content === 'an icon' ? (
          <Check aria-hidden size={12} />
        ) : null}
      </Badge>
    )
    return (
      <Stage width={320}>
        <Row>
          {on === 'an icon button' ? (
            <IconButton
              label={t(`پیام‌ها، ${counted(count, max)} تازه`, `Messages, ${count} new`)}
              icon={<MessageSquare aria-hidden />}
            >
              {badge}
            </IconButton>
          ) : (
            <Badge.Anchor>
              {on === 'an avatar' ? (
                face({ person: people[0]!, persian, size: 'lg' })
              ) : (
                <Picture src={goods.scarf.photo} alt={persian ? goods.scarf.fa : goods.scarf.en} />
              )}
              {badge}
            </Badge.Anchor>
          )}
        </Row>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** A count, a count past its max, words, an icon, or nothing at all: a dot. */
export const Content: StoryObj = {
  render: function Render() {
    const t = useT()
    const corner = useCorner()
    const counted = useCount()
    return (
      <Row gap={32}>
        <Captioned caption={t('شمار', 'A count')}>
          <IconButton
            label={t('پیام‌ها، ۵ تازه', 'Messages, 5 new')}
            icon={<MessageSquare aria-hidden />}
          >
            <Badge color="danger" placement={corner('top-end')} aria-hidden>
              {counted(5)}
            </Badge>
          </IconButton>
        </Captioned>
        <Captioned caption={t('بیش از سقف', 'Past its max')}>
          <IconButton
            label={t('صندوق، ۱۲۸ پیام', 'Inbox, 128 messages')}
            icon={<Inbox aria-hidden />}
          >
            <Badge color="danger" placement={corner('top-end')} aria-hidden>
              {counted(128)}
            </Badge>
          </IconButton>
        </Captioned>
        <Captioned caption={t('واژه', 'Words')}>
          <IconButton label={t('اعلان‌ها، تازه', 'Notifications, new')} icon={<Bell aria-hidden />}>
            <Badge color="accent" placement={corner('top-end')} aria-hidden>
              {t('تازه', 'New')}
            </Badge>
          </IconButton>
        </Captioned>
        <Captioned caption={t('آیکون', 'An icon')}>
          <IconButton
            label={t('سفارش‌ها، همه ارسال شده', 'Orders, all sent')}
            icon={<ShoppingBag aria-hidden />}
          >
            <Badge color="success" placement={corner('top-end')} aria-hidden>
              <Check aria-hidden size={12} />
            </Badge>
          </IconButton>
        </Captioned>
        <Captioned caption={t('نقطه', 'A dot')}>
          <IconButton
            label={t('اعلان‌ها، خوانده نشده', 'Notifications, unread')}
            icon={<Bell aria-hidden />}
          >
            <Badge color="danger" size="sm" placement={corner('top-end')} aria-hidden />
          </IconButton>
        </Captioned>
      </Row>
    )
  },
}

/** Three sizes, each on the avatar of its size. */
export const Sizes: StoryObj = {
  render: function Render() {
    const persian = usePersian()
    const corner = useCorner()
    const counted = useCount()
    return (
      <Row gap={40}>
        {SIZES.map((size) => (
          <Captioned key={size} caption={size}>
            <Badge.Anchor>
              {face({ person: people[2]!, persian, size })}
              <Badge color="danger" size={size} placement={corner('top-end')}>
                {counted(5)}
              </Badge>
            </Badge.Anchor>
          </Captioned>
        ))}
      </Row>
    )
  },
}

/** Five colours, each solid, on the neutral fill, and soft. */
export const ColoursAndVariants: StoryObj = {
  name: 'Colours and variants',
  render: function Render() {
    const corner = useCorner()
    const counted = useCount()
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {VARIANTS.map((variant) => (
          <Row key={variant} gap={28}>
            <code className="text-muted" style={{ width: 72, fontSize: 12 }}>
              {variant}
            </code>
            {COLORS.map((color) => (
              <Badge.Anchor key={color}>
                <Bell aria-hidden size={28} className="text-muted" />
                <Badge color={color} variant={variant} placement={corner('top-end')}>
                  {counted(7)}
                </Badge>
              </Badge.Anchor>
            ))}
          </Row>
        ))}
        <Row gap={28}>
          <span style={{ width: 72 }} />
          {COLORS.map((color) => (
            <code key={color} className="text-muted" style={{ width: 28, fontSize: 11 }}>
              {color}
            </code>
          ))}
        </Row>
      </div>
    )
  },
}

/** Four corners. Start and end follow the page: on a Persian page the end is the left. */
export const Placements: StoryObj = {
  render: function Render() {
    const persian = usePersian()
    const corner = useCorner()
    return (
      <Row gap={48}>
        {CORNERS.map((c) => (
          <Captioned key={c} caption={`${c} → ${corner(c)}`}>
            <Badge.Anchor>
              {face({ person: people[0]!, persian, size: 'lg' })}
              <Badge color="accent" size="sm" placement={corner(c)} />
            </Badge.Anchor>
          </Captioned>
        ))}
      </Row>
    )
  },
}

/** A dot on what has something new, or is on: an icon, an avatar, a picture. */
export const Dots: StoryObj = {
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    const corner = useCorner()
    return (
      <Row gap={32}>
        <Captioned caption={t('خوانده نشده', 'Unread')}>
          <IconButton
            label={t('اعلان‌ها، خوانده نشده', 'Notifications, unread')}
            icon={<Bell aria-hidden />}
          >
            <Badge color="danger" size="sm" placement={corner('top-end')} aria-hidden />
          </IconButton>
        </Captioned>
        <Captioned caption={t('تأییدشده', 'Verified')}>
          <Badge.Anchor>
            {face({ person: people[1]!, persian, size: 'lg' })}
            <Badge color="success" size="sm" placement={corner('bottom-end')} aria-hidden>
              <Check size={10} aria-hidden />
            </Badge>
          </Badge.Anchor>
        </Captioned>
        <Captioned caption={t('ویژه', 'Featured')}>
          <Badge.Anchor>
            <Picture src={goods.tea.photo} alt={persian ? goods.tea.fa : goods.tea.en} />
            <Badge color="warning" size="sm" placement={corner('top-start')} aria-hidden>
              <Star size={10} aria-hidden />
            </Badge>
          </Badge.Anchor>
        </Captioned>
      </Row>
    )
  },
}

/** Named in what it sits on, the badge hidden; or named itself, as an image. */
export const Accessible: StoryObj = {
  name: 'Named, or part of a name',
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    const corner = useCorner()
    return (
      <Grid min={300}>
        <Example
          title={t('در نام دکمه', "In the button's name")}
          note={t('«پیام‌ها، ۳ تازه»؛ نشان پنهان', '“Messages, 3 new”; the badge hidden')}
        >
          <Row>
            <IconButton
              label={t('پیام‌ها، ۳ تازه', 'Messages, 3 new')}
              icon={<MessageSquare aria-hidden />}
            >
              <Badge color="danger" placement={corner('top-end')} aria-hidden>
                {t('۳', '3')}
              </Badge>
            </IconButton>
          </Row>
        </Example>
        <Example title={t('با نام خودش', 'Named itself')} note='role="img" aria-label'>
          <Row>
            <Badge.Anchor>
              {face({ person: people[2]!, persian, size: 'lg' })}
              <Badge
                color="danger"
                placement={corner('top-end')}
                role="img"
                aria-label={t('۳ پیام تازه', '3 new messages')}
              >
                {t('۳', '3')}
              </Badge>
            </Badge.Anchor>
          </Row>
        </Example>
      </Grid>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** The admin's header: messages, notifications and the signed-in person. */
export const AdminHeader: StoryObj = {
  name: 'Example: the admin’s header',
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    const corner = useCorner()
    const counted = useCount()
    return (
      <Stage width={720} surface>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: '4px 8px',
          }}
        >
          <span className="text-foreground" style={{ fontSize: 16, fontWeight: 600 }}>
            {t('چای‌خانهٔ آفتاب', 'Aftab Tea House')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <IconButton
              label={t(`پیام‌ها، ${counted(128)} تازه`, 'Messages, 128 new')}
              icon={<Inbox aria-hidden />}
            >
              <Badge color="danger" size="sm" placement={corner('top-end')} aria-hidden>
                {counted(128)}
              </Badge>
            </IconButton>
            <IconButton
              label={t('اعلان‌ها، خوانده نشده', 'Notifications, unread')}
              icon={<Bell aria-hidden />}
            >
              <Badge color="danger" size="sm" placement={corner('top-end')} aria-hidden />
            </IconButton>
            {face({ person: people[0]!, persian, presence: 'online' })}
          </div>
        </div>
      </Stage>
    )
  },
}

/** Products in a list: what is new, and what is off. */
export const ProductPictures: StoryObj = {
  name: 'Example: product pictures',
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    const corner = useCorner()
    return (
      <Stage width={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {(
            [
              {
                good: goods.scarf,
                tag: t('تازه', 'New'),
                color: 'accent',
                price: t('۱٬۲۵۰٬۰۰۰ تومان', '1,250,000 toman'),
              },
              {
                good: goods.tea,
                tag: t('۲۰٪ تخفیف', '20% off'),
                color: 'danger',
                price: t('۳۲۰٬۰۰۰ تومان', '320,000 toman'),
              },
            ] as const
          ).map(({ good, tag, color, price }) => (
            <div key={good.en} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Badge.Anchor>
                <Picture src={good.photo} alt="" />
                <Badge color={color} size="sm" placement={corner('top-start')}>
                  {tag}
                </Badge>
              </Badge.Anchor>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="text-foreground" style={{ fontSize: 14, fontWeight: 500 }}>
                  {persian ? good.fa : good.en}
                </span>
                <span className="text-muted" style={{ fontSize: 13 }}>
                  {price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  const persian = usePersian()
  const corner = useCorner()
  const counted = useCount()
  return (
    <Row>
      <IconButton
        label={t('پیام‌ها، ۵ تازه', 'Messages, 5 new')}
        icon={<MessageSquare aria-hidden />}
      >
        <Badge color="danger" placement={corner('top-end')} aria-hidden>
          {counted(5)}
        </Badge>
      </IconButton>
      <IconButton label={t('صندوق، ۱۲۸ پیام', 'Inbox, 128 messages')} icon={<Inbox aria-hidden />}>
        <Badge color="accent" variant="soft" placement={corner('top-end')} aria-hidden>
          {counted(128)}
        </Badge>
      </IconButton>
      <Badge.Anchor>
        {face({ person: people[2]!, persian, size: 'lg' })}
        <Badge color="success" size="sm" placement={corner('bottom-end')} aria-hidden>
          <Check size={10} aria-hidden />
        </Badge>
      </Badge.Anchor>
      <Badge.Anchor>
        <Picture src={goods.scarf.photo} alt={persian ? goods.scarf.fa : goods.scarf.en} />
        <Badge color="warning" variant="secondary" size="sm" placement={corner('top-start')}>
          {t('تازه', 'New')}
        </Badge>
      </Badge.Anchor>
    </Row>
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

/** A Persian page and an English one: the end corner is the left on one and the right on the other. */
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

/** The same badges as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { direction: 'horizontal', gap: 6, align: 'center' },
      children: [
        {
          type: 'Badge',
          props: { content: 3, label: t('۳ پیام تازه', '3 new messages') },
          children: [{ type: 'Avatar', props: { name: t('نیلوفر رستمی', 'Niloufar Rostami') } }],
        },
        {
          type: 'Badge',
          props: { content: 128, color: 'accent', label: t('۱۲۸ سفارش', '128 orders') },
          children: [{ type: 'Avatar', props: { name: t('سارا احمدی', 'Sara Ahmadi') } }],
        },
        {
          type: 'Badge',
          props: {
            color: 'success',
            size: 'sm',
            placement: 'bottom-end',
            label: t('آنلاین', 'Online'),
          },
          children: [{ type: 'Avatar', props: { name: t('آرش کریمی', 'Arash Karimi') } }],
        },
      ],
    }
    return (
      <Grid min={320}>
        <Example
          title={t('آنچه کشیده می‌شود', 'What is drawn')}
          note={t('در وب و در Flutter', 'On the web and in Flutter')}
        >
          <div style={{ padding: 8 }}>
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
