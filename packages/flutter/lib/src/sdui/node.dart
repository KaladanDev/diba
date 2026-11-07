import 'package:flutter/material.dart';

/// A child node as data, already through the same allowlist and guards as a
/// node that is drawn.
///
/// The groups — a Select's items, a Table's rows, an AvatarGroup's avatars —
/// read their children rather than place them. Reading the raw tree would skip
/// the manifest and the dangerous-value check; an Avatar's `src` read raw is a
/// URL nobody looked at.
class DibaItem {
  const DibaItem({
    required this.type,
    required this.props,
    required this.text,
    required this.items,
    required this.widget,
    required this.path,
  });

  final String type;

  /// Manifest-declared props only, guards applied.
  final Map<String, Object?> props;
  final String? text;

  /// Its own children, the same way.
  final List<DibaItem> items;

  /// The node as the registry draws it, for a parent that places it after all
  /// — a Table cell holding a Chip.
  final Widget widget;

  /// Where it sits in the tree, the key its local value is kept under.
  final String path;

  T? prop<T>(String name) {
    final v = props[name];
    return v is T ? v : null;
  }

  String? get id => prop<String>('id');
  bool flag(String name) => prop<bool>(name) ?? false;
}

/// The Form a node sits inside, for Button's `type` submit and reset.
class DibaFormHooks {
  const DibaFormHooks({required this.submit, required this.reset});

  /// Runs the client checks, then the Form's onSubmit.
  final Future<void> Function() submit;

  /// Restores every field inside the Form to its default.
  final VoidCallback reset;
}

/// What a Form node needs to draw itself as a Flutter [Form].
class DibaFormSlot {
  DibaFormSlot();

  final GlobalKey<FormState> key = GlobalKey<FormState>();

  /// Bumped by a reset, so stateful fields underneath start again from their
  /// defaults rather than keeping what was typed.
  int generation = 0;

  /// Set once a submit has failed, after which fields re-check as they change.
  bool submitted = false;
}

/// A handler bound to the dispatcher.
///
/// It returns a Future so a builder can wait for a `call` — AlertDialog shows
/// its confirm button pending until the host answers. Every other verb
/// completes at once. The Future's value is false when a `call` in the
/// event's list failed and stopped it.
typedef DibaFire = Future<bool> Function(Object? value);

/// Everything a builder is handed for one node.
///
/// Props are already filtered against the manifest and handlers already bound,
/// so a builder never decides what is allowed — only what it looks like.
class DibaNodeContext {
  const DibaNodeContext({
    required this.type,
    required this.path,
    required this.props,
    required this.children,
    required this.items,
    required this.slots,
    required this.text,
    required this.handlers,
    required this.local,
    required this.hasLocal,
    required this.setValue,
    required this.setLocal,
    required this.navigateTo,
    required this.refuse,
    required this.live,
    required this.overlay,
    required this.form,
    required this.formSlot,
    required this.isPersian,
  });

  final String type;

  /// This node's place in the tree, stable for as long as the tree is.
  final String path;

  /// Manifest-declared props only.
  final Map<String, Object?> props;

  /// Child nodes, already built.
  final List<Widget> children;

  /// The same children as filtered data, for the groups that read them.
  final List<DibaItem> items;

  /// Named positions, already built — an overlay's trigger, a Card's footer.
  final Map<String, Widget> slots;

  /// Text children, for the components whose manifest says `accepts: 'text'`.
  final String? text;

  /// Declared events, bound to the dispatcher. Absent when the tree wired none.
  final Map<String, DibaFire> handlers;

  /// The value the merchant last gave this node, per facet. A Table keeps its
  /// selection and its sort apart; a ComboBox its key and its typed text.
  final Object? Function([String facet]) local;
  final bool Function([String facet]) hasLocal;

  /// Record a value locally and fire [event]'s handler, if there is one.
  final Future<bool> Function(String event, Object? value, {String facet})
  setValue;

  /// Record a value locally without firing anything.
  final void Function(String facet, Object? value) setLocal;

  /// Follow an href, through the same guard the `navigate` verb goes through.
  /// An external one goes to the host's external handler when it has one.
  final void Function(String href, {bool external}) navigateTo;

  /// Say that this node asked for something this platform cannot do.
  final void Function(String reason) refuse;

  /// Draw this node again whenever the surface's state changes.
  ///
  /// An overlay's body lives in a route the surface does not rebuild. Built
  /// once at the tap, a checkbox inside a dialog would tick in the state and
  /// never on the screen; built through this, it re-renders from the tree —
  /// including a new tree the server sent while the dialog was open.
  final Widget Function(
    Widget Function(BuildContext context, DibaNodeContext node) build,
  )
  live;

