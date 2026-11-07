import { describe, it, expect } from 'vitest'
import { globSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * A colour is a token, or it is not a colour.
 *
 * The whole point of the tokens package is that a merchant re-theme reaches
 * every surface. A literal written into a component is the one thing it cannot
 * reach — it survives the theme swap, survives dark mode, and looks correct
 * right up until somebody changes the palette and one control stays behind.
 *
 * Sibling of `line-tokens.test.ts`, deliberately kept apart. That one asks
 * *which* token was used; this one asks whether a token was used at all. One
 * describe block answering both would report a failure that means either.
 */

const packageRoot = join(import.meta.dirname, '..', '..')
const from = (pattern: string) =>
  globSync(pattern, { cwd: packageRoot }).map((rel) => join(packageRoot, rel))

/**
 * The copied default theme is the one stylesheet left out: it is a palette, and the last test
 * below holds it instead.
 */
const cssFiles = from('src/**/*.css').filter(
  (file) => !file.replace(/\\/g, '/').includes('src/styles/themes/default/'),
)

/**
 * Tests and stories are fixtures and demos — a story paints a swatch to show
 * what a colour looks like, which is its job. So is `src/stories/`, the kit the
 * stories and their docs pages are drawn with, whose tables are in the docs
 * page's own greys. What ships is what is checked.
 */
const tsxFiles = from('src/**/*.tsx').filter(
  (file) =>
    !/\.(test|stories)\.tsx$/.test(file) && !file.replace(/\\/g, '/').includes('src/stories/'),
)

/**
 * Hex and the colour functions. Not the named colours: telling `red` the
 * colour from `red` the word needs to know it is in value position, and a
 * check that cries wolf is a check somebody turns off.
 */
const LITERAL = /#[0-9a-fA-F]{3,8}\b|(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\([^)]*\)/g

/**
 * A mask is not a colour.
 *
 * Inside `mask-image` only the alpha channel is read — `#000` there means
 * "opaque here", and a theme token would be both meaningless and wrong, since
 * the mask has to behave identically in light and dark. ScrollShadow's fade is
 * built this way, which is the whole reason it works on any surface. The original's
 * ScrollShadow, under Tabs, hands its mask's gradient through
 * `--scroll-linear-gradient`.
 */
const isMask = (text: string) => /mask|scroll-linear-gradient/i.test(text)

/**
 * A shadow in black is darkness, not a colour.
 *
 * The original's switch thumb writes its lift as black at a few per cent, which is how a shadow is
 * drawn on any surface; a palette swap has nothing to change in it. Only pure black is let
 * through, and only in a shadow: a tinted shadow is a colour, and is caught.
 */
const isShadowDarkness = (prop: string, literal: string) =>
  /shadow/i.test(prop) && /^rgba?\(\s*0[\s,]+0[\s,]+0(?![.\d])/.test(literal)

/**
 * A checkerboard behind a swatch is not a colour.
 *
 * The original's colour swatch draws the colour over two light greys in a repeating conic gradient, so a
 * colour that is part transparent shows the board through it, as every colour tool does. The greys
 * are the board's, the same in light and dark; only that gradient, in the swatch's stylesheet.
 */
const isCheckerboard = (file: string, value: string) =>
  file.endsWith('color-swatch.css') && /repeating-conic-gradient/.test(value)

/**
 * A shimmer in white is light, not a colour.
 *
 * The original's skeleton passes a band of white at half strength over its bones, blended as an
 * overlay, which lightens whatever the bone is in either theme. Only pure white, and only in the
 * skeleton's stylesheet.
 */
const isShimmer = (file: string, literal: string) =>
  file.endsWith('skeleton.css') && /^rgba?\(\s*255[\s,]+255[\s,]+255(?![.\d])/.test(literal)

/** Every `prop: value` in a stylesheet, flattened. */
function declarations(source: string): { prop: string; value: string }[] {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '')
  return [...withoutComments.matchAll(/([-a-zA-Z]+)\s*:\s*([^;{}]+)/g)].map((m) => ({
    prop: m[1]!.trim(),
    value: m[2]!.trim(),
  }))
}

const where = (file: string) => relative(packageRoot, file).replace(/\\/g, '/')

describe('a colour is a token, or it is not a colour', () => {
  it('found the source to check', () => {
    expect(cssFiles.length, 'stylesheets').toBeGreaterThan(20)
    expect(tsxFiles.length, 'components').toBeGreaterThan(30)
  })

  it('and the check can see a literal at all', () => {
    expect('color: #abc'.match(LITERAL)).toEqual(['#abc'])
    expect('color: oklch(0.5 0.1 200)'.match(LITERAL)).toEqual(['oklch(0.5 0.1 200)'])
    expect('color: rgba(0, 0, 0, 0.5)'.match(LITERAL)).toEqual(['rgba(0, 0, 0, 0.5)'])
    // `var()` and the keywords are how a component is supposed to say it.
    expect('color: var(--db-fg)'.match(LITERAL)).toBeNull()
    expect('color: currentColor'.match(LITERAL)).toBeNull()
    expect('color: transparent'.match(LITERAL)).toBeNull()
    // A black shadow is darkness; a tinted one, or black anywhere else, is still a colour.
    expect(isShadowDarkness('box-shadow', 'rgb(0 0 0 / 0.06)')).toBe(true)
    expect(isShadowDarkness('box-shadow', 'rgb(30 0 0 / 0.06)')).toBe(false)
    expect(isShadowDarkness('color', 'rgb(0 0 0 / 0.06)')).toBe(false)
  })

  it('in no component stylesheet', () => {
    const offences: string[] = []

    for (const file of cssFiles) {
      for (const { prop, value } of declarations(readFileSync(file, 'utf8'))) {
        if (isMask(prop)) continue
        if (isCheckerboard(file.replace(/\\/g, '/'), value)) continue
        for (const literal of value.match(LITERAL) ?? []) {
          if (isShadowDarkness(prop, literal)) continue
          if (isShimmer(file.replace(/\\/g, '/'), literal)) continue
          offences.push(`${where(file)} — ${prop}: ${literal}`)
        }
      }
    }

    expect(offences).toEqual([])
  })

  it('and in no component’s TSX', () => {
    const offences: string[] = []

    for (const file of tsxFiles) {
      const lines = readFileSync(file, 'utf8').split('\n')
      lines.forEach((line, i) => {
        if (isMask(line)) return
        for (const literal of line.match(LITERAL) ?? []) {
          offences.push(`${where(file)}:${i + 1} — ${literal}`)
        }
      })
    }

    expect(offences).toEqual([])
  })

  /**
   * The copied default theme is a palette, not a component, so the stylesheet rule above leaves it
   * out. What holds instead is that none of that palette reaches a component: every colour it
   * writes as a literal, Diba's theme sets again from a token, in light and in dark.
   *
   * Two kinds are let through, by name. The four primitives are only read through variables
   * Diba sets. A shadow is darkness, not a palette colour, and the original's shadows are the ones
   * admin-web has always drawn.
   */
  it('and none of the copied default palette reaches a component', () => {
    const primitives = new Set(['--white', '--black', '--snow', '--eclipse'])
    const defaults = themeVariables(join(packageRoot, 'src/styles/themes/default/variables.css'))
    const diba = themeVariables(join(packageRoot, 'src/styles/themes/diba/variables.css'))
    const unset: string[] = []

    for (const theme of ['light', 'dark'] as const) {
      for (const [name, value] of defaults[theme]) {
        if (primitives.has(name) || name.endsWith('-shadow') || !value.match(LITERAL)) continue
        const ours = diba[theme].get(name)
        if (!ours || ours.match(LITERAL)) unset.push(`${theme} ${name}: ${value}`)
      }
    }

    expect(defaults.light.size, 'read the default light theme').toBeGreaterThan(40)
    expect(defaults.dark.size, 'read the default dark theme').toBeGreaterThan(20)
    expect(unset).toEqual([])
  })
})

/**
 * The custom properties a theme file sets, for light and for dark. A rule block counts for dark
 * when its selector names dark, and for light when it names `:root`, light or default; one block
 * can count for both. The copied opt-in vibrant palette is not Diba's, and is left out.
 */
function themeVariables(file: string) {
  const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const themes = { light: new Map<string, string>(), dark: new Map<string, string>() }
  for (const [, selector, body] of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (/vibrant/.test(selector!)) continue
    const dark = /dark/.test(selector!)
    const light = /:root|light|default/.test(selector!)
    for (const [, name, value] of body!.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) {
      if (light) themes.light.set(name!, value!.trim())
      if (dark) themes.dark.set(name!, value!.trim())
    }
  }
  return themes
}
