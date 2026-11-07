import 'package:diba/diba.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// A checkbox or radio option is one target: its
/// control, label and description, wrapped to their width. Anywhere on it the
/// pointer is the hand, the state layer shows and a press chooses; off it,
/// nothing answers. The web holds the same in checkbox.browser.test.tsx.
void main() {
  final layer = find.byKey(const ValueKey('diba-choice-layer'));

  Future<void> paint(WidgetTester tester, Map<String, Object?> tree) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: DibaTheme.light(),
        locale: const Locale('en'),
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
    await tester.pump();
  }

  Future<TestGesture> mouse(WidgetTester tester) async {
    final gesture = await tester.createGesture(
      kind: PointerDeviceKind.mouse,
      pointer: 1,
    );
    await gesture.addPointer(location: Offset.zero);
    addTearDown(gesture.removePointer);
    return gesture;
  }

  MouseCursor cursor() =>
      RendererBinding.instance.mouseTracker.debugDeviceActiveCursor(1)!;

  /// The empty end of the row the option sits in.
  Offset emptyEnd(WidgetTester tester, Finder label) => Offset(
    tester.getSize(find.byType(Scaffold)).width - 30,
    tester.getCenter(label).dy,
  );

  final checkbox = {
    'type': 'Checkbox',
    'props': {'label': 'Insure the parcel', 'description': 'Up to 50M toman'},
  };

  final radios = {
    'type': 'RadioGroup',
    'props': {'label': 'Shipping'},
    'children': [
      {
        'type': 'Radio',
        'props': {'value': 'tipax', 'label': 'Tipax', 'description': '2 days'},
      },
      {
        'type': 'Radio',
        'props': {'value': 'post', 'label': 'Post', 'description': '5 days'},
      },
    ],
  };

  final boxGroup = {
    'type': 'CheckboxGroup',
    'props': {'label': 'Sizes'},
    'children': [
      {
        'type': 'Checkbox',
        'props': {'label': 'Small', 'value': 's', 'description': 'S only'},
      },
    ],
  };

  bool? checked(WidgetTester tester) =>
      tester.widget<Checkbox>(find.byType(Checkbox).first).value;
  String? chosen(WidgetTester tester) => RadioGroup.maybeOf<String>(
    tester.element(find.byType(Radio<String>).first),
  )?.groupValue;

  group('a press anywhere on an option chooses it, and nowhere else', () {
    testWidgets('a checkbox: its label and its description', (tester) async {
      await paint(tester, checkbox);
      await tester.tap(find.text('Insure the parcel'));
      await tester.pump();
      expect(checked(tester), isTrue);
      await tester.tap(find.text('Up to 50M toman'));
      await tester.pump();
      expect(checked(tester), isFalse);
    });

    testWidgets('a checkbox: not the empty rest of its row', (tester) async {
      await paint(tester, checkbox);
      await tester.tapAt(emptyEnd(tester, find.text('Insure the parcel')));
      await tester.pump();
      expect(checked(tester), isFalse);
    });

    testWidgets('a radio: its label and its description', (tester) async {
      await paint(tester, radios);
      await tester.tap(find.text('Post'));
      await tester.pump();
      expect(chosen(tester), 'post');
      await tester.tap(find.text('2 days'));
      await tester.pump();
      expect(chosen(tester), 'tipax');
    });

    testWidgets('a radio: not the empty rest of its row', (tester) async {
      await paint(tester, radios);
      await tester.tapAt(emptyEnd(tester, find.text('Post')));
      await tester.pump();
      expect(chosen(tester), isNull);
    });

    testWidgets("a group's box: its description too", (tester) async {
      await paint(tester, boxGroup);
      await tester.tap(find.text('S only'));
      await tester.pump();
      expect(checked(tester), isTrue);
    });
  });

  group('the pointer and the state layer say the same', () {
    testWidgets('over the words: the hand and the circle', (tester) async {
      await paint(tester, checkbox);
      final gesture = await mouse(tester);

      await gesture.moveTo(tester.getCenter(find.text('Up to 50M toman')));
      await tester.pump();
      expect(cursor(), SystemMouseCursors.click);
      expect(layer, findsOneWidget);
      // An empty box's hover: 8% of the text colour, centred on the box.
      final scheme = DibaTheme.light().colorScheme;
      expect(
        tester.renderObject(layer),
        paints..path(color: scheme.onSurface.withValues(alpha: 0.08)),
      );
      expect(tester.getSize(layer), const Size(40, 40));
      expect(tester.getCenter(layer), tester.getCenter(find.byType(Checkbox)));

      // The words darken an empty box's edge as a hover on the box does.
      expect(
        tester.widget<Checkbox>(find.byType(Checkbox)).side,
        BorderSide(width: 2, color: scheme.onSurface),
      );

      // Over the box itself Flutter draws its own layer, so this one goes.
      await gesture.moveTo(tester.getCenter(find.byType(Checkbox)));
      await tester.pump();
      expect(cursor(), SystemMouseCursors.click);
      expect(layer, findsNothing);
    });

    testWidgets('off the option: the plain pointer, no circle', (tester) async {
      await paint(tester, radios);
      final gesture = await mouse(tester);
      await gesture.moveTo(emptyEnd(tester, find.text('Post')));
      await tester.pump();
      expect(cursor(), SystemMouseCursors.basic);
      expect(layer, findsNothing);
    });

    testWidgets('a chosen radio hovers in 8% of the primary', (tester) async {
      await paint(tester, {
        ...radios,
        'props': {'label': 'Shipping', 'defaultValue': 'tipax'},
      });
      final gesture = await mouse(tester);
      await gesture.moveTo(tester.getCenter(find.text('Tipax')));
      await tester.pump();
      expect(
        tester.renderObject(layer),
        paints..path(
          color: DibaTheme.light().colorScheme.primary.withValues(alpha: 0.08),
        ),
      );
    });

    testWidgets('a disabled option: the plain pointer, no circle, no press', (
      tester,
    ) async {
      await paint(tester, {
        'type': 'Checkbox',
        'props': {'label': 'Disabled', 'isDisabled': true},
      });
      final gesture = await mouse(tester);
      for (final at in [
        tester.getCenter(find.text('Disabled')),
        tester.getCenter(find.byType(Checkbox)),
      ]) {
        await gesture.moveTo(at);
        await tester.pump();
        expect(cursor(), SystemMouseCursors.basic);
        expect(layer, findsNothing);
      }
      await tester.tap(find.text('Disabled'));
      await tester.pump();
      expect(checked(tester), isFalse);
    });
  });

  group('disabled, a choice fades as a whole, as on the web', () {
    double fadeOver(WidgetTester tester, Finder control) => tester
        .widget<Opacity>(
          find.ancestor(of: control, matching: find.byType(Opacity)).first,
        )
        .opacity;

    testWidgets('a checkbox: the box, its usual edge, its words at half', (
      tester,
    ) async {
      await paint(tester, {
        'type': 'Checkbox',
        'props': {'label': 'Disabled', 'isDisabled': true},
      });
      expect(fadeOver(tester, find.byType(Checkbox)), 0.5);
      expect(fadeOver(tester, find.text('Disabled')), 0.5);
      // Its usual muted edge, not Material's faint disabled one, faded twice.
      expect(
        tester.widget<Checkbox>(find.byType(Checkbox)).side,
        BorderSide(
          width: 2,
          color: DibaTheme.light().colorScheme.onSurfaceVariant,
        ),
      );
    });

    testWidgets("a group's boxes and a group's radios", (tester) async {
      await paint(tester, {
        'type': 'Stack',
        'children': [
          {
            ...boxGroup,
            'props': {'label': 'Sizes', 'isDisabled': true},
          },
          {
            ...radios,
            'props': {'label': 'Shipping', 'isDisabled': true},
          },
        ],
      });
      expect(fadeOver(tester, find.byType(Checkbox)), 0.5);
      // The group's own label fades too, as the web's does.
      expect(fadeOver(tester, find.text('Sizes')), 0.5);
      expect(fadeOver(tester, find.text('Shipping')), 0.5);
      for (final radio in find.byType(Radio<String>).evaluate()) {
        expect(
          fadeOver(tester, find.byWidget(radio.widget)),
          0.5,
          reason: 'every radio of a disabled group',
        );
      }
    });

    testWidgets('an enabled choice does not fade', (tester) async {
      await paint(tester, checkbox);
      expect(
        find.ancestor(
          of: find.byType(Checkbox),
          matching: find.byType(Opacity),
        ),
        findsNothing,
      );
    });
  });

  group('a switch is one option too', () {
    final aSwitch = {
      'type': 'Switch',
      'props': {'label': 'Test mode', 'description': 'Orders are not real.'},
    };
    bool on(WidgetTester tester) =>
        tester.widget<Switch>(find.byType(Switch)).value;

    testWidgets('its label and its description turn it; its row does not', (
      tester,
    ) async {
      await paint(tester, aSwitch);
      await tester.tap(find.text('Test mode'));
      await tester.pumpAndSettle();
      expect(on(tester), isTrue);
      await tester.tap(find.text('Orders are not real.'));
      await tester.pumpAndSettle();
      expect(on(tester), isFalse);
      await tester.tapAt(emptyEnd(tester, find.text('Test mode')));
      await tester.pumpAndSettle();
      expect(on(tester), isFalse);
    });

    testWidgets(
      'over its words, the circle is on the thumb, and at its end once turned',
      (tester) async {
        await paint(tester, aSwitch);
        final gesture = await mouse(tester);
        await gesture.moveTo(
          tester.getCenter(find.text('Orders are not real.')),
        );
        await tester.pump();
        expect(cursor(), SystemMouseCursors.click);

        // The box is 52 by 32; the thumb's centre is 18 in when off, 34 when on.
        final box = tester.getTopLeft(
          find
              .ancestor(
                of: find.byType(Switch),
                matching: find.byType(SizedBox),
              )
              .first,
        );
        expect(tester.getSize(layer), const Size(32, 32));
        expect(tester.getCenter(layer).dx, closeTo(box.dx + 18, 0.5));

        await tester.tap(find.text('Test mode'));
        // While the thumb travels the circle steps aside, then comes back at
        // the thumb's new end.
        await tester.pump(const Duration(milliseconds: 100));
        expect(layer, findsNothing);
        await tester.pumpAndSettle();
        expect(tester.getCenter(layer).dx, closeTo(box.dx + 34, 0.5));
        // Over the track around the thumb, not on it: a hole the thumb's
        // size, 9.6 across the middle of the 32 circle.
        expect(
          tester.renderObject(layer),
          paints..path(
            color: DibaTheme.light().colorScheme.primary.withValues(
              alpha: 0.08,
            ),
            includes: [const Offset(16, 2), const Offset(16 + 12, 16)],
            excludes: [const Offset(16, 16), const Offset(16 + 9, 16)],
          ),
        );
      },
    );

    testWidgets("disabled, it fades as a whole, as the web's does", (
      tester,
    ) async {
      await paint(tester, {
        'type': 'Switch',
        'props': {'label': 'Test mode', 'isDisabled': true},
      });
      final fade = find.ancestor(
        of: find.byType(Switch),
        matching: find.byType(Opacity),
      );
      expect(tester.widget<Opacity>(fade.first).opacity, 0.5);
      // The words fade with it, so they keep the text colour themselves.
      expect(
        find.ancestor(of: find.text('Test mode'), matching: fade.first),
        findsOneWidget,
      );
      await tester.tap(find.text('Test mode'));
      await tester.pumpAndSettle();
      expect(on(tester), isFalse);
    });
  });
}
