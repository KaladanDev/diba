import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../tokens.g.dart';
import '../field.dart';
import '../format.dart';
import '../node.dart';
import '../strings.dart';

/// Group 4: Checkbox, CheckboxGroup, RadioGroup, Radio, Switch, Slider.

/// `variant: secondary` is for a control on a grey surface: an empty box
/// gets a fill of its own so it does not vanish into the card. The selected
/// state is left to the theme's selected-state roles: a gilt fill with
/// slate-700 on it.
WidgetStateProperty<Color?>? _fill(BuildContext context, String? variant) {
  if (variant != 'secondary') return null;
  final scheme = Theme.of(context).colorScheme;
  return WidgetStateProperty.resolveWith(
    (states) => states.contains(WidgetState.selected) ? null : scheme.surface,
  );
}

/// The same for a radio. Its fill is the ring and the dot, so the empty
/// surface goes behind it instead; a white fill would have hidden the ring.
WidgetStateProperty<Color?>? _radioBackground(
  BuildContext context,
  String? variant,
) {
  if (variant != 'secondary') return null;
  final scheme = Theme.of(context).colorScheme;
  return WidgetStateProperty.resolveWith(
    (states) => states.contains(WidgetState.selected) ? null : scheme.surface,
  );
}

double _switchScale(String size) => switch (size) {
  'sm' => DibaDimens.switchTrackHSm / DibaDimens.switchTrackHMd,
  'lg' => DibaDimens.switchTrackHLg / DibaDimens.switchTrackHMd,
  _ => 1,
};

