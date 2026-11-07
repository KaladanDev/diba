import 'package:flutter/material.dart';
import 'package:shamsi_date/shamsi_date.dart';

import '../tokens.g.dart';
import 'format.dart';
import 'glyphs.dart';
import 'ring.dart';
import 'strings.dart';

/// A date field's calendar, the web's, measured off the web, in Persian or
/// Gregorian.
///
/// 252 across. The title is a pill between the month arrows, the neutral
/// fill under the words «مهر ۱۴۰۵», saying it opens the years and then the
/// year's months; while they show it is gilt. Days are 36 circles under a
/// row of weekday letters, the picked one gilt with slate-700 on it, today in
/// the brand's soft fill, those of the months either side muted at half and
/// not to be picked. The years, three across in pills 32 tall, scroll; a year
/// opens its twelve months, and a month the days again. Under them, 12 down,
/// today in a pill as the title's is; past the bounds it is at half.
///
/// Given [onRange], it picks a range instead: a first day, then a last,
/// the days between drawn on a band in the brand's soft fill as the web's
/// range calendar draws them, the two ends gilt.
class DibaDateCalendar extends StatefulWidget {
  const DibaDateCalendar({
    super.key,
    this.selected,
    required this.jalali,
    required this.persian,
    this.onPicked,
    this.min,
    this.max,
    this.unavailable = const {},
    this.range,
    this.onRange,
    this.disabled = false,
    this.readOnly = false,
  });

  /// The field's date, picked; null for none.
  final DateTime? selected;

  /// Days that cannot be picked, as Gregorian `yyyy-mm-dd`: at half, as the
  /// web's are, but not struck through as days past the bounds are.
  final Set<String> unavailable;

  /// The range picked, first and last; null for none.
  final (DateTime, DateTime)? range;

  /// A range picked, first and last; set, the calendar picks ranges.
  final ValueChanged<(DateTime, DateTime)>? onRange;

  /// Every day at half and struck through, nothing to press, as React Aria's
  /// disabled calendar.
  final bool disabled;

  /// Days drawn as they are, but none can be picked.
  final bool readOnly;

  /// The Persian calendar, rather than the Gregorian.
  final bool jalali;

  /// A Persian page: Persian words and digits, the week from Saturday.
  final bool persian;

  /// The first and last days it lets be picked.
  final DateTime? min;
  final DateTime? max;

  /// A day picked, as a local date.
  final ValueChanged<DateTime>? onPicked;

  @override
  State<DibaDateCalendar> createState() => _DibaDateCalendarState();
}

typedef _Ymd = ({int year, int month, int day});

/// The arithmetic of the calendar drawn. Jalali's is `shamsi_date`'s.
abstract class _System {
  const _System();

  _Ymd of(DateTime date);
  DateTime dateOf(int year, int month, int day);
  int daysIn(int year, int month);

  /// The web's own bounds, 1900 to 2099 in Gregorian years, in this calendar's.
  int get yearOffset;
}

class _Jalali extends _System {
  const _Jalali();

  @override
  _Ymd of(DateTime date) {
    final j = Jalali.fromDateTime(date);
    return (year: j.year, month: j.month, day: j.day);
  }

  @override
  DateTime dateOf(int year, int month, int day) =>
      Jalali(year, month, day).toDateTime();

  @override
  int daysIn(int year, int month) => Jalali(year, month, 1).monthLength;

  @override
  int get yearOffset => -621;
}

class _Gregorian extends _System {
  const _Gregorian();

  @override
  _Ymd of(DateTime date) => (year: date.year, month: date.month, day: date.day);

  @override
  DateTime dateOf(int year, int month, int day) => DateTime(year, month, day);

  @override
  int daysIn(int year, int month) => DateTime(year, month + 1, 0).day;

  @override
  int get yearOffset => 0;
}

const _jalaliFa = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', //
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];
const _jalaliEn = [
  'Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar', //
  'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand',
];
const _gregorianFa = [
  'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', //
  'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر',
];
const _gregorianEn = [
  'January', 'February', 'March', 'April', 'May', 'June', //
  'July', 'August', 'September', 'October', 'November', 'December',
];

