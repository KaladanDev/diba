import 'package:flutter/material.dart';

import '../tokens.g.dart';

/// Where a floating panel sits against its trigger, in the schema's words.
///
/// `bottom end` puts the panel under the trigger with their end edges lined
/// up; `start` puts it beside the trigger on the reading-start side. The words
/// are directional, so they mirror under right-to-left.
///
/// Material's MenuAnchor cannot say most of these. Its `alignment` picks a
/// point on the anchor where the menu's *top-start corner* goes, and the menu
/// only ever opens downward from there, flipping when it runs out of room. An
/// end-aligned menu needs the menu's own width, and a top placement its own
/// height — neither of which MenuAnchor's alignment can know. RawMenuAnchor's
/// overlayBuilder hands over the anchor's rect, and a single-child layout
/// knows the panel's size, which is everything this needs.
class DibaPlacement {
  const DibaPlacement(this.side, this.align);

  /// top, bottom, start or end.
  final String side;

  /// start, center or end, along that side.
  final String align;

  /// Reads "bottom end", "top", "start start" … with anything unknown falling
  /// back to [fallback].
  factory DibaPlacement.parse(String? value, DibaPlacement fallback) {
    if (value == null) return fallback;
    final parts = value.split(RegExp(r'[\s-]+'));
    const sides = {'top', 'bottom', 'start', 'end'};
    if (!sides.contains(parts.first)) return fallback;
    final align =
        parts.length > 1 && {'start', 'center', 'end'}.contains(parts[1])
        ? parts[1]
        : 'center';
    return DibaPlacement(parts.first, align);
  }
}

class _PlacedLayout extends SingleChildLayoutDelegate {
  _PlacedLayout({
    required this.anchor,
    required this.placement,
    required this.direction,
    required this.gap,
    this.minWidth = 0,
    this.maxWidth = double.infinity,
  });

  final Rect anchor;
  final DibaPlacement placement;
  final TextDirection direction;
  final double gap;
  final double minWidth;
  final double maxWidth;

  @override
  BoxConstraints getConstraintsForChild(BoxConstraints constraints) {
    final room = BoxConstraints.loose(
      constraints.biggest,
    ).deflate(const EdgeInsets.all(8));
    return room.copyWith(
      minWidth: minWidth.clamp(0, room.maxWidth),
      maxWidth: maxWidth.clamp(minWidth.clamp(0, room.maxWidth), room.maxWidth),
    );
  }

  @override
  Offset getPositionForChild(Size size, Size child) => place(size, child).at;

  /// Where the panel goes, and the physical side of the trigger it ended up
  /// on: its own, or the other when it does not fit on its own and the other
  /// has more room, as React Aria turns the web's. It keeps 8 clear of
  /// the window's edges across, and along only when it fits on neither side.
  ({Offset at, String side}) place(Size size, Size child) {
    final rtl = direction == TextDirection.rtl;
    // Physical sides, after mirroring.
    String physical(String side) => switch (side) {
      'start' => rtl ? 'right' : 'left',
      'end' => rtl ? 'left' : 'right',
      _ => side,
    };
    var side = physical(placement.side);
    final room = {
      'top': anchor.top - gap,
      'bottom': size.height - anchor.bottom - gap,
      'left': anchor.left - gap,
      'right': size.width - anchor.right - gap,
    };
    const opposite = {
      'top': 'bottom',
      'bottom': 'top',
      'left': 'right',
      'right': 'left',
    };
    final vertical = side == 'top' || side == 'bottom';
    final extent = vertical ? child.height : child.width;
    if (extent > room[side]! && room[opposite[side]]! > room[side]!) {
      side = opposite[side]!;
    }

    double along(
      double start,
      double length,
      double extent,
      String align,
      bool horizontal,
    ) {
      // Along a horizontal edge, start is left in LTR and right in RTL.
      final flip = horizontal && rtl;
      final a = switch (align) {
        'start' => flip ? 'end' : 'start',
        'end' => flip ? 'start' : 'end',
        _ => 'center',
      };
      return switch (a) {
        'start' => start,
        'end' => start + length - extent,
        _ => start + (length - extent) / 2,
      };
    }

    // Into the window, 8 clear of its edges.
    double inside(double v, double extent, double window) =>
        v.clamp(8, (window - extent - 8).clamp(8, double.infinity));

    if (vertical) {
      final x = along(
        anchor.left,
        anchor.width,
        child.width,
        placement.align,
        true,
      );
      var y = side == 'top'
          ? anchor.top - gap - child.height
          : anchor.bottom + gap;
      if (y < 0 || y + child.height > size.height) {
        y = inside(y, child.height, size.height);
      }
      return (at: Offset(inside(x, child.width, size.width), y), side: side);
    }
    final y = along(
      anchor.top,
      anchor.height,
      child.height,
      placement.align,
      false,
    );
    var x = side == 'left'
        ? anchor.left - gap - child.width
        : anchor.right + gap;
    if (x < 0 || x + child.width > size.width) {
      x = inside(x, child.width, size.width);
    }
    return (at: Offset(x, inside(y, child.height, size.height)), side: side);
  }

