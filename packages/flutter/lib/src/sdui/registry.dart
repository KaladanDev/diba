import 'blocks/actions.dart';
import 'blocks/choices.dart';
import 'blocks/containers.dart';
import 'blocks/dates.dart';
import 'blocks/fields.dart';
import 'blocks/hints.dart';
import 'blocks/inputs.dart';
import 'blocks/own.dart';
import 'blocks/pickers.dart';
import 'blocks/six.dart';
import 'blocks/status.dart';
import 'blocks/structure.dart';
import 'node.dart';

export 'node.dart' show DibaNodeContext, DibaBuilder, DibaItem;

/// Which Material widget a `type` in a tree becomes.
///
/// Hand-written, unlike the React side, which derives its registry from the
/// package's own exports — Dart has no equivalent of that reflection, so the
/// gap between this map and the manifest has to be a tested fact rather than a
/// structural one. `sdui_test.dart` holds the two together and names every
/// component still missing, so the list shrinks visibly instead of being
/// forgotten.
///
/// One file per group of the schema surface, so a group's review reads one
/// file.
final Map<String, DibaBuilder> dibaRegistry = {
  ...actionBlocks,
  ...fieldBlocks,
  ...pickerBlocks,
  ...choiceBlocks,
  ...statusBlocks,
  ...containerBlocks,
  ...dateBlocks,
  ...structureBlocks,
  ...hintBlocks,
  ...inputBlocks,
  ...ownBlocks,
  ...sixBlocks,
};