final Map<String, DibaBuilder> choiceBlocks = {
  'Checkbox': (context, node) {
    final strings = DibaStrings.of(context);
    final selected = node.current == true;
    final indeterminate = node.flag('isIndeterminate');
    final disabled = node.flag('isDisabled');
    final label = node.prop<String>('label') ?? node.text;
    // React Aria's indeterminate is a look, not a third value: a press selects
    // or clears, and the look stays until the tree says otherwise.
    void press(bool? _) => node.setValue('onChange', !selected);

    return DibaValidated(
      validator: () =>
          node.flag('isRequired') && !selected ? strings.required : null,
      builder: (error) {
        final err = error ?? node.prop<String>('errorMessage');
        if (node.flag('isLabelHidden') || label == null) {
          return Align(
            alignment: AlignmentDirectional.centerStart,
            widthFactor: 1,
            child: _faded(
              disabled,
              _boxed(
                18,
                Checkbox(
                  value: indeterminate ? null : selected,
                  side: _boxSide(
                    context,
                    empty: !selected && !indeterminate && err == null,
                    disabled: disabled,
                  ),
                  tristate: indeterminate,
                  isError: err != null,
                  fillColor: _fill(context, node.prop<String>('variant')),
                  semanticLabel: label,
                  onChanged: disabled ? null : press,
                ),
              ),
            ),
          );
        }
        final fill = _fill(context, node.prop<String>('variant'));
        // Its own width, so a wrapping row of options keeps them side by side
        // as the web's does; each had taken the whole row. In a column that
        // stretches it, it still sits at the start.
        return Align(
          alignment: AlignmentDirectional.centerStart,
          widthFactor: 1,
          child: _ChoiceOption(
            box: 18,
            control: ({required engaged}) => Checkbox(
              value: indeterminate ? null : selected,
              side: _boxSide(
                context,
                empty: !selected && !indeterminate && err == null,
                engaged: engaged,
                disabled: disabled,
              ),
              mouseCursor: _choiceCursor,
              tristate: indeterminate,
              isError: err != null,
              fillColor: fill,
              onChanged: disabled ? null : press,
            ),
            label: _optionLabel(
              context,
              label,
              isRequired: node.flag('isRequired'),
            ),
            below: _optionNote(
              context,
              err ?? node.prop<String>('description'),
              isError: err != null,
              line: _noteLine,
            ),
            enabled: !disabled,
            onTap: () => press(null),
            layer: _checkboxLayer(
              context,
              // An indeterminate box is drawn and pressed as a checked one.
              selected: selected || indeterminate,
              isError: err != null,
              fill: fill,
            ),
          ),
        );
      },
    );
  },

  /// Material has no checkbox group; a column or a wrap of tiles is it.
  'CheckboxGroup': (context, node) {
    final strings = DibaStrings.of(context);
    final selected = dibaKeys(node.current).toSet();
    final disabled = node.flag('isDisabled');
    final horizontal = node.prop<String>('orientation') == 'horizontal';
    final boxes = node.items.where((i) => i.type == 'Checkbox').toList();

    void toggle(String value, bool on) {
      final next = {...selected};
      on ? next.add(value) : next.remove(value);
      // In the order the boxes are drawn, not the order they were ticked.
      node.setValue('onChange', [
        for (final b in boxes)
          if (next.contains(b.prop<String>('value'))) b.prop<String>('value')!,
      ]);
    }

    return DibaValidated(
      validator: () => node.flag('isRequired') && selected.isEmpty
          ? strings.chooseOne
          : null,
      builder: (error) {
        final invalid = (error ?? node.prop<String>('errorMessage')) != null;
        final fill = _fill(context, node.prop<String>('variant'));
        // A disabled group fades as a whole, its label too, as the web's does;
        // its options fade again, as each disabled one does there.
        return _faded(
          disabled,
          DibaFieldShell(
            node: node,
            errorText: error,
            labelGap: _groupLabelGap,
            helperGap: 0,
            child: Wrap(
              direction: horizontal ? Axis.horizontal : Axis.vertical,
              spacing: horizontal ? _rowGapAcross : _rowGapDown,
              runSpacing: _rowRunGap,
              children: [
                for (final box in boxes)
                  if (box.prop<String>('value') case final String value)
                    _ChoiceOption(
                      box: 18,
                      control: ({required engaged}) => Checkbox(
                        value: selected.contains(value),
                        side: _boxSide(
                          context,
                          empty: !selected.contains(value) && !invalid,
                          engaged: engaged,
                          disabled: disabled || box.flag('isDisabled'),
                        ),
                        mouseCursor: _choiceCursor,
                        fillColor: fill,
                        isError: invalid,
                        onChanged: disabled || box.flag('isDisabled')
                            ? null
                            : (on) => toggle(value, on ?? false),
                      ),
                      label: _optionLabel(
                        context,
                        box.prop<String>('label') ?? box.text ?? '',
                      ),
                      below: _optionNote(
                        context,
                        box.prop<String>('description'),
                        line: _noteLine,
                      ),
                      enabled: !(disabled || box.flag('isDisabled')),
                      onTap: () => toggle(value, !selected.contains(value)),
                      layer: _checkboxLayer(
                        context,
                        selected: selected.contains(value),
                        isError: invalid,
                        fill: fill,
                      ),
                    ),
              ],
            ),
          ),
        );
      },
    );
  },

  /// Material's RadioGroup is the selection; each option a radio and its
  /// words. Not RadioListTile: a list tile takes the full width, which a
  /// horizontal group cannot give each of its options.
  'RadioGroup': (context, node) {
    final strings = DibaStrings.of(context);
    final current = node.current is String ? node.current as String : null;
    final disabled = node.flag('isDisabled');
    final horizontal = node.prop<String>('orientation') == 'horizontal';
    final radios = node.items.where((i) => i.type == 'Radio').toList();

    return DibaValidated(
      validator: () =>
          node.flag('isRequired') && current == null ? strings.required : null,
      // A disabled group fades as a whole, as the CheckboxGroup's does.
      builder: (error) => _faded(
        disabled,
        DibaFieldShell(
          node: node,
          errorText: error,
          labelGap: _groupLabelGap,
          helperGap: 0,
          child: RadioGroup<String>(
            groupValue: current,
            onChanged: (v) {
              if (v != null && !disabled) node.setValue('onChange', v);
            },
            child: Wrap(
              direction: horizontal ? Axis.horizontal : Axis.vertical,
              spacing: horizontal ? _rowGapAcross : _rowGapDown,
              runSpacing: _rowRunGap,
              children: [
                for (final radio in radios)
                  if (radio.prop<String>('value') case final String value)
                    _ChoiceOption(
                      box: 16,
                      control: ({required engaged}) => Radio<String>(
                        value: value,
                        mouseCursor: _choiceCursor,
                        enabled: !(disabled || radio.flag('isDisabled')),
                        backgroundColor: _radioBackground(
                          context,
                          node.prop<String>('variant'),
                        ),
                      ),
                      label: _optionLabel(
                        context,
                        radio.prop<String>('label') ?? radio.text ?? '',
                      ),
                      below: _optionNote(
                        context,
                        radio.prop<String>('description'),
                        line: _noteLine,
                      ),
                      enabled: !(disabled || radio.flag('isDisabled')),
                      onTap: () => node.setValue('onChange', value),
                      layer: _radioLayer(context, selected: current == value),
                    ),
              ],
            ),
          ),
        ),
      ),
    );
  },

  /// Drawn by its group, which needs every option's value at once.
  'Radio': (context, node) => const SizedBox.shrink(),

  /// No size parameter on Material's Switch, so sm and lg are a scale of md.
  'Switch': (context, node) {
    final selected = node.current == true;
    final disabled = node.flag('isDisabled');
    final label = node.prop<String>('label') ?? node.text;
    // A FittedBox rather than Transform.scale, so the row makes room for the
    // larger switch instead of drawing it over the label.
    final scale = _switchScale(node.str('size', 'md'));
    final control = SizedBox(
      width: 52 * scale,
      height: 32 * scale,
      child: FittedBox(
        child: Switch(
          value: selected,
          mouseCursor: _choiceCursor,
          onChanged: disabled ? null : (v) => node.setValue('onChange', v),
        ),
      ),
    );
    if (node.flag('isLabelHidden') || label == null) {
      return Align(
        alignment: AlignmentDirectional.centerStart,
        widthFactor: 1,
        child: _faded(disabled, Semantics(label: label, child: control)),
      );
    }
    final error = node.prop<String>('errorMessage');
    return Align(
      alignment: AlignmentDirectional.centerStart,
      widthFactor: 1,
      child: _ChoiceOption(
        control: ({required engaged}) => control,
        label: _optionLabel(context, label),
        below: _optionNote(
          context,
          error ?? node.prop<String>('description'),
          isError: error != null,
        ),
        enabled: !disabled,
        onTap: () => node.setValue('onChange', !selected),
        layer: _switchLayer(context, selected: selected),
        // On the thumb's centre, 18 or 34 of the box's 52, as the FittedBox
        // places the 52-by-40 switch at 0.8 of the box's height over 32. A
        // 32 circle in that box is there at 0.8 either side of the middle.
        layerAt: AlignmentDirectional(selected ? 0.8 : -0.8, 0),
        layerRadius: 16 * scale,
        layerInFront: true,
        // The thumb at rest, 24 on or 16 off at the FittedBox's 0.8.
        layerHole: (selected ? 12 : 8) * 0.8 * scale,
      ),
    );
  },

  'Slider': (context, node) {
    final min = node.number('minValue')?.toDouble() ?? 0;
    final max = node.number('maxValue')?.toDouble() ?? 100;
    final step = node.number('step')?.toDouble();
    final divisions = step != null && step > 0
        ? ((max - min) / step).round()
        : null;
    final disabled = node.flag('isDisabled');
    final style = node.str('formatStyle', 'decimal');
    String show(double v) => formatNumber(
      style == 'percent' ? (v - min) / (max - min) : v,
      persian: node.isPersian,
      style: style,
      currency: node.prop<String>('currency'),
    );
    final current = node.current;
    final showValue = node.flagOr('showValue', true);
    final List<double> values =
        node.flag('isRange') && current is List && current.length == 2
        ? [
            (current[0] as num).toDouble().clamp(min, max),
            (current[1] as num).toDouble().clamp(min, max),
          ]
        : node.flag('isRange')
        ? [min, max]
        : [(current is num ? current.toDouble() : min).clamp(min, max)];

    // The value on the label's line, 20 high, as the web's; the bubble over
    // the thumb is gone (the theme's showValueIndicator), so it is the only
    // place the value shows. A disabled slider fades as a whole, label and
    // value too, keeping its colours, as the web's does.
    return _faded(
      disabled,
      DibaFieldShell(
        node: node,
        trailing: showValue
            ? Text(
                values.map(show).join(' – '),
                style: const TextStyle(height: _labelLine),
              )
            : null,
        child: _SliderPress(
          values: values,
          min: min,
          max: max,
          divisions: divisions,
          builder: (take) => values.length == 2
              ? RangeSlider(
                  values: RangeValues(values[0], values[1]),
                  min: min,
                  max: max,
                  divisions: divisions,
                  semanticFormatterCallback: show,
                  mouseCursor: _sliderCursor,
                  onChanged: disabled
                      ? null
                      : (v) =>
                            node.setValue('onChange', take([v.start, v.end])),
                  onChangeEnd: (v) =>
                      node.fire('onChangeEnd', take([v.start, v.end])),
                )
              : Slider(
                  value: values.single,
                  min: min,
                  max: max,
                  divisions: divisions,
                  semanticFormatterCallback: show,
                  mouseCursor: _sliderCursor,
                  onChanged: disabled
                      ? null
                      : (v) => node.setValue('onChange', take([v]).single),
                  onChangeEnd: (v) =>
                      node.fire('onChangeEnd', take([v]).single),
                ),
        ),
      ),
    );
  },
};

