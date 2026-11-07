import 'package:diba/diba.dart';
import 'package:diba/src/sdui/glyphs.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

/// The last six components copied, in Diba's look and drawn here too: every
/// number is the web's on a Persian
/// page.
/// `six.browser.test.tsx` holds the web's.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    bool dark = false,
    String lang = 'fa',
    DibaHandlers handlers = const DibaHandlers(),
  }) async {
    tester.view
      ..physicalSize = const Size(420, 800)
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
    Map<String, Object?>? slots,
    Map<String, Object?>? actions,
  ]) => {
    'type': type,
    'props': props,
    'children': ?children,
    'slots': ?slots,
    'actions': ?actions,
  };

  TextStyle styleOf(WidgetTester tester, String text) =>
      tester.widget<Text>(find.text(text)).style!;
  Rect at(WidgetTester tester, Finder f) => tester.getRect(f);

  group('Breadcrumbs', () {
    Map<String, Object?> trail({bool disabled = false}) => n(
      'Breadcrumbs',
      {'isDisabled': disabled},
      [
        n('BreadcrumbsItem', {'href': '/home'}, 'پیشخوان'),
        n('BreadcrumbsItem', {'href': '/orders'}, 'سفارش‌ها'),
        n('BreadcrumbsItem', {}, 'سفارش ۱۰۴۱'),
      ],
    );

    testWidgets('steps 14 on 20, medium, muted; the page itself in the link '
        'colour; from the right, a 12 chevron 4 after each, 6 to the next', (
      tester,
    ) async {
      await paint(tester, trail());
      final home = styleOf(tester, 'پیشخوان');
      expect(home.fontSize, 14);
      expect(home.height, 20 / 14);
      expect(home.fontWeight, FontWeight.w500);
      expect(home.color, DibaLightNeutrals.muted);
      expect(styleOf(tester, 'سفارش ۱۰۴۱').color, DibaLightColors.link);
      final marks = find.byType(DibaGlyphMark);
      expect(marks, findsNWidgets(2));
      final a = at(tester, find.text('پیشخوان'));
      final chevron = at(tester, marks.first);
      final b = at(tester, find.text('سفارش‌ها'));
      expect(chevron.size, const Size(12, 12));
      expect(a.left - chevron.right, 4);
      expect(chevron.left - b.right, 6);
      // Pointing on: left on a Persian page, the web's chevron turned.
      expect(
        tester.widget<DibaGlyphMark>(marks.first).glyph,
        DibaGlyph.chevronLeft,
      );
    });

    testWidgets('a step goes where it says; the page itself goes nowhere; '
        'disabled, none does and the words are at half', (tester) async {
      final went = <String>[];
      await paint(tester, trail(), handlers: DibaHandlers(navigate: went.add));
      await tester.tap(find.text('سفارش‌ها'));
      await tester.tap(find.text('سفارش ۱۰۴۱'));
      expect(went, ['/orders']);
      await paint(
        tester,
        trail(disabled: true),
        handlers: DibaHandlers(navigate: went.add),
      );
      await tester.tap(find.text('پیشخوان'));
      expect(went, ['/orders']);
      expect(
        tester
            .widget<Opacity>(
              find
                  .ancestor(
                    of: find.text('پیشخوان'),
                    matching: find.byType(Opacity),
                  )
                  .first,
            )
            .opacity,
        0.5,
      );
      // The page itself stays at full strength, as the web's does.
      expect(
        find.ancestor(
          of: find.text('سفارش ۱۰۴۱'),
          matching: find.byType(Opacity),
        ),
        findsNothing,
      );
    });
  });

  group('Menu', () {
    testWidgets('4 in; rows 36 tall, 8 across and 4 apart; a section\'s rows '
        'together; a danger row in the danger colour; a press sends its key', (
      tester,
    ) async {
      final sent = <Object?>[];
      await paint(
        tester,
        n(
          'Menu',
          {'label': 'کارها'},
          [
            n('DropdownItem', {'id': 'print'}, 'چاپ'),
            n('DropdownItem', {'id': 'cancel', 'variant': 'danger'}, 'لغو'),
            n(
              'DropdownSection',
              {'title': 'انبار'},
              [
                n('DropdownItem', {'id': 'a'}, 'یک'),
                n('DropdownItem', {'id': 'b'}, 'دو'),
              ],
            ),
          ],
          null,
          {
            'onAction': {'do': 'call', 'action': 'run', 'value': 'v'},
          },
        ),
        handlers: DibaHandlers(call: (_, p) => sent.add(p['v'])),
      );
      Rect row(String text) => at(
        tester,
        find
            .ancestor(
              of: find.text(text),
              matching: find.byType(ConstrainedBox),
            )
            .first,
      );
      final print = row('چاپ');
      expect(print.height, 36);
      expect(print.top, 20 + 4);
      expect(row('لغو').top - print.bottom, 4);
      expect(row('دو').top - row('یک').bottom, 0);
      // Right to left: the words 8 in from the row's right.
      expect(print.right - at(tester, find.text('چاپ')).right, 8);
      expect(styleOf(tester, 'لغو').color, DibaTheme.light().colorScheme.error);
      await tester.tap(find.text('چاپ'));
      await tester.pump();
      expect(sent, ['print']);
    });

    testWidgets("a choice: Lucide's check, 16, on the chosen row, 8 from its "
        'start, the words 28 in', (tester) async {
      await paint(
        tester,
        n(
          'Menu',
          {
            'label': 'ترتیب',
            'selectionMode': 'single',
            'defaultSelectedKeys': ['newest'],
          },
          [
            n('DropdownItem', {'id': 'newest'}, 'تازه‌ترین'),
            n('DropdownItem', {'id': 'cheapest'}, 'ارزان‌ترین'),
          ],
        ),
      );
      final ticks = find.byWidgetPredicate(
        (w) => w is Icon && w.icon == LucideIcons.check && w.size == 16,
      );
      expect(ticks, findsOneWidget);
      final row = at(
        tester,
        find
            .ancestor(
              of: find.text('تازه‌ترین'),
              matching: find.byType(ConstrainedBox),
            )
            .first,
      );
      final tick = at(tester, ticks);
      // Lucide's check filling its 16 square, 8 from the right.
      expect(row.right - tick.right, 8);
      expect(tick.width, 16);
      expect(row.right - at(tester, find.text('تازه‌ترین')).right, 28);
      await tester.tap(find.text('ارزان‌ترین'));
      await tester.pump();
      final moved = at(tester, ticks);
      expect(moved.top, greaterThan(tick.top));
    });
  });

  group('SwitchGroup', () {
    List<Map<String, Object?>> switches() => [
      n('Switch', {'label': 'یک'}),
      n('Switch', {'label': 'دو'}),
    ];

    testWidgets('switches 24 apart down, as a checkbox group\'s rows; 16 '
        'across, from the right', (tester) async {
      await paint(tester, n('SwitchGroup', {}, switches()));
      Rect sw(int i) => at(tester, find.byType(Switch).at(i));
      // A block is 32 tall for its tap target round a 26 track; the web's
      // rows are 26 and 24 apart, so 50 from one to the next.
      expect(sw(0).height, 32);
      expect(sw(1).top - sw(0).top, 50);
      await paint(
        tester,
        n('SwitchGroup', {'orientation': 'horizontal'}, switches()),
      );
      final across = tester.widget<Row>(
        find
            .descendant(
              of: find.byType(DibaSurface),
              matching: find.byWidgetPredicate(
                (w) => w is Row && w.spacing == 16,
              ),
            )
            .first,
      );
      expect(across.children.every((c) => c is Flexible), isTrue);
      expect(sw(0).center.dy, sw(1).center.dy);
      expect(sw(0).left, greaterThan(sw(1).right));
    });
  });

  group('Toolbar', () {
    Map<String, Object?> bar({bool attached = false, String? orientation}) => n(
      'Toolbar',
      {'label': 'کارها', 'isAttached': attached, 'orientation': ?orientation},
      [
        n('Button', {'variant': 'secondary'}, 'چاپ'),
        n('Separator', {}),
        n('Button', {'variant': 'secondary'}, 'برچسب'),
      ],
    );

    Finder button(String text) =>
        find.ancestor(of: find.text(text), matching: find.byType(FilledButton));

    testWidgets('controls 8 apart; the separator across the row, 1 wide and '
        'half its height, centred', (tester) async {
      await paint(tester, bar());
      final print = at(tester, button('چاپ').first);
      final label = at(tester, button('برچسب').first);
      final line = at(
        tester,
        find.descendant(
          of: find.byType(FractionallySizedBox),
          matching: find.byType(ColoredBox),
        ),
      );
      expect(line.width, 1);
      expect(line.height, print.height / 2);
      expect(line.top - print.top, print.height / 4);
      expect(print.left - line.right, 8);
      expect(line.left - label.right, 8);
    });

    testWidgets('down a column, the separator half its width and centred', (
      tester,
    ) async {
      await paint(tester, bar(orientation: 'vertical'));
      final print = at(tester, button('چاپ').first);
      final label = at(tester, button('برچسب').first);
      final line = at(
        tester,
        find.descendant(
          of: find.byType(FractionallySizedBox),
          matching: find.byType(ColoredBox),
        ),
      );
      final column = print.width > label.width ? print : label;
      expect(line.height, 1);
      expect(line.width, column.width / 2);
      expect(line.top - print.bottom, 8);
      expect(label.top - line.bottom, 8);
    });

    for (final dark in [false, true]) {
      testWidgets('${dark ? 'dark' : 'light'}: attached, a bar on the surface, '
          '24 round, 4 in, with the overlay\'s shadow', (tester) async {
        await paint(tester, bar(attached: true), dark: dark);
        final box = tester.widget<DecoratedBox>(
          find
              .ancestor(
                of: button('چاپ').first,
                matching: find.byWidgetPredicate(
                  (w) =>
                      w is DecoratedBox &&
                      w.decoration is ShapeDecoration &&
                      (w.decoration as ShapeDecoration).shadows != null,
                ),
              )
              .first,
        );
        final d = box.decoration as ShapeDecoration;
        expect(
          d.color,
          dark ? DibaDarkNeutrals.surface : DibaLightNeutrals.surface,
        );
        expect(
          (d.shape as RoundedRectangleBorder).borderRadius,
          const BorderRadius.all(Radius.circular(24)),
        );
        expect(d.shadows, DibaTheme.overlay(dark: dark, radius: 24).shadows);
        final paper = tester.getRect(
          find.ancestor(of: button('چاپ').first, matching: find.byWidget(box)),
        );
        expect(paper.right - at(tester, button('چاپ').first).right, 4);
      });
    }

    testWidgets('the arrow keys move along it, left onward on a Persian page; '
        'Tab leaves it from anywhere in it', (tester) async {
      await paint(
        tester,
        n('Stack', {'direction': 'vertical'}, [bar(), n('Button', {}, 'بعد')]),
      );
      Element? focused() =>
          FocusManager.instance.primaryFocus?.context as Element?;
      bool on(String text) => find
          .ancestor(of: find.text(text), matching: find.byType(FilledButton))
          .evaluate()
          .any((e) {
            var hit = false;
            focused()?.visitAncestorElements((a) {
              if (a == e) hit = true;
              return !hit;
            });
            return hit || focused() == e;
          });
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(on('چاپ'), isTrue);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pump();
      expect(on('برچسب'), isTrue);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();
      expect(on('چاپ'), isTrue);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(on('بعد'), isTrue);
    });
  });

  group('Sheet', () {
    Map<String, Object?> sheet([Map<String, Object?> props = const {}]) => n(
      'Sheet',
      {'title': 'سفارش ۱۰۴۱', ...props},
      [n('Text', {}, 'سه قلم'), n('Text', {}, 'پرداخت‌شده')],
      {
        'trigger': n('Button', {}, 'جزئیات'),
        'footer': n('Button', {}, 'چاپ برچسب'),
      },
    );

    Future<Rect> open(WidgetTester tester) async {
      await tester.tap(find.text('جزئیات'));
      await tester.pumpAndSettle();
      return at(
        tester,
        find
            .ancestor(
              of: find.text('سفارش ۱۰۴۱'),
              matching: find.byWidgetPredicate(
                (w) =>
                    w is DecoratedBox &&
                    w.decoration is ShapeDecoration &&
                    (w.decoration as ShapeDecoration).shadows != null,
              ),
            )
            .first,
      );
    }

    for (final dark in [false, true]) {
      testWidgets('${dark ? 'dark' : 'light'}: from the bottom, as wide as '
          'the window, 16 round at its top; the drawer\'s handle, title, '
          'blocks and footer', (tester) async {
        await paint(tester, sheet(), dark: dark);
        final paper = await open(tester);
        expect(paper.left, 0);
        expect(paper.width, 420);
        expect(paper.bottom, 800);
        final handle = at(
          tester,
          find.byWidgetPredicate(
            (w) =>
                w is Container &&
                w.constraints ==
                    const BoxConstraints.tightFor(width: 36, height: 4),
          ),
        );
        expect(handle.top - paper.top, 12);
        final title = at(tester, find.text('سفارش ۱۰۴۱'));
        final style = styleOf(tester, 'سفارش ۱۰۴۱');
        expect(style.fontSize, 16);
        expect(style.height, 24 / 16);
        expect(style.fontWeight, FontWeight.w500);
        expect(title.top - paper.top, 36);
        expect(paper.right - title.right, 24);
        final first = at(tester, find.text('سه قلم'));
        final second = at(tester, find.text('پرداخت‌شده'));
        expect(first.top - title.bottom, 16);
        expect(second.top - first.bottom, 16);
        final footer = at(
          tester,
          find
              .ancestor(
                of: find.text('چاپ برچسب'),
                matching: find.byType(FilledButton),
              )
              .first,
        );
        expect(footer.top - second.bottom, 20);
        expect(paper.bottom - footer.bottom, 24);
        // At the footer's end: the left of a Persian page.
        expect(footer.left - paper.left, 24);
        // The close button 16 from the top and the end, the left here.
        final x = at(
          tester,
          find.bySemanticsLabel(
            DibaStrings.of(tester.element(find.text('سفارش ۱۰۴۱'))).close,
          ),
        );
        expect(x.top - paper.top, 16);
        expect(x.left - paper.left, 16);
      });
    }

    testWidgets('its close button and a drag down close it; not dismissable, '
        'a drag leaves it', (tester) async {
      await paint(tester, sheet());
      await open(tester);
      final strings = DibaStrings.of(tester.element(find.text('سفارش ۱۰۴۱')));
      await tester.tap(find.bySemanticsLabel(strings.close));
      await tester.pumpAndSettle();
      expect(find.text('سفارش ۱۰۴۱'), findsNothing);
      await open(tester);
      await tester.fling(find.text('سفارش ۱۰۴۱'), const Offset(0, 300), 1500);
      await tester.pumpAndSettle();
      expect(find.text('سفارش ۱۰۴۱'), findsNothing);
      await paint(tester, sheet({'isDismissable': false}));
      await open(tester);
      await tester.fling(find.text('سفارش ۱۰۴۱'), const Offset(0, 300), 1500);
      await tester.pumpAndSettle();
      expect(find.text('سفارش ۱۰۴۱'), findsOneWidget);
    });

    testWidgets('with a stop it opens on a third of itself, all the window '
        'tall, as the web is; dragged up it shows all of it', (tester) async {
      await paint(
        tester,
        sheet({
          'snapPoints': ['33%'],
        }),
      );
      // Standing alone, its trigger keeps its own width, as the web's does.
      expect(
        at(
          tester,
          find
              .ancestor(
                of: find.text('جزئیات'),
                matching: find.byType(FilledButton),
              )
              .first,
        ).width,
        lessThan(200),
      );
      final paper = await open(tester);
      // As tall as the window, as the web's is: a stop is a share of it.
      expect(paper.height, 800);
      expect(800 - paper.top, closeTo(0.33 * 800, 1));
      // At its stop the page is not dimmed: the web's backdrop fades in as
      // the sheet rises from its last stop to all of it.
      final scrim = DibaTheme.light().colorScheme.scrim;
      Finder dim() => find.byWidgetPredicate(
        (w) => w is ColoredBox && w.color.r == scrim.r && w.color.b == scrim.b,
      );
      expect(tester.widget<ColoredBox>(dim()).color.a, 0);
      await tester.drag(
        find.text('سفارش ۱۰۴۱'),
        const Offset(0, -500),
        kind: PointerDeviceKind.touch,
      );
      await tester.pumpAndSettle();
      final up = at(
        tester,
        find
            .ancestor(
              of: find.text('سفارش ۱۰۴۱'),
              matching: find.byWidgetPredicate(
                (w) =>
                    w is DecoratedBox &&
                    w.decoration is ShapeDecoration &&
                    (w.decoration as ShapeDecoration).shadows != null,
              ),
            )
            .first,
      );
      expect(up.top, 0);
      expect(tester.widget<ColoredBox>(dim()).color.a, closeTo(scrim.a, 0.01));
    });

    testWidgets('off the edge: 8 from every side, round all round', (
      tester,
    ) async {
      await paint(tester, sheet({'isDetached': true}));
      final paper = await open(tester);
      expect(paper.left, 8);
      expect(paper.right, 420 - 8);
      expect(paper.bottom, 800 - 8);
    });

    testWidgets('from the end, the left of a Persian page, 384 wide or 96% of '
        'the window, as tall as it', (tester) async {
      await paint(tester, sheet({'placement': 'end'}));
      final side = await open(tester);
      expect(side.left, 0);
      expect(side.width, (420 * 0.96).clamp(0, 384));
      expect(side.height, 800);
    });
  });

  group('ErrorMessage', () {
    testWidgets('a TagGroup\'s errorMessage: 12, in the danger colour, under '
        'its help', (tester) async {
      await paint(
        tester,
        n(
          'TagGroup',
          {
            'label': 'دسته‌ها',
            'description': 'راهنما',
            'errorMessage': 'دست‌کم یکی',
          },
          [
            n('Tag', {'id': 'a'}, 'شال'),
          ],
        ),
      );
      final error = styleOf(tester, 'دست‌کم یکی');
      expect(error.fontSize, 12);
      expect(error.height, 16 / 12);
      expect(error.color, DibaTheme.light().colorScheme.error);
      final help = at(tester, find.text('راهنما'));
      final words = at(tester, find.text('دست‌کم یکی'));
      // 4 under the help, which stays; right to left, the help flush
      // with the field's right and the error 4 in, as the web draws them.
      expect(words.top - help.bottom, 4);
      expect(help.right - words.right, 4);
    });
  });
}
