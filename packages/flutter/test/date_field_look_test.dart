import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:diba/diba.dart';
import 'package:diba/src/sdui/date_calendar.dart';
import 'package:diba/src/sdui/glyphs.dart';
import 'package:diba/src/sdui/time_picker_material.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// The date field in Diba's look, its calendar's title in the middle and the
/// arrows to its left and right: the web's calendar, where Flutter had
/// Material's dialog. Every number is the web's;
/// `date-picker.browser.test.tsx` holds the web's title to the same.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> props, {
    String lang = 'fa',
    bool dark = false,
    DibaHandlers handlers = const DibaHandlers(),
  }) async {
    tester.view
      ..physicalSize = const Size(1024, 900)
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
            child: DibaSurface(
              tree: {
                'type': 'Stack',
                'props': {},
                'children': [
                  {
                    'type': 'DateField',
                    'props': {'label': 'تاریخ', ...props},
                    'actions': {
                      'onChange': {
                        'do': 'call',
                        'action': 'date.save',
                        'value': 'when',
                      },
                    },
                  },
                ],
              },
              handlers: handlers,
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
  }

  Future<void> open(WidgetTester tester) async {
    await tester.tap(find.byType(TextField));
    await tester.pumpAndSettle();
  }

  final panel = find.byWidgetPredicate(
    (w) =>
        w is DecoratedBox &&
        w.decoration == DibaTheme.overlay(dark: false, radius: 20),
  );

  /// The fill of the circle or pill a text is drawn on.
  Color? fillOf(WidgetTester tester, Finder text) {
    final box = tester.widget<DecoratedBox>(
      find
          .ancestor(
            of: text,
            matching: find.byWidgetPredicate(
              (w) => w is DecoratedBox && w.decoration is ShapeDecoration,
            ),
          )
          .first,
    );
    return (box.decoration as ShapeDecoration).color;
  }

  TextStyle styleOf(WidgetTester tester, Finder text) =>
      tester.widget<Text>(text).style!;

  final chevrons = find.byWidgetPredicate(
    (w) => w is DibaGlyphMark && w.glyph == DibaGlyph.chevronLeft,
  );

  testWidgets('the overlay 20 round and 12 in, 276 across, centred 8 under '
      'the field\'s box', (tester) async {
    await paint(tester, {'defaultValue': '2026-10-22'});
    await open(tester);
    expect(find.byType(DibaDateCalendar), findsOneWidget);
    expect(find.byType(DatePickerDialog), findsNothing);
    final box = tester.getRect(panel);
    expect(box.width, 276);
    final calendar = tester.getRect(find.byType(DibaDateCalendar));
    expect(calendar.left - box.left, 12);
    expect(calendar.top - box.top, 12);
    final field = tester.getRect(
      find.descendant(
        of: find.byType(TextField),
        matching: find.byType(InputDecorator),
      ),
    );
    expect(box.center.dx, closeTo(field.center.dx, 0.5));
    expect(box.top, field.top + 36 + 8);
  });

  testWidgets('the title a pill between the arrows, «مهر ۱۴۰۵», previous at '
      'the right in Persian', (tester) async {
    await paint(tester, {'defaultValue': '2026-10-22'});
    await open(tester);
    final title = find.text('مهر ۱۴۰۵');
    final pill = find
        .ancestor(of: title, matching: find.byType(AnimatedContainer))
        .first;
    final p = tester.getRect(pill);
    final calendar = tester.getRect(find.byType(DibaDateCalendar));
    expect(p.height, 28);
    expect(p.center.dx, closeTo(calendar.center.dx, 0.5));
    expect(tester.getRect(title).left - p.left, closeTo(12, 0.5));
    expect(fillOf(tester, title), DibaLightNeutrals.fill);
    final style = styleOf(tester, title);
    expect(style.fontSize, 14);
    expect(style.fontWeight, FontWeight.w500);
    expect(style.color, DibaLightNeutrals.fillForeground);
    expect(find.bySemanticsLabel('مهر ۱۴۰۵، انتخاب ماه و سال'), findsOneWidget);
    // The arrows 24 across, 2 in from the sides, each pointing the way it
    // moves: previous, at the right, to the right.
    final arrows = [for (var i = 0; i < 2; i++) tester.getRect(chevrons.at(i))]
      ..sort((a, b) => a.left.compareTo(b.left));
    expect(arrows.first.left, closeTo(calendar.left + 2 + 4, 0.5));
    expect(arrows.last.right, closeTo(calendar.right - 2 - 4, 0.5));
    // The glyph points left; the right one, previous in Persian, is turned.
    bool turned(int i) =>
        tester
            .widget<Transform>(
              find
                  .ancestor(
                    of: chevrons.at(i),
                    matching: find.byType(Transform),
                  )
                  .first,
            )
            .transform
            .storage[0] ==
        -1;
    final right =
        tester.getRect(chevrons.at(0)).left >
            tester.getRect(chevrons.at(1)).left
        ? 0
        : 1;
    expect(turned(right), isTrue);
    expect(turned(1 - right), isFalse);
    expect(find.bySemanticsLabel('قبلی'), findsOneWidget);
    expect(find.bySemanticsLabel('بعدی'), findsOneWidget);
    expect(find.byIcon(Icons.arrow_drop_down), findsNothing);
  });

  testWidgets('Saturday first, a letter a day; 36 circles, the picked gilt, '
      'the months either side at half and not to be picked', (tester) async {
    Map<String, Object?>? sent;
    await paint(tester, {
      'defaultValue': '2026-10-22',
    }, handlers: DibaHandlers(call: (_, p) => sent = p));
    await open(tester);
    for (final (i, d) in ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].indexed) {
      final letter = find.text(d);
      expect(letter, findsOneWidget, reason: d);
      final style = styleOf(tester, letter);
      expect(style.fontSize, 12);
      expect(style.color, DibaLightNeutrals.muted);
      if (i > 0) {
        // Right to left.
        expect(
          tester
                  .getRect(
                    find.text(['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'][i - 1]),
                  )
                  .center
                  .dx -
              tester.getRect(letter).center.dx,
          36,
        );
      }
    }
    // 30 Mehr 1405 is 2026-10-22, picked.
    final picked = find.text('۳۰').last;
    expect(fillOf(tester, picked), DibaLightColors.controlFill);
    expect(styleOf(tester, picked).color, DibaLightColors.controlOnFill);
    expect(styleOf(tester, picked).fontSize, 14);
    final cell = find
        .ancestor(of: picked, matching: find.byType(SizedBox))
        .first;
    expect(tester.getSize(cell), const Size(36, 36));
    // 28 Shahrivar leads the month, muted at half.
    final early = find.text('۲۸').first;
    expect(styleOf(tester, early).color, DibaLightNeutrals.muted);
    expect(
      tester
          .widget<Opacity>(
            find.ancestor(of: early, matching: find.byType(Opacity)).first,
          )
          .opacity,
      0.5,
    );
    await tester.tap(early);
    await tester.pumpAndSettle();
    expect(find.byType(DibaDateCalendar), findsOneWidget);
    // A day of the month picked is sent, Gregorian, and closes it.
    await tester.tap(find.text('۲۵').last);
    await tester.pumpAndSettle();
    expect(find.byType(DibaDateCalendar), findsNothing);
    expect(sent, {'when': '2026-10-17'});
  });

  testWidgets(
    'today in the brand\'s soft fill, in English from Sunday, «October '
    '2026»-like',
    (tester) async {
      final now = DateTime.now();
      final other = now.day == 1 ? 2 : 1;
      String two(int v) => v.toString().padLeft(2, '0');
      await paint(tester, {
        'defaultValue': '${now.year}-${two(now.month)}-${two(other)}',
      }, lang: 'en');
      await open(tester);
      const english = [
        'January', 'February', 'March', 'April', 'May', 'June', //
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      expect(
        find.text('${english[now.month - 1]} ${now.year}'),
        findsOneWidget,
      );
      final heads = [
        for (final d in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
          tester.getRect(find.text(d)).left,
      ];
      for (var i = 1; i < 7; i++) {
        expect(heads[i] - heads[i - 1], 36);
      }
      // The days of the months either side show too: early in a month its
      // number comes again after the 30th, late in one before the 1st.
      final numbers = find.descendant(
        of: find.byType(DibaDateCalendar),
        matching: find.text('${now.day}'),
      );
      final today = now.day <= 14 ? numbers.first : numbers.last;
      expect(fillOf(tester, today), DibaLightColors.primarySoft);
      expect(styleOf(tester, today).color, DibaLightNeutrals.foreground);
    },
  );

  testWidgets('the title opens the years, gilt; a year its months on the same '
      'month; a month the days', (tester) async {
    await paint(tester, {'defaultValue': '2026-10-22'});
    await open(tester);
    await tester.tap(find.text('مهر ۱۴۰۵'));
    await tester.pumpAndSettle();
    final title = find.text('مهر ۱۴۰۵');
    expect(fillOf(tester, title), DibaLightColors.controlFill);
    expect(styleOf(tester, title).color, DibaLightColors.controlOnFill);
    // The arrows give way.
    for (final o in tester.widgetList<AnimatedOpacity>(
      find.ancestor(of: chevrons, matching: find.byType(AnimatedOpacity)),
    )) {
      expect(o.opacity, 0);
    }
    // The chosen year gilt, 32 tall, in view.
    final year = find.text('۱۴۰۵').last;
    expect(fillOf(tester, year), DibaLightColors.controlFill);
    final pill = find
        .ancestor(of: year, matching: find.byType(DecoratedBox))
        .first;
    expect(tester.getSize(pill).height, 32);
    await tester.tap(find.text('۱۴۰۳'));
    await tester.pumpAndSettle();
    // Its months, the calendar's month chosen; the title the year alone.
    expect(find.text('۱۴۰۳'), findsOneWidget);
    expect(fillOf(tester, find.text('مهر')), DibaLightColors.controlFill);
    expect(find.text('اسفند'), findsOneWidget);
    final top = [
      for (final m in ['فروردین', 'اردیبهشت', 'خرداد', 'تیر'])
        tester.getRect(find.text(m)).top,
    ];
    // Three across.
    expect(top[1], top[0]);
    expect(top[2], top[0]);
    expect(top[3], greaterThan(top[0]));
    await tester.tap(find.text('خرداد'));
    await tester.pumpAndSettle();
    expect(find.text('خرداد ۱۴۰۳'), findsOneWidget);
    expect(fillOf(tester, find.text('خرداد ۱۴۰۳')), DibaLightNeutrals.fill);
  });

  testWidgets('a Gregorian field on a Persian page: «مارس ۲۰۳۱», and the '
      'Persian names of its months', (tester) async {
    await paint(tester, {
      'defaultValue': '2031-03-21',
      'calendarSystem': 'gregorian',
    });
    await open(tester);
    expect(find.text('مارس ۲۰۳۱'), findsOneWidget);
    await tester.tap(find.text('مارس ۲۰۳۱'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('۲۰۳۱').last);
    await tester.pumpAndSettle();
    expect(find.text('ژانویه'), findsOneWidget);
    expect(find.text('دسامبر'), findsOneWidget);
  });

  testWidgets('days past the bounds at half and struck through; the arrows '
      'stop there', (tester) async {
    await paint(tester, {
      'defaultValue': '2026-10-22',
      'minValue': '2026-10-15',
      // 23 to 30 Mehr: Mehr is the only month.
      'maxValue': '2026-10-22',
    });
    await open(tester);
    // 2026-10-14 is 22 Mehr: before the bounds.
    final out = find.text('۲۲').last;
    expect(styleOf(tester, out).decoration, TextDecoration.lineThrough);
    final arrows = tester
        .widgetList<AnimatedOpacity>(
          find.ancestor(of: chevrons, matching: find.byType(AnimatedOpacity)),
        )
        .map((o) => o.opacity)
        .toList();
    // Mehr is the only month: both arrows at half.
    expect(arrows, [0.5, 0.5]);
    await tester.tap(out);
    await tester.pumpAndSettle();
    expect(find.byType(DibaDateCalendar), findsOneWidget);
  });

  testWidgets('at a minute, the time follows the day', (tester) async {
    await paint(tester, {
      'defaultValue': '2026-10-23T14:30',
      'granularity': 'minute',
    });
    await open(tester);
    await tester.tap(find.text('۲۵').last);
    await tester.pumpAndSettle();
    expect(find.byType(DibaDateCalendar), findsNothing);
    expect(find.byType(DibaTimePickerDialog), findsOneWidget);
  });

  String iso(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-'
      '${d.day.toString().padLeft(2, '0')}';

  testWidgets('today under the days, 12 down, a pill as the title is; it '
      'picks today and closes', (tester) async {
    Map<String, Object?>? sent;
    await paint(tester, {
      'defaultValue': '2026-10-22',
    }, handlers: DibaHandlers(call: (_, p) => sent = p));
    await open(tester);
    final word = find.text('امروز');
    final pill = find
        .ancestor(of: word, matching: find.byType(AnimatedContainer))
        .first;
    final p = tester.getRect(pill);
    final calendar = tester.getRect(find.byType(DibaDateCalendar));
    final days = tester.getRect(
      find
          .descendant(
            of: find.byType(DibaDateCalendar),
            matching: find.byType(Stack),
          )
          .first,
    );
    expect(p.top, days.bottom + 12);
    expect(p.bottom, calendar.bottom);
    expect(p.height, 28);
    expect(p.center.dx, closeTo(calendar.center.dx, 0.5));
    expect(tester.getRect(word).left - p.left, closeTo(12, 0.5));
    expect(fillOf(tester, word), DibaLightNeutrals.fill);
    final style = styleOf(tester, word);
    expect(style.fontSize, 14);
    expect(style.fontWeight, FontWeight.w500);
    expect(style.color, DibaLightNeutrals.fillForeground);
    expect(find.bySemanticsLabel('امروز'), findsOneWidget);
    await tester.tap(word);
    await tester.pumpAndSettle();
    expect(find.byType(DibaDateCalendar), findsNothing);
    expect(sent, {'when': iso(DateTime.now())});
  });

  testWidgets('today from the years picks it too, «Today» in English', (
    tester,
  ) async {
    Map<String, Object?>? sent;
    await paint(
      tester,
      {'defaultValue': '2024-03-05'},
      lang: 'en',
      handlers: DibaHandlers(call: (_, p) => sent = p),
    );
    await open(tester);
    await tester.tap(find.text('March 2024'));
    await tester.pumpAndSettle();
    expect(find.text('Today'), findsOneWidget);
    await tester.tap(find.text('Today'));
    await tester.pumpAndSettle();
    expect(find.byType(DibaDateCalendar), findsNothing);
    expect(sent, {'when': iso(DateTime.now())});
  });

  testWidgets('past the bounds, today is at half and does nothing', (
    tester,
  ) async {
    Map<String, Object?>? sent;
    await paint(tester, {
      'defaultValue': '2020-01-10',
      'minValue': '2020-01-05',
      'maxValue': '2020-02-01',
    }, handlers: DibaHandlers(call: (_, p) => sent = p));
    await open(tester);
    final word = find.text('امروز');
    expect(
      tester
          .widget<Opacity>(
            find.ancestor(of: word, matching: find.byType(Opacity)).first,
          )
          .opacity,
      0.5,
    );
    await tester.tap(word);
    await tester.pumpAndSettle();
    expect(find.byType(DibaDateCalendar), findsOneWidget);
    expect(sent, isNull);
  });

  testWidgets("the field's calendar mark is the web's, drawn in strokes 1.6 "
      "wide in a 20 square, thinner than its filled 2.1", (tester) async {
    final key = GlobalKey();
    await tester.pumpWidget(
      Directionality(
        textDirection: TextDirection.ltr,
        child: Center(
          child: RepaintBoundary(
            key: key,
            child: const DibaGlyphMark(
              DibaGlyph.calendar,
              size: 200,
              color: Color(0xFF000000),
            ),
          ),
        ),
      ),
    );
    late ByteData bytes;
    late int width;
    await tester.runAsync(() async {
      final boundary =
          key.currentContext!.findRenderObject()! as RenderRepaintBoundary;
      final ui.Image image = await boundary.toImage();
      width = image.width;
      bytes = (await image.toByteData())!;
    });
    expect(width, 200);
    int alpha(int x, int y) => bytes.getUint8((y * width + x) * 4 + 3);
    // Ten to a unit: the side 16 across, from 1.0 to 2.6, at 13 down.
    final side = [
      for (var x = 0; x < 40; x++)
        if (alpha(x, 130) > 127) x,
    ];
    expect(side.length, inInclusiveRange(15, 17));
    expect(side.first, inInclusiveRange(9, 11));
    // The line under the rings 16 tall, about 8.9 down.
    final line = [
      for (var y = 60; y < 120; y++)
        if (alpha(100, y) > 127) y,
    ];
    expect(line.length, inInclusiveRange(15, 17));
    expect(line.first, inInclusiveRange(80, 82));
    // Drawn, not filled: the space under the line is empty.
    expect(alpha(100, 140), 0);
    // A ring stands above the frame, from 1.1 down.
    expect(alpha(61, 20), greaterThan(127));
    expect(alpha(100, 20), 0);
  });
}
