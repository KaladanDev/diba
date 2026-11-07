import 'package:diba/diba.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

/// The avatar in Diba's look: a soft tint per person, with presence and a
/// gilt ring. Every number is the web's; `alert.browser.test.tsx` holds the
/// web to the same.
void main() {
  Future<void> paint(
    WidgetTester tester,
    Map<String, Object?> tree, {
    bool dark = false,
    String lang = 'fa',
  }) async {
    tester.view
      ..physicalSize = const Size(1024, 900)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      MaterialApp(
        theme: dark ? DibaTheme.dark() : DibaTheme.light(),
        locale: Locale(lang),
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

  Map<String, Object?> avatar(Map<String, Object?> props) => {
    'type': 'Avatar',
    'props': props,
  };
  Map<String, Object?> row(List<Map<String, Object?>> children) => {
    'type': 'Stack',
    'props': {'direction': 'horizontal'},
    'children': children,
  };
  const people = ['نیلوفر رستمی', 'امید کاظمی', 'سارا احمدی', 'رضا', 'مینا'];

  /// The faces, in order: the circles an avatar fills.
  List<DecoratedBox> faces(WidgetTester tester) => tester
      .widgetList<DecoratedBox>(
        find.byWidgetPredicate(
          (w) =>
              w is DecoratedBox &&
              w.decoration is BoxDecoration &&
              (w.decoration as BoxDecoration).shape == BoxShape.circle &&
              (w.decoration as BoxDecoration).color != null &&
              (w.decoration as BoxDecoration).border == null,
        ),
      )
      .toList();
  Color fillOf(DecoratedBox box) => (box.decoration as BoxDecoration).color!;

  /// The dots: circles with a 2 border in the surface.
  final dots = find.byWidgetPredicate(
    (w) =>
        w is DecoratedBox &&
        w.decoration is BoxDecoration &&
        (w.decoration as BoxDecoration).color != null &&
        (w.decoration as BoxDecoration).border != null,
  );

  /// The gilt rings: circles with a border and no fill.
  final rings = find.byWidgetPredicate(
    (w) =>
        w is DecoratedBox &&
        w.decoration is BoxDecoration &&
        (w.decoration as BoxDecoration).color == null &&
        (w.decoration as BoxDecoration).border != null,
  );

  double contrast(Color a, Color b) {
    final la = a.computeLuminance(), lb = b.computeLuminance();
    return (la > lb ? la + 0.05 : lb + 0.05) /
        (la > lb ? lb + 0.05 : la + 0.05);
  }

  testWidgets('a circle 32, 40 or 48 across, its initials 12, 14 or 17 and '
      'medium, kept apart', (tester) async {
    await paint(
      tester,
      row([
        for (final size in ['sm', 'md', 'lg'])
          avatar({'name': 'نیلوفر رستمی', 'size': size}),
      ]),
    );
    final initials = find.text('ن‌ر');
    expect(initials, findsNWidgets(3));
    final boxes = faces(tester);
    for (final (i, (size, font)) in [
      (32.0, 12.0),
      (40.0, 14.0),
      (48.0, 17.0),
    ].indexed) {
      expect(tester.getSize(find.byWidget(boxes[i])), Size(size, size));
      final style = tester.widget<Text>(initials.at(i)).style!;
      expect(style.fontSize, font);
      expect(style.fontWeight, FontWeight.w500);
      expect(style.height, 1);
      // Centred on the face.
      expect(
        tester.getCenter(initials.at(i)).dy,
        closeTo(tester.getCenter(find.byWidget(boxes[i])).dy, 0.5),
      );
    }
  });

  for (final dark in [false, true]) {
    testWidgets('${dark ? 'dark' : 'light'}: each name its hue\'s tint and '
        'ink, readable at AA', (tester) async {
      // Omid Kazemi is saffron's name in the fixture.
      final names = [...people, 'Omid Kazemi'];
      await paint(
        tester,
        row([
          for (final name in names) avatar({'name': name}),
        ]),
        dark: dark,
      );
      final surface = dark
          ? DibaDarkNeutrals.surface
          : DibaLightNeutrals.surface;
      final text = dark
          ? DibaDarkNeutrals.foreground
          : DibaLightNeutrals.foreground;
      final hues = {
        'saffron': DibaPalette.saffron600,
        'garnet': DibaPalette.garnet500,
        'emerald': DibaPalette.emerald600,
        'sky': DibaPalette.sky600,
        'iris': DibaPalette.iris500,
      };
      final seen = <String>{};
      final boxes = faces(tester);
      for (final (i, name) in names.indexed) {
        final hue = dibaHueOf(name);
        seen.add(hue);
        final fill = Color.lerp(surface, hues[hue], dark ? 0.30 : 0.18)!;
        final ink = Color.lerp(text, hues[hue], dark ? 0.55 : 0.62)!;
        expect(fillOf(boxes[i]), fill, reason: name);
        final words = tester.widget<Text>(find.text(initialsOf(name)));
        expect(words.style!.color, ink, reason: name);
        expect(contrast(fill, ink), greaterThanOrEqualTo(4.5), reason: name);
      }
      expect(seen, hues.keys.toSet());
    });
  }

  testWidgets("a colour from the tree is Diba's status tone, on the neutral "
      'fill or its own tint', (tester) async {
    await paint(
      tester,
      row([
        avatar({'name': 'امید کاظمی', 'color': 'default'}),
        avatar({'name': 'امید کاظمی', 'color': 'accent'}),
        avatar({'name': 'امید کاظمی', 'color': 'success', 'variant': 'soft'}),
        avatar({'name': 'امید کاظمی', 'color': 'accent', 'variant': 'soft'}),
      ]),
      dark: true,
    );
    final boxes = faces(tester);
    final inks = tester
        .widgetList<Text>(find.text('ا‌ک'))
        .map((t) => t.style!.color)
        .toList();
    final tones = DibaStatusColors.dark;
    expect(fillOf(boxes[0]), DibaDarkNeutrals.fill);
    expect(inks[0], DibaDarkNeutrals.fillForeground);
    expect(fillOf(boxes[1]), DibaDarkNeutrals.fill);
    expect(inks[1], tones.accent.ink);
    expect(fillOf(boxes[2]), tones.success.soft);
    expect(inks[2], tones.success.ink);
    expect(fillOf(boxes[3]), tones.accent.soft);
    expect(inks[3], tones.accent.ink);
  });

  testWidgets('a presence dot at the bottom of the end side, read after the '
      'name; a gilt ring 2 out', (tester) async {
    await paint(
      tester,
      row([
        avatar({'name': people[0], 'presence': 'online', 'size': 'sm'}),
        avatar({'name': people[1], 'presence': 'away'}),
        avatar({
          'name': people[2],
          'presence': 'busy',
          'size': 'lg',
          'isRinged': true,
        }),
        avatar({'name': people[3], 'presence': 'offline'}),
      ]),
    );
    final boxes = faces(tester);
    final tones = DibaStatusColors.light;
    for (final (i, (size, colour, word)) in [
      (10.0, tones.success.solid, 'آنلاین'),
      (12.0, tones.warning.solid, 'غایب'),
      (14.0, tones.danger.solid, 'مشغول'),
      (12.0, DibaLightNeutrals.muted, 'آفلاین'),
    ].indexed) {
      final dot = dots.at(i);
      final d = tester.getRect(dot);
      final f = tester.getRect(find.byWidget(boxes[i]));
      expect(d.size, Size(size, size));
      // Persian: the end side is the left.
      expect(d.left, f.left);
      expect(d.bottom, f.bottom);
      final decoration =
          tester.widget<DecoratedBox>(dot).decoration as BoxDecoration;
      expect(decoration.color, colour);
      expect(
        decoration.border,
        Border.all(color: DibaLightNeutrals.surface, width: 2),
      );
      expect(find.bySemanticsLabel('${people[i]}، $word'), findsOneWidget);
    }
    expect(rings, findsOneWidget);
    final ring = tester.getRect(rings);
    final face = tester.getRect(find.byWidget(boxes[2]));
    expect(ring, face.inflate(4));
    expect(
      (tester.widget<DecoratedBox>(rings).decoration as BoxDecoration).border,
      Border.all(color: DibaLightColors.primary, width: 2),
    );
  });

  testWidgets('a stack: a quarter over, no dots or rings, then "+2 more" 6 '
      'after it', (tester) async {
    await paint(tester, {
      'type': 'AvatarGroup',
      'props': {'max': 3, 'size': 'lg'},
      'children': [
        for (final (i, name) in people.indexed)
          avatar({'name': name, 'presence': 'online', 'isRinged': i == 0}),
      ],
    });
    final boxes = faces(tester);
    expect(boxes, hasLength(3));
    expect(dots, findsNothing);
    expect(rings, findsNothing);
    final rects = [for (final b in boxes) tester.getRect(find.byWidget(b))];
    // Right to left: each 12 (a quarter of 48) over the one before it.
    expect(rects[0].left - rects[1].right, -12);
    expect(rects[1].left - rects[2].right, -12);
    final count = find.text('+۲ نفر');
    expect(count, findsOneWidget);
    final pill = find
        .ancestor(of: count, matching: find.byType(Container))
        .first;
    final p = tester.getRect(pill);
    expect(rects[2].left - p.right, 6);
    expect(p.height, 40);
    expect(p.center.dy, rects[2].center.dy);
    final style = tester.widget<Text>(count).style!;
    expect(style.fontSize, 14);
    expect(style.fontWeight, FontWeight.w500);
    expect(
      style.color,
      Color.lerp(DibaLightNeutrals.foreground, DibaPalette.saffron600, 0.62),
    );
    final shape = tester.widget<Container>(pill).decoration! as ShapeDecoration;
    expect(shape.shape, const StadiumBorder());
    expect(
      shape.color,
      Color.lerp(DibaLightNeutrals.surface, DibaPalette.saffron600, 0.18),
    );
    expect(
      tester.widget<Container>(pill).padding,
      const EdgeInsets.symmetric(horizontal: 12),
    );
  });

  testWidgets('a ringed stack: each seam in the page\'s colour, 2 round, the '
      'stack no bigger', (tester) async {
    await paint(tester, {
      'type': 'AvatarGroup',
      'props': {'overlap': 'ring'},
      'children': [
        for (final name in people.take(3)) avatar({'name': name}),
      ],
    });
    final seams = find.byWidgetPredicate(
      (w) =>
          w is DecoratedBox &&
          w.decoration is BoxDecoration &&
          (w.decoration as BoxDecoration).color == DibaLightNeutrals.background,
    );
    expect(seams, findsNWidgets(3));
    final boxes = faces(
      tester,
    ).where((b) => fillOf(b) != DibaLightNeutrals.background).toList();
    expect(boxes, hasLength(3));
    expect(
      tester.getRect(seams.first),
      tester.getRect(find.byWidget(boxes.first)).inflate(2),
    );
  });

  testWidgets('a grid: 12 apart, with the dots and the ring; in English, '
      '"+1 more"', (tester) async {
    await paint(tester, {
      'type': 'AvatarGroup',
      'props': {'isGrid': true, 'max': 4},
      'children': [
        for (final (i, name) in people.indexed)
          avatar({'name': name, 'presence': 'online', 'isRinged': i == 0}),
      ],
    }, lang: 'en');
    final boxes = faces(tester);
    final a = tester.getRect(find.byWidget(boxes[0]));
    final b = tester.getRect(find.byWidget(boxes[1]));
    expect(b.left - a.right, 12);
    expect(dots, findsNWidgets(4));
    expect(rings, findsOneWidget);
    expect(find.text('+1 more'), findsOneWidget);
  });
}
