import 'package:flutter/material.dart';

import '../date_calendar.dart';
import '../date_text.dart';
import '../field.dart';
import '../node.dart';
import '../strings.dart';
import 'fields.dart';

/// The extra components' dates and time: Calendar and RangeCalendar
/// drawn in the page, DateRangePicker and TimeField. They take DateField's
/// words, look and calendar.

/// A calendar drawn in the page, named for a screen reader, its error under
/// it in the field error's red.
Widget _inPage(BuildContext context, DibaNodeContext node, Widget calendar) {
  final error = node.prop<String>('errorMessage');
  return Align(
    alignment: AlignmentDirectional.centerStart,
    widthFactor: 1,
    child: Semantics(
      container: true,
      label: node.prop<String>('label'),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          calendar,
          if (error != null)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: dibaFieldError(context, error),
            ),
        ],
      ),
    ),
  );
}

/// A tree's time of day, «14:30» or «14:30:15»; null for none.
({int hour, int minute, int second})? _clock(Object? raw) {
  if (raw is! String) return null;
  final m = RegExp(r'^(\d\d):(\d\d)(?::(\d\d))?').firstMatch(raw);
  if (m == null) return null;
  final hour = int.parse(m[1]!);
  final minute = int.parse(m[2]!);
  if (hour > 23 || minute > 59) return null;
  return (hour: hour, minute: minute, second: int.tryParse(m[3] ?? '') ?? 0);
}

String _two(int v) => v.toString().padLeft(2, '0');

