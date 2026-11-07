import type { Meta, StoryObj } from '@storybook/react-vite'
import { Store, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Page, Stage, Themes, useT } from '../../stories/kit'
import {
  brokenPhoto,
  face,
  people,
  presenceWord,
  shops,
  type Person,
  type Presence,
} from '../../stories/people'
import { Avatar } from './index'

// The Avatar, every option it has and what it is built into. The docs page is Avatar.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
// Typed as a plain Meta: Avatar's props carry a key its declarations cannot name.
const meta: Meta = {
  title: 'Components/Media/Avatar',
  component: Avatar,
  parameters: { layout: 'fullscreen' },
}

export default meta

type Size = 'sm' | 'md' | 'lg'
type Color = 'default' | 'accent' | 'success' | 'warning' | 'danger'
const SIZES: Size[] = ['sm', 'md', 'lg']
const COLORS: Color[] = ['default', 'accent', 'success', 'warning', 'danger']
const PRESENCES: Presence[] = ['online', 'away', 'busy', 'offline']
const HUES = ['saffron', 'garnet', 'emerald', 'sky', 'iris'] as const

/** Whether the story is drawn in Persian, for the names and words the helpers pick. */
function usePersian() {
  const t = useT()
  return t('fa', 'en') === 'fa'
}

/** Avatars in a row, 12 apart, centred on each other. */
function Row({ children, gap = 12 }: { children: ReactNode; gap?: number }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap }}>{children}</div>
  )
}

/** A caption under an avatar. */
function Captioned({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {children}
      <span className="text-muted" style={{ fontSize: 12 }}>
        {caption}
      </span>
    </div>
  )
}

/** A person, their avatar beside their name and a line under it. */
function Named({
  person,
  persian,
  line,
  presence,
  size = 'md',
  end,
}: {
  person: Person
  persian: boolean
  line: string
  presence?: Presence
  size?: Size
  end?: ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {face({ person, persian, presence, size, hidden: true })}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
        <span className="text-foreground" style={{ fontSize: 14, fontWeight: 500 }}>
          {persian ? person.fa : person.en}
        </span>
        <span className="text-muted" style={{ fontSize: 12 }}>
          {line}
          {presence ? ` · ${presenceWord(presence, persian)}` : ''}
        </span>
      </div>
      {end}
    </div>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  content: 'photo' | 'initials' | 'icon' | 'broken photo'
  name: string
  size: Size
  color: 'from the name' | Color
  variant: 'default' | 'soft'
  presence: 'none' | Presence
  ringed: boolean
}

/** Every option on the controls. An empty name takes the sample's. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    content: 'photo',
    name: '',
    size: 'lg',
    color: 'from the name',
    variant: 'default',
    presence: 'online',
    ringed: false,
  },
  argTypes: {
    content: {
      control: 'inline-radio',
      options: ['photo', 'initials', 'icon', 'broken photo'],
      description: 'Avatar.Image over Avatar.Fallback, or the fallback alone.',
      table: { category: 'Example' },
    },
    name: {
      control: 'text',
      description: 'Gives the initials, the hue and the accessible name.',
      table: { category: 'Example' },
    },
    size: {
      control: 'inline-radio',
      options: SIZES,
      description: '32, 40 or 48 across.',
      table: { category: 'Avatar', defaultValue: { summary: 'md' } },
    },
    color: {
      control: 'inline-radio',
      options: ['from the name', ...COLORS],
      description: "A status tone; without one, the name's hue through data-hue.",
      table: { category: 'Avatar', defaultValue: { summary: 'default' } },
    },
    variant: {
      control: 'inline-radio',
      options: ['default', 'soft'],
      description: "The neutral fill, or the colour's own tint.",
      table: { category: 'Avatar', defaultValue: { summary: 'default' } },
    },
    presence: {
      control: 'inline-radio',
      options: ['none', ...PRESENCES],
      description: 'A dot at the bottom of the end side, read after the name.',
      table: { category: 'Example' },
    },
    ringed: {
      description: 'A ring 2 outside it, through data-ringed, to pick one out.',
      table: { category: 'Example' },
    },
  },
  render: function Render({ content, name, size, color, variant, presence, ringed }) {
    const persian = usePersian()
    const sample = people[0]!
    const person = name ? { fa: name, en: name } : sample
    return (
      <Stage width={320}>
        <Row>
          {face({
            person,
            persian,
            photo:
              content === 'photo'
                ? (sample.photo as string)
                : content === 'broken photo'
                  ? brokenPhoto
                  : null,
            icon: content === 'icon' ? <UserRound aria-hidden /> : undefined,
            size,
            color: color === 'from the name' ? undefined : color,
            variant,
            presence: presence === 'none' ? undefined : presence,
            ringed,
          })}
        </Row>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** A photo, initials, an icon for someone unnamed, or a shop's mark. A photo that fails leaves the initials. */
export const Content: StoryObj = {
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    return (
      <Row gap={32}>
        <Captioned caption={t('عکس', 'A photo')}>
          {face({ person: people[1]!, persian, size: 'lg' })}
        </Captioned>
        <Captioned caption={t('حروف اول نام', 'Initials')}>
          {face({ person: people[2]!, persian, size: 'lg' })}
        </Captioned>
        <Captioned caption={t('عکسی که باز نشد', 'A photo that failed')}>
          {face({ person: people[6]!, persian, photo: brokenPhoto, size: 'lg' })}
        </Captioned>
        <Captioned caption={t('آیکون، بی‌نام', 'An icon, unnamed')}>
          {face({
            person: { fa: 'مهمان', en: 'Guest' },
            persian,
            icon: <UserRound aria-hidden />,
            size: 'lg',
          })}
        </Captioned>
        <Captioned caption={t('نشان یک فروشگاه', "A shop's mark")}>
          {face({ person: shops.tea, persian, size: 'lg' })}
        </Captioned>
        <Captioned caption={t('فروشگاه بی‌نشان', 'A shop without one')}>
          {face({
            person: { fa: 'فروشگاه', en: 'Shop' },
            persian,
            icon: <Store aria-hidden />,
            color: 'accent',
            variant: 'soft',
            size: 'lg',
          })}
        </Captioned>
      </Row>
    )
  },
}

