import 'package:diba/diba.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// Diba's own blocks in Diba's look: Image
/// takes the web's numbers, measured on the web on a Persian
/// page. Stack, Text and Spacer already drew them.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    bool dark = false,
  }) async {
    tester.view
      ..physicalSize = const Size(420, 1000)
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
            child: DibaSurface(tree: tree),
          ),
        ),
      ),
    );
    // A picture that cannot be fetched fails a frame or two on.
    await tester.pumpAndSettle();
  }

  Map<String, Object?> n(
    String type,
    Map<String, Object?> props, [
    Object? children,
  ]) => {'type': type, 'props': props, 'children': ?children};

  TextStyle styleOf(WidgetTester tester, String text) =>
      tester.widget<Text>(find.text(text)).style!;

  group('Image', () {
    testWidgets('on the second paper; one with nothing to show says what it '
        'was of, muted, 14 on 21, 12 in', (tester) async {
      await paint(
        tester,
        n('Image', {'alt': 'شال', 'ratio': '1', 'radius': 'full'}),
      );
      expect(
        find.byWidgetPredicate(
          (w) => w is ColoredBox && w.color == DibaLightColors.surface2,
        ),
        findsOneWidget,
      );
      final words = styleOf(tester, 'شال');
      expect(words.fontSize, 14);
      expect(words.height, 21 / 14);
      expect(words.color, DibaLightColors.fgMuted);
      final pad = tester.widget<Padding>(
        find
            .ancestor(of: find.text('شال'), matching: find.byType(Padding))
            .first,
      );
      expect(pad.padding, const EdgeInsets.all(12));
      expect(find.byIcon(Icons.image_outlined), findsNothing);
    });
  });

  // These three are Flutter's look, which the web took; what they are
  // here is what `own.browser.test.tsx` and the components' tests hold it to.
  group('Flutter\'s: Snippet', () {
    testWidgets('a snippet: 12 by 6 in, 12 round on the second surface, left '
        'to right; no symbol unless given', (tester) async {
      await paint(tester, n('Snippet', {}, 'bun add diba'));
      final box = tester.widget<Container>(
        find
            .ancestor(
              of: find.text('bun add diba'),
              matching: find.byType(Container),
            )
            .first,
      );
      expect(
        box.padding,
        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      );
      final d = box.decoration! as BoxDecoration;
      expect(d.borderRadius, BorderRadius.circular(12));
      expect(d.color, DibaLightNeutrals.surfaceSecondary);
      expect(find.byIcon(Icons.copy), findsOneWidget);
      // Left to right: the words at the start and the copy at the frame's
      // end, its padding in, as the web's; it had
      // followed the words. In a Stack, which stretches it, the frame is
      // wider than the words.
      await paint(tester, n('Stack', {}, [n('Snippet', {}, 'bun add diba')]));
      final frame = tester.getRect(
        find
            .ancestor(
              of: find.text('bun add diba'),
              matching: find.byType(Container),
            )
            .first,
      );
      expect(
        tester.getRect(find.byType(IconButton)).right,
        moreOrLessEquals(frame.right - 12),
      );
      expect(
        tester.getRect(find.text('bun add diba')).left,
        moreOrLessEquals(frame.left + 12),
      );
    });
  });
}
