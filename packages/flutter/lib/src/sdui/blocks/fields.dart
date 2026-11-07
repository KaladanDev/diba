import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../tokens.g.dart';
import '../field.dart';
import '../format.dart';
import '../glyphs.dart';
import '../node.dart';
import '../date_calendar.dart';
import '../date_text.dart';
import '../placement.dart';
import '../strings.dart';

/// Group 2: TextField, TextArea, SearchField, NumberField, DateField.

TextInputType? _keyboard(String? type, String? inputMode) {
  switch (inputMode) {
    case 'numeric':
      return TextInputType.number;
    case 'decimal':
      return const TextInputType.numberWithOptions(decimal: true);
    case 'tel':
      return TextInputType.phone;
    case 'url':
      return TextInputType.url;
    case 'email':
      return TextInputType.emailAddress;
    case 'text':
      return TextInputType.text;
  }
  return switch (type) {
    'email' => TextInputType.emailAddress,
    'tel' => TextInputType.phone,
    'url' => TextInputType.url,
    'password' => TextInputType.visiblePassword,
    _ => null,
  };
}

/// The curated autoComplete tokens, as Flutter's autofill hints. `off` is an
/// empty list, which tells the platform not to offer anything.
Iterable<String>? _autofill(String? token) => switch (token) {
  'name' => const [AutofillHints.name],
  'email' => const [AutofillHints.email],
  'tel' => const [AutofillHints.telephoneNumber],
  'tel-national' => const [AutofillHints.telephoneNumberNational],
  'street-address' => const [AutofillHints.fullStreetAddress],
  'postal-code' => const [AutofillHints.postalCode],
  'organization' => const [AutofillHints.organizationName],
  'one-time-code' => const [AutofillHints.oneTimeCode],
  'new-password' => const [AutofillHints.newPassword],
  'current-password' => const [AutofillHints.password],
  'off' => const <String>[],
  _ => null,
};

TextCapitalization _capitalization(String? value) => switch (value) {
  'sentences' => TextCapitalization.sentences,
  'words' => TextCapitalization.words,
  'characters' => TextCapitalization.characters,
  _ => TextCapitalization.none,
};

String _text(Object? value) =>
    value is String ? value : (value?.toString() ?? '');

/// TextField and TextArea, which differ only in what they leave out.
Widget _textField(
  BuildContext context,
  DibaNodeContext node, {
  required bool area,
}) {
  final type = area ? null : node.prop<String>('type');
  final spellCheck = node.flagOr('spellCheck', true);
  final dir = node.str('dir', 'auto');
  final rows = node.number('rows')?.toInt() ?? 3;
  return dibaFieldFrame(
    node,
    DibaTextInput(
      text: _text(node.current),
      pinned: node.pinned,
      decoration: dibaDecoration(
        context,
        node,
        prefixText: area ? null : node.prop<String>('prefix'),
        suffixText: area ? null : node.prop<String>('suffix'),
        affixDirection: dir == 'ltr' ? TextDirection.ltr : null,
      ),
      keyboardType: area
          ? TextInputType.multiline
          : _keyboard(type, node.prop<String>('inputMode')),
      obscureText: type == 'password',
      textDirection: dir == 'ltr' ? TextDirection.ltr : null,
      autoDirection: dir == 'auto',
      maxLength: node.number('maxLength')?.toInt(),
      minLines: area ? rows : null,
      maxLines: area ? rows : 1,
      autofillHints: area ? null : _autofill(node.prop<String>('autoComplete')),
      textCapitalization: _capitalization(node.prop<String>('autoCapitalize')),
      autocorrect: spellCheck,
      enableSuggestions: spellCheck,
      enabled: !node.flag('isDisabled'),
      readOnly: node.flag('isReadOnly'),
      validator: (text) => dibaCheckText(context, node, text),
      onChanged: (v) => node.setValue('onChange', v),
      onBlur: (v) => node.fire('onBlur', v),
    ),
  );
}