/// A press on a slider, taken as the web takes it. Within 24 of a thumb's
/// centre, on the circle a hover shows there, a press takes the thumb where
/// it is, and a drag moves it as far as the pointer moves. Anywhere else on
/// the track Flutter's own press stands: the nearest thumb comes to the
/// pointer and follows it. Flutter's press brought the thumb's centre under
/// the pointer on the circle too, so pressing beside a thumb to drag it
/// changed its value at once.
///
/// It watches the pointer from over the slider, ahead of it, and while a
/// thumb is held remakes the values the slider reports from where the pointer
/// is, unclamped, so a thumb held off its centre still reaches either end.
class _SliderPress extends StatefulWidget {
  const _SliderPress({
    required this.values,
    required this.min,
    required this.max,
    required this.divisions,
    required this.builder,
  });

  /// The thumbs' values, one or two, in order.
  final List<double> values;
  final double min;
  final double max;
  final int? divisions;

  /// The slider, given what to pass the values it reports through.
  final Widget Function(List<double> Function(List<double> reported) take)
  builder;

  @override
  State<_SliderPress> createState() => _SliderPressState();
}

class _SliderPressState extends State<_SliderPress> {
  int? _pointer;

  /// Where the pointer is, in the slider's box.
  double _x = 0;

  /// The values when the press began, and where along the thumbs' run.
  List<double>? _pressed;
  double _pressedAt = 0;

