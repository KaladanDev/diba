import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:intl/intl.dart' as intl;

import '../tokens.g.dart';
import 'glyphs.dart';
import 'node.dart';
import 'oklab.dart';
import 'strings.dart';

/// The label with its required mark.
///
/// Material 3 has no required marker, so the asterisk is composed in, in the
/// error colour and 2 after the words, as the web's `ms-0.5` sets it. A screen
/// reader hears the word, not "star".
Widget? dibaLabel(
  BuildContext context,
  String? text, {
  required bool isRequired,
  TextStyle? style,
}) {
  if (text == null) return null;
  if (!isRequired) return Text(text, style: style);
  final strings = DibaStrings.of(context);
  return Text.rich(
    TextSpan(
      children: [
        TextSpan(text: text),
        WidgetSpan(
          alignment: PlaceholderAlignment.baseline,
          baseline: TextBaseline.alphabetic,
          child: Padding(
            padding: const EdgeInsetsDirectional.only(start: 2),
            child: Text(
              '*',
              style: DefaultTextStyle.of(context).style
                  .merge(style)
                  .copyWith(color: Theme.of(context).colorScheme.error),
            ),
          ),
        ),
      ],
    ),
    style: style,
    semanticsLabel: '$text، ${strings.requiredMark}',
  );
}

/// Under 640 wide a field is 40 tall and its text 16 on a 24 line; from 640,
/// 36 tall and 14 on a 20, as the web's `text-base sm:text-sm` draws it: a
/// phone zooms into a field whose text is under 16.
bool dibaFieldNarrow(BuildContext context) =>
    MediaQuery.sizeOf(context).width < 640;

/// A field's height: its line, and 8 above and below it.
double dibaFieldHeight(BuildContext context) =>
    dibaFieldNarrow(context) ? 40 : 36;

/// What a field's text, or its placeholder, is drawn in: [color], the text
/// colour unless given, and half of it when the field is disabled. An affix's
/// words are 14 on a 20 line at every width, as the web's are ([small]).
TextStyle dibaFieldText(
  BuildContext context, {
  Color? color,
  bool disabled = false,
  bool small = false,
}) {
  final big = !small && dibaFieldNarrow(context);
  final size = big ? DibaFontSize.md : DibaFontSize.sm;
  final ink = color ?? Theme.of(context).colorScheme.onSurface;
  return TextStyle(
    fontSize: size,
    height: (big ? 24 : 20) / size,
    leadingDistribution: TextLeadingDistribution.even,
    letterSpacing: 0,
    color: disabled ? dibaHalf(ink) : ink,
  );
}

/// [c] at half its strength: how a disabled field fades. The web fades the
/// whole field as one layer; Flutter's field is several, so each part fades on
/// its own, and its description, which the web leaves, stays.
Color dibaHalf(Color c) => c.withValues(alpha: c.a * 0.5);

/// The neutrals a field draws in that Material's scheme has no role for: the
/// placeholder, 4.5:1 or more on the field's fill, a step darker on a
/// [secondary] field's second surface, and the neutral fill of its clear
/// button.
({Color placeholder, Color fill, Color fillHover}) dibaFieldInk(
  BuildContext context, {
  bool secondary = false,
}) => Theme.of(context).brightness == Brightness.dark
    ? (
        placeholder: secondary
            ? DibaDarkNeutrals.placeholderSecondary
            : DibaDarkNeutrals.placeholder,
        fill: DibaDarkNeutrals.fill,
        fillHover: DibaDarkNeutrals.fillHover,
      )
    : (
        placeholder: secondary
            ? DibaLightNeutrals.placeholderSecondary
            : DibaLightNeutrals.placeholder,
        fill: DibaLightNeutrals.fill,
        fillHover: DibaLightNeutrals.fillHover,
      );