/** Three sizes: 32, 40 and 48 across, initials 12, 14 and 17. */
export const Sizes: StoryObj = {
  render: function Render() {
    const persian = usePersian()
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SIZES.map((size) => (
          <Row key={size} gap={16}>
            <code className="text-muted" style={{ width: 32, fontSize: 12 }}>
              {size}
            </code>
            {face({ person: people[0]!, persian, size })}
            {face({ person: people[4]!, persian, size })}
            {face({
              person: { fa: 'مهمان', en: 'Guest' },
              persian,
              icon: <UserRound aria-hidden />,
              size,
            })}
            {face({ person: people[3]!, persian, size, presence: 'online' })}
          </Row>
        ))}
      </div>
    )
  },
}

/** Without a colour, a name takes one of five hues, the same on every page and in Flutter. */
export const ColourFromTheName: StoryObj = {
  name: 'A colour from the name',
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <Example
          title={t('از هر نام', 'From each name')}
          note={t('همان نام، همان رنگ', 'The same name, the same colour')}
        >
          <Row gap={24}>
            {people.map((person) => (
              <Captioned key={person.en} caption={persian ? person.fa : person.en}>
                {face({ person, persian, photo: null, size: 'lg' })}
              </Captioned>
            ))}
          </Row>
        </Example>
        <Example title={t('پنج رنگ', 'The five hues')} note="data-hue">
          <Row gap={24}>
            {HUES.map((hue) => (
              <Captioned key={hue} caption={hue}>
                <Avatar size="lg" data-hue={hue} role="img" aria-label={hue}>
                  <Avatar.Fallback aria-hidden>{t('ن‌ر', 'NR')}</Avatar.Fallback>
                </Avatar>
              </Captioned>
            ))}
          </Row>
        </Example>
      </div>
    )
  },
}

