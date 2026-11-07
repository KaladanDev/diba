import {
  GregorianCalendar,
  Time,
  getLocalTimeZone,
  parseAbsoluteToLocal,
  parseDate,
  parseDateTime,
  toCalendar,
  toCalendarDate,
  toCalendarDateTime,
  toZoned,
  type CalendarDate,
  type DateValue,
} from '@internationalized/date'
import { useState } from 'react'
import { I18nProvider, useLocale } from 'react-aria-components'
import { Calendar } from '../../components/calendar'
import { DateField } from '../../components/date-field'
import { DatePicker } from '../../components/date-picker'
import { Input } from '../../components/input'
import { InputGroup } from '../../components/input-group'
import { Label } from '../../components/label'
import { NumberField } from '../../components/number-field'
import { SearchField } from '../../components/search-field'
import { TextArea } from '../../components/textarea'
import { TextField } from '../../components/textfield'
import { Description } from '../../components/description'
import { FieldError } from '../../components/field-error'
import { TimePickerDialog, type TimeOfDay } from '../../components/time-picker'
import { numberFormatOptions, tomanWord } from '../format'
import type { Block, NodeContext } from '../node'
import { FieldParts, errorOf, hiddenLabel, propsOf, useSay } from './common'

/** What every text field passes its React Aria field. */
function textFieldProps(node: NodeContext) {
  const p = propsOf(node)
  return {
    value: (node.current as string | undefined) ?? '',
    onChange: (value: string) => void node.setValue('onChange', value),
    onBlur: node.on.onBlur ? () => void node.fire('onBlur') : undefined,
    isRequired: p.isRequired,
    isReadOnly: p.isReadOnly,
    isDisabled: p.isDisabled,
    isInvalid: Boolean(errorOf(node)),
    // React Aria's own messages are the browser's, in the browser's language;
    // a tree's fields use Diba's, so the browser is never asked.
    validationBehavior: 'aria' as const,
    name: p.name,
    fullWidth: p.fullWidth,
    'aria-label': hiddenLabel(node),
  }
}

const TextFieldBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const attrs = {
    placeholder: p.placeholder,
    autoCapitalize: p.autoCapitalize,
    spellCheck: p.spellCheck,
  }
  return (
    <TextField
      {...textFieldProps(node)}
      type={p.type}
      inputMode={p.inputMode}
      autoComplete={p.autoComplete}
      maxLength={p.maxLength}
      minLength={p.minLength}
    >
      <FieldParts node={node}>
        {p.prefix || p.suffix ? (
          // The direction belongs on the whole group, so a Latin code's prefix
          // sits before it on a Persian page too (F6).
          <InputGroup variant={p.variant} fullWidth={p.fullWidth} dir={p.dir}>
            {p.prefix ? <InputGroup.Prefix>{p.prefix}</InputGroup.Prefix> : null}
            <InputGroup.Input {...attrs} dir={p.dir} />
            {p.suffix ? <InputGroup.Suffix>{p.suffix}</InputGroup.Suffix> : null}
          </InputGroup>
        ) : (
          <Input {...attrs} variant={p.variant} fullWidth={p.fullWidth} dir={p.dir} />
        )}
      </FieldParts>
    </TextField>
  )
}

const TextAreaBlock: Block = ({ node }) => {
  const p = propsOf(node)
  return (
    <TextField {...textFieldProps(node)} maxLength={p.maxLength} minLength={p.minLength}>
      <FieldParts node={node}>
        <TextArea
          rows={p.rows}
          placeholder={p.placeholder}
          dir={p.dir}
          autoCapitalize={p.autoCapitalize}
          spellCheck={p.spellCheck}
          variant={p.variant}
          fullWidth={p.fullWidth}
        />
      </FieldParts>
    </TextField>
  )
}

/** The search icon and the clear button are fixed: a tree cannot remove them. */
const SearchFieldBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const say = useSay()
  return (
    <SearchField
      {...textFieldProps(node)}
      variant={p.variant}
      onSubmit={node.on.onSubmit ? (value: string) => void node.fire('onSubmit', value) : undefined}
      onClear={node.on.onClear ? () => void node.fire('onClear') : undefined}
    >
      <FieldParts node={node}>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder={p.placeholder} />
          <SearchField.ClearButton aria-label={say('clear')} />
        </SearchField.Group>
      </FieldParts>
    </SearchField>
  )
}

const NumberFieldBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const { locale } = useLocale()
  const current = node.current as number | null | undefined
  const unit = tomanWord(locale, { style: p.formatStyle, currency: p.currency })
  return (
    <NumberField
      value={typeof current === 'number' ? current : Number.NaN}
      onChange={(value: number) =>
        void node.setValue('onChange', Number.isNaN(value) ? null : value)
      }
      minValue={p.minValue}
      maxValue={p.maxValue}
      step={p.step}
      formatOptions={numberFormatOptions({
        style: p.formatStyle,
        currency: p.currency,
        maximumFractionDigits: p.maximumFractionDigits,
      })}
      isRequired={p.isRequired}
      isReadOnly={p.isReadOnly}
      isDisabled={p.isDisabled}
      isInvalid={Boolean(errorOf(node))}
      validationBehavior="aria"
      name={p.name}
      variant={p.variant}
      fullWidth={p.fullWidth}
      aria-label={hiddenLabel(node)}
    >
      <FieldParts node={node}>
        <NumberField.Group>
          {p.hideSteppers ? null : <NumberField.DecrementButton />}
          <NumberField.Input placeholder={p.placeholder} />
          {unit ? <span data-slot="unit">{unit}</span> : null}
          {p.hideSteppers ? null : <NumberField.IncrementButton />}
        </NumberField.Group>
      </FieldParts>
    </NumberField>
  )
}

/** Whether a date field counts hours too, and so asks a time after the day. */
export const isTimed = (granularity: unknown) =>
  granularity === 'hour' || granularity === 'minute' || granularity === 'second'

/** A date's time of day, for the time picker to open on; none for a day alone. */
export function timeOf(date: DateValue | undefined | null): TimeOfDay | null {
  return date && 'hour' in date ? { hour: date.hour, minute: date.minute } : null
}

/**
 * A day at a time picked, to the hour or the minute as the field counts; zoned when the
 * tree's value was, as Flutter's is.
 */
export function atTime(
  day: CalendarDate,
  time: TimeOfDay,
  granularity: unknown,
  zoned: boolean,
): DateValue {
  const at = toCalendarDateTime(day, new Time(time.hour, granularity === 'hour' ? 0 : time.minute))
  return zoned ? toZoned(at, getLocalTimeZone()) : at
}

/**
 * Dates are Gregorian ISO 8601 on the wire, whatever calendar draws them.
 * One with a `Z` or an offset is zoned: shown in local time, and sent back
 * with the local offset.
 */
export function parseIso(value: unknown): DateValue | undefined {
  if (typeof value !== 'string' || value === '') return undefined
  try {
    if (value.includes('T') && /(Z|[+-]\d\d:?\d\d)$/i.test(value))
      return parseAbsoluteToLocal(value)
    return value.includes('T') ? parseDateTime(value) : parseDate(value)
  } catch {
    return undefined
  }
}

export function toIso(value: DateValue | null | undefined): string | null {
  if (!value) return null
  // A zoned value's string ends in its zone's name, `[Asia/Tehran]`, which no
  // ISO 8601 reader takes; the offset before it already says the instant.
  return value.toString().replace(/\[[^\]]*\]$/, '')
}

/**
 * The days a tree says cannot be picked, as React Aria asks: of each day it draws, in
 * whatever calendar, whether its Gregorian date is on the list.
 */
export function unavailableOf(list: unknown): ((date: DateValue) => boolean) | undefined {
  if (!Array.isArray(list) || !list.length) return undefined
  const days = new Set(
    list.filter((d): d is string => typeof d === 'string').map((d) => d.slice(0, 10)),
  )
  const gregorian = new GregorianCalendar()
  return (date) => days.has(toCalendar(toCalendarDate(date), gregorian).toString())
}

/** The reader's locale, drawing the calendar the tree asked for. */
export function calendarLocale(locale: string, system: unknown): string | null {
  if (system !== 'persian' && system !== 'gregorian') return null
  const base = locale.split('-u-')[0]
  return `${base}-u-ca-${system === 'persian' ? 'persian' : 'gregory'}`
}

/**
 * A calendar's insides, Diba's: the title a pill between the month arrows, opening the
 * years and then the year's months; the days; today in a pill under them.
 */
