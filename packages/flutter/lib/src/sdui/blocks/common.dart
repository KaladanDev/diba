import 'package:flutter/material.dart';

import '../icons.dart';
import '../node.dart';

/// The web's type: [size] on a [line] high line, the theme's face, none of
/// Material's letter spacing, the leading split above and below as CSS splits
/// it.
TextStyle dibaType(
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

/// What a grey card, secondary or tertiary, puts round what it holds, so a
/// block can tell it lies on the card's grey: a pager marks the page it shows
/// with the surface there, as the web's does, since its neutral fill is the
/// second surface's own colour in dark and the third's in light.
class DibaGreyPaper extends InheritedWidget {
  const DibaGreyPaper({super.key, required super.child});

  /// Whether [context] lies on a grey card.
  static bool of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<DibaGreyPaper>() != null;

  @override
  bool updateShouldNotify(DibaGreyPaper oldWidget) => false;
}

/// A trigger: what is in an overlay's `trigger` slot, opening it.
///
/// Every trigger slot takes a Button, and the Button opens the overlay
/// itself ([DibaTriggerScope]), so it keeps its hover, its pointer, its
/// press and its keyboard, as the web's trigger does; disabled, it opens
/// nothing. The trigger had been under IgnorePointer, opened by a tap round
/// it, which left a button that neither answered a hover nor shrank when
/// pressed, and that Enter did not open, as a dropdown's showed. Nothing
/// else listens for the tap: a second listener would
/// hold the button's press until the pointer came up, and a quick click
/// would not shrink it.
Widget dibaTrigger(Widget child, VoidCallback onTap) =>
    DibaTriggerScope._(open: onTap, child: child);

/// The overlay a trigger slot opens, for the button in the slot to open as
/// it is pressed.
class DibaTriggerScope extends InheritedWidget {
  const DibaTriggerScope._({required this.open, required super.child});

  final VoidCallback open;

  /// The scope a button is the trigger of, if it is in a trigger slot.
  static DibaTriggerScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<DibaTriggerScope>();

  @override
  bool updateShouldNotify(DibaTriggerScope old) => old.open != open;
}

/// An icon from the list, or null with a refusal when the name is not on it.
Widget? dibaIconFor(
  DibaNodeContext node,
  Object? name, {
  double? size,
  Color? colour,
}) {
  if (name == null) return null;
  final data = dibaIcon(name);
  if (data == null) {
    node.refuse('icon "$name" is not on the icon list');
    return null;
  }
  return Icon(data, size: size, color: colour);
}

/// The same for a child read as data.
Widget? dibaItemIcon(DibaItem item, {double? size, Color? colour}) {
  final data = dibaIcon(item.props['icon']);
  return data == null ? null : Icon(data, size: size, color: colour);
}

/// Closes the route [context] sits in, and only that one.
///
/// `Navigator.pop` pops whatever is on top — a date picker opened from inside
/// a dialog, say — so a `close` from the dialog would close the picker. This
/// removes the dialog's own route wherever it is in the stack.
void dibaCloseRoute(BuildContext context) {
  final route = ModalRoute.of(context);
  if (route == null || !route.isActive) return;
  final navigator = Navigator.of(context);
  if (route.isCurrent) {
    navigator.pop();
  } else {
    navigator.removeRoute(route);
  }
}

/// Whether the screen is phone-sized, where a dialog at the bottom and a
/// popover become bottom sheets.
bool dibaIsCompact(BuildContext context) =>
    (MediaQuery.maybeSizeOf(context)?.width ?? 1024) < 600;

/// Children spaced along a column.
List<Widget> dibaSpaced(List<Widget> children, double gap) {
  if (children.length < 2 || gap == 0) return children;
  return [
    for (var i = 0; i < children.length; i++) ...[
      if (i > 0) SizedBox(height: gap),
      children[i],
    ],
  ];
}

/// A ListBoxItem, DropdownItem or Radio's label: the text children, or a
/// `label` prop, or the id.
String dibaItemText(DibaItem item) =>
    item.text ?? item.prop<String>('label') ?? item.id ?? '';
