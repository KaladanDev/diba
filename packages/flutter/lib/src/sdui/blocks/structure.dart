import 'dart:ui' as ui;

import 'package:flutter/material.dart';

import '../../tokens.g.dart';
import '../glyphs.dart';
import '../node.dart';
import '../oklab.dart';
import '../ring.dart';
import '../strings.dart';
import 'actions.dart' show dibaCloseButton;
import 'common.dart';
import 'six.dart' show DibaToolbarScope;

/// The extra components' structure: Tabs, an Accordion of disclosures, a
/// Separator, a Fieldset and a Drawer, in Diba's look: every number is the
/// web's, measured on the web; the drawer keeps Flutter's
/// motion, which the web took.

/// A panel's or an item's blocks, 16 apart, as the web lays them out.
Widget _column(List<Widget> children) => Column(
  mainAxisSize: MainAxisSize.min,
  crossAxisAlignment: CrossAxisAlignment.stretch,
  spacing: 16,
  children: children,
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

bool _dark(BuildContext context) =>
    Theme.of(context).brightness == Brightness.dark;

/// `--foreground`, `--muted` and `--separator`.
Color _ink(BuildContext context) =>
    _dark(context) ? DibaDarkNeutrals.foreground : DibaLightNeutrals.foreground;
// The theme's, which a grey card makes a step stronger.
Color _muted(BuildContext context) =>
    Theme.of(context).colorScheme.onSurfaceVariant;
Color _line(BuildContext context) =>
    _dark(context) ? DibaDarkNeutrals.border : DibaLightNeutrals.border;

/// CSS's `--ease-out` and `--ease-out-quad`, and the curve the web turns an
/// accordion's chevron on.
const Cubic _easeOut = Cubic(0, 0, 0.2, 1);
const Cubic _easeOutQuad = Cubic(0.25, 0.46, 0.45, 0.94);
const Cubic _turn = Cubic(0.4, 0, 0.2, 1);

// ---------------------------------------------------------------------------
// Tabs

/// Tabs > Tab, the web's: a primary list is a slate track 40 tall with the
/// chosen tab a paper pill in it, a secondary one tabs 32 tall over a line
/// across, the chosen one's gilt under it; the labels 14 on 20, medium, the
/// chosen in the text's colour and the rest muted, a disabled one faded. The
/// panel is 8 under, its blocks 8 in all round.
class _DibaTabs extends StatefulWidget {
  const _DibaTabs({required this.node});

  final DibaNodeContext node;

  @override
  State<_DibaTabs> createState() => _DibaTabsState();
}

class _DibaTabsState extends State<_DibaTabs> with TickerProviderStateMixin {
  TabController? _controller;

  List<DibaItem> get _tabs =>
      widget.node.items.where((i) => i.type == 'Tab').toList();

  int get _chosen {
    final current = widget.node.current;
    final index = _tabs.indexWhere((t) => t.props['id'] == current);
    return index < 0 ? 0 : index;
  }

  TabController _sync() {
    final tabs = _tabs;
    var controller = _controller;
    if (controller == null || controller.length != tabs.length) {
      controller?.dispose();
      controller = TabController(
        length: tabs.length,
        vsync: this,
        initialIndex: _chosen,
        // The web's pill moves over 250ms; Material's TabBar moves it on its
        // own ease.
        animationDuration: const Duration(milliseconds: 250),
      );
      _controller = controller;
    } else if (controller.index != _chosen) {
      controller.index = _chosen;
    }
    return controller;
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final node = widget.node;
    final tabs = _tabs;
    if (tabs.isEmpty) return const SizedBox.shrink();
    final controller = _sync();
    final disabled = node.flag('isDisabled');
    final dark = _dark(context);
    void choose(int i) {
      final tab = tabs[i];
      if (tab.props['isDisabled'] == true) {
        controller.index = _chosen;
        return;
      }
      node.setValue('onChange', tab.props['id']);
    }

    final label = _type(
      context,
      14,
      20,
      colour: _ink(context),
      weight: FontWeight.w500,
    );
    Tab tab(DibaItem t) {
      // The icon takes the label's colour, as the web's `currentColor`; a
      // label longer than its tab fades at its end, as Material's own does.
      final content = Row(
        mainAxisSize: MainAxisSize.min,
        spacing: 8,
        children: [
          ?dibaItemIcon(t, size: 16),
          Flexible(
            child: Text(
              t.props['label'] as String? ?? '',
              softWrap: false,
              overflow: TextOverflow.fade,
            ),
          ),
        ],
      );
      return Tab(
        height: 32,
        child: t.props['isDisabled'] == true
            ? Opacity(opacity: 0.5, child: content)
            : content,
      );
    }

    TabBar bar(Decoration indicator) => TabBar(
      controller: controller,
      onTap: choose,
      // A weight of zero leaves each tab its 32: TabBar pads a tab by the
      // weight, and takes zero only with an indicator of its own.
      indicator: indicator,
      indicatorWeight: 0,
      indicatorSize: TabBarIndicatorSize.tab,
      dividerHeight: 0,
      labelColor: _ink(context),
      unselectedLabelColor: _muted(context),
      labelStyle: label,
      unselectedLabelStyle: label,
      tabs: [for (final t in tabs) tab(t)],
    );

    final secondary = node.str('variant', 'primary') == 'secondary';
    final list = secondary
        ? Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              bar(
                UnderlineTabIndicator(
                  borderSide: BorderSide(
                    width: 2,
                    color: dark
                        ? DibaDarkColors.controlFill
                        : DibaLightColors.controlFill,
                  ),
                ),
              ),
              // The web's line is 1 under the tabs, across the whole list.
              const SizedBox(height: 1),
              ColoredBox(
                color: _line(context),
                child: const SizedBox(height: 1),
              ),
            ],
          )
        : Container(
            height: 40,
            padding: const EdgeInsets.all(4),
            decoration: ShapeDecoration(
              shape: const StadiumBorder(),
              color: dark
                  ? DibaDarkColors.segmentList
                  : DibaLightColors.segmentList,
            ),
            child: bar(Theme.of(context).tabBarTheme.indicator!),
          );
    final chosen = tabs[controller.index];
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Semantics(
          label: node.prop<String>('label'),
          container: true,
          child: IgnorePointer(
            ignoring: disabled,
            child: Opacity(opacity: disabled ? 0.5 : 1, child: list),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(top: 8),
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: KeyedSubtree(
              key: ValueKey(chosen.path),
              child: _column([for (final item in chosen.items) item.widget]),
            ),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Accordion

/// Accordion > AccordionItem, the web's: rows 52 tall, their titles 14 on 20
/// and medium, 16 in, an icon muted 12 before; the chevron muted at the end,
/// turning over as the item opens; an open item's blocks under its row, 16 in
/// and 16 above its end. A line between items, over each one's last pixel; on
/// the surface, a paper card 24 round whose lines are the text's colour at 6%,
/// 3% short of each side. One item open at a time unless more are allowed.
Widget _accordion(BuildContext context, DibaNodeContext node) {
  final items = node.items.where((i) => i.type == 'AccordionItem').toList();
  final open = [
    for (final id in (node.current as List?) ?? const []) id.toString(),
  ];
  final many = node.flag('allowsMultipleExpanded');
  final disabled = node.flag('isDisabled');
  final surface = node.str('variant', 'default') == 'surface';
  final column = Column(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      for (final (i, item) in items.indexed)
        () {
          final id = item.props['id'] as String? ?? item.path;
          final expanded = open.contains(id);
          return _AccordionItem(
            key: ValueKey(id),
            title: item.props['title'] as String? ?? '',
            icon: dibaItemIcon(item, size: 16, colour: _muted(context)),
            expanded: expanded,
            disabled: disabled || item.props['isDisabled'] == true,
            surface: surface,
            last: i == items.length - 1,
            onToggle: () => node.setValue('onExpandedChange', [
              if (!expanded) ...[if (many) ...open.where((o) => o != id), id],
              if (expanded) ...open.where((o) => o != id),
            ]),
            children: [for (final c in item.items) c.widget],
          );
        }(),
    ],
  );
  if (!surface) return column;
  return DecoratedBox(
    decoration: BoxDecoration(
      color: _dark(context)
          ? DibaDarkNeutrals.surface
          : DibaLightNeutrals.surface,
      borderRadius: const BorderRadius.all(Radius.circular(24)),
    ),
    child: ClipRRect(
      borderRadius: const BorderRadius.all(Radius.circular(24)),
      child: column,
    ),
  );
}

class _AccordionItem extends StatefulWidget {
  const _AccordionItem({
    super.key,
    required this.title,
    required this.icon,
    required this.expanded,
    required this.disabled,
    required this.surface,
    required this.last,
    required this.onToggle,
    required this.children,
  });

  final String title;
  final Widget? icon;
  final bool expanded;
  final bool disabled;
  final bool surface;
  final bool last;
  final VoidCallback onToggle;
  final List<Widget> children;

  @override
  State<_AccordionItem> createState() => _AccordionItemState();
}

class _AccordionItemState extends State<_AccordionItem>
    with SingleTickerProviderStateMixin {
  /// The panel opens over 200ms as the web's does: its height on CSS's
  /// ease-out-quad and its opacity on ease-out, each run back the same way
  /// as it closes.
  late final AnimationController _open = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 200),
    value: widget.expanded ? 1 : 0,
  );
  late final Animation<double> _height = CurvedAnimation(
    parent: _open,
    curve: _easeOutQuad,
    reverseCurve: _easeOutQuad.flipped,
  );
  late final Animation<double> _fade = CurvedAnimation(
    parent: _open,
    curve: _easeOut,
    reverseCurve: _easeOut.flipped,
  );
  bool _hovered = false;
  bool _focused = false;

  @override
  void didUpdateWidget(_AccordionItem old) {
    super.didUpdateWidget(old);
    if (widget.expanded != old.expanded) {
      widget.expanded ? _open.forward() : _open.reverse();
    }
  }

  @override
  void dispose() {
    _open.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final w = widget;
    final ink = _ink(context);
    // A closed row under the pointer: the text's colour at 3% (the web's
    // `color-mix(foreground 3%, transparent 90%)`), the fill on the surface.
    final hover = w.surface
        ? (_dark(context) ? DibaDarkNeutrals.fill : DibaLightNeutrals.fill)
        : ink.withValues(alpha: 0.03);
    final row = Container(
      color: _hovered && !w.expanded && !w.disabled ? hover : null,
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          if (w.icon != null) ...[w.icon!, const SizedBox(width: 12)],
          Expanded(
            child: Text(
              w.title,
              style: _type(
                context,
                14,
                20,
                colour: ink,
                weight: FontWeight.w500,
              ),
            ),
          ),
          AnimatedRotation(
            turns: w.expanded ? -0.5 : 0,
            duration: const Duration(milliseconds: 250),
            curve: _turn,
            child: DibaGlyphMark(
              DibaGlyph.chevronDown,
              size: 16,
              color: _muted(context),
            ),
          ),
        ],
      ),
    );
    final heading = Semantics(
      button: true,
      expanded: w.expanded,
      enabled: !w.disabled,
      // Hover from a MouseRegion: FocusableActionDetector's highlight waits
      // for Flutter to have seen a mouse, and missed the first.
      child: MouseRegion(
        cursor: w.disabled
            ? SystemMouseCursors.basic
            : SystemMouseCursors.click,
        onEnter: (_) => setState(() => _hovered = true),
        onExit: (_) => setState(() => _hovered = false),
        child: FocusableActionDetector(
          enabled: !w.disabled,
          onFocusChange: (on) => setState(() => _focused = on),
          actions: {
            ActivateIntent: CallbackAction<ActivateIntent>(
              onInvoke: (_) {
                w.onToggle();
                return null;
              },
            ),
          },
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: w.disabled ? null : w.onToggle,
            child: CustomPaint(
              foregroundPainter: _focused && dibaKeyboardFocus()
                  ? DibaRingPainter.of(context, const RoundedRectangleBorder())
                  : null,
              child: Opacity(opacity: w.disabled ? 0.5 : 1, child: row),
            ),
          ),
        ),
      ),
    );
    final panel = AnimatedBuilder(
      animation: _open,
      builder: (context, child) => _open.value == 0
          ? const SizedBox.shrink()
          : SizeTransition(
              sizeFactor: _height,
              alignment: AlignmentDirectional.topCenter,
              child: FadeTransition(opacity: _fade, child: child),
            ),
      child: Padding(
        padding: const EdgeInsetsDirectional.fromSTEB(16, 0, 16, 16),
        child: _column(w.children),
      ),
    );
    final item = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [heading, panel],
    );
    if (w.last) return item;
    return Stack(
      children: [
        item,
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          height: 1,
          child: FractionallySizedBox(
            widthFactor: w.surface ? 0.94 : 1,
            child: ColoredBox(
              color: w.surface ? ink.withValues(alpha: 0.06) : _line(context),
            ),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Separator

/// A line down, the web's `w-px min-h-2 self-stretch`: 1 across and as tall
/// as the row that holds it, at least 8. A horizontal Stack holding one
/// measures its row first (own.dart), as a flex row stretches its items.
class _Rule extends LeafRenderObjectWidget {
  const _Rule(this.colour);

  final Color colour;

  @override
  RenderObject createRenderObject(BuildContext context) => _RenderRule(colour);

  @override
  void updateRenderObject(BuildContext context, _RenderRule rule) =>
      rule.colour = colour;
}

class _RenderRule extends RenderBox {
  _RenderRule(this._colour);

  Color _colour;
  set colour(Color value) {
    if (value == _colour) return;
    _colour = value;
    markNeedsPaint();
  }

  @override
  double computeMinIntrinsicWidth(double height) => 1;

  @override
  double computeMaxIntrinsicWidth(double height) => 1;

  @override
  double computeMinIntrinsicHeight(double width) => 8;

  @override
  double computeMaxIntrinsicHeight(double width) => 8;

  @override
  Size computeDryLayout(BoxConstraints constraints) => constraints.constrain(
    Size(1, constraints.hasBoundedHeight ? constraints.maxHeight : 8),
  );

  @override
  void performLayout() => size = computeDryLayout(constraints);

  @override
  void paint(PaintingContext context, Offset offset) =>
      context.canvas.drawRect(offset & size, Paint()..color = _colour);
}

// ---------------------------------------------------------------------------
// Drawer

/// A drawer from [edge], on Flutter's motion, the web's too: it slides in
/// over 250ms on easeOutCubic and out over 250ms on easeInCubic run back, and
/// the web's backdrop under it fades on Material's ease, as a barrier does.
Future<void> _openSheet(
  BuildContext context, {
  required String edge,
  required String backdrop,
  required bool dismissible,
  required String? label,
  required Widget Function(BuildContext context) sheet,
}) => showGeneralDialog<void>(
  context: context,
  barrierDismissible: dismissible,
  barrierLabel:
      label ?? MaterialLocalizations.of(context).modalBarrierDismissLabel,
  barrierColor: backdrop == 'transparent'
      ? Colors.transparent
      : Theme.of(context).colorScheme.scrim,
  transitionDuration: const Duration(milliseconds: 250),
  pageBuilder: (routeContext, _, _) => sheet(routeContext),
  transitionBuilder: (routeContext, animation, _, child) {
    final rtl = Directionality.of(routeContext) == TextDirection.rtl;
    final from = switch (edge) {
      'top' => const Offset(0, -1),
      'start' => Offset(rtl ? 1 : -1, 0),
      'end' => Offset(rtl ? -1 : 1, 0),
      _ => const Offset(0, 1),
    };
    final curved = CurvedAnimation(
      parent: animation,
      curve: Curves.easeOutCubic,
      reverseCurve: Curves.easeInCubic,
    );
    Widget slid = SlideTransition(
      position: Tween(begin: from, end: Offset.zero).animate(curved),
      child: child,
    );
    if (backdrop == 'blur') {
      // What is behind blurred 12, as the web's `backdrop-blur-md`, fading
      // with the barrier.
      slid = Stack(
        children: [
          Positioned.fill(
            child: IgnorePointer(
              child: FadeTransition(
                opacity: CurvedAnimation(parent: animation, curve: Curves.ease),
                child: BackdropFilter(
                  filter: ui.ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                  child: const SizedBox.expand(),
                ),
              ),
            ),
          ),
          slid,
        ],
      );
    }
    return slid;
  },
);

/// The drawer's paper, the web's: the overlay's paper and shadow, 24 in (8
/// at a top one's end); 16 round at its inner edge from the top or bottom, as
/// tall as it needs up to 85% of the window and as wide as it; from a side,
/// full height, square, 320 wide (384 from 640) and at most 85% of the window.
/// A bottom one has a handle 36 by 4 in the separator's colour, 8 above the
/// title; the close button 16 from the top and the end; the title 16 on 24,
/// medium; the blocks 8 under it, 3 in; the footer 20 under them, at the end.
Widget _drawerBody(
  BuildContext context,
  DibaNodeContext node, {
  required String edge,
  required VoidCallback close,
}) {
  final dark = _dark(context);
  final strings = DibaStrings.of(context);
  final vertical = edge == 'bottom' || edge == 'top';
  const radius = Radius.circular(16);
  final base = DibaTheme.overlay(dark: dark, radius: 0);
  final paper = ShapeDecoration(
    color: base.color,
    shadows: base.shadows,
    shape: RoundedRectangleBorder(
      borderRadius: switch (edge) {
        'top' => const BorderRadius.vertical(bottom: radius),
        'bottom' => const BorderRadius.vertical(top: radius),
        _ => BorderRadius.zero,
      },
      side: (base.shape as RoundedRectangleBorder).side,
    ),
  );
  final size = MediaQuery.sizeOf(context);
  final footer = node.slots['footer'];
  final content = Column(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      if (edge == 'bottom')
        Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: _line(context),
                borderRadius: const BorderRadius.all(Radius.circular(2)),
              ),
            ),
          ),
        ),
      Semantics(
        header: true,
        child: Text(
          node.prop<String>('title') ?? '',
          style: _type(
            context,
            16,
            24,
            colour: _ink(context),
            weight: FontWeight.w500,
          ),
        ),
      ),
      const SizedBox(height: 8),
      Flexible(
        fit: vertical ? FlexFit.loose : FlexFit.tight,
        // 3 above and below inside the scroll, as the web's body keeps room
        // for a focus ring.
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(vertical: 3),
          child: _column(node.children),
        ),
      ),
      if (footer != null) ...[
        const SizedBox(height: 20),
        Align(alignment: AlignmentDirectional.centerEnd, child: footer),
      ],
    ],
  );
  final across = (size.width >= 640 ? 384.0 : 320.0).clamp(
    0.0,
    size.width * 0.85,
  );
  final panel = DecoratedBox(
    decoration: paper,
    child: ConstrainedBox(
      constraints: vertical
          ? BoxConstraints(
              minWidth: size.width,
              maxWidth: size.width,
              maxHeight: size.height * 0.85,
            )
          : BoxConstraints.tightFor(width: across, height: size.height),
      child: Stack(
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(24, 24, 24, edge == 'top' ? 8 : 24),
            child: SafeArea(child: content),
          ),
          PositionedDirectional(
            top: 16,
            end: 16,
            child: dibaCloseButton(
              context,
              label: strings.close,
              onPressed: close,
            ),
          ),
        ],
      ),
    ),
  );
  return Align(
    alignment: switch (edge) {
      'top' => Alignment.topCenter,
      'start' => AlignmentDirectional.centerStart,
      'end' => AlignmentDirectional.centerEnd,
      _ => Alignment.bottomCenter,
    },
    child: panel,
  );
}

