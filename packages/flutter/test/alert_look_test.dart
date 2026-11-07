import 'package:diba/diba.dart';
import 'package:diba/src/sdui/glyphs.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// The alert in Diba's look. Every number here is the web's.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    bool dark = false,
    String lang = 'en',
    DibaHandlers handlers = const DibaHandlers(),
  }) async {
    tester.view
      ..physicalSize = const Size(1024, 900)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      MaterialApp(
        theme: dark ? DibaTheme.dark() : DibaTheme.light(),
        locale: Locale(lang),
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(
          body: Padding(
            padding: const EdgeInsets.all(20),
            child: DibaSurface(tree: tree, handlers: handlers),
          ),
        ),
      ),
    );
    await tester.pump();
  }

  Map<String, Object?> alert(
    Map<String, Object?> props, {
    Map<String, Object?>? slots,
    Map<String, Object?>? actions,
  }) => {
    'type': 'Alert',
    'props': {'status': 'danger', 'title': 'Payment failed', ...props},
    'slots': ?slots,
    'actions': ?actions,
  };

  /// The alert round [text]: its tint 24 round.
  Finder frame(String text) => find
      .ancestor(
        of: find.text(text),
        matching: find.byWidgetPredicate(
          (w) =>
              w is DecoratedBox &&
              w.decoration is BoxDecoration &&
              (w.decoration as BoxDecoration).borderRadius ==
                  const BorderRadius.all(Radius.circular(24)),
        ),
      )
      .first;

  Color fill(WidgetTester tester, String text) =>
      (tester.widget<DecoratedBox>(frame(text)).decoration as BoxDecoration)
          .color!;

  Finder glyph(DibaGlyph g) =>
      find.byWidgetPredicate((w) => w is DibaGlyphMark && w.glyph == g);

  /// The status's mark, Lucide's as the web's.
  Finder mark(String name) => find.byIcon(dibaIcon(name)!);

  DibaStatusColors colours(WidgetTester tester) => Theme.of(
    tester.element(find.byType(DibaSurface)),
  ).extension<DibaStatusColors>()!;

  testWidgets(
    '12 above and below, 16 across; the mark 20 in a 24 box, the '
    'words 16 after it',
    (tester) async {
      await paint(tester, alert({'description': 'Try again.'}));
      final box = tester.getRect(frame('Payment failed'));
      final mark = tester.getRect(find.byIcon(dibaIcon('circle-alert')!));
      expect(mark.size, const Size(20, 20));
      expect(mark.topLeft, box.topLeft + const Offset(18, 14));
      final title = tester.getRect(find.text('Payment failed'));
      expect(title.topLeft, box.topLeft + const Offset(56, 12));
      expect(title.height, 24);
      final description = tester.getRect(find.text('Try again.'));
      expect(description.topLeft, box.topLeft + const Offset(56, 36));
      expect(description.height, 20);
      expect(box.height, 12 + 24 + 20 + 12);
    },
  );

  testWidgets('the title 14 on 24, medium, in the status ink; the '
      'description 14 on 20 in the text colour', (tester) async {
    await paint(tester, alert({'description': 'Try again.'}));
    final ink = colours(tester).danger.ink;
    final title = tester.widget<Text>(find.text('Payment failed')).style!;
    expect(title.fontSize, 14);
    expect(title.height, 24 / 14);
    expect(title.fontWeight, FontWeight.w500);
    expect(title.color, ink);
    final description = tester.widget<Text>(find.text('Try again.')).style!;
    expect(description.fontSize, 14);
    expect(description.height, 20 / 14);
    expect(description.color, DibaLightNeutrals.foreground);
    expect(tester.widget<Icon>(mark('circle-alert')).color, ink);
  });

  for (final dark in [false, true]) {
    testWidgets('${dark ? 'dark' : 'light'}: each status its tint and its '
        'mark', (tester) async {
      await paint(tester, {
        'type': 'Stack',
        'children': [
          for (final s in ['default', 'accent', 'success', 'warning', 'danger'])
            {
              'type': 'Alert',
              'props': {'status': s, 'title': s},
            },
        ],
      }, dark: dark);
      final c = colours(tester);
      final surface = dark
          ? DibaDarkNeutrals.surface
          : DibaLightNeutrals.surface;
      final share = dark ? 0.22 : 0.12;
      Color tint(Color status) =>
          Color.alphaBlend(status.withValues(alpha: share), surface);
      expect(
        fill(tester, 'default'),
        dark
            ? DibaDarkNeutrals.surfaceSecondary
            : DibaLightNeutrals.surfaceSecondary,
      );
      expect(
        fill(tester, 'accent'),
        dark ? DibaDarkColors.primarySoft : DibaLightColors.primarySoft,
      );
      expect(
        fill(tester, 'success'),
        tint(dark ? DibaDarkColors.success : DibaLightColors.success),
      );
      expect(
        fill(tester, 'warning'),
        tint(dark ? DibaDarkColors.warning : DibaLightColors.warning),
      );
      expect(
        fill(tester, 'danger'),
        tint(dark ? DibaDarkColors.danger : DibaLightColors.danger),
      );
      expect(
        c.warning.ink,
        dark ? DibaDarkColors.warningEmphasis : DibaLightColors.warningEmphasis,
      );
      // Lucide's marks, as the web's: info for default and accent,
      // each 20 across.
      expect(mark('info'), findsNWidgets(2));
      expect(mark('circle-check'), findsOneWidget);
      expect(mark('triangle-alert'), findsOneWidget);
      expect(mark('circle-alert'), findsOneWidget);
      for (final s in [
        'info',
        'circle-check',
        'triangle-alert',
        'circle-alert',
      ]) {
        for (final e in mark(s).evaluate()) {
          expect(e.size, const Size(20, 20));
        }
      }
    });
  }

  testWidgets('its own icon, 20 in the status ink, in the mark\'s place', (
    tester,
  ) async {
    await paint(tester, alert({'status': 'accent', 'icon': 'sparkles'}));
    final icon = find.byIcon(dibaIcon('sparkles')!);
    final box = tester.getRect(frame('Payment failed'));
    expect(
      tester.getRect(icon),
      box.topLeft + const Offset(18, 14) & const Size(20, 20),
    );
    expect(tester.widget<Icon>(icon).color, colours(tester).accent.ink);
    expect(mark('info'), findsNothing);
  });

  testWidgets('without its mark, the words 16 from the start', (tester) async {
    await paint(tester, alert({'hideIcon': true}));
    final box = tester.getRect(frame('Payment failed'));
    expect(
      tester.getRect(find.text('Payment failed')).topLeft,
      box.topLeft + const Offset(16, 12),
    );
    expect(box.height, 48);
  });

  testWidgets('its actions 8 under the words', (tester) async {
    await paint(
      tester,
      alert(
        {'description': 'Try again.'},
        slots: {
          'actions': {
            'type': 'Button',
            'props': {'variant': 'danger'},
            'children': 'Retry',
          },
        },
      ),
    );
    final box = tester.getRect(frame('Payment failed'));
    final button = tester.getRect(find.widgetWithText(FilledButton, 'Retry'));
    expect(button.top, tester.getRect(find.text('Try again.')).bottom + 8);
    expect(button.left, box.left + 56);
    expect(box.bottom, button.bottom + 12);
  });

  testWidgets('dismissible: the web\'s close button at the end, 16 from the '
      'words; a press hides it and fires onClose', (tester) async {
    String? called;
    await paint(
      tester,
      alert(
        {'isDismissible': true},
        actions: {
          'onClose': {'do': 'call', 'action': 'notice.dismiss'},
        },
      ),
      handlers: DibaHandlers(call: (a, p) => called = a),
    );
    final box = tester.getRect(frame('Payment failed'));
    final close = tester.getRect(
      find.ancestor(
        of: glyph(DibaGlyph.close),
        matching: find.byType(FilledButton),
      ),
    );
    expect(close.size, const Size(24, 24));
    expect(close.topRight, box.topRight + const Offset(-16, 12));
    final words = tester.getRect(
      find
          .ancestor(
            of: find.text('Payment failed'),
            matching: find.byType(Column),
          )
          .first,
    );
    expect(close.left - words.right, 16);
    expect(
      tester.widget<DibaGlyphMark>(glyph(DibaGlyph.close)).color,
      DibaLightNeutrals.muted,
    );

    await tester.tap(glyph(DibaGlyph.close));
    await tester.pump();
    expect(find.text('Payment failed'), findsNothing);
    expect(called, 'notice.dismiss');
  });

  testWidgets('in Persian the mark is at the right and the close button at '
      'the left', (tester) async {
    await paint(tester, alert({'isDismissible': true}), lang: 'fa');
    final box = tester.getRect(frame('Payment failed'));
    expect(tester.getRect(mark('circle-alert')).right, box.right - 18);
    expect(
      tester
          .getRect(
            find.ancestor(
              of: glyph(DibaGlyph.close),
              matching: find.byType(FilledButton),
            ),
          )
          .left,
      box.left + 16,
    );
  });
}
