import type { Meta, StoryObj } from '@storybook/react-vite'
import { endOfMonth, parseDate, startOfMonth, type CalendarDate } from '@internationalized/date'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { DAY, InCalendar, RangeCalendarInsides, isFriday, isoRange } from '../../stories/dates'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { ErrorMessage } from '../error-message'
import { RangeCalendar } from './index'

// The RangeCalendar, every option it has and what it is built into. The docs page is
// RangeCalendar.mdx. A line comment, not a doc comment: the docs plugin replaces a commented
// meta's parameters with one. Typed as a plain Meta: RangeCalendar is generic.
const meta: Meta = {
  title: 'Components/Date and Time/RangeCalendar',
  component: RangeCalendar,
  parameters: { layout: 'fullscreen' },
}

export default meta

type System = 'auto' | 'persian' | 'gregorian'
type Range = { start: CalendarDate; end: CalendarDate }

/** A week from the fixed day: 17 to 23 October 2026, ۲۵ مهر to ۱ آبان ۱۴۰۵. */
const WEEK: Range = { start: DAY, end: DAY.add({ days: 6 }) }
const FIRST = parseDate('2026-10-05')
const LAST = parseDate('2026-11-10')
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
  limits: boolean
  fridaysOff: boolean
  allowsNonContiguousRanges: boolean
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
    limits: false,
    fridaysOff: false,
    allowsNonContiguousRanges: false,
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
      description: 'RangeCalendar.TodayButton under the days.',
      table: { category: 'Example' },
    },
    limits: {
      description: 'minValue and maxValue: 5 October to 10 November 2026.',
      table: { category: 'Example' },
    },
    fridaysOff: {
      description: 'isDateUnavailable: every Friday, and 22 October.',
      table: { category: 'Example' },
    },
    allowsNonContiguousRanges: {
      description: 'A range may run across unavailable days.',
      table: { category: 'RangeCalendar', defaultValue: { summary: 'false' } },
    },
    isDisabled: { table: { category: 'RangeCalendar', defaultValue: { summary: 'false' } } },
    isReadOnly: { table: { category: 'RangeCalendar', defaultValue: { summary: 'false' } } },
    isInvalid: {
      description: 'With an ErrorMessage under the days.',
      table: { category: 'RangeCalendar', defaultValue: { summary: 'false' } },
    },
  },
  render: function Render({
    calendar,
    yearPicker,
    todayButton,
    limits,
    fridaysOff,
    allowsNonContiguousRanges,
    isDisabled,
    isReadOnly,
    isInvalid,
  }) {
    const t = useT()
    const [value, setValue] = useState<Range | null>(WEEK)
    return (
      <Stage width={360}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <InCalendar system={calendar}>
            <Frame>
              <RangeCalendar
                aria-label={t('دوره', 'Period')}
                value={value}
                onChange={setValue}
                minValue={limits ? FIRST : undefined}
                maxValue={limits ? LAST : undefined}
                isDateUnavailable={
                  fridaysOff ? (date) => isFriday(date) || date.compare(HOLIDAY) === 0 : undefined
                }
                allowsNonContiguousRanges={allowsNonContiguousRanges}
                isDisabled={isDisabled}
                isReadOnly={isReadOnly}
                isInvalid={isInvalid}
              >
                <RangeCalendarInsides yearPicker={yearPicker} today={todayButton} />
                <ErrorMessage>
                  {t('دوره نباید بیش از یک ماه باشد.', 'A period is a month at most.')}
                </ErrorMessage>
              </RangeCalendar>
            </Frame>
          </InCalendar>
          <Value label="value" value={isoRange(value)} />
        </div>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** A first press starts the range, a second ends it; the days between are filled. */
export const PickingARange: StoryObj = {
  name: 'Picking a range',
  render: function Render() {
    const t = useT()
    const [value, setValue] = useState<Range | null>(null)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Frame>
          <RangeCalendar
            aria-label={t('دوره', 'Period')}
            value={value}
            onChange={setValue}
            defaultFocusedValue={DAY}
          >
            <RangeCalendarInsides />
          </RangeCalendar>
        </Frame>
        <Value label="value" value={isoRange(value)} />
      </div>
    )
  },
}

/** The same range, counted in the Persian calendar and in the Gregorian. */
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
            note={`value ${isoRange(WEEK)!.join(' – ')}`}
          >
            <InCalendar system={system}>
              <Frame>
                <RangeCalendar aria-label={t('دوره', 'Period')} defaultValue={WEEK}>
                  <RangeCalendarInsides />
                </RangeCalendar>
              </Frame>
            </InCalendar>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Days outside the limits cannot be reached; a range stops at an unavailable day, unless it may run across. */
export const Limits: StoryObj = {
  name: 'Limits and unavailable days',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        <Example
          title={t('نخستین و واپسین روز', 'A first and last day')}
          note="minValue · maxValue"
        >
          <Frame>
            <RangeCalendar
              aria-label={t('دوره', 'Period')}
              defaultFocusedValue={DAY}
              minValue={FIRST}
              maxValue={LAST}
            >
              <RangeCalendarInsides />
            </RangeCalendar>
          </Frame>
        </Example>
        <Example
          title={t('از روی روزهای ناموجود', 'Across unavailable days')}
          note="allowsNonContiguousRanges"
        >
          <Frame>
            <RangeCalendar
              aria-label={t('دوره', 'Period')}
              defaultValue={WEEK}
              isDateUnavailable={(date) => isFriday(date) || date.compare(HOLIDAY) === 0}
              allowsNonContiguousRanges
            >
              <RangeCalendarInsides />
            </RangeCalendar>
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
            <RangeCalendar aria-label={t('دوره', 'Period')} defaultValue={WEEK} isDisabled>
              <RangeCalendarInsides />
            </RangeCalendar>
          </Frame>
        </Example>
        <Example title={t('فقط خواندنی', 'Read-only')}>
          <Frame>
            <RangeCalendar aria-label={t('دوره', 'Period')} defaultValue={WEEK} isReadOnly>
              <RangeCalendarInsides />
            </RangeCalendar>
          </Frame>
        </Example>
        <Example title={t('نادرست', 'Invalid')} note="isInvalid · ErrorMessage">
          <Frame>
            <RangeCalendar aria-label={t('دوره', 'Period')} defaultValue={WEEK} isInvalid>
              <RangeCalendarInsides />
              <ErrorMessage>
                {t(
                  'این دوره با جشنواره‌ای دیگر هم‌زمان است.',
                  'This period overlaps another sale.',
                )}
              </ErrorMessage>
            </RangeCalendar>
          </Frame>
        </Example>
      </Grid>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** A report's period: a few ready ones, or any range picked on the calendar. */
export const ReportPeriod: StoryObj = {
  name: 'Example: a report’s period',
  render: function Render() {
    const t = useT()
    const [value, setValue] = useState<Range | null>(WEEK)
    const presets: [string, Range][] = [
      [t('۷ روز گذشته', 'Last 7 days'), { start: DAY.subtract({ days: 6 }), end: DAY }],
      [t('۳۰ روز گذشته', 'Last 30 days'), { start: DAY.subtract({ days: 29 }), end: DAY }],
      [t('این ماه', 'This month'), { start: startOfMonth(DAY), end: endOfMonth(DAY) }],
    ]
    return (
      <Stage width={560} surface>
        <div style={{ display: 'flex', gap: 16, padding: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
            {presets.map(([label, range]) => (
              <Button key={label} size="sm" variant="tertiary" onPress={() => setValue(range)}>
                {label}
              </Button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Frame>
              <RangeCalendar
                aria-label={t('دورهٔ گزارش', 'Report period')}
                value={value}
                onChange={setValue}
                maxValue={DAY}
              >
                <RangeCalendarInsides />
              </RangeCalendar>
            </Frame>
            <Value label="value" value={isoRange(value)} />
          </div>
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
      <RangeCalendar aria-label={t('دوره', 'Period')} defaultValue={WEEK}>
        <RangeCalendarInsides />
      </RangeCalendar>
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

/** A Persian page and an English one: a range runs with the reading, its ends rounded on its sides. */
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

/** The same range calendar as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'RangeCalendar',
      props: {
        label: t('دورهٔ جشنواره', 'Sale period'),
        defaultValue: ['2026-10-17', '2026-10-23'],
        minValue: '2026-10-05',
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
