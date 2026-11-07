import 'dart:ui' as ui;

import 'package:diba/diba.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// The inputs in Diba's look, an InputOTP's digit slots running left to
/// right. Every number here is the web's on a Persian page.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    double width = 420,
  }) async {
    tester.view
      ..physicalSize = Size(width, 900)
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
            child: RepaintBoundary(
              key: const ValueKey('page'),
              child: DibaSurface(tree: tree),
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
  ]) => {'type': type, 'props': props, 'children': ?children};

  TextStyle styleOf(WidgetTester tester, String text) =>
      tester.widget<Text>(find.text(text)).style!;

  Future<Color> pixel(WidgetTester tester, Offset at) async {
    final boundary = tester.renderObject<RenderRepaintBoundary>(
      find.byKey(const ValueKey('page')),
    );
    final origin = tester.getTopLeft(find.byKey(const ValueKey('page')));
    final image = await tester.runAsync(() => boundary.toImage());
    final bytes = await tester.runAsync(
      () => image!.toByteData(format: ui.ImageByteFormat.rawRgba),
    );
    final x = (at.dx - origin.dx).floor();
    final y = (at.dy - origin.dy).floor();
    final i = (y * image!.width + x) * 4;
    return Color.fromARGB(
      bytes!.getUint8(i + 3),
      bytes.getUint8(i),
      bytes.getUint8(i + 1),
      bytes.getUint8(i + 2),
    );
  }

  group('InputOTP', () {
    final slots = find.byWidgetPredicate(
      (w) => w is AnimatedContainer && w.constraints?.maxWidth == 38,
    );

    testWidgets('slots 38 by 40 and 12 round, 8 apart, a dash 6 by 2 between '
        'the threes; left to right at the page\'s start, in Persian digits', (
      tester,
    ) async {
      await paint(
        tester,
        n('InputOTP', {'label': 'کد', 'defaultValue': '1234'}),
      );
      final rects = [
        for (final e in slots.evaluate())
          tester.getRect(find.byWidget(e.widget)),
      ];
      expect(rects, hasLength(6));
      for (final r in rects) {
        expect(r.size, const Size(38, 40));
      }
      // Left to right: the first slot is the leftmost.
      for (var i = 1; i < 6; i++) {
        expect(rects[i].left, greaterThan(rects[i - 1].left));
      }
      expect(rects[1].left - rects[0].right, 8);
      // The dash, 8 from either three.
      final dash = tester.getRect(
        find.byWidgetPredicate(
          (w) =>
              w is Container &&
              w.constraints?.maxWidth == 6 &&
              w.constraints?.maxHeight == 2,
        ),
      );
      expect(dash.left - rects[2].right, 8);
      expect(rects[3].left - dash.right, 8);
      // At the start of a Persian page: its right.
      expect(rects.last.right, 420 - 20);
      for (final (i, d) in ['۱', '۲', '۳', '۴'].indexed) {
        expect(
          tester.getRect(find.text(d)).center.dx,
          closeTo(rects[i].center.dx, 1),
        );
      }
      final digit = styleOf(tester, '۱');
      expect(digit.fontSize, 18);
      expect(digit.height, 24 / 18);
      expect(digit.fontWeight, FontWeight.w600);
      final box = tester.widget<AnimatedContainer>(slots.first);
      final d = box.decoration! as BoxDecoration;
      expect(d.borderRadius, BorderRadius.circular(12));
      expect(d.color, DibaLightNeutrals.surface);
      expect(
        d.border,
        Border.all(
          color: DibaLightNeutrals.fieldBorder,
          strokeAlign: BorderSide.strokeAlignOutside,
        ),
      );
    });

    testWidgets('the slot typed into is ringed as a focused field; secondary '
        "slots on the second surface with the field's edge", (
      tester,
    ) async {
      await paint(tester, n('InputOTP', {'label': 'کد', 'length': 4}));
      await tester.tap(find.byType(TextField));
      await tester.pump();
      final ring = Theme.of(
        tester.element(find.byType(TextField)),
      ).inputDecorationTheme.focusedBorder!.borderSide;
      final first = tester.widget<AnimatedContainer>(slots.first);
      expect(
        (first.decoration! as BoxDecoration).border,
        Border.all(
          color: ring.color,
          width: ring.width,
          strokeAlign: BorderSide.strokeAlignOutside,
        ),
      );
      // Away from it first: its caret blinks while it has the focus.
      FocusManager.instance.primaryFocus?.unfocus();
      await tester.pump();
      await paint(
        tester,
        n('InputOTP', {'label': 'کد', 'length': 4, 'variant': 'secondary'}),
      );
      final quiet =
          tester.widget<AnimatedContainer>(slots.first).decoration!
              as BoxDecoration;
      expect(quiet.color, DibaTheme.light().colorScheme.surfaceContainer);
      expect(
        quiet.border,
        Border.all(
          color: DibaLightNeutrals.fieldBorder,
          strokeAlign: BorderSide.strokeAlignOutside,
        ),
      );
    });
  });

  group('ButtonGroup', () {
    Map<String, Object?> group() => n(
      'ButtonGroup',
      {'variant': 'outline', 'size': 'md'},
      [n('Button', {}, 'روز'), n('Button', {}, 'هفته'), n('Button', {}, 'ماه')],
    );

    Rect button(WidgetTester tester, String words) => tester.getRect(
      find.ancestor(
        of: find.text(words),
        matching: find.byType(OutlinedButton),
      ),
    );

    testWidgets('joined, no gap; round at the group\'s ends, square inside', (
      tester,
    ) async {
      await paint(tester, group());
      final day = button(tester, 'روز');
      final week = button(tester, 'هفته');
      final month = button(tester, 'ماه');
      // Right to left: روز first, at the right.
      expect(day.left, week.right);
      expect(week.left, month.right);
      OutlinedBorder shape(String words) =>
          tester
                  .widget<OutlinedButton>(
                    find.ancestor(
                      of: find.text(words),
                      matching: find.byType(OutlinedButton),
                    ),
                  )
                  .style!
                  .shape!
                  .resolve({})
              as OutlinedBorder;
      bool corner(String words, Rect at, Offset point) => shape(
        words,
      ).getOuterPath(at, textDirection: TextDirection.rtl).contains(point);
      // The first's start (right) is round, its end (left) square.
      expect(corner('روز', day, day.topRight + const Offset(-1, 1)), isFalse);
      expect(corner('روز', day, day.topLeft + const Offset(1, 1)), isTrue);
      // The middle is square at both.
      expect(corner('هفته', week, week.topRight + const Offset(-1, 1)), isTrue);
      expect(corner('هفته', week, week.topLeft + const Offset(1, 1)), isTrue);
      // The last's end (left) is round.
      expect(corner('ماه', month, month.topLeft + const Offset(1, 1)), isFalse);
    });

    testWidgets('an outline round the group, none between its buttons', (
      tester,
    ) async {
      await paint(tester, group());
      final day = button(tester, 'روز');
      // Where روز meets هفته: no line down, the line along the top runs on.
      final between = await pixel(
        tester,
        Offset(day.left + 0.5, day.center.dy),
      );
      final along = await pixel(tester, Offset(day.left + 0.5, day.top + 0.5));
      expect(between, isNot(DibaLightNeutrals.border));
      expect(along, DibaLightNeutrals.border);
    });
  });

  group('Pagination', () {
    Finder cell(String words) => find
        .ancestor(
          of: find.text(words),
          matching: find.byType(AnimatedContainer),
        )
        .first;

    testWidgets('pages 36 round, 4 apart, 14 on 20 medium in the fill\'s '
        'text; the page shown on the fill; 32 from 768 wide', (tester) async {
      await paint(tester, n('Pagination', {'total': 4, 'defaultPage': 2}));
      final two = tester.getRect(cell('۲'));
      final three = tester.getRect(cell('۳'));
      expect(two.size, const Size(36, 36));
      expect(two.left - three.right, 4);
      final words = styleOf(tester, '۲');
      expect(words.fontSize, 14);
      expect(words.height, 20 / 14);
      expect(words.fontWeight, FontWeight.w500);
      expect(words.color, DibaLightNeutrals.fillForeground);
      ShapeDecoration fill(String w) =>
          tester.widget<AnimatedContainer>(cell(w)).decoration!
              as ShapeDecoration;
      expect(fill('۲').color, DibaLightNeutrals.fill);
      expect(fill('۳').color, const Color(0x00000000));
      await paint(
        tester,
        n('Pagination', {'total': 4, 'defaultPage': 2}),
        width: 1024,
      );
      expect(tester.getSize(cell('۲')), const Size(32, 32));
    });

    testWidgets('back and on padded 10, a chevron 16 6 from the word; too '
        'many for the row wrap within it', (tester) async {
      await paint(tester, n('Pagination', {'total': 12, 'defaultPage': 6}));
      final back = tester.getRect(cell('قبلی'));
      final words = tester.getRect(find.text('قبلی'));
      expect(back.height, 36);
      expect(back.width, words.width + 6 + 16 + 20);
      // Nothing past the column's edges.
      for (final e in find.byType(AnimatedContainer).evaluate()) {
        final r = tester.getRect(find.byWidget(e.widget));
        expect(r.left, greaterThanOrEqualTo(20));
        expect(r.right, lessThanOrEqualTo(400));
      }
    });
  });

  group('ColorSwatchPicker', () {
    Finder item(String hex) => find
        .descendant(
          of: find.byWidgetPredicate(
            (w) => w is Semantics && w.properties.label == hex,
          ),
          matching: find.byType(AnimatedContainer),
        )
        .first;

    testWidgets('an item 32, the swatch 28; chosen: ringed 2 in its colour, '
        'the field\'s edge 1 outside, the swatch at 77%, a tick', (
      tester,
    ) async {
      await paint(
        tester,
        n('ColorSwatchPicker', {
          'colors': ['#e8a33d', '#3f8f6b'],
          'defaultValue': '#3f8f6b',
        }),
      );
      expect(tester.getSize(item('#e8a33d')), const Size(32, 32));
      // The swatch is the box its scale holds.
      final swatch = find.descendant(
        of: find.descendant(
          of: item('#e8a33d'),
          matching: find.byType(AnimatedScale),
        ),
        matching: find.byType(DecoratedBox),
      );
      expect(tester.getSize(swatch.first), const Size(28, 28));
      final chosen = tester.widget<AnimatedContainer>(item('#3f8f6b'));
      final ring =
          (chosen.decoration! as ShapeDecoration).shape as CircleBorder;
      expect(ring.side.color, const Color(0xFF3F8F6B));
      expect(ring.side.width, 2);
      final edge =
          (chosen.foregroundDecoration! as ShapeDecoration).shape
              as CircleBorder;
      expect(edge.side.color, DibaLightNeutrals.fieldBorder);
      expect(edge.side.strokeAlign, BorderSide.strokeAlignOutside);
      final scales = [
        for (final s in tester.widgetList<AnimatedScale>(
          find.descendant(
            of: item('#3f8f6b'),
            matching: find.byType(AnimatedScale),
          ),
        ))
          s.scale,
      ];
      expect(scales, [0.77, 1.0]);
    });

    testWidgets('square and small: 24, its swatch 20 and 8 round; a stack is '
        'a column', (tester) async {
      await paint(
        tester,
        n('ColorSwatchPicker', {
          'colors': ['#e8a33d', '#3f8f6b'],
          'variant': 'square',
          'size': 'sm',
          'layout': 'stack',
        }),
      );
      expect(tester.getSize(item('#e8a33d')), const Size(24, 24));
      final swatch = tester.widget<DecoratedBox>(
        find
            .descendant(
              of: find.descendant(
                of: item('#e8a33d'),
                matching: find.byType(AnimatedScale),
              ),
              matching: find.byType(DecoratedBox),
            )
            .first,
      );
      expect(tester.getSize(find.byWidget(swatch)), const Size(20, 20));
      expect(
        ((swatch.decoration as ShapeDecoration).shape as RoundedRectangleBorder)
            .borderRadius,
        BorderRadius.circular(8),
      );
      expect(
        tester.getRect(item('#3f8f6b')).top,
        tester.getRect(item('#e8a33d')).bottom + 8,
      );
    });
  });
}
