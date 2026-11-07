import 'dart:math' as math;
import 'dart:ui' show ImageFilter;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../tokens.g.dart';
import '../glyphs.dart';
import '../icons.dart';
import '../node.dart';
import '../oklab.dart';
import '../placement.dart';
import '../ring.dart';
import '../strings.dart';
import 'actions.dart';
import 'common.dart';

/// Group 6: Card, Table and its parts, Modal, AlertDialog, Popover, Form.
///
/// Drawn as Diba's web copy draws them: a card is the surface 24 round with
/// the web's soft shadow, a table the web's grey frame round a white body, a
/// dialog the web's overlay 24 round over its backdrop, at the bottom of a
/// phone and in the middle of anything wider, and a popover the same overlay
/// with the web's arrow. None of Material's own containers draw any of them.

/// Blocks a merchant can press or type into. A Card with an `href` may hold
/// none of them: a link inside a link is broken for keyboards and screen
/// readers.
const Set<String> _interactive = {
  // A trigger or a link in a slot, or links of its own; Drawer was
  // missing too.
  'Breadcrumbs',
  'Menu',
  'Sheet',
  'Drawer',
  'Button',
  'LinkButton',
  'Link',
  'ToggleButtonGroup',
  'TextField',
  'TextArea',
  'SearchField',
  'NumberField',
  'DateField',
  'Select',
  'ComboBox',
  'ListBox',
  'Dropdown',
  'Checkbox',
  'CheckboxGroup',
  'RadioGroup',
  'Switch',
  'Slider',
  'TagGroup',
  'Table',
  'Modal',
  'AlertDialog',
  'Popover',
  'Form',
};

bool _holdsInteractive(List<DibaItem> items) => items.any(
  (i) =>
      _interactive.contains(i.type) ||
      (i.type == 'Card' && i.props['href'] != null) ||
      (i.type == 'Alert' && i.props['isDismissible'] == true) ||
      _holdsInteractive(i.items),
);

/// The web's type: [size] on a [line] high line, the theme's face, none of
/// Material's letter spacing, the leading split above and below as CSS
/// splits it.
TextStyle _type(
  BuildContext context,
  double size,
  double line, {
  required Color colour,
  FontWeight weight = FontWeight.w400,
}) => Theme.of(context).textTheme.bodyMedium!.copyWith(
  fontSize: size,
  height: line / size,
  fontWeight: weight,
  color: colour,
  letterSpacing: 0,
  leadingDistribution: TextLeadingDistribution.even,
);

/// A card's, a dialog's and a popover's corners: the web's
/// `min(32px, --radius-3xl)`.
const double _surfaceRadius = 24;

/// Whether [context]'s theme is the dark one.
bool _dark(BuildContext context) =>
    Theme.of(context).brightness == Brightness.dark;

// ---------------------------------------------------------------------------
// Card

/// The web's card: 16 in, 12 between its header, content and
/// footer, 24 round, and the web's soft shadow in light; the surface, the
/// secondary or the tertiary surface by variant, or nothing at all for
/// transparent. A flush card has no padding and clips what it holds.
Widget _card(BuildContext context, DibaNodeContext node) {
  final scheme = Theme.of(context).colorScheme;
  final dark = _dark(context);
  final title = node.prop<String>('title');
  final description = node.prop<String>('description');
  final action = node.slots['action'];
  final footer = node.slots['footer'];
  final flush = node.flag('isFlush');
  final variant = node.str('variant', 'default');
  // On a grey card the muted text is a step stronger, so its notes keep
  // 4.5:1; the blocks in it read it as the theme's onSurfaceVariant, as the
  // web's read --muted.
  final muted = switch (variant) {
    'secondary' =>
      dark ? DibaDarkNeutrals.mutedSecondary : DibaLightNeutrals.mutedSecondary,
    'tertiary' =>
      dark ? DibaDarkNeutrals.mutedTertiary : DibaLightNeutrals.mutedTertiary,
    _ => scheme.onSurfaceVariant,
  };
  var href = node.prop<String>('href');
  if (href != null &&
      (action != null || footer != null || _holdsInteractive(node.items))) {
    // The surface refuses the link, not the content: the content is what
    // the author can see is missing.
    node.refuse(
      'href on a card holding something interactive; the link is dropped',
    );
    href = null;
  }

  final sections = <Widget>[
    if (title != null || description != null || action != null)
      Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (title != null)
                  Semantics(
                    header: true,
                    child: Text(
                      title,
                      style: _type(
                        context,
                        14,
                        24,
                        weight: FontWeight.w500,
                        colour: scheme.onSurface,
                      ),
                    ),
                  ),
                if (description != null)
                  Text(
                    description,
                    style: _type(context, 14, 20, colour: muted),
                  ),
              ],
            ),
          ),
          if (action != null) ...[const SizedBox(width: 12), action],
        ],
      ),
    if (node.children.isNotEmpty)
      Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: dibaSpaced(node.children, 4),
      ),
    if (footer != null) Row(children: [Flexible(child: footer)]),
  ];

  const radius = BorderRadius.all(Radius.circular(_surfaceRadius));
  Widget card = Padding(
    padding: EdgeInsets.all(flush ? 0 : 16),
    child: Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: dibaSpaced(sections, 12),
    ),
  );
  if (muted != scheme.onSurfaceVariant) {
    final theme = Theme.of(context);
    card = Theme(
      data: theme.copyWith(
        colorScheme: scheme.copyWith(onSurfaceVariant: muted),
      ),
      child: card,
    );
  }
  if (variant == 'secondary' || variant == 'tertiary') {
    card = DibaGreyPaper(child: card);
  }
  if (flush) card = ClipRRect(borderRadius: radius, child: card);
  card = DecoratedBox(
    decoration: BoxDecoration(
      color: switch (variant) {
        'secondary' => scheme.surfaceContainer,
        'tertiary' => scheme.surfaceContainerHighest,
        'transparent' => null,
        _ => scheme.surface,
      },
      borderRadius: radius,
      boxShadow: variant == 'transparent'
          ? null
          : DibaTheme.surfaceShadow(dark: dark),
    ),
    child: card,
  );
  if (href == null) return card;
  final link = href;
  return _LinkCard(
    onOpen: () => node.navigateTo(link),
    label: title,
    child: card,
  );
}

/// A card that opens something: the whole card is the link, the hand over
/// it, Enter opens it, and under keyboard focus Diba's ring stands round it,
/// as the web's link round a card does. It does not change under a hover or
/// a press: the web's does not.
class _LinkCard extends StatefulWidget {
  const _LinkCard({
    required this.onOpen,
    required this.label,
    required this.child,
  });

