import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/scheduler.dart';

import '../../tokens.g.dart';
import '../field.dart';
import '../glyphs.dart';
import '../node.dart';
import '../oklab.dart';
import '../ring.dart';
import 'common.dart';

/// Group 1: Button, LinkButton, ToggleButtonGroup, ToggleButton, Link.
///
/// Drawn as Diba's web copy draws them, with one thing of Flutter's: a button
/// that shows only its icon says its label in a tooltip, which the web now
/// does too. Material's buttons still carry the press, the focus, the keyboard
/// and the semantics; every look is set here, none left to Material.

/// The web's breakpoints (Tailwind's md and sm), which v3's buttons size by:
/// under 768 wide a button is 4 taller, a touch target, where the size
/// tokens' heights are the admin's on a desktop; under 640 an md or lg
/// button's icon is 20.
bool _narrow(BuildContext context) => MediaQuery.sizeOf(context).width < 768;

double _height(BuildContext context, String size) =>
    switch (size) {
      'lg' => DibaDimens.controlHeightLg,
      'md' => DibaDimens.controlHeightMd,
      _ => DibaDimens.controlHeightSm,
    } +
    (_narrow(context) ? 4 : 0);

double _iconSize(BuildContext context, String size) =>
    size != 'sm' && MediaQuery.sizeOf(context).width < 640 ? 20 : 16;

/// The web's padding: 12 for sm, 16 for md and lg.
double _px(String size) => size == 'sm' ? 12 : 16;

/// The web's label: 14 on a 20 line, 16 on a 24 for lg, medium, and none of
/// Material's letter spacing. From the theme's labelLarge, for its face: a
/// Material button sets its text style whole, so a bare style drew Roboto.
TextStyle _labelStyle(BuildContext context, String size) =>
    Theme.of(context).textTheme.labelLarge!.copyWith(
      fontSize: size == 'lg' ? 16 : 14,
      height: size == 'lg' ? 24 / 16 : 20 / 14,
      fontWeight: FontWeight.w500,
      letterSpacing: 0,
    );

/// How far a pressed button shrinks, by size, as v3's do. A toggle does not.
double _pressedScale(String size) => switch (size) {
  'lg' => 0.96,
  'md' => 0.97,
  _ => 0.98,
};

/// How far a tooltip's bubble stands off its button, as the web's does.
const double _tipGap = 10;

/// A button's colours: its fill at rest and under a hover or a press, its text
/// and icon, and its edge.
typedef _Look = ({Color fill, Color hover, Color ink, Color? edge});

/// The colours of each of the web's variants, in Diba's theme.
/// Danger's hover and its soft fill and text are the web's mixes of the danger
/// colour, made in Oklab as the web's color-mix makes them.
_Look _look(BuildContext context, String variant) {
  final dark = Theme.of(context).brightness == Brightness.dark;
  final fill = dark ? DibaDarkNeutrals.fill : DibaLightNeutrals.fill;
  final fillHover = dark
      ? DibaDarkNeutrals.fillHover
      : DibaLightNeutrals.fillHover;
  final fillInk = dark
      ? DibaDarkNeutrals.fillForeground
      : DibaLightNeutrals.fillForeground;
  final text = dark
      ? DibaDarkNeutrals.foreground
      : DibaLightNeutrals.foreground;
  final danger = dark ? DibaDarkColors.danger : DibaLightColors.danger;
  final onDanger = dark ? DibaDarkColors.dangerFg : DibaLightColors.dangerFg;
  const clear = Color(0x00000000);
  return switch (variant) {
    'primary' => (
      fill: dark ? DibaDarkColors.primary : DibaLightColors.primary,
      hover: dark ? DibaDarkColors.primaryHover : DibaLightColors.primaryHover,
      ink: dark ? DibaDarkColors.primaryFg : DibaLightColors.primaryFg,
      edge: null,
    ),
    'tertiary' => (fill: fill, hover: fillHover, ink: text, edge: null),
    'outline' => (
      fill: clear,
      hover: fill.withValues(alpha: 0.6),
      ink: fillInk,
      edge: dark ? DibaDarkNeutrals.border : DibaLightNeutrals.border,
    ),
    'ghost' => (fill: clear, hover: fill, ink: fillInk, edge: null),
    'danger' => (
      fill: danger,
      hover: dibaMixOklab(danger, 0.9, onDanger, 0.1),
      ink: onDanger,
      edge: null,
    ),
    'danger-soft' => (
      fill: danger.withValues(alpha: 0.15),
      hover: danger.withValues(alpha: 0.2),
      ink: dark
          ? dibaMixOklab(danger, 0.8, text, 0.3)
          : dibaMixOklab(danger, 0.7, text, 0.4),
      edge: null,
    ),
    // secondary, the schema's default
    _ => (fill: fill, hover: fillHover, ink: fillInk, edge: null),
  };
}

