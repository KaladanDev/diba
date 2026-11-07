import 'package:flutter/material.dart';
import 'package:shamsi_date/shamsi_date.dart';

import 'format.dart';

/// A Gregorian instant that answers `year`, `month` and `day` in Jalali.
///
/// Material's date picker is generic over `T extends DateTime`, so a calendar
/// delegate cannot hand it a `Jalali`: whatever it returns has to *be* a
/// DateTime. The picker reads `year`, `month` and `day` for its grid and
/// compares with `isBefore`, so this keeps the real instant underneath — the
/// comparisons stay true — and overrides the three fields the grid reads.
///
/// The obvious shortcut, `DateTime(1405, 2, 31)` with Jalali numbers in
/// Gregorian fields, is wrong for a third of the year: Ordibehesht has 31
/// days and February does not, so the date rolls over into March.
class DibaJalaliDateTime extends DateTime {
  DibaJalaliDateTime._(this.jalali, this.gregorian)
    : super(
        gregorian.year,
        gregorian.month,
        gregorian.day,
        gregorian.hour,
        gregorian.minute,
      );

  factory DibaJalaliDateTime.fromJalali(Jalali date) =>
      DibaJalaliDateTime._(date, date.toDateTime());

  factory DibaJalaliDateTime.fromDateTime(DateTime date) {
    if (date is DibaJalaliDateTime) return date;
    return DibaJalaliDateTime._(Jalali.fromDateTime(date), date);
  }

  final Jalali jalali;
  final DateTime gregorian;

  @override
  int get year => jalali.year;

  @override
  int get month => jalali.month;

  @override
  int get day => jalali.day;
}

Jalali _jalaliOf(DateTime date) =>
    date is DibaJalaliDateTime ? date.jalali : Jalali.fromDateTime(date);

const List<String> _monthsFa = [
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
];

const List<String> _monthsEn = [
  'Farvardin',
  'Ordibehesht',
  'Khordad',
  'Tir',
  'Mordad',
  'Shahrivar',
  'Mehr',
  'Aban',
  'Azar',
  'Dey',
  'Bahman',
  'Esfand',
];

/// By [DateTime.weekday], Monday first.
const List<String> _weekdaysFa = [
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
  'شنبه',
  'یکشنبه',
];

const List<String> _weekdaysEn = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/// The Jalali calendar for `showDatePicker(calendarDelegate:)`.
///
/// The arithmetic is `shamsi_date`'s, as in [DibaJalaliCalendar]; that widget
/// could not serve as a delegate itself, because it is a whole grid and a
/// delegate is the arithmetic and the words with Material drawing the grid.
///
/// [persian] picks the words: Persian month names and digits, or the same
/// calendar transliterated for an English page — a passport's Jalali date on
/// an English admin is a real case.
class DibaPersianCalendarDelegate extends CalendarDelegate<DateTime> {
  const DibaPersianCalendarDelegate({this.persian = true});

  final bool persian;

  String _n(int value) => persian ? persianDigits(value) : '$value';
  String _2(int value) {
    final padded = value.toString().padLeft(2, '0');
    return persian
        ? padded.split('').map((d) => persianDigits(int.parse(d))).join()
        : padded;
  }

  String _month(int month) => (persian ? _monthsFa : _monthsEn)[month - 1];
  String _weekday(DateTime date) {
    final g = date is DibaJalaliDateTime ? date.gregorian : date;
    return (persian ? _weekdaysFa : _weekdaysEn)[g.weekday - 1];
  }

  @override
  DateTime now() => DibaJalaliDateTime.fromDateTime(DateTime.now());

  @override
  DateTime dateOnly(DateTime date) {
    final j = _jalaliOf(date);
    return DibaJalaliDateTime.fromJalali(Jalali(j.year, j.month, j.day));
  }

  @override
  int monthDelta(DateTime startDate, DateTime endDate) {
    final a = _jalaliOf(startDate);
    final b = _jalaliOf(endDate);
    return (b.year - a.year) * 12 + b.month - a.month;
  }

  @override
  DateTime addMonthsToMonthDate(DateTime monthDate, int monthsToAdd) {
    final j = _jalaliOf(monthDate);
    final total = j.month - 1 + monthsToAdd;
    final year = j.year + (total / 12).floor();
    final month = total % 12 + 1;
    return DibaJalaliDateTime.fromJalali(Jalali(year, month, 1));
  }

