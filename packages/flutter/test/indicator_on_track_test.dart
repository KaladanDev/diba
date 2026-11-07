import 'package:diba/diba.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// A progress bar's and a meter's fill is told from its track by 3 (WCAG
/// 1.4.11), as the web's: in light the accent's gilt and the warning's amber
/// were 1.19 and 1.59 from the off-track shade, so there they take their
/// emphasis; in dark their solid colours already hold it.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    required bool dark,
  }) async {
    tester.view
      ..physicalSize = const Size(900, 900)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      MaterialApp(
        theme: dark ? DibaTheme.dark() : DibaTheme.light(),
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

  double contrast(Color a, Color b) {
    final la = a.computeLuminance();
    final lb = b.computeLuminance();
    final hi = la > lb ? la : lb;
    final lo = la > lb ? lb : la;
    return (hi + 0.05) / (lo + 0.05);
  }

  const colours = ['accent', 'success', 'warning', 'danger'];

  for (final dark in [false, true]) {
    final theme = dark ? 'dark' : 'light';
    final track = dark
        ? DibaDarkColors.controlTrack
        : DibaLightColors.controlTrack;

    testWidgets('$theme: each status bar is 3 from its track', (tester) async {
      await paint(tester, {
        'type': 'Stack',
        'children': [
          for (final c in colours)
            {
              'type': 'ProgressBar',
              'props': {'label': c, 'value': 55, 'color': c},
            },
        ],
      }, dark: dark);
      final fills = tester
          .widgetList<LinearProgressIndicator>(
            find.byType(LinearProgressIndicator),
          )
          .map((b) => b.color!)
          .toList();
      expect(fills, hasLength(colours.length));
      for (final (i, fill) in fills.indexed) {
        expect(
          contrast(fill, track),
          greaterThanOrEqualTo(3),
          reason: '${colours[i]}: $fill on $track',
        );
      }
      if (!dark) {
        expect(fills[0], DibaLightColors.primaryEmphasis);
        expect(fills[2], DibaLightColors.warningEmphasis);
      } else {
        expect(fills[0], DibaDarkColors.primary);
        expect(fills[2], DibaDarkColors.warning);
      }
    });

    testWidgets('$theme: a meter takes the same fills', (tester) async {
      await paint(tester, {
        'type': 'Stack',
        'children': [
          for (final c in ['accent', 'warning'])
            {
              'type': 'Meter',
              'props': {'label': c, 'value': 55, 'color': c},
            },
        ],
      }, dark: dark);
      final painted = tester
          .widgetList<DecoratedBox>(find.byType(DecoratedBox))
          .map((b) => b.decoration)
          .whereType<BoxDecoration>()
          .map((d) => d.color)
          .toSet();
      expect(
        painted,
        containsAll(
          dark
              ? [DibaDarkColors.primary, DibaDarkColors.warning]
              : [
                  DibaLightColors.primaryEmphasis,
                  DibaLightColors.warningEmphasis,
                ],
        ),
      );
    });
  }
}
