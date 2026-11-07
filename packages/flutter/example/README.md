# Diba gallery (Flutter)

Every approved block of the schema (groups 1–6), rendered from
sample trees by the Flutter renderer, in Persian (RTL) and in English.

The samples are in `lib/samples.dart`: plain trees, the spec's prop names,
nothing a third party could not send.

## Run

The web target, with the mirrors that answer from Iran:

```sh
export PUB_HOSTED_URL=https://pub.flutter-io.cn
export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
flutter build web --no-web-resources-cdn
```

Yekan Bakh is licensed per project and kept out of git, as in admin-web and
hub-web. To see the gallery in Diba's own font, copy `YekanBakh-Regular.ttf`,
`-SemiBold.ttf` and `-Bold.ttf` into `build/web/assets/local-fonts/` after building; the
page loads them if they are there and falls back to the browser's fonts if not.

Then serve `build/web` with any static server. The address bar drives the
page, so a headless browser can photograph any state:

    ?group=pickers&lang=en&theme=dark&open=dropdown

- `group`: actions, fields, pickers, choices, status, containers
- `lang`: fa (default) or en
- `theme`: light (default) or dark
- `open`: a sample id; its first trigger or field is pressed after the page draws
- `cases`: a component's name; draws that component's cases instead of the gallery,
  one under another, with nothing of the gallery's chrome (`lib/picker.dart`). The
  cases are JSON at `assets/picker/<lang>/<Component>.json`, read on each load.

Windows desktop is not set up: building it needs Visual Studio's "Desktop
development with C++" workload. `flutter create --platforms=windows .` adds it.

## Test

`flutter test` renders every sample in both languages and fails on any
refusal, except the guard sample, which exists to show one.
