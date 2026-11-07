import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Page, Stage, Themes, useT } from '../../stories/kit'
import { face, people, type Person } from '../../stories/people'
import { AvatarGroup } from './index'

// The AvatarGroup, every option it has and what it is built into. The docs page is
// AvatarGroup.mdx. A line comment, not a doc comment: the docs plugin replaces a commented meta's
// parameters with one.
const meta = {
  title: 'Components/Media/AvatarGroup',
  component: AvatarGroup,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AvatarGroup>

export default meta

type Size = 'sm' | 'md' | 'lg'
type Color = 'default' | 'accent' | 'success' | 'warning' | 'danger'
const SIZES: Size[] = ['sm', 'md', 'lg']

/** Whether the story is drawn in Persian, for the names and words the helpers pick. */
function usePersian() {
  const t = useT()
  return t('fa', 'en') === 'fa'
}

/** "+3 more" in the reader's language and digits, as the block writes the count. */
function more(n: number, persian: boolean) {
  return persian ? `+${n.toLocaleString('fa-IR')} نفر` : `+${n} more`
}

/** The first [n] people, each an avatar the group can size and colour. */
function faces(
  n: number,
  persian: boolean,
  options: { groupColor?: Color; photos?: boolean } = {},
) {
  return people.slice(0, n).map((person) =>
    face({
      person,
      persian,
      photo: options.photos === false ? null : person.photo,
      groupColor: options.groupColor,
      key: person.en,
    }),
  )
}

/** A group with a line beside it. */
function WithLine({ children, line }: { children: ReactNode; line: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {children}
      <span className="text-muted" style={{ fontSize: 13 }}>
        {line}
      </span>
    </div>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  people: number
  max: number
  size: Size
  color: 'from each name' | Color
  variant: 'default' | 'soft'
  overlap: 'clip' | 'ring'
  isGrid: boolean
  photos: boolean
}

/** Every option on the controls. A max of 0 draws everyone. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    people: 7,
    max: 4,
    size: 'md',
    color: 'from each name',
    variant: 'default',
    overlap: 'clip',
    isGrid: false,
    photos: true,
  },
  argTypes: {
    people: {
      control: { type: 'range', min: 1, max: 8, step: 1 },
      description: 'How many avatars it holds.',
      table: { category: 'Example' },
    },
    max: {
      control: { type: 'range', min: 0, max: 8, step: 1 },
      description: 'How many to draw before the count; 0 leaves it out.',
      table: { category: 'AvatarGroup' },
    },
    size: {
      control: 'inline-radio',
      options: SIZES,
      description: 'For the avatars that have none, and the count.',
      table: { category: 'AvatarGroup', defaultValue: { summary: 'md' } },
    },
    color: {
      control: 'inline-radio',
      options: ['from each name', 'default', 'accent', 'success', 'warning', 'danger'],
      description: "For the avatars that have none; without one, each name's hue.",
      table: { category: 'AvatarGroup' },
    },
    variant: {
      control: 'inline-radio',
      options: ['default', 'soft'],
      description: 'For the avatars that have none.',
      table: { category: 'AvatarGroup' },
    },
    overlap: {
      control: 'inline-radio',
      options: ['clip', 'ring'],
      description: 'How a stack’s avatars meet: cut round, or ringed in the page’s colour.',
      table: { category: 'AvatarGroup', defaultValue: { summary: 'clip' } },
    },
    isGrid: {
      description: 'A grid, 12 apart, instead of a stack.',
      table: { category: 'AvatarGroup', defaultValue: { summary: 'false' } },
    },
    photos: { description: 'Photos for those who have one.', table: { category: 'Example' } },
  },
  render: function Render({ people: n, max, size, color, variant, overlap, isGrid, photos }) {
    const persian = usePersian()
    const groupColor = color === 'from each name' ? undefined : color
    return (
      <Stage width={480}>
        <AvatarGroup
          max={max || undefined}
          size={size}
          color={groupColor}
          variant={variant}
          overlap={overlap}
          isGrid={isGrid}
          role="group"
          aria-label={persian ? 'کارکنان' : 'Staff'}
        >
          {faces(n, persian, { groupColor, photos })}
        </AvatarGroup>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Stacked, a quarter of an avatar over the next: cut round each, or ringed in the page's colour. */
export const Overlap: StoryObj = {
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    return (
      <Grid min={260}>
        <Example
          title={t('بریده', 'Clip')}
          note={t(
            'پیش‌فرض: لبه‌ای شفاف، روی هر زمینه‌ای',
            'The default: a clear seam, on any ground',
          )}
        >
          <AvatarGroup overlap="clip">{faces(5, persian)}</AvatarGroup>
        </Example>
        <Example
          title={t('حلقه', 'Ring')}
          note={t('حلقه‌ای به رنگ صفحه', "A ring in the page's colour")}
        >
          <AvatarGroup overlap="ring">{faces(5, persian)}</AvatarGroup>
        </Example>
      </Grid>
    )
  },
}

/** After max, a count: the group's own "+3" in the reader's digits, or words of yours. */
export const MaxAndCount: StoryObj = {
  name: 'Max and the count',
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    return (
      <Grid min={260}>
        <Example title={t('شمارش خودِ گروه', "The group's own count")} note="max={3}">
          <AvatarGroup max={3}>{faces(8, persian)}</AvatarGroup>
        </Example>
        <Example title={t('با واژه', 'In words')} note="<AvatarGroup.Count>">
          <AvatarGroup max={3}>
            {faces(8, persian)}
            <AvatarGroup.Count>{more(5, persian)}</AvatarGroup.Count>
          </AvatarGroup>
        </Example>
        <Example
          title={t('از شمار کل', 'From a total')}
          note={t('چهار نفر از ۲۴، شمار از سرور', 'Four of 24, the total from the server')}
        >
          <AvatarGroup>
            {faces(4, persian)}
            <AvatarGroup.Count>{more(20, persian)}</AvatarGroup.Count>
          </AvatarGroup>
        </Example>
      </Grid>
    )
  },
}

