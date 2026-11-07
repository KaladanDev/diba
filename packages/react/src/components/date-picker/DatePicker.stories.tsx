import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  parseDate,
  parseDateTime,
  toCalendarDate,
  toCalendarDateTime,
  Time,
  type CalendarDate,
  type DateValue,
} from '@internationalized/date'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { CalendarInsides, DAY, InCalendar, iso, isFriday } from '../../stories/dates'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Calendar } from '../calendar'
import { DateField } from '../date-field'
import { Description } from '../description'
import { FieldError } from '../field-error'
import { Label } from '../label'
import { TimePickerDialog } from '../time-picker'
import { DatePicker } from './index'

// The DatePicker, every option it has and what it is built into. The docs page is DatePicker.mdx.
// A line comment, not a doc comment: the docs plugin replaces a commented meta's parameters with
// one. Typed as a plain Meta: DatePicker is generic.
const meta: Meta = {
  title: 'Components/Date and Time/DatePicker',
  component: DatePicker,
  parameters: { layout: 'fullscreen' },
}

export default meta

type System = 'auto' | 'persian' | 'gregorian'

const AT_TWO = parseDateTime('2026-10-17T14:00')

/** Fields down the page, 20 apart, as wide as a form's column. */
function Column({ children, width = 360 }: { children: ReactNode; width?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width, maxWidth: '100%' }}>
      {children}
    </div>
  )
}

/**
 * A date picker as Diba composes one: the date field, its calendar icon at the end, help and
 * error under it, and the calendar in a popover.
 */
function Picker({
  label,
  description,
  error,
  variant,
  children,
  ...props
}: {
  label: string
  description?: string
  error?: string
  variant?: 'primary' | 'secondary'
  children?: ReactNode
} & Partial<Parameters<typeof DatePicker>[0]>) {
  const t = useT()
  return (
    <DatePicker {...(props as any)}>
      <Label>{label}</Label>
      <DateField.Group fullWidth variant={variant}>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger aria-label={t('انتخاب تاریخ', 'Pick a date')}>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      {description ? <Description>{description}</Description> : null}
      <FieldError>{error}</FieldError>
      <DatePicker.Popover>
        {children ?? (
          <Calendar aria-label={label}>
            <CalendarInsides />
          </Calendar>
        )}
      </DatePicker.Popover>
    </DatePicker>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  granularity: 'day' | 'hour' | 'minute'
  calendar: System
  variant: 'primary' | 'secondary'
  limits: boolean
  fridaysOff: boolean
  shouldCloseOnSelect: boolean
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
    shouldCloseOnSelect: true,
    isRequired: false,
    isDisabled: false,
    isReadOnly: false,
    isInvalid: false,
  },
  argTypes: {
    granularity: {
      control: 'inline-radio',
      options: ['day', 'hour', 'minute'],
      description: 'The smallest part it asks; the time is typed in the field.',
      table: { category: 'DatePicker', defaultValue: { summary: 'day' } },
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
      description: 'minValue and maxValue: from the day for 30 days.',
      table: { category: 'Example' },
    },
    fridaysOff: { description: 'isDateUnavailable: every Friday.', table: { category: 'Example' } },
    shouldCloseOnSelect: {
      description: 'The calendar closes once a day is picked.',
      table: { category: 'DatePicker', defaultValue: { summary: 'true' } },
    },
    isRequired: { table: { category: 'DatePicker', defaultValue: { summary: 'false' } } },
    isDisabled: { table: { category: 'DatePicker', defaultValue: { summary: 'false' } } },
    isReadOnly: { table: { category: 'DatePicker', defaultValue: { summary: 'false' } } },
    isInvalid: {
      description: 'With a FieldError under it.',
      table: { category: 'DatePicker', defaultValue: { summary: 'false' } },
    },
  },
  parameters: { docs: { story: { inline: false, height: '520px' } } },
  render: function Render({
    granularity,
    calendar,
    variant,
    limits,
    fridaysOff,
    shouldCloseOnSelect,
    isRequired,
    isDisabled,
    isReadOnly,
    isInvalid,
  }) {
    const t = useT()
    const [value, setValue] = useState<DateValue | null>(granularity === 'day' ? DAY : AT_TWO)
    return (
      <Stage width={420} surface={variant === 'secondary'}>
        <Column>
          <InCalendar system={calendar}>
            <Picker
              label={t('تاریخ ارسال', 'Delivery date')}
              description={t(
                'روزی که بسته از انبار بیرون می‌رود.',
                'The day the parcel leaves the warehouse.',
              )}
              error={t('روزی دیگر برگزینید.', 'Pick another day.')}
              variant={variant}
              value={value}
              onChange={setValue}
              granularity={granularity}
              minValue={limits ? DAY : undefined}
              maxValue={limits ? DAY.add({ days: 30 }) : undefined}
              isDateUnavailable={fridaysOff ? isFriday : undefined}
              shouldCloseOnSelect={shouldCloseOnSelect}
              isRequired={isRequired}
              isDisabled={isDisabled}
              isReadOnly={isReadOnly}
              isInvalid={isInvalid}
            />
          </InCalendar>
          <Value label="value" value={iso(value)} />
        </Column>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Open: the calendar 8 under the field, centred on it. The field still takes typing. */
export const Open: StoryObj = {
  parameters: { docs: { story: { inline: false, height: '520px' } } },
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420}>
        <Column>
          <Picker label={t('تاریخ ارسال', 'Delivery date')} defaultValue={DAY} defaultOpen />
        </Column>
      </Stage>
    )
  },
}

/** The same day in the Persian calendar and in the Gregorian. */
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
              description={`value ${iso(DAY)}`}
              defaultValue={DAY}
            />
          </InCalendar>
        ))}
      </Column>
    )
  },
}

