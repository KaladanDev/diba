import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../tokens.g.dart';
import '../glyphs.dart';
import '../node.dart';
import 'common.dart';

/// The last six components copied, in Diba's look and drawn here too:
/// Breadcrumbs, SwitchGroup and Toolbar here; Menu beside the Dropdown it
/// shares its rows with (pickers.dart); Sheet beside the drawer whose numbers
/// it takes (structure.dart). ErrorMessage has no block: a TagGroup's
/// errorMessage is it. Every number is the web's.

bool _dark(BuildContext context) =>
    Theme.of(context).brightness == Brightness.dark;

/// The toolbar a Separator block is in, if any: there it runs across the
/// toolbar, half its row's height or half its column's width and centred, as
/// The web's toolbar turns its separators, whatever the tree says.
class DibaToolbarScope extends InheritedWidget {
  const DibaToolbarScope({
    super.key,
    required this.vertical,
    required super.child,
  });

  /// Whether the toolbar runs down.
  final bool vertical;

  static DibaToolbarScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<DibaToolbarScope>();

  @override
  bool updateShouldNotify(DibaToolbarScope old) => old.vertical != vertical;
}

/// A step of a trail: its words 14 on 20 and medium, muted, underlined under
/// the pointer; the last, the page itself, in the link colour, going nowhere.
/// Disabled, the words are at half.
class _Step extends StatefulWidget {
  const _Step({
    required this.text,
    required this.current,
    required this.disabled,
    this.onTap,
  });

  final String text;
  final bool current;
  final bool disabled;
  final VoidCallback? onTap;

  @override
  State<_Step> createState() => _StepState();
}

class _StepState extends State<_Step> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final dark = _dark(context);
    final colour = widget.current
        ? (dark ? DibaDarkColors.link : DibaLightColors.link)
        : Theme.of(context).colorScheme.onSurfaceVariant;
    final live = widget.onTap != null && !widget.disabled;
    Widget words = Text(
      widget.text,
      style: dibaType(context, 14, 20, colour: colour, weight: FontWeight.w500)
          .copyWith(
            decoration: _hovered && live ? TextDecoration.underline : null,
            decorationColor: colour,
          ),
    );
    // Disabled, the steps are at half; the page itself stays, as the web's.
    if (widget.disabled && !widget.current) {
      words = Opacity(opacity: 0.5, child: words);
    }
    return Semantics(
      link: true,
      enabled: live || widget.current,
      // The page itself is the current one, as the web's aria-current says.
      selected: widget.current,
      child: MouseRegion(
        cursor: live ? SystemMouseCursors.click : MouseCursor.defer,
        onEnter: (_) => setState(() => _hovered = true),
        onExit: (_) => setState(() => _hovered = false),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: live ? widget.onTap : null,
          child: words,
        ),
      ),
    );
  }
}

/// The web's chevron between steps, 12 across, muted; pointing on
/// in the page's direction, so left on a Persian page.
Widget _chevron(BuildContext context) {
  final mark = DibaGlyphMark(
    DibaGlyph.chevronLeft,
    size: 12,
    color: Theme.of(context).colorScheme.onSurfaceVariant,
  );
  return Directionality.of(context) == TextDirection.rtl
      ? mark
      : Transform.flip(flipX: true, child: mark);
}

/// Tab and Shift+Tab leave a toolbar from wherever in it the focus is: one
/// stop for the Tab key, as React Aria's toolbar is.
class _LeaveIntent extends Intent {
  const _LeaveIntent({required this.forward});
  final bool forward;
}

class _Toolbar extends StatefulWidget {
  const _Toolbar({
    required this.vertical,
    required this.attached,
    required this.label,
    required this.children,
  });

  final bool vertical;
  final bool attached;
  final String? label;
  final List<Widget> children;

  @override
  State<_Toolbar> createState() => _ToolbarState();
}

class _ToolbarState extends State<_Toolbar> {
  final FocusNode _group = FocusNode(skipTraversal: true);

  @override
  void dispose() {
    _group.dispose();
    super.dispose();
  }

  void _leave(bool forward) {
    final inside = _group.traversalDescendants.toList();
    if (inside.isEmpty) return;
    final edge = forward ? inside.last : inside.first;
    edge.requestFocus();
    forward ? edge.nextFocus() : edge.previousFocus();
  }