/// Group "dates" of the extras.
final Map<String, DibaBuilder> dateBlocks = {
  'Calendar': (context, node) => _inPage(
    context,
    node,
    DibaDateCalendar(
      selected: dibaParseDate(node.current),
      jalali: dibaJalali(node),
      persian: node.isPersian,
      min: DateTime.tryParse(node.str('minValue', '')),
      max: DateTime.tryParse(node.str('maxValue', '')),
      unavailable: dibaUnavailable(node),
      disabled: node.flag('isDisabled'),
      readOnly: node.flag('isReadOnly'),
      onPicked: (day) =>
          node.setValue('onChange', dibaDateIso(node, day, zoned: false)),
    ),
  ),

  'RangeCalendar': (context, node) => _inPage(
    context,
    node,
    DibaDateCalendar(
      range: dibaParseRange(node.current),
      jalali: dibaJalali(node),
      persian: node.isPersian,
      min: DateTime.tryParse(node.str('minValue', '')),
      max: DateTime.tryParse(node.str('maxValue', '')),
      unavailable: dibaUnavailable(node),
      disabled: node.flag('isDisabled'),
      readOnly: node.flag('isReadOnly'),
      onRange: (range) => node.setValue('onChange', [
        dibaDateIso(node, range.$1, zoned: false),
        dibaDateIso(node, range.$2, zoned: false),
      ]),
    ),
  ),

  /// Two dates in one field, «۲۵ مهر ۱۴۰۵» and «۲ آبان ۱۴۰۵» each in half of
  /// it, its calendar picking the first and then the last; at an hour or
  /// a minute, the two times follow in Material's dialog.
  'DateRangePicker': (context, node) {
    final persian = node.isPersian;
    final granularity = node.str('granularity', 'day');
    final raw = node.current;
    final zoned = raw is List && raw.isNotEmpty && dibaZoned(raw.first);
    final range = dibaParseRange(raw);

    Future<void> picked((DateTime, DateTime) picked) async {
      var (start, end) = picked;
      if (granularity != 'day') {
        if (!context.mounted) return;
        final from = await dibaAskTime(
          context,
          node,
          helpText: DibaStrings.of(context).message('startTime'),
          initial: range == null ? null : TimeOfDay.fromDateTime(range.$1),
        );
        if (from == null || !context.mounted) return;
        final to = await dibaAskTime(
          context,
          node,
          helpText: DibaStrings.of(context).message('endTime'),
          initial: range == null ? null : TimeOfDay.fromDateTime(range.$2),
        );
        if (to == null) return;
        start = dibaAtTime(node, start, from);
        end = dibaAtTime(node, end, to);
      }
      node.setValue('onChange', [
        dibaDateIso(node, start, zoned: zoned),
        dibaDateIso(node, end, zoned: zoned),
      ]);
    }

    final hint = dibaDateHint(persian: persian, granularity: granularity);
    final halves = range == null
        ? (hint, hint)
        : (
            dibaDateDisplay(node, range.$1, zoned: zoned),
            dibaDateDisplay(node, range.$2, zoned: zoned),
          );
    return dibaDatePickerField(
      context,
      node,
      shown: range == null ? '' : '${halves.$1} - ${halves.$2}',
      hint: '$hint - $hint',
      empty: range == null,
      halves: halves,
      calendar: (close) => DibaDateCalendar(
        range: range,
        jalali: dibaJalali(node),
        persian: persian,
        min: DateTime.tryParse(node.str('minValue', '')),
        max: DateTime.tryParse(node.str('maxValue', '')),
        unavailable: dibaUnavailable(node),
        onRange: (range) {
          close();
          picked(range);
        },
      ),
    );
  },

  /// A time of day: the field shows «۱۴:۳۰», and a press asks Material's time
  /// picker, as the date field's time does; the web's is typed.
  'TimeField': (context, node) {
    final persian = node.isPersian;
    final twelve = node.prop<num>('hourCycle') == 12;
    final granularity = node.str('granularity', 'minute');
    final value = _clock(node.current);
    final min = _clock(node.props['minValue']);
    final max = _clock(node.props['maxValue']);
    final strings = DibaStrings.of(context);
    final disabled = node.flag('isDisabled');
    final readOnly = node.flag('isReadOnly');

    String show(({int hour, int minute, int second}) t) => dibaTimeDisplay(
      t.hour,
      granularity == 'hour' ? 0 : t.minute,
      persian: persian,
      twelve: twelve,
      seconds: granularity == 'second' ? t.second : null,
    );
    int at(({int hour, int minute, int second}) t) =>
        t.hour * 3600 + t.minute * 60 + t.second;

    Future<void> ask() async {
      final time = await dibaAskTime(
        context,
        node,
        initial: value == null
            ? null
            : TimeOfDay(hour: value.hour, minute: value.minute),
      );
      if (time == null) return;
      final minute = granularity == 'hour' ? 0 : time.minute;
      final iso = '${_two(time.hour)}:${_two(minute)}';
      node.setValue('onChange', granularity == 'second' ? '$iso:00' : iso);
    }

    final shown = value == null ? '' : show(value);
    final empty = switch (granularity) {
      'hour' => '––',
      'second' => '––:––:––',
      _ => '––:––',
    };
    return dibaFieldFrame(
      node,
      TextFormField(
        key: ValueKey(shown),
        initialValue: shown,
        readOnly: true,
        // On the web and desktop a field selects all it holds when focus
        // comes back, as it does from a closed picker; the web's button
        // selects nothing.
        selectAllOnFocus: false,
        enabled: !disabled,
        // A press anywhere opens the picker: the pointer, as the web's button shows.
        mouseCursor: disabled || readOnly
            ? SystemMouseCursors.basic
            : SystemMouseCursors.click,
        style: dibaFieldText(context, disabled: disabled),
        decoration: dibaDecoration(context, node, hint: empty),
        errorBuilder: dibaFieldError,
        validator: (_) {
          if (value == null) {
            return node.flag('isRequired') ? strings.required : null;
          }
          if (min != null && at(value) < at(min)) {
            return strings.message('atLeast', show(min));
          }
          if (max != null && at(value) > at(max)) {
            return strings.message('atMost', show(max));
          }
          return null;
        },
        onTap: disabled || readOnly ? null : ask,
      ),
    );
  },
};