/// A sheet's stops: each a share of its extent, from `33%` or `0.33`;
/// all of it is always the last. Null when it has none.
List<double>? _stops(Object? value) {
  final stops = <double>[];
  for (final raw in dibaKeys(value)) {
    final s = raw.trim();
    final share = s.endsWith('%')
        ? (double.tryParse(s.substring(0, s.length - 1)) ?? -1) / 100
        : double.tryParse(s) ?? -1;
    if (share > 0 && share < 1) stops.add(share);
  }
  if (stops.isEmpty) return null;
  stops.sort();
  return [...stops, 1];
}

/// The sheet's paper, the drawer's numbers: the overlay's paper
/// and shadow; from the top or bottom as wide as the window and as tall as it
/// needs up to 32 short of it (all of it with stops, as the web's), 16 round at its inner
/// edge; from a side as tall as the window, 384 wide or 96% of it, round at its
/// inner edge; off the edge (detached) 8 from every side and round all round.
/// A bottom one's handle is 36 by 4 in the separator's colour, 12 from its
/// edge with 12 under it; the title 16 on 24 and medium, 24 in, 36 from the
/// edge after a handle and 24 without; its blocks 16 under it and 16 apart;
/// the footer 20 under them, 24 from the bottom, at the end; the close button
/// 16 from the top and the end. A top one's handle is at its bottom.
Widget _sheetBody(
  BuildContext context,
  DibaNodeContext node, {
  required String edge,
  required bool detached,
  required bool stopped,
  required VoidCallback close,
}) {
  final dark = _dark(context);
  final strings = DibaStrings.of(context);
  final vertical = edge == 'bottom' || edge == 'top';
  const r = Radius.circular(16);
  final rtl = Directionality.of(context) == TextDirection.rtl;
  // The physical edge a start or end sheet is at.
  final left = (edge == 'start') != rtl;
  final base = DibaTheme.overlay(dark: dark, radius: 0);
  final paper = ShapeDecoration(
    color: base.color,
    shadows: base.shadows,
    shape: RoundedRectangleBorder(
      borderRadius: detached
          ? const BorderRadius.all(r)
          : switch (edge) {
              'top' => const BorderRadius.vertical(bottom: r),
              'bottom' => const BorderRadius.vertical(top: r),
              _ =>
                left
                    ? const BorderRadius.horizontal(right: r)
                    : const BorderRadius.horizontal(left: r),
            },
      side: (base.shape as RoundedRectangleBorder).side,
    ),
  );
  final size = MediaQuery.sizeOf(context);
  final margin = detached ? 8.0 : 0.0;
  final footer = node.slots['footer'];
  final handle = Padding(
    padding: const EdgeInsets.symmetric(vertical: 12),
    child: Center(
      child: Container(
        width: 36,
        height: 4,
        decoration: BoxDecoration(
          color: _line(context),
          borderRadius: const BorderRadius.all(Radius.circular(2)),
        ),
      ),
    ),
  );
  final fill = stopped || !vertical;
  final content = Column(
    mainAxisSize: fill ? MainAxisSize.max : MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      if (edge == 'bottom') handle,
      Padding(
        padding: EdgeInsetsDirectional.fromSTEB(
          24,
          edge == 'bottom' ? 8 : 24,
          24,
          8,
        ),
        child: Semantics(
          header: true,
          child: Text(
            node.prop<String>('title') ?? '',
            style: _type(
              context,
              16,
              24,
              colour: _ink(context),
              weight: FontWeight.w500,
            ),
          ),
        ),
      ),
      Flexible(
        fit: fill ? FlexFit.tight : FlexFit.loose,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          child: _column(node.children),
        ),
      ),
      if (footer != null)
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
          child: Align(
            alignment: AlignmentDirectional.centerEnd,
            child: footer,
          ),
        ),
      if (edge == 'top') handle,
    ],
  );
  final across = (size.width * 0.96).clamp(0.0, 384.0);
  // With stops it is the window's height, as the web's is (its stops are shares of it); off the
  // edge, 16 short.
  final tall = size.height - (detached ? 16 : (stopped ? 0 : 32));
  return ConstrainedBox(
    constraints: vertical
        ? BoxConstraints(
            minWidth: size.width - 2 * margin,
            maxWidth: size.width - 2 * margin,
            maxHeight: tall,
            minHeight: stopped ? tall : 0,
          )
        : BoxConstraints.tightFor(
            width: stopped ? size.width - 2 * margin : across,
            height: size.height - 2 * margin,
          ),
    child: DecoratedBox(
      decoration: paper,
      child: Stack(
        children: [
          SafeArea(child: content),
          PositionedDirectional(
            top: 16,
            end: 16,
            child: dibaCloseButton(
              context,
              label: strings.close,
              onPressed: close,
            ),
          ),
        ],
      ),
    ),
  );
}

