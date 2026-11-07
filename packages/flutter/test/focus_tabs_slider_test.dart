import 'package:diba/diba.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// The slider thumb's gilt ring, the focus ring outside a field, and v3's
/// segment-pill tabs, as drawn. The theme's values are pinned in
/// theme_test.dart; these check that the widgets actually paint them.
void main() {
  Future<void> show(
    WidgetTester tester,
    Widget child, {
    bool dark = false,
  }) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: dark ? DibaTheme.dark() : DibaTheme.light(),
        locale: const Locale('fa'),
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(
          body: Padding(padding: const EdgeInsets.all(24), child: child),
        ),
      ),
    );
    await tester.pump();
  }

  /// The thumb as the web draws it: the web's soft shadow,
  /// a gilt disc 20 across, and the slate core on it, 14 across, so the ring is
  /// 3 wide and no slate edge shows round it.
  PaintPattern ringed(PaintPattern pattern) => pattern
    ..circle(color: const Color.fromRGBO(0, 0, 0, 0.3), radius: 10)
    ..circle(color: DibaLightColors.controlFill, radius: 10)
    ..circle(color: DibaLightColors.controlOnFill, radius: 7);

  group('the slider thumb', () {
    for (final dark in [false, true]) {
      final name = dark ? 'dark' : 'light';

      testWidgets('$name: a slate disc with a gilt ring', (tester) async {
        await show(tester, Slider(value: 0.3, onChanged: (_) {}), dark: dark);
        expect(find.byType(Slider), ringed(paints));
      });

      testWidgets('$name: both thumbs of a range', (tester) async {
        await show(
          tester,
          RangeSlider(values: const RangeValues(0.2, 0.7), onChanged: (_) {}),
          dark: dark,
        );
        expect(find.byType(RangeSlider), ringed(ringed(paints)));
      });
    }

    testWidgets('no slate disc under the ring: its edge showed as an outline', (
      tester,
    ) async {
      await show(tester, Slider(value: 0.3, onChanged: (_) {}));
      expect(
        find.byType(Slider),
        isNot(paints..circle(color: DibaLightColors.controlOnFill, radius: 10)),
      );
    });

    // The slider fades as a whole instead, as the web's does; its thumb had
    // turned grey, ringless.
    testWidgets('a disabled thumb keeps its ring and its colours', (
      tester,
    ) async {
      await show(tester, const Slider(value: 0.3, onChanged: null));
      expect(find.byType(Slider), ringed(paints));
    });

    testWidgets('the open hand over it, the closed one while dragged', (
      tester,
    ) async {
      await show(
        tester,
        const DibaSurface(
          tree: {
            'type': 'Slider',
            'props': {'label': 'شفافیت', 'defaultValue': 60},
          },
        ),
      );
      MouseCursor cursor() =>
          RendererBinding.instance.mouseTracker.debugDeviceActiveCursor(1)!;
      final mouse = await tester.createGesture(
        kind: PointerDeviceKind.mouse,
        pointer: 1,
      );
      await mouse.addPointer(location: tester.getCenter(find.byType(Slider)));
      addTearDown(mouse.removePointer);
      await tester.pump();
      expect(cursor(), SystemMouseCursors.grab);
      await mouse.down(tester.getCenter(find.byType(Slider)));
      await mouse.moveBy(const Offset(-20, 0));
      await tester.pump();
      expect(cursor(), SystemMouseCursors.grabbing);
      await mouse.up();
      await tester.pump();
      expect(cursor(), SystemMouseCursors.grab);
    });

    testWidgets('the block keeps Flutter’s slider', (tester) async {
      await show(
        tester,
        const DibaSurface(
          tree: {
            'type': 'Slider',
            'props': {'label': 'شفافیت', 'defaultValue': 60},
          },
        ),
        dark: true,
      );
      expect(find.byType(Slider), ringed(paints));
    });
  });

  group('focus', () {
    for (final dark in [false, true]) {
      final name = dark ? 'dark' : 'light';
      final ring = dark ? DibaDarkColors.ring : DibaLightColors.ring;

      testWidgets(
        '$name: the ring is outside the field, which keeps its size',
        (tester) async {
          await show(
            tester,
            const DibaSurface(
              tree: {
                'type': 'TextField',
                'props': {'label': 'نام', 'defaultValue': 'شال'},
              },
            ),
            dark: dark,
          );
          final field = find.byType(TextField);
          final before = tester.getSize(field);
          await tester.tap(field);
          await tester.pumpAndSettle();

          expect(tester.getSize(field), before);
          expect(before.height, DibaDimens.fieldHeightMd);
          expect(
            find.byType(InputDecorator),
            paints..something((method, arguments) {
              if (method != #drawRRect) return false;
              final box = arguments[0] as RRect;
              final paint = arguments[1] as Paint;
              // A 2-wide stroke centred one pixel out: it covers the two
              // pixels just outside the field's edge.
              // Paint keeps float32 channels, so compare the 32-bit value.
              return paint.color.toARGB32() == ring.toARGB32() &&
                  paint.strokeWidth == 2 &&
                  box.height == before.height + 2;
            }),
          );
        },
      );
    }
  });

  group('tabs', () {
    Widget tabs({List<String> labels = const ['روز', 'هفته', 'ماه']}) =>
        DefaultTabController(
          length: labels.length,
          initialIndex: 1,
          child: Align(
            alignment: Alignment.topCenter,
            child: SizedBox(width: 360, child: DibaTabList(tabs: labels)),
          ),
        );

    for (final dark in [false, true]) {
      final name = dark ? 'dark' : 'light';

      testWidgets('$name: a pill inside a 40-tall list', (tester) async {
        await show(tester, tabs(), dark: dark);
        expect(tester.takeException(), isNull);

        final list = find.byType(DibaTabList);
        expect(tester.getSize(list).height, 40);
        final box = tester.widget<Container>(
          find.descendant(of: list, matching: find.byType(Container)).first,
        );
        expect(
          (box.decoration! as ShapeDecoration).color,
          dark ? DibaDarkColors.segmentList : DibaLightColors.segmentList,
        );

        // The selected label sits in the middle of the list, not a pixel high.
        final label = tester.getRect(find.text('هفته'));
        expect(
          label.center.dy,
          moreOrLessEquals(tester.getRect(list).center.dy, epsilon: 0.5),
        );
      });
    }

    testWidgets('dark: the pill is slate-700 on the slate-800 list', (
      tester,
    ) async {
      await show(tester, tabs(), dark: true);
      final bar = tester.widget<TabBar>(find.byType(TabBar));
      expect((bar.indicator! as ShapeDecoration).color, DibaPalette.slate700);
      expect(bar.indicatorWeight, 0);
      expect(DibaDarkColors.segmentList, DibaPalette.slate800);
    });

    testWidgets('the Tabs block draws its tabs in the list', (tester) async {
      await show(
        tester,
        const DibaSurface(
          tree: {
            'type': 'Tabs',
            'children': [
              {
                'type': 'Tab',
                'props': {'id': 'a', 'label': 'سفارش‌ها'},
                'children': [
                  {'type': 'Text', 'children': 'فهرست سفارش‌ها'},
                ],
              },
              {
                'type': 'Tab',
                'props': {'id': 'b', 'label': 'مشتری‌ها'},
                'children': [
                  {'type': 'Text', 'children': 'فهرست مشتری‌ها'},
                ],
              },
            ],
          },
        ),
      );
      // The block's own track, since the structure took Diba's look, where its
      // labels follow the web's colours: the same segment list round its tabs.
      final track = tester.widget<Container>(
        find
            .ancestor(
              of: find.byType(TabBar),
              matching: find.byWidgetPredicate(
                (w) => w is Container && w.decoration is ShapeDecoration,
              ),
            )
            .first,
      );
      final list = track.decoration! as ShapeDecoration;
      expect(list.shape, isA<StadiumBorder>());
      expect(list.color, DibaLightColors.segmentList);
      expect(find.text('سفارش‌ها'), findsOneWidget);
    });
  });
}