  @override
  Widget build(BuildContext context) {
    final vertical = widget.vertical;
    // The controls 8 apart, centred across a row; down a column at its start,
    // the column as wide as its widest.
    Widget bar = vertical
        ? IntrinsicWidth(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              spacing: 8,
              children: widget.children,
            ),
          )
        : IntrinsicHeight(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              spacing: 8,
              children: widget.children,
            ),
          );
    if (widget.attached) {
      // Its own bar: the surface, 24 round, 4 in, with the overlay's shadow.
      final dark = _dark(context);
      final overlay = DibaTheme.overlay(dark: dark, radius: 24);
      bar = DecoratedBox(
        decoration: ShapeDecoration(
          color: dark ? DibaDarkNeutrals.surface : DibaLightNeutrals.surface,
          shadows: overlay.shadows,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(24)),
          ),
        ),
        child: Padding(padding: const EdgeInsets.all(4), child: bar),
      );
    }
    // The arrow keys move along it: left and right along a row, up and down
    // a column; left is onward on a right-to-left page, as on the web.
    final arrows = <ShortcutActivator, Intent>{
      if (!vertical) ...{
        const SingleActivator(LogicalKeyboardKey.arrowLeft):
            const DirectionalFocusIntent(TraversalDirection.left),
        const SingleActivator(LogicalKeyboardKey.arrowRight):
            const DirectionalFocusIntent(TraversalDirection.right),
      } else ...{
        const SingleActivator(LogicalKeyboardKey.arrowUp):
            const DirectionalFocusIntent(TraversalDirection.up),
        const SingleActivator(LogicalKeyboardKey.arrowDown):
            const DirectionalFocusIntent(TraversalDirection.down),
      },
      const SingleActivator(LogicalKeyboardKey.tab): const _LeaveIntent(
        forward: true,
      ),
      const SingleActivator(LogicalKeyboardKey.tab, shift: true):
          const _LeaveIntent(forward: false),
    };
    return Semantics(
      container: true,
      label: widget.label,
      child: Align(
        alignment: AlignmentDirectional.centerStart,
        widthFactor: 1,
        child: DibaToolbarScope(
          vertical: vertical,
          child: Shortcuts(
            shortcuts: arrows,
            child: Actions(
              actions: {
                _LeaveIntent: CallbackAction<_LeaveIntent>(
                  onInvoke: (intent) {
                    _leave(intent.forward);
                    return null;
                  },
                ),
              },
              child: FocusTraversalGroup(
                child: Focus(
                  focusNode: _group,
                  canRequestFocus: false,
                  child: bar,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

final Map<String, DibaBuilder> sixBlocks = {
  /// The way to a page, the web's: each step 6 from the last, a 12 chevron 4
  /// after each but the page itself.
  'Breadcrumbs': (context, node) {
    final steps = node.items.where((i) => i.type == 'BreadcrumbsItem').toList();
    final disabled = node.flag('isDisabled');
    return Wrap(
      spacing: 6,
      runSpacing: 4,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        for (final (i, step) in steps.indexed)
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _Step(
                text: dibaItemText(step),
                current: i == steps.length - 1,
                disabled: disabled,
                onTap: switch (step.prop<String>('href')) {
                  final href? when i < steps.length - 1 =>
                    () => node.navigateTo(href),
                  _ => null,
                },
              ),
              if (i < steps.length - 1) ...[
                const SizedBox(width: 4),
                _chevron(context),
              ],
            ],
          ),
      ],
    );
  },

  /// Read by Breadcrumbs as data.
  'BreadcrumbsItem': (context, node) => const SizedBox.shrink(),

  /// Switches 24 apart down, as a checkbox group's rows are: a switch block
  /// stands 3 taller and lower than its 26 track for its tap target, so 18
  /// between blocks. Across, 16 apart in one row, a label wrapping when the
  /// row is short, as the web's do.
  'SwitchGroup': (context, node) =>
      node.str('orientation', 'vertical') == 'horizontal'
      ? Row(
          mainAxisSize: MainAxisSize.min,
          spacing: 16,
          children: [for (final child in node.children) Flexible(child: child)],
        )
      : Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 18,
          children: node.children,
        ),

  /// A row of controls the arrow keys move along, one stop for the Tab key.
  'Toolbar': (context, node) => _Toolbar(
    vertical: node.str('orientation', 'horizontal') == 'vertical',
    attached: node.flag('isAttached'),
    label: node.prop<String>('label'),
    children: node.children,
  ),
};