  @override
  bool shouldRelayout(_PlacedLayout old) =>
      old.anchor != anchor ||
      old.placement != placement ||
      old.direction != direction ||
      old.gap != gap ||
      old.minWidth != minWidth ||
      old.maxWidth != maxWidth;
}

/// A trigger and a panel that opens from it, placed by [DibaPlacement].
///
/// [modal] puts a barrier behind the panel that takes the outside tap and
/// closes, so nothing behind it is reachable while it is open. Without it the
/// page stays usable, and a tap outside still closes the panel.
class DibaPlacedPanel extends StatefulWidget {
  const DibaPlacedPanel({
    super.key,
    required this.trigger,
    required this.panel,
    required this.placement,
    this.gap = 4,
    this.modal = true,
    this.arrow = false,
    this.bare = false,
    this.matchAnchorWidth = false,
    this.minWidth = 0,
    this.maxWidth = double.infinity,
    this.anchorHeight,
    this.onOpenChange,
  });

  /// The trigger; `open` toggles the panel.
  final Widget Function(BuildContext context, VoidCallback toggle) trigger;

  /// The panel's content. [close] closes it.
  final Widget Function(BuildContext context, VoidCallback close) panel;
  final DibaPlacement placement;
  final double gap;
  final bool modal;
  final bool arrow;
  final ValueChanged<bool>? onOpenChange;

  /// The panel draws its own surface, as a menu does, and comes in as
  /// the web's popover does: from 0.95 and clear, over 150ms. Otherwise it is
  /// set on Material's outlined surface, 160 to 360 wide.
  final bool bare;

  /// At least as wide as the trigger, as a select's menu is.
  final bool matchAnchorWidth;

  /// A bare panel's bounds across.
  final double minWidth;
  final double maxWidth;

  /// Opens from the top this tall of the trigger: a field's box, and not the
  /// description or error under it, as the web's menu does.
  final double? anchorHeight;

  @override
  State<DibaPlacedPanel> createState() => _DibaPlacedPanelState();
}

class _DibaPlacedPanelState extends State<DibaPlacedPanel> {
  final MenuController _controller = MenuController();

  /// Which way a bare panel's arrow points, settled where the panel is laid
  /// out.
  final ValueNotifier<AxisDirection> _arrowFacing = ValueNotifier(
    AxisDirection.up,
  );

  @override
  void dispose() {
    _arrowFacing.dispose();
    super.dispose();
  }

  void _toggle() =>
      _controller.isOpen ? _controller.close() : _controller.open();
  void _close() {
    if (_controller.isOpen) _controller.close();
  }

  @override
  Widget build(BuildContext context) {
    final direction = Directionality.of(context);
    return RawMenuAnchor(
      controller: _controller,
      onOpen: () => widget.onOpenChange?.call(true),
      onClose: () => widget.onOpenChange?.call(false),
      overlayBuilder: (overlayContext, info) {
        final scheme = Theme.of(context).colorScheme;
        // Material's arrowed surface draws its arrow inside the panel, so it
        // has to know its side before the panel is measured: the flip is
        // decided here, on the room either side. A bare panel's arrow is
        // placed with the panel, and turns with it.
        var placement = widget.placement;
        if (widget.arrow && !widget.bare) {
          final below = info.overlaySize.height - info.anchorRect.bottom;
          final above = info.anchorRect.top;
          if (placement.side == 'bottom' && below < 240 && above > below) {
            placement = DibaPlacement('top', placement.align);
          } else if (placement.side == 'top' && above < 240 && below > above) {
            placement = DibaPlacement('bottom', placement.align);
          }
        }
        Widget panel = widget.bare
            ? _Entering(
                fromBelow: placement.side == 'top',
                child: widget.panel(overlayContext, _close),
              )
            : Material(
                color: scheme.surface,
                elevation: 3,
                shadowColor: scheme.shadow.withValues(alpha: 0.2),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(DibaRadius.md),
                  side: BorderSide(color: scheme.outlineVariant),
                ),
                clipBehavior: Clip.antiAlias,
                child: ConstrainedBox(
                  constraints: const BoxConstraints(
                    minWidth: 160,
                    maxWidth: 360,
                  ),
                  child: widget.panel(overlayContext, _close),
                ),
              );
        if (widget.arrow && !widget.bare) {
          panel = _Arrowed(
            side: placement.side,
            align: placement.align,
            colour: scheme.surface,
            border: scheme.outlineVariant,
            direction: direction,
            child: panel,
          );
        }

        return Positioned.fill(
          child: Stack(
            children: [
              if (widget.modal)
                Positioned.fill(
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: _close,
                  ),
                ),
              _laidOut(
                _PlacedLayout(
                  anchor: widget.anchorHeight == null
                      ? info.anchorRect
                      : Rect.fromLTWH(
                          info.anchorRect.left,
                          info.anchorRect.top,
                          info.anchorRect.width,
                          widget.anchorHeight!,
                        ),
                  placement: placement,
                  direction: direction,
                  gap: widget.gap + (widget.arrow && !widget.bare ? 6 : 0),
                  minWidth: widget.matchAnchorWidth
                      ? info.anchorRect.width
                      : widget.minWidth,
                  maxWidth: widget.maxWidth,
                ),
                TapRegion(
                  groupId: info.tapRegionGroupId,
                  onTapOutside: widget.modal ? null : (_) => _close(),
                  child: Directionality(textDirection: direction, child: panel),
                ),
                arrowColour: widget.bare && widget.arrow
                    ? scheme.surface
                    : null,
                facing: _arrowFacing,
                fromBelow: placement.side == 'top',
              ),
            ],
          ),
        );
      },
      builder: (context, controller, child) => widget.trigger(context, _toggle),
    );
  }
}

