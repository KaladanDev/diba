import 'package:diba/diba.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// group 7, Diba's own blocks, in Material 3 with Diba's theme, their
/// props the web's. `own.browser.test.tsx` holds the web's.
void main() {
  Future<List<(String, Object?)>> paint(
    WidgetTester tester,
    Map<String, Object?> node, {
    List<String> events = const [],
  }) async {
    final sent = <(String, Object?)>[];
    tester.view
      ..physicalSize = const Size(1024, 900)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      MaterialApp(
        theme: DibaTheme.light(),
        locale: const Locale('fa'),
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: DibaSurface(
              tree: {
                ...node,
                if (events.isNotEmpty)
                  'actions': {
                    for (final e in events)
                      e: {'do': 'call', 'action': e, 'value': 'v'},
                  },
              },
              handlers: DibaHandlers(call: (a, p) => sent.add((a, p['v']))),
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
    return sent;
  }

  Map<String, Object?> text(
    String s, [
    Map<String, Object?> props = const {},
  ]) => {'type': 'Text', 'props': props, 'children': s};

  testWidgets('a stack is a row 8 apart for gap 2; wrapping, a Wrap', (
    tester,
  ) async {
    await paint(tester, {
      'type': 'Stack',
      'children': [
        {
          'type': 'Stack',
          'props': {'direction': 'horizontal', 'gap': 2, 'align': 'center'},
          'children': [text('الف'), text('ب')],
        },
        {
          'type': 'Stack',
          'props': {'direction': 'horizontal', 'gap': 2, 'wrap': true},
          'children': [text('ج'), text('د')],
        },
      ],
    });
    final row = tester.widget<Row>(
      find.ancestor(of: find.text('الف'), matching: find.byType(Row)).first,
    );
    expect(row.spacing, 8);
    expect(tester.widget<Wrap>(find.byType(Wrap)).spacing, 8);
  });

  testWidgets('a spacer is 32 for size 8, across for inline', (tester) async {
    await paint(tester, {
      'type': 'Stack',
      'children': [
        {
          'type': 'Spacer',
          'props': {'size': 8},
        },
      ],
    });
    expect(
      find.byWidgetPredicate((w) => w is SizedBox && w.height == 32),
      findsOneWidget,
    );
  });

  testWidgets('a heading at its level, v3\'s size, the muted ink, a clamp, '
      'a mono code, a number in Persian digits with the toman', (tester) async {
    await paint(tester, {
      'type': 'Stack',
      'children': [
        text('سفارش‌ها', {'size': '2xl', 'headingLevel': 2}),
        text('متن', {'tone': 'muted', 'maxLines': 2}),
        text('SKU-1', {'isMono': true, 'dir': 'ltr'}),
        {
          'type': 'Text',
          'props': {
            'number': 1240000,
            'formatStyle': 'currency',
            'currency': 'IRT',
          },
        },
      ],
    });
    final heading = tester.widget<Text>(find.text('سفارش‌ها'));
    expect(heading.style!.fontSize, 24);
    expect(
      find.ancestor(
        of: find.text('سفارش‌ها'),
        matching: find.byWidgetPredicate(
          (w) => w is Semantics && (w.properties.header ?? false),
        ),
      ),
      findsOneWidget,
    );
    final muted = tester.widget<Text>(find.text('متن'));
    expect(muted.style!.color, DibaLightNeutrals.muted);
    expect(muted.maxLines, 2);
    expect(muted.overflow, TextOverflow.ellipsis);
    final mono = tester.widget<Text>(find.text('SKU-1'));
    expect(mono.style!.fontFamily, DibaFonts.mono);
    expect(
      find.ancestor(
        of: find.text('SKU-1'),
        matching: find.byType(Directionality),
      ),
      findsWidgets,
    );
    expect(find.textContaining('۱٬۲۴۰٬۰۰۰'), findsOneWidget);
  });

  testWidgets('a picture 12 round for md, square at its ratio', (tester) async {
    await paint(tester, {
      'type': 'Image',
      'props': {'alt': 'شال', 'ratio': '16/9'},
    });
    final clip = tester.widget<ClipRRect>(find.byType(ClipRRect).first);
    expect(clip.borderRadius, BorderRadius.circular(12));
    expect(
      tester.widget<AspectRatio>(find.byType(AspectRatio)).aspectRatio,
      16 / 9,
    );
  });

  testWidgets('a snippet: monospaced, left to right, a copy button that '
      'sends what it copied', (tester) async {
    // The test platform answers no clipboard; it is told to here.
    tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
      SystemChannels.platform,
      (call) async => null,
    );
    addTearDown(
      () => tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
        SystemChannels.platform,
        null,
      ),
    );
    final sent = await paint(
      tester,
      {
        'type': 'Snippet',
        'props': {'variant': 'secondary', 'copyText': 'bun add diba'},
        'children': 'bun add diba',
      },
      events: ['onCopy'],
    );
    expect(
      tester.widget<Text>(find.text('bun add diba')).style!.fontFamily,
      DibaFonts.mono,
    );
    await tester.tap(find.byIcon(Icons.copy));
    await tester.pumpAndSettle();
    expect(sent.last.$2, 'bun add diba');
    expect(find.byIcon(Icons.check), findsOneWidget);
  });
}
