import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { page, userEvent } from '@vitest/browser/context'
import { parseDate, parseDateTime } from '@internationalized/date'
import type { ReactNode } from 'react'
import { DibaProvider } from '../../provider/DibaProvider'
import { Calendar, DateField, DatePicker, Label } from '../../index'
import { settled, toRgb } from '../../test/visual'
import { DibaSurface } from '../../sdui'

/** A card, as an admin section draws one; see button.browser.test.tsx. */
function Card({ locale = 'fa-IR', children }: { locale?: string; children: ReactNode }) {
  return (
    <DibaProvider theme="light" locale={locale} dir={locale.startsWith('fa') ? 'rtl' : 'ltr'}>
      <div
        data-reduce-motion="true"
        style={{
          background: 'var(--surface)',
          color: 'var(--foreground)',
          padding: 16,
          width: 360,
        }}
      >
        {children}
      </div>
    </DibaProvider>
  )
}

function Picker(props: {
  value: ReturnType<typeof parseDate> | ReturnType<typeof parseDateTime>
  granularity?: 'day' | 'hour' | 'minute'
}) {
  return (
    <DatePicker defaultValue={props.value} granularity={props.granularity} hourCycle={24}>
      <Label>تاریخ</Label>
      <DateField.Group fullWidth>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <Calendar aria-label="تاریخ">
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  )
}

const display = (root: ParentNode) =>
  root.querySelector('[data-slot="date-input-group-display"]')?.textContent ?? null
const css = (el: Element) => getComputedStyle(el)
const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name)
const rgb = (value: string) => toRgb(value.trim())

/**
 * A date field at rest reads as Flutter's does, with the month's name and the time as hours
 * and minutes, drawn over the typed segments, which come back once the field has focus.
 */
describe('a date at rest', () => {
  it('reads «۲۵ مهر ۱۴۰۵، ۱۴:۰۰» in Persian, over hidden segments', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card>
        <Picker value={parseDateTime('2026-10-17T14:00')} granularity="hour" />
      </Card>,
    )
    await settled(50)
    expect(display(container)).toBe('۲۵ مهر ۱۴۰۵، ۱۴:۰۰')
    for (const segment of container.querySelectorAll('.date-input-group__segment')) {
      expect(css(segment).opacity).toBe('0')
    }
  })

  it('switches to the typed segments on focus, and back when focus leaves', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card>
        <Picker value={parseDate('2026-10-16')} />
      </Card>,
    )
    await settled(50)
    const shown = container.querySelector('[data-slot="date-input-group-display"]')!
    await userEvent.click(container.querySelector('.date-input-group__segment')!)
    await settled(50)
    expect(document.activeElement?.getAttribute('data-slot')).toBe('date-input-group-segment')
    expect(css(shown).display).toBe('none')
    expect(css(container.querySelector('.date-input-group__segment')!).opacity).toBe('1')
    ;(document.activeElement as HTMLElement).blur()
    await settled(50)
    expect(css(shown).display).not.toBe('none')
  })

  it('keeps the field’s own calendar: Gregorian months in Persian, and English in English', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <>
        <Card locale="fa-IR-u-ca-gregory">
          <div className="gregorian">
            <Picker value={parseDate('2031-03-21')} />
          </div>
        </Card>
        <Card locale="en-US">
          <div className="english">
            <Picker value={parseDate('2026-10-17')} />
          </div>
        </Card>
      </>,
    )
    await settled(50)
    expect(display(container.querySelector('.gregorian')!)).toBe('۲۱ مارس ۲۰۳۱')
    expect(display(container.querySelector('.english')!)).toBe('October 17, 2026')
  })

  it('a DateField on its own reads the same, with no calendar button', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card>
        <DateField defaultValue={parseDate('1990-06-01')}>
          <Label>تاریخ تولد</Label>
          <DateField.Group>
            <DateField.Input>
              {(segment) => <DateField.Segment segment={segment} />}
            </DateField.Input>
          </DateField.Group>
        </DateField>
      </Card>,
    )
    await settled(50)
    expect(display(container)).toBe('۱۱ خرداد ۱۳۶۹')
  })

  it('shows the placeholder segments while there is no value', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card>
        <DatePicker>
          <Label>تاریخ</Label>
          <DateField.Group>
            <DateField.Input>
              {(segment) => <DateField.Segment segment={segment} />}
            </DateField.Input>
          </DateField.Group>
        </DatePicker>
      </Card>,
    )
    await settled(50)
    expect(display(container)).toBeNull()
    expect(css(container.querySelector('.date-input-group__segment')!).opacity).toBe('1')
  })
})

