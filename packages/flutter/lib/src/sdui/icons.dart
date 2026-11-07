import 'package:flutter/widgets.dart';

import 'icons.g.dart';

export 'icons.g.dart' show dibaIcons, dibaMirroredIcons;

// The icon list lives in `packages/schema/src/icons.json`, the one list both
// platforms draw from. The schema build generates `icons.g.dart` from
// it: a const table, because Dart cannot look a member up by name and a const
// table is what lets the icon font be tree-shaken to the icons listed.
//
// Which icons mirror is a decision the list records, not one each platform
// makes: the admin mirrors two chevrons by hand today, in two different ways.

/// The icon for [name], or null when it is not on the list.
IconData? dibaIcon(Object? name) => name is String ? dibaIcons[name] : null;
