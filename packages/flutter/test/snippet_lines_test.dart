import 'package:diba/diba.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// A snippet's copy button at the top end, as the web's: on one line it is
/// centred on the words, on several it stays level with the first, the words
/// as far from the frame's foot as the first line is from its head
///.
void main() {
  Future<void> paint(
    WidgetTester tester,
    String words, {
    bool copy = true,
  }) async {
    tester.view
      ..physicalSize = const Size(700, 500)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      MaterialApp(
        theme: DibaTheme.light(),
        locale: const Locale('fa'),
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(
          body: DibaSurface(
            tree: {
              'type': 'Stack',
              'children': [
                {
                  'type': 'Snippet',
                  'props': {'hideCopyButton': !copy},
                  'children': words,
                },
              ],
            },
          ),
        ),
      ),
    );
    await tester.pump();
  }

  Rect frameOf(WidgetTester tester, String words) => tester.getRect(
    find.ancestor(of: find.text(words), matching: find.byType(Container)).first,
  );

  const several = 'cd kits/diba\nbun install\nbun run build';

  testWidgets('several lines: the button at the top end, level with the '
      'first', (tester) async {
    await paint(tester, several);
    final frame = frameOf(tester, several);
    final button = tester.getRect(find.byType(IconButton));
    final words = tester.getRect(find.text(several));
    final line = words.height / 3;
    expect(button.top - frame.top, moreOrLessEquals(6, epsilon: 0.5));
    expect(frame.right - button.right, moreOrLessEquals(12, epsilon: 0.5));
    expect(
      words.top + line / 2,
      moreOrLessEquals(button.center.dy, epsilon: 1),
    );
    expect(
      frame.bottom - words.bottom,
      moreOrLessEquals(words.top - frame.top, epsilon: 1),
    );
  });

  testWidgets('one line: centred on the button', (tester) async {
    await paint(tester, 'bun add diba');
    final button = tester.getRect(find.byType(IconButton));
    final words = tester.getRect(find.text('bun add diba'));
    expect(words.center.dy, moreOrLessEquals(button.center.dy, epsilon: 1));
  });

  testWidgets('with nothing to press, the words keep their own height', (
    tester,
  ) async {
    await paint(tester, 'bun add diba', copy: false);
    final frame = frameOf(tester, 'bun add diba');
    final words = tester.getRect(find.text('bun add diba'));
    expect(frame.height, moreOrLessEquals(words.height + 12, epsilon: 0.5));
  });
}