  final VoidCallback onOpen;
  final String? label;
  final Widget child;

  @override
  State<_LinkCard> createState() => _LinkCardState();
}

class _LinkCardState extends State<_LinkCard> {
  bool _focused = false;

  @override
  Widget build(BuildContext context) => Semantics(
    link: true,
    label: widget.label,
    child: FocusableActionDetector(
      mouseCursor: SystemMouseCursors.click,
      onFocusChange: (focused) => setState(() => _focused = focused),
      actions: {
        ActivateIntent: CallbackAction<ActivateIntent>(
          onInvoke: (_) {
            widget.onOpen();
            return null;
          },
        ),
      },
      child: GestureDetector(
        onTap: widget.onOpen,
        child: CustomPaint(
          foregroundPainter: _focused && dibaKeyboardFocus()
              ? DibaRingPainter.of(
                  context,
                  const RoundedRectangleBorder(
                    borderRadius: BorderRadius.all(
                      Radius.circular(_surfaceRadius),
                    ),
                  ),
                )
              : null,
          child: widget.child,
        ),
      ),
    ),
  );
}

// ---------------------------------------------------------------------------
// Table

/// A column's alignment, for its heading and its cells.
AlignmentGeometry _alignOf(DibaItem column) =>
    switch (column.prop<String>('align')) {
      'center' => Alignment.center,
      'end' => AlignmentDirectional.centerEnd,
      _ => AlignmentDirectional.centerStart,
    };

/// The web's table, drawn as the web lays one out.
///
/// Primary is a grey frame 20 round, 4 in at its sides and foot, holding the
/// head on the grey and the rows on a white body 16 round, each row a
/// hairline over the next; totals stand under the body on the grey. Secondary
/// has no frame: its head is a grey strip 16 round, and its rows lie on what
/// is under the table. A row the pointer is over lightens (darkens, on
/// secondary); a chosen one takes the brand at 8%; a disabled one fades to
/// half and answers nothing.
///
/// Columns share the width as a browser's table shares it: each takes what
/// its widest cell asks, and room left over goes to each in proportion to
/// that. A table its cells will not fit scrolls across.
class _TableView extends StatefulWidget {
  const _TableView(this.node);

  final DibaNodeContext node;

  @override
  State<_TableView> createState() => _TableViewState();
}

class _TableViewState extends State<_TableView> {
  /// The body row under the pointer, the sortable heading under it, and
  /// which of either holds keyboard focus, by index.
  int? _hoveredRow;
  int? _hoveredColumn;
  int? _focusedRow;
  int? _focusedColumn;

  void _hoverRow(int row, bool over) {
    if (over == (_hoveredRow == row)) return;
    setState(() => _hoveredRow = over ? row : null);
  }

  void _hoverColumn(int column, bool over) {
    if (over == (_hoveredColumn == column)) return;
    setState(() => _hoveredColumn = over ? column : null);
  }

