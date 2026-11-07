import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { page, userEvent } from '@vitest/browser/context'
import type { ReactNode } from 'react'
import { DibaProvider } from '../../provider/DibaProvider'
import { settled, textContrast } from '../../test/visual'
import { DibaSurface } from '../../sdui'
import { parseDate, parseDateTime } from '@internationalized/date'
import { Calendar, DateField, Label } from '../../index'

/**
 * The extra components' dates and time — Calendar and RangeCalendar drawn in the page,
 * DateRangePicker and TimeField — in DateField's words and calendar. Every date leaves as
 * Gregorian ISO 8601, whatever calendar draws it.
 */

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

/** One block whose changes reach `call('save', { when })`. */
function paint(type: string, props: Record<string, unknown>, locale = 'fa-IR') {
  const call = vi.fn(async () => {})
  const tree = {
    type,
    props,
    actions: { onChange: { do: 'call', action: 'save', value: 'when' } },
  }
  const view = render(
    <Card locale={locale}>
      <DibaSurface tree={tree as never} handlers={{ call }} />
    </Card>,
  )
  return { call, ...view }
}

const sent = (call: ReturnType<typeof vi.fn>) => (call.mock.calls.at(-1) as unknown[])[1]
const cellOf = (root: ParentNode, label: string) =>
  [...root.querySelectorAll<HTMLElement>('[role="button"][aria-label]')].find((c) =>
    c.getAttribute('aria-label')!.includes(label),
  )!

describe('Calendar, drawn in the page', () => {
  it("is DateField's calendar: one letter a weekday, the title between the arrows, today", async () => {
    await page.viewport(1280, 800)
    const { container } = paint('Calendar', { label: 'روز', defaultValue: '2026-10-22' })
    await settled(80)
    const heads = [...container.querySelectorAll('[data-slot="calendar-header-cell"]')]
    expect(heads.map((h) => h.textContent)).toEqual(['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'])
    expect(container.querySelector('[data-slot="calendar-year-picker-trigger"]')!.textContent).toBe(
      'مهر ۱۴۰۵',
    )
    expect(container.querySelector('[data-slot="calendar-today"]')!.textContent).toBe('امروز')
    // React Aria names the grid by the tree's label and the month it shows.
    expect(container.querySelector('[data-slot="calendar"]')!.getAttribute('aria-label')).toContain(
      'روز',
    )
  })

  it('sends the day picked as a Gregorian date; an unavailable day cannot be picked', async () => {
    await page.viewport(1280, 800)
    const { container, call } = paint('Calendar', {
      label: 'روز',
      defaultValue: '2026-10-22',
      unavailableDates: ['2026-10-19'],
    })
    await settled(80)
    // 27 Mehr 1405 is 2026-10-19; 28 Mehr, 2026-10-20.
    const booked = container.querySelector<HTMLElement>(
      '[data-slot="calendar-cell"][data-unavailable="true"]',
    )!
    expect(booked.textContent).toBe('۲۷')
    await userEvent.click(booked, { force: true })
    await settled(80)
    expect(call).not.toHaveBeenCalled()
    const next = [...container.querySelectorAll<HTMLElement>('[data-slot="calendar-cell"]')].find(
      (c) => c.textContent === '۲۸' && c.dataset.outsideMonth !== 'true',
    )!
    await userEvent.click(next)
    await settled(80)
    expect(sent(call)).toEqual({ when: '2026-10-20' })
  })

  it('draws its error under it, red', async () => {
    const { container } = paint('Calendar', { label: 'روز', errorMessage: 'این روز نه.' })
    await settled(50)
    const error = container.querySelector('[data-slot="calendar-block"] [data-slot="field-error"]')!
    expect(error.textContent).toBe('این روز نه.')
  })
})