/** A day and a time: the time typed in the field, the day from the calendar. */
export const DateAndTime: StoryObj = {
  name: 'A date and a time',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <Picker
          label={t('زمان انتشار', 'Publish at')}
          defaultValue={AT_TWO}
          granularity="minute"
          hourCycle={24}
        />
        <Picker
          label={t('زمان انتشار، ساعت ۱۲تایی', 'Publish at, a 12-hour clock')}
          defaultValue={AT_TWO}
          granularity="minute"
          hourCycle={12}
        />
      </Column>
    )
  },
}

/** The day from the calendar, then its time from the time picker: as the block asks. */
export const DayThenTime: StoryObj = {
  name: 'A day, then its time',
  render: function Render() {
    const t = useT()
    const [value, setValue] = useState<DateValue | null>(AT_TWO)
    const [open, setOpen] = useState(false)
    const [day, setDay] = useState<CalendarDate | null>(null)
    return (
      <Column>
        <Picker
          label={t('زمان انتشار', 'Publish at')}
          description={t('روز را برگزینید، سپس ساعتش را.', 'Pick the day, then its time.')}
          value={value}
          onChange={setValue}
          granularity="minute"
          hourCycle={24}
          isOpen={open}
          onOpenChange={setOpen}
        >
          <Calendar
            slot={null}
            aria-label={t('زمان انتشار', 'Publish at')}
            value={value ? toCalendarDate(value) : null}
            onChange={(picked) => {
              setOpen(false)
              setDay(toCalendarDate(picked))
            }}
          >
            <CalendarInsides />
          </Calendar>
        </Picker>
        <TimePickerDialog
          isOpen={day !== null}
          onOpenChange={(isOpen) => isOpen || setDay(null)}
          value={value && 'hour' in value ? { hour: value.hour, minute: value.minute } : null}
          hourCycle={24}
          onConfirm={(time) => {
            if (day) setValue(toCalendarDateTime(day, new Time(time.hour, time.minute)))
            setDay(null)
          }}
        />
        <Value label="value" value={iso(value)} />
      </Column>
    )
  },
}

/** Days outside the limits cannot be picked, nor unavailable ones; typed, they make it invalid. */
export const Limits: StoryObj = {
  name: 'First, last and unavailable days',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <Picker
          label={t('تاریخ ارسال', 'Delivery date')}
          description={t('تا ۳۰ روز دیگر، جز جمعه‌ها.', 'Within 30 days, never on a Friday.')}
          error={t('در این روز ارسال نداریم.', "We don't send on this day.")}
          defaultValue={parseDate('2026-10-23')}
          minValue={DAY}
          maxValue={DAY.add({ days: 30 })}
          isDateUnavailable={isFriday}
          validationBehavior="aria"
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
      <Grid min={300}>
        <Example title={t('غیرفعال', 'Disabled')}>
          <Picker label={t('تاریخ ارسال', 'Delivery date')} defaultValue={DAY} isDisabled />
        </Example>
        <Example title={t('فقط خواندنی', 'Read-only')}>
          <Picker label={t('تاریخ ارسال', 'Delivery date')} defaultValue={DAY} isReadOnly />
        </Example>
        <Example title={t('روی زمینهٔ خاکستری', 'On a grey surface')} note='variant="secondary"'>
          <Stage width="100%" surface>
            <Picker
              label={t('تاریخ ارسال', 'Delivery date')}
              defaultValue={DAY}
              variant="secondary"
            />
          </Stage>
        </Example>
      </Grid>
    )
  },
}

/** In a form: its name sends the value, Gregorian ISO 8601. */
export const InAForm: StoryObj = {
  name: 'In a form',
  render: function Render() {
    const t = useT()
    const [sent, setSent] = useState<string | null>(null)
    return (
      <Stage width={420} surface>
        <form
          style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}
          onSubmit={(event) => {
            event.preventDefault()
            setSent(String(new FormData(event.currentTarget).get('ships')))
          }}
        >
          <Picker
            label={t('تاریخ ارسال', 'Delivery date')}
            name="ships"
            defaultValue={DAY}
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

/** Orders filtered by when they were placed: from, and up to. */
export const OrderFilter: StoryObj = {
  name: 'Example: an orders filter',
  render: function Render() {
    const t = useT()
    const [from, setFrom] = useState<DateValue | null>(DAY.subtract({ days: 7 }))
    const [to, setTo] = useState<DateValue | null>(DAY)
    return (
      <Stage width={640} surface>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: 8 }}>
          <div style={{ flex: '1 1 220px' }}>
            <Picker
              label={t('از', 'From')}
              value={from}
              onChange={setFrom}
              maxValue={to ?? undefined}
            />
          </div>
          <div style={{ flex: '1 1 220px' }}>
            <Picker
              label={t('تا', 'To')}
              value={to}
              onChange={setTo}
              minValue={from ?? undefined}
            />
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
    <Column width={320}>
      <Picker label={t('تاریخ ارسال', 'Delivery date')} defaultValue={DAY} />
      <Picker label={t('زمان انتشار', 'Publish at')} defaultValue={AT_TWO} granularity="minute" />
      <Picker label={t('تاریخ تولد', 'Birthday')} description={t('اختیاری.', 'Optional.')} />
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

/** A Persian page and an English one: the icon at the field's end, on its left in Persian. */
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

/** The same picker as a tree: a DateField block. At a minute, its day then asks its time. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 5 },
      children: [
        {
          type: 'DateField',
          props: { label: t('تاریخ ارسال', 'Delivery date'), defaultValue: '2026-10-17' },
        },
        {
          type: 'DateField',
          props: {
            label: t('زمان انتشار', 'Publish at'),
            defaultValue: '2026-10-17T14:00',
            granularity: 'minute',
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