/// A Persian week from Saturday, one letter each; an English one from
/// Sunday.
const _weekFa = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const _weekEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

enum _View { days, years, months }

/// The calendar's numbers, the web's.
abstract final class DibaCalendarMetrics {
  static const double width = 252;
  static const double cell = 36;

  /// A range's week: its days 2 apart from the weeks either side, so a band
  /// over two weeks reads as two.
  static const double rangeRow = 40;
  static const double weekRow = 24;
  static const double bodyGap = 4;
  static const double headerHeight = 28;
  static const double headerGap = 16;
  static const double arrow = 24;
  static const double pill = 32;
  static const double pickerGap = 4;
  static const double footerGap = 12;
}

class _DibaDateCalendarState extends State<DibaDateCalendar> {
  late final _System _system = widget.jalali
      ? const _Jalali()
      : const _Gregorian();
  late _Ymd _min;
  late _Ymd _max;
  late int _year;
  late int _month;
  _View _view = _View.days;

  /// A range's first day, picked, until its last is; and the day under the
  /// pointer meanwhile, which the band reaches to.
  _Ymd? _anchor;
  _Ymd? _hover;

  @override
  void initState() {
    super.initState();
    final offset = _system.yearOffset;
    _min = widget.min == null
        ? (year: 1900 + offset, month: 1, day: 1)
        : _system.of(widget.min!);
    _max = widget.max == null
        ? (
            year: 2099 + offset,
            month: 12,
            day: _system.daysIn(2099 + offset, 12),
          )
        : _system.of(widget.max!);
    var start = _system.of(
      widget.selected ?? widget.range?.$1 ?? DateTime.now(),
    );
    if (_before(start, _min)) start = _min;
    if (_before(_max, start)) start = _max;
    _year = start.year;
    _month = start.month;
  }

  static bool _before(_Ymd a, _Ymd b) => a.year != b.year
      ? a.year < b.year
      : a.month != b.month
      ? a.month < b.month
      : a.day < b.day;

  String _digits(int n) => widget.persian ? persianDigits(n) : n.toString();

  /// Whether a day is within the bounds.
  bool _inRange(_Ymd day) => !_before(day, _min) && !_before(_max, day);

  /// Whether a day is on the tree's list of days that cannot be picked.
  bool _unavailable(_Ymd day) {
    if (widget.unavailable.isEmpty) return false;
    final d = _system.dateOf(day.year, day.month, day.day);
    String two(int v) => v.toString().padLeft(2, '0');
    return widget.unavailable.contains(
      '${d.year.toString().padLeft(4, '0')}-${two(d.month)}-${two(d.day)}',
    );
  }

  bool get _picks => !widget.disabled && !widget.readOnly;

  /// A day picked: the day, or a range's first and then its last.
  void _pick(_Ymd day) {
    final date = _system.dateOf(day.year, day.month, day.day);
    final onRange = widget.onRange;
    if (onRange == null) {
      widget.onPicked?.call(date);
      return;
    }
    final anchor = _anchor;
    if (anchor == null) {
      setState(() => _anchor = _hover = day);
      return;
    }
    final first = _system.dateOf(anchor.year, anchor.month, anchor.day);
    setState(() => _anchor = _hover = null);
    onRange(first.isAfter(date) ? (date, first) : (first, date));
  }

  /// The band drawn: the range being picked, to the day under the pointer,
  /// else the range picked.
  (_Ymd, _Ymd)? get _band {
    final anchor = _anchor;
    if (anchor != null) {
      final other = _hover ?? anchor;
      return _before(other, anchor) ? (other, anchor) : (anchor, other);
    }
    final range = widget.range;
    if (range == null || widget.onRange == null) return null;
    return (_system.of(range.$1), _system.of(range.$2));
  }

  List<String> get _months => widget.jalali
      ? (widget.persian ? _jalaliFa : _jalaliEn)
      : (widget.persian ? _gregorianFa : _gregorianEn);

  /// «مهر ۱۴۰۵», or the year alone while its months show.
  String get _title => _view == _View.months
      ? _digits(_year)
      : '${_months[_month - 1]} ${_digits(_year)}';

