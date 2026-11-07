import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../tokens.g.dart';

/// The web's focus ring (`status-focused`): two box shadows round a control,
/// 2 of the page's colour and 2 of the ring's beyond it. Drawn only under
/// keyboard focus, as the web's `:focus-visible` is.
class DibaRingPainter extends CustomPainter {
  DibaRingPainter({
    required this.shape,
    required this.ring,
    required this.page,
    this.height,
  });

  /// The ring for [context]'s theme round [shape].
  factory DibaRingPainter.of(
    BuildContext context,
    ShapeBorder shape, {
    double? height,
  }) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return DibaRingPainter(
      shape: shape,
      ring: dark ? DibaDarkColors.ring : DibaLightColors.ring,
      page: dark ? DibaDarkNeutrals.background : DibaLightNeutrals.background,
      height: height,
    );
  }

  final ShapeBorder shape;
  final Color ring;
  final Color page;

  /// Round the top this tall of what it paints over, when not all of it: a
  /// field's box, and not the notes under it.
  final double? height;

  @override
  void paint(Canvas canvas, Size size) {
    final box = Offset.zero & Size(size.width, height ?? size.height);
    canvas
      ..drawPath(
        shape.getOuterPath(box.inflate(1)),
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2
          ..color = page,
      )
      ..drawPath(
        shape.getOuterPath(box.inflate(3)),
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2
          ..color = ring,
      );
  }

  @override
  bool shouldRepaint(DibaRingPainter old) =>
      old.shape != shape ||
      old.ring != ring ||
      old.page != page ||
      old.height != height;
}

/// Whether the last thing done on the page was a key pressed, when the web's
/// `:focus-visible` shows a ring round what has focus; after a click or a
/// touch it shows none. Flutter's highlight mode counts a mouse as a keyboard,
/// so a select focused by a click was ringed.
bool dibaKeyboardFocus() => _lastInputWasKey;

bool _lastInputWasKey = false;
bool _pointerWatched = false;

bool _onKey(KeyEvent event) {
  if (event is KeyDownEvent) _lastInputWasKey = true;
  return false;
}

void _onPointer(PointerEvent event) {
  if (event is PointerDownEvent) _lastInputWasKey = false;
}

/// Watches for keys and pointers; DibaSurface calls it as it starts, so the
/// first key pressed on a page already counts. The key handler is put back
/// each time, as a test's binding clears them between tests.
void dibaWatchInput() {
  HardwareKeyboard.instance
    ..removeHandler(_onKey)
    ..addHandler(_onKey);
  if (_pointerWatched) return;
  _pointerWatched = true;
  GestureBinding.instance.pointerRouter.addGlobalRoute(_onPointer);
}