/// A field's fill, and its fill under a hover. On a page (`primary`), the
/// surface, and v3's hover: 2 parts of the text colour in 92 of the surface,
/// mixed in Oklab, over what is behind. On a grey card (`secondary`), the
/// second surface with the field's edge still drawn, as Flutter's was, and a
/// slate step further under a hover. The web's had been slate-200 inside
/// its own slate-200 edge, which hid the edge in the light theme.
(Color, Color) _fills(BuildContext context, {required bool secondary}) {
  final theme = Theme.of(context);
  final scheme = theme.colorScheme;
  if (secondary) {
    return (
      scheme.surfaceContainer,
      theme.brightness == Brightness.dark
          ? DibaPalette.slate700
          : DibaPalette.slate200,
    );
  }
  return (
    scheme.surface,
    dibaMixOklab(scheme.surface, 0.9, scheme.onSurface, 0.02),
  );
}

/// The common field props, as an [InputDecoration].
///
/// No `label` here: v3 draws a field's label above it, and so does
/// [dibaFieldFrame]. M3's floating label sat inside the border, which is
/// the one thing that made a Flutter field look unlike the admin's.
/// `description` is the helper and `errorMessage` the error, which a failed
/// client check replaces (a TextFormField's `errorBuilder`, [dibaFieldError]).
/// `variant` is the fill: primary on a page, secondary on a grey card.
///
/// [prefixIcon] and [suffixIcon] are whole cells, sized by what they hold:
/// Material puts 4 between a cell and the text, and the text 12 in from an
/// edge with no cell.
InputDecoration dibaDecoration(
  BuildContext context,
  DibaNodeContext node, {
  String? hint,
  Widget? prefixIcon,
  Widget? suffixIcon,
  String? prefixText,
  String? suffixText,
  TextDirection? affixDirection,
  String? errorText,
}) {
  final disabled = node.flag('isDisabled');
  final secondary = node.prop<String>('variant') == 'secondary';
  final (fill, hover) = _fills(context, secondary: secondary);
  final description = node.prop<String>('description');
  final error = errorText ?? node.prop<String>('errorMessage');
  // A Latin field keeps its affixes in its own order, as the web sets the
  // whole group's direction (F6): `kaladan.shop/` stays on the left of the
  // address on a Persian page.
  final flip =
      affixDirection != null && affixDirection != Directionality.of(context);
  final before = flip ? suffixText : prefixText;
  final after = flip ? prefixText : suffixText;
  return InputDecoration(
    hintText: hint ?? node.prop<String>('placeholder'),
    // A placeholder too long for the field is cut at its edge, as the web's
    // is; Material ended it in an ellipsis.
    hintStyle: dibaFieldText(
      context,
      color: dibaFieldInk(context, secondary: secondary).placeholder,
      disabled: disabled,
    ).copyWith(overflow: TextOverflow.clip),
    helper: description == null ? null : _Note(description, error: false),
    error: error == null ? null : _Note(error, error: true),
    prefixIcon:
        prefixIcon ??
        _affix(context, before, affixDirection, disabled, start: true),
    suffixIcon:
        suffixIcon ??
        _affix(context, after, affixDirection, disabled, start: false),
    prefixIconConstraints: const BoxConstraints(),
    suffixIconConstraints: const BoxConstraints(),
    // Material counts characters under a field with maxLength. The web does
    // not, and a counter the merchant never sees on one platform is noise.
    counterText: '',
    // With the label outside, the field is only as tall as its text needs.
    isDense: true,
    contentPadding: dibaFieldPadding,
    filled: true,
    fillColor: disabled ? dibaHalf(fill) : fill,
    hoverColor: hover,
  );
}

/// The padding round a field's text: 12 across and 8 down, the web's
/// `px-3 py-2`, so the field is its line and 16 tall ([dibaFieldHeight]).
///
/// It holds only at standard density. Flutter's default density is compact on
/// desktop and the web, which takes 8px off every field; DibaTheme sets it to
/// standard, because Diba's sizes are tokens, not a platform's guess.
const EdgeInsets dibaFieldPadding = EdgeInsets.symmetric(
  horizontal: 12,
  vertical: 8,
);

