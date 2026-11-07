import 'package:flutter/widgets.dart';

/// Whether [context] is drawn for a Persian reader.
///
/// The locale decides when there is one. Without one, Diba's own default is
/// Persian, so a right-to-left page is read as Persian and anything else as
/// English.
bool dibaIsPersian(BuildContext context) {
  final locale = Localizations.maybeLocaleOf(context);
  if (locale != null) return locale.languageCode == 'fa';
  return Directionality.maybeOf(context) != TextDirection.ltr;
}

/// Diba's message table: the words Diba says itself, rather than ones a tree
/// sent, in Persian and English.
///
/// One table for both platforms. React Aria's own validation
/// messages come from the browser, in the browser's language rather than the
/// admin's, so the web replaces them with these. The table is pinned against
/// `packages/schema/fixtures/messages.json`, which both platforms test
/// against. `{n}` is a number, already formatted in the reader's digits.
const Map<String, Map<String, String>> dibaMessages = {
  // ---- validation ---------------------------------------------------------
  'required': {'fa': 'این فیلد الزامی است.', 'en': 'This field is required.'},
  'requiredMark': {'fa': 'الزامی', 'en': 'required'},
  'invalidEmail': {
    'fa': 'نشانی ایمیل درست نیست.',
    'en': 'Enter a valid email address.',
  },
  'invalidUrl': {
    'fa': 'نشانی وب درست نیست.',
    'en': 'Enter a valid web address.',
  },
  'chooseOne': {
    'fa': 'دست‌کم یکی را انتخاب کنید.',
    'en': 'Choose at least one.',
  },
  'tooShort': {
    'fa': 'دست‌کم {n} نویسه بنویسید.',
    'en': 'Use at least {n} characters.',
  },
  'tooLong': {
    'fa': 'بیش از {n} نویسه نمی‌شود.',
    'en': 'Use at most {n} characters.',
  },
  'atLeast': {'fa': 'کمتر از {n} نمی‌شود.', 'en': 'Must be {n} or more.'},
  'atMost': {'fa': 'بیشتر از {n} نمی‌شود.', 'en': 'Must be {n} or less.'},
  // ---- Diba's own words ---------------------------------------------------
  'cancel': {'fa': 'انصراف', 'en': 'Cancel'},
  'close': {'fa': 'بستن', 'en': 'Close'},
  'loading': {'fa': 'در حال بارگذاری', 'en': 'Loading'},
  'clear': {'fa': 'پاک کردن', 'en': 'Clear'},
  'search': {'fa': 'جستجو', 'en': 'Search'},
  'loadMore': {'fa': 'بیشتر', 'en': 'Load more'},
  'increase': {'fa': 'افزایش', 'en': 'Increase'},
  'decrease': {'fa': 'کاهش', 'en': 'Decrease'},
  'pickDate': {'fa': 'انتخاب تاریخ', 'en': 'Pick a date'},
  'pickTime': {'fa': 'انتخاب ساعت', 'en': 'Pick a time'},
  // A date range's two times, asked one after the other.
  'startTime': {'fa': 'ساعت آغاز', 'en': 'Start time'},
  'endTime': {'fa': 'ساعت پایان', 'en': 'End time'},
  // A snippet's copy button, as the web's Snippet names it.
  'copy': {'fa': 'رونوشت', 'en': 'Copy'},
  'toman': {'fa': 'تومان', 'en': 'Toman'},
  'rial': {'fa': 'ریال', 'en': 'IRR'},
  // An avatar's presence, read after the name, and a group's count.
  'online': {'fa': 'آنلاین', 'en': 'Online'},
  'away': {'fa': 'غایب', 'en': 'Away'},
  'busy': {'fa': 'مشغول', 'en': 'Busy'},
  'offline': {'fa': 'آفلاین', 'en': 'Offline'},
  'more': {'fa': '+{n} نفر', 'en': '+{n} more'},
  'breadcrumb': {'fa': 'مسیر صفحه', 'en': 'Breadcrumb'},
  // A calendar's month arrows, its heading and its today.
  'previous': {'fa': 'قبلی', 'en': 'Previous'},
  'next': {'fa': 'بعدی', 'en': 'Next'},
  'chooseMonthYear': {
    'fa': '{n}، انتخاب ماه و سال',
    'en': '{n}, choose the month and year',
  },
  'today': {'fa': 'امروز', 'en': 'Today'},
  // A table's selection boxes, as React Aria names them: a row's box is
  // "select" and the row's name.
  'select': {'fa': 'انتخاب', 'en': 'Select'},
  'selectAll': {'fa': 'انتخاب همه', 'en': 'Select All'},
  // A pager's landmark, named for a screen reader when the tree gives it no
  // label.
  'pagination': {'fa': 'صفحه‌بندی', 'en': 'Pagination'},
};

/// [dibaMessages] in one language.
class DibaStrings {
  const DibaStrings._(this.persian);

  final bool persian;

  static const DibaStrings fa = DibaStrings._(true);
  static const DibaStrings en = DibaStrings._(false);

  static DibaStrings of(BuildContext context) =>
      dibaIsPersian(context) ? fa : en;

  static DibaStrings forPersian(bool persian) => persian ? fa : en;

  /// The message for [key], with `{n}` filled in when there is one.
  String message(String key, [String? n]) {
    final text = dibaMessages[key]![persian ? 'fa' : 'en']!;
    return n == null ? text : text.replaceAll('{n}', n);
  }

  String get cancel => message('cancel');
  String get close => message('close');
  String get loading => message('loading');
  String get clear => message('clear');
  String get search => message('search');
  String get loadMore => message('loadMore');
  String get increase => message('increase');
  String get decrease => message('decrease');
  String get pickDate => message('pickDate');
  String get pickTime => message('pickTime');
  String get toman => message('toman');

  /// The reason a required field failed.
  String get required => message('required');

  /// How a screen reader says the asterisk.
  String get requiredMark => message('requiredMark');
  String get invalidEmail => message('invalidEmail');
  String get invalidUrl => message('invalidUrl');
  String get chooseOne => message('chooseOne');
  String tooShort(String n) => message('tooShort', n);
  String tooLong(String n) => message('tooLong', n);
  String atLeast(String n) => message('atLeast', n);
  String atMost(String n) => message('atMost', n);
}

/// Diba's email rule, the same on both platforms. Pinned against
/// `fixtures/rules.json`.
const String dibaEmailPattern = r'^[^@\s]+@[^@\s]+\.[^@\s]+$';

/// Diba's URL rule: http or https, a host with at least one dot, an optional
/// port, then anything without spaces. Matched case-insensitively. Pinned
/// against `fixtures/rules.json`.
const String dibaUrlPattern =
    r'^https?://([^\s/?#@:.]+\.)+[^\s/?#@:.]+(:\d{1,5})?([/?#]\S*)?$';

bool dibaIsEmail(String text) => RegExp(dibaEmailPattern).hasMatch(text);

bool dibaIsWebUrl(String text) =>
    RegExp(dibaUrlPattern, caseSensitive: false).hasMatch(text);