/// A toggle's colours: the text colour on the neutral fill, or the gilt with
/// the colour on it when selected. An attached one leaves its neutral
/// fill to its group ([_toggleGroup]).
_Look _toggleLook(
  BuildContext context, {
  required bool selected,
  required bool attached,
}) {
  final dark = Theme.of(context).brightness == Brightness.dark;
  if (selected) {
    return (
      fill: dark ? DibaDarkColors.primary : DibaLightColors.primary,
      hover: dark ? DibaDarkColors.primaryHover : DibaLightColors.primaryHover,
      ink: dark ? DibaDarkColors.controlOnFill : DibaLightColors.controlOnFill,
      edge: null,
    );
  }
  return (
    fill: attached
        ? const Color(0x00000000)
        : dark
        ? DibaDarkNeutrals.fill
        : DibaLightNeutrals.fill,
    hover: dark ? DibaDarkNeutrals.fillHover : DibaLightNeutrals.fillHover,
    ink: dark ? DibaDarkNeutrals.foreground : DibaLightNeutrals.foreground,
    edge: null,
  );
}

/// A button's whole style, Material's looks all replaced by the web's: its
/// fill stepping to its hover colour under a hover or a press in 100ms, no
/// state layer, no ripple, no shadow, and the same colours when disabled (the
/// button fades instead, [_Pressable]).
ButtonStyle _style(
  BuildContext context,
  String size,
  _Look look, {
  required bool iconOnly,
  OutlinedBorder shape = const StadiumBorder(),
}) {
  final height = _height(context, size);
  return ButtonStyle(
    backgroundColor: WidgetStateProperty.resolveWith(
      (states) =>
          states.contains(WidgetState.hovered) ||
              states.contains(WidgetState.pressed)
          ? look.hover
          : look.fill,
    ),
    foregroundColor: WidgetStatePropertyAll(look.ink),
    iconColor: WidgetStatePropertyAll(look.ink),
    overlayColor: const WidgetStatePropertyAll(Colors.transparent),
    shadowColor: const WidgetStatePropertyAll(Colors.transparent),
    surfaceTintColor: const WidgetStatePropertyAll(Colors.transparent),
    elevation: const WidgetStatePropertyAll(0),
    side: WidgetStatePropertyAll(
      look.edge == null ? BorderSide.none : BorderSide(color: look.edge!),
    ),
    shape: WidgetStatePropertyAll(shape),
    textStyle: WidgetStatePropertyAll(_labelStyle(context, size)),
    padding: WidgetStatePropertyAll(
      iconOnly ? EdgeInsets.zero : EdgeInsets.symmetric(horizontal: _px(size)),
    ),
    minimumSize: WidgetStatePropertyAll(Size(iconOnly ? height : 0, height)),
    maximumSize: WidgetStatePropertyAll(
      Size(iconOnly ? height : double.infinity, height),
    ),
    fixedSize: iconOnly ? WidgetStatePropertyAll(Size.square(height)) : null,
    iconSize: WidgetStatePropertyAll(_iconSize(context, size)),
    mouseCursor: WidgetStateProperty.resolveWith(
      (states) => states.contains(WidgetState.disabled)
          ? SystemMouseCursors.forbidden
          : SystemMouseCursors.click,
    ),
    splashFactory: NoSplash.splashFactory,
    animationDuration: const Duration(milliseconds: 100),
    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
    visualDensity: VisualDensity.standard,
  );
}

/// A button as the web presses and focuses it: it shrinks to [scale] while
/// pressed, over 250ms; a disabled or pending one fades to half, its colours
/// kept; and under keyboard focus Diba's ring stands 2 outside it, a 2 band of
/// the page's colour between.
class _Pressable extends StatefulWidget {
  const _Pressable({
    required this.scale,
    required this.shape,
    required this.faded,
    required this.builder,
  });

  final double scale;
  final ShapeBorder shape;
  final bool faded;
  final Widget Function(WidgetStatesController states) builder;

  @override
  State<_Pressable> createState() => _PressableState();
}

class _PressableState extends State<_Pressable> {
  final _states = WidgetStatesController();

  /// What this draws from the button's states: pressed, and focused.
  (bool, bool) _drawn = (false, false);

  @override
  void initState() {
    super.initState();
    _states.addListener(_changed);
  }

