import 'dart:async';

import 'package:flutter/material.dart';

import '../manifest.g.dart';
import 'colours.dart';
import 'guards.dart';
import 'node.dart';
import 'registry.dart';
import 'ring.dart';
import 'strings.dart';

/// A toast a tree asked for, on its way to the host's own toasts.
class DibaToast {
  const DibaToast({
    required this.status,
    this.title,
    this.description,
    this.actionLabel,
    this.onAction,
  });

  /// default, accent, success, warning or danger.
  final String status;
  final String? title;
  final String? description;

  /// "Undo", and what it does — already bound to the dispatcher.
  final String? actionLabel;
  final VoidCallback? onAction;
}

/// The host's side of the contract.
///
/// `call`, `navigate` and `open` are capabilities only the host has; so is
/// drawing a toast, which has to look like the admin's own and land where they
/// do. `setState` and `close` never leave this widget.
///
/// An event names one action or an ordered list of them. Each waits for the
/// one before, and a failed `call` (one whose Future completes with an error)
/// stops the list.
class DibaHandlers {
  const DibaHandlers({
    this.call,
    this.navigate,
    this.open,
    this.external,
    this.toast,
  });

  /// A `call` reached the host. [payload] holds only the state keys the action
  /// named in `with`, a Form's named fields when a Form submitted, and the
  /// event's own value under the action's `value` key when it names one.
  ///
  /// Return a Future to say when it is done. AlertDialog keeps its confirm
  /// button pending until then, which is what makes "the host shows it
  /// pending" true rather than promised. To respond with new UI, rebuild with
  /// a new [DibaSurface.tree]. Complete with an error to say the call failed;
  /// that stops the rest of the event's list.
  final FutureOr<void> Function(String action, Map<String, Object?> payload)?
  call;

  /// A `navigate`. The URL has already been checked; a refused scheme never
  /// reaches here.
  final void Function(String to)? navigate;

  /// An `open`: one of the host's own destinations, by a name the host
  /// recognises. It never opens an overlay in the tree; those open only from
  /// their trigger.
  final void Function(String target)? open;

  /// A link the tree marked `isExternal`, already checked. Without one it goes
  /// to [navigate]: the design system does not launch URLs itself, because
  /// leaving the app is the host's decision.
  final void Function(String to)? external;

  /// A `toast`. Without one, a [SnackBar] through the nearest
  /// ScaffoldMessenger.
  final void Function(DibaToast toast)? toast;
}

/// What a Form's onSubmit hands its action: the named fields, nothing else.
class DibaFormValues {
  const DibaFormValues(this.values);
  final Map<String, Object?> values;
}

/// Renders a tree the host did not write.
///
/// The counterpart of `DibaSurface` in `@kaladan/diba-react/sdui`, and
/// deliberately the same shape: the same allowlists from the same generated
/// manifest, the same guards in the same order, the same verbs. Two renderers
/// that disagree about what a tree may do is a security bug on whichever one
/// is more generous.
class DibaSurface extends StatefulWidget {
  const DibaSurface({
    super.key,
    required this.tree,
    this.handlers = const DibaHandlers(),
    this.limits = const DibaLimits(),
    this.onRefuse,
  });

  /// The tree to render. Validate it against the generated JSON Schema first.
  final Map<String, Object?> tree;

  final DibaHandlers handlers;
  final DibaLimits limits;

  /// Something in the tree was refused, and why — for every drop.
  ///
  /// Worth wiring to real logging. A panel that renders with one button missing
  /// looks to a merchant exactly like a broken extension, and the author has no
  /// way to find out otherwise.
  final void Function(String reason)? onRefuse;

  @override
  State<DibaSurface> createState() => _DibaSurfaceState();
}

class _Overlay {
  _Overlay(this.close);
  final VoidCallback close;
}

/// Registers an open overlay for as long as it is on screen.
class _OverlayScope extends StatefulWidget {
  const _OverlayScope({
    required this.close,
    required this.overlays,
    required this.child,
  });

  final VoidCallback close;
  final List<_Overlay> overlays;
  final Widget child;

