import 'package:diba/diba.dart';
import 'package:diba/src/sdui/glyphs.dart';
import 'package:diba/src/sdui/oklab.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// The structure in Diba's look. Every number here
/// is the web's on a Persian page; the
/// drawer's motion is Flutter's, which the web took
/// (`structure.browser.test.tsx`).
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    double width = 1024,
    double height = 900,
    bool dark = false,
    String event = 'onChange',
    DibaHandlers handlers = const DibaHandlers(),
  }) async {
    tester.view
      ..physicalSize = Size(width, height)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      MaterialApp(
        theme: dark ? DibaTheme.dark() : DibaTheme.light(),
        locale: const Locale('fa'),
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(
          body: Padding(
            padding: const EdgeInsets.all(20),
            child: DibaSurface(
              tree: {
                ...tree,
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

  Map<String, Object?> n(
    String type,
    Map<String, Object?> props, [
    Object? children,
    Map<String, Object?>? slots,
  ]) => {'type': type, 'props': props, 'children': ?children, 'slots': ?slots};

  Map<String, Object?> text(String s) => n('Text', {}, s);

  TextStyle styleOf(WidgetTester tester, String text) =>
      tester.widget<Text>(find.text(text)).style!;

  Finder glyph(DibaGlyph g) =>
      find.byWidgetPredicate((w) => w is DibaGlyphMark && w.glyph == g);

  // -------------------------------------------------------------------------

  group('Tabs', () {
    Map<String, Object?> tabs([String variant = 'primary']) => n(
      'Tabs',
      {'label': 'بخش‌ها', 'variant': variant},
      [
        n(
          'Tab',
          {'id': 'items', 'label': 'اقلام', 'icon': 'package'},
          [text('سه قلم')],
        ),
        n('Tab', {'id': 'shipping', 'label': 'ارسال'}, [text('تیپاکس')]),
        n(
          'Tab',
          {'id': 'notes', 'label': 'یادداشت', 'isDisabled': true},
          [text('هیچ')],
        ),
      ],
    );

    /// A tab's whole cell: the pressable box round its label.
    Rect cell(WidgetTester tester, String label) => tester.getRect(
      find.ancestor(of: find.text(label), matching: find.byType(InkWell)).first,
    );

    testWidgets('primary: a slate track 40 tall and pill round, 4 in; the '
        'tabs 32 tall sharing it; the chosen one the paper pill', (
      tester,
    ) async {
      await paint(tester, tabs());
      final track = find
          .ancestor(
            of: find.byType(TabBar),
            matching: find.byWidgetPredicate(
              (w) =>
                  w is Container &&
                  w.decoration is ShapeDecoration &&
                  (w.decoration as ShapeDecoration).shape is StadiumBorder,
            ),
          )
          .first;
      final box = tester.getRect(track);
      expect(box.height, 40);
      expect(box.width, 984);
      final look = tester.widget<Container>(track).decoration!;
      expect((look as ShapeDecoration).color, DibaLightColors.segmentList);

      final cells = [
        for (final l in ['اقلام', 'ارسال', 'یادداشت']) cell(tester, l),
      ];
      for (final c in cells) {
        expect(c.height, 32);
        expect(c.width, closeTo((984 - 8) / 3, 0.01));
        expect(c.top, box.top + 4);
      }
      // Right to left: the first tab at the right, 4 in.
      expect(cells.first.right, box.right - 4);

      final bar = tester.widget<TabBar>(find.byType(TabBar));
      final pill = bar.indicator! as ShapeDecoration;
      expect(pill.shape, isA<StadiumBorder>());
      expect(pill.color, DibaLightColors.segment);
      // The web's segment shadow: 0 2 4 at 4%, 0 1 2 and 0 0 1 at 6%.
      expect(pill.shadows, hasLength(3));
      expect(pill.shadows!.first.color, const Color(0x0A000000));
      expect(pill.shadows!.first.offset, const Offset(0, 2));
    });

    testWidgets('labels 14 on 20, medium; the chosen in the text\'s colour, '
        'the rest muted; a disabled one at half', (tester) async {
      await paint(tester, tabs());
      final bar = tester.widget<TabBar>(find.byType(TabBar));
      expect(bar.labelStyle!.fontSize, 14);
      expect(bar.labelStyle!.height, 20 / 14);
      expect(bar.labelStyle!.fontWeight, FontWeight.w500);
      expect(bar.unselectedLabelStyle, bar.labelStyle);
      expect(bar.labelColor, DibaLightNeutrals.foreground);
      expect(bar.unselectedLabelColor, DibaLightNeutrals.muted);
      final faded = tester.widget<Opacity>(
        find
            .ancestor(of: find.text('یادداشت'), matching: find.byType(Opacity))
            .first,
      );
      expect(faded.opacity, 0.5);
      final whole = tester.widget<Opacity>(
        find
            .ancestor(of: find.text('ارسال'), matching: find.byType(Opacity))
            .first,
      );
      expect(whole.opacity, 1);
    });

    testWidgets('an icon 16, 8 before its label', (tester) async {
      await paint(tester, tabs());
      final icon = tester.getRect(find.byType(Icon));
      final label = tester.getRect(find.text('اقلام'));
      expect(icon.size, const Size(16, 16));
      // Right to left, the icon is at the label's right.
      expect(icon.left - label.right, 8);
    });

    testWidgets('a label longer than its tab fades at its end, and runs '
        'over nothing', (tester) async {
      await paint(tester, tabs(), width: 300);
      expect(tester.takeException(), isNull);
      final label = tester.widget<Text>(find.text('یادداشت'));
      expect(label.overflow, TextOverflow.fade);
      expect(label.softWrap, isFalse);
    });

    testWidgets('the panel 16 under the list, its blocks 8 in', (tester) async {
      await paint(tester, tabs());
      final list = tester.getRect(find.byType(TabBar));
      final body = tester.getRect(find.text('سه قلم'));
      expect(body.top, list.bottom + 4 + 16);
      expect(body.left, 20 + 8);
      expect(body.right, 1004 - 8);
    });

    testWidgets('secondary: tabs 32 tall, a line across 1 under them in the '
        'separator\'s colour; the chosen one\'s gilt 2 under it', (
      tester,
    ) async {
      await paint(tester, tabs('secondary'));
      final bar = tester.getRect(find.byType(TabBar));
      expect(bar.height, 32);
      expect(cell(tester, 'ارسال').height, 32);
      final line = find.byWidgetPredicate(
        (w) => w is ColoredBox && w.color == DibaLightNeutrals.border,
      );
      final across = tester.getRect(line);
      expect(across.height, 1);
      expect(across.width, 984);
      expect(across.top, bar.bottom + 1);
      final indicator =
          tester.widget<TabBar>(find.byType(TabBar)).indicator!
              as UnderlineTabIndicator;
      expect(indicator.borderSide.width, 2);
      expect(indicator.borderSide.color, DibaLightColors.controlFill);
      expect(tester.getRect(find.text('سه قلم')).top, across.bottom + 16);
    });
  });

  // -------------------------------------------------------------------------

  group('Accordion', () {
    Map<String, Object?> accordion([Map<String, Object?> props = const {}]) =>
        n(
          'Accordion',
          {
            'defaultExpandedKeys': ['ship'],
            ...props,
          },
          [
            n(
              'AccordionItem',
              {'id': 'ship', 'title': 'ارسال'},
              [text('دو روز')],
            ),
            n(
              'AccordionItem',
              {'id': 'return', 'title': 'مرجوعی', 'icon': 'rotate-ccw'},
              [text('هفت روز')],
            ),
            n(
              'AccordionItem',
              {'id': 'pay', 'title': 'پرداخت', 'isDisabled': true},
              [text('درگاه')],
            ),
          ],
        );

    Finder chevrons() => glyph(DibaGlyph.chevronDown);

    testWidgets('rows 52 tall: titles 14 on 20, medium, 16 in; the chevron 16 '
        'and muted, 16 from the end', (tester) async {
      await paint(tester, accordion({'defaultExpandedKeys': <String>[]}));
      final titles = [
        for (final t in ['ارسال', 'مرجوعی', 'پرداخت'])
          tester.getRect(find.text(t)),
      ];
      expect(titles[0].top, 20 + 16);
      expect(titles[1].top, 20 + 52 + 16);
      expect(titles[2].top, 20 + 104 + 16);
      expect(titles[0].right, 1004 - 16);
      final style = styleOf(tester, 'ارسال');
      expect(style.fontSize, 14);
      expect(style.height, 20 / 14);
      expect(style.fontWeight, FontWeight.w500);
      expect(style.color, DibaLightNeutrals.foreground);

      final chevron = tester.getRect(chevrons().first);
      expect(chevron.size, const Size(16, 16));
      // Right to left, the end is the left.
      expect(chevron.left, 20 + 16);
      expect(chevron.top, 20 + 18);
      expect(
        tester.widget<DibaGlyphMark>(chevrons().first).color,
        DibaLightNeutrals.muted,
      );
    });

    testWidgets('an icon 16 and muted, 12 before its title', (tester) async {
      await paint(tester, accordion());
      final icon = tester.widget<Icon>(find.byType(Icon));
      expect(icon.size, 16);
      expect(icon.color, DibaLightNeutrals.muted);
      final at = tester.getRect(find.byType(Icon));
      expect(at.right, 1004 - 16);
      expect(at.left - tester.getRect(find.text('مرجوعی')).right, 12);
    });

    testWidgets('an open item: its blocks under its row, 16 in and 16 above '
        'its end; its chevron turned over', (tester) async {
      await paint(tester, accordion());
      final body = tester.getRect(find.text('دو روز'));
      expect(body.top, 20 + 52);
      expect(body.left, 20 + 16);
      expect(body.right, 1004 - 16);
      expect(tester.getRect(find.text('مرجوعی')).top, body.bottom + 16 + 16);
      final turns = [
        for (final r in tester.widgetList<AnimatedRotation>(
          find.byType(AnimatedRotation),
        ))
          r.turns,
      ];
      expect(turns, [-0.5, 0, 0]);
    });

    testWidgets('a line between items over each one\'s last pixel, the '
        'separator\'s colour; none after the last', (tester) async {
      await paint(tester, accordion({'defaultExpandedKeys': <String>[]}));
      final lines = find.byWidgetPredicate(
        (w) => w is ColoredBox && w.color == DibaLightNeutrals.border,
      );
      expect(lines, findsNWidgets(2));
      final first = tester.getRect(lines.first);
      expect(first, const Rect.fromLTWH(20, 20 + 51, 984, 1));
      expect(tester.getRect(lines.last).top, 20 + 103);
    });

    testWidgets('on the surface: a paper card 24 round; its lines the '
        'text\'s colour at 6%, 94% across, centred', (tester) async {
      await paint(
        tester,
        accordion({'variant': 'surface', 'defaultExpandedKeys': <String>[]}),
      );
      final card = find
          .ancestor(
            of: find.text('ارسال'),
            matching: find.byWidgetPredicate(
              (w) => w is DecoratedBox && w.decoration is BoxDecoration,
            ),
          )
          .first;
      final paper = tester.widget<DecoratedBox>(card).decoration;
      expect((paper as BoxDecoration).color, DibaLightNeutrals.surface);
      expect(paper.borderRadius, BorderRadius.circular(24));
      expect(paper.boxShadow, isNull);
      final lines = find.byWidgetPredicate(
        (w) =>
            w is ColoredBox &&
            w.color == DibaLightNeutrals.foreground.withValues(alpha: 0.06),
      );
      expect(lines, findsNWidgets(2));
      final line = tester.getRect(lines.first);
      expect(line.width, closeTo(984 * 0.94, 0.01));
      expect(line.center.dx, closeTo(512, 0.01));
    });

    testWidgets('a disabled item faded to half, and not opened', (
      tester,
    ) async {
      Map<String, Object?>? sent;
      await paint(
        tester,
        accordion(),
        event: 'onExpandedChange',
        handlers: DibaHandlers(call: (_, p) => sent = p),
      );
      final faded = tester.widget<Opacity>(
        find
            .ancestor(of: find.text('پرداخت'), matching: find.byType(Opacity))
            .first,
      );
      expect(faded.opacity, 0.5);
      await tester.tap(find.text('پرداخت'));
      await tester.pumpAndSettle();
      expect(sent, isNull);
      expect(find.text('درگاه'), findsNothing);
    });

    testWidgets('a closed row under the pointer: the text\'s colour at 3%; on '
        'the surface, the fill', (tester) async {
      for (final (props, fill) in [
        (
          <String, Object?>{},
          DibaLightNeutrals.foreground.withValues(alpha: 0.03),
        ),
        (<String, Object?>{'variant': 'surface'}, DibaLightNeutrals.fill),
      ]) {
        await paint(tester, accordion(props));
        final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
        await mouse.addPointer(location: Offset.zero);
        await mouse.moveTo(tester.getCenter(find.text('مرجوعی')));
        await tester.pump();
        expect(
          find.byWidgetPredicate((w) => w is Container && w.color == fill),
          findsOneWidget,
        );
        // An open row keeps no fill.
        await mouse.moveTo(tester.getCenter(find.text('ارسال')));
        await tester.pump();
        expect(
          find.byWidgetPredicate((w) => w is Container && w.color == fill),
          findsNothing,
        );
        await mouse.removePointer();
      }
    });

    testWidgets('it opens over 200ms, as the web\'s panel', (tester) async {
      await paint(
        tester,
        accordion({'defaultExpandedKeys': <String>[]}),
        event: 'onExpandedChange',
      );
      final closed = tester.getRect(find.text('پرداخت')).top;
      await tester.tap(find.text('مرجوعی'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));
      final midway = tester.getRect(find.text('پرداخت')).top;
      await tester.pump(const Duration(milliseconds: 100));
      await tester.pump();
      final open = tester.getRect(find.text('پرداخت')).top;
      // Its blocks, 24, and 16 under them.
      expect(open, closed + 40);
      expect(midway, greaterThan(closed));
      expect(midway, lessThan(open));
    });
  });

  // -------------------------------------------------------------------------

  group('Separator', () {
    testWidgets('across: 1 thick in the separator\'s colour; the secondary and '
        'tertiary the surface mixed 15% and 19% to the text in Oklab', (
      tester,
    ) async {
      await paint(
        tester,
        n('Stack', {}, [
          n('Separator', {}),
          n('Separator', {'variant': 'secondary'}),
          n('Separator', {'variant': 'tertiary'}),
        ]),
      );
      final lines = tester.widgetList<Divider>(find.byType(Divider)).toList();
      const surface = DibaLightNeutrals.surface;
      const ink = DibaLightNeutrals.foreground;
      expect(
        [for (final l in lines) l.color],
        [
          DibaLightNeutrals.border,
          dibaMixOklab(surface, 0.85, ink, 0.15),
          dibaMixOklab(surface, 0.81, ink, 0.19),
        ],
      );
      for (final l in lines) {
        expect(l.thickness, 1);
        expect(l.height, 1);
      }
      expect(tester.getSize(find.byType(Divider).first), const Size(984, 1));
    });

    testWidgets('down: 1 across and as tall as its row, at least 8', (
      tester,
    ) async {
      final rule = find.descendant(
        of: find.byType(Row),
        matching: find.byWidgetPredicate((w) => w is LeafRenderObjectWidget),
      );
      await paint(
        tester,
        n(
          'Stack',
          {'direction': 'horizontal', 'gap': 3, 'align': 'center'},
          [
            text('سفارش‌ها'),
            n('Separator', {'orientation': 'vertical'}),
            text('مشتری‌ها'),
          ],
        ),
      );
      final row = tester.getRect(find.text('سفارش‌ها'));
      final down = tester.getRect(rule.first);
      expect(down.width, 1);
      expect(down.height, row.height);
      expect(down.top, row.top);
      await paint(
        tester,
        n(
          'Stack',
          {'direction': 'horizontal'},
          [
            n('Separator', {'orientation': 'vertical'}),
          ],
        ),
      );
      expect(tester.getSize(rule.first), const Size(1, 8));
    });
  });

  // -------------------------------------------------------------------------

  group('Fieldset', () {
    testWidgets('its legend 16 on 24, medium; its description 12 on 16, '
        'muted, right under it; its fields 24 down and 16 apart', (
      tester,
    ) async {
      await paint(
        tester,
        n(
          'Fieldset',
          {'legend': 'نشانی', 'description': 'روی فاکتور'},
          [
            n('TextField', {'label': 'شهر'}),
            n('TextField', {'label': 'خیابان'}),
          ],
        ),
      );
      final legend = styleOf(tester, 'نشانی');
      expect(legend.fontSize, 16);
      expect(legend.height, 24 / 16);
      expect(legend.fontWeight, FontWeight.w500);
      expect(legend.color, DibaLightNeutrals.foreground);
      final help = styleOf(tester, 'روی فاکتور');
      expect(help.fontSize, 12);
      expect(help.height, 16 / 12);
      expect(help.color, DibaLightNeutrals.muted);

      final title = tester.getRect(find.text('نشانی'));
      final note = tester.getRect(find.text('روی فاکتور'));
      final first = tester.getRect(find.text('شهر'));
      final fields = find.byType(InputDecorator);
      expect(title.height, 24);
      expect(note.top, title.bottom);
      expect(first.top, note.bottom + 24);
      expect(
        tester.getRect(find.text('خیابان')).top,
        tester.getRect(fields.first).bottom + 16,
      );
    });
  });

  // -------------------------------------------------------------------------

  group('Drawer', () {
    Map<String, Object?> drawer(
      String placement, {
      String backdrop = 'opaque',
      List<Map<String, Object?>>? body,
    }) => n(
      'Drawer',
      {'title': 'سفارش', 'placement': placement, 'backdrop': backdrop},
      body ?? [text('سه قلم')],
      {
        'trigger': n('Button', {}, 'باز'),
        'footer': n('Button', {'size': 'sm'}, 'چاپ'),
      },
    );

    Finder paper() => find
        .ancestor(
          of: find.text('سفارش'),
          matching: find.byWidgetPredicate(
            (w) => w is DecoratedBox && w.decoration is ShapeDecoration,
          ),
        )
        .first;

    Finder close() => find
        .ancestor(
          of: glyph(DibaGlyph.close),
          matching: find.byType(FilledButton),
        )
        .first;

    Future<void> open(WidgetTester tester, Map<String, Object?> tree) async {
      await paint(tester, tree);
      await tester.tap(find.text('باز'));
      await tester.pumpAndSettle();
    }

    testWidgets('from the bottom: the overlay\'s paper, 16 round at its top, '
        'full width; 24 in; a handle 36 by 4 8 above the title; the close '
        'button 16 from the top and the end', (tester) async {
      await open(tester, drawer('bottom'));
      final box = tester.getRect(paper());
      expect(box.left, 0);
      expect(box.width, 1024);
      expect(box.bottom, 900);
      final decoration = tester.widget<DecoratedBox>(paper()).decoration;
      final overlay = DibaTheme.overlay(dark: false, radius: 0);
      expect((decoration as ShapeDecoration).color, overlay.color);
      expect(decoration.shadows, overlay.shadows);
      expect(
        (decoration.shape as RoundedRectangleBorder).borderRadius,
        const BorderRadius.vertical(top: Radius.circular(16)),
      );

      final handle = tester.getRect(
        find.byWidgetPredicate(
          (w) =>
              w is Container &&
              w.decoration is BoxDecoration &&
              (w.decoration as BoxDecoration).color == DibaLightNeutrals.border,
        ),
      );
      expect(handle.size, const Size(36, 4));
      expect(handle.top, box.top + 24);
      expect(handle.center.dx, 512);

      final title = tester.getRect(find.text('سفارش'));
      expect(title.top, handle.bottom + 8);
      expect(title.right, 1024 - 24);
      final style = styleOf(tester, 'سفارش');
      expect(style.fontSize, 16);
      expect(style.height, 24 / 16);
      expect(style.fontWeight, FontWeight.w500);

      final shut = tester.getRect(close());
      expect(shut.size, const Size(24, 24));
      expect(shut.top, box.top + 16);
      // Right to left, the end is the left.
      expect(shut.left, 16);
    });

    testWidgets('its blocks 8 under the title, the footer 20 under them at '
        'the end, 24 above the paper\'s edge', (tester) async {
      await open(tester, drawer('bottom'));
      final box = tester.getRect(paper());
      final title = tester.getRect(find.text('سفارش'));
      final body = tester.getRect(find.text('سه قلم'));
      final footer = tester.getRect(
        find.ancestor(
          of: find.text('چاپ'),
          matching: find.byType(FilledButton),
        ),
      );
      // The body keeps 3 above and below for a focus ring.
      expect(body.top, title.bottom + 8 + 3);
      expect(footer.top, body.bottom + 3 + 20);
      expect(footer.left, 24);
      expect(box.bottom, footer.bottom + 24);
    });

    testWidgets('top or bottom, at most 85% of the window', (tester) async {
      await open(
        tester,
        drawer('bottom', body: [for (var i = 0; i < 40; i++) text('ردیف $i')]),
      );
      expect(tester.getRect(paper()).height, 900 * 0.85);
    });

    testWidgets('from a side: full height and square; 320 across under 640 '
        'wide, 384 from it; no handle; the footer at its foot', (tester) async {
      for (final (width, across) in [(600.0, 320.0), (1024.0, 384.0)]) {
        await paint(tester, drawer('end'), width: width);
        await tester.tap(find.text('باز'));
        await tester.pumpAndSettle();
        final box = tester.getRect(paper());
        // Right to left, the end is the left.
        expect(box, Rect.fromLTWH(0, 0, across, 900));
        final shape =
            (tester.widget<DecoratedBox>(paper()).decoration as ShapeDecoration)
                .shape;
        expect(
          (shape as RoundedRectangleBorder).borderRadius,
          BorderRadius.zero,
        );
        expect(tester.getRect(find.text('سفارش')).top, 24);
        final footer = tester.getRect(
          find.ancestor(
            of: find.text('چاپ'),
            matching: find.byType(FilledButton),
          ),
        );
        expect(footer.bottom, 900 - 24);
        await tester.tap(close());
        await tester.pumpAndSettle();
      }
    });

    testWidgets("its backdrop the theme's, the web's; blurred 12 for blur", (
      tester,
    ) async {
      await open(tester, drawer('bottom'));
      final barrier = tester.widgetList<ModalBarrier>(
        find.byType(ModalBarrier),
      );
      expect(barrier.last.color, DibaLightColors.overlay);
      await tester.tap(close());
      await tester.pumpAndSettle();
      await open(tester, drawer('bottom', backdrop: 'blur'));
      final blur = tester.widget<BackdropFilter>(find.byType(BackdropFilter));
      expect(blur.filter.toString(), contains('blur(12.0, 12.0'));
    });

    // Flutter's sheet slides the whole page: the drawer travels the window's
    // height (from a side, its width), and shows a little after it starts.
    testWidgets("Flutter's motion: the window's height in over 250ms on "
        'easeOutCubic, the backdrop on ease; out over 250ms on easeInCubic '
        'run back', (tester) async {
      await open(tester, drawer('bottom'));
      final rest = tester.getRect(paper());
      await tester.tap(close());
      await tester.pumpAndSettle();

      // The trigger opens it a frame or two on: its first frame is the
      // drawer's start, the window's height down.
      await tester.tap(find.text('باز'));
      while (find.text('سفارش').evaluate().isEmpty) {
        await tester.pump();
      }
      expect(tester.getRect(paper()).top, rest.top + 900);
      await tester.pump(const Duration(milliseconds: 125));
      final shown = Curves.easeOutCubic.transform(0.5);
      expect(
        tester.getRect(paper()).top,
        closeTo(rest.top + 900 * (1 - shown), 0.5),
      );
      final barrier = tester.widgetList<ModalBarrier>(
        find.byType(ModalBarrier),
      );
      expect(
        barrier.last.color!.a,
        closeTo(DibaLightColors.overlay.a * Curves.ease.transform(0.5), 0.01),
      );
      await tester.pumpAndSettle();

      await tester.tap(close());
      await tester.pump();
      expect(tester.getRect(paper()).top, rest.top);
      await tester.pump(const Duration(milliseconds: 125));
      final left = Curves.easeInCubic.transform(0.5);
      expect(
        tester.getRect(paper()).top,
        closeTo(rest.top + 900 * (1 - left), 0.5),
      );
      await tester.pumpAndSettle();
      expect(find.text('سفارش'), findsNothing);
    });
  });
}