/**
 * The calendar button opens the copied calendar in the field's own calendar. In Persian its days
 * are headed with one letter each, as Flutter's are, its arrows point the way they move, and the
 * picked day is gilt with slate-700 on it.
 */
describe('the calendar', () => {
  it('opens in Persian, one letter a weekday, and a picked day fills the field', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card>
        <Picker value={parseDate('2026-10-17')} />
      </Card>,
    )
    await settled(50)
    await userEvent.click(container.querySelector('[data-slot="date-picker-trigger"]')!)
    await settled(300)
    const popover = document.querySelector('[data-slot="date-picker-popover"]')!
    expect(popover).not.toBeNull()
    const heads = [
      ...popover.querySelectorAll('[data-slot="calendar-header-cell"], .calendar__header-cell'),
    ]
    expect(heads).toHaveLength(7)
    for (const head of heads) expect(head.textContent!.trim()).toHaveLength(1)

    const [previous] = popover.querySelectorAll('[data-slot="calendar-nav-button-icon"]')
    expect(css(previous!).rotate).toBe('180deg')

    const picked = popover.querySelector('[data-slot="calendar-cell"][data-selected="true"]')!
    expect(picked.textContent).toBe('۲۵')
    expect(rgb(css(picked).backgroundColor)).toEqual(rgb(token('--db-control-fill')))
    expect(rgb(css(picked).color)).toEqual(rgb(token('--db-control-on-fill')))

    const day = [
      ...popover.querySelectorAll('[data-slot="calendar-cell"]:not([data-outside-month])'),
    ].find((cell) => cell.textContent === '۲۸')!
    await userEvent.click(day)
    await settled(300)
    expect(display(container)).toBe('۲۸ مهر ۱۴۰۵')
  })
})

/**
 * The date field is Diba's on both platforms, with its calendar's title between the arrows
 * in a pill that opens the years and then the year's months; the original put the title at the start
 * with a chevron beside it, and opened the years alone.
 */
