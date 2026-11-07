import 'package:flutter/material.dart';

import 'tokens.g.dart';

/// v3's tab list: a rounded track in `segment-list` that the selected
/// tab's pill sits in.
///
/// DibaTheme draws the pill, the labels and the absence of a divider through
/// the TabBar theme. A theme cannot draw behind the bar, so this widget does:
/// wrap a [TabBar]'s tabs in it wherever a host or a block shows tabs.
///
/// The list is the md tab height plus the list padding on each side, and every
/// tab is the md tab height, so the pill sits inside the track with the padding
/// all round.
class DibaTabList extends StatelessWidget {
  const DibaTabList({
    super.key,
    required this.tabs,
    this.controller,
    this.onTap,
    this.icons,
  });

  /// One label per tab.
  final List<String> tabs;

  /// An icon before each label, or null for none.
  final List<Widget?>? icons;

  /// The bar's controller; the nearest DefaultTabController when null.
  final TabController? controller;

  /// Called with a tab's index when it is tapped.
  final ValueChanged<int>? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dark = theme.brightness == Brightness.dark;
    final pill = theme.tabBarTheme.indicator;
    const height = DibaDimens.tabHeightMd + 2 * DibaDimens.tabListP;
    return Container(
      height: height,
      padding: const EdgeInsets.all(DibaDimens.tabListP),
      decoration: ShapeDecoration(
        shape: const StadiumBorder(),
        color: dark ? DibaDarkColors.segmentList : DibaLightColors.segmentList,
      ),
      child: TabBar(
        controller: controller,
        onTap: onTap,
        // TabBar pads every tab by the underline's weight, which would put a
        // pill's label off centre. A pill has no underline, and TabBar takes
        // a weight of zero only when the indicator is passed to it directly.
        indicator: pill,
        indicatorWeight: pill == null ? 2 : 0,
        tabs: [
          for (final (i, label) in tabs.indexed)
            icons?.elementAtOrNull(i) == null
                ? Tab(height: DibaDimens.tabHeightMd, text: label)
                : Tab(
                    height: DibaDimens.tabHeightMd,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      spacing: 8,
                      children: [icons![i]!, Text(label)],
                    ),
                  ),
        ],
      ),
    );
  }
}
