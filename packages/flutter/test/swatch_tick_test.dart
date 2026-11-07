import 'package:diba/diba.dart';
import 'package:diba/src/sdui/glyphs.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// The chosen swatch's tick is black on a colour it is clearer on and white
/// on the rest, by relative luminance, as the web's: so at least 4.5 from the
/// colour, where a white tick on a mid grey had been 2.6 (2026-11-06).
void main() {
  Future<void> paint(WidgetTester tester, String hex) async {
    tester.view
      ..physicalSize = const Size(600, 400)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      MaterialApp(
        theme: DibaTheme.light(),
        locale: const Locale('fa'),
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(
          body: DibaSurface(
            tree: {
              'type': 'ColorSwatchPicker',
              'props': {
                'label': 'رنگ',
                'colors': [hex],
                'value': hex,
                'size': 'xl',
              },
            },
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
  }

  double contrast(Color a, Color b) {
    final la = a.computeLuminance();
    final lb = b.computeLuminance();
    final hi = la > lb ? la : lb;
    final lo = la > lb ? lb : la;
    return (hi + 0.05) / (lo + 0.05);
  }

  for (final (name, hex, ink) in [
    ('cream', 'f4efe6', Colors.black),
    ('gold', 'e7c873', Colors.black),
    ('saffron', 'c9821f', Colors.black),
    ('grey', '9ca3af', Colors.black),
    ('slate', '64748b', Colors.white),
    ('navy', '2f4a6b', Colors.white),
    ('maroon', '8c2f39', Colors.white),
  ]) {
    testWidgets('$name: the tick is ${ink == Colors.black ? 'black' : 'white'}'
        ', at least 4.5 from the colour', (tester) async {
      await paint(tester, '#$hex');
      final tick = tester.widget<DibaGlyphMark>(find.byType(DibaGlyphMark));
      expect(tick.color, ink);
      final colour = Color(0xFF000000 | int.parse(hex, radix: 16));
      expect(contrast(tick.color, colour), greaterThanOrEqualTo(4.5));
    });
  }
}
