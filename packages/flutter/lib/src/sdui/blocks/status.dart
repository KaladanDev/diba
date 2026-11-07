import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../tokens.g.dart';
import '../colours.dart';
import '../field.dart';
import '../format.dart';
import '../guards.dart';
import '../icons.dart';
import '../node.dart';
import '../strings.dart';
import 'actions.dart';
import 'common.dart';

/// Group 5: Alert, Chip, TagGroup, Tag, Spinner, ProgressBar, Avatar,
/// AvatarGroup.

/// The web's spinner: two arcs, the first solid fading to
/// 55% and the second clear rising to 55%, over a ring in the off-track
/// shade, turning once every 750ms. It holds still when the platform
/// asks for no animation, as the web's does under `prefers-reduced-motion`.
/// [size] is 16, 24, 32 or 40, the web's sizes.
class DibaSpinner extends StatefulWidget {
  const DibaSpinner({
    super.key,
    required this.size,
    required this.colour,
    required this.track,
    required this.label,
  });

  final double size;
  final Color colour;
  final Color track;
  final String label;

  @override
  State<DibaSpinner> createState() => _DibaSpinnerState();
}

class _DibaSpinnerState extends State<DibaSpinner>
    with SingleTickerProviderStateMixin {
  late final AnimationController _turn = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 750),
  );

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (MediaQuery.maybeDisableAnimationsOf(context) ?? false) {
      _turn.stop();
    } else if (!_turn.isAnimating) {
      _turn.repeat();
    }
  }

  @override
  void dispose() {
    _turn.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Align(
    // Its own size at the start, as the web's inline spinner sits: in a
    // column that stretches it, it had filled the width and drawn as wide.
    alignment: AlignmentDirectional.centerStart,
    widthFactor: 1,
    heightFactor: 1,
    child: Semantics(
      label: widget.label,
      child: SizedBox.square(
        dimension: widget.size,
        child: RotationTransition(
          turns: _turn,
          child: CustomPaint(
            painter: _SpinnerPainter(
              colour: widget.colour,
              track: widget.track,
            ),
          ),
        ),
      ),
    ),
  );
}

/// The web's spinner, drawn from its SVG's paths in their 24 square: the
/// ring 9 round and 3 wide, and the two arcs, moved 1.5 across and 1.625
/// down as the SVG moves them, each filled with its gradient down its own
/// bounds.
class _SpinnerPainter extends CustomPainter {
  _SpinnerPainter({required this.colour, required this.track});

  final Color colour;
  final Color track;

  static final Path _first = Path()
    ..moveTo(8.749, 0.021)
    ..arcToPoint(const Offset(9.246, 2.979), radius: const Radius.circular(1.5))
    ..arcToPoint(
      const Offset(3, 10.375),
      radius: const Radius.circular(7.5),
      clockwise: false,
    )
    ..arcToPoint(
      const Offset(10.5, 17.875),
      radius: const Radius.circular(7.5),
      clockwise: false,
    )
    ..lineTo(10.5, 20.875)
    ..cubicTo(4.701, 20.875, 0, 16.175, 0, 10.375)
    ..cubicTo(0, 5.23, 3.726, 0.865, 8.749, 0.021)
    ..close();

  static final Path _second = Path()
    ..moveTo(15.392, 2.673)
    ..arcToPoint(
      const Offset(17.511, 2.558),
      radius: const Radius.circular(1.5),
    )
    ..arcToPoint(const Offset(21, 10.375), radius: const Radius.circular(10.48))
    ..cubicTo(21, 16.175, 16.299, 20.875, 10.5, 20.875)
    ..lineTo(10.5, 17.875)
    ..arcToPoint(
      const Offset(15.507, 4.791),
      radius: const Radius.circular(7.5),
      clockwise: false,
    )
    ..arcToPoint(
      const Offset(15.392, 2.673),
      radius: const Radius.circular(1.5),
    )
    ..close();

