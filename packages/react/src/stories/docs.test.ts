import { describe, it, expect } from 'vitest'
import { globSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { manifest } from '@kaladan/diba-schema'
import { clean, WORKING } from './docs'

/**
 * What a published docs page says is how to use a component, never how it came to be: no
 * decision tags, no look history, no working words (the owner, 2026-11-05).
 */

describe('the docs kit’s cleaner', () => {
  it('drops decision tags, leave-out markers and asides, and the space before them', () => {
    expect(clean('Sections that open in place (D43). One item alone is a disclosure.')).toBe(
      'Sections that open in place. One item alone is a disclosure.',
    )
    expect(clean('Opened by its trigger, and only by it (H), as a Modal is (D43, D49).')).toBe(
      'Opened by its trigger, and only by it, as a Modal is.',
    )
    expect(clean('The requirement (**E**: React Aria has none).')).toBe('The requirement.')
    expect(clean('Every value ⟨C12⟩ is localized (C9).')).toBe('Every value is localized.')
    expect(clean(undefined)).toBe('')
  })

  it('leaves no working note in any block’s text a docs page shows', () => {
    const left: string[] = []
    const walk = (value: unknown, where: string) => {
      if (typeof value === 'string') {
        if (WORKING.test(clean(value)) && /description/.test(where)) left.push(`${where}: ${value}`)
      } else if (value && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) walk(v, `${where}.${k}`)
      }
    }
    walk(manifest.components, 'manifest')
    // Words the cleaner cannot take out without rewriting the sentence are reported here.
    expect(left.filter((l) => /\bowner\b|look picker|finali[sz]ed/.test(l))).toEqual([])
  })

  it('says what a block is, not whose it was, which version, or what it replaced', () => {
    const told: string[] = []
    const walk = (value: unknown, where: string) => {
      if (typeof value === 'string') {
        if (/description/.test(where) && /\bv3\b|\bin place of\b/.test(clean(value)))
          told.push(`${where}: ${value}`)
      } else if (value && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) walk(v, `${where}.${k}`)
      }
    }
    walk(manifest.components, 'manifest')
    expect(told).toEqual([])
  })
})

describe('a component’s docs page', () => {
  const root = join(import.meta.dirname, '..', '..')
  const pages = globSync('src/{components,patterns,foundations,sdui}/**/*.mdx', { cwd: root })

  it.each(pages)('%s has no working note in it', (page) => {
    const text = readFileSync(join(root, page), 'utf8')
    const lines = text.split('\n').filter((line) => WORKING.test(line))
    expect(lines).toEqual([])
  })
})