  /// The thumb held, once the slider has said which it moves; -1 when the
  /// press was off every thumb's circle and Flutter's stands.
  int? _held;

  SliderThemeData get _theme => SliderTheme.of(context);

  /// A thumb's width, and the reach of the circle round it: the theme's, or
  /// the slider's own defaults where it leaves them.
  double get _thumb =>
      (widget.values.length == 2
              ? (_theme.rangeThumbShape ?? const RoundRangeSliderThumbShape())
                    .getPreferredSize(true, false)
              : (_theme.thumbShape ?? const RoundSliderThumbShape())
                    .getPreferredSize(true, false))
          .width;
  double get _reach =>
      (_theme.overlayShape ?? const RoundSliderOverlayShape())
          .getPreferredSize(true, false)
          .width /
      2;

  /// How far a thumb's centre runs: the slider's width less a thumb.
  double get _run => (context.size?.width ?? 0) - _thumb;

  /// Where [x] is along the run, 0 at its start and 1 at its end, unclamped.
  double _along(double x) {
    if (_run <= 0) return 0;
    final f = (x - _thumb / 2) / _run;
    return Directionality.of(context) == TextDirection.rtl ? 1 - f : f;
  }

  double _fraction(double v) => widget.max == widget.min
      ? 0
      : (v - widget.min) / (widget.max - widget.min);