/// A sheet the hand moves: dragged toward its edge it goes, to the
/// next stop down or, past half the lowest, away; dragged back it comes up to
/// the next; let go, it settles on the nearest stop over 250ms on
/// easeOutCubic. Without stops its one stop is all of it. Not dismissable, it
/// stops at the lowest. It opens on its first stop.
class _Swiped extends StatefulWidget {
  const _Swiped({
    required this.edge,
    required this.stops,
    required this.dismissible,
    required this.detached,
    required this.close,
    required this.child,
    this.ownScrim = false,
  });

  final String edge;
  final List<double> stops;
  final bool dismissible;
  final bool detached;
  final VoidCallback close;
  final Widget child;

  /// Whether it dims the page itself, by how far it has risen, where the
  /// route's barrier is left clear.
  final bool ownScrim;

  @override
  State<_Swiped> createState() => _SwipedState();
}

class _SwipedState extends State<_Swiped> with SingleTickerProviderStateMixin {
  late final AnimationController _shown = AnimationController(
    vsync: this,
    value: widget.stops.first,
    lowerBound: 0,
    upperBound: 1,
  );
  final GlobalKey _paper = GlobalKey();

  @override
  void dispose() {
    _shown.dispose();
    super.dispose();
  }

  /// Toward the sheet's edge, on screen: down for a bottom one.
  Offset get _out {
    final rtl = Directionality.of(context) == TextDirection.rtl;
    return switch (widget.edge) {
      'top' => const Offset(0, -1),
      'start' => Offset(rtl ? 1 : -1, 0),
      'end' => Offset(rtl ? -1 : 1, 0),
      _ => const Offset(0, 1),
    };
  }

