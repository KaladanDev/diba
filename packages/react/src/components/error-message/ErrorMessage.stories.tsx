import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId, useState } from 'react'
import type { Selection } from 'react-aria-components'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { CalendarInsides, DAY, isFriday } from '../../stories/dates'
import { Calendar } from '../calendar'
import { Description } from '../description'
import { InputOTP } from '../input-otp'
import { Label } from '../label'
import { Tag } from '../tag'
import { TagGroup } from '../tag-group'
import { ErrorMessage } from './index'

// The ErrorMessage, where it goes and what it says. The docs page is ErrorMessage.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta: Meta = {
  title: 'Components/Forms/ErrorMessage',
  component: ErrorMessage,
  parameters: { layout: 'fullscreen' },
}

export default meta

const CATEGORIES = [
  { id: 'scarf', fa: 'شال', en: 'Scarves' },
  { id: 'bag', fa: 'کیف', en: 'Bags' },
  { id: 'shoe', fa: 'کفش', en: 'Shoes' },
]

/** Product categories to choose, at least one. */
function Categories({ message }: { message?: string }) {
  const t = useT()
  const [selected, setSelected] = useState<Selection>(new Set())
  const none = selected !== 'all' && selected.size === 0
  return (
    <TagGroup selectionMode="multiple" selectedKeys={selected} onSelectionChange={setSelected}>
      <Label>{t('دسته‌ها', 'Categories')}</Label>
      <TagGroup.List>
        {CATEGORIES.map((c) => (
          <Tag key={c.id} id={c.id}>
            {t(c.fa, c.en)}
          </Tag>
        ))}
      </TagGroup.List>
      <Description>
        {t('محصول در این دسته‌ها دیده می‌شود.', 'The product is shown in these categories.')}
      </Description>
      {none ? (
        <ErrorMessage>
          {message ?? t('دست‌کم یک دسته را برگزینید.', 'Choose one category at least.')}
        </ErrorMessage>
      ) : null}
    </TagGroup>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = { children: string }

/** The words on the controls; choose a category and it goes. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { children: '' },
  argTypes: {
    children: {
      control: 'text',
      description: 'What is wrong; empty takes the sample’s.',
      table: { category: 'ErrorMessage' },
    },
  },
  render: function Render(args) {
    return (
      <Stage width={480}>
        <Categories message={args.children || undefined} />
      </Stage>
    )
  },
}

// ---- where it goes -------------------------------------------------------------------------------

/** Under a group of tags, which checks nothing itself: shown while none is chosen. */
export const UnderATagGroup: StoryObj = {
  name: 'Under a tag group',
  render: () => (
    <Stage width={480}>
      <Categories />
    </Stage>
  ),
}

/** Under a calendar whose day cannot be taken: the calendar is drawn as wrong and reads it. */
export const UnderACalendar: StoryObj = {
  name: 'Under a calendar',
  render: function Render() {
    const t = useT()
    const [day, setDay] = useState(DAY.add({ days: -1 }))
    const friday = isFriday(day)
    return (
      <Stage width={360}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Calendar
            aria-label={t('روز ارسال', 'Delivery day')}
            value={day}
            onChange={setDay}
            isInvalid={friday}
          >
            <CalendarInsides />
            {friday ? (
              <ErrorMessage>
                {t('جمعه‌ها ارسال نداریم.', 'We do not deliver on Fridays.')}
              </ErrorMessage>
            ) : null}
          </Calendar>
          <Value label="value" value={day.toString()} />
        </div>
      </Stage>
    )
  },
}

/** Under a code, joined to it by aria-describedby, which a code has no slot for. */
export const UnderACode: StoryObj = {
  name: 'Under a one-time code',
  render: function Render() {
    const t = useT()
    const error = useId()
    const [code, setCode] = useState('1234')
    return (
      <Stage width={360}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Label>{t('کد تأیید', 'Confirmation code')}</Label>
          <InputOTP
            maxLength={4}
            value={code}
            onChange={setCode}
            isInvalid
            aria-label={t('کد تأیید', 'Confirmation code')}
            aria-describedby={error}
          >
            <InputOTP.Group>
              {[0, 1, 2, 3].map((i) => (
                <InputOTP.Slot key={i} index={i} />
              ))}
            </InputOTP.Group>
          </InputOTP>
          <ErrorMessage id={error}>
            {t('کد درست نیست. دوباره بنویسید.', 'The code is wrong. Type it again.')}
          </ErrorMessage>
        </div>
      </Stage>
    )
  },
}

/** Short words and a long one: it wraps under its field, a long word too. */
export const Wrapping: StoryObj = {
  name: 'Short and long',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={240}>
        <Example title={t('کوتاه', 'Short')}>
          <ErrorMessage>{t('لازم است.', 'Required.')}</ErrorMessage>
        </Example>
        <Example title={t('بلند', 'Long')}>
          <ErrorMessage>
            {t(
              'این دسته در فروشگاه شما پنهان است؛ پیش از افزودن محصول، آن را در تنظیمات دسته‌ها نمایان کنید.',
              'This category is hidden in your shop; show it in the category settings before adding a product to it.',
            )}
          </ErrorMessage>
        </Example>
        <Example title={t('یک نشانی بلند', 'A long address')}>
          <ErrorMessage>
            {t('در دسترس نیست: ', 'Not reachable: ')}
            <bdi dir="ltr">https://termeh-yazd.kaladan.shop/collections/silk-scarves-autumn</bdi>
          </ErrorMessage>
        </Example>
      </Grid>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  return (
    <div style={{ width: 320, maxWidth: '100%' }}>
      <Categories />
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

/** A tree says it with its field's errorMessage: a tag group's here. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'TagGroup',
      props: {
        label: t('دسته‌ها', 'Categories'),
        selectionMode: 'multiple',
        errorMessage: t('دست‌کم یک دسته را برگزینید.', 'Choose one category at least.'),
      },
      children: CATEGORIES.map((c) => ({
        type: 'Tag',
        props: { id: c.id },
        children: t(c.fa, c.en),
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