  List<double> _take(List<double> reported) {
    final pressed = _pressed;
    if (pressed == null || pressed.length != reported.length) return reported;
    if (_held == null) {
      final moved = [
        for (var i = 0; i < reported.length; i++)
          if (reported[i] != pressed[i]) i,
      ];
      // Pressed on a thumb's very centre: nothing moved yet to say which.
      if (moved.isEmpty) return reported;
      final i = moved.first;
      final off = (_pressedAt - _fraction(pressed[i])).abs() * _run;
      _held = off <= _reach ? i : -1;
    }
    final i = _held!;
    if (i < 0) return reported;
    var f = (_along(_x) - _pressedAt + _fraction(pressed[i])).clamp(0.0, 1.0);
    if (widget.divisions case final d? when d > 0) f = (f * d).round() / d;
    var v = widget.min + f * (widget.max - widget.min);
    final next = [...widget.values];
    // A range's thumb stays on its side of the other.
    if (next.length == 2) {
      v = i == 0 ? math.min(v, next[1]) : math.max(v, next[0]);
    }
    next[i] = v;
    return next;
  }

  void _down(PointerDownEvent e) {
    if (_pointer != null) return;
    _pointer = e.pointer;
    _x = e.localPosition.dx;
    _pressed = [...widget.values];
    _pressedAt = _along(_x);
    _held = null;
  }

  void _move(PointerMoveEvent e) {
    if (e.pointer == _pointer) _x = e.localPosition.dx;
  }

  /// The slider hears the pointer leave after this does, and reports its last
  /// value then; the press is forgotten once it has.
  void _up(PointerEvent e) {
    if (e.pointer != _pointer) return;
    _x = e.localPosition.dx;
    scheduleMicrotask(() {
      _pointer = null;
      _pressed = null;
      _held = null;
    });
  }

  @override
  Widget build(BuildContext context) => Stack(
    children: [
      widget.builder(_take),
      // Over the slider, so it hears each event first; translucent, so the
      // slider hears it too.
      Positioned.fill(
        child: Listener(
          behavior: HitTestBehavior.translucent,
          onPointerDown: _down,
          onPointerMove: _move,
          onPointerUp: _up,
          onPointerCancel: _up,
        ),
      ),
    ],
  );
}

/// An option's label: regular weight, with the required mark when it
/// has one. A disabled option's label keeps the text colour: the option fades.
Widget _optionLabel(
  BuildContext context,
  String label, {
  bool isRequired = false,
}) => dibaLabel(context, label, isRequired: isRequired)!;

/// A control laid out at its box's size, the rest of it (its tap area, its
/// state layer) painted past it. Only the box takes the pointer: Flutter hit
/// tests within a widget's bounds.
Widget _boxed(double box, Widget control) => SizedBox.square(
  dimension: box,
  child: OverflowBox(
    maxWidth: double.infinity,
    maxHeight: double.infinity,
    child: control,
  ),
);

/// The web's rhythm for a group's options: 24 between
/// rows, 16 across, 16 under the group's label; wrapped rows 32 apart, the
/// web's 16 between them and each option's 16 above it.
const double _rowGapDown = 24;
const double _rowGapAcross = 16;
const double _rowRunGap = 32;
const double _groupLabelGap = 16;

/// The web's lines for a checkbox's or radio's words, text-sm's 20 and
/// text-xs's 16. Flutter's body styles are 1.5 high, 21 and 18, room for
/// Yekan Bakh's descenders in a paragraph; an option's single line keeps the
/// web's row instead. A switch keeps Flutter's.
const double _labelLine = 20 / 14;
const double _noteLine = 16 / 12;

/// A disabled choice fades as a whole to half, as the web's do (the web's
/// status-disabled), its control keeping its colours under the fade. Diba's
/// theme gives a disabled checkbox, radio or switch its usual colours, so
/// they had looked enabled here, apart from a grey label.
Widget _faded(bool disabled, Widget child) =>
    disabled ? Opacity(opacity: 0.5, child: child) : child;

