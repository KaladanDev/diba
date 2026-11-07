'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button as ButtonPrimitive } from 'react-aria-components/Button'
import { ToggleButton } from 'react-aria-components/ToggleButton'
import { Dialog as DialogPrimitive } from 'react-aria-components/Dialog'
import { useLocale } from 'react-aria-components/I18nProvider'
import { useDibaStrings } from '../../i18n/strings'
import { toLatinDigits } from '../../utils/digits'
import { ModalBackdrop, ModalContainer } from '../modal/modal'
import { TimeDial, type DialMode, type TimeOfDay } from './time-dial'

/**
 * Diba's own: a time picked as Flutter picks one, in Material 3's time picker drawn under
 * Diba's theme, so both platforms ask a time the same way. The time field has Flutter's
 * look. Every number is Material's, measured in Flutter:
 *
 * - **Standing** (a window taller than wide), 358 by 516: the words, the hour and minute in
 *   boxes 80 tall with a «:» between them, AM and PM beside them on a 12-hour clock, the dial
 *   256 across, and the buttons.
 * - **Lying** (wider than tall), 572 by 390: the boxes and AM and PM on the start side, the
 *   dial, 244 across, on the end.
 * - **Typed**, 328 by 264 (296 on a 24-hour clock): two fields for the hour and the minute.
 *
 * It opens on the web's modal backdrop, as Flutter's does on the theme's.
 */

export type { TimeOfDay }

export interface TimePickerDialogProps {
  isOpen: boolean
  /** Closing: with Cancel, Escape or a press outside it, no time picked. */
  onOpenChange: (isOpen: boolean) => void
  /** The time it opens on; now when there is none. */
  value?: TimeOfDay | null
  /** 12 asks for the half of the day too; otherwise the dial takes 24 hours. */
  hourCycle?: 12 | 24
  /** The words over the clock: «انتخاب ساعت», "Pick a time". */
  helpText?: string
  /**
   * The time picked with OK. Its parent closes it, by `isOpen`: so a range can ask its last time
   * as its first closes.
   */
  onConfirm: (time: TimeOfDay) => void
}

type Layout = 'portrait' | 'landscape'

