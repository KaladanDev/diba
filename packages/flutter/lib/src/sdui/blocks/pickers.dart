import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../tokens.g.dart';
import '../field.dart';
import '../glyphs.dart';
import '../guards.dart';
import '../node.dart';
import '../placement.dart';
import '../ring.dart';
import '../strings.dart';
import 'common.dart';

/// Group 3: Select, ComboBox, ListBox, Dropdown, and their items and sections,
/// drawn as the web's: a select's and a combo box's field is a text
/// field's, and every menu is the web's popover of rows. A chosen
/// option in a menu is highlighted where the web had a tick; a list on a
/// page keeps its radio or checkbox.

/// An option, a section's heading, or a combo box's empty message.
class _Option {
  const _Option.item(DibaItem this.item, {required this.group})
    : title = null,
      empty = false;
  const _Option.heading(String this.title, {required this.group})
    : item = null,
      empty = false;
  const _Option.empty(String this.title)
    : item = null,
      group = -1,
      empty = true;

  final DibaItem? item;
  final String? title;

  /// Options of one section share a group; a list sets one group apart from
  /// the next, and runs a section's options together, as the web's does.
  final int group;
  final bool empty;

  bool get isHeading => item == null;
  String get id => item?.id ?? '';
  String get text => item == null ? title! : dibaItemText(item!);
}

/// Items in order, with each section's title before its items.
List<_Option> _options(
  List<DibaItem> items,
  String itemType,
  String sectionType,
) {
  final out = <_Option>[];
  var group = 0;
  for (final child in items) {
    if (child.type == itemType && child.id != null) {
      out.add(_Option.item(child, group: group++));
    } else if (child.type == sectionType) {
      final section = group++;
      final title = child.prop<String>('title');
      if (title != null) out.add(_Option.heading(title, group: section));
      for (final inner in child.items) {
        if (inner.type == itemType && inner.id != null) {
          out.add(_Option.item(inner, group: section));
        }
      }
    }
  }
  return out;
}

/// The web's measures for a list and its rows.
const double _rowMinHeight = 36;
const double _rowRadius = 16;

/// Across a row: 10 in a popover's menu, 8 in a list on a page.
const double _menuRowPad = 10;
const double _pageRowPad = 8;

/// Round a menu's rows, and round a list's on a page.
const double _menuPad = 6;
const double _pagePad = 4;

/// Between one group and the next: 4 in a list box, 2 in a dropdown's menu.
const double _listGap = 4;
const double _menuGap = 2;

/// A popover's corners, and its distance from its trigger.
const double _panelRadius = 24;
const double _panelGap = 8;

/// An option's picture: its icon, 16 in the text colour, or its image, 24
/// with 6 round its corners, under the Image block's URL rule.
Widget? _leading(BuildContext context, DibaItem item) {
  final icon = dibaItemIcon(
    item,
    size: 16,
    colour: Theme.of(context).colorScheme.onSurface,
  );
  if (icon != null) return icon;
  final src = item.prop<String>('image');
  if (src == null || !isSafeImageUrl(src)) return null;
  return ClipRRect(
    borderRadius: BorderRadius.circular(6),
    child: Image.network(
      src,
      width: 24,
      height: 24,
      fit: BoxFit.cover,
      errorBuilder: (_, _, _) => const SizedBox.square(dimension: 24),
    ),
  );
}

Color? _danger(BuildContext context, DibaItem item) =>
    item.prop<String>('variant') == 'danger'
    ? Theme.of(context).colorScheme.error
    : null;

/// A row's label: 14 on a 20 line, medium, in the text colour or [colour].
TextStyle _labelStyle(BuildContext context, Color? colour) => TextStyle(
  fontSize: DibaFontSize.sm,
  height: 20 / 14,
  fontWeight: FontWeight.w500,
  leadingDistribution: TextLeadingDistribution.even,
  letterSpacing: 0,
  color: colour ?? Theme.of(context).colorScheme.onSurface,
);

/// A row's description, and a section's heading: 12 on a 16 line, muted.
TextStyle _noteStyle(BuildContext context, {bool heading = false}) => TextStyle(
  fontSize: DibaFontSize.xs,
  height: 16 / 12,
  fontWeight: heading ? FontWeight.w500 : FontWeight.w400,
  leadingDistribution: TextLeadingDistribution.even,
  letterSpacing: 0,
  color: Theme.of(context).colorScheme.onSurfaceVariant,
);

