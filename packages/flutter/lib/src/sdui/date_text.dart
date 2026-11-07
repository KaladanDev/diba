import 'package:flutter/material.dart';

import 'format.dart';
import 'node.dart';
import 'persian_calendar.dart';
import 'strings.dart';
import 'time_picker_material.dart';

/// How the date blocks read, show and send their values: DateField's,
/// shared with DateRangePicker and TimeField.

/// Whether the tree's calendar is Jalali: `persian`, or `auto` on a Persian
/// page.
bool dibaJalali(DibaNodeContext node) {
  final system = node.str('calendarSystem', 'auto');
  return system == 'persian' || (system == 'auto' && node.isPersian);
}

/// Whether a tree's value is zoned: it ends in a Z or an offset.
bool dibaZoned(Object? raw) =>
    raw is String && RegExp(r'([zZ]|[+-]\d\d:?\d\d)$').hasMatch(raw);

/// A tree's date, in local time; null for none.
DateTime? dibaParseDate(Object? raw) =>
    raw is String ? DateTime.tryParse(raw)?.toLocal() : null;

/// A tree's pair of dates, first and last; null unless both read.
(DateTime, DateTime)? dibaParseRange(Object? raw) {
  if (raw is! List || raw.length != 2) return null;
  final start = dibaParseDate(raw[0]);
  final end = dibaParseDate(raw[1]);
  return start == null || end == null ? null : (start, end);
}

/// The days a tree says cannot be picked, as Gregorian `yyyy-mm-dd`.
Set<String> dibaUnavailable(DibaNodeContext node) => {
  for (final day in node.prop<List<Object?>>('unavailableDates') ?? const [])
    if (day is String && day.length >= 10) day.substring(0, 10),
};

String _two(int v) => v.toString().padLeft(2, '0');

/// A time of day as the field shows it: «۱۴:۳۰», or «۲:۳۰ ب.ظ» on a 12-hour
/// clock, with seconds when [seconds].
String dibaTimeDisplay(
  int hour,
  int minute, {
  required bool persian,
  required bool twelve,
  int? seconds,
}) {
  final tail = seconds == null ? '' : ':${_two(seconds)}';
  final time = twelve
      ? '${hour % 12 == 0 ? 12 : hour % 12}:${_two(minute)}$tail '
            '${hour < 12 ? (persian ? 'ق.ظ.' : 'AM') : (persian ? 'ب.ظ.' : 'PM')}'
      : '${_two(hour)}:${_two(minute)}$tail';
  return persian ? _persianDigits(time) : time;
}

String _persianDigits(String text) => text.replaceAllMapped(
  RegExp(r'\d'),
  (m) => persianDigits(int.parse(m[0]!)),
);

/// A date as the field shows it at rest: «۳۰ مهر ۱۴۰۵», with the time at an
/// hour or a minute, and the zone's name when the tree asks for it.
String dibaDateDisplay(
  DibaNodeContext node,
  DateTime d, {
  required bool zoned,
}) {
  final persian = node.isPersian;
  var out = dibaFormatDate(d, jalali: dibaJalali(node), persian: persian);
  if (node.str('granularity', 'day') != 'day') {
    final time = dibaTimeDisplay(
      d.hour,
      d.minute,
      persian: persian,
      twelve: node.prop<num>('hourCycle') == 12,
    );
    out = persian ? '$out، $time' : '$out, $time';
  }
  if (zoned && !node.flagOr('hideTimeZone', true)) {
    out = '$out ${d.timeZoneName}';
  }
  return out;
}

/// A date as the field sends it: Gregorian ISO 8601, to the day, or to the
/// minute with the local offset when the tree's was zoned.
String dibaDateIso(DibaNodeContext node, DateTime d, {required bool zoned}) {
  final date =
      '${d.year.toString().padLeft(4, '0')}-${_two(d.month)}-'
      '${_two(d.day)}';
  if (node.str('granularity', 'day') == 'day') return date;
  var out = '${date}T${_two(d.hour)}:${_two(d.minute)}';
  if (zoned) {
    final offset = d.timeZoneOffset;
    final sign = offset.isNegative ? '-' : '+';
    final mins = offset.inMinutes.abs();
    out += '$sign${_two(mins ~/ 60)}:${_two(mins % 60)}';
  }
  return out;
}

/// Material's time picker, in the tree's clock: a time follows a day there,
/// as the web's is typed into the field.
Future<TimeOfDay?> dibaAskTime(
  BuildContext context,
  DibaNodeContext node, {
  TimeOfDay? initial,
  String? helpText,
}) => showDibaTimePicker(
  context: context,
  helpText: helpText ?? DibaStrings.of(context).pickTime,
  initialTime: initial ?? TimeOfDay.now(),
  // Diba's copy of Material's picker: Material's reads a typed hour in
  // 0-9 only, and refused its own Persian «۲۱» on OK.
  builder: (c, child) => MediaQuery(
    data: MediaQuery.of(
      c,
    ).copyWith(alwaysUse24HourFormat: node.prop<num>('hourCycle') != 12),
    child: child!,
  ),
);

/// [day] at [time], to the hour or the minute as the tree counts.
DateTime dibaAtTime(DibaNodeContext node, DateTime day, TimeOfDay time) =>
    DateTime(
      day.year,
      day.month,
      day.day,
      time.hour,
      node.str('granularity', 'day') == 'hour' ? 0 : time.minute,
    );
