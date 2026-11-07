import 'package:flutter/material.dart';

import '../tokens.g.dart';

/// The tone for one of v3's colour words — default, accent, success, warning,
/// danger — from the theme's [DibaStatusColors].
///
/// Material's ColorScheme has no success, warning or info role, so the colours
/// come from the extension Diba's tokens package generates and DibaTheme
/// registers. A host theme built some other way falls back to the generated
/// light or dark set, by brightness, rather than to Material's guess.
DibaStatusTone dibaTone(BuildContext context, String? colour) {
  final theme = Theme.of(context);
  final colours =
      theme.extension<DibaStatusColors>() ??
      (theme.brightness == Brightness.dark
          ? DibaStatusColors.dark
          : DibaStatusColors.light);
  return colours.of(colour);
}

/// An indicator's fill on its track: a progress bar's, a meter's, a ring's arc. The tone's solid
/// colour, but in light the accent's and the warning's emphasis: the gilt and the amber are 1.19
/// and 1.59 from the off-track shade there, under the 3 WCAG 1.4.11 asks of a fill, as the web's.
Color dibaIndicator(BuildContext context, String? colour) {
  final tone = dibaTone(context, colour);
  final light = Theme.of(context).brightness != Brightness.dark;
  return light && (colour == 'accent' || colour == 'warning')
      ? tone.ink
      : tone.solid;
}
