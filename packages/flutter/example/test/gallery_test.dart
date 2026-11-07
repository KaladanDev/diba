import 'package:diba/diba.dart';
import 'package:diba_gallery/samples.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// Every sample tree renders in both languages without a refusal.
void main() {
  test('the gallery covers every approved block', () {
    const approved = {
      'Button',
      'LinkButton',
      'ToggleButtonGroup',
      'ToggleButton',
      'Link',
      'TextField',
      'TextArea',
      'SearchField',
      'NumberField',
      'DateField',
      'Select',
      'ComboBox',
      'ListBox',
      'ListBoxItem',
      'ListBoxSection',
      'Dropdown',
      'DropdownItem',
      'DropdownSection',
      'Checkbox',
      'CheckboxGroup',
      'RadioGroup',
      'Radio',
      'Switch',
      'Slider',
      'Alert',
      'Chip',
      'TagGroup',
      'Tag',
      'Spinner',
      'ProgressBar',
      'Avatar',
      'AvatarGroup',
      'Card',
      'Table',
      'TableHeader',
      'TableBody',
      'TableFooter',
      'Column',
      'Row',
      'Cell',
      'Modal',
      'AlertDialog',
      'Popover',
      'Form',
    };
    final seen = <String>{};
    void walk(Object? node) {
      if (node is! Map) return;
      if (node['type'] is String) seen.add(node['type'] as String);
      final children = node['children'];
      if (children is List) children.forEach(walk);
      final slots = node['slots'];
      if (slots is Map) slots.values.forEach(walk);
    }

    for (final g in galleryGroups(true)) {
      for (final s in g.samples) {
        walk(s.tree);
      }
    }
    expect(approved.difference(seen), isEmpty);
    expect(approved.every(dibaManifest.containsKey), isTrue);
  });

  for (final persian in [true, false]) {
    for (final group in galleryGroups(persian)) {
      for (final sample in group.samples) {
        testWidgets('${persian ? 'fa' : 'en'} · ${sample.id}', (tester) async {
          tester.view.physicalSize = const Size(1400, 2400);
          tester.view.devicePixelRatio = 1;
          addTearDown(tester.view.reset);
          final refused = <String>[];
          await tester.pumpWidget(
            MaterialApp(
              theme: DibaTheme.light(),
              locale: Locale(persian ? 'fa' : 'en'),
              supportedLocales: const [Locale('fa'), Locale('en')],
              localizationsDelegates: GlobalMaterialLocalizations.delegates,
              home: Scaffold(
                body: SingleChildScrollView(
                  child: SizedBox(
                    width: sample.id == 'table' ? 860 : 420,
                    child: DibaSurface(
                      tree: sample.tree,
                      onRefuse: refused.add,
                    ),
                  ),
                ),
              ),
            ),
          );
          await tester.pump();
          // Every sample, the plain-text one included: "Warning: stock is
          // low" is a title now, not a refused URL.
          expect(refused, isEmpty);
        });
      }
    }
  }
}
