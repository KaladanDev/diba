import 'package:diba/diba.dart';
import 'package:diba/src/sdui/glyphs.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// Part of the schema: action lists, `call`'s value,
/// flat sorting, toman, ToggleButtonGroup as a Form field, the toast's own
/// actions, centred columns, mirrored icons and the v3 look.
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

  Map<String, Object?> modal(Object? save) => {
    'type': 'Modal',
    'props': {'title': 'ویرایش'},
    'slots': {
      'trigger': {'type': 'Button', 'children': 'باز کن'},
      'footer': {
        'type': 'Button',
        'children': 'ذخیره',
        'actions': {'onPress': save},
      },
    },
    'children': [
      {'type': 'Text', 'children': 'بدنه'},
    ],
  };

  group('an event takes an ordered list', () {
    testWidgets('"Save, then close" waits for the call, then closes', (
      tester,
    ) async {
      final calls = <String>[];
      await paint(
        tester,
        modal([
          {'do': 'call', 'action': 'address.save'},
          {'do': 'close'},
        ]),
        handlers: DibaHandlers(
          call: (a, p) async {
            calls.add(a);
            await Future<void>.delayed(const Duration(milliseconds: 50));
          },
        ),
      );
      await tester.tap(find.text('باز کن'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('ذخیره'));
      await tester.pump();
      // The call is in flight, so the dialog is still open.
      expect(find.text('بدنه'), findsOneWidget);
      await tester.pumpAndSettle(const Duration(milliseconds: 100));
      expect(calls, ['address.save']);
      expect(find.text('بدنه'), findsNothing);
    });

    testWidgets('a failed call stops the list, and the dialog stays', (
      tester,
    ) async {
      final refused = await paint(
        tester,
        modal([
          {'do': 'call', 'action': 'address.save'},
          {'do': 'close'},
        ]),
        handlers: DibaHandlers(
          call: (a, p) async => throw StateError('server said no'),
        ),
      );
      await tester.tap(find.text('باز کن'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('ذخیره'));
      await tester.pumpAndSettle();
      expect(find.text('بدنه'), findsOneWidget);
      expect(
        refused,
        contains('call "address.save" failed: Bad state: server said no'),
      );
    });

    testWidgets('steps run in order, each seeing the event value', (
      tester,
    ) async {
      final got = <String, Object?>{};
      await paint(tester, {
        'type': 'Stack',
        'children': [
          {
            'type': 'ListBox',
            'props': {'label': 'کارها', 'selectionMode': 'none'},
            'children': [
              {
                'type': 'ListBoxItem',
                'props': {'id': 'copy'},
                'children': 'رونوشت',
              },
            ],
            'actions': {
              'onAction': [
                {'do': 'setState', 'key': 'last'},
                {
                  'do': 'call',
                  'action': 'row.open',
                  'value': 'row',
                  'with': ['last'],
                },
              ],
            },
          },
        ],
      }, handlers: DibaHandlers(call: (a, p) => got.addAll(p)));
      await tester.tap(find.text('رونوشت'));
      await tester.pump();
      // setState ran first, so the call already sees it under "last".
      expect(got, {'last': 'copy', 'row': 'copy'});
    });
  });

  group("call sends the event's own value", () {
    testWidgets('TagGroup onRemove sends the tag', (tester) async {
      Map<String, Object?>? payload;
      await paint(tester, {
        'type': 'TagGroup',
        'props': {'label': 'کلیدواژه‌ها'},
        'actions': {
          'onRemove': {
            'do': 'call',
            'action': 'keyword.remove',
            'value': 'tag',
          },
        },
        'children': [
          {
            'type': 'Tag',
            'props': {'id': 'silk'},
            'children': 'ابریشم',
          },
        ],
      }, handlers: DibaHandlers(call: (a, p) => payload = p));
      await tester.tap(find.byTooltip('پاک کردن'));
      await tester.pump();
      expect(payload, {'tag': 'silk'});
    });

    /// The sort's chevron, 12 across in its column's heading.
    final chevron = find.byWidgetPredicate(
      (w) => w is DibaGlyphMark && w.glyph == DibaGlyph.chevronDown,
    );

    /// Whether the chevron points up, as it does for ascending: turned half
    /// round from the down it is drawn as.
    bool pointsUp(WidgetTester tester) =>
        tester
            .widget<Transform>(
              find
                  .ancestor(of: chevron, matching: find.byType(Transform))
                  .first,
            )
            .transform
            .storage[0] <
        0;

    Map<String, Object?> table({Map<String, Object?> props = const {}}) => {
      'type': 'Table',
      'props': {'label': 'سفارش‌ها', ...props},
      'actions': {
        'onRowAction': {'do': 'call', 'action': 'order.open', 'value': 'id'},
        'onSortChange': {
          'do': 'call',
          'action': 'orders.sort',
          'value': 'sort',
        },
      },
      'children': [
        {
          'type': 'TableHeader',
          'children': [
            {
              'type': 'Column',
              'props': {'id': 'code', 'align': 'center'},
              'children': 'کد',
            },
            {
              'type': 'Column',
              'props': {'id': 'total', 'allowsSorting': true},
              'children': 'مبلغ',
            },
          ],
        },
        {
          'type': 'TableBody',
          'children': [
            {
              'type': 'Row',
              'props': {'id': '1041'},
              'children': [
                {'type': 'Cell', 'children': 'DB-1041'},
                {'type': 'Cell', 'children': '۱۰'},
              ],
            },
          ],
        },
      ],
    };

    testWidgets('Table onRowAction sends the row, onSortChange a flat pair', (
      tester,
    ) async {
      final calls = <String, Map<String, Object?>>{};
      await paint(
        tester,
        table(
          props: {
            'defaultSortColumn': 'total',
            'defaultSortDirection': 'ascending',
          },
        ),
        handlers: DibaHandlers(call: (a, p) => calls[a] = p),
      );
      await tester.tap(find.text('DB-1041'));
      await tester.pump();
      expect(calls['order.open'], {'id': '1041'});

      // Already ascending on total, so a press asks for descending.
      await tester.tap(find.text('مبلغ'));
      await tester.pump();
      expect(calls['orders.sort'], {
        'sort': {'column': 'total', 'direction': 'descending'},
      });
      expect(pointsUp(tester), isFalse);
    });

    testWidgets('a pinned sort shows what the server sent', (tester) async {
      await paint(
        tester,
        table(props: {'sortColumn': 'total', 'sortDirection': 'descending'}),
      );
      // In the total's heading, beside its words, and pointing down.
      expect(
        find.descendant(
          of: find.ancestor(of: find.text('مبلغ'), matching: find.byType(Row)),
          matching: chevron,
        ),
        findsOneWidget,
      );
      expect(pointsUp(tester), isFalse);
      await tester.tap(find.text('مبلغ'));
      await tester.pump();
      expect(pointsUp(tester), isFalse);
    });

    testWidgets('align: center centres the heading and the cells', (
      tester,
    ) async {
      await paint(tester, table());
      expect(
        find.ancestor(of: find.text('کد'), matching: find.byType(Align)),
        findsWidgets,
      );
      expect(
        find.ancestor(of: find.text('DB-1041'), matching: find.byType(Align)),
        findsWidgets,
      );
      final cell = tester.getRect(find.text('DB-1041'));
      final heading = tester.getRect(find.text('کد'));
      expect((cell.center.dx - heading.center.dx).abs(), lessThan(2));
    });
  });

  group('ToggleButtonGroup gets label and name', () {
    testWidgets(
      'a named group is a Form field, its label for a screen reader',
      (tester) async {
        Map<String, Object?>? payload;
        final refused = await paint(tester, {
          'type': 'Form',
          'actions': {
            'onSubmit': {'do': 'call', 'action': 'report.run'},
          },
          'children': [
            {
              'type': 'ToggleButtonGroup',
              'props': {
                'label': 'بازه',
                'name': 'span',
                'defaultSelectedKeys': ['week'],
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
            },
            {
              'type': 'Button',
              'props': {'type': 'submit'},
              'children': 'اجرا',
            },
          ],
        }, handlers: DibaHandlers(call: (a, p) => payload = p));
        expect(refused, isEmpty);
        // Hidden by default: in the semantics tree, not on the screen.
        expect(find.text('بازه'), findsNothing);
        expect(find.bySemanticsLabel('بازه'), findsOneWidget);

        await tester.tap(find.text('روز'));
        await tester.pump();
        await tester.tap(find.text('اجرا'));
        await tester.pumpAndSettle();
        expect(payload, {
          'span': ['day'],
        });
      },
    );

    testWidgets('a group without a label is refused, and still drawn', (
      tester,
    ) async {
      final refused = await paint(tester, {
        'type': 'ToggleButtonGroup',
        'children': [
          {
            'type': 'ToggleButton',
            'props': {'id': 'a'},
            'children': 'الف',
          },
        ],
      });
      expect(refused, ['ToggleButtonGroup: no label']);
      expect(find.text('الف'), findsOneWidget);
    });
  });

  group('the toast verb', () {
    testWidgets('a toast inside onAction is refused; the rest still runs', (
      tester,
    ) async {
      DibaToast? got;
      String? called;
      final refused = await paint(
        tester,
        {
          'type': 'Button',
          'children': 'حذف',
          'actions': {
            'onPress': {
              'do': 'toast',
              'title': 'حذف شد',
              'actionLabel': 'برگرداندن',
              'onAction': [
                {'do': 'toast', 'title': 'دوباره'},
                {'do': 'call', 'action': 'undo'},
              ],
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
      expect(refused, contains('toast: a toast inside onAction'));
      got!.onAction!();
      await tester.pump();
      expect(called, 'undo');
    });
  });

  group('toman', () {
    testWidgets('a NumberField in IRT shows «تومان»', (tester) async {
      await paint(tester, {
        'type': 'NumberField',
        'props': {
          'label': 'قیمت',
          'formatStyle': 'currency',
          'currency': 'IRT',
          'defaultValue': 1250000,
        },
      });
      // The figure in the field and the word beside it, as on the web.
      expect(find.text('۱٬۲۵۰٬۰۰۰'), findsOneWidget);
      expect(find.text('تومان'), findsOneWidget);
    });
  });

  group('icons', () {
    test('exactly the marked icons mirror', () {
      for (final MapEntry(:key, :value) in dibaIcons.entries) {
        expect(
          value.matchTextDirection,
          dibaMirroredIcons.contains(key),
          reason: key,
        );
      }
      expect(dibaMirroredIcons.every(dibaIcons.containsKey), isTrue);
    });
  });

  group("the admin's v3 look", () {
    testWidgets('a field\'s label sits above it, not inside', (tester) async {
      await paint(tester, {
        'type': 'TextField',
        'props': {'label': 'نام محصول', 'defaultValue': 'شال'},
      });
      final label = tester.getRect(find.text('نام محصول'));
      final field = tester.getRect(find.byType(TextField));
      expect(label.bottom, lessThanOrEqualTo(field.top));
      final decoration = tester
          .widget<TextField>(find.byType(TextField))
          .decoration!;
      expect(decoration.label, isNull);
      expect(decoration.labelText, isNull);
    });

    testWidgets('a field is the field-height token tall', (tester) async {
      await paint(tester, {
        'type': 'TextField',
        'props': {'label': 'نام', 'defaultValue': 'شال'},
      });
      expect(
        tester.getSize(find.byType(TextField)).height,
        moreOrLessEquals(DibaDimens.fieldHeightMd, epsilon: 1),
      );
    });

    testWidgets('a field with icons is no taller than one without', (
      tester,
    ) async {
      await paint(tester, {
        'type': 'Stack',
        'children': [
          {
            'type': 'DateField',
            'props': {'label': 'تاریخ', 'defaultValue': '2026-10-16'},
          },
          {
            'type': 'NumberField',
            'props': {'label': 'وزن', 'defaultValue': 1},
          },
          {
            'type': 'SearchField',
            'props': {'label': 'جستجو', 'defaultValue': 'شال'},
          },
        ],
      });
      final fields = find.byType(TextField);
      expect(fields, findsNWidgets(3));
      for (var i = 0; i < 3; i++) {
        expect(
          tester.getSize(fields.at(i)).height,
          moreOrLessEquals(DibaDimens.fieldHeightMd, epsilon: 1),
        );
      }
    });

    testWidgets('a Select is as tall as a text field', (tester) async {
      await paint(tester, {
        'type': 'Select',
        'props': {'label': 'روش ارسال', 'defaultSelectedKey': 'a'},
        'children': [
          {
            'type': 'ListBoxItem',
            'props': {'id': 'a'},
            'children': 'تیپاکس',
          },
        ],
      });
      expect(
        tester.getSize(find.byType(InputDecorator)).height,
        moreOrLessEquals(DibaDimens.fieldHeightMd, epsilon: 1),
      );
    });

    testWidgets('a text area still grows with its rows', (tester) async {
      await paint(tester, {
        'type': 'TextArea',
        'props': {'label': 'توضیح', 'rows': 4},
      });
      expect(
        tester.getSize(find.byType(TextField)).height,
        greaterThan(DibaDimens.fieldHeightMd * 2),
      );
    });

    testWidgets('a field with an error keeps its height, the error below', (
      tester,
    ) async {
      await paint(tester, {
        'type': 'TextField',
        'props': {'label': 'ایمیل', 'errorMessage': 'نشانی ایمیل درست نیست.'},
      });
      final field = tester.getRect(find.byType(EditableText));
      final error = tester.getRect(find.text('نشانی ایمیل درست نیست.'));
      expect(error.top, greaterThanOrEqualTo(field.bottom));
    });

    testWidgets('buttons are pills', (tester) async {
      await paint(tester, {
        'type': 'Button',
        'props': {'variant': 'primary'},
        'children': 'ذخیره',
      });
      final button = tester.widget<FilledButton>(find.byType(FilledButton));
      expect(button.style!.shape!.resolve({}), isA<StadiumBorder>());
    });

    test('the theme carries the status colours and white dialogs', () {
      final light = DibaTheme.light();
      final status = light.extension<DibaStatusColors>()!;
      expect(status.success.solid, DibaLightColors.success);
      expect(status.accent.solid, DibaLightColors.primary);
      expect(light.dialogTheme.backgroundColor, DibaLightNeutrals.surface);
      final disabled =
          light.inputDecorationTheme.disabledBorder!.borderSide.color;
      final enabled =
          light.inputDecorationTheme.enabledBorder!.borderSide.color;
      expect(disabled.a, lessThan(enabled.a));
      expect(DibaTheme.dark().extension<DibaStatusColors>(), isNotNull);
    });

    testWidgets('fullWidth: false takes the natural field width token', (
      tester,
    ) async {
      await paint(tester, {
        'type': 'TextField',
        'props': {'label': 'رمز', 'fullWidth': false},
      });
      expect(
        tester.getSize(find.byType(TextField)).width,
        DibaDimens.fieldWidth,
      );
    });
  });

  group("v3's heights", () {
    const sizes = {
      'sm': DibaDimens.controlHeightSm,
      'md': DibaDimens.controlHeightMd,
      'lg': DibaDimens.controlHeightLg,
    };

    test('the tokens are the admin\'s', () {
      expect(DibaDimens.fieldHeightMd, 36);
      expect(sizes.values, [32, 36, 40]);
    });

    for (final MapEntry(key: size, value: height) in sizes.entries) {
      testWidgets('a $size button is $height tall', (tester) async {
        await paint(tester, {
          'type': 'Button',
          'props': {'variant': 'primary', 'size': size},
          'children': 'ذخیره',
        });
        expect(tester.getSize(find.byType(FilledButton)).height, height);
      });

      /// An attached group is v3's buttons side by side, each a button's
      /// height.
      testWidgets('an attached $size group is $height tall', (tester) async {
        await paint(tester, {
          'type': 'ToggleButtonGroup',
          'props': {'label': 'بازه', 'isDetached': false, 'size': size},
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
        });
        for (final toggle in tester.widgetList(find.byType(FilledButton))) {
          expect(tester.getSize(find.byWidget(toggle)).height, height);
        }
      });
    }
  });
}
