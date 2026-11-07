import 'package:flutter_test/flutter_test.dart';
import 'package:diba/diba.dart';

/// Persian formatting, pinned to the web.
///
/// `persianNumber` is a hand-written stand-in for `Intl.NumberFormat('fa-IR')`,
/// which the React side gets from the platform and Dart does not have without
/// the `intl` package. A reimplementation is only safe while something holds it
/// to the original, so every expected string here was produced by running
/// `Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(n)` in Node
/// and copying the result.
///
/// The separator is the trap. It is U+066C, the Arabic thousands separator, not
/// the comma a Latin-minded implementation reaches for — one character, and the
/// two platforms would print prices that differ.
void main() {
  group('persianNumber matches Intl.NumberFormat(fa-IR)', () {
    test('groups in threes with U+066C', () {
      expect(persianNumber(890000), '۸۹۰٬۰۰۰');
      expect(persianNumber(1240000), '۱٬۲۴۰٬۰۰۰');
      expect(persianNumber(3200000), '۳٬۲۰۰٬۰۰۰');
      expect(persianNumber(1600000), '۱٬۶۰۰٬۰۰۰');
    });

    test('leaves short numbers ungrouped', () {
      expect(persianNumber(0), '۰');
      expect(persianNumber(5), '۵');
      expect(persianNumber(12), '۱۲');
      expect(persianNumber(999), '۹۹۹');
    });

    test('the separator really is U+066C and not a comma', () {
      expect(persianNumber(1234567).contains(','), isFalse);
      expect(persianNumber(1234567).contains('٬'), isTrue);
    });

    test('the digits really are U+06F0 to U+06F9', () {
      expect(persianNumber(1234567890), '۱٬۲۳۴٬۵۶۷٬۸۹۰');
      expect(RegExp(r'[0-9]').hasMatch(persianNumber(1234567890)), isFalse);
    });

    /// Toman has no minor unit, and the web asks for maximumFractionDigits: 0.
    test('rounds rather than showing a fraction', () {
      expect(persianNumber(1240000.4), '۱٬۲۴۰٬۰۰۰');
      expect(persianNumber(1239999.6), '۱٬۲۴۰٬۰۰۰');
    });
  });

  group('initialsOf is as dumb as the web version', () {
    test('takes the first letter of the first two words', () {
      // Kept apart by a zero-width non-joiner, Latin ones in capitals.
      expect(initialsOf('نیلوفر رستمی'), 'ن‌ر');
      expect(initialsOf('Niloufar Rostami'), 'N‌R');
      expect(initialsOf('Ada'), 'A');
      expect(initialsOf('  spaced   out  name '), 'S‌O');
      expect(initialsOf(''), '');
    });
  });

  /// formatNumber's cases live in `packages/schema/fixtures/numbers.json`
  /// and are run by `fixtures_test.dart`, so the web tests against the same
  /// strings.
  group('parseLocalNumber', () {
    test('a number typed in either script parses', () {
      expect(parseLocalNumber('۱۲٬۵۰۰'), 12500);
      expect(parseLocalNumber('١٢٫٥'), 12.5);
      expect(parseLocalNumber('۱۵٪'), 15);
      expect(parseLocalNumber(''), isNull);
    });
  });
}