  /// The button sets its states as it builds too (disabled, say), when this,
  /// its ancestor, may not be rebuilt; so only a press or a focus rebuilds it,
  /// and one that comes while building waits for the frame's end.
  void _changed() {
    final now = (
      _states.value.contains(WidgetState.pressed),
      _states.value.contains(WidgetState.focused),
    );
    if (now == _drawn) return;
    _drawn = now;
    if (SchedulerBinding.instance.schedulerPhase ==
        SchedulerPhase.persistentCallbacks) {
      SchedulerBinding.instance.addPostFrameCallback((_) {
        if (mounted) setState(() {});
      });
    } else {
      setState(() {});
    }
  }

  @override
  void dispose() {
    _states
      ..removeListener(_changed)
      ..dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final (pressed, focused) = _drawn;
    final ringed = focused && dibaKeyboardFocus();
    Widget button = AnimatedScale(
      scale: pressed ? widget.scale : 1,
      duration: const Duration(milliseconds: 250),
      curve: Curves.ease,
      child: CustomPaint(
        foregroundPainter: ringed
            ? DibaRingPainter.of(context, widget.shape)
            : null,
        child: widget.builder(_states),
      ),
    );
    if (widget.faded) button = Opacity(opacity: 0.5, child: button);
    return button;
  }
}

Widget _spinner(BuildContext context, String size, Color colour) =>
    SizedBox.square(
      dimension: _iconSize(context, size),
      child: CircularProgressIndicator(strokeWidth: 2, color: colour),
    );

/// A button that shows only its icon, with its label in a tooltip.
Widget _withTip(String? label, Widget button) =>
    label == null ? button : _Tip(message: label, child: button);

/// The web's tooltip on a button: the theme's bubble, [_tipGap]
/// above the button, and the web's arrow on the side that faces it, under the
/// button's middle. Flutter turns a tooltip below its target when there is no
/// room above, so where it went is read off as it is placed.
class _Tip extends StatefulWidget {
  const _Tip({required this.message, required this.child});

  final String message;
  final Widget child;

  @override
  State<_Tip> createState() => _TipState();
}

class _TipState extends State<_Tip> {
  /// Whether the bubble went below its button, and where the button's
  /// middle is along the bubble.
  ({bool below, double x}) _place = (below: false, x: 0);

  @override
  Widget build(BuildContext context) {
    final base = TooltipTheme.of(context).decoration;
    final dark = Theme.of(context).brightness == Brightness.dark;
    final edge = dark ? DibaDarkNeutrals.border : DibaLightNeutrals.border;
    final rounded =
        base is ShapeDecoration && base.shape is RoundedRectangleBorder
        ? base.shape as RoundedRectangleBorder
        : const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(12)),
          );
    return Tooltip(
      message: widget.message,
      decoration: ShapeDecoration(
        color: base is ShapeDecoration ? base.color : null,
        shadows: base is ShapeDecoration ? base.shadows : null,
        shape: _TipShape(
          rounded: rounded,
          // The web strokes its arrow in the border colour at 40%.
          arrowEdge: edge.withValues(alpha: 0.4),
          place: () => _place,
        ),
      ),
      positionDelegate: (c) {
        final at = positionDependentBox(
          size: c.overlaySize,
          childSize: c.tooltipSize,
          target: c.target,
          verticalOffset: c.targetSize.height / 2 + _tipGap,
          preferBelow: false,
        );
        _place = (below: at.dy > c.target.dy, x: c.target.dx - at.dx);
        return at;
      },
      child: widget.child,
    );
  }
}

/// The tooltip's bubble with the web's arrow: a curve 12 across and 6 deep
/// (its SVG path, M0 0 C 5.48 8 6.5 8 12 0), edged in [arrowEdge].
class _TipShape extends ShapeBorder {
  const _TipShape({
    required this.rounded,
    required this.arrowEdge,
    required this.place,
  });

  final RoundedRectangleBorder rounded;
  final Color arrowEdge;
  final ({bool below, double x}) Function() place;

  double get _radius => switch (rounded.borderRadius) {
    final BorderRadius r => r.topLeft.x,
    _ => 12,
  };

  /// The curve's start, its two controls and its end, at the bubble's edge
  /// facing the button, under the button's middle as far as the corners let.
  (Offset, Offset, Offset, Offset) _curve(Rect rect) {
    final p = place();
    final x = (rect.left + p.x).clamp(
      rect.left + _radius + 6,
      math.max(rect.left + _radius + 6, rect.right - _radius - 6),
    );
    final y = p.below ? rect.top : rect.bottom;
    final d = p.below ? -8.0 : 8.0;
    return (
      Offset(x - 6, y),
      Offset(x - 6 + 5.48483, y + d),
      Offset(x + 0.5, y + d),
      Offset(x + 6, y),
    );
  }

