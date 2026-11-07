import 'package:diba/diba.dart';
import 'package:diba/src/sdui/date_calendar.dart';
import 'package:diba/src/sdui/glyphs.dart';
import 'package:diba/src/sdui/time_picker_material.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// the extra components' dates and time — Calendar and RangeCalendar
/// drawn in the page, DateRangePicker and TimeField — in DateField's calendar
///. `dates.browser.test.tsx` holds the web's to the same. Every date
/// leaves as Gregorian ISO 8601, whatever calendar draws it.
void main() {
  Future<void> paint(
    WidgetTester tester,
    String type,
    Map<String, Object?> props, {
    String lang = 'fa',
    DibaHandlers handlers = const DibaHandlers(),
  }) async {
    tester.view
      ..physicalSize = const Size(1024, 900)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);
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
                'type': 'Stack',
                'props': {},
                'children': [
                  {
                    'type': type,
                    'props': props,
                    'actions': {
                      'onChange': {
                        'do': 'call',
                        'action': 'save',
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

  /// The day [text] of the month shown, not of the months either side.
  Finder day(String text) => find
      .descendant(of: find.byType(DibaDateCalendar), matching: find.text(text))
      .last;

  double opacityOf(WidgetTester tester, Finder text) => tester
      .widget<Opacity>(
        find.ancestor(of: text, matching: find.byType(Opacity)).first,
      )
      .opacity;

  TextStyle styleOf(WidgetTester tester, Finder text) =>
      tester.widget<Text>(text).style!;

  group('Calendar, drawn in the page', () {
    testWidgets('sends the day picked as a Gregorian date; an unavailable '
        'day at half, not struck through, cannot be picked', (tester) async {
      Map<String, Object?>? sent;
      await paint(tester, 'Calendar', {
        'label': 'روز',
        'defaultValue': '2026-10-22',
        'unavailableDates': ['2026-10-19'],
      }, handlers: DibaHandlers(call: (_, p) => sent = p));
      expect(find.byType(DibaDateCalendar), findsOneWidget);
      expect(find.text('مهر ۱۴۰۵'), findsOneWidget);
      // 27 Mehr 1405 is 2026-10-19.
      final booked = day('۲۷');
      expect(opacityOf(tester, booked), 0.5);
      expect(styleOf(tester, booked).decoration, isNull);
      await tester.tap(booked);
      await tester.pumpAndSettle();
      expect(sent, isNull);
      await tester.tap(day('۲۸'));
      await tester.pumpAndSettle();
      expect(sent, {'when': '2026-10-20'});
      expect(find.bySemanticsLabel(RegExp('^روز')), findsOneWidget);
    });

    testWidgets('draws its error under it', (tester) async {
      await paint(tester, 'Calendar', {
        'label': 'روز',
        'defaultValue': '2026-10-22',
        'errorMessage': 'این روز نه.',
      });
      expect(find.text('این روز نه.'), findsOneWidget);
    });

    testWidgets('disabled, every day is struck through and nothing is sent; '
        'read only, nothing is sent', (tester) async {
      Map<String, Object?>? sent;
      await paint(tester, 'Calendar', {
        'defaultValue': '2026-10-22',
        'isDisabled': true,
      }, handlers: DibaHandlers(call: (_, p) => sent = p));
      expect(styleOf(tester, day('۱۲')).decoration, TextDecoration.lineThrough);
      await tester.tap(day('۱۲'));
      await tester.pumpAndSettle();
      expect(sent, isNull);
      await paint(tester, 'Calendar', {
        'defaultValue': '2026-10-21',
        'isReadOnly': true,
      }, handlers: DibaHandlers(call: (_, p) => sent = p));
      expect(styleOf(tester, day('۱۲')).decoration, isNull);
      await tester.tap(day('۱۲'));
      await tester.pumpAndSettle();
      expect(sent, isNull);
    });
  });

  group('RangeCalendar, drawn in the page', () {
    testWidgets('sends the first and last days in order, whichever was '
        'pressed first; the days between on a band, the ends gilt', (
      tester,
    ) async {
      Map<String, Object?>? sent;
      await paint(tester, 'RangeCalendar', {
        'defaultValue': ['2026-10-17', '2026-10-28'],
      }, handlers: DibaHandlers(call: (_, p) => sent = p));
      // 25 Mehr to 6 Aban: 25 is a gilt end; 27 on the band.
      Color? circle(Finder text) =>
          (tester
                      .widget<DecoratedBox>(
                        find
                            .ancestor(
                              of: text,
                              matching: find.byWidgetPredicate(
                                (w) =>
                                    w is DecoratedBox &&
                                    w.decoration is ShapeDecoration,
                              ),
                            )
                            .first,
                      )
                      .decoration
                  as ShapeDecoration)
              .color;
      Color? band(Finder text) =>
          (tester
                      .widget<DecoratedBox>(
                        find
                            .ancestor(
                              of: text,
                              matching: find.byWidgetPredicate(
                                (w) =>
                                    w is DecoratedBox &&
                                    w.decoration is BoxDecoration,
                              ),
                            )
                            .first,
                      )
                      .decoration
                  as BoxDecoration)
              .color;
      expect(circle(day('۲۵')), DibaLightColors.controlFill);
      // A saturated tint of the brand, saffron-200, as the web's band.
      expect(band(day('۲۷')), DibaPalette.saffron200);
      expect(
        find.ancestor(
          of: day('۲۰'),
          matching: find.byWidgetPredicate(
            (w) => w is DecoratedBox && w.decoration is BoxDecoration,
          ),
        ),
        findsNothing,
      );
      // 18 Mehr, then 12 Mehr: 2026-10-10 and 2026-10-04.
      await tester.tap(day('۱۸'));
      await tester.pumpAndSettle();
      expect(sent, isNull);
      await tester.tap(day('۱۲'));
      await tester.pumpAndSettle();
      expect(sent, {
        'when': ['2026-10-04', '2026-10-10'],
      });
    });

    /// The band behind a day, if it is on one.
    BoxDecoration? bandOf(WidgetTester tester, Finder text) {
      final boxes = find.ancestor(
        of: text,
        matching: find.byWidgetPredicate(
          (w) => w is DecoratedBox && w.decoration is BoxDecoration,
        ),
      );
      if (boxes.evaluate().isEmpty) return null;
      return tester.widget<DecoratedBox>(boxes.first).decoration
          as BoxDecoration;
    }

    // The web's range calendar, measured on the web.
    testWidgets('weeks are 40 apart, a day 36 in the middle of its week, the '
        'band 36 tall', (tester) async {
      await paint(tester, 'RangeCalendar', {
        'defaultValue': ['2026-10-17', '2026-10-28'],
      });
      // 18 and 25 Mehr, a week apart.
      final a = tester.getCenter(day('۱۸'));
      final b = tester.getCenter(day('۲۵'));
      expect(b.dx, a.dx);
      expect(b.dy - a.dy, 40);
      final band = find
          .ancestor(
            of: day('۲۷'),
            matching: find.byWidgetPredicate(
              (w) => w is DecoratedBox && w.decoration is BoxDecoration,
            ),
          )
          .first;
      expect(tester.getSize(band).height, 36);
      // 27 shares 25's week: the band is in the middle of its 40 too.
      expect(tester.getRect(band).center.dy, closeTo(b.dy, 0.01));
    });

    testWidgets("the band stops at the month's last day, 8 round, and leaves "
        "the next month's days bare", (tester) async {
      await paint(tester, 'RangeCalendar', {
        'defaultValue': ['2026-10-17', '2026-10-28'],
      });
      // 30 Mehr, a Thursday: mid-week, but the month's last day.
      expect(
        bandOf(tester, day('۳۰'))!.borderRadius,
        const BorderRadiusDirectional.horizontal(
          start: Radius.zero,
          end: Radius.circular(8),
        ),
      );
      // 1 Aban, a Friday at the end of the week, is in the range but shown
      // here as the next month's: no band and no gilt.
      expect(bandOf(tester, day('۱')), isNull);
      expect(
        find.ancestor(
          of: day('۱'),
          matching: find.byWidgetPredicate(
            (w) =>
                w is DecoratedBox &&
                w.decoration is ShapeDecoration &&
                (w.decoration as ShapeDecoration).color ==
                    DibaLightColors.controlFill,
          ),
        ),
        findsNothing,
      );
      // In Aban, the band begins 8 round at its first day, a Friday (the
      // first «۱»: Aban's own, before Azar's).
      await tester.tap(find.bySemanticsLabel('بعدی'));
      await tester.pumpAndSettle();
      final aban1 = find
          .descendant(
            of: find.byType(DibaDateCalendar),
            matching: find.text('۱'),
          )
          .first;
      expect(
        bandOf(tester, aban1)!.borderRadius,
        const BorderRadiusDirectional.horizontal(
          start: Radius.circular(8),
          end: Radius.circular(8),
        ),
      );
    });

    testWidgets('off, its two ends stay gilt at half, with no band between, '
        'as the web draws it', (tester) async {
      await paint(tester, 'RangeCalendar', {
        'defaultValue': ['2026-10-17', '2026-10-21'],
        'isDisabled': true,
      });
      // 25 to 29 Mehr.
      for (final d in ['۲۵', '۲۷', '۲۹']) {
        expect(bandOf(tester, day(d)), isNull, reason: d);
      }
      for (final d in ['۲۵', '۲۹']) {
        expect(
          find.ancestor(
            of: day(d),
            matching: find.byWidgetPredicate(
              (w) =>
                  w is DecoratedBox &&
                  w.decoration is ShapeDecoration &&
                  (w.decoration as ShapeDecoration).color ==
                      DibaLightColors.controlFill,
            ),
          ),
          findsOneWidget,
          reason: d,
        );
        expect(opacityOf(tester, day(d)), 0.5);
      }
    });

    testWidgets("a picked day of the month either side is not drawn picked, "
        "as React Aria marks none", (tester) async {
      await paint(tester, 'Calendar', {'defaultValue': '2026-10-23'});
      // 1 Aban picked; Mehr, shown, ends with it as the next month's.
      await tester.tap(find.bySemanticsLabel('قبلی'));
      await tester.pumpAndSettle();
      expect(
        find.ancestor(
          of: day('۱'),
          matching: find.byWidgetPredicate(
            (w) =>
                w is DecoratedBox &&
                w.decoration is ShapeDecoration &&
                (w.decoration as ShapeDecoration).color != Colors.transparent,
          ),
        ),
        findsNothing,
      );
    });

    testWidgets('today begins a range as a day pressed would', (tester) async {
      Map<String, Object?>? sent;
      await paint(
        tester,
        'RangeCalendar',
        {},
        handlers: DibaHandlers(call: (_, p) => sent = p),
      );
      await tester.tap(find.text('امروز'));
      await tester.pumpAndSettle();
      expect(sent, isNull);
      await tester.tap(find.text('امروز'));
      await tester.pumpAndSettle();
      final now = DateTime.now();
      String two(int v) => v.toString().padLeft(2, '0');
      final today = '${now.year}-${two(now.month)}-${two(now.day)}';
      expect(sent, {
        'when': [today, today],
      });
    });
  });

  group('DateRangePicker', () {
    testWidgets('reads both dates at rest, opens the range calendar and sends '
        'the range, closing it', (tester) async {
      Map<String, Object?>? sent;
      await paint(tester, 'DateRangePicker', {
        'label': 'بازه',
        'defaultValue': ['2026-10-17', '2026-10-28'],
      }, handlers: DibaHandlers(call: (_, p) => sent = p));
      expect(find.text('۲۵ مهر ۱۴۰۵'), findsOneWidget);
      expect(find.text('۶ آبان ۱۴۰۵'), findsOneWidget);
      await tester.tap(find.byType(TextField));
      await tester.pumpAndSettle();
      expect(find.byType(DibaDateCalendar), findsOneWidget);
      await tester.tap(day('۱۰'));
      await tester.pumpAndSettle();
      await tester.tap(day('۱۳'));
      await tester.pumpAndSettle();
      expect(find.byType(DibaDateCalendar), findsNothing);
      expect(sent, {
        'when': ['2026-10-02', '2026-10-05'],
      });
    });

    /// A range field's placeholders, «سال / ماه / روز» each.
    final placeholders = find.byWidgetPredicate(
      (w) => w is Text && RegExp(r'^سال.+ماه.+روز$').hasMatch(w.data ?? ''),
    );

    testWidgets("empty, it shows two dates' placeholders", (tester) async {
      await paint(tester, 'DateRangePicker', {'label': 'بازه'});
      expect(placeholders, findsNWidgets(2));
    });

    testWidgets('in English, the months by their whole names, as the web '
        'writes them', (tester) async {
      await paint(tester, 'DateRangePicker', {
        'label': 'Dates',
        'defaultValue': ['2026-10-17', '2026-10-28'],
      }, lang: 'en');
      expect(find.text('October 17, 2026'), findsOneWidget);
      expect(find.text('October 28, 2026'), findsOneWidget);
    });

    // Found on 2026-11-01: the test font draws «November 2026» wider than the
    // room between the arrows, and the header's row overflowed. A long title
    // narrows its pill; a short one keeps the pill its words' width.
    /// The title's pill, the back arrow and the words, in English.
    Future<(Rect, Rect, Rect)> header(
      WidgetTester tester,
      String day,
      String title,
    ) async {
      await paint(tester, 'RangeCalendar', {
        'defaultValue': [day, day],
      }, lang: 'en');
      expect(tester.takeException(), isNull);
      final pill = find.ancestor(
        of: find.text(title),
        matching: find.byType(AnimatedContainer),
      );
      // In English the back arrow is the first chevron, on the left.
      final back = find.byWidgetPredicate(
        (w) => w is DibaGlyphMark && w.glyph == DibaGlyph.chevronLeft,
      );
      return (
        tester.getRect(pill.first),
        tester.getRect(back.first),
        tester.getRect(find.text(title)),
      );
    }

    testWidgets("a long title narrows its pill rather than cover the arrows", (
      tester,
    ) async {
      final (pill, back, _) = await header(
        tester,
        '2026-09-15',
        'September 2026',
      );
      expect(pill.left, greaterThanOrEqualTo(back.right));
    });

    testWidgets("a short title's pill is its words' width", (tester) async {
      final (pill, _, words) = await header(tester, '2026-05-15', 'May 2026');
      expect(pill.width, closeTo(words.width + 24, 0.01));
    });

    testWidgets("its error 4 in from the field's edge, as every field's", (
      tester,
    ) async {
      await paint(tester, 'DateRangePicker', {
        'label': 'بازه',
        'errorMessage': 'بازه را انتخاب کنید.',
      });
      final field = tester.getRect(find.byType(InputDecorator));
      final error = tester.getRect(find.text('بازه را انتخاب کنید.'));
      expect(field.right - error.right, closeTo(4, 0.01));
    });

    // The web's field, measured on the web: each date in half the
    // room before the calendar mark, the second 12 after the dash.
    for (final (name, props, first, second) in [
      (
        'two dates',
        <String, Object?>{
          'defaultValue': ['2026-10-17', '2026-10-28'],
        },
        find.text('۲۵ مهر ۱۴۰۵'),
        find.text('۶ آبان ۱۴۰۵'),
      ),
      (
        'the placeholders',
        <String, Object?>{},
        placeholders.at(0),
        placeholders.at(1),
      ),
    ]) {
      testWidgets('$name: each in half the field before the mark, 12 in, the '
          'dash between, 4 either side', (tester) async {
        await paint(tester, 'DateRangePicker', {'label': 'بازه', ...props});
        // The field's own text stays empty, or Material would hide the
        // halves under it.
        expect(
          tester
              .widget<EditableText>(find.byType(EditableText))
              .controller
              .text,
          isEmpty,
        );
        final a = tester.getRect(first);
        final b = tester.getRect(second);
        final field = tester.getRect(find.byType(TextField));
        final mark = tester.getRect(
          find.byWidgetPredicate(
            (w) => w is DibaGlyphMark && w.glyph == DibaGlyph.calendar,
          ),
        );
        final dash = tester.getRect(find.text(' - '));
        // Right to left: the mark's 28 square 12 from the field's left edge.
        final square = Rect.fromCenter(
          center: mark.center,
          width: 28,
          height: 28,
        );
        expect(square.left - field.left, closeTo(12, 0.01));
        final half = (field.right - square.right - (dash.width + 8)) / 2;
        expect(field.right - a.right, closeTo(12, 0.01));
        expect(a.left - (dash.right + 4), closeTo(8, 0.01));
        expect(dash.right + 4, closeTo(field.right - half, 0.01));
        expect(dash.left - 4 - b.right, closeTo(12, 0.01));
        expect(b.left - square.right, closeTo(8, 0.01));
        expect(a.center.dy, closeTo(field.center.dy, 0.5));
        expect(dash.center.dy, closeTo(field.center.dy, 0.5));
      });
    }
  });

  group('TimeField', () {
    testWidgets('reads «۰۹:۰۰» at rest, as the web does', (tester) async {
      await paint(tester, 'TimeField', {
        'label': 'ساعت',
        'defaultValue': '09:00',
      });
      expect(find.text('۰۹:۰۰'), findsOneWidget);
    });

    testWidgets('on a 12-hour clock, «۹:۳۰ ب.ظ.», as Material writes it', (
      tester,
    ) async {
      await paint(tester, 'TimeField', {
        'label': 'ساعت',
        'defaultValue': '21:30',
        'hourCycle': 12,
      });
      expect(find.text('۹:۳۰ ب.ظ.'), findsOneWidget);
    });

    testWidgets('empty, «––:––»; a press asks Material\'s time picker', (
      tester,
    ) async {
      await paint(tester, 'TimeField', {'label': 'ساعت'});
      expect(
        tester.widget<TextField>(find.byType(TextField)).decoration!.hintText,
        '––:––',
      );
      await tester.tap(find.byType(TextField));
      await tester.pumpAndSettle();
      expect(find.byType(DibaTimePickerDialog), findsOneWidget);
    });
  });

  testWidgets('DateField takes unavailable days too', (tester) async {
    await paint(tester, 'DateField', {
      'label': 'تاریخ',
      'defaultValue': '2026-10-22',
      'unavailableDates': ['2026-10-19'],
    });
    await tester.tap(find.byType(TextField));
    await tester.pumpAndSettle();
    expect(opacityOf(tester, day('۲۷')), 0.5);
  });

  // Two faults these pin: today picked in Mehr left the calendar in Mehr
  // while today was in Aban; and the fields' calendar mark kept the text
  // cursor.
  group('Today turns the calendar; the mark takes the pointer', () {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', //
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    final now = DateTime.now();
    final thisMonth = '${months[now.month - 1]} ${now.year}';

    /// The title a calendar shows: its first words.
    String titleOf(WidgetTester tester, Finder calendar) => tester
        .widget<Text>(
          find.descendant(of: calendar, matching: find.byType(Text)).first,
        )
        .data!;

    testWidgets('Calendar: today, from March 2024, shows its own month', (
      tester,
    ) async {
      await paint(tester, 'Calendar', {
        'defaultValue': '2024-03-05',
      }, lang: 'en');
      expect(find.text('March 2024'), findsOneWidget);
      await tester.tap(find.text('Today'));
      await tester.pumpAndSettle();
      expect(find.text(thisMonth), findsOneWidget);
      expect(find.text('March 2024'), findsNothing);
    });

    testWidgets('Calendar: today from the years closes them, at its month', (
      tester,
    ) async {
      await paint(tester, 'Calendar', {
        'defaultValue': '2024-03-05',
      }, lang: 'en');
      await tester.tap(find.text('March 2024'));
      await tester.pumpAndSettle();
      expect(find.text('2023'), findsOneWidget);
      await tester.tap(find.text('Today'));
      await tester.pumpAndSettle();
      expect(find.text('2023'), findsNothing);
      expect(find.text(thisMonth), findsOneWidget);
    });

    testWidgets('Calendar in Persian: today turns Mehr 1402 to the month of '
        'a calendar with no value', (tester) async {
      tester.view
        ..physicalSize = const Size(1024, 1000)
        ..devicePixelRatio = 1;
      addTearDown(tester.view.reset);
      await tester.pumpWidget(
        MaterialApp(
          theme: DibaTheme.light(),
          locale: const Locale('fa'),
          supportedLocales: const [Locale('fa'), Locale('en')],
          localizationsDelegates: GlobalMaterialLocalizations.delegates,
          home: const Scaffold(
            body: DibaSurface(
              tree: {
                'type': 'Stack',
                'props': {},
                'children': [
                  {'type': 'Calendar', 'props': {}},
                  {
                    'type': 'Calendar',
                    'props': {'defaultValue': '2023-10-10'},
                  },
                ],
              },
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      final calendars = find.byType(DibaDateCalendar);
      final shown = titleOf(tester, calendars.first);
      expect(titleOf(tester, calendars.last), 'مهر ۱۴۰۲');
      await tester.tap(find.text('امروز').last);
      await tester.pumpAndSettle();
      expect(titleOf(tester, calendars.last), shown);
    });

    testWidgets('RangeCalendar: today begins a range in its own month', (
      tester,
    ) async {
      await paint(tester, 'RangeCalendar', {
        'defaultValue': ['2024-03-05', '2024-03-09'],
      }, lang: 'en');
      await tester.tap(find.text('Today'));
      await tester.pumpAndSettle();
      expect(find.text(thisMonth), findsOneWidget);
    });

    testWidgets('DateRangePicker: today keeps the calendar open, at its '
        'month, for the range\'s other day', (tester) async {
      await paint(tester, 'DateRangePicker', {
        'label': 'Dates',
        'defaultValue': ['2024-03-05', '2024-03-09'],
      }, lang: 'en');
      await tester.tap(find.byType(TextField));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Today'));
      await tester.pumpAndSettle();
      expect(find.byType(DibaDateCalendar), findsOneWidget);
      expect(find.text(thisMonth), findsOneWidget);
    });

    /// The cursor shown with the mouse over the field's calendar mark, and
    /// over its words.
    Future<(MouseCursor?, MouseCursor?)> cursors(WidgetTester tester) async {
      final gesture = await tester.createGesture(
        kind: PointerDeviceKind.mouse,
        pointer: 1,
      );
      await gesture.addPointer(location: Offset.zero);
      addTearDown(gesture.removePointer);
      final mark = find.byWidgetPredicate(
        (w) => w is DibaGlyphMark && w.glyph == DibaGlyph.calendar,
      );
      await gesture.moveTo(tester.getCenter(mark));
      await tester.pump();
      final tracker = RendererBinding.instance.mouseTracker;
      final onMark = tracker.debugDeviceActiveCursor(1);
      final field = tester.getRect(find.byType(TextField));
      await gesture.moveTo(Offset(field.center.dx, field.center.dy));
      await tester.pump();
      return (onMark, tracker.debugDeviceActiveCursor(1));
    }

    for (final type in ['DateField', 'DateRangePicker']) {
      testWidgets('$type: the pointer over the mark, the text cursor over '
          'the words', (tester) async {
        await paint(tester, type, {'label': 'تاریخ'});
        expect(await cursors(tester), (
          SystemMouseCursors.click,
          SystemMouseCursors.text,
        ));
      });

      // Material's decorator puts the arrow over every suffix icon; a mark
      // that opens nothing keeps it, as the web's button off does.
      testWidgets('$type: read only, the mark has the arrow', (tester) async {
        await paint(tester, type, {'label': 'تاریخ', 'isReadOnly': true});
        expect((await cursors(tester)).$1, SystemMouseCursors.basic);
      });

      testWidgets('$type: off, the mark has the arrow', (tester) async {
        await paint(tester, type, {'label': 'تاریخ', 'isDisabled': true});
        expect((await cursors(tester)).$1, SystemMouseCursors.basic);
      });
    }
  });

  // The time field is Flutter's; the web's takes Material's picker as this draws it.
  // `time-picker.browser.test.tsx` holds the web's.
  group('The time picker', () {
    testWidgets('a time field shows the pointer: a press anywhere opens the '
        'picker; read only, the arrow', (tester) async {
      Future<MouseCursor?> over(Map<String, Object?> props) async {
        await paint(tester, 'TimeField', {'label': 'ساعت', ...props});
        final gesture = await tester.createGesture(
          kind: PointerDeviceKind.mouse,
          pointer: 1,
        );
        await gesture.addPointer(location: Offset.zero);
        await gesture.moveTo(tester.getCenter(find.byType(TextField)));
        await tester.pump();
        final cursor = RendererBinding.instance.mouseTracker
            .debugDeviceActiveCursor(1);
        await gesture.removePointer();
        return cursor;
      }

      expect(await over({'defaultValue': '09:00'}), SystemMouseCursors.click);
      expect(
        await over({'defaultValue': '09:00', 'isReadOnly': true}),
        SystemMouseCursors.basic,
      );
    });

    // Material's picker read a typed hour in 0-9 only and refused its own
    // «۲۱» on OK; Diba's copy reads the locale's digits.
    testWidgets('Persian types too: the time written in its fields is taken, '
        'and «۱۴» «۴۵» typed', (tester) async {
      Map<String, Object?>? sent;
      Future<Finder> typed() async {
        await paint(tester, 'TimeField', {
          'label': 'ساعت',
          'defaultValue': '21:30',
        }, handlers: DibaHandlers(call: (_, p) => sent = p));
        await tester.tap(find.byType(TextField));
        await tester.pumpAndSettle();
        expect(find.byType(DibaTimePickerDialog), findsOneWidget);
        await tester.tap(find.byIcon(Icons.keyboard_outlined));
        await tester.pumpAndSettle();
        return find.descendant(
          of: find.byType(DibaTimePickerDialog),
          matching: find.byType(TextField),
        );
      }

      final fields = await typed();
      final hour = tester.widget<EditableText>(
        find.descendant(of: fields.first, matching: find.byType(EditableText)),
      );
      expect(hour.controller.text, '۲۱');
      await tester.tap(find.text('تأیید'));
      await tester.pumpAndSettle();
      expect(sent, {'when': '21:30'});

      final again = await typed();
      await tester.enterText(again.at(0), '۱۴');
      await tester.enterText(again.at(1), '۴۵');
      await tester.tap(find.text('تأیید'));
      await tester.pumpAndSettle();
      expect(sent, {'when': '14:45'});
    });

    testWidgets('English keeps the way to type', (tester) async {
      await paint(tester, 'TimeField', {
        'label': 'Time',
        'defaultValue': '21:30',
      }, lang: 'en');
      await tester.tap(find.byType(TextField));
      await tester.pumpAndSettle();
      expect(find.byIcon(Icons.keyboard_outlined), findsOneWidget);
    });

    testWidgets("it opens over the theme's backdrop, as Diba's dialogs and the "
        "web's do", (tester) async {
      await paint(tester, 'TimeField', {
        'label': 'ساعت',
        'defaultValue': '21:30',
      });
      await tester.tap(find.byType(TextField));
      await tester.pumpAndSettle();
      final barrier = tester.widgetList<ModalBarrier>(
        find.byType(ModalBarrier),
      );
      expect(barrier.last.color, DibaLightColors.overlay);
    });

    testWidgets("a timed range asks «ساعت آغاز», then «ساعت پایان»; the "
        'times reach the days', (tester) async {
      Map<String, Object?>? sent;
      await paint(tester, 'DateRangePicker', {
        'label': 'بازه',
        'granularity': 'minute',
        'defaultValue': ['2026-10-23T09:00', '2026-10-30T21:00'],
      }, handlers: DibaHandlers(call: (_, p) => sent = p));
      await tester.tap(find.byType(TextField));
      await tester.pumpAndSettle();
      // 10 and 13 Aban: 2026-11-01 and 2026-11-04.
      await tester.tap(day('۱۰'));
      await tester.pumpAndSettle();
      await tester.tap(day('۱۳'));
      await tester.pumpAndSettle();
      expect(find.text('ساعت آغاز'), findsOneWidget);
      await tester.tap(find.text('تأیید'));
      await tester.pumpAndSettle();
      expect(find.text('ساعت پایان'), findsOneWidget);
      await tester.tap(find.text('تأیید'));
      await tester.pumpAndSettle();
      expect(sent, {
        'when': ['2026-11-01T09:00', '2026-11-04T21:00'],
      });
    });
  });

  // Found on 2026-11-01: on the web and desktop a single-line field selects
  // all it holds when focus comes back, and focus comes back to a time field
  // from its closed picker, so the field stood selected; the web's is a
  // button. A date field keeps its focus while its panel is open and loses it
  // to a time after a day, so it never stood selected. Windows has the web's
  // rule.
  group('Focus back from a picker', () {
    /// The field's selection, and whether focus came back to it.
    (TextSelection, bool) field(WidgetTester tester) {
      final text = tester.widget<EditableText>(
        find.descendant(
          of: find.byType(TextField),
          matching: find.byType(EditableText),
        ),
      );
      return (text.controller.selection, text.focusNode.hasFocus);
    }

    testWidgets(
      'a time field, its picker cancelled, selects nothing',
      (tester) async {
        await paint(tester, 'TimeField', {
          'label': 'ساعت',
          'defaultValue': '09:00',
        });
        await tester.tap(find.byType(TextField));
        await tester.pumpAndSettle();
        await tester.tap(find.text('لغو'));
        await tester.pumpAndSettle();
        final (selection, focused) = field(tester);
        expect(focused, isTrue);
        expect(selection.isCollapsed, isTrue);
      },
      variant: TargetPlatformVariant.only(TargetPlatform.windows),
    );
  });
}