/// The line under an option's label: its description, or its error in red;
/// [line] high when given, as a checkbox's or radio's is.
Widget? _optionNote(
  BuildContext context,
  String? text, {
  bool isError = false,
  double? line,
}) {
  if (text == null) return null;
  final theme = Theme.of(context);
  return Text(
    text,
    style: theme.textTheme.bodySmall?.copyWith(
      height: line,
      color: isError
          ? theme.colorScheme.error
          : theme.colorScheme.onSurfaceVariant,
    ),
  );
}

/// What a checkbox's or radio's state layer looks like, by state: the circle
/// behind the control, 40 across.
typedef _ChoiceLayer = Color Function({required bool pressed});

/// One checkbox or radio option: the control, its label and its description,
/// as one target, wrapped to their width.
///
/// Anywhere on it the pointer is the hand, a press chooses, and the control's
/// state layer shows. Over the control Flutter draws that layer itself; over
/// the words the option draws the same circle, in the colours [layer] gives,
/// which follow Flutter's own rules. Off it — the rest of the row, the space
/// between options — nothing answers. A disabled option answers nowhere: the
/// plain pointer, no layer, no press.
///
/// Before, a labelled checkbox was a list tile, the full width and a grey
/// rectangle under the pointer, and a radio a rounded rectangle around its
/// row, so the two answered differently and neither like the web.
class _ChoiceOption extends StatefulWidget {
  const _ChoiceOption({
    required this.control,
    required this.label,
    required this.enabled,
    required this.onTap,
    required this.layer,
    this.below,
    this.box,
    this.layerAt = Alignment.center,
    this.layerRadius,
    this.layerInFront = false,
    this.layerHole = 0,
  });

  /// A checkbox's or radio's box, 18 or 16: the control is laid out at that
  /// size, flush with the option's start and 12 from its words, and paints its
  /// state layer past it, as the web's options are: Diba's spacing on both
  /// platforms. Without one (a switch) the control keeps its own size.
  final double? box;

  /// The control, told whether the option is under the pointer anywhere, so
  /// an empty box can darken its edge for the words as for itself.
  final Widget Function({required bool engaged}) control;
  final Widget label;
  final Widget? below;
  final bool enabled;
  final VoidCallback onTap;
  final _ChoiceLayer layer;

  /// Where on the control its state layer is: the centre, or a switch's
  /// thumb. It does not travel with a switch's thumb: moving it, by any of
  /// four means, cost the web 40 to 70ms on the first frame it moved (the GPU,
  /// behind createImageBitmap), where Flutter's own layer, painted inside the
  /// switch, costs nothing. So it steps aside while the thumb travels. Only a
  /// pointer over the words sees it; a phone has no hover.
  final AlignmentGeometry layerAt;

  /// The layer's radius; a checkbox's or radio's splash radius by default.
  final double? layerRadius;

  /// Whether the layer is drawn over the control rather than under it. Under,
  /// as Flutter draws a checkbox's or a radio's; over, for a switch, whose own
  /// layer lies on its track, which would hide one drawn under it.
  final bool layerInFront;

  /// A hole of this radius at the layer's centre: a switch's thumb at rest,
  /// which Flutter's own layer lies under and which would otherwise take an
  /// 8% wash, plain to see on the dark thumb.
  final double layerHole;

  @override
  State<_ChoiceOption> createState() => _ChoiceOptionState();
}

class _ChoiceOptionState extends State<_ChoiceOption> {
  bool _hovered = false;
  bool _pressed = false;

  /// Over the control itself, where Flutter's own layer answers.
  bool _onControl = false;

  /// Running while a switch turns: its layer steps aside for the 300ms its
  /// thumb travels, and comes back at the thumb's new end. Left where it was,
  /// the moving thumb passed through it, half washed; moved with the thumb, it
  /// cost the web a long first frame (see [_ChoiceOption.layerAt]).
  Timer? _turning;

