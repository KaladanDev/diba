import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:diba/diba.dart';

/// The round trip, from fetch to press to the tree that comes back.
///
/// Deliberately the same cases as `packages/react/src/sdui/extension.test.tsx`.
/// The interesting failures here are about ordering and trust rather than
/// drawing: a tree rendered before it was checked, a stale response landing
/// after a newer one, a press reaching the extension without its context.
/// Stands in for the schema, which has no Dart implementation: anything naming
/// a component the registry does not have is rejected. Enough to prove the
/// widget refuses whatever its validator refuses, which is the contract here.
///
/// Top-level so a tear-off of it is a constant and can be a default argument.
List<String> reject(Object? tree) {
  if (tree is! Map) return ['not an object'];
  final type = tree['type'];
  if (type is! String || !dibaManifest.containsKey(type)) {
    return ['unknown component: $type'];
  }
  return const [];
}

void main() {
  Map<String, Object?> panel(String label) => {
    'type': 'Stack',
    'children': [
      {'type': 'Text', 'children': label},
      {
        'type': 'Button',
        'children': 'چاپ',
        'actions': {
          'onPress': {'do': 'call', 'action': 'label.print'},
        },
      },
    ],
  };

  Future<List<String>> paint(
    WidgetTester tester, {
    required DibaTransport transport,
    DibaValidator validate = reject,
    void Function(DibaEffect)? onEffect,
    DibaHandlers handlers = const DibaHandlers(),
  }) async {
    final refused = <String>[];
    await tester.pumpWidget(
      MaterialApp(
        theme: DibaTheme.light(),
        home: Directionality(
          textDirection: TextDirection.rtl,
          child: Scaffold(
            body: DibaExtension(
              surface: 'order.detail.sidebar',
              context: const {'orderId': 'DB-1041'},
              transport: transport,
              validate: validate,
              handlers: handlers,
              onEffect: onEffect,
              onRefuse: refused.add,
              pending: const Text('در حال بارگذاری'),
              fallback: (reasons) => Text('ناموفق: ${reasons.first}'),
            ),
          ),
        ),
      ),
    );
    return refused;
  }

  group('DibaExtension fetches and renders', () {
    testWidgets('asks for the surface, with the context the host has', (
      tester,
    ) async {
      DibaRequest? seen;
      await paint(
        tester,
        transport: (req) async {
          seen = req;
          return DibaResponse(tree: panel('برچسب'));
        },
      );
      await tester.pumpAndSettle();

      expect(find.text('برچسب'), findsOneWidget);
      expect(seen!.surface, 'order.detail.sidebar');
      expect(seen!.context, {'orderId': 'DB-1041'});
      expect(seen!.call, isNull);
    });

    testWidgets('shows the pending slot until the tree arrives', (
      tester,
    ) async {
      final gate = Completer<DibaResponse>();
      await paint(tester, transport: (_) => gate.future);

      expect(find.text('در حال بارگذاری'), findsOneWidget);
      gate.complete(DibaResponse(tree: panel('رسید')));
      await tester.pumpAndSettle();
      expect(find.text('رسید'), findsOneWidget);
    });
  });

  group('DibaExtension will not render what it has not checked', () {
    testWidgets('refuses an invalid tree whole, and says why', (tester) async {
      final refused = await paint(
        tester,
        transport: (_) async => DibaResponse(tree: {'type': 'Malware'}),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('ناموفق'), findsOneWidget);
      expect(find.byType(FilledButton), findsNothing);
      expect(refused, contains('unknown component: Malware'));
    });

    /// The response channel is not a way around validation, or an extension
    /// could send a good panel and then anything it liked.
    testWidgets('checks the tree that comes back from an action too', (
      tester,
    ) async {
      final refused = await paint(
        tester,
        transport: (req) async => req.call == null
            ? DibaResponse(tree: panel('برچسب'))
            : DibaResponse(tree: {'type': 'Malware'}),
      );
      await tester.pumpAndSettle();
      expect(find.text('برچسب'), findsOneWidget);

      await tester.tap(find.byType(FilledButton));
      await tester.pumpAndSettle();
      expect(find.textContaining('ناموفق'), findsOneWidget);
      expect(refused, contains('unknown component: Malware'));
    });

    testWidgets('survives a transport that throws', (tester) async {
      final refused = await paint(
        tester,
        transport: (_) async => throw StateError('gateway timeout'),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('ناموفق'), findsOneWidget);
      expect(refused.first, contains('gateway timeout'));
    });
  });

  group('DibaExtension sends actions back', () {
    testWidgets('carries the name, the payload and the context', (
      tester,
    ) async {
      DibaRequest? last;
      await paint(
        tester,
        transport: (req) async {
          last = req;
          return DibaResponse(tree: panel(req.call == null ? 'اول' : 'دوم'));
        },
      );
      await tester.pumpAndSettle();
      await tester.tap(find.byType(FilledButton));
      await tester.pumpAndSettle();

      expect(last!.call!.name, 'label.print');
      expect(last!.call!.payload, isEmpty);
      expect(last!.context, {'orderId': 'DB-1041'});
      expect(find.text('دوم'), findsOneWidget);
      expect(find.text('اول'), findsNothing);
    });

    testWidgets('leaves the panel alone when no tree comes back', (
      tester,
    ) async {
      await paint(
        tester,
        transport: (req) async => req.call == null
            ? DibaResponse(tree: panel('برچسب'))
            : const DibaResponse(),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.byType(FilledButton));
      await tester.pumpAndSettle();
      expect(find.text('برچسب'), findsOneWidget);
    });

    /// A slow first fetch landing after a fast second one would put the stale
    /// panel back — only visible on a bad connection, which is where it counts.
    ///
    /// The first version of this test never issued a second request, so it
    /// completed one future and asserted the result appeared: the normal path,
    /// dressed as a race. Two surfaces are what actually makes it one.
    testWidgets('ignores a slow response the newer one has overtaken', (
      tester,
    ) async {
      final slow = Completer<DibaResponse>();

      Widget app(String surface) => MaterialApp(
        home: Directionality(
          textDirection: TextDirection.rtl,
          child: Scaffold(
            body: DibaExtension(
              surface: surface,
              validate: reject,
              transport: (req) => req.surface == 'slow'
                  ? slow.future
                  : Future.value(DibaResponse(tree: panel('تازه'))),
            ),
          ),
        ),
      );

      await tester.pumpWidget(app('slow'));
      await tester.pump();

      // The surface changes before the first request has answered.
      await tester.pumpWidget(app('fast'));
      await tester.pumpAndSettle();
      expect(find.text('تازه'), findsOneWidget);

      // And the overtaken response must not put its panel back.
      slow.complete(DibaResponse(tree: panel('کهنه')));
      await tester.pumpAndSettle();
      expect(find.text('تازه'), findsOneWidget);
      expect(find.text('کهنه'), findsNothing);
    });
  });

  group('DibaExtension and host effects', () {
    testWidgets('hands a toast to the host', (tester) async {
      DibaEffect? got;
      await paint(
        tester,
        transport: (_) async => DibaResponse(
          tree: panel('x'),
          effect: const DibaEffect(status: 'success', title: 'چاپ شد'),
        ),
        onEffect: (e) => got = e,
      );
      await tester.pumpAndSettle();
      expect(got!.title, 'چاپ شد');
      expect(got!.status, 'success');
    });

    testWidgets('holds an effect navigate to the same rule as the verb', (
      tester,
    ) async {
      DibaEffect? got;
      final refused = await paint(
        tester,
        transport: (_) async => const DibaResponse(
          effect: DibaEffect(navigate: 'javascript:alert(1)', title: 'ok'),
        ),
        onEffect: (e) => got = e,
      );
      await tester.pumpAndSettle();

      // The toast still arrives; only the URL is dropped.
      expect(got!.title, 'ok');
      expect(got!.navigate, isNull);
      expect(refused.first, contains('refused URL'));
    });

    testWidgets('lets a safe effect navigate through', (tester) async {
      DibaEffect? got;
      await paint(
        tester,
        transport: (_) async =>
            const DibaResponse(effect: DibaEffect(navigate: '/orders/DB-1041')),
        onEffect: (e) => got = e,
      );
      await tester.pumpAndSettle();
      expect(got!.navigate, '/orders/DB-1041');
    });
  });

  /// A new context is a new panel, as the web's re-fetches: the host moving
  /// to another order must not keep the last one's (2026-11-07). Only a new
  /// surface had re-fetched.
  testWidgets('asks again when the context changes', (tester) async {
    final asked = <Object?>[];
    Widget host(String order) => MaterialApp(
      theme: DibaTheme.light(),
      home: Scaffold(
        body: DibaExtension(
          surface: 'order.detail.sidebar',
          context: {'orderId': order},
          transport: (req) async {
            asked.add(req.context?['orderId']);
            return DibaResponse(
              tree: panel('سفارش ${req.context?['orderId']}'),
            );
          },
          validate: reject,
        ),
      ),
    );
    await tester.pumpWidget(host('DB-1041'));
    await tester.pumpAndSettle();
    await tester.pumpWidget(host('DB-1042'));
    await tester.pumpAndSettle();
    expect(asked, ['DB-1041', 'DB-1042']);
    expect(find.text('سفارش DB-1042'), findsOneWidget);

    await tester.pumpWidget(host('DB-1042'));
    await tester.pumpAndSettle();
    expect(asked, ['DB-1041', 'DB-1042']);
  });
}
