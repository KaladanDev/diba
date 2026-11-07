import 'package:diba/diba.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// the extra components' structure — Tabs, an Accordion, a Separator, a
/// Fieldset and a Drawer — in Material 3 with Diba's theme.
/// `structure.browser.test.tsx` holds the web's.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> node, {
    String event = 'onChange',
    DibaHandlers handlers = const DibaHandlers(),
  }) async {
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
                  event: {'do': 'call', 'action': 'save', 'value': 'v'},
                },
              },
              handlers: handlers,
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
  }

  Map<String, Object?> text(String s) => {'type': 'Text', 'children': s};

  Map<String, Object?> tabs([String variant = 'primary']) => {
    'type': 'Tabs',
    'props': {'label': 'بخش‌ها', 'variant': variant},
    'children': [
      {
        'type': 'Tab',
        'props': {'id': 'items', 'label': 'اقلام', 'icon': 'package'},
        'children': [text('سه قلم')],
      },
      {
        'type': 'Tab',
        'props': {'id': 'shipping', 'label': 'ارسال'},
        'children': [text('تیپاکس')],
      },
      {
        'type': 'Tab',
        'props': {'id': 'notes', 'label': 'یادداشت', 'isDisabled': true},
        'children': [text('هیچ')],
      },
    ],
  };

  group('Tabs', () {
    testWidgets('primary is the segment pill; starts on the first tab, sends '
        'the tab chosen and shows its panel', (tester) async {
      Map<String, Object?>? sent;
      await paint(
        tester,
        tabs(),
        handlers: DibaHandlers(call: (_, p) => sent = p),
      );
      expect(find.byType(TabBar), findsOneWidget);
      expect(find.text('سه قلم'), findsOneWidget);
      expect(find.text('تیپاکس'), findsNothing);
      await tester.tap(find.text('ارسال'));
      await tester.pumpAndSettle();
      expect(sent, {'v': 'shipping'});
      expect(find.text('تیپاکس'), findsOneWidget);
    });

    testWidgets('a disabled tab is not chosen', (tester) async {
      Map<String, Object?>? sent;
      await paint(
        tester,
        tabs(),
        handlers: DibaHandlers(call: (_, p) => sent = p),
      );
      await tester.tap(find.text('یادداشت'));
      await tester.pumpAndSettle();
      expect(sent, isNull);
      expect(find.text('سه قلم'), findsOneWidget);
    });

    testWidgets('secondary is Material\'s line', (tester) async {
      await paint(tester, tabs('secondary'));
      final bar = tester.widget<TabBar>(find.byType(TabBar));
      expect(
        (bar.indicator! as UnderlineTabIndicator).borderSide.color,
        DibaLightColors.controlFill,
      );
    });
  });

  Map<String, Object?> accordion([Map<String, Object?> props = const {}]) => {
    'type': 'Accordion',
    'props': {
      'defaultExpandedKeys': ['ship'],
      ...props,
    },
    'children': [
      {
        'type': 'AccordionItem',
        'props': {'id': 'ship', 'title': 'ارسال'},
        'children': [text('دو روز')],
      },
      {
        'type': 'AccordionItem',
        'props': {'id': 'return', 'title': 'مرجوعی'},
        'children': [text('هفت روز')],
      },
    ],
  };

  group('Accordion', () {
    testWidgets('opens what the tree opened; one at a time, the one pressed '
        'is sent and the other closes', (tester) async {
      Map<String, Object?>? sent;
      await paint(
        tester,
        accordion(),
        event: 'onExpandedChange',
        handlers: DibaHandlers(call: (_, p) => sent = p),
      );
      expect(find.text('دو روز'), findsOneWidget);
      expect(find.text('هفت روز'), findsNothing);
      await tester.tap(find.text('مرجوعی'));
      await tester.pumpAndSettle();
      expect(sent, {
        'v': ['return'],
      });
      expect(find.text('هفت روز'), findsOneWidget);
      expect(find.text('دو روز'), findsNothing);
    });

    testWidgets('with more allowed, both stay open', (tester) async {
      Map<String, Object?>? sent;
      await paint(
        tester,
        accordion({'allowsMultipleExpanded': true}),
        event: 'onExpandedChange',
        handlers: DibaHandlers(call: (_, p) => sent = p),
      );
      await tester.tap(find.text('مرجوعی'));
      await tester.pumpAndSettle();
      expect((sent!['v'] as List)..sort(), ['return', 'ship']);
      expect(find.text('دو روز'), findsOneWidget);
    });

    testWidgets('surface lays the items on a card\'s paper', (tester) async {
      await paint(tester, accordion({'variant': 'surface'}));
      final paper = tester.widget<DecoratedBox>(
        find
            .ancestor(
              of: find.text('ارسال'),
              matching: find.byWidgetPredicate(
                (w) =>
                    w is DecoratedBox &&
                    w.decoration is BoxDecoration &&
                    (w.decoration as BoxDecoration).borderRadius != null,
              ),
            )
            .first,
      );
      expect(
        (paper.decoration as BoxDecoration).borderRadius,
        BorderRadius.circular(24),
      );
    });
  });

  group('Separator and Fieldset', () {
    testWidgets('a separator is a line across, or down', (tester) async {
      await paint(tester, {
        'type': 'Stack',
        'children': [
          {'type': 'Separator'},
          {
            'type': 'Stack',
            'props': {'direction': 'horizontal', 'align': 'center'},
            'children': [
              text('الف'),
              {
                'type': 'Separator',
                'props': {'orientation': 'vertical'},
              },
              text('ب'),
            ],
          },
        ],
      });
      expect(find.byType(Divider), findsOneWidget);
      final down = tester.getSize(
        find
            .descendant(
              of: find.byType(Row),
              matching: find.byWidgetPredicate(
                (w) => w is LeafRenderObjectWidget,
              ),
            )
            .first,
      );
      expect(down.width, 1);
      expect(down.height, greaterThanOrEqualTo(8));
    });

    testWidgets('a fieldset draws its legend, its help and its fields', (
      tester,
    ) async {
      await paint(tester, {
        'type': 'Fieldset',
        'props': {'legend': 'نشانی', 'description': 'روی فاکتور'},
        'children': [
          {
            'type': 'TextField',
            'props': {'label': 'شهر'},
          },
        ],
      });
      expect(find.text('نشانی'), findsOneWidget);
      expect(find.text('روی فاکتور'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
      final legend = tester.widget<Text>(find.text('نشانی')).style!;
      expect(legend.fontSize, 16);
      expect(legend.fontWeight, FontWeight.w500);
    });
  });

  group('Drawer', () {
    Map<String, Object?> drawer(String placement) => {
      'type': 'Drawer',
      'props': {'title': 'سفارش ۱۰۴۱', 'placement': placement},
      'children': [text('سه قلم')],
      'slots': {
        'trigger': {'type': 'Button', 'children': 'باز'},
        'footer': {
          'type': 'Button',
          'children': 'بستن',
          'actions': {
            'onPress': {'do': 'close'},
          },
        },
      },
    };

    testWidgets('on a Persian page start is the right edge, end the left', (
      tester,
    ) async {
      for (final (placement, right) in [('start', true), ('end', false)]) {
        await paint(tester, drawer(placement));
        await tester.tap(find.text('باز'));
        await tester.pumpAndSettle();
        final paper = tester.getRect(
          find
              .ancestor(
                of: find.text('سفارش ۱۰۴۱'),
                matching: find.byWidgetPredicate(
                  (w) => w is DecoratedBox && w.decoration is ShapeDecoration,
                ),
              )
              .first,
        );
        if (right) {
          expect(paper.right, 1024);
        } else {
          expect(paper.left, 0);
        }
        await tester.tap(find.text('بستن'));
        await tester.pumpAndSettle();
        expect(find.text('سفارش ۱۰۴۱'), findsNothing);
      }
    });

    testWidgets('a bottom one opens from its trigger and tells its opening '
        'and closing; the close button closes it', (tester) async {
      final sent = <Object?>[];
      await paint(
        tester,
        drawer('bottom'),
        event: 'onOpenChange',
        handlers: DibaHandlers(call: (_, p) => sent.add(p['v'])),
      );
      await tester.tap(find.text('باز'));
      await tester.pumpAndSettle();
      expect(find.text('سه قلم'), findsOneWidget);
      final paper = tester.getRect(
        find
            .ancestor(
              of: find.text('سفارش ۱۰۴۱'),
              matching: find.byWidgetPredicate(
                (w) => w is DecoratedBox && w.decoration is ShapeDecoration,
              ),
            )
            .first,
      );
      expect(paper.bottom, 900);
      await tester.tap(find.bySemanticsLabel('بستن').first);
      await tester.pumpAndSettle();
      expect(find.text('سه قلم'), findsNothing);
      expect(sent, [true, false]);
    });
  });
}
