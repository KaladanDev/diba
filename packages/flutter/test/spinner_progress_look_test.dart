import 'package:diba/diba.dart';
import 'package:diba/src/sdui/blocks/status.dart' show DibaSpinner;
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// The spinner in Diba's look and the progress bar in Flutter's.
/// The spinner's numbers are the web's; the bar's are Flutter's own, which
/// `alert.browser.test.tsx` holds the web to.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    bool dark = false,
    bool still = false,
  }) async {
    tester.view
      ..physicalSize = const Size(1024, 900)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      MaterialApp(
        theme: dark ? DibaTheme.dark() : DibaTheme.light(),
        locale: const Locale('en'),
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        builder: (context, child) => MediaQuery(
          data: MediaQuery.of(context).copyWith(disableAnimations: still),
          child: child!,
        ),
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

  Map<String, Object?> n(String type, Map<String, Object?> props) => {
    'type': type,
    'props': props,
  };

  group('a spinner', () {
    CustomPainter painterOf(WidgetTester tester, [int i = 0]) => tester
        .widgetList<CustomPaint>(
          find.descendant(
            of: find.byType(DibaSpinner),
            matching: find.byType(CustomPaint),
          ),
        )
        .elementAt(i)
        .painter!;

    testWidgets('16, 24, 32 or 40 across, the web\'s sizes', (tester) async {
      await paint(tester, {
        'type': 'Stack',
        'props': {'direction': 'horizontal'},
        'children': [
          for (final s in ['sm', 'md', 'lg', 'xl']) n('Spinner', {'size': s}),
        ],
      });
      expect(
        tester
            .widgetList<DibaSpinner>(find.byType(DibaSpinner))
            .map((s) => tester.getSize(find.byWidget(s)).width),
        [16, 24, 32, 40],
      );
    });

    testWidgets('in a column that stretches, its own size at the start', (
      tester,
    ) async {
      // A vertical Stack stretches what it holds, as the gallery's cases do.
      await paint(tester, {
        'type': 'Stack',
        'children': [
          n('Spinner', {'label': 'Loading orders'}),
        ],
      });
      final rect = tester.getRect(
        find.descendant(
          of: find.byType(DibaSpinner),
          matching: find.byType(CustomPaint),
        ),
      );
      expect(rect.size, const Size(24, 24));
      expect(rect.left, 20);
    });

    testWidgets('the status\'s solid colour, or the text\'s, over the '
        'off-track ring', (tester) async {
      await paint(tester, {
        'type': 'Stack',
        'children': [
          for (final c in ['accent', 'success', 'warning', 'danger', 'current'])
            n('Spinner', {'color': c}),
        ],
      });
      final spinners = tester
          .widgetList<DibaSpinner>(find.byType(DibaSpinner))
          .toList();
      expect(spinners.map((s) => s.colour), [
        DibaLightColors.primary,
        DibaLightColors.success,
        DibaLightColors.warning,
        DibaLightColors.danger,
        DibaLightNeutrals.foreground,
      ]);
      expect(
        spinners.every((s) => s.track == DibaLightColors.controlTrack),
        isTrue,
      );
      expect(find.byType(CircularProgressIndicator), findsNothing);
      // The painter draws what the widget was given.
      final painter = painterOf(tester) as dynamic;
      expect(painter.colour, DibaLightColors.primary);
      expect(painter.track, DibaLightColors.controlTrack);
    });

    testWidgets('dark: the dark off-track ring', (tester) async {
      await paint(tester, n('Spinner', {}), dark: true);
      expect(
        tester.widget<DibaSpinner>(find.byType(DibaSpinner)).track,
        DibaDarkColors.controlTrack,
      );
    });

    testWidgets('a turn every 750ms, clockwise', (tester) async {
      await paint(tester, n('Spinner', {}));
      RotationTransition turn() => tester.widget<RotationTransition>(
        find.descendant(
          of: find.byType(DibaSpinner),
          matching: find.byType(RotationTransition),
        ),
      );
      final start = turn().turns.value;
      await tester.pump(const Duration(milliseconds: 375));
      expect((turn().turns.value - start) % 1, closeTo(0.5, 0.01));
      await tester.pump(const Duration(milliseconds: 375));
      expect((turn().turns.value - start) % 1, closeTo(0, 0.01));
    });

    testWidgets('still when the platform asks for no animation', (
      tester,
    ) async {
      await paint(tester, n('Spinner', {}), still: true);
      final turns = tester
          .widget<RotationTransition>(
            find.descendant(
              of: find.byType(DibaSpinner),
              matching: find.byType(RotationTransition),
            ),
          )
          .turns;
      final start = turns.value;
      await tester.pump(const Duration(milliseconds: 300));
      expect(turns.value, start);
    });

    testWidgets('a screen reader hears its label, or Diba\'s "loading"', (
      tester,
    ) async {
      await paint(tester, n('Spinner', {'label': 'Loading orders'}));
      expect(find.bySemanticsLabel('Loading orders'), findsOneWidget);
      await paint(tester, n('Spinner', {}));
      expect(find.bySemanticsLabel('Loading'), findsOneWidget);
    });
  });

  group('a progress bar', () {
    testWidgets('its label 14 medium on 1.35 beside its value 14 regular on '
        '1.5, centred, 4 over the track', (tester) async {
      await paint(
        tester,
        n('ProgressBar', {'label': 'Uploading', 'value': 30}),
      );
      final label = tester.getRect(find.text('Uploading'));
      final value = tester.getRect(find.text('30%'));
      final track = tester.getRect(find.byType(LinearProgressIndicator));
      expect(value.height, 21);
      // 14 on a 1.35 line, 18.9; the test font rounds it to 19.
      expect(label.height, closeTo(18.9, 0.15));
      expect(label.center.dy, closeTo(value.center.dy, 1e-9));
      expect(track.top, value.bottom + 4);
      final labelStyle = tester.widget<Text>(find.text('Uploading')).style!;
      expect(labelStyle.fontSize, 14);
      expect(labelStyle.height, 1.35);
      expect(labelStyle.fontWeight, FontWeight.w500);
      final valueStyle = DefaultTextStyle.of(
        tester.element(find.text('30%')),
      ).style;
      expect(valueStyle.fontSize, 14);
      expect(valueStyle.height, 1.5);
      expect(valueStyle.fontWeight, FontWeight.w400);
      // The value at the end.
      expect(value.right, track.right);
    });

    testWidgets('the track 4, 8 or 20 tall by size, round at its ends', (
      tester,
    ) async {
      await paint(tester, {
        'type': 'Stack',
        'children': [
          for (final s in ['sm', 'md', 'lg'])
            n('ProgressBar', {'label': s, 'value': 40, 'size': s}),
        ],
      });
      final bars = find.byType(LinearProgressIndicator);
      expect(
        [for (var i = 0; i < 3; i++) tester.getSize(bars.at(i)).height],
        [4, 8, 20],
      );
      final clips = tester
          .widgetList<ClipRRect>(
            find.ancestor(of: bars, matching: find.byType(ClipRRect)),
          )
          .map((c) => c.borderRadius)
          .toList();
      expect(clips, [
        BorderRadius.circular(4),
        BorderRadius.circular(8),
        BorderRadius.circular(20),
      ]);
    });

    // The accent's and the warning's emphasis in light, where their solid
    // colours were 1.19 and 1.59 from the off-track shade.
    testWidgets('the fill in the status\'s solid colour, the neutral fill '
        'for default, the emphasis for accent and warning in light, over '
        'the off-track shade', (tester) async {
      await paint(tester, {
        'type': 'Stack',
        'children': [
          for (final c in ['default', 'accent', 'success', 'warning', 'danger'])
            n('ProgressBar', {'label': c, 'value': 55, 'color': c}),
        ],
      });
      expect(
        tester
            .widgetList<LinearProgressIndicator>(
              find.byType(LinearProgressIndicator),
            )
            .map((b) => b.color),
        [
          DibaLightNeutrals.fill,
          DibaLightColors.primaryEmphasis,
          DibaLightColors.success,
          DibaLightColors.warningEmphasis,
          DibaLightColors.danger,
        ],
      );
      final theme = Theme.of(tester.element(find.byType(DibaSurface)));
      expect(
        theme.progressIndicatorTheme.linearTrackColor,
        DibaLightColors.controlTrack,
      );
      // Material's 2023 bar, held should Flutter turn the 2024 one on: no
      // gap, no stop dot, square ends inside the round track.
      for (final b in tester.widgetList<LinearProgressIndicator>(
        find.byType(LinearProgressIndicator),
      )) {
        expect(b.trackGap, 0);
        expect(b.stopIndicatorRadius, 0);
        expect(b.borderRadius, BorderRadius.zero);
      }
    });

    testWidgets('indeterminate: Material\'s two lines, and no value', (
      tester,
    ) async {
      await paint(
        tester,
        n('ProgressBar', {'label': 'Working', 'isIndeterminate': true}),
      );
      expect(
        tester
            .widget<LinearProgressIndicator>(
              find.byType(LinearProgressIndicator),
            )
            .value,
        isNull,
      );
      final label = tester.getRect(find.text('Working'));
      final track = tester.getRect(find.byType(LinearProgressIndicator));
      expect(track.top, closeTo(label.bottom + 4, 1e-9));
      expect(find.textContaining('%'), findsNothing);
    });
  });
}