  @override
  EdgeInsetsGeometry get dimensions => EdgeInsets.zero;

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) =>
      getOuterPath(rect, textDirection: textDirection);

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    final (a, c1, c2, z) = _curve(rect);
    return Path()
      ..addPath(
        rounded.getOuterPath(rect, textDirection: textDirection),
        Offset.zero,
      )
      ..moveTo(a.dx, a.dy)
      ..cubicTo(c1.dx, c1.dy, c2.dx, c2.dy, z.dx, z.dy)
      ..close();
  }

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    rounded.paint(canvas, rect, textDirection: textDirection);
    final (a, c1, c2, z) = _curve(rect);
    canvas.drawPath(
      Path()
        ..moveTo(a.dx, a.dy)
        ..cubicTo(c1.dx, c1.dy, c2.dx, c2.dy, z.dx, z.dy),
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1
        ..color = arrowEdge,
    );
  }

  @override
  ShapeBorder scale(double t) => this;
}

/// Button and LinkButton's shared look.
///
/// In an overlay's trigger slot, a press opens the overlay too, as the web's
/// trigger does, and still sends the button's own onPress. A block is built
/// where the surface reads its tree, not where it lands, so the slot is found
/// from where the button is mounted.
Widget dibaButtonLike(
  BuildContext context,
  DibaNodeContext node, {
  required VoidCallback? onPressed,
  bool pending = false,
}) => Builder(
  builder: (mounted) {
    final trigger = DibaTriggerScope.maybeOf(mounted);
    return _buttonLike(
      context,
      node,
      // A group reads from where the button is mounted: blocks are built
      // with the surface's context, above any group.
      group: DibaButtonGroupScope.maybeOf(mounted),
      pending: pending,
      onPressed: trigger == null
          ? onPressed
          : () {
              trigger.open();
              onPressed?.call();
            },
    );
  },
);

/// What a ButtonGroup gives its buttons: its size and variant for a
/// button that sets neither, its disabled state, and square inner corners,
/// the group's clip rounding its ends.
class DibaButtonGroupScope extends InheritedWidget {
  const DibaButtonGroupScope({
    super.key,
    required this.size,
    required this.variant,
    required this.disabled,
    this.first = true,
    this.last = true,
    this.vertical = false,
    required super.child,
  });

  final String size;
  final String variant;
  final bool disabled;

  /// Where the button stands in the group: its first, its last, and whether
  /// the group runs down. Its outer ends are round, its inner square.
  final bool first;
  final bool last;
  final bool vertical;

  static DibaButtonGroupScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<DibaButtonGroupScope>();

  @override
  bool updateShouldNotify(DibaButtonGroupScope old) =>
      size != old.size ||
      variant != old.variant ||
      disabled != old.disabled ||
      first != old.first ||
      last != old.last ||
      vertical != old.vertical;
}

/// A joined button's edge, the web's in a group: round, 24, only at the
/// group's two ends, square inside; an outline drawn round the group and not
/// between its buttons, as the web takes the inner edges away
/// (`border-e-0`, `border-x-0`, `border-s-0`).
class _JoinedEdge extends OutlinedBorder {
  const _JoinedEdge({
    super.side,
    required this.first,
    required this.last,
    required this.vertical,
  });

  final bool first;
  final bool last;
  final bool vertical;

  static const Radius _round = Radius.circular(24);

  BorderRadiusGeometry get _radius => vertical
      ? BorderRadius.vertical(
          top: first ? _round : Radius.zero,
          bottom: last ? _round : Radius.zero,
        )
      : BorderRadiusDirectional.horizontal(
          start: first ? _round : Radius.zero,
          end: last ? _round : Radius.zero,
        );

  RoundedRectangleBorder get _shape =>
      RoundedRectangleBorder(borderRadius: _radius, side: side);

  @override
  _JoinedEdge copyWith({BorderSide? side}) => _JoinedEdge(
    side: side ?? this.side,
    first: first,
    last: last,
    vertical: vertical,
  );