  @override
  State<_OverlayScope> createState() => _OverlayScopeState();
}

class _OverlayScopeState extends State<_OverlayScope> {
  late final _Overlay _entry = _Overlay(() => widget.close());

  @override
  void initState() {
    super.initState();
    widget.overlays.add(_entry);
  }

  @override
  void dispose() {
    widget.overlays.remove(_entry);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}

const Set<String> _statuses = {
  'default',
  'accent',
  'success',
  'warning',
  'danger',
};

class _DibaSurfaceState extends State<DibaSurface> {
  /// Keys an action named, for the payload a `call` sends.
  final Map<String, Object?> _named = {};

  /// A value per node and facet, keyed by position in the tree, which is
  /// stable for as long as the tree is. The default form of a value lives here
  /// once the merchant changes it; the pinned form never does.
  final Map<String, Object?> _byNode = {};

  final Map<String, DibaFormSlot> _forms = {};
  final Map<String, DibaFire?> _formSubmit = {};

  /// The Form each node sits in, for a live re-render to find again.
  final Map<String, String?> _scopes = {};

  /// Overlays this surface opened and that are still open, newest last.
  final List<_Overlay> _overlays = [];

  /// Ticks on every change, so an overlay's body can re-render.
  final ValueNotifier<int> _revision = ValueNotifier(0);

  @override
  void initState() {
    super.initState();
    // Focus rings follow the keyboard, as the web's do (ring.dart).
    dibaWatchInput();
  }

  @override
  void dispose() {
    _revision.dispose();
    super.dispose();
  }

  /// Whether a build is under way. A refusal found while building is held
  /// until the frame is done: a host that logs it with setState would
  /// otherwise rebuild the surface, which refuses again, which logs again —
  /// the gallery spun on exactly that.
  bool _building = false;

  /// Build-time refusals already reported for this tree. Every rebuild walks
  /// the whole tree again and would report the same drops each time.
  final Set<String> _reported = {};
  final List<String> _held = [];