  @override
  Widget build(BuildContext context) {
    final node = widget.node;
    DibaItem? part(String type) =>
        node.items.where((i) => i.type == type).firstOrNull;
    final columns = (part('TableHeader')?.items ?? const <DibaItem>[])
        .where((i) => i.type == 'Column')
        .toList();
    final rows = (part('TableBody')?.items ?? const <DibaItem>[])
        .where((i) => i.type == 'Row')
        .toList();
    final totals = (part('TableFooter')?.items ?? const <DibaItem>[])
        .where((i) => i.type == 'Row')
        .toList();
    if (node.prop<String>('label') == null) node.refuse('no label');
    if (columns.isEmpty) return const SizedBox.shrink();

    final scheme = Theme.of(context).colorScheme;
    final dark = _dark(context);
    final strings = DibaStrings.of(context);
    final rtl = Directionality.of(context) == TextDirection.rtl;
    final secondary = node.str('variant', 'primary') == 'secondary';
    final mode = node.str('selectionMode', 'none');
    final selecting = mode == 'single' || mode == 'multiple';
    final selected = dibaKeys(node.current).toSet();

    // Sorting is two flat value pairs. A press records both under one
    // local facet and reports them as {column, direction}.
    final localSort = node.local('sort');
    final pinnedSort = node.isPinned('sortColumn');
    final sortColumn = pinnedSort
        ? node.prop<String>('sortColumn')
        : localSort is Map
        ? localSort['column']
        : node.prop<String>('defaultSortColumn');
    final sortDirection = pinnedSort
        ? node.prop<String>('sortDirection')
        : localSort is Map
        ? localSort['direction']
        : node.prop<String>('defaultSortDirection');
    final ascending = sortDirection != 'descending';
    final hasRowAction = node.handlers.containsKey('onRowAction');

    final text = scheme.onSurface;
    final muted = scheme.onSurfaceVariant;
    final fill = dark ? DibaDarkNeutrals.fill : DibaLightNeutrals.fill;
    final rule = dark ? DibaDarkNeutrals.border : DibaLightNeutrals.border;
    final ring = dark ? DibaDarkColors.ring : DibaLightColors.ring;
    // `--separator-tertiary` at half, the line under each body row.
    final line = dibaMixOklab(
      scheme.surface,
      0.81,
      text,
      0.19,
    ).withValues(alpha: 0.5);
    final hoverFill = secondary
        ? fill.withValues(alpha: 0.5)
        : scheme.surface.withValues(alpha: 0.4);
    // Diba's chosen row: the brand at 8% over the surface, in sRGB.
    final chosenFill = Color.lerp(scheme.surface, scheme.primary, 0.08)!;
    final headStyle = _type(
      context,
      12,
      16,
      weight: FontWeight.w500,
      colour: muted,
    );
    final cellStyle = _type(context, 14, 20, colour: text);

    bool actionable(DibaItem row) =>
        hasRowAction || row.prop<String>('href') != null;

    void rowAction(DibaItem row) {
      node.fire('onRowAction', row.id);
      final href = row.prop<String>('href');
      if (href != null) node.navigateTo(href);
    }

    void select(String id, bool on) {
      final next = mode == 'single' ? <String>{} : {...selected};
      on ? next.add(id) : next.remove(id);
      node.setValue('onSelectionChange', next.toList());
    }

    // A press on a row: its action if it has one, else it is chosen or
    // cleared when the table chooses. The box chooses either way.
    void press(DibaItem row) {
      if (row.flag('isDisabled')) return;
      if (actionable(row)) {
        rowAction(row);
      } else if (selecting && row.id != null) {
        select(row.id!, !selected.contains(row.id));
      }
    }

    void sortBy(DibaItem column) {
      final up = !(column.id == sortColumn && ascending);
      node.setValue('onSortChange', {
        'column': column.id,
        'direction': up ? 'ascending' : 'descending',
      }, facet: 'sort');
    }

    final choosable = rows
        .where((r) => r.id != null && !r.flag('isDisabled'))
        .map((r) => r.id!)
        .toList();
    final allChosen =
        choosable.isNotEmpty && choosable.every(selected.contains);
    final noneChosen = !choosable.any(selected.contains);

    // The heading row: the box column's heading, then each column's, a rule
    // at the end of every one but the last.
    final headings = <Widget>[
      if (selecting)
        mode == 'multiple'
            ? _selectBox(
                value: allChosen
                    ? true
                    : noneChosen
                    ? false
                    : null,
                tristate: true,
                label: strings.message('selectAll'),
                onChanged: choosable.isEmpty
                    ? null
                    : (_) => node.setValue(
                        'onSelectionChange',
                        allChosen ? <String>[] : choosable,
                      ),
              )
            : const SizedBox.shrink(),
      for (var i = 0; i < columns.length; i++)
        _heading(
          context,
          columns[i],
          style: headStyle.copyWith(
            color: columns[i].flag('allowsSorting') && _hoveredColumn == i
                ? text
                : muted,
          ),
          sortedAscending: columns[i].id != null && columns[i].id == sortColumn
              ? ascending
              : null,
        ),
    ];
    final headRow = TableRow(
      decoration: secondary
          ? DibaRowPaint(
              fill: scheme.surfaceContainer,
              radius: const BorderRadius.all(Radius.circular(16)),
            )
          : null,
      children: [
        for (var x = 0; x < headings.length; x++)
          _headCell(
            headings[x],
            rule: x < headings.length - 1 ? rule : null,
            ruleAtLeft: rtl,
            sortable:
                x >= (selecting ? 1 : 0) &&
                columns[x - (selecting ? 1 : 0)].flag('allowsSorting'),
            focusRing: _focusedColumn == x ? ring : null,
            onHover: (over) => _hoverColumn(x - (selecting ? 1 : 0), over),
            onFocus: (on) => setState(() {
              if (on) {
                _focusedColumn = x;
              } else if (_focusedColumn == x) {
                _focusedColumn = null;
              }
            }),
            onSort: x >= (selecting ? 1 : 0)
                ? () => sortBy(columns[x - (selecting ? 1 : 0)])
                : null,
          ),
      ],
    );

    // A row's cells: the box, if the table chooses, then each column's cell,
    // in the column's alignment.
    List<Widget> cellsOf(DibaItem row, {required bool total}) {
      final rowCells = row.items.where((i) => i.type == 'Cell').toList();
      final disabled = row.flag('isDisabled');
      return [
        if (selecting)
          total || row.id == null
              ? const SizedBox.shrink()
              : _selectBox(
                  value: selected.contains(row.id),
                  label:
                      '${strings.message('select')} ${_rowName(row, columns)}',
                  onChanged: disabled
                      ? null
                      : (on) => select(row.id!, on ?? false),
                ),
        for (var i = 0; i < columns.length; i++)
          Semantics(
            header: columns[i].flag('isRowHeader'),
            child: Align(
              alignment: _alignOf(columns[i]),
              child: i < rowCells.length
                  ? rowCells[i].widget
                  : const SizedBox.shrink(),
            ),
          ),
      ];
    }

    final bodyRows = <TableRow>[
      for (var y = 0; y < rows.length; y++)
        _bodyRow(
          rows[y],
          cellsOf(rows[y], total: false),
          style: cellStyle,
          decoration: DibaRowPaint(
            fill: _faded(
              rows[y].flag('isDisabled'),
              selecting && selected.contains(rows[y].id)
                  ? chosenFill
                  : _hoveredRow == y && !rows[y].flag('isDisabled')
                  ? hoverFill
                  : secondary
                  ? null
                  : scheme.surface,
            ),
            line: _faded(rows[y].flag('isDisabled'), line),
            radius: secondary
                ? null
                : BorderRadius.vertical(
                    top: y == 0 ? const Radius.circular(16) : Radius.zero,
                    bottom: y == rows.length - 1
                        ? const Radius.circular(16)
                        : Radius.zero,
                  ),
            ring: _focusedRow == y && dibaKeyboardFocus() ? ring : null,
          ),
          focusable: actionable(rows[y]) && !rows[y].flag('isDisabled'),
          onPress: () => press(rows[y]),
          onHover: (over) => _hoverRow(y, over),
          onFocus: (on) => setState(() {
            if (on) {
              _focusedRow = y;
            } else if (_focusedRow == y) {
              _focusedRow = null;
            }
          }),
        ),
      // Totals, lined up with their columns, on the grey and in the
      // semibold weight.
      for (final row in totals)
        TableRow(
          children: [
            for (final cell in cellsOf(row, total: true))
              _padded(
                DefaultTextStyle.merge(
                  style: cellStyle.copyWith(fontWeight: FontWeight.w600),
                  child: cell,
                ),
              ),
          ],
        ),
    ];

    final table = Table(
      defaultColumnWidth: const _ContentShare(),
      defaultVerticalAlignment: TableCellVerticalAlignment.intrinsicHeight,
      children: [headRow, ...bodyRows],
    );

    final empty = node.prop<String>('emptyMessage');
    final out = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LayoutBuilder(
          builder: (context, constraints) => SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: _AtLeast(
              width: constraints.maxWidth.isFinite
                  ? constraints.maxWidth
                  : null,
              child: table,
            ),
          ),
        ),
        if (rows.isEmpty && empty != null)
          DecoratedBox(
            decoration: BoxDecoration(
              color: secondary ? null : scheme.surface,
              borderRadius: secondary
                  ? null
                  : const BorderRadius.all(Radius.circular(16)),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              child: Text(
                empty,
                textAlign: TextAlign.center,
                style: _type(context, 14, 20, colour: muted),
              ),
            ),
          ),
        if (node.handlers.containsKey('onLoadMore'))
          Padding(
            padding: const EdgeInsets.all(8),
            child: Center(
              child: dibaPlainButton(
                context,
                text: strings.loadMore,
                variant: 'ghost',
                pending: node.flag('isLoadingMore'),
                onPressed: () => node.fire('onLoadMore'),
              ),
            ),
          ),
      ],
    );

    return Semantics(
      label: node.prop<String>('label'),
      container: true,
      child: secondary
          ? out
          : DecoratedBox(
              decoration: BoxDecoration(
                color: scheme.surfaceContainer,
                borderRadius: const BorderRadius.all(Radius.circular(20)),
              ),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(4, 0, 4, 4),
                child: out,
              ),
            ),
    );
  }

  /// A body row: its cells 12 above and 13 below, the line in the last 1, in
  /// the table's type; under the pointer and pressable unless disabled, when
  /// it fades to half. A row with an action takes keyboard focus at its first
  /// cell, and Enter presses it.
  TableRow _bodyRow(
    DibaItem row,
    List<Widget> cells, {
    required TextStyle style,
    required Decoration decoration,
    required bool focusable,
    required VoidCallback onPress,
    required ValueChanged<bool> onHover,
    required ValueChanged<bool> onFocus,
  }) {
    final disabled = row.flag('isDisabled');
    return TableRow(
      key: row.id == null ? null : ValueKey(row.id),
      decoration: decoration,
      children: [
        for (var x = 0; x < cells.length; x++)
          () {
            Widget cell = _padded(
              DefaultTextStyle.merge(style: style, child: cells[x]),
              bottom: 13,
            );
            if (disabled) {
              return IgnorePointer(child: Opacity(opacity: 0.5, child: cell));
            }
            cell = MouseRegion(
              onEnter: (_) => onHover(true),
              onExit: (_) => onHover(false),
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: onPress,
                child: cell,
              ),
            );
            if (x == 0 && focusable) {
              cell = FocusableActionDetector(
                onFocusChange: onFocus,
                actions: {
                  ActivateIntent: CallbackAction<ActivateIntent>(
                    onInvoke: (_) {
                      onPress();
                      return null;
                    },
                  ),
                },
                child: cell,
              );
            }
            return cell;
          }(),
      ],
    );
  }
}

