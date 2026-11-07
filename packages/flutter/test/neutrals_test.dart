import 'package:diba/diba.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// the neutrals are the web's slate, role for role as
/// `themes/diba/variables.css` maps them. The expectations name the slate
/// steps that file names, not the Dart classes, so a slip in the mapping
/// shows up here.
void main() {
  const light = (
    name: 'light',
    page: DibaPalette.slate50,
    surface: DibaPalette.paper0,
    secondary: DibaPalette.slate100,
    tertiary: DibaPalette.slate200,
    text: DibaPalette.slate800,
    muted: DibaPalette.slate500,
    fill: DibaPalette.slate200,
    fillHover: DibaPalette.slate300,
    fillText: DibaPalette.slate700,
    border: DibaPalette.slate200,
    fieldBorder: DibaPalette.slate200,
    // 4.7:1 on the paper; slate-400 had been 2.6:1.
    placeholder: DibaPalette.slate500,
  );
  const dark = (
    name: 'dark',
    page: DibaPalette.slate950,
    surface: DibaPalette.slate900,
    secondary: DibaPalette.slate800,
    tertiary: DibaPalette.slate700,
    text: DibaPalette.slate100,
    muted: DibaPalette.slate400,
    fill: DibaPalette.slate800,
    fillHover: DibaPalette.slate700,
    fillText: DibaPalette.slate200,
    border: DibaPalette.slate800,
    // The hairline, a step lighter than other borders.
    fieldBorder: DibaPalette.slate700,
    // Slate-500 had been 3.7:1 on the field's slate-900.
    placeholder: DibaPalette.slate400,
  );

  for (final want in [light, dark]) {
    final theme = want.name == 'light' ? DibaTheme.light() : DibaTheme.dark();
    final scheme = theme.colorScheme;

    group('${want.name}: the theme maps the web’s roles', () {
      test('surfaces', () {
        expect(theme.scaffoldBackgroundColor, want.page);
        expect(scheme.surfaceContainerLow, want.page);
        expect(scheme.surface, want.surface);
        expect(theme.dialogTheme.backgroundColor, want.surface);
        expect(scheme.surfaceContainer, want.secondary);
        expect(scheme.surfaceContainerHighest, want.tertiary);
      });

      test('text and lines', () {
        expect(scheme.onSurface, want.text);
        expect(scheme.onSurfaceVariant, want.muted);
        expect(scheme.outlineVariant, want.border);
        final field = theme.inputDecorationTheme;
        expect(
          (field.enabledBorder! as OutlineInputBorder).borderSide.color,
          want.fieldBorder,
        );
        expect(field.hintStyle?.color, want.placeholder);
      });

      test('the neutral tone is the web’s default', () {
        final tone = theme.extension<DibaStatusColors>()!.neutral;
        expect(tone.solid, want.fill);
        expect(tone.onSolid, want.fillText);
        expect(tone.ink, want.text);
      });
    });

    group('${want.name}: the blocks compared with the web', () {
      Future<void> show(WidgetTester tester, Map<String, Object?> tree) async {
        await tester.pumpWidget(
          MaterialApp(
            theme: theme,
            locale: const Locale('fa'),
            supportedLocales: const [Locale('fa'), Locale('en')],
            localizationsDelegates: GlobalMaterialLocalizations.delegates,
            home: Scaffold(
              body: SingleChildScrollView(child: DibaSurface(tree: tree)),
            ),
          ),
        );
        await tester.pump();
      }

      testWidgets('a tertiary button is the fill, darker under a hover', (
        tester,
      ) async {
        await show(tester, {
          'type': 'Button',
          'props': {'variant': 'tertiary'},
          'children': 'پیش‌نویس',
        });
        final style = tester
            .widget<FilledButton>(find.byType(FilledButton))
            .style!;
        expect(style.backgroundColor!.resolve({}), want.fill);
        expect(
          style.backgroundColor!.resolve({WidgetState.hovered}),
          want.fillHover,
        );
        expect(style.foregroundColor!.resolve({}), want.text);
      });

      testWidgets('secondary and tertiary cards', (tester) async {
        await show(tester, {
          'type': 'Stack',
          'children': [
            for (final variant in ['secondary', 'tertiary'])
              {
                'type': 'Card',
                'props': {'title': variant, 'variant': variant},
              },
          ],
        });
        // A card is its surface 24 round.
        Color? fill(String title) {
          final box = tester.widget<DecoratedBox>(
            find
                .ancestor(
                  of: find.text(title),
                  matching: find.byWidgetPredicate(
                    (w) =>
                        w is DecoratedBox &&
                        w.decoration is BoxDecoration &&
                        (w.decoration as BoxDecoration).borderRadius ==
                            const BorderRadius.all(Radius.circular(24)),
                  ),
                )
                .first,
          );
          return (box.decoration as BoxDecoration).color;
        }

        expect(
          [fill('secondary'), fill('tertiary')],
          [want.secondary, want.tertiary],
        );
      });

      testWidgets('a table’s head', (tester) async {
        await show(tester, {
          'type': 'Table',
          'props': {'aria-label': 'سفارش‌ها'},
          'children': [
            {
              'type': 'TableHeader',
              'children': [
                {
                  'type': 'Column',
                  'props': {'id': 'id', 'isRowHeader': true},
                  'children': 'سفارش',
                },
              ],
            },
            {
              'type': 'TableBody',
              'children': [
                {
                  'type': 'Row',
                  'props': {'id': 'a'},
                  'children': [
                    {'type': 'Cell', 'children': 'DB-1041'},
                  ],
                },
              ],
            },
          ],
        });
        // The head lies on the table's frame, the secondary surface 20
        // round.
        final frame = tester.widget<DecoratedBox>(
          find
              .ancestor(
                of: find.text('سفارش'),
                matching: find.byWidgetPredicate(
                  (w) =>
                      w is DecoratedBox &&
                      w.decoration is BoxDecoration &&
                      (w.decoration as BoxDecoration).borderRadius ==
                          const BorderRadius.all(Radius.circular(20)),
                ),
              )
              .first,
        );
        expect((frame.decoration as BoxDecoration).color, want.secondary);
      });
    });
  }
}
