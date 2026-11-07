import 'package:diba/diba.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// the extra components' status and hints — Tooltip, Badge,
/// ProgressCircle and Meter, in Diba's look
/// (`hints_look_test.dart` holds their numbers);
/// `hints.browser.test.tsx` holds the web's.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> node, {
    String lang = 'fa',
  }) async {
    tester.view
      ..physicalSize = const Size(1024, 900)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      MaterialApp(
        theme: DibaTheme.light(),
        locale: Locale(lang),
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(
          body: Padding(
            padding: const EdgeInsets.all(40),
            child: DibaSurface(tree: node),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
  }

  testWidgets('a tooltip is Material\'s, above its block unless asked below', (
    tester,
  ) async {
    await paint(tester, {
      'type': 'Tooltip',
      'props': {'content': 'ارسال رایگان', 'placement': 'bottom', 'delay': 300},
      'children': [
        {'type': 'Button', 'children': 'ارسال'},
      ],
    });
    final tip = tester.widget<Tooltip>(find.byType(Tooltip).first);
    expect(tip.message, 'ارسال رایگان');
    expect(tip.preferBelow, isTrue);
    expect(tip.waitDuration, const Duration(milliseconds: 300));
  });

  group('Badge', () {
    /// The badge's disc, ringed in the page's colour.
    final disc = find.byWidgetPredicate(
      (w) =>
          w is Container &&
          w.decoration is BoxDecoration &&
          (w.decoration as BoxDecoration).border != null,
    );

    Future<BoxDecoration> badge(
      WidgetTester tester,
      Map<String, Object?> props, {
      String lang = 'fa',
    }) async {
      await paint(tester, {
        'type': 'Badge',
        'props': props,
        'children': [
          {
            'type': 'Avatar',
            'props': {'name': 'نیلوفر رستمی'},
          },
        ],
      }, lang: lang);
      return tester.widget<Container>(disc).decoration! as BoxDecoration;
    }

    /// The block the badge sits on.
    Rect anchor(WidgetTester tester) => tester.getRect(
      find.ancestor(of: disc, matching: find.byType(Stack)).first,
    );

    testWidgets('a count in Persian digits, past max as «۹۹+», at the top '
        'end: the left in Persian', (tester) async {
      await badge(tester, {'content': 128, 'label': '۱۲۸ سفارش'});
      expect(find.text('۹۹+'), findsOneWidget);
      // The top end of a Persian page is its top left; the badge stands a
      // quarter of itself past that corner.
      final on = anchor(tester);
      final at = tester.getRect(disc);
      expect(at.left, on.left - at.width / 4);
      expect(at.top, on.top - at.height / 4);
      expect(find.bySemanticsLabel(RegExp('۱۲۸ سفارش')), findsOneWidget);
    });

    testWidgets("a label is the badge's own, an image read after what it "
        "sits on, in place of its digits; a dot's too", (tester) async {
      final semantics = tester.ensureSemantics();
      await badge(tester, {'content': 128, 'label': '۱۲۸ سفارش'});
      final count = find.bySemanticsLabel('۱۲۸ سفارش');
      expect(count, findsOneWidget);
      expect(find.bySemanticsLabel('نیلوفر رستمی'), findsOneWidget);
      expect(find.bySemanticsLabel(RegExp('۹۹')), findsNothing);
      expect(tester.getSemantics(count).flagsCollection.isImage, isTrue);
      await badge(tester, {
        'color': 'success',
        'size': 'sm',
        'label': 'آنلاین',
      });
      expect(find.bySemanticsLabel('آنلاین'), findsOneWidget);
      // Without a label, its digits are what it says.
      await badge(tester, {'content': 5});
      expect(find.bySemanticsLabel('۵'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('soft is the tone\'s tint; no content is a dot', (
      tester,
    ) async {
      final b = await badge(tester, {
        'variant': 'soft',
        'color': 'success',
        'placement': 'bottom-start',
      });
      expect(
        find.descendant(of: disc, matching: find.byType(Text)),
        findsNothing,
      );
      expect(b.color, DibaStatusColors.light.of('success').soft);
      // The bottom start: the bottom right in Persian.
      final on = anchor(tester);
      final at = tester.getRect(disc);
      expect(at.right, on.right + at.width / 4);
      expect(at.bottom, on.bottom + at.height / 4);
    });
  });

  testWidgets('a ring at its value, 36 across when large, named', (
    tester,
  ) async {
    await paint(tester, {
      'type': 'ProgressCircle',
      'props': {'value': 60, 'size': 'lg', 'label': 'پیشرفت'},
    });
    final named = tester.widget<Semantics>(
      find.byWidgetPredicate(
        (w) => w is Semantics && w.properties.label == 'پیشرفت',
      ),
    );
    expect(named.properties.value, '60');
    expect(
      tester.getSize(
        find.descendant(
          of: find.byWidget(named),
          matching: find.byType(CustomPaint),
        ),
      ),
      const Size(36, 36),
    );
  });

  testWidgets('a meter is the web\'s, its value in Persian digits', (
    tester,
  ) async {
    await paint(tester, {
      'type': 'Meter',
      'props': {'label': 'فضای ذخیره', 'value': 80},
    });
    expect(find.byType(LinearProgressIndicator), findsNothing);
    expect(find.text('فضای ذخیره'), findsOneWidget);
    expect(find.textContaining('۸۰'), findsOneWidget);
  });
}
