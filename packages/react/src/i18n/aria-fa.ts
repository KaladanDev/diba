/**
 * Persian for every string React Aria writes itself.
 *
 * React Aria ships 33 locales and Persian is not one of them, so on a Persian
 * page the calendar's "Previous", the number field's "Number field", the
 * table's sort announcements and every date segment's name all come out in
 * English. `DibaStrings` never covered these — it only holds the strings Diba
 * writes — so a Persian-first library was shipping an English screen reader.
 *
 * The mechanism is React Aria's own: `LocalizedStringDictionary` looks for a
 * global dictionary before falling back to the bundled one, which is how their
 * server-rendering provider injects strings. Two things follow from that, and
 * both are the reason `installPersianAriaStrings` is a deliberate call rather
 * than an import side-effect:
 *
 * It is global and single-locale. The dictionary is keyed by one locale, so an
 * English subtree inside a Persian app would read these too. For a
 * Persian-first product that is the right trade; for a genuinely bilingual one
 * it is not, and `<DibaProvider ariaStrings={false}>` turns it off.
 *
 * And it is all-or-nothing. React Aria throws for any package missing from the
 * global map, so every package it ships has to be here — including `dnd` and
 * `color`, which nothing in Diba uses. `aria-fa.test.ts` compares these keys
 * against React Aria's own English files, so an upgrade that adds a string
 * fails a test instead of throwing at a reader.
 */

type Formatter = {
  number: (value: number) => string
  plural: (count: number, options: Record<string, string | (() => string)>) => string
  select: (options: Record<string, string | (() => string)>, value: string) => string
}

/** What React Aria hands a message: a bag of substitutions, and a formatter. */
type Args = Record<string, string | number>
type Message = string | ((args: Args, formatter: Formatter) => string)

/**
 * Persian does not inflect a noun for number — «۱ مورد» and «۵ مورد» take the
 * same word — so every plural here gives `one` and `other` the same wording
 * and differs only in the count.
 */