  void _refuse(String reason) {
    if (!_building) {
      widget.onRefuse?.call(reason);
      return;
    }
    if (_reported.contains(reason) || _held.contains(reason)) return;
    if (_held.isEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final held = List.of(_held);
        _held.clear();
        for (final r in held) {
          _reported.add(r);
          widget.onRefuse?.call(r);
        }
      });
    }
    _held.add(reason);
  }

  T _whileBuilding<T>(T Function() build) {
    final outer = _building;
    _building = true;
    try {
      return build();
    } finally {
      _building = outer;
    }
  }

  @override
  void didUpdateWidget(DibaSurface old) {
    super.didUpdateWidget(old);
    if (!identical(old.tree, widget.tree)) _reported.clear();
  }

  void _changed(VoidCallback change) {
    setState(change);
    _revision.value++;
  }

  static String _key(String path, String facet) =>
      facet.isEmpty ? path : '$path#$facet';

  /// The steps of an event's action: one action, or an ordered list.
  List<Map<String, Object?>> _steps(Object? action) => [
    if (action is Map) action.cast<String, Object?>(),
    if (action is List)
      for (final step in action)
        if (step is Map) step.cast<String, Object?>(),
  ];

  /// Runs an event's steps in order, each waiting for the one before.
  ///
  /// False when a `call` failed, which stops the list: "Save, then close"
  /// must not close a dialog whose save did not happen.
  Future<bool> _run(List<Map<String, Object?>> steps, Object? value) async {
    for (final step in steps) {
      if (!await _dispatch(step, value)) return false;
    }
    return true;
  }

  Future<bool> _dispatch(Map<String, Object?> action, Object? value) async {
    switch (action['do']) {
      case 'setState':
        final key = action['key'];
        if (key is String) {
          _changed(() => _named[key] = serialisableValue(value));
        }
      case 'navigate':
        final to = action['to'];
        if (to is! String) return true;
        if (!isSafeUrl(to)) {
          _refuse('navigate to a refused URL: $to');
          return true;
        }
        widget.handlers.navigate?.call(to);
      case 'open':
        final target = action['target'];
        if (target is String) widget.handlers.open?.call(target);
      case 'call':
        final name = action['action'];
        if (name is! String) return true;
        // Only the keys the action asked for, a Form's own named fields, and
        // the event's value if the action named a key for it. The store is
        // not a bag the extension gets to empty.
        final payload = <String, Object?>{};
        if (value is DibaFormValues) payload.addAll(value.values);
        final wanted = action['with'];
        if (wanted is List) {
          for (final key in wanted) {
            if (key is String) payload[key] = _named[key];
          }
        }
        final valueKey = action['value'];
        if (valueKey is String && value is! DibaFormValues) {
          payload[valueKey] = serialisableValue(value);
        }
        try {
          final result = widget.handlers.call?.call(name, payload);
          if (result is Future) await result;
        } catch (error) {
          _refuse('call "$name" failed: $error');
          return false;
        }
      case 'toast':
        _toast(action);
      case 'close':
        if (_overlays.isEmpty) {
          _refuse('close with no overlay open');
          return true;
        }
        _overlays.last.close();
      default:
        _refuse('unknown action: ${action['do']}');
    }
    return true;
  }

  void _toast(Map<String, Object?> action) {
    final status = action['status'] ?? 'default';
    if (status is! String || !_statuses.contains(status)) {
      _refuse('toast: refused status "$status"');
      return;
    }
    final title = action['title'];
    final description = action['description'];
    if (title is! String && description is! String) {
      _refuse('toast with neither a title nor a description');
      return;
    }

    // "Undo": a label, and actions of its own — but no toast among them,
    // so a toast cannot summon another toast.
    String? label;
    VoidCallback? onAction;
    final actionLabel = action['actionLabel'];
    final steps = _steps(action['onAction']);
    if (steps.any((s) => s['do'] == 'toast')) {
      _refuse('toast: a toast inside onAction');
      steps.removeWhere((s) => s['do'] == 'toast');
    }
    if (actionLabel is String && steps.isNotEmpty) {
      label = actionLabel;
      onAction = () => _run(steps, null);
    }

    final toast = DibaToast(
      status: status,
      title: title is String ? title : null,
      description: description is String ? description : null,
      actionLabel: label,
      onAction: onAction,
    );
    final host = widget.handlers.toast;
    if (host != null) {
      host(toast);
      return;
    }
    final messenger = ScaffoldMessenger.maybeOf(context);
    if (messenger == null) {
      _refuse('toast with no ScaffoldMessenger to show it');
      return;
    }
    messenger.showSnackBar(dibaSnackBar(context, toast));
  }

  Map<String, Object?> _filter(
    String type,
    DibaSpec spec,
    Object? declared, {
    required bool report,
  }) {
    final props = <String, Object?>{};
    if (declared is! Map) return props;
    declared.forEach((name, value) {
      if (name is! String) return;
      if (!spec.props.contains(name)) {
        if (report) _refuse('$type: undeclared prop "$name"');
        return;
      }
      // URLs are guarded by prop, not by value: "Warning: stock is low" is a
      // title, and only a prop the manifest says is a URL is held to a URL
      // rule.
      final format = spec.formats[name];
      if (format != null) {
        final safe =
            value is String &&
            (format == 'image-url' ? isSafeImageUrl(value) : isSafeUrl(value));
        if (!safe) {
          if (report) _refuse('$type: refused value for "$name"');
          return;
        }
      }
      props[name] = value;
    });
    return props;
  }

  DibaItem? _prepare(
    BuildContext context,
    Object? raw,
    String path,
    String? form, {
    DibaBuilder? using,
  }) {
    if (raw is! Map) return null;
    final node = raw.cast<String, Object?>();

    final type = node['type'];
    if (type is! String) return null;

    final spec = dibaManifest[type];
    // [using] is how a live overlay body re-renders this node with its own
    // builder, through exactly the same filtering as the first time.
    final build = using ?? dibaRegistry[type];
    if (spec == null) {
      _refuse('unknown component: $type');
      return null;
    }
    if (build == null) {
      _refuse('no Flutter widget for: $type');
      return null;
    }

    final props = _filter(type, spec, node['props'], report: true);

    final handlers = <String, DibaFire>{};
    final actions = node['actions'];
    if (actions is Map) {
      actions.forEach((event, action) {
        if (event is! String) return;
        if (!spec.actions.contains(event)) {
          _refuse('$type: undeclared action "$event"');
          return;
        }
        final steps = _steps(action);
        if (steps.isNotEmpty) handlers[event] = (value) => _run(steps, value);
      });
    }

    final isForm = type == 'Form';
    final inner = isForm ? path : form;
    _scopes[path] = form;
    if (isForm) {
      _forms.putIfAbsent(path, DibaFormSlot.new);
      _formSubmit[path] = handlers['onSubmit'];
    }

    // A slot is refused on exactly the same terms as anything else in the
    // tree, and rendered through the same walk.
    final slots = <String, Widget>{};
    final declaredSlots = node['slots'];
    if (declaredSlots is Map) {
      declaredSlots.forEach((name, value) {
        if (name is! String) return;
        if (!spec.slots.contains(name)) {
          _refuse('$type: undeclared slot "$name"');
          return;
        }
        final built = _prepare(context, value, '$path:$name', inner);
        if (built != null) slots[name] = built.widget;
      });
    }

    final rawChildren = node['children'];
    final items = <DibaItem>[];
    String? text;
    if (rawChildren is String) {
      text = rawChildren;
    } else if (rawChildren is List) {
      for (var i = 0; i < rawChildren.length; i++) {
        final child = _prepare(context, rawChildren[i], '$path.$i', inner);
        if (child != null) items.add(child);
      }
    }

    final nodeContext = DibaNodeContext(
      type: type,
      path: path,
      props: props,
      children: [for (final item in items) item.widget],
      items: items,
      slots: slots,
      text: text,
      handlers: handlers,
      local: ([facet = '']) => _byNode[_key(path, facet)],
      hasLocal: ([facet = '']) => _byNode.containsKey(_key(path, facet)),
      setValue: (event, value, {facet = ''}) {
        _changed(() => _byNode[_key(path, facet)] = value);
        return handlers[event]?.call(value) ?? Future.value(true);
      },
      setLocal: (facet, value) =>
          _changed(() => _byNode[_key(path, facet)] = value),
      navigateTo: (href, {external = false}) {
        if (external && widget.handlers.external != null) {
          if (!isSafeUrl(href)) {
            _refuse('navigate to a refused URL: $href');
            return;
          }
          widget.handlers.external!(href);
          return;
        }
        _dispatch({'do': 'navigate', 'to': href}, null);
      },
      refuse: (reason) => _refuse('$type: $reason'),
      live: (builder) => ValueListenableBuilder<int>(
        valueListenable: _revision,
        builder: (liveContext, _, _) {
          final again = _whileBuilding(
            () => _prepare(
              liveContext,
              _resolve(path),
              path,
              _scopes[path],
              using: builder,
            ),
          );
          return again?.widget ?? const SizedBox.shrink();
        },
      ),
      overlay: ({required close, required child}) =>
          _OverlayScope(close: close, overlays: _overlays, child: child),
      form: form == null
          ? null
          : DibaFormHooks(
              submit: () => _submit(form),
              reset: () => _reset(form),
            ),
      formSlot: isForm ? _forms[path] : null,
      isPersian: dibaIsPersian(context),
    );

    return DibaItem(
      type: type,
      props: props,
      text: text,
      items: items,
      // Built where it is placed, so it reads the theme of what holds it, as
      // a web block reads the CSS of its ancestors: a grey card's stronger
      // muted text reaches the blocks in it. Refusals made while it
      // builds are held for the frame, as the surface's own are.
      widget: Builder(
        builder: (placed) => _whileBuilding(() => build(placed, nodeContext)),
      ),
      path: path,
    );
  }

  /// The node at [path] in the current tree, or null if it is gone.
  Object? _resolve(String path) {
    Object? node = widget.tree;
    if (!path.startsWith('root')) return null;
    for (final m in RegExp(r'([.:])([^.:]+)').allMatches(path.substring(4))) {
      if (node is! Map) return null;
      if (m[1] == '.') {
        final children = node['children'];
        final i = int.tryParse(m[2]!);
        if (children is! List || i == null || i >= children.length) return null;
        node = children[i];
      } else {
        final slots = node['slots'];
        if (slots is! Map) return null;
        node = slots[m[2]];
      }
    }
    return node;
  }

  Future<void> _submit(String formPath) async {
    final slot = _forms[formPath];
    if (slot == null) return;
    final valid = slot.key.currentState?.validate() ?? true;
    if (!valid) {
      if (!slot.submitted) _changed(() => slot.submitted = true);
      return;
    }
    final values = <String, Object?>{};
    _collect(_resolve(formPath), formPath, values);
    await _formSubmit[formPath]?.call(DibaFormValues(values));
  }

  /// The named fields under a Form, each by its value pair.
  void _collect(Object? raw, String path, Map<String, Object?> into) {
    if (raw is! Map) return;
    final type = raw['type'];
    if (type is! String) return;
    final spec = dibaManifest[type];
    if (spec == null) return;
    final props = _filter(type, spec, raw['props'], report: false);

    final name = props['name'];
    if (name is String) {
      final pair = dibaValuePair(type, props);
      if (pair != null) {
        Object? value;
        if (props.containsKey(pair.pinned)) {
          value = props[pair.pinned];
        } else if (_byNode.containsKey(path)) {
          value = _byNode[path];
        } else {
          value = props[pair.fallback];
        }
        if (type == 'Checkbox' || type == 'Switch') value = value == true;
        into[name] = serialisableValue(value);
      }
    }

    // A group owns its children's values; they are not fields of their own.
    if (type == 'CheckboxGroup' || type == 'RadioGroup') return;
    final children = raw['children'];
    if (children is List) {
      for (var i = 0; i < children.length; i++) {
        _collect(children[i], '$path.$i', into);
      }
    }
  }

  void _reset(String formPath) {
    final slot = _forms[formPath];
    if (slot == null) return;
    _changed(() {
      _byNode.removeWhere(
        (k, _) => k.startsWith('$formPath.') || k.startsWith('$formPath:'),
      );
      slot.generation++;
      slot.submitted = false;
    });
  }

  @override
  Widget build(BuildContext context) => _whileBuilding(() {
    final tooBig = checkTree(widget.tree, widget.limits);
    if (tooBig != null) {
      // Refused whole rather than in part. Half a tree is a worse thing to show
      // a merchant than nothing, because nothing is obviously nothing.
      _refuse(tooBig);
      return const SizedBox.shrink();
    }
    return _prepare(context, widget.tree, 'root', null)?.widget ??
        const SizedBox.shrink();
  });
}

/// A toast as Material draws one: a SnackBar, with the status as a leading
/// mark because SnackBar has no status of its own.
SnackBar dibaSnackBar(BuildContext context, DibaToast toast) {
  final tone = dibaTone(context, toast.status);
  final theme = Theme.of(context);
  final onInverse = theme.colorScheme.onInverseSurface;
  final icon = switch (toast.status) {
    'success' => Icons.check_circle_outline,
    'warning' => Icons.warning_amber_rounded,
    'danger' => Icons.error_outline,
    _ => Icons.info_outline,
  };
  return SnackBar(
    behavior: SnackBarBehavior.floating,
    showCloseIcon: true,
    content: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsetsDirectional.only(end: 12),
          child: Icon(
            icon,
            color: toast.status == 'default' ? onInverse : tone.solid,
            size: 20,
          ),
        ),
        Expanded(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (toast.title != null)
                Text(
                  toast.title!,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: onInverse,
                  ),
                ),
              if (toast.description != null)
                Text(toast.description!, style: TextStyle(color: onInverse)),
            ],
          ),
        ),
      ],
    ),
    action: toast.actionLabel == null
        ? null
        : SnackBarAction(
            label: toast.actionLabel!,
            onPressed: toast.onAction ?? () {},
          ),
  );
}
