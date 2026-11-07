import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../tokens.g.dart';
import '../field.dart';
import '../format.dart';
import '../glyphs.dart';
import '../node.dart';
import '../oklab.dart';
import '../ring.dart';
import '../strings.dart';
import 'actions.dart' show DibaButtonGroupScope;
import 'common.dart';

/// The extra components' inputs: a one-time code, a group of joined
/// buttons, pagination and colour swatches, in Diba's look: every
/// number is the web's.

bool _dark(BuildContext context) =>
    Theme.of(context).brightness == Brightness.dark;

/// `--default`, `--default-hover`, `--default-foreground`, `--muted`,
/// `--separator` and `--field-border`.
Color _fill(BuildContext c) =>
    _dark(c) ? DibaDarkNeutrals.fill : DibaLightNeutrals.fill;
Color _surface(BuildContext c) =>
    _dark(c) ? DibaDarkNeutrals.surface : DibaLightNeutrals.surface;
Color _fillHover(BuildContext c) =>
    _dark(c) ? DibaDarkNeutrals.fillHover : DibaLightNeutrals.fillHover;
Color _fillInk(BuildContext c) => _dark(c)
    ? DibaDarkNeutrals.fillForeground
    : DibaLightNeutrals.fillForeground;
// The theme's, which a grey card makes a step stronger.
Color _muted(BuildContext c) => Theme.of(c).colorScheme.onSurfaceVariant;
Color _line(BuildContext c) =>
    _dark(c) ? DibaDarkNeutrals.border : DibaLightNeutrals.border;
Color _fieldEdge(BuildContext c) =>
    _dark(c) ? DibaDarkNeutrals.fieldBorder : DibaLightNeutrals.fieldBorder;

/// The web's: a line [width] wide and outside, as its field's shadow is.
Border _outside(Color colour, [double width = 1]) => Border.all(
  color: colour,
  width: width,
  strokeAlign: BorderSide.strokeAlignOutside,
);

// ---------------------------------------------------------------------------
// InputOTP

/// A code, a slot a digit: one field the keyboard types into, drawn as the
/// web's slots, 38 by 40 and 12 round, 8 apart; six as two threes, a dash 6
/// by 2 between them. It reads left to right on a Persian page too, at the
/// page's start, in
/// the page's digits; Persian digits are let in and leave as Latin ones.
class _DibaOtp extends StatefulWidget {
  const _DibaOtp({required this.node});

  final DibaNodeContext node;

  @override
  State<_DibaOtp> createState() => _DibaOtpState();
}

