import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../tokens.g.dart';
import '../colours.dart';
import '../format.dart';
import '../node.dart';
import 'common.dart';

/// The extra components' status and hints: a Tooltip, a Badge, a
/// ProgressCircle and a Meter, in Diba's look: every number is the web's,
/// measured on the web.

bool _dark(BuildContext context) =>
    Theme.of(context).brightness == Brightness.dark;

/// `--foreground`, `--muted`, `--default` and `--default-foreground`.
Color _ink(BuildContext context) =>
    _dark(context) ? DibaDarkNeutrals.foreground : DibaLightNeutrals.foreground;
Color _fill(BuildContext context) =>
    _dark(context) ? DibaDarkNeutrals.fill : DibaLightNeutrals.fill;
Color _fillInk(BuildContext context) => _dark(context)
    ? DibaDarkNeutrals.fillForeground
    : DibaLightNeutrals.fillForeground;

/// A fill in a status colour: the tone's, or for `default` the neutral
/// fill's text, as the web's `--default-foreground` fill.
Color _toneFill(BuildContext context, String colour) =>
    colour == 'default' ? _fillInk(context) : dibaIndicator(context, colour);

// ---------------------------------------------------------------------------
// ProgressCircle

/// The web's ring: a 36 square drawn at [size], its stroke 4 there and round
/// at its ends, the track in `--default` and the arc from twelve o'clock
/// clockwise; waiting, a quarter of it turning once a second.
class _Ring extends StatefulWidget {
  const _Ring({
    required this.size,
    required this.fraction,
    required this.fill,
    required this.track,
  });

  final double size;

  /// Null while it waits.
  final double? fraction;
  final Color fill;
  final Color track;

  @override
  State<_Ring> createState() => _RingState();
}

class _RingState extends State<_Ring> with SingleTickerProviderStateMixin {
  late final AnimationController _spin = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 1),
  );

  void _sync() {
    if (widget.fraction == null) {
      if (!_spin.isAnimating) _spin.repeat();
    } else {
      _spin.stop();
    }
  }

  @override
  void initState() {
    super.initState();
    _sync();
  }

  @override
  void didUpdateWidget(_Ring old) {
    super.didUpdateWidget(old);
    _sync();
  }

  @override
  void dispose() {
    _spin.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => SizedBox.square(
    dimension: widget.size,
    child: AnimatedBuilder(
      animation: _spin,
      builder: (context, _) => Transform.rotate(
        angle: widget.fraction == null ? _spin.value * 2 * math.pi : 0,
        child: CustomPaint(
          painter: _RingPainter(
            fraction: widget.fraction ?? 0.25,
            fill: widget.fill,
            track: widget.track,
          ),
        ),
      ),
    ),
  );
}

class _RingPainter extends CustomPainter {
  _RingPainter({
    required this.fraction,
    required this.fill,
    required this.track,
  });

  final double fraction;
  final Color fill;
  final Color track;

  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.width / 36;
    final stroke = 4 * scale;
    final circle = Rect.fromCircle(
      center: size.center(Offset.zero),
      radius: 16 * scale,
    );
    final pen = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke;
    canvas.drawOval(circle, pen..color = track);
    if (fraction <= 0) return;
    canvas.drawArc(
      circle,
      -math.pi / 2,
      2 * math.pi * fraction,
      false,
      pen
        ..color = fill
        ..strokeCap = StrokeCap.round,
    );
  }

  @override
  bool shouldRepaint(_RingPainter old) =>
      old.fraction != fraction || old.fill != fill || old.track != track;
}

// ---------------------------------------------------------------------------

