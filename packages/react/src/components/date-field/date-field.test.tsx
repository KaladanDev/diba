import { describe, it, expect } from 'vitest'
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { parseDate, parseTime } from '@internationalized/date'
import { DibaProvider } from '../../provider/DibaProvider'
import { DateField, DatePicker, DateRangePicker, FieldError, Label, TimeField } from '../../index'

/**
 * The copied DateField as Diba exports it, composed as admin-web composes it. The value is
 * Gregorian on the wire; under a Persian locale React Aria shows it in the Persian calendar, in
 * Persian digits.
 */
function Field({ locale }: { locale: 'fa-IR' | 'en-US' }) {
  return (
    <DibaProvider locale={locale} dir={locale === 'fa-IR' ? 'rtl' : 'ltr'} ownsDocument={false}>
      <DateField defaultValue={parseDate('2026-10-17')}>
        <Label>تاریخ ارسال</Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
    </DibaProvider>
  )
}

describe('DateField', () => {
  it('shows 17 October 2026 as 25 Mehr 1405 in Persian', () => {
    const { container } = render(<Field locale="fa-IR" />)
    const segments = [...container.querySelectorAll('[data-type]')]
      .filter((s) => s.getAttribute('data-type') !== 'literal')
      .map((s) => `${s.getAttribute('data-type')}=${s.textContent}`)
    // Persian writes the month without a leading zero.
    expect(segments).toEqual(expect.arrayContaining(['year=۱۴۰۵', 'month=۷', 'day=۲۵']))
    expect(container.querySelector('.date-field')).not.toBeNull()
  })

  it('shows the same day in the Gregorian calendar in English', () => {
    const { container } = render(<Field locale="en-US" />)
    const year = container.querySelector('[data-type="year"]')
    expect(year).toHaveTextContent('2026')
  })

  it('is a labelled group of spin buttons', () => {
    render(<Field locale="fa-IR" />)
    expect(screen.getAllByRole('spinbutton').length).toBeGreaterThanOrEqual(3)
    expect(screen.getByText('تاریخ ارسال')).toHaveClass('label')
  })
})

/**
 * What a date or time field says of a value outside its limits is in the page's language and
 * calendar. React Aria writes it in the browser's, which jsdom's is: English, so on a Persian page
 * it said «باید 11/16/2026 یا پیش از آن باشد».
 */
describe('a date outside its limits, in the page’s words and calendar', () => {
  const page = (locale: 'fa-IR' | 'en-US', children: ReactNode) =>
    render(
      <DibaProvider locale={locale} dir={locale === 'fa-IR' ? 'rtl' : 'ltr'} ownsDocument={false}>
        {children}
      </DibaProvider>,
    )
  const error = (container: HTMLElement) =>
    container.querySelector('[data-slot="field-error"]')?.textContent

  const late = (validate?: (value: unknown) => string | null) => (
    <DateField
      defaultValue={parseDate('2026-11-20')}
      minValue={parseDate('2026-10-17')}
      maxValue={parseDate('2026-11-16')}
      validate={validate}
      validationBehavior="aria"
    >
      <Label>تاریخ ارسال</Label>
      <DateField.Group>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
      </DateField.Group>
      <FieldError />
    </DateField>
  )

  it('a Persian page in an English browser names the last day in Persian', () => {
    const { container } = page('fa-IR', late())
    expect(navigator.language).toBe('en-US')
    expect(error(container)).toBe('باید ۲۵ آبان ۱۴۰۵ یا پیش از آن باشد.')
  })

  it('an English page names it in English', () => {
    const { container } = page('en-US', late())
    expect(error(container)).toBe('Must be November 16, 2026 or earlier.')
  })

  it('a date picker, the block’s date field, says it the same way', () => {
    const { container } = page(
      'fa-IR',
      <DatePicker
        defaultValue={parseDate('2026-11-20')}
        maxValue={parseDate('2026-11-16')}
        validationBehavior="aria"
      >
        <Label>تاریخ ارسال</Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <FieldError />
      </DatePicker>,
    )
    expect(error(container)).toBe('باید ۲۵ آبان ۱۴۰۵ یا پیش از آن باشد.')
  })

  it('a check of the caller’s own goes first', () => {
    const { container } = page(
      'fa-IR',
      late(() => 'از انبار نمی‌رسد.'),
    )
    expect(error(container)).toBe('از انبار نمی‌رسد.')
  })

  it('a time names its latest as a clock does', () => {
    const { container } = page(
      'fa-IR',
      <TimeField
        defaultValue={parseTime('22:30')}
        maxValue={parseTime('21:00')}
        hourCycle={24}
        validationBehavior="aria"
      >
        <Label>ساعت تحویل</Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <FieldError />
      </TimeField>,
    )
    expect(error(container)).toBe('باید ۲۱:۰۰ یا پیش از آن باشد.')
  })

  it('a range before its first day, and one whose end is before its start', () => {
    const range = (start: string, end: string) => (
      <DateRangePicker
        defaultValue={{ start: parseDate(start), end: parseDate(end) }}
        minValue={parseDate('2026-10-17')}
        validationBehavior="aria"
      >
        <Label>دوره</Label>
        <DateField.Group>
          <DateField.Input slot="start">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateField.Input slot="end">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
        </DateField.Group>
        <FieldError />
      </DateRangePicker>
    )
    const early = page('fa-IR', range('2026-10-10', '2026-10-20'))
    expect(error(early.container)).toBe('باید ۲۵ مهر ۱۴۰۵ یا پس از آن باشد.')
    early.unmount()
    const reversed = page('fa-IR', range('2026-10-25', '2026-10-20'))
    expect(error(reversed.container)).toBe('تاریخ آغاز باید پیش از تاریخ پایان باشد.')
  })
})