  @override
  ShapeBorder scale(double t) => _JoinedEdge(
    side: side.scale(t),
    first: first,
    last: last,
    vertical: vertical,
  );

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) =>
      _shape.getInnerPath(rect, textDirection: textDirection);

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) =>
      _shape.getOuterPath(rect, textDirection: textDirection);

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    if (side.style == BorderStyle.none || side.width == 0) return;
    if (first && last) {
      _shape.paint(canvas, rect, textDirection: textDirection);
      return;
    }
    // The whole edge, with the sides that meet a neighbour cut away: the
    // line along the group runs on to the next button's.
    final w = side.width;
    final rtl = textDirection == TextDirection.rtl;
    final keep = Path()..addRect(rect.inflate(w));
    Rect strip(bool leading) {
      if (vertical) {
        return leading
            ? Rect.fromLTRB(
                rect.left - w,
                rect.top - w,
                rect.right + w,
                rect.top + w,
              )
            : Rect.fromLTRB(
                rect.left - w,
                rect.bottom - w,
                rect.right + w,
                rect.bottom + w,
              );
      }
      final left = leading != rtl;
      return left
          ? Rect.fromLTRB(
              rect.left - w,
              rect.top + w,
              rect.left + w,
              rect.bottom - w,
            )
          : Rect.fromLTRB(
              rect.right - w,
              rect.top + w,
              rect.right + w,
              rect.bottom - w,
            );
    }

    var cut = keep;
    if (!first) {
      cut = Path.combine(
        PathOperation.difference,
        cut,
        Path()..addRect(strip(true)),
      );
    }
    if (!last) {
      cut = Path.combine(
        PathOperation.difference,
        cut,
        Path()..addRect(strip(false)),
      );
    }
    canvas
      ..save()
      ..clipPath(cut);
    // Drawn on a rect stretched past the cut sides, so the line along the
    // group reaches the button's edge.
    final reach = vertical
        ? Rect.fromLTRB(
            rect.left,
            first ? rect.top : rect.top - w,
            rect.right,
            last ? rect.bottom : rect.bottom + w,
          )
        : Rect.fromLTRB(
            (rtl ? last : first) ? rect.left : rect.left - w,
            rect.top,
            (rtl ? first : last) ? rect.right : rect.right + w,
            rect.bottom,
          );
    _shape.paint(canvas, reach, textDirection: textDirection);
    canvas.restore();
  }
}

Widget _buttonLike(
  BuildContext context,
  DibaNodeContext node, {
  required VoidCallback? onPressed,
  required bool pending,
  DibaButtonGroupScope? group,
}) {
  final label = node.prop<String>('label');
  // A tree's props hold only what it set: what a button leaves unset in a
  // group is the group's.
  String own(String name, String fallback) =>
      node.props.containsKey(name) || group == null
      ? node.str(name, fallback)
      : (name == 'size' ? group.size : group.variant);
  return _drawnButton(
    context,
    variant: own('variant', 'secondary'),
    size: own('size', 'sm'),
    iconOnly: node.flag('isIconOnly'),
    label: label,
    text: node.text ?? label ?? '',
    icon: dibaIconFor(node, node.props['icon']),
    iconAtEnd: node.prop<String>('iconPlacement') == 'end',
    disabled: node.flag('isDisabled') || (group?.disabled ?? false),
    fullWidth: node.flag('fullWidth'),
    pending: pending,
    onPressed: onPressed,
    refuse: node.refuse,
    group: group,
  );
}

/// A button drawn as the Button block draws one, for a container's own
/// buttons: an alert dialog's cancel and confirm, a table's load more.
Widget dibaPlainButton(
  BuildContext context, {
  required String text,
  required VoidCallback? onPressed,
  String variant = 'secondary',
  String size = 'sm',
  bool disabled = false,
  bool pending = false,
}) => _drawnButton(
  context,
  variant: variant,
  size: size,
  iconOnly: false,
  label: null,
  text: text,
  icon: null,
  iconAtEnd: false,
  disabled: disabled,
  fullWidth: false,
  pending: pending,
  onPressed: onPressed,
  refuse: (_) {},
);

/// The web's close button, its CloseButton, as a modal's corner holds
/// it: 24 across and round, the default fill with the muted cross 16
/// across on it, the fill's hover shade under a pointer, and 0.93 of its size
/// while pressed. [label] is what a screen reader hears.
Widget dibaCloseButton(
  BuildContext context, {
  required String label,
  required VoidCallback onPressed,
}) {
  final dark = Theme.of(context).brightness == Brightness.dark;
  final _Look look = (
    fill: dark ? DibaDarkNeutrals.fill : DibaLightNeutrals.fill,
    hover: dark ? DibaDarkNeutrals.fillHover : DibaLightNeutrals.fillHover,
    ink: dark ? DibaDarkNeutrals.muted : DibaLightNeutrals.muted,
    edge: null,
  );
  final style = _style(context, 'sm', look, iconOnly: true).copyWith(
    minimumSize: const WidgetStatePropertyAll(Size.square(24)),
    maximumSize: const WidgetStatePropertyAll(Size.square(24)),
    fixedSize: const WidgetStatePropertyAll(Size.square(24)),
    shape: const WidgetStatePropertyAll(CircleBorder()),
  );
  return _Pressable(
    scale: 0.93,
    shape: const CircleBorder(),
    faded: false,
    builder: (states) => FilledButton(
      onPressed: onPressed,
      style: style,
      statesController: states,
      child: Semantics(
        label: label,
        child: DibaGlyphMark(DibaGlyph.close, size: 16, color: look.ink),
      ),
    ),
  );
}

