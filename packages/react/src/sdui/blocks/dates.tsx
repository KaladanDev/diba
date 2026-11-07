import {
  DateFormatter,
  parseTime,
  toCalendarDate,
  type CalendarDate,
  type DateValue,
  type Time,
} from '@internationalized/date'
import { useId, useState } from 'react'
import { Button as ButtonPrimitive, I18nProvider, useLocale } from 'react-aria-components'
import { Calendar } from '../../components/calendar'
import { DateField } from '../../components/date-field'
import { DateInputGroup } from '../../components/date-input-group'
import { DateRangePicker } from '../../components/date-range-picker'
import { Description } from '../../components/description'
import { FieldError } from '../../components/field-error'
import { Label } from '../../components/label'
import { RangeCalendar } from '../../components/range-calendar'
import { TimePickerDialog, type TimeOfDay } from '../../components/time-picker'
import type { Block, NodeContext } from '../node'
import { ErrorText, errorOf, hiddenLabel, propsOf, useSay } from './common'
import {
  CalendarParts,
  atTime,
  calendarLocale,
  isTimed,
  parseIso,
  timeOf,
  toIso,
  unavailableOf,
} from './fields'

/**
 * The extra components' dates and time: a calendar and a range calendar drawn in the page,
 * a date range field, and a time field. They take DateField's words, look and calendar.
 */

/** A tree's pair of dates, as React Aria's range. */
function rangeOf(value: unknown): { start: DateValue; end: DateValue } | null {
  if (!Array.isArray(value) || value.length !== 2) return null
  const start = parseIso(value[0])
  const end = parseIso(value[1])
  return start && end ? { start, end } : null
}

/** A tree's date as a calendar drawn in the page counts it: the day alone. */
function parseDay(value: unknown): CalendarDate | undefined {
  const date = parseIso(value)
  return date ? toCalendarDate(date) : undefined
}

/** A tree's pair of days, as a range calendar's. */
function dayRangeOf(value: unknown): { start: CalendarDate; end: CalendarDate } | null {
  const range = rangeOf(value)
  return range ? { start: toCalendarDate(range.start), end: toCalendarDate(range.end) } : null
}

/** React Aria's range, as a tree's pair. */
function rangeIso(range: { start: DateValue; end: DateValue } | null): string[] | null {
  return range ? [toIso(range.start)!, toIso(range.end)!] : null
}

/** In the calendar the tree asked for, or the reader's. */
function InCalendar({ system, children }: { system: unknown; children: React.ReactElement }) {
  const { locale } = useLocale()
  const drawn = calendarLocale(locale, system)
  return drawn ? <I18nProvider locale={drawn}>{children}</I18nProvider> : children
}

