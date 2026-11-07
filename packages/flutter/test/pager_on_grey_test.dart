import 'package:diba/diba.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// A pager marks the page it shows with the surface on a grey card, as the
/// web's does: its neutral fill is the second surface's own colour in dark
/// and the third's in light. And it is named "Pagination" in the page's
/// language when the tree gives it no label.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    bool dark = false,
    String lang = 'fa',
  }) async {
    tester.view
      ..physicalSize = const Size(900, 900)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      MaterialApp(
        theme: dark ? DibaTheme.dark() : DibaTheme.light(),
        locale: Locale(lang),
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(
          body: SingleChildScrollView(child: DibaSurface(tree: tree)),
        ),
      ),
    );
    await tester.pump();
  }

  Map<String, Object?> pager() => {
    'type': 'Pagination',
    'props': {'total': 3, 'defaultPage': 2, 'showControls': false},
  };

  for (final dark in [false, true]) {
    final surface = dark ? DibaDarkNeutrals.surface : DibaLightNeutrals.surface;
    final fill = dark ? DibaDarkNeutrals.fill : DibaLightNeutrals.fill;
    for (final (variant, want) in [
      (null, fill),
      ('default', fill),
      ('secondary', surface),
      ('tertiary', surface),
    ]) {
      testWidgets('${dark ? 'dark' : 'light'}: on ${variant ?? 'the page'}, '
          'the page shown is ${want == surface ? 'the surface' : 'the fill'}', (
        tester,
      ) async {
        await paint(
          tester,
          variant == null
              ? pager()
              : {
                  'type': 'Card',
                  'props': {'variant': variant},
                  'children': [pager()],
                },
          dark: dark,
        );
        final mark = tester
            .widgetList<DecoratedBox>(
              find.ancestor(
                of: find.text('۲'),
                matching: find.byType(DecoratedBox),
              ),
            )
            .map((box) => box.decoration)
            .whereType<ShapeDecoration>()
            .first
            .color;
        expect(mark, want);
      });
    }
  }

  for (final (lang, name) in [('fa', 'صفحه‌بندی'), ('en', 'Pagination')]) {
    testWidgets('$lang: a pager with no label is named "$name"', (
      tester,
    ) async {
      final semantics = tester.ensureSemantics();
      await paint(tester, pager(), lang: lang);
      expect(find.bySemanticsLabel(name), findsOneWidget);
      semantics.dispose();
    });
  }
}