final Map<String, DibaBuilder> fieldBlocks = {
  'TextField': (context, node) => _textField(context, node, area: false),

  'TextArea': (context, node) => _textField(context, node, area: true),

  /// The spec says SearchBar. SearchBar has no label, helper or error text and
  /// no read-only state, so it cannot carry the common field props; a text
  /// field with the fixed search icon and clear button can.
  'SearchField': (context, node) => dibaFieldFrame(
    node,
    hiddenByDefault: true,
    DibaTextInput(
      text: _text(node.current),
      pinned: node.pinned,
      decoration: dibaDecoration(
        context,
        node,
        // The web's mark, 16 in the placeholder colour, 12 from the edge and
        // 8 from the text.
        prefixIcon: dibaFieldGlyph(
          DibaGlyph.search,
          size: 16,
          color: node.flag('isDisabled')
              ? dibaHalf(dibaFieldInk(context).placeholder)
              : dibaFieldInk(context).placeholder,
          outer: 12,
          inner: 8,
          start: true,
        ),
      ),
      keyboardType: TextInputType.text,
      // No dir prop: the page's direction, as the web's input inherits it.
      textInputAction: TextInputAction.search,
      enabled: !node.flag('isDisabled'),
      readOnly: node.flag('isReadOnly'),
      validator: (text) => dibaCheckText(context, node, text),
      onChanged: (v) => node.setValue('onChange', v),
      onSubmitted: (v) => node.fire('onSubmit', v),
      onClear: () => node.fire('onClear'),
    ),
  ),

  'NumberField': (context, node) {
    final persian = node.isPersian;
    final style = node.str('formatStyle', 'decimal');
    final strings = DibaStrings.of(context);
    final min = node.number('minValue');
    final max = node.number('maxValue');
    String show(num v) => formatNumber(
      v,
      persian: persian,
      style: style,
      currency: node.prop<String>('currency'),
      maximumFractionDigits: node.number('maximumFractionDigits')?.toInt(),
    );
    final current = node.current;
    // The toman is a whole number in the field and its word beside it, as the
    // web draws it; every other currency formats inside the figure.
    final toman =
        style == 'currency' &&
        (node.prop<String>('currency') == 'IRT' ||
            node.prop<String>('currency') == 'TOMAN');
    return dibaFieldFrame(
      node,
      DibaNumberInput(
        value: current is num ? current : null,
        pinned: node.pinned,
        min: min,
        max: max,
        step: node.number('step'),
        percent: style == 'percent',
        persian: persian,
        format: toman
            ? (v) => formatNumber(v, persian: persian, maximumFractionDigits: 0)
            : show,
        unit: toman ? strings.toman : null,
        decoration: dibaDecoration(context, node),
        hideSteppers: node.flag('hideSteppers'),
        enabled: !node.flag('isDisabled'),
        readOnly: node.flag('isReadOnly'),
        labels: (strings.decrease, strings.increase),
        validator: (v) {
          if (v == null)
            return node.flag('isRequired') ? strings.required : null;
          if (min != null && v < min) return strings.atLeast(show(min));
          if (max != null && v > max) return strings.atMost(show(max));
          return null;
        },
        onChanged: (v) => node.setValue('onChange', v),
      ),
    );
  },

  'DateField': (context, node) {
    final persian = node.isPersian;
    final jalali = dibaJalali(node);
    final granularity = node.str('granularity', 'day');
    final raw = node.current;
    final zoned = dibaZoned(raw);
    final value = dibaParseDate(raw);

    String display(DateTime d) => dibaDateDisplay(node, d, zoned: zoned);

    // A day picked in the calendar; at an hour or a minute, the time follows
    // in Material's dialog, as the web's is typed into the field. M3's time
    // picker always asks for minutes; an hour granularity drops them.
    Future<void> picked(DateTime day) async {
      var date = day;
      if (granularity != 'day') {
        if (!context.mounted) return;
        final time = await dibaAskTime(
          context,
          node,
          initial: value == null ? null : TimeOfDay.fromDateTime(value),
        );
        if (time == null) return;
        date = dibaAtTime(node, date, time);
      }
      node.setValue('onChange', dibaDateIso(node, date, zoned: zoned));
    }

    final shown = value == null ? '' : display(value);
    return dibaDatePickerField(
      context,
      node,
      shown: shown,
      hint: dibaDateHint(persian: persian, granularity: granularity),
      empty: value == null,
      calendar: (close) => DibaDateCalendar(
        selected: value,
        jalali: jalali,
        persian: persian,
        min: DateTime.tryParse(node.str('minValue', '')),
        max: DateTime.tryParse(node.str('maxValue', '')),
        unavailable: dibaUnavailable(node),
        onPicked: (day) {
          close();
          picked(day);
        },
      ),
    );
  },
};

