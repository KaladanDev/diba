import 'dart:convert';

import 'package:flutter/material.dart';

import 'guards.dart';
import 'surface.dart';

/// An action on its way back to the extension.
class DibaCall {
  const DibaCall({required this.name, required this.payload});

  final String name;
  final Map<String, Object?> payload;
}

/// What the host sends an extension.
///
/// The same shape for the first render and for every action after it — an
/// extension answering "give me the panel" and "the button was pressed" at two
/// different endpoints has two places to get the context wrong.
class DibaRequest {
  const DibaRequest({required this.surface, this.context, this.call});

  /// Which slot this is, e.g. `order.detail.sidebar`.
  final String surface;

  /// What the host already knows. The extension needs no ids of its own.
  final Map<String, Object?>? context;

  /// Absent on the first render; present when an action fired.
  final DibaCall? call;
}

/// A host effect an extension may request.
///
/// Some things it legitimately wants are not shaped like a tree. A toast is
/// imperative and lives for two seconds, which is exactly why Toast is not a
/// block in the manifest and cannot be a node.
///
/// A toast here speaks the `toast` verb's words — `status`, `title` and
/// `description` — so an extension says it the same way in a tree and after a
/// `call`.
class DibaEffect {
  const DibaEffect({this.status, this.title, this.description, this.navigate});

  /// default, accent, success, warning or danger.
  final String? status;
  final String? title;
  final String? description;

  /// Checked before it reaches the host, exactly like the `navigate` verb.
  final String? navigate;

  /// Whether this effect carries a toast.
  bool get hasToast => title != null || description != null;

  DibaEffect withoutNavigate() =>
      DibaEffect(status: status, title: title, description: description);

  bool get isEmpty => !hasToast && navigate == null;
}

/// What an extension sends back: a tree, an effect, or both.
class DibaResponse {
  const DibaResponse({this.tree, this.effect});

  /// New UI for the surface. Replaces what is there; validated before it renders.
  final Object? tree;
  final DibaEffect? effect;
}

/// How the host talks to an extension.
///
/// Injected rather than built in. Authentication, the timeout budget and the
/// proxy live here and none of them belong to a design system — and an
/// extension that receives the request directly also receives the merchant's
/// session. It also means the whole round trip is exercised without a network.
typedef DibaTransport = Future<DibaResponse> Function(DibaRequest request);

/// Checks a tree and returns the reasons it is not legal. Empty means legal.
typedef DibaValidator = List<String> Function(Object? tree);

/// One extension panel, from fetch to render to the round trip after a press.
///
/// The Dart counterpart of `DibaExtension` in `@kaladan/diba-react/sdui`, with
/// the same guarantees in the same order: nothing renders before it is checked,
/// a tree returned from an action is checked exactly like the first one, and an
/// effect's URL goes through the same guard as the verb.
///
/// One difference is worth stating rather than discovering. There is no Dart
/// JSON Schema validator here, so [validate] cannot default to a real one the
/// way the React side can point at `@kaladan/diba-schema/validate`. In practice
/// a mobile app's trees arrive from Kaladan's own backend, which proxied the
/// extension and validated there — so the boundary is server-side and this
/// argument says which validation the app is relying on. It is required, not
/// optional, so that answer is always written down at the call site.
class DibaExtension extends StatefulWidget {
  const DibaExtension({
    super.key,
    required this.surface,
    required this.transport,
    required this.validate,
    this.context,
    this.handlers = const DibaHandlers(),
    this.limits = const DibaLimits(),
    this.onEffect,
    this.onRefuse,
    this.pending,
    this.fallback,
  });

  final String surface;
  final DibaTransport transport;
  final DibaValidator validate;
  final Map<String, Object?>? context;

  /// The host's side of `navigate` and `open`. `call` is supplied by this
  /// widget, since routing it to the extension is the whole point.
  final DibaHandlers handlers;
  final DibaLimits limits;

