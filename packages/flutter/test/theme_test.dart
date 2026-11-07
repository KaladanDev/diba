import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:diba/diba.dart';

/// The generated theme, built rather than read.
///
/// `flutter analyze` proves the file parses and its names resolve. It does not
/// prove that `ThemeData` accepts what we handed it, that the overrides land on
/// the widgets they were written for, or that a `WidgetStateProperty` resolves
/// to the colour intended. Those only show up when something builds.
void main() {
  group('the brand survives the trip from OKLCH', () {
    test('primary is the gold from the logo, on both themes', () {
      expect(DibaLightColors.primary, const Color(0xFFF6B76F));
      expect(DibaDarkColors.primary, const Color(0xFFF6B76F));
    });

    test('the label on it is the violet, not white', () {
      expect(DibaLightColors.primaryFg, const Color(0xFF454263));
    });

    test('alpha survives — the ring is not opaque', () {
      expect(DibaLightColors.ring.a, lessThan(1.0));
      expect(DibaLightColors.overlay.a, lessThan(1.0));
    });
  });

  group('DibaTheme builds', () {
    test('light and dark are real ThemeData', () {
      expect(DibaTheme.light(), isA<ThemeData>());
      expect(DibaTheme.dark(), isA<ThemeData>());
    });

    test('and are not the same theme', () {
      expect(DibaTheme.light().colorScheme.brightness, Brightness.light);
      expect(DibaTheme.dark().colorScheme.brightness, Brightness.dark);
      expect(
        DibaTheme.light().colorScheme.surface,
        isNot(DibaTheme.dark().colorScheme.surface),
      );
    });

    /// Tertiary carried the copper until it left the components. It is unset
    /// now, and the copper is still a token.
    test('the copper stays a token, outside the scheme', () {
      expect(DibaLightColors.primaryEmphasis, const Color(0xFFA15726));
      expect(DibaTheme.lightScheme.tertiary, DibaTheme.lightScheme.secondary);
    });

    test('surfaces are not tinted by elevation', () {
      expect(DibaTheme.lightScheme.surfaceTint.a, 0.0);
    });
  });

  /// Material spends ColorScheme.primary on both fills that carry a label and
  /// indicators drawn on a surface. Diba's primary is a gold chosen to hold
  /// dark text — about 1.7:1 against a light surface — so every indicator has
  /// to be pointed somewhere else or it disappears.
  /// Focus and tabs keep the copper. The controls' selected states moved to
  /// the selected-state roles; their own group is below.
  /// Focus, tabs and plain text buttons follow the web. Before that, all
  /// three were the copper.
  group('focus, tabs and text buttons follow the web', () {
    for (final (name, theme, light) in [
      ('light', DibaTheme.light(), true),
      ('dark', DibaTheme.dark(), false),
    ]) {
      test('$name: a focused field is the ring, outside its edge', () {
        final border = theme.inputDecorationTheme.focusedBorder;
        expect(border, isA<OutlineInputBorder>());
        final side = (border as OutlineInputBorder).borderSide;
        expect(side.color, light ? DibaLightColors.ring : DibaDarkColors.ring);
        expect(side.width, DibaDimens.focusWidth);
        expect(side.width, 2);
        expect(side.strokeAlign, BorderSide.strokeAlignOutside);
        final error =
            theme.inputDecorationTheme.focusedErrorBorder as OutlineInputBorder;
        expect(error.borderSide.color, theme.colorScheme.error);
        expect(error.borderSide.strokeAlign, BorderSide.strokeAlignOutside);
        expect(
          theme.inputDecorationTheme.floatingLabelStyle?.color,
          theme.colorScheme.onSurface,
        );
      });

      test('$name: the selected tab is a pill in segment', () {
        final tabs = theme.tabBarTheme;
        final pill = tabs.indicator! as ShapeDecoration;
        expect(pill.shape, isA<StadiumBorder>());
        expect(
          pill.color,
          light ? DibaLightColors.segment : DibaDarkColors.segment,
        );
        expect(pill.shadows, light ? hasLength(3) : isEmpty);
        expect(tabs.indicatorSize, TabBarIndicatorSize.tab);
        expect(tabs.dividerHeight, 0);
        expect(
          tabs.labelColor,
          light ? DibaLightColors.segmentFg : DibaDarkColors.segmentFg,
        );
        expect(
          tabs.unselectedLabelColor,
          light
              ? DibaLightColors.segmentFgMuted
              : DibaDarkColors.segmentFgMuted,
        );
        // Material's titleSmall, which is the sm size at the medium weight.
        expect(theme.textTheme.titleSmall?.fontSize, 14);
        expect(theme.textTheme.titleSmall?.fontWeight, FontWeight.w500);
      });

      test('$name: a plain text button is the secondary button’s text', () {
        final style = theme.textButtonTheme.style!;
        expect(
          style.foregroundColor?.resolve({}),
          light ? DibaLightColors.plainFg : DibaDarkColors.plainFg,
        );
        final hover = light
            ? DibaLightColors.plainHover
            : DibaDarkColors.plainHover;
        for (final state in [
          WidgetState.hovered,
          WidgetState.pressed,
          WidgetState.focused,
        ]) {
          expect(style.overlayColor?.resolve({state}), hover, reason: '$state');
        }
        expect(style.overlayColor?.resolve({}), isNull);
        expect(style.shape?.resolve({}), isA<StadiumBorder>());
      });
    }

    /// The admin draws its dark pill slate-800 on a slate-800 list, so its
    /// selected tab cannot be seen. Diba's is slate-700.
    test('dark: the pill is slate-700, and not the list’s colour', () {
      final pill = DibaTheme.dark().tabBarTheme.indicator! as ShapeDecoration;
      expect(pill.color, DibaPalette.slate700);
      expect(DibaDarkColors.segmentList, DibaPalette.slate800);
      expect(pill.color, isNot(DibaDarkColors.segmentList));
    });

    /// The nav pill follows Material: the selected icon and label are drawn in
    /// onSecondaryContainer, so the pill itself carries no meaning alone.
    test('the navigation pill follows Material', () {
      final theme = DibaTheme.light();
      expect(
        theme.navigationBarTheme.indicatorColor,
        theme.colorScheme.secondaryContainer,
      );
    });
  });

  /// Flutter's slider stays, and its thumb gets a gilt ring.
  group('the slider thumb takes a gilt ring', () {
    for (final (name, theme) in [
      ('light', DibaTheme.light()),
      ('dark', DibaTheme.dark()),
    ]) {
      test('$name: both thumb shapes ring in the control fill', () {
        final single = theme.sliderTheme.thumbShape! as DibaRingedThumbShape;
        final range =
            theme.sliderTheme.rangeThumbShape! as DibaRingedRangeThumbShape;
        for (final (ring, width, radius) in [
          (single.ring, single.ringWidth, single.enabledThumbRadius),
          (range.ring, range.ringWidth, range.enabledThumbRadius),
        ]) {
          expect(ring, DibaLightColors.controlFill);
          // 3; it had been 2.
          expect(width, 3);
          // Material's round thumb, 20 across: the ring sits inside it and
          // leaves a slate core 14 across.
          expect(radius, 10);
          expect(2 * radius - 2 * width, 14);
        }
      });
    }
  });

  /// The selected-state roles: gilt fills, slate-700 on the gilt in both
  /// themes, the secondary button's text for an off thumb and its hover shade
  /// for an empty or off track.
  group('controls take the selected-state roles', () {
    const selected = <WidgetState>{WidgetState.selected};
    const off = <WidgetState>{};

    for (final (name, theme, light) in [
      ('light', DibaTheme.light(), true),
      ('dark', DibaTheme.dark(), false),
    ]) {
      final fill = light
          ? DibaLightColors.controlFill
          : DibaDarkColors.controlFill;
      final onFill = light
          ? DibaLightColors.controlOnFill
          : DibaDarkColors.controlOnFill;
      final track = light
          ? DibaLightColors.controlTrack
          : DibaDarkColors.controlTrack;
      final thumbOff = light
          ? DibaLightColors.controlThumbOff
          : DibaDarkColors.controlThumbOff;

      test('$name: a slider and a progress bar', () {
        expect(theme.sliderTheme.activeTrackColor, fill);
        expect(theme.sliderTheme.thumbColor, onFill);
        expect(theme.sliderTheme.inactiveTrackColor, track);
        expect(theme.progressIndicatorTheme.color, fill);
        expect(theme.progressIndicatorTheme.linearTrackColor, track);
      });

      test('$name: a checked box and a selected radio', () {
        expect(theme.checkboxTheme.fillColor?.resolve(selected), fill);
        expect(theme.checkboxTheme.checkColor?.resolve(selected), onFill);
        expect(theme.radioTheme.backgroundColor?.resolve(selected), fill);
        expect(theme.radioTheme.fillColor?.resolve(selected), onFill);
      });

      test('$name: a switch, on and off', () {
        expect(theme.switchTheme.trackColor?.resolve(selected), fill);
        expect(theme.switchTheme.thumbColor?.resolve(selected), onFill);
        expect(theme.switchTheme.trackColor?.resolve(off), track);
        expect(theme.switchTheme.thumbColor?.resolve(off), thumbOff);
      });
    }

    test('the on-gilt marks do not flip with the theme', () {
      expect(DibaLightColors.controlOnFill, DibaDarkColors.controlOnFill);
      expect(DibaLightColors.controlFill, DibaDarkColors.controlFill);
    });
  });

  /// WCAG's non-text contrast: every pair that carries a control's state must
  /// reach 3:1. Computed from the theme's own resolved colours, so a change to
  /// the tokens *or* to the theme's wiring shows up here. The web measured
  /// the same pairs (measure-roles.mjs): 5.88, 6.97 and 8.40.
  group('state pairs reach 3:1', () {
    double luminance(Color c) {
      double channel(double v) => v <= 0.04045
          ? v / 12.92
          : math.pow((v + 0.055) / 1.055, 2.4).toDouble();
      return 0.2126 * channel(c.r) +
          0.7152 * channel(c.g) +
          0.0722 * channel(c.b);
    }

    double contrast(Color a, Color b) {
      final la = luminance(a);
      final lb = luminance(b);
      return (math.max(la, lb) + 0.05) / (math.min(la, lb) + 0.05);
    }

    const selected = <WidgetState>{WidgetState.selected};
    const off = <WidgetState>{};

    for (final (name, theme, offPair) in [
      ('light', DibaTheme.light(), 6.97),
      ('dark', DibaTheme.dark(), 8.40),
    ]) {
      test('$name: thumb, tick and dot against the gilt', () {
        final fill = theme.switchTheme.trackColor!.resolve(selected)!;
        for (final mark in [
          theme.switchTheme.thumbColor!.resolve(selected)!,
          theme.checkboxTheme.checkColor!.resolve(selected)!,
          theme.radioTheme.fillColor!.resolve(selected)!,
          theme.sliderTheme.thumbColor!,
        ]) {
          final ratio = contrast(mark, fill);
          expect(ratio, greaterThanOrEqualTo(3));
          expect(ratio, moreOrLessEquals(5.88, epsilon: 0.1));
        }
      });

      test('$name: an off thumb against its track', () {
        final ratio = contrast(
          theme.switchTheme.thumbColor!.resolve(off)!,
          theme.switchTheme.trackColor!.resolve(off)!,
        );
        expect(ratio, greaterThanOrEqualTo(3));
        expect(ratio, moreOrLessEquals(offPair, epsilon: 0.1));
      });
    }

    /// Known and accepted: a light checkbox's fill
    /// against a white card is 1.76:1. The slate tick carries the state.
    test(
      'light: the checkbox fill against the card is the accepted 1.76:1',
      () {
        final theme = DibaTheme.light();
        final ratio = contrast(
          theme.checkboxTheme.fillColor!.resolve(selected)!,
          theme.colorScheme.surface,
        );
        expect(ratio, moreOrLessEquals(1.76, epsilon: 0.1));
      },
    );

    /// the dark thumb is the dark track's colour, so the ring is what
    /// separates them (1.00:1 without it). The web measured 5.88, and 9.14
    /// on the old charcoal card; on the slate-900 card it is 10.12.
    test('dark: the thumb ring against the empty track and the card', () {
      final theme = DibaTheme.dark();
      final ring = (theme.sliderTheme.thumbShape! as DibaRingedThumbShape).ring;
      expect(
        contrast(
          theme.sliderTheme.thumbColor!,
          theme.sliderTheme.inactiveTrackColor!,
        ),
        moreOrLessEquals(1, epsilon: 0.01),
      );
      final onTrack = contrast(ring, theme.sliderTheme.inactiveTrackColor!);
      expect(onTrack, greaterThanOrEqualTo(3));
      expect(onTrack, moreOrLessEquals(5.88, epsilon: 0.1));
      expect(
        contrast(ring, theme.colorScheme.surface),
        moreOrLessEquals(10.12, epsilon: 0.1),
      );
    });

    /// the focus ring is translucent, so it is measured as drawn, over
    /// the surface. The copper and the gilt were the alternatives; the gilt
    /// would have been 1.76:1 on light.
    for (final (name, theme) in [
      ('light', DibaTheme.light()),
      ('dark', DibaTheme.dark()),
    ]) {
      test('$name: a focus ring against the surface', () {
        final surface = theme.colorScheme.surface;
        final ring =
            (theme.inputDecorationTheme.focusedBorder! as OutlineInputBorder)
                .borderSide
                .color;
        expect(
          contrast(Color.alphaBlend(ring, surface), surface),
          greaterThanOrEqualTo(3),
        );
      });

      test('$name: a selected tab’s label on its pill', () {
        final pill = (theme.tabBarTheme.indicator! as ShapeDecoration).color!;
        expect(
          contrast(theme.tabBarTheme.labelColor!, pill),
          greaterThanOrEqualTo(4.5),
        );
      });
    }

    /// an unselected light tab label was v3's slate-500, 3.86:1 on its
    /// list. It is slate-600 now; dark stays slate-400.
    for (final (name, list, expected) in [
      ('light', DibaLightColors.segmentList, 6.15),
      ('dark', DibaDarkColors.segmentList, 5.56),
    ]) {
      test('$name: an unselected tab’s label on the list', () {
        final theme = name == 'light' ? DibaTheme.light() : DibaTheme.dark();
        final ratio = contrast(theme.tabBarTheme.unselectedLabelColor!, list);
        expect(ratio, greaterThanOrEqualTo(4.5));
        expect(ratio, moreOrLessEquals(expected, epsilon: 0.1));
      });
    }

    /// the link is the admin's `--link`. The web measured 10.36 on white
    /// and 10.83 on Flutter's old charcoal card; 12.00 on the slate-900.
    for (final (name, link, surface, expected) in [
      ('light', DibaLightColors.link, DibaTheme.lightScheme.surface, 10.36),
      ('dark', DibaDarkColors.link, DibaTheme.darkScheme.surface, 12.00),
    ]) {
      test('$name: a link on the card', () {
        expect(
          contrast(link, surface),
          moreOrLessEquals(expected, epsilon: 0.1),
        );
      });
    }

    test('the picked day’s number on the gilt', () {
      final picker = DibaTheme.dark().datePickerTheme;
      expect(
        contrast(
          picker.dayForegroundColor!.resolve(selected)!,
          picker.dayBackgroundColor!.resolve(selected)!,
        ),
        moreOrLessEquals(5.88, epsilon: 0.1),
      );
    });
  });

  /// the copper leaves the components.
  group('copper leaves the components', () {
    const selected = <WidgetState>{WidgetState.selected};

    for (final (name, theme) in [
      ('light', DibaTheme.light()),
      ('dark', DibaTheme.dark()),
    ]) {
      final scheme = theme.colorScheme;

      test('$name: the caret and its handles are the text colour', () {
        expect(theme.textSelectionTheme.cursorColor, scheme.onSurface);
        expect(theme.textSelectionTheme.selectionHandleColor, scheme.onSurface);
        // The highlight is Material's, primary at 40%: reported, not changed.
        expect(theme.textSelectionTheme.selectionColor, isNull);
      });

      test('$name: the picked day and year are gilt with slate on them', () {
        final picker = theme.datePickerTheme;
        for (final (fill, ink) in [
          (picker.dayBackgroundColor!, picker.dayForegroundColor!),
          (picker.todayBackgroundColor!, picker.todayForegroundColor!),
          (picker.yearBackgroundColor!, picker.yearForegroundColor!),
        ]) {
          expect(fill.resolve(selected), DibaLightColors.controlFill);
          expect(ink.resolve(selected), DibaLightColors.controlOnFill);
          // Unpicked days keep Material's own colours.
          expect(fill.resolve({}), isNull);
        }
      });

      test('$name: the selected AM/PM is the text colour', () {
        final picker = theme.timePickerTheme;
        expect(
          WidgetStateProperty.resolveAs<Color?>(
            picker.dayPeriodColor,
            selected,
          ),
          scheme.onSurface,
        );
        expect(
          WidgetStateProperty.resolveAs<Color?>(
            picker.dayPeriodTextColor,
            selected,
          ),
          scheme.surface,
        );
      });

      test('$name: tertiary is no longer the copper', () {
        final copper = name == 'light'
            ? DibaLightColors.primaryEmphasis
            : DibaDarkColors.primaryEmphasis;
        expect(scheme.tertiary, isNot(copper));
        // Left unset, Material falls back to secondary.
        expect(scheme.tertiary, scheme.secondary);
      });
    }
  });

  group('the theme is Persian-first', () {
    test('it asks for the Persian family', () {
      expect(DibaTheme.light().textTheme.bodyMedium?.fontFamily, DibaFonts.fa);
    });

    /// Material's defaults are set for Latin and run tight under Persian.
    test('body line height comes from the tokens, not Material', () {
      expect(
        DibaTheme.light().textTheme.bodyMedium?.height,
        DibaLineHeight.normal,
      );
    });
  });

  group('a widget actually renders with it', () {
    testWidgets('a filled button takes the gold and the violet label', (
      tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: DibaTheme.light(),
          locale: const Locale('fa', 'IR'),
          home: Directionality(
            textDirection: TextDirection.rtl,
            child: Scaffold(
              body: FilledButton(onPressed: () {}, child: const Text('افزودن')),
            ),
          ),
        ),
      );

      expect(find.text('افزودن'), findsOneWidget);

      final context = tester.element(find.byType(FilledButton));
      final scheme = Theme.of(context).colorScheme;
      expect(scheme.primary, const Color(0xFFF6B76F));
      expect(scheme.onPrimary, const Color(0xFF454263));
    });
  });
}