/// A chosen option in a menu is the neutral fill, as Flutter's menu marked
/// its choice; an option under the pointer half of it, so the two never look
/// alike. On a page a hovered row is the whole fill, the web's; its radio or
/// checkbox says what is chosen.
Color _hoverFill(BuildContext context, {required bool menu}) {
  final fill = dibaFieldInk(context).fill;
  return menu ? fill.withValues(alpha: fill.a * 0.5) : fill;
}

/// A section's heading: 6 above, 4 below, 8 across.
Widget _heading(BuildContext context, String title) => Semantics(
  header: true,
  child: Padding(
    padding: const EdgeInsetsDirectional.fromSTEB(8, 6, 8, 4),
    child: Text(title, style: _noteStyle(context, heading: true)),
  ),
);

/// Options as the web lays a list out: a section's options together under
/// its heading, and [gap] between one group and the next.
Widget _column(
  BuildContext context,
  List<_Option> options,
  Widget Function(_Option option) row, {
  required double gap,
}) {
  final children = <Widget>[];
  int? last;
  for (final option in options) {
    if (last != null && option.group != last) {
      children.add(SizedBox(height: gap));
    }
    last = option.group;
    children.add(
      option.empty
          ? _emptyNote(context, option.text)
          : option.isHeading
          ? _heading(context, option.text)
          : row(option),
    );
  }
  return Column(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: children,
  );
}

/// What an empty list says: 8 above and below and 12 across, at 70%.
Widget _emptyNote(BuildContext context, String text) => Padding(
  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
  child: Opacity(
    opacity: 0.7,
    child: Text(
      text,
      style: _labelStyle(context, null).copyWith(fontWeight: FontWeight.w400),
    ),
  ),
);

/// A menu's popover, as the web's: the overlay's surface and shadow, 24 round
/// its corners, its options 6 in, scrolling when it runs out of room.
Widget _menuPanel(BuildContext context, Widget list) => DecoratedBox(
  decoration: DibaTheme.overlay(
    dark: Theme.of(context).brightness == Brightness.dark,
    radius: _panelRadius,
  ),
  child: ClipRRect(
    borderRadius: BorderRadius.circular(_panelRadius),
    child: SingleChildScrollView(
      padding: const EdgeInsets.all(_menuPad),
      child: list,
    ),
  ),
);

/// Several choices in one line, joined as the web's Intl.ListFormat joins
/// them: «الف و ب», «الف،\u200F ب، و ج»; "A and B", "A, B, and C".
String _joined(List<String> words, {required bool persian}) {
  if (words.length < 2) return words.join();
  final head = words.sublist(0, words.length - 1);
  if (persian) {
    return words.length == 2
        ? '${words[0]} و ${words[1]}'
        : '${head.join('،\u200F ')}، و ${words.last}';
  }
  return words.length == 2
      ? '${words[0]} and ${words[1]}'
      : '${head.join(', ')}, and ${words.last}';
}

/// The chevron at a select's or a combo box's end: 16 in the placeholder
/// colour, 8 from the edge, the text 28 from it; turned over while its menu
/// is open.
Widget _chevron(
  BuildContext context, {
  required bool open,
  bool faded = false,
}) {
  final ink = dibaFieldInk(context).placeholder;
  return Padding(
    padding: const EdgeInsetsDirectional.only(end: 8),
    child: AnimatedRotation(
      turns: open ? 0.5 : 0,
      duration: const Duration(milliseconds: 150),
      curve: Curves.ease,
      child: DibaGlyphMark(
        DibaGlyph.chevronDown,
        size: 16,
        color: faded ? dibaHalf(ink) : ink,
      ),
    ),
  );
}

/// A row of a menu or a list, as the web's list-box and menu items: at least
/// 36 tall, 16 round its corners, 6 above and below and [pad] across; its
/// picture 12 before its words; the label 14 on a 20 line, medium, and its
/// description under it, 12 on 16, muted. A [marker], a list's radio or
/// checkbox, sits 12 from the start and the words 40. A chosen row in a menu
/// is the neutral fill; a hovered one is [hover]; a press shrinks it to 0.98;
/// a disabled one is at half; keyboard focus rings it, and so does a combo
/// box's option under the arrow keys ([highlighted]).
class _Row extends StatefulWidget {
  const _Row({
    required this.label,
    required this.hover,
    required this.onPressed,
    this.description,
    this.leading,
    this.marker,
    this.colour,
    this.enabled = true,
    this.chosen = false,
    this.highlighted = false,
    this.pad = _menuRowPad,
    this.autofocus = false,
    this.checked,
    this.exclusive = false,
    this.markerStart = 12,
    this.wordsStart = 40,
  });