/** Three sizes, for the avatars and the count alike. */
export const Sizes: StoryObj = {
  render: function Render() {
    const persian = usePersian()
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SIZES.map((size) => (
          <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <code className="text-muted" style={{ width: 32, fontSize: 12 }}>
              {size}
            </code>
            <AvatarGroup size={size} max={4}>
              {faces(7, persian)}
              <AvatarGroup.Count>{more(3, persian)}</AvatarGroup.Count>
            </AvatarGroup>
          </div>
        ))}
      </div>
    )
  },
}

/** The group's size, colour and variant fill in what each avatar left out; an avatar's own wins. */
export const GroupLook: StoryObj = {
  name: "The group's look",
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    return (
      <Grid min={260}>
        <Example
          title={t('رنگ هر نام', "Each name's hue")}
          note={t('بی رنگ گروه', 'No group colour')}
        >
          <AvatarGroup>{faces(5, persian, { photos: false })}</AvatarGroup>
        </Example>
        <Example title={t('رنگ گروه', "The group's colour")} note='color="accent" variant="soft"'>
          <AvatarGroup color="accent" variant="soft">
            {faces(5, persian, { groupColor: 'accent', photos: false })}
          </AvatarGroup>
        </Example>
        <Example
          title={t('رنگ خود آواتار', "An avatar's own")}
          note={t('یکی با color="danger"', 'One with color="danger"')}
        >
          <AvatarGroup color="accent" variant="soft">
            {people.slice(0, 5).map((person, i) =>
              face({
                person,
                persian,
                photo: null,
                groupColor: 'accent',
                color: i === 2 ? 'danger' : undefined,
                key: person.en,
              }),
            )}
          </AvatarGroup>
        </Example>
      </Grid>
    )
  },
}

/** A team in a grid, 12 apart, wrapping as the room runs out. */
export const TeamGrid: StoryObj = {
  name: 'Grid',
  render: function Render() {
    const persian = usePersian()
    return (
      <Stage width={260}>
        <AvatarGroup isGrid size="lg" role="group" aria-label={persian ? 'تیم' : 'The team'}>
          {faces(8, persian)}
        </AvatarGroup>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** Who is working on an order, in its header. */
export const OrderTeam: StoryObj = {
  name: 'Example: who is on an order',
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    return (
      <Stage width={520} surface>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: 8,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span className="text-foreground" style={{ fontSize: 16, fontWeight: 600 }}>
              {t('سفارش ۱۰۴۱', 'Order 1041')}
            </span>
            <span className="text-muted" style={{ fontSize: 12 }}>
              {t('در حال بسته‌بندی', 'Being packed')}
            </span>
          </div>
          <AvatarGroup
            size="sm"
            role="group"
            aria-label={t('مسئولان این سفارش', 'Who handles this order')}
          >
            {faces(3, persian)}
          </AvatarGroup>
        </div>
      </Stage>
    )
  },
}

/** How many have reviewed a product, a few of them shown. */
export const Reviewers: StoryObj = {
  name: 'Example: reviewers',
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    return (
      <Stage width={520}>
        <WithLine line={t('۲۴ نفر نظر داده‌اند', '24 people left a review')}>
          <AvatarGroup size="sm" max={4} aria-hidden>
            {faces(8, persian)}
          </AvatarGroup>
        </WithLine>
      </Stage>
    )
  },
}

/** The staff page's header: everyone, the newest last. */
export const StaffHeader: StoryObj = {
  name: 'Example: the staff page',
  render: function Render() {
    const t = useT()
    const persian = usePersian()
    return (
      <Page
        title={t('کارکنان', 'Staff')}
        lead={t('۸ نفر به فروشگاه دسترسی دارند.', '8 people can reach the store.')}
      >
        <Stage width={720} surface>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 8 }}>
            <AvatarGroup size="lg" max={5} role="group" aria-label={t('کارکنان', 'Staff')}>
              {faces(8, persian)}
              <AvatarGroup.Count>{more(3, persian)}</AvatarGroup.Count>
            </AvatarGroup>
          </div>
        </Stage>
      </Page>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const persian = usePersian()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <AvatarGroup max={4}>
        {faces(7, persian)}
        <AvatarGroup.Count>{more(3, persian)}</AvatarGroup.Count>
      </AvatarGroup>
      <AvatarGroup overlap="ring" size="sm">
        {faces(5, persian)}
      </AvatarGroup>
      <AvatarGroup color="accent" variant="soft">
        {faces(4, persian, { groupColor: 'accent', photos: false })}
      </AvatarGroup>
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

/** A Persian page and an English one: a stack starts at the reading side. */
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
    const persian = usePersian()
    const tree = {
      type: 'AvatarGroup',
      props: { max: 4, size: 'md' },
      children: people.slice(0, 7).map((person: Person) => ({
        type: 'Avatar',
        props: { name: persian ? person.fa : person.en },
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
