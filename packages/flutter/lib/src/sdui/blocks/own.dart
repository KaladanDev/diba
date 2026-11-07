import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../tokens.g.dart';
import '../colours.dart';
import '../format.dart';
import '../node.dart';
import '../strings.dart';
import 'common.dart';

/// Group 7, Diba's own blocks: layout, words and pictures, in
/// Material 3 with Diba's theme, their props the web's.

/// A space token, 0 to 16: 4 a step, as the web's quarter rem.
double _space(Object? token, [double fallback = 4]) =>
    (token is num ? token.toDouble() : fallback) * 4;

CrossAxisAlignment _cross(String? v) => switch (v) {
  'start' => CrossAxisAlignment.start,
  'center' => CrossAxisAlignment.center,
  'end' => CrossAxisAlignment.end,
  'baseline' => CrossAxisAlignment.baseline,
  _ => CrossAxisAlignment.stretch,
};

MainAxisAlignment _main(String? v) => switch (v) {
  'center' => MainAxisAlignment.center,
  'end' => MainAxisAlignment.end,
  'between' => MainAxisAlignment.spaceBetween,
  'around' => MainAxisAlignment.spaceAround,
  _ => MainAxisAlignment.start,
};

/// The web's type scale: a size and its line.
const _sizes = {
  'xs': (12.0, 16.0),
  'sm': (14.0, 20.0),
  'md': (16.0, 24.0),
  'lg': (18.0, 28.0),
  'xl': (20.0, 28.0),
  '2xl': (24.0, 32.0),
  '3xl': (30.0, 36.0),
  '4xl': (36.0, 40.0),
  '5xl': (48.0, 48.0),
};

const _leading = {'tight': 1.25, 'snug': 1.375, 'relaxed': 1.625};

const _weights = {
  'medium': FontWeight.w500,
  'semibold': FontWeight.w600,
  'bold': FontWeight.w700,
};

/// A tone's ink, readable on a surface: the muted, or a status tone's.
Color _ink(BuildContext context, String tone) {
  final scheme = Theme.of(context).colorScheme;
  return switch (tone) {
    'muted' => scheme.onSurfaceVariant,
    'accent' ||
    'success' ||
    'warning' ||
    'danger' => dibaTone(context, tone).ink,
    _ => scheme.onSurface,
  };
}

Widget _text(BuildContext context, DibaNodeContext node) {
  final (size, line) = _sizes[node.str('size', 'md')] ?? _sizes['md']!;
  final number = node.props['number'];
  final words = number is num
      ? formatNumber(
          number,
          persian: node.isPersian,
          style: node.str('formatStyle', 'decimal'),
          currency: node.prop<String>('currency'),
          maximumFractionDigits: node.number('maximumFractionDigits')?.round(),
        )
      : (node.text ?? '');
  final mono = node.flag('isMono');
  final lines = node.number('maxLines')?.round();
  Widget text = Text(
    words,
    maxLines: lines != null && lines >= 1 ? lines : null,
    overflow: lines != null && lines >= 1 ? TextOverflow.ellipsis : null,
    textAlign: switch (node.prop<String>('align')) {
      'start' => TextAlign.start,
      'center' => TextAlign.center,
      'end' => TextAlign.end,
      _ => null,
    },
    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
      fontSize: size,
      height: (_leading[node.str('leading', 'normal')] ?? line / size),
      fontWeight: _weights[node.str('weight', 'normal')] ?? FontWeight.w400,
      color: _ink(context, node.str('tone', 'default')),
      fontFamily: mono ? DibaFonts.mono : null,
      fontFeatures: mono ? const [FontFeature.tabularFigures()] : null,
      letterSpacing: 0,
    ),
  );
  if (node.str('dir', 'auto') == 'ltr') {
    text = Directionality(textDirection: TextDirection.ltr, child: text);
  }
  final level = node.number('headingLevel')?.round();
  return level != null && level >= 1 && level <= 6
      ? Semantics(header: true, child: text)
      : text;
}