  final String label;
  final String? description;
  final Widget? leading;
  final Widget? marker;
  final Color? colour;
  final bool enabled;
  final bool chosen;
  final bool highlighted;
  final Color hover;
  final double pad;
  final bool autofocus;

  /// A marked row says it is checked, in a group of one choice or of several.
  final bool? checked;
  final bool exclusive;
  final VoidCallback onPressed;

  /// Where a [marker] sits from the start, and the words with one: a list's
  /// radio or checkbox 12 and 40, a menu's tick 8 and 28.
  final double markerStart;
  final double wordsStart;

  @override
  State<_Row> createState() => _RowState();
}

class _RowState extends State<_Row> {
  final FocusNode _node = FocusNode();
  bool _hovered = false;
  bool _focused = false;
  bool _pressed = false;

  /// The option a menu opens on takes the focus, as React Aria's does:
  /// Flutter's autofocus does nothing while the trigger still holds it.
  @override
  void initState() {
    super.initState();
    if (widget.autofocus) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _node.requestFocus();
      });
    }
  }

  @override
  void dispose() {
    _node.dispose();
    super.dispose();
  }

  void _press(bool down) {
    if (_pressed != down) setState(() => _pressed = down);
  }

  @override
  Widget build(BuildContext context) {
    final live = widget.enabled;
    final fill = widget.chosen
        ? dibaFieldInk(context).fill
        : _hovered && live
        ? widget.hover
        : null;
    final words = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.label, style: _labelStyle(context, widget.colour)),
        if (widget.description != null)
          Text(widget.description!, style: _noteStyle(context)),
      ],
    );
    Widget content = Padding(
      padding: EdgeInsetsDirectional.fromSTEB(
        widget.marker == null ? widget.pad : widget.wordsStart,
        6,
        widget.pad,
        6,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (widget.leading != null) ...[
            widget.leading!,
            const SizedBox(width: 12),
          ],
          Flexible(child: words),
        ],
      ),
    );
    if (widget.marker != null) {
      content = Stack(
        alignment: AlignmentDirectional.centerStart,
        children: [
          content,
          PositionedDirectional(
            start: widget.markerStart,
            child: widget.marker!,
          ),
        ],
      );
    }
    const shape = RoundedRectangleBorder(
      borderRadius: BorderRadius.all(Radius.circular(_rowRadius)),
    );
    Widget row = AnimatedScale(
      scale: _pressed ? 0.98 : 1,
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOutQuart,
      child: CustomPaint(
        foregroundPainter:
            (_focused && dibaKeyboardFocus()) || widget.highlighted
            ? DibaRingPainter.of(context, shape)
            : null,
        child: DecoratedBox(
          decoration: ShapeDecoration(
            shape: shape,
            color: fill ?? const Color(0x00000000),
          ),
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: _rowMinHeight),
            child: Align(
              alignment: AlignmentDirectional.centerStart,
              widthFactor: 1,
              child: content,
            ),
          ),
        ),
      ),
    );
    if (!live) row = Opacity(opacity: 0.5, child: row);
    return Semantics(
      container: true,
      button: widget.checked == null,
      selected: widget.chosen,
      checked: widget.checked,
      inMutuallyExclusiveGroup: widget.exclusive,
      enabled: live,
      // Hover from its own MouseRegion: FocusableActionDetector shows a hover
      // only once Flutter has announced a mouse, which it does not when the
      // first mouse event comes after the row is built.
      child: FocusableActionDetector(
        focusNode: _node,
        enabled: live,
        onFocusChange: (on) => setState(() => _focused = on),
        actions: {
          ActivateIntent: CallbackAction<ActivateIntent>(
            onInvoke: (_) {
              widget.onPressed();
              return null;
            },
          ),
        },
        child: MouseRegion(
          cursor: live ? SystemMouseCursors.click : MouseCursor.defer,
          onEnter: (_) => setState(() => _hovered = true),
          onExit: (_) => setState(() => _hovered = false),
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTapDown: live ? (_) => _press(true) : null,
            onTapUp: live ? (_) => _press(false) : null,
            onTapCancel: live ? () => _press(false) : null,
            onTap: live ? widget.onPressed : null,
            child: row,
          ),
        ),
      ),
    );
  }
}

