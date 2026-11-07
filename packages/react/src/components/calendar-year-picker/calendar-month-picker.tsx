'use client'

import { toCalendar, today } from '@internationalized/date'
import React from 'react'
import { useCalendarMonthPicker } from 'react-aria/useCalendar'
import { useLocale } from 'react-aria-components/I18nProvider'
import { Button as ButtonPrimitive } from 'react-aria-components/Button'

import { calendarYearPickerVariants } from '../../styles/recipes'
import { composeSlotClassName, composeTwRenderProps } from '../../utils/compose'
import { useCalendarOrRangeState } from './use-calendar-state'
import { useYearPicker } from './year-picker-context'

/**
 * Kaladan: the months of the year just picked. Picking a year in the year grid opens this
 * one in its place, over the day grid, in the year grid's own classes and so its look: three
 * across, the chosen month gilt. A month sets the calendar to it and closes the picker; Escape
 * closes it without one.
 */
export function CalendarMonthPickerGrid({ className }: { className?: string }) {
  const {
    calendarGridSlot,
    calendarRef,
    isMonthPickerOpen,
    isYearPickerOpen,
    setIsYearPickerOpen,
  } = useYearPicker()
  const state = useCalendarOrRangeState()
  const { direction } = useLocale()
  const slots = React.useMemo(() => calendarYearPickerVariants(), [])
  const gridRef = React.useRef<HTMLDivElement>(null)
  const isOpen = isYearPickerOpen && isMonthPickerOpen
  const {
    'aria-label': label,
    items,
    onChange,
    value: chosen,
  } = useCalendarMonthPicker({ format: 'long' }, state)
  const value = Number(chosen)
  const now = toCalendar(today(state.timeZone), state.focusedDate.calendar)
  const [active, setActive] = React.useState(value)

  // Over the day grid, as the year grid lies.
  React.useEffect(() => {
    const grid = gridRef.current
    const days = calendarRef.current?.querySelector<HTMLElement>(
      `[data-slot='${calendarGridSlot}']`,
    )
    if (grid && days) {
      grid.style.top = `${days.offsetTop}px`
      grid.style.height = `${days.offsetHeight}px`
    }
  }, [calendarGridSlot, calendarRef, isOpen])

  const focusMonth = React.useCallback((month: number) => {
    gridRef.current?.querySelector<HTMLElement>(`[data-month='${month}']`)?.focus()
  }, [])

  // The chosen month takes focus as the grid opens.
  React.useEffect(() => {
    if (!isOpen) return
    setActive(value)
    const frame = requestAnimationFrame(() => focusMonth(value))
    return () => cancelAnimationFrame(frame)
  }, [focusMonth, isOpen, value])

  const pick = (month: number) => {
    onChange(month)
    setIsYearPickerOpen(false)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) return
    if (event.key === 'Escape') {
      event.preventDefault()
      setIsYearPickerOpen(false)
      return
    }
    // Across a right-to-left grid, the right arrow goes back a month.
    const across = direction === 'rtl' ? -1 : 1
    const step: Record<string, number> = {
      ArrowRight: across,
      ArrowLeft: -across,
      ArrowDown: 3,
      ArrowUp: -3,
    }
    let next = active
    if (event.key in step) next = active + step[event.key]!
    else if (event.key === 'Home') next = 1
    else if (event.key === 'End') next = items.length
    else return
    next = Math.min(Math.max(next, 1), items.length)
    event.preventDefault()
    setActive(next)
    focusMonth(next)
  }

  return (
    <div
      ref={gridRef}
      aria-hidden={!isOpen}
      aria-label={label}
      className={composeSlotClassName(slots.yearGrid, className)}
      data-month-grid
      data-open={isOpen || undefined}
      data-slot="calendar-month-picker-grid"
      role="listbox"
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      {items.map((item) => {
        const isSelected = item.id === value
        return (
          <ButtonPrimitive
            key={item.id}
            aria-label={item.formatted}
            aria-selected={isSelected}
            className={composeTwRenderProps(undefined, slots.yearCell())}
            data-current={(item.id === now.month && item.date.year === now.year) || undefined}
            data-month={item.id}
            data-selected={isSelected || undefined}
            data-slot="calendar-month-picker-cell"
            excludeFromTabOrder={!(isOpen && item.id === active)}
            slot={null}
            onFocus={() => setActive(item.id)}
            onPress={() => pick(item.id)}
          >
            {item.formatted}
          </ButtonPrimitive>
        )
      })}
    </div>
  )
}
