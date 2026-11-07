'use client'

import { toCalendar, today } from '@internationalized/date'
import { Button as ButtonPrimitive } from 'react-aria-components/Button'

import { useDibaStrings } from '../../i18n/strings'
import { useCalendarOrRangeState } from '../calendar-year-picker/use-calendar-state'
import { useYearPicker } from '../calendar-year-picker/year-picker-context'

/**
 * Kaladan: today, under the days, in a pill as the title's is. It picks today as a day's
 * circle would, which closes a date picker's calendar, and the years or months if they show;
 * outside the bounds it is at half and does nothing.
 */
export function CalendarTodayButton() {
  const state = useCalendarOrRangeState()
  const { setIsYearPickerOpen } = useYearPicker()
  const t = useDibaStrings()
  const date = toCalendar(today(state.timeZone), state.focusedDate.calendar)
  const isDisabled = state.isDisabled || state.isInvalid(date)
  return (
    <div className="calendar__footer" data-slot="calendar-footer">
      <ButtonPrimitive
        className="calendar__today"
        data-slot="calendar-today"
        isDisabled={isDisabled}
        slot={null}
        onPress={() => {
          setIsYearPickerOpen(false)
          state.setFocusedDate(date)
          state.selectDate(date)
        }}
      >
        {t.today}
      </ButtonPrimitive>
    </div>
  )
}
