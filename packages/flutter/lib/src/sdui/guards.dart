/// What a tree from somewhere else is not allowed to do.
///
/// The mirror of `packages/react/src/sdui/guards.ts`. Two renderers that
/// disagree about what is permitted is a security bug on whichever one is more
/// generous, so these are deliberately the same rules in the same order.
///
/// None of it replaces validating against the generated JSON Schema first;
/// these are the checks a schema cannot express.
library;

/// Schemes a URL from a tree may use. Everything else is refused.
const Set<String> _safeSchemes = {'http', 'https', 'mailto', 'tel'};

/// True for a URL the host may follow.
///
/// Relative paths and fragments carry no scheme and are the common case.
/// `data:` is allowed only for images — `data:text/html` is a whole document,
/// which is the same hole `javascript:` is, wearing a hat.
bool isSafeUrl(String value) {
  final trimmed = value.trim();
  if (trimmed.isEmpty) return true;
  if (RegExp(r'^[./#?]').hasMatch(trimmed)) return true;
  if (RegExp(
    r'^data:image/(png|jpeg|gif|webp|svg\+xml);',
    caseSensitive: false,
  ).hasMatch(trimmed)) {
    return true;
  }
  final uri = Uri.tryParse(trimmed);
  if (uri == null) return false;
  if (!uri.hasScheme) return true;
  return _safeSchemes.contains(uri.scheme.toLowerCase());
}

// There is no by-value guard any more. It refused any string that began
// with a word and a colon — "Warning: stock is low", "Re: your order",
// `sku:123` — in any prop. URLs are guarded by prop instead: the manifest
// gives each URL prop a format, and the surface holds those props, and only
// those, to [isSafeUrl] or [isSafeImageUrl].

/// How large a tree may be before it is refused whole.
class DibaLimits {
  const DibaLimits({this.depth = 32, this.nodes = 500});

  /// How deeply nodes may nest.
  final int depth;

  /// How many nodes the whole tree may contain.
  final int nodes;
}

/// Why a tree was refused, or null if it was not.
///
/// Not a security boundary so much as a courtesy one. A tree two thousand
/// levels deep does not breach anything — it just takes the app down, which
/// from the merchant's side is indistinguishable from the admin being broken.
String? checkTree(Object? node, [DibaLimits limits = const DibaLimits()]) {
  var count = 0;

  String? walk(Object? n, int depth) {
    if (n is! Map) return null;
    if (depth > limits.depth) return 'tree deeper than ${limits.depth} levels';
    if (++count > limits.nodes) return 'tree larger than ${limits.nodes} nodes';

    final children = n['children'];
    if (children is List) {
      for (final child in children) {
        final bad = walk(child, depth + 1);
        if (bad != null) return bad;
      }
    }
    // Slots are nodes too. Counting only children let a tree hide any amount
    // of work in a trigger or a footer, and the schema leans on slots for every
    // overlay. The web's guard counts them the same way.
    final slots = n['slots'];
    if (slots is Map) {
      for (final slot in slots.values) {
        final bad = walk(slot, depth + 1);
        if (bad != null) return bad;
      }
    }
    return null;
  }

  return walk(node, 1);
}

/// A value that may be recorded and later sent to the extension, or null.
///
/// Handlers hand back whatever they like. Storing an arbitrary object would
/// mean posting whatever it happens to serialise to a third-party server the
/// next time an action named that key — a data leak dressed as a convenience.
///
/// It lives here beside the other guards rather than inside the renderer, and
/// it has its own tests: breaking it on purpose once changed no test at all,
/// which is a guard with no coverage rather than a guard that works.
///
/// The schema widens what a value can be: a range slider's two numbers stay
/// numbers, and a Table's sort is a flat `{column, direction}` map. Nothing
/// nested, and nothing that is not a string, number or bool.
Object? serialisableValue(Object? value) {
  if (_primitive(value)) return value;
  if (value is Iterable) return value.where(_primitive).toList();
  if (value is Map) {
    return {
      for (final e in value.entries)
        if (e.key is String && _primitive(e.value)) e.key as String: e.value,
    };
  }
  return null;
}

bool _primitive(Object? v) => v is String || v is num || v is bool;

/// True for a URL an image may load from: a relative path, http(s), or a
/// `data:image`. Stricter than [isSafeUrl], which also lets `mailto:` and
/// `tel:` through — fine for a link, meaningless for a picture.
bool isSafeImageUrl(String value) {
  final trimmed = value.trim();
  if (!isSafeUrl(trimmed) || trimmed.isEmpty) return false;
  final uri = Uri.tryParse(trimmed);
  if (uri == null || !uri.hasScheme) return true;
  return {'http', 'https', 'data'}.contains(uri.scheme.toLowerCase());
}
