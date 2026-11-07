import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { globSync } from 'node:fs'

/**
 * A line colour is not an ink colour.
 *
 * This has shipped three times: `--db-accent` as the star ink, `--db-info-fg`
 * on an alert, and `--db-border-strong` as the empty half of a rating star at
 * 1.46:1. Each was caught by a contrast assertion in one component's suite,
 * which means it was caught only where somebody had thought to look.
 *
 * So this looks at the stylesheets instead of the pixels. A border token is
 * chosen to be *just* visible against a surface — that is its whole job — and
 * anything drawn in it inherits that, whether or not a test happens to render
 * it. The rule is about where the value came from, not what it measures today.
 *
 * The indirection is the part that matters. The rating bug hid behind a role
 * variable: `--db-rating-track: var(--db-border-strong)` and then
 * `color: var(--db-rating-track)`. A grep for `color: var(--db-border` finds
 * nothing there, so this resolves the chain.
 */

/** Properties that paint a glyph or a shape someone reads. */
const INK = new Set([
  'color',
  'fill',
  'stroke',
  '-webkit-text-fill-color',
  'text-decoration-color',
  'caret-color',
])

const tokensDir = join(import.meta.dirname, '..', '..', '..', 'tokens')

/**
 * The colour tokens whose job is to be *just* visible — a rule between rows, a
 * field's edge — read from the token source rather than listed here.
 *
 * They say so themselves: `$extensions.diba.role: "line"`. A hand-kept list
 * would be right on the day it was written and silently short the first time
 * the palette grew a `border-subtle`, which is the same shape of miss this
 * whole test exists to prevent. A naming convention would have been guessing;
 * a declared role is the token telling us what it is for.
 *
 * `--db-border-width-*` and `--db-divider-weight` are lengths and carry no
 * role, so they never appear here.
 */
const LINE_TOKENS = new Set(
  Object.entries(
    JSON.parse(
      readFileSync(join(tokensDir, 'src', 'tokens', 'semantic', 'color.json'), 'utf8'),
    ) as Record<string, { $extensions?: { diba?: { role?: string } } }>,
  )
    .filter(([, token]) => token?.$extensions?.diba?.role === 'line')
    .map(([name]) => `--db-${name}`),
)

const packageRoot = join(import.meta.dirname, '..', '..')
const from = (pattern: string) =>
  globSync(pattern, { cwd: packageRoot }).map((rel) => join(packageRoot, rel))

const cssFiles = from('src/**/*.css')

/**
 * Component source, without the tests and stories.
 *
 * Those two are fixtures and demos — they render a colour to show what it
 * looks like, and holding them to the library's own rule would stop a story
 * illustrating the very bug it exists to warn about. What ships is what is
 * checked.
 */
const tsxFiles = from('src/**/*.tsx').filter((file) => !/\.(test|stories)\.tsx$/.test(file))

/** Every `prop: value` in a stylesheet, flattened — nesting does not matter here. */
function declarations(source: string): { prop: string; value: string }[] {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '')
  return [...withoutComments.matchAll(/([-a-zA-Z]+)\s*:\s*([^;{}]+)/g)].map((m) => ({
    prop: m[1]!.trim(),
    value: m[2]!.trim(),
  }))
}

/** Custom property → every value it is ever given, across the whole library. */
const assignments = new Map<string, string[]>()
for (const file of cssFiles) {
  for (const { prop, value } of declarations(readFileSync(file, 'utf8'))) {
    if (!prop.startsWith('--')) continue
    assignments.set(prop, [...(assignments.get(prop) ?? []), value])
  }
}

