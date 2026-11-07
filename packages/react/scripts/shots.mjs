/**
 * Screenshot Storybook stories to PNG.
 *
 * The browser suite measures; this looks. Both are needed and neither
 * replaces the other — every rule in the wrapped-range band was measured and
 * passing while the band itself had squared stubs hanging off two row ends,
 * because no assertion had thought to ask about a range that crosses a week.
 *
 *   bun run shots                     # the default set below
 *   bun run shots forms-calendar--range other-story--id
 *
 * Expects Storybook to be up (`bun run storybook`). Output lands in
 * `shots/`, which is not tracked — these are for looking at, not for
 * diffing. A screenshot committed as a baseline is a test, and a test
 * belongs in the browser suite where it can say why it failed.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const URL = process.env.STORYBOOK_URL ?? 'http://localhost:6006'
const OUT = 'shots'

/** The stories worth a second look — the ones whose claims are visual. */
const DEFAULT_STORIES = [
  'forms-calendar--jalali',
  'forms-calendar--range',
  'forms-calendar--chosen-is-today',
  'forms-datepicker--range',
  'forms-inputotp--persian-digits',
  'data-table--sticky-header',
  'content-snippet--colors',
  'navigation-navbar--sticky',
]

const stories = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_STORIES

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1000, height: 700 },
  // Retina, because half the things worth checking are a hairline wide.
  deviceScaleFactor: 2,
})

let failed = 0

for (const id of stories) {
  const file = `${OUT}/${id}.png`
  try {
    const response = await page.goto(`${URL}/iframe.html?id=${id}&viewMode=story`, {
      waitUntil: 'networkidle',
      timeout: 20_000,
    })
    if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`)

    // Storybook renders an error page rather than failing the navigation, so
    // a missing id would otherwise be screenshotted as a green tick.
    const missing = await page.locator('text=/Couldn.t find story/i').count()
    if (missing) throw new Error('no such story')

    // Long enough for fonts, images and any entry transition to settle.
    await page.waitForTimeout(700)
    await page.screenshot({ path: file })
    console.log(`  ${file}`)
  } catch (error) {
    failed++
    console.error(`  ${id} — ${error.message}`)
  }
}

await browser.close()

if (failed) {
  console.error(`\n${failed} of ${stories.length} failed. Is Storybook running at ${URL}?`)
  process.exit(1)
}
console.log(`\n${stories.length} written to ${OUT}/`)