/// A menu's row for [option], chosen or not.
Widget _menuRow(
  BuildContext context,
  _Option option, {
  required bool chosen,
  required VoidCallback onPressed,
  bool autofocus = false,
  bool highlighted = false,
}) {
  final item = option.item!;
  return _Row(
    label: option.text,
    description: item.prop<String>('description'),
    leading: _leading(context, item),
    colour: _danger(context, item),
    enabled: !item.flag('isDisabled'),
    chosen: chosen,
    highlighted: highlighted,
    hover: _hoverFill(context, menu: true),
    autofocus: autofocus,
    onPressed: onPressed,
  );
}

/// A select: a text field's box showing the choice (its icon too, when it
/// has one) or the choices, which opens the web's menu of options.
class _Select extends StatefulWidget {
  const _Select({required this.node, required this.options, this.error});

  final DibaNodeContext node;
  final List<_Option> options;
  final String? error;

  @override
  State<_Select> createState() => _SelectState();
}

class _SelectState extends State<_Select> {
  final FocusNode _focus = FocusNode();
  bool _open = false;
  bool _hovered = false;
  bool _focused = false;

  @override
  void dispose() {
    _focus.dispose();
    super.dispose();
  }

  bool get _multiple =>
      widget.node.str('selectionMode', 'single') == 'multiple';

  Set<String> _chosen(DibaNodeContext node) => _multiple
      ? dibaKeys(node.current).toSet()
      : {if (node.current is String) node.current as String};

  @override
  Widget build(BuildContext context) {
    final node = widget.node;
    final disabled = node.flag('isDisabled');
    final live = !disabled && !node.flag('isReadOnly');
    final chosen = _chosen(node);
    final picked = [
      for (final o in widget.options)
        if (!o.isHeading && chosen.contains(o.id)) o,
    ];
    final shown = _joined([
      for (final o in picked) o.text,
    ], persian: node.isPersian);
    final icon = !_multiple && picked.isNotEmpty
        ? _leading(context, picked.first.item!)
        : null;

    return DibaPlacedPanel(
      placement: const DibaPlacement('bottom', 'start'),
      modal: false,
      bare: true,
      matchAnchorWidth: true,
      anchorHeight: dibaFieldHeight(context),
      gap: _panelGap,
      onOpenChange: (open) {
        if (mounted) setState(() => _open = open);
      },
      trigger: (context, toggle) {
        final open = live ? toggle : () {};
        Widget box = InputDecorator(
          decoration: dibaDecoration(
            context,
            node,
            errorText: widget.error,
            // The choice's icon 12 from the start and 8 before its words.
            prefixIcon: icon == null
                ? null
                : Padding(
                    padding: const EdgeInsetsDirectional.only(
                      start: 12,
                      end: 4,
                    ),
                    child: disabled ? Opacity(opacity: 0.5, child: icon) : icon,
                  ),
            suffixIcon: _chevron(context, open: _open, faded: disabled),
          ).copyWith(enabled: !disabled),
          isEmpty: shown.isEmpty,
          isHovering: _hovered && !disabled,
          baseStyle: dibaFieldText(context, disabled: disabled),
          child: Text(
            shown,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: dibaFieldText(context, disabled: disabled),
          ),
        );
        // Keyboard focus rings the field's box, as the web's
        // `status-focused` does, and not the notes under it.
        box = CustomPaint(
          foregroundPainter: _focused && dibaKeyboardFocus()
              ? DibaRingPainter.of(
                  context,
                  const RoundedRectangleBorder(
                    borderRadius: BorderRadius.all(
                      Radius.circular(DibaRadius.md),
                    ),
                  ),
                  height: dibaFieldHeight(context),
                )
              : null,
          child: box,
        );
        return Semantics(
          button: true,
          enabled: !disabled,
          expanded: _open,
          label: node.prop<String>('label'),
          value: shown.isEmpty ? node.prop<String>('placeholder') : shown,
          onTap: live ? open : null,
          excludeSemantics: true,
          child: FocusableActionDetector(
            focusNode: _focus,
            enabled: !disabled,
            mouseCursor: live
                ? SystemMouseCursors.click
                : SystemMouseCursors.basic,
            onFocusChange: (on) => setState(() => _focused = on),
            shortcuts: const {
              SingleActivator(LogicalKeyboardKey.arrowDown): ActivateIntent(),
              SingleActivator(LogicalKeyboardKey.arrowUp): ActivateIntent(),
            },
            actions: {
              ActivateIntent: CallbackAction<ActivateIntent>(
                onInvoke: (_) {
                  open();
                  return null;
                },
              ),
            },
            child: MouseRegion(
              onEnter: (_) => setState(() => _hovered = true),
              onExit: (_) => setState(() => _hovered = false),
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: live
                    ? () {
                        _focus.requestFocus();
                        open();
                      }
                    : null,
                child: box,
              ),
            ),
          ),
        );
      },
      panel: (context, close) => node.live((context, fresh) {
        final now = _chosen(fresh);
        // Focus goes to the choice, or to the first option that takes it.
        final target =
            widget.options
                .where((o) => !o.isHeading && now.contains(o.id))
                .firstOrNull ??
            widget.options
                .where((o) => !o.isHeading && !o.item!.flag('isDisabled'))
                .firstOrNull;
        return _menuPanel(
          context,
          IntrinsicWidth(
            child: _column(
              context,
              widget.options,
              (o) => _menuRow(
                context,
                o,
                chosen: now.contains(o.id),
                autofocus: identical(o, target),
                onPressed: () {
                  if (_multiple) {
                    final next = {...now};
                    next.contains(o.id) ? next.remove(o.id) : next.add(o.id);
                    // In the order the options are listed.
                    fresh.setValue('onSelectionChange', [
                      for (final x in widget.options)
                        if (!x.isHeading && next.contains(x.id)) x.id,
                    ]);
                  } else {
                    fresh.setValue('onSelectionChange', o.id);
                    close();
                    _focus.requestFocus();
                  }
                },
              ),
              gap: _listGap,
            ),
          ),
        );
      }),
    );
  }
}