/// A prefix's or a suffix's words: 14 on a 20 line in the muted colour, 12
/// from the field's edge and 12 from its text, as the web's input group sets
/// them. The original's were the placeholder colour, 2.6:1 on a white field,
/// under AA. Material leaves 4 between a cell and the text, so the inner side
/// here is 8.
Widget? _affix(
  BuildContext context,
  String? text,
  TextDirection? direction,
  bool disabled, {
  required bool start,
}) {
  if (text == null) return null;
  return Padding(
    padding: start
        ? const EdgeInsetsDirectional.only(start: 12, end: 8)
        : const EdgeInsetsDirectional.only(start: 8, end: 12),
    child: Text(
      text,
      textDirection: direction,
      style: dibaFieldText(
        context,
        color: Theme.of(context).colorScheme.onSurfaceVariant,
        disabled: disabled,
        small: true,
      ),
    ),
  );
}

/// A field's cell holding one of the web's marks ([DibaGlyph]): [outer] from
/// the field's edge and [inner] from its text, less the 4 Material keeps.
Widget dibaFieldGlyph(
  DibaGlyph glyph, {
  required double size,
  required Color color,
  required double outer,
  required double inner,
  required bool start,
}) => Padding(
  padding: start
      ? EdgeInsetsDirectional.only(start: outer, end: inner - 4)
      : EdgeInsetsDirectional.only(start: inner - 4, end: outer),
  child: DibaGlyphMark(glyph, size: size, color: color),
);

/// A field's description or its error, as the web draws them under a field
///: 12 on a 16 line, 4 below it; a description flush with the field's
/// edge in the muted colour, an error 4 in from each edge in the danger
/// colour. Material lays both out inside the field's padding, 12 in from each
/// side, so [_Flush] takes those back.
class _Note extends StatelessWidget {
  const _Note(this.text, {required this.error});

  final String text;
  final bool error;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return _Flush(
      reclaim: dibaFieldPadding.left,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: error ? 4 : 0),
        child: Text(
          text,
          style: TextStyle(
            fontSize: DibaFontSize.xs,
            height: 16 / 12,
            leadingDistribution: TextLeadingDistribution.even,
            letterSpacing: 0,
            color: error ? scheme.error : scheme.onSurfaceVariant,
          ),
        ),
      ),
    );
  }
}

/// The message a field's own check finds, drawn as the tree's errorMessage
/// is: a TextFormField's `errorBuilder`.
Widget dibaFieldError(BuildContext context, String text) =>
    _Note(text, error: true);

/// Lays its child out [reclaim] wider on each side than it is given, and
/// paints it that far out, so text Material set inside a field's padding
/// lines up with the field's edges.
class _Flush extends SingleChildRenderObjectWidget {
  const _Flush({required this.reclaim, required super.child});

  final double reclaim;

  @override
  RenderObject createRenderObject(BuildContext context) =>
      _RenderFlush(reclaim);

  @override
  void updateRenderObject(BuildContext context, _RenderFlush renderObject) =>
      renderObject.reclaim = reclaim;
}

class _RenderFlush extends RenderShiftedBox {
  _RenderFlush(this._reclaim) : super(null);

  double _reclaim;
  set reclaim(double value) {
    if (value == _reclaim) return;
    _reclaim = value;
    markNeedsLayout();
  }

  double get _both => 2 * _reclaim;

  BoxConstraints _inner(BoxConstraints c) => c.hasBoundedWidth
      ? BoxConstraints.tightFor(width: c.maxWidth + _both)
      : c.loosen();

  Size _sized(BoxConstraints c, Size child) => c.constrain(
    Size(c.hasBoundedWidth ? c.maxWidth : child.width, child.height),
  );