  /// A gradient down [path]'s bounds, from [from] to [to] of their height,
  /// as an SVG gradient in the bounding box's units runs.
  static Shader _down(Path path, double from, double to, List<Color> colours) =>
      LinearGradient(
        begin: Alignment(0, -1 + 2 * from),
        end: Alignment(0, -1 + 2 * to),
        colors: colours,
      ).createShader(path.getBounds());

  @override
  void paint(Canvas canvas, Size size) {
    canvas
      ..save()
      ..scale(size.width / 24)
      ..drawCircle(
        const Offset(12, 12),
        9,
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 3
          ..color = track,
      )
      ..translate(1.5, 1.625)
      ..drawPath(
        _first,
        Paint()
          ..shader = _down(_first, 0.05271, 0.91793, [
            colour,
            colour.withValues(alpha: colour.a * 0.55),
          ]),
      )
      ..drawPath(
        _second,
        Paint()
          ..shader = _down(_second, 0.1524, 0.8715, [
            colour.withValues(alpha: 0),
            colour.withValues(alpha: colour.a * 0.55),
          ]),
      )
      ..restore();
  }

  @override
  bool shouldRepaint(_SpinnerPainter old) =>
      old.colour != colour || old.track != track;
}

/// An alert's own mark by status, Lucide's as the web's: info for
/// default and accent.
IconData _statusIcon(String status) => switch (status) {
  'success' => LucideIcons.circleCheck,
  'warning' => LucideIcons.triangleAlert,
  'danger' => LucideIcons.circleAlert,
  _ => LucideIcons.info,
};

/// An alert's words in the web's type: [size] on a [line] high line, none of
/// Material's letter spacing, the leading split above and below as CSS
/// splits it.
TextStyle _alertType(
  BuildContext context,
  double line, {
  required Color colour,
  FontWeight weight = FontWeight.w400,
}) => Theme.of(context).textTheme.bodyMedium!.copyWith(
  fontSize: 14,
  height: line / 14,
  fontWeight: weight,
  color: colour,
  letterSpacing: 0,
  leadingDistribution: TextLeadingDistribution.even,
);

/// An avatar's numbers, the web's: 32, 40 or 48 across, its initials
/// 12, 14 or 17, its presence dot 10, 12 or 14; the count's pill is 8
/// shorter, 8, 10 or 12 in, its words 12, 12 or 14.
({double size, double initials, double dot, double pad, double count})
_avatarMetrics(String? size) => switch (size) {
  'sm' => (size: 32.0, initials: 12.0, dot: 10.0, pad: 8.0, count: 12.0),
  'lg' => (size: 48.0, initials: 17.0, dot: 14.0, pad: 12.0, count: 14.0),
  _ => (size: 40.0, initials: 14.0, dot: 12.0, pad: 10.0, count: 12.0),
};

Color _hueColour(String hue) => switch (hue) {
  'garnet' => DibaPalette.garnet500,
  'emerald' => DibaPalette.emerald600,
  'sky' => DibaPalette.sky600,
  'iris' => DibaPalette.iris500,
  _ => DibaPalette.saffron600,
};

/// A hue's tint and ink: the hue 18% over the surface and 62% into the
/// text colour; 30% and 55% in dark.
({Color fill, Color ink}) _hueTone(BuildContext context, Color hue) {
  final dark = Theme.of(context).brightness == Brightness.dark;
  return (
    fill: Color.lerp(
      dark ? DibaDarkNeutrals.surface : DibaLightNeutrals.surface,
      hue,
      dark ? 0.30 : 0.18,
    )!,
    ink: Color.lerp(
      dark ? DibaDarkNeutrals.foreground : DibaLightNeutrals.foreground,
      hue,
      dark ? 0.55 : 0.62,
    )!,
  );
}

