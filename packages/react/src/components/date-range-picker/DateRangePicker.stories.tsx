import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  endOfMonth,
  parseDate,
  parseDateTime,
  startOfMonth,
  type DateValue,
} from '@internationalized/date'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { DAY, InCalendar, RangeCalendarInsides, isFriday, isoRange } from '../../stories/dates'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { DateField } from '../date-field'
import { Description } from '../description'
import { FieldError } from '../field-error'
import { Label } from '../label'
import { RangeCalendar } from '../range-calendar'
import { DateRangePicker } from './index'

// The DateRangePicker, every option it has and what it is built into. The docs page is
// DateRangePicker.mdx. A line comment, not a doc comment: the docs plugin replaces a commented
// meta's parameters with one. Typed as a plain Meta: DateRangePicker is generic.
const meta: Meta = {
  title: 'Components/Date and Time/DateRangePicker',
  component: DateRangePicker,
  parameters: { layout: 'fullscreen' },
}

export default meta

type System = 'auto' | 'persian' | 'gregorian'
type Range = { start: DateValue; end: DateValue }

/** A week from the fixed day: ۲۵ مهر to ۱ آبان ۱۴۰۵. */
const WEEK: Range = { start: DAY, end: DAY.add({ days: 6 }) }
const HOLIDAY = parseDate('2026-10-22')

/** Fields down the page, 20 apart, as wide as a form's column. */
function Column({ children, width = 420 }: { children: ReactNode; width?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width, maxWidth: '100%' }}>
      {children}
    </div>
  )
}

/**
 * A range picker as Diba composes one: two dates in one field with a dash between them, the
 * calendar icon at its end, help and error under it, and the range calendar in a popover.
 */
function Picker({
  label,
  description,
  error,
  variant,
  ...props
}: {
  label: string
  description?: string
  error?: string
  variant?: 'primary' | 'secondary'
} & Record<string, unknown>) {
  const t = useT()
  return (
    <DateRangePicker {...(props as any)}>
      <Label>{label}</Label>
      <DateField.Group fullWidth variant={variant}>
        <DateField.Input slot="start">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateRangePicker.RangeSeparator />
        <DateField.Input slot="end">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DateRangePicker.Trigger aria-label={t('انتخاب تاریخ', 'Pick dates')}>
            <DateRangePicker.TriggerIndicator />
          </DateRangePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      {description ? <Description>{description}</Description> : null}
      <FieldError>{error}</FieldError>
      <DateRangePicker.Popover>
        <RangeCalendar aria-label={label}>
          <RangeCalendarInsides />
        </RangeCalendar>
      </DateRangePicker.Popover>
    </DateRangePicker>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  granularity: 'day' | 'hour' | 'minute'
  calendar: System
  variant: 'primary' | 'secondary'
  limits: boolean
  fridaysOff: boolean
  allowsNonContiguousRanges: boolean
  isRequired: boolean
  isDisabled: boolean
  isReadOnly: boolean
  isInvalid: boolean
}

/** Every option on the controls. Press the calendar icon to open it. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    granularity: 'day',
    calendar: 'auto',
    variant: 'primary',
    limits: false,
    fridaysOff: false,
    allowsNonContiguousRanges: false,
    isRequired: false,
    isDisabled: false,
    isReadOnly: false,
    isInvalid: false,
  },
  argTypes: {
    granularity: {
      control: 'inline-radio',
      options: ['day', 'hour', 'minute'],
      description: 'The smallest part it asks; the times are typed in the field.',
      table: { category: 'DateRangePicker', defaultValue: { summary: 'day' } },
    },
    calendar: {
      control: 'inline-radio',
      options: ['auto', 'persian', 'gregorian'],
      description: 'The language’s own, or one whatever the language, through the locale.',
      table: { category: 'Example' },
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      description: 'DateField.Group’s: secondary for a field on a grey surface.',
      table: { category: 'DateField.Group' },
    },
    limits: {
      description: 'minValue and maxValue: from the day for 60 days.',
      table: { category: 'Example' },
    },
    fridaysOff: {
      description: 'isDateUnavailable: every Friday, and 22 October.',
      table: { category: 'Example' },
    },
    allowsNonContiguousRanges: {
      description: 'A range may run across unavailable days.',
      table: { category: 'DateRangePicker', defaultValue: { summary: 'false' } },
    },
    isRequired: { table: { category: 'DateRangePicker', defaultValue: { summary: 'false' } } },
    isDisabled: { table: { category: 'DateRangePicker', defaultValue: { summary: 'false' } } },
    isReadOnly: { table: { category: 'DateRangePicker', defaultValue: { summary: 'false' } } },
    isInvalid: {
      description: 'With a FieldError under it.',
      table: { category: 'DateRangePicker', defaultValue: { summary: 'false' } },
    },
  },
  parameters: { docs: { story: { inline: false, height: '520px' } } },
  render: function Render({
    granularity,
    calendar,
    variant,
    limits,
    fridaysOff,
    allowsNonContiguousRanges,
    isRequired,
    isDisabled,
    isReadOnly,
    isInvalid,
  }) {
    const t = useT()
    const [value, setValue] = useState<Range | null>(
      granularity === 'day'
        ? WEEK
        : { start: parseDateTime('2026-10-17T09:00'), end: parseDateTime('2026-10-23T21:00') },
    )
    return (
      <Stage width={480} surface={variant === 'secondary'}>
        <Column>
          <InCalendar system={calendar}>
            <Picker
              label={t('دورهٔ جشنواره', 'Sale period')}
              description={t('روز نخست و واپسین جشنواره.', 'The sale’s first and last days.')}
              error={t(
                'این دوره با جشنواره‌ای دیگر هم‌زمان است.',
                'This period overlaps another sale.',
              )}
              variant={variant}
              value={value}
              onChange={setValue}
              granularity={granularity}
              minValue={limits ? DAY : undefined}
              maxValue={limits ? DAY.add({ days: 60 }) : undefined}
              isDateUnavailable={
                fridaysOff
                  ? (date: DateValue) => isFriday(date) || date.compare(HOLIDAY) === 0
                  : undefined
              }
              allowsNonContiguousRanges={allowsNonContiguousRanges}
              isRequired={isRequired}
              isDisabled={isDisabled}
              isReadOnly={isReadOnly}
              isInvalid={isInvalid}
            />
          </InCalendar>
          <Value label="value" value={isoRange(value)} />
        </Column>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Open: the range calendar under the field, centred on it. */
export const Open: StoryObj = {
  parameters: { docs: { story: { inline: false, height: '540px' } } },
  render: function Render() {
    const t = useT()
    return (
      <Stage width={480}>
        <Column>
          <Picker label={t('دورهٔ جشنواره', 'Sale period')} defaultValue={WEEK} defaultOpen />
        </Column>
      </Stage>
    )
  },
}

/** The same range in the Persian calendar and in the Gregorian. */
export const Calendars: StoryObj = {
  name: 'Persian and Gregorian',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        {(['persian', 'gregorian'] as const).map((system) => (
          <InCalendar key={system} system={system}>
            <Picker
              label={system === 'persian' ? t('خورشیدی', 'Persian') : t('میلادی', 'Gregorian')}
              description={`value ${isoRange(WEEK)!.join(' – ')}`}
              defaultValue={WEEK}
            />
          </InCalendar>
        ))}
      </Column>
    )
  },
}