  bool get _vertical => widget.edge == 'bottom' || widget.edge == 'top';

  double get _extent {
    final size =
        (_paper.currentContext?.findRenderObject() as RenderBox?)?.size;
    if (size == null) return 1;
    return _vertical ? size.height : size.width;
  }

  void _drag(DragUpdateDetails d) {
    final toward = d.delta.dx * _out.dx + d.delta.dy * _out.dy;
    final floor = widget.dismissible ? 0.0 : widget.stops.first;
    _shown.value = (_shown.value - toward / _extent).clamp(floor, 1.0);
  }

  void _settle(DragEndDetails d) {
    final v = d.velocity.pixelsPerSecond;
    final toward = v.dx * _out.dx + v.dy * _out.dy;
    final now = _shown.value;
    double target;
    if (toward > 700) {
      target = widget.stops.lastWhere((s) => s < now - 0.01, orElse: () => 0);
    } else if (toward < -700) {
      target = widget.stops.firstWhere((s) => s > now + 0.01, orElse: () => 1);
    } else {
      target = widget.stops.reduce(
        (a, b) => (a - now).abs() <= (b - now).abs() ? a : b,
      );
      if (now < widget.stops.first / 2) target = 0;
    }
    if (target == 0 && !widget.dismissible) target = widget.stops.first;
    _shown
        .animateTo(
          target,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOutCubic,
        )
        .whenComplete(() {
          if (target == 0 && mounted) widget.close();
        });
  }