/// A cell's padding, the web's 12 above and 16 across; [bottom] below.
Widget _padded(Widget child, {double bottom = 12}) =>
    Padding(padding: EdgeInsets.fromLTRB(16, 12, 16, bottom), child: child);

/// [colour] at half, as a disabled row's whole is; null stays null.
Color? _faded(bool disabled, Color? colour) => !disabled || colour == null
    ? colour
    : colour.withValues(alpha: colour.a * 0.5);

/// A column's heading: its words in the column's alignment, or, sortable,
/// the words at the start and the chevron at the end, up when ascending, as
/// the web's sortable heading lays them out.
Widget _heading(
  BuildContext context,
  DibaItem column, {
  required TextStyle style,
  required bool? sortedAscending,
}) {
  final words = Text(column.text ?? '', style: style);
  if (!column.flag('allowsSorting')) {
    return Align(alignment: _alignOf(column), child: words);
  }
  final chevron = sortedAscending == null
      ? null
      : Transform.rotate(
          angle: sortedAscending ? math.pi : 0,
          child: DibaGlyphMark(
            DibaGlyph.chevronDown,
            size: 12,
            color: style.color!,
          ),
        );
  // At the start, the words there and the chevron at the heading's end. At
  // the end, the words over the figures and the chevron 4 before them; in the
  // middle, both together, as the web's.
  return switch (column.prop<String>('align')) {
    'end' => Row(
      mainAxisAlignment: MainAxisAlignment.end,
      spacing: 4,
      children: [
        ?chevron,
        Flexible(child: words),
      ],
    ),
    'center' => Row(
      mainAxisAlignment: MainAxisAlignment.center,
      spacing: 4,
      children: [
        Flexible(child: words),
        ?chevron,
      ],
    ),
    _ => Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Flexible(child: words),
        ?chevron,
      ],
    ),
  };
}

/// A heading cell, 10 above and below and 16 across, with the web's rule at
/// its end: 1 wide and 16 tall, in the middle. A sortable one is the hand
/// under the pointer, sorts when pressed, and takes keyboard focus, ringed
/// inside its edge.
Widget _headCell(
  Widget child, {
  required Color? rule,
  required bool ruleAtLeft,
  required bool sortable,
  required Color? focusRing,
  required ValueChanged<bool> onHover,
  required ValueChanged<bool> onFocus,
  required VoidCallback? onSort,
}) {
  Widget cell = CustomPaint(
    foregroundPainter: _HeadPaint(
      rule: rule,
      ruleAtLeft: ruleAtLeft,
      ring: focusRing != null && dibaKeyboardFocus() ? focusRing : null,
    ),
    child: Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: child,
    ),
  );
  if (!sortable || onSort == null) return cell;
  return FocusableActionDetector(
    mouseCursor: SystemMouseCursors.click,
    onShowHoverHighlight: onHover,
    onFocusChange: onFocus,
    actions: {
      ActivateIntent: CallbackAction<ActivateIntent>(
        onInvoke: (_) {
          onSort();
          return null;
        },
      ),
    },
    child: MouseRegion(
      onEnter: (_) => onHover(true),
      onExit: (_) => onHover(false),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onSort,
        child: cell,
      ),
    ),
  );
}

/// What names a row for a screen reader: its row header's words, as React
/// Aria names a web table's row, or its first cell's when no column is the
/// row header. A cell's words are its text, or the text of the blocks in it.
String _rowName(DibaItem row, List<DibaItem> columns) {
  final cells = row.items.where((i) => i.type == 'Cell').toList();
  final at = columns.indexWhere((c) => c.flag('isRowHeader'));
  String words(DibaItem item) =>
      (item.text ?? item.items.map(words).join(' ')).trim();
  final index = at < 0 ? 0 : at;
  return index < cells.length ? words(cells[index]) : '';
}

/// A table's selection box, 18 across at its cell's start, as the web's
/// table draws a checkbox: Diba's own, its press and its focus Flutter's.
Widget _selectBox({
  required bool? value,
  required String? label,
  required ValueChanged<bool?>? onChanged,
  bool tristate = false,
}) => Align(
  alignment: AlignmentDirectional.centerStart,
  child: SizedBox.square(
    dimension: 18,
    child: OverflowBox(
      maxWidth: double.infinity,
      maxHeight: double.infinity,
      child: Checkbox(
        value: value,
        tristate: tristate,
        semanticLabel: label,
        onChanged: onChanged,
      ),
    ),
  ),
);

/// What a heading cell paints over itself: the rule at its end, and the
/// keyboard's ring 2 wide inside its edge, 8 round, as the web's.
class _HeadPaint extends CustomPainter {
  _HeadPaint({
    required this.rule,
    required this.ruleAtLeft,
    required this.ring,
  });

