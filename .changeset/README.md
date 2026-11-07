# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets). It's how Diba versions and releases its packages.

- To record a change for release, run `bun run changeset` and follow the prompts (pick the affected packages + bump type, write a summary). This adds a markdown file here.
- To release, run `bun run version-packages` (applies the changesets → bumps versions + changelogs) and commit it. CI's manual `release` job then builds and runs `bun run release`: `bun publish` for tokens, schema and react in turn → npmjs.com, skipping a version already there. To publish from your own machine instead, `bunx npm login` once, then `bun run release` after `bun run build`.
- `version-packages` also brings `bun.lock`'s record of each package's version up to date (`.changeset/sync-lock.mjs`): `bun publish` writes a `workspace:^` range from that record, and `bun install` does not refresh it, so a stale one would publish React asking for a schema version that does not exist. `release` refuses to start while they differ.
- Bun publishes rather than `changeset publish`, which runs npm: npm would ship the internal `workspace:^` ranges as written, and no one could install them. Bun writes the versions beside them.

Until 1.0 the packages are a preview, versioned 0.x: a change that breaks an app is a `minor` changeset (0.1.0 → 0.2.0), anything else a `patch`, so an app on `^0.1.0` takes fixes but never a break by surprise. `major` is kept for 1.0.0.

`access` is `public`: the packages are public on npmjs.com, each under the licence in its own LICENSE file. `baseBranch` is `main`. Internal `workspace:^` deps bump by `patch` when a dependency changes.
