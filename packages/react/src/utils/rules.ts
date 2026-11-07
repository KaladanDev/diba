/**
 * Diba's email and URL rules, the same on both platforms. Written so
 * JavaScript and Dart read each pattern identically; the cases they must agree
 * on are `packages/schema/fixtures/rules.json`. A tree's fields and the React
 * fields check by them alike.
 */
export const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
export const WEB_URL = /^https?:\/\/([^\s/?#@:.]+\.)+[^\s/?#@:.]+(:\d{1,5})?([/?#]\S*)?$/i

/** Characters as a reader counts them, so a Persian letter with a mark is one. */
export const graphemes = (text: string) =>
  typeof Intl.Segmenter === 'function'
    ? [...new Intl.Segmenter().segment(text)].length
    : [...text].length
