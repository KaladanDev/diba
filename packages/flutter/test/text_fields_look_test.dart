import 'package:diba/diba.dart';
import 'package:diba/src/sdui/glyphs.dart';
import 'package:diba/src/sdui/oklab.dart' show dibaMixOklab;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// The text fields in Diba's look, with Flutter's secondary field, which the
/// web now has too.
/// Every number here is the web's.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    double width = 1024,
    bool dark = false,
    String lang = 'fa',
  }) async {
    tester.view
      ..physicalSize = Size(width, 900)
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
            child: DibaSurface(tree: tree),
          ),
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 300));
  }

  Map<String, Object?> field(String type, Map<String, Object?> props) => {
    'type': type,
    'props': props,
  };

  final box = find.byType(TextField);
  final editable = find.byType(EditableText);
  InputDecoration decoration(WidgetTester tester, [int i = 0]) =>
      tester.widgetList<TextField>(box).elementAt(i).decoration!;
  TextStyle textStyle(WidgetTester tester, [int i = 0]) =>
      tester.widgetList<EditableText>(editable).elementAt(i).style;
  ThemeData theme(WidgetTester tester) => Theme.of(tester.element(box.first));

  group('height and text, by width', () {
    for (final (width, height, size, line) in [
      (1024.0, 36.0, 14.0, 20.0),
      (600.0, 40.0, 16.0, 24.0),
    ]) {
      testWidgets('${width.toInt()} wide: every field is $height, its text '
          '$size on $line', (tester) async {
        await paint(tester, {
          'type': 'Stack',
          'children': [
            field('TextField', {'label': 'نام', 'defaultValue': 'شال'}),
            field('SearchField', {'label': 'جستجو', 'defaultValue': 'شال'}),
            field('NumberField', {'label': 'وزن', 'defaultValue': 1}),
            field('DateField', {
              'label': 'تاریخ',
              'defaultValue': '2026-10-16',
            }),
            field('TextField', {
              'label': 'قیمت',
              'suffix': 'تومان',
              'defaultValue': '۱۲',
            }),
          ],
        }, width: width);
        expect(box, findsNWidgets(5));
        for (var i = 0; i < 5; i++) {
          expect(tester.getSize(box.at(i)).height, height, reason: '$i');
          expect(textStyle(tester, i).fontSize, size, reason: '$i');
          expect(
            textStyle(tester, i).fontSize! * textStyle(tester, i).height!,
            moreOrLessEquals(line),
            reason: '$i',
          );
        }
      });

      testWidgets('${width.toInt()} wide: a TextArea of 3 rows is 3 lines '
          'and 16', (tester) async {
        await paint(
          tester,
          field('TextArea', {'label': 'توضیح', 'rows': 3}),
          width: width,
        );
        expect(tester.getSize(box).height, line * 3 + 16);
      });
    }

    testWidgets('a Select and a ComboBox are a text field\'s height too', (
      tester,
    ) async {
      for (final width in [1024.0, 600.0]) {
        await paint(tester, {
          'type': 'Stack',
          'children': [
            {
              'type': 'ComboBox',
              'props': {'label': 'شهر'},
              'children': [
                {
                  'type': 'ListBoxItem',
                  'props': {'id': 'a'},
                  'children': 'تهران',
                },
              ],
            },
            {
              'type': 'Select',
              'props': {'label': 'رنگ', 'selectionMode': 'multiple'},
              'children': [
                {
                  'type': 'ListBoxItem',
                  'props': {'id': 'a'},
                  'children': 'قرمز',
                },
              ],
            },
          ],
        }, width: width);
        for (var i = 0; i < 2; i++) {
          expect(
            tester.getSize(find.byType(InputDecorator).at(i)).height,
            width < 640 ? 40 : 36,
            reason: '$width $i',
          );
        }
      }
    });
  });

  group('inside the field', () {
    testWidgets('the text is 12 in from each edge', (tester) async {
      await paint(tester, field('TextField', {'label': 'نام'}));
      final f = tester.getRect(box);
      final e = tester.getRect(editable);
      expect(e.right, f.right - 12);
      expect(e.left, f.left + 12);
    });

    testWidgets('every edge is 1 outside the field, 2 for focus, with no gap '
        'cut for a floating label', (tester) async {
      await paint(tester, field('TextField', {'label': 'نام'}));
      final t = theme(tester).inputDecorationTheme;
      final scheme = theme(tester).colorScheme;
      for (final (border, width, colour) in [
        (t.enabledBorder, 1.0, DibaLightNeutrals.fieldBorder),
        (t.border, 1.0, DibaLightNeutrals.fieldBorder),
        (t.errorBorder, 1.0, scheme.error),
        (t.focusedBorder, 2.0, DibaLightColors.ring),
        (t.focusedErrorBorder, 2.0, scheme.error),
        (
          t.disabledBorder,
          1.0,
          DibaLightNeutrals.fieldBorder.withValues(alpha: 0.5),
        ),
      ]) {
        final edge = border! as OutlineInputBorder;
        expect(edge.gapPadding, 0);
        expect(edge.borderRadius, BorderRadius.circular(12));
        expect(edge.borderSide.strokeAlign, BorderSide.strokeAlignOutside);
        expect(edge.borderSide.width, width);
        expect(edge.borderSide.color, colour);
      }
    });

    testWidgets('a primary field is the surface, and a hover mixes in 2 of '
        'the text colour', (tester) async {
      for (final dark in [false, true]) {
        await paint(tester, field('TextField', {'label': 'نام'}), dark: dark);
        final scheme = theme(tester).colorScheme;
        expect(decoration(tester).fillColor, scheme.surface);
        expect(
          decoration(tester).hoverColor,
          dibaMixOklab(scheme.surface, 0.9, scheme.onSurface, 0.02),
        );
        expect(decoration(tester).hoverColor!.a, moreOrLessEquals(0.92));
      }
    });

    testWidgets('a secondary field is the second surface inside its edge, a '
        'slate step further under a hover (Flutter\'s)', (tester) async {
      for (final (dark, fill, hover) in [
        (false, DibaPalette.slate100, DibaPalette.slate200),
        (true, DibaPalette.slate800, DibaPalette.slate700),
      ]) {
        await paint(
          tester,
          field('TextField', {'label': 'نام', 'variant': 'secondary'}),
          dark: dark,
        );
        expect(decoration(tester).fillColor, fill);
        expect(decoration(tester).hoverColor, hover);
        // The edge is a primary field's.
        expect(
          (decoration(tester).enabledBorder! as OutlineInputBorder)
              .borderSide
              .color,
          dark ? DibaDarkNeutrals.fieldBorder : DibaLightNeutrals.fieldBorder,
        );
      }
    });

    testWidgets('a placeholder is the placeholder colour at the text\'s '
        'size', (tester) async {
      await paint(tester, field('TextField', {'placeholder': 'مثلاً شال'}));
      final hint = decoration(tester).hintStyle!;
      expect(hint.color, DibaLightNeutrals.placeholder);
      expect(hint.fontSize, 14);
      expect(hint.overflow, TextOverflow.clip);
    });
  });

  group('the label', () {
    testWidgets('14 on 20, medium, in the text colour, 4 above the field', (
      tester,
    ) async {
      await paint(tester, field('TextField', {'label': 'نام محصول'}));
      final label = tester.getRect(find.text('نام محصول'));
      expect(label.height, 20);
      expect(tester.getRect(box).top - label.bottom, 4);
      final style = tester.widget<Text>(find.text('نام محصول')).style!;
      expect(style.fontSize, 14);
      expect(style.fontWeight, FontWeight.w500);
      expect(style.color, theme(tester).colorScheme.onSurface);
    });

    testWidgets('a required mark is the error colour, 2 after the words', (
      tester,
    ) async {
      await paint(
        tester,
        field('TextField', {'label': 'ایمیل', 'isRequired': true}),
      );
      final paragraph = tester.renderObject<RenderParagraph>(
        find.byWidgetPredicate(
          (w) => w is RichText && w.text.toPlainText().startsWith('ایمیل'),
        ),
      );
      final words = paragraph
          .getBoxesForSelection(
            const TextSelection(baseOffset: 0, extentOffset: 5),
          )
          .map((b) => b.toRect())
          .reduce((a, b) => a.expandToInclude(b));
      final wordsLeft = paragraph.localToGlobal(words.topLeft).dx;
      final star = tester.getRect(find.text('*'));
      expect(wordsLeft - star.right, moreOrLessEquals(2, epsilon: 0.01));
      expect(
        tester.widget<Text>(find.text('*')).style!.color,
        theme(tester).colorScheme.error,
      );
    });

    testWidgets('a disabled field\'s label fades with it', (tester) async {
      await paint(
        tester,
        field('TextField', {'label': 'غیرفعال', 'isDisabled': true}),
      );
      final fade = tester.widget<Opacity>(
        find.ancestor(of: find.text('غیرفعال'), matching: find.byType(Opacity)),
      );
      expect(fade.opacity, 0.5);
    });
  });

  group('under the field', () {
    testWidgets('a description: 12 on 16, muted, 4 below, flush with the '
        'field', (tester) async {
      await paint(
        tester,
        field('TextField', {
          'label': 'شناسه',
          'description': 'روی برچسب چاپ می‌شود.',
        }),
      );
      final f = tester.getRect(box);
      final note = tester.getRect(find.text('روی برچسب چاپ می‌شود.'));
      expect(note.top, f.top + 36 + 4);
      expect(note.height, 16);
      expect(note.left, f.left);
      expect(note.right, f.right);
      final style = tester
          .widget<Text>(find.text('روی برچسب چاپ می‌شود.'))
          .style!;
      expect(style.fontSize, 12);
      expect(style.color, theme(tester).colorScheme.onSurfaceVariant);
    });

    testWidgets('an error: the danger colour, 4 in from each edge, in the '
        'description\'s place', (tester) async {
      await paint(
        tester,
        field('TextField', {
          'label': 'ایمیل',
          'description': 'برای رسید',
          'errorMessage': 'ایمیل درست نیست.',
        }),
      );
      expect(find.text('برای رسید'), findsNothing);
      final f = tester.getRect(box);
      final note = tester.getRect(find.text('ایمیل درست نیست.'));
      expect(note.top, f.top + 40);
      expect(note.left, f.left + 4);
      expect(note.right, f.right - 4);
      expect(
        tester.widget<Text>(find.text('ایمیل درست نیست.')).style!.color,
        theme(tester).colorScheme.error,
      );
    });

    testWidgets('a failed check draws its message the same way', (
      tester,
    ) async {
      await paint(tester, {
        'type': 'Form',
        'children': [
          field('TextField', {'label': 'نام', 'isRequired': true}),
        ],
      });
      tester.state<FormState>(find.byType(Form)).validate();
      // Past Material's 167ms slide of a new error into place, which starts
      // on the next frame.
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));
      final message = DibaStrings.of(tester.element(box)).required;
      final f = tester.getRect(box);
      final note = tester.getRect(find.text(message));
      expect(note.left, f.left + 4);
      expect(note.right, f.right - 4);
      expect(note.top, f.top + 40);
    });

    testWidgets(
      'the description of a choice group is the same note, 12 on 16',
      (tester) async {
        await paint(tester, {
          'type': 'CheckboxGroup',
          'props': {'label': 'ارسال', 'description': 'یکی یا چند تا'},
          'children': [
            {
              'type': 'Checkbox',
              'props': {'value': 'post'},
              'children': 'پست',
            },
          ],
        });
        expect(tester.getSize(find.text('یکی یا چند تا')).height, 16);
      },
    );

    testWidgets('a disabled field fades its fill, text and placeholder, and '
        'not its description', (tester) async {
      await paint(
        tester,
        field('TextField', {
          'label': 'غیرفعال',
          'placeholder': 'چیزی',
          'description': 'توضیح',
          'isDisabled': true,
        }),
      );
      final scheme = theme(tester).colorScheme;
      expect(decoration(tester).fillColor!.a, 0.5);
      expect(textStyle(tester).color!.a, 0.5);
      expect(decoration(tester).hintStyle!.color!.a, 0.5);
      expect(
        tester.widget<Text>(find.text('توضیح')).style!.color,
        scheme.onSurfaceVariant,
      );
    });
  });

  group('affixes', () {
    testWidgets('a suffix: 14 in the muted colour, 12 from the end and from '
        'the text, at every width', (tester) async {
      for (final width in [1024.0, 600.0]) {
        await paint(
          tester,
          field('TextField', {'label': 'قیمت', 'suffix': 'تومان'}),
          width: width,
        );
        final f = tester.getRect(box);
        final word = tester.getRect(find.text('تومان'));
        final e = tester.getRect(editable);
        // Right to left: the end is the left.
        expect(word.left, f.left + 12);
        expect(e.left, word.right + 12);
        final style = tester.widget<Text>(find.text('تومان')).style!;
        expect(style.fontSize, 14);
        expect(style.color, theme(tester).colorScheme.onSurfaceVariant);
      }
    });

    testWidgets('a Latin field keeps its prefix on its left on a Persian '
        'page', (tester) async {
      await paint(
        tester,
        field('TextField', {
          'label': 'نشانی',
          'prefix': 'kaladan.shop/',
          'dir': 'ltr',
          'defaultValue': 'nilou',
        }),
      );
      final f = tester.getRect(box);
      final prefix = tester.getRect(find.text('kaladan.shop/'));
      expect(prefix.left, f.left + 12);
      expect(tester.getRect(editable).left, prefix.right + 12);
    });
  });

  group('SearchField', () {
    Finder clear() => find.bySemanticsLabel('پاک کردن');

    testWidgets('its mark: 16 in the placeholder colour, 12 from the start, '
        'the text 8 past it', (tester) async {
      await paint(tester, field('SearchField', {'label': 'جستجو'}));
      final f = tester.getRect(box);
      final mark = find.byWidgetPredicate(
        (w) => w is DibaGlyphMark && w.glyph == DibaGlyph.search,
      );
      final m = tester.getRect(mark);
      expect(m.size, const Size.square(16));
      expect(m.right, f.right - 12);
      expect(m.center.dy, f.center.dy);
      expect(tester.getRect(editable).right, m.left - 8);
      expect(
        tester.widget<DibaGlyphMark>(mark).color,
        DibaLightNeutrals.placeholder,
      );
    });

    testWidgets('its clear button: a 20 circle 8 from the end and the text, '
        'kept in place while it is hidden', (tester) async {
      await paint(tester, field('SearchField', {'label': 'جستجو'}));
      final f = tester.getRect(box);
      final emptyEnd = tester.getRect(editable).left;
      expect(emptyEnd, f.left + 36);
      expect(
        tester
            .widget<Visibility>(
              find.ancestor(
                of: find.byWidgetPredicate(
                  (w) => w is DibaGlyphMark && w.glyph == DibaGlyph.close,
                ),
                matching: find.byType(Visibility),
              ),
            )
            .visible,
        isFalse,
      );

      await tester.enterText(editable, 'شال');
      await tester.pump();
      final c = tester.getRect(clear());
      expect(c.size, const Size.square(20));
      expect(c.left, f.left + 8);
      expect(tester.getRect(editable).left, emptyEnd);
      final circle = tester.widget<AnimatedContainer>(
        find.ancestor(
          of: find.byWidgetPredicate(
            (w) => w is DibaGlyphMark && w.glyph == DibaGlyph.close,
          ),
          matching: find.byType(AnimatedContainer),
        ),
      );
      expect(
        (circle.decoration! as BoxDecoration).color,
        DibaLightNeutrals.fill,
      );

      await tester.tap(clear());
      await tester.pump();
      expect(find.text('شال'), findsNothing);
    });

    testWidgets('Latin text keeps the page\'s direction, as the web\'s '
        'input does', (tester) async {
      await paint(
        tester,
        field('SearchField', {'label': 'جستجو', 'defaultValue': 'DB-1041'}),
      );
      expect(
        tester.state<EditableTextState>(editable).renderEditable.textDirection,
        TextDirection.rtl,
      );
    });
  });

  group('NumberField', () {
    Finder step(String label) => find.bySemanticsLabel(label);

    testWidgets('its steppers: 40 wide and the field\'s height, at each end, '
        'a hairline from the text', (tester) async {
      await paint(
        tester,
        field('NumberField', {'label': 'وزن', 'defaultValue': 5}),
      );
      final f = tester.getRect(box);
      final down = tester.getRect(step('کاهش'));
      final up = tester.getRect(step('افزایش'));
      expect(down.size, const Size(40, 36));
      expect(up.size, const Size(40, 36));
      expect(down.right, f.right);
      expect(up.left, f.left);
      final cell = tester.widget<AnimatedContainer>(
        find.descendant(
          of: step('کاهش'),
          matching: find.byType(AnimatedContainer),
        ),
      );
      final border =
          (cell.decoration! as BoxDecoration).border! as BorderDirectional;
      expect(
        border.end.color,
        DibaLightNeutrals.placeholder.withValues(alpha: 0.15),
      );
      expect(border.start, BorderSide.none);
    });

    testWidgets('a press fills a stepper at 10% and shrinks it to 0.97', (
      tester,
    ) async {
      await paint(
        tester,
        field('NumberField', {'label': 'وزن', 'defaultValue': 5}),
      );
      final gesture = await tester.startGesture(
        tester.getCenter(step('افزایش')),
      );
      await tester.pump(const Duration(milliseconds: 200));
      final scale = tester.widget<Transform>(
        find.descendant(of: step('افزایش'), matching: find.byType(Transform)),
      );
      expect(scale.transform.storage[0], moreOrLessEquals(0.97));
      final cell = tester.widget<AnimatedContainer>(
        find.descendant(
          of: step('افزایش'),
          matching: find.byType(AnimatedContainer),
        ),
      );
      expect(
        (cell.decoration! as BoxDecoration).color,
        theme(tester).colorScheme.onSurface.withValues(alpha: 0.1),
      );
      await gesture.up();
      await tester.pump();
    });

    testWidgets('a stepper at its bound is at half', (tester) async {
      await paint(
        tester,
        field('NumberField', {
          'label': 'وزن',
          'defaultValue': 0,
          'minValue': 0,
        }),
      );
      double opacity(String label) => tester
          .widgetList<Opacity>(
            find.descendant(of: step(label), matching: find.byType(Opacity)),
          )
          .fold(1.0, (o, w) => o * w.opacity);
      expect(opacity('کاهش'), 0.5);
      expect(opacity('افزایش'), 1);
    });

    testWidgets('a toman field shows the word beside the figure, 12 from '
        'it and from the end', (tester) async {
      await paint(
        tester,
        field('NumberField', {
          'label': 'قیمت',
          'formatStyle': 'currency',
          'currency': 'IRT',
          'defaultValue': 1250000,
          'hideSteppers': true,
        }),
      );
      final f = tester.getRect(box);
      final word = tester.getRect(find.text('تومان'));
      expect(find.text('۱٬۲۵۰٬۰۰۰'), findsOneWidget);
      expect(
        tester.widget<Text>(find.text('تومان')).style!.color,
        theme(tester).colorScheme.onSurfaceVariant,
      );
      expect(word.left, f.left + 12);
      expect(tester.getRect(editable).left, word.right + 12);
    });
  });

  group('DateField', () {
    testWidgets('its calendar: 20 in the muted colour, in a 28 square 12 '
        'from the end, the text 8 before it', (tester) async {
      for (final granularity in ['day', 'minute']) {
        await paint(
          tester,
          field('DateField', {
            'label': 'تاریخ',
            'defaultValue': '2026-10-22T14:30',
            'granularity': granularity,
          }),
        );
        final f = tester.getRect(box);
        final mark = find.byWidgetPredicate(
          (w) => w is DibaGlyphMark && w.glyph == DibaGlyph.calendar,
        );
        final m = tester.getRect(mark);
        expect(m.size, const Size.square(20));
        expect(m.center.dx, f.left + 12 + 14);
        expect(m.center.dy, f.center.dy);
        expect(tester.getRect(editable).left, f.left + 12 + 28 + 8);
        expect(
          tester.widget<DibaGlyphMark>(mark).color,
          theme(tester).colorScheme.onSurfaceVariant,
        );
      }
    });

    testWidgets('an empty one shows the segments\' placeholders', (
      tester,
    ) async {
      await paint(tester, field('DateField', {'label': 'تولد'}));
      expect(
        decoration(tester).hintText,
        'سال\u2009/\u2009ماه\u2009/\u2009روز',
      );
      await paint(
        tester,
        field('DateField', {'label': 'Birthday'}),
        lang: 'en',
      );
      expect(decoration(tester).hintText, 'mm\u2009/\u2009dd\u2009/\u2009yyyy');
    });
  });
}
