import 'package:diba/diba.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'picker.dart';
import 'samples.dart';

/// Diba's Flutter gallery: every approved block, from sample trees.
///
/// The address bar drives it, so a headless browser can photograph any state:
///
///     ?group=pickers&lang=en&theme=dark&open=dropdown
///     ?group=containers&press=Save
///
/// `open` presses the first trigger or field inside that sample once the page
/// has drawn — how a screenshot gets an open dialog, menu or date picker.
/// `press` presses the first thing on the page showing exactly that text.
///
/// `?cases=Checkbox` draws that component's cases instead, one under another,
/// with nothing of the gallery's chrome (picker.dart).
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await _loadDibaFont();
  runApp(const GalleryApp());
}

/// Yekan Bakh, when a local build has it.
///
/// The font is licensed per project and kept out of git, as in admin-web and
/// hub-web, so it is not declared in pubspec.yaml. On the web the asset
/// bundle fetches `assets/<key>` over HTTP whether or not it was declared, so
/// a local build may copy the TTFs into `build/web/assets/local-fonts/`.
/// Without them the browser's fallback draws the Persian, which is legible
/// but is not Diba.
Future<void> _loadDibaFont() async {
  final loader = FontLoader(DibaFonts.fa);
  var found = false;
  for (final weight in const ['Regular', 'SemiBold', 'Bold']) {
    try {
      final data = await rootBundle.load('local-fonts/YekanBakh-$weight.ttf');
      loader.addFont(Future.value(data));
      found = true;
    } catch (_) {
      // Not in this build.
    }
  }
  if (found) await loader.load();
}

class GalleryApp extends StatefulWidget {
  const GalleryApp({super.key});

  @override
  State<GalleryApp> createState() => _GalleryAppState();
}

class _GalleryAppState extends State<GalleryApp> {
  final Map<String, String> _query = Uri.base.queryParameters;
  late bool _persian = _query['lang'] != 'en';
  late bool _dark = _query['theme'] == 'dark';

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Diba · Flutter',
      theme: DibaTheme.light(),
      darkTheme: DibaTheme.dark(),
      themeMode: _dark ? ThemeMode.dark : ThemeMode.light,
      locale: Locale(_persian ? 'fa' : 'en'),
      supportedLocales: const [Locale('fa'), Locale('en')],
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
      home: switch (_query['cases']) {
        // The cases mode: one component's cases, nothing else (picker.dart).
        final String component => PickerCasesPage(
          component: component,
          persian: _persian,
        ),
        _ => GalleryPage(
          persian: _persian,
          dark: _dark,
          initialGroup: _query['group'],
          open: _query['open'],
          press: _query['press'],
          onPersian: (v) => setState(() => _persian = v),
          onDark: (v) => setState(() => _dark = v),
        ),
      },
    );
  }
}

class GalleryPage extends StatefulWidget {
  const GalleryPage({
    super.key,
    required this.persian,
    required this.dark,
    required this.onPersian,
    required this.onDark,
    this.initialGroup,
    this.open,
    this.press,
  });

  final bool persian;
  final bool dark;
  final ValueChanged<bool> onPersian;
  final ValueChanged<bool> onDark;
  final String? initialGroup;
  final String? open;
  final String? press;

  @override
  State<GalleryPage> createState() => _GalleryPageState();
}

class _GalleryPageState extends State<GalleryPage> {
  late int _group;

  /// Built once per language. A tree rebuilt as a new map on every frame is
  /// a new tree to the surface, which reports its refusals again — and the
  /// log reporting them is what rebuilds the page.
  late List<SampleGroup> _groups = galleryGroups(widget.persian);

  @override
  void didUpdateWidget(GalleryPage old) {
    super.didUpdateWidget(old);
    if (old.persian != widget.persian) _groups = galleryGroups(widget.persian);
  }

  final List<String> _log = [];
  final Map<String, GlobalKey> _keys = {};

  @override
  void initState() {
    super.initState();
    final groups = _groups;
    final i = groups.indexWhere((g) => g.id == widget.initialGroup);
    _group = i < 0 ? 0 : i;
    final open = widget.open;
    final press = widget.press;
    if (open != null || press != null) {
      // After the first frame, and anything that settles after it.
      WidgetsBinding.instance.addPostFrameCallback(
        (_) => Future<void>.delayed(const Duration(milliseconds: 600), () {
          if (open != null) _press(open);
          if (press != null) _pressText(press);
        }),
      );
    }
  }

  void _note(String line) {
    if (!mounted) return;
    setState(() {
      _log.insert(0, line);
      if (_log.length > 6) _log.removeLast();
    });
  }

  /// Scrolls [box] into view, then presses its centre once the scroll has
  /// drawn: a press below the fold hits nothing.
  void _tap(RenderBox box) {
    if (!box.hasSize) return;
    box.showOnScreen(duration: Duration.zero);
    WidgetsBinding.instance.addPostFrameCallback((_) => _tapNow(box));
    WidgetsBinding.instance.scheduleFrame();
  }

  void _tapNow(RenderBox box) {
    if (!box.attached || !box.hasSize) return;
    final centre = box.localToGlobal(box.size.center(Offset.zero));
    GestureBinding.instance
      ..handlePointerEvent(PointerDownEvent(position: centre, pointer: 4242))
      ..handlePointerEvent(PointerUpEvent(position: centre, pointer: 4242));
  }