class _DibaOtpState extends State<_DibaOtp>
    with SingleTickerProviderStateMixin {
  late final TextEditingController _text = TextEditingController(
    text: _digits(widget.node.current),
  );
  final FocusNode _focus = FocusNode();
  int? _hovered;

  /// The web's caret: 1.2s, gone from 20% to 50% of it, back by 70%.
  late final AnimationController _blink;
  late final Animation<double> _caret = TweenSequence([
    TweenSequenceItem(
      tween: Tween(
        begin: 1.0,
        end: 0.0,
      ).chain(CurveTween(curve: Curves.easeOut)),
      weight: 20,
    ),
    TweenSequenceItem(tween: ConstantTween(0.0), weight: 30),
    TweenSequenceItem(
      tween: Tween(
        begin: 0.0,
        end: 1.0,
      ).chain(CurveTween(curve: Curves.easeOut)),
      weight: 20,
    ),
    TweenSequenceItem(tween: ConstantTween(1.0), weight: 30),
  ]).animate(_blink);

  int get _length =>
      (widget.node.number('length') ?? 6).round().clamp(1, 12).toInt();

  String _digits(Object? value) {
    final latin = latinDigits('${value ?? ''}').replaceAll(RegExp(r'\D'), '');
    return latin.length > _length ? latin.substring(0, _length) : latin;
  }

  @override
  void initState() {
    super.initState();
    _blink = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _focus.addListener(() {
      _syncBlink();
      setState(() {});
    });
  }

  /// The caret blinks only while it shows: the code has the focus and a slot
  /// is still empty.
  void _syncBlink() {
    final caret = _focus.hasFocus && _text.text.length < _length;
    if (caret && !_blink.isAnimating) _blink.repeat();
    if (!caret && _blink.isAnimating) _blink.stop();
  }

  @override
  void didUpdateWidget(_DibaOtp old) {
    super.didUpdateWidget(old);
    final now = _digits(widget.node.current);
    if (now != _text.text) {
      _text.value = TextEditingValue(
        text: now,
        selection: TextSelection.collapsed(offset: now.length),
      );
      _syncBlink();
    }
  }

  @override
  void dispose() {
    _text.dispose();
    _focus.dispose();
    _blink.dispose();
    super.dispose();
  }

  void _typed(String typed) {
    final code = _digits(typed);
    if (code != typed) {
      _text.value = TextEditingValue(
        text: code,
        selection: TextSelection.collapsed(offset: code.length),
      );
    }
    widget.node.setValue('onChange', code);
    if (code.length == _length) widget.node.fire('onComplete', code);
    _syncBlink();
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final node = widget.node;
    final theme = Theme.of(context);
    final disabled = node.flag('isDisabled');
    final invalid = node.prop<String>('errorMessage') != null;
    final code = _text.text;
    final length = _length;
    final secondary = node.str('variant', 'primary') == 'secondary';
    final focus = theme.inputDecorationTheme.focusedBorder!.borderSide;
    final error = theme.colorScheme.error;
    final paper = theme.colorScheme.surface;
    final paperHover = dibaMixOklab(
      paper,
      0.9,
      theme.colorScheme.onSurface,
      0.02,
    );

    Widget slot(int i) {
      final filled = i < code.length;
      final active =
          _focus.hasFocus && i == code.length.clamp(0, length - 1).toInt();
      final hovered = _hovered == i && !disabled;
      // A secondary code's boxes are fields on a grey card, as a secondary
      // text field is: the field's edge kept, the second surface, and a
      // slate step further under a hover. The original had no edge and the
      // neutral fill, the edge's own slate-200 in light.
      final Border? edge = active
          ? _outside(invalid ? error : focus.color, focus.width)
          : invalid
          ? _outside(error)
          : _outside(_fieldEdge(context));
      final fill = secondary
          ? (hovered && !active && !filled
                ? (_dark(context) ? DibaPalette.slate700 : DibaPalette.slate200)
                : theme.colorScheme.surfaceContainer)
          : (hovered && !active && !filled ? paperHover : paper);
      return MouseRegion(
        onEnter: (_) => setState(() => _hovered = i),
        onExit: (_) => setState(() => _hovered = null),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          width: 38,
          height: 40,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: fill,
            borderRadius: BorderRadius.circular(12),
            border: edge,
          ),
          child: filled
              ? Text(
                  node.isPersian ? persianDigits(int.parse(code[i])) : code[i],
                  style: dibaType(
                    context,
                    18,
                    24,
                    colour: theme.colorScheme.onSurface,
                    weight: FontWeight.w600,
                  ).copyWith(letterSpacing: -0.27),
                )
              : active
              ? FadeTransition(
                  opacity: _caret,
                  child: Container(
                    width: 2,
                    height: 16,
                    decoration: BoxDecoration(
                      color: dibaFieldInk(context).placeholder,
                      borderRadius: BorderRadius.circular(1),
                    ),
                  ),
                )
              : null,
        ),
      );
    }

    final indexes = List.generate(length, (i) => i);
    final groups = length == 6
        ? [indexes.sublist(0, 3), indexes.sublist(3)]
        : [indexes];
    final slots = Directionality(
      textDirection: TextDirection.ltr,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        spacing: 8,
        children: [
          for (final (g, group) in groups.indexed) ...[
            if (g > 0)
              Container(
                width: 6,
                height: 2,
                decoration: BoxDecoration(
                  color: _line(context),
                  borderRadius: BorderRadius.circular(1),
                ),
              ),
            Row(
              mainAxisSize: MainAxisSize.min,
              spacing: 8,
              children: [for (final i in group) slot(i)],
            ),
          ],
        ],
      ),
    );
    return Opacity(
      opacity: disabled ? 0.5 : 1,
      child: Stack(
        children: [
          // The field the keyboard types into, under the slots and unseen.
          Positioned.fill(
            child: Opacity(
              opacity: 0,
              child: TextField(
                controller: _text,
                focusNode: _focus,
                enabled: !disabled,
                keyboardType: TextInputType.number,
                autofillHints: const [AutofillHints.oneTimeCode],
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp('[0-9۰-۹٠-٩]')),
                ],
                showCursor: false,
                onChanged: _typed,
                decoration: const InputDecoration(
                  border: InputBorder.none,
                  counterText: '',
                ),
              ),
            ),
          ),
          // The pointer reaches the slots for their hover, and the field
          // under them for its press.
          slots,
          Positioned.fill(
            child: GestureDetector(
              behavior: HitTestBehavior.translucent,
              onTap: disabled ? null : _focus.requestFocus,
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Pagination

/// Which pages to show, and where the gaps go: the web's `pageItems`, line
/// for line, so the two rows agree. A gap is null.
List<int?> dibaPageItems({
  required int page,
  required int total,
  int siblings = 1,
  int boundaries = 1,
}) {
  if (total <= 0) return const [];
  List<int> range(int start, int end) => [for (var i = start; i <= end; i++) i];
  final edge = boundaries < 1 ? 1 : boundaries;
  final near = siblings < 0 ? 0 : siblings;
  final current = page.clamp(1, total).toInt();
  if (total <= edge * 2 + near * 2 + 3) return range(1, total);
  final startPages = range(1, edge);
  final endPages = range(total - edge + 1, total);
  final windowStart = [
    [
      current - near,
      total - edge - near * 2 - 1,
    ].reduce((a, b) => a < b ? a : b),
    edge + 2,
  ].reduce((a, b) => a > b ? a : b);
  final windowEnd = [
    [current + near, edge + near * 2 + 2].reduce((a, b) => a > b ? a : b),
    endPages.first - 2,
  ].reduce((a, b) => a < b ? a : b);
  return [
    ...startPages,
    if (windowStart > edge + 2) null else if (edge + 1 < total - edge) edge + 1,
    ...range(windowStart, windowEnd),
    if (windowEnd < total - edge - 1)
      null
    else if (total - edge > edge)
      total - edge,
    ...endPages,
  ];
}

/// A page, or the way back or on: the web's pill, the neutral fill's text on
/// nothing, the hover's fill under the pointer and a press (which shrinks it
/// a little), the fill for the page shown; Diba's ring under keyboard focus.
class _PageCell extends StatefulWidget {
  const _PageCell({
    required this.height,
    required this.width,
    required this.padding,
    required this.current,
    required this.squeeze,
    required this.onPressed,
    required this.label,
    required this.child,
  });

  final double height;
  final double? width;
  final double padding;
  final bool current;
  final double squeeze;
  final VoidCallback? onPressed;
  final String label;
  final Widget child;

  @override
  State<_PageCell> createState() => _PageCellState();
}

class _PageCellState extends State<_PageCell> {
  bool _hovered = false;
  bool _pressed = false;
  bool _focused = false;

  @override
  Widget build(BuildContext context) {
    final w = widget;
    final enabled = w.onPressed != null;
    // On a grey card the page shown is the surface, as the web's: the fill
    // is the card's own grey there.
    final fill = (_hovered || _pressed) && enabled
        ? _fillHover(context)
        : w.current
        ? (DibaGreyPaper.of(context) ? _surface(context) : _fill(context))
        : null;
    const shape = StadiumBorder();
    return Semantics(
      button: true,
      selected: w.current,
      enabled: enabled,
      label: w.label,
      child: Opacity(
        opacity: enabled || w.current ? 1 : 0.5,
        child: FocusableActionDetector(
          enabled: enabled,
          mouseCursor: enabled ? SystemMouseCursors.click : MouseCursor.defer,
          onFocusChange: (on) => setState(() => _focused = on),
          actions: {
            ActivateIntent: CallbackAction<ActivateIntent>(
              onInvoke: (_) {
                w.onPressed?.call();
                return null;
              },
            ),
          },
          child: MouseRegion(
            onEnter: (_) => setState(() => _hovered = true),
            onExit: (_) => setState(() => _hovered = false),
            child: GestureDetector(
              onTapDown: enabled
                  ? (_) => setState(() => _pressed = true)
                  : null,
              onTapCancel: () => setState(() => _pressed = false),
              onTapUp: (_) => setState(() => _pressed = false),
              onTap: w.onPressed,
              child: AnimatedScale(
                scale: _pressed ? w.squeeze : 1,
                duration: const Duration(milliseconds: 250),
                curve: Curves.ease,
                child: CustomPaint(
                  foregroundPainter: _focused && dibaKeyboardFocus()
                      ? DibaRingPainter.of(context, shape)
                      : null,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 100),
                    height: w.height,
                    width: w.width,
                    padding: EdgeInsets.symmetric(horizontal: w.padding),
                    // A page centres its number; a way back or on is as
                    // wide as its words, where an alignment would fill the
                    // row it is in.
                    alignment: w.width == null ? null : Alignment.center,
                    decoration: ShapeDecoration(
                      shape: shape,
                      color: fill ?? const Color(0x00000000),
                    ),
                    child: w.child,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// The web's pagination: pages 36 round (32 small, 40 large; 32, 28 and 36
/// from 768 wide), 4 apart, their numbers 14 on 20 and medium (12 on 16
/// small, 16 on 24 large) in the neutral fill's text, the page shown on the
/// fill; a gap «…» muted; back and on padded 10 (8 small), a chevron 16 6
/// from the word, faded at the ends. A row too long for its room wraps, as
/// the web's now does.
Widget _pagination(BuildContext context, DibaNodeContext node) {
  final strings = DibaStrings.of(context);
  final total = (node.number('total') ?? 0).round();
  final raw = (node.current as num?)?.round() ?? 1;
  final page = total < 1 ? 1 : raw.clamp(1, total).toInt();
  final disabled = node.flag('isDisabled');
  final size = node.str('size', 'md');
  final wide = MediaQuery.sizeOf(context).width >= 768;
  final (cell, type, line, pad, squeeze) = switch (size) {
    'sm' => (wide ? 28.0 : 32.0, 12.0, 16.0, 8.0, 0.98),
    'lg' => (wide ? 36.0 : 40.0, 16.0, 24.0, 10.0, 0.96),
    _ => (wide ? 32.0 : 36.0, 14.0, 20.0, 10.0, 0.97),
  };
  final ink = _fillInk(context);
  final words = dibaType(
    context,
    type,
    line,
    colour: ink,
    weight: FontWeight.w500,
  );
  void go(int to) {
    if (disabled || to == page || to < 1 || to > total) return;
    node.setValue('onChange', to);
  }

  final items = dibaPageItems(
    page: page,
    total: total,
    siblings: (node.number('siblings') ?? 1).round(),
    boundaries: (node.number('boundaries') ?? 1).round(),
  );
  final rtl = Directionality.of(context) == TextDirection.rtl;
  Widget control({required bool back}) {
    final enabled = !disabled && (back ? page > 1 : page < total);
    // Each points the way it moves: back to the right in Persian.
    final chevron = Transform.flip(
      flipX: back == rtl,
      child: DibaGlyphMark(DibaGlyph.chevronLeft, size: 16, color: ink),
    );
    final label = back ? strings.message('previous') : strings.message('next');
    return _PageCell(
      height: cell,
      width: null,
      padding: pad,
      current: false,
      squeeze: squeeze,
      label: label,
      onPressed: enabled ? () => go(back ? page - 1 : page + 1) : null,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        spacing: 6,
        children: [
          if (back) chevron,
          Text(label, style: words),
          if (!back) chevron,
        ],
      ),
    );
  }

  return Semantics(
    container: true,
    label: node.prop<String>('label') ?? strings.message('pagination'),
    child: Align(
      alignment: AlignmentDirectional.centerStart,
      child: Wrap(
        spacing: 4,
        runSpacing: 4,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          if (node.flagOr('showControls', true)) control(back: true),
          for (final item in items)
            if (item == null)
              SizedBox(
                width: cell,
                height: cell,
                child: Center(
                  child: Text(
                    '…',
                    style: dibaType(
                      context,
                      type,
                      line,
                      colour: _muted(context),
                    ),
                  ),
                ),
              )
            else
              _PageCell(
                height: cell,
                width: cell,
                padding: 0,
                current: item == page,
                squeeze: squeeze,
                label: formatNumber(item, persian: node.isPersian),
                onPressed: disabled ? null : () => go(item),
                child: Text(
                  formatNumber(item, persian: node.isPersian),
                  style: words,
                ),
              ),
          if (node.flagOr('showControls', true)) control(back: false),
        ],
      ),
    ),
  );
}

// ---------------------------------------------------------------------------
// ColorSwatchPicker

Color? _hex(String value) {
  final m = RegExp(r'^#([0-9a-fA-F]{6})$').firstMatch(value);
  return m == null ? null : Color(0xFF000000 | int.parse(m[1]!, radix: 16));
}

/// The web's swatches: an item 16, 24, 32, 36 or 40 across, ringed 1, 2 or 3
/// in nothing, the swatch filling it; chosen, the ring in its own colour with
/// the field's edge outside, the swatch shrunk to 77% and a tick a third of
/// it, white or black on a light one; under the pointer the swatch grows to
/// 110%. Round, or square at the web's radii. 8 apart, in a row that wraps or
/// a column (stack).
class _Swatch extends StatefulWidget {
  const _Swatch({
    required this.hex,
    required this.size,
    required this.ring,
    required this.square,
    required this.chosen,
    required this.onTap,
  });

  final String hex;
  final String size;
  final double ring;
  final bool square;
  final bool chosen;
  final VoidCallback onTap;

  @override
  State<_Swatch> createState() => _SwatchState();
}

class _SwatchState extends State<_Swatch> {
  bool _hovered = false;
  bool _focused = false;

  @override
  Widget build(BuildContext context) {
    final w = widget;
    final colour = _hex(w.hex)!;
    final across = switch (w.size) {
      'xs' => 16.0,
      'sm' => 24.0,
      'lg' => 36.0,
      'xl' => 40.0,
      _ => 32.0,
    };
    // A square's item, its swatch and its chosen swatch, from the web's
    // radius scale; a round one is round throughout.
    final (item, swatch, small) = switch (w.size) {
      'xs' => (6.0, 6.0, 6.0),
      'sm' => (8.0, 8.0, 6.0),
      _ => (12.0, 8.0, 8.0),
    };
    final ShapeBorder outer = w.square
        ? RoundedRectangleBorder(borderRadius: BorderRadius.circular(item))
        : const CircleBorder();
    final ShapeBorder inner = w.square
        ? RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(w.chosen ? small : swatch),
          )
        : const CircleBorder();
    // A black tick on a colour it is clearer on, a white one on the rest, as
    // the web's: above 0.179, (L + 0.05) / 0.05 passes 1.05 / (L + 0.05), so
    // either is at least 4.5 from the colour.
    final light = colour.computeLuminance() > 0.179;
    ShapeBorder edged(Color line, double width, bool outside) {
      final side = BorderSide(
        color: line,
        width: width,
        strokeAlign: outside
            ? BorderSide.strokeAlignOutside
            : BorderSide.strokeAlignInside,
      );
      return outer is RoundedRectangleBorder
          ? outer.copyWith(side: side)
          : CircleBorder(side: side);
    }

    return Semantics(
      button: true,
      selected: w.chosen,
      label: w.hex,
      child: FocusableActionDetector(
        mouseCursor: SystemMouseCursors.click,
        onFocusChange: (on) => setState(() => _focused = on),
        actions: {
          ActivateIntent: CallbackAction<ActivateIntent>(
            onInvoke: (_) {
              w.onTap();
              return null;
            },
          ),
        },
        child: MouseRegion(
          onEnter: (_) => setState(() => _hovered = true),
          onExit: (_) => setState(() => _hovered = false),
          child: GestureDetector(
            onTap: w.onTap,
            child: CustomPaint(
              foregroundPainter: _focused && dibaKeyboardFocus()
                  ? DibaRingPainter.of(context, outer)
                  : null,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 100),
                width: across,
                height: across,
                // The field's edge, 1 outside the item, as the web's shadow
                // is drawn; a shadow here would fill the item's middle too.
                foregroundDecoration: w.chosen
                    ? ShapeDecoration(
                        shape: edged(_fieldEdge(context), 1, true),
                      )
                    : null,
                // The ring's width pads the swatch, as a decoration's border
                // does.
                decoration: ShapeDecoration(
                  shape: edged(
                    w.chosen ? colour : const Color(0x00000000),
                    w.ring,
                    false,
                  ),
                ),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    AnimatedScale(
                      scale: w.chosen ? 0.77 : (_hovered ? 1.1 : 1),
                      duration: const Duration(milliseconds: 100),
                      curve: const Cubic(0, 0, 0.2, 1),
                      child: DecoratedBox(
                        decoration: ShapeDecoration(
                          color: colour,
                          shape: inner,
                        ),
                      ),
                    ),
                    Center(
                      child: AnimatedScale(
                        scale: w.chosen ? 1 : 0,
                        duration: const Duration(milliseconds: 150),
                        curve: const Cubic(0, 0, 0.2, 1),
                        child: DibaGlyphMark(
                          DibaGlyph.check,
                          size: (across - 2 * w.ring) / 3,
                          color: light ? Colors.black : Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

Widget _swatches(BuildContext context, DibaNodeContext node) {
  final colours = [
    for (final c in (node.props['colors'] as List?) ?? const [])
      if (c is String && _hex(c) != null) c.toLowerCase(),
  ];
  final current = (node.current as String?)?.toLowerCase();
  final size = node.str('size', 'md');
  final square = node.str('variant', 'circle') == 'square';
  final stack = node.str('layout', 'grid') == 'stack';
  final ring = switch (size) {
    'xs' => 1.0,
    'lg' || 'xl' => 3.0,
    _ => 2.0,
  };
  final swatches = [
    for (final c in colours)
      _Swatch(
        hex: c,
        size: size,
        ring: ring,
        square: square,
        chosen: c == current,
        onTap: () => node.setValue('onChange', c),
      ),
  ];
  return Semantics(
    container: true,
    label: node.prop<String>('label'),
    child: stack
        ? Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: 8,
            children: swatches,
          )
        : Wrap(spacing: 8, runSpacing: 8, children: swatches),
  );
}

// ---------------------------------------------------------------------------

final Map<String, DibaBuilder> inputBlocks = {
  'InputOTP': (context, node) {
    final error = node.prop<String>('errorMessage');
    final description = node.prop<String>('description');
    return dibaFieldFrame(
      node,
      Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 4,
        children: [
          Semantics(
            label: node.prop<String>('label'),
            textField: true,
            child: _DibaOtp(node: node),
          ),
          if (description != null)
            Text(
              description,
              style: dibaType(context, 12, 16, colour: _muted(context)),
            ),
          if (error != null) dibaFieldError(context, error),
        ],
      ),
    );
  },

  /// Buttons joined into one, the web's: no gap, each square inside and round
  /// at the group's ends; an outline round the group and not between; what a
  /// button leaves unset is the group's.
  'ButtonGroup': (context, node) {
    final vertical = node.str('orientation', 'horizontal') == 'vertical';
    final full = node.flag('fullWidth');
    final count = node.children.length;
    final children = [
      for (final (i, child) in node.children.indexed)
        () {
          final placed = DibaButtonGroupScope(
            size: node.str('size', 'sm'),
            variant: node.str('variant', 'secondary'),
            disabled: node.flag('isDisabled'),
            first: i == 0,
            last: i == count - 1,
            vertical: vertical,
            child: child,
          );
          return full && !vertical ? Expanded(child: placed) : placed;
        }(),
    ];
    return Align(
      alignment: AlignmentDirectional.centerStart,
      widthFactor: full ? null : 1,
      child: vertical
          ? IntrinsicWidth(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: children,
              ),
            )
          : Row(mainAxisSize: MainAxisSize.min, children: children),
    );
  },

  'Pagination': _pagination,
  'ColorSwatchPicker': _swatches,
};
