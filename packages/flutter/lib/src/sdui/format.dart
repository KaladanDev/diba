/// Persian formatting, matched to the web by hand.
///
/// The React side calls `Intl.NumberFormat('fa-IR')`, which the platform
/// supplies. [persianNumber] predates the `intl` dependency and stays a
/// deliberate reimplementation, safe only because `format_test.dart` pins its
/// output against the exact strings `Intl` produces. A price that reads
/// differently on the two platforms is the kind of bug a merchant reports and
/// nobody can reproduce.
///
/// [formatNumber] is newer and goes through `intl`, because the schema's
/// formatStyle and currency are more than a grouping loop should carry. Its
/// data is not the browser's ICU data, and the two disagree in places —
/// `format_test.dart` pins where.
library;

import 'package:characters/characters.dart';
import 'package:intl/intl.dart';

import 'strings.dart';

/// Persian-Indic digits, U+06F0 to U+06F9.
const List<String> _persianDigits = [
  '۰',
  '۱',
  '۲',
  '۳',
  '۴',
  '۵',
  '۶',
  '۷',
  '۸',
  '۹',
];

/// U+066C, the Arabic thousands separator — not a comma, which is what a
/// Latin-minded implementation reaches for and what makes the two platforms
/// disagree by one character.
const String _groupSeparator = '٬';

/// A number in Persian digits, grouped in threes.
///
/// Whole numbers only, which is what `maximumFractionDigits: 0` gives on the
/// web and what every amount in this system is: Toman has no minor unit.
String persianNumber(num value) {
  final negative = value < 0;
  final digits = value.abs().round().toString();

  final grouped = StringBuffer();
  for (var i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 == 0) grouped.write(_groupSeparator);
    grouped.write(_persianDigits[digits.codeUnitAt(i) - 0x30]);
  }

  return negative ? '‎-${grouped.toString()}' : grouped.toString();
}

/// The first letter of each of the first two words, Latin ones in capitals.
///
/// Deliberately as dumb as `initials` on the web: anything cleverer starts
/// guessing which part of a name is the family one, which differs by culture
/// and is not a guess a component gets to make. A zero-width non-joiner sits
/// between them, so two Persian letters stay two letters: «ن‌ر», where «نر»
/// would read as a word.
String initialsOf(String name) {
  final words = name.trim().split(RegExp(r'\s+')).where((w) => w.isNotEmpty);
  return words
      .take(2)
      .map((w) => w.characters.first.toUpperCase())
      .join('\u200c');
}

/// The five of Diba's hues a name's avatar takes, in the order [dibaHueOf]
/// counts them.
const List<String> dibaNameHues = [
  'saffron',
  'garnet',
  'emerald',
  'sky',
  'iris',
];

/// The hue a name always gets, as the web's `hueOf` gives it: the hash stays
/// under 2^53 at every step, so it counts the same compiled to JavaScript.
String dibaHueOf(String name) {
  var h = 0;
  for (final c in name.codeUnits) {
    h = (h * 31 + c) % 1000003;
  }
  return dibaNameHues[h % dibaNameHues.length];
}

/// Persian digits with no grouping at all.
///
/// A year is not a quantity. `persianNumber(1404)` gives `۱٬۴۰۴`, which is
/// correct for a price and wrong for a date — the calendar header read
/// "مهر ۱٬۴۰۴" until a test went looking for "مهر ۱۴۰۴" and could not find it.
String persianDigits(int value) {
  final digits = value.abs().toString();
  final out = StringBuffer();
  for (var i = 0; i < digits.length; i++) {
    out.write(_persianDigits[digits.codeUnitAt(i) - 0x30]);
  }
  return value < 0 ? '-${out.toString()}' : out.toString();
}

/// Latin digits for any Persian or Arabic-Indic ones, so a value typed on a
/// Persian keyboard parses. `۱۲٫۵` and `١٢٫٥` both become `12.5`.
String latinDigits(String text) {
  final out = StringBuffer();
  for (final rune in text.runes) {
    if (rune >= 0x06F0 && rune <= 0x06F9) {
      out.writeCharCode(0x30 + rune - 0x06F0);
    } else if (rune >= 0x0660 && rune <= 0x0669) {
      out.writeCharCode(0x30 + rune - 0x0660);
    } else if (rune == 0x066B) {
      out.write('.');
    } else {
      out.writeCharCode(rune);
    }
  }
  return out.toString();
}

/// A number typed by a person, in either script, or null.
///
/// Grouping separators, spaces, percent signs and currency letters are
/// dropped first: a merchant who types `۱۲٬۰۰۰ تومان` meant twelve thousand.
num? parseLocalNumber(String text) {
  final cleaned = latinDigits(text).replaceAll(RegExp(r'[^0-9.\-]'), '');
  if (cleaned.isEmpty || cleaned == '-' || cleaned == '.') return null;
  return num.tryParse(cleaned);
}

/// A figure formatted the way NumberField, Slider and ProgressBar show it.
///
/// Unlike [persianNumber], this goes through `intl`'s NumberFormat, which the
/// spec names: decimals, percent and ISO currencies are more than a hand-rolled
/// grouping loop should carry. [style] is the schema's `formatStyle`.
///
/// `percent` takes a fraction, as React Aria's does: 0.15 is 15%.
///
/// `currency: IRT` is the toman, which ISO 4217 does not have: the amount in
/// whole numbers plus «تومان», as the web composes it.
String formatNumber(
  num value, {
  required bool persian,
  String style = 'decimal',
  String? currency,
  int? maximumFractionDigits,
}) {
  final locale = persian ? 'fa' : 'en';
  final NumberFormat format;
  // The rial is the one currency intl and the browser disagree on outright:
  // intl's table has the Latin word "Rial", glued to the digits even on a
  // Persian page. ICU writes «ریال» and a no-break space, so that is composed
  // here rather than shipped.
  final isRial = style == 'currency' && currency == 'IRR';
  final isToman =
      style == 'currency' && (currency == 'IRT' || currency == 'TOMAN');
  switch (style) {
    case 'percent':
      format = NumberFormat.percentPattern(locale);
    case 'currency' when currency != null && !isRial && !isToman:
      // simpleCurrency, not currency: the latter prints the ISO code, "USD1.00",
      // where the browser prints "$1.00".
      format = NumberFormat.simpleCurrency(locale: locale, name: currency);
    default:
      format = NumberFormat.decimalPattern(locale);
  }
  if (maximumFractionDigits != null) {
    format.maximumFractionDigits = maximumFractionDigits;
    if (format.minimumFractionDigits > maximumFractionDigits) {
      format.minimumFractionDigits = maximumFractionDigits;
    }
  }
  if (isToman) {
    format.maximumFractionDigits = 0;
    final word = dibaMessages['toman']![persian ? 'fa' : 'en']!;
    return '${format.format(value)} $word';
  }
  if (isRial) {
    format.maximumFractionDigits = 0;
    final digits = format.format(value);
    return persian ? '\u200Eریال\u00A0$digits' : 'IRR\u00A0$digits';
  }
  return format.format(value);
}