  /// Presses the first thing on the page showing exactly [text].
  void _pressText(String text) {
    RenderBox? target;
    void visit(Element element) {
      if (target != null) return;
      final widget = element.widget;
      if ((widget is Text && widget.data == text) ||
          (widget is RichText && widget.text.toPlainText() == text)) {
        target = element.renderObject as RenderBox?;
        return;
      }
      element.visitChildren(visit);
    }

    (context as Element).visitChildren(visit);
    if (target != null) _tap(target!);
  }

  /// Presses the first trigger or field inside a sample, as a finger would.
  void _press(String id) {
    final root = _keys[id]?.currentContext;
    if (root == null) return;
    RenderBox? target;
    void visit(Element element) {
      if (target != null) return;
      final widget = element.widget;
      final isTrigger =
          widget is GestureDetector && widget.child is IgnorePointer;
      if (isTrigger || widget is EditableText || widget is ButtonStyleButton) {
        target = element.renderObject as RenderBox?;
        return;
      }
      element.visitChildren(visit);
    }

    (root as Element).visitChildren(visit);
    if (target != null) _tap(target!);
  }

  @override
  Widget build(BuildContext context) {
    final groups = _groups;
    final group = groups[_group];
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final handlers = DibaHandlers(
      call: (action, payload) async {
        _note('call $action $payload');
        // A host round trip takes a moment; AlertDialog shows it pending.
        await Future<void>.delayed(const Duration(milliseconds: 700));
      },
      navigate: (to) => _note('navigate $to'),
      external: (to) => _note('external $to'),
      open: (target) => _note('open $target'),
    );

    return Scaffold(
      appBar: AppBar(
        backgroundColor: scheme.surface,
        title: Text(
          widget.persian ? 'دیبا · فلاتر' : 'Diba · Flutter',
          style: theme.textTheme.titleMedium,
        ),
        actions: [
          SegmentedButton<bool>(
            showSelectedIcon: false,
            segments: const [
              ButtonSegment(value: true, label: Text('فا')),
              ButtonSegment(value: false, label: Text('EN')),
            ],
            selected: {widget.persian},
            onSelectionChanged: (s) => widget.onPersian(s.first),
          ),
          IconButton(
            tooltip: 'theme',
            onPressed: () => widget.onDark(!widget.dark),
            icon: Icon(
              widget.dark
                  ? Icons.light_mode_outlined
                  : Icons.dark_mode_outlined,
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: _group,
            labelType: NavigationRailLabelType.all,
            onDestinationSelected: (i) => setState(() => _group = i),
            destinations: [
              for (final g in groups)
                NavigationRailDestination(
                  icon: const Icon(Icons.circle_outlined, size: 12),
                  selectedIcon: const Icon(Icons.circle, size: 12),
                  label: SizedBox(
                    width: 92,
                    child: Text(g.title, textAlign: TextAlign.center),
                  ),
                ),
            ],
          ),
          const VerticalDivider(width: 1),
          Expanded(
            child: Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: Wrap(
                      spacing: 16,
                      runSpacing: 16,
                      children: [
                        for (final sample in group.samples)
                          _SampleCard(
                            key: _keys.putIfAbsent(sample.id, GlobalKey.new),
                            sample: sample,
                            wide:
                                sample.id == 'table' ||
                                sample.id == 'listbox' ||
                                sample.id == 'button-variants',
                            handlers: handlers,
                            onRefuse: (r) => _note('refused · $r'),
                          ),
                      ],
                    ),
                  ),
                ),
                _Log(lines: _log),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SampleCard extends StatelessWidget {
  const _SampleCard({
    super.key,
    required this.sample,
    required this.handlers,
    required this.onRefuse,
    this.wide = false,
  });

  final Sample sample;
  final DibaHandlers handlers;
  final void Function(String reason) onRefuse;
  final bool wide;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SizedBox(
      width: wide ? 860 : 420,
      child: Card.outlined(
        margin: EdgeInsets.zero,
        color: theme.colorScheme.surface,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                sample.title,
                textDirection: TextDirection.ltr,
                textAlign: TextAlign.start,
                // The gallery's own chrome keeps the copper, by its token
                // name: no component draws it any more.
                style: theme.textTheme.labelLarge?.copyWith(
                  color: theme.brightness == Brightness.dark
                      ? DibaDarkColors.primaryEmphasis
                      : DibaLightColors.primaryEmphasis,
                ),
              ),
              if (sample.note != null)
                Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text(
                    sample.note!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
              const SizedBox(height: 12),
              DibaSurface(
                tree: sample.tree,
                handlers: handlers,
                onRefuse: onRefuse,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// What the surfaces did: calls, navigation, refusals.
class _Log extends StatelessWidget {
  const _Log({required this.lines});

  final List<String> lines;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(minHeight: 56),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      color: theme.colorScheme.surfaceContainer,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          for (final line in lines.take(4))
            Text(
              line,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textDirection: TextDirection.ltr,
              style: theme.textTheme.bodySmall?.copyWith(
                fontFamily: 'monospace',
              ),
            ),
          if (lines.isEmpty) Text('—', style: theme.textTheme.bodySmall),
        ],
      ),
    );
  }
}