describe("the calendar's title", () => {
  function Field({
    locale = 'fa-IR',
    props = {},
  }: {
    locale?: string
    props?: Record<string, unknown>
  }) {
    return (
      <Card locale={locale}>
        <DibaSurface
          tree={
            {
              type: 'DateField',
              props: { label: 'تاریخ ارسال', defaultValue: '2026-10-22', ...props },
            } as never
          }
        />
      </Card>
    )
  }
  async function open(container: HTMLElement) {
    await userEvent.click(container.querySelector('[data-slot="date-picker-trigger"]')!)
    await settled(400)
    return document.querySelector<HTMLElement>('[data-slot="date-picker-popover"] .calendar')!
  }
  const title = (calendar: Element) =>
    calendar.querySelector<HTMLElement>('[data-slot="calendar-year-picker-trigger"]')!

  it('between the arrows, a pill reading «مهر ۱۴۰۵», with no chevron', async () => {
    await page.viewport(1280, 800)
    const { container } = render(<Field />)
    await settled(50)
    const calendar = await open(container)
    const pill = title(calendar)
    const [previous, next] = [
      ...calendar.querySelectorAll<HTMLElement>('[data-slot="calendar-nav-button"]'),
    ]
    const c = calendar.getBoundingClientRect()
    const p = pill.getBoundingClientRect()
    // Right to left: previous at the right, next at the left, the title in the middle.
    expect(previous!.getAttribute('aria-label')).toBe('قبلی')
    expect(previous!.getBoundingClientRect().right).toBeCloseTo(c.right - 2, 0)
    expect(next!.getBoundingClientRect().left).toBeCloseTo(c.left + 2, 0)
    expect(p.left + p.width / 2).toBeCloseTo(c.left + c.width / 2, 0)
    expect(
      calendar.querySelector('[data-slot="calendar-year-picker-trigger-indicator"]'),
    ).toBeNull()
    expect(pill.textContent).toBe('مهر ۱۴۰۵')
    expect(pill.getAttribute('aria-label')).toBe('مهر ۱۴۰۵، انتخاب ماه و سال')
    expect(p.height).toBe(28)
    expect(css(pill).borderTopLeftRadius).toBe('9999px')
    expect(css(pill).paddingInlineStart).toBe('12px')
    expect(rgb(css(pill).backgroundColor)).toEqual(rgb(token('--default')))
    expect(rgb(css(pill).color)).toEqual(rgb(token('--default-foreground')))
    const heading = pill.querySelector('[data-slot="calendar-year-picker-trigger-heading"]')!
    expect(css(heading).fontSize).toBe('14px')
    expect(css(heading).fontWeight).toBe('500')
    // A hover darkens it.
    await userEvent.hover(pill)
    await settled(200)
    expect(rgb(css(pill).backgroundColor)).toEqual(rgb(token('--default-hover')))
  })

  it('opens the years, gilt; a year opens its months on the same month; a month the days', async () => {
    await page.viewport(1280, 800)
    const { container } = render(<Field />)
    await settled(50)
    const calendar = await open(container)
    const pill = title(calendar)
    await userEvent.click(pill)
    await settled(400)
    expect(pill.dataset.open).toBe('true')
    expect(rgb(css(pill).backgroundColor)).toEqual(rgb(token('--db-control-fill')))
    expect(rgb(css(pill).color)).toEqual(rgb(token('--db-control-on-fill')))
    for (const arrow of calendar.querySelectorAll('[data-slot="calendar-nav-button"]')) {
      expect(css(arrow).opacity).toBe('0')
    }
    const years = calendar.querySelector('[data-slot="calendar-year-picker-grid"]')!
    expect(years.getAttribute('data-open')).toBe('true')
    const year = [
      ...calendar.querySelectorAll<HTMLElement>('[data-slot="calendar-year-picker-year-cell"]'),
    ].find((cell) => cell.textContent === '۱۴۰۳')!
    await userEvent.click(year)
    await settled(400)
    expect(years.getAttribute('data-open')).toBeNull()
    const months = calendar.querySelector('[data-slot="calendar-month-picker-grid"]')!
    expect(months.getAttribute('data-open')).toBe('true')
    expect(pill.textContent).toBe('۱۴۰۳')
    const cells = [
      ...months.querySelectorAll<HTMLElement>('[data-slot="calendar-month-picker-cell"]'),
    ]
    expect(cells.map((c) => c.textContent)).toEqual([
      'فروردین',
      'اردیبهشت',
      'خرداد',
      'تیر',
      'مرداد',
      'شهریور',
      'مهر',
      'آبان',
      'آذر',
      'دی',
      'بهمن',
      'اسفند',
    ])
    // The month the calendar was on, not the last of the year.
    const chosen = months.querySelector<HTMLElement>('[data-selected="true"]')!
    expect(chosen.textContent).toBe('مهر')
    expect(rgb(css(chosen).backgroundColor)).toEqual(rgb(token('--db-control-fill')))
    expect(chosen.getBoundingClientRect().height).toBe(32)
    // Three across.
    expect(cells[1]!.getBoundingClientRect().top).toBe(cells[0]!.getBoundingClientRect().top)
    expect(cells[3]!.getBoundingClientRect().top).toBeGreaterThan(
      cells[0]!.getBoundingClientRect().top,
    )
    await userEvent.click(cells[2]!)
    await settled(400)
    expect(months.getAttribute('data-open')).toBeNull()
    expect(pill.dataset.open).toBeUndefined()
    expect(pill.textContent).toBe('خرداد ۱۴۰۳')
    expect(rgb(css(pill).backgroundColor)).toEqual(rgb(token('--default')))
  })

  it('in English, «October 2026»; Escape from the months closes them', async () => {
    await page.viewport(1280, 800)
    const { container } = render(<Field locale="en-US" />)
    await settled(50)
    const calendar = await open(container)
    const pill = title(calendar)
    expect(pill.textContent).toBe('October 2026')
    expect(pill.getAttribute('aria-label')).toBe('October 2026, choose the month and year')
    await userEvent.click(pill)
    await settled(300)
    const year = [
      ...calendar.querySelectorAll<HTMLElement>('[data-slot="calendar-year-picker-year-cell"]'),
    ].find((cell) => cell.textContent === '2024')!
    await userEvent.click(year)
    await settled(300)
    expect(pill.textContent).toBe('2024')
    await userEvent.keyboard('{Escape}')
    await settled(300)
    expect(
      calendar.querySelector('[data-slot="calendar-month-picker-grid"]')!.getAttribute('data-open'),
    ).toBeNull()
    expect(pill.textContent).toBe('October 2024')
  })

  const todayPill = (calendar: Element) =>
    calendar.querySelector<HTMLElement>('[data-slot="calendar-today"]')!

  it('today under the days, a pill as the title is; it picks today and closes', async () => {
    await page.viewport(1280, 800)
    const { container } = render(<Field />)
    await settled(50)
    const calendar = await open(container)
    const pill = todayPill(calendar)
    expect(pill.textContent).toBe('امروز')
    const c = calendar.getBoundingClientRect()
    const p = pill.getBoundingClientRect()
    const grid = calendar.querySelector('[data-slot="calendar-grid"]')!.getBoundingClientRect()
    expect(p.top).toBeCloseTo(grid.bottom + 12, 0)
    expect(p.left + p.width / 2).toBeCloseTo(c.left + c.width / 2, 0)
    expect(p.height).toBe(28)
    expect(css(pill).borderTopLeftRadius).toBe('9999px')
    expect(css(pill).paddingInlineStart).toBe('12px')
    expect(rgb(css(pill).backgroundColor)).toEqual(rgb(token('--default')))
    expect(rgb(css(pill).color)).toEqual(rgb(token('--default-foreground')))
    expect(css(pill).fontSize).toBe('14px')
    expect(css(pill).fontWeight).toBe('500')
    await userEvent.hover(pill)
    await settled(200)
    expect(rgb(css(pill).backgroundColor)).toEqual(rgb(token('--default-hover')))
    const before = display(container)
    await userEvent.click(pill)
    await settled(400)
    expect(document.querySelector('[data-slot="date-picker-popover"]')).toBeNull()
    expect(display(container)).not.toBe(before)
    const again = await open(container)
    const chosen = again.querySelector('[data-slot="calendar-cell"][data-selected="true"]')!
    expect(chosen.getAttribute('data-today')).toBe('true')
  })

  it("today from the years picks it too; past the field's bounds it is at half", async () => {
    await page.viewport(1280, 800)
    const { container, unmount } = render(<Field locale="en-US" />)
    await settled(50)
    const calendar = await open(container)
    await userEvent.click(title(calendar))
    await settled(300)
    expect(todayPill(calendar).getBoundingClientRect().height).toBe(28)
    await userEvent.click(todayPill(calendar))
    await settled(400)
    expect(document.querySelector('[data-slot="date-picker-popover"]')).toBeNull()
    const again = await open(container)
    expect(
      again
        .querySelector('[data-slot="calendar-cell"][data-selected="true"]')!
        .getAttribute('data-today'),
    ).toBe('true')
    await userEvent.keyboard('{Escape}')
    await settled(300)
    unmount()
    const bounded = render(
      <Field
        locale="en-US"
        props={{ defaultValue: '2020-01-10', minValue: '2020-01-05', maxValue: '2020-02-01' }}
      />,
    )
    await settled(50)
    const past = await open(bounded.container)
    // The field's bounds reach its calendar: the original's own, 1900 to 2099, had stood in for them.
    const early = past.querySelector('[data-slot="calendar-cell"][aria-label*="January 2, 2020"]')!
    expect(early.getAttribute('data-disabled')).toBe('true')
    expect(early.hasAttribute('data-outside-month')).toBe(false)
    const pill = todayPill(past)
    expect(pill.hasAttribute('disabled')).toBe(true)
    expect(css(pill).opacity).toBe('0.5')
    await userEvent.click(pill, { force: true })
    await settled(300)
    expect(document.querySelector('[data-slot="date-picker-popover"]')).not.toBeNull()
  })

  it("the field's calendar icon is drawn in strokes 1.6 wide, the original thinned", async () => {
    await page.viewport(1280, 800)
    const { container } = render(<Field />)
    await settled(50)
    const icon = container.querySelector('[data-slot="date-picker-trigger"] svg')!
    expect(icon.getAttribute('viewBox')).toBe('0 0 20 20')
    expect(icon.getAttribute('fill')).toBe('none')
    expect(icon.getAttribute('stroke-width')).toBe('1.6')
    expect(icon.querySelector('rect')!.getAttribute('rx')).toBe('3.2')
  })
})
