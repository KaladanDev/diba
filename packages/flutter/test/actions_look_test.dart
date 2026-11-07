import 'package:diba/diba.dart';
import 'package:diba/src/sdui/oklab.dart' show dibaMixOklab;
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// The actions in Diba's look, with Flutter's tooltip on a button that shows
/// only its icon, which the web now has too. Every number here is the web's,
/// measured on the web; button.browser.test.tsx holds the
/// web to the tooltip.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    double width = 1024,
    bool dark = false,
    String lang = 'fa',
    EdgeInsets padding = const EdgeInsets.fromLTRB(20, 120, 20, 20),
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
            padding: padding,
            child: DibaSurface(tree: tree),
          ),
        ),
      ),
    );
    // Past a Material button's 100ms theme change, when a size changes.
    await tester.pump(const Duration(milliseconds: 150));
  }

  Map<String, Object?> button(
    Map<String, Object?> props, [
    String text = 'ذخیره',
  ]) => {'type': 'Button', 'props': props, 'children': text};

  final material = find.byWidgetPredicate((w) => w is ButtonStyleButton);
  ButtonStyle style(WidgetTester tester, [int i = 0]) =>
      tester.widgetList<ButtonStyleButton>(material).elementAt(i).style!;

  /// Within a step of 255 on each channel, as two renderings of one CSS colour
  /// may differ.
  Matcher near(Color want, {double by = 1.5 / 255}) => predicate<Color>(
    (got) =>
        (got.a - want.a).abs() <= by &&
        (got.r - want.r).abs() <= by &&
        (got.g - want.g).abs() <= by &&
        (got.b - want.b).abs() <= by,
    'within ${(by * 255).toStringAsFixed(1)}/255 of $want',
  );

  group('sizes, as the web sizes by width', () {
    for (final (width, heights) in [
      (1024.0, [32.0, 36.0, 40.0]),
      (600.0, [36.0, 40.0, 44.0]),
    ]) {
      testWidgets('${width.toInt()} wide: sm, md, lg are $heights', (
        tester,
      ) async {
        for (final (i, size) in ['sm', 'md', 'lg'].indexed) {
          await paint(
            tester,
            button({'variant': 'primary', 'size': size}),
            width: width,
          );
          expect(tester.getSize(material).height, heights[i]);
          await paint(
            tester,
            button({
              'size': size,
              'icon': 'pencil',
              'isIconOnly': true,
              'label': 'ویرایش',
            }),
            width: width,
          );
          expect(tester.getSize(material), Size.square(heights[i]));
        }
      });
    }

    testWidgets("an md button's icon is 20 under 640 wide, 16 from it", (
      tester,
    ) async {
      final tree = button({'size': 'md', 'icon': 'plus'});
      await paint(tester, tree, width: 600);
      expect(tester.getSize(find.byType(Icon)), const Size.square(20));
      await paint(tester, tree, width: 1024);
      expect(tester.getSize(find.byType(Icon)), const Size.square(16));
      await paint(tester, button({'size': 'sm', 'icon': 'plus'}), width: 600);
      expect(tester.getSize(find.byType(Icon)), const Size.square(16));
    });

    testWidgets(
      'padding 12 for sm, 16 for md and lg; the label 14, 16 for lg',
      (tester) async {
        for (final (size, px, font) in [
          ('sm', 12.0, 14.0),
          ('md', 16.0, 14.0),
          ('lg', 16.0, 16.0),
        ]) {
          await paint(tester, button({'size': size}));
          final b = tester.getRect(material);
          final words = tester.getRect(find.text('ذخیره'));
          expect(b.right - words.right, px);
          final drawn = tester
              .widget<RichText>(
                find.descendant(
                  of: find.text('ذخیره'),
                  matching: find.byType(RichText),
                ),
              )
              .text
              .style!;
          expect(drawn.fontSize, font);
          expect(drawn.fontWeight, FontWeight.w500);
          expect(drawn.letterSpacing, 0);
          expect(drawn.fontFamily, DibaFonts.fa);
        }
      },
    );
  });

  group("colours, the web's variant by variant", () {
    // fill, hover, text, edge: the web's computed colours.
    const light = <String, (Color, Color, Color, Color?)>{
      'primary': (
        Color(0xFFF6B76F),
        Color(0xFFFBCC9D),
        Color(0xFF454263),
        null,
      ),
      'secondary': (
        Color(0xFFE2E8F0),
        Color(0xFFCAD5E2),
        Color(0xFF314158),
        null,
      ),
      'tertiary': (
        Color(0xFFE2E8F0),
        Color(0xFFCAD5E2),
        Color(0xFF1D293D),
        null,
      ),
      'outline': (
        Color(0x00000000),
        Color(0x99E2E8F0),
        Color(0xFF314158),
        Color(0xFFE2E8F0),
      ),
      'ghost': (Color(0x00000000), Color(0xFFE2E8F0), Color(0xFF314158), null),
      'danger': (Color(0xFFD42754), Color(0xFFDB4764), Color(0xFFFEFEFD), null),
      'danger-soft': (
        Color(0x26D42754),
        Color(0x33D42754),
        Color(0xFF90354D),
        null,
      ),
    };
    const dark = <String, (Color, Color, Color, Color?)>{
      'primary': (
        Color(0xFFF6B76F),
        Color(0xFFFBCC9D),
        Color(0xFF201E2F),
        null,
      ),
      'secondary': (
        Color(0xFF1D293D),
        Color(0xFF314158),
        Color(0xFFE2E8F0),
        null,
      ),
      'tertiary': (
        Color(0xFF1D293D),
        Color(0xFF314158),
        Color(0xFFF1F5F9),
        null,
      ),
      'outline': (
        Color(0x00000000),
        Color(0x991D293D),
        Color(0xFFE2E8F0),
        Color(0xFF1D293D),
      ),
      'ghost': (Color(0x00000000), Color(0xFF1D293D), Color(0xFFE2E8F0), null),
      'danger': (Color(0xFFF1516D), Color(0xFFD84C65), Color(0xFF161621), null),
      'danger-soft': (
        Color(0x26F1516D),
        Color(0x33F1516D),
        Color(0xFFF78492),
        null,
      ),
    };
    for (final (theme, table) in [('light', light), ('dark', dark)]) {
      for (final MapEntry(key: variant, value: (fill, hover, ink, edge))
          in table.entries) {
        testWidgets('$theme: $variant', (tester) async {
          await paint(
            tester,
            button({'variant': variant}),
            dark: theme == 'dark',
          );
          final s = style(tester);
          // A transparent fill's colour channels do not show; only its alpha.
          final at = s.backgroundColor!.resolve({})!;
          if (fill.a == 0) {
            expect(at.a, 0);
          } else {
            expect(at, near(fill, by: 3 / 255));
          }
          expect(
            s.backgroundColor!.resolve({WidgetState.hovered}),
            near(hover, by: 3 / 255),
          );
          expect(
            s.backgroundColor!.resolve({WidgetState.pressed}),
            near(hover, by: 3 / 255),
          );
          expect(s.foregroundColor!.resolve({}), near(ink, by: 2 / 255));
          final side = s.side!.resolve({})!;
          expect(side == BorderSide.none ? null : side.color, edge);
          expect(
            s.overlayColor!.resolve({WidgetState.hovered}),
            Colors.transparent,
          );
        });
      }
    }

    test("the Oklab mixes are the web's color-mix", () {
      expect(
        dibaMixOklab(
          DibaLightColors.danger,
          0.9,
          DibaLightColors.dangerFg,
          0.1,
        ),
        near(const Color(0xFFDB4764)),
      );
      expect(
        dibaMixOklab(
          DibaLightColors.danger,
          0.7,
          DibaLightNeutrals.foreground,
          0.4,
        ),
        near(const Color(0xFF90354D)),
      );
      expect(
        dibaMixOklab(DibaDarkColors.danger, 0.9, DibaDarkColors.dangerFg, 0.1),
        near(const Color(0xFFD84C65)),
      );
      expect(
        dibaMixOklab(
          DibaDarkColors.danger,
          0.8,
          DibaDarkNeutrals.foreground,
          0.3,
        ),
        near(const Color(0xFFF78492)),
      );
    });

    testWidgets('disabled: its colours kept, faded to half, not-allowed', (
      tester,
    ) async {
      await paint(tester, button({'variant': 'primary', 'isDisabled': true}));
      final s = style(tester);
      expect(
        s.backgroundColor!.resolve({WidgetState.disabled}),
        DibaLightColors.primary,
      );
      expect(
        s.foregroundColor!.resolve({WidgetState.disabled}),
        DibaLightColors.primaryFg,
      );
      expect(
        s.mouseCursor!.resolve({WidgetState.disabled}),
        SystemMouseCursors.forbidden,
      );
      expect(s.mouseCursor!.resolve({}), SystemMouseCursors.click);
      final fade = tester.widget<Opacity>(
        find.ancestor(of: material, matching: find.byType(Opacity)).first,
      );
      expect(fade.opacity, 0.5);
    });

    testWidgets('pending: a spinner for its icon, faded to half', (
      tester,
    ) async {
      await paint(tester, button({'isPending': true}));
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(
        tester
            .widget<Opacity>(
              find.ancestor(of: material, matching: find.byType(Opacity)).first,
            )
            .opacity,
        0.5,
      );
    });
  });

  group('pressed and focused, as the web', () {
    for (final (size, scale) in [('sm', 0.98), ('md', 0.97), ('lg', 0.96)]) {
      testWidgets('a pressed $size button shrinks to $scale', (tester) async {
        await paint(tester, button({'size': size}));
        final scaled = find.ancestor(
          of: material,
          matching: find.byType(AnimatedScale),
        );
        expect(tester.widget<AnimatedScale>(scaled).scale, 1);
        final g = await tester.startGesture(tester.getCenter(material));
        await tester.pump(const Duration(milliseconds: 300));
        expect(tester.widget<AnimatedScale>(scaled).scale, scale);
        await g.up();
        await tester.pumpAndSettle();
        expect(tester.widget<AnimatedScale>(scaled).scale, 1);
      });
    }

    testWidgets(
      "keyboard focus: Diba's ring 2 outside, the page's colour between",
      (tester) async {
        FocusManager.instance.highlightStrategy =
            FocusHighlightStrategy.alwaysTraditional;
        addTearDown(
          () => FocusManager.instance.highlightStrategy =
              FocusHighlightStrategy.automatic,
        );
        await paint(tester, button({'variant': 'primary'}));
        final ringed = find.ancestor(
          of: material,
          matching: find.byWidgetPredicate(
            (w) =>
                w is CustomPaint &&
                w.foregroundPainter.runtimeType.toString() == 'DibaRingPainter',
          ),
        );
        expect(ringed, findsNothing);
        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        await tester.pump();
        final size = tester.getSize(material);
        final ring = tester.widget<CustomPaint>(ringed).foregroundPainter!;
        expect(
          (Canvas canvas) => ring.paint(canvas, size),
          paints
            ..path(
              color: DibaLightNeutrals.background,
              strokeWidth: 2,
              includes: [Offset(size.width / 2, -1)],
            )
            ..path(
              color: DibaLightColors.ring,
              strokeWidth: 2,
              includes: [Offset(size.width / 2, -3)],
            ),
        );
      },
    );
  });

  group('a button that shows only its icon says its label', () {
    final iconOnly = button({
      'variant': 'outline',
      'icon': 'pencil',
      'isIconOnly': true,
      'label': 'ویرایش',
    }, '');

    Future<TestGesture> hover(WidgetTester tester) async {
      final g = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await g.addPointer(location: Offset.zero);
      addTearDown(g.removePointer);
      await g.moveTo(tester.getCenter(material));
      return g;
    }

    testWidgets('after half a second under a hover, 10 above it', (
      tester,
    ) async {
      await paint(tester, iconOnly);
      await hover(tester);
      await tester.pump(const Duration(milliseconds: 400));
      expect(find.text('ویرایش'), findsNothing);
      await tester.pump(const Duration(milliseconds: 200));
      await tester.pump(const Duration(milliseconds: 200));
      expect(find.text('ویرایش'), findsOneWidget);
      final bubble = tester.getRect(
        find
            .ancestor(
              of: find.text('ویرایش'),
              matching: find.byType(DecoratedBox),
            )
            .first,
      );
      expect(tester.getRect(material).top - bubble.bottom, 10);
      final drawn = tester
          .widget<RichText>(
            find.descendant(
              of: find.text('ویرایش'),
              matching: find.byType(RichText),
            ),
          )
          .text
          .style!;
      expect(drawn.fontSize, 12);
    });

    testWidgets('with no room above, below it, 10 off', (tester) async {
      await paint(tester, iconOnly, padding: const EdgeInsets.all(4));
      await hover(tester);
      await tester.pump(const Duration(milliseconds: 600));
      await tester.pump(const Duration(milliseconds: 200));
      final bubble = tester.getRect(
        find
            .ancestor(
              of: find.text('ویرایش'),
              matching: find.byType(DecoratedBox),
            )
            .first,
      );
      expect(bubble.top - tester.getRect(material).bottom, 10);
    });

    testWidgets("the bubble is the theme's, with the web's arrow", (
      tester,
    ) async {
      await paint(tester, iconOnly);
      await hover(tester);
      await tester.pump(const Duration(milliseconds: 600));
      await tester.pump(const Duration(milliseconds: 200));
      final box = tester.widget<DecoratedBox>(
        find
            .ancestor(
              of: find.text('ویرایش'),
              matching: find.byType(DecoratedBox),
            )
            .first,
      );
      final decoration = box.decoration as ShapeDecoration;
      expect(decoration.color, DibaLightNeutrals.surface);
      expect(decoration.shadows, isNotEmpty);
      // The arrow reaches 6 under the bubble, under the button's middle.
      final r = tester.getRect(find.byWidget(box));
      final x = tester.getCenter(material).dx - r.left;
      final path = decoration.shape.getOuterPath(Offset.zero & r.size);
      expect(path.contains(Offset(x, r.height + 5)), isTrue);
      expect(path.contains(Offset(x, r.height + 7)), isFalse);
      expect(path.contains(Offset(x + 7, r.height + 1)), isFalse);
    });

    testWidgets('a button with words has none', (tester) async {
      await paint(tester, button({'icon': 'pencil'}));
      expect(find.byType(Tooltip), findsNothing);
    });
  });

  group('toggles, as the web', () {
    Map<String, Object?> group(Map<String, Object?> props) => {
      'type': 'ToggleButtonGroup',
      'props': {'label': 'بازه', ...props},
      'children': [
        for (final id in ['day', 'week', 'month'])
          {
            'type': 'ToggleButton',
            'props': {'id': id},
            'children': id,
          },
      ],
    };

    testWidgets('attached: touching, on one shared fill, as wide as they are', (
      tester,
    ) async {
      await paint(
        tester,
        group({
          'isDetached': false,
          'defaultSelectedKeys': ['week'],
        }),
      );
      final rects = [
        for (final id in ['day', 'week', 'month'])
          tester.getRect(find.ancestor(of: find.text(id), matching: material)),
      ];
      expect(rects[0].left, rects[1].right);
      expect(rects[1].left, rects[2].right);
      final shared = find.ancestor(
        of: find.text('day'),
        matching: find.byWidgetPredicate(
          (w) => w is DecoratedBox && w.decoration is ShapeDecoration,
        ),
      );
      final fill =
          tester.widget<DecoratedBox>(shared.first).decoration
              as ShapeDecoration;
      expect(fill.color, DibaLightNeutrals.fill);
      expect(
        tester.getSize(shared.first).width,
        closeTo(rects.fold(0.0, (w, r) => w + r.width), 0.01),
      );
      // Each unselected one leaves its fill to the group; the selected one is
      // gilt, with the colour on the gilt.
      expect(style(tester, 0).backgroundColor!.resolve({})!.a, 0);
      expect(
        style(tester, 1).backgroundColor!.resolve({}),
        DibaLightColors.primary,
      );
      expect(
        style(tester, 1).foregroundColor!.resolve({}),
        DibaLightColors.controlOnFill,
      );
      expect(
        style(tester, 0).foregroundColor!.resolve({}),
        DibaLightNeutrals.foreground,
      );
      expect(
        style(tester, 0).backgroundColor!.resolve({WidgetState.hovered}),
        DibaLightNeutrals.fillHover,
      );
    });

    testWidgets('detached: 4 apart, each on its own fill', (tester) async {
      await paint(tester, group({}));
      final a = tester.getRect(
        find.ancestor(of: find.text('day'), matching: material),
      );
      final b = tester.getRect(
        find.ancestor(of: find.text('week'), matching: material),
      );
      expect(a.left - b.right, 4);
      expect(
        style(tester, 1).backgroundColor!.resolve({}),
        DibaLightNeutrals.fill,
      );
    });

    testWidgets('a toggle does not shrink when pressed', (tester) async {
      await paint(tester, group({}));
      final g = await tester.startGesture(tester.getCenter(find.text('day')));
      await tester.pump(const Duration(milliseconds: 300));
      for (final s in tester.widgetList<AnimatedScale>(
        find.byType(AnimatedScale),
      )) {
        expect(s.scale, 1);
      }
      await g.up();
    });

    testWidgets('a disabled group fades as a whole; its label 4 above', (
      tester,
    ) async {
      await paint(tester, group({'isDisabled': true, 'isLabelHidden': false}));
      final fade = tester.widget<Opacity>(
        find
            .ancestor(of: find.text('day'), matching: find.byType(Opacity))
            .first,
      );
      expect(fade.opacity, 0.5);
      expect(
        tester
                .getRect(
                  find.ancestor(of: find.text('day'), matching: material),
                )
                .top -
            tester.getRect(find.text('بازه')).bottom,
        4,
      );
    });
  });

  group('links, as the web', () {
    Map<String, Object?> link({bool disabled = false}) => {
      'type': 'Link',
      'props': {'href': '/orders', 'isDisabled': disabled},
      'children': 'سفارش‌ها',
    };

    testWidgets('16 on a 24 line, underlined 1 thick 4 below the baseline', (
      tester,
    ) async {
      await paint(tester, link());
      final drawn = tester
          .widget<RichText>(
            find.descendant(
              of: find.text('سفارش‌ها'),
              matching: find.byType(RichText),
            ),
          )
          .text
          .style!;
      expect(drawn.fontSize, 16);
      expect(drawn.height, 24 / 16);
      expect(drawn.fontWeight, FontWeight.w500);
      expect(drawn.letterSpacing, 0);
      expect(drawn.color, DibaLightColors.link);
      expect(drawn.decoration, isNot(TextDecoration.underline));
      final measure = TextPainter(
        text: TextSpan(text: 'سفارش‌ها', style: drawn),
        textDirection: TextDirection.rtl,
        textHeightBehavior: const TextHeightBehavior(
          leadingDistribution: TextLeadingDistribution.even,
        ),
      )..layout();
      final baseline = measure.computeDistanceToActualBaseline(
        TextBaseline.alphabetic,
      );
      final words = tester.getSize(find.text('سفارش‌ها'));
      expect(
        find.ancestor(
          of: find.text('سفارش‌ها'),
          matching: find.byWidgetPredicate(
            (w) => w.runtimeType.toString() == '_Underlined',
          ),
        ),
        paints..rect(
          rect: Rect.fromLTRB(0, baseline + 4, words.width, baseline + 5),
          color: DibaLightColors.link,
        ),
      );
      measure.dispose();
    });

    testWidgets('disabled: faded to half, the not-allowed pointer', (
      tester,
    ) async {
      await paint(tester, link(disabled: true));
      expect(
        tester
            .widget<Opacity>(
              find
                  .ancestor(
                    of: find.text('سفارش‌ها'),
                    matching: find.byType(Opacity),
                  )
                  .first,
            )
            .opacity,
        0.5,
      );
      final g = await tester.createGesture(
        kind: PointerDeviceKind.mouse,
        pointer: 1,
      );
      await g.addPointer(location: Offset.zero);
      addTearDown(g.removePointer);
      await g.moveTo(tester.getCenter(find.text('سفارش‌ها')));
      await tester.pump();
      expect(
        RendererBinding.instance.mouseTracker.debugDeviceActiveCursor(1),
        SystemMouseCursors.forbidden,
      );
    });
  });

  group('the theme', () {
    test("no role of Diba's keeps Material's letter spacing", () {
      for (final theme in [DibaTheme.light(), DibaTheme.dark()]) {
        final t = theme.textTheme;
        for (final style in [
          t.headlineLarge,
          t.headlineMedium,
          t.headlineSmall,
          t.titleLarge,
          t.titleMedium,
          t.titleSmall,
          t.bodyLarge,
          t.bodyMedium,
          t.bodySmall,
          t.labelLarge,
          t.labelMedium,
          t.labelSmall,
        ]) {
          expect(style!.letterSpacing, 0);
        }
      }
    });

    test(
      "the tooltip is the web's: paper, 12 on 16, 8 round, above, after 500ms",
      () {
        final light = DibaTheme.light().tooltipTheme;
        final decoration = light.decoration as ShapeDecoration;
        expect(decoration.color, DibaLightNeutrals.surface);
        expect(
          (decoration.shape as RoundedRectangleBorder).borderRadius,
          const BorderRadius.all(Radius.circular(12)),
        );
        expect(light.textStyle!.fontSize, 12);
        expect(light.textStyle!.height, 16 / 12);
        expect(light.padding, const EdgeInsets.all(8));
        expect(light.preferBelow, isFalse);
        expect(light.waitDuration, const Duration(milliseconds: 500));
        final dark =
            DibaTheme.dark().tooltipTheme.decoration as ShapeDecoration;
        expect(dark.color, DibaDarkNeutrals.surface);
      },
    );
  });
}