  @override
  DateTime addDaysToDate(DateTime date, int days) {
    final g = date is DibaJalaliDateTime ? date.gregorian : date;
    return DibaJalaliDateTime.fromDateTime(
      DateTime(g.year, g.month, g.day + days),
    );
  }

  @override
  int firstDayOffset(int year, int month, MaterialLocalizations localizations) {
    // As DateUtils.firstDayOffset, on the Gregorian day the month starts on.
    final first = Jalali(year, month, 1).toDateTime();
    final weekdayFromMonday = first.weekday - 1;
    final firstDayOfWeekIndex = (localizations.firstDayOfWeekIndex - 1) % 7;
    return (weekdayFromMonday - firstDayOfWeekIndex) % 7;
  }

  @override
  int getDaysInMonth(int year, int month) => Jalali(year, month, 1).monthLength;

  @override
  DateTime getMonth(int year, int month) =>
      DibaJalaliDateTime.fromJalali(Jalali(year, month, 1));

  @override
  DateTime getDay(int year, int month, int day) =>
      DibaJalaliDateTime.fromJalali(Jalali(year, month, day));

  @override
  String formatYear(int year, MaterialLocalizations localizations) => _n(year);

  @override
  String formatMonthYear(DateTime date, MaterialLocalizations localizations) {
    final j = _jalaliOf(date);
    return '${_month(j.month)} ${_n(j.year)}';
  }

  @override
  String formatMediumDate(DateTime date, MaterialLocalizations localizations) {
    final j = _jalaliOf(date);
    return persian
        ? '${_weekday(date)} ${_n(j.day)} ${_month(j.month)}'
        : '${_weekday(date).substring(0, 3)}, ${_month(j.month)} ${j.day}';
  }

  @override
  String formatShortMonthDay(
    DateTime date,
    MaterialLocalizations localizations,
  ) {
    final j = _jalaliOf(date);
    return persian
        ? '${_n(j.day)} ${_month(j.month)}'
        : '${_month(j.month)} ${j.day}';
  }

  @override
  String formatShortDate(DateTime date, MaterialLocalizations localizations) {
    final j = _jalaliOf(date);
    return persian
        ? '${_n(j.day)} ${_month(j.month)} ${_n(j.year)}'
        : '${_month(j.month)} ${j.day}, ${j.year}';
  }

  @override
  String formatFullDate(DateTime date, MaterialLocalizations localizations) =>
      '${_weekday(date)}${persian ? ' ' : ', '}${formatShortDate(date, localizations)}';

  @override
  String formatCompactDate(DateTime date, MaterialLocalizations localizations) {
    final j = _jalaliOf(date);
    return '${_n(j.year)}/${_2(j.month)}/${_2(j.day)}';
  }

  @override
  DateTime? parseCompactDate(
    String? inputString,
    MaterialLocalizations localizations,
  ) {
    if (inputString == null) return null;
    final parts = latinDigits(inputString).split('/');
    if (parts.length != 3) return null;
    final y = int.tryParse(parts[0]);
    final m = int.tryParse(parts[1]);
    final d = int.tryParse(parts[2]);
    if (y == null || m == null || d == null) return null;
    if (m < 1 || m > 12 || d < 1) return null;
    final date = Jalali(y, m, 1);
    if (d > date.monthLength) return null;
    return DibaJalaliDateTime.fromJalali(Jalali(y, m, d));
  }

  @override
  String dateHelpText(MaterialLocalizations localizations) =>
      persian ? 'سال/ماه/روز' : 'yyyy/mm/dd';
}

/// A date for a human, in the calendar the block asked for: the month's whole
/// name, «October 17, 2026», as the web's resting date reads.
String dibaFormatDate(
  DateTime date, {
  required bool jalali,
  required bool persian,
}) {
  if (jalali) {
    final j = Jalali.fromDateTime(date);
    final month = (persian ? _monthsFa : _monthsEn)[j.month - 1];
    return persian
        ? '${persianDigits(j.day)} $month ${persianDigits(j.year)}'
        : '$month ${j.day}, ${j.year}';
  }
  const en = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const fa = [
    'ژانویه',
    'فوریه',
    'مارس',
    'آوریل',
    'مه',
    'ژوئن',
    'ژوئیه',
    'اوت',
    'سپتامبر',
    'اکتبر',
    'نوامبر',
    'دسامبر',
  ];
  return persian
      ? '${persianDigits(date.day)} ${fa[date.month - 1]} ${persianDigits(date.year)}'
      : '${en[date.month - 1]} ${date.day}, ${date.year}';
}
