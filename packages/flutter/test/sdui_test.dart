import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:diba/diba.dart';
import 'package:diba/src/sdui/date_calendar.dart';

/// The renderer is the trust boundary.
///
/// Deliberately the same cases as `packages/react/src/sdui/sdui.test.tsx`, in
/// the same order. Two renderers that disagree about what a tree may do is a
/// security bug on whichever one is more generous, so the cheapest way to keep
/// them honest is to ask them the same questions.
void main() {
  /// A panel of the kind an extension would actually send.
  Map<String, Object?> shippingPanel() => {
    'type': 'Stack',
    'props': {'direction': 'vertical', 'gap': 4},
    'children': [
      {
        'type': 'Text',
        'props': {'weight': 'bold'},
        'children': 'برچسب ارسال',
      },
      {
        'type': 'TextField',
        'props': {'label': 'وزن بسته'},
        'actions': {
          'onChange': {'do': 'setState', 'key': 'weight'},
        },
      },
      {
        'type': 'Button',
        'props': {'variant': 'primary'},
        'children': 'چاپ برچسب',
        'actions': {
          'onPress': {
            'do': 'call',
            'action': 'label.print',
            'with': ['weight'],
          },
        },
      },
    ],
  };

  Future<List<String>> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    DibaHandlers handlers = const DibaHandlers(),
  }) async {
    final refused = <String>[];
    await tester.pumpWidget(
      MaterialApp(
        theme: DibaTheme.light(),
        home: Directionality(
          textDirection: TextDirection.rtl,
          child: Scaffold(
            body: SingleChildScrollView(
              child: DibaSurface(
                tree: tree,
                handlers: handlers,
                onRefuse: refused.add,
              ),
            ),
          ),
        ),
      ),
    );
    return refused;
  }

  group('the registry against the manifest', () {
    test('every builder names a component the contract has', () {
      final orphans = dibaRegistry.keys
          .where((k) => !dibaManifest.containsKey(k))
          .toList();
      expect(orphans, isEmpty, reason: 'builder that can never be reached');
    });

    /// Every component in the contract now has a widget.
    ///
    /// RangeCalendar was the last one out, on the grounds that Material has no
    /// inline range calendar and faking one would be worse than saying so.
    /// Writing the Jalali grid made it a few lines rather than a project, which
    /// is the second time this list shrank as a side effect of something else.
    test('every component in the contract has a widget', () {
      final missing = dibaManifest.keys
          .where((k) => !dibaRegistry.containsKey(k))
          .toSet();
      expect(missing, isEmpty);
    });
  });

  group('DibaSurface renders a tree', () {
    testWidgets('walks it and puts real Material widgets on screen', (
      tester,
    ) async {
      await paint(tester, shippingPanel());
      expect(find.text('برچسب ارسال'), findsOneWidget);
      expect(find.byType(FilledButton), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
    });

    testWidgets('refuses a component it does not know', (tester) async {
      final refused = await paint(tester, {'type': 'Malware', 'props': {}});
      expect(refused, ['unknown component: Malware']);
    });

    testWidgets(
      'says so when the contract has a component and Flutter has not',
      // The example comes from the real gap rather than being named. Hardcoding
      // one meant this failed the day that component got a widget, which is a
      // test breaking on good news — Rating was the first to do it.
      (tester) async {
        final missing = dibaManifest.keys.where(
          (k) => !dibaRegistry.containsKey(k),
        );
        if (missing.isEmpty) return; // everything is covered: nothing to say
        final name = missing.first;
        final refused = await paint(tester, {'type': name, 'props': {}});
        expect(refused, ['no Flutter widget for: $name']);
      },
    );
  });

  group('DibaSurface refuses what the manifest never promised', () {
    testWidgets('drops a prop the component does not declare', (tester) async {
      final refused = await paint(tester, {
        'type': 'Text',
        'props': {'weight': 'bold', 'onTap': 'x'},
        'children': 'سلام',
      });
      expect(refused, contains('Text: undeclared prop "onTap"'));
      expect(find.text('سلام'), findsOneWidget);
    });

    testWidgets('drops an event the component does not declare', (
      tester,
    ) async {
      final refused = await paint(tester, {
        'type': 'Text',
        'children': 'سلام',
        'actions': {
          'onPress': {'do': 'call', 'action': 'x'},
        },
      });
      expect(refused, contains('Text: undeclared action "onPress"'));
    });

    /// URLs are guarded by prop, not by value. A text prop is text,
    /// whatever it looks like; the by-value guard refused "Warning: stock is
    /// low" in any prop.
    testWidgets('a plain prop is text, whatever it looks like', (tester) async {
      final refused = await paint(tester, {
        'type': 'Stack',
        'children': [
          {
            'type': 'TextField',
            'props': {
              'label': 'x',
              'value': 'javascript:alert(1)',
              'isReadOnly': true,
            },
          },
          {
            'type': 'Alert',
            'props': {'status': 'warning', 'title': 'Warning: stock is low'},
          },
          {
            'type': 'ListBox',
            'props': {'label': 'x', 'selectionMode': 'none'},
            'children': [
              {
                'type': 'ListBoxItem',
                'props': {'id': 'sku:123'},
                'children': 'Re: your order',
              },
            ],
          },
        ],
      });
      expect(refused, isEmpty);
      expect(find.text('Warning: stock is low'), findsOneWidget);
      expect(find.text('javascript:alert(1)'), findsOneWidget);
      expect(find.text('Re: your order'), findsOneWidget);
    });

    testWidgets('a URL prop is held to its format', (tester) async {
      final refused = await paint(tester, {
        'type': 'Stack',
        'children': [
          {
            'type': 'Avatar',
            'props': {'name': 'x', 'src': 'mailto:a@b.c'},
          },
          {
            'type': 'Tag',
            'props': {'id': 't', 'href': 'javascript:alert(1)'},
          },
          {
            'type': 'Avatar',
            'props': {'name': 'y', 'src': 'https://cdn.kaladan.dev/a.png'},
          },
        ],
      });
      // mailto: is a fine link and no picture: Avatar src is an image-url.
      expect(refused, [
        'Avatar: refused value for "src"',
        'Tag: refused value for "href"',
      ]);
    });

    testWidgets('refuses an oversized tree entirely', (tester) async {
      Map<String, Object?> deep = {'type': 'Text', 'children': 'x'};
      for (var i = 0; i < 40; i++) {
        deep = {
          'type': 'Stack',
          'children': [deep],
        };
      }
      final refused = await paint(tester, deep);
      expect(refused.first, contains('deeper than'));
      expect(find.text('x'), findsNothing);
    });
  });

  group('DibaSurface and the verbs', () {
    testWidgets('keeps setState local — no host call', (tester) async {
      final calls = <String>[];
      await paint(
        tester,
        shippingPanel(),
        handlers: DibaHandlers(call: (a, p) => calls.add(a)),
      );
      await tester.enterText(find.byType(TextField), '۲');
      await tester.pump();
      expect(calls, isEmpty);
    });

    testWidgets('sends a call with only the state the action asked for', (
      tester,
    ) async {
      Map<String, Object?>? payload;
      String? action;
      await paint(
        tester,
        shippingPanel(),
        handlers: DibaHandlers(
          call: (a, p) {
            action = a;
            payload = p;
          },
        ),
      );
      await tester.enterText(find.byType(TextField), '۲');
      await tester.pump();
      await tester.tap(find.byType(FilledButton));
      await tester.pump();

      expect(action, 'label.print');
      expect(payload, {'weight': '۲'});
    });

    testWidgets('does not hand the extension state it did not name', (
      tester,
    ) async {
      final tree = shippingPanel();
      final button = (tree['children'] as List)[2] as Map<String, Object?>;
      ((button['actions'] as Map)['onPress'] as Map).remove('with');

      Map<String, Object?>? payload;
      await paint(
        tester,
        tree,
        handlers: DibaHandlers(call: (a, p) => payload = p),
      );
      await tester.enterText(find.byType(TextField), '۲');
      await tester.pump();
      await tester.tap(find.byType(FilledButton));
      await tester.pump();

      expect(payload, isEmpty);
    });

    testWidgets('follows a navigate the host can trust', (tester) async {
      String? went;
      await paint(tester, {
        'type': 'Button',
        'children': 'برو',
        'actions': {
          'onPress': {'do': 'navigate', 'to': '/orders/DB-1041'},
        },
      }, handlers: DibaHandlers(navigate: (to) => went = to));
      await tester.tap(find.byType(FilledButton));
      await tester.pump();
      expect(went, '/orders/DB-1041');
    });

    testWidgets('refuses a navigate that is really a script', (tester) async {
      String? went;
      final refused = await paint(tester, {
        'type': 'Button',
        'children': 'برو',
        'actions': {
          'onPress': {'do': 'navigate', 'to': 'javascript:alert(1)'},
        },
      }, handlers: DibaHandlers(navigate: (to) => went = to));
      await tester.tap(find.byType(FilledButton));
      await tester.pump();
      expect(went, isNull);
      expect(refused.first, contains('refused URL'));
    });

    testWidgets('asks the host to open something by name', (tester) async {
      String? opened;
      await paint(tester, {
        'type': 'Button',
        'children': 'راهنما',
        'actions': {
          'onPress': {'do': 'open', 'target': 'help.shipping'},
        },
      }, handlers: DibaHandlers(open: (t) => opened = t));
      await tester.tap(find.byType(FilledButton));
      await tester.pump();
      expect(opened, 'help.shipping');
    });

    /// A checkbox is controlled in Flutter, so the renderer has to hold its
    /// value as well as report it. The React side leaves inputs uncontrolled;
    /// what both must agree on is the payload.
    testWidgets('a checkbox ticks and reports', (tester) async {
      Map<String, Object?>? payload;
      await paint(tester, {
        'type': 'Stack',
        'children': [
          {
            'type': 'Checkbox',
            'props': {'label': 'بیمه'},
            'actions': {
              'onChange': {'do': 'setState', 'key': 'insured'},
            },
          },
          {
            'type': 'Button',
            'children': 'ثبت',
            'actions': {
              'onPress': {
                'do': 'call',
                'action': 'submit',
                'with': ['insured'],
              },
            },
          },
        ],
      }, handlers: DibaHandlers(call: (a, p) => payload = p));

      expect(tester.widget<Checkbox>(find.byType(Checkbox)).value, false);
      await tester.tap(find.byType(Checkbox));
      await tester.pump();
      expect(tester.widget<Checkbox>(find.byType(Checkbox)).value, true);

      await tester.tap(find.byType(FilledButton));
      await tester.pump();
      expect(payload, {'insured': true});
    });
  });

  /// Link and Image are the first components to carry a URL, so the guard that
  /// has been unit-tested since the start finally has a path through a widget.
  group('a URL in a tree goes through the guard', () {
    testWidgets('a link the host can trust reaches navigate', (tester) async {
      String? went;
      await paint(tester, {
        'type': 'Link',
        'props': {'href': '/orders/DB-1041'},
        'children': 'سفارش',
      }, handlers: DibaHandlers(navigate: (to) => went = to));
      await tester.tap(find.text('سفارش'));
      await tester.pump();
      expect(went, '/orders/DB-1041');
    });

    testWidgets('a link that is really a script never renders its href', (
      tester,
    ) async {
      String? went;
      final refused = await paint(tester, {
        'type': 'Link',
        'props': {'href': 'javascript:alert(1)'},
        'children': 'سفارش',
      }, handlers: DibaHandlers(navigate: (to) => went = to));
      expect(refused, contains('Link: refused value for "href"'));
      await tester.tap(find.text('سفارش'));
      await tester.pump();
      expect(went, isNull);
    });

    testWidgets('an image src is held to the same rule', (tester) async {
      final refused = await paint(tester, {
        'type': 'Image',
        'props': {'src': 'javascript:alert(1)', 'alt': 'x'},
      });
      expect(refused, contains('Image: refused value for "src"'));
    });
  });

  group('the components a panel actually needs', () {
    testWidgets('a Select offers its items and reports the choice', (
      tester,
    ) async {
      Map<String, Object?>? payload;
      await paint(tester, {
        'type': 'Stack',
        'children': [
          {
            'type': 'Select',
            'props': {'label': 'سرویس'},
            'children': [
              {
                'type': 'ListBoxItem',
                'props': {'id': 'tipax'},
                'children': 'تیپاکس',
              },
              {
                'type': 'ListBoxItem',
                'props': {'id': 'post'},
                'children': 'پست',
              },
            ],
            'actions': {
              'onSelectionChange': {'do': 'setState', 'key': 'carrier'},
            },
          },
          {
            'type': 'Button',
            'children': 'ثبت',
            'actions': {
              'onPress': {
                'do': 'call',
                'action': 'submit',
                'with': ['carrier'],
              },
            },
          },
        ],
      }, handlers: DibaHandlers(call: (a, p) => payload = p));

      await tester.tap(find.byType(InputDecorator));
      await tester.pumpAndSettle();
      await tester.tap(find.text('پست').last);
      await tester.pumpAndSettle();
      await tester.tap(find.byType(FilledButton));
      await tester.pump();

      expect(payload, {'carrier': 'post'});
    });

    testWidgets('a RadioGroup reports the option chosen', (tester) async {
      Map<String, Object?>? payload;
      await paint(tester, {
        'type': 'Stack',
        'children': [
          {
            'type': 'RadioGroup',
            'props': {'label': 'اندازه'},
            'children': [
              {
                'type': 'Radio',
                'props': {'value': 'sm', 'label': 'کوچک'},
              },
              {
                'type': 'Radio',
                'props': {'value': 'lg', 'label': 'بزرگ'},
              },
            ],
            'actions': {
              'onChange': {'do': 'setState', 'key': 'size'},
            },
          },
          {
            'type': 'Button',
            'children': 'ثبت',
            'actions': {
              'onPress': {
                'do': 'call',
                'action': 'submit',
                'with': ['size'],
              },
            },
          },
        ],
      }, handlers: DibaHandlers(call: (a, p) => payload = p));

      await tester.tap(find.byType(Radio<String>).last);
      await tester.pump();
      await tester.tap(find.byType(FilledButton));
      await tester.pump();

      expect(payload, {'size': 'lg'});
    });
  });

  /// Slots are the third thing a node can carry, beside props and children, and
  /// the codegen dropped them for the whole of the project's life so far. The
  /// visible cost was this: every overlay in a tree had a trigger declared in
  /// the manifest, no way to express it, and so nothing a merchant could reach.
  group('slots', () {
    Map<String, Object?> dialog() => {
      'type': 'Modal',
      'props': {'title': 'تأیید حذف'},
      'slots': {
        'trigger': {'type': 'Button', 'children': 'حذف'},
      },
      'children': [
        {'type': 'Text', 'children': 'این کار بازگشت‌پذیر نیست.'},
      ],
    };

    testWidgets('a trigger opens the overlay it belongs to', (tester) async {
      await paint(tester, dialog());
      expect(find.text('حذف'), findsOneWidget);
      expect(find.text('این کار بازگشت‌پذیر نیست.'), findsNothing);

      await tester.tap(find.text('حذف'));
      await tester.pumpAndSettle();

      expect(find.text('تأیید حذف'), findsOneWidget);
      expect(find.text('این کار بازگشت‌پذیر نیست.'), findsOneWidget);
    });

    testWidgets('a slot the component does not declare is refused', (
      tester,
    ) async {
      final refused = await paint(tester, {
        'type': 'Modal',
        'props': {'title': 'حذف'},
        'slots': {
          'trigger': {'type': 'Button', 'children': 'حذف'},
          'sidecar': {'type': 'Text', 'children': 'x'},
        },
      });
      expect(refused, contains('Modal: undeclared slot "sidecar"'));
      expect(find.text('x'), findsNothing);
    });

    testWidgets('a node in a slot is refused on the same terms as any other', (
      tester,
    ) async {
      final refused = await paint(tester, {
        'type': 'Card',
        'slots': {
          'footer': {'type': 'Malware'},
        },
      });
      expect(refused, contains('unknown component: Malware'));
    });
  });

  group('the components an admin panel is made of', () {
    testWidgets('a Table lays out its header and rows', (tester) async {
      await paint(tester, {
        'type': 'Table',
        'props': {'label': 'سفارش‌ها'},
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
                'props': {'id': 'total'},
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
                  {'type': 'Cell', 'children': 'DB-1041'},
                  {'type': 'Cell', 'children': '۱٬۲۴۰٬۰۰۰'},
                ],
              },
            ],
          },
        ],
      });

      expect(find.byType(Table), findsOneWidget);
      expect(find.text('کد'), findsOneWidget);
      expect(find.text('DB-1041'), findsOneWidget);
      expect(find.text('۱٬۲۴۰٬۰۰۰'), findsOneWidget);
    });

    testWidgets('Tabs shows its labels and the first panel', (tester) async {
      await paint(tester, {
        'type': 'Tabs',
        'children': [
          {
            'type': 'Tab',
            'props': {'id': 'a', 'label': 'سفارش‌ها'},
            'children': [
              {'type': 'Text', 'children': 'محتوای یک'},
            ],
          },
          {
            'type': 'Tab',
            'props': {'id': 'b', 'label': 'ارسال'},
            'children': [
              {'type': 'Text', 'children': 'محتوای دو'},
            ],
          },
        ],
      });
      await tester.pumpAndSettle();

      expect(find.text('سفارش‌ها'), findsOneWidget);
      expect(find.text('ارسال'), findsOneWidget);
      expect(find.text('محتوای یک'), findsOneWidget);
    });
  });

  /// The place the two platforms nearly could not agree: `calendarSystem`
  /// defaults to `auto`, which on a Persian page means Jalali, and Material
  /// has none. Diba's own calendar draws both, and every date
  /// leaves as Gregorian ISO 8601 whatever was drawn.
  group('dates are drawn in the calendar that was asked for', () {
    testWidgets('auto follows the page: Gregorian on an English one', (
      tester,
    ) async {
      final refused = await paint(tester, {
        'type': 'Calendar',
        'props': {'defaultValue': '2026-10-22'},
      });
      expect(refused, isEmpty);
      expect(find.byType(DibaDateCalendar), findsOneWidget);
      expect(find.text('October 2026'), findsOneWidget);
    });

    testWidgets('persian draws Jalali months on any page', (tester) async {
      await paint(tester, {
        'type': 'Calendar',
        'props': {'calendarSystem': 'persian', 'defaultValue': '2026-10-22'},
      });
      expect(find.text('Mehr 1405'), findsOneWidget);
    });

    testWidgets('a RangeCalendar is the same calendar, picking a range', (
      tester,
    ) async {
      final refused = await paint(tester, {
        'type': 'RangeCalendar',
        'props': {
          'defaultValue': ['2026-10-22', '2026-10-24'],
        },
      });
      expect(refused, isEmpty);
      expect(find.byType(DibaDateCalendar), findsOneWidget);
    });

    testWidgets('a DateRangePicker reports Gregorian dates', (tester) async {
      Map<String, Object?>? payload;
      await paint(tester, {
        'type': 'Stack',
        'children': [
          {
            'type': 'DateRangePicker',
            'props': {
              'label': 'بازه',
              'defaultValue': ['2026-10-22', '2026-10-24'],
            },
            'actions': {
              'onChange': {'do': 'setState', 'key': 'when'},
            },
          },
          {
            'type': 'Button',
            'children': 'ثبت',
            'actions': {
              'onPress': {
                'do': 'call',
                'action': 'submit',
                'with': ['when'],
              },
            },
          },
        ],
      }, handlers: DibaHandlers(call: (a, p) => payload = p));

      await tester.tap(find.byType(TextField));
      await tester.pumpAndSettle();
      expect(find.byType(DibaDateCalendar), findsOneWidget);
      // The first, then the last, in either order.
      await tester.tap(find.text('18').last);
      await tester.pumpAndSettle();
      await tester.tap(find.text('15').last);
      await tester.pumpAndSettle();
      expect(find.byType(DibaDateCalendar), findsNothing);
      await tester.tap(find.text('ثبت'));
      await tester.pump();
      expect(payload!['when'], ['2026-10-15', '2026-10-18']);
    });
  });

  group('the floating components', () {
    testWidgets('a Tooltip wraps what it describes', (tester) async {
      await paint(tester, {
        'type': 'Tooltip',
        'props': {'content': 'راهنما'},
        'children': [
          {'type': 'Text', 'children': 'قیمت'},
        ],
      });
      expect(find.byType(Tooltip), findsOneWidget);
      expect(find.text('قیمت'), findsOneWidget);
    });

    /// `call` carries the event's own value under the key it names, so
    /// one action tells the extension which item was pressed.
    testWidgets('a Dropdown sends the pressed item with its call', (
      tester,
    ) async {
      String? action;
      Map<String, Object?>? payload;
      await paint(
        tester,
        {
          'type': 'Dropdown',
          'slots': {
            'trigger': {'type': 'Button', 'children': 'بیشتر'},
          },
          'children': [
            {
              'type': 'DropdownItem',
              'props': {'id': 'archive'},
              'children': 'بایگانی',
            },
          ],
          'actions': {
            'onAction': {'do': 'call', 'action': 'order.menu', 'value': 'item'},
          },
        },
        handlers: DibaHandlers(
          call: (a, p) {
            action = a;
            payload = p;
          },
        ),
      );

      expect(find.text('بایگانی'), findsNothing);
      await tester.tap(find.text('بیشتر'));
      await tester.pumpAndSettle();
      expect(find.text('بایگانی'), findsOneWidget);

      await tester.tap(find.text('بایگانی'));
      await tester.pumpAndSettle();
      expect(find.text('بایگانی'), findsNothing);
      expect(action, 'order.menu');
      expect(payload, {'item': 'archive'});
    });
  });

  group('the guards on their own', () {
    test('isSafeUrl', () {
      expect(isSafeUrl('/orders/1'), isTrue);
      expect(isSafeUrl('#top'), isTrue);
      expect(isSafeUrl('https://kaladan.dev'), isTrue);
      expect(isSafeUrl('mailto:a@b.c'), isTrue);
      expect(isSafeUrl('javascript:alert(1)'), isFalse);
      expect(isSafeUrl('JavaScript:alert(1)'), isFalse);
      expect(isSafeUrl('  javascript:alert(1)'), isFalse);
      expect(isSafeUrl('data:text/html,<script>'), isFalse);
      expect(isSafeUrl('vbscript:msgbox'), isFalse);
    });

    /// Tested directly: left to the renderer it was a guard that could be
    /// deleted with no test noticing.
    test('serialisableValue keeps only what can safely be sent', () {
      expect(serialisableValue('۲'), '۲');
      expect(serialisableValue(3), 3);
      expect(serialisableValue(true), true);
      expect(serialisableValue({'a', 'b'}), ['a', 'b']);
      // A range slider's two numbers stay numbers.
      expect(serialisableValue([10.0, 50]), [10.0, 50]);
      // A Table's sort is a flat map; anything nested is dropped.
      expect(
        serialisableValue({
          'column': 'total',
          'direction': 'descending',
          'x': Object(),
        }),
        {'column': 'total', 'direction': 'descending'},
      );
      expect(serialisableValue([Object(), 'a']), ['a']);
      expect(serialisableValue(Object()), isNull);
      expect(serialisableValue(DateTime(2026)), isNull);
      expect(serialisableValue(null), isNull);
    });

    test('isSafeImageUrl is narrower than isSafeUrl', () {
      expect(isSafeImageUrl('https://cdn.kaladan.dev/a.png'), isTrue);
      expect(isSafeImageUrl('/media/a.png'), isTrue);
      expect(isSafeImageUrl('data:image/png;base64,AAAA'), isTrue);
      expect(isSafeImageUrl('mailto:a@b.c'), isFalse);
      expect(isSafeImageUrl('javascript:alert(1)'), isFalse);
      expect(isSafeImageUrl(''), isFalse);
    });

    test('checkTree counts what is in slots, too', () {
      Map<String, Object?> nested = {'type': 'Text', 'children': 'x'};
      for (var i = 0; i < 40; i++) {
        nested = {
          'type': 'Popover',
          'slots': {'trigger': nested},
        };
      }
      expect(checkTree(nested), contains('deeper than'));
    });

    test('checkTree counts nodes, not just depth', () {
      final wide = {
        'type': 'Stack',
        'children': List.generate(40, (_) => {'type': 'Text', 'children': 'x'}),
      };
      expect(checkTree(wide, const DibaLimits(nodes: 10)), isNotNull);
      expect(checkTree(wide, const DibaLimits(nodes: 100)), isNull);
    });
  });
}