describe('RangeCalendar, drawn in the page', () => {
  it("is DateField's calendar too: one letter a weekday, its months and today", async () => {
    await page.viewport(1280, 800)
    const { container } = paint('RangeCalendar', {
      label: 'بازه',
      defaultValue: ['2026-10-17', '2026-10-28'],
    })
    await settled(80)
    const heads = [...container.querySelectorAll('[data-slot="range-calendar-header-cell"]')]
    expect(heads.map((h) => h.textContent)).toEqual(['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'])
    const title = container.querySelector<HTMLElement>(
      '[data-slot="calendar-year-picker-trigger"]',
    )!
    expect(title.textContent).toBe('مهر ۱۴۰۵')
    expect(container.querySelector('[data-slot="calendar-today"]')).not.toBeNull()
    // The title opens the years, and a year its months.
    await userEvent.click(title)
    await settled(300)
    const year = [
      ...container.querySelectorAll<HTMLElement>('[data-slot="calendar-year-picker-year-cell"]'),
    ].find((c) => c.textContent === '۱۴۰۴')!
    await userEvent.click(year)
    await settled(300)
    expect(
      container
        .querySelector('[data-slot="calendar-month-picker-grid"]')!
        .getAttribute('data-open'),
    ).toBe('true')
  })

  it('sends the first and last days, in order, whichever was pressed first', async () => {
    await page.viewport(1280, 800)
    const { container, call } = paint('RangeCalendar', {
      label: 'بازه',
      defaultValue: ['2026-10-17', '2026-10-28'],
    })
    await settled(80)
    const day = (n: string) =>
      [...container.querySelectorAll<HTMLElement>('[data-slot="range-calendar-cell"]')].find(
        (c) => c.textContent === n && c.dataset.outsideMonth !== 'true',
      )!
    // 18 Mehr, then 12 Mehr: 2026-10-10 and 2026-10-04.
    await userEvent.click(day('۱۸'))
    await userEvent.click(day('۱۲'))
    await settled(80)
    expect(sent(call)).toEqual({ when: ['2026-10-04', '2026-10-10'] })
  })
})

describe('DateRangePicker', () => {
  it('reads both dates at rest and opens the range calendar, the bounds reaching it', async () => {
    await page.viewport(1280, 800)
    const { container, call } = paint('DateRangePicker', {
      label: 'بازه',
      defaultValue: ['2026-10-17', '2026-10-28'],
      maxValue: '2026-10-30',
    })
    await settled(80)
    const shown = [...container.querySelectorAll('[data-slot="date-input-group-display"]')].map(
      (d) => d.textContent,
    )
    expect(shown).toEqual(['۲۵ مهر ۱۴۰۵', '۶ آبان ۱۴۰۵'])
    await userEvent.click(container.querySelector('[data-slot="date-range-picker-trigger"]')!)
    await settled(400)
    const calendar = document.querySelector<HTMLElement>(
      '[data-slot="date-range-picker-popover"] [data-slot="range-calendar"]',
    )!
    expect(calendar.querySelector('[data-slot="calendar-year-picker-trigger"]')!.textContent).toBe(
      'مهر ۱۴۰۵',
    )
    // To Aban: 9 Aban is 2026-10-31, past the field's last day.
    await userEvent.click(calendar.querySelectorAll('[data-slot="range-calendar-nav-button"]')[1]!)
    await settled(200)
    const late = cellOf(calendar, 'آبان ۹,')
    expect(late.dataset.disabled).toBe('true')
    const day = (n: string) =>
      [...calendar.querySelectorAll<HTMLElement>('[data-slot="range-calendar-cell"]')].find(
        (c) => c.textContent === n && c.dataset.outsideMonth !== 'true',
      )!
    await userEvent.click(day('۱'))
    await userEvent.click(day('۴'))
    await settled(400)
    expect(document.querySelector('[data-slot="date-range-picker-popover"]')).toBeNull()
    expect(sent(call)).toEqual({ when: ['2026-10-23', '2026-10-26'] })
  })
})

/** Where a box's own words begin and end, as drawn. */
function wordsOf(el: Element) {
  const range = document.createRange()
  range.selectNodeContents(el)
  return range.getBoundingClientRect()
}