/** The line tokens a value reaches, following custom properties as far as they go. */
function lineTokensReached(value: string, seen = new Set<string>()): string[] {
  const found: string[] = []
  for (const match of value.matchAll(/var\(\s*(--[\w-]+)/g)) {
    const name = match[1]!
    if (LINE_TOKENS.has(name)) {
      found.push(name)
      continue
    }
    if (seen.has(name)) continue
    seen.add(name)
    for (const assigned of assignments.get(name) ?? []) {
      found.push(...lineTokensReached(assigned, seen))
    }
  }
  return found
}

describe('a line colour is never used as an ink colour', () => {
  it('found the source to check', () => {
    expect(cssFiles.length, 'stylesheets').toBeGreaterThan(20)
    expect(tsxFiles.length, 'components').toBeGreaterThan(30)
  })

  /**
   * The derivation has to actually find something. An empty set would make
   * every assertion below vacuously true — a green test that checks nothing,
   * which is worse than no test.
   */
  it('derived the line tokens from the token source', () => {
    // Containment rather than equality: a palette that grows a new line token
    // should start being enforced without anyone editing this file, which is
    // the whole reason the list is derived. Losing one of these, though, is a
    // narrowing of the check and has to be deliberate.
    expect(LINE_TOKENS.size).toBeGreaterThan(0)
    expect([...LINE_TOKENS]).toEqual(expect.arrayContaining(['--db-border', '--db-border-strong']))
  })

  it('and every one of them is a colour that reached the stylesheet', () => {
    // By path, not by resolution: the tokens package exports stylesheets
    // rather than a module entry, so `require.resolve` has nothing to find.
    const theme = readFileSync(join(tokensDir, 'dist', 'theme.css'), 'utf8')
    const lines = theme.split('\n').map((line) => line.trim())

    for (const token of LINE_TOKENS) {
      const declared = lines.find((line) => line.startsWith(`${token}:`))
      expect(declared, `${token} is not in the built theme`).toBeDefined()
      // A width would be a length; these have to be colours to be inks at all.
      expect(declared, token).toMatch(/oklch|rgb|#|var\(/)
    }
  })

  it('in any component stylesheet', () => {
    const offences: string[] = []

    for (const file of cssFiles) {
      const where = relative(packageRoot, file).replace(/\\/g, '/')
      for (const { prop, value } of declarations(readFileSync(file, 'utf8'))) {
        if (!INK.has(prop)) continue
        const reached = [...new Set(lineTokensReached(value))]
        if (reached.length) offences.push(`${where} — ${prop}: ${value} → ${reached.join(', ')}`)
      }
    }

    expect(offences).toEqual([])
  })

  /**
   * The hole the stylesheet pass cannot see. A colour set from TSX — an inline
   * `style`, an SVG attribute, a Tailwind arbitrary value — never appears in a
   * `.css` file, so the graph above walks straight past it.
   *
   * Only values that reference a token count. A `color: 'primary'` inside a
   * `defaultVariants` block is a variant name rather than a colour, and the
   * absence of `var(` is what tells the two apart.
   */
  it('in any component’s TSX', () => {
    const offences: string[] = []

    /** `style={{ color: … }}`, and `fill=` / `stroke=` on an SVG. */
    const inlineInk =
      /\b(color|fill|stroke|caretColor|textDecorationColor|WebkitTextFillColor)\s*[:=]\s*['"`{]*\s*([^'"`,}\n]*var\(--db-[^'"`,}\n]*)/g
    /** `text-[var(--db-…)]`, and the utilities beside it. */
    const arbitrary = /\b(text|fill|stroke|decoration|caret)-\[([^\]]*var\(--db-[^\]]*)\]/g

    for (const file of tsxFiles) {
      const where = relative(packageRoot, file).replace(/\\/g, '/')
      const source = readFileSync(file, 'utf8')

      for (const pattern of [inlineInk, arbitrary]) {
        for (const match of source.matchAll(pattern)) {
          const prop = match[1]!
          const value = match[2]!
          const reached = [...new Set(lineTokensReached(value))]
          if (reached.length) offences.push(`${where} — ${prop}: ${value} → ${reached.join(', ')}`)
        }
      }
    }

    expect(offences).toEqual([])
  })
})
