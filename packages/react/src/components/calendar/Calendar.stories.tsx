import type { Meta, StoryObj } from '@storybook/react-vite'
import { parseDate, type CalendarDate } from '@internationalized/date'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { CalendarInsides, DAY, InCalendar, iso, isFriday } from '../../stories/dates'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { ErrorMessage } from '../error-message'
import { Calendar } from './index'

// The Calendar, every option it has and what it is built into. The docs page is Calendar.mdx. A
// line comment, not a doc comment: the docs plugin replaces a commented meta's parameters with
// one. Typed as a plain Meta: Calendar is generic.
const meta: Meta = {
  title: 'Components/Date and Time/Calendar',
  component: Calendar,
  parameters: { layout: 'fullscreen' },
}

export default meta

type System = 'auto' | 'persian' | 'gregorian'

/** The first and last days a limited calendar takes: 5 October to 10 November 2026. */
const FIRST = parseDate('2026-10-05')
const LAST = parseDate('2026-11-10')
/** A holiday in that month: 22 October 2026. */
const HOLIDAY = parseDate('2026-10-22')

/** A calendar as wide as it is drawn, 296 across. */
function Frame({ children }: { children: ReactNode }) {
  return <div style={{ width: 296, maxWidth: '100%' }}>{children}</div>
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  calendar: System
  yearPicker: boolean
  todayButton: boolean
  firstDayOfWeek: 'the language’s' | 'sat' | 'sun' | 'mon'
  limits: boolean
  fridaysOff: boolean
  isDisabled: boolean
  isReadOnly: boolean
  isInvalid: boolean
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    calendar: 'auto',
    yearPicker: true,
    todayButton: true,
    firstDayOfWeek: 'the language’s',
    limits: false,
    fridaysOff: false,
    isDisabled: false,
    isReadOnly: false,
    isInvalid: false,
  },
  argTypes: {
    calendar: {
      control: 'inline-radio',
      options: ['auto', 'persian', 'gregorian'],
      description: 'The language’s own, or one whatever the language, through the locale.',
      table: { category: 'Example' },
    },
    yearPicker: {
      description: 'The title opens the years and then the months.',
      table: { category: 'Example' },
    },
    todayButton: {
      description: 'Calendar.TodayButton under the days.',
      table: { category: 'Example' },
    },
    firstDayOfWeek: {
      control: 'inline-radio',
      options: ['the language’s', 'sat', 'sun', 'mon'],
      table: { category: 'Calendar' },
    },
    limits: {
      description: 'minValue and maxValue: 5 October to 10 November 2026.',
      table: { category: 'Example' },
    },
    fridaysOff: {
      description: 'isDateUnavailable: every Friday, and 22 October.',
      table: { category: 'Example' },
    },
    isDisabled: { table: { category: 'Calendar', defaultValue: { summary: 'false' } } },
    isReadOnly: { table: { category: 'Calendar', defaultValue: { summary: 'false' } } },
    isInvalid: {
      description: 'With an ErrorMessage under the days.',
      table: { category: 'Calendar', defaultValue: { summary: 'false' } },
    },
  },
  render: function Render({
    calendar,
    yearPicker,
    todayButton,
    firstDayOfWeek,
    limits,
    fridaysOff,
    isDisabled,
    isReadOnly,
    isInvalid,
  }) {
    const t = useT()
    const [value, setValue] = useState<CalendarDate | null>(DAY)
    return (
      <Stage width={360}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <InCalendar system={calendar}>
            <Frame>
              <Calendar
                aria-label={t('روز ارسال', 'Delivery day')}
                value={value}
                onChange={setValue}
                firstDayOfWeek={firstDayOfWeek === 'the language’s' ? undefined : firstDayOfWeek}
                minValue={limits ? FIRST : undefined}
                maxValue={limits ? LAST : undefined}
                isDateUnavailable={
                  fridaysOff ? (date) => isFriday(date) || date.compare(HOLIDAY) === 0 : undefined
                }
                isDisabled={isDisabled}
                isReadOnly={isReadOnly}
                isInvalid={isInvalid}
              >
                <CalendarInsides yearPicker={yearPicker} today={todayButton} />
                <ErrorMessage>{t('روزی دیگر برگزینید.', 'Pick another day.')}</ErrorMessage>
              </Calendar>
            </Frame>
          </InCalendar>
          <Value label="value" value={iso(value)} />
        </div>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** The day a Persian reader counts in, and the same day in the Gregorian calendar. */
export const Calendars: StoryObj = {
  name: 'Persian and Gregorian',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        {(['persian', 'gregorian'] as const).map((system) => (
          <Example
            key={system}
            title={system === 'persian' ? t('خورشیدی', 'Persian') : t('میلادی', 'Gregorian')}
            note={`value ${iso(DAY)}`}
          >
            <InCalendar system={system}>
              <Frame>
                <Calendar aria-label={t('تاریخ', 'Date')} defaultValue={DAY}>
                  <CalendarInsides />
                </Calendar>
              </Frame>
            </InCalendar>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Controlled: the day picked, as the wire carries it, Gregorian whatever calendar drew it. */
export const Controlled: StoryObj = {
  render: function Render() {
    const t = useT()
    const [value, setValue] = useState<CalendarDate | null>(DAY)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Frame>
          <Calendar aria-label={t('تاریخ', 'Date')} value={value} onChange={setValue}>
            <CalendarInsides />
          </Calendar>
        </Frame>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Value label="value" value={iso(value)} />
          <Button size="sm" variant="tertiary" onPress={() => setValue(DAY)}>
            {t('برگرداندن', 'Reset')}
          </Button>
        </div>
      </div>
    )
  },
}

/** Days before the first or after the last cannot be reached; unavailable days are drawn at half. */
export const Limits: StoryObj = {
  name: 'First, last and unavailable days',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        <Example
          title={t('نخستین و واپسین روز', 'A first and last day')}
          note="minValue · maxValue"
        >
          <Frame>
            <Calendar
              aria-label={t('تاریخ', 'Date')}
              defaultFocusedValue={DAY}
              minValue={FIRST}
              maxValue={LAST}
            >
              <CalendarInsides />
            </Calendar>
          </Frame>
        </Example>
        <Example
          title={t('روزهای ناموجود', 'Unavailable days')}
          note={t('جمعه‌ها و یک تعطیل', 'Fridays and a holiday')}
        >
          <Frame>
            <Calendar
              aria-label={t('تاریخ', 'Date')}
              defaultFocusedValue={DAY}
              isDateUnavailable={(date) => isFriday(date) || date.compare(HOLIDAY) === 0}
            >
              <CalendarInsides />
            </Calendar>
          </Frame>
        </Example>
      </Grid>
    )
  },
}

/** The title opens the years, and then the year's months; or it is a heading alone. */
export const YearAndMonth: StoryObj = {
  name: 'Years and months',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        <Example
          title={t('با انتخاب سال', 'With the year picker')}
          note="Calendar.YearPickerTrigger"
        >
          <Frame>
            <Calendar aria-label={t('تاریخ', 'Date')} defaultValue={DAY}>
              <CalendarInsides />
            </Calendar>
          </Frame>
        </Example>
        <Example title={t('فقط عنوان', 'A heading alone')} note="Calendar.Heading">
          <Frame>
            <Calendar aria-label={t('تاریخ', 'Date')} defaultValue={DAY}>
              <CalendarInsides yearPicker={false} />
            </Calendar>
          </Frame>
        </Example>
      </Grid>
    )
  },
}

/** A week starts on the language's day, Saturday in Persian; or on the one you give. */
export const FirstDay: StoryObj = {
  name: 'The first day of the week',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        <Example title={t('روز زبان', 'The language’s')}>
          <Frame>
            <Calendar aria-label={t('تاریخ', 'Date')} defaultValue={DAY}>
              <CalendarInsides today={false} />
            </Calendar>
          </Frame>
        </Example>
        <Example title={t('دوشنبه', 'Monday')} note='firstDayOfWeek="mon"'>
          <Frame>
            <Calendar aria-label={t('تاریخ', 'Date')} defaultValue={DAY} firstDayOfWeek="mon">
              <CalendarInsides today={false} />
            </Calendar>
          </Frame>
        </Example>
      </Grid>
    )
  },
}