  @override
  Widget build(BuildContext context) {
    final paper = KeyedSubtree(key: _paper, child: widget.child);
    final stops = widget.stops;
    Widget moved = AnimatedBuilder(
      animation: _shown,
      builder: (context, child) => FractionalTranslation(
        translation: _out * (1 - _shown.value),
        child: child,
      ),
      child: paper,
    );
    moved = _vertical
        ? GestureDetector(
            onVerticalDragUpdate: _drag,
            onVerticalDragEnd: _settle,
            child: moved,
          )
        : GestureDetector(
            onHorizontalDragUpdate: _drag,
            onHorizontalDragEnd: _settle,
            child: moved,
          );
    final placed = Padding(
      padding: EdgeInsets.all(widget.detached ? 8 : 0),
      child: Align(
        alignment: switch (widget.edge) {
          'top' => Alignment.topCenter,
          'start' => AlignmentDirectional.centerStart,
          'end' => AlignmentDirectional.centerEnd,
          _ => Alignment.bottomCenter,
        },
        child: moved,
      ),
    );
    if (!widget.ownScrim || stops.length < 2) return placed;
    // With stops the page is dimmed only as the sheet rises from its last
    // stop to all of it, as the web's backdrop fades over that range.
    final from = stops[stops.length - 2];
    return Stack(
      children: [
        Positioned.fill(
          child: IgnorePointer(
            child: AnimatedBuilder(
              animation: _shown,
              builder: (context, _) => ColoredBox(
                color: Theme.of(context).colorScheme.scrim.withValues(
                  alpha:
                      Theme.of(context).colorScheme.scrim.a *
                      ((_shown.value - from) / (1 - from)).clamp(0.0, 1.0),
                ),
              ),
            ),
          ),
        ),
        placed,
      ],
    );
  }
}