describe('the dates on one look', () => {
  for (const type of ['Calendar', 'RangeCalendar']) {
    it(`${type}: off, its title is off too, at half; the years stay shut`, async () => {
      await page.viewport(1280, 800)
      const { container } = paint(type, {
        label: 'روز',
        defaultValue: type === 'Calendar' ? '2026-10-22' : ['2026-10-17', '2026-10-21'],
        isDisabled: true,
      })
      await settled(80)
      const title = container.querySelector<HTMLButtonElement>(
        '[data-slot="calendar-year-picker-trigger"]',
      )!
      expect(title.disabled).toBe(true)
      expect(getComputedStyle(title).opacity).toBe('0.5')
      // Nor does a hover darken it.
      const fill = getComputedStyle(title).backgroundColor
      await userEvent.hover(title)
      await settled(200)
      expect(getComputedStyle(title).backgroundColor).toBe(fill)
      title.click()
      await settled(80)
      expect(title.getAttribute('aria-expanded')).toBe('false')
    })
  }

  it("RangeCalendar: weeks 40 apart, a day 36 in the middle of its week, Flutter's numbers", async () => {
    await page.viewport(1280, 800)
    const { container } = paint('RangeCalendar', {
      label: 'بازه',
      defaultValue: ['2026-10-17', '2026-10-28'],
    })
    await settled(80)
    // 18 and 25 Mehr, a week apart.
    const a = cellOf(container, 'مهر ۱۸,').getBoundingClientRect()
    const cell = cellOf(container, 'مهر ۲۵,')
    const b = cell.getBoundingClientRect()
    const week = cell.closest('td')!.getBoundingClientRect()
    expect(b.left).toBe(a.left)
    expect(b.top - a.top).toBe(40)
    expect(b.height).toBe(36)
    expect(week.height).toBe(40)
    expect(b.top - week.top).toBe(2)
  })

  for (const [name, value] of [
    ['two dates', ['2026-10-17', '2026-10-28']],
    ['the placeholders', undefined],
  ] as const) {
    it(`DateRangePicker, ${name}: each in half the field, the second 12 after the dash`, async () => {
      await page.viewport(1280, 800)
      const { container } = paint('DateRangePicker', { label: 'بازه', defaultValue: value })
      await settled(80)
      const halves = [
        ...container.querySelectorAll<HTMLElement>('[data-slot="date-input-group-resting"]'),
      ].map((h) => h.getBoundingClientRect())
      expect(halves).toHaveLength(2)
      expect(halves[0]!.width).toBeCloseTo(halves[1]!.width, 1)
      const dash = container
        .querySelector('[data-slot="date-range-picker-range-separator"]')!
        .getBoundingClientRect()
      // Right to left: the second date's words begin 12 after the dash's box.
      const second = value
        ? wordsOf(container.querySelectorAll('[data-slot="date-input-group-display"]')[1]!)
        : // The rightmost of its segments: a Persian date reads day first from the right.
          [...container.querySelectorAll('[slot="end"] [data-slot="date-input-group-segment"]')]
            .map((s) => s.getBoundingClientRect())
            .reduce((a, b) => (b.right > a.right ? b : a))
      expect(dash.left - second.right).toBeCloseTo(12, 0)
    })
  }
})

// TimeField took Flutter's look: `time-picker.browser.test.tsx` holds it.

describe('DateField takes unavailable days too', () => {
  it('marks them in its calendar', async () => {
    await page.viewport(1280, 800)
    const { container } = paint('DateField', {
      label: 'تاریخ',
      defaultValue: '2026-10-22',
      unavailableDates: ['2026-10-19'],
    })
    await settled(50)
    await userEvent.click(container.querySelector('[data-slot="date-picker-trigger"]')!)
    await settled(400)
    const booked = document.querySelector(
      '[data-slot="date-picker-popover"] [data-slot="calendar-cell"][data-unavailable="true"]',
    )!
    expect(booked.textContent).toBe('۲۷')
  })
})

/**
 * The dark theme, swept as foundations/dark.browser.test.tsx sweeps Diba's earlier components:
 * every element with words of its own reads at 4.5:1 or more, a disabled or outside day apart.
 */