  @override
  double computeMinIntrinsicHeight(double width) =>
      child?.getMinIntrinsicHeight(width + _both) ?? 0;

  @override
  double computeMaxIntrinsicHeight(double width) =>
      child?.getMaxIntrinsicHeight(width + _both) ?? 0;

  @override
  double computeMinIntrinsicWidth(double height) =>
      ((child?.getMinIntrinsicWidth(height) ?? 0) - _both).clamp(
        0,
        double.infinity,
      );

  @override
  double computeMaxIntrinsicWidth(double height) =>
      ((child?.getMaxIntrinsicWidth(height) ?? 0) - _both).clamp(
        0,
        double.infinity,
      );

  @override
  Size computeDryLayout(BoxConstraints constraints) {
    final c = child;
    if (c == null) return constraints.smallest;
    return _sized(constraints, c.getDryLayout(_inner(constraints)));
  }

  @override
  double? computeDryBaseline(
    BoxConstraints constraints,
    TextBaseline baseline,
  ) => child?.getDryBaseline(_inner(constraints), baseline);

  @override
  void performLayout() {
    final c = child;
    if (c == null) {
      size = constraints.smallest;
      return;
    }
    c.layout(_inner(constraints), parentUsesSize: true);
    size = _sized(constraints, c.size);
    (c.parentData! as BoxParentData).offset = Offset(
      constraints.hasBoundedWidth ? -_reclaim : 0,
      0,
    );
  }
}

/// The label above, then the field, at the field's width.
///
/// `label` is a [Text] composed above the field, as v3 draws it, with
/// the required mark, 4 above the field (the web's `gap-1`), and faded to half
/// with a disabled field. `isLabelHidden` keeps it for a screen reader only.
/// `fullWidth: false` takes Diba's natural field width, because a Flutter text
/// field has no width of its own and takes whatever it is given.
Widget dibaFieldFrame(
  DibaNodeContext node,
  Widget field, {
  bool hiddenByDefault = false,
}) => _FieldFrame(node: node, field: field, hiddenByDefault: hiddenByDefault);

class _FieldFrame extends StatelessWidget {
  const _FieldFrame({
    required this.node,
    required this.field,
    required this.hiddenByDefault,
  });

  final DibaNodeContext node;
  final Widget field;
  final bool hiddenByDefault;

  @override
  Widget build(BuildContext context) {
    final text = node.prop<String>('label');
    final hidden = node.flagOr('isLabelHidden', hiddenByDefault);
    Widget out = field;
    if (text != null && !hidden) {
      Widget label = dibaLabel(
        context,
        text,
        isRequired: node.flag('isRequired'),
        style: dibaLabelStyle(context),
      )!;
      if (node.flag('isDisabled')) label = Opacity(opacity: 0.5, child: label);
      out = Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(padding: const EdgeInsets.only(bottom: 4), child: label),
          field,
        ],
      );
    } else if (text != null) {
      out = Semantics(label: text, child: out);
    }
    if (!node.flagOr('fullWidth', true)) {
      out = Align(
        alignment: AlignmentDirectional.centerStart,
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: DibaDimens.fieldWidth),
          child: out,
        ),
      );
    }
    return out;
  }
}

/// A field label's style: v3's, 14 on a 20 line, medium weight in the body
/// colour.
TextStyle? dibaLabelStyle(BuildContext context) {
  final theme = Theme.of(context);
  return theme.textTheme.labelLarge?.copyWith(
    color: theme.colorScheme.onSurface,
    height: 20 / 14,
    leadingDistribution: TextLeadingDistribution.even,
  );
}

/// A label above, the control, and the description or error below — the
/// shape of every composed field Material has no decoration for: a group of
/// checkboxes, a slider, a set of tags.
class DibaFieldShell extends StatelessWidget {
  const DibaFieldShell({
    super.key,
    required this.node,
    required this.child,
    this.errorText,
    this.trailing,
    this.labelGap,
    this.helperGap,
    this.helpAndError = false,
  });

