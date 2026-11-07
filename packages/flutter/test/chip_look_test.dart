import 'package:diba/diba.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// The chip in Flutter's look. The web's chip now follows this one; these
/// hold the reference still, and `alert.browser.test.tsx` holds the web to
/// it.
void main() {
  Future<void> paint(
    WidgetTester tester,
    List<Map<String, Object?>> chips, {
    bool dark = false,
  }) async {
    tester.view
      ..physicalSize = const Size(1024, 900)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      MaterialApp(
        theme: dark ? DibaTheme.dark() : DibaTheme.light(),
        locale: const Locale('en'),
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(
          body: Padding(
            padding: const EdgeInsets.all(20),
            child: DibaSurface(tree: {'type': 'Stack', 'children': chips}),
          ),
        ),
      ),
    );
    await tester.pump();
  }

  Map<String, Object?> chip(Map<String, Object?> props, String text) => {
    'type': 'Chip',
    'props': props,
    'children': text,
  };

  /// The chip's box round [text].
  Finder box(String text) => find
      .ancestor(
        of: find.text(text),
        matching: find.byWidgetPredicate(
          (w) => w is Container && w.decoration is BoxDecoration,
        ),
      )
      .first;

  BoxDecoration decoration(WidgetTester tester, String text) =>
      tester.widget<Container>(box(text)).decoration! as BoxDecoration;

  testWidgets('24, 28 or 32 tall and round; a third of its height in from '
      'each end; its icon 0.55 of its height, 4 from its words', (
    tester,
  ) async {
    await paint(tester, [
      chip({'size': 'sm', 'icon': 'circle-check', 'color': 'success'}, 'Paid'),
      chip({'size': 'md', 'icon': 'clock', 'color': 'warning'}, 'Pending'),
      chip({'size': 'lg', 'icon': 'circle-x', 'color': 'danger'}, 'Cancelled'),
    ]);
    for (final (text, icon, height) in [
      ('Paid', 'circle-check', 24.0),
      ('Pending', 'clock', 28.0),
      ('Cancelled', 'circle-x', 32.0),
    ]) {
      final rect = tester.getRect(box(text));
      expect(rect.height, height, reason: text);
      expect(
        decoration(tester, text).borderRadius,
        BorderRadius.circular(height / 2),
      );
      final glyph = tester.getRect(find.byIcon(dibaIcon(icon)!));
      expect(glyph.width, closeTo(height * 0.55, 1e-9), reason: text);
      expect(glyph.left - rect.left, closeTo(height / 3, 1e-9), reason: text);
      final words = tester.getRect(find.text(text));
      expect(words.left - glyph.right, closeTo(4, 1e-9), reason: text);
      expect(rect.right - words.right, closeTo(height / 3, 1e-9), reason: text);
      final style = tester.widget<Text>(find.text(text)).style!;
      expect(style.fontSize, height == 32 ? 14 : 12, reason: text);
      expect(style.fontWeight, FontWeight.w500, reason: text);
    }
  });

  testWidgets('small, soft and default unless the tree says otherwise', (
    tester,
  ) async {
    await paint(tester, [chip({}, 'Plain')]);
    expect(tester.getRect(box('Plain')).height, 24);
    expect(
      decoration(tester, 'Plain').color,
      DibaLightNeutrals.surfaceSecondary,
    );
  });

  for (final dark in [false, true]) {
    testWidgets('${dark ? 'dark' : 'light'}: each variant in the status '
        'tones', (tester) async {
      const statuses = ['default', 'accent', 'success', 'warning', 'danger'];
      await paint(tester, [
        for (final variant in ['soft', 'primary', 'secondary', 'tertiary'])
          for (final color in statuses)
            chip({'variant': variant, 'color': color}, '$variant $color'),
      ], dark: dark);
      final c = dark ? DibaStatusColors.dark : DibaStatusColors.light;
      final second = dark
          ? DibaDarkNeutrals.surfaceSecondary
          : DibaLightNeutrals.surfaceSecondary;
      final hairline = dark
          ? DibaDarkNeutrals.border
          : DibaLightNeutrals.border;
      for (final color in statuses) {
        final tone = c.of(color);
        Color ink(String text) =>
            tester.widget<Text>(find.text(text)).style!.color!;
        expect(decoration(tester, 'soft $color').color, tone.soft);
        expect(ink('soft $color'), tone.ink);
        expect(decoration(tester, 'primary $color').color, tone.solid);
        expect(ink('primary $color'), tone.onSolid);
        expect(decoration(tester, 'secondary $color').color, second);
        expect(ink('secondary $color'), tone.ink);
        final tertiary = decoration(tester, 'tertiary $color');
        expect(tertiary.color, Colors.transparent);
        expect(tertiary.border, Border.all(color: hairline));
        expect(ink('tertiary $color'), tone.ink);
        expect(decoration(tester, 'soft $color').border, isNull);
      }
      // The tints are the alert's: 12% of the status over the surface, 22%
      // in dark.
      final surface = dark
          ? DibaDarkNeutrals.surface
          : DibaLightNeutrals.surface;
      expect(
        c.success.soft,
        Color.alphaBlend(
          (dark ? DibaDarkColors.success : DibaLightColors.success).withValues(
            alpha: dark ? 0.22 : 0.12,
          ),
          surface,
        ),
      );
    });
  }
}
