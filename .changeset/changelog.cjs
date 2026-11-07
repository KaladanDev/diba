// The changelog's lines: each change's summary, and the packages it moved with. No commit hashes:
// the history they point into is not where the changelog is read.

/** @type {import('@changesets/types').ChangelogFunctions} */
module.exports = {
  async getReleaseLine(changeset) {
    const [first, ...rest] = changeset.summary.split('\n').map((line) => line.trimEnd())
    return `\n- ${first}${rest.map((line) => (line ? `\n  ${line}` : '\n')).join('')}`
  },
  async getDependencyReleaseLine(changesets, dependencies) {
    if (dependencies.length === 0) return ''
    const moved = dependencies.map((d) => `  - ${d.name}@${d.newVersion}`).join('\n')
    return `\n- Updated dependencies:\n${moved}`
  },
}