  final Color? rule;
  final bool ruleAtLeft;
  final Color? ring;

  @override
  void paint(Canvas canvas, Size size) {
    if (rule != null) {
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(
            ruleAtLeft ? 0 : size.width - 1,
            (size.height - 16) / 2,
            1,
            16,
          ),
          const Radius.circular(2),
        ),
        Paint()..color = rule!,
      );
    }
    if (ring != null) _insetRing(canvas, Offset.zero & size, ring!);
  }

  @override
  bool shouldRepaint(_HeadPaint old) =>
      old.rule != rule || old.ruleAtLeft != ruleAtLeft || old.ring != ring;
}

/// The web's focus ring inside a table's cell or row: 2 wide, 8 round.
void _insetRing(Canvas canvas, Rect rect, Color colour) => canvas.drawRRect(
  RRect.fromRectAndRadius(rect.deflate(1), const Radius.circular(7)),
  Paint()
    ..style = PaintingStyle.stroke
    ..strokeWidth = 2
    ..color = colour,
);

/// A row's paint: its fill, its line along the foot, both inside [radius]
/// where it has one, and the keyboard's ring. The web paints these on each
/// cell; a row of cells side by side, with no space between, is the same.
/// Public for the tests to read; the package does not export it.
class DibaRowPaint extends Decoration {
  const DibaRowPaint({this.fill, this.line, this.radius, this.ring});

  final Color? fill;
  final Color? line;
  final BorderRadius? radius;
  final Color? ring;

  @override
  BoxPainter createBoxPainter([VoidCallback? onChanged]) => _RowPainter(this);
}

class _RowPainter extends BoxPainter {
  _RowPainter(this.paint_);

  final DibaRowPaint paint_;

  @override
  void paint(Canvas canvas, Offset offset, ImageConfiguration configuration) {
    final rect = offset & configuration.size!;
    final p = paint_;
    canvas.save();
    if (p.radius != null) canvas.clipRRect(p.radius!.toRRect(rect));
    if (p.fill != null) canvas.drawRect(rect, Paint()..color = p.fill!);
    if (p.line != null) {
      canvas.drawRect(
        Rect.fromLTRB(rect.left, rect.bottom - 1, rect.right, rect.bottom),
        Paint()..color = p.line!,
      );
    }
    canvas.restore();
    if (p.ring != null) _insetRing(canvas, rect, p.ring!);
  }
}

/// A column's share of the width, as a browser's automatic table layout
/// shares it: at least what its narrowest cell can wrap to, what its widest
/// asks when there is room, and room beyond that in proportion to it.
class _ContentShare extends TableColumnWidth {
  const _ContentShare();

  @override
  double minIntrinsicWidth(Iterable<RenderBox> cells, double containerWidth) {
    var width = 0.0;
    for (final cell in cells) {
      width = math.max(width, cell.getMinIntrinsicWidth(double.infinity));
    }
    return width;
  }

  @override
  double maxIntrinsicWidth(Iterable<RenderBox> cells, double containerWidth) {
    var width = 0.0;
    for (final cell in cells) {
      width = math.max(width, cell.getMaxIntrinsicWidth(double.infinity));
    }
    return width;
  }

  @override
  double? flex(Iterable<RenderBox> cells) =>
      maxIntrinsicWidth(cells, double.infinity);
}

/// Lays its child out [width] wide, or as narrow as the child can be if
/// that is wider: inside a scroll across, a table as wide as its frame that
/// scrolls only when its cells cannot fit. Without a [width], as wide as the
/// child asks.
class _AtLeast extends SingleChildRenderObjectWidget {
  const _AtLeast({required this.width, required super.child});

  final double? width;

  @override
  RenderObject createRenderObject(BuildContext context) =>
      _RenderAtLeast(width);

  @override
  void updateRenderObject(BuildContext context, _RenderAtLeast renderObject) =>
      renderObject.width = width;
}

class _RenderAtLeast extends RenderProxyBox {
  _RenderAtLeast(this._width);

  double? _width;
  set width(double? value) {
    if (value == _width) return;
    _width = value;
    markNeedsLayout();
  }

  double _target(RenderBox child) => _width == null
      ? child.getMaxIntrinsicWidth(double.infinity)
      : math.max(_width!, child.getMinIntrinsicWidth(double.infinity));

  @override
  Size computeDryLayout(BoxConstraints constraints) {
    final child = this.child;
    if (child == null) return constraints.smallest;
    final width = _target(child);
    return constraints.constrain(
      child.getDryLayout(
        constraints.copyWith(minWidth: width, maxWidth: width),
      ),
    );
  }

  @override
  void performLayout() {
    final child = this.child;
    if (child == null) {
      size = constraints.smallest;
      return;
    }
    final width = _target(child);
    child.layout(
      constraints.copyWith(minWidth: width, maxWidth: width),
      parentUsesSize: true,
    );
    size = constraints.constrain(child.size);
  }
}

// ---------------------------------------------------------------------------
// Modal and AlertDialog

/// A dialog's width by size, the web's max-w-xs to max-w-lg.
double _dialogWidth(String size) => switch (size) {
  'xs' => 320,
  'sm' => 384,
  'md' => 448,
  _ => 512,
};

/// The web's ease-out-quad, a dialog's curve in and out, and Tailwind's
/// ease-out, its backdrop's.
const Cubic _outQuad = Cubic(0.25, 0.46, 0.45, 0.94);
const Cubic _easeOut = Cubic(0, 0, 0.2, 1);

/// Opens a dialog as the web's Modal and AlertDialog open: its frame
/// over the web's backdrop, coming in from 1.05 of its size and clear over
/// 250ms, and going to 0.95 over 100ms; the backdrop fading in over 150ms.
Future<void> _openDialog(
  BuildContext context, {
  required bool dismissible,
  required String backdrop,
  required String size,
  required String placement,
  required bool scrollInside,
  required String? label,
  required Widget Function(BuildContext context, {required bool fill}) dialog,
}) {
  final navigator = Navigator.of(context, rootNavigator: true);
  final themes = InheritedTheme.capture(from: context, to: navigator.context);
  final scheme = Theme.of(context).colorScheme;
  return navigator.push(
    _DialogRoute(
      dismissible: dismissible,
      dismissLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
      backdrop: backdrop == 'transparent' ? null : scheme.scrim,
      blur: backdrop == 'blur',
      zoom: size != 'full',
      builder: (routeContext) => themes.wrap(
        _DialogFrame(
          size: size,
          placement: placement,
          scrollInside: scrollInside,
          label: label,
          dismiss: dismissible ? () => dibaCloseRoute(routeContext) : null,
          dialog: Builder(
            builder: (c) => dialog(c, fill: size == 'full' || size == 'cover'),
          ),
        ),
      ),
    ),
  );
}