/// The face's fill and ink. Without a colour of its own or its group's, a
/// named avatar takes its name's hue. A colour from the tree is Diba's
/// status tone: in its ink on the neutral fill, or, soft, on its tint.
({Color fill, Color ink}) _avatarTone(
  BuildContext context,
  String? colour,
  bool soft,
  String name,
) {
  if (colour == null && name.isNotEmpty) {
    return _hueTone(context, _hueColour(dibaHueOf(name)));
  }
  final tone = dibaTone(context, colour);
  if (soft) return (fill: tone.soft, ink: tone.ink);
  final neutral = dibaTone(context, 'default');
  return (
    fill: neutral.solid,
    ink: colour == null || colour == 'default' ? neutral.onSolid : tone.ink,
  );
}

Color _presenceColour(BuildContext context, String presence) =>
    switch (presence) {
      'away' => dibaTone(context, 'warning').solid,
      'busy' => dibaTone(context, 'danger').solid,
      'offline' => Theme.of(context).colorScheme.onSurfaceVariant,
      _ => dibaTone(context, 'success').solid,
    };

const _presences = {'online', 'away', 'busy', 'offline'};

/// One avatar from its props, shared by Avatar and by AvatarGroup, which
/// fills in what its children leave out: a circle with a photo over
/// the initials, which stay if it fails, or an icon half its size; a
/// presence dot at the bottom of the end side, ringed in the surface; with
/// `isRinged`, a gilt ring 2 outside it, 2 clear. [stacked] leaves the dot
/// and the ring out, as a stack would hide them.
Widget _avatar(
  BuildContext context,
  Map<String, Object?> props, {
  bool stacked = false,
}) {
  final m = _avatarMetrics(props['size'] as String?);
  final name = props['name'] is String ? (props['name'] as String).trim() : '';
  final colour = props['color'] is String ? props['color'] as String : null;
  final tone = _avatarTone(context, colour, props['variant'] == 'soft', name);
  final src = props['src'] is String ? props['src'] as String : null;
  final icon = dibaIcon(props['icon']);
  final image = src != null && isSafeImageUrl(src) ? NetworkImage(src) : null;
  final presence = !stacked && _presences.contains(props['presence'])
      ? props['presence'] as String
      : null;
  final ringed = !stacked && props['isRinged'] == true;
  final strings = DibaStrings.of(context);
  // The name, then the presence: «نیلوفر رستمی، آنلاین».
  final label = [
    if (name.isNotEmpty) name,
    if (presence != null) strings.message(presence),
  ].join(strings.persian ? '، ' : ', ');
  final dark = Theme.of(context).brightness == Brightness.dark;

  Widget face = DecoratedBox(
    decoration: BoxDecoration(color: tone.fill, shape: BoxShape.circle),
    child: Center(
      child: icon != null
          ? Icon(icon, size: m.size / 2, color: tone.ink)
          : Text(
              initialsOf(name),
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: m.initials,
                height: 1,
                leadingDistribution: TextLeadingDistribution.even,
                fontWeight: DibaFontWeight.medium,
                color: tone.ink,
                letterSpacing: 0,
              ),
            ),
    ),
  );
  if (image != null) {
    // Over the initials, which stay if the picture fails.
    face = Stack(
      fit: StackFit.expand,
      children: [
        face,
        ClipOval(
          child: Image(
            image: image,
            fit: BoxFit.cover,
            errorBuilder: (_, _, _) => const SizedBox.shrink(),
          ),
        ),
      ],
    );
  }
  return Semantics(
    label: label.isEmpty ? null : label,
    image: true,
    excludeSemantics: true,
    child: SizedBox.square(
      dimension: m.size,
      child: Stack(
        clipBehavior: Clip.none,
        fit: StackFit.expand,
        children: [
          face,
          if (ringed)
            Positioned(
              left: -4,
              top: -4,
              right: -4,
              bottom: -4,
              child: IgnorePointer(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: dibaTone(context, 'accent').solid,
                      width: 2,
                    ),
                  ),
                ),
              ),
            ),
          if (presence != null)
            PositionedDirectional(
              end: 0,
              bottom: 0,
              width: m.dot,
              height: m.dot,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: _presenceColour(context, presence),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: dark
                        ? DibaDarkNeutrals.surface
                        : DibaLightNeutrals.surface,
                    width: 2,
                  ),
                ),
              ),
            ),
        ],
      ),
    ),
  );
}

