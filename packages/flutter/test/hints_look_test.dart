import 'dart:ui' as ui;

import 'package:diba/diba.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// The status and hints in Diba's look, as are the rest of the components
/// but Snippet, Rating and QuantityStepper. Every number here is the web's,
/// measured on the web on a Persian page.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    double width = 1024,
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
            padding: const EdgeInsets.all(40),
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

  /// The colour at [at] on the page, as drawn.
  Future<Color> pixel(WidgetTester tester, Offset at) async {
    final boundary = tester.renderObject<RenderRepaintBoundary>(
      find.byKey(const ValueKey('page')),
    );
    final origin = tester.getTopLeft(find.byKey(const ValueKey('page')));
    final image = await tester.runAsync(() => boundary.toImage());
    final bytes = await tester.runAsync(
      () => image!.toByteData(format: ui.ImageByteFormat.rawRgba),
    );
    final x = (at.dx - origin.dx).round();
    final y = (at.dy - origin.dy).round();
    final i = (y * image!.width + x) * 4;
    return Color.fromARGB(
      bytes!.getUint8(i + 3),
      bytes.getUint8(i),
      bytes.getUint8(i + 1),
      bytes.getUint8(i + 2),
    );
  }

  group('Tooltip', () {
    testWidgets('at most 320 across, 3 from its block: below it when there '
        'is no room above', (tester) async {
      await paint(
        tester,
        n(
          'Tooltip',
          {
            'content':
                'هزینهٔ ارسال برای سفارش‌های بالای ۵۰۰ هزار تومان '
                'رایگان است و به همهٔ شهرها می‌رسد.',
          },
          [n('Button', {}, 'ارسال رایگان')],
        ),
      );
      final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.text('ارسال رایگان')));
      await tester.pump(const Duration(milliseconds: 600));
      await tester.pumpAndSettle();
      final bubble = tester.getRect(
        find
            .ancestor(
              of: find.textContaining('هزینهٔ ارسال'),
              matching: find.byWidgetPredicate(
                (w) => w is Container && w.decoration != null,
              ),
            )
            .first,
      );
      final button = tester.getRect(find.byType(FilledButton));
      expect(bubble.width, lessThanOrEqualTo(320));
      // The button is at the window's top: no room above, so below.
      expect(bubble.top, closeTo(button.bottom + 3, 0.01));
      await mouse.removePointer();
    });
  });

  group('Badge', () {
    Map<String, Object?> on(Map<String, Object?> props) => n('Badge', props, [
      n('Avatar', {'name': 'نیلوفر رستمی'}),
    ]);
    final disc = find.byWidgetPredicate(
      (w) =>
          w is Container &&
          w.decoration is BoxDecoration &&
          (w.decoration as BoxDecoration).border != null,
    );
    BoxDecoration decorationOf(WidgetTester tester) =>
        tester.widget<Container>(disc).decoration! as BoxDecoration;

    testWidgets('28 across and round, ringed 1 in the page\'s colour, a '
        'quarter past the corner; its count 12 on 16, medium', (tester) async {
      await paint(tester, on({'content': 3}));
      final at = tester.getRect(disc);
      expect(at.size, const Size(28, 28));
      final d = decorationOf(tester);
      expect(d.borderRadius, BorderRadius.circular(24));
      expect(d.border, Border.all(color: DibaLightNeutrals.background));
      final tone = DibaStatusColors.light.of('danger');
      expect(d.color, tone.solid);
      final count = styleOf(tester, '۳');
      expect(count.fontSize, 12);
      expect(count.height, closeTo(16.08 / 12, 0.001));
      expect(count.fontWeight, FontWeight.w500);
      expect(count.color, tone.onSolid);
      final avatar = tester.getRect(
        find.ancestor(of: disc, matching: find.byType(Stack)).first,
      );
      // The top end of a Persian page is its top left.
      expect(at.topLeft, avatar.topLeft - const Offset(7, 7));
    });

    testWidgets('16 small and 12 round, 32 large and 16 round, words 10 and '
        '14 on 20', (tester) async {
      await paint(tester, on({'size': 'sm'}));
      expect(tester.getSize(disc), const Size(16, 16));
      expect(decorationOf(tester).borderRadius, BorderRadius.circular(12));
      await paint(tester, on({'size': 'lg', 'content': 'تازه'}));
      expect(tester.getSize(disc).height, 32);
      expect(decorationOf(tester).borderRadius, BorderRadius.circular(16));
      final words = styleOf(tester, 'تازه');
      expect(words.fontSize, 14);
      expect(words.height, closeTo(1.43, 0.001));
    });

    testWidgets('soft is the tone\'s tint and ink; secondary its ink on the '
        'fill', (tester) async {
      final tone = DibaStatusColors.light.of('warning');
      await paint(
        tester,
        on({'content': 'تازه', 'variant': 'soft', 'color': 'warning'}),
      );
      expect(decorationOf(tester).color, tone.soft);
      expect(styleOf(tester, 'تازه').color, tone.ink);
      await paint(
        tester,
        on({'content': 'تازه', 'variant': 'secondary', 'color': 'warning'}),
      );
      expect(decorationOf(tester).color, DibaLightNeutrals.fill);
      expect(styleOf(tester, 'تازه').color, tone.ink);
    });
  });

  group('ProgressCircle', () {
    Finder ring() => find.byWidgetPredicate(
      (w) => w is SizedBox && w.width == w.height && w.child is AnimatedBuilder,
    );

    testWidgets('20, 28 or 36 across', (tester) async {
      for (final (size, across) in [('sm', 20.0), ('md', 28.0), ('lg', 36.0)]) {
        await paint(tester, n('ProgressCircle', {'value': 60, 'size': size}));
        expect(tester.getSize(ring()), Size(across, across));
      }
    });

    testWidgets('the arc from twelve o\'clock clockwise in the tone, over a '
        'track in the fill', (tester) async {
      await paint(
        tester,
        n('ProgressCircle', {'value': 60, 'size': 'lg', 'color': 'success'}),
      );
      final box = tester.getRect(ring());
      // The stroke's middle is 16 from the centre on a 36 ring: at three
      // o'clock (25%) the arc has passed, at nine (75%) it has not.
      final east = await pixel(tester, box.center + const Offset(16, 0));
      final west = await pixel(tester, box.center + const Offset(-16, 0));
      expect(east, DibaStatusColors.light.of('success').solid);
      expect(west, DibaLightNeutrals.fill);
    });
  });

  group('Meter', () {
    testWidgets('its label and value 14 on 20, medium, 4 above a track 8 '
        'tall and 4 round in the fill; the fill from the start', (
      tester,
    ) async {
      await paint(
        tester,
        n('Meter', {'label': 'فضای ذخیره', 'value': 80, 'color': 'warning'}),
      );
      for (final words in ['فضای ذخیره', '۸۰٪']) {
        final style = styleOf(tester, words);
        expect(style.fontSize, 14);
        expect(style.height, 20 / 14);
        expect(style.fontWeight, FontWeight.w500);
        expect(style.color, DibaLightNeutrals.foreground);
      }
      final track = find.byWidgetPredicate(
        (w) => w is Container && w.color == DibaLightNeutrals.fill,
      );
      final bar = tester.getRect(track);
      expect(bar.height, 8);
      expect(bar.width, 1024 - 80);
      expect(bar.top, tester.getRect(find.text('فضای ذخیره')).bottom + 4);
      final fill = find.descendant(
        of: track,
        matching: find.byType(DecoratedBox),
      );
      final full = tester.getRect(fill);
      expect(full.width, closeTo(bar.width * 0.8, 0.01));
      // Right to left, the start is the right.
      expect(full.right, bar.right);
      // In light the warning's emphasis, 3:1 or more from the track, where
      // its solid amber was 1.59 (indicator_on_track_test.dart).
      final look = tester.widget<DecoratedBox>(fill).decoration;
      expect(
        (look as BoxDecoration).color,
        DibaStatusColors.light.of('warning').ink,
      );
      expect(look.borderRadius, BorderRadius.circular(4));
    });

    testWidgets('small, 4 tall and 2 round', (tester) async {
      await paint(tester, n('Meter', {'label': 'اعتبار', 'size': 'sm'}));
      final track = find.byWidgetPredicate(
        (w) => w is Container && w.color == DibaLightNeutrals.fill,
      );
      expect(tester.getSize(track).height, 4);
    });
  });
}