/// The panel placed against its trigger; with [arrowColour], the web's
/// popover arrow too, in the gap between them and pointing at the trigger's
/// middle, as React Aria's OverlayArrow does. The layout sets [facing] once it
/// knows which side the panel ended up on.
Widget _laidOut(
  _PlacedLayout placed,
  Widget panel, {
  required Color? arrowColour,
  required ValueNotifier<AxisDirection> facing,
  required bool fromBelow,
}) {
  if (arrowColour == null) {
    return CustomSingleChildLayout(delegate: placed, child: panel);
  }
  return CustomMultiChildLayout(
    delegate: _ArrowedLayout(placed, facing),
    children: [
      LayoutId(id: _Part.panel, child: panel),
      LayoutId(
        id: _Part.arrow,
        child: IgnorePointer(
          child: _Entering(
            fromBelow: fromBelow,
            child: CustomPaint(
              painter: _PopoverArrowPainter(
                facing: facing,
                colour: arrowColour,
              ),
            ),
          ),
        ),
      ),
    ],
  );
}

enum _Part { panel, arrow }

class _ArrowedLayout extends MultiChildLayoutDelegate {
  _ArrowedLayout(this.placed, this.facing);

  final _PlacedLayout placed;
  final ValueNotifier<AxisDirection> facing;

  @override
  void performLayout(Size size) {
    final panel = layoutChild(
      _Part.panel,
      placed.getConstraintsForChild(BoxConstraints.loose(size)),
    );
    final (:at, :side) = placed.place(size, panel);
    positionChild(_Part.panel, at);
    // Back at the trigger, from the side the panel ended up on.
    final facing = switch (side) {
      'top' => AxisDirection.down,
      'left' => AxisDirection.right,
      'right' => AxisDirection.left,
      _ => AxisDirection.up,
    };
    this.facing.value = facing;
    final box = at & panel;
    final a = placed.anchor;
    // The arrow's base along the panel's edge, at the trigger's middle and
    // clear of the panel's 24 corners.
    double along(double centre, double start, double end) =>
        (centre - 6).clamp(start + 20, (end - 32).clamp(start + 20, end));
    final offset = switch (facing) {
      AxisDirection.up => Offset(
        along(a.center.dx, box.left, box.right),
        box.top - 6,
      ),
      AxisDirection.down => Offset(
        along(a.center.dx, box.left, box.right),
        box.bottom,
      ),
      AxisDirection.left => Offset(
        box.left - 6,
        along(a.center.dy, box.top, box.bottom),
      ),
      AxisDirection.right => Offset(
        box.right,
        along(a.center.dy, box.top, box.bottom),
      ),
    };
    final vertical = facing == AxisDirection.up || facing == AxisDirection.down;
    layoutChild(
      _Part.arrow,
      BoxConstraints.tight(vertical ? const Size(12, 6) : const Size(6, 12)),
    );
    positionChild(_Part.arrow, offset);
  }

  @override
  bool shouldRelayout(_ArrowedLayout old) =>
      old.facing != facing || placed.shouldRelayout(old.placed);
}

/// The web's popover arrow, a curve 12 across and 6 deep, in the
/// panel's colour, pointing the way the layout settled.
class _PopoverArrowPainter extends CustomPainter {
  _PopoverArrowPainter({required this.facing, required this.colour})
    : super(repaint: facing);

  final ValueNotifier<AxisDirection> facing;
  final Color colour;