Widget _drawnButton(
  BuildContext context, {
  required String variant,
  required String size,
  required bool iconOnly,
  required String? label,
  required String text,
  required Widget? icon,
  required bool iconAtEnd,
  required bool disabled,
  required bool fullWidth,
  required bool pending,
  required VoidCallback? onPressed,
  required void Function(String reason) refuse,
  DibaButtonGroupScope? group,
}) {
  final look = _look(context, variant);
  var style = _style(context, size, look, iconOnly: iconOnly);
  // In a group, round only at the group's ends, as the web's; a press
  // does not shrink it there.
  final OutlinedBorder shape = group == null
      ? const StadiumBorder()
      : _JoinedEdge(
          first: group.first,
          last: group.last,
          vertical: group.vertical,
        );
  final scale = group == null ? _pressedScale(size) : 1.0;
  if (group != null) {
    style = style.copyWith(shape: WidgetStatePropertyAll(shape));
  }
  final press = disabled || pending ? null : onPressed;
  if (pending) icon = _spinner(context, size, look.ink);

  if (iconOnly) {
    if (label == null) refuse('icon-only without a label');
    final glyph = icon ?? const SizedBox.shrink();
    return _withTip(
      label,
      Semantics(
        label: label,
        child: _Pressable(
          scale: scale,
          shape: shape,
          faded: disabled || pending,
          builder: (states) => variant == 'outline'
              ? OutlinedButton(
                  onPressed: press,
                  style: style,
                  statesController: states,
                  child: glyph,
                )
              : FilledButton(
                  onPressed: press,
                  style: style,
                  statesController: states,
                  child: glyph,
                ),
        ),
      ),
    );
  }

  final alignment = iconAtEnd ? IconAlignment.end : IconAlignment.start;
  final child = Text(text);
  Widget button(WidgetStatesController states) => switch (variant) {
    'outline' =>
      icon == null
          ? OutlinedButton(
              onPressed: press,
              style: style,
              statesController: states,
              child: child,
            )
          : OutlinedButton.icon(
              onPressed: press,
              style: style.copyWith(iconAlignment: alignment),
              statesController: states,
              icon: icon,
              label: child,
            ),
    'ghost' =>
      icon == null
          ? TextButton(
              onPressed: press,
              style: style,
              statesController: states,
              child: child,
            )
          : TextButton.icon(
              onPressed: press,
              style: style.copyWith(iconAlignment: alignment),
              statesController: states,
              icon: icon,
              label: child,
            ),
    _ =>
      icon == null
          ? FilledButton(
              onPressed: press,
              style: style,
              statesController: states,
              child: child,
            )
          : FilledButton.icon(
              onPressed: press,
              style: style.copyWith(iconAlignment: alignment),
              statesController: states,
              icon: icon,
              label: child,
            ),
  };
  final pressable = _Pressable(
    scale: scale,
    shape: shape,
    faded: disabled || pending,
    builder: button,
  );
  return fullWidth
      ? SizedBox(width: double.infinity, child: pressable)
      : pressable;
}