  final void Function(DibaEffect effect)? onEffect;
  final void Function(String reason)? onRefuse;

  /// Shown while the first tree is in flight.
  final Widget? pending;

  /// Shown when the extension cannot be rendered, with the reasons.
  final Widget Function(List<String> reasons)? fallback;

  @override
  State<DibaExtension> createState() => _DibaExtensionState();
}

class _DibaExtensionState extends State<DibaExtension> {
  Map<String, Object?>? _tree;
  List<String>? _reasons;

  /// Only the newest request may settle. Without this a slow first fetch can
  /// land after a fast second one and put the stale panel back — the kind of
  /// bug that only shows up on a bad connection, which is where it matters.
  int _generation = 0;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  /// A new place or a new context is a new panel, as the web's re-fetches:
  /// the host moving to another order must not keep showing the last one's.
  @override
  void didUpdateWidget(DibaExtension old) {
    super.didUpdateWidget(old);
    if (old.surface != widget.surface ||
        jsonEncode(old.context) != jsonEncode(widget.context)) {
      _fetch();
    }
  }

  void _fetch() {
    setState(() {
      _tree = null;
      _reasons = null;
    });
    _send(DibaRequest(surface: widget.surface, context: widget.context));
  }

  /// False when the round trip failed: the transport threw, or the tree that
  /// came back was refused.
  Future<bool> _send(DibaRequest request) async {
    final generation = ++_generation;
    try {
      final response = await widget.transport(request);
      if (!mounted || generation != _generation) return false;
      return _apply(response);
    } catch (error) {
      if (!mounted || generation != _generation) return false;
      // The extension's server is somebody else's uptime. A panel failing to
      // load is an ordinary event the admin carries on from.
      final reason = error.toString();
      widget.onRefuse?.call('transport failed: $reason');
      setState(() => _reasons = [reason]);
      return false;
    }
  }

  bool _apply(DibaResponse response) {
    final effect = response.effect;
    if (effect != null) {
      final url = effect.navigate;
      if (url != null && !isSafeUrl(url)) {
        widget.onRefuse?.call('effect: navigate to a refused URL: $url');
        final rest = effect.withoutNavigate();
        if (!rest.isEmpty) widget.onEffect?.call(rest);
      } else {
        widget.onEffect?.call(effect);
      }
    }

    final tree = response.tree;
    if (tree == null) return true;

    final reasons = widget.validate(tree);
    if (reasons.isNotEmpty) {
      for (final reason in reasons) {
        widget.onRefuse?.call(reason);
      }
      setState(() => _reasons = reasons);
      return false;
    }
    if (tree is! Map) {
      widget.onRefuse?.call('response tree is not an object');
      setState(() => _reasons = ['response tree is not an object']);
      return false;
    }
    setState(() {
      _tree = tree.cast<String, Object?>();
      _reasons = null;
    });
    return true;
  }

  @override
  Widget build(BuildContext context) {
    final reasons = _reasons;
    if (reasons != null) {
      return widget.fallback?.call(reasons) ?? const SizedBox.shrink();
    }
    final tree = _tree;
    if (tree == null) return widget.pending ?? const SizedBox.shrink();

    return DibaSurface(
      tree: tree,
      limits: widget.limits,
      onRefuse: widget.onRefuse,
      handlers: DibaHandlers(
        navigate: widget.handlers.navigate,
        open: widget.handlers.open,
        external: widget.handlers.external,
        toast: widget.handlers.toast,
        // A failed round trip completes with an error, which is what stops
        // the rest of an event's list — "Save, then close" stays open.
        call: (name, payload) async {
          final ok = await _send(
            DibaRequest(
              surface: widget.surface,
              context: widget.context,
              call: DibaCall(name: name, payload: payload),
            ),
          );
          if (!ok) throw StateError('call "$name" did not complete');
        },
      ),
    );
  }
}
