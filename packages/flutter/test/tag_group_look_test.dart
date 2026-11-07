import 'package:diba/diba.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// The tag group in Flutter's look. The web copies these numbers off
/// Material's InputChip in Diba's theme; this holds Flutter to them, and
/// `alert.browser.test.tsx` holds the web. A tag that does nothing is drawn
/// at full strength, and a chosen one is the chosen gilt: of two groups, one
/// had looked different on the two platforms and the other as if it ignored
/// clicks.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    bool dark = false,
  }) async {
    tester.view
      ..physicalSize = const Size(1024, 900)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      MaterialApp(
        theme: dark ? DibaTheme.dark() : DibaTheme.light(),
        locale: const Locale('fa'),
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(
          body: Padding(
            padding: const EdgeInsets.all(20),
            child: DibaSurface(
              tree: tree,
              handlers: DibaHandlers(call: (_, _) {}),
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
  }

  Map<String, Object?> tag(String id, String text, [Map<String, Object?>? p]) =>
      {
        'type': 'Tag',
        'props': {'id': id, ...?p},
        'children': text,
      };
  Map<String, Object?> group(
    Map<String, Object?> props,
    List<Map<String, Object?>> tags, [
    Map<String, Object?>? extra,
  ]) => {'type': 'TagGroup', 'props': props, 'children': tags, ...?extra};

  // InputChip and Chip each build one; the second for a tag that does
  // nothing.
  final chips = find.byType(RawChip);
  RawChip chip(WidgetTester tester, int i) =>
      tester.widget<RawChip>(chips.at(i));

  testWidgets('40 tall at md (32 at sm, 48 at lg): a 32, 28 or 36 chip in its '
      'tap target, 8 apart', (tester) async {
    await paint(tester, {
      'type': 'Stack',
      'props': {},
      'children': [
        for (final size in ['sm', 'md', 'lg'])
          group(
            {'label': size, 'size': size},
            [tag('a', 'موجود'), tag('b', 'حراج')],
          ),
      ],
    });
    expect(
      [for (var i = 0; i < 6; i += 2) tester.getSize(chips.at(i)).height],
      [32, 40, 48],
    );
    expect(
      chip(tester, 0).visualDensity,
      const VisualDensity(horizontal: -2, vertical: -4),
    );
    expect(chip(tester, 2).visualDensity, VisualDensity.compact);
    expect(chip(tester, 4).visualDensity, VisualDensity.standard);
    final wrap = tester.widget<Wrap>(find.byType(Wrap).first);
    expect(wrap.spacing, 8);
    expect(wrap.runSpacing, 8);
    // Right to left: the second 8 after the first.
    expect(
      tester.getRect(chips.at(0)).left - tester.getRect(chips.at(1)).right,
      8,
    );
  });

  testWidgets('its words 14 medium on a 1.35 line, 17 from each edge; 36 '
      'past a square as wide as the line', (tester) async {
    await paint(
      tester,
      group(
        {'label': 'کلیدواژه‌ها'},
        [
          tag('a', 'ابریشم'),
          tag('b', 'شال', {'icon': 'tag'}),
        ],
        {
          'actions': {
            'onRemove': {'do': 'call', 'action': 'x', 'value': 'tag'},
          },
        },
      ),
    );
    final words = find.descendant(
      of: chips.at(0),
      matching: find.text('ابریشم'),
    );
    final style = tester
        .widget<RichText>(
          find.descendant(of: words, matching: find.byType(RichText)),
        )
        .text
        .style!;
    expect(style.fontSize, 14);
    expect(style.height, 1.35);
    expect(style.fontWeight, FontWeight.w500);
    final c = tester.getRect(chips.at(0));
    final w = tester.getRect(words);
    // The remove button's square at the end, the left in Persian.
    expect(w.left - c.left, closeTo(17 + 18.9, 0.6));
    expect(c.right - w.right, 17);
    // An icon's square at the start.
    final c2 = tester.getRect(chips.at(1));
    final w2 = tester.getRect(find.text('شال'));
    expect(c2.right - w2.right, closeTo(17 + 18.9, 0.6));
    expect(chip(tester, 0).onDeleted, isNotNull);
    expect(chip(tester, 0).deleteButtonTooltipMessage, 'پاک کردن');
  });

  testWidgets('a tap moves the gilt; a disabled tag stays faded, and the tick '
      'takes an icon\'s square', (tester) async {
    await paint(tester, {
      'type': 'Stack',
      'props': {},
      'children': [
        group(
          {
            'label': 'وضعیت',
            'selectionMode': 'single',
            'defaultSelectedKeys': ['open'],
          },
          [tag('open', 'باز'), tag('closed', 'بسته')],
        ),
        group(
          {
            'label': 'چند',
            'selectionMode': 'multiple',
            'defaultSelectedKeys': ['a'],
          },
          [
            tag('a', 'شال', {'icon': 'tag'}),
            tag('b', 'هدیه', {'isDisabled': true}),
          ],
        ),
      ],
    });
    expect([chip(tester, 0).selected, chip(tester, 1).selected], [true, false]);
    await tester.tap(find.text('بسته'));
    await tester.pumpAndSettle();
    expect([chip(tester, 0).selected, chip(tester, 1).selected], [false, true]);
    expect(chip(tester, 1).labelStyle!.color, DibaLightColors.controlOnFill);
    expect(chip(tester, 3).isEnabled, isFalse);
    // Chosen among several, the icon gives its square to the tick.
    expect(chip(tester, 2).avatar, isNull);
    await tester.tap(find.text('شال'));
    await tester.pumpAndSettle();
    expect(chip(tester, 2).avatar, isNotNull);
  });

  for (final dark in [false, true]) {
    testWidgets('${dark ? 'dark' : 'light'}: the colours the web takes', (
      tester,
    ) async {
      await paint(tester, {
        'type': 'Stack',
        'props': {},
        'children': [
          group({'label': 'هیچ'}, [tag('a', 'ابریشم')]),
          group(
            {
              'label': 'چند',
              'selectionMode': 'multiple',
              'defaultSelectedKeys': ['a'],
            },
            [tag('a', 'موجود'), tag('b', 'حراج')],
          ),
          group(
            {'label': 'رو', 'variant': 'surface', 'selectionMode': 'single'},
            [tag('a', 'باز')],
          ),
        ],
      }, dark: dark);
      final theme = Theme.of(tester.element(chips.first));
      final scheme = theme.colorScheme;
      final neutrals = (
        surface: dark ? DibaDarkNeutrals.surface : DibaLightNeutrals.surface,
        second: dark
            ? DibaDarkNeutrals.surfaceSecondary
            : DibaLightNeutrals.surfaceSecondary,
        muted: dark ? DibaDarkNeutrals.muted : DibaLightNeutrals.muted,
        border: dark ? DibaDarkNeutrals.border : DibaLightNeutrals.border,
      );
      final gilt = dark
          ? DibaDarkColors.controlFill
          : DibaLightColors.controlFill;
      final onGilt = dark
          ? DibaDarkColors.controlOnFill
          : DibaLightColors.controlOnFill;
      expect(scheme.onSurfaceVariant, neutrals.muted);
      expect(scheme.surfaceContainer, neutrals.second);
      expect(scheme.outlineVariant, neutrals.border);
      expect(scheme.surface, neutrals.surface);
      // One that does nothing: Material's plain chip, at full strength on
      // the second surface, with nothing to press and no focus.
      expect(chip(tester, 0).tapEnabled, isFalse);
      expect(chip(tester, 0).isEnabled, isTrue);
      expect(chip(tester, 0).backgroundColor, neutrals.second);
      expect(chip(tester, 0).labelStyle!.color, neutrals.muted);
      // A tag that can be chosen is on the second surface, edged in nothing;
      // a surface one on the surface, edged in the border colour.
      expect(chip(tester, 2).backgroundColor, neutrals.second);
      expect(chip(tester, 2).side, const BorderSide(color: Colors.transparent));
      expect(chip(tester, 2).labelStyle!.color, neutrals.muted);
      expect(chip(tester, 3).backgroundColor, neutrals.surface);
      expect(chip(tester, 3).side, BorderSide(color: neutrals.border));
      // A chosen one is the chosen gilt with slate-700 on it, its tick too.
      expect(chip(tester, 1).selected, isTrue);
      expect(chip(tester, 1).selectedColor, gilt);
      expect(chip(tester, 1).labelStyle!.color, onGilt);
      expect(chip(tester, 1).checkmarkColor, onGilt);
      // The tick only among several.
      expect(chip(tester, 1).showCheckmark, isTrue);
      expect(chip(tester, 3).showCheckmark, isFalse);
      // Flutter's washes, which the web copies: hovered, focused, pressed.
      expect(
        theme.hoverColor,
        dark ? const Color(0x0AFFFFFF) : const Color(0x0A000000),
      );
      expect(
        theme.focusColor,
        dark ? const Color(0x1FFFFFFF) : const Color(0x1F000000),
      );
      expect(
        theme.highlightColor,
        dark ? const Color(0x40CCCCCC) : const Color(0x66BCBCBC),
      );
      // No chip theme of Diba's own: Material's InputChip, as measured.
      expect(theme.chipTheme, const ChipThemeData());
    });
  }
}
