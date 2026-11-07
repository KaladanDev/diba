import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { commands, page, userEvent } from '@vitest/browser/context'
import type { ReactNode } from 'react'
import { DibaProvider } from '../../provider/DibaProvider'
import { settled } from '../../test/visual'
import { DibaSurface } from '../../sdui'

/**
 * The time field is Flutter's on both platforms, and a time is picked in Material 3's time
 * picker as Flutter draws it under Diba's theme, its numbers measured in Flutter (Windows, so
 * the buttons' row is 40). A timed date field asks its day's time in it, a timed range its two.
 * `dates_blocks_test.dart` holds Flutter's side.
 */

function Card({ locale = 'en-US', children }: { locale?: string; children: ReactNode }) {
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
function paint(type: string, props: Record<string, unknown>, locale = 'en-US') {
  const call = vi.fn(async (..._args: unknown[]) => {})
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

const sent = (call: ReturnType<typeof vi.fn>) =>
  (call.mock.calls.at(-1) as unknown[] | undefined)?.[1]
const picker = () => document.querySelector<HTMLElement>('[data-slot="time-picker"]')
const slot = (name: string) => picker()!.querySelector<HTMLElement>(`[data-slot="${name}"]`)!
const press = (text: string) =>
  [...picker()!.querySelectorAll<HTMLElement>('button')].find((b) => b.textContent === text)!
const css = (el: Element) => getComputedStyle(el)
const token = (name: string) => {
  const probe = document.createElement('i')
  probe.style.color = `var(${name})`
  document.querySelector('[data-slot="time-picker"]')!.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

/** A real mouse press at a value on the dial: an hour or a minute's place, on the ring given. */
async function tapDial(value: number, of: 12 | 60, ring: 'outer' | 'inner' = 'outer') {
  const dial = slot('time-picker-dial').getBoundingClientRect()
  const r = dial.width / 2 - 28 - (ring === 'inner' ? 28 : 0)
  const angle = Math.PI / 2 - (value / of) * 2 * Math.PI
  const x = dial.left + dial.width / 2 + r * Math.cos(angle)
  const y = dial.top + dial.height / 2 - r * Math.sin(angle)
  await commands.pointer(x, y, 'move')
  await commands.pointer(x, y, 'down')
  await commands.pointer(x, y, 'up')
  await settled(300)
}

async function openField(container: HTMLElement) {
  await userEvent.click(container.querySelector('[data-slot="time-field-trigger"]')!)
  await settled(400)
  expect(picker()).not.toBeNull()
}

/**
 * A phone 360 wide has 328 inside the modal's padding, where Material's standing picker is 358: it
 * is drawn down to fit, and its dial still takes a press where it is drawn.
 */
describe('the time picker on a phone 360 wide', () => {
  it('fits inside the window, and a press on its smaller dial picks what is under it', async () => {
    await page.viewport(360, 780)
    const { container, call } = paint('TimeField', { label: 'Opens', defaultValue: '09:00' })
    await settled(50)
    await openField(container)
    const box = picker()!.getBoundingClientRect()
    expect(box.left).toBeGreaterThanOrEqual(0)
    expect(box.right).toBeLessThanOrEqual(360)
    // Three o'clock on the outer ring, where the drawn dial has it: the morning's 03, not 15.
    const dial = slot('time-picker-dial').getBoundingClientRect()
    const scale = dial.width / 256
    expect(scale).toBeLessThan(1)
    const r = (128 - 28) * scale
    const x = dial.left + dial.width / 2 + r
    const y = dial.top + dial.height / 2
    await commands.pointer(x, y, 'move')
    await commands.pointer(x, y, 'down')
    await commands.pointer(x, y, 'up')
    await settled(300)
    expect(slot('time-picker-hour').textContent).toBe('03')
    await userEvent.click(press('OK'))
    await settled(400)
    expect(sent(call)).toEqual({ when: '03:00' })
  })
})

describe('the time field, Flutter’s', () => {
  it('reads «۰۹:۰۰» and «۹:۳۰ ب.ظ.», empty «––:––» in the placeholder’s colour', async () => {
    await page.viewport(1280, 800)
    const shown = (props: Record<string, unknown>) => {
      const { container: c } = paint('TimeField', { label: 'ساعت', ...props }, 'fa-IR')
      return c.querySelector<HTMLElement>('[data-slot="time-field-display"]')!
    }
    expect(shown({ defaultValue: '09:00' }).textContent).toBe('۰۹:۰۰')
    expect(shown({ defaultValue: '21:30', hourCycle: 12 }).textContent).toBe('۹:۳۰ ب.ظ.')
    const empty = shown({})
    expect(empty.textContent).toBe('––:––')
    await settled(50)
    const probe = document.createElement('i')
    probe.style.color = 'var(--field-placeholder)'
    empty.after(probe)
    expect(css(empty).color).toBe(css(probe).color)
  })

  it('a press opens the picker; an hour, then the minutes; a tap takes the nearest five', async () => {
    await page.viewport(412, 915)
    const { container, call } = paint('TimeField', { label: 'Opens', defaultValue: '09:00' })
    await settled(50)
    await openField(container)
    expect(slot('time-picker-hour').textContent).toBe('09')
    expect(slot('time-picker-hour').dataset.selected).toBe('true')
    await tapDial(3, 12)
    expect(slot('time-picker-hour').textContent).toBe('03')
    // Let go of an hour, the dial turns to the minutes.
    expect(slot('time-picker-dial').dataset.mode).toBe('minute')
    expect(slot('time-picker-minute').dataset.selected).toBe('true')
    await tapDial(31, 60)
    expect(slot('time-picker-minute').textContent).toBe('30')
    await userEvent.click(press('OK'))
    await settled(400)
    expect(sent(call)).toEqual({ when: '03:30' })
    expect(picker()).toBeNull()
  })

  it('a drag takes any minute, its dot marking one between the fives', async () => {
    await page.viewport(412, 915)
    const { container, call } = paint('TimeField', { label: 'Opens', defaultValue: '09:00' })
    await settled(50)
    await openField(container)
    await userEvent.click(slot('time-picker-minute'))
    await settled(100)
    const dial = slot('time-picker-dial').getBoundingClientRect()
    const at = (minute: number) => {
      const angle = Math.PI / 2 - (minute / 60) * 2 * Math.PI
      return [
        dial.left + dial.width / 2 + 100 * Math.cos(angle),
        dial.top + dial.height / 2 - 100 * Math.sin(angle),
      ] as const
    }
    await commands.pointer(...at(0), 'move')
    await commands.pointer(...at(0), 'down')
    await commands.pointer(...at(4), 'move')
    await commands.pointer(...at(7), 'move')
    await commands.pointer(...at(7), 'up')
    await settled(300)
    expect(slot('time-picker-minute').textContent).toBe('07')
    expect(picker()!.querySelector('.time-picker__dial-dot')).not.toBeNull()
    await userEvent.click(press('OK'))
    await settled(400)
    expect(sent(call)).toEqual({ when: '09:07' })
  })

  it('a 24-hour clock’s afternoon is its inner ring', async () => {
    await page.viewport(412, 915)
    const { container, call } = paint(
      'TimeField',
      { label: 'ساعت', defaultValue: '09:00' },
      'fa-IR',
    )
    await settled(50)
    await openField(container)
    expect(slot('time-picker-hour').textContent).toBe('۹')
    await tapDial(3, 12, 'inner')
    expect(slot('time-picker-hour').textContent).toBe('۱۵')
    await userEvent.click(press('تأیید'))
    await settled(400)
    expect(sent(call)).toEqual({ when: '15:00' })
  })

  it('on a 12-hour clock, PM puts the hour after noon', async () => {
    await page.viewport(412, 915)
    const { container, call } = paint('TimeField', {
      label: 'Closes',
      defaultValue: '09:30',
      hourCycle: 12,
    })
    await settled(50)
    await openField(container)
    expect(slot('time-picker-am').dataset.selected).toBe('true')
    await userEvent.click(slot('time-picker-pm'))
    await settled(100)
    expect(slot('time-picker-pm').dataset.selected).toBe('true')
    await userEvent.click(press('OK'))
    await settled(400)
    expect(sent(call)).toEqual({ when: '21:30' })
  })

  it('typed: the fields hold the time; a whole hour moves on; what it cannot read stays', async () => {
    await page.viewport(412, 915)
    const { container, call } = paint('TimeField', { label: 'Opens', defaultValue: '09:00' })
    await settled(50)
    await openField(container)
    await userEvent.click(picker()!.querySelector('.time-picker__entry')!)
    await settled(100)
    const hour = slot('time-picker-hour-input') as HTMLInputElement
    const minute = slot('time-picker-minute-input') as HTMLInputElement
    expect([hour.value, minute.value]).toEqual(['09', '00'])
    // The switch keeps its focus: nothing is typed into until pressed.
    expect(document.activeElement).not.toBe(hour)
    await userEvent.click(hour)
    await userEvent.keyboard('14')
    await settled(50)
    expect(document.activeElement).toBe(minute)
    await userEvent.keyboard('45')
    await userEvent.click(press('OK'))
    await settled(400)
    expect(sent(call)).toEqual({ when: '14:45' })

    await openField(container)
    await userEvent.click(picker()!.querySelector('.time-picker__entry')!)
    await userEvent.click(slot('time-picker-hour-input'))
    await userEvent.keyboard('25')
    await userEvent.click(press('OK'))
    await settled(200)
    expect(picker()!.querySelector('[role="alert"]')!.textContent).toBe('Enter a valid time')
    expect(slot('time-picker-hour-input').dataset.invalid).toBe('true')
    expect(sent(call)).toEqual({ when: '14:45' })
  })

  // Flutter's Material picker read a typed hour in 0-9 only and refused its own «۲۱»; Diba's
  // copy there, and this, read the locale's digits.
  it('Persian types too: the time in its fields is taken, and «۱۴» «۴۵» typed', async () => {
    await page.viewport(412, 915)
    const { container, call } = paint(
      'TimeField',
      { label: 'ساعت', defaultValue: '21:30' },
      'fa-IR',
    )
    await settled(50)
    await openField(container)
    await userEvent.click(picker()!.querySelector('.time-picker__entry')!)
    await settled(100)
    const hour = slot('time-picker-hour-input') as HTMLInputElement
    const minute = slot('time-picker-minute-input') as HTMLInputElement
    expect([hour.value, minute.value]).toEqual(['۲۱', '۳۰'])
    await userEvent.click(press('تأیید'))
    await settled(400)
    expect(sent(call)).toEqual({ when: '21:30' })

    await openField(container)
    await userEvent.click(picker()!.querySelector('.time-picker__entry')!)
    await userEvent.click(slot('time-picker-hour-input'))
    await userEvent.keyboard('۱۴')
    await settled(50)
    expect(document.activeElement).toBe(slot('time-picker-minute-input'))
    await userEvent.keyboard('۴۵')
    await userEvent.click(press('تأیید'))
    await settled(400)
    expect(sent(call)).toEqual({ when: '14:45' })
  })

  it('Cancel and Escape send nothing', async () => {
    await page.viewport(412, 915)
    const { container, call } = paint('TimeField', { label: 'Opens', defaultValue: '09:00' })
    await settled(50)
    await openField(container)
    await tapDial(3, 12)
    await userEvent.click(press('Cancel'))
    await settled(400)
    expect(picker()).toBeNull()
    await openField(container)
    await userEvent.keyboard('{Escape}')
    await settled(400)
    expect(picker()).toBeNull()
    expect(call).not.toHaveBeenCalled()
  })

  it('read only or disabled, a press opens nothing, under the arrow', async () => {
    await page.viewport(412, 915)
    for (const props of [{ isReadOnly: true }, { isDisabled: true }]) {
      const { container, unmount } = paint('TimeField', {
        label: 'Opens',
        defaultValue: '09:00',
        ...props,
      })
      await settled(50)
      const trigger = container.querySelector<HTMLElement>('[data-slot="time-field-trigger"]')!
      expect(css(trigger).cursor).toBe('default')
      await userEvent.click(trigger, { force: true })
      await settled(400)
      expect(picker()).toBeNull()
      unmount()
    }
  })
})

describe('the time picker, Material’s numbers', () => {
  it('standing: 358 by 504, boxes 80 tall, the dial 256, the buttons’ row 40', async () => {
    await page.viewport(412, 915)
    const { container } = paint('TimeField', { label: 'x', defaultValue: '21:30', hourCycle: 12 })
    await settled(50)
    await openField(container)
    const box = picker()!.getBoundingClientRect()
    expect([box.width, box.height]).toEqual([358, 504])
    const hour = slot('time-picker-hour').getBoundingClientRect()
    expect([hour.left - box.left, hour.top - box.top, hour.width, hour.height]).toEqual([
      24, 65, 111, 80,
    ])
    // AM over PM, 52 by 80 in their outline.
    const period = picker()!.querySelector('.time-picker__period')!.getBoundingClientRect()
    expect([period.left - box.left, period.top - box.top, period.width, period.height]).toEqual([
      282, 65, 52, 80,
    ])
    const dial = slot('time-picker-dial').getBoundingClientRect()
    expect([dial.width, dial.left - box.left]).toEqual([256, 51])
    const footer = picker()!.querySelector('.time-picker__footer')!.getBoundingClientRect()
    expect([footer.top - box.top, footer.height]).toEqual([440, 40])
    // The colours: Material's roles in Diba's tokens.
    expect(css(slot('time-picker-hour')).backgroundColor).toBe(token('--accent-soft'))
    expect(css(slot('time-picker-hour')).color).toBe(token('--accent-soft-foreground'))
    expect(css(slot('time-picker-minute')).backgroundColor).toBe(token('--surface-tertiary'))
    expect(css(slot('time-picker-pm')).backgroundColor).toBe(token('--foreground'))
    expect(css(picker()!.querySelector('.time-picker__dial-face')!).fill).toBe(
      token('--surface-tertiary'),
    )
    expect(css(picker()!.querySelector('.time-picker__dial-hand')!).fill).toBe(token('--accent'))
    expect(css(picker()!).borderRadius).toBe('28px')
  })

  it('24-hour: the boxes share the width, 143 each', async () => {
    await page.viewport(412, 915)
    const { container } = paint('TimeField', { label: 'x', defaultValue: '21:30' })
    await settled(50)
    await openField(container)
    const box = picker()!.getBoundingClientRect()
    const hour = slot('time-picker-hour').getBoundingClientRect()
    expect([hour.left - box.left, hour.top - box.top, hour.width]).toEqual([24, 57, 143])
  })

  it('lying: 572 by 378, the dial 244 at the end, AM and PM under the boxes', async () => {
    await page.viewport(1280, 800)
    const { container } = paint('TimeField', { label: 'x', defaultValue: '21:30', hourCycle: 12 })
    await settled(50)
    await openField(container)
    const box = picker()!.getBoundingClientRect()
    expect([box.width, box.height]).toEqual([572, 378])
    const hour = slot('time-picker-hour').getBoundingClientRect()
    expect([hour.left - box.left, hour.top - box.top, hour.width]).toEqual([24, 99.5, 96])
    const period = picker()!.querySelector('.time-picker__period')!.getBoundingClientRect()
    expect([period.top - box.top, period.width, period.height]).toEqual([195.5, 216, 38])
    const dial = slot('time-picker-dial').getBoundingClientRect()
    expect([dial.width, box.right - dial.right]).toEqual([244, 24])
  })

  it('typed: 328 by 264, the fields 96 by 72 with their names under them', async () => {
    await page.viewport(412, 915)
    const { container } = paint('TimeField', { label: 'x', defaultValue: '21:30', hourCycle: 12 })
    await settled(50)
    await openField(container)
    await userEvent.click(picker()!.querySelector('.time-picker__entry')!)
    await settled(100)
    const box = picker()!.getBoundingClientRect()
    expect([box.width, box.height]).toEqual([328, 264])
    const hour = slot('time-picker-hour-input').getBoundingClientRect()
    expect([hour.left - box.left, hour.top - box.top, hour.width, hour.height]).toEqual([
      24, 65, 96, 72,
    ])
    const name = picker()!.querySelector('.time-picker__field-label')!.getBoundingClientRect()
    expect(name.top - box.top).toBe(147)
  })
})

describe('timed dates ask their times in it, as Flutter’s do', () => {
  /** A calendar day in the open popover, by its label. */
  const day = (label: string) =>
    [...document.querySelectorAll<HTMLElement>('[role="button"][aria-label]')].find((c) =>
      c.getAttribute('aria-label')!.includes(label),
    )!

  it('a range: its days, then the first’s time, then the last’s; nothing till both', async () => {
    await page.viewport(1280, 800)
    const { container, call } = paint('DateRangePicker', {
      label: 'Sale',
      granularity: 'minute',
      defaultValue: ['2026-10-23T09:00', '2026-10-30T21:00'],
    })
    await settled(80)
    await userEvent.click(container.querySelector('[data-slot="date-range-picker-trigger"]')!)
    await settled(400)
    await userEvent.click(day('October 2, 2026'))
    await userEvent.click(day('October 5, 2026'))
    await settled(500)
    expect(document.querySelector('[data-slot="date-range-picker-popover"]')).toBeNull()
    expect(picker()!.getAttribute('aria-label')).toBe('Start time')
    expect(slot('time-picker-hour').textContent).toBe('09')
    expect(call).not.toHaveBeenCalled()
    await userEvent.click(press('OK'))
    await settled(500)
    expect(picker()!.getAttribute('aria-label')).toBe('End time')
    expect(slot('time-picker-hour').textContent).toBe('21')
    await tapDial(6, 12, 'inner')
    await userEvent.click(press('OK'))
    await settled(500)
    expect(picker()).toBeNull()
    expect(sent(call)).toEqual({ when: ['2026-10-02T09:00:00', '2026-10-05T18:00:00'] })
  })

  it('a range’s time cancelled changes nothing', async () => {
    await page.viewport(1280, 800)
    const { container, call } = paint('DateRangePicker', {
      label: 'Sale',
      granularity: 'minute',
      defaultValue: ['2026-10-23T09:00', '2026-10-30T21:00'],
    })
    await settled(80)
    await userEvent.click(container.querySelector('[data-slot="date-range-picker-trigger"]')!)
    await settled(400)
    await userEvent.click(day('October 2, 2026'))
    await userEvent.click(day('October 5, 2026'))
    await settled(500)
    await userEvent.click(press('Cancel'))
    await settled(400)
    expect(picker()).toBeNull()
    expect(call).not.toHaveBeenCalled()
  })

  it('a date field at a minute: the day, then its time', async () => {
    await page.viewport(1280, 800)
    const { container, call } = paint('DateField', {
      label: 'When',
      granularity: 'minute',
      defaultValue: '2026-10-23T14:30',
    })
    await settled(80)
    await userEvent.click(container.querySelector('[data-slot="date-picker-trigger"]')!)
    await settled(400)
    await userEvent.click(day('October 26, 2026'))
    await settled(500)
    expect(picker()!.getAttribute('aria-label')).toBe('Pick a time')
    expect(slot('time-picker-hour').textContent).toBe('14')
    await userEvent.click(press('OK'))
    await settled(400)
    expect(sent(call)).toEqual({ when: '2026-10-26T14:30:00' })
  })
})