  bool get _canGoBack =>
      !widget.disabled &&
      (_year > _min.year || (_year == _min.year && _month > _min.month));
  bool get _canGoOn =>
      !widget.disabled &&
      (_year < _max.year || (_year == _max.year && _month < _max.month));

  void _step(int by) => setState(() {
    var m = _month + by;
    var y = _year;
    if (m < 1) {
      m = 12;
      y--;
    } else if (m > 12) {
      m = 1;
      y++;
    }
    _year = y;
    _month = m;
  });

  void _toggle() =>
      setState(() => _view = _view == _View.days ? _View.years : _View.days);

  int get _rows {
    final lead = _lead(_year, _month);
    return ((lead + _system.daysIn(_year, _month)) / 7).ceil();
  }

  /// How many of the month before lead its first week.
  int _lead(int year, int month) {
    final weekday = _system.dateOf(year, month, 1).weekday;
    // DateTime.weekday: Monday 1 to Sunday 7; a Persian week from Saturday,
    // an English one from Sunday.
    return widget.persian ? (weekday + 1) % 7 : weekday % 7;
  }

  /// A week's height: a day, or a range's 40.
  double get _rowHeight => widget.onRange == null
      ? DibaCalendarMetrics.cell
      : DibaCalendarMetrics.rangeRow;

  double get _bodyHeight =>
      DibaCalendarMetrics.weekRow +
      DibaCalendarMetrics.bodyGap +
      _rowHeight * _rows;