// ---------------------------------------------------------------------------

final Map<String, DibaBuilder> structureBlocks = {
  'Tabs': (context, node) => _DibaTabs(node: node),
  'Tab': (context, node) => const SizedBox.shrink(),
  'Accordion': _accordion,
  'AccordionItem': (context, node) => const SizedBox.shrink(),

  /// A line across or down, the web's: 1 thick in the separator's colour;
  /// the secondary and tertiary darker, the surface mixed 15% and 19% towards
  /// its text in Oklab, as the web's `--separator-secondary` and `-tertiary`.
  'Separator': (context, node) {
    final dark = _dark(context);
    final surface = dark ? DibaDarkNeutrals.surface : DibaLightNeutrals.surface;
    final colour = switch (node.str('variant', 'default')) {
      'secondary' => dibaMixOklab(surface, 0.85, _ink(context), 0.15),
      'tertiary' => dibaMixOklab(surface, 0.81, _ink(context), 0.19),
      _ => _line(context),
    };
    final vertical = node.str('orientation', 'horizontal') == 'vertical';
    // In a Toolbar it runs across the toolbar, half its row's height or half
    // its column's width, centred, whatever the tree says. Read where
    // it is mounted: blocks are built with the surface's context.
    return Builder(
      builder: (mounted) {
        final toolbar = DibaToolbarScope.maybeOf(mounted);
        if (toolbar == null) {
          return vertical
              ? _Rule(colour)
              : Divider(height: 1, thickness: 1, color: colour);
        }
        final line = ColoredBox(color: colour);
        return toolbar.vertical
            ? Align(
                child: FractionallySizedBox(
                  widthFactor: 0.5,
                  child: SizedBox(height: 1, child: line),
                ),
              )
            : FractionallySizedBox(
                heightFactor: 0.5,
                child: SizedBox(width: 1, child: line),
              );
      },
    );
  },

  /// A titled group of fields, the web's: its legend 16 on 24 and medium, its
  /// description 12 on 16 and muted right under it, then its fields 24 down
  /// and 16 apart.
  'Fieldset': (context, node) {
    final description = node.prop<String>('description');
    return Semantics(
      container: true,
      label: node.prop<String>('legend'),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 24,
        children: [
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                node.prop<String>('legend') ?? '',
                style: _type(
                  context,
                  16,
                  24,
                  colour: _ink(context),
                  weight: FontWeight.w500,
                ),
              ),
              if (description != null)
                Text(
                  description,
                  style: _type(context, 12, 16, colour: _muted(context)),
                ),
            ],
          ),
          _column(node.children),
        ],
      ),
    );
  },

  /// A drawer opened by its trigger, as a Modal is: the web's paper from
  /// the tree's edge, start and end following the page's direction.
  'Drawer': (context, node) {
    final trigger = node.slots['trigger'];
    if (trigger == null) {
      node.refuse('no trigger');
      return const SizedBox.shrink();
    }
    return dibaTrigger(trigger, () async {
      node.fire('onOpenChange', true);
      final edge = node.str('placement', 'bottom');
      await _openSheet(
        context,
        edge: edge,
        backdrop: node.str('backdrop', 'opaque'),
        dismissible: node.flagOr('isDismissable', true),
        label: node.prop<String>('title'),
        sheet: (sheetContext) => node.overlay(
          close: () => dibaCloseRoute(sheetContext),
          child: node.live(
            (c, n) =>
                _drawerBody(c, n, edge: edge, close: () => dibaCloseRoute(c)),
          ),
        ),
      );
      node.fire('onOpenChange', false);
    });
  },

  /// A sheet opened by its trigger, as a Drawer is, drawn by the
  /// drawer's numbers and coming in on its motion; the hand swipes it
  /// away, or to the stops it is given.
  'Sheet': (context, node) {
    final trigger = node.slots['trigger'];
    if (trigger == null) {
      node.refuse('no trigger');
      return const SizedBox.shrink();
    }
    // At its trigger's own width, as the web's is, wherever it stands.
    final opener = dibaTrigger(trigger, () async {
      node.fire('onOpenChange', true);
      final edge = node.str('placement', 'bottom');
      final dismissible = node.flagOr('isDismissable', true);
      final detached = node.flag('isDetached');
      final stops = _stops(node.prop<Object>('snapPoints'));
      final backdrop = node.str('backdrop', 'opaque');
      // An opaque one with stops dims the page itself as it rises.
      final ownScrim = stops != null && backdrop == 'opaque';
      await _openSheet(
        context,
        edge: edge,
        backdrop: ownScrim ? 'transparent' : backdrop,
        dismissible: dismissible,
        label: node.prop<String>('title'),
        sheet: (sheetContext) => node.overlay(
          close: () => dibaCloseRoute(sheetContext),
          child: _Swiped(
            edge: edge,
            stops: stops ?? const [1],
            ownScrim: ownScrim,
            dismissible: dismissible,
            detached: detached,
            close: () => dibaCloseRoute(sheetContext),
            child: node.live(
              (c, n) => _sheetBody(
                c,
                n,
                edge: edge,
                detached: detached,
                stopped: stops != null,
                close: () => dibaCloseRoute(c),
              ),
            ),
          ),
        ),
      );
      node.fire('onOpenChange', false);
    });
    return Align(
      alignment: AlignmentDirectional.centerStart,
      widthFactor: 1,
      child: opener,
    );
  },
};
