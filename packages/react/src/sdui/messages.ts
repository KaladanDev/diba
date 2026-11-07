/**
 * The words Diba says itself in a tree, in Persian and English.
 *
 * React Aria's own validation messages come from the browser, in the browser's
 * language rather than the admin's, so a tree's fields use these instead. The
 * table is pinned against `packages/schema/fixtures/messages.json`, which the
 * Flutter renderer's table is pinned against too. `{n}` is a number, already
 * formatted in the reader's digits.
 */
export const dibaMessages = {
  required: { fa: 'این فیلد الزامی است.', en: 'This field is required.' },
  requiredMark: { fa: 'الزامی', en: 'required' },
  invalidEmail: { fa: 'نشانی ایمیل درست نیست.', en: 'Enter a valid email address.' },
  invalidUrl: { fa: 'نشانی وب درست نیست.', en: 'Enter a valid web address.' },
  chooseOne: { fa: 'دست‌کم یکی را انتخاب کنید.', en: 'Choose at least one.' },
  tooShort: { fa: 'دست‌کم {n} نویسه بنویسید.', en: 'Use at least {n} characters.' },
  tooLong: { fa: 'بیش از {n} نویسه نمی‌شود.', en: 'Use at most {n} characters.' },
  atLeast: { fa: 'کمتر از {n} نمی‌شود.', en: 'Must be {n} or more.' },
  atMost: { fa: 'بیشتر از {n} نمی‌شود.', en: 'Must be {n} or less.' },
  cancel: { fa: 'انصراف', en: 'Cancel' },
  close: { fa: 'بستن', en: 'Close' },
  loading: { fa: 'در حال بارگذاری', en: 'Loading' },
  clear: { fa: 'پاک کردن', en: 'Clear' },
  search: { fa: 'جستجو', en: 'Search' },
  loadMore: { fa: 'بیشتر', en: 'Load more' },
  increase: { fa: 'افزایش', en: 'Increase' },
  decrease: { fa: 'کاهش', en: 'Decrease' },
  pickDate: { fa: 'انتخاب تاریخ', en: 'Pick a date' },
  pickTime: { fa: 'انتخاب ساعت', en: 'Pick a time' },
  // A date range's two times, asked one after the other.
  startTime: { fa: 'ساعت آغاز', en: 'Start time' },
  endTime: { fa: 'ساعت پایان', en: 'End time' },
  // A snippet's copy button, as the web's Snippet names it.
  copy: { fa: 'رونوشت', en: 'Copy' },
  toman: { fa: 'تومان', en: 'Toman' },
  rial: { fa: 'ریال', en: 'IRR' },
  // An avatar's presence, read after the name, and a group's count.
  online: { fa: 'آنلاین', en: 'Online' },
  away: { fa: 'غایب', en: 'Away' },
  busy: { fa: 'مشغول', en: 'Busy' },
  offline: { fa: 'آفلاین', en: 'Offline' },
  more: { fa: '+{n} نفر', en: '+{n} more' },
  // A trail's landmark, named for a screen reader.
  breadcrumb: { fa: 'مسیر صفحه', en: 'Breadcrumb' },
  // A calendar's month arrows, its heading and its today.
  previous: { fa: 'قبلی', en: 'Previous' },
  next: { fa: 'بعدی', en: 'Next' },
  chooseMonthYear: { fa: '{n}، انتخاب ماه و سال', en: '{n}, choose the month and year' },
  today: { fa: 'امروز', en: 'Today' },
  // A table's selection boxes, as React Aria names them: a row's box is "select" and the row's name.
  select: { fa: 'انتخاب', en: 'Select' },
  selectAll: { fa: 'انتخاب همه', en: 'Select All' },
  // A pager's landmark, named for a screen reader when the tree gives it no label.
  pagination: { fa: 'صفحه‌بندی', en: 'Pagination' },
} as const

export type DibaMessage = keyof typeof dibaMessages

/** Whether a locale reads Persian: `fa`, `fa-IR`, `fa-IR-u-ca-gregory`. */
export const isPersian = (locale: string) => locale.toLowerCase().startsWith('fa')

/** One message in the reader's language, with `{n}` filled in. */
export type Say = (key: DibaMessage, n?: string) => string

export function sayer(locale: string): Say {
  const lang = isPersian(locale) ? 'fa' : 'en'
  return (key, n) => dibaMessages[key][lang].replace('{n}', n ?? '')
}

/** Diba's email and URL rules, shared with the React fields. */
export { EMAIL, WEB_URL } from '../utils/rules'