  @override
  Widget build(BuildContext context) {
    final c = _Colours.of(context);
    final strings = DibaStrings.forPersian(widget.persian);
    final open = _view != _View.days;
    return SizedBox(
      width: DibaCalendarMetrics.width,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 2),
            child: SizedBox(
              height: DibaCalendarMetrics.headerHeight,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _arrow(c, back: true, hidden: open, enabled: _canGoBack),
                  // As wide as its words, and narrower rather than over the
                  // arrows when they need more (large text; «September»).
                  Flexible(
                    child: IntrinsicWidth(
                      child: _TitlePill(
                        text: _title,
                        open: open,
                        label: strings.message('chooseMonthYear', _title),
                        onTap: widget.disabled ? null : _toggle,
                        colours: c,
                      ),
                    ),
                  ),
                  _arrow(c, back: false, hidden: open, enabled: _canGoOn),
                ],
              ),
            ),
          ),
          const SizedBox(height: DibaCalendarMetrics.headerGap),
          SizedBox(
            height: _bodyHeight,
            child: Stack(
              children: [
                IgnorePointer(
                  ignoring: open,
                  child: AnimatedOpacity(
                    opacity: open ? 0 : 1,
                    duration: const Duration(milliseconds: 150),
                    child: _days(c, strings),
                  ),
                ),
                if (_view == _View.years) Positioned.fill(child: _years(c)),
                if (_view == _View.months)
                  Positioned.fill(child: _monthsGrid(c)),
              ],
            ),
          ),
          const SizedBox(height: DibaCalendarMetrics.footerGap),
          // A row, as the title's, so the pill keeps to its words.
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [_todayPill(c, strings)],
          ),
        ],
      ),
    );
  }

  /// Today, picked as a day's circle would be, from the days, the years or
  /// the months.
  Widget _todayPill(_Colours c, DibaStrings strings) {
    final today = _system.of(DateTime.now());
    final inRange = _picks && _inRange(today) && !_unavailable(today);
    final label = strings.message('today');
    return _TitlePill(
      text: label,
      open: false,
      label: label,
      colours: c,
      onTap: inRange ? () => _pickToday(today) : null,
    );
  }

  /// Back to the days, turned to today's month, as the web's focuses today;
  /// then today picked. A calendar left open, in the page or between a
  /// range's two days, shows the day it picked.
  void _pickToday(_Ymd today) {
    setState(() {
      _view = _View.days;
      _year = today.year;
      _month = today.month;
    });
    _pick(today);
  }

  Widget _arrow(
    _Colours c, {
    required bool back,
    required bool hidden,
    required bool enabled,
  }) {
    final rtl = Directionality.of(context) == TextDirection.rtl;
    final strings = DibaStrings.forPersian(widget.persian);
    // Each points the way it moves: back to the left in English, to the
    // right in Persian.
    final mirror = back == rtl;
    final glyph = Transform.flip(
      flipX: mirror,
      child: DibaGlyphMark(DibaGlyph.chevronLeft, size: 16, color: c.ink),
    );
    final button = _Tappable(
      label: strings.message(back ? 'previous' : 'next'),
      shape: const CircleBorder(),
      onTap: enabled && !hidden ? () => _step(back ? -1 : 1) : null,
      builder: (context, s) => AnimatedScale(
        scale: s.pressed ? 0.95 : 1,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
        child: Container(
          width: DibaCalendarMetrics.arrow,
          height: DibaCalendarMetrics.arrow,
          alignment: Alignment.center,
          decoration: ShapeDecoration(
            shape: const CircleBorder(),
            color: s.hovered ? c.fill : Colors.transparent,
          ),
          child: glyph,
        ),
      ),
    );
    return IgnorePointer(
      ignoring: hidden,
      child: AnimatedOpacity(
        opacity: hidden ? 0 : (enabled ? 1 : 0.5),
        duration: const Duration(milliseconds: 150),
        child: ExcludeFocus(excluding: hidden, child: button),
      ),
    );
  }

  Widget _days(_Colours c, DibaStrings strings) {
    final week = widget.persian ? _weekFa : _weekEn;
    final lead = _lead(_year, _month);
    final count = _system.daysIn(_year, _month);
    final selected = widget.selected == null
        ? null
        : _system.of(widget.selected!);
    final today = _system.of(DateTime.now());
    // The month before's last days, then this month's, then the next's.
    final prev = _month == 1
        ? (year: _year - 1, month: 12)
        : (year: _year, month: _month - 1);
    final next = _month == 12
        ? (year: _year + 1, month: 1)
        : (year: _year, month: _month + 1);
    final prevCount = _system.daysIn(prev.year, prev.month);
    final band = _band;
    final cells = <Widget>[];
    for (var i = 0; i < _rows * 7; i++) {
      final _Ymd day;
      final outside = i < lead || i >= lead + count;
      if (i < lead) {
        day = (
          year: prev.year,
          month: prev.month,
          day: prevCount - lead + 1 + i,
        );
      } else if (i >= lead + count) {
        day = (year: next.year, month: next.month, day: i - lead - count + 1);
      } else {
        day = (year: _year, month: _month, day: i - lead + 1);
      }
      final inRange = _inRange(day) && !widget.disabled;
      final unavailable = _unavailable(day);
      // A day of the months either side is never picked nor on the band, as
      // React Aria marks none; the band ends 8 round beside one, as at a
      // week's end.
      final inBand =
          band != null &&
          !outside &&
          !_before(day, band.$1) &&
          !_before(band.$2, day);
      final first = inBand && day == band.$1;
      final last = inBand && day == band.$2;
      cells.add(
        _DayCell(
          text: _digits(day.day),
          label:
              '${_digits(day.day)} ${_months[day.month - 1]} ${_digits(day.year)}',
          selected:
              !outside && (band == null ? selected == day : first || last),
          today: today == day,
          outside: outside,
          disabled: !inRange,
          unavailable: unavailable,
          // A calendar that is off keeps its range's two ends, at half, but no
          // band, as React Aria marks none of its days picked.
          band: inBand && !widget.disabled
              ? (
                  first: first,
                  last: last,
                  rowStart: i % 7 == 0 || i == lead,
                  rowEnd: i % 7 == 6 || i == lead + count - 1,
                )
              : null,
          colours: c,
          onHover: _anchor == null || outside
              ? null
              : () => setState(() => _hover = day),
          onTap: outside || !inRange || unavailable || !_picks
              ? null
              : () => _pick(day),
        ),
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SizedBox(
          height: DibaCalendarMetrics.weekRow,
          child: Row(
            children: [
              for (final d in week)
                SizedBox(
                  width: DibaCalendarMetrics.cell,
                  child: Text(
                    d,
                    textAlign: TextAlign.center,
                    style: _text(12, 16, c.muted),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: DibaCalendarMetrics.bodyGap),
        for (var r = 0; r < _rows; r++)
          SizedBox(
            height: _rowHeight,
            child: Row(children: cells.sublist(r * 7, r * 7 + 7)),
          ),
      ],
    );
  }

  Widget _years(_Colours c) {
    final years = [for (var y = _min.year; y <= _max.year; y++) y];
    final index = years.indexOf(_year).clamp(0, years.length - 1);
    final row = DibaCalendarMetrics.pill + DibaCalendarMetrics.pickerGap;
    // The chosen year in the middle as it opens, as far as the list allows.
    final offset = (index ~/ 3 * row - (_bodyHeight - row) / 2).clamp(
      0.0,
      double.infinity,
    );
    return _PickerGrid(
      key: const ValueKey('years'),
      count: years.length,
      initialOffset: offset,
      scrolls: true,
      builder: (i) => _PickerPill(
        text: _digits(years[i]),
        selected: years[i] == _year,
        colours: c,
        onTap: () => setState(() {
          _year = years[i];
          // The same month in the year picked, within the bounds.
          if (_year == _min.year && _month < _min.month) _month = _min.month;
          if (_year == _max.year && _month > _max.month) _month = _max.month;
          _view = _View.months;
        }),
      ),
    );
  }

  Widget _monthsGrid(_Colours c) => _PickerGrid(
    key: const ValueKey('months'),
    count: 12,
    builder: (i) {
      final month = i + 1;
      final inRange =
          !(_year == _min.year && month < _min.month) &&
          !(_year == _max.year && month > _max.month);
      return _PickerPill(
        text: _months[i],
        selected: month == _month,
        colours: c,
        onTap: inRange
            ? () => setState(() {
                _month = month;
                _view = _View.days;
              })
            : null,
      );
    },
  );
}

/// 14 (12 for the weekday letters) and medium, on the web's line.
TextStyle _text(double size, double line, Color colour) => TextStyle(
  fontSize: size,
  height: line / size,
  fontWeight: DibaFontWeight.medium,
  color: colour,
  letterSpacing: 0,
  leadingDistribution: TextLeadingDistribution.even,
);

/// The calendar's colours, the web's roles: the text colour, the muted, the
/// neutral fill and its hover, the gilt and slate-700 on it, today's soft
/// fill, and a range's band in a saturated tint of the brand.
class _Colours {
  const _Colours({
    required this.ink,
    required this.muted,
    required this.fill,
    required this.fillHover,
    required this.fillInk,
    required this.gilt,
    required this.onGilt,
    required this.today,
    required this.todayHover,
    required this.band,
  });

  factory _Colours.of(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final primary = dark ? DibaDarkColors.primary : DibaLightColors.primary;
    return _Colours(
      ink: dark ? DibaDarkNeutrals.foreground : DibaLightNeutrals.foreground,
      // The theme's, which a grey card makes a step stronger.
      muted: Theme.of(context).colorScheme.onSurfaceVariant,
      fill: dark ? DibaDarkNeutrals.fill : DibaLightNeutrals.fill,
      fillHover: dark
          ? DibaDarkNeutrals.fillHover
          : DibaLightNeutrals.fillHover,
      fillInk: dark
          ? DibaDarkNeutrals.fillForeground
          : DibaLightNeutrals.fillForeground,
      gilt: dark ? DibaDarkColors.controlFill : DibaLightColors.controlFill,
      onGilt: dark
          ? DibaDarkColors.controlOnFill
          : DibaLightColors.controlOnFill,
      today: dark ? DibaDarkColors.primarySoft : DibaLightColors.primarySoft,
      todayHover: primary.withValues(alpha: 0.2),
      // As the web's: saffron-200, or 800 in dark, where the soft fill was all
      // but white beside the gilt ends.
      band: dark ? DibaPalette.saffron800 : DibaPalette.saffron200,
    );
  }

  final Color ink;
  final Color muted;
  final Color fill;
  final Color fillHover;
  final Color fillInk;
  final Color gilt;
  final Color onGilt;
  final Color today;
  final Color todayHover;
  final Color band;
}

typedef _States = ({bool hovered, bool pressed, bool focused});

/// Something to press: its hover, its press, and a ring under keyboard
/// focus, as the web's `status-focused` draws.
class _Tappable extends StatefulWidget {
  const _Tappable({
    required this.builder,
    required this.shape,
    this.onTap,
    this.label,
    this.selected,
    this.onHover,
  });

  final Widget Function(BuildContext context, _States states) builder;
  final ShapeBorder shape;
  final VoidCallback? onTap;

  /// Told when the pointer comes onto it, whether or not it can be pressed.
  final VoidCallback? onHover;
  final String? label;
  final bool? selected;

  @override
  State<_Tappable> createState() => _TappableState();
}

class _TappableState extends State<_Tappable> {
  bool _hovered = false;
  bool _pressed = false;
  bool _focused = false;

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onTap != null;
    Widget child = widget.builder(context, (
      hovered: _hovered && enabled,
      pressed: _pressed && enabled,
      focused: _focused,
    ));
    if (_focused && dibaKeyboardFocus()) {
      child = CustomPaint(
        foregroundPainter: DibaRingPainter.of(context, widget.shape),
        child: child,
      );
    }
    return Semantics(
      button: true,
      enabled: enabled,
      selected: widget.selected,
      label: widget.label,
      excludeSemantics: widget.label != null,
      child: FocusableActionDetector(
        enabled: enabled,
        mouseCursor: enabled ? SystemMouseCursors.click : MouseCursor.defer,
        onShowHoverHighlight: (v) {
          setState(() => _hovered = v);
          if (v) widget.onHover?.call();
        },
        onFocusChange: (v) => setState(() => _focused = v),
        actions: {
          ActivateIntent: CallbackAction<ActivateIntent>(
            onInvoke: (_) {
              widget.onTap?.call();
              return null;
            },
          ),
        },
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapDown: enabled ? (_) => setState(() => _pressed = true) : null,
          onTapCancel: () => setState(() => _pressed = false),
          onTapUp: enabled ? (_) => setState(() => _pressed = false) : null,
          onTap: widget.onTap,
          child: child,
        ),
      ),
    );
  }
}

/// The title between the arrows: a pill in the neutral fill, darker under a
/// hover, gilt while the years or months show. Today's is the same, at
/// half when it can't be pressed.
class _TitlePill extends StatelessWidget {
  const _TitlePill({
    required this.text,
    required this.open,
    required this.label,
    required this.onTap,
    required this.colours,
  });

  final String text;
  final bool open;
  final String label;
  final VoidCallback? onTap;
  final _Colours colours;

  @override
  Widget build(BuildContext context) => _Tappable(
    label: label,
    selected: open,
    shape: const StadiumBorder(),
    onTap: onTap,
    builder: (context, s) => Opacity(
      opacity: onTap == null ? 0.5 : 1,
      child: AnimatedScale(
        scale: s.pressed ? 0.97 : 1,
        duration: const Duration(milliseconds: 100),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          curve: Curves.easeOut,
          height: DibaCalendarMetrics.headerHeight,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          alignment: Alignment.center,
          decoration: ShapeDecoration(
            shape: const StadiumBorder(),
            color: open
                ? colours.gilt
                : (s.hovered ? colours.fillHover : colours.fill),
          ),
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: _text(14, 20, open ? colours.onGilt : colours.fillInk),
          ),
        ),
      ),
    ),
  );
}