  final DibaNodeContext node;
  final Widget child;

  /// Both the description and the error, the error 4 under the description
  /// and 4 in, as the web draws a TagGroup's; a field shows one.
  final bool helpAndError;

  /// The space under the label, and over the description or error; a
  /// field's helper padding unless given. A choice group takes the web's: 16
  /// under its label, none over its description, which follows its options.
  final double? labelGap;
  final double? helperGap;

  /// A failed client check, which wins over the tree's errorMessage.
  final String? errorText;

  /// Beside the label: a slider's value.
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final error = errorText ?? node.prop<String>('errorMessage');
    final description = node.prop<String>('description');
    final hidden = node.flag('isLabelHidden');
    final label = hidden
        ? null
        : dibaLabel(
            context,
            node.prop<String>('label'),
            isRequired: node.flag('isRequired'),
            style: dibaLabelStyle(context),
          );

    final column = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (label != null || trailing != null)
          Padding(
            padding: EdgeInsets.only(
              bottom: labelGap ?? DibaDimens.fieldHelperP,
            ),
            child: Row(
              children: [
                if (label != null) Expanded(child: label),
                ?trailing,
              ],
            ),
          ),
        child,
        if (helpAndError) ...[
          for (final (note, isError) in [
            if (description != null) (description, false),
            if (error != null) (error, true),
          ])
            Padding(
              padding: EdgeInsetsDirectional.only(
                top: helperGap ?? DibaDimens.fieldHelperP,
                start: isError ? 4 : 0,
                end: isError ? 4 : 0,
              ),
              child: Text(
                note,
                style: theme.textTheme.bodySmall?.copyWith(
                  height: 16 / 12,
                  leadingDistribution: TextLeadingDistribution.even,
                  color: isError
                      ? theme.colorScheme.error
                      : theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ),
        ] else if (error != null || description != null)
          Padding(
            padding: EdgeInsets.only(top: helperGap ?? DibaDimens.fieldHelperP),
            child: Text(
              error ?? description!,
              // 12 on a 16 line, as a text field's note is.
              style: theme.textTheme.bodySmall?.copyWith(
                height: 16 / 12,
                leadingDistribution: TextLeadingDistribution.even,
                color: error != null
                    ? theme.colorScheme.error
                    : theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ),
      ],
    );
    if (hidden && node.prop<String>('label') != null) {
      return Semantics(
        label: node.prop<String>('label'),
        container: true,
        child: column,
      );
    }
    return column;
  }
}

/// A [FormField] that only exists to take part in a Form's checks.
///
/// Material's checkbox, radio, menu and slider are not form fields. Wrapping
/// them is how `isRequired` and the rest reach `FormState.validate()`. The
/// validator reads the current value through a closure rather than the
/// FormField's own copy, because the value lives in the surface.
class DibaValidated extends StatelessWidget {
  const DibaValidated({
    super.key,
    required this.validator,
    required this.builder,
  });

  final String? Function() validator;
  final Widget Function(String? errorText) builder;

