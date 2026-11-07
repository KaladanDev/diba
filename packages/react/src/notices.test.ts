import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * Third-party code is named in one place: THIRD-PARTY-NOTICES.txt, the notice its licence asks
 * for. The repository names it nowhere else, in code, comments, docs, tools or records. The
 * names are read from the notice, so this test does not carry them either.
 */

const repo = join(import.meta.dirname, '..', '..', '..')
const notices = join(repo, 'packages', 'react', 'THIRD-PARTY-NOTICES.txt')

/** Generated, installed or local-only: none of it is the repository's own writing. */
const SKIP = new Set([
  '.git',
  '.claude',
  '.idea',
  '.preview',
  '.reference',
  '.dart_tool',
  'node_modules',
  'dist',
  'build',
  'storybook-static',
  'coverage',
])
const BINARY = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|tgz|zip|pdf)$/i

function files(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue
    const path = join(dir, name)
    if (statSync(path).isDirectory()) files(path, out)
    else if (!BINARY.test(name)) out.push(path)
  }
  return out
}

/** The work's name and its copyright holder's, as the notice gives them. */
function names(): string[] {
  const text = readFileSync(notices, 'utf8')
  const work = /derived from (\S+)\s/.exec(text)?.[1]
  const holder = /Copyright \d{4} (\S+) Inc\./.exec(text)?.[1]
  return [work, holder].filter((name): name is string => Boolean(name))
}

describe('third-party code', () => {
  it('is named in its notice', () => {
    expect(names()).toHaveLength(2)
  })

  it('is named nowhere else', () => {
    const pattern = new RegExp(names().join('|'), 'i')
    const offences = files(repo)
      .filter((path) => path !== notices && pattern.test(readFileSync(path, 'utf8')))
      .map((path) => relative(repo, path).replace(/\\/g, '/'))
    expect(offences).toEqual([])
  })
})
