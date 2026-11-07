import 'package:diba/diba.dart';
import 'package:diba/src/sdui/glyphs.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// A table's selection boxes are named as React Aria names the web's: "select
/// all" in the head, and "select" with the row's header in a row, never its
/// id. A sorted column at the end keeps its words over its figures, the
/// chevron 4 before them, as the web's.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    String lang = 'fa',
  }) async {
    tester.view
      ..physicalSize = const Size(900, 600)
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
            child: DibaSurface(tree: tree),
          ),
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 300));
  }

  Map<String, Object?> cell(String text) => {'type': 'Cell', 'children': text};

  Map<String, Object?> orders({
    required String order,
    required String total,
    bool sortable = false,
  }) => {
    'type': 'Table',
    'props': {
      'label': 'سفارش‌ها',
      'selectionMode': 'multiple',
      'defaultSortColumn': 'total',
      'defaultSortDirection': 'descending',
    },
    'children': [
      {
        'type': 'TableHeader',
        'children': [
          {
            'type': 'Column',
            'props': {'id': 'order', 'isRowHeader': true},
            'children': order,
          },
          {
            'type': 'Column',
            'props': {'id': 'buyer'},
            'children': 'خریدار',
          },
          {
            'type': 'Column',
            'props': {'id': 'total', 'align': 'end', 'allowsSorting': sortable},
            'children': total,
          },
        ],
      },
      {
        'type': 'TableBody',
        'children': [
          {
            'type': 'Row',
            'props': {'id': '7c2e91a4-0b5d-4f1e-9a63-2d8f5c1e0b47'},
            'children': [
              cell('۱۰۴۱'),
              cell('نیلوفر رستمی'),
              cell('۱٬۲۸۰٬۰۰۰ تومان'),
            ],
          },
        ],
      },
    ],
  };

  for (final (lang, all, row) in [
    ('fa', 'انتخاب همه', 'انتخاب ۱۰۴۱'),
    ('en', 'Select All', 'Select ۱۰۴۱'),
  ]) {
    testWidgets('$lang: the boxes are "$all" and "$row", never the row’s id', (
      tester,
    ) async {
      final semantics = tester.ensureSemantics();
      await paint(
        tester,
        orders(order: 'سفارش', total: 'مبلغ'),
        lang: lang,
      );
      expect(find.bySemanticsLabel(all), findsOneWidget);
      expect(find.bySemanticsLabel(row), findsOneWidget);
      expect(find.bySemanticsLabel(RegExp('7c2e91a4')), findsNothing);
      expect(
        tester
            .widgetList<Checkbox>(find.byType(Checkbox))
            .map((box) => box.semanticLabel),
        [all, row],
      );
      semantics.dispose();
    });
  }

  for (final lang in ['fa', 'en']) {
    testWidgets('$lang: a sorted column at the end has its words over its '
        'figures, the chevron 4 before them', (tester) async {
      await paint(
        tester,
        orders(order: 'سفارش', total: 'مبلغ', sortable: true),
        lang: lang,
      );
      final rtl = lang == 'fa';
      final words = tester.getRect(find.text('مبلغ'));
      final figures = tester.getRect(find.text('۱٬۲۸۰٬۰۰۰ تومان'));
      final chevron = tester.getRect(find.byType(DibaGlyphMark).last);
      if (rtl) {
        expect(words.left, closeTo(figures.left, 0.5));
        expect(chevron.left - words.right, closeTo(4, 0.5));
      } else {
        expect(words.right, closeTo(figures.right, 0.5));
        expect(words.left - chevron.right, closeTo(4, 0.5));
      }
    });
  }

  testWidgets('a sorted column at the start keeps its chevron at its end', (
    tester,
  ) async {
    await paint(tester, {
      'type': 'Table',
      'props': {
        'label': 'سفارش‌ها',
        'defaultSortColumn': 'order',
        'defaultSortDirection': 'ascending',
      },
      'children': [
        {
          'type': 'TableHeader',
          'children': [
            {
              'type': 'Column',
              'props': {
                'id': 'order',
                'isRowHeader': true,
                'allowsSorting': true,
              },
              'children': 'سفارش',
            },
            {
              'type': 'Column',
              'props': {'id': 'buyer'},
              'children': 'خریدار',
            },
          ],
        },
        {
          'type': 'TableBody',
          'children': [
            {
              'type': 'Row',
              'props': {'id': 'a'},
              'children': [cell('۱۰۴۱'), cell('نیلوفر رستمی')],
            },
          ],
        },
      ],
    });
    // A Persian page: the words at the right of their heading, the chevron
    // at its left, well apart.
    final words = tester.getRect(find.text('سفارش'));
    final chevron = tester.getRect(find.byType(DibaGlyphMark).last);
    expect(chevron.right, lessThan(words.left - 8));
  });
}
