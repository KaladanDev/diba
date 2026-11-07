// Brings bun.lock's record of each published package's version up to its package.json.
//
//   bun .changeset/sync-lock.mjs           write them
//   bun .changeset/sync-lock.mjs --check   fail if they differ
//
// `bun publish` turns a `workspace:^` range into `^` and the version bun.lock records for that
// package, and `bun install` leaves that record alone after `changeset version` raises the
// version. Without this, @kaladan/diba-react 0.1.0 would ask for @kaladan/diba-schema ^0.0.0,
// which is never published.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const PUBLISHED = ['packages/tokens', 'packages/schema', 'packages/react']
const lockPath = join(root, 'bun.lock')
let lock = readFileSync(lockPath, 'utf8')
const stale = []

for (const ws of PUBLISHED) {
  const { name, version } = JSON.parse(readFileSync(join(root, ws, 'package.json'), 'utf8'))
  const entry = new RegExp(
    `(\\n    "${ws}": \\{\\n      "name": "${name}",\\n      "version": ")([^"]+)(")`,
  )
  const found = entry.exec(lock)
  if (!found) throw new Error(`bun.lock has no entry for ${ws}`)
  if (found[2] !== version) {
    stale.push(`${name}: bun.lock ${found[2]}, package.json ${version}`)
    lock = lock.replace(entry, `$1${version}$3`)
  }
}

if (process.argv.includes('--check')) {
  if (stale.length) {
    console.error(`bun.lock is behind; run bun .changeset/sync-lock.mjs\n  ${stale.join('\n  ')}`)
    process.exit(1)
  }
} else if (stale.length) {
  writeFileSync(lockPath, lock)
  console.log(`bun.lock: ${stale.join('; ')}`)
}