final Map<String, DibaBuilder> actionBlocks = {
  'Button': (context, node) {
    final type = node.str('type', 'button');
    final form = node.form;
    if (type != 'button' && form == null) {
      node.refuse('type "$type" outside a Form');
    }
    return dibaButtonLike(
      context,
      node,
      pending: node.flag('isPending'),
      onPressed: () async {
        await node.fire('onPress');
        if (type == 'submit') await form?.submit();
        if (type == 'reset') form?.reset();
      },
    );
  },

  'LinkButton': (context, node) {
    final href = node.prop<String>('href');
    final onPress = node.handlers['onPress'];
    return dibaButtonLike(
      context,
      node,
      onPressed: href == null && onPress == null
          ? null
          : () {
              onPress?.call(null);
              if (href != null) {
                node.navigateTo(href, external: node.flag('isExternal'));
              }
            },
    );
  },

  /// Attached segments or detached toggles, as the web draws both: v3's
  /// buttons, a selected one gilt. `label` (required) and
  /// `isLabelHidden` (hidden by default) name the group for a screen reader;
  /// `name` makes its keys a Form field.
  'ToggleButtonGroup': (context, node) {
    final label = node.prop<String>('label');
    if (label == null) node.refuse('no label');
    final group = _toggleGroup(context, node);
    if (label == null) return group;
    if (node.flagOr('isLabelHidden', true)) {
      return Semantics(label: label, container: true, child: group);
    }
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 4 over the group, as the web's.
        Padding(
          padding: const EdgeInsets.only(bottom: 4),
          child: Text(label, style: dibaLabelStyle(context)),
        ),
        group,
      ],
    );
  },

  /// Drawn by its group, which needs every button's id at once.
  'ToggleButton': (context, node) => const SizedBox.shrink(),

  /// A link is always its own block — Text's children are a string, so there
  /// is no sentence for it to sit inside. The web's: 16 on a 24 line, medium,
  /// the admin's link colour, underlined 4 below the baseline; disabled,
  /// faded to half with the not-allowed pointer; no ripple and no hover.
  'Link': (context, node) {
    final href = node.prop<String>('href');
    final dark = Theme.of(context).brightness == Brightness.dark;
    final colour = dark ? DibaDarkColors.link : DibaLightColors.link;
    final disabled = node.flag('isDisabled');
    final Widget link = InkWell(
      onTap: href == null || disabled
          ? null
          : () => node.navigateTo(href, external: node.flag('isExternal')),
      mouseCursor: WidgetStateMouseCursor.resolveWith(
        (states) => states.contains(WidgetState.disabled)
            ? SystemMouseCursors.forbidden
            : SystemMouseCursors.click,
      ),
      overlayColor: const WidgetStatePropertyAll(Colors.transparent),
      splashFactory: NoSplash.splashFactory,
      child: _Underlined(
        colour: colour,
        child: Text(
          node.text ?? '',
          textHeightBehavior: const TextHeightBehavior(
            leadingDistribution: TextLeadingDistribution.even,
          ),
          style: TextStyle(
            // The admin's link colour: slate, not the gilt, which is a
            // fill colour and measures about 1.7:1 as text.
            color: colour,
            fontSize: 16,
            height: 24 / 16,
            fontWeight: FontWeight.w500,
            letterSpacing: 0,
          ),
        ),
      ),
    );
    return Semantics(
      link: true,
      child: disabled ? Opacity(opacity: 0.5, child: link) : link,
    );
  },
};

/// A line of text underlined as the web's link is, 1 thick and 4 below the
/// baseline; a TextStyle's underline sits where the font says, and cannot be
/// moved.
class _Underlined extends SingleChildRenderObjectWidget {
  const _Underlined({required this.colour, required super.child});

  final Color colour;

  @override
  RenderObject createRenderObject(BuildContext context) =>
      _RenderUnderlined(colour);

  @override
  void updateRenderObject(BuildContext context, _RenderUnderlined render) =>
      render.colour = colour;
}

class _RenderUnderlined extends RenderProxyBox {
  _RenderUnderlined(this._colour);

  Color _colour;
  set colour(Color value) {
    if (value == _colour) return;
    _colour = value;
    markNeedsPaint();
  }

  /// The child's first baseline, read as it is laid out.
  double? _baseline;

  @override
  void performLayout() {
    super.performLayout();
    _baseline = child?.getDistanceToBaseline(
      TextBaseline.alphabetic,
      onlyReal: true,
    );
  }

  @override
  void paint(PaintingContext context, Offset offset) {
    super.paint(context, offset);
    final paragraph = child;
    if (paragraph is! RenderParagraph) return;
    final baseline = _baseline;
    if (baseline == null) return;
    final text = paragraph.text.toPlainText();
    final lines = paragraph.getBoxesForSelection(
      TextSelection(baseOffset: 0, extentOffset: text.length),
    );
    if (lines.isEmpty) return;
    // One stroke per line, at its own baseline: the first line's, less the
    // first line's top, gives where a baseline sits in a line.
    final down = baseline - lines.first.top;
    final paint = Paint()..color = _colour;
    for (final line in lines) {
      final y = offset.dy + line.top + down + 4;
      context.canvas.drawRect(
        Rect.fromLTRB(offset.dx + line.left, y, offset.dx + line.right, y + 1),
        paint,
      );
    }
  }
}

/// The shape of a toggle at [index] of [count]: attached ones share one pill,
/// round only at its ends; a detached one is a pill of its own.
OutlinedBorder _toggleShape({
  required int index,
  required int count,
  required bool attached,
  required bool vertical,
}) {
  if (!attached || count == 1) return const StadiumBorder();
  const round = Radius.circular(24);
  final first = index == 0;
  final last = index == count - 1;
  if (!first && !last) return const RoundedRectangleBorder();
  return RoundedRectangleBorder(
    borderRadius: vertical
        ? BorderRadiusDirectional.vertical(
            top: first ? round : Radius.zero,
            bottom: last ? round : Radius.zero,
          )
        : BorderRadiusDirectional.horizontal(
            start: first ? round : Radius.zero,
            end: last ? round : Radius.zero,
          ),
  );
}