/** A range calendar's insides, as Calendar's are. */
function RangeCalendarParts() {
  return (
    <>
      <RangeCalendar.Header>
        <RangeCalendar.NavButton slot="previous" />
        <RangeCalendar.YearPickerTrigger>
          <RangeCalendar.YearPickerTriggerHeading />
        </RangeCalendar.YearPickerTrigger>
        <RangeCalendar.NavButton slot="next" />
      </RangeCalendar.Header>
      <RangeCalendar.Grid>
        <RangeCalendar.GridHeader>
          {(day: string) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
        </RangeCalendar.GridHeader>
        <RangeCalendar.GridBody>
          {(date: any) => <RangeCalendar.Cell date={date} />}
        </RangeCalendar.GridBody>
      </RangeCalendar.Grid>
      <RangeCalendar.YearPickerGrid>
        <RangeCalendar.YearPickerGridBody>
          {({ year }: any) => <RangeCalendar.YearPickerCell year={year} />}
        </RangeCalendar.YearPickerGridBody>
      </RangeCalendar.YearPickerGrid>
      <RangeCalendar.MonthPickerGrid />
      <RangeCalendar.TodayButton />
    </>
  )
}

/** What both calendars drawn in the page pass React Aria. */
function calendarProps(node: NodeContext) {
  const p = propsOf(node)
  return {
    'aria-label': p.label,
    minValue: parseDay(p.minValue),
    maxValue: parseDay(p.maxValue),
    isDateUnavailable: unavailableOf(p.unavailableDates),
    isDisabled: p.isDisabled,
    isReadOnly: p.isReadOnly,
    isInvalid: Boolean(errorOf(node)),
  }
}

const CalendarBlock: Block = ({ node }) => {
  const p = propsOf(node)
  return (
    <InCalendar system={p.calendarSystem}>
      <div data-slot="calendar-block">
        <Calendar
          {...calendarProps(node)}
          value={parseDay(node.current) ?? null}
          onChange={(value: DateValue) => void node.setValue('onChange', toIso(value))}
        >
          <CalendarParts />
        </Calendar>
        <ErrorText>{errorOf(node)}</ErrorText>
      </div>
    </InCalendar>
  )
}

const RangeCalendarBlock: Block = ({ node }) => {
  const p = propsOf(node)
  return (
    <InCalendar system={p.calendarSystem}>
      <div data-slot="range-calendar-block">
        <RangeCalendar
          {...calendarProps(node)}
          value={dayRangeOf(node.current)}
          onChange={(range: { start: DateValue; end: DateValue }) =>
            void node.setValue('onChange', rangeIso(range))
          }
        >
          <RangeCalendarParts />
        </RangeCalendar>
        <ErrorText>{errorOf(node)}</ErrorText>
      </div>
    </InCalendar>
  )
}

/**
 * Two dates in one field, «۲۵ مهر ۱۴۰۵ – ۲ آبان ۱۴۰۵» at rest, its icon opening the
 * range calendar, centred 8 under it as the date field's is. At an hour or a minute, the
 * calendar's two days then ask their times in the time picker, the first's and then the last's,
 * as Flutter's do; nothing changes until both are picked.
 */
const DateRangePickerBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const say = useSay()
  const error = errorOf(node)
  const timed = isTimed(p.granularity)
  const range = rangeOf(node.current)
  const [open, setOpen] = useState(false)
  const [asking, setAsking] = useState<{
    days: { start: CalendarDate; end: CalendarDate }
    start?: TimeOfDay
  } | null>(null)
  const zoned = Boolean(range && 'timeZone' in range.start)
  const cycle = p.hourCycle === 12 ? 12 : 24
  return (
    <InCalendar system={p.calendarSystem}>
      <>
        <DateRangePicker
          isOpen={open}
          onOpenChange={setOpen}
          style={{ width: p.fullWidth === false ? undefined : '100%' }}
          value={rangeOf(node.current)}
          onChange={(range: { start: DateValue; end: DateValue } | null) =>
            void node.setValue('onChange', rangeIso(range))
          }
          minValue={parseIso(p.minValue)}
          maxValue={parseIso(p.maxValue)}
          isDateUnavailable={unavailableOf(p.unavailableDates)}
          granularity={p.granularity}
          hourCycle={p.hourCycle}
          hideTimeZone={p.hideTimeZone}
          isRequired={p.isRequired}
          isReadOnly={p.isReadOnly}
          isDisabled={p.isDisabled}
          isInvalid={Boolean(error)}
          validationBehavior="aria"
          startName={p.name ? `${p.name}.start` : undefined}
          endName={p.name ? `${p.name}.end` : undefined}
          aria-label={hiddenLabel(node)}
        >
          {p.label && !p.isLabelHidden ? <Label>{p.label}</Label> : null}
          <DateField.Group fullWidth={p.fullWidth} variant={p.variant}>
            <DateField.Input slot="start">
              {(segment: any) => <DateField.Segment segment={segment} />}
            </DateField.Input>
            <DateRangePicker.RangeSeparator />
            <DateField.Input slot="end">
              {(segment: any) => <DateField.Segment segment={segment} />}
            </DateField.Input>
            <DateField.Suffix>
              <DateRangePicker.Trigger aria-label={say('pickDate')}>
                <DateRangePicker.TriggerIndicator />
              </DateRangePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          {p.description ? <Description>{p.description}</Description> : null}
          {error ? <FieldError>{error}</FieldError> : null}
          <DateRangePicker.Popover>
            {timed ? (
              // Out of the picker's state, which would keep the old times: the days go to the
              // time picker.
              <RangeCalendar
                slot={null}
                aria-label={p.label}
                value={dayRangeOf(node.current)}
                minValue={parseDay(p.minValue)}
                maxValue={parseDay(p.maxValue)}
                isDateUnavailable={unavailableOf(p.unavailableDates)}
                onChange={(days: { start: CalendarDate; end: CalendarDate }) => {
                  setOpen(false)
                  setAsking({ days })
                }}
              >
                <RangeCalendarParts />
              </RangeCalendar>
            ) : (
              <RangeCalendar aria-label={p.label}>
                <RangeCalendarParts />
              </RangeCalendar>
            )}
          </DateRangePicker.Popover>
        </DateRangePicker>
        {timed ? (
          <>
            <TimePickerDialog
              isOpen={Boolean(asking && !asking.start)}
              onOpenChange={(isOpen) => isOpen || setAsking(null)}
              helpText={say('startTime')}
              value={timeOf(range?.start)}
              hourCycle={cycle}
              onConfirm={(start) => setAsking((current) => current && { ...current, start })}
            />
            <TimePickerDialog
              isOpen={Boolean(asking?.start)}
              onOpenChange={(isOpen) => isOpen || setAsking(null)}
              helpText={say('endTime')}
              value={timeOf(range?.end)}
              hourCycle={cycle}
              onConfirm={(end) => {
                if (asking?.start) {
                  void node.setValue('onChange', [
                    toIso(atTime(asking.days.start, asking.start, p.granularity, zoned)),
                    toIso(atTime(asking.days.end, end, p.granularity, zoned)),
                  ])
                }
                setAsking(null)
              }}
            />
          </>
        ) : null}
      </>
    </InCalendar>
  )
}

