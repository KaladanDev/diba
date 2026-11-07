import 'package:diba/diba.dart';
import 'package:diba/src/sdui/date_calendar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// The copper leaves the components, as drawn. A link is the admin's link
/// colour, the picked day is gilt with slate on it, and the caret is the text
/// colour. The theme's values are pinned in theme_test.dart.
void main() {
  Future<void> show(
    WidgetTester tester,
    Widget child, {
    bool dark = false,
  }) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: dark ? DibaTheme.dark() : DibaTheme.light(),
        locale: const Locale('fa'),
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(
          body: Padding(padding: const EdgeInsets.all(24), child: child),
        ),
      ),
    );
    await tester.pump();
  }

  /// The style a piece of text is actually drawn in, after inheritance.
  TextStyle drawn(WidgetTester tester, String text) => tester
      .widget<RichText>(
        find.descendant(of: find.text(text), matching: find.byType(RichText)),
      )
      .text
      .style!;

  for (final dark in [false, true]) {
    final name = dark ? 'dark' : 'light';
    // The text colour, the web's slate.
    final ink = dark
        ? DibaDarkNeutrals.foreground
        : DibaLightNeutrals.foreground;

    testWidgets('$name: a link and its underline are the link colour', (
      tester,
    ) async {
      await show(
        tester,
        const DibaSurface(
          tree: {
            'type': 'Link',
            'props': {'href': 'https://kaladan.shop/help'},
            'children': 'راهنمای کالادان',
          },
        ),
        dark: dark,
      );
      final link = dark ? DibaDarkColors.link : DibaLightColors.link;
      final style = drawn(tester, 'راهنمای کالادان');
      expect(style.color, link);
      // The underline is drawn under the text, 4 below its baseline, as the
      // web's is; a TextStyle's could not be moved there.
      expect(style.decoration, isNot(TextDecoration.underline));
      final underlined = find.ancestor(
        of: find.text('راهنمای کالادان'),
        matching: find.byWidgetPredicate(
          (w) => w.runtimeType.toString() == '_Underlined',
        ),
      );
      expect(underlined, paints..rect(color: link));
    });

    testWidgets('$name: the caret is the text colour', (tester) async {
      await show(
        tester,
        const DibaSurface(
          tree: {
            'type': 'TextField',
            'props': {'label': 'نام', 'defaultValue': 'شال'},
          },
        ),
        dark: dark,
      );
      await tester.tap(find.byType(TextField));
      await tester.pump();
      final editable = tester.widget<EditableText>(find.byType(EditableText));
      expect(editable.cursorColor, ink);
    });

    testWidgets('$name: the picked day in a DateField’s picker', (
      tester,
    ) async {
      await show(
        tester,
        const DibaSurface(
          tree: {
            'type': 'DateField',
            'props': {'label': 'تاریخ ارسال', 'defaultValue': '2026-10-16'},
          },
        ),
        dark: dark,
      );
      await tester.tap(find.byType(TextField));
      await tester.pumpAndSettle();
      // Diba's calendar, where Material's dialog had been.
      expect(find.byType(DibaDateCalendar), findsOneWidget);
      // 2026-10-16 is 24 Mehr 1405.
      expect(drawn(tester, '۲۴').color, DibaLightColors.controlOnFill);
      // An unpicked day keeps the text colour.
      expect(drawn(tester, '۲۰').color, ink);
    });
  }
}
