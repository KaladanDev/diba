import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { ariaStringsFa } from './aria-fa'

/**
 * The guard on a hand-written locale.
 *
 * React Aria's global string registry is all-or-nothing: it throws for any
 * package missing from the map, and `getStringForLocale` throws for any key
 * missing from a package. Both failures happen at a reader rather than at a
 * build, and only on the Persian locale — so nothing short of this test
 * catches them.
 *
 * It reads React Aria's own English files as the source of truth, which is why
 * a version bump that adds a string fails here instead of in production. It
 * already caught one: the tree strings are `@react-aria/tree`, and this file
 * had them under `@react-stately/tree`.
 */
const intlDir = (() => {
  // Resolved through react-aria-components, which is the direct dependency;
  // `react-aria` is its dependency and not ours to import by name.
  const here = createRequire(import.meta.url)
  const rac = here.resolve('react-aria-components')
  const fromRac = createRequire(rac)
  // The entry sits in dist/exports; the strings are a level up in dist/private.
  return join(dirname(fromRac.resolve('react-aria')), '..', 'private', 'intl')
})()

/** The keys React Aria's own `en-US` file declares for one string set. */
function englishKeys(set: string): string[] {
  const source = readFileSync(join(intlDir, set, 'en-US.mjs'), 'utf8')
  const body = source.slice(source.indexOf('exports = {'))
  return [...body.matchAll(/^\s{4}"([^"]+)":/gm)].map((m) => m[1]!)
}

const sets = readdirSync(intlDir).filter((name) => !name.includes('.'))

/** React Stately's own string files: a colour's name, a date field's range messages. */
const statelyIntl = (() => {
  const here = createRequire(import.meta.url)
  const rac = createRequire(here.resolve('react-aria-components'))
  return join(dirname(rac.resolve('react-stately')), '..', 'private', 'intl')
})()
const statelySets = readdirSync(statelyIntl).filter((name) => !name.includes('.'))

function statelyKeys(set: string): string[] {
  const source = readFileSync(join(statelyIntl, set, 'en-US.mjs'), 'utf8')
  const body = source.slice(source.indexOf('exports = {'))
  return [...body.matchAll(/^\s{4}"([^"]+)":/gm)].map((m) => m[1]!)
}

/**
 * React Aria Components carries strings of its own beside the `@react-aria/*`
 * packages, and it is asked for by its bare name. Left out, a Select threw the
 * moment it rendered.
 */
const racIntl = (() => {
  const here = createRequire(import.meta.url)
  return join(dirname(here.resolve('react-aria-components')), '..', 'private', 'intl')
})()

describe('the Persian strings handed to React Aria', () => {
  it('found React Aria’s own string files to compare against', () => {
    expect(sets.length).toBeGreaterThan(10)
  })

  it('covers every package React Aria ships strings for', () => {
    const expected = [
      ...sets.map((set) => `@react-aria/${set}`),
      ...statelySets.map((set) => `@react-stately/${set}`),
      'react-aria-components',
    ].sort()
    expect(Object.keys(ariaStringsFa).sort()).toEqual(expected)
  })

  it('and React Aria Components’ own strings, which are asked for by bare name', () => {
    const source = readFileSync(join(racIntl, 'en-US.mjs'), 'utf8')
    const body = source.slice(source.indexOf('exports = {'))
    const keys = [...body.matchAll(/^\s{4}"([^"]+)":/gm)].map((m) => m[1]!).sort()
    expect(Object.keys(ariaStringsFa['react-aria-components'] ?? {}).sort()).toEqual(keys)
  })

  for (const set of statelySets) {
    it(`@react-stately/${set}: has every key, and no key React Stately does not define`, () => {
      const ours = Object.keys(ariaStringsFa[`@react-stately/${set}`] ?? {}).sort()
      expect(ours).toEqual(statelyKeys(set).sort())
    })
  }

  for (const set of sets) {
    it(`${set}: has every key, and no key React Aria does not define`, () => {
      const ours = Object.keys(ariaStringsFa[`@react-aria/${set}`] ?? {}).sort()
      expect(ours).toEqual(englishKeys(set).sort())
    })
  }

  it('leaves nothing in English', () => {
    const latin = /[A-Za-z]{3,}/
    const untranslated: string[] = []

    for (const [pkg, messages] of Object.entries(ariaStringsFa)) {
      for (const [key, message] of Object.entries(messages)) {
        // Only plain strings can be checked this way; a function's Persian is
        // interleaved with substitutions and key names.
        if (typeof message === 'string' && latin.test(message)) untranslated.push(`${pkg}.${key}`)
      }
    }

    // `Alt + ArrowDown` and `Enter` and `Delete` are key names, which are not
    // translated on a Persian keyboard either.
    expect(untranslated.filter((k) => !/menu|table|tag|dnd/.test(k))).toEqual([])
  })
})