  @override
  void didUpdateWidget(_ChoiceOption old) {
    super.didUpdateWidget(old);
    if (old.layerAt != widget.layerAt) {
      _turning?.cancel();
      _turning = Timer(const Duration(milliseconds: 300), () {
        if (mounted) setState(() => _turning = null);
      });
    }
  }

  @override
  void dispose() {
    _turning?.cancel();
    super.dispose();
  }

  void _set({bool? hovered, bool? pressed, bool? onControl}) {
    final h = hovered ?? _hovered;
    final p = pressed ?? _pressed;
    final c = onControl ?? _onControl;
    if (h == _hovered && p == _pressed && c == _onControl) return;
    setState(() {
      _hovered = h;
      _pressed = p;
      _onControl = c;
    });
  }

  /// The control, its words and the line under them, laid out as the web's
  /// option when it has a [_ChoiceOption.box]: the box flush, the words 12
  /// on, the line 4 under them indented 28; otherwise the control at its own
  /// size, the words beside it and the line under the words.
  Widget _optionBody({required Widget control, required Widget? below}) {
    final box = widget.box;
    if (box == null) {
      return Padding(
        padding: EdgeInsetsDirectional.only(end: DibaSpace.space2),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            control,
            Flexible(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [widget.label, ?below],
              ),
            ),
          ],
        ),
      );
    }
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _boxed(box, control),
            const SizedBox(width: 12),
            Flexible(
              child: DefaultTextStyle.merge(
                style: const TextStyle(height: _labelLine),
                child: widget.label,
              ),
            ),
          ],
        ),
        if (below != null)
          Padding(
            padding: const EdgeInsetsDirectional.only(top: 4, start: 28),
            child: below,
          ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final enabled = widget.enabled;
    final radius =
        widget.layerRadius ??
        CheckboxTheme.of(context).splashRadius ??
        kRadialReactionRadius;
    final showLayer =
        enabled && (_hovered || _pressed) && !_onControl && _turning == null;
    final layerWidget = Positioned.fill(
      child: IgnorePointer(
        child: Align(
          alignment: widget.layerAt,
          child: CustomPaint(
            key: const ValueKey('diba-choice-layer'),
            size: Size.square(radius * 2),
            painter: _LayerPainter(
              color: widget.layer(pressed: _pressed),
              hole: widget.layerHole,
            ),
          ),
        ),
      ),
    );

    return _faded(
      !enabled,
      MergeSemantics(
        child: MouseRegion(
          cursor: _choiceCursor.resolve({if (!enabled) WidgetState.disabled}),
          onEnter: (_) => _set(hovered: true),
          onExit: (_) => _set(hovered: false, pressed: false),
          child: Listener(
            onPointerDown: (_) => _set(pressed: true),
            onPointerUp: (_) => _set(pressed: false),
            onPointerCancel: (_) => _set(pressed: false),
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              excludeFromSemantics: true,
              onTap: enabled ? widget.onTap : null,
              child: _optionBody(
                control: Stack(
                  alignment: Alignment.center,
                  clipBehavior: Clip.none,
                  children: [
                    if (showLayer && !widget.layerInFront) layerWidget,
                    MouseRegion(
                      opaque: false,
                      onEnter: (_) => _set(onControl: true),
                      onExit: (_) => _set(onControl: false),
                      child: widget.control(
                        engaged: enabled && (_hovered || _pressed),
                      ),
                    ),
                    if (showLayer && widget.layerInFront) layerWidget,
                  ],
                ),
                below: switch (widget.below) {
                  final below? => _faded(!enabled, below),
                  null => null,
                },
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// An option's state layer: a circle filling its box, with a hole of [hole]
/// at its centre when it has one.
class _LayerPainter extends CustomPainter {
  _LayerPainter({required this.color, required this.hole});

  final Color color;
  final double hole;

  @override
  void paint(Canvas canvas, Size size) {
    final centre = size.center(Offset.zero);
    final path = Path()
      ..fillType = PathFillType.evenOdd
      ..addOval(Rect.fromCircle(center: centre, radius: size.shortestSide / 2));
    if (hole > 0) path.addOval(Rect.fromCircle(center: centre, radius: hole));
    canvas.drawPath(path, Paint()..color = color);
  }

  @override
  bool shouldRepaint(_LayerPainter old) =>
      old.color != color || old.hole != hole;
}

/// A slider's cursor, as the web's: the open hand over it, the closed one
/// while it is dragged, the plain pointer when disabled.
/// Flutter's own showed the pointing hand.
final WidgetStateMouseCursor _sliderCursor = WidgetStateMouseCursor.resolveWith(
  (states) => states.contains(WidgetState.disabled)
      ? SystemMouseCursors.basic
      : states.contains(WidgetState.dragged)
      ? SystemMouseCursors.grabbing
      : SystemMouseCursors.grab,
);

/// One cursor for an option and its control, so the words never say other
/// than the box: the hand, or the plain pointer when disabled, as on the web,
/// where a disabled option takes no pointer at all. Flutter's own default
/// shows the hand on the web only.
const WidgetStateMouseCursor _choiceCursor = WidgetStateMouseCursor.clickable;

/// A switch's layer, by Flutter's own rules for one: 8% under a hover and 10%
/// pressed, of the primary when on and of the text colour when off.
_ChoiceLayer _switchLayer(BuildContext context, {required bool selected}) {
  final scheme = Theme.of(context).colorScheme;
  final ink = selected ? scheme.primary : scheme.onSurface;
  return ({required bool pressed}) =>
      ink.withValues(alpha: pressed ? 0.1 : 0.08);
}

/// An empty box's edge. While its option is under the pointer it is the text
/// colour, as Material 3 draws a hovered box's, so the words darken it as the
/// box itself does. Disabled it keeps its usual muted edge, which the option's
/// fade greys: Material's own disabled edge, 38% of the text colour, faded
/// again, all but vanished. Null leaves every other state to Flutter.
BorderSide? _boxSide(
  BuildContext context, {
  required bool empty,
  bool engaged = false,
  bool disabled = false,
}) {
  if (!empty) return null;
  final scheme = Theme.of(context).colorScheme;
  if (disabled) return BorderSide(width: 2, color: scheme.onSurfaceVariant);
  if (engaged) return BorderSide(width: 2, color: scheme.onSurface);
  return null;
}

/// A checkbox's layer, by Flutter's own rules for one: a hover is 8% of the
/// primary (gilt) when checked and of the text colour when not, or of the
/// error colour; a press is the checked fill at the reaction alpha, or 10% of
/// the primary on an empty box, as `Checkbox` resolves them under Diba's
/// theme.
_ChoiceLayer _checkboxLayer(
  BuildContext context, {
  required bool selected,
  required bool isError,
  WidgetStateProperty<Color?>? fill,
}) {
  final scheme = Theme.of(context).colorScheme;
  final themeFill = CheckboxTheme.of(context).fillColor;
  Color? fillFor(Set<WidgetState> states) =>
      fill?.resolve(states) ?? themeFill?.resolve(states);
  return ({required bool pressed}) {
    if (pressed) {
      final on = selected ? fillFor({WidgetState.selected}) : fillFor({});
      if (on != null) return on.withAlpha(kRadialReactionAlpha);
      return (isError ? scheme.error : scheme.primary).withValues(alpha: 0.1);
    }
    if (isError) return scheme.error.withValues(alpha: 0.08);
    return (selected ? scheme.primary : scheme.onSurface).withValues(
      alpha: 0.08,
    );
  };
}

/// A radio's layer, by Flutter's own rules for one: a hover is 8% of the
/// primary when chosen and of the text colour when not; a press is the dot's
/// or the ring's colour at the reaction alpha.
_ChoiceLayer _radioLayer(BuildContext context, {required bool selected}) {
  final scheme = Theme.of(context).colorScheme;
  final fill = RadioTheme.of(context).fillColor;
  return ({required bool pressed}) {
    if (pressed) {
      final ring = fill?.resolve({if (selected) WidgetState.selected});
      return (ring ?? scheme.primary).withAlpha(kRadialReactionAlpha);
    }
    return (selected ? scheme.primary : scheme.onSurface).withValues(
      alpha: 0.08,
    );
  };
}