/** The window's size, and whether it stands or lies, as Flutter reads it. */
function useWindow(): { width: number; height: number; layout: Layout } {
  const read = () =>
    typeof window === 'undefined'
      ? { width: 0, height: 0 }
      : { width: window.innerWidth, height: window.innerHeight }
  const [size, setSize] = useState(read)
  useEffect(() => {
    const update = () => setSize(read())
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return { ...size, layout: size.width > size.height ? 'landscape' : 'portrait' }
}

/**
 * How far the picker is drawn down to fit its window, never further than half. Material's sizes
 * are fixed, and the standing picker is 358 across with its padding, where a phone 360 wide has
 * 328 inside the modal's 16 on each side: it ran off the page's end side. The body is zoomed, so
 * it takes the smaller room too; its padding, 24, stays.
 */
function fitOf(width: number, height: number, body: [number, number]): number {
  if (!width || !height) return 1
  const margin = width >= 640 ? 40 : 16
  const room = (side: number, needed: number) => (side - 2 * margin - 2 * 24) / needed
  return Math.max(0.5, Math.min(1, room(width, body[0]), room(height, body[1])))
}

/** The body's own size, its CSS's, before it is fitted. */
function bodySize(entry: 'dial' | 'input', layout: Layout, twelve: boolean): [number, number] {
  const coarse =
    typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches === true
  if (entry === 'input') return [twelve ? 280 : 248, 216]
  return layout === 'landscape' ? [524, coarse ? 342 : 330] : [310, coarse ? 468 : 456]
}

export function TimePickerDialog({
  isOpen,
  onOpenChange,
  value,
  hourCycle = 24,
  helpText,
  onConfirm,
}: TimePickerDialogProps) {
  const t = useDibaStrings()
  const words = helpText ?? t.pickTime
  return (
    <ModalBackdrop isOpen={isOpen} isDismissable onOpenChange={onOpenChange}>
      <ModalContainer placement="center">
        <DialogPrimitive aria-label={words} className="time-picker" data-slot="time-picker">
          {({ close }) => (
            <TimePickerBody
              initial={value ?? now()}
              twelve={hourCycle === 12}
              helpText={words}
              onCancel={close}
              onConfirm={onConfirm}
            />
          )}
        </DialogPrimitive>
      </ModalContainer>
    </ModalBackdrop>
  )
}

function now(): TimeOfDay {
  const date = new Date()
  return { hour: date.getHours(), minute: date.getMinutes() }
}

/** Material Icons' keyboard and clock (Apache 2.0), 24 square, as Flutter draws them. */
const KEYBOARD =
  'M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H4V7h16v10zm-9-9h2v2h-2zm0 3h2v2h-2zM8 8h2v2H8zm0 3h2v2H8zm-3 0h2v2H5zm0-3h2v2H5zm3 6h8v2H8zm6-3h2v2h-2zm0-3h2v2h-2zm3 3h2v2h-2zm0-3h2v2h-2z'
const CLOCK =
  'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z'

interface BodyProps {
  initial: TimeOfDay
  twelve: boolean
  helpText: string
  onCancel: () => void
  onConfirm: (time: TimeOfDay) => void
}

function TimePickerBody({ initial, twelve, helpText, onCancel, onConfirm }: BodyProps) {
  const t = useDibaStrings()
  const { locale } = useLocale()
  const { layout, width, height } = useWindow()
  const persian = locale.split('-')[0] === 'fa'
  const [time, setTime] = useState(initial)
  const [mode, setMode] = useState<DialMode>('hour')
  const [entry, setEntry] = useState<'dial' | 'input'>('dial')
  const fit = fitOf(width, height, bodySize(entry, layout, twelve))
  const [typed, setTyped] = useState({ hour: '', minute: '' })
  const [invalid, setInvalid] = useState(false)
  const minuteField = useRef<HTMLInputElement>(null)

  const plain = useMemo(() => new Intl.NumberFormat(locale, { useGrouping: false }), [locale])
  const padded = useMemo(
    () => new Intl.NumberFormat(locale, { useGrouping: false, minimumIntegerDigits: 2 }),
    [locale],
  )
  /**
   * The hour as the clock writes it, Material's `formatHour`: 1 to 12 on a 12-hour clock; on a
   * 24-hour one two digits in English, «09», and one in Persian, «۹».
   */
  const hourText = (hour: number) =>
    twelve
      ? plain.format(hour % 12 === 0 ? 12 : hour % 12)
      : (persian ? plain : padded).format(hour)
  const minuteText = (minute: number) => padded.format(minute)
  // The dial's: plain numbers, but midnight as the clock writes it.
  const labelText = (value: number, dial: DialMode) =>
    dial === 'minute'
      ? padded.format(value)
      : twelve
        ? plain.format(value === 0 ? 12 : value)
        : value === 0
          ? hourText(0)
          : plain.format(value)

  const pm = time.hour >= 12
  const setPeriod = (afternoon: boolean) =>
    setTime((current) => ({
      ...current,
      hour: (current.hour % 12) + (afternoon ? 12 : 0),
    }))

  /** A typed hour as the clock counts it, 0 to 23; null when it is none. */
  const hourOf = (text: string): number | null => {
    const digits = toLatinDigits(text)
    if (!/^\d{1,2}$/.test(digits)) return null
    const hour = Number(digits)
    if (twelve) return hour >= 1 && hour <= 12 ? (hour % 12) + (pm ? 12 : 0) : null
    return hour <= 23 ? hour : null
  }
  /** What the fields say, as Material reads them: both a number in range, or no time. */
  const read = (): TimeOfDay | null => {
    const hour = hourOf(typed.hour)
    const digits = toLatinDigits(typed.minute)
    const minute = /^\d{1,2}$/.test(digits) ? Number(digits) : Number.NaN
    return hour === null || !(minute <= 59) ? null : { hour, minute }
  }

  // Typed, as Flutter's on the web: the fields open holding the time, in full.
  const toggleEntry = () => {
    if (entry === 'input') {
      const picked = read()
      if (picked) setTime(picked)
      setEntry('dial')
    } else {
      setTyped({ hour: hourText(time.hour), minute: minuteText(time.minute) })
      setInvalid(false)
      setEntry('input')
    }
  }

  const confirm = () => {
    if (entry === 'dial') return onConfirm(time)
    const picked = read()
    if (!picked) return setInvalid(true)
    onConfirm(picked)
  }

  const period = twelve ? (
    <div className="time-picker__period-wrap">
      <div className="time-picker__period">
        {[false, true].map((afternoon) => (
          <ToggleButton
            key={String(afternoon)}
            className="time-picker__period-half"
            data-slot={afternoon ? 'time-picker-pm' : 'time-picker-am'}
            isSelected={pm === afternoon}
            onChange={() => setPeriod(afternoon)}
          >
            {afternoon ? t.pm : t.am}
          </ToggleButton>
        ))}
      </div>
    </div>
  ) : null

  const field = (part: 'hour' | 'minute') => (
    <input
      ref={part === 'minute' ? minuteField : undefined}
      className="time-picker__input"
      data-slot={`time-picker-${part}-input`}
      data-invalid={invalid || undefined}
      aria-label={part === 'hour' ? t.hour : t.minute}
      aria-invalid={invalid || undefined}
      inputMode="numeric"
      maxLength={2}
      value={typed[part]}
      // Flutter's on the web: its words selected, to be typed over.
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => {
        const text = event.target.value
        setInvalid(false)
        setTyped((current) => ({ ...current, [part]: text }))
        // Two digits of a real hour: on to the minute, as Material's.
        if (part === 'hour' && text.length === 2 && hourOf(text) !== null) {
          minuteField.current?.focus()
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') confirm()
      }}
    />
  )

  const box = (part: DialMode) => (
    <ButtonPrimitive
      className="time-picker__box"
      data-slot={`time-picker-${part}`}
      data-selected={mode === part || undefined}
      aria-label={`${part === 'hour' ? t.selectHours : t.selectMinutes}, ${
        part === 'hour' ? hourText(time.hour) : minuteText(time.minute)
      }`}
      onPress={() => setMode(part)}
    >
      {part === 'hour' ? hourText(time.hour) : minuteText(time.minute)}
    </ButtonPrimitive>
  )

  const content =
    entry === 'input' ? (
      <div className="time-picker__main">
        <div className="time-picker__help">{helpText}</div>
        <div className="time-picker__header">
          <div className="time-picker__clock">
            <div className="time-picker__column">
              {field('hour')}
              {invalid ? null : <span className="time-picker__field-label">{t.hour}</span>}
            </div>
            <span className="time-picker__separator" aria-hidden="true">
              :
            </span>
            <div className="time-picker__column">
              {field('minute')}
              {invalid ? null : <span className="time-picker__field-label">{t.minute}</span>}
            </div>
          </div>
          {period}
        </div>
        {invalid ? (
          <span className="time-picker__error" role="alert">
            {t.invalidTime}
          </span>
        ) : null}
      </div>
    ) : (
      <div className="time-picker__main">
        <div className="time-picker__side">
          <div className="time-picker__help">{helpText}</div>
          <div className="time-picker__header">
            {/* The hour stays left of the minute whatever the page's direction (its CSS). */}
            <div className="time-picker__clock">
              {box('hour')}
              <span className="time-picker__separator" aria-hidden="true">
                :
              </span>
              {box('minute')}
            </div>
            {period}
          </div>
        </div>
        <div className="time-picker__dial-area">
          <TimeDial
            time={time}
            mode={mode}
            twentyFour={!twelve}
            size={layout === 'landscape' ? 244 : 256}
            labelText={labelText}
            label={mode === 'hour' ? t.selectHours : t.selectMinutes}
            valueText={`${hourText(time.hour)}:${minuteText(time.minute)}${
              twelve ? ` ${pm ? t.pm : t.am}` : ''
            }`}
            onChange={setTime}
            onHourPicked={() => setMode('minute')}
          />
        </div>
      </div>
    )

  // One footer for both, so the switch between them keeps its focus.
  return (
    <div
      className="time-picker__body"
      data-entry={entry}
      data-layout={entry === 'dial' ? layout : undefined}
      data-cycle={twelve ? 12 : 24}
      style={fit < 1 ? { zoom: fit } : undefined}
    >
      {content}
      <div className="time-picker__footer">
        <ButtonPrimitive
          className="time-picker__entry"
          aria-label={entry === 'dial' ? t.toTimeInput : t.toTimeDial}
          onPress={toggleEntry}
        >
          <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden="true">
            <path d={entry === 'dial' ? KEYBOARD : CLOCK} fill="currentColor" />
          </svg>
        </ButtonPrimitive>
        <span className="time-picker__actions">
          <ButtonPrimitive className="time-picker__action" onPress={onCancel}>
            {t.cancel}
          </ButtonPrimitive>
          <ButtonPrimitive className="time-picker__action" onPress={confirm}>
            {t.ok}
          </ButtonPrimitive>
        </span>
      </div>
    </div>
  )
}