final Map<String, DibaBuilder> pickerBlocks = {
  'Select': (context, node) {
    final options = _options(node.items, 'ListBoxItem', 'ListBoxSection');
    final strings = DibaStrings.of(context);
    final multiple = node.str('selectionMode', 'single') == 'multiple';
    return DibaValidated(
      validator: () {
        if (!node.flag('isRequired')) return null;
        final none = multiple
            ? dibaKeys(node.current).isEmpty
            : node.current is! String;
        return none ? strings.required : null;
      },
      builder: (error) => dibaFieldFrame(
        node,
        _Select(node: node, options: options, error: error),
      ),
    );
  },

  /// Composed on RawAutocomplete. DropdownMenu, the spec's first answer, has
  /// no empty state to put `emptyMessage` in and always opens on tap, so
  /// `menuTrigger: input` could not differ from `focus`.
  'ComboBox': (context, node) {
    final options = _options(node.items, 'ListBoxItem', 'ListBoxSection');
    final selected = node.current is String ? node.current as String : null;
    final input = node.pair('inputValue', 'defaultInputValue', facet: 'input');
    final strings = DibaStrings.of(context);
    return DibaValidated(
      validator: () {
        if (!node.flag('isRequired')) return null;
        final text = input is String ? input : '';
        if (selected != null) return null;
        if (node.flag('allowsCustomValue') && text.isNotEmpty) return null;
        return strings.required;
      },
      builder: (error) => dibaFieldFrame(
        node,
        _ComboBox(
          node: node,
          options: [
            for (final o in options)
              if (!o.isHeading) o,
          ],
          selected: selected,
          inputText: input is String
              ? input
              : options
                        .where((o) => !o.isHeading && o.id == selected)
                        .map((o) => o.text)
                        .firstOrNull ??
                    '',
          errorText: error,
        ),
      ),
    );
  },

  /// A list on the page, as the web's: its rows 4 in, a radio or a checkbox
  /// at each one's start when it takes a choice or several.
  'ListBox': (context, node) {
    final options = _options(node.items, 'ListBoxItem', 'ListBoxSection');
    final mode = node.str('selectionMode', 'single');
    final selected = dibaKeys(node.current).toSet();
    final empty = node.prop<String>('emptyMessage');

    Widget row(_Option option) {
      final item = option.item!;
      final on = selected.contains(option.id);
      // The marker shows the choice, in its own colours; the row takes the
      // press and says what it is, and fades as a whole when disabled.
      final marker = switch (mode) {
        'multiple' => _marker(Checkbox(value: on, onChanged: (_) {})),
        'single' => _marker(Radio<String>(value: option.id)),
        _ => null,
      };
      return _Row(
        label: option.text,
        description: item.prop<String>('description'),
        leading: _leading(context, item),
        marker: marker,
        colour: _danger(context, item),
        enabled: !item.flag('isDisabled'),
        hover: _hoverFill(context, menu: false),
        pad: _pageRowPad,
        checked: mode == 'none' ? null : on,
        exclusive: mode == 'single',
        onPressed: () => switch (mode) {
          'multiple' => node.setValue('onSelectionChange', [
            for (final o in options)
              if (!o.isHeading &&
                  (o.id == option.id ? !on : selected.contains(o.id)))
                o.id,
          ]),
          'single' => node.setValue('onSelectionChange', [option.id]),
          _ => node.fire('onAction', option.id),
        },
      );
    }

    Widget list = Padding(
      padding: const EdgeInsets.all(_pagePad),
      child: options.isEmpty && empty != null
          ? _emptyNote(context, empty)
          : _column(context, options, row, gap: _listGap),
    );
    if (mode == 'single') {
      list = RadioGroup<String>(
        groupValue: selected.firstOrNull,
        onChanged: (_) {},
        child: list,
      );
    }
    // The label is never drawn: a heading is a Text block. IntrinsicWidth so
    // a list is as wide as its rows, as the web's inline list is.
    return Semantics(
      label: node.prop<String>('label'),
      container: true,
      child: Align(
        alignment: AlignmentDirectional.centerStart,
        widthFactor: 1,
        child: IntrinsicWidth(child: list),
      ),
    );
  },

  /// Read by Select, ComboBox and ListBox as data.
  'ListBoxItem': (context, node) => const SizedBox.shrink(),
  'ListBoxSection': (context, node) => const SizedBox.shrink(),

  'Dropdown': (context, node) {
    final trigger = node.slots['trigger'];
    if (trigger == null) {
      node.refuse('no trigger');
      return const SizedBox.shrink();
    }
    final options = _options(node.items, 'DropdownItem', 'DropdownSection');
    final mode = node.str('selectionMode', 'none');
    final width = MediaQuery.sizeOf(context).width;

    // At its trigger's own width, as the web's is, so its menu opens from the
    // trigger: a column stretched both, and the menu opened from its edge.
    return Align(
      alignment: AlignmentDirectional.centerStart,
      widthFactor: 1,
      child: DibaPlacedPanel(
        placement: DibaPlacement.parse(
          node.prop<String>('placement'),
          const DibaPlacement('bottom', 'end'),
        ),
        modal: false,
        bare: true,
        gap: _panelGap,
        // The web's: at least 220 wide from 768, at most half the window.
        minWidth: width >= 768 ? 220 : 0,
        maxWidth: width * 0.48,
        trigger: (context, toggle) => dibaTrigger(trigger, toggle),
        panel: (context, close) => node.overlay(
          close: close,
          child: node.live((context, fresh) {
            final now = dibaKeys(fresh.current).toSet();
            final first = options
                .where((o) => !o.isHeading && !o.item!.flag('isDisabled'))
                .firstOrNull;
            return _menuPanel(
              context,
              IntrinsicWidth(
                child: _column(
                  context,
                  options,
                  (o) => _menuRow(
                    context,
                    o,
                    chosen: mode != 'none' && now.contains(o.id),
                    autofocus: identical(o, first),
                    onPressed: () {
                      switch (mode) {
                        case 'multiple':
                          final next = {...now};
                          next.contains(o.id)
                              ? next.remove(o.id)
                              : next.add(o.id);
                          fresh.setValue('onSelectionChange', [
                            for (final x in options)
                              if (!x.isHeading && next.contains(x.id)) x.id,
                          ]);
                        case 'single':
                          fresh.setValue('onSelectionChange', [o.id]);
                          close();
                        default:
                          close();
                          fresh.fire('onAction', o.id);
                      }
                    },
                  ),
                  gap: _menuGap,
                ),
              ),
            );
          }),
        ),
      ),
    );
  },

  /// A Dropdown's menu standing on the page, the web's: 4 in, its
  /// rows a list's, 8 across and 4 apart, a section's rows together under its
  /// heading; a hovered row the whole fill. A choice is the web's tick, muted,
  /// 8 from the row's start with the words 28 in, as the Menu's look was
  /// picked; a dropdown's highlights its choice instead.
  'Menu': (context, node) {
    final options = _options(node.items, 'DropdownItem', 'DropdownSection');
    final mode = node.str('selectionMode', 'none');
    return Semantics(
      label: node.prop<String>('label'),
      container: true,
      child: node.live((context, fresh) {
        final now = dibaKeys(fresh.current).toSet();
        return Padding(
          padding: const EdgeInsets.all(_pagePad),
          child: _column(context, options, (o) {
            final item = o.item!;
            final chosen = mode != 'none' && now.contains(o.id);
            return _Row(
              label: o.text,
              description: item.prop<String>('description'),
              leading: _leading(context, item),
              colour: _danger(context, item),
              enabled: !item.flag('isDisabled'),
              hover: _hoverFill(context, menu: false),
              pad: _pageRowPad,
              marker: mode == 'none' ? null : _tick(context, chosen),
              markerStart: 8,
              wordsStart: 28,
              checked: mode == 'none' ? null : chosen,
              exclusive: mode == 'single',
              onPressed: () {
                switch (mode) {
                  case 'multiple':
                    final next = {...now};
                    next.contains(o.id) ? next.remove(o.id) : next.add(o.id);
                    fresh.setValue('onSelectionChange', [
                      for (final x in options)
                        if (!x.isHeading && next.contains(x.id)) x.id,
                    ]);
                  case 'single':
                    fresh.setValue('onSelectionChange', [o.id]);
                  default:
                    fresh.fire('onAction', o.id);
                }
              },
            );
          }, gap: _listGap),
        );
      }),
    );
  },

  /// Read by Dropdown and Menu as data.
  'DropdownItem': (context, node) => const SizedBox.shrink(),
  'DropdownSection': (context, node) => const SizedBox.shrink(),
};

