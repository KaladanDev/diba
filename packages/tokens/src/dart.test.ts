import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The Flutter target, checked without a Flutter.
 *
 * This file is generated Dart that nothing in this repo can compile — there is
 * no Dart toolchain here, and CI has no reason to install one to build a
 * TypeScript design system. So the two failures a compiler would have caught
 * are checked directly instead: a reference to a member that was never emitted,
 * and a value that never got converted.
 *
 * Both are live risks rather than theory. The hand-written ThemeData at the
 * bottom of the generator names about fifty token members; rename a token and
 * every one of them is a silent break that only shows up in someone's `flutter
 * run`. And the target this replaced shipped OKLCH *strings* into Dart, which
 * looks like a pipeline right up until a Color is asked for.
 */

const DART = readFileSync(
  join(import.meta.dirname, '..', 'dist', 'native', 'DibaTokens.dart'),
  'utf8',
)

/** `Class.member` for everything the file declares. */
function declared(): Set<string> {
  const out = new Set<string>()
  let cls: string | null = null
  for (const line of DART.split('\n')) {
    const c = line.match(/^abstract final class (\w+)/)
    if (c) cls = c[1]!
    const m = line.match(/^ {2}static const \w+ (\w+) =/)
    if (m && cls) out.add(`${cls}.${m[1]}`)
  }
  return out
}

/** `Class.member` for everything the file *uses*, minus the constructors. */
function referenced(): Set<string> {
  const out = new Set<string>()
  for (const m of DART.matchAll(/\b(Diba\w+)\.(\w+)\b/g)) {
    const name = `${m[1]}.${m[2]}`
    if (m[2] === '_' || m[2]!.startsWith('_')) continue
    out.add(name)
  }
  return out
}

/** Members of DibaTheme itself, which are methods and schemes rather than consts. */
const THEME_API = new Set(['DibaTheme.light', 'DibaTheme.dark'])

describe('the Flutter target', () => {
  it('was actually generated', () => {
    expect(DART).toContain('abstract final class DibaTheme')
    expect(declared().size).toBeGreaterThan(300)
  })

  /**
   * Material has no success or warning role, so every status colour a block
   * draws comes from this extension. A theme without it would leave Alert,
   * Chip, Toast and ProgressBar guessing.
   */
  it('registers the status-colour extension on both themes', () => {
    expect(DART).toContain('class DibaStatusColors extends ThemeExtension<DibaStatusColors>')
    expect(DART).toContain('? DibaStatusColors.dark')
    expect(DART).toContain(': DibaStatusColors.light')
  })

  it('emits the draft-3 tokens', () => {
    const have = declared()
    for (const name of [
      'DibaLightColors.surface3',
      'DibaDarkColors.surface3',
      'DibaDimens.fieldWidth',
      'DibaDimens.spinnerSizeXl',
    ])
      expect(have.has(name), name).toBe(true)
  })

  /**
   * The compiler substitute. Every `DibaFontSize.xl` in the theme has to name a
   * const that the generator emitted; a token rename silently breaks the link.
   */
  it('references only members it declares', () => {
    const have = declared()
    const missing = [...referenced()].filter(
      (r) =>
        !have.has(r) &&
        !THEME_API.has(r) &&
        !r.startsWith('DibaTheme.') &&
        // The status extension's own members are finals and methods, not consts.
        !r.startsWith('DibaStatusColors.') &&
        !r.startsWith('DibaStatusTone.'),
    )
    expect(missing).toEqual([])
  })

  /**
   * The bug the stub had. Dart cannot parse OKLCH, so a leaked `oklch(...)` is
   * a string pretending to be a colour.
   */
  it('leaves no unconverted CSS values in it', () => {
    const leaks = DART.split('\n')
      .map((line, i) => ({ line: line.trim(), n: i + 1 }))
      .filter(({ line }) => /oklch\(|\d(px|rem|ms)\b/.test(line) && !line.startsWith('///'))
      .map(({ line, n }) => `${n}: ${line}`)
    expect(leaks).toEqual([])
  })

  it('emits every semantic colour in both themes', () => {
    const names = (cls: string) => {
      const body = DART.split(`abstract final class ${cls} {`)[1]!.split('\n}')[0]!
      return [...body.matchAll(/static const Color (\w+) =/g)].map((m) => m[1]!).sort()
    }
    expect(names('DibaLightColors')).toEqual(names('DibaDarkColors'))
    expect(names('DibaLightColors').length).toBeGreaterThan(20)
  })

  /**
   * The five values that appear literally in app_logo.svg. They were authored as
   * hex, converted to OKLCH in the token source, and converted back here — so
   * they are the one place a round trip can be checked against a known answer
   * rather than against itself. A hue shift in the gamut mapping shows up here
   * first.
   */
  it('round-trips the logo’s own colours exactly', () => {
    const LOGO: Record<string, string> = {
      iris600: '0xFF595580',
      iris800: '0xFF454263',
      saffron200: '0xFFFFE2C9',
      saffron400: '0xFFF6B76F',
      saffron500: '0xFFE0914D',
    }
    for (const [member, argb] of Object.entries(LOGO)) {
      expect(DART, member).toContain(`static const Color ${member} = Color(${argb});`)
    }
  })

  /**
   * A control's selected state by role. The fills are gilt, what sits on
   * the gilt is slate-700 in both themes, and the off parts are the secondary
   * button's colours. Material's own defaults would quietly bring back the
   * copper or the primary.
   */
  it("gives the controls the choices' roles", () => {
    const theme = DART.split('static ThemeData _theme(')[1] ?? ''
    for (const line of [
      'activeTrackColor: controlFill,',
      'thumbColor: controlOnFill,',
      'inactiveTrackColor: controlTrack,',
      'color: controlFill,',
      'linearTrackColor: controlTrack,',
      'checkColor: WidgetStateProperty.all(controlOnFill),',
      '? controlOnFill : controlThumbOff',
      '? controlFill : controlTrack',
    ]) {
      expect(theme, line).toContain(line)
    }
    const have = declared()
    for (const name of [
      'DibaLightColors.controlFill',
      'DibaLightColors.controlOnFill',
      'DibaLightColors.controlTrack',
      'DibaLightColors.controlThumbOff',
      'DibaDarkColors.controlThumbOff',
      'DibaPalette.slate700',
    ])
      expect(have.has(name), name).toBe(true)
  })

  /**
   * The slider thumb gets a gilt ring; focus is the ring token,
   * outside the field; the selected tab is v3's segment pill; and a plain text
   * button is the secondary button's text. Material's own default for each is
   * primary, and the theme's old one was the copper, so a dropped override
   * builds, runs and quietly brings one of them back.
   */
  it('gives the slider thumb, focus, tabs and text buttons their roles', () => {
    const theme = DART.split('static ThemeData _theme(')[1] ?? ''
    for (const line of [
      'thumbShape: DibaRingedThumbShape(ring: controlFill),',
      'rangeThumbShape: DibaRingedRangeThumbShape(ring: controlFill),',
      'focusedBorder: _fieldEdge(ring, DibaDimens.focusWidth),',
      'strokeAlign: BorderSide.strokeAlignOutside,',
      'floatingLabelStyle: TextStyle(color: scheme.onSurface),',
      'color: segment,',
      'labelColor: segmentFg,',
      'unselectedLabelColor: segmentFgMuted,',
      'foregroundColor: plainFg,',
      '? plainHover',
    ]) {
      expect(theme, line).toContain(line)
    }
    // Nothing in the theme reads the copper any more.
    expect(theme).not.toContain('scheme.tertiary')
    expect(DART).toContain('class DibaRingedThumbShape extends RoundSliderThumbShape')
    expect(DART).toContain('class DibaRingedRangeThumbShape extends RoundRangeSliderThumbShape')

    const have = declared()
    for (const name of [
      'DibaLightColors.segment',
      'DibaLightColors.segmentFg',
      'DibaLightColors.segmentFgMuted',
      'DibaLightColors.segmentList',
      'DibaLightColors.plainFg',
      'DibaLightColors.plainHover',
      'DibaDarkColors.segment',
      'DibaPalette.slate100',
      'DibaPalette.slate400',
      'DibaPalette.slate500',
    ])
      expect(have.has(name), name).toBe(true)
  })

  /**
   * The copper leaves the components. The tertiary slot that carried it
   * is left to Material, the picked day is gilt with the colour on gilt, the
   * selected AM/PM and the caret take the text colour, and links have a token
   * of their own.
   */
  it('takes the copper out of the components', () => {
    expect(DART).not.toMatch(/\btertiary: Diba/)
    expect(DART).not.toMatch(/\bonTertiary: Diba/)
    const theme = DART.split('static ThemeData _theme(')[1] ?? ''
    for (const line of [
      'cursorColor: scheme.onSurface,',
      'selectionHandleColor: scheme.onSurface,',
      'states.contains(WidgetState.selected) ? controlFill : null',
      'states.contains(WidgetState.selected) ? controlOnFill : null',
      'dayPeriodColor: WidgetStateColor.resolveWith(',
    ]) {
      expect(theme, line).toContain(line)
    }
    const have = declared()
    for (const name of ['DibaLightColors.link', 'DibaDarkColors.link', 'DibaPalette.slate600'])
      expect(have.has(name), name).toBe(true)
  })
})