/** A range of days and times: from an hour on one day to an hour on another. */
export const DatesAndTimes: StoryObj = {
  name: 'Dates and times',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <Picker
          label={t('زمان جشنواره', 'Sale runs')}
          defaultValue={{
            start: parseDateTime('2026-10-17T09:00'),
            end: parseDateTime('2026-10-23T21:00'),
          }}
          granularity="minute"
          hourCycle={24}
        />
      </Column>
    )
  },
}

/** Its days within limits; a range across an unavailable day, only if allowed. */
export const Limits: StoryObj = {
  name: 'Limits and unavailable days',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <Picker
          label={t('مرخصی', 'Days off')}
          description={t(
            'تا ۶۰ روز دیگر. جمعه‌ها و تعطیل‌ها شمرده نمی‌شوند.',
            'Within 60 days. Fridays and holidays are not counted.',
          )}
          defaultValue={WEEK}
          minValue={DAY}
          maxValue={DAY.add({ days: 60 })}
          isDateUnavailable={(date: DateValue) => isFriday(date) || date.compare(HOLIDAY) === 0}
          allowsNonContiguousRanges
        />
      </Column>
    )
  },
}

/** Disabled, read-only, and on a grey surface. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={340}>
        <Example title={t('غیرفعال', 'Disabled')}>
          <Picker label={t('دورهٔ جشنواره', 'Sale period')} defaultValue={WEEK} isDisabled />
        </Example>
        <Example title={t('فقط خواندنی', 'Read-only')}>
          <Picker label={t('دورهٔ جشنواره', 'Sale period')} defaultValue={WEEK} isReadOnly />
        </Example>
        <Example title={t('روی زمینهٔ خاکستری', 'On a grey surface')} note='variant="secondary"'>
          <Stage width="100%" surface>
            <Picker
              label={t('دورهٔ جشنواره', 'Sale period')}
              defaultValue={WEEK}
              variant="secondary"
            />
          </Stage>
        </Example>
      </Grid>
    )
  },
}

/** In a form: startName and endName send the two dates. */
export const InAForm: StoryObj = {
  name: 'In a form',
  render: function Render() {
    const t = useT()
    const [sent, setSent] = useState<string[] | null>(null)
    return (
      <Stage width={480} surface>
        <form
          style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}
          onSubmit={(event) => {
            event.preventDefault()
            const data = new FormData(event.currentTarget)
            setSent([String(data.get('from')), String(data.get('to'))])
          }}
        >
          <Picker
            label={t('دورهٔ جشنواره', 'Sale period')}
            startName="from"
            endName="to"
            defaultValue={WEEK}
            isRequired
          />
          <div>
            <Button type="submit" variant="primary">
              {t('ذخیره', 'Save')}
            </Button>
          </div>
          <Value label={t('فرستاده شد', 'Sent')} value={sent} />
        </form>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** A report's period: the field, and a few ready periods beside it. */
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
      <Stage width={640} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}>
          <Picker
            label={t('دورهٔ گزارش', 'Report period')}
            value={value}
            onChange={setValue}
            maxValue={DAY}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {presets.map(([label, range]) => (
              <Button key={label} size="sm" variant="tertiary" onPress={() => setValue(range)}>
                {label}
              </Button>
            ))}
          </div>
          <Value label="value" value={isoRange(value)} />
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <Column width={360}>
      <Picker label={t('دورهٔ جشنواره', 'Sale period')} defaultValue={WEEK} />
      <Picker label={t('مرخصی', 'Days off')} description={t('اختیاری.', 'Optional.')} />
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

/** A Persian page and an English one: the first date at the reading side, the icon at the end. */
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

/** The same picker as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'DateRangePicker',
      props: {
        label: t('دورهٔ جشنواره', 'Sale period'),
        defaultValue: ['2026-10-17', '2026-10-23'],
        description: t('روز نخست و واپسین جشنواره.', 'The sale’s first and last days.'),
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