/// A menu's tick: Lucide's check filling a 16 square, muted, shown only on a
/// chosen row, as the web's. The original's was a 10
/// one in that square, too small to read.
Widget _tick(BuildContext context, bool shown) => SizedBox.square(
  dimension: 16,
  child: shown
      ? Icon(
          LucideIcons.check,
          size: 16,
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        )
      : null,
);

/// A list's radio or checkbox, in an 18 square, drawn and not pressed: the
/// row takes the press.
Widget _marker(Widget control) => ExcludeFocus(
  child: IgnorePointer(
    child: ExcludeSemantics(
      child: SizedBox.square(
        dimension: 18,
        child: OverflowBox(
          maxWidth: double.infinity,
          maxHeight: double.infinity,
          child: control,
        ),
      ),
    ),
  ),
);

class _ComboBox extends StatefulWidget {
  const _ComboBox({
    required this.node,
    required this.options,
    required this.selected,
    required this.inputText,
    required this.errorText,
  });

  final DibaNodeContext node;
  final List<_Option> options;
  final String? selected;
  final String inputText;
  final String? errorText;

  @override
  State<_ComboBox> createState() => _ComboBoxState();
}

class _ComboBoxState extends State<_ComboBox> {
  late final TextEditingController _controller = TextEditingController(
    text: widget.inputText,
  );
  final FocusNode _focus = FocusNode();
  final GlobalKey _field = GlobalKey();

