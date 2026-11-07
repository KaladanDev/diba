import 'package:diba/diba.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// The slider in Diba's look, on both platforms,
/// with Flutter's state layer: laid out as the web's, faded when disabled as
/// the web's is, and pressed as the web's is. The web holds the same in
/// checkbox.browser.test.tsx ("slider under the pointer" and "slider shape").
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> props, {
    String lang = 'en',
    DibaHandlers handlers = const DibaHandlers(),
  }) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: DibaTheme.light(),
        locale: Locale(lang),
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(
          body: Padding(
            padding: const EdgeInsets.all(20),
            child: DibaSurface(
              tree: {
                'type': 'Slider',
                'props': {'label': 'Opacity', ...props},
                'actions': {
                  'onChangeEnd': {
                    'do': 'call',
                    'action': 'slider.end',
                    'value': 'v',
                  },
                },
              },
              handlers: handlers,
            ),
          ),
        ),
      ),
    );
    await tester.pump();
  }

  final slider = find.byType(Slider);
  final range = find.byType(RangeSlider);
  double value(WidgetTester tester) => tester.widget<Slider>(slider).value;
  RangeValues values(WidgetTester tester) =>
      tester.widget<RangeSlider>(range).values;

  /// Where a value's thumb centre is: half a thumb, 10, in from each end.
  Offset at(WidgetTester tester, Finder f, double v, {bool rtl = false}) {
    final r = tester.getRect(f);
    final along = (v / 100) * (r.width - 20);
    return Offset(
      rtl ? r.right - 10 - along : r.left + 10 + along,
      r.center.dy,
    );
  }

  group('laid out as the web', () {
    testWidgets('as high as its thumb, 4 under its label row, 20 high', (
      tester,
    ) async {
      await paint(tester, {'defaultValue': 40});
      final s = tester.getRect(slider);
      expect(s.height, 20);
      expect(tester.getRect(find.text('40')).height, 20);
      expect(s.top - tester.getRect(find.text('40')).bottom, 4);
    });

    testWidgets('its track and thumb run half a thumb in from each end', (
      tester,
    ) async {
      await paint(tester, {'defaultValue': 0});
      final w = tester.getSize(slider).width;
      expect(
        slider,
        paints
          ..rrect(
            rrect: RRect.fromRectAndRadius(
              Rect.fromLTRB(10, 8, w - 10, 12),
              const Radius.circular(2),
            ),
          )
          ..circle(x: 10, y: 11, radius: 10)
          ..circle(x: 10, y: 10, radius: 10),
      );
    });

    testWidgets('a stepped one: thumb and dots over the same run', (
      tester,
    ) async {
      await paint(tester, {'defaultValue': 100, 'step': 25});
      final w = tester.getSize(slider).width;
      expect(
        slider,
        paints
          ..rrect(
            rrect: RRect.fromRectAndRadius(
              Rect.fromLTRB(10, 8, w - 10, 12),
              const Radius.circular(2),
            ),
          )
          ..circle(x: 10, y: 10, radius: 1)
          ..circle(x: 10 + (w - 20) / 4, y: 10, radius: 1)
          ..circle(x: 10 + (w - 20) / 2, y: 10, radius: 1)
          ..circle(x: 10 + 3 * (w - 20) / 4, y: 10, radius: 1)
          ..circle(x: w - 10, y: 10, radius: 1)
          ..circle(x: w - 10, y: 11, radius: 10),
      );
    });

    testWidgets('a range: its fill between its thumbs', (tester) async {
      await paint(tester, {
        'isRange': true,
        'defaultValue': [20, 70],
      });
      final w = tester.getSize(range).width;
      final start = 10 + 0.2 * (w - 20);
      final end = 10 + 0.7 * (w - 20);
      expect(
        range,
        paints
          ..rrect(
            rrect: RRect.fromRectAndRadius(
              Rect.fromLTRB(10, 8, w - 10, 12),
              const Radius.circular(2),
            ),
          )
          ..rrect(
            rrect: RRect.fromRectAndRadius(
              Rect.fromLTRB(start, 7, end, 13),
              const Radius.circular(3),
            ),
          )
          // Each thumb: its shadow, its ring, its core.
          ..circle(x: start, y: 11, radius: 10)
          ..circle(x: start, y: 10, radius: 10)
          ..circle(x: start, y: 10, radius: 7)
          ..circle(x: end, y: 11, radius: 10),
      );
      expect(tester.getSize(range).height, 20);
    });

    testWidgets('disabled, it fades as a whole, label and value too', (
      tester,
    ) async {
      await paint(tester, {'defaultValue': 40, 'isDisabled': true});
      final fade = find.ancestor(
        of: find.text('Opacity'),
        matching: find.byType(Opacity),
      );
      expect(tester.widget<Opacity>(fade.first).opacity, 0.5);
      expect(
        find.ancestor(
          of: slider,
          matching: find.byWidget(tester.widget<Opacity>(fade.first)),
        ),
        findsOneWidget,
      );
    });

    testWidgets('no bubble over the thumb: the value shows by its label', (
      tester,
    ) async {
      await paint(tester, {'defaultValue': 40});
      expect(tester.widget<Slider>(slider).label, isNull);
      expect(
        Theme.of(tester.element(slider)).sliderTheme.showValueIndicator,
        ShowValueIndicator.never,
      );
    });
  });

  group('pressed as the web', () {
    Future<TestGesture> press(WidgetTester tester, Offset where) async {
      final g = await tester.startGesture(where, kind: PointerDeviceKind.mouse);
      // Past the tap's deadline, so the slider has taken the press.
      await tester.pump(const Duration(milliseconds: 150));
      return g;
    }

    testWidgets('on the circle beside its thumb: the thumb stays put', (
      tester,
    ) async {
      await paint(tester, {'defaultValue': 40});
      final g = await press(
        tester,
        at(tester, slider, 40) + const Offset(16, 0),
      );
      expect(value(tester), 40);
      await g.up();
      await tester.pump();
      expect(value(tester), 40);
    });

    testWidgets('then dragged: it moves as far as the pointer does', (
      tester,
    ) async {
      await paint(tester, {'defaultValue': 40});
      final w = tester.getSize(slider).width;
      final g = await press(
        tester,
        at(tester, slider, 40) + const Offset(16, 0),
      );
      // A tenth of the run.
      await g.moveBy(Offset((w - 20) / 10, 0));
      await tester.pump();
      expect(value(tester), closeTo(50, 0.001));
      await g.up();
    });

    testWidgets('held off its centre, it still reaches the end', (
      tester,
    ) async {
      await paint(tester, {'defaultValue': 40});
      final g = await press(
        tester,
        at(tester, slider, 40) + const Offset(16, 0),
      );
      await g.moveTo(Offset(tester.getRect(slider).right + 40, 0));
      await tester.pump();
      expect(value(tester), 100);
      await g.up();
    });

    testWidgets('on the bare track: the thumb comes to the pointer', (
      tester,
    ) async {
      await paint(tester, {'defaultValue': 40});
      final g = await press(tester, at(tester, slider, 80));
      expect(value(tester), closeTo(80, 0.001));
      await g.up();
    });

    testWidgets('the end of a press reports where the thumb is', (
      tester,
    ) async {
      Map<String, Object?>? ended;
      await paint(tester, {
        'defaultValue': 40,
      }, handlers: DibaHandlers(call: (a, p) => ended = p));
      final w = tester.getSize(slider).width;
      final g = await press(
        tester,
        at(tester, slider, 40) - const Offset(16, 0),
      );
      await g.moveBy(Offset(-(w - 20) / 10, 0));
      await tester.pump();
      await g.up();
      await tester.pump();
      expect((ended!['v']! as num).toDouble(), closeTo(30, 0.001));
    });

    testWidgets('a stepped one keeps to its steps', (tester) async {
      await paint(tester, {'defaultValue': 40, 'step': 10});
      final w = tester.getSize(slider).width;
      final g = await press(
        tester,
        at(tester, slider, 40) + const Offset(16, 0),
      );
      expect(value(tester), 40);
      await g.moveBy(Offset((w - 20) * 0.13, 0));
      await tester.pump();
      expect(value(tester), 50);
      await g.up();
    });

    testWidgets('right to left: dragged to the left, it rises', (tester) async {
      await paint(tester, {'defaultValue': 40}, lang: 'fa');
      final w = tester.getSize(slider).width;
      final g = await press(
        tester,
        at(tester, slider, 40, rtl: true) - const Offset(16, 0),
      );
      expect(value(tester), 40);
      await g.moveBy(Offset(-(w - 20) / 10, 0));
      await tester.pump();
      expect(value(tester), closeTo(50, 0.001));
      await g.up();
    });

    testWidgets("a range: the thumb whose circle it is, without a jump", (
      tester,
    ) async {
      await paint(tester, {
        'isRange': true,
        'defaultValue': [20, 70],
      });
      final w = tester.getSize(range).width;
      final g = await press(
        tester,
        at(tester, range, 70) + const Offset(16, 0),
      );
      expect(values(tester), const RangeValues(20, 70));
      await g.moveBy(Offset((w - 20) / 10, 0));
      await tester.pump();
      expect(values(tester).start, 20);
      expect(values(tester).end, closeTo(80, 0.001));
      await g.up();
    });

    testWidgets('a range: a thumb stops at the other', (tester) async {
      await paint(tester, {
        'isRange': true,
        'defaultValue': [20, 70],
      });
      final g = await press(
        tester,
        at(tester, range, 70) + const Offset(16, 0),
      );
      await g.moveTo(Offset(tester.getRect(range).left, 0));
      await tester.pump();
      expect(values(tester).start, 20);
      expect(values(tester).end, 20);
      await g.up();
    });
  });
}
