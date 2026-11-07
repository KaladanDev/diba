import 'package:diba/diba.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// A default snippet on a grey card takes the surface, as the web's: the
/// second surface is the card's own grey there, so it had no frame. Off a
/// grey card it keeps the second surface (2026-11-06).
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    required bool dark,
  }) async {
    tester.view
      ..physicalSize = const Size(700, 500)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      MaterialApp(
        theme: dark ? DibaTheme.dark() : DibaTheme.light(),
        locale: const Locale('fa'),
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(body: DibaSurface(tree: tree)),
      ),
    );
    await tester.pump();
  }

  Color? fillOf(WidgetTester tester) {
    final box = tester.widget<Container>(
      find
          .ancestor(
            of: find.textContaining('DB-1041'),
            matching: find.byType(Container),
          )
          .first,
    );
    return (box.decoration as BoxDecoration?)?.color;
  }

  const snippet = {'type': 'Snippet', 'children': 'DB-1041'};

  for (final dark in [false, true]) {
    final surface = dark ? DibaDarkNeutrals.surface : DibaLightNeutrals.surface;
    for (final variant in ['secondary', 'tertiary']) {
      testWidgets(
        '${dark ? 'dark' : 'light'}: on a $variant card, the surface',
        (tester) async {
          await paint(tester, {
            'type': 'Card',
            'props': {'variant': variant},
            'children': [snippet],
          }, dark: dark);
          expect(fillOf(tester), surface);
        },
      );
    }

    testWidgets('${dark ? 'dark' : 'light'}: on the page, not the surface', (
      tester,
    ) async {
      await paint(tester, snippet, dark: dark);
      expect(fillOf(tester), isNot(surface));
    });
  }
}