describe('the dates are readable in dark', () => {
  it('a calendar, a range calendar, a range field and a time field', async () => {
    await page.viewport(1280, 800)
    const tree = {
      type: 'Stack',
      children: [
        { type: 'Calendar', props: { label: 'روز', defaultValue: '2026-10-22' } },
        {
          type: 'RangeCalendar',
          props: { label: 'بازه', defaultValue: ['2026-10-17', '2026-10-28'] },
        },
        {
          type: 'DateRangePicker',
          props: { label: 'بازه', defaultValue: ['2026-10-17', '2026-10-28'] },
        },
        { type: 'TimeField', props: { label: 'ساعت', defaultValue: '09:00' } },
      ],
    }
    render(
      <DibaProvider theme="dark" locale="fa-IR" dir="rtl">
        <div style={{ background: 'var(--surface)', color: 'var(--foreground)', padding: 16 }}>
          <DibaSurface tree={tree as never} />
        </div>
      </DibaProvider>,
    )
    await settled(150)
    const unreadable = [...document.querySelectorAll<HTMLElement>('body *')]
      .filter((el) => {
        const own = [...el.childNodes].some(
          (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
        )
        if (!own) return false
        // Seen at all: a closed year grid is at opacity 0, from its own box up.
        if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false
        // React Aria's announcer, a box 1px across, is for a screen reader, never seen.
        if (el.getBoundingClientRect().width <= 1) return false
        if (el.dataset.slot === 'date-range-picker-range-separator') return false
        return !el.closest(
          '[data-disabled], [disabled], [aria-disabled="true"], [aria-hidden="true"] .sr-only',
        )
      })
      .map((el) => ({ el, ratio: textContrast(el) }))
      .filter(({ ratio }) => ratio < 4.5)
      .map(
        ({ el, ratio }) =>
          `${ratio} ${el.dataset.slot ?? el.tagName} "${el.textContent?.trim().slice(0, 20)}"`,
      )
    expect(unreadable).toEqual([])
    // The range field's dash is a mark between the dates, not words: it needs 3:1 (WCAG 1.4.11).
    const dash = document.querySelector('[data-slot="date-range-picker-range-separator"]')!
    expect(textContrast(dash)).toBeGreaterThanOrEqual(3)
  })
})

/**
 * Three found on the Date and Time pages: a calendar's heading alone stood at the start of its
 * header, the band between a range's ends was all but white, and a Persian date's typed segments
 * read year first from the right.
 */
describe('a heading alone, the range band and the Persian date order', () => {
  /** A token's colour as the browser resolves it, inside the provider given. */
  const resolve = (name: string, within: Element) => {
    const probe = document.createElement('i')
    probe.style.color = `var(${name})`
    within.append(probe)
    const colour = getComputedStyle(probe).color
    probe.remove()
    return colour
  }

  it('a heading alone is centred between the arrows', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card>
        <Calendar aria-label="تاریخ" defaultValue={parseDate('2026-10-17')}>
          <Calendar.Header>
            <Calendar.NavButton slot="previous" />
            <Calendar.Heading />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
        </Calendar>
      </Card>,
    )
    await settled(50)
    const header = container.querySelector('.calendar__header')!.getBoundingClientRect()
    const words = document.createRange()
    words.selectNodeContents(container.querySelector('.calendar__heading')!)
    const text = words.getBoundingClientRect()
    expect(
      Math.abs((text.left + text.right) / 2 - (header.left + header.right) / 2),
    ).toBeLessThanOrEqual(1)
  })

  for (const theme of ['light', 'dark'] as const) {
    it(`${theme}: the band between a range's ends is saffron-${theme === 'light' ? 200 : 800}`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <DibaProvider theme={theme} locale="fa-IR" dir="rtl">
          <div data-reduce-motion="true" style={{ width: 360 }}>
            <DibaSurface
              tree={
                {
                  type: 'RangeCalendar',
                  props: { label: 'دوره', defaultValue: ['2026-10-17', '2026-10-23'] },
                } as never
              }
            />
          </div>
        </DibaProvider>,
      )
      await settled(50)
      const between = container.querySelector(
        '.range-calendar__cell[data-selected="true"]:not([data-selection-start="true"]):not([data-selection-end="true"])',
      )!
      const calendar = container.querySelector('.range-calendar')!
      expect(getComputedStyle(between).backgroundColor).toBe(
        resolve(theme === 'light' ? '--db-saffron-200' : '--db-saffron-800', calendar),
      )
    })
  }

  it('a Persian date reads day first from the right, a time as a clock after it; English keeps its own', async () => {
    await page.viewport(1280, 800)
    const field = (props: Record<string, unknown>) => (
      <DateField {...props}>
        <Label>تاریخ</Label>
        <DateField.Group fullWidth>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
    )
    /** The segments' kinds, left to right as they are drawn. */
    const drawn = (group: Element) =>
      [...group.querySelectorAll<HTMLElement>('.date-input-group__segment')]
        .filter((s) => s.dataset.type !== 'literal')
        .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)
        .map((s) => s.dataset.type)
    const at = parseDateTime('2026-10-17T14:30')
    const persian = render(
      <Card>
        {field({ defaultValue: parseDate('2026-10-17') })}
        {field({ defaultValue: at, granularity: 'minute', hourCycle: 24 })}
        {field({ defaultValue: at, granularity: 'minute', hourCycle: 12 })}
      </Card>,
    )
    await settled(50)
    const [day, clock, twelve] = persian.container.querySelectorAll('.date-input-group')
    expect(drawn(day!)).toEqual(['year', 'month', 'day'])
    expect(drawn(clock!)).toEqual(['hour', 'minute', 'year', 'month', 'day'])
    expect(drawn(twelve!)).toEqual(['dayPeriod', 'hour', 'minute', 'year', 'month', 'day'])
    // They keep to the field's start, the right.
    const segments = [...day!.querySelectorAll('.date-input-group__segment')]
    const rightmost = Math.max(...segments.map((s) => s.getBoundingClientRect().right))
    expect(day!.getBoundingClientRect().right - rightmost).toBeLessThanOrEqual(13)
    persian.unmount()
    const english = render(
      <Card locale="en-US">
        {field({ defaultValue: at, granularity: 'minute', hourCycle: 12 })}
      </Card>,
    )
    await settled(50)
    expect(drawn(english.container.querySelector('.date-input-group')!)).toEqual([
      'month',
      'day',
      'year',
      'hour',
      'minute',
      'dayPeriod',
    ])
  })
})