  /// Wrap an open overlay's body so the `close` verb can find it.
  ///
  /// `close` only ever closes something this surface opened. A bare
  /// `Navigator.pop` would pop the merchant's own screen when no dialog is
  /// open, which is the host's navigation in a third party's hands.
  final Widget Function({required VoidCallback close, required Widget child})
  overlay;

  /// The enclosing Form, or null outside one.
  final DibaFormHooks? form;

  /// Set on a Form node only.
  final DibaFormSlot? formSlot;

  /// Whether the surface is drawn for a Persian reader: digits, the calendar
  /// `auto` resolves to, Diba's own strings.
  final bool isPersian;

  T? prop<T>(String name) {
    final v = props[name];
    return v is T ? v : null;
  }

  /// The local value, by its old name — the blocks not yet approved for
  /// the schema still read it this way.
  Object? get value => local();

  /// The children as plain maps, by their old name, for the same blocks.
  /// Built from [items], so what they read has been through the guards.
  List<Map<String, Object?>> get rawChildren => [
    for (final i in items)
      {'type': i.type, 'props': i.props, 'children': i.text},
  ];

  String str(String name, String fallback) => prop<String>(name) ?? fallback;
  bool flag(String name) => prop<bool>(name) ?? false;
  bool flagOr(String name, bool fallback) => prop<bool>(name) ?? fallback;
  num? number(String name) => prop<num>(name);

  /// Whether the tree sent the pinned form of a value.
  bool isPinned(String name) => props.containsKey(name);

  /// The value of a pair: the pinned prop if the tree sent one, else what the
  /// merchant last chose, else the default prop.
  ///
  /// Pinned wins over local on purpose. It "shows exactly what the server sent
  /// until the next tree", so a merchant's change fires its event and is
  /// recorded, and the control still shows the server's answer.
  Object? pair(String pinned, String fallback, {String facet = ''}) {
    if (props.containsKey(pinned)) return props[pinned];
    if (hasLocal(facet)) return local(facet);
    return props[fallback];
  }

  /// The node's main value, by [dibaValuePair].
  Object? get current {
    final p = dibaValuePair(type, props);
    if (p == null) return local();
    return pair(p.pinned, p.fallback);
  }

  /// The main value's pinned prop is set.
  bool get pinned {
    final p = dibaValuePair(type, props);
    return p != null && props.containsKey(p.pinned);
  }

  /// Fire an event without recording anything. False when a `call` in its
  /// list failed.
  Future<bool> fire(String event, [Object? value]) =>
      handlers[event]?.call(value) ?? Future.value(true);
}

typedef DibaBuilder =
    Widget Function(BuildContext context, DibaNodeContext node);

/// Which props make up a block's value pair: the pinned form and the default.
///
/// One table for both the builders and a Form's payload, so what a field shows
/// and what it submits cannot drift apart.
({String pinned, String fallback})? dibaValuePair(
  String type,
  Map<String, Object?> props,
) => switch (type) {
  'TextField' ||
  'TextArea' ||
  'SearchField' ||
  'NumberField' ||
  'DateField' ||
  'InputOTP' ||
  'ColorSwatchPicker' ||
  'DateRangePicker' ||
  'TimeField' ||
  'Calendar' ||
  'RangeCalendar' ||
  'Slider' ||
  'RadioGroup' ||
  'CheckboxGroup' => (pinned: 'value', fallback: 'defaultValue'),
  'Checkbox' || 'Switch' => (pinned: 'isSelected', fallback: 'defaultSelected'),
  'Select' when props['selectionMode'] == 'multiple' => (
    pinned: 'selectedKeys',
    fallback: 'defaultSelectedKeys',
  ),
  'Select' ||
  'ComboBox' ||
  'Tabs' => (pinned: 'selectedKey', fallback: 'defaultSelectedKey'),
  'Accordion' => (pinned: 'expandedKeys', fallback: 'defaultExpandedKeys'),
  'Pagination' => (pinned: 'page', fallback: 'defaultPage'),
  'ListBox' ||
  'TagGroup' ||
  'ToggleButtonGroup' ||
  'Dropdown' ||
  'Menu' ||
  'Table' => (pinned: 'selectedKeys', fallback: 'defaultSelectedKeys'),
  _ => null,
};

/// A list of keys from a tree value, or an empty one.
List<String> dibaKeys(Object? value) {
  if (value is List) return value.map((e) => e.toString()).toList();
  if (value is String) return [value];
  return const [];
}