export function CalendarParts() {
  return (
    <>
      <Calendar.Header>
        <Calendar.NavButton slot="previous" />
        <Calendar.YearPickerTrigger>
          <Calendar.YearPickerTriggerHeading />
        </Calendar.YearPickerTrigger>
        <Calendar.NavButton slot="next" />
      </Calendar.Header>
      <Calendar.Grid>
        <Calendar.GridHeader>
          {(day: string) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
        </Calendar.GridHeader>
        <Calendar.GridBody>{(date: any) => <Calendar.Cell date={date} />}</Calendar.GridBody>
      </Calendar.Grid>
      <Calendar.YearPickerGrid>
        <Calendar.YearPickerGridBody>
          {({ year }: any) => <Calendar.YearPickerCell year={year} />}
        </Calendar.YearPickerGridBody>
      </Calendar.YearPickerGrid>
      <Calendar.MonthPickerGrid />
      <Calendar.TodayButton />
    </>
  )
}

/**
 * A date at rest reads «۲۵ مهر ۱۴۰۵، ۱۴:۰۰», and its icon opens the calendar;
 * the field still takes typing on focus.
 */
const DateFieldBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const say = useSay()
  const { locale } = useLocale()
  // At an hour or a minute, the calendar's day asks its time in the time picker, as Flutter's
  // does; nothing changes until it is picked.
  const timed = isTimed(p.granularity)
  const value = parseIso(node.current)
  const [open, setOpen] = useState(false)
  const [day, setDay] = useState<CalendarDate | null>(null)
  const field = (
    <DatePicker
      isOpen={open}
      onOpenChange={setOpen}
      style={{ width: p.fullWidth === false ? undefined : '100%' }}
      value={parseIso(node.current) ?? null}
      onChange={(value: DateValue | null) => void node.setValue('onChange', toIso(value))}
      minValue={parseIso(p.minValue)}
      maxValue={parseIso(p.maxValue)}
      isDateUnavailable={unavailableOf(p.unavailableDates)}
      granularity={p.granularity}
      hourCycle={p.hourCycle}
      hideTimeZone={p.hideTimeZone}
      isRequired={p.isRequired}
      isReadOnly={p.isReadOnly}
      isDisabled={p.isDisabled}
      isInvalid={Boolean(errorOf(node))}
      validationBehavior="aria"
      name={p.name}
      aria-label={hiddenLabel(node)}
    >
      {p.label && !p.isLabelHidden ? <Label>{p.label}</Label> : null}
      <DateField.Group fullWidth={p.fullWidth} variant={p.variant}>
        <DateField.Input>
          {(segment: any) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger aria-label={say('pickDate')}>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      {p.description ? <Description>{p.description}</Description> : null}
      {errorOf(node) ? <FieldError>{errorOf(node)}</FieldError> : null}
      <DatePicker.Popover>
        {timed ? (
          // Out of the picker's state, which would keep the old time: the day goes to the time
          // picker.
          <Calendar
            slot={null}
            aria-label={p.label}
            value={value ? toCalendarDate(value) : null}
            minValue={p.minValue ? toCalendarDate(parseIso(p.minValue)!) : undefined}
            maxValue={p.maxValue ? toCalendarDate(parseIso(p.maxValue)!) : undefined}
            isDateUnavailable={unavailableOf(p.unavailableDates)}
            onChange={(picked: DateValue) => {
              setOpen(false)
              setDay(toCalendarDate(picked))
            }}
          >
            <CalendarParts />
          </Calendar>
        ) : (
          <Calendar aria-label={p.label}>
            <CalendarParts />
          </Calendar>
        )}
      </DatePicker.Popover>
    </DatePicker>
  )
  const drawn = calendarLocale(locale, p.calendarSystem)
  const asked = timed ? (
    <TimePickerDialog
      isOpen={day !== null}
      onOpenChange={(isOpen) => isOpen || setDay(null)}
      value={timeOf(value)}
      hourCycle={p.hourCycle === 12 ? 12 : 24}
      onConfirm={(time) => {
        if (day) {
          const zoned = Boolean(value && 'timeZone' in value)
          void node.setValue('onChange', toIso(atTime(day, time, p.granularity, zoned)))
        }
        setDay(null)
      }}
    />
  ) : null
  return (
    <>
      {drawn ? <I18nProvider locale={drawn}>{field}</I18nProvider> : field}
      {asked}
    </>
  )
}

export const fieldBlocks: Record<string, Block> = {
  TextField: TextFieldBlock,
  TextArea: TextAreaBlock,
  SearchField: SearchFieldBlock,
  NumberField: NumberFieldBlock,
  DateField: DateFieldBlock,
}
