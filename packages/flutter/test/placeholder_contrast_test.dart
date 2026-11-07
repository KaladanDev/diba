import 'dart:math' as math;

import 'package:diba/diba.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// A field's placeholder holds 4.5:1 on its own fill, as the web's does: on a
/// page's field and on a secondary field's second surface, in both themes.
/// Slate-400 had been 2.6:1 on a white field.
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

  for (final dark in [false, true]) {
    for (final variant in ['primary', 'secondary']) {
      testWidgets('${dark ? 'dark' : 'light'} $variant: 4.5:1 or more', (
        tester,
      ) async {
        await tester.pumpWidget(
          MaterialApp(
            theme: dark ? DibaTheme.dark() : DibaTheme.light(),
            locale: const Locale('fa'),
            supportedLocales: const [Locale('fa'), Locale('en')],
            localizationsDelegates: GlobalMaterialLocalizations.delegates,
            home: Scaffold(
              body: DibaSurface(
                tree: {
                  'type': 'TextField',
                  'props': {
                    'label': 'نام',
                    'placeholder': 'نیلوفر',
                    'variant': variant,
                  },
                },
              ),
            ),
          ),
        );
        await tester.pump();
        final field = tester.widget<TextField>(find.byType(TextField));
        final hint = field.decoration!.hintStyle!.color!;
        final fill = field.decoration!.fillColor!;
        expect(contrast(hint, fill), greaterThanOrEqualTo(4.5));
      });
    }
  }
}