const strings: Record<string, Record<string, Message>> = {
  '@react-aria/calendar': {
    previous: 'قبلی',
    next: 'بعدی',
    selectedDateDescription: (args: Args) => `تاریخ انتخاب‌شده: ${args.date}`,
    selectedRangeDescription: (args: Args) => `بازهٔ انتخاب‌شده: ${args.dateRange}`,
    todayDate: (args: Args) => `امروز، ${args.date}`,
    todayDateSelected: (args: Args) => `امروز، ${args.date} انتخاب شد`,
    dateSelected: (args: Args) => `${args.date} انتخاب شد`,
    startRangeSelectionPrompt: 'برای شروع انتخاب بازهٔ تاریخ کلیک کنید',
    finishRangeSelectionPrompt: 'برای پایان انتخاب بازهٔ تاریخ کلیک کنید',
    minimumDate: 'نخستین تاریخ در دسترس',
    maximumDate: 'آخرین تاریخ در دسترس',
    dateRange: (args: Args) => {
      const a = args
      return `از ${a.startDate} تا ${a.endDate}`
    },
  },

  '@react-aria/datepicker': {
    era: 'دوره',
    year: 'سال',
    month: 'ماه',
    day: 'روز',
    hour: 'ساعت',
    minute: 'دقیقه',
    second: 'ثانیه',
    dayPeriod: 'قبل/بعد از ظهر',
    calendar: 'تقویم',
    startDate: 'تاریخ شروع',
    endDate: 'تاریخ پایان',
    weekday: 'روز هفته',
    timeZoneName: 'منطقهٔ زمانی',
    selectedDateDescription: (args: Args) => `تاریخ انتخاب‌شده: ${args.date}`,
    selectedRangeDescription: (args: Args) => {
      const a = args
      return `بازهٔ انتخاب‌شده: از ${a.startDate} تا ${a.endDate}`
    },
    selectedTimeDescription: (args: Args) => `زمان انتخاب‌شده: ${args.time}`,
  },

  '@react-aria/numberfield': {
    decrease: (args: Args) => `کاهش ${args.fieldLabel}`,
    increase: (args: Args) => `افزایش ${args.fieldLabel}`,
    numberField: 'فیلد عددی',
  },

  '@react-aria/table': {
    select: 'انتخاب',
    selectAll: 'انتخاب همه',
    sortable: 'ستون قابل مرتب‌سازی',
    ascending: 'صعودی',
    descending: 'نزولی',
    ascendingSort: (args: Args) => `مرتب‌شده بر اساس ستون ${args.columnName} به ترتیب صعودی`,
    descendingSort: (args: Args) => `مرتب‌شده بر اساس ستون ${args.columnName} به ترتیب نزولی`,
    columnSize: (args: Args) => `${args.value} پیکسل`,
    resizerDescription: 'برای شروع تغییر اندازه، Enter را بزنید',
    expand: 'باز کردن',
    collapse: 'بستن',
  },

  '@react-aria/grid': {
    deselectedItem: (args: Args) => `${args.item} انتخاب نشد.`,
    select: 'انتخاب',
    selectedCount: (args: Args, formatter: Formatter) => {
      const a = args
      return `${formatter.plural(Number(a.count), {
        '=0': 'هیچ موردی انتخاب نشده',
        one: () => `${formatter.number(Number(a.count))} مورد انتخاب شد`,
        other: () => `${formatter.number(Number(a.count))} مورد انتخاب شد`,
      })}.`
    },
    selectedAll: 'همهٔ موارد انتخاب شدند.',
    selectedItem: (args: Args) => `${args.item} انتخاب شد.`,
    longPressToSelect: 'برای ورود به حالت انتخاب، لمس طولانی کنید.',
  },

  '@react-aria/combobox': {
    focusAnnouncement: (args: Args, formatter: Formatter) => {
      const a = args
      const group = formatter.select(
        {
          true: () =>
            `وارد گروه ${a.groupTitle} شدید، با ${formatter.plural(Number(a.groupCount), {
              one: () => `${formatter.number(Number(a.groupCount))} گزینه`,
              other: () => `${formatter.number(Number(a.groupCount))} گزینه`,
            })}. `,
          other: '',
        },
        String(a.isGroupChange),
      )
      const selected = formatter.select({ true: '، انتخاب شد', other: '' }, String(a.isSelected))
      return `${group}${a.optionText}${selected}`
    },
    countAnnouncement: (args: Args, formatter: Formatter) => {
      const a = args
      return `${formatter.plural(Number(a.optionCount), {
        one: () => `${formatter.number(Number(a.optionCount))} گزینه`,
        other: () => `${formatter.number(Number(a.optionCount))} گزینه`,
      })} در دسترس است.`
    },
    selectedAnnouncement: (args: Args) => `${args.optionText}، انتخاب شد`,
    buttonLabel: 'نمایش پیشنهادها',
    listboxLabel: 'پیشنهادها',
  },

  /**
   * React Aria Components has strings of its own, on top of the `@react-aria/*`
   * packages. Missing them threw `Strings for package "react-aria-components"
   * were not included` the moment a Select rendered — the all-or-nothing rule
   * biting exactly as advertised.
   */
  'react-aria-components': {
    selectPlaceholder: 'یک مورد انتخاب کنید',
    tableResizer: 'تغییر اندازه',
    dropzoneLabel: 'ناحیهٔ رها کردن',
    colorSwatchPicker: 'نمونه‌های رنگ',
  },

  '@react-aria/autocomplete': { collectionLabel: 'پیشنهادها' },
  '@react-aria/breadcrumbs': { breadcrumbs: 'مسیر صفحه' },
  '@react-aria/menu': {
    longPressMessage: 'برای باز کردن منو، لمس طولانی کنید یا Alt + ArrowDown را بزنید',
  },
  '@react-aria/previewtrigger': {
    longPressMessage: 'برای باز کردن پیش‌نمایش، لمس طولانی کنید',
  },
  /**
   * «رد کردن» and not «بستن», which is the more natural word, because Diba's
   * own close button already uses «بستن». React Aria injects a hidden dismiss
   * button into every overlay for VoiceOver, so the natural translation gave a
   * dialog two buttons with the same name — which is precisely the confusion
   * the hidden button exists to prevent. English keeps them apart as
   * "Dismiss" and "Close"; so does this.
   */
  '@react-aria/overlays': { dismiss: 'رد کردن' },
  '@react-aria/spinbutton': { Empty: 'خالی' },
  '@react-aria/steplist': { steplist: 'فهرست مراحل' },
  '@react-aria/searchfield': { 'Clear search': 'پاک کردن جستجو' },
  '@react-aria/tag': {
    removeDescription: 'برای حذف برچسب، Delete را بزنید.',
    removeButtonLabel: 'حذف',
  },
  '@react-aria/tree': { expand: 'باز کردن', collapse: 'بستن' },

  '@react-aria/toast': {
    close: 'بستن',
    notifications: (args: Args, formatter: Formatter) => {
      const a = args
      return `${formatter.plural(Number(a.count), {
        one: () => `${formatter.number(Number(a.count))} اعلان`,
        other: () => `${formatter.number(Number(a.count))} اعلان`,
      })}.`
    },
  },

  '@react-aria/color': {
    colorPicker: 'انتخابگر رنگ',
    twoDimensionalSlider: 'اسلایدر دوبعدی',
    colorNameAndValue: (args: Args) => {
      const a = args
      return `${a.name}: ${a.value}`
    },
    colorInputLabel: (args: Args) => {
      const a = args
      return `${a.label}، ${a.channelLabel}`
    },
    colorSwatch: 'نمونهٔ رنگ',
    transparent: 'شفاف',
  },

  /**
   * React Stately keeps strings of its own: a colour's spoken name, which a swatch picker
   * reads out, and a date field's own range messages. A Persian name puts the hue first and its
   * qualities after, as Persian does: «آبی پررنگ تیره».
   */
  '@react-stately/color': {
    hue: 'فام',
    saturation: 'اشباع',
    lightness: 'روشنایی',
    brightness: 'درخشندگی',
    red: 'قرمز',
    green: 'سبز',
    blue: 'آبی',
    alpha: 'آلفا',
    colorName: (args: Args) => `${args.hue} ${args.chroma} ${args.lightness}`,
    transparentColorName: (args: Args) =>
      `${args.hue} ${args.chroma} ${args.lightness}، ${args.percentTransparent} شفاف`,
    'very dark': 'خیلی تیره',
    dark: 'تیره',
    light: 'روشن',
    'very light': 'خیلی روشن',
    pale: 'کم‌رنگ',
    grayish: 'خاکستری‌گون',
    vibrant: 'پررنگ',
    black: 'سیاه',
    white: 'سفید',
    gray: 'خاکستری',
    pink: 'صورتی',
    'pink red': 'قرمز صورتی',
    'red orange': 'نارنجی قرمز',
    brown: 'قهوه‌ای',
    orange: 'نارنجی',
    'orange yellow': 'زرد نارنجی',
    'brown yellow': 'زرد قهوه‌ای',
    yellow: 'زرد',
    'yellow green': 'سبز زرد',
    'green cyan': 'فیروزه‌ای سبز',
    cyan: 'فیروزه‌ای',
    'cyan blue': 'آبی فیروزه‌ای',
    'blue purple': 'بنفش آبی',
    purple: 'بنفش',
    'purple magenta': 'سرخابی بنفش',
    magenta: 'سرخابی',
    'magenta pink': 'صورتی سرخابی',
  },

  '@react-stately/datepicker': {
    rangeUnderflow: (args: Args) => `باید ${args.minValue} یا پس از آن باشد.`,
    rangeOverflow: (args: Args) => `باید ${args.maxValue} یا پیش از آن باشد.`,
    rangeReversed: 'تاریخ آغاز باید پیش از تاریخ پایان باشد.',
    unavailableDate: 'این تاریخ در دسترس نیست.',
  },

  /** Nothing in Diba drags anything, but the map has to be complete or React
      Aria throws for the package it cannot find. */
  '@react-aria/dnd': {
    dragItem: (args: Args) => `کشیدن ${args.itemText}`,
    dragSelectedItems: (args: Args, formatter: Formatter) => {
      const a = args
      return `کشیدن ${formatter.plural(Number(a.count), {
        one: () => `${formatter.number(Number(a.count))} مورد انتخاب‌شده`,
        other: () => `${formatter.number(Number(a.count))} مورد انتخاب‌شده`,
      })}`
    },
    dragDescriptionKeyboard: 'برای شروع کشیدن، Enter را بزنید.',
    dragDescriptionKeyboardAlt: 'برای شروع کشیدن، Alt + Enter را بزنید.',
    dragDescriptionTouch: 'برای شروع کشیدن، دو بار ضربه بزنید.',
    dragDescriptionVirtual: 'برای شروع کشیدن کلیک کنید.',
    dragDescriptionLongPress: 'برای شروع کشیدن، لمس طولانی کنید.',
    dragSelectedKeyboard: (args: Args, formatter: Formatter) => {
      const a = args
      return `برای کشیدن ${formatter.plural(Number(a.count), {
        one: () => `${formatter.number(Number(a.count))} مورد انتخاب‌شده`,
        other: () => `${formatter.number(Number(a.count))} مورد انتخاب‌شده`,
      })}، Enter را بزنید.`
    },
    dragSelectedKeyboardAlt: (args: Args, formatter: Formatter) => {
      const a = args
      return `برای کشیدن ${formatter.plural(Number(a.count), {
        one: () => `${formatter.number(Number(a.count))} مورد انتخاب‌شده`,
        other: () => `${formatter.number(Number(a.count))} مورد انتخاب‌شده`,
      })}، Alt + Enter را بزنید.`
    },
    dragSelectedLongPress: (args: Args, formatter: Formatter) => {
      const a = args
      return `برای کشیدن ${formatter.plural(Number(a.count), {
        one: () => `${formatter.number(Number(a.count))} مورد انتخاب‌شده`,
        other: () => `${formatter.number(Number(a.count))} مورد انتخاب‌شده`,
      })}، لمس طولانی کنید.`
    },
    dragStartedKeyboard:
      'کشیدن آغاز شد. با Tab به مقصد بروید، سپس Enter را برای رها کردن یا Escape را برای لغو بزنید.',
    dragStartedTouch: 'کشیدن آغاز شد. به مقصد بروید، سپس دو بار ضربه بزنید تا رها شود.',
    dragStartedVirtual: 'کشیدن آغاز شد. به مقصد بروید، سپس کلیک کنید یا Enter را بزنید.',
    endDragKeyboard: 'در حال کشیدن. برای لغو، Enter را بزنید.',
    endDragTouch: 'در حال کشیدن. برای لغو، دو بار ضربه بزنید.',
    endDragVirtual: 'در حال کشیدن. برای لغو کلیک کنید.',
    dropDescriptionKeyboard: 'برای رها کردن Enter و برای لغو Escape را بزنید.',
    dropDescriptionTouch: 'برای رها کردن دو بار ضربه بزنید.',
    dropDescriptionVirtual: 'برای رها کردن کلیک کنید.',
    dropCanceled: 'رها کردن لغو شد.',
    dropComplete: 'رها کردن انجام شد.',
    dropIndicator: 'نشانگر رها کردن',
    dropOnRoot: 'رها کردن روی',
    dropOnItem: (args: Args) => `رها کردن روی ${args.itemText}`,
    insertBefore: (args: Args) => `درج پیش از ${args.itemText}`,
    insertBetween: (args: Args) => {
      const a = args
      return `درج میان ${a.beforeItemText} و ${a.afterItemText}`
    },
    insertAfter: (args: Args) => `درج پس از ${args.itemText}`,
  },
}

export const ariaStringsFa = strings

const LOCALE = Symbol.for('react-aria.i18n.locale')
const STRINGS = Symbol.for('react-aria.i18n.strings')

let installed = false

/**
 * Hand React Aria the Persian strings.
 *
 * Idempotent, and a no-op on the server — the globals live on `window`, which
 * is where React Aria looks for them.
 *
 * Must run before the first React Aria component renders: the dictionary is
 * built once, on first read, and cached inside `@internationalized/string` for
 * the life of the page. `DibaProvider` calls this during its own render for a
 * Persian locale, which is early enough.
 */
export function installPersianAriaStrings(locale = 'fa-IR'): void {
  if (installed || typeof window === 'undefined') return
  installed = true

  const w = window as unknown as Record<symbol, unknown>
  w[LOCALE] = locale
  w[STRINGS] = strings
}

/** Test seam: forget that the strings were installed. */
export function resetPersianAriaStrings(): void {
  installed = false
}
