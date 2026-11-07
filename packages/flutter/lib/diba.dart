/// Diba for Flutter.
///
/// Two layers: the generated design tokens with a Material 3 theme built from
/// them, and the SDUI renderer that draws trees the host did not write.
library;

export 'src/tokens.g.dart';
export 'src/tab_list.dart';
export 'src/manifest.g.dart' show dibaManifest, dibaManifestVersion, DibaSpec;
export 'src/sdui/format.dart';
export 'src/sdui/guards.dart';
export 'src/sdui/icons.dart';
export 'src/sdui/colours.dart';
export 'src/sdui/persian_calendar.dart';
export 'src/sdui/registry.dart'
    show dibaRegistry, DibaNodeContext, DibaBuilder, DibaItem;
export 'src/sdui/extension.dart';
export 'src/sdui/strings.dart'
    show
        DibaStrings,
        dibaIsPersian,
        dibaMessages,
        dibaEmailPattern,
        dibaUrlPattern,
        dibaIsEmail,
        dibaIsWebUrl;
export 'src/sdui/surface.dart';