/// Where a day sits on a range's band: its ends, and the week's.
typedef _Band = ({bool first, bool last, bool rowStart, bool rowEnd});

class _DayCell extends StatelessWidget {
  const _DayCell({
    required this.text,
    required this.label,
    required this.selected,
    required this.today,
    required this.outside,
    required this.disabled,
    required this.colours,
    required this.onTap,
    this.unavailable = false,
    this.band,
    this.onHover,
  });

  final String text;
  final String label;
  final bool selected;
  final bool today;
  final bool outside;
  final bool disabled;
  final bool unavailable;
  final _Band? band;
  final _Colours colours;
  final VoidCallback? onTap;
  final VoidCallback? onHover;

  /// The band behind a day of a range, as the web's range calendar draws it:
  /// square between days, 8 round at a week's ends and the month's, round at
  /// the range's.
  Widget _onBand(Widget child) {
    final band = this.band;
    if (band == null) return child;
    Radius end(bool cap, bool row) => Radius.circular(cap ? 18 : (row ? 8 : 0));
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colours.band,
        borderRadius: BorderRadiusDirectional.horizontal(
          start: end(band.first, band.rowStart),
          end: end(band.last, band.rowEnd),
        ),
      ),
      child: child,
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = colours;
    final cell = SizedBox.square(
      dimension: DibaCalendarMetrics.cell,
      child: _Tappable(
        label: label,
        selected: selected,
        shape: const CircleBorder(),
        onTap: onTap,
        onHover: onHover,
        builder: (context, s) {
          final Color fill;
          if (selected) {
            fill = c.gilt;
          } else if (band != null) {
            fill = Colors.transparent;
          } else if (s.pressed || s.hovered) {
            fill = today && !s.pressed ? c.todayHover : c.fill;
          } else if (today) {
            fill = c.today;
          } else {
            fill = Colors.transparent;
          }
          final ink = outside
              ? c.muted
              : selected
              ? c.onGilt
              : c.ink;
          return Opacity(
            // A day of the months either side, out of bounds or unavailable,
            // at half.
            opacity: outside || disabled || unavailable ? 0.5 : 1,
            child: AnimatedScale(
              scale: s.pressed ? 0.95 : 1,
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeOut,
              child: DecoratedBox(
                decoration: ShapeDecoration(
                  shape: const CircleBorder(),
                  color: fill,
                ),
                child: Center(
                  child: Text(
                    text,
                    style: _text(14, 20, ink).copyWith(
                      decoration: disabled && !outside
                          ? TextDecoration.lineThrough
                          : null,
                      decorationColor: ink,
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
    return _onBand(cell);
  }
}

/// A year or a month: a pill 32 tall, gilt when it is the calendar's.
class _PickerPill extends StatelessWidget {
  const _PickerPill({
    required this.text,
    required this.selected,
    required this.colours,
    required this.onTap,
  });

  final String text;
  final bool selected;
  final _Colours colours;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => _Tappable(
    label: text,
    selected: selected,
    shape: const StadiumBorder(),
    onTap: onTap,
    builder: (context, s) => Opacity(
      opacity: onTap == null ? 0.5 : 1,
      child: DecoratedBox(
        decoration: ShapeDecoration(
          shape: const StadiumBorder(),
          color: selected
              ? colours.gilt
              : (s.hovered ? colours.fill : Colors.transparent),
        ),
        child: Center(
          child: Text(
            text,
            maxLines: 1,
            style: _text(14, 20, selected ? colours.onGilt : colours.ink),
          ),
        ),
      ),
    ),
  );
}

/// Three across, 4 apart and 4 in, over the day grid; the years scroll.
class _PickerGrid extends StatefulWidget {
  const _PickerGrid({
    super.key,
    required this.count,
    required this.builder,
    this.initialOffset = 0,
    this.scrolls = false,
  });

  final int count;
  final Widget Function(int index) builder;
  final double initialOffset;
  final bool scrolls;

  @override
  State<_PickerGrid> createState() => _PickerGridState();
}

class _PickerGridState extends State<_PickerGrid> {
  late final ScrollController _scroll = ScrollController(
    initialScrollOffset: widget.initialOffset,
  );

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => TweenAnimationBuilder<double>(
    tween: Tween(begin: 0, end: 1),
    duration: const Duration(milliseconds: 200),
    builder: (context, t, child) => Opacity(opacity: t, child: child),
    child: GridView.builder(
      controller: _scroll,
      physics: widget.scrolls ? null : const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.all(DibaCalendarMetrics.pickerGap),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: DibaCalendarMetrics.pickerGap,
        crossAxisSpacing: DibaCalendarMetrics.pickerGap,
        mainAxisExtent: DibaCalendarMetrics.pill,
      ),
      itemCount: widget.count,
      itemBuilder: (context, i) => widget.builder(i),
    ),
  );
}