  /// Whether the merchant has typed since the field took focus, or opened
  /// the menu with its chevron — what `menuTrigger: input` waits for.
  bool _typed = false;

  /// Opened by the chevron, or by focus: every option while the field still
  /// says this, as React Aria opens it; once the merchant types, the list
  /// narrows. Held as the text, not a flag, because RawAutocomplete asks for
  /// options before the field's onChanged runs.
  String? _allWhile;

  @override
  void initState() {
    super.initState();
    _focus.addListener(() {
      if (_focus.hasFocus) {
        // Opened by its chevron, or by focus with `menuTrigger: focus`: every
        // option, as React Aria opens it, whatever the field says; the list
        // narrows once the merchant types. A filled field had shown its own
        // option alone.
        _typed = _byChevron;
        if (_byChevron || widget.node.str('menuTrigger', 'input') == 'focus') {
          _allWhile = _controller.text;
          _ask();
        }
        _byChevron = false;
      } else {
        _allWhile = null;
      }
      if (!_focus.hasFocus && !widget.node.flag('allowsCustomValue')) {
        // Without custom values, leaving puts the chosen item's text back.
        final label = widget.options
            .where((o) => o.id == widget.selected)
            .map((o) => o.text)
            .firstOrNull;
        if (_controller.text != (label ?? '')) _controller.text = label ?? '';
      }
      if (mounted) setState(() {});
    });
  }