/// A ratio written "16/9" or "1".
double? _ratio(Object? value) {
  if (value is num) return value.toDouble();
  if (value is! String) return null;
  final parts = value.split('/');
  final a = double.tryParse(parts.first.trim());
  final b = parts.length > 1 ? double.tryParse(parts[1].trim()) : 1.0;
  return a == null || b == null || b == 0 ? null : a / b;
}

double _radius(String radius) => switch (radius) {
  'none' => 0,
  'sm' => 8,
  'lg' => 16,
  'full' => 9999,
  _ => 12,
};

/// A picture, the web's: on the second paper while it comes, fading in
/// over 400ms once it has; one that fails shows what it was of, muted, 14 on
/// 21, 12 in and centred, rather than a broken picture. Its corners rounded;
/// a press opens a zoomable one larger.
Widget _picture(
  BuildContext context, {
  required String? src,
  required String alt,
  double? ratio,
  BoxFit fit = BoxFit.cover,
  double radius = 12,
  bool zoomable = false,
}) {
  final dark = Theme.of(context).brightness == Brightness.dark;
  final ground = dark ? DibaDarkColors.surface2 : DibaLightColors.surface2;
  final failed = Padding(
    padding: const EdgeInsets.all(12),
    child: Center(
      child: Text(
        alt,
        textAlign: TextAlign.center,
        style: dibaType(
          context,
          14,
          21,
          colour: dark ? DibaDarkColors.fgMuted : DibaLightColors.fgMuted,
        ),
      ),
    ),
  );
  Widget picture = src == null
      ? failed
      : Image.network(
          src,
          fit: fit,
          semanticLabel: alt.isEmpty ? null : alt,
          excludeFromSemantics: alt.isEmpty,
          errorBuilder: (_, _, _) => ExcludeSemantics(child: failed),
          frameBuilder: (context, child, frame, sync) => sync
              ? child
              : AnimatedOpacity(
                  opacity: frame == null ? 0 : 1,
                  duration: DibaMotion.slow,
                  curve: Curves.easeOut,
                  child: child,
                ),
        );
  picture = ColoredBox(color: ground, child: picture);
  if (ratio != null) picture = AspectRatio(aspectRatio: ratio, child: picture);
  picture = ClipRRect(
    borderRadius: BorderRadius.circular(radius),
    child: picture,
  );
  if (!zoomable || src == null) return picture;
  return GestureDetector(
    onTap: () => showDialog<void>(
      context: context,
      builder: (dialog) => Dialog(
        clipBehavior: Clip.antiAlias,
        child: InteractiveViewer(
          child: Image.network(src, fit: BoxFit.contain),
        ),
      ),
    ),
    child: MouseRegion(cursor: SystemMouseCursors.zoomIn, child: picture),
  );
}

/// A key or a URL, monospaced and left to right, with its copy button; the
/// default surface or the secondary's edge.
class _Snippet extends StatefulWidget {
  const _Snippet({required this.node});

  final DibaNodeContext node;

  @override
  State<_Snippet> createState() => _SnippetState();
}

/// How tall Material's icon button lays out: 40 by the theme's density, and
/// 48 where the theme pads it to a finger's target.
double _buttonExtent(BuildContext context) {
  final theme = Theme.of(context);
  final drawn = 40 + theme.visualDensity.baseSizeAdjustment.dy;
  return theme.materialTapTargetSize == MaterialTapTargetSize.padded
      ? (drawn > kMinInteractiveDimension ? drawn : kMinInteractiveDimension)
      : drawn;
}

class _SnippetState extends State<_Snippet> {
  bool _copied = false;

