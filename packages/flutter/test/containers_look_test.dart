import 'package:diba/diba.dart';
import 'package:diba/src/sdui/blocks/containers.dart' show DibaRowPaint;
import 'package:diba/src/sdui/glyphs.dart';
import 'package:diba/src/sdui/oklab.dart';
import 'package:diba/src/sdui/ring.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// The containers in Diba's look. Every number here is the web's.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    double width = 1024,
    double height = 900,
    bool dark = false,
    String lang = 'en',
    DibaHandlers handlers = const DibaHandlers(),
  }) async {
    tester.view
      ..physicalSize = Size(width, height)
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
  ]) => {'type': type, 'props': props, 'children': ?children, 'slots': ?slots};

  ColorScheme scheme(WidgetTester tester) =>
      Theme.of(tester.element(find.byType(DibaSurface))).colorScheme;

  /// The box round [text] whose BoxDecoration is [radius] round.
  Finder boxed(String text, double radius) => find
      .ancestor(
        of: find.text(text),
        matching: find.byWidgetPredicate(
          (w) =>
              w is DecoratedBox &&
              w.decoration is BoxDecoration &&
              (w.decoration as BoxDecoration).borderRadius ==
                  BorderRadius.all(Radius.circular(radius)),
        ),
      )
      .first;

  BoxDecoration decorationOf(WidgetTester tester, Finder box) =>
      tester.widget<DecoratedBox>(box).decoration as BoxDecoration;

  TextStyle styleOf(WidgetTester tester, String text) =>
      tester.widget<Text>(find.text(text)).style!;

  Finder glyph(DibaGlyph g) =>
      find.byWidgetPredicate((w) => w is DibaGlyphMark && w.glyph == g);

  group('a card', () {
    Map<String, Object?> card({Map<String, Object?> props = const {}}) => n(
      'Card',
      {'title': 'Sales', 'description': 'Until two', ...props},
      [n('Text', {}, 'Body')],
      {'action': n('Button', {}, 'All'), 'footer': n('Text', {}, 'Foot')},
    );

    testWidgets('the surface 24 round, 16 in, its parts 12 apart', (
      tester,
    ) async {
      await paint(tester, card());
      final box = tester.getRect(boxed('Sales', 24));
      final title = tester.getRect(find.text('Sales'));
      final description = tester.getRect(find.text('Until two'));
      final body = tester.getRect(find.text('Body'));
      final foot = tester.getRect(find.text('Foot'));
      final action = tester.getRect(find.byType(FilledButton));

      expect(title.topLeft, box.topLeft + const Offset(16, 16));
      expect(description.top, title.bottom);
      expect(body.top, description.bottom + 12);
      expect(foot.top, body.bottom + 12);
      expect(box.bottom, foot.bottom + 16);
      // The action at the end, at the header's top.
      expect(action.right, box.right - 16);
      expect(action.top, box.top + 16);

      final decoration = decorationOf(tester, boxed('Sales', 24));
      expect(decoration.color, scheme(tester).surface);
      expect(decoration.boxShadow, DibaTheme.surfaceShadow(dark: false));
      expect(decoration.boxShadow, hasLength(3));
    });

    testWidgets('its title 14 on 24, medium; its description 14 on 20, muted', (
      tester,
    ) async {
      await paint(tester, card());
      final title = styleOf(tester, 'Sales');
      expect(title.fontSize, 14);
      expect(title.height, 24 / 14);
      expect(title.fontWeight, FontWeight.w500);
      expect(title.color, scheme(tester).onSurface);
      final description = styleOf(tester, 'Until two');
      expect(description.fontSize, 14);
      expect(description.height, 20 / 14);
      expect(description.color, scheme(tester).onSurfaceVariant);
    });

    testWidgets('no shadow in dark, as the web has none', (tester) async {
      await paint(tester, card(), dark: true);
      expect(decorationOf(tester, boxed('Sales', 24)).boxShadow, isEmpty);
    });

    testWidgets('by variant: the secondary and tertiary surfaces, or nothing', (
      tester,
    ) async {
      await paint(
        tester,
        n('Stack', {}, [
          for (final v in ['secondary', 'tertiary', 'transparent'])
            n('Card', {'title': v, 'variant': v}),
        ]),
      );
      final s = scheme(tester);
      expect(
        decorationOf(tester, boxed('secondary', 24)).color,
        s.surfaceContainer,
      );
      expect(
        decorationOf(tester, boxed('tertiary', 24)).color,
        s.surfaceContainerHighest,
      );
      final clear = decorationOf(tester, boxed('transparent', 24));
      expect(clear.color, isNull);
      expect(clear.boxShadow, isNull);
    });

    testWidgets('a card with nothing in it is its header alone', (
      tester,
    ) async {
      await paint(tester, n('Card', {'title': 'Only'}));
      final box = tester.getRect(boxed('Only', 24));
      expect(box.height, 16 + 24 + 16);
    });

    testWidgets('flush: no padding, and what it holds is clipped', (
      tester,
    ) async {
      await paint(tester, card(props: {'isFlush': true}));
      final box = tester.getRect(boxed('Sales', 24));
      expect(tester.getRect(find.text('Sales')).topLeft, box.topLeft);
      expect(
        find.ancestor(of: find.text('Sales'), matching: find.byType(ClipRRect)),
        findsOneWidget,
      );
    });

    testWidgets('a link: the hand, a press and Enter open it, ringed by keys', (
      tester,
    ) async {
      final opened = <String>[];
      await paint(
        tester,
        n('Card', {'title': 'Order', 'href': '/orders/1'}),
        handlers: DibaHandlers(navigate: opened.add),
      );
      expect(
        find.ancestor(
          of: find.text('Order'),
          matching: find.byWidgetPredicate(
            (w) => w is MouseRegion && w.cursor == SystemMouseCursors.click,
          ),
        ),
        findsOneWidget,
      );
      await tester.tap(find.text('Order'));
      await tester.pump();
      expect(opened, ['/orders/1']);

      Finder ringed() => find.ancestor(
        of: find.text('Order'),
        matching: find.byWidgetPredicate(
          (w) => w is CustomPaint && w.foregroundPainter is DibaRingPainter,
        ),
      );
      expect(ringed(), findsNothing);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(ringed(), findsOneWidget);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();
      expect(opened, ['/orders/1', '/orders/1']);
    });
  });

  group('a table', () {
    Map<String, Object?> column(
      String id,
      String text, [
      Map<String, Object?> p = const {},
    ]) => n('Column', {'id': id, ...p}, text);
    Map<String, Object?> row(
      String id,
      List<String> cells, [
      Map<String, Object?> p = const {},
    ]) => n('Row', {'id': id, ...p}, [for (final c in cells) n('Cell', {}, c)]);

    Map<String, Object?> table({
      Map<String, Object?> props = const {},
      List<Map<String, Object?>>? columns,
      List<Map<String, Object?>>? rows,
      List<Map<String, Object?>> totals = const [],
      Map<String, Object?>? actions,
    }) => {
      ...n(
        'Table',
        {'label': 'Orders', ...props},
        [
          n(
            'TableHeader',
            {},
            columns ?? [column('a', 'aa'), column('b', 'bb')],
          ),
          n(
            'TableBody',
            {},
            rows ??
                [
                  row('1', ['xxxx', 'xxxxxxxx']),
                  row('2', ['yy', 'yy']),
                  row('3', ['zz', 'zz']),
                ],
          ),
          if (totals.isNotEmpty) n('TableFooter', {}, totals),
        ],
      ),
      'actions': ?actions,
    };

    List<TableRow> rowsOf(WidgetTester tester) =>
        tester.widget<Table>(find.byType(Table)).children;

    DibaRowPaint paintOf(WidgetTester tester, int row) =>
        rowsOf(tester)[row].decoration! as DibaRowPaint;

    testWidgets('a grey frame 20 round, 4 in at its sides and foot', (
      tester,
    ) async {
      await paint(tester, table());
      final frame = boxed('aa', 20);
      expect(
        decorationOf(tester, frame).color,
        scheme(tester).surfaceContainer,
      );
      final box = tester.getRect(frame);
      final grid = tester.getRect(find.byType(Table));
      expect(grid.left, box.left + 4);
      expect(grid.right, box.right - 4);
      expect(grid.top, box.top);
      expect(box.bottom, grid.bottom + 4);
    });

    testWidgets('the head 36 tall, 12 on 16, medium and muted, 16 in', (
      tester,
    ) async {
      await paint(tester, table());
      final grid = tester.getRect(find.byType(Table));
      final heading = tester.getRect(find.text('aa'));
      expect(heading.topLeft, grid.topLeft + const Offset(16, 10));
      expect(heading.height, 16);
      final style = tester.widget<Text>(find.text('aa')).style!;
      expect(style.fontSize, 12);
      expect(style.fontWeight, FontWeight.w500);
      expect(style.color, scheme(tester).onSurfaceVariant);
      expect(tester.getRect(find.text('xxxx')).top, grid.top + 36 + 12);
    });

    testWidgets(
      'rows 45 tall, 14 on 20 in the text colour, a line under each',
      (tester) async {
        await paint(tester, table());
        final first = tester.getRect(find.text('xxxx'));
        final second = tester.getRect(find.text('yy').first);
        expect(second.top - first.top, 45);
        expect(first.height, 20);
        final s = scheme(tester);
        final line = dibaMixOklab(
          s.surface,
          0.81,
          s.onSurface,
          0.19,
        ).withValues(alpha: 0.5);
        for (var r = 1; r <= 3; r++) {
          expect(paintOf(tester, r).fill, s.surface);
          expect(paintOf(tester, r).line, line);
        }
        // The white body 16 round at its corners.
        expect(
          paintOf(tester, 1).radius,
          const BorderRadius.vertical(top: Radius.circular(16)),
        );
        expect(paintOf(tester, 2).radius, BorderRadius.zero);
        expect(
          paintOf(tester, 3).radius,
          const BorderRadius.vertical(bottom: Radius.circular(16)),
        );
        expect(rowsOf(tester).first.decoration, isNull);
      },
    );

    testWidgets('columns share the width as their widest cells ask', (
      tester,
    ) async {
      await paint(tester, table());
      final grid = tester.getRect(find.byType(Table));
      // Widest cells 4 and 8 glyphs of 14, 16 on each side: 88 and 144.
      final first = grid.width * 88 / (88 + 144);
      expect(tester.getRect(find.text('xxxx')).left, grid.left + 16);
      expect(
        tester.getRect(find.text('xxxxxxxx')).left,
        moreOrLessEquals(grid.left + first + 16, epsilon: 0.01),
      );
    });

    testWidgets('a table its cells cannot fit scrolls across', (tester) async {
      await paint(
        tester,
        table(
          rows: [
            row('1', ['x' * 30, 'y' * 30]),
          ],
        ),
        width: 400,
      );
      final frame = tester.getRect(boxed('aa', 20));
      expect(
        tester.getSize(find.byType(Table)).width,
        greaterThan(frame.width),
      );
      expect(
        find.ancestor(
          of: find.byType(Table),
          matching: find.byWidgetPredicate(
            (w) =>
                w is SingleChildScrollView &&
                w.scrollDirection == Axis.horizontal,
          ),
        ),
        findsOneWidget,
      );
    });

    testWidgets('a rule 1 by 16 at the end of each heading but the last', (
      tester,
    ) async {
      await paint(tester, table());
      final heads = tester
          .widgetList<CustomPaint>(
            find.byWidgetPredicate(
              (w) =>
                  w is CustomPaint &&
                  w.foregroundPainter.runtimeType.toString() == '_HeadPaint',
            ),
          )
          .toList();
      expect(heads, hasLength(2));
      String rule(CustomPaint p) =>
          (p.foregroundPainter as dynamic).rule == null ? 'none' : 'rule';
      expect(heads.map(rule), ['rule', 'none']);
    });

    testWidgets(
      'under the pointer a row lightens; chosen, it is the brand at 8%',
      (tester) async {
        await paint(
          tester,
          table(
            props: {
              'selectionMode': 'multiple',
              'defaultSelectedKeys': ['2'],
            },
          ),
        );
        final s = scheme(tester);
        expect(paintOf(tester, 2).fill, Color.lerp(s.surface, s.primary, 0.08));

        final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
        await mouse.addPointer(location: Offset.zero);
        addTearDown(mouse.removePointer);
        await mouse.moveTo(tester.getCenter(find.text('xxxx')));
        await tester.pump();
        expect(paintOf(tester, 1).fill, s.surface.withValues(alpha: 0.4));
        // The chosen row keeps its tint under the pointer, as Diba's web does.
        await mouse.moveTo(tester.getCenter(find.text('yy').first));
        await tester.pump();
        expect(paintOf(tester, 1).fill, s.surface);
        expect(paintOf(tester, 2).fill, Color.lerp(s.surface, s.primary, 0.08));
      },
    );

    testWidgets('a disabled row fades to half and answers nothing', (
      tester,
    ) async {
      await paint(
        tester,
        table(
          props: {'selectionMode': 'multiple'},
          rows: [
            row('1', ['aa1', 'b']),
            row('2', ['aa2', 'b'], {'isDisabled': true}),
          ],
        ),
      );
      final s = scheme(tester);
      expect(paintOf(tester, 2).fill, s.surface.withValues(alpha: 0.5));
      expect(
        find.ancestor(of: find.text('aa2'), matching: find.byType(Opacity)),
        findsOneWidget,
      );
      await tester.tap(find.text('aa2'), warnIfMissed: false);
      await tester.pump();
      final boxes = tester.widgetList<Checkbox>(find.byType(Checkbox)).toList();
      expect(boxes.map((b) => b.value), [false, false, false]);
    });

    testWidgets('choosing: a box per row 18 across, the head box chooses all', (
      tester,
    ) async {
      await paint(
        tester,
        table(
          props: {
            'selectionMode': 'multiple',
            'defaultSelectedKeys': ['1'],
          },
        ),
      );
      List<bool?> values() => tester
          .widgetList<Checkbox>(find.byType(Checkbox))
          .map((b) => b.value)
          .toList();
      // Some chosen: the head box is neither.
      expect(values(), [null, true, false, false]);
      final grid = tester.getRect(find.byType(Table));
      final headBox = tester.getRect(
        find
            .ancestor(
              of: find.byType(Checkbox).first,
              matching: find.byWidgetPredicate(
                (w) => w is SizedBox && w.width == 18 && w.height == 18,
              ),
            )
            .first,
      );
      expect(headBox.left, grid.left + 16);
      // With a box, the head is 38 tall: 10, the 18 box, 10.
      expect(tester.getRect(find.text('xxxx')).top, grid.top + 38 + 12);

      await tester.tap(find.byType(Checkbox).first);
      await tester.pump();
      expect(values(), [true, true, true, true]);
      await tester.tap(find.byType(Checkbox).first);
      await tester.pump();
      expect(values(), [false, false, false, false]);
      // A press on a row without an action chooses it.
      await tester.tap(find.text('xxxx'));
      await tester.pump();
      expect(values(), [null, true, false, false]);
    });

    testWidgets('choosing one: no head box, one choice at a time', (
      tester,
    ) async {
      await paint(tester, table(props: {'selectionMode': 'single'}));
      expect(find.byType(Checkbox), findsNWidgets(3));
      await tester.tap(find.text('xxxx'));
      await tester.pump();
      await tester.tap(find.text('zz').first);
      await tester.pump();
      expect(
        tester.widgetList<Checkbox>(find.byType(Checkbox)).map((b) => b.value),
        [false, false, true],
      );
    });

    testWidgets(
      'a sortable heading at the end: its words over its cells, the chevron 12 and 4 before them',
      (tester) async {
        await paint(
          tester,
          table(
            props: {
              'defaultSortColumn': 'b',
              'defaultSortDirection': 'ascending',
            },
            columns: [
              column('a', 'aa'),
              column('b', 'bb', {'allowsSorting': true, 'align': 'end'}),
            ],
          ),
        );
        final grid = tester.getRect(find.byType(Table));
        final chevron = tester.getRect(glyph(DibaGlyph.chevronDown));
        expect(chevron.size, const Size(12, 12));
        // Up for ascending: the down chevron turned half round.
        double turn() => tester
            .widget<Transform>(
              find
                  .ancestor(
                    of: glyph(DibaGlyph.chevronDown),
                    matching: find.byType(Transform),
                  )
                  .first,
            )
            .transform
            .storage[0];
        expect(turn(), closeTo(-1, 1e-9));
        // A column aligned to the end keeps its words over its cells, the
        // chevron 4 before them, as the web's; before,
        // the words stood at the heading's start.
        final words = tester.getRect(find.text('bb'));
        final cell = tester.getRect(find.text('xxxxxxxx'));
        expect(cell.right, grid.right - 16);
        expect(words.right, grid.right - 16);
        expect(words.left - chevron.right, moreOrLessEquals(4, epsilon: 0.01));
        expect(
          tester.widget<DibaGlyphMark>(glyph(DibaGlyph.chevronDown)).color,
          scheme(tester).onSurfaceVariant,
        );

        // The hand over it, and the text colour under a hover.
        expect(
          find.ancestor(
            of: find.text('bb'),
            matching: find.byWidgetPredicate(
              (w) => w is MouseRegion && w.cursor == SystemMouseCursors.click,
            ),
          ),
          findsOneWidget,
        );
        final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
        await mouse.addPointer(location: Offset.zero);
        addTearDown(mouse.removePointer);
        await mouse.moveTo(tester.getCenter(find.text('bb')));
        await tester.pump();
        expect(styleOf(tester, 'bb').color, scheme(tester).onSurface);
        expect(styleOf(tester, 'aa').color, scheme(tester).onSurfaceVariant);
      },
    );

    testWidgets('only the sorted column shows its chevron', (tester) async {
      await paint(
        tester,
        table(
          columns: [
            column('a', 'aa', {'allowsSorting': true}),
            column('b', 'bb', {'allowsSorting': true}),
          ],
        ),
      );
      expect(glyph(DibaGlyph.chevronDown), findsNothing);
      await tester.tap(find.text('aa'));
      await tester.pump();
      expect(glyph(DibaGlyph.chevronDown), findsOneWidget);
      double turn() => tester
          .widget<Transform>(
            find
                .ancestor(
                  of: glyph(DibaGlyph.chevronDown),
                  matching: find.byType(Transform),
                )
                .first,
          )
          .transform
          .storage[0];
      expect(turn(), closeTo(-1, 1e-9));
      await tester.tap(find.text('aa'));
      await tester.pump();
      // Pressed again, descending: the chevron as drawn, down.
      expect(turn(), closeTo(1, 1e-9));
    });

    testWidgets('totals under the body on the grey, semibold, no line', (
      tester,
    ) async {
      await paint(
        tester,
        table(
          totals: [
            row('sum', ['Total', '9']),
          ],
        ),
      );
      expect(rowsOf(tester).last.decoration, isNull);
      expect(
        DefaultTextStyle.of(
          tester.element(find.text('Total')),
        ).style.fontWeight,
        FontWeight.w600,
      );
      final last = tester.getRect(find.text('zz').first);
      expect(tester.getRect(find.text('Total')).top, last.bottom + 13 + 12);
    });

    testWidgets('empty: its message in the middle of the white body, muted', (
      tester,
    ) async {
      await paint(
        tester,
        table(props: {'emptyMessage': 'No orders yet.'}, rows: const []),
      );
      final box = boxed('No orders yet.', 16);
      expect(decorationOf(tester, box).color, scheme(tester).surface);
      final message = tester.getRect(find.text('No orders yet.'));
      final rect = tester.getRect(box);
      expect(message.top, rect.top + 24);
      expect(message.center.dx, moreOrLessEquals(rect.center.dx, epsilon: 0.5));
      expect(
        styleOf(tester, 'No orders yet.').color,
        scheme(tester).onSurfaceVariant,
      );
    });

    testWidgets('secondary: no frame, a grey head 16 round, clear rows', (
      tester,
    ) async {
      await paint(tester, table(props: {'variant': 'secondary'}));
      final s = scheme(tester);
      expect(
        find.ancestor(
          of: find.text('aa'),
          matching: find.byWidgetPredicate(
            (w) =>
                w is DecoratedBox &&
                w.decoration is BoxDecoration &&
                (w.decoration as BoxDecoration).borderRadius ==
                    const BorderRadius.all(Radius.circular(20)),
          ),
        ),
        findsNothing,
      );
      expect(paintOf(tester, 0).fill, s.surfaceContainer);
      expect(paintOf(tester, 0).radius, BorderRadius.circular(16));
      expect(paintOf(tester, 1).fill, isNull);
      expect(paintOf(tester, 1).radius, isNull);

      final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await mouse.addPointer(location: Offset.zero);
      addTearDown(mouse.removePointer);
      await mouse.moveTo(tester.getCenter(find.text('xxxx')));
      await tester.pump();
      expect(
        paintOf(tester, 1).fill,
        DibaLightNeutrals.fill.withValues(alpha: 0.5),
      );
    });

    testWidgets('a row with an action takes the keyboard, ringed inside', (
      tester,
    ) async {
      final opened = <Map<String, Object?>>[];
      await paint(
        tester,
        table(
          actions: {
            'onRowAction': {'do': 'call', 'action': 'open', 'value': 'id'},
          },
        ),
        handlers: DibaHandlers(call: (a, p) => opened.add(p)),
      );
      expect(paintOf(tester, 1).ring, isNull);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(paintOf(tester, 1).ring, DibaLightColors.ring);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();
      expect(opened, [
        {'id': '1'},
      ]);
    });

    testWidgets('load more: a small ghost button, pending while it loads', (
      tester,
    ) async {
      await paint(
        tester,
        table(
          props: {'isLoadingMore': true},
          actions: {
            'onLoadMore': {'do': 'call', 'action': 'more'},
          },
        ),
      );
      expect(find.byType(TextButton), findsOneWidget);
      expect(find.text('Load more'), findsOneWidget);
      expect(
        find.descendant(
          of: find.byType(TextButton),
          matching: find.byType(CircularProgressIndicator),
        ),
        findsOneWidget,
      );
      expect(tester.getSize(find.byType(TextButton)).height, 32);
    });
  });

  group('a modal', () {
    Map<String, Object?> modal({
      Map<String, Object?> props = const {},
      bool footer = true,
    }) => n('Modal', {'title': 'Edit', ...props}, [n('Text', {}, 'Body')], {
      'trigger': n('Button', {}, 'Open'),
      if (footer) 'footer': n('Button', {}, 'Save', null),
    });

    final dialog = find.byWidgetPredicate(
      (w) =>
          w is DecoratedBox &&
          w.decoration is ShapeDecoration &&
          ((w.decoration as ShapeDecoration).shape as RoundedRectangleBorder)
                  .borderRadius ==
              BorderRadius.circular(24),
    );
    final closeButton = find.byWidgetPredicate(
      (w) =>
          w is FilledButton &&
          w.style?.fixedSize?.resolve({}) == const Size.square(24),
    );

    Future<void> open(WidgetTester tester) async {
      await tester.tap(find.text('Open'));
      await tester.pumpAndSettle();
    }

    testWidgets('in the middle of a wide screen, as wide as its size', (
      tester,
    ) async {
      await paint(tester, modal(props: {'size': 'md'}));
      await open(tester);
      final box = tester.getRect(dialog);
      expect(box.width, 448);
      expect(box.center, const Offset(512, 450));
      final decoration = tester.widget<DecoratedBox>(dialog).decoration;
      expect(decoration, DibaTheme.overlay(dark: false, radius: 24));
    });

    testWidgets('lg by default, sm and xs narrower', (tester) async {
      for (final (size, width) in [
        (null, 512.0),
        ('sm', 384.0),
        ('xs', 320.0),
      ]) {
        await paint(tester, modal(props: {'size': ?size}));
        await open(tester);
        expect(tester.getRect(dialog).width, width);
        await tester.tapAt(const Offset(5, 5));
        await tester.pumpAndSettle();
      }
    });

    testWidgets('24 in; the close button 24 round, 16 from its corner', (
      tester,
    ) async {
      await paint(tester, modal());
      await open(tester);
      final box = tester.getRect(dialog);
      final heading = tester.getRect(find.text('Edit'));
      expect(heading.topLeft, box.topLeft + const Offset(24, 24));
      expect(heading.height, 24);
      final close = tester.getRect(closeButton);
      expect(close.size, const Size(24, 24));
      expect(close.topRight, box.topRight + const Offset(-16, 16));
      expect(glyph(DibaGlyph.close), findsOneWidget);
      // Pressed, it shrinks to 0.93.
      final hold = await tester.startGesture(tester.getCenter(closeButton));
      await tester.pump();
      expect(
        tester
            .widget<AnimatedScale>(
              find.ancestor(
                of: closeButton,
                matching: find.byType(AnimatedScale),
              ),
            )
            .scale,
        0.93,
      );
      await hold.cancel();
      await tester.pump();
      expect(
        tester.widget<DibaGlyphMark>(glyph(DibaGlyph.close)).color,
        DibaLightNeutrals.muted,
      );
      final style = tester.widget<FilledButton>(closeButton).style!;
      expect(style.backgroundColor!.resolve({}), DibaLightNeutrals.fill);
      expect(
        style.backgroundColor!.resolve({WidgetState.hovered}),
        DibaLightNeutrals.fillHover,
      );

      // The body 8 under the heading, 3 more for its own padding; the footer
      // 20 under the body, at the end; 24 under the footer.
      final body = tester.getRect(find.text('Body'));
      expect(body.top, heading.bottom + 8 + 3);
      final save = tester.getRect(find.widgetWithText(FilledButton, 'Save'));
      expect(save.top, body.bottom + 3 + 20);
      expect(save.right, box.right - 24);
      expect(box.bottom, save.bottom + 24);
    });

    testWidgets('the heading 16 on 24, medium; the body 14 on 20, muted', (
      tester,
    ) async {
      await paint(tester, modal());
      await open(tester);
      final heading = styleOf(tester, 'Edit');
      expect(heading.fontSize, 16);
      expect(heading.height, 24 / 16);
      expect(heading.fontWeight, FontWeight.w500);
      final body = DefaultTextStyle.of(tester.element(find.text('Body'))).style;
      expect(body.fontSize, 14);
      expect(body.height, 20 / 14);
      expect(body.color, scheme(tester).onSurfaceVariant);
    });

    testWidgets('its icon in a box 40 across over the heading, 12 apart', (
      tester,
    ) async {
      await paint(tester, modal(props: {'icon': 'map-pin'}));
      await open(tester);
      final box = tester.getRect(dialog);
      final icon = tester.getRect(find.byIcon(dibaIcon('map-pin')!));
      expect(icon.size, const Size(16, 16));
      expect(icon.center, box.topLeft + const Offset(24 + 20, 24 + 20));
      expect(tester.getRect(find.text('Edit')).top, box.top + 24 + 40 + 12);
    });

    testWidgets('the close button stands at the start in Persian', (
      tester,
    ) async {
      await paint(tester, modal(), lang: 'fa');
      await open(tester);
      final box = tester.getRect(dialog);
      expect(
        tester.getRect(closeButton).topLeft,
        box.topLeft + const Offset(16, 16),
      );
    });

    testWidgets('at the bottom of a phone, 16 from its edges', (tester) async {
      await paint(tester, modal(), width: 375, height: 800);
      await open(tester);
      final box = tester.getRect(dialog);
      expect(box.left, 16);
      expect(box.right, 375 - 16);
      expect(box.bottom, 800 - 16);
      expect(find.byType(BottomSheet), findsNothing);
    });

    testWidgets('placed at the top, 40 from it on a wide screen', (
      tester,
    ) async {
      await paint(tester, modal(props: {'placement': 'top'}));
      await open(tester);
      expect(tester.getRect(dialog).top, 40);
    });

    testWidgets('the backdrop, blurred 12 when asked, or none', (tester) async {
      Finder tint(Color c) =>
          find.byWidgetPredicate((w) => w is ColoredBox && w.color == c);
      await paint(tester, modal());
      await open(tester);
      expect(tint(scheme(tester).scrim), findsOneWidget);
      expect(find.byType(BackdropFilter), findsNothing);
      await tester.tapAt(const Offset(5, 5));
      await tester.pumpAndSettle();

      await paint(tester, modal(props: {'backdrop': 'blur'}));
      await open(tester);
      expect(tint(scheme(tester).scrim), findsOneWidget);
      final filter = tester.widget<BackdropFilter>(find.byType(BackdropFilter));
      expect(filter.filter.toString(), contains('12.0'));
      await tester.tapAt(const Offset(5, 5));
      await tester.pumpAndSettle();

      await paint(tester, modal(props: {'backdrop': 'transparent'}));
      await open(tester);
      expect(tint(scheme(tester).scrim), findsNothing);
    });

    testWidgets('comes in from 1.05 and clear over 250ms, goes to 0.95', (
      tester,
    ) async {
      await paint(tester, modal());
      await tester.tap(find.text('Open'));
      await tester.pump();
      await tester.pump();
      double scale() => tester
          .widget<Transform>(
            find.ancestor(of: dialog, matching: find.byType(Transform)).first,
          )
          .transform
          .storage[0];
      double opacity() => tester
          .widget<Opacity>(
            find.ancestor(of: dialog, matching: find.byType(Opacity)).first,
          )
          .opacity;
      expect(scale(), closeTo(1.05, 0.001));
      expect(opacity(), closeTo(0, 0.001));
      await tester.pump(const Duration(milliseconds: 125));
      expect(scale(), inExclusiveRange(1, 1.05));
      await tester.pump(const Duration(milliseconds: 130));
      expect(scale(), 1);
      expect(opacity(), 1);

      // The barrier pops a frame after the press.
      await tester.tapAt(const Offset(5, 5));
      await tester.pump();
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));
      expect(scale(), inExclusiveRange(0.95, 1));
      expect(opacity(), inExclusiveRange(0, 1));
      await tester.pump(const Duration(milliseconds: 60));
      expect(dialog, findsNothing);
    });

    testWidgets('a press outside or Escape closes it, unless not dismissable', (
      tester,
    ) async {
      await paint(tester, modal());
      await open(tester);
      await tester.tapAt(const Offset(5, 5));
      await tester.pumpAndSettle();
      expect(dialog, findsNothing);
      await open(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();
      expect(dialog, findsNothing);

      await paint(tester, modal(props: {'isDismissable': false}));
      await open(tester);
      await tester.tapAt(const Offset(5, 5));
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();
      expect(dialog, findsOneWidget);
      await tester.tap(closeButton);
      await tester.pumpAndSettle();
      expect(dialog, findsNothing);
    });

    testWidgets('a press on the dialog itself does not close it', (
      tester,
    ) async {
      await paint(tester, modal());
      await open(tester);
      await tester.tapAt(tester.getRect(dialog).center);
      await tester.pumpAndSettle();
      expect(dialog, findsOneWidget);
    });

    testWidgets(
      'scroll outside: the room scrolls, and a press outside closes',
      (tester) async {
        await paint(tester, modal(props: {'scroll': 'outside'}));
        await open(tester);
        expect(dialog, findsOneWidget);
        await tester.tapAt(const Offset(5, 5));
        await tester.pumpAndSettle();
        expect(dialog, findsNothing);
      },
    );

    testWidgets('full: the whole screen, square, without a shadow', (
      tester,
    ) async {
      await paint(tester, modal(props: {'size': 'full'}));
      await open(tester);
      expect(dialog, findsNothing);
      final box = tester.getRect(
        find
            .ancestor(
              of: find.text('Edit'),
              matching: find.byWidgetPredicate(
                (w) =>
                    w is DecoratedBox &&
                    w.decoration is BoxDecoration &&
                    (w.decoration as BoxDecoration).color ==
                        DibaTheme.lightScheme.surface,
              ),
            )
            .first,
      );
      expect(box, const Rect.fromLTWH(0, 0, 1024, 900));
    });
  });

  group('an alert dialog', () {
    Map<String, Object?> alert([Map<String, Object?> props = const {}]) => n(
      'AlertDialog',
      {
        'title': 'Delete it?',
        'description': 'It cannot be undone.',
        'confirmLabel': 'Delete',
        ...props,
      },
      null,
      {'trigger': n('Button', {}, 'Open')},
    );

    final dialog = find.byWidgetPredicate(
      (w) =>
          w is DecoratedBox &&
          w.decoration is ShapeDecoration &&
          ((w.decoration as ShapeDecoration).shape as RoundedRectangleBorder)
                  .borderRadius ==
              BorderRadius.circular(24),
    );

    Future<void> open(WidgetTester tester) async {
      await tester.tap(find.text('Open'));
      await tester.pumpAndSettle();
    }

    testWidgets('only its buttons close it: not a press outside, not Escape', (
      tester,
    ) async {
      await paint(tester, alert());
      await open(tester);
      await tester.tapAt(const Offset(5, 5));
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();
      expect(dialog, findsOneWidget);
      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();
      expect(dialog, findsNothing);
    });

    testWidgets('md, 448 wide; its mark, heading, words and buttons spaced', (
      tester,
    ) async {
      await paint(tester, alert());
      await open(tester);
      final box = tester.getRect(dialog);
      expect(box.width, 448);
      final mark = tester.getRect(
        find
            .ancestor(
              of: find.byIcon(dibaIcon('circle-alert')!),
              matching: find.byWidgetPredicate(
                (w) => w is SizedBox && w.width == 40 && w.height == 40,
              ),
            )
            .first,
      );
      expect(mark.topLeft, box.topLeft + const Offset(24, 24));
      expect(
        tester.getSize(find.byIcon(dibaIcon('circle-alert')!)),
        const Size(20, 20),
      );
      // Beside the heading, 12 before it and centred on it; the words
      // 8 under both, the whole width.
      final heading = tester.getRect(find.text('Delete it?'));
      expect(heading.left, mark.right + 12);
      expect(heading.center.dy, mark.center.dy);
      final words = tester.getRect(find.text('It cannot be undone.'));
      expect(words.top, mark.bottom + 8 + 3);
      expect(words.left, box.left + 24);
      final confirm = tester.getRect(
        find.widgetWithText(FilledButton, 'Delete'),
      );
      final cancel = tester.getRect(
        find.widgetWithText(FilledButton, 'Cancel'),
      );
      expect(confirm.top, words.bottom + 3 + 20);
      expect(confirm.height, 36);
      expect(confirm.right, box.right - 24);
      expect(confirm.left - cancel.right, 8);
      expect(box.bottom, confirm.bottom + 24);
      expect(
        DefaultTextStyle.of(
          tester.element(find.text('It cannot be undone.')),
        ).style.color,
        scheme(tester).onSurfaceVariant,
      );
    });

    testWidgets('a heading on two lines is the row\'s height, the mark on its '
        'middle; in Persian the mark at the right', (tester) async {
      await paint(
        tester,
        alert({
          'title':
              'همهٔ ۲۴ سفارش انتخاب‌شده لغو شوند و مبلغشان از همان راهی که '
              'پرداخت شده به خریداران برگردد؟',
          'description': 'این کار برگشت‌پذیر نیست.',
        }),
        lang: 'fa',
      );
      await open(tester);
      final box = tester.getRect(dialog);
      final mark = tester.getRect(
        find
            .ancestor(
              of: find.byIcon(dibaIcon('circle-alert')!),
              matching: find.byWidgetPredicate(
                (w) => w is SizedBox && w.width == 40 && w.height == 40,
              ),
            )
            .first,
      );
      expect(mark.right, box.right - 24);
      final heading = tester.getRect(find.textContaining('همهٔ ۲۴ سفارش'));
      // The test font draws every letter a square, so it wraps further.
      expect(heading.height, greaterThan(24));
      expect(heading.top, box.top + 24);
      expect(heading.right, mark.left - 12);
      expect(heading.center.dy, mark.center.dy);
      final words = tester.getRect(find.text('این کار برگشت‌پذیر نیست.'));
      expect(words.top, heading.bottom + 8 + 3);
      expect(words.right, box.right - 24);
    });

    testWidgets(
      'the mark: the status soft and its soft text, by the web\'s mixes',
      (tester) async {
        // The status's sign, Lucide's.
        final signs = [
          'info',
          'circle-check',
          'triangle-alert',
          'circle-alert',
        ].map(dibaIcon).toSet();
        final sign = find.byWidgetPredicate(
          (w) => w is Icon && signs.contains(w.icon),
        );
        Color soft() =>
            (tester
                        .widget<DecoratedBox>(
                          find
                              .ancestor(
                                of: sign,
                                matching: find.byWidgetPredicate(
                                  (w) =>
                                      w is DecoratedBox &&
                                      w.decoration is BoxDecoration &&
                                      (w.decoration as BoxDecoration).shape ==
                                          BoxShape.circle,
                                ),
                              )
                              .first,
                        )
                        .decoration
                    as BoxDecoration)
                .color!;
        Color ink() => tester.widget<Icon>(sign).color!;

        const text = DibaLightNeutrals.foreground;
        await paint(tester, alert());
        await open(tester);
        expect(soft(), DibaLightColors.danger.withValues(alpha: 0.15));
        expect(ink(), dibaMixOklab(DibaLightColors.danger, 0.7, text, 0.4));
        await tester.tap(find.text('Cancel'));
        await tester.pumpAndSettle();

        await paint(tester, alert({'status': 'warning'}));
        await open(tester);
        expect(find.byIcon(dibaIcon('triangle-alert')!), findsOneWidget);
        expect(soft(), DibaLightColors.warning.withValues(alpha: 0.15));
        expect(ink(), dibaMixOklab(DibaLightColors.warning, 0.8, text, 0.7));
        await tester.tap(find.text('Cancel'));
        await tester.pumpAndSettle();

        await paint(tester, alert({'status': 'accent'}));
        await open(tester);
        expect(find.byIcon(dibaIcon('info')!), findsOneWidget);
        expect(soft(), DibaLightColors.primarySoft);
        expect(ink(), DibaLightColors.primaryEmphasis);
        await tester.tap(find.text('Cancel'));
        await tester.pumpAndSettle();

        await paint(tester, alert({'status': 'success'}), dark: true);
        await open(tester);
        expect(find.byIcon(dibaIcon('circle-check')!), findsOneWidget);
        expect(soft(), DibaDarkColors.success.withValues(alpha: 0.12));
        expect(
          ink(),
          dibaMixOklab(
            DibaDarkColors.success,
            0.8,
            DibaDarkNeutrals.foreground,
            0.3,
          ),
        );
      },
    );

    testWidgets('confirm is danger for danger and primary otherwise', (
      tester,
    ) async {
      Color fill() => tester
          .widget<FilledButton>(find.widgetWithText(FilledButton, 'Delete'))
          .style!
          .backgroundColor!
          .resolve({})!;
      await paint(tester, alert());
      await open(tester);
      expect(fill(), DibaLightColors.danger);
      expect(
        tester
            .widget<FilledButton>(find.widgetWithText(FilledButton, 'Cancel'))
            .style!
            .backgroundColor!
            .resolve({}),
        DibaLightNeutrals.fill,
      );
      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();
      await paint(tester, alert({'status': 'warning'}));
      await open(tester);
      expect(fill(), DibaLightColors.primary);
    });

    testWidgets('while confirming, cancel waits and confirm spins', (
      tester,
    ) async {
      await paint(
        tester,
        {
          ...alert(),
          'actions': {
            'onConfirm': {'do': 'call', 'action': 'delete'},
          },
        },
        handlers: DibaHandlers(
          call: (a, p) => Future<void>.delayed(const Duration(seconds: 1)),
        ),
      );
      await open(tester);
      await tester.tap(find.text('Delete'));
      await tester.pump();
      expect(
        tester
            .widget<FilledButton>(find.widgetWithText(FilledButton, 'Cancel'))
            .onPressed,
        isNull,
      );
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      await tester.pumpAndSettle(const Duration(seconds: 2));
      expect(dialog, findsNothing);
    });
  });

  group('a popover', () {
    Map<String, Object?> popover([Map<String, Object?> props = const {}]) => n(
      'Popover',
      {'title': 'Fee', ...props},
      [n('Text', {}, 'Two percent.')],
      {'trigger': n('Button', {}, 'Open')},
    );

    final panel = find.byWidgetPredicate(
      (w) =>
          w is DecoratedBox &&
          w.decoration is ShapeDecoration &&
          ((w.decoration as ShapeDecoration).shape as RoundedRectangleBorder)
                  .borderRadius ==
              BorderRadius.circular(24),
    );
    final arrow = find.byWidgetPredicate(
      (w) =>
          w is CustomPaint &&
          w.painter.runtimeType.toString() == '_PopoverArrowPainter',
    );

    testWidgets('the overlay 24 round, 16 in, 8 under its trigger', (
      tester,
    ) async {
      await paint(tester, popover());
      await tester.tap(find.text('Open'));
      await tester.pumpAndSettle();
      final box = tester.getRect(panel);
      expect(
        tester.widget<DecoratedBox>(panel).decoration,
        DibaTheme.overlay(dark: false, radius: 24),
      );
      final trigger = tester.getRect(find.widgetWithText(FilledButton, 'Open'));
      expect(box.top, trigger.bottom + 8);
      final title = tester.getRect(find.text('Fee'));
      expect(title.topLeft, box.topLeft + const Offset(16, 16));
      expect(tester.getRect(find.text('Two percent.')).top, title.bottom);
      final style = styleOf(tester, 'Fee');
      expect(style.fontSize, 14);
      expect(style.height, 20 / 14);
      expect(style.fontWeight, FontWeight.w500);
      // As wide as its words ask, not the screen.
      expect(box.width, lessThan(400));
      expect(arrow, findsNothing);
    });

    testWidgets('its arrow 12 by 6 in the gap, at the trigger', (tester) async {
      await paint(tester, popover({'showArrow': true}));
      await tester.tap(find.text('Open'));
      await tester.pumpAndSettle();
      final tip = tester.getRect(arrow);
      final box = tester.getRect(panel);
      final trigger = tester.getRect(find.widgetWithText(FilledButton, 'Open'));
      expect(tip.size, const Size(12, 6));
      expect(tip.bottom, box.top);
      expect(box.top, trigger.bottom + 8);
    });

    testWidgets('a popover on a phone too, not a sheet', (tester) async {
      await paint(tester, popover(), width: 375);
      await tester.tap(find.text('Open'));
      await tester.pumpAndSettle();
      expect(panel, findsOneWidget);
      expect(find.byType(BottomSheet), findsNothing);
    });

    /// it turns to the other side of its trigger only when it does not
    /// fit on its own, and keeps 8 clear of the window's sides, as React Aria
    /// does on the web with the padding Diba gives it.
    group('where it opens', () {
      final trigger = find.widgetWithText(FilledButton, 'Open');

      /// The popover's trigger with its top-left corner at [at], in a 1024 by
      /// 900 window unless [window] says otherwise, opened.
      Future<({Rect trigger, Rect panel})> openAt(
        WidgetTester tester,
        Map<String, Object?> tree,
        Offset at, {
        String lang = 'en',
        Size window = const Size(1024, 900),
      }) async {
        tester.view
          ..physicalSize = window
          ..devicePixelRatio = 1;
        addTearDown(tester.view.reset);
        Widget app(Offset at) => MaterialApp(
          theme: DibaTheme.light(),
          locale: Locale(lang),
          supportedLocales: const [Locale('fa'), Locale('en')],
          localizationsDelegates: GlobalMaterialLocalizations.delegates,
          home: Scaffold(
            body: Stack(
              children: [
                // The trigger fills the box: narrow, so a panel centred on
                // it is wider than it.
                Positioned(
                  left: at.dx,
                  top: at.dy,
                  width: 100,
                  child: DibaSurface(tree: tree),
                ),
              ],
            ),
          ),
        );
        await tester.pumpWidget(const SizedBox());
        await tester.pumpWidget(app(const Offset(300, 300)));
        // Where the box puts the trigger, so the trigger lands at [at].
        final shift = tester.getTopLeft(trigger) - const Offset(300, 300);
        await tester.pumpWidget(app(at - shift));
        await tester.tap(trigger);
        await tester.pumpAndSettle();
        return (trigger: tester.getRect(trigger), panel: tester.getRect(panel));
      }

      testWidgets('above its trigger near the top while it fits, below once '
          'it does not', (tester) async {
        final tree = popover({'placement': 'top'});
        var opened = await openAt(tester, tree, const Offset(400, 300));
        final height = opened.panel.height;
        // 4 to spare above: it stays.
        opened = await openAt(tester, tree, Offset(400, height + 8 + 4));
        expect(opened.panel.bottom, opened.trigger.top - 8);
        expect(opened.panel.top, 4);
        // 4 short: below, with the room.
        opened = await openAt(tester, tree, Offset(400, height + 8 - 4));
        expect(opened.panel.top, opened.trigger.bottom + 8);
      });

      testWidgets('below its trigger near the bottom while it fits', (
        tester,
      ) async {
        final tree = popover();
        var opened = await openAt(tester, tree, const Offset(400, 300));
        final below = opened.panel.height + 8 + 4 + opened.trigger.height;
        opened = await openAt(tester, tree, Offset(400, 900 - below));
        expect(opened.panel.top, opened.trigger.bottom + 8);
        expect(opened.panel.bottom, 896);
      });

      testWidgets('at the start, the right in Persian, while it fits; at the '
          'end once it does not', (tester) async {
        final tree = popover({'placement': 'start'});
        var opened = await openAt(
          tester,
          tree,
          const Offset(400, 300),
          lang: 'fa',
        );
        final width = opened.panel.width;
        final across = opened.trigger.width;
        opened = await openAt(
          tester,
          tree,
          Offset(1024 - (width + 8 + 4) - across, 300),
          lang: 'fa',
        );
        expect(opened.panel.left, opened.trigger.right + 8);
        expect(opened.panel.right, 1020);
        opened = await openAt(
          tester,
          tree,
          Offset(1024 - (width + 8 - 4) - across, 300),
          lang: 'fa',
        );
        expect(opened.panel.right, opened.trigger.left - 8);
      });

      testWidgets('on its own side when the other has even less room, 8 '
          'clear of the edge', (tester) async {
        final tree = popover();
        var opened = await openAt(tester, tree, const Offset(400, 300));
        // A short window with the trigger 20 from its top: below is 4 short
        // of the panel, and above is shorter still.
        final window = Size(
          1024,
          opened.panel.height + opened.trigger.height + 20 + 8 - 4,
        );
        opened = await openAt(
          tester,
          tree,
          const Offset(400, 20),
          window: window,
        );
        expect(opened.panel.top, greaterThan(opened.trigger.top));
        expect(opened.panel.bottom, window.height - 8);
      });

      testWidgets("8 clear of the window's side", (tester) async {
        final opened = await openAt(
          tester,
          popover({'placement': 'top'}),
          const Offset(0, 300),
        );
        // Centred on the trigger, it would start left of the window.
        expect(opened.panel.width / 2, greaterThan(opened.trigger.center.dx));
        expect(opened.panel.left, 8);
      });

      testWidgets('its arrow turns with it, still pointing at the trigger', (
        tester,
      ) async {
        final tree = popover({'placement': 'top', 'showArrow': true});
        var opened = await openAt(tester, tree, const Offset(400, 300));
        expect(tester.getRect(arrow).top, opened.panel.bottom);
        AxisDirection facing() =>
            (tester.widget<CustomPaint>(arrow).painter! as dynamic).facing.value
                as AxisDirection;
        expect(facing(), AxisDirection.down);
        final height = opened.panel.height;
        // Room above, though under 240: above still.
        opened = await openAt(tester, tree, Offset(400, height + 8 + 4));
        expect(opened.panel.bottom, opened.trigger.top - 8);
        expect(tester.getRect(arrow).top, opened.panel.bottom);
        // No room: below, its arrow over it pointing up.
        opened = await openAt(tester, tree, Offset(400, height + 8 - 4));
        expect(opened.panel.top, opened.trigger.bottom + 8);
        final tip = tester.getRect(arrow);
        expect(tip.size, const Size(12, 6));
        expect(tip.bottom, opened.panel.top);
        expect(facing(), AxisDirection.up);
      });
    });
  });

  testWidgets('a form: its error after the fields, as a field error', (
    tester,
  ) async {
    await paint(
      tester,
      n(
        'Form',
        {'errorMessage': 'It failed.'},
        [
          n('TextField', {'label': 'Name', 'name': 'name'}),
        ],
      ),
    );
    final field = tester.getRect(find.byType(TextField));
    final error = tester.getRect(find.text('It failed.'));
    final form = tester.getRect(find.byType(Form));
    expect(error.top, greaterThanOrEqualTo(field.bottom + 16));
    expect(error.left, form.left + 4);
    expect(form.bottom, error.bottom);
    final style = styleOf(tester, 'It failed.');
    expect(style.fontSize, 12);
    expect(style.height, 16 / 12);
    expect(style.color, scheme(tester).error);
  });
}
