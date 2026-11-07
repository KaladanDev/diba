import 'dart:convert';

import 'package:diba/diba.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// The cases mode: one component's cases, one under another, with nothing of
/// the gallery's chrome.
///
///     ?cases=Checkbox&lang=en&theme=dark
///
/// The cases are the same ones the web draws, written beside the build as
/// JSON at `assets/picker/<lang>/<Component>.json`. On the web rootBundle
/// fetches any asset key over HTTP, declared or not, so a case edited there
/// shows here on the next reload, without a rebuild.
class PickerCasesPage extends StatefulWidget {
  const PickerCasesPage({
    super.key,
    required this.component,
    required this.persian,
  });

  final String component;
  final bool persian;

  @override
  State<PickerCasesPage> createState() => _PickerCasesPageState();
}

class _PickerCase {
  _PickerCase(this.title, this.note, this.tree);

  final String title;
  final String? note;
  final Map<String, Object?> tree;
}

class _PickerCasesPageState extends State<PickerCasesPage> {
  late final Future<List<_PickerCase>> _cases = _load();
  final List<String> _log = [];

  Future<List<_PickerCase>> _load() async {
    final lang = widget.persian ? 'fa' : 'en';
    final text = await rootBundle.loadString(
      'picker/$lang/${widget.component}.json',
      cache: false,
    );
    final json = jsonDecode(text) as Map<String, Object?>;
    return [
      for (final c in json['cases']! as List<Object?>)
        if (c case {
          'title': final String title,
          'tree': final Map<String, Object?> tree,
        })
          _PickerCase(title, (c as Map)['note'] as String?, tree),
    ];
  }

  void _note(String line) {
    // A refusal is reported while the surface builds; write it down after.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || _log.contains(line)) return;
      // Also to the console, where a script checking the page can read it.
      debugPrint('picker: $line');
      setState(() => _log.add(line));
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final muted = theme.colorScheme.onSurfaceVariant;
    final handlers = DibaHandlers(
      call: (action, payload) async {
        _note('call $action');
        // A host round trip takes a moment; AlertDialog shows it pending.
        await Future<void>.delayed(const Duration(milliseconds: 600));
      },
      navigate: (to) => _note('navigate $to'),
      external: (to) => _note('external $to'),
      open: (target) => _note('open $target'),
    );

    return Scaffold(
      body: FutureBuilder<List<_PickerCase>>(
        future: _cases,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Padding(
              padding: const EdgeInsets.all(20),
              child: Text(
                'No cases for ${widget.component}: ${snapshot.error}',
              ),
            );
          }
          final cases = snapshot.data;
          if (cases == null) return const SizedBox.shrink();
          WidgetsBinding.instance.addPostFrameCallback(
            (_) => debugPrint('picker: drew ${cases.length} cases'),
          );
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              for (final c in cases) ...[
                Text(
                  c.title,
                  style: theme.textTheme.labelMedium?.copyWith(color: muted),
                ),
                if (c.note != null)
                  Text(
                    c.note!,
                    style: theme.textTheme.bodySmall?.copyWith(color: muted),
                  ),
                const SizedBox(height: 10),
                DibaSurface(
                  tree: c.tree,
                  handlers: handlers,
                  onRefuse: (reason) => _note('refused · $reason'),
                ),
                const SizedBox(height: 28),
              ],
              for (final line in _log)
                Text(
                  line,
                  textDirection: TextDirection.ltr,
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontFamily: 'monospace',
                    color: line.startsWith('refused')
                        ? theme.colorScheme.error
                        : muted,
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