  @override
  Widget build(BuildContext context) {
    final node = widget.node;
    final scheme = Theme.of(context).colorScheme;
    final strings = DibaStrings.of(context);
    final words = node.text ?? '';
    final symbol = node.prop<String>('symbol');
    final secondary = node.str('variant', 'default') == 'secondary';
    final copyable = !node.flag('hideCopyButton');
    final pad = switch (node.str('size', 'md')) {
      'sm' => 8.0,
      'lg' => 16.0,
      _ => 12.0,
    };
    return Directionality(
      textDirection: TextDirection.ltr,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: pad, vertical: pad / 2),
        decoration: BoxDecoration(
          // On a grey card the surface, as the web's: the second surface is
          // the card's own grey there, and the snippet had no frame.
          color: secondary
              ? Colors.transparent
              : DibaGreyPaper.of(context)
              ? (Theme.of(context).brightness == Brightness.dark
                    ? DibaDarkNeutrals.surface
                    : DibaLightNeutrals.surface)
              : scheme.surfaceContainer,
          border: secondary ? Border.all(color: scheme.outlineVariant) : null,
          borderRadius: BorderRadius.circular(12),
        ),
        // The copy button at the frame's end, the right edge on either page,
        // as the web's; it had followed the words.
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          // The button at the top end: on one line centred on the words, on
          // several level with the first, as the web's.
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Flexible(
              child: Padding(
                padding: EdgeInsets.symmetric(
                  vertical: copyable ? (_buttonExtent(context) - 21) / 2 : 0,
                ),
                child: Text(
                  [
                    if (symbol != null && !node.flag('hideSymbol')) symbol,
                    words,
                  ].join(' '),
                  // 14 on 21 at every size.
                  style: TextStyle(
                    fontFamily: DibaFonts.mono,
                    fontSize: 14,
                    height: 21 / 14,
                  ),
                ),
              ),
            ),
            if (copyable)
              IconButton(
                tooltip: strings.message('copy'),
                onPressed: () async {
                  final text = node.prop<String>('copyText') ?? words;
                  await Clipboard.setData(ClipboardData(text: text));
                  node.fire('onCopy', text);
                  if (mounted) setState(() => _copied = true);
                },
                icon: Icon(_copied ? Icons.check : Icons.copy, size: 16),
              ),
          ],
        ),
      ),
    );
  }
}

final Map<String, DibaBuilder> ownBlocks = {
  'Stack': (context, node) {
    final horizontal = node.str('direction', 'vertical') == 'horizontal';
    final gap = _space(node.props['gap']);
    if (horizontal && node.flag('wrap')) {
      return Wrap(
        spacing: gap,
        runSpacing: gap,
        crossAxisAlignment: switch (node.prop<String>('align')) {
          'start' => WrapCrossAlignment.start,
          'end' => WrapCrossAlignment.end,
          _ => WrapCrossAlignment.center,
        },
        children: node.children,
      );
    }
    final cross = _cross(node.prop<String>('align'));
    final main = _main(node.prop<String>('justify'));
    if (horizontal) {
      final row = Row(
        crossAxisAlignment: cross,
        mainAxisAlignment: main,
        mainAxisSize: MainAxisSize.min,
        textBaseline: cross == CrossAxisAlignment.baseline
            ? TextBaseline.alphabetic
            : null,
        spacing: gap,
        children: node.children,
      );
      // A separator down runs the row's height, as a flex row stretches it
      //: the row is measured first.
      final rule = node.items.any(
        (i) => i.type == 'Separator' && i.props['orientation'] == 'vertical',
      );
      return rule ? IntrinsicHeight(child: row) : row;
    }
    return Column(
      crossAxisAlignment: cross == CrossAxisAlignment.baseline
          ? CrossAxisAlignment.start
          : cross,
      mainAxisAlignment: main,
      mainAxisSize: MainAxisSize.min,
      spacing: gap,
      children: node.children,
    );
  },

  'Text': _text,

  'Spacer': (context, node) {
    final size = _space(node.props['size']);
    return node.str('axis', 'block') == 'inline'
        ? SizedBox(width: size)
        : SizedBox(height: size);
  },

  'Image': (context, node) => _picture(
    context,
    src: node.prop<String>('src'),
    alt: node.prop<String>('alt') ?? '',
    ratio: _ratio(node.props['ratio']),
    fit: node.str('fit', 'cover') == 'contain' ? BoxFit.contain : BoxFit.cover,
    radius: _radius(node.str('radius', 'md')),
    zoomable: node.flag('isZoomable'),
  ),

  'Snippet': (context, node) => _Snippet(node: node),
};
