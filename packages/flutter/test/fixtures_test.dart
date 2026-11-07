import 'dart:convert';
import 'dart:io';

import 'package:diba/diba.dart';
import 'package:flutter_test/flutter_test.dart';

/// The fixtures both platforms test against: Diba's message
/// table, its email and URL rules, and what the browser prints for a number.
///
/// They live in `packages/schema/fixtures/`, beside the contract. A missing
/// directory fails rather than skips: a skipped parity test reports green
/// while checking nothing.
Directory _fixtures() {
  final dir = Directory(
    '${Directory.current.parent.path}${Platform.pathSeparator}schema'
    '${Platform.pathSeparator}fixtures',
  );
  if (!dir.existsSync()) {
    throw StateError(
      'No ${dir.path}. Run the tests from packages/flutter, '
      'in a checkout with packages/schema beside it.',
    );
  }
  return dir;
}

Map<String, Object?> _read(String name) =>
    jsonDecode(
          File(
            '${_fixtures().path}${Platform.pathSeparator}$name',
          ).readAsStringSync(),
        )
        as Map<String, Object?>;

void main() {
  group('the message table', () {
    test('is exactly fixtures/messages.json', () {
      final fixture = (_read('messages.json')['messages'] as Map)
          .cast<String, Object?>();
      final table = {
        for (final e in dibaMessages.entries) e.key: Map.of(e.value),
      };
      final expected = {
        for (final e in fixture.entries)
          e.key: (e.value as Map).cast<String, String>(),
      };
      expect(table, expected);
    });

    test('fills in {n}', () {
      expect(DibaStrings.fa.tooShort('۸'), 'دست‌کم ۸ نویسه بنویسید.');
      expect(DibaStrings.en.atMost('5,000'), 'Must be 5,000 or less.');
    });
  });

  group('the email and URL rules', () {
    final rules = _read('rules.json');

    for (final (name, pattern, check) in [
      ('email', dibaEmailPattern, dibaIsEmail),
      ('url', dibaUrlPattern, dibaIsWebUrl),
    ]) {
      final rule = (rules[name] as Map).cast<String, Object?>();
      test('$name: the pattern is the fixture\'s', () {
        expect(pattern, rule['pattern']);
      });
      for (final text in (rule['valid'] as List).cast<String>()) {
        test('$name accepts "$text"', () => expect(check(text), isTrue));
      }
      for (final text in (rule['invalid'] as List).cast<String>()) {
        test('$name refuses "$text"', () => expect(check(text), isFalse));
      }
    }
  });

  group('formatNumber prints what the browser prints', () {
    final cases = (_read('numbers.json')['cases'] as List)
        .cast<Map<String, Object?>>();
    for (final c in cases) {
      final label =
          '${c['locale']} ${c['style']} ${c['currency'] ?? ''} ${c['value']}';
      test(label, () {
        expect(
          formatNumber(
            c['value'] as num,
            persian: c['locale'] == 'fa',
            style: c['style'] as String,
            currency: c['currency'] as String?,
            maximumFractionDigits: c['maximumFractionDigits'] as int?,
          ),
          c['expected'],
        );
      });
    }
  });

  group("an avatar's initials and hue are the fixture's", () {
    final cases = (_read('avatars.json')['cases'] as List)
        .cast<Map<String, Object?>>();
    for (final c in cases) {
      final name = c['name'] as String;
      test('"$name"', () {
        expect(initialsOf(name), c['initials']);
        expect(name.trim().isEmpty ? null : dibaHueOf(name.trim()), c['hue']);
      });
    }
  });
}
