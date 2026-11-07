import { getDayOfWeek, parseDate, type DateValue } from '@internationalized/date'
import type { ReactNode } from 'react'
import { I18nProvider, useLocale } from 'react-aria-components'
import { Calendar } from '../components/calendar'
import { RangeCalendar } from '../components/range-calendar'

/**
 * What the date and time stories share: one fixed day, so every page draws the same month, the
 * calendars' insides as Diba composes them, and a way to draw the other calendar. Nothing here
 * ships in the package.
 */

/** 17 October 2026: ۲۵ مهر ۱۴۰۵ in the Persian calendar. */
export const DAY = parseDate('2026-10-17')

/**
 * A calendar's insides, Diba's: the title a pill between the month arrows, opening the years and
 * then the year's months; the days; today in a pill under them.
 */
export function CalendarInsides({
  yearPicker = true,
  today = true,
}: {
  yearPicker?: boolean
  today?: boolean
}) {
  return (
    <>
      <Calendar.Header>
        <Calendar.NavButton slot="previous" />
        {yearPicker ? (
          <Calendar.YearPickerTrigger>
            <Calendar.YearPickerTriggerHeading />
          </Calendar.YearPickerTrigger>
        ) : (
          <Calendar.Heading />
        )}
        <Calendar.NavButton slot="next" />
      </Calendar.Header>
      <Calendar.Grid>
        <Calendar.GridHeader>
          {(day: string) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
        </Calendar.GridHeader>
        <Calendar.GridBody>{(date: any) => <Calendar.Cell date={date} />}</Calendar.GridBody>
      </Calendar.Grid>
      {yearPicker ? (
        <>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({ year }: any) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
          <Calendar.MonthPickerGrid />
        </>
      ) : null}
      {today ? <Calendar.TodayButton /> : null}
    </>
  )
}

/** A range calendar's insides, as a calendar's are. */
export function RangeCalendarInsides({
  yearPicker = true,
  today = true,
}: {
  yearPicker?: boolean
  today?: boolean
}) {
  return (
    <>
      <RangeCalendar.Header>
        <RangeCalendar.NavButton slot="previous" />
        {yearPicker ? (
          <RangeCalendar.YearPickerTrigger>
            <RangeCalendar.YearPickerTriggerHeading />
          </RangeCalendar.YearPickerTrigger>
        ) : (
          <RangeCalendar.Heading />
        )}
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
      {yearPicker ? (
        <>
          <RangeCalendar.YearPickerGrid>
            <RangeCalendar.YearPickerGridBody>
              {({ year }: any) => <RangeCalendar.YearPickerCell year={year} />}
            </RangeCalendar.YearPickerGridBody>
          </RangeCalendar.YearPickerGrid>
          <RangeCalendar.MonthPickerGrid />
        </>
      ) : null}
      {today ? <RangeCalendar.TodayButton /> : null}
    </>
  )
}

/**
 * Its children in a calendar of the page's language: `persian` or `gregorian` whatever the
 * language, or the language's own. The locale's `-u-ca-` extension is how React Aria is told.
 */
export function InCalendar({
  system,
  children,
}: {
  system: 'auto' | 'persian' | 'gregorian'
  children: ReactNode
}) {
  const { locale } = useLocale()
  if (system === 'auto') return <>{children}</>
  const base = locale.split('-u-')[0]
  return (
    <I18nProvider locale={`${base}-u-ca-${system === 'persian' ? 'persian' : 'gregory'}`}>
      {children}
    </I18nProvider>
  )
}

/** A date as the wire carries it: Gregorian ISO 8601, whatever calendar drew it. */
export const iso = (value: DateValue | null | undefined) => (value ? value.toString() : null)

/** A range as the wire carries it. */
export const isoRange = (range: { start: DateValue; end: DateValue } | null | undefined) =>
  range ? [range.start.toString(), range.end.toString()] : null

/** Whether a day is a Friday, the weekend's day off in Iran: counted from an English Sunday. */
export const isFriday = (date: DateValue) => getDayOfWeek(date, 'en-US') === 5
