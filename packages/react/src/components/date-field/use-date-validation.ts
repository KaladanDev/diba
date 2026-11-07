'use client'

/*
 * Kaladan's: what a date or time field says of a value outside its limits, or on a day that cannot
 * be picked, in the page's language and calendar. React Aria writes these in the browser's
 * language, whatever the page's: on a Persian page in an English browser it would say «باید
 * 11/16/2026 یا پیش از آن باشد». These name a limit as the field shows a date at rest: «باید ۲۵ آبان
 * ۱۴۰۵ یا پیش از آن باشد». They go to React Aria as the field's `validate`, which it reads before
 * its own; a `validate` of the caller's still goes first.
 */
import { DateFormatter, getLocalTimeZone, type DateValue } from '@internationalized/date'
import { useLocale } from 'react-aria-components'

import { useDibaStrings } from '../../i18n/strings'

type Result = string | string[] | true | null | undefined

/** Whether a check found something wrong. */
const failed = (result: Result) =>
  result != null && result !== true && (Array.isArray(result) ? result.length > 0 : result !== '')

/** A value with a time of day: a date and time, or a time alone. */
type Clock = { hour: number; minute: number; second: number }

interface Limits<V> {
  minValue?: V | null
  maxValue?: V | null
  isDateUnavailable?: (date: DateValue) => boolean
  granularity?: string
  hourCycle?: 12 | 24
  validate?: (value: any) => Result
}

/** A date named as a field shows it at rest: «۲۵ آبان ۱۴۰۵», «۲۵ آبان ۱۴۰۵، ۱۴:۰۰». */
function useDateName(granularity?: string, hourCycle?: 12 | 24) {
  const { locale } = useLocale()

  return (date: DateValue) => {
    const timeZone = 'timeZone' in date ? date.timeZone : getLocalTimeZone()
    const timed = granularity ? granularity !== 'day' : 'hour' in date

    return new DateFormatter(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone,
      ...(timed
        ? {
            hour: hourCycle === 12 ? 'numeric' : '2-digit',
            minute: '2-digit',
            hour12: hourCycle === undefined ? undefined : hourCycle === 12,
          }
        : {}),
    }).format(date.toDate(timeZone))
  }
}

/** A date field's or a date picker's `validate`. */
export function useDateValidate(limits: Limits<DateValue>) {
  const t = useDibaStrings()
  const name = useDateName(limits.granularity, limits.hourCycle)

  return (value: DateValue | null): Result => {
    const own = limits.validate?.(value)

    if (failed(own) || !value) return own
    if (limits.minValue && value.compare(limits.minValue) < 0)
      return t.notBefore(name(limits.minValue))
    if (limits.maxValue && value.compare(limits.maxValue) > 0)
      return t.notAfter(name(limits.maxValue))
    if (limits.isDateUnavailable?.(value)) return t.dateUnavailable

    return own
  }
}

/** A date range picker's `validate`: its two ends, and their order. */
export function useDateRangeValidate(limits: Limits<DateValue>) {
  const t = useDibaStrings()
  const name = useDateName(limits.granularity, limits.hourCycle)

  return (value: { start: DateValue; end: DateValue } | null): Result => {
    const own = limits.validate?.(value)

    if (failed(own) || !value?.start || !value.end) return own
    const errors: string[] = []
    const { start, end } = value

    if (limits.minValue && start.compare(limits.minValue) < 0)
      errors.push(t.notBefore(name(limits.minValue)))
    if (limits.maxValue && end.compare(limits.maxValue) > 0)
      errors.push(t.notAfter(name(limits.maxValue)))
    if (limits.isDateUnavailable?.(start) || limits.isDateUnavailable?.(end)) {
      errors.push(t.dateUnavailable)
    }
    if (end.compare(start) < 0) errors.push(t.rangeReversed)

    return errors.length ? errors : own
  }
}

/** A time field's `validate`: its time against its earliest and latest. */
export function useTimeValidate(limits: Limits<any>) {
  const t = useDibaStrings()
  const { locale } = useLocale()
  const name = (time: Clock) =>
    new DateFormatter(locale, {
      hour: limits.hourCycle === 12 ? 'numeric' : '2-digit',
      minute: '2-digit',
      second: limits.granularity === 'second' ? '2-digit' : undefined,
      hour12: limits.hourCycle === undefined ? undefined : limits.hourCycle === 12,
    }).format(new Date(2000, 0, 1, time.hour, time.minute, time.second))

  return (value: any): Result => {
    const own = limits.validate?.(value)

    if (failed(own) || !value) return own
    if (limits.minValue && value.compare(limits.minValue) < 0)
      return t.notBefore(name(limits.minValue))
    if (limits.maxValue && value.compare(limits.maxValue) > 0)
      return t.notAfter(name(limits.maxValue))

    return own
  }
}
