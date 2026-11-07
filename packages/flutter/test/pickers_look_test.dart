import 'package:diba/diba.dart';
import 'package:diba/src/sdui/glyphs.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// The pickers in Diba's look, a chosen item highlighted instead of ticked.
/// Every number here is the web's;
/// select.browser.test.tsx holds the web to the highlight.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    double width = 1024,
    bool dark = false,
    String lang = 'fa',
    DibaHandlers handlers = const DibaHandlers(),
  }) async {
    tester.view
      ..physicalSize = Size(width, 900)
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
    await tester.pump(const Duration(milliseconds: 300));
  }

  Map<String, Object?> n(
    String type,
    Map<String, Object?> props, [
    Object? children,
  ]) => {'type': type, 'props': props, 'children': ?children};

  List<Map<String, Object?>> cities() => [
    for (final (i, city) in ['تهران', 'شیراز', 'تبریز'].indexed)
      n('ListBoxItem', {'id': 'c$i'}, city),
  ];

  List<Map<String, Object?>> carriers() => [
    n(
      'ListBoxSection',
      {'title': 'پیک'},
      [
        n('ListBoxItem', {
          'id': 'tipax',
          'icon': 'truck',
          'description': '۲ تا ۳ روز',
        }, 'تیپاکس'),
        n('ListBoxItem', {'id': 'snapp', 'icon': 'package'}, 'اسنپ‌باکس'),
      ],
    ),
    n(
      'ListBoxSection',
      {'title': 'پست'},
      [
        n('ListBoxItem', {'id': 'post', 'icon': 'mail'}, 'پست پیشتاز'),
        n('ListBoxItem', {
          'id': 'pickup',
          'icon': 'store',
          'isDisabled': true,
        }, 'تحویل حضوری'),
      ],
    ),
  ];

  final trigger = find.byType(InputDecorator);
  final panel = find.byWidgetPredicate(
    (w) =>
        w is DecoratedBox &&
        w.decoration is ShapeDecoration &&
        ((w.decoration as ShapeDecoration).shape as RoundedRectangleBorder)
                .borderRadius ==
            BorderRadius.circular(24),
  );

  /// The row a label sits in: its box, 16 round its corners.
  Finder row(String label) => find
      .ancestor(
        of: find.text(label),
        matching: find.byWidgetPredicate(
          (w) =>
              w is DecoratedBox &&
              w.decoration is ShapeDecoration &&
              ((w.decoration as ShapeDecoration).shape
                          as RoundedRectangleBorder)
                      .borderRadius ==
                  BorderRadius.circular(16),
        ),
      )
      .first;

  Color fillOf(WidgetTester tester, String label) =>
      (tester.widget<DecoratedBox>(row(label)).decoration as ShapeDecoration)
          .color!;

  Finder glyph(DibaGlyph g) =>
      find.byWidgetPredicate((w) => w is DibaGlyphMark && w.glyph == g);

  ThemeData theme(WidgetTester tester) =>
      Theme.of(tester.element(find.byType(DibaSurface)));

  Future<void> open(WidgetTester tester) async {
    await tester.tap(trigger);
    await tester.pumpAndSettle();
  }

  group('a select’s field', () {
    testWidgets('its choice’s icon 16, 12 from the start, its words 8 after', (
      tester,
    ) async {
      await paint(
        tester,
        n('Select', {
          'label': 'ارسال',
          'defaultSelectedKey': 'tipax',
        }, carriers()),
      );
      final f = tester.getRect(trigger);
      final icon = tester.getRect(
        find.descendant(of: trigger, matching: find.byType(Icon)),
      );
      expect(icon.size, const Size.square(16));
      expect(icon.right, f.right - 12);
      expect(tester.getRect(find.text('تیپاکس')).right, icon.left - 8);
      expect(f.height, 36);
    });

    testWidgets('its chevron: 16 in the placeholder colour, 8 from the end; '
        'turned over while open', (tester) async {
      await paint(tester, n('Select', {'label': 'شهر'}, cities()));
      final f = tester.getRect(trigger);
      final c = tester.getRect(glyph(DibaGlyph.chevronDown));
      expect(c.size, const Size.square(16));
      expect(c.left, f.left + 8);
      expect(
        tester.widget<DibaGlyphMark>(glyph(DibaGlyph.chevronDown)).color,
        DibaLightNeutrals.placeholder,
      );
      AnimatedRotation turn() => tester.widget<AnimatedRotation>(
        find.ancestor(
          of: glyph(DibaGlyph.chevronDown),
          matching: find.byType(AnimatedRotation),
        ),
      );
      expect(turn().turns, 0);
      await open(tester);
      expect(turn().turns, 0.5);
    });

    testWidgets('several choices are joined as the web joins them', (
      tester,
    ) async {
      await paint(
        tester,
        n('Select', {
          'label': 'شهر',
          'selectionMode': 'multiple',
          'defaultSelectedKeys': ['c0', 'c2'],
        }, cities()),
      );
      expect(find.text('تهران و تبریز'), findsOneWidget);
      await paint(
        tester,
        n('Select', {
          'label': 'City',
          'selectionMode': 'multiple',
          'defaultSelectedKeys': ['c0', 'c1', 'c2'],
        }, cities()),
        lang: 'en',
      );
      expect(find.text('تهران, شیراز, and تبریز'), findsOneWidget);
    });

    testWidgets('a click opens it with no focus ring; the keyboard rings it', (
      tester,
    ) async {
      await paint(tester, n('Select', {'label': 'شهر'}, cities()));
      final ringed = find.descendant(
        of: find.byType(DibaSurface),
        matching: find.byWidgetPredicate(
          (w) =>
              w is CustomPaint &&
              w.foregroundPainter.runtimeType.toString() == 'DibaRingPainter',
        ),
      );
      await open(tester);
      // Focused by the click, and then by the menu's option: no ring.
      expect(ringed, findsNothing);
      await tester.tapAt(const Offset(900, 800));
      await tester.pumpAndSettle();
      FocusManager.instance.primaryFocus?.unfocus();
      await tester.pump();
      expect(ringed, findsNothing);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(ringed, findsOneWidget);
    });
  });

  group('a select’s menu', () {
    testWidgets('the web’s popover: the trigger’s width, 8 under its box, 24 '
        'round its corners, the overlay’s shadow', (tester) async {
      await paint(
        tester,
        n('Select', {'label': 'شهر', 'description': 'شهر مبدأ'}, cities()),
      );
      await open(tester);
      final f = tester.getRect(trigger);
      final p = tester.getRect(panel);
      expect(p.width, f.width);
      expect(p.top, f.top + 36 + 8);
      final d =
          tester.widget<DecoratedBox>(panel).decoration as ShapeDecoration;
      expect(d.shadows, isNotEmpty);
      expect(d.color, DibaLightNeutrals.surface);
    });

    testWidgets('a chosen option is the neutral fill, with no tick', (
      tester,
    ) async {
      await paint(
        tester,
        n('Select', {'label': 'شهر', 'defaultSelectedKey': 'c1'}, cities()),
      );
      await open(tester);
      expect(fillOf(tester, 'شیراز'), DibaLightNeutrals.fill);
      expect(fillOf(tester, 'تهران').a, 0);
      expect(find.byIcon(Icons.check), findsNothing);
      expect(
        find.descendant(of: panel, matching: find.byType(Checkbox)),
        findsNothing,
      );
    });

    testWidgets('an option under the pointer is half the fill; the chosen one '
        'keeps it', (tester) async {
      await paint(
        tester,
        n('Select', {'label': 'شهر', 'defaultSelectedKey': 'c1'}, cities()),
      );
      await open(tester);
      final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(row('تبریز')));
      await tester.pump();
      expect(
        fillOf(tester, 'تبریز'),
        DibaLightNeutrals.fill.withValues(alpha: 0.5),
      );
      await mouse.moveTo(tester.getCenter(row('شیراز')));
      await tester.pump();
      expect(fillOf(tester, 'شیراز'), DibaLightNeutrals.fill);
    });

    testWidgets('a row: 36 tall, 48 with a description, its icon 10 in and 12 '
        'before its words', (tester) async {
      await paint(tester, n('Select', {'label': 'ارسال'}, carriers()));
      await open(tester);
      final plain = tester.getRect(row('پست پیشتاز'));
      final noted = tester.getRect(row('تیپاکس'));
      expect(plain.height, 36);
      expect(noted.height, 48);
      final icon = tester.getRect(
        find.descendant(of: row('پست پیشتاز'), matching: find.byType(Icon)),
      );
      expect(icon.size, const Size.square(16));
      expect(icon.right, plain.right - 10);
      expect(
        tester.getRect(find.text('پست پیشتاز').last).right,
        icon.left - 12,
      );
      final label = tester.widget<Text>(find.text('پست پیشتاز').last).style!;
      expect(label.fontSize, 14);
      expect(label.fontWeight, FontWeight.w500);
    });

    testWidgets('a section’s heading: 26 tall, 12 medium and muted; sections '
        '4 apart, a section’s options together', (tester) async {
      await paint(tester, n('Select', {'label': 'ارسال'}, carriers()));
      await open(tester);
      final heading = tester.getRect(find.text('پیک'));
      expect(heading.height, 16);
      final style = tester.widget<Text>(find.text('پیک')).style!;
      expect(style.fontSize, 12);
      expect(style.fontWeight, FontWeight.w500);
      expect(style.color, theme(tester).colorScheme.onSurfaceVariant);
      final first = tester.getRect(row('تیپاکس'));
      expect(first.top, heading.bottom + 4);
      expect(tester.getRect(row('اسنپ‌باکس')).top, first.bottom);
      expect(
        tester.getRect(find.text('پست')).top,
        tester.getRect(row('اسنپ‌باکس')).bottom + 4 + 6,
      );
    });

    testWidgets('options with no sections are 4 apart', (tester) async {
      await paint(tester, n('Select', {'label': 'شهر'}, cities()));
      await open(tester);
      expect(
        tester.getRect(row('شیراز')).top,
        tester.getRect(row('تهران')).bottom + 4,
      );
      expect(tester.getRect(row('تهران')).top, tester.getRect(panel).top + 6);
    });

    testWidgets('a disabled option is at half and takes no press', (
      tester,
    ) async {
      await paint(tester, {
        ...n('Select', {'label': 'ارسال'}, carriers()),
        'actions': {
          'onSelectionChange': {'do': 'setState', 'key': 'k'},
        },
      });
      await open(tester);
      final fade = tester.widget<Opacity>(
        find
            .ancestor(of: row('تحویل حضوری'), matching: find.byType(Opacity))
            .first,
      );
      expect(fade.opacity, 0.5);
      await tester.tap(find.text('تحویل حضوری').last, warnIfMissed: false);
      await tester.pumpAndSettle();
      // Still open, and the field shows no choice: the text is the row's only.
      expect(panel, findsOneWidget);
      expect(find.text('تحویل حضوری'), findsOneWidget);
    });

    testWidgets('a press shrinks an option to 0.98', (tester) async {
      await paint(tester, n('Select', {'label': 'شهر'}, cities()));
      await open(tester);
      final press = await tester.startGesture(tester.getCenter(row('تبریز')));
      await tester.pump(const Duration(milliseconds: 300));
      final scale = tester.widget<AnimatedScale>(
        find.ancestor(of: row('تبریز'), matching: find.byType(AnimatedScale)),
      );
      expect(scale.scale, 0.98);
      await press.cancel();
    });

    testWidgets('one choice closes the menu and shows', (tester) async {
      await paint(tester, n('Select', {'label': 'شهر'}, cities()));
      await open(tester);
      await tester.tap(find.text('تبریز').last);
      await tester.pumpAndSettle();
      expect(panel, findsNothing);
      expect(find.text('تبریز'), findsOneWidget);
    });

    testWidgets('several choices keep the menu open, each highlighted', (
      tester,
    ) async {
      await paint(
        tester,
        n('Select', {'label': 'شهر', 'selectionMode': 'multiple'}, cities()),
      );
      await open(tester);
      await tester.tap(find.text('تهران').last);
      await tester.pumpAndSettle();
      await tester.tap(find.text('تبریز').last);
      await tester.pumpAndSettle();
      expect(panel, findsOneWidget);
      expect(fillOf(tester, 'تهران'), DibaLightNeutrals.fill);
      expect(fillOf(tester, 'تبریز'), DibaLightNeutrals.fill);
      expect(find.text('تهران و تبریز'), findsOneWidget);
    });

    testWidgets('the keyboard opens it on the choice, moves, and chooses', (
      tester,
    ) async {
      await paint(
        tester,
        n('Select', {'label': 'شهر', 'defaultSelectedKey': 'c0'}, cities()),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();
      expect(panel, findsOneWidget);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      expect(panel, findsNothing);
      expect(find.text('شیراز'), findsOneWidget);
    });
  });

  group('a combo box', () {
    testWidgets('its chevron opens every option, the choice highlighted, 8 '
        'under the field’s box', (tester) async {
      await paint(
        tester,
        n('ComboBox', {
          'label': 'شهر',
          'description': 'شهر مقصد',
          'defaultSelectedKey': 'c1',
        }, cities()),
      );
      final box = tester.getRect(find.byType(TextField));
      final c = tester.getRect(glyph(DibaGlyph.chevronDown));
      expect(c.left, box.left + 8);
      await tester.tap(glyph(DibaGlyph.chevronDown));
      await tester.pumpAndSettle();
      expect(panel, findsOneWidget);
      expect(tester.getRect(panel).top, box.top + 36 + 8);
      expect(tester.getRect(panel).width, box.width);
      expect(fillOf(tester, 'شیراز'), DibaLightNeutrals.fill);
      expect(fillOf(tester, 'تهران').a, 0);
    });
  });

  group('a combo box opened by focus', () {
    testWidgets('a filled one shows every option, its choice highlighted, '
        'until the merchant types', (tester) async {
      await paint(
        tester,
        n('ComboBox', {
          'label': 'شهر',
          'defaultSelectedKey': 'c1',
          'menuTrigger': 'focus',
        }, cities()),
      );
      await tester.tap(find.byType(TextField));
      await tester.pumpAndSettle();
      expect(panel, findsOneWidget);
      for (final city in ['تهران', 'شیراز', 'تبریز']) {
        expect(row(city), findsOneWidget, reason: city);
      }
      expect(fillOf(tester, 'شیراز'), DibaLightNeutrals.fill);
      await tester.enterText(find.byType(TextField), 'تب');
      await tester.pumpAndSettle();
      expect(row('تبریز'), findsOneWidget);
      expect(find.text('تهران'), findsNothing);
    });

    testWidgets('one waiting for input opens on its chevron, and not on a '
        'tap', (tester) async {
      await paint(
        tester,
        n('ComboBox', {'label': 'شهر', 'defaultSelectedKey': 'c1'}, cities()),
      );
      await tester.tap(find.byType(TextField));
      await tester.pumpAndSettle();
      expect(panel, findsNothing);
      await tester.tap(glyph(DibaGlyph.chevronDown));
      await tester.pumpAndSettle();
      expect(row('تهران'), findsOneWidget);
    });
  });

  group('a dropdown', () {
    Map<String, Object?> menu(Map<String, Object?> props) => {
      'type': 'Dropdown',
      'props': props,
      'children': [
        n(
          'DropdownSection',
          {'title': 'سفارش'},
          [
            n('DropdownItem', {'id': 'print', 'icon': 'printer'}, 'چاپ'),
            n('DropdownItem', {'id': 'copy'}, 'رونوشت'),
          ],
        ),
        n(
          'DropdownSection',
          {'title': 'خطر'},
          [
            n('DropdownItem', {'id': 'cancel', 'variant': 'danger'}, 'لغو'),
          ],
        ),
      ],
      'slots': {
        'trigger': n('Button', {'variant': 'outline'}, 'کارها'),
      },
    };

    Future<void> openMenu(WidgetTester tester) async {
      await tester.tap(find.text('کارها'));
      await tester.pumpAndSettle();
    }

    group('its trigger is the button itself', () {
      Map<String, Object?> pressing(Map<String, Object?> props) => {
        ...menu({}),
        'slots': {
          'trigger': {
            'type': 'Button',
            'props': {'variant': 'outline', ...props},
            'children': 'کارها',
            'actions': {
              'onPress': {'do': 'call', 'action': 'menu.pressed'},
            },
          },
        },
      };
      final button = find.byWidgetPredicate((w) => w is ButtonStyleButton);

      testWidgets('a hover shows the pointer over it', (tester) async {
        await paint(tester, pressing({}));
        final mouse = await tester.createGesture(
          kind: PointerDeviceKind.mouse,
          pointer: 1,
        );
        addTearDown(mouse.removePointer);
        await mouse.addPointer(location: Offset.zero);
        await mouse.moveTo(tester.getCenter(button));
        await tester.pump();
        expect(
          RendererBinding.instance.mouseTracker.debugDeviceActiveCursor(1),
          SystemMouseCursors.click,
        );
      });

      testWidgets('a press shrinks it at once, opens the menu, and sends its '
          'own onPress', (tester) async {
        String? called;
        await paint(
          tester,
          pressing({}),
          handlers: DibaHandlers(call: (action, payload) => called = action),
        );
        final press = await tester.startGesture(tester.getCenter(button));
        // At once, as the web's :active is: nothing else waits on the press,
        // which Flutter would otherwise hold for 100ms or until it is let go.
        await tester.pump(const Duration(milliseconds: 20));
        expect(
          tester
              .widget<AnimatedScale>(
                find.ancestor(of: button, matching: find.byType(AnimatedScale)),
              )
              .scale,
          lessThan(1),
        );
        await press.up();
        await tester.pumpAndSettle();
        expect(panel, findsOneWidget);
        expect(called, 'menu.pressed');
      });

      testWidgets('Enter opens it', (tester) async {
        await paint(tester, pressing({}));
        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        await tester.pump();
        await tester.sendKeyEvent(LogicalKeyboardKey.enter);
        await tester.pumpAndSettle();
        expect(panel, findsOneWidget);
      });

      testWidgets('disabled, it opens nothing', (tester) async {
        await paint(tester, pressing({'isDisabled': true}));
        await tester.tap(button, warnIfMissed: false);
        await tester.pumpAndSettle();
        expect(panel, findsNothing);
      });
    });

    testWidgets('its trigger keeps its own width in a column', (tester) async {
      await paint(tester, {
        'type': 'Stack',
        'children': [menu({})],
      });
      expect(
        tester
            .getSize(find.byWidgetPredicate((w) => w is ButtonStyleButton))
            .width,
        lessThan(300),
      );
      // Its menu opens from the trigger, not from the column's edge.
      expect(
        tester.getSize(find.byType(RawMenuAnchor)).width,
        tester
            .getSize(find.byWidgetPredicate((w) => w is ButtonStyleButton))
            .width,
      );
    });

    testWidgets('a menu of choices highlights them, with no checkbox', (
      tester,
    ) async {
      await paint(
        tester,
        menu({
          'selectionMode': 'multiple',
          'defaultSelectedKeys': ['print'],
        }),
      );
      await openMenu(tester);
      expect(fillOf(tester, 'چاپ'), DibaLightNeutrals.fill);
      expect(fillOf(tester, 'رونوشت').a, 0);
      expect(
        find.descendant(of: panel, matching: find.byType(Checkbox)),
        findsNothing,
      );
    });

    testWidgets('a menu of actions highlights nothing; sections 2 apart; '
        'danger in the danger colour', (tester) async {
      await paint(tester, menu({}));
      await openMenu(tester);
      expect(fillOf(tester, 'چاپ').a, 0);
      expect(
        tester.getRect(find.text('خطر')).top,
        tester.getRect(row('رونوشت')).bottom + 2 + 6,
      );
      expect(
        tester.widget<Text>(find.text('لغو').last).style!.color,
        theme(tester).colorScheme.error,
      );
    });

    testWidgets('from 768 wide its menu is at least 220', (tester) async {
      await paint(tester, menu({}));
      await openMenu(tester);
      expect(tester.getSize(panel).width, greaterThanOrEqualTo(220));
    });
  });

  group('a list on a page', () {
    testWidgets('its rows 4 in and 8 across; a radio 12 from the start, the '
        'words at 40; no fill for its choice', (tester) async {
      await paint(
        tester,
        n('ListBox', {
          'label': 'شهر',
          'defaultSelectedKeys': ['c1'],
        }, cities()),
      );
      final r = tester.getRect(row('شیراز'));
      final radio = tester.getRect(
        find.descendant(of: row('شیراز'), matching: find.byType(Radio<String>)),
      );
      expect(radio.center.dx, moreOrLessEquals(r.right - 12 - 9, epsilon: 1));
      expect(tester.getRect(find.text('شیراز')).right, r.right - 40);
      expect(fillOf(tester, 'شیراز').a, 0);
      expect(r.height, 36);
      expect(
        tester.getRect(row('شیراز')).top,
        tester.getRect(row('تهران')).bottom + 4,
      );
    });

    testWidgets('several choices draw checkboxes, and a press toggles one', (
      tester,
    ) async {
      await paint(
        tester,
        n('ListBox', {
          'label': 'شهر',
          'selectionMode': 'multiple',
          'defaultSelectedKeys': ['c0'],
        }, cities()),
      );
      bool checked(String label) => tester
          .widget<Checkbox>(
            find.descendant(of: row(label), matching: find.byType(Checkbox)),
          )
          .value!;
      expect(checked('تهران'), isTrue);
      await tester.tap(find.text('تبریز'));
      await tester.pump();
      expect(checked('تبریز'), isTrue);
      expect(checked('تهران'), isTrue);
    });

    testWidgets('a hovered row is the whole fill, as the web’s', (
      tester,
    ) async {
      await paint(tester, n('ListBox', {'label': 'شهر'}, cities()));
      final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(row('تبریز')));
      await tester.pump();
      expect(fillOf(tester, 'تبریز'), DibaLightNeutrals.fill);
    });

    testWidgets('it is as wide as its rows', (tester) async {
      await paint(tester, n('ListBox', {'label': 'شهر'}, cities()));
      expect(tester.getSize(row('تهران')).width, lessThan(300));
    });
  });

  test('a dark menu’s choice is the dark fill', () {
    expect(DibaDarkNeutrals.fill, DibaPalette.slate800);
  });
}
