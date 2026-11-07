import 'dart:async';

import 'package:diba/diba.dart';
import 'package:diba/src/sdui/date_calendar.dart';
import 'package:diba/src/sdui/glyphs.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shamsi_date/shamsi_date.dart';

/// Part of the schema: the value pairs, the toast and
/// close verbs, required marks, icons, Form, and the Persian calendar for
/// Material's own date picker.
void main() {
  Future<List<String>> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    DibaHandlers handlers = const DibaHandlers(),
    Locale locale = const Locale('fa'),
  }) async {
    final refused = <String>[];
    await tester.pumpWidget(
      MaterialApp(
        theme: DibaTheme.light(),
        locale: locale,
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(
          body: SingleChildScrollView(
            child: DibaSurface(
              tree: tree,
              handlers: handlers,
              onRefuse: refused.add,
            ),
          ),
        ),
      ),
    );
    await tester.pump();
    return refused;
  }

  Map<String, Object?> send(String key) => {
    'type': 'Button',
    'children': 'ثبت',
    'actions': {
      'onPress': {
        'do': 'call',
        'action': 'submit',
        'with': [key],
      },
    },
  };

  group('every value has a pair', () {
    testWidgets('a TextField from defaultValue can be typed into', (
      tester,
    ) async {
      Map<String, Object?>? payload;
      await paint(tester, {
        'type': 'Stack',
        'children': [
          {
            'type': 'TextField',
            'props': {'label': 'نام', 'defaultValue': 'شال'},
            'actions': {
              'onChange': {'do': 'setState', 'key': 'name'},
            },
          },
          send('name'),
        ],
      }, handlers: DibaHandlers(call: (a, p) => payload = p));

      expect(find.text('شال'), findsOneWidget);
      await tester.enterText(find.byType(TextField), 'شال ابریشمی');
      await tester.pump();
      expect(find.text('شال ابریشمی'), findsOneWidget);
      await tester.tap(find.text('ثبت'));
      await tester.pump();
      expect(payload, {'name': 'شال ابریشمی'});
    });

    /// "Shows exactly what the server sent until the next tree" — the change
    /// is still reported, and the field still shows the server's value.
    testWidgets('a pinned TextField reports the change and keeps its value', (
      tester,
    ) async {
      final changes = <Object?>[];
      Map<String, Object?>? payload;
      await paint(
        tester,
        {
          'type': 'Stack',
          'children': [
            {
              'type': 'TextField',
              'props': {'label': 'کد', 'value': 'DB-1041'},
              'actions': {
                'onChange': {'do': 'setState', 'key': 'code'},
              },
            },
            send('code'),
          ],
        },
        handlers: DibaHandlers(
          call: (a, p) {
            payload = p;
            changes.add(p['code']);
          },
        ),
      );

      await tester.enterText(find.byType(TextField), 'DB-9999');
      await tester.pump();
      expect(find.text('DB-1041'), findsOneWidget);
      expect(find.text('DB-9999'), findsNothing);
      await tester.tap(find.text('ثبت'));
      await tester.pump();
      expect(payload, {'code': 'DB-9999'});
    });

    testWidgets('a pinned value follows the next tree', (tester) async {
      Map<String, Object?> tree(String v) => {
        'type': 'TextField',
        'props': {'label': 'کد', 'value': v},
      };
      await paint(tester, tree('A-1'));
      expect(find.text('A-1'), findsOneWidget);
      await paint(tester, tree('A-2'));
      expect(find.text('A-2'), findsOneWidget);
    });

    testWidgets(
      'a Switch from defaultSelected toggles; a pinned one does not',
      (tester) async {
        await paint(tester, {
          'type': 'Stack',
          'children': [
            {
              'type': 'Switch',
              'props': {'label': 'فعال', 'defaultSelected': true},
            },
            {
              'type': 'Switch',
              'props': {'label': 'قفل', 'isSelected': true},
            },
          ],
        });
        final switches = find.byType(Switch);
        await tester.tap(switches.first);
        await tester.tap(switches.last);
        await tester.pump();
        expect(tester.widget<Switch>(switches.first).value, isFalse);
        expect(tester.widget<Switch>(switches.last).value, isTrue);
      },
    );

    testWidgets('a ToggleButtonGroup will not empty itself by default', (
      tester,
    ) async {
      Map<String, Object?>? payload;
      await paint(tester, {
        'type': 'Stack',
        'children': [
          {
            'type': 'ToggleButtonGroup',
            'props': {
              'defaultSelectedKeys': ['day'],
            },
            'children': [
              {
                'type': 'ToggleButton',
                'props': {'id': 'day'},
                'children': 'روز',
              },
              {
                'type': 'ToggleButton',
                'props': {'id': 'week'},
                'children': 'هفته',
              },
            ],
            'actions': {
              'onSelectionChange': {'do': 'setState', 'key': 'span'},
            },
          },
          send('span'),
        ],
      }, handlers: DibaHandlers(call: (a, p) => payload = p));

      await tester.tap(find.text('روز'));
      await tester.pump();
      await tester.tap(find.text('ثبت'));
      await tester.pump();
      // Nothing was recorded: the press would have emptied it.
      expect(payload, {'span': null});

      await tester.tap(find.text('هفته'));
      await tester.pump();
      await tester.tap(find.text('ثبت'));
      await tester.pump();
      expect(payload, {
        'span': ['week'],
      });
    });
  });

  group('the toast and close verbs', () {
    testWidgets('toast draws a SnackBar when the host draws none', (
      tester,
    ) async {
      await paint(tester, {
        'type': 'Button',
        'children': 'ذخیره',
        'actions': {
          'onPress': {
            'do': 'toast',
            'status': 'success',
            'title': 'ذخیره شد',
            'description': 'تغییرها ثبت شد.',
          },
        },
      });
      await tester.tap(find.text('ذخیره'));
      await tester.pump();
      expect(find.byType(SnackBar), findsOneWidget);
      expect(find.text('ذخیره شد'), findsOneWidget);
    });

    testWidgets('toast goes to the host, with its action bound', (
      tester,
    ) async {
      DibaToast? got;
      String? called;
      await paint(
        tester,
        {
          'type': 'Button',
          'children': 'حذف',
          'actions': {
            'onPress': {
              'do': 'toast',
              'status': 'default',
              'title': 'حذف شد',
              'actionLabel': 'برگرداندن',
              'onAction': {'do': 'call', 'action': 'undo'},
            },
          },
        },
        handlers: DibaHandlers(
          toast: (t) => got = t,
          call: (a, p) => called = a,
        ),
      );
      await tester.tap(find.text('حذف'));
      await tester.pump();
      expect(got!.title, 'حذف شد');
      expect(got!.actionLabel, 'برگرداندن');
      got!.onAction!();
      await tester.pump();
      expect(called, 'undo');
    });

    testWidgets('toast refuses a status it does not know', (tester) async {
      final refused = await paint(tester, {
        'type': 'Button',
        'children': 'x',
        'actions': {
          'onPress': {'do': 'toast', 'status': 'purple', 'title': 'x'},
        },
      });
      await tester.tap(find.text('x'));
      await tester.pump();
      expect(refused, contains('toast: refused status "purple"'));
    });

    testWidgets('close ends the dialog it was pressed in', (tester) async {
      await paint(tester, {
        'type': 'Modal',
        'props': {'title': 'ویرایش'},
        'slots': {
          'trigger': {'type': 'Button', 'children': 'باز کن'},
          'footer': {
            'type': 'Button',
            'children': 'انصراف',
            'actions': {
              'onPress': {'do': 'close'},
            },
          },
        },
        'children': [
          {'type': 'Text', 'children': 'بدنه'},
        ],
      });
      await tester.tap(find.text('باز کن'));
      await tester.pumpAndSettle();
      expect(find.text('بدنه'), findsOneWidget);
      await tester.tap(find.text('انصراف'));
      await tester.pumpAndSettle();
      expect(find.text('بدنه'), findsNothing);
    });

    /// Navigator.pop with nothing open would pop the merchant's own screen.
    testWidgets('close with no overlay open is refused, and pops nothing', (
      tester,
    ) async {
      final refused = <String>[];
      final navigator = GlobalKey<NavigatorState>();
      await tester.pumpWidget(
        MaterialApp(
          navigatorKey: navigator,
          home: const Scaffold(body: Text('خانه')),
        ),
      );
      navigator.currentState!.push(
        MaterialPageRoute<void>(
          builder: (_) => Scaffold(
            body: DibaSurface(
              onRefuse: refused.add,
              tree: const {
                'type': 'Button',
                'children': 'بستن',
                'actions': {
                  'onPress': {'do': 'close'},
                },
              },
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('بستن'));
      await tester.pumpAndSettle();
      expect(find.text('بستن'), findsOneWidget);
      expect(refused, contains('close with no overlay open'));
    });

    testWidgets('a checkbox inside a dialog ticks on screen', (tester) async {
      await paint(tester, {
        'type': 'Modal',
        'props': {'title': 'تنظیم'},
        'slots': {
          'trigger': {'type': 'Button', 'children': 'باز کن'},
        },
        'children': [
          {
            'type': 'Checkbox',
            'props': {'label': 'بیمه'},
          },
        ],
      });
      await tester.tap(find.text('باز کن'));
      await tester.pumpAndSettle();
      expect(tester.widget<Checkbox>(find.byType(Checkbox)).value, isFalse);
      await tester.tap(find.text('بیمه'));
      await tester.pumpAndSettle();
      expect(tester.widget<Checkbox>(find.byType(Checkbox)).value, isTrue);
    });

    testWidgets('AlertDialog keeps confirm pending until the call is done', (
      tester,
    ) async {
      final done = Completer<void>();
      await paint(tester, {
        'type': 'AlertDialog',
        'props': {'title': 'حذف محصول؟', 'confirmLabel': 'حذف'},
        'slots': {
          'trigger': {'type': 'Button', 'children': 'حذف کن'},
        },
        'actions': {
          'onConfirm': {'do': 'call', 'action': 'product.delete'},
        },
      }, handlers: DibaHandlers(call: (a, p) => done.future));
      await tester.tap(find.text('حذف کن'));
      await tester.pumpAndSettle();
      // Cancel is Diba's own word when the tree gives none.
      expect(find.text('انصراف'), findsOneWidget);
      await tester.tap(find.text('حذف'));
      await tester.pump();
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('حذف محصول؟'), findsOneWidget);
      done.complete();
      await tester.pumpAndSettle();
      expect(find.text('حذف محصول؟'), findsNothing);
    });
  });

  /// A host logging refusals with setState rebuilds the surface, which walks
  /// the tree and refuses again. The gallery spun on this until refusals
  /// found while building were held to the end of the frame and reported
  /// once per tree.
  testWidgets('refusals reach a setState host once, after the frame', (
    tester,
  ) async {
    final seen = <String>[];
    await tester.pumpWidget(
      MaterialApp(
        home: StatefulBuilder(
          builder: (context, setState) => Column(
            children: [
              Text('${seen.length}'),
              DibaSurface(
                tree: const {
                  'type': 'Text',
                  'props': {'onTap': 'x'},
                  'children': 'سلام',
                },
                onRefuse: (r) => setState(() => seen.add(r)),
              ),
            ],
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(seen, ['Text: undeclared prop "onTap"']);
  });

  group('required marks and icons', () {
    // The star is a Text of its own in the label, 2 after the words.
    bool hasRequiredMark(WidgetTester tester, String label) => find
        .descendant(
          of: find.byWidgetPredicate(
            (w) => w is RichText && w.text.toPlainText() == '$label\uFFFC',
          ),
          matching: find.text('*'),
        )
        .evaluate()
        .isNotEmpty;

    testWidgets('isRequired composes an asterisk into the label', (
      tester,
    ) async {
      await paint(tester, {
        'type': 'Stack',
        'children': [
          {
            'type': 'TextField',
            'props': {'label': 'ایمیل', 'isRequired': true},
          },
          {
            'type': 'Checkbox',
            'props': {'label': 'شرایط را می‌پذیرم', 'isRequired': true},
          },
          {
            'type': 'TextField',
            'props': {'label': 'یادداشت'},
          },
        ],
      });
      expect(hasRequiredMark(tester, 'ایمیل'), isTrue);
      expect(hasRequiredMark(tester, 'شرایط را می‌پذیرم'), isTrue);
      expect(hasRequiredMark(tester, 'یادداشت'), isFalse);
    });

    testWidgets('a Lucide name draws the Lucide icon', (tester) async {
      await paint(tester, {
        'type': 'Button',
        'props': {'icon': 'trash-2', 'variant': 'danger'},
        'children': 'حذف',
      });
      expect(find.byIcon(LucideIcons.trash2), findsOneWidget);
    });

    testWidgets('an icon off the list is refused', (tester) async {
      final refused = await paint(tester, {
        'type': 'Button',
        'props': {'icon': 'skull'},
        'children': 'x',
      });
      expect(refused, contains('Button: icon "skull" is not on the icon list'));
    });

    test('directional icons mirror, the rest do not', () {
      expect(dibaIcons['chevron-left']!.matchTextDirection, isTrue);
      expect(dibaIcons['trash-2']!.matchTextDirection, isFalse);
    });
  });

  group('Form', () {
    Map<String, Object?> form() => {
      'type': 'Form',
      'actions': {
        'onSubmit': {'do': 'call', 'action': 'profile.save'},
      },
      'children': [
        {
          'type': 'TextField',
          'props': {
            'label': 'ایمیل',
            'name': 'email',
            'type': 'email',
            'isRequired': true,
          },
        },
        {
          'type': 'Checkbox',
          'props': {
            'label': 'خبرنامه',
            'name': 'news',
            'defaultSelected': true,
          },
        },
        {
          'type': 'Button',
          'props': {'type': 'submit', 'variant': 'primary'},
          'children': 'ذخیره',
        },
        {
          'type': 'Button',
          'props': {'type': 'reset'},
          'children': 'از نو',
        },
      ],
    };

    testWidgets('submit runs the checks before onSubmit', (tester) async {
      Map<String, Object?>? payload;
      await paint(
        tester,
        form(),
        handlers: DibaHandlers(call: (a, p) => payload = p),
      );

      await tester.tap(find.text('ذخیره'));
      await tester.pumpAndSettle();
      expect(payload, isNull);
      expect(find.text('این فیلد الزامی است.'), findsOneWidget);

      await tester.enterText(find.byType(TextField), 'not-an-email');
      await tester.tap(find.text('ذخیره'));
      await tester.pumpAndSettle();
      expect(payload, isNull);
      expect(find.text('نشانی ایمیل درست نیست.'), findsOneWidget);

      await tester.enterText(find.byType(TextField), 'a@kaladan.shop');
      await tester.tap(find.text('ذخیره'));
      await tester.pumpAndSettle();
      // The named fields' values and nothing else.
      expect(payload, {'email': 'a@kaladan.shop', 'news': true});
    });

    testWidgets('reset restores every field to its default', (tester) async {
      await paint(tester, form());
      await tester.enterText(find.byType(TextField), 'a@kaladan.shop');
      await tester.tap(find.text('خبرنامه'));
      await tester.pump();
      expect(tester.widget<Checkbox>(find.byType(Checkbox)).value, isFalse);

      await tester.tap(find.text('از نو'));
      await tester.pumpAndSettle();
      expect(find.text('a@kaladan.shop'), findsNothing);
      expect(tester.widget<Checkbox>(find.byType(Checkbox)).value, isTrue);
    });

    testWidgets('a submit button outside a Form is refused', (tester) async {
      final refused = await paint(tester, {
        'type': 'Button',
        'props': {'type': 'submit'},
        'children': 'x',
      });
      expect(refused, contains('Button: type "submit" outside a Form'));
    });
  });

  group('containers', () {
    testWidgets('a linked Card holding a button loses its link, not the button', (
      tester,
    ) async {
      final refused = await paint(tester, {
        'type': 'Card',
        'props': {'title': 'سفارش', 'href': '/orders/1'},
        'children': [
          {'type': 'Button', 'children': 'ارسال'},
        ],
      });
      expect(find.text('ارسال'), findsOneWidget);
      expect(
        refused,
        contains(
          'Card: href on a card holding something interactive; the link is dropped',
        ),
      );
    });

    testWidgets('a Table sorts through its column and reports the descriptor', (
      tester,
    ) async {
      Map<String, Object?>? payload;
      await paint(tester, {
        'type': 'Stack',
        'children': [
          {
            'type': 'Table',
            'props': {'label': 'سفارش‌ها'},
            'actions': {
              'onSortChange': {'do': 'setState', 'key': 'sort'},
            },
            'children': [
              {
                'type': 'TableHeader',
                'children': [
                  {
                    'type': 'Column',
                    'props': {'id': 'code', 'isRowHeader': true},
                    'children': 'کد',
                  },
                  {
                    'type': 'Column',
                    'props': {
                      'id': 'total',
                      'allowsSorting': true,
                      'align': 'end',
                    },
                    'children': 'مبلغ',
                  },
                ],
              },
              {
                'type': 'TableBody',
                'children': [
                  {
                    'type': 'Row',
                    'props': {'id': '1'},
                    'children': [
                      {'type': 'Cell', 'children': 'DB-1'},
                      {
                        'type': 'Cell',
                        'children': [
                          {
                            'type': 'Chip',
                            'props': {'color': 'success'},
                            'children': 'پرداخت‌شده',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                'type': 'TableFooter',
                'children': [
                  {
                    'type': 'Row',
                    'props': {'id': 'sum'},
                    'children': [
                      {'type': 'Cell', 'children': 'جمع'},
                      {'type': 'Cell', 'children': '۱۰'},
                    ],
                  },
                ],
              },
            ],
          },
          send('sort'),
        ],
      }, handlers: DibaHandlers(call: (a, p) => payload = p));

      // Blocks in cells, and the footer as a last row.
      expect(find.text('پرداخت‌شده'), findsOneWidget);
      expect(find.text('جمع'), findsOneWidget);
      await tester.tap(find.text('مبلغ'));
      await tester.pump();
      await tester.tap(find.text('ثبت'));
      await tester.pump();
      expect(payload, {
        'sort': {'column': 'total', 'direction': 'ascending'},
      });
    });

    testWidgets('an Alert without a status is refused and is not red', (
      tester,
    ) async {
      final refused = await paint(tester, {
        'type': 'Alert',
        'props': {'title': 'توجه'},
      });
      expect(refused, contains('Alert: no status'));
      expect(find.text('توجه'), findsOneWidget);
    });

    testWidgets('a dismissible Alert hides itself and fires onClose', (
      tester,
    ) async {
      String? called;
      await paint(tester, {
        'type': 'Alert',
        'props': {
          'status': 'warning',
          'title': 'موجودی کم است',
          'isDismissible': true,
        },
        'actions': {
          'onClose': {'do': 'call', 'action': 'notice.dismiss'},
        },
      }, handlers: DibaHandlers(call: (a, p) => called = a));
      await tester.tap(
        find.byWidgetPredicate(
          (w) => w is DibaGlyphMark && w.glyph == DibaGlyph.close,
        ),
      );
      await tester.pump();
      expect(find.text('موجودی کم است'), findsNothing);
      expect(called, 'notice.dismiss');
    });
  });

  group('Persian, RTL and Jalali', () {
    const delegate = DibaPersianCalendarDelegate();

    test('months are Jalali months, leap years included', () {
      expect(delegate.getDaysInMonth(1403, 1), 31);
      expect(delegate.getDaysInMonth(1403, 7), 30);
      // 1403 is a leap year; 1404 is not.
      expect(delegate.getDaysInMonth(1403, 12), 30);
      expect(delegate.getDaysInMonth(1404, 12), 29);
    });

    /// The trap the subclass exists for: Ordibehesht 31st as a plain DateTime
    /// is "February 31st", which rolls over into March.
    test('a date the picker reads is the real day underneath', () {
      final day = delegate.getDay(1405, 2, 31);
      expect((day.year, day.month, day.day), (1405, 2, 31));
      expect(day, isA<DibaJalaliDateTime>());
      expect(
        Jalali.fromDateTime((day as DibaJalaliDateTime).gregorian),
        Jalali(1405, 2, 31),
      );
    });

    test('arithmetic crosses months and years in Jalali', () {
      final esfand = delegate.getMonth(1404, 12);
      final next = delegate.addMonthsToMonthDate(esfand, 1);
      expect((next.year, next.month), (1405, 1));
      expect(delegate.monthDelta(esfand, next), 1);
      final lastDay = delegate.getDay(1404, 12, 29);
      final newYear = delegate.addDaysToDate(lastDay, 1);
      expect((newYear.year, newYear.month, newYear.day), (1405, 1, 1));
    });

    test('it formats and parses in Persian digits', () {
      final day = delegate.getDay(1405, 7, 24);
      const localizations = DefaultMaterialLocalizations();
      expect(delegate.formatMonthYear(day, localizations), 'مهر ۱۴۰۵');
      expect(delegate.formatCompactDate(day, localizations), '۱۴۰۵/۰۷/۲۴');
      final parsed = delegate.parseCompactDate('۱۴۰۵/۰۷/۲۴', localizations)!;
      expect((parsed.year, parsed.month, parsed.day), (1405, 7, 24));
      expect(delegate.parseCompactDate('1405/12/31', localizations), isNull);
    });

    test('the same calendar, in English words', () {
      const english = DibaPersianCalendarDelegate(persian: false);
      final day = english.getDay(1405, 7, 24);
      expect(
        english.formatMonthYear(day, const DefaultMaterialLocalizations()),
        'Mehr 1405',
      );
    });

    testWidgets(
      'a DateField opens Diba\'s calendar in Jalali, and sends ISO',
      (tester) async {
        Map<String, Object?>? payload;
        await paint(tester, {
          'type': 'Stack',
          'children': [
            {
              'type': 'DateField',
              'props': {'label': 'تاریخ ارسال', 'defaultValue': '2026-10-16'},
              'actions': {
                'onChange': {'do': 'setState', 'key': 'when'},
              },
            },
            send('when'),
          ],
        }, handlers: DibaHandlers(call: (a, p) => payload = p));

        // 2026-10-16 is 24 Mehr 1405.
        expect(find.text('۲۴ مهر ۱۴۰۵'), findsOneWidget);
        await tester.tap(find.byType(TextField));
        await tester.pumpAndSettle();
        expect(find.byType(DibaDateCalendar), findsOneWidget);
        expect(find.text('مهر ۱۴۰۵'), findsWidgets);

        // A day picked is the date: no confirm, and the calendar closes.
        await tester.tap(find.text('۲۵'));
        await tester.pumpAndSettle();
        expect(find.byType(DibaDateCalendar), findsNothing);
        await tester.tap(find.text('ثبت'));
        await tester.pump();
        // The wire value is ISO 8601, Gregorian, whatever calendar was drawn.
        expect(payload, {'when': '2026-10-17'});
      },
    );

    testWidgets('auto is Gregorian on an English page', (tester) async {
      await paint(tester, {
        'type': 'DateField',
        'props': {'label': 'Ship date', 'defaultValue': '2026-10-16'},
      }, locale: const Locale('en'));
      expect(find.text('October 16, 2026'), findsOneWidget);
    });

    testWidgets('a NumberField shows Persian digits and reads them back', (
      tester,
    ) async {
      Map<String, Object?>? payload;
      await paint(tester, {
        'type': 'Stack',
        'children': [
          {
            'type': 'NumberField',
            'props': {'label': 'وزن', 'defaultValue': 1250, 'maxValue': 5000},
            'actions': {
              'onChange': {'do': 'setState', 'key': 'weight'},
            },
          },
          send('weight'),
        ],
      }, handlers: DibaHandlers(call: (a, p) => payload = p));

      expect(find.text('۱٬۲۵۰'), findsOneWidget);
      await tester.tap(find.byType(TextField));
      await tester.pump();
      await tester.enterText(find.byType(TextField), '۹۰۰۰');
      // Leaving the field clamps to maxValue, as React Aria does on blur.
      FocusManager.instance.primaryFocus?.unfocus();
      await tester.pump();
      expect(find.text('۵٬۰۰۰'), findsOneWidget);
      await tester.tap(find.text('ثبت'));
      await tester.pump();
      expect(payload, {'weight': 5000});
    });
  });
}
