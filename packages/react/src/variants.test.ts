import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as variants from './variants'

/**
 * `@kaladan/diba-react/variants`: the style recipes alone. hub-web calls `buttonVariants()` from
 * server components to style a link as a button, which works only while nothing in this entry
 * reaches React.
 */
describe('the variants entry', () => {
  it('has a recipe for every component copied so far, plus cn and tv', () => {
    for (const name of [
      'buttonVariants',
      'buttonGroupVariants',
      'toggleButtonVariants',
      'toggleButtonGroupVariants',
      'linkVariants',
      'cn',
      'tv',
    ]) {
      expect(typeof (variants as Record<string, unknown>)[name], name).toBe('function')
    }
  })

  it('gives the same class names the components render', () => {
    expect(variants.buttonVariants({ variant: 'secondary', size: 'sm' }).split(' ')).toEqual(
      expect.arrayContaining(['button', 'button--sm', 'button--secondary']),
    )
    expect(variants.linkVariants().base()).toBe('link')
  })

  it('imports no React, and is not a client module', () => {
    // From the package root, where vitest runs: under jsdom, import.meta.url is not a file URL.
    const recipes = join(process.cwd(), 'src', 'styles', 'recipes')
    const files = [
      'index.ts',
      'utils/index.ts',
      'components/index.ts',
      'components/button/button.styles.ts',
      'components/button-group/button-group.styles.ts',
      'components/toggle-button/toggle-button.styles.ts',
      'components/toggle-button-group/toggle-button-group.styles.ts',
      'components/link/link.styles.ts',
    ]
    for (const file of files) {
      const source = readFileSync(join(recipes, file), 'utf8')
      expect(source, file).not.toMatch(/from ["']react["']|["']use client["']/)
    }
  })
})