class _DialogRoute extends PopupRoute<void> {
  _DialogRoute({
    required this.dismissible,
    required this.dismissLabel,
    required this.backdrop,
    required this.blur,
    required this.zoom,
    required this.builder,
  });

  final bool dismissible;
  final String dismissLabel;

  /// The backdrop's colour, `--backdrop`; null for a transparent one.
  final Color? backdrop;
  final bool blur;

  /// Whether the dialog grows in and shrinks out: not a full-screen one.
  final bool zoom;
  final WidgetBuilder builder;

  /// The barrier only takes the press outside the dialog; the backdrop is
  /// drawn with the dialog, on the web's timing.
  @override
  Color? get barrierColor => null;

  @override
  bool get barrierDismissible => dismissible;

  @override
  String? get barrierLabel => dismissLabel;

  @override
  Duration get transitionDuration => const Duration(milliseconds: 250);

  @override
  Duration get reverseTransitionDuration => const Duration(milliseconds: 100);

  @override
  Widget buildPage(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
  ) => builder(context);

  @override
  Widget buildTransitions(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) => Stack(
    children: [
      if (backdrop != null || blur)
        Positioned.fill(
          child: IgnorePointer(
            child: _Backdrop(
              animation: animation,
              colour: backdrop ?? const Color(0x00000000),
              blur: blur,
            ),
          ),
        ),
      _DialogMotion(animation: animation, zoom: zoom, child: child),
    ],
  );
}

/// The web's backdrop: `--backdrop`, and with blur, what is behind it
/// blurred 12 too; in over 150ms and out over 100ms.
class _Backdrop extends AnimatedWidget {
  const _Backdrop({
    required Animation<double> animation,
    required this.colour,
    required this.blur,
  }) : super(listenable: animation);

  final Color colour;
  final bool blur;

  @override
  Widget build(BuildContext context) {
    final a = listenable as Animation<double>;
    final shown = a.status == AnimationStatus.reverse
        ? 1 - _easeOut.transform(1 - a.value)
        : _easeOut.transform((a.value / 0.6).clamp(0.0, 1.0));
    Widget backdrop = ColoredBox(
      color: colour.withValues(alpha: colour.a * shown),
    );
    if (blur) {
      backdrop = BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12 * shown, sigmaY: 12 * shown),
        child: backdrop,
      );
    }
    return backdrop;
  }
}

/// A dialog coming in and going out as the web's container does: from 1.05
/// and clear, to 0.95 and clear, about the screen's middle.
class _DialogMotion extends AnimatedWidget {
  const _DialogMotion({
    required Animation<double> animation,
    required this.zoom,
    required this.child,
  }) : super(listenable: animation);

  final bool zoom;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final a = listenable as Animation<double>;
    final leaving = a.status == AnimationStatus.reverse;
    final shown = leaving
        ? 1 - _outQuad.transform(1 - a.value)
        : _outQuad.transform(a.value);
    final scale = !zoom
        ? 1.0
        : leaving
        ? 0.95 + 0.05 * shown
        : 1.05 - 0.05 * shown;
    return Opacity(
      opacity: shown,
      child: Transform.scale(scale: scale, child: child),
    );
  }
}

/// Where a dialog stands, as the web's container places it: 16 from the
/// screen's edges under 640 wide and 40 from them over it, none for a full
/// one; at the bottom of a phone and in the middle of anything wider, unless
/// the tree places it; as wide as its size allows, or filling the room for
/// cover and full. With scroll outside, the room scrolls rather than the
/// dialog's body.
class _DialogFrame extends StatelessWidget {
  const _DialogFrame({
    required this.size,
    required this.placement,
    required this.scrollInside,
    required this.label,
    required this.dismiss,
    required this.dialog,
  });