  @override
  void paint(Canvas canvas, Size size) {
    // Drawn pointing up in a 12 by 6 box, then turned: its base on the
    // panel's edge, its point towards the trigger.
    canvas.save();
    switch (facing.value) {
      case AxisDirection.up:
        break;
      case AxisDirection.down:
        canvas
          ..translate(size.width, size.height)
          ..rotate(3.141592653589793);
      case AxisDirection.left:
        canvas
          ..translate(0, size.height)
          ..rotate(-3.141592653589793 / 2);
      case AxisDirection.right:
        canvas
          ..translate(size.width, 0)
          ..rotate(3.141592653589793 / 2);
    }
    canvas.drawPath(
      Path()
        ..moveTo(0, 6)
        ..cubicTo(5.48483, -2, 6.5, -2, 12, 6)
        ..close(),
      Paint()..color = colour,
    );
    canvas.restore();
  }

  @override
  bool shouldRepaint(_PopoverArrowPainter old) =>
      old.facing != facing || old.colour != colour;
}

/// A popover coming in, as the web's does: from 0.95 of its size and clear,
/// over 150ms, growing from the edge nearest its trigger.
class _Entering extends StatelessWidget {
  const _Entering({required this.fromBelow, required this.child});

  final bool fromBelow;
  final Widget child;

  @override
  Widget build(BuildContext context) => TweenAnimationBuilder<double>(
    tween: Tween(begin: 0, end: 1),
    duration: const Duration(milliseconds: 150),
    curve: Curves.ease,
    child: child,
    builder: (context, t, child) => Opacity(
      opacity: t,
      child: Transform.scale(
        scale: 0.95 + 0.05 * t,
        alignment: fromBelow ? Alignment.bottomCenter : Alignment.topCenter,
        child: child,
      ),
    ),
  );
}

/// A panel with a small triangle pointing back at its trigger — `showArrow`,
/// which Material has no part for.
class _Arrowed extends StatelessWidget {
  const _Arrowed({
    required this.side,
    required this.align,
    required this.colour,
    required this.border,
    required this.direction,
    required this.child,
  });

  final String side;

  /// Where along the edge the trigger is: a start-aligned panel's trigger is
  /// near its start edge, so the arrow is too. The panel's real offset from
  /// the trigger is only known at layout, so this is close rather than exact.
  final String align;
  final Color colour;
  final Color border;
  final TextDirection direction;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final rtl = direction == TextDirection.rtl;
    final physical = switch (side) {
      'start' => rtl ? 'right' : 'left',
      'end' => rtl ? 'left' : 'right',
      _ => side,
    };
    // The arrow sits on the edge facing the trigger.
    final arrow = CustomPaint(
      size: physical == 'top' || physical == 'bottom'
          ? const Size(14, 7)
          : const Size(7, 14),
      painter: _ArrowPainter(
        pointing: switch (physical) {
          'top' => AxisDirection.down,
          'bottom' => AxisDirection.up,
          'left' => AxisDirection.right,
          _ => AxisDirection.left,
        },
        fill: colour,
        stroke: border,
      ),
    );
    final placed = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: arrow,
    );
    final along = switch (align) {
      'start' => CrossAxisAlignment.start,
      'end' => CrossAxisAlignment.end,
      _ => CrossAxisAlignment.center,
    };
    return switch (physical) {
      'top' => Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: along,
        children: [child, placed],
      ),
      'bottom' => Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: along,
        children: [placed, child],
      ),
      'left' => Row(
        mainAxisSize: MainAxisSize.min,
        textDirection: TextDirection.ltr,
        children: [child, arrow],
      ),
      _ => Row(
        mainAxisSize: MainAxisSize.min,
        textDirection: TextDirection.ltr,
        children: [arrow, child],
      ),
    };
  }
}

class _ArrowPainter extends CustomPainter {
  _ArrowPainter({
    required this.pointing,
    required this.fill,
    required this.stroke,
  });

  final AxisDirection pointing;
  final Color fill;
  final Color stroke;

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final path = switch (pointing) {
      AxisDirection.up =>
        (Path()
          ..moveTo(0, h)
          ..lineTo(w / 2, 0)
          ..lineTo(w, h)),
      AxisDirection.down =>
        (Path()
          ..moveTo(0, 0)
          ..lineTo(w / 2, h)
          ..lineTo(w, 0)),
      AxisDirection.left =>
        (Path()
          ..moveTo(w, 0)
          ..lineTo(0, h / 2)
          ..lineTo(w, h)),
      AxisDirection.right =>
        (Path()
          ..moveTo(0, 0)
          ..lineTo(w, h / 2)
          ..lineTo(0, h)),
    };
    canvas.drawPath(path, Paint()..color = fill);
    canvas.drawPath(
      path,
      Paint()
        ..color = stroke
        ..style = PaintingStyle.stroke,
    );
  }

  @override
  bool shouldRepaint(_ArrowPainter old) =>
      old.pointing != pointing || old.fill != fill || old.stroke != stroke;
}