/// A date field and its calendar, as DateField and DateRangePicker draw them:
/// a read-only field showing [shown], [hint] while [empty], its calendar mark
/// at the end; a press opens [calendar] on the overlay's surface 20 round and
/// 12 in, centred 8 under the field's box.
///
/// Given [halves], a range's two dates (or their placeholders while [empty]),
/// each takes half the field as the web's do, and [shown] is the key.
Widget dibaDatePickerField(
  BuildContext context,
  DibaNodeContext node, {
  required String shown,
  required String hint,
  required bool empty,
  required Widget Function(VoidCallback close) calendar,
  (String, String)? halves,
}) {
  final disabled = node.flag('isDisabled');
  final readOnly = node.flag('isReadOnly');
  final muted = Theme.of(context).colorScheme.onSurfaceVariant;
  final dark = Theme.of(context).brightness == Brightness.dark;
  final strings = DibaStrings.of(context);
  InputDecoration decoration(InputDecoration plain) => halves == null
      ? plain
      : plain.copyWith(
          hint: _RangeHalves(halves: halves, empty: empty, disabled: disabled),
        );
  return dibaFieldFrame(
    node,
    DibaPlacedPanel(
      placement: const DibaPlacement('bottom', 'center'),
      bare: true,
      gap: 8,
      anchorHeight: dibaFieldHeight(context),
      panel: (context, close) => Material(
        type: MaterialType.transparency,
        child: DecoratedBox(
          decoration: DibaTheme.overlay(dark: dark, radius: 20),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: calendar(close),
          ),
        ),
      ),
      trigger: (context, open) => TextFormField(
        // A read-only field showing the value; the picker is the interaction.
        // Material has no segmented date typing, so the value is the same as
        // the web's and only the way it is entered differs.
        key: ValueKey(shown),
        initialValue: halves == null ? shown : '',
        readOnly: true,
        enabled: !disabled,
        style: dibaFieldText(context, disabled: disabled),
        decoration: decoration(
          dibaDecoration(
            context,
            node,
            // An empty field shows the web's segments' placeholders.
            hint: halves == null ? hint : null,
            // The web's calendar button: its mark 20 in the muted colour, in a
            // 28 square 12 from the field's end and 8 from the text, whatever
            // the granularity. Its square shows the pointer while a press
            // opens the calendar, over Material's arrow for a suffix; a field
            // that is off takes no pointer at all. A range's second half
            // keeps its own 8.
            suffixIcon: Padding(
              padding: EdgeInsetsDirectional.only(
                start: halves == null ? 4 : 0,
                end: 12,
              ),
              child: MouseRegion(
                cursor: readOnly ? MouseCursor.defer : SystemMouseCursors.click,
                child: SizedBox.square(
                  dimension: 28,
                  child: Center(
                    child: DibaGlyphMark(
                      DibaGlyph.calendar,
                      size: 20,
                      color: disabled ? dibaHalf(muted) : muted,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        errorBuilder: dibaFieldError,
        validator: (_) =>
            node.flag('isRequired') && empty ? strings.required : null,
        onTap: disabled || readOnly ? null : open,
      ),
    ),
  );
}

/// A range's two dates as the web's field lays them out: each in half
/// the room before the calendar mark, 12 in from its half's start and 8 short
/// of its end, the placeholder's «-» 14 high between them, 4 either side. The
/// field's padding is the first half's 12, and the input ends 4 before the
/// mark (Material's gap), so the second half keeps 4 of its 8; the fixed
/// widths share the rest as the web's halves do. The padding stays the
/// field's so the notes under it line up as every field's do.
class _RangeHalves extends StatelessWidget {
  const _RangeHalves({
    required this.halves,
    required this.empty,
    required this.disabled,
  });

  final (String, String) halves;
  final bool empty;
  final bool disabled;

  @override
  Widget build(BuildContext context) {
    final placeholder = dibaFieldInk(context).placeholder;
    final words = dibaFieldText(
      context,
      color: empty ? placeholder : null,
      disabled: disabled,
    );
    Widget half(String text) => Text(
      text,
      maxLines: 1,
      softWrap: false,
      overflow: TextOverflow.clip,
      style: words,
    );
    return Row(
      children: [
        Expanded(child: half(halves.$1)),
        const SizedBox(width: 8),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Text(
            ' - ',
            style: dibaFieldText(
              context,
              color: placeholder,
              disabled: disabled,
              small: true,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(child: half(halves.$2)),
        const SizedBox(width: 4),
      ],
    );
  }
}

/// What an empty date field shows: React Aria's placeholders for its
/// segments, in the order the web's locale lays them out, a thin space each
/// side of a slash for the segments' 2px padding. A Persian page reads year,
/// month and day from the right, in either calendar; an English one month,
/// day and year.
String dibaDateHint({required bool persian, required String granularity}) {
  const slash = '\u2009/\u2009';
  final date = persian
      ? 'سال${slash}ماه${slash}روز'
      : 'mm${slash}dd${slash}yyyy';
  return switch (granularity) {
    'day' => date,
    'hour' => '$date, ––',
    _ => '$date, ––:––',
  };
}

/// Persian digits in a string, leaving everything else alone.
String latinToPersian(String text) => text.replaceAllMapped(
  RegExp(r'\d'),
  (m) => persianDigits(int.parse(m[0]!)),
);

/// NumberField, composed: Material has no number field.
///
/// Unfocused, it shows the value formatted — Persian digits, grouping, a
/// percent sign or a currency. Focused, it shows the bare number to edit, and
/// accepts either script. Leaving the field clamps to the range and snaps to
/// the step, which is what React Aria does on blur.
class DibaNumberInput extends StatefulWidget {
  const DibaNumberInput({
    super.key,
    required this.value,
    required this.pinned,
    required this.format,
    required this.decoration,
    required this.onChanged,
    required this.labels,
    this.min,
    this.max,
    this.step,
    this.unit,
    this.percent = false,
    this.persian = true,
    this.hideSteppers = false,
    this.enabled = true,
    this.readOnly = false,
    this.validator,
  });

  final num? value;
  final bool pinned;
  final num? min;
  final num? max;
  final num? step;

  /// A word beside the figure, the toman's: 14 in the muted colour, 12 from
  /// the text, as a TextField's suffix is.
  final String? unit;

  /// A percent field edits 15 and holds 0.15.
  final bool percent;
  final bool persian;
  final String Function(num value) format;
  final InputDecoration decoration;
  final bool hideSteppers;
  final bool enabled;
  final bool readOnly;
  final (String, String) labels;
  final String? Function(num? value)? validator;
  final ValueChanged<num?> onChanged;

  @override
  State<DibaNumberInput> createState() => _DibaNumberInputState();
}

class _DibaNumberInputState extends State<DibaNumberInput> {
  late final TextEditingController _controller = TextEditingController(
    text: _shown(widget.value),
  );
  final FocusNode _focus = FocusNode();
  num? _value;

  @override
  void initState() {
    super.initState();
    _value = widget.value;
    _focus.addListener(_focusChanged);
  }

  @override
  void didUpdateWidget(DibaNumberInput old) {
    super.didUpdateWidget(old);
    if (widget.value != _value || widget.pinned) {
      if (!_focus.hasFocus || widget.pinned) {
        _value = widget.value;
        _controller.text = _focus.hasFocus ? _editable(_value) : _shown(_value);
      }
    }
  }

  @override
  void dispose() {
    _focus.dispose();
    _controller.dispose();
    super.dispose();
  }

  String _shown(num? v) => v == null ? '' : widget.format(v);

  String _editable(num? v) {
    if (v == null) return '';
    final display = widget.percent ? v * 100 : v;
    var text = display == display.roundToDouble()
        ? display.round().toString()
        : display.toString();
    if (widget.persian) text = latinToPersian(text).replaceAll('.', '٫');
    return text;
  }

  num? _parse(String text) {
    final n = parseLocalNumber(text);
    if (n == null) return null;
    return widget.percent ? n / 100 : n;
  }

  num _clamp(num v) {
    var out = v;
    final step = widget.step;
    if (step != null && step > 0) {
      final base = widget.min ?? 0;
      out = base + ((out - base) / step).round() * step;
    }
    if (widget.min != null && out < widget.min!) out = widget.min!;
    if (widget.max != null && out > widget.max!) out = widget.max!;
    return out;
  }

  void _focusChanged() {
    if (_focus.hasFocus) {
      _controller.text = _editable(_value);
      return;
    }
    final parsed = _parse(_controller.text);
    final next = parsed == null ? null : _clamp(parsed);
    _commit(next);
  }

  void _commit(num? next) {
    final changed = next != _value;
    if (!widget.pinned) _value = next;
    _controller.text = _focus.hasFocus ? _editable(_value) : _shown(_value);
    if (changed) widget.onChanged(next);
  }

  void _stepBy(int direction) {
    final step = widget.step ?? 1;
    final base = _value ?? widget.min ?? 0;
    _commit(_clamp(base + direction * step));
  }

  @override
  Widget build(BuildContext context) {
    final live = widget.enabled && !widget.readOnly;
    // v3's steppers: minus at the start edge, plus at the end, each a cell of
    // the field divided off by a hairline.
    Widget? stepper(int direction) {
      if (widget.hideSteppers) return null;
      final bound = direction < 0 ? widget.min : widget.max;
      final canMove =
          live &&
          (bound == null ||
              (direction < 0 ? (_value ?? 0) > bound : (_value ?? 0) < bound));
      return _Stepper(
        increase: direction > 0,
        enabled: canMove,
        faded: !widget.enabled,
        label: direction < 0 ? widget.labels.$1 : widget.labels.$2,
        onPressed: () => _stepBy(direction),
      );
    }

    final unit = widget.unit;
    final word = unit == null
        ? null
        : Padding(
            padding: const EdgeInsetsDirectional.only(start: 8, end: 12),
            child: Text(
              unit,
              style: dibaFieldText(
                context,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
                disabled: !widget.enabled,
                small: true,
              ),
            ),
          );
    final increase = stepper(1);
    final end = word == null
        ? increase
        : increase == null
        ? word
        : Row(mainAxisSize: MainAxisSize.min, children: [word, increase]);

    return TextFormField(
      controller: _controller,
      focusNode: _focus,
      decoration: widget.decoration.copyWith(
        prefixIcon: stepper(-1),
        suffixIcon: end,
      ),
      style: dibaFieldText(context, disabled: !widget.enabled),
      errorBuilder: dibaFieldError,
      textAlign: widget.hideSteppers ? TextAlign.start : TextAlign.center,
      keyboardType: const TextInputType.numberWithOptions(
        decimal: true,
        signed: true,
      ),
      inputFormatters: [
        FilteringTextInputFormatter.allow(RegExp(r'[0-9۰-۹٠-٩.,٫٬\-]')),
      ],
      enabled: widget.enabled,
      readOnly: widget.readOnly,
      validator: widget.validator == null
          ? null
          : (_) => widget.validator!(
              _focus.hasFocus ? _parse(_controller.text) : _value,
            ),
      onFieldSubmitted: (_) => _focus.unfocus(),
    );
  }
}

/// A NumberField's stepper, as the web's: a cell 40 wide and the field's
/// height, divided from the text by a hairline of the placeholder colour at
/// 15%, with the minus or the plus 16 in the text colour. A press fills it
/// with the text colour at 10% and shrinks it to 0.97; one that cannot move
/// the value, at its bound or in a read-only field, is at half. Out of the tab
/// order, as React Aria's are.
class _Stepper extends StatefulWidget {
  const _Stepper({
    required this.increase,
    required this.enabled,
    required this.faded,
    required this.label,
    required this.onPressed,
  });

  final bool increase;
  final bool enabled;

  /// The whole field is disabled, and fades this with it.
  final bool faded;
  final String label;
  final VoidCallback onPressed;

  @override
  State<_Stepper> createState() => _StepperState();
}

class _StepperState extends State<_Stepper> {
  bool _pressed = false;

  void _press(bool down) {
    if (_pressed != down) setState(() => _pressed = down);
  }

  @override
  Widget build(BuildContext context) {
    final ink = Theme.of(context).colorScheme.onSurface;
    final hairline = BorderSide(
      color: dibaFieldInk(context).placeholder.withValues(alpha: 0.15),
    );
    const corner = Radius.circular(DibaRadius.md);
    final live = widget.enabled;
    Widget cell = Transform.scale(
      scale: _pressed ? 0.97 : 1,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        curve: Curves.ease,
        width: 40,
        height: dibaFieldHeight(context),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: ink.withValues(alpha: _pressed ? 0.1 : 0),
          border: BorderDirectional(
            start: widget.increase ? hairline : BorderSide.none,
            end: widget.increase ? BorderSide.none : hairline,
          ),
          borderRadius: widget.increase
              ? const BorderRadiusDirectional.horizontal(end: corner)
              : const BorderRadiusDirectional.horizontal(start: corner),
        ),
        child: DibaGlyphMark(
          widget.increase ? DibaGlyph.plus : DibaGlyph.minus,
          size: 16,
          color: ink,
        ),
      ),
    );
    if (!live) cell = Opacity(opacity: 0.5, child: cell);
    if (widget.faded) cell = Opacity(opacity: 0.5, child: cell);
    return Semantics(
      button: true,
      enabled: live,
      label: widget.label,
      onTap: live ? widget.onPressed : null,
      excludeSemantics: true,
      child: MouseRegion(
        cursor: live ? SystemMouseCursors.click : MouseCursor.defer,
        child: GestureDetector(
          onTapDown: live ? (_) => _press(true) : null,
          onTapUp: live ? (_) => _press(false) : null,
          onTapCancel: live ? () => _press(false) : null,
          onTap: live ? widget.onPressed : null,
          child: cell,
        ),
      ),
    );
  }
}
