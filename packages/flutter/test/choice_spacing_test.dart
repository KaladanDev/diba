import 'package:diba/diba.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// Checkbox and radio rows take Diba's spacing, the web's, on both platforms
///: the box flush with the option's start, the words 12
/// on, the description 4 under them in line with the words, rows 24 apart
/// down a group and 16 across, the first 16 under the group's label, and the
/// group's description straight under its options. The numbers are the web's,
/// measured on the web.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    String lang = 'en',
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
            child: DibaSurface(tree: tree),
          ),
        ),
      ),
    );
    await tester.pump();
  }

  /// The box as drawn: the square the control is laid out in.
  Rect box(WidgetTester tester, Finder control) => tester.getRect(
    find.ancestor(of: control, matching: find.byType(OverflowBox)).first,
  );

  /// The whole option, the one target.
  Rect option(WidgetTester tester, Finder control) => tester.getRect(
    find.ancestor(of: control, matching: find.byType(MergeSemantics)).first,
  );

  Rect words(WidgetTester tester, String text) =>
      tester.getRect(find.text(text));

  final checkbox = {
    'type': 'Checkbox',
    'props': {'label': 'Insure the parcel', 'description': 'Up to 50M toman'},
  };

  Map<String, Object?> radios({String? orientation, String? description}) => {
    'type': 'RadioGroup',
    'props': {
      'label': 'Shipping',
      'orientation': ?orientation,
      'description': ?description,
    },
    'children': [
      {
        'type': 'Radio',
        'props': {'value': 'tipax', 'label': 'Tipax', 'description': '2 days'},
      },
      {
        'type': 'Radio',
        'props': {'value': 'post', 'label': 'Post'},
      },
    ],
  };

  group('an option', () {
    testWidgets('a checkbox: flush, its words 30 on, its line 24 down', (
      tester,
    ) async {
      await paint(tester, checkbox);
      final control = find.byType(Checkbox);
      final b = box(tester, control);
      final o = option(tester, control);
      final label = words(tester, 'Insure the parcel');
      final below = words(tester, 'Up to 50M toman');

      expect(b.size, const Size(18, 18));
      expect(b.left, o.left);
      expect(label.left - b.left, 30);
      expect(label.height, 20);
      expect(b.top - label.top, 1);
      expect(below.top - label.top, 24);
      expect(below.left - b.left, 28);
      expect(below.height, 16);
      expect(o.height, 40);
    });

    testWidgets('a radio: its box 16, its words 28 on', (tester) async {
      await paint(tester, radios());
      final control = find.byType(Radio<String>).first;
      final b = box(tester, control);
      final label = words(tester, 'Tipax');

      expect(b.size, const Size(16, 16));
      expect(b.left, option(tester, control).left);
      expect(label.left - b.left, 28);
      expect(b.top - label.top, 2);
      expect(words(tester, '2 days').top - label.top, 24);
      expect(words(tester, '2 days').left - b.left, 28);
    });

    testWidgets('right to left: flush with the right', (tester) async {
      await paint(tester, checkbox, lang: 'fa');
      final control = find.byType(Checkbox);
      final b = box(tester, control);

      expect(b.right, option(tester, control).right);
      expect(b.left - words(tester, 'Insure the parcel').right, 12);
      expect(b.right - words(tester, 'Up to 50M toman').right, 28);
    });

    testWidgets('only the box takes a press past the row, not its circle', (
      tester,
    ) async {
      await paint(tester, checkbox);
      final b = box(tester, find.byType(Checkbox));
      // Above the 20 row, inside the 40 circle that once took it.
      await tester.tapAt(b.center.translate(0, -15));
      await tester.pump();
      expect(tester.widget<Checkbox>(find.byType(Checkbox)).value, isFalse);
      await tester.tapAt(b.center);
      await tester.pump();
      expect(tester.widget<Checkbox>(find.byType(Checkbox)).value, isTrue);
    });

    testWidgets('in a wrapping row: side by side, 12 apart, as on the web', (
      tester,
    ) async {
      await paint(tester, {
        'type': 'Stack',
        'props': {
          'direction': 'horizontal',
          'gap': 3,
          'wrap': true,
          'align': 'center',
        },
        'children': [
          for (final label in ['Newsletter', 'Text messages'])
            {
              'type': 'Checkbox',
              'props': {'label': label},
            },
        ],
      });
      final first = option(tester, find.byType(Checkbox).first);
      final second = option(tester, find.byType(Checkbox).last);
      expect(second.top, first.top);
      expect(second.left - first.right, 12);
    });

    testWidgets('a checkbox with its label hidden: the box alone', (
      tester,
    ) async {
      await paint(tester, {
        'type': 'Checkbox',
        'props': {'label': 'Pick', 'isLabelHidden': true},
      });
      expect(box(tester, find.byType(Checkbox)).size, const Size(18, 18));
    });
  });

  group('a group', () {
    testWidgets('down: 16 under its label, rows 24 apart, then its line', (
      tester,
    ) async {
      await paint(tester, radios(description: 'Both insured'));
      final first = option(tester, find.byType(Radio<String>).first);
      final second = option(tester, find.byType(Radio<String>).last);

      expect(first.top - words(tester, 'Shipping').bottom, 16);
      expect(first.height, 40);
      expect(second.top - first.bottom, 24);
      expect(second.height, 20);
      expect(words(tester, 'Both insured').top, second.bottom);
    });

    testWidgets('across: 16 apart, on one line 16 under its label', (
      tester,
    ) async {
      await paint(tester, radios(orientation: 'horizontal'));
      final first = option(tester, find.byType(Radio<String>).first);
      final second = option(tester, find.byType(Radio<String>).last);

      expect(second.left - first.right, 16);
      expect(second.top, first.top);
      expect(first.top - words(tester, 'Shipping').bottom, 16);
    });

    testWidgets('a checkbox group keeps the same rhythm', (tester) async {
      await paint(tester, {
        'type': 'CheckboxGroup',
        'props': {'label': 'Sizes', 'description': 'Pick any'},
        'children': [
          {
            'type': 'Checkbox',
            'props': {'label': 'Small', 'value': 's'},
          },
          {
            'type': 'Checkbox',
            'props': {'label': 'Large', 'value': 'l'},
          },
        ],
      });
      final first = option(tester, find.byType(Checkbox).first);
      final second = option(tester, find.byType(Checkbox).last);

      expect(first.top - words(tester, 'Sizes').bottom, 16);
      expect(second.top - first.bottom, 24);
      expect(words(tester, 'Pick any').top, second.bottom);
    });
  });
}