  @override
  Widget build(BuildContext context) => FormField<Object?>(
    validator: (_) => validator(),
    builder: (state) => builder(state.errorText),
  );
}

/// The client checks a Form runs before its onSubmit fires.
///
/// The spec lists them: isRequired, minLength, maxLength, type email and url,
/// and number ranges. The messages and the email and URL rules are Diba's own
/// table, the same on both platforms; see `strings.dart`.
String? dibaCheckText(BuildContext context, DibaNodeContext node, String text) {
  final strings = DibaStrings.of(context);
  final persian = dibaIsPersian(context);
  String n(int v) =>
      persian ? intl.NumberFormat.decimalPattern('fa').format(v) : '$v';

  if (text.isEmpty) return node.flag('isRequired') ? strings.required : null;
  final min = node.number('minLength')?.toInt();
  if (min != null && text.characters.length < min) {
    return strings.tooShort(n(min));
  }
  final max = node.number('maxLength')?.toInt();
  if (max != null && text.characters.length > max) {
    return strings.tooLong(n(max));
  }
  switch (node.prop<String>('type')) {
    case 'email':
      if (!dibaIsEmail(text)) return strings.invalidEmail;
    case 'url':
      if (!dibaIsWebUrl(text)) return strings.invalidUrl;
  }
  return null;
}

/// A text field's own state: its controller, its focus, and the two forms of
/// its value.
///
/// The default form is the controller's starting text, and the merchant
/// changes it. The pinned form is rewritten into the controller whenever the
/// tree changes it — and straight after every keystroke, because pinned means
/// "shows exactly what the server sent". That second half is what the web gets
/// for free from React re-rendering a controlled input, and in Flutter it is a
/// controller being overwritten under an IME that may be mid-composition.
class DibaTextInput extends StatefulWidget {
  const DibaTextInput({
    super.key,
    required this.text,
    required this.pinned,
    required this.decoration,
    this.keyboardType,
    this.obscureText = false,
    this.textDirection,
    this.autoDirection = false,
    this.maxLength,
    this.minLines,
    this.maxLines = 1,
    this.autofillHints,
    this.textCapitalization = TextCapitalization.none,
    this.autocorrect = true,
    this.enableSuggestions = true,
    this.enabled = true,
    this.readOnly = false,
    this.validator,
    this.onChanged,
    this.onBlur,
    this.onSubmitted,
    this.onTap,
    this.textInputAction,
    this.onClear,
  });

  /// The default value, or the pinned one.
  final String text;
  final bool pinned;
  final InputDecoration decoration;
  final TextInputType? keyboardType;
  final bool obscureText;
  final TextDirection? textDirection;

  /// `dir: auto`: the direction of the first strong character, as the web's
  /// `dir="auto"` decides it. Flutter's TextField has no such mode, so it is
  /// worked out again on every change.
  final bool autoDirection;
  final int? maxLength;
  final int? minLines;
  final int? maxLines;
  final Iterable<String>? autofillHints;
  final TextCapitalization textCapitalization;
  final bool autocorrect;
  final bool enableSuggestions;
  final bool enabled;
  final bool readOnly;
  final String? Function(String text)? validator;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onBlur;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onTap;
  final TextInputAction? textInputAction;

  /// SearchField's fixed clear button: shown while there is text, and it
  /// empties the field, fires onChange with '' and then this.
  final VoidCallback? onClear;

  @override
  State<DibaTextInput> createState() => _DibaTextInputState();
}

class _DibaTextInputState extends State<DibaTextInput> {
  late final TextEditingController _controller = TextEditingController(
    text: widget.text,
  );