/// The count after a group's first few: a pill in the brand's hue, as
/// a saffron avatar is tinted, 8 shorter than the avatars, "+3 more"
/// («+۳ نفر») in the reader's digits.
Widget _avatarCount(
  BuildContext context,
  String? size,
  int rest,
  bool persian,
) {
  final m = _avatarMetrics(size);
  final tone = _hueTone(context, DibaPalette.saffron600);
  return Container(
    height: m.size - 8,
    padding: EdgeInsets.symmetric(horizontal: m.pad),
    alignment: Alignment.center,
    decoration: ShapeDecoration(color: tone.fill, shape: const StadiumBorder()),
    child: Text(
      DibaStrings.forPersian(
        persian,
      ).message('more', persian ? persianDigits(rest) : '$rest'),
      maxLines: 1,
      softWrap: false,
      style: TextStyle(
        fontSize: m.count,
        height: 1,
        leadingDistribution: TextLeadingDistribution.even,
        fontWeight: DibaFontWeight.medium,
        color: tone.ink,
        letterSpacing: 0,
      ),
    ),
  );
}

/// Cuts a crescent out of an avatar where the next one overlaps it.
class _Crescent extends CustomClipper<Path> {
  const _Crescent({required this.next, required this.radius});

  final Offset next;
  final double radius;

  @override
  Path getClip(Size size) => Path.combine(
    PathOperation.difference,
    Path()..addOval(Offset.zero & size),
    Path()..addOval(Rect.fromCircle(center: next, radius: radius)),
  );

  @override
  bool shouldReclip(_Crescent old) => old.next != next || old.radius != radius;
}