/** A tree's time of day, «14:30». */
function parseClock(value: unknown): Time | undefined {
  if (typeof value !== 'string' || value === '') return undefined
  try {
    return parseTime(value)
  } catch {
    return undefined
  }
}

const two = (n: number) => String(n).padStart(2, '0')

/** What an empty time field shows, as Flutter's: «––:––», or «––» to the hour. */
const EMPTY: Record<string, string> = { hour: '––', minute: '––:––', second: '––:––:––' }

/**
 * A time of day, Flutter's: a field reading «۰۹:۳۰», «۹:۳۰ ب.ظ.», whose press asks the time
 * in the time picker; Material's own typing is in the picker. The web's had typed hour by minute
 * in the field.
 */
const TimeFieldBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const { locale } = useLocale()
  const [open, setOpen] = useState(false)
  const labelId = useId()
  const granularity = typeof p.granularity === 'string' ? p.granularity : 'minute'
  const twelve = p.hourCycle === 12
  const value = parseClock(node.current)
  const min = parseClock(p.minValue)
  const max = parseClock(p.maxValue)
  const show = (time: Time) =>
    new DateFormatter(locale, {
      hour: twelve ? 'numeric' : '2-digit',
      hour12: twelve,
      minute: '2-digit',
      second: granularity === 'second' ? '2-digit' : undefined,
    }).format(
      new Date(2000, 0, 1, time.hour, granularity === 'hour' ? 0 : time.minute, time.second),
    )
  const outside = Boolean(
    value && ((min && value.compare(min) < 0) || (max && value.compare(max) > 0)),
  )
  const error = errorOf(node)
  const invalid = Boolean(error) || outside
  const { isDisabled, isReadOnly } = p
  const live = !isDisabled && !isReadOnly
  const label = p.label && !p.isLabelHidden ? p.label : null
  return (
    <div
      className="time-field"
      data-slot="time-field"
      data-disabled={p.isDisabled || undefined}
      data-required={p.isRequired || undefined}
      style={{ width: p.fullWidth === false ? undefined : '100%' }}
    >
      {label ? (
        <Label id={labelId} isRequired={p.isRequired} isDisabled={p.isDisabled}>
          {label}
        </Label>
      ) : null}
      <DateInputGroup
        fullWidth={p.fullWidth}
        variant={p.variant}
        isDisabled={p.isDisabled}
        isInvalid={invalid}
      >
        <ButtonPrimitive
          className="time-field__trigger"
          data-slot="time-field-trigger"
          isDisabled={!live}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-labelledby={label ? `${labelId} ${labelId}-value` : undefined}
          aria-label={hiddenLabel(node)}
          aria-invalid={invalid || undefined}
          aria-required={p.isRequired || undefined}
          onPress={() => setOpen(true)}
        >
          <span
            id={`${labelId}-value`}
            className="time-field__display"
            data-slot="time-field-display"
            data-empty={value ? undefined : true}
          >
            {value ? show(value) : (EMPTY[granularity] ?? EMPTY.minute)}
          </span>
        </ButtonPrimitive>
      </DateInputGroup>
      {p.description ? <Description>{p.description}</Description> : null}
      <ErrorText>{error}</ErrorText>
      {p.name ? <input type="hidden" name={p.name} value={String(node.current ?? '')} /> : null}
      <TimePickerDialog
        isOpen={open}
        onOpenChange={setOpen}
        value={value ? { hour: value.hour, minute: value.minute } : null}
        hourCycle={twelve ? 12 : 24}
        onConfirm={(time) => {
          const minute = granularity === 'hour' ? 0 : time.minute
          const iso = `${two(time.hour)}:${two(minute)}`
          void node.setValue('onChange', granularity === 'second' ? `${iso}:00` : iso)
          setOpen(false)
        }}
      />
    </div>
  )
}

export const dateBlocks: Record<string, Block> = {
  Calendar: CalendarBlock,
  RangeCalendar: RangeCalendarBlock,
  DateRangePicker: DateRangePickerBlock,
  TimeField: TimeFieldBlock,
}
