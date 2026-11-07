import 'dart:math' as math;

import 'package:diba/diba.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// on a grey card the muted text is a step stronger, so its notes keep
/// 4.5:1: slate-600 on either grey in light, slate-300 on the third surface in
/// dark. The muted slate-500 was 4.35:1 on slate-100 and 3.86:1 on slate-200,
/// and slate-400 3.94:1 on slate-700. Everything in the card that reads the
/// muted colour takes it, as the web's card sets `--muted` for all it holds.
void main() {
  double luminance(Color c) {
    double channel(double v) =>
        v <= 0.03928 ? v / 12.92 : math.pow((v + 0.055) / 1.055, 2.4) * 1.0;
    return 0.2126 * channel(c.r) +
        0.7152 * channel(c.g) +
        0.0722 * channel(c.b);
  }

  double contrast(Color a, Color b) {
    final [hi, lo] = [luminance(a), luminance(b)]
      ..sort((x, y) => y.compareTo(x));
    return (hi + 0.05) / (lo + 0.05);
  }

  const cases = [
    // theme, variant, its paper, its notes
    ('light', 'default', DibaPalette.paper0, DibaPalette.slate500),
    ('light', 'secondary', DibaPalette.slate100, DibaPalette.slate600),
    ('light', 'tertiary', DibaPalette.slate200, DibaPalette.slate600),
    ('dark', 'default', DibaPalette.slate900, DibaPalette.slate400),
    ('dark', 'secondary', DibaPalette.slate800, DibaPalette.slate400),
    ('dark', 'tertiary', DibaPalette.slate700, DibaPalette.slate300),
  ];

  for (final (theme, variant, paper, notes) in cases) {
    testWidgets('$theme $variant: its notes in their slate, 4.5:1 or more', (
      tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: theme == 'light' ? DibaTheme.light() : DibaTheme.dark(),
          locale: const Locale('fa'),
          supportedLocales: const [Locale('fa'), Locale('en')],
          localizationsDelegates: GlobalMaterialLocalizations.delegates,
          home: Scaffold(
            body: SingleChildScrollView(
              child: DibaSurface(
                tree: {
                  'type': 'Stack',
                  'children': [
                    {
                      'type': 'Card',
                      'props': {
                        'variant': variant,
                        'title': 'سفارش ۱۰۴۱',
                        'description': 'دیروز',
                      },
                      'children': [
                        {
                          'type': 'Text',
                          'props': {'tone': 'muted', 'size': 'sm'},
                          'children': 'یادداشت',
                        },
                        {
                          'type': 'Fieldset',
                          'props': {
                            'legend': 'نشانی',
                            'description': 'به همین نشانی',
                          },
                        },
                      ],
                    },
                  ],
                },
              ),
            ),
          ),
        ),
      );
      await tester.pump();

      Color? ink(String words) {
        final text = tester.widget<Text>(find.text(words));
        return text.style?.color ??
            DefaultTextStyle.of(tester.element(find.text(words))).style.color;
      }

      for (final words in ['دیروز', 'یادداشت', 'به همین نشانی']) {
        expect(ink(words), notes, reason: words);
        expect(
          contrast(notes, paper),
          greaterThanOrEqualTo(4.5),
          reason: words,
        );
      }
    });
  }
}