  @override
  void didUpdateWidget(DibaTextInput old) {
    super.didUpdateWidget(old);
    if (widget.pinned && _controller.text != widget.text) {
      _controller.value = TextEditingValue(
        text: widget.text,
        selection: TextSelection.collapsed(offset: widget.text.length),
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  TextDirection? get _direction {
    if (!widget.autoDirection) return widget.textDirection;
    final text = _controller.text;
    if (text.trim().isEmpty) return null;
    return intl.Bidi.detectRtlDirectionality(text)
        ? TextDirection.rtl
        : TextDirection.ltr;
  }

  void _changed(String value) {
    widget.onChanged?.call(value);
    if (widget.pinned && value != widget.text) {
      _controller.value = TextEditingValue(
        text: widget.text,
        selection: TextSelection.collapsed(offset: widget.text.length),
      );
    }
    if (widget.autoDirection || widget.onClear != null) setState(() {});
  }

  void _clear() {
    _changed('');
    if (!widget.pinned) _controller.clear();
    widget.onClear?.call();
  }

  @override
  Widget build(BuildContext context) {
    return Focus(
      canRequestFocus: false,
      skipTraversal: true,
      onFocusChange: (focused) {
        if (!focused) widget.onBlur?.call(_controller.text);
      },
      child: TextFormField(
        controller: _controller,
        decoration: widget.onClear == null
            ? widget.decoration
            : widget.decoration.copyWith(
                suffixIcon: _ClearButton(
                  shown: _controller.text.isNotEmpty,
                  enabled: widget.enabled && !widget.readOnly,
                  faded: !widget.enabled,
                  onPressed: _clear,
                ),
              ),
        style: dibaFieldText(context, disabled: !widget.enabled),
        errorBuilder: dibaFieldError,
        keyboardType: widget.keyboardType,
        obscureText: widget.obscureText,
        textDirection: _direction,
        maxLength: widget.maxLength,
        minLines: widget.minLines,
        maxLines: widget.obscureText ? 1 : widget.maxLines,
        autofillHints: widget.autofillHints,
        textCapitalization: widget.textCapitalization,
        autocorrect: widget.autocorrect,
        enableSuggestions: widget.enableSuggestions,
        enabled: widget.enabled,
        readOnly: widget.readOnly,
        validator: widget.validator == null
            ? null
            : (v) => widget.validator!(v ?? ''),
        onChanged: _changed,
        onFieldSubmitted: widget.onSubmitted,
        onTap: widget.onTap,
        textInputAction: widget.textInputAction,
      ),
    );
  }
}

/// SearchField's clear button, as the web's: a 20 circle of the neutral fill
/// with a 12 cross in the muted colour, 8 from the field's end and 8 from its
/// text. A hover steps the fill in 100ms; a press shrinks it to 0.93. While
/// the field is empty it keeps its place, hidden, so the text does not move
/// when it shows; and it is out of the tab order, as React Aria's is.
class _ClearButton extends StatefulWidget {
  const _ClearButton({
    required this.shown,
    required this.enabled,
    required this.faded,
    required this.onPressed,
  });

  final bool shown;
  final bool enabled;
  final bool faded;
  final VoidCallback onPressed;

  @override
  State<_ClearButton> createState() => _ClearButtonState();
}

class _ClearButtonState extends State<_ClearButton> {
  bool _hovered = false;
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final ink = dibaFieldInk(context);
    final live = widget.shown && widget.enabled;
    Widget circle = AnimatedScale(
      scale: _pressed ? 0.93 : 1,
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOutQuart,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 100),
        curve: Curves.easeOut,
        width: 20,
        height: 20,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: _hovered && live ? ink.fillHover : ink.fill,
        ),
        child: DibaGlyphMark(
          DibaGlyph.close,
          size: 12,
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        ),
      ),
    );
    if (widget.faded) circle = Opacity(opacity: 0.5, child: circle);
    void press(bool down) {
      if (_pressed != down) setState(() => _pressed = down);
    }

    return Padding(
      padding: const EdgeInsetsDirectional.only(start: 4, end: 8),
      child: Visibility(
        visible: widget.shown,
        maintainState: true,
        maintainAnimation: true,
        maintainSize: true,
        child: Semantics(
          button: true,
          enabled: live,
          label: DibaStrings.of(context).clear,
          onTap: live ? widget.onPressed : null,
          excludeSemantics: true,
          child: MouseRegion(
            cursor: live ? SystemMouseCursors.click : MouseCursor.defer,
            onEnter: (_) => setState(() => _hovered = true),
            onExit: (_) => setState(() => _hovered = false),
            child: GestureDetector(
              onTapDown: live ? (_) => press(true) : null,
              onTapUp: live ? (_) => press(false) : null,
              onTapCancel: live ? () => press(false) : null,
              onTap: live ? widget.onPressed : null,
              child: circle,
            ),
          ),
        ),
      ),
    );
  }
}