  @override
  void didUpdateWidget(_ComboBox old) {
    super.didUpdateWidget(old);
    if (widget.node.isPinned('inputValue') &&
        _controller.text != widget.inputText) {
      _controller.text = widget.inputText;
    }
  }

  @override
  void dispose() {
    _focus.dispose();
    _controller.dispose();
    super.dispose();
  }

  /// The chevron opens the whole list, as the web's does, whatever
  /// `menuTrigger` says. RawAutocomplete asks for options only when the text
  /// changes, so the text is changed and put back.
  void _openAll() {
    if (!_focus.hasFocus) {
      // The focus listener opens it, once the focus has come.
      _byChevron = true;
      _focus.requestFocus();
      return;
    }
    _typed = true;
    _allWhile = _controller.text;
    _ask();
  }

  /// Opened by the chevron, waiting for the focus it asked for.
  bool _byChevron = false;

  /// Asks RawAutocomplete for its options again: it asks only when the text
  /// changes, so the text is changed and put back.
  void _ask() {
    final value = _controller.value;
    _controller.value = value.copyWith(text: '${value.text} ');
    _controller.value = value;
  }

  @override
  Widget build(BuildContext context) {
    final node = widget.node;
    final empty = node.prop<String>('emptyMessage');
    final onInput = node.flag('isReadOnly') || node.flag('isDisabled');
    return RawAutocomplete<_Option>(
      textEditingController: _controller,
      focusNode: _focus,
      displayStringForOption: (o) => o.text,
      optionsBuilder: (value) {
        if (onInput) return const [];
        if (node.str('menuTrigger', 'input') == 'input' && !_typed) {
          return const [];
        }
        final query = value.text == _allWhile
            ? ''
            : value.text.trim().toLowerCase();
        final matches = widget.options
            .where((o) => query.isEmpty || o.text.toLowerCase().contains(query))
            .toList();
        // RawAutocomplete hides its list when there are no options, so the
        // empty message rides along as one that cannot be chosen.
        if (matches.isEmpty && empty != null) return [_Option.empty(empty)];
        return matches;
      },
      onSelected: (option) {
        if (option.isHeading) return;
        node.setValue('onSelectionChange', option.id);
        node.setValue('onInputChange', option.text, facet: 'input');
      },
      fieldViewBuilder: (context, controller, focusNode, onSubmit) =>
          TextFormField(
            key: _field,
            controller: controller,
            focusNode: focusNode,
            readOnly: node.flag('isReadOnly'),
            enabled: !node.flag('isDisabled'),
            style: dibaFieldText(context, disabled: node.flag('isDisabled')),
            decoration: dibaDecoration(
              context,
              node,
              errorText: widget.errorText,
              suffixIcon: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: onInput ? null : _openAll,
                child: MouseRegion(
                  cursor: onInput
                      ? MouseCursor.defer
                      : SystemMouseCursors.click,
                  child: _chevron(
                    context,
                    open: _focus.hasFocus && _typed,
                    faded: node.flag('isDisabled'),
                  ),
                ),
              ),
            ),
            onChanged: (text) {
              setState(() {
                _typed = true;
                _allWhile = null;
              });
              node.setValue('onInputChange', text, facet: 'input');
            },
            onFieldSubmitted: (_) => onSubmit(),
          ),
      optionsViewBuilder: (context, onSelected, options) {
        final list = options.toList();
        final highlighted = AutocompleteHighlightedOption.of(context);
        // RawAutocomplete hangs the menu under the whole field, its notes
        // too; the web's is 8 under the field's box.
        final field = _field.currentContext?.findRenderObject() as RenderBox?;
        final fieldHeight = field != null && field.hasSize
            ? field.size.height
            : dibaFieldHeight(context);
        final lift = fieldHeight - dibaFieldHeight(context);
        return Transform.translate(
          offset: Offset(0, _panelGap - lift),
          child: SizedBox(
            width: double.infinity,
            child: _menuPanel(
              context,
              _column(
                context,
                list,
                (o) => _menuRow(
                  context,
                  o,
                  chosen: o.id == widget.selected,
                  highlighted: identical(list.elementAtOrNull(highlighted), o),
                  onPressed: () => onSelected(o),
                ),
                gap: _listGap,
              ),
            ),
          ),
        );
      },
    );
  }
}