Widget _toggle(
  BuildContext context,
  DibaItem item, {
  required String size,
  required bool selected,
  required bool multiple,
  required bool disabled,
  required bool attached,
  required OutlinedBorder shape,
  required VoidCallback? onPressed,
}) {
  final iconOnly = item.flag('isIconOnly');
  final style = _style(
    context,
    size,
    _toggleLook(context, selected: selected, attached: attached),
    iconOnly: iconOnly,
    shape: shape,
  );
  final icon = dibaItemIcon(item);
  final text = Text(dibaItemText(item));
  final button = _Pressable(
    // A toggle does not shrink when pressed, on the web.
    scale: 1,
    shape: shape,
    faded: disabled,
    builder: (states) => icon != null && !iconOnly
        ? FilledButton.icon(
            onPressed: onPressed,
            style: style,
            statesController: states,
            icon: icon,
            label: text,
          )
        : FilledButton(
            onPressed: onPressed,
            style: style,
            statesController: states,
            child: iconOnly ? (icon ?? const SizedBox.shrink()) : text,
          ),
  );
  // React Aria's: radios in a group taking one, pressed toggles in one
  // taking several.
  final described = Semantics(
    label: iconOnly ? item.prop<String>('label') : null,
    checked: multiple ? null : selected,
    toggled: multiple ? selected : null,
    inMutuallyExclusiveGroup: !multiple,
    child: button,
  );
  return iconOnly ? _withTip(item.prop<String>('label'), described) : described;
}

Widget _toggleGroup(BuildContext context, DibaNodeContext node) {
  final items = [
    for (final i in node.items)
      if (i.type == 'ToggleButton' && i.id != null) i,
  ];
  final ids = {for (final i in items) i.id!};
  final multiple = node.str('selectionMode', 'single') == 'multiple';
  final disallowEmpty = node.flagOr('disallowEmptySelection', true);
  final selected = dibaKeys(node.current).where(ids.contains).toSet();
  final disabled = node.flag('isDisabled');
  final vertical = node.prop<String>('orientation') == 'vertical';
  final attached = !node.flagOr('isDetached', true);
  final size = node.str('size', 'sm');

  void choose(Set<String> next) {
    // React Aria refuses to empty the selection; it does not refuse to
    // start empty.
    if (disallowEmpty && next.isEmpty) return;
    node.setValue('onSelectionChange', next.toList());
  }

  final toggles = [
    for (var i = 0; i < items.length; i++)
      _toggle(
        context,
        items[i],
        size: size,
        selected: selected.contains(items[i].id),
        multiple: multiple,
        // A disabled group fades as a whole, its fill too.
        disabled: !disabled && items[i].flag('isDisabled'),
        attached: attached,
        shape: _toggleShape(
          index: i,
          count: items.length,
          attached: attached,
          vertical: vertical,
        ),
        onPressed: disabled || items[i].flag('isDisabled')
            ? null
            : () {
                final id = items[i].id!;
                final on = !selected.contains(id);
                final next = {...selected};
                if (multiple) {
                  on ? next.add(id) : next.remove(id);
                } else {
                  next
                    ..clear()
                    ..addAll(on ? [id] : const []);
                }
                choose(next);
              },
      ),
  ];
  // Attached, they touch; detached, 4 apart, as the web's.
  final gap = attached ? 0.0 : 4.0;
  final Widget laid;
  if (vertical) {
    laid = IntrinsicWidth(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: dibaSpaced(toggles, gap),
      ),
    );
  } else if (node.flag('fullWidth')) {
    laid = Row(
      children: [
        for (var i = 0; i < toggles.length; i++) ...[
          if (i > 0) SizedBox(width: gap),
          Expanded(child: toggles[i]),
        ],
      ],
    );
  } else {
    laid = attached
        ? Row(mainAxisSize: MainAxisSize.min, children: toggles)
        : Wrap(spacing: gap, runSpacing: gap, children: toggles);
  }
  // Attached segments share one fill, the group's, so where two meet off a
  // pixel's edge no seam of the page shows between their two edges, as it
  // did when each painted its own.
  final Widget group = attached
      ? DecoratedBox(
          decoration: ShapeDecoration(
            color: Theme.of(context).brightness == Brightness.dark
                ? DibaDarkNeutrals.fill
                : DibaLightNeutrals.fill,
            shape: vertical
                ? const RoundedRectangleBorder(
                    borderRadius: BorderRadius.all(Radius.circular(24)),
                  )
                : const StadiumBorder(),
          ),
          child: laid,
        )
      : laid;
  final faded = disabled ? Opacity(opacity: 0.5, child: group) : group;
  // As wide as its toggles unless it is full width: a column stretches what
  // it holds, and the shared fill with it.
  return node.flag('fullWidth')
      ? faded
      : Align(
          alignment: AlignmentDirectional.centerStart,
          widthFactor: 1,
          child: faded,
        );
}
