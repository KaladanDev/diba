import 'package:diba/diba.dart';
import 'package:diba/src/sdui/blocks/inputs.dart' show dibaPageItems;
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// the extra components' inputs — InputOTP, ButtonGroup, Pagination and
/// ColorSwatchPicker — in Material 3 with Diba's theme.
/// `inputs.browser.test.tsx` holds the web's.
void main() {
  Future<List<(String, Object?)>> paint(
    WidgetTester tester,
    Map<String, Object?> node, {
    List<String> events = const ['onChange'],
  }) async {
    final sent = <(String, Object?)>[];
    tester.view
      ..physicalSize = const Size(1024, 900)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      MaterialApp(
        theme: DibaTheme.light(),
        locale: const Locale('fa'),
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(
          body: Padding(
            padding: const EdgeInsets.all(20),
            child: DibaSurface(
              tree: {
                ...node,
                'actions': {
                  for (final e in events)
                    e: {'do': 'call', 'action': e, 'value': 'v'},
                },
              },
              handlers: DibaHandlers(call: (a, p) => sent.add((a, p['v']))),
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
    return sent;
  }

  group('InputOTP', () {
    testWidgets('six boxes; Persian digits typed leave as Latin; a full code '
        'completes', (tester) async {
      final sent = await paint(
        tester,
        {
          'type': 'InputOTP',
          'props': {'label': 'کد تأیید'},
        },
        events: ['onChange', 'onComplete'],
      );
      final boxes = find.byWidgetPredicate(
        (w) => w is AnimatedContainer && w.constraints?.maxWidth == 38,
      );
      expect(boxes, findsNWidgets(6));
      await tester.enterText(find.byType(TextField), '۱۲۳۴۵۶');
      await tester.pumpAndSettle();
      expect(sent.where((s) => s.$1 == 'onChange').last.$2, '123456');
      expect(sent.where((s) => s.$1 == 'onComplete').last.$2, '123456');
      // Drawn in Persian digits on a Persian page.
      expect(find.text('۴'), findsOneWidget);
    });

    testWidgets('four boxes, its error under it', (tester) async {
      await paint(tester, {
        'type': 'InputOTP',
        'props': {'label': 'کد', 'length': 4, 'errorMessage': 'کد درست نیست.'},
      });
      expect(
        find.byWidgetPredicate(
          (w) => w is AnimatedContainer && w.constraints?.maxWidth == 38,
        ),
        findsNWidgets(4),
      );
      expect(find.text('کد درست نیست.'), findsOneWidget);
    });

    testWidgets(
      "on a grey card its boxes are fields: the field's edge, the second surface",
      (tester) async {
        await paint(tester, {
          'type': 'InputOTP',
          'props': {'label': 'کد', 'length': 4, 'variant': 'secondary'},
        });
        final box = tester.widget<AnimatedContainer>(
          find
              .byWidgetPredicate(
                (w) => w is AnimatedContainer && w.constraints?.maxWidth == 38,
              )
              .first,
        );
        final decoration = box.decoration! as BoxDecoration;
        final theme = DibaTheme.light();
        expect(decoration.color, theme.colorScheme.surfaceContainer);
        expect(decoration.border, isNotNull);
        expect(
          (decoration.border! as Border).top.color,
          DibaLightNeutrals.fieldBorder,
        );
      },
    );
  });

  testWidgets('a ButtonGroup\'s buttons take its variant where they set none, '
      'square inside its clip; one\'s own stays', (tester) async {
    await paint(tester, {
      'type': 'ButtonGroup',
      'props': {'variant': 'outline', 'size': 'md'},
      'children': [
        {'type': 'Button', 'children': 'روز'},
        {
          'type': 'Button',
          'props': {'variant': 'primary'},
          'children': 'ماه',
        },
      ],
    }, events: const []);
    expect(
      find.ancestor(
        of: find.text('روز'),
        matching: find.byType(OutlinedButton),
      ),
      findsOneWidget,
    );
    expect(
      find.ancestor(of: find.text('ماه'), matching: find.byType(FilledButton)),
      findsOneWidget,
    );
    final outlined = tester.widget<OutlinedButton>(
      find.ancestor(
        of: find.text('روز'),
        matching: find.byType(OutlinedButton),
      ),
    );
    // Each shaped by its place in the group, not a clip round it.
    expect(outlined.style!.shape!.resolve({}), isNot(isA<StadiumBorder>()));
  });

  group('Pagination', () {
    test('the pages shown are the web\'s', () {
      expect(dibaPageItems(page: 6, total: 12), [1, null, 5, 6, 7, null, 12]);
      expect(dibaPageItems(page: 1, total: 4), [1, 2, 3, 4]);
      expect(dibaPageItems(page: 2, total: 30), [1, 2, 3, 4, 5, null, 30]);
      // A gap first opens when it would hide two pages: 2 and 3 here.
      expect(dibaPageItems(page: 5, total: 30), [1, null, 4, 5, 6, null, 30]);
      expect(dibaPageItems(page: 26, total: 30), [
        1,
        null,
        25,
        26,
        27,
        null,
        30,
      ]);
    });

    testWidgets('a page pressed is sent; next goes on; previous is off on '
        'the first page', (tester) async {
      final sent = await paint(tester, {
        'type': 'Pagination',
        'props': {'total': 12, 'defaultPage': 6},
      });
      expect(find.text('۱۲'), findsOneWidget);
      expect(find.text('…'), findsNWidgets(2));
      await tester.tap(find.text('۷'));
      await tester.pumpAndSettle();
      expect(sent.last.$2, 7);
      await tester.tap(find.text('بعدی'));
      await tester.pumpAndSettle();
      expect(sent.last.$2, 8);
    });
  });

  testWidgets('on the first page, previous is off', (tester) async {
    await paint(tester, {
      'type': 'Pagination',
      'props': {'total': 4},
    });
    final previous = tester.widget<GestureDetector>(
      find
          .ancestor(
            of: find.text('قبلی'),
            matching: find.byType(GestureDetector),
          )
          .first,
    );
    expect(previous.onTap, isNull);
  });

  testWidgets('swatches: one a colour the app sent; the one pressed is sent '
      'as #rrggbb, the chosen ticked', (tester) async {
    final sent = await paint(tester, {
      'type': 'ColorSwatchPicker',
      'props': {
        'label': 'رنگ برند',
        'colors': ['#e8a33d', '#3f8f6b', 'not a colour'],
        'defaultValue': '#e8a33d',
      },
    });
    final swatches = find.byWidgetPredicate(
      (w) =>
          w is Semantics &&
          w.properties.button == true &&
          (w.properties.label ?? '').startsWith('#'),
    );
    expect(swatches, findsNWidgets(2));
    // The tick grows in on the chosen one only.
    final ticks = tester.widgetList<AnimatedScale>(
      find.ancestor(
        of: find.byWidgetPredicate(
          (w) =>
              w is CustomPaint &&
              w.painter.runtimeType.toString() == '_GlyphPainter',
        ),
        matching: find.byType(AnimatedScale),
      ),
    );
    expect([for (final t in ticks) t.scale], containsAll([1.0, 0.0]));
    await tester.tap(swatches.at(1));
    await tester.pumpAndSettle();
    expect(sent.last.$2, '#3f8f6b');
  });
}