final Map<String, DibaBuilder> hintBlocks = {
  /// The theme's tooltip, the web's: at most 320 across, 3 above or
  /// below its block and 12 from the window's edge, above unless asked below.
  'Tooltip': (context, node) {
    final child = node.children.isEmpty ? null : node.children.first;
    if (child == null) {
      node.refuse('nothing to describe');
      return const SizedBox.shrink();
    }
    if (node.flag('isDisabled')) return child;
    return Tooltip(
      message: node.prop<String>('content') ?? '',
      preferBelow: node.str('placement', 'top') == 'bottom',
      waitDuration: Duration(
        milliseconds: (node.number('delay') ?? 500).round(),
      ),
      constraints: const BoxConstraints(maxWidth: 320),
      positionDelegate: (at) => positionDependentBox(
        size: at.overlaySize,
        childSize: at.tooltipSize,
        target: at.target,
        verticalOffset: at.targetSize.height / 2 + 3,
        preferBelow: at.preferBelow,
        margin: 12,
      ),
      child: child,
    );
  },

  /// The web's badge on its block's corner, a quarter of itself past it: 28
  /// across (16 small, 32 large) and round, ringed 1 in the page's colour; a
  /// number in the page's digits, past max as max and a plus, 12 on 16 and
  /// medium (10 small, 14 on 20 large); words as given; nothing, an empty
  /// disc. Solid, soft or on the neutral fill; start and end follow the
  /// page's direction.
  'Badge': (context, node) {
    final child = node.children.isEmpty
        ? const SizedBox.shrink()
        : node.children.first;
    final content = node.props['content'];
    final max = (node.number('max') ?? 99).round();
    final text = switch (content) {
      num n when n > max =>
        '${formatNumber(max, persian: node.isPersian, style: 'decimal')}+',
      num n => formatNumber(n, persian: node.isPersian, style: 'decimal'),
      String s => s,
      _ => null,
    };
    final tone = dibaTone(context, node.str('color', 'danger'));
    final (fill, ink) = switch (node.str('variant', 'primary')) {
      'soft' => (tone.soft, tone.ink),
      'secondary' => (_fill(context), tone.ink),
      _ => (tone.solid, tone.onSolid),
    };
    final (box, radius, size, line) = switch (node.str('size', 'md')) {
      'sm' => (16.0, 12.0, 10.0, 10 * 1.34),
      'lg' => (32.0, 16.0, 14.0, 14 * 1.43),
      _ => (28.0, 24.0, 12.0, 12 * 1.34),
    };
    final placement = node.str('placement', 'top-end');
    final top = placement.startsWith('top');
    final right =
        placement.endsWith('end') !=
        (Directionality.of(context) == TextDirection.rtl);
    final badge = Container(
      constraints: BoxConstraints(minWidth: box, minHeight: box),
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: fill,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(
          color: _dark(context)
              ? DibaDarkNeutrals.background
              : DibaLightNeutrals.background,
        ),
      ),
      child: text == null
          ? null
          : Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2),
              child: Text(
                text,
                style: dibaType(
                  context,
                  size,
                  line,
                  colour: ink,
                  weight: FontWeight.w500,
                ),
              ),
            ),
    );
    // A label is the badge's own, read after what it sits on as an image,
    // in place of its digits: «۱۲۸ سفارش», not «۹۹+» besides, as the web's.
    final label = node.prop<String>('label');
    return Stack(
      clipBehavior: Clip.none,
      children: [
        child,
        Positioned(
          top: top ? 0 : null,
          bottom: top ? null : 0,
          left: right ? null : 0,
          right: right ? 0 : null,
          child: FractionalTranslation(
            translation: Offset(right ? 0.25 : -0.25, top ? -0.25 : 0.25),
            child: label == null
                ? badge
                : Semantics(
                    label: label,
                    image: true,
                    child: ExcludeSemantics(child: badge),
                  ),
          ),
        ),
      ],
    );
  },

  /// The web's ring: 20, 28 or 36 across.
  'ProgressCircle': (context, node) {
    final min = node.number('minValue') ?? 0;
    final max = node.number('maxValue') ?? 100;
    final value = node.number('value') ?? min;
    final fraction = max == min
        ? 0.0
        : ((value - min) / (max - min)).clamp(0, 1).toDouble();
    final size = switch (node.str('size', 'md')) {
      'sm' => 20.0,
      'lg' => 36.0,
      _ => 28.0,
    };
    final waiting = node.flag('isIndeterminate');
    return Align(
      alignment: AlignmentDirectional.centerStart,
      widthFactor: 1,
      child: Semantics(
        label: node.prop<String>('label'),
        value: waiting ? null : '${(fraction * 100).round()}',
        child: _Ring(
          size: size,
          fraction: waiting ? null : fraction,
          fill: _toneFill(context, node.str('color', 'accent')),
          track: _fill(context),
        ),
      ),
    );
  },

  /// The web's meter: its label and its value 14 on 20 and medium at either
  /// end, 4 above a track in `--default` 8 tall and 4 round (4 and 2 small,
  /// 12 and 6 large), the fill as round from the start in the tone.
  'Meter': (context, node) {
    final min = node.number('minValue') ?? 0;
    final max = node.number('maxValue') ?? 100;
    final value = node.number('value') ?? min;
    final fraction = max == min
        ? 0.0
        : ((value - min) / (max - min)).clamp(0, 1).toDouble();
    final style = node.str('formatStyle', 'percent');
    final text =
        node.prop<String>('valueLabel') ??
        formatNumber(
          style == 'percent' ? fraction : value,
          persian: node.isPersian,
          style: style,
          currency: node.prop<String>('currency'),
        );
    final label = node.prop<String>('label');
    final showValue = node.flagOr('showValue', true);
    final (height, radius) = switch (node.str('size', 'md')) {
      'sm' => (4.0, 2.0),
      'lg' => (12.0, 6.0),
      _ => (8.0, 4.0),
    };
    final words = dibaType(
      context,
      14,
      20,
      colour: _ink(context),
      weight: FontWeight.w500,
    );
    final round = BorderRadius.circular(radius);
    return Semantics(
      label: [?label, text].join(node.isPersian ? '، ' : ', '),
      value: '${(fraction * 100).round()}',
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 4,
        children: [
          if (label != null || showValue)
            ExcludeSemantics(
              child: Row(
                children: [
                  Expanded(
                    child: label == null
                        ? const SizedBox.shrink()
                        : Text(label, style: words),
                  ),
                  if (showValue)
                    Text(
                      text,
                      style: words.copyWith(
                        fontFeatures: const [FontFeature.tabularFigures()],
                      ),
                    ),
                ],
              ),
            ),
          ClipRRect(
            borderRadius: round,
            child: Container(
              height: height,
              color: _fill(context),
              alignment: AlignmentDirectional.centerStart,
              child: FractionallySizedBox(
                widthFactor: fraction,
                heightFactor: 1,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: _toneFill(context, node.str('color', 'accent')),
                    borderRadius: round,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  },
};
