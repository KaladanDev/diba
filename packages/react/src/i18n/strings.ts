import { createContext, use, useMemo } from 'react'
import { useLocale } from 'react-aria-components'

/**
 * Every string Diba can put on screen or hand to a screen reader.
 *
 * Components must never inline a literal. A hardcoded label is invisible in
 * review — it renders fine for the person who wrote it — and only surfaces when
 * someone on the other locale hits it, or never, because it went to an assistive
 * technology nobody on the team is listening to.
 */
export interface DibaStrings {
  /** Dismiss a dialog, toast or panel. */
  close: string
  /** Accessible name of a tag's remove button; React Aria adds the tag's own name after it. */
  removeTag: string
  /** Announced by an indeterminate spinner. */
  loading: string
  /** Accessible name of a field's clear button. */
  clear: string
  /** Accessible name of the pagination nav. */
  pagination: string
  /** Accessible name of a snippet's copy button. */
  copy: string
  /** Announced, not just drawn, once a snippet has been copied. */
  copied: string
  /** Announced when the browser refuses the clipboard. */
  copyFailed: string
  /**
   * A zoomable picture's button, which opens it larger: named after what it shows, or alone for
   * a picture with no words.
   */
  enlarge: (what: string) => string
  /** Accessible name of a calendar's heading, which opens its years and months. */
  chooseMonthYear: (current: string) => string
  /** A calendar's button that picks today. */
  today: string
  /**
   * What a date or time field says of a value outside its limits or on an unavailable day, the
   * limit named as the field shows a date at rest.
   */
  notBefore: (date: string) => string
  notAfter: (date: string) => string
  dateUnavailable: string
  /** What a range says when its end is before its start. */
  rangeReversed: string
  /**
   * What a text, search or number field says of a value its own checks refuse, in a tree's
   * fields' words: nothing written in a required field, too few or too many letters (the count in
   * the reader's digits), an address that is not one, or text not in the form its pattern asks.
   */
  required: string
  tooShort: (count: string) => string
  tooLong: (count: string) => string
  invalidEmail: string
  invalidUrl: string
  patternMismatch: string
  /** What a required checkbox group says with none on. */
  chooseOne: string
  /** A range slider's two thumbs, named after the slider's label. */
  minimum: string
  maximum: string
  /**
   * The time picker's, Material's own words in both languages: its title, the fields'
   * names, its buttons, the halves of the day, the switch between dialling and typing, and what
   * it says of a time it cannot read.
   */
  pickTime: string
  hour: string
  minute: string
  cancel: string
  ok: string
  am: string
  pm: string
  toTimeInput: string
  toTimeDial: string
  invalidTime: string
  selectHours: string
  selectMinutes: string
}

const en: DibaStrings = {
  close: 'Close',
  removeTag: 'Remove tag',
  loading: 'Loading',
  clear: 'Clear',
  pagination: 'Pagination',
  copy: 'Copy',
  copied: 'Copied',
  copyFailed: 'Could not copy',
  enlarge: (what) => (what ? `Enlarge ${what}` : 'Enlarge'),
  chooseMonthYear: (current) => `${current}, choose the month and year`,
  today: 'Today',
  notBefore: (date) => `Must be ${date} or later.`,
  notAfter: (date) => `Must be ${date} or earlier.`,
  dateUnavailable: 'This date is not available.',
  rangeReversed: 'The start must be before the end.',
  required: 'This field is required.',
  tooShort: (count) => `Use at least ${count} characters.`,
  tooLong: (count) => `Use at most ${count} characters.`,
  invalidEmail: 'Enter a valid email address.',
  invalidUrl: 'Enter a valid web address.',
  patternMismatch: 'Use the format asked for.',
  chooseOne: 'Choose at least one.',
  minimum: 'Minimum',
  maximum: 'Maximum',
  pickTime: 'Pick a time',
  hour: 'Hour',
  minute: 'Minute',
  cancel: 'Cancel',
  ok: 'OK',
  am: 'AM',
  pm: 'PM',
  toTimeInput: 'Switch to text input mode',
  toTimeDial: 'Switch to dial picker mode',
  invalidTime: 'Enter a valid time',
  selectHours: 'Select hours',
  selectMinutes: 'Select minutes',
}

const fa: DibaStrings = {
  close: 'بستن',
  removeTag: 'حذف برچسب',
  loading: 'در حال بارگذاری',
  clear: 'پاک کردن',
  pagination: 'صفحه‌بندی',
  copy: 'رونوشت',
  copied: 'رونوشت شد',
  copyFailed: 'رونوشت انجام نشد',
  enlarge: (what) => (what ? `بزرگ‌نمایی ${what}` : 'بزرگ‌نمایی'),
  chooseMonthYear: (current) => `${current}، انتخاب ماه و سال`,
  today: 'امروز',
  notBefore: (date) => `باید ${date} یا پس از آن باشد.`,
  notAfter: (date) => `باید ${date} یا پیش از آن باشد.`,
  dateUnavailable: 'این تاریخ در دسترس نیست.',
  rangeReversed: 'تاریخ آغاز باید پیش از تاریخ پایان باشد.',
  required: 'این فیلد الزامی است.',
  tooShort: (count) => `دست‌کم ${count} نویسه بنویسید.`,
  tooLong: (count) => `بیش از ${count} نویسه نمی‌شود.`,
  invalidEmail: 'نشانی ایمیل درست نیست.',
  invalidUrl: 'نشانی وب درست نیست.',
  patternMismatch: 'به قالب خواسته‌شده بنویسید.',
  chooseOne: 'دست‌کم یکی را انتخاب کنید.',
  minimum: 'کمترین',
  maximum: 'بیشترین',
  pickTime: 'انتخاب ساعت',
  hour: 'ساعت',
  minute: 'دقیقه',
  cancel: 'لغو',
  ok: 'تأیید',
  am: 'ق.ظ.',
  pm: 'ب.ظ.',
  toTimeInput: 'رفتن به حالت ورودی نوشتاری',
  toTimeDial: 'رفتن به حالت انتخاب‌گر صفحه ساعت',
  invalidTime: 'زمان معتبری وارد کنید',
  selectHours: 'انتخاب ساعت',
  selectMinutes: 'انتخاب دقیقه',
}

export const dibaStrings = { en, fa } as const

/** Merchant overrides, supplied through `<DibaProvider strings={…}>`. */
export const StringsContext = createContext<Partial<DibaStrings> | null>(null)

/**
 * The strings for the active locale, with any merchant overrides applied.
 *
 * The locale comes from React Aria's `useLocale`, which DibaProvider feeds via
 * `I18nProvider` — so this follows the same source of truth as date, number and
 * collation behaviour, rather than a second parallel notion of "current
 * language". Outside a provider it falls back to the browser's locale.
 */
export function useDibaStrings(): DibaStrings {
  const { locale } = useLocale()
  const overrides = use(StringsContext)
  return useMemo(() => {
    const base = locale.toLowerCase().startsWith('fa') ? fa : en
    return overrides ? { ...base, ...overrides } : base
  }, [locale, overrides])
}