  final String size;
  final String placement;
  final bool scrollInside;
  final String? label;
  final VoidCallback? dismiss;
  final Widget dialog;

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    return LayoutBuilder(
      builder: (context, constraints) {
        final wide = constraints.maxWidth >= 640;
        final full = size == 'full';
        final fill = full || size == 'cover';
        final edge = full ? 0.0 : (wide ? 40.0 : 16.0);
        final room = full
            ? EdgeInsets.only(bottom: media.viewInsets.bottom)
            : EdgeInsets.fromLTRB(
                edge + media.padding.left,
                edge + media.padding.top,
                edge + media.padding.right,
                edge + math.max(media.padding.bottom, media.viewInsets.bottom),
              );
        final alignment = switch (placement) {
          'top' => Alignment.topCenter,
          'bottom' => Alignment.bottomCenter,
          'center' => Alignment.center,
          _ => wide ? Alignment.center : Alignment.bottomCenter,
        };
        Widget box = Semantics(
          scopesRoute: true,
          namesRoute: true,
          explicitChildNodes: true,
          label: label,
          child: dialog,
        );
        box = fill
            ? SizedBox.expand(child: box)
            : ConstrainedBox(
                constraints: BoxConstraints(maxWidth: _dialogWidth(size)),
                child: box,
              );
        if (scrollInside || fill) {
          return Padding(
            padding: room,
            child: Align(alignment: alignment, child: box),
          );
        }
        // The room scrolls, and takes the press outside the dialog itself,
        // which the barrier under it no longer can.
        return SingleChildScrollView(
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: constraints.maxHeight),
            child: Stack(
              children: [
                Positioned.fill(
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: dismiss,
                  ),
                ),
                Padding(
                  padding: room,
                  child: Align(alignment: alignment, child: box),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

/// A dialog's surface: the web's overlay, 24 round with its shadow, or the
/// plain surface edge to edge for a full one. Material for what it holds.
Widget _dialogSurface(
  BuildContext context, {
  required bool full,
  required Widget child,
}) => Material(
  type: MaterialType.transparency,
  child: DecoratedBox(
    decoration: full
        ? BoxDecoration(color: Theme.of(context).colorScheme.surface)
        : DibaTheme.overlay(dark: _dark(context), radius: _surfaceRadius),
    child: child,
  ),
);

/// A dialog's heading: 16 on a 24 line, medium, the text colour.
Widget _dialogHeading(BuildContext context, String? title) => Semantics(
  header: true,
  child: Text(
    title ?? '',
    style: _type(
      context,
      16,
      24,
      weight: FontWeight.w500,
      colour: Theme.of(context).colorScheme.onSurface,
    ),
  ),
);

/// A dialog's body in the web's type, 14 on a 20 line in the muted colour,
/// 3 above and below it as the web's body pads itself for focus rings; it
/// scrolls inside the dialog unless the room does, and fills a cover or full
/// dialog.
Widget _dialogBody(
  BuildContext context,
  Widget body, {
  required bool scrollInside,
  required bool fill,
}) {
  body = DefaultTextStyle.merge(
    style: _type(
      context,
      14,
      20,
      colour: Theme.of(context).colorScheme.onSurfaceVariant,
    ),
    child: Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: body,
    ),
  );
  if (!scrollInside) return body;
  body = SingleChildScrollView(child: body);
  return fill ? Expanded(child: body) : Flexible(child: body);
}

/// The Modal's dialog: 24 in, the close button in its corner 16 from
/// the edges; its icon above its heading, 12 apart; its body 8 under them,
/// its children 16 apart; its footer 20 under the body, at the end.
Widget _modalDialog(
  BuildContext context,
  DibaNodeContext node, {
  required bool scrollInside,
  required bool fill,
  required bool full,
}) {
  final strings = DibaStrings.of(context);
  final title = node.prop<String>('title');
  if (title == null) node.refuse('no title, which is the dialog\'s name');
  final icon = dibaIcon(node.prop<String>('icon'));
  final footer = node.slots['footer'];
  final content = Column(
    mainAxisSize: fill ? MainAxisSize.max : MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (icon != null) ...[
            SizedBox.square(
              dimension: 40,
              child: Center(
                child: Icon(
                  icon,
                  size: 16,
                  color: Theme.of(context).colorScheme.onSurface,
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
          _dialogHeading(context, title),
        ],
      ),
      const SizedBox(height: 8),
      _dialogBody(
        context,
        Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: dibaSpaced(node.children, 16),
        ),
        scrollInside: scrollInside,
        fill: fill,
      ),
      if (footer != null) ...[
        const SizedBox(height: 20),
        Align(alignment: AlignmentDirectional.centerEnd, child: footer),
      ],
    ],
  );
  return _dialogSurface(
    context,
    full: full,
    child: Stack(
      children: [
        Padding(padding: const EdgeInsets.all(24), child: content),
        PositionedDirectional(
          top: 16,
          end: 16,
          child: dibaCloseButton(
            context,
            label: strings.close,
            onPressed: () => dibaCloseRoute(context),
          ),
        ),
      ],
    ),
  );
}

/// An alert dialog's mark by status, as the web's: a circle 40 across in the
/// status's soft colour, the status's sign, Lucide's, 20 across in its
/// soft text colour. Both are the web's mixes, made in Oklab as the web's color-mix
/// makes them; accent is Diba's primary soft and emphasis, and default the
/// neutral fill with the text colour.
Widget _statusMark(BuildContext context, String status) {
  final dark = _dark(context);
  final text = dark
      ? DibaDarkNeutrals.foreground
      : DibaLightNeutrals.foreground;
  final (Color soft, Color colour, IconData sign) = switch (status) {
    'default' => (
      dark ? DibaDarkNeutrals.fill : DibaLightNeutrals.fill,
      text,
      LucideIcons.info,
    ),
    'accent' => (
      dark ? DibaDarkColors.primarySoft : DibaLightColors.primarySoft,
      dark ? DibaDarkColors.primaryEmphasis : DibaLightColors.primaryEmphasis,
      LucideIcons.info,
    ),
    'success' => (
      (dark ? DibaDarkColors.success : DibaLightColors.success).withValues(
        alpha: dark ? 0.12 : 0.15,
      ),
      dark
          ? dibaMixOklab(DibaDarkColors.success, 0.8, text, 0.3)
          : dibaMixOklab(DibaLightColors.success, 0.8, text, 0.6),
      LucideIcons.circleCheck,
    ),
    'warning' => (
      (dark ? DibaDarkColors.warning : DibaLightColors.warning).withValues(
        alpha: dark ? 0.12 : 0.15,
      ),
      dark
          ? dibaMixOklab(DibaDarkColors.warning, 0.8, text, 0.3)
          : dibaMixOklab(DibaLightColors.warning, 0.8, text, 0.7),
      LucideIcons.triangleAlert,
    ),
    _ => (
      (dark ? DibaDarkColors.danger : DibaLightColors.danger).withValues(
        alpha: 0.15,
      ),
      dark
          ? dibaMixOklab(DibaDarkColors.danger, 0.8, text, 0.3)
          : dibaMixOklab(DibaLightColors.danger, 0.7, text, 0.4),
      LucideIcons.circleAlert,
    ),
  };
  return SizedBox.square(
    dimension: 40,
    child: DecoratedBox(
      decoration: BoxDecoration(color: soft, shape: BoxShape.circle),
      child: Center(child: Icon(sign, size: 20, color: colour)),
    ),
  );
}

/// AlertDialog's dialog. Stateful for one thing: the confirm button stays
/// pending while onConfirm's `call` runs, which the web does too, and cancel
/// waits with it.
class _ConfirmBody extends StatefulWidget {
  const _ConfirmBody({
    required this.node,
    required this.close,
    required this.scrollInside,
    required this.fill,
  });

  final DibaNodeContext node;
  final VoidCallback close;
  final bool scrollInside;
  final bool fill;

  @override
  State<_ConfirmBody> createState() => _ConfirmBodyState();
}

class _ConfirmBodyState extends State<_ConfirmBody> {
  bool _pending = false;

  @override
  Widget build(BuildContext context) {
    final node = widget.node;
    final status = node.str('status', 'danger');
    final strings = DibaStrings.of(context);
    final description = node.prop<String>('description');
    final content = Column(
      mainAxisSize: widget.fill ? MainAxisSize.max : MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // The mark beside the heading, 12 before it and centred on it; the
        // words under both, the whole width.
        Row(
          children: [
            _statusMark(context, status),
            const SizedBox(width: 12),
            Expanded(
              child: _dialogHeading(context, node.prop<String>('title')),
            ),
          ],
        ),
        if (description != null) ...[
          const SizedBox(height: 8),
          _dialogBody(
            context,
            Text(description),
            scrollInside: true,
            fill: widget.fill,
          ),
        ] else if (widget.fill)
          const Spacer(),
        const SizedBox(height: 20),
        Wrap(
          alignment: WrapAlignment.end,
          spacing: 8,
          runSpacing: 8,
          children: [
            dibaPlainButton(
              context,
              text: node.prop<String>('cancelLabel') ?? strings.cancel,
              variant: 'tertiary',
              size: 'md',
              disabled: _pending,
              onPressed: () {
                node.fire('onCancel');
                widget.close();
              },
            ),
            dibaPlainButton(
              context,
              text: node.prop<String>('confirmLabel') ?? '',
              variant: status == 'danger' ? 'danger' : 'primary',
              size: 'md',
              pending: _pending,
              onPressed: () async {
                setState(() => _pending = true);
                // Pending until the call resolves. A failed call leaves the
                // dialog open, so the merchant can try again or cancel.
                final ok = await node.fire('onConfirm');
                if (!mounted) return;
                if (ok) {
                  widget.close();
                } else {
                  setState(() => _pending = false);
                }
              },
            ),
          ],
        ),
      ],
    );
    return _dialogSurface(
      context,
      full: false,
      child: Padding(padding: const EdgeInsets.all(24), child: content),
    );
  }
}

// ---------------------------------------------------------------------------
// Popover

/// The Popover's panel: the web's overlay 24 round, 16 in, its heading
/// 14 on a 20 line and medium, its children under it, as wide as they ask.
Widget _popoverPanel(BuildContext context, DibaNodeContext node) {
  final scheme = Theme.of(context).colorScheme;
  final title = node.prop<String>('title');
  return Material(
    type: MaterialType.transparency,
    child: DecoratedBox(
      decoration: DibaTheme.overlay(
        dark: _dark(context),
        radius: _surfaceRadius,
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: DefaultTextStyle.merge(
          style: _type(context, 14, 20, colour: scheme.onSurface),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (title != null)
                Semantics(
                  header: true,
                  child: Text(
                    title,
                    style: _type(
                      context,
                      14,
                      20,
                      weight: FontWeight.w500,
                      colour: scheme.onSurface,
                    ),
                  ),
                ),
              ...node.children,
            ],
          ),
        ),
      ),
    ),
  );
}

// ---------------------------------------------------------------------------

final Map<String, DibaBuilder> containerBlocks = {
  'Card': _card,

  /// Read as data: the table lays out its columns and rows at once.
  'Table': (context, node) => _TableView(node),

  /// Read by Table.
  'TableHeader': (context, node) => const SizedBox.shrink(),
  'TableBody': (context, node) => const SizedBox.shrink(),
  'TableFooter': (context, node) => const SizedBox.shrink(),
  'Column': (context, node) => const SizedBox.shrink(),
  'Row': (context, node) => const SizedBox.shrink(),

  /// A cell holds blocks. Table places what this returns.
  'Cell': (context, node) {
    if (node.text != null) return Text(node.text!);
    if (node.children.length == 1) return node.children.first;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 0; i < node.children.length; i++) ...[
          if (i > 0) const SizedBox(width: 8),
          node.children[i],
        ],
      ],
    );
  },

  'Modal': (context, node) {
    final trigger = node.slots['trigger'];
    if (trigger == null) {
      node.refuse('no trigger');
      return const SizedBox.shrink();
    }
    return dibaTrigger(trigger, () async {
      node.fire('onOpenChange', true);
      final size = node.str('size', 'lg');
      final scrollInside = node.str('scroll', 'inside') == 'inside';
      await _openDialog(
        context,
        dismissible: node.flagOr('isDismissable', true),
        backdrop: node.str('backdrop', 'opaque'),
        size: size,
        placement: node.str('placement', 'auto'),
        scrollInside: scrollInside,
        label: node.prop<String>('title'),
        dialog: (dialogContext, {required fill}) => node.overlay(
          close: () => dibaCloseRoute(dialogContext),
          child: node.live(
            (c, n) => _modalDialog(
              c,
              n,
              scrollInside: scrollInside,
              fill: fill,
              full: size == 'full',
            ),
          ),
        ),
      );
      node.fire('onOpenChange', false);
    });
  },

  /// A confirmation, which only its own buttons close, as the web's: not a
  /// press outside it, and not Escape.
  'AlertDialog': (context, node) {
    final trigger = node.slots['trigger'];
    if (trigger == null) {
      node.refuse('no trigger');
      return const SizedBox.shrink();
    }
    if (node.prop<String>('confirmLabel') == null) {
      node.refuse('no confirmLabel');
    }
    return dibaTrigger(trigger, () {
      _openDialog(
        context,
        dismissible: false,
        backdrop: node.str('backdrop', 'opaque'),
        size: node.str('size', 'md'),
        placement: 'auto',
        scrollInside: true,
        label: node.prop<String>('title'),
        dialog: (dialogContext, {required fill}) {
          void close() => dibaCloseRoute(dialogContext);
          return node.overlay(
            close: close,
            child: node.live(
              (c, n) => _ConfirmBody(
                node: n,
                close: close,
                scrollInside: true,
                fill: fill,
              ),
            ),
          );
        },
      );
    });
  },

  /// A popover on every screen, a phone's too, as the web's.
  'Popover': (context, node) {
    final trigger = node.slots['trigger'];
    if (trigger == null) {
      node.refuse('no trigger');
      return const SizedBox.shrink();
    }
    return DibaPlacedPanel(
      placement: DibaPlacement.parse(
        node.prop<String>('placement'),
        const DibaPlacement('bottom', 'center'),
      ),
      gap: node.number('offset')?.toDouble() ?? 8,
      modal: !node.flag('isNonModal'),
      arrow: node.flag('showArrow'),
      bare: true,
      onOpenChange: (open) => node.fire('onOpenChange', open),
      trigger: (context, toggle) => dibaTrigger(trigger, toggle),
      panel: (context, close) =>
          node.overlay(close: close, child: node.live(_popoverPanel)),
    );
  },

  /// The fields, [gap] apart, and the form's error under them as a field's
  /// error is drawn: 12 on a 16 line, 4 in, the danger colour, as the web's.
  'Form': (context, node) {
    final slot = node.formSlot!;
    final error = node.prop<String>('errorMessage');
    final gap = node.number('gap');
    return Form(
      key: slot.key,
      autovalidateMode: slot.submitted
          ? AutovalidateMode.onUserInteraction
          : AutovalidateMode.disabled,
      child: KeyedSubtree(
        key: ValueKey(slot.generation),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: dibaSpaced([
            ...node.children,
            if (error != null)
              Semantics(
                liveRegion: true,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Text(
                    error,
                    style: _type(
                      context,
                      12,
                      16,
                      colour: Theme.of(context).colorScheme.error,
                    ),
                  ),
                ),
              ),
          ], gap == null ? 16 : gap * 4.0),
        ),
      ),
    );
  },
};