/** Disabled, read-only, and invalid with what is wrong under the days. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        <Example title={t('غیرفعال', 'Disabled')}>
          <Frame>
            <Calendar aria-label={t('تاریخ', 'Date')} defaultValue={DAY} isDisabled>
              <CalendarInsides />
            </Calendar>
          </Frame>
        </Example>
        <Example title={t('فقط خواندنی', 'Read-only')}>
          <Frame>
            <Calendar aria-label={t('تاریخ', 'Date')} defaultValue={DAY} isReadOnly>
              <CalendarInsides />
            </Calendar>
          </Frame>
        </Example>
        <Example title={t('نادرست', 'Invalid')} note="isInvalid · ErrorMessage">
          <Frame>
            <Calendar aria-label={t('تاریخ', 'Date')} defaultValue={DAY} isInvalid>
              <CalendarInsides />
              <ErrorMessage>
                {t('در این روز ارسال نداریم.', "We don't deliver on this day.")}
              </ErrorMessage>
            </Calendar>
          </Frame>
        </Example>
      </Grid>
    )
  },
}

/** A week, or a few days, instead of a month: visibleDuration. */
export const Durations: StoryObj = {
  name: 'A week',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={360}>
        <Calendar aria-label={t('تاریخ', 'Date')} defaultValue={DAY} visibleDuration={{ weeks: 1 }}>
          <CalendarInsides yearPicker={false} />
        </Calendar>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** A checkout's delivery day: from two days on, never a Friday. */
export const DeliveryDay: StoryObj = {
  name: 'Example: a delivery day',
  render: function Render() {
    const t = useT()
    const [value, setValue] = useState<CalendarDate | null>(null)
    return (
      <Stage width={360} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}>
          <span className="text-foreground" style={{ fontSize: 16, fontWeight: 600 }}>
            {t('روز ارسال را برگزینید', 'Pick a delivery day')}
          </span>
          <span className="text-muted" style={{ fontSize: 13 }}>
            {t('از دو روز دیگر، جز جمعه‌ها.', 'From two days on, never on a Friday.')}
          </span>
          <Calendar
            aria-label={t('روز ارسال', 'Delivery day')}
            value={value}
            onChange={setValue}
            defaultFocusedValue={DAY}
            minValue={DAY.add({ days: 2 })}
            maxValue={DAY.add({ days: 30 })}
            isDateUnavailable={isFriday}
          >
            <CalendarInsides yearPicker={false} />
          </Calendar>
          <Value label="value" value={iso(value)} />
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <Frame>
      <Calendar
        aria-label={t('تاریخ', 'Date')}
        defaultValue={DAY}
        isDateUnavailable={(date) => date.compare(HOLIDAY) === 0}
      >
        <CalendarInsides />
      </Calendar>
    </Frame>
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

/** A Persian page and an English one: the days run with the reading, the arrows turned with them. */
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

/** The same calendar as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Calendar',
      props: {
        label: t('روز ارسال', 'Delivery day'),
        defaultValue: '2026-10-17',
        minValue: '2026-10-05',
        unavailableDates: ['2026-10-22'],
      },
    }
    return (
      <Grid min={320}>
        <Example
          title={t('آنچه کشیده می‌شود', 'What is drawn')}
          note={t('در وب و در Flutter', 'On the web and in Flutter')}
        >
          <Frame>
            <DibaSurface tree={tree as never} />
          </Frame>
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