/** The five status tones, on the neutral fill or, soft, on their own tint. */
export const Colours: StoryObj = {
  name: 'Colours and variants',
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    return (
      <Grid min={260}>
        {(['default', 'soft'] as const).map((variant) => (
          <Example
            key={variant}
            title={variant === 'default' ? t('پیش‌فرض', 'Default') : t('ملایم', 'Soft')}
            note={`variant="${variant}"`}
          >
            <Row>
              {COLORS.map((color) => (
                <Captioned key={color} caption={color}>
                  {face({ person: people[2]!, persian, color, variant })}
                </Captioned>
              ))}
            </Row>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Online, away, busy or offline: a dot at the bottom of the end side, read after the name. */
export const PresenceDot: StoryObj = {
  name: 'Presence',
  render: function Render() {
    const persian = usePersian()
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {SIZES.map((size) => (
          <Row key={size} gap={20}>
            {PRESENCES.map((presence, i) => (
              <Captioned key={presence} caption={presenceWord(presence, persian)}>
                {face({ person: people[i * 2]!, persian, presence, size })}
              </Captioned>
            ))}
          </Row>
        ))}
      </div>
    )
  },
}

/** A ring 2 outside, to pick one out: whose turn it is, or who is signed in. */
export const Ringed: StoryObj = {
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    return (
      <Grid min={260}>
        <Example
          title={t('یکی از میان چند نفر', 'One among several')}
          note={t('مسئول این سفارش', 'Who handles this order')}
        >
          <Row>
            {people
              .slice(0, 5)
              .map((person, i) => face({ person, persian, ringed: i === 1, key: person.en }))}
          </Row>
        </Example>
        <Example title={t('با نشانگر حضور', 'With a presence dot')}>
          <Row>
            {face({ person: people[0]!, persian, size: 'lg', ringed: true, presence: 'online' })}
          </Row>
        </Example>
      </Grid>
    )
  },
}

/** Named for a screen reader when it stands alone; silent beside its name in words. */
export const Accessible: StoryObj = {
  name: 'Named, or beside its name',
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    return (
      <Grid min={300}>
        <Example
          title={t('به‌تنهایی', 'On its own')}
          note={t(
            'role="img" و نام در aria-label؛ حروف اول پنهان',
            'role="img" and the name in aria-label; the initials hidden',
          )}
        >
          <Row>{face({ person: people[0]!, persian, presence: 'away' })}</Row>
        </Example>
        <Example
          title={t('کنار نامش', 'Beside its name')}
          note={t('aria-hidden: نام یک بار خوانده می‌شود', 'aria-hidden: the name is read once')}
        >
          <Named person={people[0]!} persian={persian} line={t('پشتیبانی', 'Support')} />
        </Example>
      </Grid>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** The staff page: each person beside their name, their role and whether they are in. */
export const StaffList: StoryObj = {
  name: 'Example: staff',
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    const staff: [Person, string, Presence][] = [
      [people[0]!, t('مدیر فروشگاه', 'Store owner'), 'online'],
      [people[1]!, t('انباردار', 'Stock keeper'), 'busy'],
      [people[2]!, t('پشتیبانی', 'Support'), 'away'],
      [people[3]!, t('حسابدار', 'Accountant'), 'offline'],
    ]
    return (
      <Stage width={520} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}>
          {staff.map(([person, role, presence]) => (
            <Named
              key={person.en}
              person={person}
              persian={persian}
              line={role}
              presence={presence}
              end={
                <span className="text-muted" style={{ fontSize: 12 }}>
                  {presence === 'online' ? t('اکنون', 'Now') : t('۲ ساعت پیش', '2 hours ago')}
                </span>
              }
            />
          ))}
        </div>
      </Stage>
    )
  },
}

/** An order's customer: their avatar, name and what the shop knows of them. */
export const OrderCustomer: StoryObj = {
  name: 'Example: an order’s customer',
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    return (
      <Stage width={420} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}>
          <span className="text-muted" style={{ fontSize: 12 }}>
            {t('مشتری', 'Customer')}
          </span>
          <Named
            person={people[5]!}
            persian={persian}
            size="lg"
            line={t('۷ سفارش · از اردیبهشت ۱۴۰۳', '7 orders · since May 2024')}
          />
        </div>
      </Stage>
    )
  },
}

/** Reviews on a product: each buyer's avatar beside what they wrote. */
export const Reviews: StoryObj = {
  name: 'Example: reviews',
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    const reviews: [Person, string][] = [
      [
        people[4]!,
        t(
          'رنگش دقیقاً همان است که در عکس بود. بسته‌بندی هم عالی.',
          'The colour is just as in the photo. Lovely packing too.',
        ),
      ],
      [people[1]!, t('زودتر از آنچه گفته بودند رسید.', 'It came sooner than they said it would.')],
    ]
    return (
      <Stage width={560}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {reviews.map(([person, words]) => (
            <div key={person.en} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {face({ person, persian, size: 'sm', hidden: true })}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="text-foreground" style={{ fontSize: 14, fontWeight: 500 }}>
                  {persian ? person.fa : person.en}
                </span>
                <p
                  className="text-foreground"
                  style={{ margin: 0, fontSize: 14, lineHeight: '22px' }}
                >
                  {words}
                </p>
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
  const persian = usePersian()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Row>
        {face({ person: people[0]!, persian, presence: 'online' })}
        {face({ person: people[2]!, persian, presence: 'away' })}
        {face({ person: people[4]!, persian, ringed: true })}
        {face({ person: shops.scarf, persian })}
        {face({ person: { fa: 'مهمان', en: 'Guest' }, persian, icon: <UserRound aria-hidden /> })}
      </Row>
      <Row>
        {COLORS.map((color) =>
          face({ person: people[6]!, persian, color, variant: 'soft', key: color }),
        )}
      </Row>
      <Named person={people[1]!} persian={persian} line="arash@aftab.shop" presence="busy" />
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

/** A Persian page and an English one: the dot keeps to the end side. */
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

/** The same avatars as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { direction: 'horizontal', gap: 3, align: 'center' },
      children: [
        {
          type: 'Avatar',
          props: { name: t('نیلوفر رستمی', 'Niloufar Rostami'), size: 'lg', presence: 'online' },
        },
        {
          type: 'Avatar',
          props: { name: t('آرش کریمی', 'Arash Karimi'), size: 'lg', isRinged: true },
        },
        { type: 'Avatar', props: { icon: 'user', size: 'lg' } },
        {
          type: 'Avatar',
          props: {
            name: t('سارا احمدی', 'Sara Ahmadi'),
            size: 'lg',
            color: 'success',
            variant: 'soft',
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