final Map<String, DibaBuilder> statusBlocks = {
  /// Material has no inline alert: a tinted box with an icon, composed.
  /// The web's alert (Diba's): its status's tint 24 round, 12 above
  /// and below and 16 across; the status's mark, 16 in a 24 box, and the
  /// words 16 after it; the title 14 on 24, medium, in the status's ink, the
  /// description 14 on 20 in the text colour, the actions 8 under them; a
  /// dismissible one ends in the web's close button, 16 from the words.
  'Alert': (context, node) {
    if (node.local('dismissed') == true) return const SizedBox.shrink();
    var status = node.prop<String>('status');
    if (status == null) {
      // Required, not defaulted: a block that forgot to say should not render
      // red, and it should not quietly pick a colour either.
      node.refuse('no status');
      status = 'default';
    }
    final tone = dibaTone(context, status);
    final scheme = Theme.of(context).colorScheme;
    final icon = dibaIcon(node.prop<String>('icon'));
    final title = node.prop<String>('title');
    final description = node.prop<String>('description');
    final actions = node.slots['actions'];

    return Semantics(
      liveRegion: node.flagOr('isLive', status == 'danger'),
      container: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: tone.soft,
          borderRadius: const BorderRadius.all(Radius.circular(24)),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (!node.flag('hideIcon')) ...[
                // The mark 20 across in its 24 box: at 16 it read small
                // beside a title and its detail.
                SizedBox.square(
                  dimension: 24,
                  child: Center(
                    child: Icon(
                      icon ?? _statusIcon(status),
                      size: 20,
                      color: tone.ink,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
              ],
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (title != null)
                      Text(
                        title,
                        style: _alertType(
                          context,
                          24,
                          weight: FontWeight.w500,
                          colour: tone.ink,
                        ),
                      ),
                    if (description != null)
                      Text(
                        description,
                        style: _alertType(
                          context,
                          20,
                          colour: scheme.onSurface,
                        ),
                      ),
                    if (actions != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: actions,
                      ),
                  ],
                ),
              ),
              if (node.flag('isDismissible')) ...[
                const SizedBox(width: 16),
                // The block hides itself: v3's Alert has no close part, so
                // both platforms end it in their close button.
                dibaCloseButton(
                  context,
                  label: DibaStrings.of(context).close,
                  onPressed: () {
                    node.setLocal('dismissed', true);
                    node.fire('onClose');
                  },
                ),
              ],
            ],
          ),
        ),
      ),
    );
  },

  /// A static label. A chip you press or remove is a Tag.
  'Chip': (context, node) {
    final tone = dibaTone(context, node.str('color', 'default'));
    final variant = node.str('variant', 'soft');
    final scheme = Theme.of(context).colorScheme;
    final (background, foreground) = switch (variant) {
      'primary' => (tone.solid, tone.onSolid),
      'secondary' => (scheme.surfaceContainer, tone.ink),
      'tertiary' => (Colors.transparent, tone.ink),
      _ => (tone.soft, tone.ink),
    };
    final size = node.str('size', 'sm');
    final height = switch (size) {
      'lg' => DibaDimens.chipHeightLg,
      'md' => DibaDimens.chipHeightMd,
      _ => DibaDimens.chipHeightSm,
    };
    final icon = dibaIconFor(
      node,
      node.props['icon'],
      size: height * 0.55,
      colour: foreground,
    );
    // Material's Chip has no size, and its smallest density is still taller
    // than v3's small chip; a fixed-height box is what gets the 24 back.
    return Align(
      alignment: AlignmentDirectional.centerStart,
      widthFactor: 1,
      child: Container(
        height: height,
        padding: EdgeInsets.symmetric(horizontal: height / 3),
        decoration: BoxDecoration(
          color: background,
          borderRadius: BorderRadius.circular(height / 2),
          border: variant == 'tertiary'
              ? Border.all(color: scheme.outlineVariant)
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[icon, SizedBox(width: DibaDimens.chipGap)],
            Text(
              node.text ?? '',
              style: TextStyle(
                color: foreground,
                fontSize: size == 'lg' ? DibaFontSize.sm : DibaFontSize.xs,
                fontWeight: DibaFontWeight.medium,
              ),
            ),
          ],
        ),
      ),
    );
  },

  /// Material's InputChip in Diba's theme, with two rules of Diba's: a chosen
  /// tag is the gilt fill with slate-700 on it, as a chosen
  /// toggle is, where Material's iris soft fill was all but the unchosen
  /// one's; and a tag that does nothing is drawn as an unchosen one, where
  /// InputChip, with nothing to press, faded it as if disabled.
  'TagGroup': (context, node) {
    final tags = node.items
        .where((i) => i.type == 'Tag' && i.id != null)
        .toList();
    final mode = node.str('selectionMode', 'none');
    final selected = dibaKeys(node.current).toSet();
    final removable = node.handlers.containsKey('onRemove');
    final scheme = Theme.of(context).colorScheme;
    final dark = Theme.of(context).brightness == Brightness.dark;
    final fill = dark
        ? DibaDarkColors.controlFill
        : DibaLightColors.controlFill;
    final onFill = dark
        ? DibaDarkColors.controlOnFill
        : DibaLightColors.controlOnFill;
    final surface = node.prop<String>('variant') == 'surface';
    final density = switch (node.str('size', 'md')) {
      'sm' => const VisualDensity(horizontal: -2, vertical: -4),
      'lg' => VisualDensity.standard,
      _ => VisualDensity.compact,
    };
    final empty = node.prop<String>('emptyMessage');

    void choose(String id, bool on) {
      final next = mode == 'single' ? <String>{} : {...selected};
      on ? next.add(id) : next.remove(id);
      if (node.flag('disallowEmptySelection') && next.isEmpty) return;
      node.setValue('onSelectionChange', next.toList());
    }

    Widget chipOf(DibaItem tag) {
      final disabled = tag.flag('isDisabled');
      final on = mode != 'none' && selected.contains(tag.id);
      final href = tag.prop<String>('href');
      final label = Text(tag.text ?? tag.id!);
      final background = surface ? scheme.surface : scheme.surfaceContainer;
      final side = BorderSide(
        color: surface ? scheme.outlineVariant : Colors.transparent,
      );
      // The words, the icon and the cross: muted, slate-700 on the gilt,
      // the text colour (at Material's 38%) disabled.
      final ink = disabled
          ? scheme.onSurface
          : on
          ? onFill
          : scheme.onSurfaceVariant;
      final iconTheme = IconThemeData(color: ink, size: 18);
      // Chosen among several, the tick takes the icon's square.
      final icon = on && mode == 'multiple'
          ? null
          : dibaItemIcon(tag, size: 16);
      // Nothing to choose, open or remove: Material's plain chip, which
      // draws at full strength and takes no focus.
      if (mode == 'none' && href == null && !removable && !disabled) {
        return Chip(
          label: label,
          avatar: icon,
          visualDensity: density,
          backgroundColor: background,
          side: side,
          labelStyle: TextStyle(color: ink),
          iconTheme: iconTheme,
        );
      }
      return InputChip(
        label: label,
        avatar: icon,
        visualDensity: density,
        backgroundColor: background,
        selectedColor: fill,
        side: side,
        labelStyle: TextStyle(color: ink),
        iconTheme: iconTheme,
        checkmarkColor: onFill,
        deleteIconColor: ink,
        showCheckmark: mode == 'multiple',
        isEnabled: !disabled,
        selected: on,
        onSelected: mode == 'none' ? null : (v) => choose(tag.id!, v),
        onPressed: mode == 'none' && href != null
            ? () => node.navigateTo(href)
            : null,
        // The remove button shows when the group declares onRemove, as in
        // the admin.
        onDeleted: removable ? () => node.fire('onRemove', tag.id) : null,
        deleteButtonTooltipMessage: removable
            ? DibaStrings.of(context).clear
            : null,
      );
    }

    return DibaFieldShell(
      node: node,
      // Its help and its error both, as the web's.
      helpAndError: true,
      child: tags.isEmpty && empty != null
          ? Text(empty, style: TextStyle(color: scheme.onSurfaceVariant))
          : Wrap(
              spacing: DibaDimens.chipGroupGap,
              runSpacing: DibaDimens.chipGroupGap,
              children: [for (final tag in tags) chipOf(tag)],
            ),
    );
  },

  /// Drawn by its group.
  'Tag': (context, node) => const SizedBox.shrink(),

  /// The web's spinner (Diba's): the web's arc over a track ring.
  'Spinner': (context, node) {
    final size = switch (node.str('size', 'md')) {
      'sm' => 16.0,
      'lg' => 32.0,
      'xl' => 40.0,
      _ => 24.0,
    };
    final colour = node.str('color', 'accent');
    final dark = Theme.of(context).brightness == Brightness.dark;
    return DibaSpinner(
      size: size,
      colour: colour == 'current'
          ? DefaultTextStyle.of(context).style.color ??
                Theme.of(context).colorScheme.onSurface
          : dibaTone(context, colour).solid,
      track: dark ? DibaDarkColors.controlTrack : DibaLightColors.controlTrack,
      label: node.prop<String>('label') ?? DibaStrings.of(context).loading,
    );
  },

  'ProgressBar': (context, node) {
    final min = node.number('minValue') ?? 0;
    final max = node.number('maxValue') ?? 100;
    final value = node.number('value') ?? min;
    final indeterminate = node.flag('isIndeterminate');
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
    final showValue = node.flagOr('showValue', true) && !indeterminate;
    final fill = dibaIndicator(context, node.str('color', 'accent'));
    final height = switch (node.str('size', 'md')) {
      'sm' => DibaDimens.progressTrackSm,
      'lg' => DibaDimens.progressTrackLg,
      _ => DibaDimens.progressTrackSm + 4,
    };
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (label != null || showValue)
          Padding(
            padding: EdgeInsets.only(bottom: DibaSpace.space1),
            child: Row(
              children: [
                if (label != null)
                  Expanded(
                    child: Text(
                      label,
                      style: Theme.of(context).textTheme.labelLarge,
                    ),
                  ),
                if (showValue) Text(text),
              ],
            ),
          ),
        ClipRRect(
          borderRadius: BorderRadius.circular(height),
          child: LinearProgressIndicator(
            value: indeterminate ? null : fraction,
            minHeight: height,
            color: fill,
            // Material's 2023 bar, which the web took too, held without
            // its deprecated flag: no gap before the track, no stop dot,
            // and the fill's ends square inside the round track. Flutter
            // means to turn the 2024 bar on by default.
            borderRadius: BorderRadius.zero,
            stopIndicatorRadius: 0,
            trackGap: 0,
            // The empty part is the theme's control track.
            // Since 3.44 a progress bar's semantic value must be a number —
            // the engine hands it to the platform's native progress role —
            // so "3 of 10" cannot be the value. It rides in the label.
            semanticsLabel: [
              ?label,
              if (!indeterminate) text,
            ].join(node.isPersian ? '، ' : ', '),
            semanticsValue: indeterminate
                ? null
                : '${(fraction * 100).round()}',
          ),
        ),
      ],
    );
  },

  'Avatar': (context, node) => Align(
    alignment: AlignmentDirectional.centerStart,
    widthFactor: 1,
    child: _avatar(context, node.props),
  ),

  /// The web's group: a stack overlapping by a quarter of an avatar,
  /// each cut round the next (`clip`) or ringed in the page's colour
  /// (`ring`), without presence or rings; or a grid 12 apart with them. The
  /// count's pill comes 6 after a stack, or as the grid's last cell.
  'AvatarGroup': (context, node) {
    final avatars = node.items.where((i) => i.type == 'Avatar').toList();
    final max = node.number('max')?.toInt();
    final shown = max != null && max < avatars.length
        ? avatars.take(max).toList()
        : avatars;
    final rest = avatars.length - shown.length;
    final inherited = {
      for (final key in const ['size', 'color', 'variant'])
        if (node.props[key] != null) key: node.props[key],
    };
    Map<String, Object?> propsOf(DibaItem a) => {...inherited, ...a.props};
    final sizeWord = node.prop<String>('size');
    final size = _avatarMetrics(sizeWord).size;
    final count = rest > 0
        ? _avatarCount(context, sizeWord, rest, node.isPersian)
        : null;

    if (node.flag('isGrid')) {
      return Wrap(
        spacing: 12,
        runSpacing: 12,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [for (final a in shown) _avatar(context, propsOf(a)), ?count],
      );
    }

    final faces = [
      for (final a in shown) _avatar(context, propsOf(a), stacked: true),
    ];
    final ring = node.prop<String>('overlap') == 'ring';
    final step = size - size / 4;
    final rtl = Directionality.of(context) == TextDirection.rtl;
    final page = Theme.of(context).brightness == Brightness.dark
        ? DibaDarkNeutrals.background
        : DibaLightNeutrals.background;
    final stack = SizedBox(
      height: size,
      width: faces.isEmpty ? 0 : step * (faces.length - 1) + size,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          for (var i = 0; i < faces.length; i++)
            PositionedDirectional(
              start: i * step,
              top: 0,
              child: ring
                  // A seam in the page's colour, 2 round it, over the face
                  // before, as the web's box-shadow is.
                  ? Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Positioned(
                          left: -2,
                          top: -2,
                          right: -2,
                          bottom: -2,
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              color: page,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                        faces[i],
                      ],
                    )
                  : i == faces.length - 1
                  ? faces[i]
                  // Clip the crescent where the next face sits; "next" is to
                  // the left under right-to-left.
                  : ClipPath(
                      clipper: _Crescent(
                        next: Offset(
                          rtl ? size / 2 - step : size / 2 + step,
                          size / 2,
                        ),
                        radius: size / 2 + 2,
                      ),
                      child: faces[i],
                    ),
            ),
        ],
      ),
    );
    if (count == null) return stack;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [stack, const SizedBox(width: 6), count],
    );
  },
};
