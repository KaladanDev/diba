import { describe, it, expect } from 'vitest'
import { globSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { WORKING } from './stories/docs'

/**
 * What a package ships, its source included, is read by people who never see the decision record,
 * so it holds none of its working notes. The file list is the package's own `files`, as `bun
 * publish` reads it, built output included when it has been built: CI builds before it tests.
 */

const packages = join(import.meta.dirname, '..', '..')
const BINARY = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf)$/i
const slash = (path: string) => path.replace(/\\/g, '/')

function shipped(name: string): string[] {
  const root = join(packages, name)
  const { files } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
    files: string[]
  }
  const expand = (entry: string) => {
    const isDir =
      !/[*?]/.test(entry) && statSync(join(root, entry), { throwIfNoEntry: false })?.isDirectory()
    return globSync(isDir ? `${entry}/**/*` : entry, { cwd: root })
      .filter((path) => statSync(join(root, path)).isFile())
      .map(slash)
  }
  const drop = new Set(files.filter((e) => e.startsWith('!')).flatMap((e) => expand(e.slice(1))))
  return files
    .filter((e) => !e.startsWith('!'))
    .flatMap(expand)
    .filter((path) => !drop.has(path))
}

describe.each(['tokens', 'schema', 'react'])('@kaladan/diba-%s', (name) => {
  /**
   * `bun publish` writes a `workspace:^` range from the version bun.lock records, and `bun
   * install` does not refresh it: a stale record publishes a range no version answers.
   */
  it('is in bun.lock at its own version, so its dependents ask for it', () => {
    const { version } = JSON.parse(readFileSync(join(packages, name, 'package.json'), 'utf8')) as {
      version: string
    }
    const lock = readFileSync(join(packages, '..', 'bun.lock'), 'utf8')
    const entry = new RegExp(
      `\\n    "packages/${name}": \\{\\n      "name": "[^"]+",\\n      "version": "([^"]+)"`,
    )
    expect(entry.exec(lock)?.[1]).toBe(version)
  })

  it('ships its source, and no tests, stories or docs pages', () => {
    const files = shipped(name)
    expect(files.filter((path) => path.startsWith('src/')).length).toBeGreaterThan(5)
    expect(files.filter((path) => /\.test\.|\.stories\.|\.mdx$/.test(path))).toEqual([])
  })

  it('ships no working note', () => {
    const offences = shipped(name)
      // The third-party licence's own text, verbatim: its "copyright owner" is no working note.
      .filter((path) => !BINARY.test(path) && path !== 'THIRD-PARTY-NOTICES.txt')
      .flatMap((path) =>
        readFileSync(join(packages, name, path), 'utf8')
          .split('\n')
          .flatMap((line, i) => (WORKING.test(line) ? [`${path}:${i + 1}: ${line.trim()}`] : [])),
      )
    expect(offences).toEqual([])
  })
})
