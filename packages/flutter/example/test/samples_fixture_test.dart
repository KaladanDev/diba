import 'dart:convert';
import 'dart:io';

import 'package:diba_gallery/samples.dart';
import 'package:flutter_test/flutter_test.dart';

/// The gallery's trees, as the schema package checks them.
///
/// `packages/schema/fixtures/samples.json` holds every sample tree in both
/// languages, and the schema's own tests validate each one against the
/// generated JSON Schema: the trees Flutter draws are then trees the contract
/// allows. This holds the file to the code, so neither drifts.
///
/// After changing a sample, rewrite the file:
///
///     DIBA_WRITE_SAMPLES=1 flutter test test/samples_fixture_test.dart
void main() {
  test('packages/schema/fixtures/samples.json is the gallery', () {
    Object? group(SampleGroup g) => {
      'id': g.id,
      'title': g.title,
      'samples': [
        for (final s in g.samples)
          {'id': s.id, 'title': s.title, 'note': s.note, 'tree': s.tree},
      ],
    };
    // Through JSON and back, so the comparison is between the same kinds of
    // values the file holds.
    final gallery = jsonDecode(
      jsonEncode({
        'fa': [for (final g in galleryGroups(true)) group(g)],
        'en': [for (final g in galleryGroups(false)) group(g)],
      }),
    );

    // From packages/flutter/example to packages/schema/fixtures.
    final file = File(
      [
        Directory.current.parent.parent.path,
        'schema',
        'fixtures',
        'samples.json',
      ].join(Platform.pathSeparator),
    );

    if (Platform.environment['DIBA_WRITE_SAMPLES'] == '1') {
      file.writeAsStringSync(
        '${const JsonEncoder.withIndent('  ').convert(gallery)}\n',
      );
    }

    expect(
      file.existsSync(),
      isTrue,
      reason: '${file.path} is missing; run the tests from the example',
    );
    expect(
      jsonDecode(file.readAsStringSync()),
      gallery,
      reason:
          'The gallery changed; rewrite the file with '
          'DIBA_WRITE_SAMPLES=1 flutter test test/samples_fixture_test.dart',
    );
  });
}
